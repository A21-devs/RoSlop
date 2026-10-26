// What a Roblox game earns and what it's worth, worked out the same way every time so Pulse
// never has to guess. Earnings come from RoWatcher when we have them, otherwise from players.

// What a developer gets per Robux: 70% after the marketplace cut, at the DevEx rate.
export const DEVEX = 0.0038;
const NET = 0.7 * DEVEX;

export interface RoWatcherGame {
  universeId?: string | number;
  name?: string;
  playing?: number;
  visits?: string | number;
  likeRatio?: number;
  robloxCreatedAt?: string;
  ccuDeltaPercent_24h?: number;
  estimatedMonthlyRevenueUsd?: number;
  revenueEstimate?: {
    low?: { dailyUsd: number; dailyRobux: number };
    high?: { dailyUsd: number; dailyRobux: number };
    expected?: { dailyUsd: number; dailyRobux: number };
    signals?: { avgCcu30d?: number; monetizationMode?: string; gamepassCount?: number };
    confidence?: string;
  };
  revenueModel?: string;
}

export interface Valuation {
  source: "rowatcher" | "players";
  monthlyUsd: [number, number, number];
  monthlyRobux: [number, number, number];
  avgPlaying: number;
  multiple: [number, number];
  why: string[];
  buyoutUsd: [number, number];
  confidence: string;
}

const DAYS = 30.4;

export function valueGame(o: { rw?: RoWatcherGame | null; playing?: number; age_days?: number | null; likes?: number | null }): Valuation {
  const rw = o.rw ?? null;
  const est = rw?.revenueEstimate;
  const playing = rw?.playing ?? o.playing ?? 0;
  const avg = est?.signals?.avgCcu30d ?? playing;
  let monthlyUsd: [number, number, number];
  let source: Valuation["source"] = "rowatcher";
  if (est?.low && est.high) {
    const mid = est.expected?.dailyUsd ?? (rw?.estimatedMonthlyRevenueUsd ? rw.estimatedMonthlyRevenueUsd / DAYS : (est.low.dailyUsd + est.high.dailyUsd) / 2);
    monthlyUsd = [est.low.dailyUsd * DAYS, mid * DAYS, est.high.dailyUsd * DAYS];
  } else {
    // Without RoWatcher: a top game makes its developer roughly $3 to $10 a month for every
    // player it holds on average, about $5 in the middle (RoWatcher's own numbers land there).
    source = "players";
    monthlyUsd = [avg * 3, avg * 5.5, avg * 10];
  }

  const why: string[] = [];
  let lo = 1, hi = 2.5;
  why.push("Roblox games usually change hands at 1 to 2.5 times a year of earnings, since players can leave fast");
  const created = rw?.robloxCreatedAt ? (Date.now() - Date.parse(rw.robloxCreatedAt)) / 864e5 : o.age_days ?? null;
  if (created !== null && created < 120) {
    lo *= 0.6;
    hi *= 0.6;
    why.push(`only ${Math.round(created)} days old, so it could fade fast`);
  } else if (created !== null && created > 730) {
    lo *= 1.15;
    hi *= 1.15;
    why.push(`${(created / 365).toFixed(1)} years old and still holding players`);
  }
  if (avg > 0 && playing < avg * 0.7) {
    lo *= 0.7;
    hi *= 0.7;
    why.push(`players are down to ${Math.round((playing / avg) * 100)}% of the 30 day average`);
  } else if (avg > 0 && playing > avg * 1.3) {
    why.push(`players are up to ${Math.round((playing / avg) * 100)}% of the 30 day average, priced on the average not the spike`);
  }
  const ratio = rw?.likeRatio ?? null;
  if (ratio !== null && ratio < 0.75) {
    lo *= 0.8;
    hi *= 0.8;
    why.push(`only ${Math.round(ratio * 100)}% likes`);
  }

  return {
    source,
    monthlyUsd,
    monthlyRobux: monthlyUsd.map(v => v / NET) as [number, number, number],
    avgPlaying: Math.round(avg),
    multiple: [Math.round(lo * 10) / 10, Math.round(hi * 10) / 10],
    why,
    buyoutUsd: [monthlyUsd[1] * 12 * lo, monthlyUsd[1] * 12 * hi],
    confidence: source === "players" ? "low, worked out from players alone" : est?.confidence ?? "medium",
  };
}

export const usd = (v: number) => (v >= 1e6 ? `$${(v / 1e6).toFixed(v >= 1e7 ? 0 : 1)}M` : v >= 1e3 ? `$${Math.round(v / 1e3)}k` : `$${Math.round(v)}`);
export const robux = (v: number) => (v >= 1e9 ? `R$ ${(v / 1e9).toFixed(1)}B` : v >= 1e6 ? `R$ ${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `R$ ${Math.round(v / 1e3)}k` : `R$ ${Math.round(v)}`);

// The numbers as Pulse reads them in the brief.
export function valuationBrief(v: Valuation, deals: { type: "stake" | "buyout"; percent?: number }[]): string {
  const m = v.monthlyUsd, r = v.monthlyRobux;
  const lines = [
    `Earnings (${v.source === "rowatcher" ? "RoWatcher's revenue model" : "estimated from players, no RoWatcher data"}, confidence ${v.confidence}):`,
    `- a month: ${usd(m[0])} to ${usd(m[2])}, most likely ${usd(m[1])} (${robux(r[0])} to ${robux(r[2])} of player spend)`,
    `- a year: ${usd(m[0] * 12)} to ${usd(m[2] * 12)}`,
    `- average players over 30 days: ${v.avgPlaying.toLocaleString()}`,
    `Price: ${v.multiple[0]}x to ${v.multiple[1]}x a year of earnings, because ${v.why.join("; ")}.`,
    `- full buyout: ${usd(v.buyoutUsd[0])} to ${usd(v.buyoutUsd[1])} (${robux(v.buyoutUsd[0] / DEVEX)} to ${robux(v.buyoutUsd[1] / DEVEX)} at DevEx)`,
  ];
  for (const d of deals) {
    if (d.type !== "stake" || !d.percent) continue;
    // A minority stake sells for a little less than its share of the whole.
    const a = v.buyoutUsd[0] * (d.percent / 100) * 0.8, b = v.buyoutUsd[1] * (d.percent / 100) * 0.95;
    lines.push(`- ${d.percent}% stake: ${usd(a)} to ${usd(b)} (${robux(a / DEVEX)} to ${robux(b / DEVEX)}), plus ${d.percent}% of ${usd(m[1])} a month going forward`);
  }
  return lines.join("\n");
}
