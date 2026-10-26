import { useRef, useState } from "react";

export interface Line {
  name: string;
  data: number[];
  color: string;
  area?: boolean;
}

export interface Mark {
  at: number;
  label: string;
}

const short = (v: number) => (Math.abs(v) >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${Math.round(v * 10) / 10}`);

// A line or bar chart you can hover: a guide line follows the mouse and a tooltip shows every
// series at that point, with its time. Marks put a dashed line where something happened.
export function Chart({ lines, labels, marks = [], h = 200, bars = false, unit = "", fmtX }: {
  lines: Line[];
  labels: string[];
  marks?: Mark[];
  h?: number;
  bars?: boolean;
  unit?: string;
  fmtX?: (i: number) => string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const n = Math.max(0, ...lines.map(l => l.data.length));
  if (n < 2 && !bars) return <div className="muted small">Not enough readings yet.</div>;

  const w = 600, L = 44, R = 10, T = 10, B = 24, iw = w - L - R, ih = h - T - B;
  const top = Math.max(1, ...lines.flatMap(l => l.data)) * 1.1;
  const step = bars ? iw / n : iw / Math.max(1, n - 1);
  const x = (i: number) => (bars ? L + step * i + step / 2 : L + step * i);
  const y = (v: number) => T + ih - (v / top) * ih;

  const move = (e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * w;
    const i = Math.round(bars ? (px - L - step / 2) / step : (px - L) / step);
    setHover(Math.max(0, Math.min(n - 1, i)));
  };

  const tickEvery = Math.max(1, Math.ceil(n / 6));
  const mark = hover !== null ? marks.filter(m => Math.abs(m.at - hover) <= Math.max(1, step < 6 ? 2 : 0)) : [];

  return (
    <div style={{ position: "relative" }}>
      <svg ref={ref} width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: "block", cursor: "crosshair" }} onMouseMove={move} onMouseLeave={() => setHover(null)}>
        {[0, 1, 2, 3, 4].map(k => (
          <g key={k}>
            <line x1={L} x2={w - R} y1={T + ih - (ih * k) / 4} y2={T + ih - (ih * k) / 4} style={{ stroke: "var(--line)", strokeDasharray: k ? "2 4" : "0" }} />
            <text x={L - 8} y={T + ih - (ih * k) / 4 + 3.5} textAnchor="end" style={{ fill: "var(--dim)", font: "10px var(--mono)" }}>{short((top * k) / 4)}</text>
          </g>
        ))}
        {labels.map((t, i) => (i % tickEvery === 0 || i === labels.length - 1) && t && t !== labels[i - tickEvery] ? (
          <text key={i} x={x(i)} y={h - 6} textAnchor={i === 0 ? "start" : i === labels.length - 1 ? "end" : "middle"} style={{ fill: "var(--dim)", font: "10px var(--mono)" }}>{t}</text>
        ) : null)}
        {marks.map((m, k) => <line key={k} x1={x(m.at)} x2={x(m.at)} y1={T} y2={T + ih} style={{ stroke: "var(--warn)", strokeDasharray: "3 3", opacity: 0.55 }} />)}
        {lines.map((l, k) => bars
          ? l.data.map((v, i) => <rect key={`${k}-${i}`} x={x(i) - step * 0.36} width={step * 0.72} y={y(v)} height={T + ih - y(v)} rx={2} style={{ fill: l.color, opacity: hover === null || hover === i ? 0.9 : 0.45 }} />)
          : (() => {
              const d = l.data.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
              return (
                <g key={k}>
                  {l.area && <path d={`${d} L${x(l.data.length - 1)} ${T + ih} L${x(0)} ${T + ih}Z`} style={{ fill: l.color, opacity: 0.1 }} />}
                  <path d={d} style={{ fill: "none", stroke: l.color, strokeWidth: 2, strokeLinejoin: "round" }} />
                </g>
              );
            })())}
        {hover !== null && (
          <g>
            {!bars && <line x1={x(hover)} x2={x(hover)} y1={T} y2={T + ih} style={{ stroke: "var(--muted)", strokeWidth: 1 }} />}
            {!bars && lines.map((l, k) => l.data[hover] !== undefined && <circle key={k} cx={x(hover)} cy={y(l.data[hover])} r={4} style={{ fill: l.color, stroke: "var(--panel)", strokeWidth: 2 }} />)}
          </g>
        )}
      </svg>
      {hover !== null && (
        <div className="chart-tip" style={{ left: `${(x(hover) / w) * 100}%`, transform: `translateX(${x(hover) > w * 0.7 ? "-105%" : "8px"})` }}>
          <div className="mono dim" style={{ marginBottom: 4 }}>{fmtX ? fmtX(hover) : labels[hover]}</div>
          {lines.map(l => (
            <div key={l.name} className="row" style={{ gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
              <span className="grow">{l.name}</span>
              <b className="mono">{l.data[hover] !== undefined ? `${l.data[hover].toLocaleString(undefined, { maximumFractionDigits: 1 })}${unit}` : "–"}</b>
            </div>
          ))}
          {mark.map((m, k) => <div key={k} className="warn small" style={{ marginTop: 4 }}>{m.label}</div>)}
        </div>
      )}
    </div>
  );
}
