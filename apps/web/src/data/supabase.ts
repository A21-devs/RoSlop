import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { defaultSettings, type Settings, type TableName } from "@roslop/core";
import { emptySnapshot, TABLES, type Change, type Db, type User } from "./db";

const PAGE = 1000;

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
      const snap = emptySnapshot({ ...base, ...settings, savings: { ...base.savings, ...settings.savings }, blender: { ...base.blender, ...settings.blender } });
      // Events and stats grow forever, so only pull recent ones up front.
      // Supabase hands back at most 1,000 rows a request, so page through until there's no more.
      const since = new Date(Date.now() - 14 * 864e5).toISOString();
      await Promise.all(TABLES.map(async t => {
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
      check(error);
    },

    async upload(file, folder) {
      const path = `${current!.id}/${folder}/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
      const { error } = await sb.storage.from("files").upload(path, file);
      check(error);
      return path;
    },
    async fileUrl(path) {
      if (/^(https?|data|blob):/.test(path)) return path;
      const { data } = await sb.storage.from("files").createSignedUrl(path, 3600);
      return data?.signedUrl ?? "";
    },

    async session() {
      const { data } = await sb.auth.getSession();
      const s = data.session;
      return s ? { url, anonKey, accessToken: s.access_token, refreshToken: s.refresh_token } : null;
    },
  };
}
