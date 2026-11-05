import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { app } from "electron";
import { allowance, estimate, serverFor, stylesFor, windowElapsed, WINDOW_MIN, type Game, type MarketItem, type Machine, type RunnerStatus, type Settings, type StudioLane, type Task } from "@roslop/core";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { allKeys, getKey } from "../keys";
import { cliFound } from "./cli";
import { addServer, listServers } from "./mcp";
import { connect, fail, loadSettings, Tokens, withDefaults, type Auth } from "./db";
import { Events } from "./events";
import { Job, type StopReason } from "./job";
import { heartbeat, registerMachine, shouldWork, STUDIO_SLOTS } from "./machine";
import { decide } from "./schedule";
import { recordStats } from "./stats";
import { Usage } from "./usage";
import { priceBrief } from "./rowatcher";
import { afterJob } from "./director";
import { memoryFor } from "./memory";
import { gatherStuff } from "./stuff";
import { BUILD_WORDS } from "./prompt";
import { IMPORT_TITLE, runImport } from "./imports";
import { frameServer, styleRefs } from "./style";
import { briefVault, isVaultTask, seedVault } from "./vault";
import { fetchRefs } from "./refs";
import { crewReport } from "./crew";
import { allRows } from "./db";
import { RobloxUploads } from "./roblox";
import { countStudios } from "./studios";
import { latestPull, looksQuick, pullGames, tidyLinks, writeGames, type PullResult } from "./gamedata";

const POLL_MS = 20_000;
const HEARTBEAT_MS = 60_000;
const STATS_MS = 5 * 60_000;
const SHUTDOWN_MS = 5000;

interface Live {
  tokens: Tokens;
  db: SupabaseClient;
  userId: string;
  machine: Machine;
  settings: Settings;
  events: Events;
  usage: Usage;
  uploads: RobloxUploads;
  channel: RealtimeChannel;
  timers: NodeJS.Timeout[];
}

export class Runner {
  private live: Live | null = null;
  private jobs = new Map<string, Job>();
  private cli = false;
  private lastError: string | null = null;
  private ticking = false;
  private again = false;
  private poke: NodeJS.Timeout | null = null;
  private sent = "";
  private note: string | null = null;
  private cliCheckedAt = 0;
  private cliDetail: string | null = null;

  private async checkCli(provider: Settings["provider"]) {
    const r = await cliFound(provider);
    this.cli = r.ok;
    this.cliDetail = r.detail;
    this.changed();
  }

  constructor(private onStatus: (s: RunnerStatus) => void) {}

  status(): RunnerStatus {
    const jobs = [...this.jobs.values()];
    return {
      running: !!this.live,
      machine_id: this.live?.machine.id ?? null,
      provider: this.live?.settings.provider ?? "claude",
      cli_found: this.cli,
      studios_open: this.studiosOpen,
      working: jobs.map(j => j.task.title),
      last_error: this.lastError,
      cli_detail: this.cliDetail,
      uploads: this.live ? this.live.uploads.state : null,
      lanes: jobs.filter(j => this.held.has(j.task.id)).map(j => ({ ...this.held.get(j.task.id)!, agent: j.task.agent, task: j.task.title, game_id: j.task.game_id })),
      note: this.live ? this.note : this.lastError ? "The crew couldn't start." : "The crew isn't running yet.",
    };
  }

  private changed() {
    const s = this.status();
    const json = JSON.stringify(s);
    if (json === this.sent) return;
    this.sent = json;
    this.onStatus(s);
  }

  private error(e: unknown) {
    this.lastError = e instanceof Error ? e.message : String(e);
    this.changed();
  }

