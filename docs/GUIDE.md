# The RoSlop guide

Everything in RoSlop: what each part is, what it does, how it works underneath, and how to set it all up. Read it top to bottom once, then come back to the part you need.

## What RoSlop is

RoSlop is a studio of 16 AI agents that make Roblox games with you. You say what you want, in plain words, to the Lead. The Lead turns it into tasks and gives each one to the agent whose job it is. The agents open Roblox Studio, Blender and your project files themselves, do the work, take screenshots and clips of it, and send those to you to approve or send back.

It runs on your own Claude Code or Codex account. Nothing goes through anyone else, and your usage is paced so you're never locked out of your own Claude.

## How it works

```
 you (desktop app, website, phone)
        │  "add a pet shop to the lobby"
        ▼
   Supabase  ── tasks, reviews, Library, settings, live sync between your devices
        │
        ▼
 desktop app on your worker PC
   ├─ scheduler: picks what runs, paces your usage
   ├─ for each task, starts a real Claude Code (or Codex) agent in the game's folder, with:
   │    its role, the guides, your Library, references, vault notes,
   │    your style videos, and everything it has learned from you
   ├─ the agent works on its own: reads files, writes Luau, drives Studio, Blender, Figma,
   │    takes screenshots of Studio and looks at them, fixes what's wrong
   ├─ it talks back with short lines: PROOF, DONE, ASK, LESSON, HANDOFF, ASSET
   └─ proofs go to the Art Director, then to you in Review
```

Only the desktop app on your **worker** computer runs agents. The website and your phone are remotes onto the same data.

### Are these real agents?

Yes. Each agent is a full Claude Code session, the same agent loop developers use to write software. It plans, calls tools, edits files, runs commands, controls Studio through the Studio MCP server, checks its own work with screenshots, and keeps going until the job is done or it needs you. Then it hands back proof.

What makes it a crew rather than one chatbot:

- **Roles.** Each agent has its own job, instructions, guides and model size.
- **Handoffs.** Agents pass work to each other mid-task with `HANDOFF`: Builder asks Playtest to test its change, Scenic asks the Librarian for a model.
- **A critic.** The Art Director checks visual work and sends weak work back, up to three rounds, before you see it.
- **Memory.** Agents learn from you (see the next section).
- **Autopilot.** Turn it on for a game and the Lead keeps planning the next work by itself.

### How the agents learn

Nobody can retrain the model inside Claude or Codex itself. That isn't possible on any plan. Instead, the crew learns the way a new hire does: from feedback, written down and brought to every job.

- **Your calls in Review.** Every approve, send back and reject, with your note, is remembered by the agent that made the work. Its next tasks start with what you said, newest first, treated as rules.
- **Approved work.** For visual agents, pictures of work you approved are downloaded with each task as the bar to meet.
- **The Art Director's notes.** What it sent back comes back to the agent next time, so the same mistake doesn't repeat.
- **Lessons.** Agents write `LESSON:` lines when they learn something worth keeping: a preference of yours, a fix that worked, a Studio gotcha. They're saved in your vault under `Lessons/<agent>.md`. Edit or delete anything wrong, and the agent reads your version.
- **Your stuff.** Your Library, references, vault notes and style videos come with every task, picked for that task.

The more you review with a short note ("rounder edges", "too dark", "buttons too small on phone"), the better it gets. You can see what each agent has learned on its **Team** page.

## The pages

### Home

What needs you right now (questions, proof to review), what's working, what's queued, and **Where each game is**, with a **Play** button that opens the game and a **Playtest** button that has the crew test it. The box at the top sends a message straight to the Lead.

### Lead

Your chat with the Lead. Talk to it like a person.

- **Ask for work**: "Make a cozy lobby with a shop and three portals." It answers in a couple of sentences and creates the tasks, which show under Tasks.
- **Ask what's happening**: "What's everyone doing?" It checks each active agent and reports back.
- **Under the box:**
  - **Add reference files** attaches pictures or videos.
  - **Style** picks gameplay videos to match (saved ones or new links), for this task only or saved for a kind of game.
  - **Model rules** set the style, triangle budget and texture size for anything modeled.

Messages to the Lead jump the queue, so it answers even when the crew is busy.

### Team

All 16 agents. Click one to see what it's doing, the brief it was given, its activity, and **What it's learned**. You can give an agent a job directly; that skips the Lead, which is fine for small things.

### Tasks

