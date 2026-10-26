import type { BlenderRules, Settings } from "./types";

export const SAVINGS = [
  { id: "short_handoffs", name: "Short handoffs", what: "Agents pass a summary to the next one, not the whole chat", cut: 0.3 },
  { id: "one_snapshot", name: "One Studio snapshot", what: "The place gets read once per change and shared", cut: 0.12 },
  { id: "tagged_notes", name: "Only the notes they need", what: "Each agent loads the vault pages tagged for it", cut: 0.09 },
  { id: "small_shots", name: "Smaller screenshots", what: "Shrunk to what's readable before they're sent", cut: 0.06 },
  { id: "light_first", name: "Try light first", what: "Simple retries go to a lighter model before a heavy one", cut: 0.04 },
  { id: "no_questions", name: "Don't stop to ask", what: "Agents go with their own first pick instead of waiting on you", cut: 0.03 },
] as const;

export const CONNECTORS = [
  { id: "figma", name: "Figma", use: "Frame pulls frames and styles when you link a file" },
  { id: "github", name: "GitHub", use: "Builder pushes to a branch, never main" },
  { id: "linear", name: "Linear", use: "Producer files bugs from Playtest and Reviewer" },
  { id: "notion", name: "Notion", use: "The Lead can read your design docs" },
  { id: "blender", name: "Blender", use: "Librarian and Scenic build and clean up models, then export them for Studio" },
] as const;

// Matches a connector to a server name from `claude mcp list`, like "figma" or "blender-mcp".
export function serverFor(id: string, found: string[] | null): string | undefined {
  return found?.find(n => n.toLowerCase().includes(id));
}

export const BLENDER_STYLES = [
  "stylized", "low poly", "toon", "cartoon", "hand-painted", "anime / cel shaded", "chibi", "realistic", "semi-realistic",
  "voxel", "blocky (classic Roblox)", "PS1 retro", "flat shaded", "clay", "sci-fi hard surface", "fantasy", "horror", "cute pastel",
];
export const BLENDER_PALETTES = ["bright and saturated", "pastel", "muted", "dark and moody", "neon", "earthy", "match the game"];
export const BLENDER_EDGES = ["soft bevels", "sharp", "chunky rounded", "outlined (toon)"];

export const BLENDER_DEFAULTS: BlenderRules = {
  style: "stylized",
  palette: "match the game",
  edges: "soft bevels",
  max_tris: 4000,
  texture: 512,
  single_material: true,
  bake: true,
  pivot_bottom: true,
  collision: "box",
  notes: "",
};

// What the crew is told whenever they touch Blender.
export function blenderBrief(r: BlenderRules): string {
  return [
    `Style: ${r.style}, ${r.palette} colors, ${r.edges} edges. Keep every model in that style so they look like one game.`,
    `Budget: at most ${r.max_tris.toLocaleString()} triangles per model (Roblox caps a MeshPart at 20,000). Decimate or retopo until it fits.`,
    `Textures: ${r.texture}x${r.texture} max, power of two.${r.bake ? " Bake detail into the texture instead of adding geometry." : ""}`,
    r.single_material ? "One material per model. Combine with a texture atlas if you need more." : "",
    "Scale for Roblox: 1 stud is about 0.28 m. A player is roughly 5 studs tall, build to that.",
    r.pivot_bottom ? "Put the pivot at the bottom center, apply all transforms, face -Z forward." : "Apply all transforms before export.",
    `Collision in Studio: ${r.collision === "box" ? "Box" : r.collision === "hull" ? "Hull" : "PreciseConvexDecomposition, only when it really matters"}.`,
    "Export FBX, check it in Studio, and screenshot it next to a player for scale as PROOF.",
    r.notes.trim() ? `Also: ${r.notes.trim()}` : "",
  ].filter(Boolean).join("\n");
}

// Keys never leave the computer that runs the agents.
export const KEYS = [
  { id: "roblox_open_cloud", name: "Roblox Open Cloud", use: "Publishing, DataStores and uploads" },
  { id: "roblox_creator", name: "Roblox creator id", use: "Who owns uploads: your user id, or group:123 for a group" },
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
    savings: Object.fromEntries(SAVINGS.map(s => [s.id, s.id !== "light_first" && s.id !== "no_questions"])),
    apps: [],
    connectors: {},
    vault_path: null,
    studio_mcp: null,
    blender: BLENDER_DEFAULTS,
    templates: [],
    folders: [],
    studio: { limit: null, lanes: [{ name: "Studio 1", game_id: null, type: "" }, { name: "Studio 2", game_id: null, type: "" }] },
    mcp_found: null,
  };
}
