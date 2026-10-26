import { app, BrowserWindow } from "electron";
import { execFile } from "node:child_process";
import { createServer } from "node:http";
import { createHash } from "node:crypto";
import { chmodSync, copyFileSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

// The owner's style targets: gameplay videos (YouTube, X, TikTok...) and games by name. Videos
// are downloaded once with yt-dlp and turned into frames, so agents can see what the real thing
// looks like in play instead of guessing from a title. A game name becomes a YouTube search.

const win = process.platform === "win32";
const root = () => join(app.getPath("userData"), "style");
const tools = () => join(app.getPath("userData"), "tools");
const FRAMES = 16;

const isUrl = (s: string) => /^https?:\/\//i.test(s.trim());
const hash = (s: string) => createHash("sha1").update(s).digest("hex").slice(0, 12);

function exec(file: string, args: string[], timeout = 10 * 60_000, env?: NodeJS.ProcessEnv): Promise<string> {
  return new Promise((done, fail) => {
    execFile(file, args, { timeout, maxBuffer: 20 * 1024 * 1024, windowsHide: true, env: env ?? process.env }, (err, out, errOut) => {
      if (err) fail(new Error(String(errOut || err.message).trim().split("\n").slice(-2).join(" ")));
      else done(String(out));
    });
  });
}

async function ytdlp(): Promise<string> {
  for (const name of win ? ["yt-dlp.exe"] : ["yt-dlp"]) {
    for (const dir of (process.env.PATH ?? "").split(win ? ";" : ":")) {
      if (dir && existsSync(join(dir, name))) return join(dir, name);
    }
  }
  const file = join(tools(), win ? "yt-dlp.exe" : "yt-dlp");
  if (existsSync(file)) return file;
  mkdirSync(tools(), { recursive: true });
  const asset = win ? "yt-dlp.exe" : process.platform === "darwin" ? "yt-dlp_macos" : "yt-dlp";
  const res = await fetch(`https://github.com/yt-dlp/yt-dlp/releases/latest/download/${asset}`);
  if (!res.ok) throw new Error(`Couldn't download yt-dlp (${res.status})`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  if (!win) chmodSync(file, 0o755);
  return file;
}

// YouTube needs a JavaScript runtime now; the app's own Node does the job. When YouTube asks to
// prove you're not a bot, try again signed in with the owner's browser cookies.
const BROWSERS = ["firefox", "edge", "chrome", "brave"];
async function ytdl(args: string[], timeout?: number): Promise<string> {
  const bin = await ytdlp();
  const env = { ...process.env, ELECTRON_RUN_AS_NODE: "1" };
  const base = ["--js-runtimes", `node:${process.execPath}`, ...args];
  try {
    return await exec(bin, base, timeout, env);
  } catch (e) {
    if (!/sign in|not a bot|cookies/i.test((e as Error).message)) throw e;
    for (const b of BROWSERS) {
      try {
        return await exec(bin, ["--cookies-from-browser", b, ...base], timeout, env);
      } catch {}
    }
    throw new Error("YouTube wants a signed-in browser. Sign in to YouTube in Firefox, Edge or Chrome on this computer and it'll use that.");
  }
}

// Pulls frames spread across a video with a hidden window, which plays anything Chromium can.
async function grab(video: string, out: string): Promise<number> {
  const w = new BrowserWindow({ show: false, width: 800, height: 600, webPreferences: { offscreen: true, webSecurity: false, backgroundThrottling: false } });
  try {
    await w.loadURL("about:blank");
    const frames = (await w.webContents.executeJavaScript(`(async () => {
      const v = document.createElement("video");
      v.muted = true; v.preload = "auto"; v.src = ${JSON.stringify(pathToFileURL(video).href)};
      await new Promise((ok, bad) => { v.onloadedmetadata = ok; v.onerror = () => bad(new Error("can't play this video")); });
      const shots = [];
      const c = document.createElement("canvas");
      const scale = Math.min(1, 1280 / v.videoWidth);
      c.width = Math.round(v.videoWidth * scale); c.height = Math.round(v.videoHeight * scale);
      const g = c.getContext("2d");
      for (let i = 0; i < ${FRAMES}; i++) {
        // Skip the first and last bits, where intros and outros live.
        const t = v.duration * (0.08 + 0.86 * i / ${FRAMES - 1});
        await new Promise(ok => { v.onseeked = ok; v.currentTime = t; setTimeout(ok, 5000); });
        g.drawImage(v, 0, 0, c.width, c.height);
        shots.push(c.toDataURL("image/jpeg", 0.85));
      }
      return shots;
    })()`)) as string[];
    mkdirSync(out, { recursive: true });
    frames.forEach((d, i) => writeFileSync(join(out, `frame_${String(i + 1).padStart(2, "0")}.jpg`), Buffer.from(d.split(",")[1], "base64")));
    return frames.length;
  } finally {
    w.destroy();
  }
}

async function fromVideo(url: string, say: (t: string) => void): Promise<string | null> {
  const dir = join(root(), hash(url));
  if (existsSync(dir) && readdirSync(dir).some(f => f.startsWith("frame_"))) return dir;
  mkdirSync(dir, { recursive: true });
  say(`Downloading ${url} to look at`);
  await ytdl(["-f", "best[height<=720][ext=mp4]/best[height<=720]/best", "--no-playlist", "--max-filesize", "400M", "-o", join(dir, "video.%(ext)s"), url]);
  const video = readdirSync(dir).find(f => f.startsWith("video."));
  if (!video) return null;
  await grab(join(dir, video), dir);
  writeFileSync(join(dir, "source.txt"), url);
  return dir;
}

// Frames from a video already on disk (an upload).
export async function fileFrames(name: string, data: Buffer): Promise<string> {
  const dir = join(root(), hash(name));
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `video${name.slice(name.lastIndexOf("."))}`);
  writeFileSync(file, data);
  await grab(file, dir);
  return dir;
}

export async function videoFrames(url: string, say: (t: string) => void): Promise<string> {
  const dir = await fromVideo(url, say);
  if (!dir) throw new Error("no video found there");
  return dir;
}

// Agents can ask for frames from any gameplay video they find, through a small server only this
// computer can reach. The token in the prompt keeps other programs out.
let server: { port: number; token: string } | null = null;
export const frameServerInfo = () => server;
export function frameServer(): Promise<{ port: number; token: string }> {
  if (server) return Promise.resolve(server);
  const token = createHash("sha1").update(`${Math.random()}${Date.now()}`).digest("hex").slice(0, 16);
  return new Promise(done => {
    const s = createServer(async (req, res) => {
      const u = new URL(req.url ?? "/", "http://127.0.0.1");
      const url = u.searchParams.get("url"), out = u.searchParams.get("out");
      if (u.pathname !== "/frames" || u.searchParams.get("token") !== token || !url || !out) {
        res.writeHead(400).end("Use /frames?token=...&url=<video link>&out=<folder>");
        return;
      }
      try {
        const dir = await videoFrames(url, () => {});
        mkdirSync(out, { recursive: true });
        const frames = readdirSync(dir).filter(f => f.startsWith("frame_"));
        for (const f of frames) copyFileSync(join(dir, f), join(out, f));
        res.writeHead(200, { "content-type": "text/plain" }).end(`Saved ${frames.length} frames to ${out}. Read them, keep the good ones.`);
      } catch (e) {
        res.writeHead(500).end(`Couldn't get frames: ${(e as Error).message}`);
      }
    });
    s.listen(0, "127.0.0.1", () => {
      server = { port: (s.address() as { port: number }).port, token };
      done(server);
    });
  });
}

// A game name becomes its top gameplay videos on YouTube.
async function fromName(name: string, say: (t: string) => void): Promise<string[]> {
  const ids = (await ytdl(["--flat-playlist", "--print", "id", `ytsearch6:${name} roblox gameplay`], 90_000)).split("\n").map(s => s.trim()).filter(Boolean);
  const dirs: string[] = [];
  for (const id of ids.slice(0, 2)) {
    const d = await fromVideo(`https://www.youtube.com/watch?v=${id}`, say).catch(() => null);
    if (d) dirs.push(d);
  }
  return dirs;
}

// Copies frames for each style target into the job folder and says where they are.
export async function styleRefs(targets: string[], cwd: string, say: (t: string) => void): Promise<string[]> {
  const lines: string[] = [];
  for (const [i, raw] of targets.entries()) {
    const target = raw.trim();
    if (!target) continue;
    try {
      const dirs = isUrl(target) ? [await fromVideo(target, say)].filter((d): d is string => !!d) : await fromName(target, say);
      for (const [j, dir] of dirs.entries()) {
        const label = `${i + 1}${dirs.length > 1 ? String.fromCharCode(97 + j) : ""}`;
        const to = join(cwd, ".roslop", "refs", "style", label);
        mkdirSync(to, { recursive: true });
        for (const f of readdirSync(dir).filter(f => f.startsWith("frame_"))) {
          const from = join(dir, f);
          if (statSync(from).size) copyFileSync(from, join(to, f));
        }
        lines.push(`- .roslop/refs/style/${label}/ (${FRAMES} frames from ${isUrl(target) ? target : `a gameplay video of ${target}`})`);
      }
    } catch (e) {
      lines.push(`- Couldn't get ${target}: ${(e as Error).message}`);
    }
  }
  return lines;
}
