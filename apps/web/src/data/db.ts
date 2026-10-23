import type { Settings, TableName, Tables } from "@roslop/core";

export interface User {
  id: string;
  email: string;
}

export type Snapshot = { [T in TableName]: Tables[T][] } & { settings: Settings };

export type Change =
  | { table: TableName; row: Tables[TableName]; gone?: false }
  | { table: TableName; row: { id: string }; gone: true }
  | { table: "settings"; row: Settings; gone?: false };

export interface Db {
  mode: "demo" | "cloud";
  user(): User | null;
  onAuth(cb: (u: User | null) => void): () => void;
  signIn(email: string, password: string): Promise<string | null>;
  signUp(email: string, password: string): Promise<string | null>;
  signInWith(provider: "github" | "google"): Promise<string | null>;
  signOut(): Promise<void>;
  load(): Promise<Snapshot>;
  subscribe(cb: (c: Change) => void): () => void;
  insert<T extends TableName>(table: T, row: Partial<Tables[T]>): Promise<Tables[T]>;
  update<T extends TableName>(table: T, id: string, patch: Partial<Tables[T]>): Promise<void>;
  remove(table: TableName, id: string): Promise<void>;
  saveSettings(patch: Partial<Settings>): Promise<void>;
  upload(file: File, folder: string): Promise<string>;
  fileUrl(path: string): Promise<string>;
  session(): Promise<{ url: string; anonKey: string; accessToken: string; refreshToken: string } | null>;
}

export const TABLES: TableName[] = ["games", "tasks", "task_events", "proofs", "pitches", "assets", "machines", "messages", "game_stats", "usage_windows", "market_snapshots"];

export function emptySnapshot(settings: Settings): Snapshot {
  const s = { settings } as Snapshot;
  for (const t of TABLES) (s as Record<string, unknown>)[t] = [];
  return s;
}
