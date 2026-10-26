import type { SupabaseClient } from "@supabase/supabase-js";
import { groupOf, previewOf, type AgentId, type Asset, type Game, type Task } from "@roslop/core";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join, relative } from "node:path";
import { isVideo } from "./refs";
import { noteAgents } from "./vault";

// Agents can't see the database, so every job gets the owner's Library, references and vault
// notes picked out for it: the closest matches listed in the prompt and downloaded, everything
// else in .roslop/library.md with a link.

const STOP = new Set("the and for with that this from into make made use using your our you are was were have has but not all any can its it's add new more some them they then than what when where which who will just like also very get got".split(" "));

const words = (text: string) => [...new Set(text.toLowerCase().match(/[a-z][a-z0-9]{2,}/g) ?? [])].filter(w => !STOP.has(w));

// Which kinds of Library item each agent reaches for first.
const KINDS: Partial<Record<AgentId, string[]>> = {
  scenic: ["model", "reference", "vfx", "sound"],
  builder: ["model", "vfx", "sound", "animation", "ui"],
  frame: ["ui", "icon", "reference"],
  splash: ["icon", "reference", "model"],
  librarian: ["model", "vfx", "sound", "animation", "icon", "ui", "reference"],
  playtest: ["reference"],
  kid: ["reference"],
  architect: ["reference"],
  merchant: ["icon", "ui", "reference"],
};

// Vault folders each agent should look in, besides notes tagged for it.
const FOLDERS: Partial<Record<AgentId, string[]>> = {
  scenic: ["References/Building", "References/Modeling", "Design", "Lessons"],
  builder: ["References/Building", "References/VFX", "References/SFX", "References/Animation", "Design", "Lessons"],
  frame: ["References/UI", "Design", "Lessons"],
  splash: ["References/UI", "References/Modeling", "Design"],
  librarian: ["References", "Lessons"],
  architect: ["Design", "Game Types", "Lessons"],
  balance: ["Design", "Game Types"],
  merchant: ["Design", "Game Types", "References/UI"],
  playtest: ["Design", "Lessons"],
  kid: ["Design"],
};

function score(a: Asset, want: string[], kinds: string[], gameId: string | null) {
  const hay = `${a.name} ${groupOf(a.tags)} ${a.tags.join(" ")}`.toLowerCase();
  let s = want.reduce((n, w) => n + (hay.includes(w) ? 3 : 0), 0);
  const k = kinds.indexOf(a.kind);
  if (k >= 0) s += 2 - k * 0.2;
  if (gameId && a.game_id === gameId) s += 2;
  return s;
}

async function allAssets(db: SupabaseClient, gameId: string | null): Promise<Asset[]> {
  const rows: Asset[] = [];
  for (let from = 0; ; from += 1000) {
    let q = db.from("assets").select("*").order("created_at", { ascending: false }).range(from, from + 999);
    q = gameId ? q.or(`game_id.is.null,game_id.eq.${gameId}`) : q;
    const { data } = await q;
    rows.push(...((data ?? []) as Asset[]));
    if (!data || data.length < 1000) break;
  }
  return rows;
}

async function links(db: SupabaseClient, paths: string[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  for (let i = 0; i < paths.length; i += 100) {
    const { data } = await db.storage.from("files").createSignedUrls(paths.slice(i, i + 100), 7 * 86400);
    for (const d of data ?? []) if (d.path && d.signedUrl) out.set(d.path, d.signedUrl);
  }
  return out;
}

const stored = (p: string | null): p is string => !!p && !/^(https?|data|blob):/.test(p);

function walk(dir: string, out: string[], depth = 0) {
  if (depth > 6 || out.length > 4000) return;
  let list;
  try {
    list = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of list) {
    if (e.name.startsWith(".")) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out, depth + 1);
    else if (e.name.endsWith(".md")) out.push(p);
  }
}

