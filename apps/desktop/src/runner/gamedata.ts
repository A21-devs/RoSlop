import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmdirSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Real numbers for hundreds of games, straight from Roblox, so the crew analyses data
// instead of guessing. No Claude usage: it's plain web requests.

export const SEARCHES = [
  "simulator", "tycoon", "obby", "brainrot", "steal a", "grow a", "tower defense", "rng", "clicker",
  "anime", "horror", "escape", "find the", "fishing", "pets", "incremental", "merge", "tsunami",
  "roleplay", "fighting", "survive", "story", "parkour", "idle", "battlegrounds",
];

export interface GameRow {
  universe_id: number;
  place_id: number;
  name: string;
  creator: string;
  verified: boolean;
  genre: string;
  subgenre: string;
  playing: number;
  visits: number;
  favorites: number;
  up: number;
  down: number;
  like_ratio: number | null;
  created: string;
  updated: string;
  age_days: number;
  max_players: number;
  lists: string[];
  url: string;
  icon: string | null;
  description: string;
}

interface Seen {
  universeId: number;
  name: string;
  totalUpVotes?: number;
  totalDownVotes?: number;
  isSponsored?: boolean;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function getJson<T>(url: string): Promise<T | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
      if (res.status === 429) {
        await sleep(2000 * (attempt + 1));
        continue;
      }
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch {
      await sleep(1000);
    }
  }
  return null;
}

async function charts(found: Map<number, { seen: Seen; lists: Set<string> }>, session: string) {
  let token = "";
  for (let page = 0; page < 12; page++) {
    const d = await getJson<{ sorts: { sortId: string; sortDisplayName?: string; games?: Seen[] }[]; nextSortsPageToken?: string }>(
      `https://apis.roblox.com/explore-api/v1/get-sorts?sessionId=${session}&device=computer&country=all${token ? `&sortsPageToken=${token}` : ""}`,
    );
    if (!d) break;
    for (const s of d.sorts ?? []) for (const g of s.games ?? []) add(found, g, s.sortDisplayName || s.sortId);
    if (!d.nextSortsPageToken) break;
    token = encodeURIComponent(d.nextSortsPageToken);
  }
}

async function search(found: Map<number, { seen: Seen; lists: Set<string> }>, session: string, q: string, pages: number) {
  let token = "";
  for (let page = 0; page < pages; page++) {
    const d = await getJson<{ searchResults: { contentGroupType: string; contents: Seen[] }[]; nextPageToken?: string }>(
      `https://apis.roblox.com/search-api/omni-search?searchQuery=${encodeURIComponent(q)}&sessionId=${session}&pageType=all${token ? `&pageToken=${token}` : ""}`,
    );
    if (!d) break;
    for (const r of d.searchResults ?? []) if (r.contentGroupType === "Game") for (const g of r.contents) add(found, g, `Search: ${q}`);
    if (!d.nextPageToken) break;
    token = encodeURIComponent(d.nextPageToken);
  }
}

function add(found: Map<number, { seen: Seen; lists: Set<string> }>, g: Seen, list: string) {
  if (!g?.universeId || g.isSponsored) return;
  const had = found.get(g.universeId);
  if (had) had.lists.add(list);
  else found.set(g.universeId, { seen: g, lists: new Set([list]) });
}

async function inBatches<T>(ids: number[], size: number, fn: (chunk: number[]) => Promise<T[]>): Promise<T[]> {
  const chunks: number[][] = [];
  for (let i = 0; i < ids.length; i += size) chunks.push(ids.slice(i, i + size));
  const out: T[] = [];
  for (let i = 0; i < chunks.length; i += 4) {
    const parts = await Promise.all(chunks.slice(i, i + 4).map(fn));
    parts.forEach(p => out.push(...p));
  }
  return out;
}

