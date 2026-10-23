import type { Settings } from "./types";

export const SAVINGS = [
  { id: "short_handoffs", name: "Short handoffs", what: "Agents pass a summary to the next one, not the whole chat", cut: 0.3 },
  { id: "one_snapshot", name: "One Studio snapshot", what: "The place gets read once per change and shared", cut: 0.12 },
  { id: "tagged_notes", name: "Only the notes they need", what: "Each agent loads the vault pages tagged for it", cut: 0.09 },
  { id: "small_shots", name: "Smaller screenshots", what: "Shrunk to what's readable before they're sent", cut: 0.06 },
  { id: "light_first", name: "Try light first", what: "Simple retries go to a lighter model before a heavy one", cut: 0.04 },
] as const;

export const CONNECTORS = [
  { id: "figma", name: "Figma", use: "Frame pulls frames and styles when you link a file" },
  { id: "github", name: "GitHub", use: "Builder pushes to a branch, never main" },
  { id: "linear", name: "Linear", use: "Producer files bugs from Playtest and Reviewer" },
  { id: "notion", name: "Notion", use: "The Lead can read your design docs" },
] as const;

// Keys never leave the computer that runs the agents.
export const KEYS = [
  { id: "roblox_open_cloud", name: "Roblox Open Cloud", use: "Publishing, DataStores and uploads" },
  { id: "rowatcher", name: "RoWatcher", use: "Market and Pitches data, if you have access" },
  { id: "discord_webhook", name: "Discord webhook", use: "Optional. Posts approvals to a channel" },
] as const;

export function defaultSettings(user_id: string): Settings {
  return {
    user_id,
    provider: "claude",
    cap: 0.8,
    max_agents: 3,
    hold_low_priority: true,
    weekly_spare: 0.15,
    // A guess to start from. The desktop app tightens it once it sees real limits.
    window_tokens: 4_000_000,
    savings: Object.fromEntries(SAVINGS.map(s => [s.id, s.id !== "light_first"])),
    apps: [],
    connectors: {},
    vault_path: null,
    studio_mcp: null,
  };
}
