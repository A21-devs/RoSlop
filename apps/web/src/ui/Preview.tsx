import { useEffect, useRef, useState } from "react";
import { previewOf, type Asset } from "@roslop/core";
import { makePreview } from "../data/actions";
import { db, toast, useSnap } from "../data/store";
import { describe, readRbx } from "./rbx";
import { Icon, Media } from "./bits";
import type { Ext } from "./three";

const ext = (path: string) => {
  const mime = path.match(/^data:([^;,]+)/)?.[1];
  if (mime) return mime.startsWith("audio/") ? "mp3" : mime.startsWith("video/") ? "mp4" : mime === "model/gltf-binary" ? "glb" : "";
  return path.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
};
const MODEL = ["glb", "gltf", "fbx", "obj"];
const AUDIO = ["mp3", "ogg", "wav", "m4a", "flac"];
const VIDEO = ["mp4", "webm", "mov"];

// Rendered previews are kept in this browser, so a model, picture or waveform is only worked
// out once. Finished ones are also held in memory, so a card scrolled back into view shows its
// picture straight away.
type Made = { image: string; animated?: boolean };
const memory = new Map<string, Promise<Made>>();
const ready = new Map<string, Made>();
let opened: Promise<IDBDatabase | null> | null = null;
function idb(): Promise<IDBDatabase | null> {
  return (opened ??= new Promise(done => {
    try {
      const r = indexedDB.open("roslop-previews", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("p");
      r.onsuccess = () => done(r.result);
      r.onerror = () => done(null);
    } catch {
      done(null);
    }
  }));
}
async function stored(key: string): Promise<Made | null> {
  const d = await idb();
  if (!d) return null;
  return new Promise(done => {
    const r = d.transaction("p").objectStore("p").get(key);
    r.onsuccess = () => done(r.result ?? null);
    r.onerror = () => done(null);
  });
}
async function keep(key: string, v: Made) {
  const d = await idb();
  d?.transaction("p", "readwrite").objectStore("p").put(v, key);
}
function cached(key: string, make: () => Promise<Made>) {
  if (!memory.has(key)) {
    memory.set(key, stored(key).then(async hit => {
      const v = hit ?? await make();
      if (!hit) void keep(key, v);
      ready.set(key, v);
      return v;
    }));
    memory.get(key)!.catch(() => memory.delete(key));
  }
  return memory.get(key)!;
}

function useMade(key: string, make: () => Promise<Made>) {
  const [made, setMade] = useState<Made | null>(() => ready.get(key) ?? null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!key) return;
    if (ready.has(key)) return setMade(ready.get(key)!);
    let alive = true;
    cached(key, make).then(v => alive && setMade(v), () => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [key]);
  return { made, failed };
}

function ModelPreview({ src, kind }: { src: string; kind: string }) {
  const type = ext(src) as Ext;
  const key = `still:${src}`;
  // The still from last time shows at once while the live render gets going.
  const [still, setStill] = useState<Made | null>(() => ready.get(key) ?? null);
  const [live, setLive] = useState(false);
  const [failed, setFailed] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const view = useRef<{ hover(on: boolean): void; stop(): void } | null>(null);

  useEffect(() => {
    let alive = true;
    if (!ready.has(key)) void stored(key).then(v => v && alive && (ready.set(key, v), setStill(s => s ?? v)));
    void import("./three").then(({ showModel }) => {
      if (!alive || !canvas.current) return;
      view.current = showModel(canvas.current, src, () => db.fileUrl(src), type, {
        ready(image, animated) {
          if (!alive) return;
          setLive(true);
          const v = { image, animated };
          ready.set(key, v);
          void keep(key, v);
        },
        failed() {
          if (alive) setFailed(true);
        },
      });
    });
    return () => {
      alive = false;
      view.current?.stop();
      view.current = null;
    };
  }, [src]);

  return (
    <div className="media preview" style={{ aspectRatio: "1" }} onMouseEnter={() => view.current?.hover(true)} onMouseLeave={() => view.current?.hover(false)}>
      <canvas ref={canvas} style={{ width: "100%", height: "100%", display: "block", position: "absolute", inset: 0, opacity: live ? 1 : 0 }} />
      {!live && (still ? <img src={still.image} alt="" style={{ objectFit: "contain" }} />
        : <div className="preview-note">{failed ? `Couldn't render this .${type}` : "Loading…"}</div>)}
      <span className="preview-tag">{still?.animated || kind === "animation" ? "animation" : `.${type}`}</span>
    </div>
  );
}

// Pictures in storage are shrunk once to card size, so a page of them doesn't download and
// decode every full-size file again on each visit.
function ImagePreview({ src }: { src: string }) {
  // Links (Roblox thumbnails), data and gifs are shown as they are.
  const direct = /^(https?|data|blob):/.test(src) || /\.gif$/i.test(src);
  const { made, failed } = useMade(direct ? "" : `img:${src}`, async () => {
    const blob = await (await fetch(await db.fileUrl(src))).blob();
    const bmp = await createImageBitmap(blob);
    const scale = Math.min(1, 360 / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * scale);
    c.height = Math.round(bmp.height * scale);
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
    bmp.close();
    return { image: c.toDataURL("image/webp", 0.82) };
  });
  if (direct || failed) return <Media src={src} style={{ aspectRatio: "1", background: "var(--raise)" }} />;
  return (
    <div className="media" style={{ aspectRatio: "1", background: "var(--raise)" }}>
      {made && <img src={made.image} alt="" decoding="async" />}
    </div>
  );
}

// One sound plays at a time across the whole Library.
let playing: { audio: HTMLAudioElement; stop: () => void } | null = null;

function SoundPreview({ src }: { src: string }) {
  const [on, setOn] = useState(false);
  const wave = useMade(`wave:${src}`, async () => {
      const url = await db.fileUrl(src);
      const buf = await (await fetch(url)).arrayBuffer();
      const ctx = new OfflineAudioContext(1, 1, 44100);
      const audio = await ctx.decodeAudioData(buf);
      const data = audio.getChannelData(0);
      const bars = 56;
      const step = Math.floor(data.length / bars) || 1;
      const peaks = Array.from({ length: bars }, (_, i) => {
        let m = 0;
        for (let j = i * step; j < (i + 1) * step && j < data.length; j += 16) m = Math.max(m, Math.abs(data[j]));
        return m;
      });
      const top = Math.max(...peaks, 0.01);
      const c = document.createElement("canvas");
      c.width = 280;
      c.height = 140;
      const g = c.getContext("2d")!;
      g.fillStyle = "#7a9cff";
      peaks.forEach((p, i) => {
        const h = Math.max(3, (p / top) * 110);
        g.fillRect(i * 5 + 2, 70 - h / 2, 3, h);
      });
      return { image: c.toDataURL("image/png") };
  }).made?.image;

  const toggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (on) return playing?.stop();
    playing?.stop();
    const audio = new Audio(await db.fileUrl(src));
    const stop = () => {
      audio.pause();
      setOn(false);
      if (playing?.audio === audio) playing = null;
    };
    audio.onended = stop;
    playing = { audio, stop };
    setOn(true);
    void audio.play();
  };
  useEffect(() => () => {
    if (on) playing?.stop();
  }, [on]);

  return (
    <div className="media preview" style={{ aspectRatio: "1", display: "grid", placeItems: "center", background: "var(--raise)" }}>
      {wave ? <img src={wave} alt="" style={{ objectFit: "contain", padding: 10 }} /> : <Icon name="right" size={22} style={{ color: "var(--dim)" }} />}
      <button className="preview-play" onClick={toggle} onDoubleClick={e => e.stopPropagation()} title={on ? "Stop" : "Play"}>{on ? "■" : "▶"}</button>
    </div>
  );
}

