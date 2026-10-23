import type { SupabaseClient } from "@supabase/supabase-js";
import { WINDOW_MIN, windowExpired, type UsageWindow } from "@roslop/core";
import { homedir } from "node:os";
import { killTree, run } from "./cli";
import { fail } from "./db";
import { claudeParser } from "./stream";

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
    // With a real reading in the last half hour, our token guess would only skew it.
    if (Date.now() - this.measuredAt < 30 * 60_000) fraction = 0;
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

  get stale() {
    return Date.now() - this.measuredAt > 15 * 60_000;
  }

  // A one line Haiku reply, only to read the real numbers when pacing is holding work back
  // on an old reading. At most every 15 minutes.
  private probedAt = 0;
  probe(): Promise<void> {
    if (Date.now() - this.probedAt < 15 * 60_000) return Promise.resolve();
    this.probedAt = Date.now();
    return new Promise(done => {
      let child: ReturnType<typeof run>;
      try {
        child = run("claude", ["-p", "Reply with just: ok", "--output-format", "stream-json", "--verbose", "--model", "haiku", "--max-turns", "1"], { cwd: homedir() });
      } catch {
        return done();
      }
      const parser = claudeParser();
      let buf = "";
      child.stdout?.on("data", d => {
        buf += d;
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) for (const ev of parser.read(line)) if (ev.kind === "limit") void this.raise(ev.used, ev.resets).catch(() => {});
      });
      const timer = setTimeout(() => killTree(child), 60_000);
      child.on("error", () => done());
      child.on("exit", () => {
        clearTimeout(timer);
        done();
      });
    });
  }

  // The CLI told us how much of the account's window is really gone and when it resets.
  // That replaces our own estimate, up or down, and counts use outside RoSlop too.
  private measuredAt = 0;
  raise(used: number | null, resets: number | null) {
    return this.serial(async () => {
      const w = await this.latest();
      if (!w || windowExpired(w.started_at)) return;
      const patch: Partial<UsageWindow> = {};
      if (used !== null) {
        this.measuredAt = Date.now();
        if (Math.abs(used - w.used) > 0.001) patch.used = used;
      }
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