export async function pullGames(opts: { searches?: string[]; pages?: number; onProgress?: (text: string) => void } = {}): Promise<GameRow[]> {
  const session = randomUUID();
  const found = new Map<number, { seen: Seen; lists: Set<string> }>();
  opts.onProgress?.("Reading the Roblox charts");
  await charts(found, session);
  const searches = opts.searches ?? SEARCHES;
  for (let i = 0; i < searches.length; i += 4) {
    opts.onProgress?.(`Searching (${found.size} games so far)`);
    await Promise.all(searches.slice(i, i + 4).map(q => search(found, session, q, opts.pages ?? 2)));
  }

  const ids = [...found.keys()];
  opts.onProgress?.(`Getting numbers for ${ids.length} games`);
  type Info = {
    id: number; rootPlaceId: number; name: string; description: string | null; creator: { name: string; hasVerifiedBadge: boolean };
    playing: number; visits: number; favoritedCount: number; maxPlayers: number; created: string; updated: string;
    genre_l1?: string; genre_l2?: string; genre?: string;
  };
  const info = await inBatches(ids, 50, c => getJson<{ data: Info[] }>(`https://games.roblox.com/v1/games?universeIds=${c.join(",")}`).then(d => d?.data ?? []));
  const votes = await inBatches(ids, 50, c =>
    getJson<{ data: { id: number; upVotes: number; downVotes: number }[] }>(`https://games.roblox.com/v1/games/votes?universeIds=${c.join(",")}`).then(d => d?.data ?? []),
  );
  const icons = await inBatches(ids, 100, c =>
    getJson<{ data: { targetId: number; imageUrl: string | null }[] }>(
      `https://thumbnails.roblox.com/v1/games/icons?universeIds=${c.join(",")}&size=150x150&format=Png&isCircular=false`,
    ).then(d => d?.data ?? []),
  );
  const voteBy = new Map(votes.map(v => [v.id, v]));
  const iconBy = new Map(icons.map(i => [i.targetId, i.imageUrl]));

  const now = Date.now();
  return info
    .map(g => {
      const f = found.get(g.id)!;
      const v = voteBy.get(g.id);
      const up = v?.upVotes ?? f.seen.totalUpVotes ?? 0;
      const down = v?.downVotes ?? f.seen.totalDownVotes ?? 0;
      return {
        universe_id: g.id,
        place_id: g.rootPlaceId,
        name: g.name,
        creator: g.creator?.name ?? "",
        verified: !!g.creator?.hasVerifiedBadge,
        genre: g.genre_l1 || g.genre || "",
        subgenre: g.genre_l2 || "",
        playing: g.playing ?? 0,
        visits: g.visits ?? 0,
        favorites: g.favoritedCount ?? 0,
        up,
        down,
        like_ratio: up + down > 0 ? Math.round((up / (up + down)) * 1000) / 10 : null,
        created: g.created?.slice(0, 10) ?? "",
        updated: g.updated?.slice(0, 10) ?? "",
        age_days: g.created ? Math.floor((now - Date.parse(g.created)) / 86_400_000) : 0,
        max_players: g.maxPlayers ?? 0,
        lists: [...f.lists],
        url: `https://www.roblox.com/games/${g.rootPlaceId}`,
        icon: iconBy.get(g.id) ?? null,
        description: (g.description ?? "").trim(),
      };
    })
    .sort((a, b) => b.playing - a.playing);
}

// Signs of a quick, low effort game. A flag to check, not a verdict.
export function slopSigns(g: GameRow): string[] {
  const signs: string[] = [];
  if (g.age_days <= 90) signs.push("under 3 months old");
  if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(g.name)) signs.push("emoji in the title");
  if (/\[(new|update|upd|release|event|\d+x)/i.test(g.name) || /\b(UPD|NEW!?)\b/.test(g.name)) signs.push("[NEW]/[UPD] tag in the title");
  if (/brainrot|steal a|grow a|skibidi|67\b|tung|sahur|italian/i.test(g.name)) signs.push("trend name");
  if (g.description.length < 80) signs.push("almost no description");
  if (!g.verified) signs.push("unverified creator");
  if (g.visits > 0 && g.favorites / g.visits < 0.002) signs.push("few people favorite it");
  return signs;
}

export function looksQuick(g: GameRow): boolean {
  return g.age_days <= 180 && slopSigns(g).length >= 3;
}

const fmt = (n: number) => n.toLocaleString("en-US");

