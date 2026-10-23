import { app, safeStorage } from "electron";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Keys stay on this computer, encrypted by the OS keychain. They never go to Supabase.

const file = () => join(app.getPath("userData"), "keys.json");

function load(): Record<string, string> {
  if (!existsSync(file())) return {};
  try {
    return JSON.parse(readFileSync(file(), "utf8"));
  } catch {
    return {};
  }
}

export function getKey(id: string): string | null {
  const stored = load()[id];
  if (!stored || !safeStorage.isEncryptionAvailable()) return null;
  try {
    return safeStorage.decryptString(Buffer.from(stored, "base64"));
  } catch {
    return null;
  }
}

export function setKey(id: string, value: string | null) {
  const all = load();
  if (value) {
    if (!safeStorage.isEncryptionAvailable()) throw new Error("Can't encrypt keys on this computer yet.");
    all[id] = safeStorage.encryptString(value).toString("base64");
  } else {
    delete all[id];
  }
  writeFileSync(file(), JSON.stringify(all, null, 2), { mode: 0o600 });
}

export function allKeys(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const id of Object.keys(load())) {
    const value = getKey(id);
    if (value) out[id] = value;
  }
  return out;
}
