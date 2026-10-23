// Both CLIs print one JSON object per line. Their shapes change between versions,
// so everything here is read loosely and anything unknown is ignored.

export type StreamEvent =
  | { kind: "session"; id: string }
  | { kind: "text"; text: string }
  | { kind: "tool"; name: string }
  | { kind: "result"; text: string; error: boolean }
  | { kind: "limit"; used: number | null; resets: number | null };

export interface Parser {
  read(line: string): StreamEvent[];
  tokens(): number;
}

type Json = Record<string, any>;

function parse(line: string): Json | null {
  const t = line.trim();
  if (!t.startsWith("{")) return null;
  try {
    const v = JSON.parse(t);
    return v && typeof v === "object" ? v : null;
  } catch {
    return null;
  }
}

const num = (v: unknown) => (typeof v === "number" && isFinite(v) ? v : 0);

// Cache reads are cheap against the plan limits, so they count for a tenth.
function claudeUsage(u: Json | undefined): number {
  if (!u) return 0;
  return num(u.input_tokens) + num(u.output_tokens) + num(u.cache_creation_input_tokens) + num(u.cache_read_input_tokens) * 0.1;
}

function codexUsage(u: Json | undefined): number {
  if (!u) return 0;
  const cached = num(u.cached_input_tokens);
  return Math.max(0, num(u.input_tokens) - cached) + cached * 0.1 + num(u.output_tokens);
}

const LIMIT_KEYS = ["utilization", "used_percent", "used_percentage", "percent_used", "usage"];

// Looks for something like { rateLimitType: "five_hour", utilization: 0.42 } anywhere in the line.
// When the five hour window resets, as ms since epoch.
function findReset(v: unknown, depth = 0): number | null {
  if (!v || typeof v !== "object" || depth > 4) return null;
  const o = v as Json;
  const type = String(o.rateLimitType ?? o.rate_limit_type ?? o.type ?? "").toLowerCase();
  if (/seven|week|opus|sonnet/.test(type)) return null;
  for (const k of ["resetsAt", "resets_at", "resetAt", "reset_at"]) {
    const r = o[k];
    const ms = typeof r === "number" ? (r < 1e12 ? r * 1000 : r) : typeof r === "string" ? Date.parse(r) : NaN;
    if (ms > 0) return ms;
  }
  for (const [k, child] of Object.entries(o)) {
    if (k === "message" || k === "content" || Array.isArray(child)) continue;
    const found = findReset(child, depth + 1);
    if (found !== null) return found;
  }
  return null;
}

function findLimit(v: unknown, depth = 0): number | null {
  if (!v || typeof v !== "object" || depth > 4) return null;
  const o = v as Json;
  const type = String(o.rateLimitType ?? o.rate_limit_type ?? o.type ?? "").toLowerCase();
  const minutes = num(o.window_minutes);
  if (/seven|week|opus|sonnet/.test(type) || (minutes > 0 && minutes !== 300)) return null;
  for (const k of LIMIT_KEYS) {
    if (typeof o[k] === "number") {
      const n = o[k] > 1 ? o[k] / 100 : o[k];
      if (n >= 0 && n <= 1) return n;
    }
  }
  for (const [k, child] of Object.entries(o)) {
    if (k === "message" || k === "content" || Array.isArray(child)) continue;
    const found = findLimit(child, depth + 1);
    if (found !== null) return found;
  }
  return null;
}

export function claudeParser(): Parser {
  const perMessage = new Map<string, number>();
  let resultTokens = 0;
  let session = "";
  return {
    tokens: () => Math.max(resultTokens, [...perMessage.values()].reduce((a, b) => a + b, 0)),
    read(line) {
      const o = parse(line);
      if (!o) return [];
      const out: StreamEvent[] = [];
      if (typeof o.session_id === "string" && o.session_id !== session) {
        session = o.session_id;
        out.push({ kind: "session", id: session });
      }
      if (o.type === "assistant" && o.message) {
        const m = o.message;
        // one message can arrive in several lines with the same usage, so key it by id
        if (m.usage) perMessage.set(m.id ?? String(perMessage.size), claudeUsage(m.usage));
        for (const block of Array.isArray(m.content) ? m.content : []) {
          if (block?.type === "text" && typeof block.text === "string") out.push({ kind: "text", text: block.text });
          if (block?.type === "tool_use") out.push({ kind: "tool", name: String(block.name ?? "tool") });
        }
      } else if (o.type === "result") {
        resultTokens = claudeUsage(o.usage);
        out.push({ kind: "result", text: typeof o.result === "string" ? o.result : "", error: !!o.is_error || (!!o.subtype && o.subtype !== "success") });
      } else if (typeof o.type === "string" && o.type.includes("rate_limit")) {
        const used = findLimit(o);
        const resets = findReset(o);
        if (used !== null || resets !== null) out.push({ kind: "limit", used, resets });
      }
      return out;
    },
  };
}

export function codexParser(): Parser {
  let turns = 0;
  let total = 0;
  let last = "";
  return {
    tokens: () => Math.max(turns, total),
    read(line) {
      const o = parse(line);
      if (!o) return [];
      const out: StreamEvent[] = [];
      const msg: Json = o.msg && typeof o.msg === "object" ? o.msg : o;
      const item: Json | undefined = o.item;
      const text = (t: unknown) => {
        if (typeof t === "string" && t.trim()) {
          last = t;
          out.push({ kind: "text", text: t });
        }
      };

      if (typeof o.thread_id === "string") out.push({ kind: "session", id: o.thread_id });
      if (o.type === "item.completed" && item) {
        if (item.type === "agent_message") text(item.text);
        else if (item.type === "command_execution") out.push({ kind: "tool", name: "shell" });
        else if (item.type === "file_change") out.push({ kind: "tool", name: "edit" });
        else if (item.type === "mcp_tool_call") out.push({ kind: "tool", name: String(item.tool ?? "mcp") });
        else if (item.type === "web_search") out.push({ kind: "tool", name: "web search" });
      } else if (o.type === "turn.completed") {
        turns += codexUsage(o.usage);
      } else if (o.type === "turn.failed" || o.type === "error") {
        out.push({ kind: "result", text: String(o.error?.message ?? o.message ?? "Codex hit an error"), error: true });
      } else if (msg.type === "agent_message") {
        text(msg.message);
      } else if (msg.type === "exec_command_begin") {
        out.push({ kind: "tool", name: "shell" });
      } else if (msg.type === "token_count") {
        const info = msg.info ?? msg;
        if (info.total_token_usage) total = codexUsage(info.total_token_usage);
      } else if (msg.type === "task_complete") {
        out.push({ kind: "result", text: String(msg.last_agent_message ?? last), error: false });
      }

      if (o.rate_limits || msg.rate_limits) {
        const used = findLimit(o.rate_limits ?? msg.rate_limits);
        const resets = findReset(o.rate_limits ?? msg.rate_limits);
        if (used !== null || resets !== null) out.push({ kind: "limit", used, resets });
      }
      return out;
    },
  };
}
