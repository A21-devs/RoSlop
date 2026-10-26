// What the desktop app exposes to the web UI as `window.roslop`.
// On the website and phones it's missing, and the UI acts as a remote.

import type { AppEntry, Provider } from "./types";

export interface RunnerStatus {
  running: boolean;
  machine_id: string | null;
  provider: Provider;
  cli_found: boolean;
  studios_open: number;
  working: string[];
  last_error: string | null;
  // What we found when we looked for the CLI: version and path, or why it failed.
  cli_detail: string | null;
  // Plain words on why nothing is starting, when that's the case.
  note: string | null;
  // Library files going up to Roblox through Open Cloud.
  uploads: { left: number; done: number; error: string | null } | null;
  // Which Studio each running agent holds.
  lanes: { lane: string; agent: string; task: string; game_id: string | null; since: string }[];
}

export interface GameInfo {
  passes: { id: number; name: string; price: number | null }[];
  badges: { id: number; name: string; awarded: number; rate: number | null }[];
  servers: { count: number; players: number; avgPing: number | null; avgFps: number | null };
  products: { id: number; name: string; price: number | null }[];
}

export interface DesktopBridge {
  platform: "windows" | "mac" | "linux";
  machineName: string;
  startRunner(auth: { url: string; anonKey: string; accessToken: string; refreshToken: string }): Promise<RunnerStatus>;
  stopRunner(): Promise<void>;
  status(): Promise<RunnerStatus>;
  onStatus(cb: (s: RunnerStatus) => void): () => void;
  getKey(id: string): Promise<string | null>;
  setKey(id: string, value: string | null): Promise<void>;
  pickFolder(): Promise<string | null>;
  pickFile(): Promise<string | null>;
  // Point at the CLI by hand when it isn't on PATH. null goes back to looking for it.
  setCliPath(provider: Provider, path: string | null): Promise<void>;
  scanApps(): Promise<AppEntry[]>;
  // Fetches numbers for hundreds of Roblox games and writes them into the vault.
  pullGames(vault: string | null): Promise<{ count: number; day: string; charts: string; types: number; vault: string }>;
  openPath(path: string): Promise<void>;
  // Opens Roblox Studio on a game: its place file if the project has one, otherwise the place on Roblox.
  openStudio(game: { project_path: string | null; place_id: number | null; universe_id: number | null }): Promise<string>;
  // Public numbers Roblox doesn't allow a browser to fetch: passes, badges, servers.
  gameInfo(universeId: number, placeId: number | null): Promise<GameInfo>;
  // Adds a connector's MCP server to Claude Code and switches it on.
  connect(id: string): Promise<{ ok: boolean; detail: string }>;
  recheckConnectors(): Promise<void>;
}

declare global {
  interface Window {
    roslop?: DesktopBridge;
  }
}
