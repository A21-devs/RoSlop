import type { SupabaseClient } from "@supabase/supabase-js";
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { isVideo, refPaths } from "./refs";
import { fileFrames, videoFrames } from "./style";

// "Vault import" tasks: the owner pastes links or drops pictures on the Vault page and picks where
// they go. This computer pulls the pictures straight into References/<area>/img and links them in
// the topic's note. No AI involved, so it's instant and costs no usage.

export const IMPORT_TITLE = /^Vault import:/;

const AREAS = ["VFX", "Modeling", "Building", "SFX", "Animation", "UI"];
const FOR: Record<string, string> = {
  VFX: "builder, librarian, director", Modeling: "librarian, scenic, splash, director", Building: "scenic, builder, director, librarian",
  SFX: "builder, librarian", Animation: "builder, librarian, director", UI: "frame, splash, director",
};
const VIDEO_SITES = /(youtube\.com|youtu\.be|tiktok\.com|instagram\.com|medal\.tv|streamable\.com|twitch\.tv|\.mp4($|\?)|\.webm($|\?)|\.mov($|\?))/i;
const UA = { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36" };

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "ref";
const extFor = (type: string, url: string) => (type.includes("png") ? ".png" : type.includes("webp") ? ".webp" : type.includes("gif") ? ".gif" : type.includes("jpeg") || type.includes("jpg") ? ".jpg" : extname(new URL(url).pathname).slice(0, 5) || ".jpg");

async function getImage(url: string): Promise<{ data: Buffer; ext: string } | null> {
  const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(30_000) }).catch(() => null);
  const type = res?.headers.get("content-type") ?? "";
  if (!res?.ok || !type.startsWith("image/") || type.includes("svg")) return null;
  const data = Buffer.from(await res.arrayBuffer());
  // Icons, avatars and emoji aren't references.
  if (data.length < 15_000) return null;
  return { data, ext: extFor(type, url) };
}

// X posts: the fxtwitter API hands back the post's photos and videos without a login.
async function fromX(url: string): Promise<{ images: string[]; videos: string[] }> {
  const m = url.match(/(?:x|twitter)\.com\/([^/]+)\/status\/(\d+)/i);
  if (!m) return { images: [], videos: [] };
  const res = await fetch(`https://api.fxtwitter.com/${m[1]}/status/${m[2]}`, { headers: UA }).catch(() => null);
  const tweet = res?.ok ? ((await res.json()) as { tweet?: { media?: { photos?: { url: string }[]; videos?: { url: string }[] } } }).tweet : null;
  return { images: (tweet?.media?.photos ?? []).map(p => `${p.url}${p.url.includes("?") ? "&" : "?"}name=large`), videos: (tweet?.media?.videos ?? []).map(v => v.url) };
}

// Any other page: its share image plus the big pictures on it.
async function fromPage(url: string): Promise<string[]> {
  const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(30_000) }).catch(() => null);
  if (!res?.ok) return [];
  const type = res.headers.get("content-type") ?? "";
  if (type.startsWith("image/")) return [url];
  const html = await res.text();
  const found = [
    ...[...html.matchAll(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)(?::src)?["'][^>]+content=["']([^"']+)["']/gi)].map(m => m[1]),
    ...[...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)].map(m => m[1]),
  ];
  const abs = found.map(u => { try { return new URL(u.replace(/&amp;/g, "&"), url).href; } catch { return ""; } }).filter(u => /^https?:/.test(u) && !/\.svg|sprite|icon|logo|avatar|emoji|badge/i.test(u));
  return [...new Set(abs)].slice(0, 14);
}