Every job and its state: working, back to you, queued, held, done. Click one for the full brief, activity and result. You can pause, resume, drop or bump the priority of any task.

### Review

Screenshots and clips from the crew, waiting for your call.

- **Approve (A)**: it's good. The agent remembers what you liked.
- **Send back (C)**: write what to change. The same agent gets a new task with your note, and remembers it.
- **Reject (R)**: wrong direction. The agent remembers that too.

Click a picture to zoom. A short note on every call is the single best way to make the crew better.

### Prompt engineering

Type what you want and it shows what the crew would have to guess, then fills the gaps. Save prompts you reuse as templates. It runs in your browser, so it costs no usage.

### Games

Your games, with live numbers from Roblox recorded every few minutes while the desktop app runs.

- **Charts**: players, visits, favorites and likes over any range, with dashed lines where the crew shipped something.
- **Money, Badges, Servers**: passes, badges and live servers, straight from Roblox (desktop app only).
- **Live ops**: peak, average players, visits and new favorites for the range you pick, compared with the period before. Also when people play, what changed, and buttons to ask the crew for the next update, a playtest, a money check or a bug sweep.
- **Details**: the universe id, project folder, stage, and **Autopilot** with the game's goal.

### Pitches

Game ideas. **Build** pitches are new games based on what's growing on the charts. **Buy** pitches are acquisitions of an existing game (a stake, a full buyout or both), priced from RoWatcher's revenue estimates with the working shown. Approve a build pitch and the Architect starts the plan. Approve an acquisition and the Producer drafts the outreach for you to send.

### Market

What's climbing on Roblox right now, pulled from Roblox's charts and searches: filters, benchmarks, breakouts, and a **Pitch** button on any game.

### Library

Everything you own and can reuse: icons, models, animations, sounds, VFX, UI and references.

- **Upload** or drop files. In a tab, they go into that tab. On All, the kind is guessed from the file name. Videos go to References.
- **Groups** inside groups (Weapons / Environmental / Stylized). Drag items onto a group, or select several (shift-click for a run) and Move to.
- **Previews**: models and animations render live with their textures, sounds show a waveform and play, and videos play while on screen. `.rbxm` files say what's inside; Make preview has an agent render them in Studio or Blender.
- **To Roblox**: with an Open Cloud key, uploads go to Roblox by themselves and get their asset id.
- **Every task gets your Library** ranked for that task, and agents must use it before making anything new.

### Vault

Your Obsidian vault: notes the crew reads and writes.

- **Add to references**: paste links (pictures, X posts, YouTube, TikTok or Medal clips, DevForum or ArtStation pages) or drop pictures, and pick an area and topic. Your computer pulls the images into `References/<area>` and links them in that topic's note. No AI involved, so it's instant.
- **Pictures in your vault**: everything already in the vault, by area. Pick some and send them to the Library's References.
- **Ask the crew to add something**: a kind of note, games to study, or tidying.
- **Start building the vault**: the crew writes real notes, including references, design rules from your reviews, and what's working on the charts.
- **Guides and lessons**: the crew's style guides live in `References/Building` and `References/Modeling`, and what each agent learned lives in `Lessons`. Edit them and the crew follows your version.

### Settings

- **Usage**: the stop line (default 80%), agents at once, model sizes and each saving.
- **Studios**: name each Studio, say which game and kind of game it's for, and how many agents can have Studio open at once.
- **Style targets**: gameplay videos or game names for each kind of game. Build, model and art tasks study frames from them.
- **Computers and apps**: which computer is the worker, the Claude Code or Codex location, the Roblox Studio MCP command, and apps like Blender.
- **Connectors**: Figma, GitHub, Linear, Notion and Blender. It shows whether each one is connected, needs sign-in or isn't set up, with one-click setup for Figma and Blender.
- **Keys**: Roblox Open Cloud, creator id, RoWatcher and a Discord webhook. These are encrypted on that computer and never synced.
- **AI provider**: Claude Code or Codex.
- **Account** and **Look**.

## The crew

