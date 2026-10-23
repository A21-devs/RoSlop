import { execFile, spawn, type ChildProcess } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { delimiter, dirname, join, resolve } from "node:path";
import type { Provider } from "@roslop/core";

const win = process.platform === "win32";

// Apps opened from Finder get a bare PATH, so borrow the login shell's and add the usual spots.
export async function fixPath() {
  const extra = win
    ? [join(process.env.APPDATA ?? "", "npm"), join(homedir(), ".local", "bin")]
    : [join(homedir(), ".local/bin"), join(homedir(), ".claude/local"), "/opt/homebrew/bin", "/usr/local/bin", join(homedir(), ".npm-global/bin")];
  let shellPath = "";
  if (process.platform === "darwin" && process.env.SHELL) {
    shellPath = await new Promise<string>(done => {
      execFile(process.env.SHELL!, ["-ilc", "echo -n \"__P__$PATH__P__\""], { timeout: 4000 }, (_, out) => {
        done(String(out ?? "").match(/__P__(.*)__P__/)?.[1] ?? "");
      });
    });
  }
  const parts = [...(process.env.PATH ?? "").split(delimiter), ...shellPath.split(delimiter), ...extra].filter(Boolean);
  process.env.PATH = [...new Set(parts)].join(delimiter);
}

function which(name: string): string | null {
  const exts = win ? [".exe", ".cmd", ""] : [""];
  for (const dir of (process.env.PATH ?? "").split(delimiter)) {
    for (const ext of exts) {
      const p = join(dir, name + ext);
      if (dir && existsSync(p)) return p;
    }
  }
  return null;
}

interface Command {
  file: string;
  prefix: string[];
  env: Record<string, string>;
}

// npm installs .cmd shims on Windows, which can't be spawned without a shell, and a shell
// mangles long multi-line prompts. So read the shim and run its script with Electron's own node.
function resolveCommand(name: Provider): Command | null {
  const found = which(name);
  if (!found) return null;
  if (win && found.toLowerCase().endsWith(".cmd")) {
    const script = readFileSync(found, "utf8").match(/"%~?dp0%?\\([^"]+\.js)"/i)?.[1];
    if (!script) return null;
    return { file: process.execPath, prefix: [resolve(dirname(found), script)], env: { ELECTRON_RUN_AS_NODE: "1" } };
  }
  return { file: found, prefix: [], env: {} };
}

export function run(name: Provider, args: string[], opts: { cwd: string; env?: Record<string, string> }): ChildProcess {
  const cmd = resolveCommand(name);
  if (!cmd) throw new Error(`Couldn't find ${name} on this computer.`);
  const env = { ...process.env, ...cmd.env, ...opts.env };
  if (!cmd.env.ELECTRON_RUN_AS_NODE) delete env.ELECTRON_RUN_AS_NODE;
  return spawn(cmd.file, [...cmd.prefix, ...args], { cwd: opts.cwd, env, stdio: ["ignore", "pipe", "pipe"], windowsHide: true, detached: !win });
}

export function cliFound(name: Provider): Promise<boolean> {
  return new Promise(done => {
    try {
      const child = run(name, ["--version"], { cwd: homedir() });
      const timer = setTimeout(() => child.kill(), 10000);
      child.on("error", () => done(false));
      child.on("exit", code => {
        clearTimeout(timer);
        done(code === 0);
      });
    } catch {
      done(false);
    }
  });
}

export function killTree(child: ChildProcess) {
  if (child.exitCode !== null || !child.pid) return;
  if (win) execFile("taskkill", ["/pid", String(child.pid), "/t", "/f"], () => {});
  else {
    // detached, so the negative pid takes the tools it started down with it
    try {
      process.kill(-child.pid, "SIGTERM");
    } catch {
      child.kill("SIGTERM");
    }
  }
}
