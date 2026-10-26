export type AgentId =
  | "lead" | "pulse" | "architect" | "builder" | "frame" | "scenic" | "librarian" | "balance"
  | "kid" | "playtest" | "splash" | "merchant" | "producer" | "reviewer" | "liveops" | "director";

export type Tier = "heavy" | "standard" | "light";
export type Provider = "claude" | "codex";
export type Who = AgentId | "you";

export type Stage = "pitched" | "designed" | "assets" | "built" | "balanced" | "art" | "ready" | "live" | "graded";

export type TaskStatus = "queued" | "held" | "paused" | "working" | "needs_you" | "done" | "dropped" | "failed";
export type Priority = "high" | "normal" | "low";

export interface Row {
  id: string;
  user_id: string;
  created_at: string;
}

export interface Game extends Row {
  name: string;
  universe_id: number | null;
  place_id: number | null;
  project_path: string | null;
  stage: Stage;
  version: string;
}

export interface Ask {
  question: string;
  options: string[];
  answer?: string;
}

export interface Task extends Row {
  game_id: string | null;
  agent: AgentId;
  title: string;
  brief: string;
  status: TaskStatus;
  priority: Priority;
  requested_by: Who;
  parent_id: string | null;
  needs_studio: boolean;
  estimate: number;
  used: number;
  machine_id: string | null;
  started_at: string | null;
  finished_at: string | null;
  result: string | null;
  ask: Ask | null;
}

export interface TaskEvent extends Row {
  task_id: string;
  kind: "note" | "tool" | "error" | "proof" | "usage";
  text: string;
}

export type Verdict = "waiting" | "approved" | "changes" | "rejected";

export interface Proof extends Row {
  task_id: string | null;
  game_id: string | null;
  agent: AgentId;
  title: string;
  note: string;
  kind: "image" | "video";
  url: string;
  verdict: Verdict;
  feedback: string | null;
  decided_at: string | null;
}

export interface PitchStat {
  label: string;
  value: string;
  sub?: string;
}

export interface PitchDeal {
  type: "stake" | "buyout";
  percent?: number;
  price: string;
  terms: string;
}

// The richer parts of a pitch. "acquire" pitches are about buying a game that already exists.
export interface PitchDetails {
  kind?: "build" | "acquire";
  window?: string;
  tags?: string[];
  different?: string;
  vs?: string[];
  proof?: string;
  chosen?: string;
  target?: { name: string; universe_id?: number; place_id?: number; creator?: string; playing?: number; visits?: number; likes?: number | null; age_days?: number };
  deals?: PitchDeal[];
  valuation?: string;
  upside?: string;
  outreach?: string;
}

export interface Pitch extends Row {
  title: string;
  summary: string;
  why: string;
  stats: PitchStat[];
  beats: { at: string; text: string }[];
  money: string;
  clip: string;
  reuses: string[];
  risks: string[];
  score: number;
  status: "waiting" | "approved" | "changes" | "declined";
  source: Who;
  details?: PitchDetails;
}

export type AssetKind = "icon" | "model" | "sound" | "vfx" | "ui" | "animation" | "reference";

export interface Asset extends Row {
  game_id: string | null;
  name: string;
  kind: AssetKind;
  roblox_id: string | null;
  file_url: string | null;
  tags: string[];
}

export type MachineRole = "worker" | "backup" | "remote";

export interface Machine extends Row {
  name: string;
  os: "windows" | "mac" | "linux" | "ios" | "android" | "web";
  role: MachineRole;
  last_seen: string;
  studio_slots: number;
  provider: Provider | null;
  // Roblox Studio windows actually open on that computer, counted by the desktop app.
  studios_open?: number | null;
}

export interface Message extends Row {
  game_id: string | null;
  author: Who;
  text: string;
  task_ids: string[];
}

export interface GameStat extends Row {
  game_id: string;
  playing: number;
  visits: number;
  favorites: number;
  up_votes: number;
  down_votes: number;
}

export interface UsageWindow extends Row {
  started_at: string;
  used: number;
  tokens: number;
}

export interface MarketItem {
  universe_id: number | null;
  name: string;
  genre: string;
  playing: number;
  likes: number | null;
  // Filled in by the app's own Roblox pull; a Pulse chart pull only has the fields above.
  place_id?: number;
  subgenre?: string;
  visits?: number;
  favorites?: number;
  like_ratio?: number | null;
  age_days?: number;
  updated?: string;
  max_players?: number;
  lists?: string[];
  icon?: string | null;
  quick?: boolean;
  creator?: string;
}

export interface MarketSnapshot extends Row {
  source: string;
  sort: string;
  items: MarketItem[];
}

export interface AppEntry {
  name: string;
  path: string;
  use: string;
  agents: AgentId[];
  on: boolean;
}

export interface BlenderRules {
  style: string;
  palette: string;
  edges: string;
  max_tris: number;
  texture: 256 | 512 | 1024;
  single_material: boolean;
  bake: boolean;
  pivot_bottom: boolean;
  collision: "box" | "hull" | "precise";
  notes: string;
}

export interface Template {
  id: string;
  title: string;
  body: string;
  refs: string[];
}

// A Studio the crew can use, named the way you name it, tied to a game and the kind of game it is.
export interface StudioLane {
  name: string;
  game_id: string | null;
  type: string;
}

export interface StudioSetup {
  // How many Studios agents may have open at once. null means as many as there are lanes.
  limit: number | null;
  lanes: StudioLane[];
}

export interface Settings {
  user_id: string;
  provider: Provider;
  cap: number;
  max_agents: number;
  hold_low_priority: boolean;
  weekly_spare: number;
  window_tokens: number;
  savings: Record<string, boolean>;
  apps: AppEntry[];
  connectors: Record<string, boolean>;
  vault_path: string | null;
  studio_mcp: string | null;
  blender: BlenderRules;
  // What the worker saw in `claude mcp list` last time it checked. null = never checked.
  mcp_found: string[] | null;
  templates: Template[];
  studio: StudioSetup;
  // Library groups as paths, like "Weapons/Environmental/Stylized". An asset's group is a "group:" tag.
  folders: string[];
  // What builds and art should look like, per kind of game: gameplay video links (YouTube, X,
  // TikTok) or game names. type "" applies to every game.
  style: StyleTarget[];
}

export interface StyleTarget {
  type: string;
  target: string;
}

export interface Tables {
  games: Game;
  tasks: Task;
  task_events: TaskEvent;
  proofs: Proof;
  pitches: Pitch;
  assets: Asset;
  machines: Machine;
  messages: Message;
  game_stats: GameStat;
  usage_windows: UsageWindow;
  market_snapshots: MarketSnapshot;
}

export type TableName = keyof Tables;
