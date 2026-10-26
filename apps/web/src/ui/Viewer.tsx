import { useEffect, useRef, useState } from "react";
import { db } from "../data/store";
import { Icon } from "./bits";

export interface ViewItem {
  src: string;
  kind?: "image" | "video";
  title?: string;
}

// One viewer for the whole app. Anything can open it with a list and where to start.
let listener: ((v: { items: ViewItem[]; at: number } | null) => void) | null = null;
export function openViewer(items: ViewItem[], at = 0) {
  listener?.({ items, at });
}

const MIN = 1;
const MAX = 8;

export function Viewer() {
  const [state, setState] = useState<{ items: ViewItem[]; at: number } | null>(null);
  const [url, setUrl] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number; moved: boolean } | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const item = state?.items[state.at];

  useEffect(() => {
    listener = setState;
    return () => {
      listener = null;
    };
  }, []);

  useEffect(() => {
    setZoom(1);
    setPos({ x: 0, y: 0 });
    setUrl("");
    if (!item) return;
    let alive = true;
    db.fileUrl(item.src).then(u => alive && setUrl(u));
    return () => {
      alive = false;
    };
  }, [item?.src]);

  const go = (d: number) => setState(s => (s ? { ...s, at: (s.at + d + s.items.length) % s.items.length } : s));
  const reset = () => {
    setZoom(1);
    setPos({ x: 0, y: 0 });
  };

  // Zoom toward the point under the cursor so what you're looking at stays put.
  const zoomAt = (next: number, cx?: number, cy?: number) => {
    const z = Math.min(MAX, Math.max(MIN, next));
    if (z === 1) return reset();
    const r = stage.current?.getBoundingClientRect();
    if (r && cx !== undefined && cy !== undefined) {
      const ox = cx - (r.left + r.width / 2);
      const oy = cy - (r.top + r.height / 2);
      setPos(p => ({ x: ox - ((ox - p.x) * z) / zoom, y: oy - ((oy - p.y) * z) / zoom }));
    }
    setZoom(z);
  };

  useEffect(() => {
    if (!state) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setState(null);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "+" || e.key === "=") zoomAt(zoom * 1.5);
      else if (e.key === "-") zoomAt(zoom / 1.5);
      else if (e.key === "0") reset();
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, [state, zoom]);

  if (!state || !item) return null;
  const video = item.kind === "video";

  return (
    <div className="viewer" onClick={() => setState(null)}>
      <div className="viewer-bar" onClick={e => e.stopPropagation()}>
        <b className="grow trunc">{item.title ?? ""}</b>
        {state.items.length > 1 && <span className="mono dim">{state.at + 1} / {state.items.length}</span>}
        {!video && (
          <>
            <button className="btn sm ghost" title="Zoom out (-)" onClick={() => zoomAt(zoom / 1.5)}>−</button>
            <span className="mono dim" style={{ width: 44, textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
            <button className="btn sm ghost" title="Zoom in (+)" onClick={() => zoomAt(zoom * 1.5)}>+</button>
            <button className="btn sm ghost" title="Fit (0)" onClick={reset}>Fit</button>
          </>
        )}
        {url && <a className="btn sm ghost" href={url} target="_blank" rel="noreferrer"><Icon name="ext" size={13} />Full size</a>}
        <button className="btn sm ghost" title="Close (Esc)" onClick={() => setState(null)}><Icon name="x" size={14} /></button>
      </div>
      <div
        ref={stage}
        className="viewer-stage"
        onClick={e => e.stopPropagation()}
        onWheel={e => !video && zoomAt(zoom * (e.deltaY < 0 ? 1.2 : 1 / 1.2), e.clientX, e.clientY)}
        onPointerDown={e => {
          if (video) return;
          drag.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y, moved: false };
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        }}
        onPointerMove={e => {
          const d = drag.current;
          if (!d) return;
          if (Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) > 4) d.moved = true;
          if (zoom > 1) setPos({ x: d.px + e.clientX - d.x, y: d.py + e.clientY - d.y });
        }}
        onPointerUp={e => {
          const d = drag.current;
          drag.current = null;
          // A click without dragging flips between fit and a close look at that spot.
          if (d && !d.moved && !video) zoom > 1 ? reset() : zoomAt(2.5, e.clientX, e.clientY);
        }}
        style={{ cursor: video ? "default" : zoom > 1 ? "grab" : "zoom-in" }}
      >
        {url && (video
          ? <video src={url} controls autoPlay playsInline style={{ maxWidth: "100%", maxHeight: "100%" }} />
          : <img src={url} alt="" draggable={false} style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})` }} />)}
      </div>
      {state.items.length > 1 && (
        <>
          <button className="viewer-nav l" onClick={e => { e.stopPropagation(); go(-1); }}><Icon name="right" size={18} style={{ transform: "rotate(180deg)" }} /></button>
          <button className="viewer-nav r" onClick={e => { e.stopPropagation(); go(1); }}><Icon name="right" size={18} /></button>
        </>
      )}
      <div className="viewer-hint dim small">Scroll or click to zoom · drag to look around · arrows for next · Esc to close</div>
    </div>
  );
}
