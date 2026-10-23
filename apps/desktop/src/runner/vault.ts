import type { AgentId } from "@roslop/core";
import { readdirSync, readFileSync } from "node:fs";
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
