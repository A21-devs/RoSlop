# Usage pacing

Claude plans hand out usage in 5-hour windows (plus a weekly cap). A crew of 15 agents can burn through a window in a few minutes if nothing holds it back, and then you're locked out of Claude Code for your own work too. RoSlop never lets that happen.

## The rule

The crew stops at a line you pick (80% by default) and spreads its work so it gets there no earlier than the end of the window. If it's ahead of pace, low priority jobs wait. It never touches the last chunk, that's yours.

## How it stays under

**The scheduler budgets every job before it starts.** Each job gets a cost estimate from its type, its model and how similar jobs went. A job only starts if `used + running + estimate` stays under the pace line for the time that's passed. Anything that doesn't fit is held for the next window and shows up hatched in Queue.

**Fewer agents at once when it's hot.** The default is 3. If the last 15 minutes ran faster than pace, it drops to 2, then 1. It goes back up once things cool off.

**Right-sized models.** Planning and anything touching money or saves runs heavy (Opus). Code, UI and numbers run standard (Sonnet). Lookups, playtesting, checks and summaries run light (Haiku). On Codex the same three tiers map to its own models.

**Smaller context, every call.**
- Agents hand off a short summary, not the whole conversation.
- The Studio place gets read once per change and shared, not re-read by every agent.
- Agents only load the Notebook pages tagged for them.
- Screenshots are shrunk to what's readable before they're sent.
- Long chats get compacted instead of resent.
- Stable prompts (roles, notebook pages) go first so prompt caching does its job.

**No busywork.** Idle agents don't poll. Jobs are triggered by events: a task arriving, a proof getting approved, a playtest finishing.

## Where the numbers come from

The desktop app reads the usage numbers Claude Code reports for the signed-in account and checks them against its own per-job token counts. If the two drift apart, the stricter one wins.

## What you see

- A meter in the top bar on every screen: percent used, and whether you're on pace.
- Settings → Usage: the pace chart, the stop line, agents at once, model tiers and each saving as a switch.
- Queue: held jobs, and exactly when the window resets.
- The Lead tells you up front roughly how much of a window a request will take.