function VideoPreview({ src }: { src: string }) {
  const [url, setUrl] = useState("");
  const v = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    let alive = true;
    db.fileUrl(src).then(u => alive && setUrl(u));
    return () => {
      alive = false;
    };
  }, [src]);
  // Plays while it's on screen, stops when it scrolls away.
  useEffect(() => {
    const el = v.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? void el.play().catch(() => {}) : el.pause()), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [url]);
  return (
    <div className="media preview" style={{ aspectRatio: "1" }}>
      {url && <video ref={v} src={url} muted loop playsInline autoPlay preload="auto" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
    </div>
  );
}

function BlendPreview({ a, e }: { a: Asset; e: string }) {
  const s = useSnap();
  const asking = s.tasks.some(t => t.title === `Preview: ${a.name}` && ["queued", "working", "held"].includes(t.status));
  return (
    <div className="media preview" style={{ aspectRatio: "1", background: "var(--raise)" }}>
      <div className="preview-note" style={{ alignContent: "center" }}>
        <Icon name="library" size={22} style={{ color: "var(--accent-text)" }} />
        <div>.{e} file</div>
        <button className="btn sm" disabled={asking} onClick={ev => { ev.stopPropagation(); void makePreview(s, a).then(() => toast("Rendering it in Blender")); }} onDoubleClick={ev => ev.stopPropagation()}>{asking ? "Rendering…" : "Make preview"}</button>
      </div>
    </div>
  );
}

