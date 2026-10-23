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

// MCP servers for the connectors the owner has switched on.
export function onServers(settings: Settings): string[] {
  return Object.entries(settings.connectors)
    .filter(([, on]) => on)
    .map(([id]) => serverFor(id, settings.mcp_found))
    .filter((n): n is string => !!n);
}