function vaultNotes(vault: string, agent: AgentId, want: string[], game: Game | null): string[] {
  const files: string[] = [];
  walk(vault, files);
  const folders = FOLDERS[agent] ?? [];
  const ranked = files.map(f => {
    const rel = relative(vault, f).replace(/\\/g, "/");
    let head = "";
    try {
      head = readFileSync(f, "utf8").slice(0, 3000).toLowerCase();
    } catch {}
    let s = 0;
    if (noteAgents(head).includes(agent)) s += 4;
    if (folders.some(d => rel.startsWith(`${d}/`))) s += 3;
    if (game && rel.toLowerCase().includes(game.name.toLowerCase())) s += 6;
    const name = basename(f, ".md").toLowerCase();
    for (const w of want) {
      if (name.includes(w)) s += 3;
      else if (head.includes(w)) s += 1;
    }
    // The daily data notes are for reading through the CSV, not one by one.
    if (rel.startsWith("Game Types/") && !want.some(w => name.includes(w))) s -= 2;
    return { rel, s };
  });
  return ranked.filter(r => r.s >= 4).sort((a, b) => b.s - a.s).slice(0, 25).map(r => r.rel);
}

export async function gatherStuff(db: SupabaseClient, task: Task, game: Game | null, cwd: string, vault: string | null): Promise<string | null> {
  if (task.agent === "lead" || task.agent === "pulse") return null;
  const want = words(`${task.title} ${task.brief}`.replace(/^Reference files: .+$/m, ""));
  const kinds = KINDS[task.agent] ?? ["reference"];
  const out: string[] = [];

  const assets = await allAssets(db, task.game_id).catch(() => [] as Asset[]);
  if (assets.length) {
    const ranked = assets.map(a => ({ a, s: score(a, want, kinds, task.game_id) })).sort((x, y) => y.s - x.s);
    const files = ranked.slice(0, 300).map(r => r.a.file_url).filter(stored);
    const url = await links(db, files).catch(() => new Map<string, string>());

    // The whole Library, so nothing is out of reach.
    const dir = join(cwd, ".roslop");
    mkdirSync(join(dir, "refs", "library"), { recursive: true });
    const line = (a: Asset) => {
      const bits = [a.kind, groupOf(a.tags) || null, a.roblox_id ? `rbxassetid://${a.roblox_id}` : "not on Roblox yet", a.file_url && url.get(a.file_url) ? `[file](${url.get(a.file_url)})` : null];
      return `- ${a.name} (${bits.filter(Boolean).join(" · ")})`;
    };
    writeFileSync(join(dir, "library.md"), `# The owner's Library\n\nBest matches for this task first. Links work for 7 days.\n\n${ranked.map(r => line(r.a)).join("\n")}\n`);

    // Pull down the closest references so they can be looked at straight away.
    const refs = ranked.filter(r => r.a.kind === "reference" && stored(r.a.file_url) && (r.s > 0 || ranked.length < 40)).slice(0, 16);
    const got: string[] = [];
    for (const { a } of refs) {
      const p = a.file_url!;
      const { data } = await db.storage.from("files").download(isVideo(p) ? `${p}.frames.jpg` : (previewOf(a.tags) ?? p)).catch(() => ({ data: null }));
      if (!data) continue;
      const name = `${a.name.replace(/[^\w.-]+/g, "_")}${isVideo(p) ? ".frames.jpg" : p.slice(p.lastIndexOf("."))}`;
      writeFileSync(join(dir, "refs", "library", name), Buffer.from(await data.arrayBuffer()));
      got.push(`.roslop/refs/library/${name}${isVideo(p) ? " (frames from a video)" : ""}`);
    }

    const top = ranked.filter(r => r.a.kind !== "reference" && kinds.includes(r.a.kind) && (r.s >= 3 || assets.length <= 25)).slice(0, 25);
    out.push(`The owner's Library has ${assets.length} items. All of them are in .roslop/library.md, best matches first, with Roblox ids and download links.`);
    if (top.length) out.push("Closest to this task:", ...top.map(r => line(r.a).replace(/\[file\]\([^)]*\)/, "file in library.md")));
    if (got.length) out.push("", "Their references for this, already downloaded. Look at every one before you start:", ...got.map(g => `- ${g}`));
  }

  if (vault) {
    const notes = vaultNotes(vault, task.agent, want, game);
    if (notes.length) out.push("", `Vault notes to read first (in ${vault}):`, ...notes.map(n => `- ${n}`));
  }

  if (!out.length) return null;
  return [
    "## The owner's own stuff (use it)",
    "The owner made or picked all of this for their games, and they get annoyed when it's ignored. Read the notes, look at the references, and use Library items before making or finding anything new. Insert things that are on Roblox by their id (InsertService:LoadAsset or the Studio connection), and download files that aren't with the link. Match the references' style. Only make something new when nothing here fits, and say why.",
    "End your DONE line with \"Used:\" and the Library items, references and notes you actually used.",
    "",
    ...out,
  ].join("\n");
}
