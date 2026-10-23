import type { SupabaseClient } from "@supabase/supabase-js";
import { modelFor, readSignals, stripPlan, tokensToWindow, type Ask, type Game, type Settings, type Task } from "@roslop/core";
import type { ChildProcess } from "node:child_process";
import { rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { killTree, run } from "./cli";
import { claudeArgs, codexArgs, mcpConfig } from "./commands";
import { onServers } from "./mcp";
import { fail } from "./db";
import type { Events } from "./events";
import { saveMarket } from "./market";
import { savePlan } from "./plan";
import { keyEnvName, systemPrompt } from "./prompt";
import { uploadProof } from "./proofs";
import { sessions } from "./store";
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
    const system = systemPrompt(task, this.game, this.cwd, settings, Object.keys(keys).map(keyEnvName));
    const brief = task.brief.trim() || task.title;
    const env = Object.fromEntries(Object.entries(keys).map(([id, v]) => [keyEnvName(id), v]));
    const model = modelFor(task.agent, this.provider);

    if (this.provider === "codex") {
      let prompt = `${system}\n\n## Your task\n${brief}`;
      if (this.answered) prompt += `\n\nYou asked the owner: ${this.answered.question}\nThey answered: ${this.answered.answer}`;
      return run("codex", codexArgs(prompt, model), { cwd: this.cwd, env });
    }

    const session = sessions.get(task.id);
    let prompt = brief;
    if (session) prompt = this.answered ? `The owner answered: ${this.answered.answer}` : "Pick up where you left off.";
    else if (this.answered) prompt += `\n\nYou asked the owner: ${this.answered.question}\nThey answered: ${this.answered.answer}`;

    if (settings.studio_mcp && task.needs_studio) {
      this.mcpFile = join(tmpdir(), `roslop-mcp-${task.id}.json`);
      writeFileSync(this.mcpFile, JSON.stringify(mcpConfig(settings.studio_mcp)));
    }

    return run("claude", claudeArgs({ prompt, system, model, resume: session, mcpConfig: this.mcpFile ?? undefined, servers: onServers(settings) }), { cwd: this.cwd, env });
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
      void usage.raise(ev.used).catch(() => {});
    } else if (this.stopped) {
      return;
    } else if (ev.kind === "tool") {
      events.add(id, "tool", ev.name);
    } else if (ev.kind === "text") {
      this.allText += ev.text + "\n";
      events.note(id, ev.text);
      this.signals(ev.text);
    }
  }

  private signals(text: string) {
    for (const s of readSignals(text)) {
      if (s.kind === "done") this.summary = s.summary;
      if (s.kind === "proof" && !this.proofPaths.has(s.path)) {
        this.proofPaths.add(s.path);
        this.uploads.push(this.proof(s));
      }
      if (s.kind === "ask") {
        this.ask = { question: s.question, options: s.options };
        this.stop("ask");
        return;
      }
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
      if (this.stopped === "ask") {
        await update({ status: "needs_you", ask: this.ask, used });
      } else if (this.stopped === "shutdown") {
        await update({ used, status: "queued" }, true);
      } else if (this.stopped) {
        await update({ used });
        if (this.stopped === "drop") sessions.set(task.id, undefined);
      } else if (code === 0 && !spawnError && !this.failedResult) {
        const text = this.finalText || this.allText;
        const result = this.summary ?? stripPlan(text).replace(/```market[\s\S]*?```/, "").trim().slice(0, 2000);
        await update({ status: "done", result, finished_at: now, used });
        sessions.set(task.id, undefined);
        if (task.agent === "lead") {
          const plan = text.includes("```tasks") ? text : this.allText;
          await savePlan(db, userId, task, plan, this.deps.history);
        }
        if (task.agent === "pulse") await saveMarket(db, userId, text.includes("```market") ? text : this.allText);
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
      return `${text}\n\nThe command line isn't signed in on this computer. Open Command Prompt, run claude, sign in, then retry the task.`;
    }
    return text;
  }
}
