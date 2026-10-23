import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { defaultSettings, type Settings, type TableName } from "@roslop/core";
import { emptySnapshot, TABLES, type Change, type Db, type User } from "./db";

export function cloudDb(url: string, anonKey: string): Db {
  const sb: SupabaseClient = createClient(url, anonKey, { auth: { persistSession: true, detectSessionInUrl: true } });
  let current: User | null = null;

  const toUser = (u: { id: string; email?: string } | null | undefined): User | null => (u ? { id: u.id, email: u.email ?? "" } : null);
  const fail = (e: { message: string } | null) => (e ? e.message : null);

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
    async signInWith(provider) {
      return fail((await sb.auth.signInWithOAuth({ provider, options: { redirectTo: location.href.split("#")[0] } })).error);
    },
    async signOut() {
      await sb.auth.signOut();
    },

    async load() {
      const uid = current!.id;
      const { data: s } = await sb.from("settings").select("*").maybeSingle();
      let settings = s as Settings | null;
      if (!settings) {
        settings = defaultSettings(uid);
        await sb.from("settings").insert(settings);
      }
      const snap = emptySnapshot({ ...defaultSettings(uid), ...settings });
      // Events and stats grow forever, so only pull recent ones up front.
      await Promise.all(TABLES.map(async t => {
        let q = sb.from(t).select("*").order("created_at", { ascending: true });
        if (t === "task_events" || t === "game_stats") q = q.gte("created_at", new Date(Date.now() - 14 * 864e5).toISOString());
        const { data } = await q.limit(5000);
        (snap as Record<string, unknown>)[t] = data ?? [];
      }));
      return snap;
    },

    subscribe(cb) {
      const ch = sb.channel("everything");
      for (const t of [...TABLES, "settings"]) {
        ch.on("postgres_changes", { event: "*", schema: "public", table: t }, p => {
          if (p.eventType === "DELETE") cb({ table: t as TableName, row: { id: (p.old as { id: string }).id }, gone: true });
          else cb({ table: t, row: p.new } as Change);
        });
      }
      ch.subscribe();
      return () => {
        sb.removeChannel(ch);
      };
    },

    async insert(table, row) {
      const { data, error } = await sb.from(table).insert(row as never).select().single();
      if (error) throw error;
      return data;
    },
    async update(table, id, patch) {
      const { error } = await sb.from(table).update(patch as never).eq("id", id);
      if (error) throw error;
    },
    async remove(table, id) {
      await sb.from(table).delete().eq("id", id);
    },
    async saveSettings(patch) {
      const { error } = await sb.from("settings").update(patch).eq("user_id", current!.id);
      if (error) throw error;
    },

    async upload(file, folder) {
      const path = `${current!.id}/${folder}/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
      const { error } = await sb.storage.from("files").upload(path, file);
      if (error) throw error;
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
