import { app } from "electron";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Small JSON files in userData for things only this computer needs to remember.
export function jsonStore<T>(name: string) {
  const file = () => join(app.getPath("userData"), name);
  const load = (): Record<string, T> => {
    if (!existsSync(file())) return {};
    try {
      return JSON.parse(readFileSync(file(), "utf8"));
    } catch {
      return {};
    }
  };
  return {
    get: (key: string): T | undefined => load()[key],
    set(key: string, value: T | undefined) {
      const all = load();
      if (value === undefined) delete all[key];
      else all[key] = value;
      writeFileSync(file(), JSON.stringify(all, null, 2));
    },
  };
}

// Claude session per task, so an answered ASK or a paused task can pick up where it left off.
export const sessions = jsonStore<string>("sessions.json");

// Which machines row is this computer, per signed-in user.
export const machineIds = jsonStore<string>("machine.json");
