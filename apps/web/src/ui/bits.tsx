import { useEffect, useState, type ReactNode } from "react";
import { AGENT, type AgentId, type Who } from "@roslop/core";
import { db } from "../data/store";

const PATHS = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  lead: "M12 3l1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4z M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z",
  team: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  tasks: "M9 6h11 M9 12h11 M9 18h11 M4 6h.01 M4 12h.01 M4 18h.01",
  review: "M4 4h16v16H4z M8 12l3 3 5-6",
  coach: "M4 20h4L19 9l-4-4L4 16z M13 7l4 4 M15 20h5",
  games: "M6 11h4 M8 9v4 M15 12h.01 M18 10h.01 M17.3 5H6.7a4 4 0 0 0-3.96 3.43l-.9 6.3A2.5 2.5 0 0 0 6.2 17l2.3-2.5h7l2.3 2.5a2.5 2.5 0 0 0 4.36-2.27l-.9-6.3A4 4 0 0 0 17.3 5z",
  pitches: "M9 18h6 M10 22h4 M12 2a7 7 0 0 0-4 12.7V16h8v-1.3A7 7 0 0 0 12 2z",
  market: "M3 17l6-6 4 4 8-8 M15 7h6v6",
  library: "M3 7l9-4 9 4-9 4z M3 7v10l9 4 9-4V7 M12 11v10",
  vault: "M4 4h16v16H4z M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M12 12h.01 M4 9h2 M4 15h2",
  settings: "M4 6h9 M17 6h3 M4 12h3 M11 12h9 M4 18h11 M19 18h1 M15 4v4 M9 10v4 M17 16v4",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.3-4.3",
  plus: "M12 5v14 M5 12h14",
  up: "M12 19V5 M5 12l7-7 7 7",
  check: "M5 12l5 5L20 7",
  x: "M6 6l12 12 M18 6L6 18",
  msg: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  down: "M6 9l6 6 6-6",
  right: "M9 6l6 6-6 6",
  left: "M15 6l-6 6 6 6",
  clip: "M21.4 11.1l-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5",
  pause: "M7 4h3v16H7z M14 4h3v16h-3z",
  upload: "M12 20V8 M6 14l6-6 6 6 M4 4h16",
  ext: "M14 4h6v6 M20 4l-9 9 M18 14v6H4V6h6",
  key: "M15.5 7.5l3 3L22 7l-3-3 M21 2l-9.6 9.6 M7.5 21a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11z",
  studio: "M3 4h18v12H3z M8 20h8 M12 16v4",
  phone: "M7 2h10v20H7z M11 18h2",
  grid: "M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z",
  bell: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9 M10.3 21a1.94 1.94 0 0 0 3.4 0",
  more: "M5 12h.01 M12 12h.01 M19 12h.01",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 16, style }: { name: IconName; size?: number; style?: React.CSSProperties }) {
  return (
    <svg className="i" viewBox="0 0 24 24" style={{ width: size, height: size, ...style }}>
      <path d={PATHS[name]} />
    </svg>
  );
}

export function Logo({ size = 30 }: { size?: number }) {
  return <img src="./icon.svg" width={size} height={size} alt="" />;
}

export function Av({ who, size = "" }: { who: Who; size?: "" | "sm" | "lg" }) {
  if (who === "you") return <span className={`pfp`} style={{ width: size === "sm" ? 18 : 22, height: size === "sm" ? 18 : 22, fontSize: 9 }}>you</span>;
  const a = AGENT[who];
  if (!a) return <span className={`av ${size}`} style={{ "--c": "#9a998f" } as React.CSSProperties}>?</span>;
  return <span className={`av ${size}`} style={{ "--c": a.color } as React.CSSProperties} title={a.name}>{a.short}</span>;
}

export const agentName = (w: Who | string) => (w === "you" ? "You" : AGENT[w as AgentId]?.name ?? String(w));

