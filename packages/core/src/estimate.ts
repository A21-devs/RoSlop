import { AGENT } from "./agents";
import type { AgentId, Task, Tier } from "./types";

// Rough starting points before we have history. Fractions of a window.
const BASE: Record<Tier, number> = { heavy: 0.04, standard: 0.03, light: 0.01 };

export function estimate(agent: AgentId, history: Pick<Task, "agent" | "used" | "status">[]): number {
  const past = history
    .filter(t => t.agent === agent && t.status === "done" && t.used > 0)
    .map(t => t.used)
    .slice(-20)
    .sort((a, b) => a - b);
  if (past.length < 3) return BASE[AGENT[agent].tier];
  // lean high so the scheduler doesn't get surprised
  return past[Math.floor(past.length * 0.75)];
}

export function tokensToWindow(tokens: number, windowTokens: number): number {
  return windowTokens > 0 ? tokens / windowTokens : 0;
}
