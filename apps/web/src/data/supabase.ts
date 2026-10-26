import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { defaultSettings, withDefaults, type GameStat, type Settings, type TableName } from "@roslop/core";
import { emptySnapshot, TABLES, type Change, type Db, type User } from "./db";

const PAGE = 1000;
// Every card used to ask for its own signed link, again each time it scrolled back into view.
// Links are now asked for in one batch per frame and reused until shortly before they expire.
const LINK_LIFE = 3600;
const links = new Map<string, { url: Promise<string>; until: number }>();
const asked = new Map<string, (url: string) => void>();
let flush: ReturnType<typeof setTimeout> | null = null;

function localExtras(): Partial<Settings> {
  try {
    return JSON.parse(localStorage.getItem("roslop-settings-extra") ?? "{}");
  } catch {
    return {};
  }
}

function saveExtras(patch: Record<string, unknown>) {
  localStorage.setItem("roslop-settings-extra", JSON.stringify({ ...localExtras(), ...patch }));
}

// Settings saved only here because the database needs the setup run again.
export const settingsOnlyHere = () => Object.keys(localExtras());

// Turns Supabase's errors into something a person can act on.
export function explain(e: { message?: string; code?: string } | null | undefined): string {
  const msg = e?.message ?? String(e);
  if (e?.code === "42P01" || e?.code === "PGRST205" || /does not exist|Could not find the table/i.test(msg)) {
    return "Your Supabase project is missing some tables. Run every file in supabase/migrations in the SQL editor, in order.";
  }
  if (e?.code === "PGRST204" || /Could not find the '.+' column/i.test(msg)) {
    return "Your database is a version behind. Run the newest file in supabase/migrations in the SQL editor.";
  }
  if (/JWT|token/i.test(msg)) return "You got signed out. Sign in again.";
  if (/Failed to fetch|NetworkError/i.test(msg)) return "Can't reach Supabase. Check your internet connection.";
  return msg;
}

