import { defaultSettings, type AgentId, type Task, type TaskStatus } from "@roslop/core";
import { scene, sticker, svgUrl, type Sticker } from "../ui/art";
import { emptySnapshot, type Snapshot } from "./db";

const U = "demo";
let n = 0;
const id = () => `demo-${++n}`;
const ago = (min: number) => new Date(Date.now() - min * 60000).toISOString();

export function seed(): Snapshot {
  const s = emptySnapshot({ ...defaultSettings(U), apps: [{ name: "Blender", path: "C:\\Program Files\\Blender Foundation\\Blender 4.2", use: "Clean up models and export .fbx into Studio", agents: ["librarian", "scenic"], on: true }] });
  const anime = { id: id(), user_id: U, created_at: ago(40000), name: "Anime Awakening RNG", universe_id: null, place_id: null, project_path: null, stage: "live" as const, version: "v1.4" };
  const dino = { id: id(), user_id: U, created_at: ago(20000), name: "Dig Up a Dino", universe_id: null, place_id: null, project_path: null, stage: "balanced" as const, version: "v0.9" };
  s.games = [anime, dino];

  const task = (agent: AgentId, title: string, status: TaskStatus, game = anime.id, extra: Partial<Task> = {}): Task => ({
    id: id(), user_id: U, created_at: ago(90), game_id: game, agent, title, brief: "", status, priority: "normal", requested_by: "lead",
    parent_id: null, needs_studio: false, estimate: 0.03, used: 0, machine_id: null, started_at: null, finished_at: null, result: null, ask: null, ...extra,
  });

  const lava = task("builder", "Raid lava and the weekly raid reset", "working", anime.id, {
    needs_studio: true, used: 0.019, started_at: ago(11),
    brief: "Goal\nLava in the Frostpeak raid should hurt, not kill instantly. The weekly raid should reset every Monday for everyone.\n\nWhat's wrong now\nLava parts use Touched and stack, so players die in under a second. The weekly timer starts when a server starts.\n\nDo this\nOne damage tick per player every 0.5s, 20 damage each, on the server. Respawn at the raid gate. Reset Monday 00:00 UTC with os.time.\n\nLeave alone\nThe boss AI and the loot table.\n\nDone when\nTwo players survive 10 seconds in lava, and moving the clock to Monday resets the raid on two servers.",
  });
  s.tasks = [
    lava,
    task("balance", "Late skill tree is too cheap", "working", anime.id, { used: 0.024, started_at: ago(60) }),
    task("frame", "Loading screen shows as a brown box", "working", anime.id, { needs_studio: true, used: 0.01, started_at: ago(40) }),
    task("scenic", "Second dig site, the swamp one", "working", dino.id, { needs_studio: true, used: 0.005, started_at: ago(8) }),
    task("builder", "Level 15 needs 3,500 XP, floors off in beaten zones", "queued", anime.id, { requested_by: "balance" }),
    task("playtest", "Run the raid lava fix with 2 players", "queued", anime.id, { parent_id: lava.id }),
    task("frame", "Celgear's clock hand hit needs sound and knockback", "queued"),
    task("kid", "Play Frostpeak fresh and note every death", "queued"),
    task("splash", "Thumbnails for the Frostpeak update", "held", anime.id, { priority: "low" }),
    task("playtest", "Party raid quick join on a second account", "needs_you", anime.id, {
      ask: { question: "Party raid quick join is in. Can you try it with a second account? Start a raid on PC, then join from your phone.", options: ["Works for me", "Something's off"] },
    }),
    task("balance", "How strong should a 1 in a million hero be", "needs_you", anime.id, {
      requested_by: "you",
      ask: { question: "Kenaki (1 in 2.5M) hits 4.1x a common right now, and people who roll one mostly stop rolling. I'd cap everyone at 4x and only let Kenaki and Zoru go past it.", options: ["Keep the 4x cap", "Raise it to 6x"] },
    }),
    task("reviewer", "Daily reward could be claimed twice", "done", dino.id, { used: 0.012, finished_at: ago(120), result: "Blocked the ship. Rejoining within 3s granted the reward again. Builder fixed it by saving before granting." }),
    task("librarian", "Ice crystal models for Frostpeak", "done", anime.id, { used: 0.006, finished_at: ago(200), result: "Added 6 crystal models with ids to the library." }),
  ];

  s.task_events = [
    ["Read the 3 notes in the brief", 10], ["Found 14 lava parts using Touched", 9], ["Wrote RaidLava.server.lua", 6], ["Weekly reset now uses os.time", 3], ["Testing with 2 players", 1],
  ].map(([text, m]) => ({ id: id(), user_id: U, created_at: ago(m as number), task_id: lava.id, kind: "note" as const, text: text as string }));

  const proof = (agent: AgentId, title: string, note: string, img: string, verdict: "waiting" | "approved" = "waiting") =>
    ({ id: id(), user_id: U, created_at: ago(120), task_id: null, game_id: anime.id, agent, title, note, kind: "image" as const, url: svgUrl(img), verdict, feedback: null, decided_at: null });
  s.proofs = [
    proof("frame", "Calmer Special abilities. Enough, or go further?", "You said the effects were so loud you couldn't see anyone. Same three casts, old then new: no screen dim, smaller smoke, fewer spikes, leftovers gone in about 2 seconds.", scene("grove", 11, { glow: 26, sparks: 8, guys: 4 })),
    proof("builder", "Goro's rune circle in a real fight", "First pass at the rune circle. The ring telegraphs the slam about a second early.", scene("arena", 4, { glow: 30, vfx: "#ff6a2a", sparks: 14 })),
    proof("scenic", "Hero Hall layout, now vs proposed", "Moved the forge next to the summon gate so new players walk past it.", scene("grove", 6)),
    proof("splash", "Thumbnails for Frostpeak", "Three takes. I like the second, the boss reads at phone size.", scene("night", 3, { glow: 30, vfx: "#b48cff", sparks: 16 })),
    proof("frame", "Shop on a phone, option B", "Buy button sits under your thumb.", scene("dino", 7, { guys: 1 }), "approved"),
  ];

  s.pitches = [{
    id: id(), user_id: U, created_at: ago(300), source: "pulse", status: "waiting", score: 8,
    title: "Fishing RNG where the weather changes what bites",
    summary: "Cast, wait, reel, roll for what's on the hook. Every 20 minutes the weather flips and a different set of fish shows up.",
    why: "Fish It But RNG went from 2k to 48k players in three weeks and almost nobody has copied it well. The weather timer gives people a reason to come back at set times, which none of the top three do.",
    stats: [{ label: "Top earning", value: "#38", sub: "Fish It But RNG" }, { label: "Playing now", value: "48.2k", sub: "closest game" }, { label: "Likes", value: "92%" }, { label: "Upvotes a day", value: "3.1k" }, { label: "Similar games", value: "3", sub: "in the top 200" }],
    beats: [{ at: "First 60 seconds", text: "Free rod, first common in under 20 seconds, odds on screen." }, { at: "By minute 15", text: "First rare in the rain and enough coins for rod #2." }, { at: "Minutes 15 to 30", text: "Weather flips to fog. New fish, fresh index blanks." }],
    money: "2x luck, a weather skip, boats as cosmetics. Nothing that wins the leaderboard.",
    clip: "A 1 in a million fish breaking the water in a thunderstorm.",
    reuses: ["Roll and reveal", "Index pages", "Daily chest"],
    risks: ["Fish It ships its own weather update first.", "Fishing line physics are new for the team."],
  }, {
    id: id(), user_id: U, created_at: ago(1500), source: "pulse", status: "waiting", score: 7,
    title: "Co-op digs, 4 players per pit", summary: "An update for Dig Up a Dino: dig the big fossils together.",
    why: "Dig Up a Dino plays mostly solo and people leave by minute 6. Co-op digs in the top 50 hold players about twice as long.",
    stats: [{ label: "Avg session", value: "5m 40s", sub: "Dig Up a Dino" }, { label: "Co-op games", value: "2x", sub: "longer sessions" }],
    beats: [], money: "Bigger backpacks for the group.", clip: "Four players pulling a T-Rex skull out together.", reuses: ["Party system"], risks: ["Needs party matchmaking on phones."],
  }];

  const stickers: [Sticker, string, string, string | null][] = [
    ["gem", "Gem", "icon", "14520198334"], ["chest", "Daily chest", "icon", "14520198771"], ["coin", "Coin", "icon", "14520201004"], ["gift", "Free gift", "icon", "14520201221"],
    ["clover", "Luck", "icon", "14520203441"], ["potion", "Luck potion", "icon", "14520203998"], ["egg", "Dino egg", "model", "14521102330"], ["sword", "Starter sword", "model", "14521102552"],
    ["shovel", "Shovel", "model", "14521104000"], ["crown", "VIP", "icon", "14520207117"], ["scroll", "Quests", "icon", "14520207660"], ["bone", "Fossil", "model", null],
  ];
  s.assets = stickers.map(([k, name, kind, rid]) => ({ id: id(), user_id: U, created_at: ago(5000), game_id: null, name, kind: kind as "icon" | "model", roblox_id: rid, file_url: svgUrl(sticker(k)), tags: [] }));

  s.machines = [
    { id: id(), user_id: U, created_at: ago(9000), name: "Sam's PC", os: "windows", role: "worker", last_seen: ago(0), studio_slots: 4, provider: "claude" },
    { id: id(), user_id: U, created_at: ago(9000), name: "MacBook Air", os: "mac", role: "backup", last_seen: ago(30), studio_slots: 2, provider: "claude" },
    { id: id(), user_id: U, created_at: ago(9000), name: "iPhone", os: "ios", role: "remote", last_seen: ago(2), studio_slots: 0, provider: null },
  ];

  s.messages = [
    { id: id(), user_id: U, created_at: ago(14), game_id: anime.id, author: "you", text: "raid lava is broken and the weekly raid never resets", task_ids: [] },
    { id: id(), user_id: U, created_at: ago(13), game_id: anime.id, author: "lead", text: "Two separate bugs. Lava stacks damage because it uses Touched, and the weekly timer starts per server. Builder takes both, then Playtest runs it with two players.", task_ids: [lava.id] },
  ];

  s.game_stats = Array.from({ length: 72 }, (_, i) => ({
    id: id(), user_id: U, created_at: ago((71 - i) * 60), game_id: anime.id,
    playing: Math.max(4, Math.round(140 + 70 * Math.sin(i / 3.6) + 40 * Math.sin(i / 1.3) + (i > 50 ? 30 : 0))),
    visits: 1_200_000 + i * 900, favorites: 41000 + i * 12, up_votes: 9100 + i * 3, down_votes: 800,
  }));

  const chart = [["Fish It But RNG", "RNG, fishing", 48200, 92, 15400], ["Grow a Garden 2", "Sim, farming", 391000, 88, 352000], ["Steal a Pet", "PvP, collecting", 88400, 85, 70100],
    ["Build a Boat Tycoon", "Tycoon", 12900, 90, 6600], ["Dig to China RNG", "RNG, digging", 6100, 87, 2400], ["Obby but you're a cat", "Obby", 21700, 91, 17800], ["Anime Card Clash", "Cards, anime", 33000, 83, 37600]] as const;
  const snap = (min: number, now: boolean) => ({
    id: id(), user_id: U, created_at: ago(min), source: "roblox", sort: "rising",
    items: chart.map(([name, genre, playing, likes, before]) => ({ universe_id: null, name, genre, playing: now ? playing : before, likes })),
  });
  s.market_snapshots = [snap(60 * 24 * 7, false), snap(6, true)];

  s.usage_windows = [{ id: id(), user_id: U, created_at: ago(162), started_at: ago(162), used: 0.41, tokens: 1_640_000 }];
  return s;
}
