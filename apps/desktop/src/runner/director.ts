import type { SupabaseClient } from "@supabase/supabase-js";
import { carriedLines, AGENT, type Task } from "@roslop/core";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

// Visual work gets a second pair of eyes. When Scenic, the Librarian or Splash finish with
// pictures, the Art Director compares them to the references and either passes the work or
// sends it back with notes, up to three rounds.

const VISUAL = new Set(["scenic", "librarian", "splash"]);
const ROUNDS = 3;

const round = (brief: string) => Number(brief.match(/^Art round: (\d+)/m)?.[1] ?? 1);

export async function afterJob(db: SupabaseClient, userId: string, taskId: string, cwd: string) {
  const { data } = await db.from("tasks").select("*").eq("id", taskId).maybeSingle();
  const task = data as Task | null;
  if (!task || task.status !== "done") return;
  if (VISUAL.has(task.agent)) await askDirector(db, userId, task, cwd);
  else if (task.agent === "director") await sendBack(db, userId, task, cwd);
}

async function askDirector(db: SupabaseClient, userId: string, task: Task, cwd: string) {
  const { data } = await db.from("proofs").select("url, title, note, kind").eq("task_id", task.id);
  const proofs = ((data ?? []) as { url: string; title: string; note: string; kind: string }[]).filter(p => p.kind === "image");
  if (!proofs.length) return;
  const dir = join(cwd, ".roslop", "review", task.id);
  mkdirSync(dir, { recursive: true });
  const local: string[] = [];
  for (const [i, p] of proofs.entries()) {
    const { data: file } = await db.storage.from("files").download(p.url);
    if (!file) continue;
    const name = `${i + 1}.${p.url.split(".").pop() ?? "png"}`;
    writeFileSync(join(dir, name), Buffer.from(await file.arrayBuffer()));
    local.push(`- .roslop/review/${task.id}/${name}: ${p.title}${p.note ? `, ${p.note}` : ""}`);
  }
  if (!local.length) return;
  const n = round(task.brief);
  const original = task.brief.replace(/^Art round: .*$\n?/gm, "").replace(/^Art notes from the last round:[\s\S]*$/m, "").trim();
  const id = randomUUID();
  const brief = `Art round: ${n}
Original agent: ${task.agent}
Original task: ${task.id}

Check ${AGENT[task.agent as keyof typeof AGENT].name}'s work on "${task.title}" against the bar and the owner's references.

Their pictures:
${local.join("\n")}

What they said when they finished: ${task.result ?? "nothing"}

Write your notes to .roslop/review/${id}.md.

Their brief was:
${original}

${carriedLines(original)}`.trim();
  await db.from("tasks").insert({
    id, user_id: userId, game_id: task.game_id, agent: "director", title: `Art check: ${task.title.replace(/ \(round \d+\)$/, "")}${n > 1 ? ` (round ${n})` : ""}`,
    brief, priority: task.priority, status: "queued", requested_by: "lead", parent_id: null, needs_studio: false, estimate: 0.02,
  });
}

async function sendBack(db: SupabaseClient, userId: string, review: Task, cwd: string) {
  if (!/^\s*REDO\b/i.test(review.result ?? "")) return;
  const agent = review.brief.match(/^Original agent: (\w+)/m)?.[1];
  const id = review.brief.match(/^Original task: ([\w-]+)/m)?.[1];
  const n = round(review.brief);
  if (!agent || !id || n >= ROUNDS) return;
  const { data } = await db.from("tasks").select("*").eq("id", id).maybeSingle();
  const first = data as Task | null;
  if (!first) return;
  const file = join(cwd, ".roslop", "review", `${review.id}.md`);
  const notes = existsSync(file) ? readFileSync(file, "utf8").trim() : (review.result ?? "").replace(/^\s*REDO\W*/i, "");
  const brief = first.brief.replace(/^Art round: .*$\n?/gm, "").replace(/^Art notes from the last round:[\s\S]*$/m, "").trim();
  await db.from("tasks").insert({
    user_id: userId, game_id: first.game_id, agent, title: `${first.title.replace(/ \(round \d+\)$/, "")} (round ${n + 1})`,
    brief: `Art round: ${n + 1}\n${brief}\n\nArt notes from the last round:\nThe Art Director sent your last pass back. Keep what works, fix every point below, and take new pictures from the same angles.\n${notes}`,
    priority: first.priority, status: "queued", requested_by: "lead", parent_id: null, needs_studio: first.needs_studio, estimate: first.estimate,
  });
}
