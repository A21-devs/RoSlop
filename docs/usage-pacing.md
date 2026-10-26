# Usage pacing

Claude plans hand out usage in 5-hour windows (plus a weekly cap). A crew of 16 agents can burn through a window in a few minutes if nothing holds it back, and then you're locked out of Claude Code for your own work too. RoSlop never lets that happen.

## The rule

The crew stops at a line you pick (80% by default) and spreads its work so it gets there no earlier than the end of the window. If it's ahead of pace, low priority jobs wait. It never touches the last chunk, that's yours.

## How it stays under

**Pacing goes off the real reading.** The desktop app reads the 5 hour window Claude Code reports. While usage is at or under where it should be for the time that's passed (with a head start at the beginning of a window), the crew runs as many agents at once as you set in Settings, Usage. Estimates only count against the stop line, never against pace, so a guess can't hold the crew back.

**Fewer agents at once when it's hot.** When usage gets ahead of pace, the crew drops to half your agent count. When it's well ahead, it drops to one, until it's back on pace. It never stops altogether until it hits the stop line.

**The Lead goes first.** It's how you talk to the crew, so it starts ahead of everything else and answers even when every slot is full.

**Low priority work waits** while usage is ahead of pace, and starts again once it's back on track.

**Right-sized models.** Planning, anything touching money or saves, world building and art direction run heavy (Opus). Code, UI and numbers run standard (Sonnet). Lookups, playtesting, checks and summaries run light (Haiku). On Codex the same three tiers map to its own models.

**Smaller context, every call.**
- Agents hand off a short summary, not the whole conversation.
- The Studio place gets read once per change and shared, not re-read by every agent.
- Agents only get the vault notes and Library items that match their task.
- Screenshots are shrunk to what's readable before they're sent.
- Long chats get compacted instead of resent.
- Stable prompts (roles, guides) go first so prompt caching does its job.

**No busywork.** Idle agents don't poll. Jobs are triggered by events: a task arriving, a proof getting approved, a playtest finishing.

## Where the numbers come from

The desktop app reads the usage numbers Claude Code reports for the signed-in account and checks them against its own per-job token counts. If the two drift apart, the stricter one wins.

## What you see

- A meter in the top bar on every screen: percent used, and whether you're on pace.
- Settings → Usage: the pace chart, the stop line, agents at once, model tiers and each saving as a switch.
- Tasks: held jobs, and the status line says why fewer agents are running.
- The Lead tells you up front roughly how much of a window a request will take.
