# RoSlop

A crew of 15 AI agents that builds Roblox games for you, running on your own Claude Code or Codex account.

You tell the Lead what you want. It splits the work into tasks and hands them to the right agents: Builder writes the code, Frame does the UI, Playtest plays it and reports what breaks, Reviewer checks anything touching Robux or saves. They open Roblox Studio themselves, take screenshots and clips, and send them to you for a yes or a no.

It runs on Windows and Mac as a desktop app, and anywhere else as a website. Your phone works too, as a remote.

![Home](design/mockups/out/pc-site.png)

## What's in it

- **Home** what needs you, what's working, what's queued
- **Lead** say what you want, get tasks back
- **Team** every agent, the brief the Lead wrote for it, what it's doing right now
- **Tasks** every job and where it is
- **Review** screenshots and clips from the crew. Approve, send back with a note, or reject. Keys A, C, R
- **Prompt coach** shows what the crew would have to guess from your prompt and fills the gaps. Runs in your browser, so it costs no usage
- **Games** live player numbers from Roblox, and where each game is in the pipeline
- **Pitches** game ideas from the charts with the reasons behind them
- **Market** what's climbing on Roblox right now
- **Library** your models, icons, sounds and references in one place
- **Vault** your Obsidian notes. Agents read the ones meant for them, and can start a vault for you
- **Settings** usage limits, computers, apps like Blender, connectors like Figma, keys

## It won't eat your usage

Claude plans give you usage that refills every 5 hours. Fifteen agents can burn through that in minutes if nothing holds them back, so RoSlop paces them:

- The crew stops at a line you pick (80% by default). The rest is yours.
- Work is spread across the window. Jobs that would run ahead of pace wait.
- Fewer agents run at once when usage is running hot.
- Each agent uses the smallest model that does its job well.
- Handoffs are summaries, agents only read the vault notes tagged for them, and screenshots get shrunk.

The details are in [docs/usage-pacing.md](docs/usage-pacing.md).

## How it fits together

```
 phone / browser ──┐
                   ├──  Supabase (login, data, live sync, files)  ──  desktop app on your PC
 desktop app UI ───┘                                                    └─ runs claude / codex
                                                                           └─ drives Roblox Studio, Blender…
```

Only the desktop app runs agents. Everything else is a remote that reads and writes the same data, so whatever you do on one device shows up on the others straight away.

## Install

Grab the installer for your computer from the [latest release](https://github.com/21kingbigz/RoSlop/releases/latest):

- **Windows**: `RoSlop-…-win-x64.exe`
- **Mac with an Apple chip**: `RoSlop-…-mac-arm64.dmg`
- **Older Intel Mac**: `RoSlop-…-mac-x64.dmg`

The app isn't signed yet, so the first launch needs one extra click. On Windows, click "More info" then "Run anyway". On a Mac, right-click the app and choose Open.

When it opens you can try the demo straight away, or connect your own Supabase project to sync across devices and run the crew for real.

## Set it up for real

**1. A free Supabase project.** This is where your account and data live, so your phone, browser and PC all see the same thing.

- Make a project at supabase.com.
- Open the SQL editor and run the files in `supabase/migrations`, in order.
- Optional: turn on GitHub or Google under Authentication, Providers.
- In the app, paste the project URL and anon key (Project Settings, API) and hit Connect.

**2. Claude Code or Codex** on the computer that does the work. Install one and sign in once. RoSlop uses your plan, nothing goes through anyone else.

**3. Sign in on that computer.** It becomes your worker. Add your games under Games, point Settings at the Roblox Studio MCP server so agents can drive Studio, and scan for apps like Blender.

**4. Your phone** (optional). Host `apps/web` anywhere static, like Vercel or Netlify, and sign in from your phone. It works as a remote for your PC.

## Working on RoSlop itself

You need Node 20 or newer.

```
npm install
npm run dev            # the web app with demo data, at localhost:5173
npm run dev:desktop    # the desktop app, in a second terminal
```

Installers are built by GitHub Actions on real Windows and Mac machines whenever a `v*` tag is pushed. See `.github/workflows/release.yml`.

## A word on safety

Agents run on your computer with permission to edit files and run commands in each game's project folder. That's what lets them use Studio, Blender and your tests. Keep project folders for game work, and read what Reviewer flags before you publish anything.

Keys you add in Settings are encrypted on that computer and never synced.

## Layout

```
apps/web        React app. Website, phone and the desktop UI
apps/desktop    Electron shell and the runner that drives the agents
packages/core   Shared types, the agent list, pacing, and the agents' briefs
supabase        Database schema
design          Mockups
docs            Notes on how things work
```

## License

MIT