function RbxPreview({ a, src }: { a: Asset; src: string }) {
  const s = useSnap();
  const read = useMade(`rbx:${src}`, async () => {
    const sum = readRbx(await (await fetch(await db.fileUrl(src))).arrayBuffer());
    return { image: JSON.stringify({ ...describe(sum), error: sum.error }) };
  });
  const info = (read.made ? JSON.parse(read.made.image) : read.failed ? { kind: "other", line: "", detail: [], error: "Couldn't read this file" } : null) as (ReturnType<typeof describe> & { error?: string }) | null;
  const asking = s.tasks.some(t => t.title === `Preview: ${a.name}` && ["queued", "working", "held"].includes(t.status));
  return (
    <div className="media preview" style={{ aspectRatio: "1", background: "var(--raise)" }}>
      <div className="preview-note" style={{ alignContent: "center" }}>
        <Icon name={info?.kind === "animation" ? "right" : info?.kind === "vfx" ? "lead" : "library"} size={22} style={{ color: "var(--accent-text)" }} />
        <div style={{ fontSize: 11.5, color: "var(--text)", lineHeight: 1.35 }}>{info ? info.error ?? info.line : "Reading…"}</div>
        {!!info?.detail.length && <div className="dim" style={{ fontSize: 10.5 }}>{info.detail.slice(0, 3).join(", ")}</div>}
        <button className="btn sm" style={{ marginTop: 4 }} disabled={asking} onClick={e => { e.stopPropagation(); void makePreview(s, a).then(() => toast("The Librarian is rendering it in Studio")); }} onDoubleClick={e => e.stopPropagation()}>{asking ? "Rendering…" : "Make preview"}</button>
      </div>
      <span className="preview-tag">.{ext(src)}</span>
    </div>
  );
}

// What a Library card shows: a render for models and animations, a waveform for sounds, the
// clip for videos, the picture for everything else.
export function AssetPreview({ a }: { a: Asset }) {
  const src = a.file_url;
  if (!src) return <div style={{ aspectRatio: "1", background: "var(--raise)", borderRadius: 8 }} />;
  const e = ext(src);
  const rendered = previewOf(a.tags);
  if (rendered) {
    return (
      <div style={{ position: "relative" }}>
        <ImagePreview src={rendered} />
        <span className="preview-tag">.{e} · rendered in {e === "blend" ? "Blender" : "Studio"}</span>
      </div>
    );
  }
  if (e === "rbxm" || e === "rbxmx") return <RbxPreview a={a} src={src} />;
  if (MODEL.includes(e)) return <ModelPreview src={src} kind={a.kind} />;
  if (AUDIO.includes(e) || (a.kind === "sound" && !/^https?:/.test(src))) return <SoundPreview src={src} />;
  if (VIDEO.includes(e)) return <VideoPreview src={src} />;
  if (["blend", "dae", "stl"].includes(e)) return <BlendPreview a={a} e={e} />;
  return <ImagePreview src={src} />;
}
