import { describe, expect, it } from "vitest";
import { valueGame } from "./valuation";

describe("valueGame", () => {
  it("never prices a $200k a month game like pocket change", () => {
    const day = 200_000 / 30.4;
    const v = valueGame({ rw: { playing: 30_000, robloxCreatedAt: new Date(Date.now() - 400 * 864e5).toISOString(), revenueEstimate: { low: { dailyUsd: day * 0.75, dailyRobux: 0 }, high: { dailyUsd: day * 1.25, dailyRobux: 0 }, expected: { dailyUsd: day, dailyRobux: 0 }, signals: { avgCcu30d: 30_000 } } } });
    expect(v.source).toBe("rowatcher");
    expect(v.buyoutUsd[0]).toBeGreaterThan(1_500_000);
    expect(v.buyoutUsd[1]).toBeLessThan(10_000_000);
  });

  it("falls back to players when RoWatcher has nothing", () => {
    const v = valueGame({ playing: 30_000 });
    expect(v.source).toBe("players");
    expect(v.monthlyUsd[1]).toBeGreaterThan(100_000);
  });
});