  async start(auth: Auth): Promise<RunnerStatus> {
    const tokens = new Tokens(auth);
    if (this.live && this.live.userId === tokens.userId) {
      // Same person, the web app just refreshed its session.
      this.live.tokens.auth = auth;
      void this.live.db.realtime.setAuth(auth.accessToken);
      return this.status();
    }
    if (this.live) await this.stop();

    try {
      const userId = tokens.userId;
      const db = connect(tokens);
      const settings = await loadSettings(db, userId);
      const machine = await registerMachine(db, userId, settings.provider);
      await this.checkCli(settings.provider);

      // Anything left "working" on this computer is from a run that didn't shut down cleanly.
      await db.from("tasks").update({ status: "queued" }).eq("machine_id", machine.id).eq("status", "working");

      const live: Live = {
        tokens, db, userId, machine, settings,
        events: new Events(db, userId),
        usage: new Usage(db, userId),
        uploads: new RobloxUploads(db, () => this.changed()),
        channel: this.subscribe(db, userId),
        timers: [],
      };
      this.live = live;
      void this.checkConnectors();
      void frameServer();
      live.timers.push(
        setInterval(() => this.tick(), POLL_MS),
        setInterval(() => void heartbeat(db, machine.id, live.settings.provider).catch(e => this.error(e)), HEARTBEAT_MS),
        setInterval(() => void recordStats(db, userId).catch(() => {}), STATS_MS),
        setInterval(() => this.uploadAssets(), 30_000),
        setInterval(() => void this.watchStudios(), 10_000),
        setInterval(() => void this.autopilot().catch(() => {}), 10 * 60_000),
      );
      this.uploadAssets();
      void this.watchStudios();
      void recordStats(db, userId).catch(() => {});
      this.lastError = null;
      this.tick();
    } catch (e) {
      this.error(e);
    }
    this.changed();
    return this.status();
  }

  async stop() {
    const live = this.live;
    if (!live) return;
    this.live = null;
    live.timers.forEach(clearInterval);
    if (this.poke) clearTimeout(this.poke);
    await live.db.removeChannel(live.channel).catch(() => {});
    const jobs = [...this.jobs.values()];
    jobs.forEach(j => j.stop("shutdown"));
    await Promise.race([Promise.all(jobs.map(j => j.done)), new Promise(r => setTimeout(r, SHUTDOWN_MS))]);
    this.jobs.clear();
    await live.events.close().catch(() => {});
    this.changed();
  }

