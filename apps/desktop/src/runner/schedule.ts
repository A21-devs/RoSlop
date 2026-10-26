import { allowance, waitFor, type AgentId, type Priority, type Settings, type Task } from "@roslop/core";

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
  const { settings } = b;
  // Pacing works off the real usage reading. While it's on pace, as many agents run as the owner
  // set. Only when it's actually ahead does the crew shrink, and it never stops altogether.
  const allowed = allowance(b.elapsed, settings.cap);
  const limit = b.used > allowed + 0.1 ? 1 : b.used > allowed ? Math.max(1, Math.ceil(settings.max_agents / 2)) : settings.max_agents;
  const plan: Plan = { start: [], hold: [], unhold: [], limit, held: { agent: 0, studio: 0, room: 0, pace: 0 } };
  const working = b.open.filter(t => t.status === "working");
  const busy = new Set(working.map(t => t.agent));
  let running = working.length;
  let studio = b.studioBusy;

  // The Lead goes first, it's how the owner talks to the crew.
  const waiting = b.open
    .filter(t => t.status === "queued" || t.status === "held")
    .filter(t => !t.parent_id || b.doneParents.has(t.parent_id))
    .sort((x, y) => Number(y.agent === "lead") - Number(x.agent === "lead") || byPriority(x, y));

  for (const task of waiting) {
    const estimate = b.estimateFor(task.agent);
    const holdable = task.priority === "low" && settings.hold_low_priority;
    const lead = task.agent === "lead";

    // The cap is the hard line. Estimates are guesses, so they only count against the cap, and
    // the Lead can always answer while there's anything left under it.
    if (b.used + (lead ? 0 : estimate) >= settings.cap) {
      plan.held.pace++;
      if (plan.wait === undefined) plan.wait = null;
      if (holdable && task.status === "queued") plan.hold.push(task);
      if (!holdable && task.status === "held") plan.unhold.push(task);
      continue;
    }
    // Low priority work waits while the crew is ahead of pace.
    if (holdable && b.used > allowed) {
      plan.held.pace++;
      if (plan.wait === undefined) plan.wait = waitFor({ elapsed: b.elapsed, used: b.used, reserved: 0, cap: settings.cap }, 0);
      if (task.status === "queued") plan.hold.push(task);
      continue;
    }

    // Two of the same agent can work at once, except in Studio where they'd trip over each other.
    const sameAgent = task.needs_studio && busy.has(task.agent);
    const noStudio = task.needs_studio && studio >= b.studioSlots;
    const full = running >= limit && !lead;
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
    if (task.needs_studio) studio++;
  }
  return plan;
}