export function Media({ src, kind = "image", tag, style, className = "" }: { src: string; kind?: "image" | "video"; tag?: string; style?: React.CSSProperties; className?: string }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    let alive = true;
    db.fileUrl(src).then(u => alive && setUrl(u));
    return () => {
      alive = false;
    };
  }, [src]);
  return (
    <div className={`media ${className}`} style={{ aspectRatio: "16/9", ...style }}>
      {url && (kind === "video" ? <video src={url} controls playsInline /> : <img src={url} alt="" />)}
      {tag && <span className="tag">{tag}</span>}
    </div>
  );
}

export function Ring({ value, size = 22, stroke = 3 }: { value: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flex: "none" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line-2)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--accent)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${c * Math.min(1, value)} ${c}`} />
    </svg>
  );
}

export function Spark({ data, w = 80, h = 22, color = "var(--ok)" }: { data: number[]; w?: number; h?: number; color?: string }) {
  if (data.length < 2) return <svg width={w} height={h} />;
  const mx = Math.max(...data), mn = Math.min(...data), dx = w / (data.length - 1);
  const d = data.map((v, i) => `${i ? "L" : "M"}${(i * dx).toFixed(1)} ${(h - 2 - ((v - mn) / (mx - mn || 1)) * (h - 4)).toFixed(1)}`).join(" ");
  return (
    <svg width={w} height={h} style={{ overflow: "visible", flex: "none" }}>
      <path d={`${d} L${w} ${h} L0 ${h}Z`} style={{ fill: color, opacity: 0.12 }} />
      <path d={d} style={{ fill: "none", stroke: color, strokeWidth: 1.5 }} />
    </svg>
  );
}

export interface Series {
  data: number[];
  color: string;
  area?: boolean;
}

export function LineChart({ series, labels = [], h = 190 }: { series: Series[]; labels?: string[]; h?: number }) {
  const w = 560, L = 36, B = 20, T = 6, iw = w - L - 6, ih = h - B - T;
  const top = Math.max(1, ...series.flatMap(s => s.data)) * 1.1;
  const fmt = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(Math.round(v)));
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      {[0, 1, 2, 3, 4].map(i => {
        const y = T + ih - (ih * i) / 4;
        return (
          <g key={i}>
            <line x1={L} x2={w - 6} y1={y} y2={y} style={{ stroke: "var(--line)", strokeDasharray: i ? "2 4" : "0" }} />
            <text x={L - 8} y={y + 3.5} textAnchor="end" style={{ fill: "var(--dim)", font: "10px var(--mono)" }}>{fmt((top * i) / 4)}</text>
          </g>
        );
      })}
      {labels.map((t, i) => (
        <text key={i} x={L + (iw * i) / Math.max(1, labels.length - 1)} y={h - 4} textAnchor={i === 0 ? "start" : i === labels.length - 1 ? "end" : "middle"} style={{ fill: "var(--dim)", font: "10px var(--mono)" }}>{t}</text>
      ))}
      {series.map((s, k) => {
        const dx = iw / Math.max(1, s.data.length - 1);
        const d = s.data.map((v, i) => `${i ? "L" : "M"}${(L + i * dx).toFixed(1)} ${(T + ih - (v / top) * ih).toFixed(1)}`).join(" ");
        return (
          <g key={k}>
            {s.area && <path d={`${d} L${L + iw} ${T + ih} L${L} ${T + ih}Z`} style={{ fill: s.color, opacity: 0.1 }} />}
            <path d={d} style={{ fill: "none", stroke: s.color, strokeWidth: 2, strokeLinejoin: "round" }} />
          </g>
        );
      })}
    </svg>
  );
}

export function Toggle({ on, onChange }: { on: boolean; onChange(v: boolean): void }) {
  return <button className={`toggle ${on ? "on" : ""}`} onClick={() => onChange(!on)} aria-pressed={on} />;
}

export function Seg<T extends string>({ value, options, onChange }: { value: T; options: [NoInfer<T>, ReactNode][]; onChange(v: NoInfer<T>): void }) {
  return (
    <div className="seg">
      {options.map(([v, label]) => (
        <button key={v} className={v === value ? "on" : ""} onClick={() => onChange(v)}>{label}</button>
      ))}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>;
}
