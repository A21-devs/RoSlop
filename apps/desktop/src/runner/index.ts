import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { app } from "electron";
import { estimate, serverFor, windowElapsed, type Game, type Machine, type RunnerStatus, type Settings, type Task } from "@roslop/core";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { allKeys } from "../keys";
import { cliFound } from "./cli";
import { listServers } from "./mcp";
import { connect, fail, loadSettings, Tokens, withDefaults, type Auth } from "./db";
import { Events } from "./events";
import { Job, type StopReason } from "./job";
import { heartbeat, registerMachine, shouldWork, STUDIO_SLOTS } from "./machine";
import { decide } from "./schedule";
import { recordStats } from "./stats";
import { Usage } from "./usage";

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

  constructor(private onStatus: (s: RunnerStatus) => void) {}

  status(): RunnerStatus {
    const jobs = [...this.jobs.values()];
    return {
      running: !!this.live,
      machine_id: this.live?.machine.id ?? null,
      provider: this.live?.settings.provider ?? "claude",
      cli_found: this.cli,
      studios_open: jobs.filter(j => j.task.needs_studio).length,
      working: jobs.map(j => j.task.title),
      last_error: this.lastError,
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
      this.cli = await cliFound(settings.provider);

      // Anything left "working" on this computer is from a run that didn't shut down cleanly.
      await db.from("tasks").update({ status: "queued" }).eq("machine_id", machine.id).eq("status", "working");

      const live: Live = {
        tokens, db, userId, machine, settings,
        events: new Events(db, userId),
        usage: new Usage(db, userId),
        channel: this.subscribe(db, userId),
        timers: [],
      };
      this.live = live;
      void this.checkConnectors();
      live.timers.push(
        setInterval(() => this.tick(), POLL_MS),
        setInterval(() => void heartbeat(db, machine.id, live.settings.provider).catch(e => this.error(e)), HEARTBEAT_MS),
        setInterval(() => void recordStats(db, userId).catch(() => {}), STATS_MS),
      );
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
    if (live.settings.provider !== before) this.cli = await cliFound(live.settings.provider);
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
      this.cli = await cliFound(live.settings.provider);
    }
    if (!this.cli) {
      const install = live.settings.provider === "claude" ? "npm install -g @anthropic-ai/claude-code, then run claude once to sign in" : "npm install -g @openai/codex, then run codex login";
      return this.say(`${name} isn't installed on this computer, or I can't find it. In a terminal: ${install}. Then hit Check again.`);
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

    const { data, error } = await db.from("tasks").select("*").in("status", ["queued", "held", "working"]).order("created_at");
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
      recentRate: await live.usage.recentRate(),
      studioSlots: live.machine.studio_slots || STUDIO_SLOTS,
      studioBusy: [...this.jobs.values()].filter(j => j.task.needs_studio).length,
      estimateFor: agent => estimate(agent, history),
    });

    if (plan.hold.length) await db.from("tasks").update({ status: "held" }).in("id", plan.hold.map(t => t.id)).eq("status", "queued");
    if (plan.unhold.length) await db.from("tasks").update({ status: "queued" }).in("id", plan.unhold.map(t => t.id)).eq("status", "held");

    for (const { task, estimate } of plan.start) await this.launch(live, task, estimate, history);

    const running = open.filter(t => t.status === "working").length + plan.start.length;
    if (running) return this.say(null);
    const blockedByParent = waiting.every(t => t.parent_id && !doneParents.has(t.parent_id));
    this.say(blockedByParent
      ? "Everything queued is waiting on an earlier task that hasn't finished."
      : plan.hold.length || waiting.some(t => t.status === "held")
        ? "Holding off so you don't run out of usage this window. It picks back up on its own."
        : "Waiting for room in your usage window. It starts on its own.");
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

    if (answered) events.add(task.id, "note", `You answered: ${answered.answer}`);

    let game: Game | null = null;
    if (task.game_id) {
      const { data } = await db.from("games").select("*").eq("id", task.game_id).maybeSingle();
      game = data as Game | null;
    }
    const cwd = game?.project_path || join(app.getPath("userData"), "games", task.game_id ?? "general");
    mkdirSync(cwd, { recursive: true });

    const job = new Job(
      { db, userId: live.userId, settings: live.settings, events, usage: live.usage, keys: allKeys(), history },
      claimed as Task,
      game,
      cwd,
      answered,
    );
    this.jobs.set(task.id, job);
    job.start();
    this.changed();

    void job.done.then(() => {
      this.jobs.delete(task.id);
      this.changed();
      this.soon();
    });
  }
}
