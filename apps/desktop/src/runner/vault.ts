import type { AgentId, Task } from "@roslop/core";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

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
    if (e.name.startsWith(".") || e.name === "node_modules") continue;
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

export const FOLDERS = ["Games", "Design", "References", "References/img", "Market", "Lessons"];

export function isVaultTask(t: Pick<Task, "title" | "brief">): boolean {
  return /\bvault\b|obsidian/i.test(`${t.title} ${t.brief}`);
}

// Folders and a Home note, so there's something to open in Obsidian before the crew writes anything.
export function seedVault(vault: string) {
  for (const f of FOLDERS) mkdirSync(join(vault, f), { recursive: true });
  const home = join(vault, "Home.md");
  if (!existsSync(home)) {
    writeFileSync(home, `---
for: [lead, architect, builder, balance, librarian, pulse]
tags: [home]
---

# Home

What the crew knows about making our Roblox games. Every note links back here.

## Games

## Design

## References

## Market

## Lessons
`);
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