export function cloudDb(url: string, anonKey: string): Db {
  const sb: SupabaseClient = createClient(url, anonKey, { auth: { persistSession: true, detectSessionInUrl: true } });
  let current: User | null = null;
  const listeners = new Set<(c: Change) => void>();

  const toUser = (u: { id: string; email?: string } | null | undefined): User | null => (u ? { id: u.id, email: u.email ?? "" } : null);
  const fail = (e: { message: string } | null) => (e ? e.message : null);
  const emit = (c: Change) => listeners.forEach(l => l(c));
  const check = (error: { message: string; code?: string } | null) => {
    if (error) throw new Error(explain(error));
  };

  return {
    mode: "cloud",
    user: () => current,

    onAuth(cb) {
      sb.auth.getSession().then(({ data }) => {
        current = toUser(data.session?.user);
        cb(current);
      });
      const { data } = sb.auth.onAuthStateChange((e, s) => {
        current = toUser(s?.user);
        cb(current);
        // The desktop runner can't refresh its own copy safely, so hand it each new token.
        if (e === "TOKEN_REFRESHED" && s && window.roslop) {
          window.roslop.startRunner({ url, anonKey, accessToken: s.access_token, refreshToken: s.refresh_token });
        }
      });
      return () => data.subscription.unsubscribe();
    },

    async signIn(email, password) {
      return fail((await sb.auth.signInWithPassword({ email, password })).error);
    },
    async signUp(email, password) {
      return fail((await sb.auth.signUp({ email, password })).error);
    },
    // Only offer the buttons the project has actually switched on.
    async providers() {
      try {
        const r = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: anonKey } });
        const ext = (await r.json()).external ?? {};
        return (["github", "google"] as const).filter(p => ext[p]);
      } catch {
        return [];
      }
    },
    async signInWith(provider) {
      return fail((await sb.auth.signInWithOAuth({ provider, options: { redirectTo: location.href.split("#")[0] } })).error);
    },
    async signOut() {
      await sb.auth.signOut();
    },

    async load() {
      const uid = current!.id;
      const { data: s, error } = await sb.from("settings").select("*").maybeSingle();
      check(error);
      let settings = s as Settings | null;
      if (!settings) {
        settings = defaultSettings(uid);
        const { error: e2 } = await sb.from("settings").insert(settings);
        check(e2);
      }
      const base = defaultSettings(uid);
      const extra = localExtras();
      const snap = emptySnapshot(withDefaults(base, { ...settings, ...extra }));
      // Events and stats grow forever, so only pull recent ones up front.
      // Supabase hands back at most 1,000 rows a request, so page through until there's no more.
      const since = new Date(Date.now() - 14 * 864e5).toISOString();
      await Promise.all(TABLES.map(async t => {
        // Each Roblox pull holds every game, so only the latest few are needed.
        if (t === "market_snapshots") {
          const { data, error: e3 } = await sb.from(t).select("*").order("created_at", { ascending: false }).limit(4);
          check(e3);
          (snap as Record<string, unknown>)[t] = (data ?? []).reverse();
          return;
        }
        const rows: unknown[] = [];
        for (let from = 0; ; from += PAGE) {
          let q = sb.from(t).select("*").order("created_at", { ascending: true }).order("id");
          if (t === "task_events" || t === "game_stats") q = q.gte("created_at", since);
          const { data, error: e3 } = await q.range(from, from + PAGE - 1);
          check(e3);
          rows.push(...(data ?? []));
          if (!data || data.length < PAGE) break;
        }
        (snap as Record<string, unknown>)[t] = rows;
      }));
      return snap;
    },

    subscribe(cb) {
      listeners.add(cb);
      let ch = sb.channel(`everything-${Date.now()}`);
      const join = () => {
        for (const t of [...TABLES, "settings"]) {
          ch.on("postgres_changes", { event: "*", schema: "public", table: t }, p => {
            if (p.eventType === "DELETE") cb({ table: t as TableName, row: { id: (p.old as { id: string }).id }, gone: true });
            else cb({ table: t, row: p.new } as Change);
          });
        }
        // Realtime drops now and then (sleep, flaky wifi). Rejoin instead of going quiet.
        ch.subscribe(status => {
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
            setTimeout(() => {
              if (!listeners.has(cb)) return;
              sb.removeChannel(ch);
              ch = sb.channel(`everything-${Date.now()}`);
              join();
            }, 3000);
          }
        });
      };
      join();
      return () => {
        listeners.delete(cb);
        sb.removeChannel(ch);
      };
    },

    // Every write shows up straight away. Realtime echoes it back later, which is harmless.
    async insert(table, row) {
      const { data, error } = await sb.from(table).insert(row as never).select().single();
      check(error);
      emit({ table, row: data } as Change);
      return data as never;
    },
    async update(table, id, patch) {
      const { data, error } = await sb.from(table).update(patch as never).eq("id", id).select().single();
      check(error);
      emit({ table, row: data } as Change);
    },
    async remove(table, id) {
      const { error } = await sb.from(table).delete().eq("id", id);
      check(error);
      emit({ table, row: { id }, gone: true });
    },
    async updateMany(table, ids, patch) {
      for (let i = 0; i < ids.length; i += 200) {
        const chunk = ids.slice(i, i + 200);
        const { data, error } = await sb.from(table).update(patch as never).in("id", chunk).select();
        check(error);
        for (const row of data ?? []) emit({ table, row } as Change);
      }
    },
    async removeMany(table, ids) {
      for (let i = 0; i < ids.length; i += 200) {
        const chunk = ids.slice(i, i + 200);
        check((await sb.from(table).delete().in("id", chunk)).error);
        for (const id of chunk) emit({ table, row: { id }, gone: true });
      }
    },
    async statsFor(gameId, from, to) {
      const rows: GameStat[] = [];
      for (let start = 0; ; start += PAGE) {
        const { data, error } = await sb.from("game_stats").select("*").eq("game_id", gameId).gte("created_at", from).lte("created_at", to).order("created_at").range(start, start + PAGE - 1);
        check(error);
        rows.push(...((data ?? []) as GameStat[]));
        if (!data || data.length < PAGE) break;
      }
      return rows;
    },
    async clearAssets(which) {
      const rows: { id: string; file_url: string | null }[] = [];
      for (let from = 0; ; from += PAGE) {
        const base = sb.from("assets").select("id, file_url").order("id");
        const { data, error } = await (which === "references" ? base.eq("kind", "reference") : base.neq("kind", "reference")).range(from, from + PAGE - 1);
        check(error);
        rows.push(...(data ?? []));
        if (!data || data.length < PAGE) break;
      }
      const del = sb.from("assets").delete();
      check((await (which === "references" ? del.eq("kind", "reference") : del.neq("kind", "reference"))).error);
      // Stored files go too, so they stop taking up space. Roblox copies stay on Roblox.
      const files = rows.map(r => r.file_url).filter((p): p is string => !!p && !/^(https?|data|blob):/.test(p));
      for (let i = 0; i < files.length; i += PAGE) await sb.storage.from("files").remove(files.slice(i, i + PAGE));
      for (const r of rows) emit({ table: "assets", row: { id: r.id }, gone: true });
      return rows.length;
    },
    async saveSettings(patch) {
      emit({ table: "settings", row: patch as Settings });
      const { error } = await sb.from("settings").update(patch).eq("user_id", current!.id);
      // A column from a newer version that this project hasn't got yet: keep it on this device
      // until the setup is run again, instead of losing the change.
      const missing = error?.message.match(/'(\w+)' column/)?.[1];
      if (missing && missing in patch) {
        saveExtras({ [missing]: (patch as Record<string, unknown>)[missing] });
        const rest = { ...patch } as Record<string, unknown>;
        delete rest[missing];
        if (Object.keys(rest).length) check((await sb.from("settings").update(rest).eq("user_id", current!.id)).error);
        return;
      }
      check(error);
    },

    async upload(file, folder) {
      const path = `${current!.id}/${folder}/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
      const { error } = await sb.storage.from("files").upload(path, file);
      check(error);
      return path;
    },
    fileUrl(path) {
      if (/^(https?|data|blob):/.test(path)) return Promise.resolve(path);
      const hit = links.get(path);
      if (hit && hit.until > Date.now()) return hit.url;
      const url = new Promise<string>(done => {
        asked.set(path, done);
        flush ??= setTimeout(async () => {
          const batch = [...asked];
          asked.clear();
          flush = null;
          for (let i = 0; i < batch.length; i += 100) {
            const part = batch.slice(i, i + 100);
            const { data } = await sb.storage.from("files").createSignedUrls(part.map(([p]) => p), LINK_LIFE);
            const got = new Map((data ?? []).map(d => [d.path, d.signedUrl]));
            for (const [p, res] of part) {
              if (!got.get(p)) links.delete(p);
              res(got.get(p) ?? "");
            }
          }
        }, 0);
      });
      links.set(path, { url, until: Date.now() + (LINK_LIFE - 300) * 1000 });
      return url;
    },

    async session() {
      const { data } = await sb.auth.getSession();
      const s = data.session;
      return s ? { url, anonKey, accessToken: s.access_token, refreshToken: s.refresh_token } : null;
    },
  };
}