export async function runImport(db: SupabaseClient, vault: string, brief: string, say: (t: string) => void): Promise<string> {
  const area = AREAS.find(a => new RegExp(`^Area: ${a}$`, "im").test(brief)) ?? "Building";
  const topic = brief.match(/^Topic: (.+)$/m)?.[1]?.trim() || area;
  const links = (brief.split(/^Links:$/m)[1] ?? "").split("\n").map(l => l.trim()).filter(l => /^https?:\/\//.test(l));
  const imgDir = join(vault, "References", area, "img");
  mkdirSync(imgDir, { recursive: true });
  const base = slug(topic);
  let n = readdirSync(imgDir).filter(f => f.startsWith(`${base}-`)).length;
  const saved: { file: string; from: string }[] = [];
  const keep = (data: Buffer, ext: string, from: string) => {
    const file = `${base}-${++n}${ext}`;
    writeFileSync(join(imgDir, file), data);
    saved.push({ file, from });
  };
  const failed: string[] = [];

  for (const link of links) {
    say(`Pulling ${link}`);
    try {
      let images: string[] = [], videos: string[] = [];
      if (/(x|twitter)\.com\/[^/]+\/status\//i.test(link)) ({ images, videos } = await fromX(link));
      else if (VIDEO_SITES.test(link)) videos = [link];
      else images = await fromPage(link);
      const before = saved.length;
      for (const u of images) {
        const img = await getImage(u);
        if (img) keep(img.data, img.ext, link);
      }
      for (const v of videos) {
        const dir = await videoFrames(v, say);
        // Eight frames spread across the video is plenty for a reference.
        const frames = readdirSync(dir).filter(f => f.startsWith("frame_")).sort().filter((_, i, all) => i % Math.max(1, Math.round(all.length / 8)) === 0).slice(0, 8);
        for (const f of frames) keep(readFileSync(join(dir, f)), ".jpg", link);
      }
      if (saved.length === before) failed.push(link);
    } catch (e) {
      failed.push(`${link} (${(e as Error).message})`);
    }
  }

  for (const p of refPaths(brief)) {
    const { data } = await db.storage.from("files").download(p);
    if (!data) continue;
    const buf = Buffer.from(await data.arrayBuffer());
    if (!isVideo(p)) {
      keep(buf, extname(p) || ".png", "uploaded");
      continue;
    }
    const dir = await fileFrames(p, buf).catch(() => null);
    if (!dir) {
      failed.push(`${p.split("/").pop()} (couldn't play it)`);
      continue;
    }
    const frames = readdirSync(dir).filter(f => f.startsWith("frame_")).sort().filter((_, i, all) => i % Math.max(1, Math.round(all.length / 8)) === 0).slice(0, 8);
    for (const f of frames) keep(readFileSync(join(dir, f)), ".jpg", "uploaded");
  }

  if (saved.length) {
    const note = join(vault, "References", area, `${topic.replace(/[\\/:*?"<>|]/g, "-")}.md`);
    if (!existsSync(note)) writeFileSync(note, `---\nfor: [${FOR[area]}]\ntags: [reference, ${slug(area)}]\n---\n\n# ${topic}\n\nReferences the owner picked. Match these.\n\n[[${area}]] · [[Home]]\n`);
    const day = new Date().toISOString().slice(0, 10);
    const bySource = new Map<string, string[]>();
    for (const s of saved) bySource.set(s.from, [...(bySource.get(s.from) ?? []), s.file]);
    const block = [...bySource].map(([from, files]) => `${from === "uploaded" ? "Uploaded" : `From ${from}`}\n\n${files.map(f => `![[${f}]]`).join("\n")}`).join("\n\n");
    appendFileSync(note, `\n## Added by the owner ${day}\n\n${block}\n`);
    const home = join(vault, "Home.md");
    if (existsSync(home) && !readFileSync(home, "utf8").includes(`[[${topic}]]`)) appendFileSync(home, `\n- [[${topic}]] (${area} references)\n`);
  }
  const where = `References/${area}/${topic}`;
  return [
    saved.length ? `Added ${saved.length} picture${saved.length === 1 ? "" : "s"} to ${where}.` : `Nothing could be pulled into ${where}.`,
    failed.length ? `Couldn't get pictures from: ${failed.join(", ")}.` : "",
  ].filter(Boolean).join(" ");
}
