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
  scanApps(): Promise<AppEntry[]>;
  openPath(path: string): Promise<void>;
}

declare global {
  interface Window {
    roslop?: DesktopBridge;
  }
}