function fileName(name: string) {
  return name.replace(/[<>:"/\\|?*#^[\]]/g, "").replace(/[\u0000-\u001f]/g, "").replace(/\s+/g, " ").trim().replace(/[. ]+$/, "").slice(0, 80) || "Untitled";
}

const START = "<!-- roslop:data -->";
const END = "<!-- /roslop:data -->";
export const TYPES_DIR = "Game Types";
const WRITE_HEAD = "## What works in this type";

// A game's type is its Roblox subgenre (Tycoon, Tower Defense...), or its genre when it has none.
const typeOf = (g: GameRow) => g.subgenre || g.genre || "Other";
const genreOf = (g: GameRow) => g.genre || "Other";

const cellName = (s: string) => s.replace(/[|[\]]/g, "").trim();
const gameCell = (g: GameRow) => `[${cellName(g.name)}](${g.url})`;
const likes = (g: GameRow) => (g.like_ratio === null ? "-" : `${g.like_ratio}%`);

function gameTable(list: GameRow[], extra?: { head: string; cell: (g: GameRow) => string }): string {
  const head = `| Game | Playing | Visits | Likes | Age |${extra ? ` ${extra.head} |` : ""}`;
  const line = `|---|---|---|---|---|${extra ? "---|" : ""}`;
  return [head, line, ...list.map(g => `| ${gameCell(g)} | ${fmt(g.playing)} | ${fmt(g.visits)} | ${likes(g)} | ${g.age_days}d |${extra ? ` ${extra.cell(g)} |` : ""}`)].join("\n");
}

function stats(gs: GameRow[]) {
  const total = gs.reduce((s, g) => s + g.playing, 0);
  const rated = gs.filter(g => g.like_ratio !== null);
  return {
    n: gs.length,
    total,
    med: median(gs.map(g => g.playing)),
    young: gs.filter(g => g.age_days <= 120).length,
    quick: gs.filter(looksQuick).length,
    like: rated.length ? Math.round(rated.reduce((s, g) => s + (g.like_ratio ?? 0), 0) / rated.length) : null,
    top3share: total ? Math.round((gs.slice(0, 3).reduce((s, g) => s + g.playing, 0) / total) * 100) : 0,
  };
}

function statLine(gs: GameRow[]) {
  const st = stats(gs);
  return `${st.n} games, ${fmt(st.total)} playing now, median ${fmt(st.med)} per game, average likes ${st.like ?? "-"}%. ${st.young} made in the last 4 months, ${st.quick} with quick game signs. The top 3 hold ${st.top3share}% of the players.`;
}

// Keeps whatever the crew wrote outside the data block.
function withCrewText(file: string, fresh: string): string {
  if (!existsSync(file)) return fresh;
  const old = readFileSync(file, "utf8");
  if (!old.includes(START) || !old.includes(END)) return fresh;
  const block = fresh.slice(fresh.indexOf(START), fresh.indexOf(END) + END.length);
  const front = fresh.match(/^---[\s\S]*?---\n/)?.[0] ?? "";
  return front + old.replace(/^---[\s\S]*?---\n/, "").replace(new RegExp(`${START}[\\s\\S]*?${END}`), () => block);
}

function typeNote(type: string, genre: string, gs: GameRow[], siblings: string[], day: string): string {
  const fresh = gs.filter(g => g.age_days <= 120).sort((a, b) => b.playing - a.playing).slice(0, 15);
  const quick = gs.filter(looksQuick).slice(0, 20);
  const tag = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return [
    "---",
    `tags: [game-type, ${tag(genre)}${tag(type) !== tag(genre) ? `, ${tag(type)}` : ""}]`,
    `games: ${gs.length}`,
    `playing: ${gs.reduce((s, g) => s + g.playing, 0)}`,
    "---",
    "",
    `# ${type}`,
    "",
    START,
    `Part of [[${fileName(genre)}|${genre}]].${siblings.length ? ` Other ${genre} types: ${siblings.map(t => `[[${fileName(t)}|${t}]]`).join(", ")}.` : ""} Back to [[Game Types]].`,
    "",
    statLine(gs),
    "",
    "### Biggest",
    gameTable(gs.slice(0, 40)),
    fresh.length ? `\n### New and already pulling players\n${gameTable(fresh)}` : null,
    quick.length ? `\n### Quick game signs\nUnder 6 months old with at least 3 signs of a fast, low effort build. Check before calling them slop.\n\n${gameTable(quick, { head: "Signs", cell: g => slopSigns(g).join(", ") })}` : null,
    gs.length > 40 ? `\n${gs.length - 40} more in the data file.` : null,
    "",
    `Numbers pulled ${day}.`,
    END,
    "",
    WRITE_HEAD,
    "",
  ].filter(l => l !== null).join("\n");
}

function genreNote(genre: string, gs: GameRow[], types: Map<string, GameRow[]>, day: string): string {
  const rows = [...types.entries()].sort((a, b) => stats(b[1]).total - stats(a[1]).total);
  return [
    "---",
    `tags: [genre]`,
    `games: ${gs.length}`,
    "---",
    "",
    `# ${genre}`,
    "",
    START,
    `Back to [[Game Types]].`,
    "",
    statLine(gs),
    "",
    "| Type | Games | Playing now | Median | New | Quick |",
    "|---|---|---|---|---|---|",
    ...rows.map(([t, list]) => {
      const st = stats(list);
      const name = t === genre ? `${genre} (no subtype)` : `[[${fileName(t)}\\|${t}]]`;
      return `| ${name} | ${st.n} | ${fmt(st.total)} | ${fmt(st.med)} | ${st.young} | ${st.quick} |`;
    }),
    "",
    "### Biggest",
    gameTable(gs.slice(0, 15), { head: "Type", cell: g => (typeOf(g) === genre ? "-" : `[[${fileName(typeOf(g))}\\|${typeOf(g)}]]`) }),
    "",
    `Numbers pulled ${day}.`,
    END,
    "",
    "## What works in this genre",
    "",
  ].join("\n");
}

function csv(rows: GameRow[]): string {
  const cols: (keyof GameRow)[] = ["universe_id", "name", "creator", "genre", "subgenre", "playing", "visits", "favorites", "up", "down", "like_ratio", "created", "updated", "age_days", "max_players", "url"];
  const cell = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [[...cols, "lists"].join(","), ...rows.map(r => [...cols.map(c => cell(r[c])), cell(r.lists.join("; "))].join(","))].join("\n");
}

function median(ns: number[]) {
  if (!ns.length) return 0;
  const s = [...ns].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

function chartsNote(rows: GameRow[], day: string): string {
  const typeLink = (g: GameRow) => `[[${fileName(typeOf(g))}\\|${typeOf(g)}]]`;
  const fresh = rows.filter(g => g.age_days <= 120).sort((a, b) => b.playing - a.playing).slice(0, 30);
  const quick = rows.filter(g => looksQuick(g) && g.playing >= 100).sort((a, b) => b.playing - a.playing).slice(0, 40);
  const loved = rows.filter(g => g.playing >= 1000 && g.like_ratio !== null).sort((a, b) => (b.like_ratio ?? 0) - (a.like_ratio ?? 0)).slice(0, 20);
  const genres = new Map<string, GameRow[]>();
  for (const g of rows) genres.set(genreOf(g), [...(genres.get(genreOf(g)) ?? []), g]);
  const genreRows = [...genres.entries()].map(([k, gs]) => ({ k, ...stats(gs) })).sort((a, b) => b.total - a.total);
  const withType = { head: "Type", cell: typeLink };

  return [
    "---",
    "for: [pulse, architect, lead, merchant, splash, frame]",
    "tags: [market, data]",
    "---",
    "",
    `# Charts ${day}`,
    "",
    `${rows.length} games pulled from the Roblox charts and searches on ${day}, with ${fmt(rows.reduce((s, g) => s + g.playing, 0))} people playing them right now. Every game sits in its type's note in [[Game Types]]. Raw data: Market/Data/games-${day}.csv.`,
    "",
    "## By genre",
    "| Genre | Games | Playing now | Median per game | New | Quick |",
    "|---|---|---|---|---|---|",
    ...genreRows.map(r => `| [[${fileName(r.k)}\\|${r.k}]] | ${r.n} | ${fmt(r.total)} | ${fmt(r.med)} | ${r.young} | ${r.quick} |`),
    "",
    "## Most played",
    gameTable(rows.slice(0, 30), withType),
    "",
    "## New and already big",
    gameTable(fresh, withType),
    "",
    "## Quick game signs",
    "Under 6 months old with at least 3 signs of a fast, low effort build (emoji or [NEW] titles, trend names, thin description, unverified creator, few favorites). Check before calling any of them slop.",
    "",
    gameTable(quick, { head: "Type · signs", cell: g => `${typeLink(g)} · ${slopSigns(g).join(", ")}` }),
    "",
    "## Best liked with 1k+ playing",
    gameTable(loved, withType),
    "",
  ].join("\n");
}

export interface PullResult {
  count: number;
  day: string;
  csv: string;
  charts: string;
  types: number;
}

// Per-game notes from older versions, removed when nobody wrote anything in them.
function clearGameNotes(vault: string) {
  const dir = join(vault, "References", "Games");
  let files: string[] = [];
  try {
    files = readdirSync(dir).filter(f => f.endsWith(".md"));
  } catch {
    return;
  }
  for (const f of files) {
    const p = join(dir, f);
    try {
      const text = readFileSync(p, "utf8");
      const written = text.split("## What we take from it")[1]?.trim();
      if (text.includes(START) && !written) unlinkSync(p);
    } catch {}
  }
  try {
    if (!readdirSync(dir).length) rmdirSync(dir);
  } catch {}
}

export function writeGames(vault: string, rows: GameRow[]): PullResult {
  const day = new Date().toISOString().slice(0, 10);
  const dataDir = join(vault, "Market", "Data");
  const typesDir = join(vault, TYPES_DIR);
  mkdirSync(dataDir, { recursive: true });
  mkdirSync(typesDir, { recursive: true });

  writeFileSync(join(dataDir, `games-${day}.csv`), csv(rows));
  writeFileSync(join(dataDir, `games-${day}.json`), JSON.stringify(rows, null, 1));

  const byGenre = new Map<string, Map<string, GameRow[]>>();
  for (const g of rows) {
    const types = byGenre.get(genreOf(g)) ?? new Map<string, GameRow[]>();
    types.set(typeOf(g), [...(types.get(typeOf(g)) ?? []), g]);
    byGenre.set(genreOf(g), types);
  }

  let typeCount = 0;
  const index: string[] = [];
  const genres = [...byGenre.entries()].sort((a, b) => sum(b[1]) - sum(a[1]));
  for (const [genre, types] of genres) {
    const all = [...types.values()].flat().sort((a, b) => b.playing - a.playing);
    const file = join(typesDir, `${fileName(genre)}.md`);
    writeFileSync(file, withCrewText(file, genreNote(genre, all, types, day)));
    const subtypes = [...types.keys()].filter(t => t !== genre);
    index.push(`- [[${fileName(genre)}|${genre}]] (${all.length} games)${subtypes.length ? `: ${subtypes.map(t => `[[${fileName(t)}|${t}]]`).join(", ")}` : ""}`);
    for (const t of subtypes) {
      const tf = join(typesDir, `${fileName(t)}.md`);
      writeFileSync(tf, withCrewText(tf, typeNote(t, genre, types.get(t)!, subtypes.filter(x => x !== t), day)));
      typeCount++;
    }
  }
  writeFileSync(
    join(typesDir, "Game Types.md"),
    ["---", "for: [lead, architect, pulse, merchant, frame, splash]", "tags: [game-type, index]", "---", "", "# Game Types", "", `Every game from the ${day} pull, sorted into its genre and type. Each type note lists its games with real numbers and has room for what we learn about it.`, "", ...index, "", `Charts: [[Charts ${day}]]`, ""].join("\n"),
  );
  clearGameNotes(vault);

  const charts = join(vault, "Market", `Charts ${day}.md`);
  writeFileSync(charts, chartsNote(rows, day));
  return { count: rows.length, day, csv: join(dataDir, `games-${day}.csv`), charts, types: typeCount + genres.length };
}

const sum = (types: Map<string, GameRow[]>) => [...types.values()].flat().reduce((s, g) => s + g.playing, 0);

// The newest data file in a vault, for telling agents it's there.
export function latestPull(vault: string): { day: string; csv: string; count: number } | null {
  const dir = join(vault, "Market", "Data");
  try {
    const day = readdirSync(dir).filter(f => /^games-\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort().pop()?.slice(6, 16);
    if (!day) return null;
    const count = (JSON.parse(readFileSync(join(dir, `games-${day}.json`), "utf8")) as unknown[]).length;
    return { day, csv: join(dir, `games-${day}.csv`), count };
  } catch {
    return null;
  }
}
