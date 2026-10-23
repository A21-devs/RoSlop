import type { AgentId, Provider, Tier } from "./types";

export interface Agent {
  id: AgentId;
  name: string;
  short: string;
  color: string;
  tier: Tier;
  job: string;
  studio: boolean;
}

export const AGENTS: Agent[] = [
  { id: "lead", name: "Lead", short: "LD", color: "#d6ff3d", tier: "heavy", job: "Turns what you want into tasks for the right people.", studio: false },
  { id: "pulse", name: "Pulse", short: "PU", color: "#ff7a6b", tier: "light", job: "Watches the charts and pitches games that are growing.", studio: false },
  { id: "architect", name: "Architect", short: "AR", color: "#79b8ff", tier: "heavy", job: "Writes the game plan before anything gets built.", studio: false },
  { id: "builder", name: "Builder", short: "BU", color: "#f4b24c", tier: "standard", job: "Writes the code and wires the game together.", studio: true },
  { id: "frame", name: "Frame", short: "FR", color: "#f18cc0", tier: "standard", job: "UI, and making sure it fits on a phone.", studio: true },
  { id: "scenic", name: "Scenic", short: "SC", color: "#6fd08c", tier: "standard", job: "Builds the world, terrain and lighting.", studio: true },
  { id: "librarian", name: "Librarian", short: "LB", color: "#b49cff", tier: "light", job: "Finds and sets up models, effects and sounds.", studio: false },
  { id: "balance", name: "Balance", short: "BA", color: "#4fd1c5", tier: "standard", job: "Simulates the economy so upgrades feel right.", studio: false },
  { id: "kid", name: "Kid Tester", short: "KT", color: "#ffd84d", tier: "light", job: "Plays like a 10 year old who skips every tutorial.", studio: true },
  { id: "playtest", name: "Playtest", short: "PT", color: "#ff9b4a", tier: "light", job: "Runs the game in Studio and reports what breaks.", studio: true },
  { id: "splash", name: "Splash", short: "SP", color: "#e57bff", tier: "light", job: "Thumbnails and icons.", studio: false },
  { id: "merchant", name: "Merchant", short: "ME", color: "#e8c46a", tier: "standard", job: "Shops, passes and developer products.", studio: false },
  { id: "producer", name: "Producer", short: "PR", color: "#9fb3c8", tier: "light", job: "Keeps work moving and checks the proof.", studio: false },
  { id: "reviewer", name: "Reviewer", short: "RV", color: "#ff6262", tier: "heavy", job: "Checks money, saves and security before anything ships.", studio: false },
  { id: "liveops", name: "Liveops", short: "LO", color: "#7ee0ff", tier: "light", job: "Reads player numbers and plans the next update.", studio: false },
];

export const AGENT: Record<AgentId, Agent> = Object.fromEntries(AGENTS.map(a => [a.id, a])) as Record<AgentId, Agent>;

// null means "whatever the CLI defaults to". Codex users can pin models in Settings.
export const MODELS: Record<Provider, Record<Tier, string | null>> = {
  claude: { heavy: "opus", standard: "sonnet", light: "haiku" },
  codex: { heavy: null, standard: null, light: null },
};

export function modelFor(agent: AgentId, provider: Provider): string | null {
  return MODELS[provider][AGENT[agent].tier];
}
