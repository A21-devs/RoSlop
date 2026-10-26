import { describe, expect, it } from "vitest";
import { defaultSettings, withDefaults } from "./settings";

describe("withDefaults", () => {
  it("keeps the studio list when a saved row has an empty one", () => {
    const base = defaultSettings("u");
    const s = withDefaults(base, { studio: {} as never, templates: null as never, vault_path: "C:/v" });
    expect(s.studio.lanes.length).toBe(2);
    expect(s.templates).toEqual([]);
    expect(s.vault_path).toBe("C:/v");
  });
});
