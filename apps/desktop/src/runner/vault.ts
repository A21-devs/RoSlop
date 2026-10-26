import type { AgentId, Task } from "@roslop/core";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { BUILDING, MODELING, TEXTURING } from "../prompts";

const MAX_FILES = 3000;

function walk(dir: string, out: string[]) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (out.length >= MAX_FILES) return;
    // game notes are data, agents read the CSV instead
    if (e.name.startsWith(".") || e.name === "node_modules" || (e.name === "Games" && dir.endsWith("References"))) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".md")) out.push(p);
  }
}

// Reads `for:` and `also:` from frontmatter, written either as `for: a, b`, `for: [a, b]` or a list.
export function noteAgents(text: string): string[] {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return [];
  const agents: string[] = [];
  let inList = false;
  for (const line of m[1].split(/\r?\n/)) {
    const key = line.match(/^(for|also)\s*:\s*(.*)$/i);
    if (key) {
      const rest = key[2].replace(/[[\]"']/g, "").trim();
      inList = !rest;
      agents.push(...rest.split(/[,\s]+/).filter(Boolean));
      continue;
    }
    const item = inList && line.match(/^\s+-\s*["']?([\w-]+)/);
    if (item) agents.push(item[1]);
    else if (!/^\s/.test(line)) inList = false;
  }
  return agents.map(a => a.toLowerCase());
}

export const FOLDERS = ["Games", "Game Types", "Design", "References", "References/img", ...["VFX", "Modeling", "Building", "SFX", "Animation", "UI"].map(t => `References/${t}/img`), "Market", "Lessons"];

// A request can name its own vault with a "Vault folder: <path>" line in the brief.
export function briefVault(brief: string): string | null {
  return brief.match(/^Vault folder: (.+)$/m)?.[1].trim() || null;
}

export function isVaultTask(t: Pick<Task, "title" | "brief">): boolean {
  return /\bvault\b|obsidian/i.test(`${t.title} ${t.brief}`);
}

// Folders and a Home note, so there's something to open in Obsidian before the crew writes anything.
export function seedVault(vault: string) {
  for (const f of FOLDERS) mkdirSync(join(vault, f), { recursive: true });
  seedStyleNotes(vault);
  const home = join(vault, "Home.md");
  if (!existsSync(home)) {
    writeFileSync(home, `---
for: [lead, architect, builder, balance, librarian, pulse]
tags: [home]
---

# Home

What the crew knows about making our Roblox games. Every note links back here.

## Games

## Game types
[[Game Types]]

## Design

## References
[[VFX]] · [[Modeling]] · [[Building]] · [[SFX]] · [[Animation]] · [[UI]]

## Market

## Lessons
`);
  }
}

// The crew's style guides, as notes the owner can read and add to. Written once; after that the
// note is theirs and never overwritten.
function section(md: string, heading: string): string {
  const at = md.indexOf(`## ${heading}`);
  if (at < 0) return "";
  const next = md.indexOf("\n## ", at + 3);
  return md.slice(at, next < 0 ? undefined : next).replace(/^## .*\n/, "").trim();
}

function styleNotes(): [string, string, string][] {
  const after = (md: string, from: string, to: string) => {
    const a = md.indexOf(`## ${from}`), b = md.indexOf(`## ${to}`);
    return a < 0 ? "" : md.slice(a, b < 0 ? undefined : b).trim();
  };
  return [
    ["References/Building/Showcase builds.md", "scenic, builder, director, librarian", `## Scale\n\n${section(BUILDING, "Scale (Roblox studs)")}\n\n## Looking good\n\n${section(BUILDING, "Making it look good")}\n\n## The bar\n\n${section(BUILDING, "The bar: showcase quality")}`],
    ["References/Building/Stylized RPG worlds.md", "scenic, builder, director, librarian", section(BUILDING, "Stylized fantasy and anime RPG worlds")],
    ["References/Building/Simulator and tycoon builds.md", "scenic, builder, director", section(MODELING, "Building simulators and tycoons from parts")],
    ["References/Modeling/Pets, eggs, weapons and bosses.md", "librarian, scenic, splash, builder, director", after(MODELING, "Pets", "Building simulators")],
    ["References/Modeling/Hand-painted texturing.md", "librarian, scenic, splash, director", TEXTURING.replace(/^# .*\n/, "").trim()],
  ];
}

function seedStyleNotes(vault: string) {
  for (const [rel, agents, body] of styleNotes()) {
    const file = join(vault, rel);
    if (!body || existsSync(file)) continue;
    mkdirSync(dirname(file), { recursive: true });
    const title = basename(rel, ".md");
    writeFileSync(file, `---\nfor: [${agents}]\ntags: [style, guide]\n---\n\n# ${title}\n\nHow the crew builds and models this. Add your own notes and pictures; the crew reads this before that kind of work.\n\n${body}\n\n[[${rel.startsWith("References/Building") ? "Building" : "Modeling"}]] · [[Home]]\n`);
  }
}

export function notesFor(vault: string, agent: AgentId): string[] {
  const files: string[] = [];
  walk(vault, files);
  return files.filter(f => {
    try {
      return noteAgents(readFileSync(f, "utf8").slice(0, 2000)).includes(agent);
    } catch {
      return false;
    }
  });
}
