import { describe, expect, it } from "vitest";
import { allowance, canStart, concurrency, pace, projected } from "./pacing";
import { readPlan, readSignal } from "./protocol";

describe("pacing", () => {
  it("lets the first job of a fresh window start", () => {
    expect(canStart({ elapsed: 0, used: 0, reserved: 0, cap: 0.8 }, 0.04).ok).toBe(true);
  });

  it("holds work that would run ahead of pace", () => {
    const r = canStart({ elapsed: 30, used: 0.15, reserved: 0.03, cap: 0.8 }, 0.04);
    expect(r.ok).toBe(false);
  });

  it("never goes past the cap", () => {
    expect(canStart({ elapsed: 299, used: 0.78, reserved: 0, cap: 0.8 }, 0.03).ok).toBe(false);
    expect(allowance(400, 0.8)).toBeCloseTo(0.8);
  });

  it("can't burn a window in a few minutes", () => {
    let used = 0;
    let minute = 0;
    while (minute < 10) {
      if (canStart({ elapsed: minute, used, reserved: 0, cap: 0.8 }, 0.04).ok) used += 0.04;
      else minute++;
    }
    expect(used).toBeLessThan(0.2);
  });

  it("reads pace and projection", () => {
    expect(pace(0.41, 162, 0.8)).toBe("on");
    expect(pace(0.7, 60, 0.8)).toBe("ahead");
    expect(projected(0.41, 162)).toBeCloseTo(0.76, 2);
  });

  it("drops concurrency when running hot", () => {
    expect(concurrency(3, 0.8 / 300, 0.8)).toBe(3);
    expect(concurrency(3, (0.8 / 300) * 1.5, 0.8)).toBe(2);
    expect(concurrency(3, (0.8 / 300) * 3, 0.8)).toBe(1);
  });
});

describe("protocol", () => {
  it("reads signal lines", () => {
    expect(readSignal("ASK: A or B? | A | B")).toEqual({ kind: "ask", question: "A or B?", options: ["A", "B"] });
    expect(readSignal("PROOF: shots/a.png | Shop | looks fine")?.kind).toBe("proof");
    expect(readSignal("just talking")).toBeNull();
  });

  it("reads the Lead's plan and drops junk", () => {
    const plan = readPlan('ok\n```tasks\n[{"agent":"builder","title":"Fix lava","brief":"x"},{"agent":"nobody","title":"y"}]\n```');
    expect(plan).toHaveLength(1);
    expect(plan[0].priority).toBe("normal");
  });
});
