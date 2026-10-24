import { AGENT } from "./agents";
import type { AgentId, MarketItem, Priority } from "./types";

// Agents talk back to the app with plain lines in their output:
//   ASK: Which layout? | A | B
//   PROOF: shots/shop-b.png | Phone shop, option B | Buy button sits under your thumb
//   DONE: Lava now ticks 20 dmg every 0.5s, weekly reset uses os.time
//   ASSET: Gem | 14520198334   (a library item is on Roblox now)
// The Lead also ends its reply with a ```tasks block of JSON.

export type Signal =
  | { kind: "ask"; question: string; options: string[] }
  | { kind: "proof"; path: string; title: string; note: string }
  | { kind: "done"; summary: string }
  | { kind: "asset"; name: string; id: string };

export function readSignal(line: string): Signal | null {
  const m = line.trim().match(/^(ASK|PROOF|DONE|ASSET):\s*(.+)$/);
  if (!m) return null;
  const parts = m[2].split("|").map(p => p.trim()).filter(Boolean);
  if (m[1] === "ASK") return { kind: "ask", question: parts[0], options: parts.slice(1) };
  if (m[1] === "ASSET") {
    const id = parts[1]?.match(/\d{5,}/)?.[0];
    return id ? { kind: "asset", name: parts[0], id } : null;
  }
  if (m[1] === "PROOF") return { kind: "proof", path: parts[0], title: parts[1] ?? "Proof", note: parts[2] ?? "" };
  return { kind: "done", summary: m[2].trim() };
}

export function readSignals(text: string): Signal[] {
  return text.split("\n").map(readSignal).filter((s): s is Signal => s !== null);
}

export interface PlannedTask {
  agent: AgentId;
  title: string;
  brief: string;
  priority: Priority;
  after?: number[];
}

export function readPlan(text: string): PlannedTask[] {
  const m = text.match(/```tasks\s*([\s\S]*?)```/);
  if (!m) return [];
  let raw: unknown;
  try {
    raw = JSON.parse(m[1]);
  } catch {
    return [];
  }
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((t): t is Record<string, unknown> => !!t && typeof t === "object")
    .filter(t => typeof t.agent === "string" && t.agent in AGENT && typeof t.title === "string")
    .map(t => ({
      agent: t.agent as AgentId,
      title: String(t.title),
      brief: typeof t.brief === "string" ? t.brief : "",
      priority: t.priority === "high" || t.priority === "low" ? t.priority : "normal",
      after: Array.isArray(t.after) ? t.after.filter((n): n is number => typeof n === "number") : undefined,
    }));
}

// Pulse hands chart pulls back as a ```market block: { "sort": "...", "items": [...] }
export function readMarket(text: string): { sort: string; items: MarketItem[] } | null {
  const m = text.match(/```market\s*([\s\S]*?)```/);
  if (!m) return null;
  try {
    const raw = JSON.parse(m[1]);
    const items: MarketItem[] = (Array.isArray(raw.items) ? raw.items : [])
      .filter((i: unknown): i is Record<string, unknown> => !!i && typeof i === "object" && typeof (i as { name?: unknown }).name === "string")
      .map((i: Record<string, unknown>) => ({
        universe_id: typeof i.universe_id === "number" ? i.universe_id : null,
        name: String(i.name),
        genre: typeof i.genre === "string" ? i.genre : "",
        playing: Number(i.playing) || 0,
        likes: typeof i.likes === "number" ? i.likes : null,
      }));
    return items.length ? { sort: typeof raw.sort === "string" ? raw.sort : "rising", items } : null;
  } catch {
    return null;
  }
}

// What the Lead says to you, without the tasks block.
export function stripPlan(text: string): string {
  return text.replace(/```tasks[\s\S]*?```/, "").trim();
}

// Which Library tab a file belongs in, from its name.
export function assetKind(name: string, mime = ""): "icon" | "model" | "sound" | "vfx" | "ui" {
  const n = name.toLowerCase();
  if (/\.(fbx|obj|rbxm|rbxmx|glb|gltf|blend|dae|stl)$/.test(n)) return "model";
  if (/^audio\//.test(mime) || /\.(mp3|ogg|wav|flac|m4a)$/.test(n) || /(^|[^a-z])(sfx|sound|music|audio)([^a-z]|$)/.test(n)) return "sound";
  if (/vfx|fx[_\- .]|particle|effect|flipbook|spritesheet|explosion|smoke|fire|flame|spark|trail|beam|aura|glow|slash|impact|magic|lightning|shockwave/.test(n)) return "vfx";
  if (/(^|[^a-z])(ui|gui|hud)([^a-z]|$)|button|btn|frame|menu|panel|window|popup|shop|bar|slot|inventory|screen|layout|tab|card|badge|banner|title/.test(n)) return "ui";
  if (/model|mesh|prop|rig|character/.test(n)) return "model";
  return "icon";
}

// Lines a brief carries down to the tasks the Lead splits it into.
export function carriedLines(brief: string): string {
  const keep: string[] = [];
  for (const re of [/^Vault folder: .+$/m, /^Reference files: .+$/m, /^Model rules \(this task only\):\n(?:- .+\n?)+/m]) {
    const m = brief.match(re);
    if (m) keep.push(m[0].trim());
  }
  return keep.join("\n\n");
}
