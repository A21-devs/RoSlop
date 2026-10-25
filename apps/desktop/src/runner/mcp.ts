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

function parse(out: string): string[] {
  return out
    .split("\n")
    .map(l => l.trim())
    .filter(l => l && !/failed|✗|not connected|checking|^name\b|no mcp servers/i.test(l))
    .map(l => l.split(/[:\s|]/)[0])
    .filter(n => /^[\w.-]+$/.test(n));
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
  const studio = [...found.filter(n => /roblox|studio/i.test(n)), ...STUDIO_NAMES];
  return [...new Set([...on, ...studio].filter((n): n is string => !!n))];
}