  private subscribe(db: SupabaseClient, userId: string): RealtimeChannel {
    const filter = `user_id=eq.${userId}`;
    return db
      .channel(`runner-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks", filter }, payload => {
        const row = payload.new as Partial<Task>;
        if (row?.id) this.watch(row.id, row.status);
        this.soon();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "settings", filter }, payload => {
        void this.settingsChanged(payload.new as Partial<Settings>);
      })
      .subscribe();
  }

  // The owner paused or dropped something we're running.
  private watch(id: string, status: Task["status"] | undefined) {
    const job = this.jobs.get(id);
    if (!job) return;
    const reason: StopReason | null = status === "dropped" ? "drop" : status === "queued" || status === "paused" ? "pause" : null;
    if (reason) job.stop(reason);
  }

  private async settingsChanged(row: Partial<Settings>) {
    const live = this.live;
    if (!live || !row?.user_id) return;
    const before = live.settings.provider;
    live.settings = withDefaults(live.userId, row);
    if (live.settings.provider !== before) await this.checkCli(live.settings.provider);
    void this.checkConnectors();
    this.changed();
    this.soon();
  }

  // Connectors can be switched on any time. If Claude Code or Codex doesn't actually
  // have that server, it gets switched back off so nobody waits on it.
  private checkingFor = "";
  private async checkConnectors() {
    const live = this.live;
    if (!live) return;
    const key = JSON.stringify([live.settings.provider, live.settings.connectors]);
    if (key === this.checkingFor) return;
    this.checkingFor = key;
    const found = await listServers(live.settings.provider);
    if (!found || this.live !== live) return;
    const connectors = { ...live.settings.connectors };
    for (const [id, on] of Object.entries(connectors)) {
      if (on && !serverFor(id, found)) connectors[id] = false;
    }
    this.checkingFor = JSON.stringify([live.settings.provider, connectors]);
    live.settings = { ...live.settings, connectors, mcp_found: found };
    await live.db.from("settings").update({ connectors, mcp_found: found }).eq("user_id", live.userId);
  }

  // Adds a connector's MCP server to the CLI, switches it on, and checks again.
  async connect(id: string): Promise<{ ok: boolean; detail: string }> {
    const live = this.live;
    if (!live) return { ok: false, detail: "Sign in on this computer first." };
    const r = await addServer(live.settings.provider, id);
    if (r.ok) {
      live.settings = { ...live.settings, connectors: { ...live.settings.connectors, [id]: true } };
      await live.db.from("settings").update({ connectors: live.settings.connectors }).eq("user_id", live.userId);
    }
    if (!r.ok) return r;
    await this.recheckConnectors();
    if (serverFor(id, this.live?.settings.mcp_found ?? null)) return { ok: true, detail: "Connected and switched on." };
    return {
      ok: false,
      detail: id === "figma"
        ? "Added, but the Figma app isn't answering yet. Turn on its desktop MCP server (Dev Mode, right panel), then hit Check again."
        : "Added, but it isn't answering yet. Start it, then hit Check again.",
    };
  }

  async recheckConnectors() {
    this.checkingFor = "";
    await this.checkConnectors();
    this.changed();
  }

  // Games on autopilot: when nothing is open on one and usage is on pace, the Lead looks at where
  // it stands and plans the next most useful work toward its goal. At most every 3 hours a game.
  private async autopilot() {
    const live = this.live;
    if (!live || !this.cli) return;
    const { db } = live;
    const { data } = await db.from("games").select("*").eq("autopilot", true);
    const games = (data ?? []) as Game[];
    if (!games.length) return;
    const window = await live.usage.current();
    const elapsed = windowElapsed(window.started_at);
    if (window.used > allowance(elapsed, live.settings.cap) || window.used > live.settings.cap - 0.15) return;
    for (const g of games) {
      const { count: open } = await db.from("tasks").select("id", { count: "exact", head: true }).eq("game_id", g.id).in("status", ["queued", "held", "working", "needs_you", "paused"]);
      if (open) continue;
      const { data: lastRun } = await db.from("tasks").select("created_at").eq("game_id", g.id).ilike("title", "Autopilot:%").order("created_at", { ascending: false }).limit(1);
      const last = (lastRun ?? [])[0] as { created_at: string } | undefined;
      if (last && Date.now() - Date.parse(last.created_at) < 3 * 3600_000) continue;
      await db.from("tasks").insert({
        user_id: live.userId, game_id: g.id, agent: "lead", title: `Autopilot: what's next for ${g.name}`,
        brief: `${g.name} is on autopilot. Nothing is open on it, so decide the next most valuable work and plan it.

Goal: ${g.goal?.trim() || "make it a game players come back to and spend in, one solid improvement at a time"}

Look at the crew report, the game's latest numbers, what the owner approved and sent back, and the lessons in the vault. Pick the 1 to 4 tasks that move the goal most right now (a fix players hit, the next feature, polish where reviews were weak, a playtest after big changes). Don't repeat finished work, don't start anything that spends Robux or publishes, and keep it small enough to finish this usage window. Say in two sentences why these.`,
        priority: "low", status: "queued", requested_by: "lead", parent_id: null, needs_studio: false, estimate: 0.02,
      });
      this.say(`Autopilot planning the next work for ${g.name}.`);
    }
  }

  private soon() {
    if (this.poke) clearTimeout(this.poke);
    this.poke = setTimeout(() => this.tick(), 400);
  }

  private tick() {
    if (this.ticking) {
      this.again = true;
      return;
    }
    this.ticking = true;
    this.schedule()
      .catch(e => this.error(e))
      .finally(() => {
        this.ticking = false;
        if (this.again) {
          this.again = false;
          this.tick();
        }
      });
  }

  // Real numbers for hundreds of games, written into the vault. Two callers at once share one pull.
  private pulling: Promise<PullResult> | null = null;
  pullGames(vault: string): Promise<PullResult> {
    this.pulling ??= (async () => {
      const before = this.note;
      try {
        const rows = await pullGames({ onProgress: p => this.say(`Pulling game data from Roblox. ${p}.`) });
        if (!rows.length) throw new Error("Roblox didn't send any games back. Check the internet and try again.");
        seedVault(vault);
        const result = writeGames(vault, rows);
        const live = this.live;
        if (live) {
          const items: MarketItem[] = rows.map(g => ({
            universe_id: g.universe_id, place_id: g.place_id, name: g.name, genre: g.genre, subgenre: g.subgenre, playing: g.playing,
            likes: g.like_ratio, like_ratio: g.like_ratio, visits: g.visits, favorites: g.favorites, age_days: g.age_days, updated: g.updated,
            max_players: g.max_players, lists: g.lists, icon: g.icon, quick: looksQuick(g), creator: g.creator,
          }));
          await live.db.from("market_snapshots").insert({ user_id: live.userId, source: "roblox", sort: "charts and searches", items });
          await live.db.from("market_snapshots").delete().eq("source", "roblox").lt("created_at", new Date(Date.now() - 14 * 864e5).toISOString());
        }
        return result;
      } finally {
        this.pulling = null;
        this.say(before);
      }
    })();
    return this.pulling;
  }

  // Real Studio windows, so the bar matches what's on screen. Shared through the machine row
  // so phones and the website see it too.
  private studiosOpen = 0;
  private async watchStudios() {
    const live = this.live;
    if (!live) return;
    const n = await countStudios();
    if (n === this.studiosOpen) return;
    this.studiosOpen = n;
    this.changed();
    await live.db.from("machines").update({ studios_open: n }).eq("id", live.machine.id);
  }

  // Which Studio each running agent has, by the name you gave it.
  private held = new Map<string, { lane: string; since: string }>();
  private pickLane(settings: Settings, task: Task): StudioLane | null {
    const taken = new Set([...this.held.values()].map(h => h.lane));
    const free = settings.studio.lanes.filter(l => !taken.has(l.name));
    return free.find(l => l.game_id && l.game_id === task.game_id) ?? free.find(l => !l.game_id) ?? free[0] ?? null;
  }

  // Only the computer doing the work uploads, so two machines don't both put a file on Roblox.
  private uploadAssets() {
    const live = this.live;
    if (!live || live.machine.role !== "worker") return;
    void live.uploads.tick(getKey("roblox_open_cloud"), getKey("roblox_creator")).catch(e => {
      live.uploads.state.error = (e as Error).message;
      this.changed();
    });
  }

  private say(note: string | null) {
    if (note === this.note) return;
    this.note = note;
    this.changed();
  }

  private async schedule() {
    const live = this.live;
    if (!live) return;
    const { db } = live;
    const name = live.settings.provider === "claude" ? "Claude Code" : "Codex";

    // Keep looking, so installing it while the app is open just works.
    if (!this.cli && Date.now() - this.cliCheckedAt > 60_000) {
      this.cliCheckedAt = Date.now();
      await this.checkCli(live.settings.provider);
    }
    if (!this.cli) {
      const install = live.settings.provider === "codex"
        ? "install the Codex app and sign in (RoSlop uses the copy inside it), or point at codex.exe in Settings, Computers and apps"
        : process.platform === "win32"
          ? "open PowerShell and run irm https://claude.ai/install.ps1 | iex, then run claude once to sign in"
          : "curl -fsSL https://claude.ai/install.sh | bash, then run claude once to sign in";
      return this.say(`${name} isn't working on this computer (${this.cliDetail ?? "not checked"}). If it's not installed: ${install}. Then hit Check again.`);
    }

    const { data: machines } = await db.from("machines").select("*");
    const all = (machines ?? []) as Machine[];
    const me = all.find(m => m.id === live.machine.id);
    if (me) live.machine = me;
    if (!shouldWork(me, all)) {
      const worker = all.find(m => m.id !== me?.id && m.role === "worker");
      return this.say(me?.role === "remote"
        ? "This computer is set to Remote only. Change it to Does the work in Settings, Computers and apps."
        : `This computer is the backup. ${worker?.name ?? "Your worker"} does the work while it's online. Switch roles in Settings, Computers and apps if this one should do it.`);
    }

    const { data, error } = await allRows(db.from("tasks").select("*").in("status", ["queued", "held", "working"]).order("created_at").order("id"));
    fail("Couldn't load tasks", error);
    const open = (data ?? []) as Task[];
    await this.checkJobs(open);

    const waiting = open.filter(t => t.status === "queued" || t.status === "held");
    if (!waiting.length) return this.say(null);

    const parentIds = [...new Set(waiting.map(t => t.parent_id).filter((id): id is string => !!id))];
    const { data: parents } = parentIds.length
      ? await db.from("tasks").select("id, status").in("id", parentIds)
      : { data: [] };
    const doneParents = new Set(((parents ?? []) as Pick<Task, "id" | "status">[]).filter(p => p.status === "done").map(p => p.id));

    const { data: past } = await db.from("tasks").select("agent, used, status").eq("status", "done").order("finished_at", { ascending: false }).limit(300);
    const history = ((past ?? []) as Pick<Task, "agent" | "used" | "status">[]).reverse();

    const window = await live.usage.current();
    const plan = decide({
      open,
      doneParents,
      settings: live.settings,
      elapsed: windowElapsed(window.started_at),
      used: window.used,
      studioSlots: live.settings.studio.limit ?? Math.max(live.settings.studio.lanes.length, 1),
      studioBusy: [...this.jobs.values()].filter(j => j.task.needs_studio).length,
      estimateFor: agent => estimate(agent, history),
    });

    if (plan.hold.length) await db.from("tasks").update({ status: "held" }).in("id", plan.hold.map(t => t.id)).eq("status", "queued");
    if (plan.unhold.length) await db.from("tasks").update({ status: "queued" }).in("id", plan.unhold.map(t => t.id)).eq("status", "held");

    for (const { task, estimate } of plan.start) await this.launch(live, task, estimate, history);

    const running = open.filter(t => t.status === "working").length + plan.start.length;
    const parentWait = waiting.filter(t => t.parent_id && !doneParents.has(t.parent_id)).length;
    if (running) {
      const why = [
        parentWait && `${parentWait} waiting on an earlier task`,
        plan.held.studio && `${plan.held.studio} waiting for a Studio slot (you allow ${live.settings.studio.limit ?? live.settings.studio.lanes.length} Studios, Settings, Studios)`,
        plan.held.agent && `${plan.held.agent} waiting for the same agent to finish in Studio`,
        plan.held.pace && `${plan.held.pace} held for usage pace`,
        plan.held.room && `${plan.held.room} waiting for a free spot`,
      ].filter(Boolean);
      const slowed = plan.limit < live.settings.max_agents ? ` Usage is ahead of pace, so it's running ${plan.limit} at a time instead of ${live.settings.max_agents} until it catches up.` : "";
      return this.say(running < live.settings.max_agents && (why.length || slowed) ? `${running} of ${live.settings.max_agents} running.${why.length ? ` ${why.join(", ")}.` : ""}${slowed}` : null);
    }
    // Held back by pace on a stale reading? Check the real numbers before making anyone wait.
    if (plan.wait !== undefined && live.settings.provider === "claude" && live.usage.stale) {
      void live.usage.probe().then(() => this.soon());
    }
    const blockedByParent = waiting.every(t => t.parent_id && !doneParents.has(t.parent_id));
    const left = Math.max(1, Math.ceil(WINDOW_MIN - windowElapsed(window.started_at)));
    const when = plan.wait === null
      ? `You've used ${Math.round(window.used * 100)}% of this 5 hour window and the cap is ${Math.round(live.settings.cap * 100)}%, so it waits for the window to reset in about ${left} min. You can raise the cap in Settings, Usage.`
      : `The next task starts in about ${Math.max(1, plan.wait ?? 1)} min. ${Math.round(window.used * 100)}% of this 5 hour window is used, and RoSlop spreads work out so it lasts the whole window.`;
    this.say(blockedByParent
      ? "Everything queued is waiting on an earlier task that hasn't finished."
      : `Pacing your usage. ${when}`);
  }

  // Catches pauses and drops if realtime missed them.
  private async checkJobs(open: Task[]) {
    const ids = [...this.jobs.keys()];
    if (!ids.length || !this.live) return;
    const working = new Set(open.filter(t => t.status === "working").map(t => t.id));
    const gone = ids.filter(id => !working.has(id));
    if (!gone.length) return;
    const { data } = await this.live.db.from("tasks").select("id, status").in("id", gone);
    for (const row of (data ?? []) as Pick<Task, "id" | "status">[]) this.watch(row.id, row.status);
  }

  private async launch(live: Live, task: Task, est: number, history: Pick<Task, "agent" | "used" | "status">[]) {
    const { db, events } = live;
    const answered = task.ask?.answer ? task.ask : null;

    // Claim it only if it's still waiting, so two computers never run the same task.
    const { data: claimed } = await db
      .from("tasks")
      .update({ status: "working", machine_id: live.machine.id, started_at: new Date().toISOString(), estimate: est, ask: null })
      .eq("id", task.id)
      .in("status", ["queued", "held"])
      .select()
      .maybeSingle();
    if (!claimed) return;
    if (task.agent === "pulse" && /^Acquisition pitch/.test(task.title)) {
      const priced = await priceBrief(claimed.brief as string, getKey("rowatcher")).catch(() => null);
      if (priced) {
        claimed.brief = priced.brief;
        events.add(task.id, "note", priced.note);
      }
    }

    if (answered) events.add(task.id, "note", `You answered: ${answered.answer}`);

    let game: Game | null = null;
    if (task.game_id) {
      const { data } = await db.from("games").select("*").eq("id", task.game_id).maybeSingle();
      game = data as Game | null;
    }
    // Vault work runs inside the vault. With no folder picked yet, start one in Documents.
    const vaultJob = isVaultTask(task as Task);
    const named = briefVault(task.brief);
    if (vaultJob && !named && !live.settings.vault_path) {
      const vault_path = join(app.getPath("documents"), "RoSlop Vault");
      live.settings = { ...live.settings, vault_path };
      await db.from("settings").update({ vault_path }).eq("user_id", live.userId);
    }
    const vault = named ?? live.settings.vault_path;
    if (vault) {
      try {
        seedVault(vault);
      } catch (e) {
        events.add(task.id, "error", `Couldn't set up the vault at ${vault}: ${(e as Error).message}`);
      }
    }
    // Imports from the Vault page are just downloads, so this computer does them without an agent.
    if (IMPORT_TITLE.test(task.title)) {
      const result = vault
        ? await runImport(db, vault, claimed.brief as string, t => events.add(task.id, "note", t)).catch(e => `Import failed: ${(e as Error).message}`)
        : "Pick a vault folder first.";
      await db.from("tasks").update({ status: "done", result, finished_at: new Date().toISOString(), used: 0 }).eq("id", task.id);
      this.changed();
      this.soon();
      return;
    }
    // Vault work runs on real numbers, so fetch today's if the vault doesn't have them yet.
    if (vaultJob && vault && task.agent === "lead" && latestPull(vault)?.day !== new Date().toISOString().slice(0, 10)) {
      events.add(task.id, "note", "Pulling real numbers for hundreds of Roblox games first.");
      await this.pullGames(vault).then(
        r => events.add(task.id, "note", `Sorted ${r.count} games into ${r.types} type notes. Charts note: ${r.charts}`),
        e => events.add(task.id, "error", `Couldn't pull game data: ${(e as Error).message}`),
      );
    }
    const cwd = vaultJob && vault ? vault : game?.project_path || join(app.getPath("userData"), "games", task.game_id ?? "general");
    mkdirSync(cwd, { recursive: true });
    await fetchRefs(db, task.brief, cwd).catch(e => events.add(task.id, "error", `Couldn't download the reference files: ${(e as Error).message}`));

    let stuff = await gatherStuff(db, claimed as Task, game, cwd, vault).catch(e => {
      events.add(task.id, "error", `Couldn't gather the Library and vault for this: ${(e as Error).message}`);
      return null;
    });
    // What this agent has learned from the owner's calls, the Art Director and its own notes.
    const memory = await memoryFor(db, claimed as Task, cwd, vault).catch(() => null);
    if (memory) stuff = [memory, stuff].filter(Boolean).join("\n\n");
    // Gameplay videos the owner wants things to look like, as frames, for anyone making visuals.
    const visual = ["scenic", "librarian", "splash", "director", "frame"].includes(task.agent) || (task.agent === "builder" && BUILD_WORDS.test(`${task.title} ${task.brief}`));
    // The game's kind comes from its Studio's setup, so styles saved for "RPG" reach RPG work.
    const kind = live.settings.studio.lanes.filter(l => l.game_id && l.game_id === task.game_id).map(l => l.type).join(" ");
    const videos = [...stylesFor(live.settings.style, `${kind} ${game?.name ?? ""} ${task.title} ${claimed.brief}`), ...(claimed.brief as string).match(/https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be|x\.com|twitter\.com|tiktok\.com|instagram\.com|vm\.tiktok\.com|streamable\.com|medal\.tv)\/\S+/gi) ?? []];
    if (visual && videos.length) {
      const lines = await styleRefs([...new Set(videos)], cwd, t => events.add(task.id, "note", t)).catch(() => [] as string[]);
      if (lines.length) {
        const style = ["## What it should look like", "Frames from the gameplay videos the owner picked as the target look. Before you start, Read at least 8 of them spread across every folder, write down the palette, scale, lighting, density and shapes you see, and match them. The owner's references and these frames win over the general bar.", ...lines].join("\n");
        stuff = [stuff, style].filter(Boolean).join("\n\n");
      }
    }
    const lane = task.needs_studio ? this.pickLane(live.settings, task as Task) : null;
    const crew = task.agent === "lead" ? await crewReport(db, task, [...this.jobs.values()].map(j => j.live())).catch(() => null) : null;
    const job = new Job(
      { crew, lane, stuff, db, userId: live.userId, settings: { ...live.settings, vault_path: vault }, events, usage: live.usage, keys: allKeys(), history },
      claimed as Task,
      game,
      cwd,
      answered,
    );
    this.jobs.set(task.id, job);
    if (lane) this.held.set(task.id, { lane: lane.name, since: new Date().toISOString() });
    job.start();
    this.changed();

    void job.done.then(() => {
      if (!vaultJob) void afterJob(db, live.userId, task.id, cwd).catch(e => events.add(task.id, "error", `Couldn't hand this to the Art Director: ${(e as Error).message}`));
      if (vaultJob && vault) {
        try {
          tidyLinks(vault);
        } catch {}
      }
      this.jobs.delete(task.id);
      this.held.delete(task.id);
      this.changed();
      this.soon();
    });
  }
}
