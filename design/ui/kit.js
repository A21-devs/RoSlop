const P = {
  prompt: "M4 20h4L19 9l-4-4L4 16z M13 7l4 4 M15 20h5",
  vault: "M5 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5z M9 3v18 M12 8h4 M12 12h4",
  gauge: "M12 14l4-4 M3.5 18a10 10 0 1 1 17 0",
  track: "M3 12h18 M6 12a2 2 0 1 0 0 .01 M12 12a2 2 0 1 0 0 .01 M18 12a2 2 0 1 0 0 .01",
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  lead: "M12 3l1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4z M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z",
  tasks: "M9 6h11 M9 12h11 M9 18h11 M4 6h.01 M4 12h.01 M4 18h.01",
  review: "M4 4h16v16H4z M8 12l3 3 5-6",
  games: "M6 11h4 M8 9v4 M15 12h.01 M18 10h.01 M17.3 5H6.7a4 4 0 0 0-3.96 3.43l-.9 6.3A2.5 2.5 0 0 0 6.2 17l2.3-2.5h7l2.3 2.5a2.5 2.5 0 0 0 4.36-2.27l-.9-6.3A4 4 0 0 0 17.3 5z",
  pitches: "M9 18h6 M10 22h4 M12 2a7 7 0 0 0-4 12.7V16h8v-1.3A7 7 0 0 0 12 2z",
  market: "M3 17l6-6 4 4 8-8 M15 7h6v6",
  library: "M3 7l9-4 9 4-9 4z M3 7v10l9 4 9-4V7 M12 11v10",
  refs: "M6 3h12v18l-6-4-6 4z",
  settings: "M4 6h9 M17 6h3 M4 12h3 M11 12h9 M4 18h11 M19 18h1 M15 4v4 M9 10v4 M17 16v4",
  team: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  studio: "M3 4h18v12H3z M8 20h8 M12 16v4",
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
  cloud: "M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9z",
  key: "M15.5 7.5l3 3L22 7l-3-3 M21 2l-9.6 9.6 M7.5 21a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11z",
  plug: "M12 22v-5 M9 8V2 M15 8V2 M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8z",
  pause: "M7 4h3v16H7z M14 4h3v16h-3z",
  bell: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9 M10.3 21a1.94 1.94 0 0 0 3.4 0",
  filter: "M3 5h18 M6 12h12 M10 19h4",
  dl: "M12 4v12 M6 10l6 6 6-6 M4 20h16",
  expand: "M4 9V4h5 M20 9V4h-5 M4 15v5h5 M20 15v5h-5",
  lock: "M6 11h12v10H6z M8 11V7a4 4 0 0 1 8 0v4",
  reload: "M20 12a8 8 0 1 1-2.3-5.6L20 8 M20 3v5h-5",
  more: "M5 12h.01 M12 12h.01 M19 12h.01",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  copy: "M9 9h11v11H9z M5 15H4V4h11v1",
  ext: "M14 4h6v6 M20 4l-9 9 M18 14v6H4V6h6",
  phone: "M7 2h10v20H7z M11 18h2",
  mic: "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z M5 11a7 7 0 0 0 14 0 M12 18v3",
  flag: "M5 21V4 M5 4h12l-2 4 2 4H5",
  user: "M20 21a8 8 0 0 0-16 0 M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10z",
  sun: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z M12 1v2 M12 21v2 M4.2 4.2l1.4 1.4 M18.4 18.4l1.4 1.4 M1 12h2 M21 12h2",
  grid: "M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z",
  upload: "M12 20V8 M6 14l6-6 6 6 M4 4h16",
  prompt: "M4 20h4L19 9l-4-4L4 16z M13 7l4 4 M15 20h5",
  vault: "M4 4h16v16H4z M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M12 12h.01 M4 9h2 M4 15h2",
  globe: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M2 12h20 M12 2a15 15 0 0 1 0 20 M12 2a15 15 0 0 0 0 20",
};
const ic = (n, s = "") => `<svg class="i" viewBox="0 0 24 24" style="${s}"><path d="${P[n]}"/></svg>`;
const play = `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5l11 7-11 7z"/></svg>`;

function rng(seed) { let s = seed * 9301 + 49297; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); }

