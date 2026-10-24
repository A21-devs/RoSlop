import { allowance, canStart, waitFor, type AgentId, type Priority, type Settings, type Task } from "@roslop/core";

export interface Board {
  open: Task[];
  doneParents: Set<string>;
  settings: Settings;
  elapsed: number;
  used: number;
  studioSlots: number;
  studioBusy: number;
  estimateFor: (agent: AgentId) => number;
}

export interface Plan {
  start: { task: Task; estimate: number }[];
  hold: Task[];
  unhold: Task[];
  // Minutes until the first task blocked on pace can start. null means not this window.
  wait?: number | null;
  limit: number;
  // Why waiting tasks didn't start, for telling the owner.
  held: { agent: number; studio: number; room: number; pace: number };
}

const RANK: Record<Priority, number> = { high: 0, normal: 1, low: 2 };

export function byPriority(a: Task, b: Task): number {
  return RANK[a.priority] - RANK[b.priority] || Date.parse(a.created_at) - Date.parse(b.created_at);
}

export function decide(b: Board): Plan {
  // The real reading drives this now: only ease off when usage is actually ahead of pace.
  const limit = b.used >= allowance(b.elapsed, b.settings.cap) * 0.85 ? Math.max(1, Math.ceil(b.settings.max_agents / 2)) : b.settings.max_agents;
  const plan: Plan = { start: [], hold: [], unhold: [], limit, held: { agent: 0, studio: 0, room: 0, pace: 0 } };
  const { settings } = b;
  const working = b.open.filter(t => t.status === "working");
  const busy = new Set(working.map(t => t.agent));
  let running = working.length;
  let studio = b.studioBusy;
  let reserved = working.reduce((sum, t) => sum + Math.max(0, t.estimate - t.used), 0);

  const waiting = b.open
    .filter(t => t.status === "queued" || t.status === "held")
    .filter(t => !t.parent_id || b.doneParents.has(t.parent_id))
    .sort(byPriority);

  for (const task of waiting) {
    const estimate = b.estimateFor(task.agent);
    const holdable = task.priority === "low" && settings.hold_low_priority;
    const fits = canStart({ elapsed: b.elapsed, used: b.used, reserved, cap: settings.cap }, estimate);

    if (!fits.ok) {
      plan.held.pace++;
      if (plan.wait === undefined) plan.wait = waitFor({ elapsed: b.elapsed, used: b.used, reserved, cap: settings.cap }, estimate);
      if (holdable && task.status === "queued") plan.hold.push(task);
      if (!holdable && task.status === "held") plan.unhold.push(task);
      continue;
    }

    // Two of the same agent can work at once, except in Studio where they'd trip over each other.
    const sameAgent = task.needs_studio && busy.has(task.agent);
    const noStudio = task.needs_studio && studio >= b.studioSlots;
    const full = running >= limit;
    if (sameAgent || noStudio || full) {
      if (full) plan.held.room++;
      else if (noStudio) plan.held.studio++;
      else plan.held.agent++;
      if (task.status === "held") plan.unhold.push(task);
      continue;
    }

    plan.start.push({ task, estimate });
    running++;
    busy.add(task.agent);
    reserved += estimate;
    if (task.needs_studio) studio++;
  }
  return plan;
}
