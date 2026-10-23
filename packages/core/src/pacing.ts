// All usage numbers are fractions of one 5-hour window: 0.41 means 41% used.

export const WINDOW_MIN = 300;
const HEADSTART_MIN = 30;

export interface PaceState {
  elapsed: number;
  used: number;
  reserved: number;
  cap: number;
}

export function windowElapsed(startedAt: string | null, now = Date.now()): number {
  if (!startedAt) return 0;
  const min = (now - Date.parse(startedAt)) / 60000;
  return min >= WINDOW_MIN ? WINDOW_MIN : Math.max(0, min);
}

export function windowExpired(startedAt: string | null, now = Date.now()): boolean {
  return !startedAt || (now - Date.parse(startedAt)) / 60000 >= WINDOW_MIN;
}

// How much of the window the crew is allowed to have spent by now. The small
// head start lets the first jobs of a fresh window begin straight away.
export function allowance(elapsed: number, cap: number): number {
  return cap * Math.min(1, (elapsed + HEADSTART_MIN) / WINDOW_MIN);
}

export function canStart(s: PaceState, estimate: number): { ok: boolean; why?: string } {
  const after = s.used + s.reserved + estimate;
  if (after > s.cap) return { ok: false, why: "would pass your cap this window" };
  if (after > allowance(s.elapsed, s.cap)) return { ok: false, why: "ahead of pace, waiting a bit" };
  return { ok: true };
}

export function projected(used: number, elapsed: number): number {
  if (elapsed < 5) return used;
  return Math.min(1, (used / elapsed) * WINDOW_MIN);
}

export type Pace = "behind" | "on" | "ahead";

export function pace(used: number, elapsed: number, cap: number): Pace {
  const target = cap * (elapsed / WINDOW_MIN);
  if (used > target + 0.05) return "ahead";
  if (used < target - 0.1) return "behind";
  return "on";
}

// Fewer agents at once while the last stretch ran hotter than pace.
export function concurrency(base: number, recentRate: number, cap: number): number {
  const paceRate = cap / WINDOW_MIN;
  if (recentRate > paceRate * 2) return 1;
  if (recentRate > paceRate * 1.25) return Math.max(1, base - 1);
  return base;
}