function guy(x, y, c, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-5" y="0" width="4" height="9" fill="#2b2b33"/><rect x="1" y="0" width="4" height="9" fill="#2b2b33"/>
    <rect x="-6" y="-12" width="12" height="12" rx="1" fill="${c}"/>
    <rect x="-9" y="-12" width="3" height="10" fill="${c}" opacity=".85"/><rect x="6" y="-12" width="3" height="10" fill="${c}" opacity=".85"/>
    <rect x="-4.5" y="-21" width="9" height="9" rx="1.5" fill="#f1c7a1"/>
    <rect x="-5" y="-23" width="10" height="4" rx="1" fill="#2a1c14"/></g>`;
}

const SCENES = {
  grove: { sky: ["#69b6ea", "#d7eef9"], far: "#5f9c63", ground: ["#5bab4b", "#3f8a37"] },
  snow: { sky: ["#8fb3dd", "#e3edf7"], far: "#b9cde3", ground: ["#f3f6fa", "#d5e1ee"] },
  arena: { sky: ["#2f2a4a", "#e58a5a"], far: "#5b3f4c", ground: ["#d99447", "#9c5a26"] },
  dino: { sky: ["#f2b46b", "#fde3b5"], far: "#c47f45", ground: ["#e3b77c", "#c48f55"] },
  night: { sky: ["#141032", "#45305f"], far: "#2a2148", ground: ["#3c3550", "#221d30"] },
};

function scene(kind, seed = 1, opts = {}) {
  const t = SCENES[kind], r = rng(seed), id = kind + seed + (opts.k || "");
  let s = `<svg class="scene" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="s${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.sky[0]}"/><stop offset="1" stop-color="${t.sky[1]}"/></linearGradient>
    <linearGradient id="g${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.ground[0]}"/><stop offset="1" stop-color="${t.ground[1]}"/></linearGradient>
    <radialGradient id="v${id}"><stop offset="0" stop-color="${opts.vfx || "#ff7ad9"}" stop-opacity=".95"/><stop offset=".5" stop-color="${opts.vfx || "#ff7ad9"}" stop-opacity=".35"/><stop offset="1" stop-color="${opts.vfx || "#ff7ad9"}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="320" height="180" fill="url(#s${id})"/>`;
  let pts = "0,100 ";
  for (let x = 0; x <= 320; x += 20) pts += `${x},${78 + r() * 26} `;
  s += `<polygon points="${pts}320,100" fill="${t.far}" opacity=".9"/>`;
  s += `<polygon points="0,98 320,92 320,180 0,180" fill="url(#g${id})"/>`;
  if (kind === "grove") {
    for (let i = 0; i < 6; i++) { const x = 20 + i * 52 + r() * 10; s += `<circle cx="${x}" cy="${86 - r() * 8}" r="${14 + r() * 8}" fill="#2f7a3a"/>`; }
    s += `<g fill="#d8442f"><rect x="226" y="72" width="4" height="34"/><rect x="258" y="72" width="4" height="34"/><rect x="220" y="70" width="48" height="5" rx="1"/><rect x="224" y="79" width="40" height="3"/></g>`;
    for (let i = 0; i < 5; i++) s += `<rect x="${10 + i * 20}" y="${128 + i * 3}" width="16" height="4" fill="#c9533c"/><rect x="${12 + i * 20}" y="${120 + i * 3}" width="3" height="14" fill="#a83e2c"/>`;
  }
  if (kind === "snow") {
    for (let i = 0; i < 7; i++) { const x = 15 + r() * 290, h = 16 + r() * 26; s += `<polygon points="${x},${120 - h} ${x + 7},120 ${x - 7},120" fill="#5fa6e8" opacity=".85"/>`; }
    if (opts.boss) s += `<ellipse cx="190" cy="140" rx="${opts.boss}" ry="${opts.boss * .32}" fill="#e2352b" opacity=".75"/>`;
  }
  if (kind === "arena") {
    s += `<ellipse cx="160" cy="138" rx="120" ry="30" fill="#e8a352" stroke="#7a3c13" stroke-width="2"/>`;
    s += `<ellipse cx="160" cy="138" rx="70" ry="17" fill="none" stroke="#ffcf4a" stroke-width="2" stroke-dasharray="6 4" opacity=".9"/>`;
    s += `<ellipse cx="160" cy="138" rx="46" ry="11" fill="none" stroke="#ffe48a" stroke-width="1.4" opacity=".9"/>`;
    for (let i = 0; i < 4; i++) s += `<rect x="${40 + i * 78}" y="62" width="8" height="40" fill="#6a4a3a"/><rect x="${36 + i * 78}" y="56" width="16" height="7" fill="#d8442f"/><circle cx="${44 + i * 78}" cy="52" r="4" fill="#ffb84a"/>`;
  }
  if (kind === "dino") {
    s += `<ellipse cx="170" cy="140" rx="70" ry="18" fill="#7a4d26"/><ellipse cx="170" cy="137" rx="60" ry="13" fill="#5b3618"/>`;
    s += `<path d="M135 136c10-10 24-12 34-6s22 6 30-2" stroke="#f3ead6" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    for (let i = 0; i < 4; i++) s += `<path d="M${150 + i * 9} 132v-7" stroke="#f3ead6" stroke-width="2.5" stroke-linecap="round"/>`;
    for (let i = 0; i < 4; i++) { const x = 20 + r() * 280; s += `<rect x="${x}" y="${100 + r() * 30}" width="${6 + r() * 8}" height="${4 + r() * 5}" fill="#a8743f"/>`; }
  }
  if (kind === "night") {
    for (let i = 0; i < 20; i++) s += `<circle cx="${r() * 320}" cy="${r() * 70}" r=".8" fill="#fff" opacity=".7"/>`;
    s += `<g transform="translate(165 132)"><rect x="-16" y="-44" width="32" height="40" rx="3" fill="#6b3fa0"/><rect x="-10" y="-60" width="20" height="18" rx="3" fill="#8a5bc4"/><rect x="-6" y="-54" width="4" height="3" fill="#ffda4a"/><rect x="2" y="-54" width="4" height="3" fill="#ffda4a"/><rect x="-14" y="-4" width="10" height="12" fill="#3a2260"/><rect x="4" y="-4" width="10" height="12" fill="#3a2260"/></g>`;
  }
  const cols = ["#3c6fd8", "#d84a7a", "#36a36b", "#e0a93a", "#7a55d6"];
  const n = opts.guys ?? 3;
  for (let i = 0; i < n; i++) s += guy(90 + i * 46 + r() * 20, 128 + r() * 18, cols[(seed + i) % cols.length], 1.15);
  if (opts.vfxSize) s += `<circle cx="${opts.vx || 165}" cy="${opts.vy || 118}" r="${opts.vfxSize}" fill="url(#v${id})"/>`;
  if (opts.sparks) for (let i = 0; i < opts.sparks; i++) s += `<circle cx="${110 + r() * 110}" cy="${80 + r() * 70}" r="${1 + r() * 2.5}" fill="${opts.vfx || "#ffd2f2"}" opacity=".9"/>`;
  if (opts.hud) s += `<g font-family="Geist Mono" font-size="6" fill="#fff"><rect x="252" y="10" width="58" height="12" rx="3" fill="rgba(0,0,0,.45)"/><text x="258" y="18.5">${opts.hud}</text><rect x="10" y="10" width="48" height="5" rx="2" fill="rgba(0,0,0,.45)"/><rect x="10" y="10" width="34" height="5" rx="2" fill="#62d394"/></g>`;
  return s + "</svg>";
}

const thumb = (kind, seed, o = {}) => `<div class="thumb" style="aspect-ratio:${o.ar || "16/9"};${o.style || ""}">${scene(kind, seed, o)}${o.tag ? `<span class="tag">${o.tag}</span>` : ""}${o.video ? `<span class="play">${play}</span>` : ""}${o.len ? `<span class="len">${o.len}</span>` : ""}</div>`;

function spark(data, w = 80, h = 22, color = "var(--ok)", fill = true) {
  const mx = Math.max(...data), mn = Math.min(...data), dx = w / (data.length - 1);
  const pts = data.map((v, i) => [i * dx, h - 2 - ((v - mn) / (mx - mn || 1)) * (h - 4)]);
  const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;overflow:visible">${fill ? `<path d="${d} L${w} ${h} L0 ${h}Z" style="fill:${color};opacity:.12"/>` : ""}<path d="${d}" style="fill:none;stroke:${color};stroke-width:1.5;stroke-linejoin:round"/></svg>`;
}

function lineChart({ w = 560, h = 190, series, max, ticks = 4, xl = [] }) {
  const L = 34, B = 20, T = 6, iw = w - L - 6, ih = h - B - T;
  const top = max || Math.max(...series.flatMap(s => s.data)) * 1.1;
  let s = `<svg width="100%" viewBox="0 0 ${w} ${h}" style="display:block">`;
  for (let i = 0; i <= ticks; i++) {
    const y = T + ih - (ih * i) / ticks, v = (top * i) / ticks;
    s += `<line x1="${L}" x2="${w - 6}" y1="${y}" y2="${y}" style="stroke:var(--line);stroke-dasharray:${i ? "2 4" : "0"}"/>`;
    s += `<text x="${L - 8}" y="${y + 3.5}" text-anchor="end" style="fill:var(--dim);font:10px var(--mono)">${v >= 1000 ? (v / 1000).toFixed(1) + "k" : Math.round(v)}</text>`;
  }
  xl.forEach((t, i) => s += `<text x="${L + (iw * i) / (xl.length - 1)}" y="${h - 4}" text-anchor="${i === 0 ? "start" : i === xl.length - 1 ? "end" : "middle"}" style="fill:var(--dim);font:10px var(--mono)">${t}</text>`);
  series.forEach(se => {
    const dx = iw / (se.data.length - 1);
    const pts = se.data.map((v, i) => [L + i * dx, T + ih - (v / top) * ih]);
    const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
    if (se.area) s += `<path d="${d} L${L + iw} ${T + ih} L${L} ${T + ih}Z" style="fill:${se.color};opacity:.1"/>`;
    s += `<path d="${d}" style="fill:none;stroke:${se.color};stroke-width:${se.wd || 2};stroke-linejoin:round;stroke-linecap:round"/>`;
    if (se.dot) { const p = pts[pts.length - 1]; s += `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" style="fill:${se.color};stroke:var(--panel);stroke-width:2"/>`; }
  });
  return s + "</svg>";
}

function bars({ w = 560, h = 190, data, hi = 0, color = "var(--info)", xl = [] }) {
  const B = 20, ih = h - B - 4, bw = w / data.length, mx = Math.max(...data);
  let s = `<svg width="100%" viewBox="0 0 ${w} ${h}" style="display:block">`;
  data.forEach((v, i) => {
    const bh = (v / mx) * ih;
    s += `<rect x="${i * bw + 2}" y="${4 + ih - bh}" width="${bw - 4}" height="${bh}" rx="2" style="fill:${i < hi ? "var(--warn)" : color};opacity:${i < hi ? 1 : .55}"/>`;
  });
  xl.forEach(([i, t]) => s += `<text x="${i * bw + bw / 2}" y="${h - 4}" text-anchor="middle" style="fill:var(--dim);font:10px var(--mono)">${t}</text>`);
  return s + "</svg>";
}

const sbar = `<div class="sb"><span>9:41</span><span class="ic"><svg width="18" height="11" viewBox="0 0 18 11"><rect x="0" y="7" width="3" height="4" rx="1" fill="currentColor"/><rect x="5" y="5" width="3" height="6" rx="1" fill="currentColor"/><rect x="10" y="2.5" width="3" height="8.5" rx="1" fill="currentColor"/><rect x="15" y="0" width="3" height="11" rx="1" fill="currentColor"/></svg><svg width="26" height="12" viewBox="0 0 26 12"><rect x=".5" y=".5" width="22" height="11" rx="3" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="16" height="8" rx="1.6" fill="currentColor"/><rect x="24" y="4" width="1.6" height="4" rx=".8" fill="currentColor" opacity=".4"/></svg></span></div>`;
const winCtl = `<span><svg width="10" height="10" viewBox="0 0 10 10"><path d="M0 5h10" stroke="currentColor"/></svg></span><span><svg width="10" height="10" viewBox="0 0 10 10"><rect x=".5" y=".5" width="9" height="9" fill="none" stroke="currentColor"/></svg></span><span><svg width="10" height="10" viewBox="0 0 10 10"><path d="M0 0l10 10M10 0L0 10" stroke="currentColor"/></svg></span>`;

const STK = {
  gem: `<path d="M30 22h36l14 18-32 38-32-38z" fill="#58b8ff"/><path d="M30 22l8 18h20l8-18 M16 40h64 M38 40l10 38 10-38" fill="none"/><path d="M38 26l-4 10" stroke="#fff" fill="none"/>`,
  coin: `<circle cx="48" cy="50" r="30" fill="#f7c234"/><circle cx="48" cy="50" r="21" fill="#ffd95c"/><path d="M48 36l4.5 9 10 1.5-7 7 1.6 10L48 59l-9 4.5 1.6-10-7-7 10-1.5z" fill="#f7a823"/>`,
  chest: `<path d="M20 44h56v30H20z" fill="#b8693a"/><path d="M20 44c0-14 10-22 28-22s28 8 28 22z" fill="#d07c45"/><path d="M20 44h56v8H20z M44 40h8v16h-8z" fill="#f7c234"/>`,
  gift: `<path d="M20 42h56v34H20z" fill="#ff6fa8"/><path d="M16 32h64v12H16z" fill="#ff8dbd"/><path d="M44 32h8v44h-8z" fill="#ffd95c"/><path d="M48 32c-6-12-20-12-18-2 2 6 12 3 18 2zm0 0c6-12 20-12 18-2-2 6-12 3-18 2z" fill="#ffd95c"/>`,
  clover: `<circle cx="38" cy="38" r="12" fill="#3fbf5f"/><circle cx="58" cy="38" r="12" fill="#3fbf5f"/><circle cx="38" cy="58" r="12" fill="#3fbf5f"/><circle cx="58" cy="58" r="12" fill="#3fbf5f"/><path d="M48 52c4 12 10 20 18 26" fill="none"/>`,
  egg: `<path d="M48 18c16 0 26 24 26 38s-11 22-26 22-26-8-26-22 10-38 26-38z" fill="#9fe08a"/><circle cx="40" cy="40" r="5" fill="#5aa848"/><circle cx="58" cy="54" r="7" fill="#5aa848"/><circle cx="40" cy="64" r="4" fill="#5aa848"/>`,
  potion: `<path d="M40 18h16v16c12 4 18 14 18 24 0 14-11 22-26 22s-26-8-26-22c0-10 6-20 18-24z" fill="#b48cff"/><path d="M26 56h44c0 12-10 20-22 20s-22-8-22-20z" fill="#8a4dff"/><path d="M38 14h20v8H38z" fill="#c98b5a"/>`,
  sword: `<path d="M62 14l14 4-4 14-30 30-10-10z" fill="#d7e3f0"/><path d="M26 58l12 12-6 6-12-12z" fill="#f7c234"/><path d="M22 70l6 6-8 8-6-6z" fill="#8a5130"/>`,
  shovel: `<path d="M64 16l12 12-26 26-6-6z" fill="#b8693a"/><path d="M42 48l8 8-8 18c-4 6-14 6-18 2s-4-14 2-18z" fill="#c9d4df"/>`,
  crown: `<path d="M18 34l16 12 14-22 14 22 16-12-6 38H24z" fill="#f7c234"/><circle cx="48" cy="58" r="5" fill="#ff5a5a"/><circle cx="32" cy="62" r="3.5" fill="#58b8ff"/><circle cx="64" cy="62" r="3.5" fill="#58b8ff"/>`,
  scroll: `<path d="M28 20h40v56H28z" fill="#f3d9a4"/><rect x="22" y="14" width="52" height="10" rx="5" fill="#d9a85f"/><rect x="22" y="72" width="52" height="10" rx="5" fill="#d9a85f"/><path d="M36 36h24 M36 46h24 M36 56h16" fill="none"/>`,
  bone: `<path d="M30 30a8 8 0 1 1 10-10l26 26a8 8 0 1 1 10 10 8 8 0 1 1-10 10L40 40a8 8 0 1 1-10-10z" fill="#f3ead6"/>`,
};
const sticker = k => `<svg viewBox="0 0 96 96" width="100%" height="100%" style="display:block"><g style="filter:drop-shadow(0 4px 6px rgba(0,0,0,.35))"><g class="stk-o">${STK[k]}</g><g class="stk-f">${STK[k]}</g></g></svg>`;

