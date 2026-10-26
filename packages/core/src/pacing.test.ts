import { describe, expect, it } from "vitest";
import { allowance, canStart, concurrency, pace, projected, waitFor } from "./pacing";
import { readPitches, readPlan, readSignal } from "./protocol";

describe("pacing", () => {
  it("lets the first job of a fresh window start", () => {
    expect(canStart({ elapsed: 0, used: 0, reserved: 0, cap: 0.8 }, 0.04).ok).toBe(true);
  });

  it("holds work that would run ahead of pace", () => {
    const r = canStart({ elapsed: 30, used: 0.3, reserved: 0.03, cap: 0.8 }, 0.04);
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
    expect(used).toBeLessThan(0.3);
  });

  it("says how long until the next job fits", () => {
    const s = { elapsed: 10, used: 0.3, reserved: 0, cap: 0.8 };
    expect(canStart(s, 0.04).ok).toBe(false);
    expect(waitFor(s, 0.04)).toBe(28);
    expect(canStart({ ...s, elapsed: 38 }, 0.04).ok).toBe(true);
    expect(waitFor({ ...s, used: 0.79 }, 0.04)).toBeNull();
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

describe("pitches", () => {
  it("reads one pitch or a list, and skips junk", () => {
    const one = readPitches('ok\n```pitch\n{"title":"Dino Farm","why":"egg games are up","score":7.6,"stats":[{"label":"Similar","value":"14"}]}\n```');
    expect(one).toHaveLength(1);
    expect(one[0].score).toBe(8);
    expect(one[0].stats[0].value).toBe("14");
    expect(readPitches('```pitch\n[{"title":"A"},{"nope":1},{"title":"B"}]\n```').map(p => p.title)).toEqual(["A", "B"]);
    expect(readPitches("```pitch\nnot json\n```")).toEqual([]);
  });
});
