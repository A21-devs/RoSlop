import type { SupabaseClient } from "@supabase/supabase-js";
import type { Machine, Provider } from "@roslop/core";
import { hostname } from "node:os";
import { fail } from "./db";
import { machineIds } from "./store";

export const STUDIO_SLOTS = 4;

export function osName(): Machine["os"] {
  if (process.platform === "darwin") return "mac";
  if (process.platform === "win32") return "windows";
  return "linux";
}

export async function registerMachine(db: SupabaseClient, userId: string, provider: Provider): Promise<Machine> {
  const name = hostname();
  const os = osName();
  const now = new Date().toISOString();

  const { data: rows, error } = await db.from("machines").select("*");
  fail("Couldn't load your computers", error);
  const all = (rows ?? []) as Machine[];

  const known = machineIds.get(userId);
  const mine = all.find(m => m.id === known) ?? all.find(m => m.name === name && m.os === os && m.role !== "remote");
  if (mine) {
    const { data, error } = await db.from("machines").update({ name, os, provider, last_seen: now }).eq("id", mine.id).select().single();
    fail("Couldn't update this computer", error);
    machineIds.set(userId, mine.id);
    return data as Machine;
  }

  const role = all.some(m => m.role === "worker") ? "backup" : "worker";
  const { data, error: insertError } = await db
    .from("machines")
    .insert({ user_id: userId, name, os, role, provider, last_seen: now, studio_slots: STUDIO_SLOTS })
    .select()
    .single();
  fail("Couldn't add this computer", insertError);
  machineIds.set(userId, (data as Machine).id);
  return data as Machine;
}

export async function heartbeat(db: SupabaseClient, id: string, provider: Provider) {
  await db.from("machines").update({ last_seen: new Date().toISOString(), provider }).eq("id", id);
}

const ONLINE_MS = 3 * 60_000;

// A backup only takes work while no worker has checked in for a few minutes.
export function shouldWork(me: Machine | undefined, all: Machine[], now = Date.now()): boolean {
  if (!me || me.role === "remote") return false;
  if (me.role === "worker") return true;
  return !all.some(m => m.id !== me.id && m.role === "worker" && now - Date.parse(m.last_seen) < ONLINE_MS);
}
