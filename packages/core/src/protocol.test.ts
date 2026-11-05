import { describe, expect, it } from "vitest";
import { readSignal } from "./protocol";

describe("signals", () => {
  it("reads a lesson", () => {
    expect(readSignal("LESSON: The owner wants rounder edges on props")).toEqual({ kind: "lesson", text: "The owner wants rounder edges on props" });
  });

  it("reads a handoff to a real agent", () => {
    expect(readSignal("HANDOFF: playtest | Test the lava timing | Lava ticks every 0.5s now | check the reset")).toEqual({ kind: "handoff", agent: "playtest", title: "Test the lava timing", brief: "Lava ticks every 0.5s now | check the reset" });
  });

  it("ignores a handoff to someone who isn't on the crew", () => {
    expect(readSignal("HANDOFF: wizard | Do magic")).toBeNull();
  });
});
