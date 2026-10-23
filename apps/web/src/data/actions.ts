import { AGENT, estimate, type AgentId, type Game, type Pitch, type Priority, type Proof, type Task, type Verdict } from "@roslop/core";
import { db } from "./store";
import type { Snapshot } from "./db";

function newTask(s: Snapshot, agent: AgentId, title: string, brief: string, game_id: string | null, extra: Partial<Task> = {}) {
  return db.insert("tasks", {
    agent, title: title.slice(0, 120), brief, game_id,
    status: "queued", priority: "normal", requested_by: "you",
    parent_id: null, needs_studio: AGENT[agent].studio,
    estimate: estimate(agent, s.tasks), used: 0,
    machine_id: null, started_at: null, finished_at: null, result: null, ask: null,
    ...extra,
  });
}

export async function askLead(s: Snapshot, text: string, game_id: string | null) {
  const t = text.trim();
  if (!t) return;
  const task = await newTask(s, "lead", t.split("\n")[0], t, game_id);
  await db.insert("messages", { author: "you", text: t, game_id, task_ids: [task.id] });
  if (db.mode === "demo") {
    setTimeout(() => {
      db.insert("messages", {
        author: "lead", game_id, task_ids: [],
        text: "Got it. This is the demo, so nobody's actually working. Install the desktop app and sign in, and I'll split this into tasks for the crew.",
      });
    }, 900);
  }
}

export function messageAgent(s: Snapshot, agent: AgentId, title: string, brief: string, game_id: string | null) {
  return newTask(s, agent, title, brief, game_id);
}

export async function answer(task: Task, choice: string) {
  await db.update("tasks", task.id, { ask: { ...task.ask!, answer: choice }, status: "queued" });
}

export async function decide(s: Snapshot, proof: Proof, verdict: Verdict, note: string) {
  await db.update("proofs", proof.id, { verdict, feedback: note || null, decided_at: new Date().toISOString() });
  if (verdict === "changes") {
    const brief = `The owner sent back "${proof.title}".\n\nTheir note:\n${note}\n\nFix it and send new proof.`;
    await newTask(s, proof.agent, `Changes: ${proof.title}`, brief, proof.game_id, { parent_id: null, priority: "high" });
  }
}

export const pause = (t: Task) => db.update("tasks", t.id, { status: "paused" });
export const resume = (t: Task) => db.update("tasks", t.id, { status: "queued" });
export const drop = (t: Task) => db.update("tasks", t.id, { status: "dropped", finished_at: new Date().toISOString() });
export const bump = (t: Task, priority: Priority) => db.update("tasks", t.id, { priority, status: "queued" });

export async function decidePitch(s: Snapshot, p: Pitch, status: Pitch["status"], note = "") {
  await db.update("pitches", p.id, { status });
  if (status === "approved") {
    const game = await db.insert("games", { name: p.title, stage: "designed", version: "v0.1", universe_id: null, place_id: null, project_path: null });
    await newTask(s, "architect", `Plan: ${p.title}`, `Write the game plan for this pitch.\n\n${p.summary}\n\nWhy: ${p.why}\n\nMoney: ${p.money}\nReuse: ${p.reuses.join(", ")}`, game.id, { priority: "high" });
  }
  if (status === "changes") await newTask(s, "pulse", `Rework pitch: ${p.title}`, `The owner wants changes to this pitch:\n${note}`, null);
}

export function pitchIdea(s: Snapshot, idea: string) {
  return newTask(s, "pulse", `Pitch my idea: ${idea.slice(0, 60)}`, `The owner has an idea. Check it against the charts and write it up as a pitch, honestly.\n\n${idea}`, null);
}

export function addGame(g: Partial<Game>) {
  return db.insert("games", { stage: "pitched", version: "v0.1", universe_id: null, place_id: null, project_path: null, ...g });
}

export async function publish(g: Game) {
  await db.update("games", g.id, { stage: "live" });
}

export async function uploadAsset(file: File, kind: "icon" | "model" | "sound" | "vfx" | "ui" | "reference", game_id: string | null) {
  const path = await db.upload(file, kind === "reference" ? "references" : "assets");
  await db.insert("assets", { name: file.name.replace(/\.[^.]+$/, ""), kind, file_url: path, roblox_id: null, tags: [], game_id });
}

export function buildVault(s: Snapshot) {
  return newTask(s, "lead", "Start the vault", "Plan a starter knowledge vault for this studio. Split it into notes, each tagged with `for:` agent ids in its frontmatter, and hand the writing to the right agents. Base it on our games, what got approved or sent back in Review, and what's working on the charts. Keep it to about 15% of a usage window.", null, { priority: "low" });
}
