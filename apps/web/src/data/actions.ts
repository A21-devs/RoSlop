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

// None of the options: the agent drops that part and carries on, or stops if it can't.
export const reject = (task: Task) =>
  answer(task, "Rejected, none of these. Don't do that part. Carry on with the rest of the task if it still makes sense, otherwise stop, and say what you skipped in your DONE line.");

export async function decide(s: Snapshot, proof: Proof, verdict: Verdict, note: string) {
  await db.update("proofs", proof.id, { verdict, feedback: note || null, decided_at: new Date().toISOString() });
  if (verdict === "changes") {
    const brief = `The owner sent back "${proof.title}".\n\nTheir note:\n${note}\n\nFix it and send new proof.`;
    await newTask(s, proof.agent, `Changes: ${proof.title}`, brief, proof.game_id, { parent_id: null, priority: "high" });
  }
}

// Anything can be thrown away. A running task is dropped first so the computer stops it.
export async function remove(table: "tasks" | "assets" | "proofs" | "pitches" | "messages", row: { id: string; status?: string }) {
  if (table === "tasks" && row.status === "working") await db.update("tasks", row.id, { status: "dropped" });
  await db.remove(table, row.id);
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

Target: at least 200 written notes. Notes are about topics like Tycoon, Simulator or RPG, mechanics and habits, never single games, and they don't name games at all: describe the pattern and how many games do it. Plan 10 to 15 tasks and give each one a note count, so the counts add up to 200 or more. Name the folders and the kind of notes in every brief. Roughly:
- Games: a note per game of ours, with the core loop, where it's at and what's next.
- Game types (about 60, already made from the data pull in Game Types): write "What works in this type" in each, covering the standout games inside it, from the biggest down to small quick games. These count once written.
- Patterns (about 60): one note per mechanic, loop, progression trick or title/thumbnail habit that shows up across many games, with counts and how it plays out, linked to the types it shows up in.
- UI (about 20): one note per kind of screen or UI habit (shops, HUDs, popups, rebirth screens), with how many games do it and how.
- Money (about 15): gamepass, dev product and pricing patterns, with numbers.
- AI slop and quick games (about 20): what the quick game signs turn up, what's cheap to copy and what makes them feel cheap.
- References (about 50), with real images saved next to each note: VFX (about 12, Scenic and Librarian: particles, slashes, auras, explosions, beams, how they're built in Roblox), Modeling (about 12, Librarian: low poly styles, props, characters, topology and texture habits that look good under Roblox limits), Building (about 12, Scenic and Builder: maps, lobbies, lighting, terrain, layouts that read well), SFX (about 5), Animation (about 5, idle, run, attack, UI motion), UI (about 4). Search the web, the Roblox creator store and dev forum, YouTube and ArtStation; download the images with curl into References/<topic>/img and embed them.
- Design rules (about 15): approved things from Review become rules, sent back things become don'ts.
- Agent notes (about 15): short how-we-do-it notes tagged for the agents that need them.
Every note needs \`for:\` frontmatter naming the agents that should read it, [[links]] to related notes, and a line in Home.md. Short notes are fine, empty or placeholder ones aren't. Agents should write notes in batches with a script where it helps, so it doesn't cost a full run per note.
Give the Librarian the last task, after the others: tidy names, fix broken links, fill in Home.md, and count the written notes. If it's under 200, say how many are missing in the DONE line.

What we have so far:
${studioFacts(s)}

It's fine if this takes more than one usage window. The pacing spreads it out.`;
  return newTask(s, "lead", "Start the vault", brief, game_id, { priority: "normal" });
}