| Agent | Job | Model |
|---|---|---|
| Lead | Turns what you want into tasks, answers questions about the crew, plans autopilot | top |
| Pulse | Watches the charts, pitches games, prices acquisitions | small |
| Architect | Writes the game plan before anything is built | top |
| Builder | Luau, systems, wiring everything together in Studio | mid |
| Frame | UI that fits on a phone | mid |
| Scenic | Maps, terrain, buildings, lighting, atmosphere | top |
| Librarian | Finds, models and textures assets, keeps the Library tidy | small |
| Balance | Simulates the economy so upgrades and prices feel right | mid |
| Clueless Tester | Plays with no idea what the game is, skips every tutorial | small |
| Playtest | Runs the game and reports what breaks | small |
| Splash | Thumbnails and icons | small |
| Merchant | Shops, game passes, developer products | mid |
| Producer | Keeps work moving, checks proof, drafts outreach | small |
| Reviewer | Money, saves and security before anything ships | top |
| Art Director | Judges builds, models and art and sends weak work back | top |
| Liveops | Reads player numbers and plans the next update | small |

"Top" is Opus, "mid" is Sonnet and "small" is Haiku on Claude. On Codex the same three sizes map to its own models.

## The life of a task

1. **You ask.** In Lead chat, on a page button, or straight to an agent on Team.
2. **The Lead plans.** It writes a short reply and a set of tasks, each with a brief, a priority, and which tasks must finish first.
3. **The scheduler picks.** The Lead first, then by priority. It runs as many agents at once as you set, and fewer when usage runs ahead of pace. Studio agents wait for a free Studio slot.
4. **The job is prepared.** RoSlop gives the agent everything it needs to do the task:
   - its role and the shared rules
   - the guides for its kind of work (building, modeling, texturing)
   - your Library ranked for the task, the closest references downloaded, and the matching vault notes
   - frames from your style videos
   - what it has learned from you
   - the game's project folder, with Studio, Blender and Figma connected when they're on
5. **The agent works.** It's a real Claude Code session: it reads, writes, runs, drives Studio, takes pictures of its work and fixes what's wrong.
6. **It talks back** with short lines:
   - `PROOF: file | title | what to look at`: a screenshot or clip for Review
   - `DONE: what changed`, ending with "Used:" and the Library items, references and notes it used
   - `ASK: question | option | option`: only for calls that are yours (spending, publishing, deleting, big changes)
   - `LESSON: one sentence`: remembered for next time
   - `HANDOFF: agent | title | details`: a new task for a teammate
   - `ASSET: name | id`: a Library item is on Roblox now
7. **The Art Director checks it**, if it's a build, model or art. It passes the work, or sends it back to the same agent with specific notes, up to three rounds.
8. **You review.** Approve, send back or reject. Your call and note are remembered.

## Setup, step by step

About 15 minutes, once. Each step says how to tell it worked.

### 1. Install the app

