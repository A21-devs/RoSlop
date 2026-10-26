import { serverFor, type Provider, type Settings } from "@roslop/core";
import { homedir } from "node:os";
import { run } from "./cli";

// Server names from `claude mcp list` / `codex mcp list`, minus the ones that failed to connect.
// null means the CLI couldn't be asked at all.
export function listServers(provider: Provider): Promise<string[] | null> {
  return new Promise(done => {
    let out = "";
    try {
      const child = run(provider, ["mcp", "list"], { cwd: homedir() });
      const timer = setTimeout(() => child.kill(), 45000);
      child.stdout?.on("data", d => (out += d));
      child.on("error", () => done(null));
      child.on("exit", code => {
        clearTimeout(timer);
        done(code === 0 ? parse(out) : null);
      });
    } catch {
      done(null);
    }
  });
}

// Lines look like "figma: https://mcp.figma.com/mcp (HTTP) - ✓ Connected". Names can have spaces
// and colons ("claude.ai Figma", "plugin:figma:figma"), so take everything before the first ": ".
// Servers that still need signing in come back as "auth:<name>" so Settings can say so.
export function parse(out: string): string[] {
  const names: string[] = [];
  for (const raw of out.split("\n")) {
    const line = raw.trim();
    const m = line.match(/^(.+?):\s+\S.*?\s-\s+(.+)$/);
    if (!m) continue;
    const [, name, state] = m;
    if (/auth/i.test(state)) names.push(`auth:${name}`);
    else if (!/fail|✗|×|not connected|error|disabled/i.test(state)) names.push(name);
  }
  if (names.length) return names;
  // Codex prints a table instead: the name is the first column.
  return out
    .split("\n")
    .map(l => l.trim())
    .filter(l => l && !/failed|✗|not connected|checking|^name\b|no mcp servers/i.test(l))
    .map(l => l.split(/\s{2,}|\s\|\s|\t/)[0])
    .filter(n => /^[\w.:-]+$/.test(n));
}

// One-click setups. Figma goes through the Figma desktop app's own MCP server, which needs no
// separate sign-in. Added for the user, so every folder a task runs in sees it.
const PRESETS: Record<string, string[]> = {
  figma: ["--transport", "http", "figma-desktop", "http://127.0.0.1:3845/mcp"],
  blender: ["blender", "--", "uvx", "blender-mcp"],
};

export function addServer(provider: Provider, id: string): Promise<{ ok: boolean; detail: string }> {
  const preset = PRESETS[id];
  if (!preset) return Promise.resolve({ ok: false, detail: `RoSlop can't add ${id} by itself yet.` });
  if (provider !== "claude") return Promise.resolve({ ok: false, detail: "Adding it for you only works with Claude Code. In Codex, add it with codex mcp add." });
  return new Promise(done => {
    let out = "";
    try {
      const child = run(provider, ["mcp", "add", "-s", "user", ...preset], { cwd: homedir() });
      child.stdout?.on("data", d => (out += d));
      child.stderr?.on("data", d => (out += d));
      child.on("error", e => done({ ok: false, detail: e.message }));
      child.on("exit", code => done({ ok: code === 0 || /already exists/i.test(out), detail: out.trim().slice(0, 300) }));
    } catch (e) {
      done({ ok: false, detail: (e as Error).message });
    }
  });
}

// The Roblox Studio server goes by different names depending on how it was added.
const STUDIO_NAMES = ["Roblox_Studio", "roblox_studio", "roblox-studio", "RobloxStudio", "robloxstudio", "roblox"];

// MCP servers the crew may use without asking: the connectors switched on, plus Roblox Studio
// under whatever name it was set up with. -p runs can't show a permission prompt.
export function onServers(settings: Settings): string[] {
  const found = settings.mcp_found ?? [];
  const on = Object.entries(settings.connectors)
    .filter(([, on]) => on)
    .map(([id]) => serverFor(id, settings.mcp_found));
  const studio = [...found.filter(n => !n.startsWith("auth:") && /roblox|studio/i.test(n)), ...STUDIO_NAMES];
  return [...new Set([...on, ...studio].filter((n): n is string => !!n))];
}
