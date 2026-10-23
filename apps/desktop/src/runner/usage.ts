import type { SupabaseClient } from "@supabase/supabase-js";
import { WINDOW_MIN, windowExpired, type UsageWindow } from "@roslop/core";
import { fail } from "./db";

const RECENT_MIN = 15;

// Updates go through one queue so two jobs finishing together don't overwrite each other.
export class Usage {
  private queue: Promise<unknown> = Promise.resolve();

  constructor(private db: SupabaseClient, private userId: string) {}

  private serial<T>(fn: () => Promise<T>): Promise<T> {
    const next = this.queue.then(fn, fn);
    this.queue = next.catch(() => {});
    return next;
  }

  private async latest(): Promise<UsageWindow | null> {
    const { data, error } = await this.db.from("usage_windows").select("*").order("started_at", { ascending: false }).limit(1).maybeSingle();
    fail("Couldn't read usage", error);
    return data as UsageWindow | null;
  }

  // The current window, starting a fresh one if the last ran out.
  current(): Promise<UsageWindow> {
    return this.serial(async () => {
      const w = await this.latest();
      if (w && !windowExpired(w.started_at)) return w;
      const { data, error } = await this.db
        .from("usage_windows")
        .insert({ user_id: this.userId, started_at: new Date().toISOString(), used: 0, tokens: 0 })
        .select()
        .single();
      fail("Couldn't start a usage window", error);
      return data as UsageWindow;
    });
  }

  add(tokens: number, fraction: number) {
    if (tokens <= 0 && fraction <= 0) return Promise.resolve();
    return this.current().then(w =>
      this.serial(async () => {
        const fresh = (await this.latest()) ?? w;
        await this.db
          .from("usage_windows")
          .update({ used: fresh.used + fraction, tokens: Math.round(fresh.tokens + tokens) })
          .eq("id", fresh.id);
      }),
    );
  }

  // The CLI told us how much of the window is gone and when it resets. Its numbers win over
  // ours, so time you spent in Claude elsewhere counts and pacing follows the real window.
  raise(used: number | null, resets: number | null) {
    return this.serial(async () => {
      const w = await this.latest();
      if (!w || windowExpired(w.started_at)) return;
      const patch: Partial<UsageWindow> = {};
      if (used !== null && used > w.used) patch.used = used;
      const now = Date.now();
      if (resets && resets > now && resets <= now + WINDOW_MIN * 60_000) {
        const start = resets - WINDOW_MIN * 60_000;
        if (Math.abs(start - Date.parse(w.started_at)) > 2 * 60_000) patch.started_at = new Date(start).toISOString();
      }
      if (Object.keys(patch).length) await this.db.from("usage_windows").update(patch).eq("id", w.id);
    });
  }

  // Fraction of a window per minute over the last stretch.
  async recentRate(): Promise<number> {
    const since = new Date(Date.now() - RECENT_MIN * 60_000).toISOString();
    const { data } = await this.db.from("tasks").select("used").gte("finished_at", since);
    const used = ((data ?? []) as { used: number }[]).reduce((sum, t) => sum + (t.used ?? 0), 0);
    return used / RECENT_MIN;
  }
}
