import { valuationBrief, valueGame, type RoWatcherGame } from "@roslop/core";

const API = "https://rowatcher.com/api/v1";

export async function rowatcherGame(universeId: number | string, key: string | null): Promise<RoWatcherGame | null> {
  const res = await fetch(`${API}/games/${universeId}`, { headers: key ? { Authorization: `Bearer ${key}` } : {}, signal: AbortSignal.timeout(20_000) }).catch(() => null);
  if (!res?.ok) return null;
  return ((await res.json()) as { data?: RoWatcherGame }).data ?? null;
}

// Acquisition pitches get their numbers worked out before Pulse starts, so the price is
// always tied to what the game really earns.
export async function priceBrief(brief: string, key: string | null): Promise<{ brief: string; note: string } | null> {
  const id = brief.match(/"universe_id":\s*(\d+)/)?.[1];
  if (!id) return null;
  const facts = (k: string) => Number(brief.match(new RegExp(`"${k}":\\s*(\\d+)`))?.[1] ?? NaN);
  const rw = await rowatcherGame(id, key);
  const v = valueGame({ rw, playing: facts("playing") || 0, age_days: Number.isFinite(facts("age_days")) ? facts("age_days") : null });
  const percent = Number(brief.match(/(\d+)% stake/)?.[1] ?? 0);
  const deals = [
    ...(percent ? [{ type: "stake" as const, percent }] : []),
    ...(/full buyout/.test(brief) ? [{ type: "buyout" as const }] : []),
  ];
  const text = valuationBrief(v, deals);
  return {
    brief: `${brief}

Numbers RoSlop worked out (use these for the valuation and the deal prices, don't make up your own; you can argue a bit above or below them if you say why):
${text}`,
    note: rw ? `Got ${rw.name ?? "the game"}'s earnings from RoWatcher.` : "RoWatcher didn't have this game, so the price is worked out from players.",
  };
}
