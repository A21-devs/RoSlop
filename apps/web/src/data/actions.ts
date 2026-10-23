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

// Agents can't see the database, so the brief carries what the studio has done so far.
function studioFacts(s: Snapshot): string {
  const out: string[] = [];
  const games = s.games.map(g => `- ${g.name} (${g.stage}, v${g.version})${g.project_path ? `, project at ${g.project_path}` : ""}`);
  out.push("Games:", ...(games.length ? games : ["- none yet"]));
  const reviewed = s.proofs.filter(p => p.verdict !== "waiting").slice(-15)
    .map(p => `- ${p.verdict === "approved" ? "Approved" : "Sent back"}: ${p.title}${p.feedback ? ` ("${p.feedback}")` : ""}`);
  if (reviewed.length) out.push("", "Review calls:", ...reviewed);
  const done = s.tasks.filter(t => t.status === "done" && t.agent !== "lead").slice(-15).map(t => `- ${t.agent}: ${t.title}`);
  if (done.length) out.push("", "Finished work:", ...done);
  const pitches = s.pitches.slice(-6).map(p => `- ${p.title} (${p.status}): ${p.summary}`);
  if (pitches.length) out.push("", "Pitches:", ...pitches);
  const market = [...s.market_snapshots].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  if (market?.items.length) out.push("", "Top of the charts right now:", ...market.items.slice(0, 12).map(i => `- ${i.name} (${i.genre}, ${i.playing.toLocaleString()} playing)`));
  return out.join("\n");
}

// Work on one vault: add a kind of note, study some games, update or tidy what's there.
export function vaultRequest(s: Snapshot, o: { vault: string | null; ask: string; games: string; game_id: string | null }) {
  const ask = o.ask.trim();
  const brief = `${ask}${o.games.trim() ? `\n\nGames to look at: ${o.games.trim()}` : ""}

This is vault work: the crew writes or updates .md notes in the vault, it's not a chat answer.
Plan 2 to 6 tasks, each naming the exact notes to write or update. Read Home.md and what's already in the vault first, and update notes instead of making near copies.
For studying games, get real material: find them on Roblox and the web, save screenshots into References/img, and note the numbers (players, likes, visits) with where they came from.
${o.vault ? `\nVault folder: ${o.vault}` : ""}
What we have so far:
${studioFacts(s)}`;
  return newTask(s, "lead", `Vault: ${ask.split("\n")[0]}`, brief, o.game_id);
}

export function buildVault(s: Snapshot, game_id: string | null = null) {
  const brief = `Build our Obsidian vault for real: the crew writes the notes as files, this isn't a summary.

Plan 5 to 8 tasks, each one writing specific notes. Name the exact note files in every brief. Cover:
- Games: one note per game with what it is, the core loop, where it's at and what's next.
- Design: what we've learned works, from the Review calls below. Approved things become rules, sent back things become don'ts.
- References: Pulse and Scenic search the web for reference games, UI, art style and systems that fit our games. One note each with the link, screenshots saved into References/img, and what we take from it.
- Market: Pulse writes what's on the charts and why, with the numbers.
- Agent notes: short how-we-do-it notes tagged for the agents that need them (balance, builder, frame, merchant...).
Every note needs \`for:\` frontmatter naming the agents that should read it, [[links]] to related notes, and a line in Home.md.
Give the Librarian the last task, after the others: tidy names, fix broken links and fill in Home.md.

What we have so far:
${studioFacts(s)}

Keep the whole thing to about 15% of a usage window.`;
  return newTask(s, "lead", "Start the vault", brief, game_id, { priority: "normal" });
}
