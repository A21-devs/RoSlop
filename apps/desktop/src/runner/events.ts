import type { SupabaseClient } from "@supabase/supabase-js";
import type { TaskEvent } from "@roslop/core";

const FLUSH_MS = 2000;
const NOTE_GAP_MS = 4000;
const MAX_NOTE = 600;

type Row = Pick<TaskEvent, "task_id" | "kind" | "text">;

function trim(text: string, max = MAX_NOTE): string {
  const t = text.trim();
  return t.length > max ? t.slice(0, max - 1).trimEnd() + "…" : t;
}

// Batches task_events so a chatty agent doesn't turn into hundreds of requests.
// Notes are throttled per task: if several come in quickly, only the newest is kept.
export class Events {
  private rows: Row[] = [];
  private pending = new Map<string, string>();
  private lastNote = new Map<string, number>();
  private timer: NodeJS.Timeout;

  constructor(private db: SupabaseClient, private userId: string) {
    this.timer = setInterval(() => void this.flush(), FLUSH_MS);
  }

  note(taskId: string, text: string) {
    if (text.trim()) this.pending.set(taskId, trim(text));
  }

  add(taskId: string, kind: TaskEvent["kind"], text: string) {
    this.rows.push({ task_id: taskId, kind, text: trim(text, 2000) });
  }

  async flush(force = false) {
    const now = Date.now();
    for (const [taskId, text] of this.pending) {
      if (!force && now - (this.lastNote.get(taskId) ?? 0) < NOTE_GAP_MS) continue;
      this.rows.push({ task_id: taskId, kind: "note", text });
      this.pending.delete(taskId);
      this.lastNote.set(taskId, now);
    }
    if (!this.rows.length) return;
    const batch = this.rows.map(r => ({ ...r, user_id: this.userId }));
    this.rows = [];
    await this.db.from("task_events").insert(batch);
  }

  async close() {
    clearInterval(this.timer);
    await this.flush(true);
  }
}
