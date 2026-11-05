import type { SupabaseClient } from "@supabase/supabase-js";
import { AGENT, assetKind, carriedLines, modelFor, readSignals, stripPitches, stripPlan, tokensToWindow, type AgentId, type Ask, type Game, type Settings, type StudioLane, type Task } from "@roslop/core";
import type { ChildProcess } from "node:child_process";
import { rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { killTree, run } from "./cli";
import { claudeArgs, codexArgs, mcpConfig } from "./commands";
import { onServers } from "./mcp";
import { remember } from "./memory";
import { allRows, fail } from "./db";
import type { Events } from "./events";
import { saveMarket, savePitches } from "./market";
import { savePlan } from "./plan";
import { keyEnvName, systemPrompt } from "./prompt";
import { uploadPreview, uploadProof } from "./proofs";
import { sessions } from "./store";
import { isVaultTask } from "./vault";
import { claudeParser, codexParser, type Parser, type StreamEvent } from "./stream";
import type { Usage } from "./usage";

export type StopReason = "ask" | "pause" | "drop" | "shutdown";

export interface JobDeps {
  db: SupabaseClient;
  userId: string;
  settings: Settings;
  events: Events;
  usage: Usage;
  keys: Record<string, string>;
  history: Pick<Task, "agent" | "used" | "status">[];
  // The Lead gets a report on the whole crew with every message.
  crew?: string | null;
  lane?: StudioLane | null;
  // The owner's Library, references and vault notes picked out for this task.
  stuff?: string | null;
}

const STDERR_KEEP = 4000;

export class Job {
  readonly done: Promise<void>;
  private finish!: () => void;
  private child: ChildProcess | null = null;
  private parser: Parser;
  private provider: Settings["provider"];
  private stopped: StopReason | null = null;
  private ended = false;
  private ask: Ask | null = null;
  private summary: string | null = null;
  private tools: string[] = [];
  private lastText = "";

  // What this agent is up to right now, for the Lead's crew report.
  live() {
    return { task: this.task, said: this.lastText.slice(-600), tools: this.tools, since: this.startedAt };
  }
  private startedAt = Date.now();
  private finalText = "";
  private allText = "";
  private failedResult = false;
  private stderr = "";
  private uploads: Promise<void>[] = [];
  private proofPaths = new Set<string>();
  private mcpFile: string | null = null;

  constructor(
    private deps: JobDeps,
    readonly task: Task,
    private game: Game | null,
    private cwd: string,
    private answered: Ask | null,
  ) {
    this.provider = deps.settings.provider;
    this.parser = this.provider === "codex" ? codexParser() : claudeParser();
    this.done = new Promise(resolve => (this.finish = resolve));
  }

  start() {
    try {
      this.child = this.spawn();
    } catch (e) {
      void this.end(null, (e as Error).message);
      return;
    }
    const lines = createInterface({ input: this.child.stdout! });
    lines.on("line", line => {
      for (const ev of this.parser.read(line)) this.handle(ev);
    });
    this.child.stderr!.on("data", (chunk: Buffer) => {
      this.stderr = (this.stderr + chunk.toString()).slice(-STDERR_KEEP);
    });
    this.child.on("error", e => void this.end(null, e.message));
    this.child.on("close", code => void this.end(code));
  }

  stop(reason: StopReason) {
    if (this.stopped || this.ended) return;
    this.stopped = reason;
    if (this.child) killTree(this.child);
  }

  private spawn(): ChildProcess {
    const { settings, keys } = this.deps;
    const task = this.task;
    const system = [systemPrompt(task, this.game, this.cwd, settings, Object.keys(keys).map(keyEnvName), this.deps.lane ?? null), this.deps.stuff].filter(Boolean).join("\n\n");
    const brief = task.brief.trim() || task.title;
    const env = Object.fromEntries(Object.entries(keys).map(([id, v]) => [keyEnvName(id), v]));
    const model = modelFor(task.agent, this.provider);

    const crew = this.deps.crew ? `\n\n## The crew right now\n${this.deps.crew}` : "";
    if (this.provider === "codex") {
      let prompt = `${system}${crew}\n\n## Your task\n${brief}`;
      if (this.answered) prompt += `\n\nYou asked the owner: ${this.answered.question}\nThey answered: ${this.answered.answer}`;
      return run("codex", codexArgs(prompt, model), { cwd: this.cwd, env });
    }

    const session = sessions.get(task.id);
    let prompt = brief;
    if (session) prompt = this.answered ? `The owner answered: ${this.answered.answer}` : "Pick up where you left off.";
    else if (this.answered) prompt += `\n\nYou asked the owner: ${this.answered.question}\nThey answered: ${this.answered.answer}`;
    prompt += crew;

    if (settings.studio_mcp && task.needs_studio) {
      this.mcpFile = join(tmpdir(), `roslop-mcp-${task.id}.json`);
      writeFileSync(this.mcpFile, JSON.stringify(mcpConfig(settings.studio_mcp)));
    }

    return run("claude", claudeArgs({ prompt, system, model, resume: session, mcpConfig: this.mcpFile ?? undefined, servers: onServers(settings), addDirs: settings.vault_path && settings.vault_path !== this.cwd ? [settings.vault_path] : [] }), { cwd: this.cwd, env });
  }

  private handle(ev: StreamEvent) {
    const { events, usage } = this.deps;
    const id = this.task.id;
    if (ev.kind === "session") {
      if (this.provider === "claude") sessions.set(id, ev.id);
    } else if (ev.kind === "result") {
      this.finalText = ev.text;
      this.failedResult = ev.error;
    } else if (ev.kind === "limit") {
      void usage.raise(ev.used, ev.resets).catch(() => {});
    } else if (this.stopped) {
      return;
    } else if (ev.kind === "tool") {
      events.add(id, "tool", ev.name);
      this.tools = [...this.tools, ev.name].slice(-6);
    } else if (ev.kind === "text") {
      this.allText += ev.text + "\n";
      this.lastText = ev.text;
      events.note(id, ev.text);
      this.signals(ev.text);
    }
  }

  private signals(text: string) {
    for (const s of readSignals(text)) {
      if (s.kind === "done") this.summary = s.summary;
      if (s.kind === "preview") {
        const { db, userId, events } = this.deps;
        this.uploads.push(uploadPreview(db, userId, this.cwd, s.id, s.path).then(() => events.add(this.task.id, "note", "Preview saved to the Library"), e => events.add(this.task.id, "error", (e as Error).message)));
      }
      if (s.kind === "asset" && !this.assets.has(s.id)) {
        this.assets.add(s.id);
        this.uploads.push(this.asset(s));
      }
      if (s.kind === "proof" && !this.proofPaths.has(s.path)) {
        this.proofPaths.add(s.path);
        this.uploads.push(this.proof(s));
      }
      if (s.kind === "lesson" && !this.lessons.has(s.text) && this.lessons.size < 3) {
        this.lessons.add(s.text);
        try {
          remember(this.task.agent, s.text, this.task, this.deps.settings.vault_path);
          this.deps.events.add(this.task.id, "note", `Learned: ${s.text}`);
        } catch {}
      }
      if (s.kind === "handoff" && !this.handoffs.has(s.title) && this.handoffs.size < 3) {
        this.handoffs.add(s.title);
        this.uploads.push(this.handoff(s));
      }
      if (s.kind === "ask") {
        this.ask = { question: s.question, options: s.options };
        this.stop("ask");
        return;
      }
    }
  }

  private lessons = new Set<string>();
  private handoffs = new Set<string>();
  // An agent passed part of the job to another agent, the way a teammate would.
  private async handoff(h: { agent: AgentId; title: string; brief: string }) {
    const { db, userId, events } = this.deps;
    const from = AGENT[this.task.agent].name;
    const carry = carriedLines(this.task.brief);
    const { error } = await db.from("tasks").insert({
      user_id: userId, game_id: this.task.game_id, agent: h.agent, title: h.title.slice(0, 120),
      brief: `${h.brief}\n\n${from} handed this over while working on "${this.task.title}".${carry ? `\n\n${carry}` : ""}`,
      priority: this.task.priority, status: "queued", requested_by: this.task.agent, parent_id: null,
      needs_studio: AGENT[h.agent].studio, estimate: 0.03,
    });
    events.add(this.task.id, error ? "error" : "note", error ? `Couldn't hand over to ${AGENT[h.agent].name}: ${error.message}` : `Handed "${h.title}" to ${AGENT[h.agent].name}`);
  }

  private assets = new Set<string>();
  // An agent put a library item on Roblox. Match it by name, or add it if it's new.
  private async asset(a: { name: string; id: string }) {
    const { db, userId, events } = this.deps;
    try {
      // Agents sometimes tidy a name or keep the file extension, so match loosely.
      const norm = (s: string) => s.toLowerCase().replace(/\.[a-z0-9]+$/, "").replace(/[^a-z0-9]+/g, "");
      const want = norm(a.name);
      const { data } = await allRows<{ id: string; name: string; file_url: string | null }>(db.from("assets").select("id, name, file_url").is("roblox_id", null).order("created_at").order("id"));
      const rows = data ?? [];
      const file = (r: { file_url: string | null }) => norm((r.file_url ?? "").split("/").pop()?.replace(/^\d+-/, "") ?? "");
      const row = rows.find(r => norm(r.name) === want) ?? rows.find(r => file(r) === want) ?? rows.find(r => want.length > 3 && (norm(r.name).includes(want) || want.includes(norm(r.name))));
      if (row) await db.from("assets").update({ roblox_id: a.id }).eq("id", row.id);
      else await db.from("assets").insert({ user_id: userId, name: a.name, kind: assetKind(a.name), roblox_id: a.id, file_url: null, tags: [], game_id: this.task.game_id });
      events.add(this.task.id, "note", `${a.name} is on Roblox as ${a.id}`);
    } catch (e) {
      events.add(this.task.id, "error", (e as Error).message);
    }
  }

  private async proof(p: { path: string; title: string; note: string }) {
    const { db, userId, events } = this.deps;
    try {
      await uploadProof(db, userId, this.task, this.cwd, p);
      events.add(this.task.id, "proof", p.title);
    } catch (e) {
      events.add(this.task.id, "error", (e as Error).message);
    }
  }

  private async end(code: number | null, spawnError?: string) {
    if (this.ended) return;
    this.ended = true;
    const { db, userId, settings, events, usage } = this.deps;
    const task = this.task;

    await Promise.allSettled(this.uploads);
    if (this.mcpFile) rmSync(this.mcpFile, { force: true });

    const tokens = Math.round(this.parser.tokens());
    const fraction = tokensToWindow(tokens, settings.window_tokens);
    const used = task.used + fraction;
    await usage.add(tokens, fraction).catch(() => {});
    if (tokens > 0) events.add(task.id, "usage", `${(tokens / 1000).toFixed(1)}k tokens, ${(fraction * 100).toFixed(1)}% of the window`);

    const now = new Date().toISOString();
    const update = async (fields: Partial<Task>, onlyIfWorking = false) => {
      let q = db.from("tasks").update(fields).eq("id", task.id);
      if (onlyIfWorking) q = q.eq("status", "working");
      fail("Couldn't update the task", (await q).error);
    };

    try {
      if (this.stopped === "ask" && this.ask && (this.answered || isVaultTask(task) || this.deps.settings.savings.no_questions)) {
        // Already asked once on this task, or it's vault work: take the agent's own first pick and keep going.
        const pick = this.ask.options[0] ?? "Use your best judgement";
        events.add(task.id, "note", `Asked "${this.ask.question}" and went with: ${pick}`);
        await update({ status: "queued", ask: { ...this.ask, answer: `${pick} (picked automatically, keep going without asking again)` }, used });
      } else if (this.stopped === "ask") {
        await update({ status: "needs_you", ask: this.ask, used });
      } else if (this.stopped === "shutdown") {
        await update({ used, status: "queued" }, true);
      } else if (this.stopped) {
        await update({ used });
        if (this.stopped === "drop") sessions.set(task.id, undefined);
      } else if (code === 0 && !spawnError && !this.failedResult) {
        const text = this.finalText || this.allText;
        const result = this.summary ?? stripPitches(stripPlan(text)).replace(/```market[\s\S]*?```/, "").trim().slice(0, 2000);
        await update({ status: "done", result, finished_at: now, used });
        sessions.set(task.id, undefined);
        if (task.agent === "lead") {
          const plan = text.includes("```tasks") ? text : this.allText;
          await savePlan(db, userId, task, plan, this.deps.history);
        }
        if (task.agent === "pulse") {
          await saveMarket(db, userId, text.includes("```market") ? text : this.allText);
          const n = await savePitches(db, userId, text.includes("```pitch") ? text : this.allText);
          if (n) events.add(task.id, "note", `${n} pitch${n > 1 ? "es" : ""} added to Pitches`);
        }
      } else {
        await update({ status: "failed", finished_at: now, used });
        sessions.set(task.id, undefined);
        events.add(task.id, "error", this.why(code, spawnError));
      }
    } catch (e) {
      events.add(task.id, "error", (e as Error).message);
    }
    this.finish();
  }

  private why(code: number | null, spawnError?: string): string {
    if (spawnError) return spawnError;
    const tail = this.stderr.trim().split("\n").slice(-6).join("\n");
    const text = (this.failedResult && this.finalText) || tail || `Stopped with exit code ${code}`;
    // The desktop Claude app and the command line keep separate sign-ins.
    if (/log ?in|api key|authenticat|credential|unauthori[sz]ed/i.test(text)) {
      const fix = this.provider === "codex" ? "Open the Codex app and sign in" : "Open Command Prompt, run claude and sign in";
      return `${text}\n\nIt isn't signed in on this computer. ${fix}, then retry the task.`;
    }
    return text;
  }
}
