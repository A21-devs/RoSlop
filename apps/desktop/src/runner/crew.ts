import type { SupabaseClient } from "@supabase/supabase-js";
import { AGENT, type Message, type Task, type TaskEvent } from "@roslop/core";

export interface Live {
  task: Task;
  said: string;
  tools: string[];
  since: number;
}

const name = (t: Pick<Task, "agent">) => AGENT[t.agent]?.name ?? t.agent;
const mins = (iso: string | number | null) => (iso ? Math.max(1, Math.round((Date.now() - (typeof iso === "number" ? iso : Date.parse(iso))) / 60000)) : 0);
const clip = (s: string | null | undefined, n: number) => (s ?? "").replace(/\s+/g, " ").trim().slice(0, n);

// Everything the Lead needs to answer "what are you doing" or "what's been done": each running
// agent's latest words and steps, straight from the jobs on this computer, plus what finished,
// what's stuck on the owner, what's next, and the recent chat so it can hold a conversation.
export async function crewReport(db: SupabaseClient, lead: Task, live: Live[]): Promise<string> {
  const since = new Date(Date.now() - 48 * 3600_000).toISOString();
  const [{ data: open }, { data: done }, { data: chat }] = await Promise.all([
    db.from("tasks").select("*").in("status", ["working", "needs_you", "queued", "held", "paused"]).order("created_at"),
    db.from("tasks").select("*").in("status", ["done", "failed"]).gte("finished_at", since).order("finished_at", { ascending: false }).limit(25),
    db.from("messages").select("*").order("created_at", { ascending: false }).limit(14),
  ]);
  const tasks = ((open ?? []) as Task[]).filter(t => t.id !== lead.id);
  const working = tasks.filter(t => t.status === "working");
  const { data: evs } = working.length
    ? await db.from("task_events").select("*").in("task_id", working.map(t => t.id)).order("created_at", { ascending: false }).limit(working.length * 8)
    : { data: [] };
  const events = (evs ?? []) as TaskEvent[];

  const out: string[] = [];
  out.push(`Working now (${working.length}):`);
  for (const t of working) {
    const here = live.find(l => l.task.id === t.id);
    const recent = events.filter(e => e.task_id === t.id).slice(0, 5).reverse().map(e => `${e.kind}: ${clip(e.text, 120)}`);
    out.push(`- ${name(t)}: "${t.title}", ${mins(t.started_at)} min in.${here?.said ? ` Latest: "${clip(here.said, 300)}"` : ""}${here?.tools.length ? ` Last steps: ${here.tools.join(", ")}.` : ""}`);
    if (!here && recent.length) out.push(`  Recent: ${recent.join(" / ")}`);
  }
  if (!working.length) out.push("- nobody");

  const asks = tasks.filter(t => t.status === "needs_you");
  if (asks.length) out.push("", "Waiting on the owner:", ...asks.map(t => `- ${name(t)}: "${t.title}" asks: ${clip(t.ask?.question, 200)}`));

  const next = tasks.filter(t => ["queued", "held", "paused"].includes(t.status));
  if (next.length) out.push("", `Queued (${next.length}):`, ...next.slice(0, 12).map(t => `- ${name(t)}: "${t.title}"${t.status === "paused" ? " (paused)" : t.status === "held" ? " (held for usage)" : ""}`));

  const finished = (done ?? []) as Task[];
  if (finished.length) {
    out.push("", "Finished in the last 2 days, newest first:");
    for (const t of finished) out.push(`- ${name(t)}: "${t.title}" ${t.status === "failed" ? "FAILED" : "done"} ${mins(t.finished_at)} min ago. ${clip(t.result, 280)}`);
  }

  const talk = ((chat ?? []) as Message[]).reverse();
  if (talk.length) out.push("", "Recent chat with the owner:", ...talk.map(m => `${m.author === "you" ? "Owner" : AGENT[m.author as Task["agent"]]?.name ?? m.author}: ${clip(m.text, 400)}`));

  return out.join("\n");
}
