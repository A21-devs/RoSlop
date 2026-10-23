export * from "./types";
export * from "./agents";
export * from "./pacing";
export * from "./estimate";
export * from "./settings";
export * from "./protocol";

export const STAGES = [
  { id: "pitched", name: "Pitched", owner: "pulse" },
  { id: "designed", name: "Designed", owner: "architect" },
  { id: "assets", name: "Assets ready", owner: "librarian" },
  { id: "built", name: "Built", owner: "builder" },
  { id: "balanced", name: "Balanced", owner: "balance" },
  { id: "art", name: "Art done", owner: "splash" },
  { id: "ready", name: "Ready to publish", owner: "producer" },
  { id: "live", name: "Live", owner: null },
  { id: "graded", name: "Graded", owner: "liveops" },
] as const;

export function ago(iso: string | null, now = Date.now()): string {
  if (!iso) return "";
  const s = Math.max(0, (now - Date.parse(iso)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export const pct = (n: number) => `${Math.round(n * 100)}%`;
export * from "./bridge";
