import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { defaultSettings, type Settings } from "@roslop/core";

export interface Auth {
  url: string;
  anonKey: string;
  accessToken: string;
  refreshToken: string;
}

function claims(jwt: string): { sub?: string; exp?: number } {
  try {
    return JSON.parse(Buffer.from(jwt.split(".")[1], "base64url").toString("utf8"));
  } catch {
    return {};
  }
}

// The window's web app owns the session and hands us fresh tokens through startRunner.
// We only refresh on our own if the token runs out and nobody gave us a new one, because
// refreshing the same token from two places gets the session revoked.
export class Tokens {
  private refreshing: Promise<void> | null = null;

  constructor(public auth: Auth) {}

  get userId(): string {
    const sub = claims(this.auth.accessToken).sub;
    if (!sub) throw new Error("That sign-in token doesn't look right.");
    return sub;
  }

  async get(): Promise<string> {
    const exp = claims(this.auth.accessToken).exp ?? 0;
    if (exp * 1000 > Date.now() + 30_000) return this.auth.accessToken;
    this.refreshing ??= this.refresh().finally(() => (this.refreshing = null));
    await this.refreshing;
    return this.auth.accessToken;
  }

  private async refresh() {
    const res = await fetch(`${this.auth.url}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { apikey: this.auth.anonKey, "content-type": "application/json" },
      body: JSON.stringify({ refresh_token: this.auth.refreshToken }),
    });
    if (!res.ok) throw new Error("Signed out. Sign in again to keep the crew running.");
    const body = (await res.json()) as { access_token: string; refresh_token: string };
    this.auth = { ...this.auth, accessToken: body.access_token, refreshToken: body.refresh_token };
  }
}

export function connect(tokens: Tokens): SupabaseClient {
  return createClient(tokens.auth.url, tokens.auth.anonKey, {
    accessToken: () => tokens.get(),
  });
}

export async function loadSettings(db: SupabaseClient, userId: string): Promise<Settings> {
  const { data } = await db.from("settings").select("*").eq("user_id", userId).maybeSingle();
  return withDefaults(userId, data);
}

export function withDefaults(userId: string, row: Partial<Settings> | null): Settings {
  const base = defaultSettings(userId);
  if (!row) return base;
  return {
    ...base,
    ...row,
    savings: { ...base.savings, ...row.savings },
    apps: row.apps ?? [],
    connectors: row.connectors ?? {},
    blender: { ...base.blender, ...row.blender },
  };
}

export function fail(what: string, error: { message: string } | null) {
  if (error) throw new Error(`${what}: ${error.message}`);
}

// Supabase caps a request at 1,000 rows. Pages through so a big queue isn't cut off.
export async function allRows<T>(q: { range(from: number, to: number): PromiseLike<{ data: T[] | null; error: { message: string } | null }> }) {
  const data: T[] = [];
  for (let from = 0; ; from += 1000) {
    const page = await q.range(from, from + 999);
    if (page.error) return { data: null, error: page.error };
    data.push(...(page.data ?? []));
    if (!page.data || page.data.length < 1000) return { data, error: null };
  }
}
