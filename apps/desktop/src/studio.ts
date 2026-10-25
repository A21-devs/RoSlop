import { shell } from "electron";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import type { GameInfo } from "@roslop/core";

async function json<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

function placeFile(path: string): string | null {
  if (!existsSync(path)) return null;
  if (/\.rbxlx?$/i.test(path)) return path;
  if (!statSync(path).isDirectory()) return null;
  const f = readdirSync(path).find(n => /\.rbxlx?$/i.test(n));
  return f ? join(path, f) : null;
}

// The place file if the project has one, otherwise the published place through Studio's own link.
export async function openStudio(g: { project_path: string | null; place_id: number | null; universe_id: number | null }): Promise<string> {
  const file = g.project_path ? placeFile(g.project_path) : null;
  if (file) {
    const err = await shell.openPath(file);
    if (err) throw new Error(err);
    return `Opened ${file}`;
  }
  let place = g.place_id;
  if (!place && g.universe_id) {
    const d = await json<{ data: { rootPlaceId: number }[] }>(`https://games.roblox.com/v1/games?universeIds=${g.universe_id}`);
    place = d?.data[0]?.rootPlaceId ?? null;
  }
  if (!place) throw new Error("Add the universe id or a project folder with a place file to this game first.");
  await shell.openExternal(`roblox-studio:1+launchmode:edit+task:EditPlace+placeId:${place}${g.universe_id ? `+universeId:${g.universe_id}` : ""}`);
  return `Opened place ${place} in Studio`;
}

export async function gameInfo(universeId: number, placeId: number | null): Promise<GameInfo> {
  type Pass = { id: number; name?: string; displayName?: string; price?: number | null };
  type Badge = { id: number; name: string; statistics?: { awardedCount?: number; winRatePercentage?: number } };
  type Server = { playing?: number; ping?: number; fps?: number };
  const [passes, badges, servers] = await Promise.all([
    json<{ gamePasses: Pass[] }>(`https://apis.roblox.com/game-passes/v1/universes/${universeId}/game-passes?passView=Full&pageSize=100`),
    json<{ data: Badge[] }>(`https://badges.roblox.com/v1/universes/${universeId}/badges?limit=100&sortOrder=Asc`),
    placeId ? json<{ data: Server[] }>(`https://games.roblox.com/v1/games/${placeId}/servers/Public?limit=100`) : null,
  ]);
  const list = servers?.data ?? [];
  const avg = (ns: number[]) => (ns.length ? Math.round(ns.reduce((a, b) => a + b, 0) / ns.length) : null);
  return {
    passes: (passes?.gamePasses ?? []).map(p => ({ id: p.id, name: p.displayName ?? p.name ?? String(p.id), price: p.price ?? null })),
    badges: (badges?.data ?? []).map(b => ({ id: b.id, name: b.name, awarded: b.statistics?.awardedCount ?? 0, rate: b.statistics?.winRatePercentage ?? null })),
    servers: { count: list.length, players: list.reduce((s, x) => s + (x.playing ?? 0), 0), avgPing: avg(list.map(x => x.ping ?? 0).filter(Boolean)), avgFps: avg(list.map(x => x.fps ?? 0).filter(Boolean)) },
    products: [],
  };
}