Download the installer for your computer from the [latest release](https://github.com/21kingbigz/RoSlop/releases/latest): `.exe` for Windows, `arm64.dmg` for Apple-chip Macs, `x64.dmg` for Intel Macs. It isn't signed yet. On Windows click **More info → Run anyway**. On a Mac, right-click it and choose **Open**.

*It worked if* the app opens and offers the demo or connecting your own project.

### 2. Make a Supabase project

Supabase holds your account and data so all your devices stay in sync.

1. Make a free project at [supabase.com](https://supabase.com).
2. In the app, choose to connect your own project. Paste the **Project URL** and **anon public key** (Supabase: **Project Settings → API**), then **Connect**.
3. Copy the setup code the app shows, open **SQL Editor** in Supabase, paste it and press **Run**.
4. Make an account with email and password.

Run the setup code again after every update. It only adds what's missing.

*It worked if* you're signed in and see an empty Home.

### 3. Install Claude Code or Codex on the worker

- **Claude Code on Windows**: open PowerShell and run `irm https://claude.ai/install.ps1 | iex`. If it says scripts are disabled, run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` first.
- **Claude Code on Mac**: open Terminal and run `curl -fsSL https://claude.ai/install.sh | bash`.
- Then run `claude` once and sign in.
- **Codex**: install the Codex app and sign in. RoSlop uses the copy inside it.

*It worked if* **Settings → Computers and apps** shows Claude Code (or Codex) found, with its version.

### 4. Make this computer the worker

The first desktop app you sign in on becomes the worker. Change roles under **Settings → Computers and apps**: **Does the work**, **Backup** (takes over when the worker is off) or **Remote only**.

*It worked if* the sidebar says it runs on this PC.

### 5. Connect Roblox Studio

1. Install Roblox's Studio MCP server from [Roblox/studio-rust-mcp-server](https://github.com/Roblox/studio-rust-mcp-server) and follow its readme. It adds a Studio plugin and a server for Claude.
2. If it shows in `claude mcp list`, RoSlop finds it under any name. If not, paste its command under **Settings → Computers and apps → Roblox Studio MCP command**.
3. Under **Settings → Studios**, name your Studios and set how many agents can have Studio open at once.

*It worked if* a Builder task can open your place and its activity shows Studio tools being used.

### 6. Add your games

**Games → Add a game**: give it a name, its **universe id** (in [Creator Hub](https://create.roblox.com/dashboard/creations), the number after `/experiences/` in the address bar) and its project folder on the worker. Optionally turn on **Autopilot** under Details and write the goal.

*It worked if* players and visits show within a few minutes.

### 7. Optional: Blender, Figma, keys, vault, phone

- **Blender**: **Settings → Computers and apps → Scan** finds it. In **Connectors**, use **Add Blender**, and turn on the Blender MCP add-on inside Blender.
- **Figma**: **Connectors → Connect through the Figma app**. In the Figma desktop app, open a design file, press Shift+D for Dev Mode and turn on the desktop MCP server.
- **Keys** (**Settings → Keys**):
  - Roblox Open Cloud key with Assets read and write, plus your creator id (your user id, or `group:123`), so Library uploads go to Roblox.
  - RoWatcher, for deeper market and revenue data.
  - A Discord webhook to post approvals.
- **Vault**: on **Vault**, pick a folder or press **Start building the vault**. Open it in [Obsidian](https://obsidian.md).
- **Phone**: host `apps/web` on Vercel or Netlify and sign in. It's a remote for your PC.

## Recipes

**Start a new game.** On Market or Pitches, pitch a game that's climbing. Approve the pitch and the Architect writes the plan, then the Lead splits it into work. Or tell the Lead your own idea.

**Build a map that looks pro.**
1. Save two or three gameplay videos of the look you want under **Settings → Style targets**, for that kind of game.
2. Add reference pictures on **Vault → Add to references** (Building).
3. Ask the Lead: "Build the spawn area: a cozy fantasy village square with a fountain, market stalls and a path to the arena."
4. Scenic builds in passes and checks screenshots against your references. The Art Director checks it again, and then it comes to you.

**Make pets, eggs or weapons.** Turn on Blender. Ask: "Make 6 pets for the volcano egg: lava dino, ember cat…" with **Model rules** set (style, triangles, texture size). The Librarian models and textures them to the modeling guide, they go into the Library, and the Art Director checks them.

**Fix a bug.** Tell the Lead what's wrong and where. It usually has Builder fix it and hands a playtest after.

**Grow the game on its own.** In **Games → Details**, turn on **Autopilot** and write the goal. When nothing is open and usage is on pace, the Lead plans the next work, at most every 3 hours. It never spends Robux or publishes.

**Buy into a game.** On Market, pitch an acquisition: pick a stake, a full buyout or both. Pulse prices it from RoWatcher's revenue data. Approve it, and the Producer drafts the outreach for you to send.

**Teach the crew.** Leave a short note on every Review call. Look at **Team → What it's learned** for each agent, and edit `Lessons/<agent>.md` in your vault if anything's wrong.

## Usage pacing

Claude plans refill every 5 hours. RoSlop keeps the crew under a stop line you pick (80% by default) and spreads its work across the window. While usage is on pace it runs as many agents as you set. When usage is ahead of pace it runs half as many, and one when well ahead. Low priority work waits, and the Lead always answers. Bigger jobs go to bigger models and small ones to small models. More in [usage-pacing.md](usage-pacing.md).

## Troubleshooting

- **"Claude Code isn't working on this computer"**: install it (setup step 3), run `claude` once to sign in, and restart RoSlop. Or point at it under **Settings → Computers and apps**.
- **Only one agent works**: the status line says why. It's usually usage ahead of pace, Studio slots full (**Settings → Studios**), tasks waiting on an earlier one, or the agent count under **Settings → Usage**.
- **Agents can't reach Studio**: the Studio MCP plugin must be on in Studio, and the server must show in `claude mcp list` or be in Settings.
- **A connector says Needs sign-in**: run `claude`, type `/mcp`, pick it and sign in, then **Check again**.
- **A style video won't download**: sign in to YouTube in Firefox, Edge or Chrome on the worker. Private videos can't be used.
- **"Saved on this device only"**: run `supabase/setup.sql` again.
- **A file won't upload**: Supabase's free plan takes up to 50 MB a file.
- **Agents ignore your stuff**: check that it's in the Library or the vault, and name it in your request. The task's activity shows "Used:" at the end.
