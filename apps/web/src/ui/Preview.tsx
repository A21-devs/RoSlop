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

// Rendered previews are kept in this browser, so a model or waveform is only worked out once.
const memory = new Map<string, Promise<{ image: string; animated?: boolean }>>();
function idb(): Promise<IDBDatabase | null> {
  return new Promise(done => {
    try {
      const r = indexedDB.open("roslop-previews", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("p");
      r.onsuccess = () => done(r.result);
      r.onerror = () => done(null);
    } catch {
      done(null);
    }
  });
}
async function stored(key: string): Promise<{ image: string; animated?: boolean } | null> {
  const d = await idb();
  if (!d) return null;
  return new Promise(done => {
    const r = d.transaction("p").objectStore("p").get(key);
    r.onsuccess = () => done(r.result ?? null);
    r.onerror = () => done(null);
  });
}
async function keep(key: string, v: { image: string; animated?: boolean }) {
  const d = await idb();
  d?.transaction("p", "readwrite").objectStore("p").put(v, key);
}
function cached(key: string, make: () => Promise<{ image: string; animated?: boolean }>) {
  if (!memory.has(key)) {
    memory.set(key, stored(key).then(async hit => {
      if (hit) return hit;
      const v = await make();
      void keep(key, v);
      return v;
    }));
  }
  return memory.get(key)!;
}

function ModelPreview({ src, kind }: { src: string; kind: string }) {
  const [thumb, setThumb] = useState<{ image: string; animated?: boolean } | null>(null);
  const [failed, setFailed] = useState(false);
  const [hover, setHover] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const type = ext(src) as Ext;

  useEffect(() => {
    let alive = true;
    cached(`model:${src}`, async () => {
      const [{ renderThumb }, url] = await Promise.all([import("./three"), db.fileUrl(src)]);
      return renderThumb(url, type);
    }).then(t => alive && setThumb(t), () => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [src]);

  useEffect(() => {
    if (!hover || !canvas.current) return;
    let stop = () => {};
    let alive = true;
    Promise.all([import("./three"), db.fileUrl(src)]).then(([{ liveView }, url]) => {
      if (alive && canvas.current) stop = liveView(canvas.current, url, type);
    });
    return () => {
      alive = false;
      stop();
    };
  }, [hover, src]);

  return (
    <div className="media preview" style={{ aspectRatio: "1" }} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {hover ? <canvas ref={canvas} style={{ width: "100%", height: "100%", display: "block" }} />
        : thumb ? <img src={thumb.image} alt="" style={{ objectFit: "contain" }} />
        : <div className="preview-note">{failed ? `Couldn't render this .${type}` : "Rendering…"}</div>}
      <span className="preview-tag">{thumb?.animated || kind === "animation" ? <><Icon name="right" size={10} />hover to play</> : `.${type}`}</span>
    </div>
  );
}

// One sound plays at a time across the whole Library.
let playing: { audio: HTMLAudioElement; stop: () => void } | null = null;

function SoundPreview({ src }: { src: string }) {
  const [wave, setWave] = useState<string | null>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    let alive = true;
    cached(`wave:${src}`, async () => {
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
      return { image: c.toDataURL("image/png"), animated: false, length: audio.duration } as { image: string };
    }).then(v => alive && setWave(v.image), () => {});
    return () => {
      alive = false;
    };
  }, [src]);

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
  return (
    <div className="media preview" style={{ aspectRatio: "1" }} onMouseEnter={() => void v.current?.play().catch(() => {})} onMouseLeave={() => { if (v.current) { v.current.pause(); v.current.currentTime = 0; } }}>
      {url && <video ref={v} src={url} muted loop playsInline preload="metadata" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
      <span className="preview-tag"><Icon name="right" size={10} />hover to play</span>
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
  const [info, setInfo] = useState<ReturnType<typeof describe> & { error?: string } | null>(null);
  useEffect(() => {
    let alive = true;
    cached(`rbx:${src}`, async () => {
      const url = await db.fileUrl(src);
      const sum = readRbx(await (await fetch(url)).arrayBuffer());
      return { image: JSON.stringify({ ...describe(sum), error: sum.error }) };
    }).then(v => alive && setInfo(JSON.parse(v.image)), e => alive && setInfo({ kind: "other", line: "", detail: [], error: String(e) }));
    return () => {
      alive = false;
    };
  }, [src]);
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
        <Media src={rendered} style={{ aspectRatio: "1", background: "var(--raise)" }} />
        <span className="preview-tag">.{e} · rendered in {e === "blend" ? "Blender" : "Studio"}</span>
      </div>
    );
  }
  if (e === "rbxm" || e === "rbxmx") return <RbxPreview a={a} src={src} />;
  if (MODEL.includes(e)) return <ModelPreview src={src} kind={a.kind} />;
  if (AUDIO.includes(e) || (a.kind === "sound" && !/^https?:/.test(src))) return <SoundPreview src={src} />;
  if (VIDEO.includes(e)) return <VideoPreview src={src} />;
  if (["blend", "dae", "stl"].includes(e)) return <BlendPreview a={a} e={e} />;
  return <Media src={src} style={{ aspectRatio: "1", background: "var(--raise)" }} />;
}
