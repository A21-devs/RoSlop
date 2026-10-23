import { canStart, concurrency, waitFor, type AgentId, type Priority, type Settings, type Task } from "@roslop/core";

export interface Board {
  open: Task[];
  doneParents: Set<string>;
  settings: Settings;
  elapsed: number;
  used: number;
  recentRate: number;
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
}

const RANK: Record<Priority, number> = { high: 0, normal: 1, low: 2 };

export function byPriority(a: Task, b: Task): number {
  return RANK[a.priority] - RANK[b.priority] || Date.parse(a.created_at) - Date.parse(b.created_at);
}

export function decide(b: Board): Plan {
  const plan: Plan = { start: [], hold: [], unhold: [] };
  const { settings } = b;
  const working = b.open.filter(t => t.status === "working");
  const busy = new Set(working.map(t => t.agent));
  const limit = concurrency(settings.max_agents, b.recentRate, settings.cap);
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
    const pace = canStart({ elapsed: b.elapsed, used: b.used, reserved, cap: settings.cap }, estimate);

    if (!pace.ok) {
      if (plan.wait === undefined) plan.wait = waitFor({ elapsed: b.elapsed, used: b.used, reserved, cap: settings.cap }, estimate);
      if (holdable && task.status === "queued") plan.hold.push(task);
      if (!holdable && task.status === "held") plan.unhold.push(task);
      continue;
    }

    const free = running < limit && !busy.has(task.agent) && (!task.needs_studio || studio < b.studioSlots);
    if (!free) {
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
