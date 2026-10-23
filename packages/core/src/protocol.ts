import { AGENT } from "./agents";
import type { AgentId, Priority } from "./types";

// Agents talk back to the app with plain lines in their output:
//   ASK: Which layout? | A | B
//   PROOF: shots/shop-b.png | Phone shop, option B | Buy button sits under your thumb
//   DONE: Lava now ticks 20 dmg every 0.5s, weekly reset uses os.time
// The Lead also ends its reply with a ```tasks block of JSON.

export type Signal =
  | { kind: "ask"; question: string; options: string[] }
  | { kind: "proof"; path: string; title: string; note: string }
  | { kind: "done"; summary: string };

export function readSignal(line: string): Signal | null {
  const m = line.trim().match(/^(ASK|PROOF|DONE):\s*(.+)$/);
  if (!m) return null;
  const parts = m[2].split("|").map(p => p.trim()).filter(Boolean);
  if (m[1] === "ASK") return { kind: "ask", question: parts[0], options: parts.slice(1) };
  if (m[1] === "PROOF") return { kind: "proof", path: parts[0], title: parts[1] ?? "Proof", note: parts[2] ?? "" };
  return { kind: "done", summary: m[2].trim() };
}

export function readSignals(text: string): Signal[] {
  return text.split("\n").map(readSignal).filter((s): s is Signal => s !== null);
}

export interface PlannedTask {
  agent: AgentId;
  title: string;
  brief: string;
  priority: Priority;
  after?: number[];
}

export function readPlan(text: string): PlannedTask[] {
  const m = text.match(/```tasks\s*([\s\S]*?)```/);
  if (!m) return [];
  let raw: unknown;
  try {
    raw = JSON.parse(m[1]);
  } catch {
    return [];
  }
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((t): t is Record<string, unknown> => !!t && typeof t === "object")
    .filter(t => typeof t.agent === "string" && t.agent in AGENT && typeof t.title === "string")
    .map(t => ({
      agent: t.agent as AgentId,
      title: String(t.title),
      brief: typeof t.brief === "string" ? t.brief : "",
      priority: t.priority === "high" || t.priority === "low" ? t.priority : "normal",
      after: Array.isArray(t.after) ? t.after.filter((n): n is number => typeof n === "number") : undefined,
    }));
}

// What the Lead says to you, without the tasks block.
export function stripPlan(text: string): string {
  return text.replace(/```tasks[\s\S]*?```/, "").trim();
}
