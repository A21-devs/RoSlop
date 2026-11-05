import type { SupabaseClient } from "@supabase/supabase-js";
import { AGENT, type AgentId, type Task } from "@roslop/core";
import { app } from "electron";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// What each agent has learned working for this owner. Nobody can retrain the model itself, so the
// crew learns the way a new hire does: every call the owner makes in Review, every note from the
// Art Director, and every lesson an agent writes down comes back with its next task, along with
// pictures of work the owner approved.

const VISUAL = new Set<AgentId>(["scenic", "librarian", "splash", "frame", "builder", "director"]);
const file = (agent: AgentId) => join(app.getPath("userData"), "memory", `${agent}.md`);

// An agent wrote "LESSON: ...". Kept on this computer, and in the vault's Lessons folder when
// there is one so the owner can read and edit it.
export function remember(agent: AgentId, text: string, task: Task, vault: string | null) {
  const line = `- ${text.replace(/\s+/g, " ").trim()} (${task.title}, ${new Date().toISOString().slice(0, 10)})\n`;
  const own = file(agent);
  mkdirSync(join(own, ".."), { recursive: true });
  appendFileSync(own, line);
  if (vault) {
    const note = join(vault, "Lessons", `${AGENT[agent].name}.md`);
    mkdirSync(join(vault, "Lessons"), { recursive: true });
    if (!existsSync(note)) writeFileSync(note, `---\nfor: [${agent}]\ntags: [lessons]\n---\n\n# What ${AGENT[agent].name} has learned\n\nWritten by the agent as it works. Edit or delete anything that's wrong; it reads this before every task.\n\n`);
    appendFileSync(note, line);
  }
}

function ownLessons(agent: AgentId, vault: string | null): string[] {
  // The vault copy wins, since the owner may have edited it.
  const note = vault ? join(vault, "Lessons", `${AGENT[agent].name}.md`) : null;
  const path = note && existsSync(note) ? note : file(agent);
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8").split("\n").filter(l => l.startsWith("- ")).slice(-25);
}

export async function memoryFor(db: SupabaseClient, task: Task, cwd: string, vault: string | null): Promise<string | null> {
  const agent = task.agent;
  const out: string[] = [];

  const { data: calls } = await db.from("proofs").select("title, verdict, feedback, url, kind, game_id, decided_at").eq("agent", agent).neq("verdict", "waiting").order("decided_at", { ascending: false }).limit(40);
  const decided = (calls ?? []) as { title: string; verdict: string; feedback: string | null; url: string; kind: string; game_id: string | null; decided_at: string }[];
  const said = decided.filter(c => c.feedback?.trim()).slice(0, 14).map(c => `- ${c.verdict === "approved" ? "Approved" : c.verdict === "changes" ? "Sent back" : "Rejected"} "${c.title}": ${c.feedback!.trim()}`);
  const tally = { approved: decided.filter(c => c.verdict === "approved").length, back: decided.filter(c => c.verdict !== "approved").length };
  if (decided.length) out.push(`The owner has approved ${tally.approved} and sent back or rejected ${tally.back} of your last ${decided.length} pieces of work.`);
  if (said.length) out.push("What they said, newest first. Treat these as rules:", ...said);
  const silent = decided.filter(c => c.verdict !== "approved" && !c.feedback?.trim()).slice(0, 6).map(c => `- ${c.verdict === "changes" ? "Sent back" : "Rejected"} with no note: "${c.title}"`);
  if (silent.length) out.push("Turned down without a note (work out why from the titles):", ...silent);

  // What the Art Director sent back, so the same mistakes don't come round again.
  const { data: reviews } = await db.from("tasks").select("result, brief, finished_at").eq("agent", "director").eq("status", "done").ilike("brief", `%Original agent: ${agent}%`).order("finished_at", { ascending: false }).limit(8);
  const notes = ((reviews ?? []) as { result: string | null }[]).filter(r => /^\s*REDO/i.test(r.result ?? "")).map(r => `- ${(r.result ?? "").replace(/^\s*REDO\W*/i, "").trim()}`).filter(l => l.length > 3);
  if (notes.length) out.push("", "The Art Director sent your work back for:", ...notes);

  const lessons = ownLessons(agent, vault);
  if (lessons.length) out.push("", "Lessons you wrote down before:", ...lessons);

  // The bar is what this owner actually approved: pictures of it, from this game first.
  if (VISUAL.has(agent)) {
    const approved = decided.filter(c => c.verdict === "approved" && c.kind === "image").sort((a, b) => Number(b.game_id === task.game_id) - Number(a.game_id === task.game_id)).slice(0, 4);
    const got: string[] = [];
    const dir = join(cwd, ".roslop", "refs", "approved");
    for (const [i, c] of approved.entries()) {
      const { data } = await db.storage.from("files").download(c.url).catch(() => ({ data: null }));
      if (!data) continue;
      mkdirSync(dir, { recursive: true });
      const name = `approved_${i + 1}${c.url.slice(c.url.lastIndexOf("."))}`;
      writeFileSync(join(dir, name), Buffer.from(await data.arrayBuffer()));
      got.push(`- .roslop/refs/approved/${name}: "${c.title}"`);
    }
    if (got.length) out.push("", "Work of yours the owner approved. This is the level they expect, at least:", ...got);
  }

  if (!out.length) return null;
  return ["## What you've learned working for this owner", ...out, "", "When you learn something worth keeping (a preference, a fix that worked, a Studio gotcha), write it on its own line as LESSON: one sentence. Three at most per task, and only things that will still be true next time."].join("\n");
}
