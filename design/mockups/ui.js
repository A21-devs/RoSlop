const P = {
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

const AG = {
  lead: ["Lead", "LD", "#3d7eff"],
  pulse: ["Pulse", "PU", "#ff7a6b"],
  architect: ["Architect", "AR", "#79b8ff"],
  builder: ["Builder", "BU", "#f4b24c"],
  frame: ["Frame", "FR", "#f18cc0"],
  scenic: ["Scenic", "SC", "#6fd08c"],
  librarian: ["Librarian", "LB", "#b49cff"],
  balance: ["Balance", "BA", "#4fd1c5"],
  kid: ["Clueless Tester", "CT", "#ffd84d"],
  playtest: ["Playtest", "PT", "#ff9b4a"],
  splash: ["Splash", "SP", "#e57bff"],
  merchant: ["Merchant", "ME", "#e8c46a"],
  producer: ["Producer", "PR", "#9fb3c8"],
  reviewer: ["Reviewer", "RV", "#ff6262"],
  liveops: ["Liveops", "LO", "#7ee0ff"],
};
const av = (k, cls = "") => `<span class="av ${cls}" style="--c:${AG[k][2]}">${AG[k][1]}</span>`;

const logo = (s = 30) => `<svg class="logo" width="${s}" height="${s}" viewBox="0 0 32 32">
  <path d="M6 3h20a3 3 0 0 1 3 3v14c0 2-1.4 2.6-2.4 2.6-1.3 0-2-.9-2-2.3v-1.6c0-.7-.5-1.1-1-1.1s-1 .4-1 1.1v7.6c0 1.6-1.1 2.7-2.6 2.7s-2.6-1.1-2.6-2.7v-4.1c0-.7-.5-1.1-1-1.1s-1 .4-1 1.1v.6c0 1.3-.9 2.2-2.1 2.2S6.2 24.1 6.2 23V22H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z" fill="#3d7eff"/>
  <path d="M10.5 8.5h6.2c2.4 0 4 1.4 4 3.5 0 1.6-.9 2.7-2.4 3.2l2.7 3.8h-3.1l-2.4-3.5h-2.3v3.5h-2.7z m2.7 2.2v2.6h3.3c.9 0 1.5-.5 1.5-1.3s-.6-1.3-1.5-1.3z" fill="#ffffff"/>
</svg>`;

// tiny seeded rng so the fake game frames look the same every render
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

function sidebar(on, o = {}) {
  const nav = [
    ["home", "Home", "3", true], ["lead", "Lead"], ["team", "Team"], ["tasks", "Tasks", "9"], ["review", "Review", "6"], ["prompt", "Prompt coach"],
  ];
  const studio = [["games", "Games"], ["pitches", "Pitches"], ["market", "Market"], ["library", "Library"], ["vault", "Vault"]];
  const link = ([k, label, n, hot]) => `<a class="${k === on ? "on" : ""}">${ic(k)}${label}${n ? `<span class="n ${hot ? "hot" : ""}">${n}</span>` : ""}</a>`;
  const team = [["lead", "idle"], ["builder", "working"], ["frame", "working"], ["balance", "working"], ["playtest", "in S2"], ["pulse", "idle"], ["kid", "idle"], ["reviewer", "idle"]];
  return `<aside class="side">${o.mac ? `<div class="lights"><i></i><i></i><i></i></div>` : ""}
    <div class="ws">${logo()}<div><b>RoSlop</b><span>Inclined Games</span></div><svg class="i" viewBox="0 0 24 24" style="margin-left:auto;color:var(--dim)"><path d="M8 9l4-4 4 4 M8 15l4 4 4-4"/></svg></div>
    <div class="search">${ic("search")}<span>Search or jump to</span><kbd>${o.win ? "Ctrl K" : "⌘K"}</kbd></div>
    <nav class="nav">${nav.map(link).join("")}</nav>
    <div class="nav-h">Studio</div>
    <nav class="nav">${studio.map(link).join("")}</nav>
    <div class="nav-h" style="display:flex">Team <span style="margin-left:auto" class="mono">4 busy</span></div>
    <div class="team">${team.map(([k, st]) => `<div class="m ${st === "idle" ? "" : "busy"}">${av(k, "sm")}${AG[k][0]}<span class="st">${st}</span></div>`).join("")}
      <div class="m dim" style="color:var(--dim)">+ 7 more</div></div>
    <div class="side-foot">
      <nav class="nav"><a class="${on === "settings" ? "on" : ""}">${ic("settings")}Settings</a></nav>
      <div class="me"><span class="pfp">SK</span><div class="grow"><div style="font-weight:500">Sam K.</div><div class="sync"><span class="dot"></span>Synced on 3 devices</div></div></div>
    </div>
  </aside>`;
}

function topbar(crumbs, o = {}) {
  return `<header class="top">
    <div class="crumb">${crumbs}</div>
    <div class="grow"></div>
    ${o.extra || ""}
    <div class="slots">Studios <i class="on"></i><i class="on"></i><i></i><i></i><span>2 of 4</span></div>
    <button class="btn sm ghost">${ic("bell")}</button>
    <button class="btn sm pri">${ic("plus")}New task</button>
  </header>`;
}

const shell = (on, crumbs, body, o = {}) => `<div class="app ${o.light ? "light" : ""} ${o.mac ? "macapp" : ""}">${sidebar(on, o)}<main class="main">${topbar(crumbs, o)}<div class="content" style="${o.pad || ""}">${body}</div></main></div>`;

/* ---------- Home ---------- */
function needCard({ who, game, ago, title, body, actions, media }) {
  return `<div class="card" style="padding:14px 16px;display:flex;gap:14px">
    <div style="flex:1;min-width:0">
      <div class="row" style="margin-bottom:6px">${av(who, "sm")}<span style="font-weight:500">${AG[who][0]}</span><span class="dim">·</span><span class="muted">${game}</span><span class="dim mono" style="margin-left:auto">${ago}</span></div>
      <div style="font-size:14px;font-weight:600;letter-spacing:-0.01em;margin-bottom:4px">${title}</div>
      <div class="muted" style="font-size:12.5px;margin-bottom:12px">${body}</div>
      <div class="row" style="flex-wrap:wrap;gap:6px">${actions}</div>
    </div>
    ${media ? `<div style="width:168px;flex:none">${media}</div>` : ""}
  </div>`;
}

function home() {
  const working = [
    ["builder", "Raid lava + weekly raid reset", "Anime Awakening RNG", 62, "Playtesting in Studio 2"],
    ["frame", "Loading screen is just a brown box", "Anime Awakening RNG", 35, "Trying 3 layouts"],
    ["balance", "Late skill tree is way too cheap", "Anime Awakening RNG", 80, "Running 500 sims"],
    ["scenic", "Second dig site (the swamp one)", "Dig Up a Dino", 18, "Blocking out the map"],
  ];
  return `
  <div style="display:flex;align-items:flex-end;gap:24px;margin-bottom:20px">
    <div class="grow">
      <div class="mono dim" style="margin-bottom:6px">THU, OCT 23</div>
      <h1 class="page">Evening, Sam.</h1>
      <p class="lede">Four things are waiting on you. Builder and Frame are mid-task, and five more jobs are lined up behind them.</p>
    </div>
    <div class="row" style="gap:20px;padding-bottom:4px">
      <div><div class="mono dim">PLAYING NOW</div><div style="font-size:20px;font-weight:600;letter-spacing:-0.02em">214 <span style="font-size:12px;color:var(--ok);font-weight:500">+31</span></div></div>
      <div><div class="mono dim">ROBUX TODAY</div><div style="font-size:20px;font-weight:600;letter-spacing:-0.02em">R$ 2,140</div></div>
    </div>
  </div>

  <div class="card" style="padding:12px 12px 10px 16px;margin-bottom:24px;border-color:var(--line-2)">
    <div class="row" style="gap:12px"><span class="av lg" style="--c:#3d7eff">${ic("lead", "width:15px;height:15px")}</span>
      <div class="grow" style="font-size:14px;color:var(--dim)">Tell the Lead what you want. "Make the first 5 minutes of Dino less boring" works fine.</div></div>
    <div class="row" style="margin-top:10px;padding-left:42px">
      <span class="pill">${ic("games", "width:12px;height:12px")}Anime Awakening RNG ${ic("down", "width:12px;height:12px")}</span>
      <span class="pill">${ic("clip", "width:12px;height:12px")}Attach</span>
      <span class="pill">${ic("plug", "width:12px;height:12px")}Figma on</span>
      <div class="grow"></div><span class="dim" style="font-size:11.5px">Enter to send</span>
      <button class="btn sm pri">Send to Lead ${ic("up", "width:14px;height:14px")}</button></div>
  </div>

  <div style="display:grid;grid-template-columns:1.55fr 1fr;gap:24px">
    <section>
      <div class="sec-h"><h3>Needs you</h3><span class="c">4</span><span class="r">Oldest first</span></div>
      <div style="display:flex;flex-direction:column;gap:10px">
      ${needCard({ who: "playtest", game: "Anime Awakening RNG", ago: "12m", title: "Party raid quick join is in. Can you try it with a second account?",
        body: "Start a raid from the Party Raid menu on PC, then join from your phone. It worked in Studio with two test players, but Studio isn't the real servers.",
        actions: `<button class="btn sm">${ic("check", "width:14px;height:14px;color:var(--ok)")}Works for me</button><button class="btn sm">Something's off</button><button class="btn sm ghost">Details</button>` })}
      ${needCard({ who: "balance", game: "Anime Awakening RNG", ago: "1h", title: "How much stronger should a 1 in a million hero be?",
        body: "Kenaki (1 in 2.5M) hits 4.1x a common hero right now, and people who roll one mostly stop rolling. I'd cap everyone at 4x and only let Kenaki and Zoru go past it.",
        actions: `<button class="btn sm pri">Keep the 4x cap</button><button class="btn sm">Raise it to 6x</button><button class="btn sm ghost">${ic("msg", "width:14px;height:14px")}Talk it through</button>` })}
      ${needCard({ who: "frame", game: "Dig Up a Dino", ago: "40m", title: "Shop on a phone: A or B?",
        body: "B keeps the buy button under your thumb. A cuts off the last row on an iPhone SE.",
        actions: `<button class="btn sm">Go with A</button><button class="btn sm pri">Go with B</button><button class="btn sm ghost">Open in Review</button>`,
        media: `<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">${thumb("dino", 4, { ar: "9/14", tag: "A", guys: 1 })}${thumb("dino", 7, { ar: "9/14", tag: "B", guys: 1 })}</div>` })}
      ${needCard({ who: "reviewer", game: "Dig Up a Dino", ago: "2h", title: "I stopped a ship. Daily reward can be claimed twice.",
        body: "If you leave and rejoin within about 3 seconds the save hasn't landed yet, so you get it again. Builder can fix it in one pass.",
        actions: `<button class="btn sm">Hand it to Builder</button><button class="btn sm ghost">I'll look first</button>` })}
      </div>
    </section>

    <section style="display:flex;flex-direction:column;gap:22px">
      <div>
        <div class="sec-h"><h3>Working now</h3><span class="c">4</span><span class="r">5 queued</span></div>
        <div class="card" style="padding:4px 0">
          ${working.map(([k, t, g, p, step], i) => `<div style="padding:10px 14px;${i ? "border-top:1px solid var(--line)" : ""}">
            <div class="row">${av(k, "sm")}<span class="grow trunc" style="font-weight:500">${t}</span><span class="mono dim">${p}%</span></div>
            <div class="row" style="margin:6px 0 0 26px;gap:10px"><span class="muted trunc grow" style="font-size:12px">${step} · ${g}</span></div>
            <div class="bar" style="margin:7px 0 0 26px"><i style="width:${p}%"></i></div></div>`).join("")}
        </div>
      </div>
      <div>
        <div class="sec-h"><h3>Studios</h3><span class="c">2 of 4 open</span><span class="r">Manage</span></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div>${thumb("arena", 3, { tag: "S1", hud: "BUILDER", guys: 1 })}<div class="row" style="margin-top:6px;font-size:12px">${av("builder", "sm")}<span class="muted">Editing RaidLava.lua</span></div></div>
          <div>${thumb("snow", 5, { tag: "S2 LIVE", hud: "PLAYTEST", vfxSize: 26, vfx: "#ff9b4a", sparks: 10 })}<div class="row" style="margin-top:6px;font-size:12px">${av("playtest", "sm")}<span class="muted">In game, wave 3 of 5</span></div></div>
          <div class="card" style="aspect-ratio:16/9;display:grid;place-items:center;color:var(--dim);box-shadow:none;border-style:dashed">S3 free</div>
          <div class="card" style="aspect-ratio:16/9;display:grid;place-items:center;color:var(--dim);box-shadow:none;border-style:dashed">S4 free</div>
        </div>
      </div>
      <div>
        <div class="sec-h"><h3>Your games</h3></div>
        <div class="card">
          ${[["Anime Awakening RNG", "188", "1,384", "+12%", [5, 7, 6, 9, 8, 11, 10, 14, 13, 16]], ["Dig Up a Dino", "26", "402", "-4%", [9, 8, 9, 7, 8, 7, 6, 7, 6, 6]]].map(([n, now, dau, ch, d], i) => `
          <div class="row" style="padding:11px 14px;gap:12px;${i ? "border-top:1px solid var(--line)" : ""}">
            <div class="grow"><div style="font-weight:500">${n}</div><div class="muted" style="font-size:12px">${now} playing · ${dau} today</div></div>
            ${spark(d, 72, 22, ch[0] === "-" ? "var(--bad)" : "var(--ok)")}<span class="mono" style="width:38px;text-align:right;color:${ch[0] === "-" ? "var(--bad)" : "var(--ok)"}">${ch}</span></div>`).join("")}
        </div>
      </div>
    </section>
  </div>`;
}

/* ---------- Tasks ---------- */
function tasks() {
  const row = (k, t, g, from, when, st, open) => `
  <div style="border-top:1px solid var(--line);${open ? "background:var(--raise)" : ""}">
    <div class="row" style="padding:11px 16px;gap:12px">
      ${av(k)}<div class="grow" style="min-width:0"><div class="trunc" style="font-weight:500">${t}</div><div class="muted" style="font-size:12px">${AG[k][0]} · from ${from} · ${g}</div></div>
      <span class="mono dim" style="width:70px;text-align:right">${when}</span>
      <span style="width:118px;display:flex;justify-content:flex-end">${st}</span>
      ${ic(open ? "down" : "right", "color:var(--dim)")}
    </div>
    ${open || ""}
  </div>`;
  const working = `<span class="pill ok"><span class="dot pulse"></span>Working</span>`;
  const queued = n => `<span class="pill">#${n} in line</span>`;
  const back = `<span class="pill warn">Back to you</span>`;
  const log = [
    ["11:02", "Opened Studio 2 and pulled the latest place file"],
    ["11:06", "Wrote RaidLava.server.lua <span class='mono' style='color:var(--ok)'>+142</span> <span class='mono' style='color:var(--bad)'>-18</span>"],
    ["11:09", "Weekly raid timer now resets Monday 00:00 UTC, not on server start"],
    ["11:14", "Playtest: lava does 20 dmg/s, players respawn at the gate. Looks right"],
    ["now", "Recording a clip for Review"],
  ];
  const detail = `<div style="display:grid;grid-template-columns:1fr 300px;gap:20px;padding:4px 16px 16px 50px">
      <div>${log.map(([t, l], i) => `<div class="row" style="align-items:flex-start;gap:12px;padding:5px 0"><span class="mono dim" style="width:38px;padding-top:1px">${t}</span><span style="width:7px;height:7px;border-radius:99px;margin-top:5px;background:${i === log.length - 1 ? "var(--ok)" : "var(--line-2)"};flex:none"></span><span class="${i === log.length - 1 ? "" : "muted"}">${l}</span></div>`).join("")}
        <div class="row" style="margin-top:10px;gap:6px"><button class="btn sm">${ic("eye", "width:14px;height:14px")}Watch Studio 2</button><button class="btn sm">${ic("msg", "width:14px;height:14px")}Message Builder</button><button class="btn sm ghost">${ic("pause", "width:14px;height:14px")}Pause</button></div></div>
      <div>${thumb("arena", 9, { tag: "PROOF SO FAR", video: true, len: "0:14", hud: "WAVE 3", vfxSize: 30, vfx: "#ff6a2a", sparks: 14 })}<div class="muted" style="font-size:12px;margin-top:6px">Raid lava, first pass. Not in Review yet.</div></div>
    </div>`;
  return `
  <div class="row" style="align-items:flex-end;margin-bottom:18px">
    <div class="grow"><h1 class="page">Tasks</h1><p class="lede">Everything the team is doing, waiting to do, or has handed back to you.</p></div>
    <button class="btn">${ic("pause", "width:14px;height:14px")}Pause everyone</button>
  </div>
  <div class="row" style="margin-bottom:16px;gap:10px">
    <div class="seg"><a class="on">All <span class="mono">14</span></a><a>Working <span class="mono">4</span></a><a>Queued <span class="mono">5</span></a><a>Back to you <span class="mono">2</span></a><a>Done <span class="mono">160</span></a></div>
    <div class="grow"></div>
    <div class="input" style="width:220px">${ic("search")}Find a task</div>
    <button class="btn">${ic("games", "width:14px;height:14px")}All games ${ic("down", "width:13px;height:13px")}</button>
    <button class="btn">${ic("team", "width:14px;height:14px")}Anyone ${ic("down", "width:13px;height:13px")}</button>
  </div>
  <div class="card" style="overflow:hidden">
    <div class="row" style="padding:10px 16px;background:var(--raise)"><span class="dot pulse"></span><b style="font-weight:600">Working now</b><span class="mono dim">4</span><span class="muted" style="margin-left:6px;font-size:12px">Click one to see what it's doing</span></div>
    ${row("builder", "Hall regen, frozen legs, fall-through, raid lava and the POWER board", "Anime Awakening RNG", "Lead", "11m", working, detail)}
    ${row("balance", "Late skill tree is too cheap (people max it after one clear)", "Anime Awakening RNG", "Lead", "1h", working)}
    ${row("frame", "Loading screen shows up as a blank brown box in the app", "Anime Awakening RNG", "Lead", "1h", working)}
    ${row("frame", "Shonk's entrance, tips, fight popups, Ultimate intro (+2 more)", "Anime Awakening RNG", "Lead", "1h", working)}
    <div class="row" style="padding:10px 16px;background:var(--raise);border-top:1px solid var(--line)"><span class="dot off"></span><b style="font-weight:600">Queued</b><span class="mono dim">5</span><span class="muted" style="margin-left:6px;font-size:12px">Starts when the agent is free, in this order</span></div>
    ${row("builder", "Level 15 needs 3,500 XP; turn floors off in beaten zones", "Anime Awakening RNG", "Balance", "1h", queued(1))}
    ${row("builder", "Zones scale once on first visit, beaten zones die in one hit", "Anime Awakening RNG", "Lead", "1h", queued(2))}
    ${row("frame", "Celgear's clock-hand hit needs a sound and real knockback", "Anime Awakening RNG", "Lead", "1h", queued(1))}
    <div class="row" style="padding:10px 16px;background:var(--raise);border-top:1px solid var(--line)"><span class="dot warn"></span><b style="font-weight:600">Back to you</b><span class="mono dim">2</span></div>
    ${row("balance", "How much stronger should a 1 in a million hero be?", "Anime Awakening RNG", "you", "25m", back)}
  </div>`;
}

/* ---------- Review ---------- */
function review(o = {}) {
  const q = [
    ["frame", "Calmer Special abilities, before and after", "snow", 2, "0:10", true, "waiting"],
    ["builder", "Goro's rune circle, in a real fight", "arena", 4, "0:22", false, "waiting"],
    ["scenic", "Hero Hall layout, now vs proposed", "grove", 6, "", false, "waiting"],
    ["splash", "Thumbnail set for the Frostpeak update", "night", 3, "", false, "waiting"],
    ["frame", "Shop on a phone, A or B", "dino", 7, "", false, "approved"],
    ["builder", "Dioh's 4 new moves", "night", 8, "0:31", false, "approved"],
  ];
  return `<div style="display:grid;grid-template-columns:280px 1fr 340px;height:100%">
    <div style="border-right:1px solid var(--line);display:flex;flex-direction:column;min-height:0">
      <div style="padding:14px 14px 10px"><div class="seg" style="width:100%"><a class="on" style="flex:1;justify-content:center">Waiting <span class="mono">6</span></a><a style="flex:1;justify-content:center">Approved</a><a style="flex:1;justify-content:center">Sent back</a></div></div>
      <div style="overflow:hidden;padding:0 8px">
      ${q.map(([k, t, sc, s, len, on, st]) => `<div class="row" style="gap:10px;padding:8px;border-radius:8px;align-items:flex-start;${on ? "background:var(--raise);box-shadow:inset 0 0 0 1px var(--line-2)" : ""}">
        <div style="width:86px;flex:none">${thumb(sc, s, { video: !!len, len, guys: 2, vfxSize: s % 2 ? 22 : 0, style: "border-radius:6px" })}</div>
        <div class="grow" style="min-width:0"><div style="font-weight:500;font-size:12.5px;line-height:1.3">${t}</div><div class="row" style="margin-top:5px;gap:6px">${av(k, "sm")}<span class="muted" style="font-size:11.5px">${AG[k][0]}</span>${st === "approved" ? `<span class="pill ok" style="height:18px;margin-left:auto">${ic("check", "width:11px;height:11px")}OK</span>` : ""}</div></div></div>`).join("")}
      </div>
    </div>
    <div style="padding:20px 24px;display:flex;flex-direction:column;gap:14px;min-width:0">
      <div class="row"><span class="mono dim">1 / 6</span><div class="grow"></div><button class="btn sm ghost">${ic("dl", "width:14px;height:14px")}</button><button class="btn sm ghost">${ic("expand", "width:14px;height:14px")}</button></div>
      <div class="card" style="padding:10px;background:#0a0a09;border-color:#22231f">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
          ${thumb("grove", 11, { tag: "BEFORE · Storm, Fire, Earth", vfxSize: 70, vfx: "#ff6fd6", sparks: 40, guys: 4, k: "a", hud: "BAMBOO GROVE" })}
          ${thumb("grove", 11, { tag: "AFTER · same casts", vfxSize: 26, vfx: "#ff6fd6", sparks: 8, guys: 4, k: "b", hud: "BAMBOO GROVE" })}
          ${thumb("snow", 12, { tag: "BEFORE · Lord Frozza, 3 heroes", vfxSize: 60, vfx: "#9fd2ff", sparks: 36, guys: 3, boss: 40, k: "c" })}
          ${thumb("snow", 12, { tag: "AFTER · same fight", vfxSize: 22, vfx: "#ffb36b", sparks: 6, guys: 3, boss: 40, k: "d" })}
        </div>
        <div class="row" style="padding:10px 4px 2px;color:#cfcfca;gap:12px">${play}<span class="mono" style="color:#8d8c84">0:04 / 0:10</span><div class="bar grow" style="background:#2a2a26"><i style="width:40%;background:#ecebe4"></i></div><span class="mono" style="color:#8d8c84">1x</span></div>
      </div>
      <div class="row" style="gap:8px">${["Special casts, staged", "Real boss fight", "Phone (failed)"].map((t, i) => `<span class="pill ${i === 2 ? "bad" : ""}">${t}</span>`).join("")}<span class="muted" style="margin-left:auto;font-size:12px">Use ← → to move through the queue</span></div>
      <div class="card" style="padding:14px 16px">
        <div class="sec-h"><h3>History</h3><span class="c">v3</span></div>
        ${[["you", "Tue 4:10 PM", "Sent back", "warn", "Still can't see my heroes when 3 Specials go off at once. Kill the screen dim."], ["frame", "Tue 6:52 PM", "v2", "", "Dropped the dim to 40% and halved the smoke. Spikes unchanged."], ["you", "Wed 9:15 AM", "Sent back", "warn", "Better. Dim fully off and the leftover ice should go way faster."], ["frame", "2h ago", "v3", "info", "This one."]].map(([w, t, tag, cls, txt], i) => `<div class="row" style="gap:10px;align-items:flex-start;padding:7px 0;${i ? "border-top:1px solid var(--line)" : ""}">${w === "you" ? `<span class="pfp" style="width:18px;height:18px;border-radius:99px;background:linear-gradient(135deg,#f0a35e,#d5543f);display:grid;place-items:center;font-size:8px;color:#fff;font-weight:600;flex:none">SK</span>` : av(w, "sm")}<span class="grow" style="font-size:12.5px">${txt}</span><span class="pill ${cls}" style="height:18px">${tag}</span><span class="mono dim" style="width:84px;text-align:right">${t}</span></div>`).join("")}
      </div>
    </div>
    <div style="border-left:1px solid var(--line);padding:20px;display:flex;flex-direction:column;gap:16px;background:var(--side)">
      <div class="row">${av("frame", "lg")}<div><div style="font-weight:600">Frame</div><div class="muted" style="font-size:12px">Anime Awakening RNG · 11 MB · 2h ago</div></div></div>
      <div>
        <div style="font-size:16px;font-weight:600;letter-spacing:-0.02em;line-height:1.3;margin-bottom:8px">Calmer Special abilities. Enough, or go further?</div>
        <div class="muted" style="font-size:12.5px;display:flex;flex-direction:column;gap:8px">
          <p>You said the effects were so loud you couldn't see anyone. Top row is three Specials, old then new: no more screen dim, smaller smoke, fewer spikes, and the leftovers clear in about 2 seconds.</p>
          <p>Bottom row is a real Lord Frozza fight. Honestly the gain there is small, because what covers the screen is the boss's own red floor (kept on purpose) and the roll reveal popping up mid-fight.</p>
          <p>Ultimates are untouched. PC only, the phone capture failed.</p>
        </div>
      </div>
      <div><div style="font-size:12px;font-weight:500;margin-bottom:6px">Note for Frame <span class="dim">(needed for changes)</span></div>
        <div class="input" style="height:84px;align-items:flex-start;padding-top:9px;color:var(--dim)">What would make it right?</div></div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-top:auto">
        <button class="btn pri" style="height:38px;justify-content:flex-start">${ic("check")}Approve<kbd style="margin-left:auto;background:rgba(0,0,0,.08);border-color:rgba(0,0,0,.2);color:var(--accent-ink)">A</kbd></button>
        <button class="btn" style="height:38px">${ic("msg")}Ask for changes<kbd>C</kbd></button>
        <button class="btn" style="height:38px;color:var(--bad)">${ic("x")}Reject<kbd>R</kbd></button>
        <div class="dim" style="font-size:11.5px;margin-top:2px">Approve ships it to the game. Changes go back to Frame with your note. Reject just drops it.</div>
      </div>
    </div>
  </div>`;
}

/* ---------- Games ---------- */
function games() {
  const dauNew = [410, 440, 430, 470, 450, 480, 820, 560, 420, 700, 740, 1250, 1390, 780, 430, 690, 360, 180, 120, 96];
  const dauRet = [20, 24, 22, 28, 30, 32, 40, 44, 38, 46, 52, 58, 64, 60, 52, 50, 44, 30, 24, 20];
  const online = Array.from({ length: 72 }, (_, i) => Math.max(1, Math.round(140 + 70 * Math.sin(i / 3.6) + 40 * Math.sin(i / 1.3) + (i > 50 ? 30 : 0))));
  const kpi = (l, v, d, c) => `<div class="card" style="padding:12px 14px"><div class="muted" style="font-size:12px">${l}</div><div style="font-size:22px;font-weight:600;letter-spacing:-0.03em;margin-top:2px">${v}</div><div class="mono" style="color:${c || "var(--muted)"};margin-top:2px">${d}</div></div>`;
  return `
  <div class="row" style="margin-bottom:16px;align-items:flex-end">
    <div class="grow"><div class="row" style="gap:10px"><h1 class="page">Anime Awakening RNG</h1><span class="pill ok"><span class="dot"></span>Live</span></div>
    <p class="lede" style="margin-top:4px">Pulled from Roblox every 5 minutes. Last update 2 minutes ago.</p></div>
    <div class="seg"><a>24h</a><a class="on">7 days</a><a>30 days</a><a>All</a></div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-bottom:18px">
    ${kpi("Playing now", "214", "+31 vs yesterday", "var(--ok)")}${kpi("Daily players", "1,384", "+12% this week", "var(--ok)")}${kpi("Came back next day", "18.2%", "-2.1 pts", "var(--bad)")}
    ${kpi("Avg session", "14m 20s", "about the same")}${kpi("Robux, 7 days", "R$ 14.9k", "+R$ 1.2k", "var(--ok)")}${kpi("Script errors", "3", "1 new since Tue", "var(--warn)")}
  </div>
  <div class="row" style="gap:22px;border-bottom:1px solid var(--line);margin-bottom:16px;font-weight:500">
    ${["Charts", "Where people quit", "Money", "Errors", "Fixes we shipped"].map((t, i) => `<span style="padding:0 0 10px;${i ? "color:var(--muted)" : "box-shadow:inset 0 -2px 0 var(--text)"}">${t}</span>`).join("")}
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr 300px;gap:14px">
    <div class="card" style="padding:14px 16px"><div class="sec-h"><h3>Daily players</h3><span class="r row" style="gap:12px"><span class="row" style="gap:5px"><i style="width:8px;height:8px;border-radius:2px;background:var(--info)"></i>New</span><span class="row" style="gap:5px"><i style="width:8px;height:8px;border-radius:2px;background:var(--ok)"></i>Returning</span></span></div>
      ${lineChart({ series: [{ data: dauNew, color: "var(--info)", area: true }, { data: dauRet, color: "var(--ok)" }], xl: ["Oct 4", "Oct 9", "Oct 14", "Oct 19", "Oct 23"] })}</div>
    <div class="card" style="padding:14px 16px"><div class="sec-h"><h3>Playing at once</h3><span class="c">last 72h</span><span class="r">Peak 312, Tue 8pm</span></div>
      ${lineChart({ series: [{ data: online, color: "var(--accent-text)", area: true, wd: 1.6, dot: true }], xl: ["Mon", "Tue", "Wed", "Thu"] })}</div>
    <div class="card" style="padding:16px;grid-row:span 2;display:flex;flex-direction:column;gap:12px">
      <div class="row">${av("pulse")}<b style="font-weight:600">Pulse noticed</b></div>
      <div style="font-size:14px;font-weight:600;letter-spacing:-0.01em;line-height:1.35">Fewer people came back after the Oct 14 update.</div>
      <div class="muted" style="font-size:12.5px">61% of the players we lost quit somewhere in Frostpeak, mostly at the ice bridge. The first boss there kills new players in about 9 seconds.</div>
      <div class="card" style="box-shadow:none;padding:10px;background:var(--raise)">
        ${[["Ice bridge", 61], ["Frozza fight", 22], ["Shop popup", 9], ["Other", 8]].map(([l, v]) => `<div style="margin:4px 0"><div class="row" style="font-size:12px"><span class="grow">${l}</span><span class="mono muted">${v}%</span></div><div class="bar" style="margin-top:4px"><i style="width:${v}%;background:var(--bad)"></i></div></div>`).join("")}
      </div>
      <button class="btn pri" style="justify-content:center">Have Clueless Tester play it</button>
      <button class="btn ghost" style="justify-content:center">Show me the clips</button>
    </div>
    <div class="card" style="padding:14px 16px"><div class="sec-h"><h3>First minute</h3><span class="c">new players</span><span class="r"><b style="color:var(--warn);font-weight:600">13%</b> leave in 60s</span></div>
      ${bars({ data: [62, 58, 52, 47, 43, 40, 37, 35, 33, 31, 30, 28, 27, 26, 25, 24, 23, 22, 21, 20], hi: 2, xl: [[0, "0s"], [2, "1m"], [6, "3m"], [10, "5m"], [19, "10m"]], h: 160 })}</div>
    <div class="card" style="padding:14px 16px"><div class="sec-h"><h3>Robux by product</h3><span class="c">7 days</span></div>
      ${[["2x Luck (1 hour)", 6120, "dev product"], ["VIP Hall", 4200, "pass"], ["Skip Raid Cooldown", 2710, "dev product"], ["Starter Pack", 1890, "pass"]].map(([n, v, t]) => `<div style="margin:9px 0"><div class="row"><span class="grow">${n} <span class="dim" style="font-size:11.5px">${t}</span></span><span class="mono">R$ ${v.toLocaleString()}</span></div><div class="bar" style="margin-top:6px;height:6px"><i style="width:${(v / 6120) * 100}%;background:var(--info)"></i></div></div>`).join("")}</div>
  </div>`;
}

/* ---------- Pitches + Market ---------- */
function market() {
  const rising = [
    ["Fish It But RNG", "RNG · Fishing", "48.2k", "+212%", [2, 3, 3, 5, 8, 12, 19, 26]],
    ["Grow a Garden 2", "Sim · Farming", "391k", "+38%", [20, 22, 21, 25, 27, 26, 30, 31]],
    ["Build a Boat Tycoon", "Tycoon", "12.9k", "+96%", [4, 4, 5, 6, 6, 8, 9, 11]],
    ["Steal a Pet", "PvP · Collect", "88.4k", "+64%", [10, 12, 11, 14, 16, 18, 19, 22]],
    ["Dig to China RNG", "RNG · Digging", "6.1k", "+150%", [1, 1, 2, 2, 3, 4, 5, 6]],
    ["Anime Card Clash", "Cards · Anime", "33.0k", "-12%", [14, 13, 13, 12, 12, 11, 11, 10]],
  ];
  const pitch = (title, why, tags, score, open) => `<div class="card" style="padding:16px">
    <div class="row" style="margin-bottom:8px">${av("pulse", "sm")}<span class="muted" style="font-size:12px">Pulse · pitched ${open}</span><span class="pill acc" style="margin-left:auto">${score}/10</span></div>
    <div style="font-size:15px;font-weight:600;letter-spacing:-0.015em;margin-bottom:8px">${title}</div>
    <ul style="padding-left:16px;color:var(--muted);font-size:12.5px;display:flex;flex-direction:column;gap:4px">${why.map(w => `<li>${w}</li>`).join("")}</ul>
    <div class="row" style="margin:12px 0 12px;gap:6px;flex-wrap:wrap">${tags.map(t => `<span class="pill">${t}</span>`).join("")}</div>
    <div class="row" style="gap:6px"><button class="btn sm pri">Send to Architect</button><button class="btn sm">Tell me more</button><button class="btn sm ghost" style="margin-left:auto">Not for us</button></div>
  </div>`;
  return `
  <div class="row" style="align-items:flex-end;margin-bottom:18px">
    <div class="grow"><h1 class="page">Market</h1><p class="lede">What's climbing on Roblox right now, and what Pulse thinks you should build next.</p></div>
    <span class="muted" style="font-size:12px">From RoWatcher and Roblox charts · 6 min ago</span>
  </div>
  <div style="display:grid;grid-template-columns:1.25fr 1fr;gap:22px">
    <section>
      <div class="row" style="margin-bottom:12px;gap:10px"><div class="seg"><a class="on">Rising</a><a>Top played</a><a>New this week</a><a>Your genres</a></div><div class="grow"></div><button class="btn sm">${ic("filter", "width:14px;height:14px")}Filters</button></div>
      <div class="card" style="overflow:hidden">
        <div class="row mono dim" style="padding:9px 16px;gap:14px;background:var(--raise)"><span style="width:18px">#</span><span class="grow">GAME</span><span style="width:70px;text-align:right">PLAYING</span><span style="width:90px;text-align:right">7 DAYS</span><span style="width:56px;text-align:right">CHANGE</span></div>
        ${rising.map(([n, g, ccu, ch, d], i) => `<div class="row" style="padding:10px 16px;gap:14px;border-top:1px solid var(--line)">
          <span class="mono dim" style="width:18px">${i + 1}</span>
          <div style="width:44px;flex:none">${thumb(["grove", "dino", "arena", "night", "dino", "snow"][i], 20 + i, { ar: "1/1", guys: 1, style: "border-radius:7px" })}</div>
          <div class="grow" style="min-width:0"><div style="font-weight:500" class="trunc">${n}</div><div class="muted" style="font-size:12px">${g}</div></div>
          <span class="mono" style="width:70px;text-align:right">${ccu}</span>
          <span style="width:90px;display:flex;justify-content:flex-end">${spark(d, 80, 22, ch[0] === "-" ? "var(--bad)" : "var(--ok)")}</span>
          <span class="mono" style="width:56px;text-align:right;color:${ch[0] === "-" ? "var(--bad)" : "var(--ok)"}">${ch}</span></div>`).join("")}
      </div>
      <div class="card" style="padding:14px 16px;margin-top:14px"><div class="sec-h"><h3>Genres, share of everyone playing</h3><span class="c">30 days</span></div>
        ${lineChart({ h: 150, series: [{ data: [8, 9, 9, 10, 11, 12, 13, 15, 16, 18], color: "var(--accent-text)", dot: true }, { data: [14, 14, 13, 13, 12, 12, 12, 11, 11, 11], color: "var(--info)", dot: true }, { data: [6, 6, 7, 7, 7, 8, 8, 8, 9, 9], color: "#f18cc0", dot: true }], xl: ["Sep 23", "Oct 3", "Oct 13", "Oct 23"] })}
        <div class="row" style="gap:14px;margin-top:6px;font-size:12px" >${[["RNG", "var(--accent-text)"], ["Simulator", "var(--info)"], ["Tycoon", "#f18cc0"]].map(([l, c]) => `<span class="row" style="gap:5px"><i style="width:8px;height:8px;border-radius:2px;background:${c}"></i>${l}</span>`).join("")}</div></div>
    </section>
    <section>
      <div class="sec-h" style="margin-bottom:12px"><h3>Pitches</h3><span class="c">3 new</span><span class="r">Saved 11</span></div>
      <div style="display:flex;flex-direction:column;gap:12px">
      ${pitch("Fishing RNG where the weather changes what bites", ["Fishing + RNG is the fastest riser this month and there are only 3 real ones in the top 200.", "Weather on a 20 min timer gives people a reason to come back at set times.", "Your Anime RNG roll code and index UI carry over almost as is."], ["About 3 weeks", "Reuses 40% of your code", "Phone first"], 8, "today")}
      ${pitch("Dino dig site co-op, 4 players per dig", ["Dig Up a Dino plays mostly solo and people leave by minute 6.", "Co-op digs in the top 50 hold players about twice as long."], ["About 1 week", "Update, not a new game"], 7, "yesterday")}
      </div>
    </section>
  </div>`;
}

/* ---------- Settings ---------- */
function settings(o = {}) {
  const sub = ["Account and sync", "Computers and apps", "AI provider", "Keys", "Connectors", "Roblox Studio", "Notifications", "Look and feel"];
  const tog = on => `<span style="width:34px;height:20px;border-radius:99px;background:${on ? "var(--accent)" : "var(--line-2)"};position:relative;flex:none;display:inline-block"><i style="position:absolute;top:2px;${on ? "right:2px" : "left:2px"};width:16px;height:16px;border-radius:99px;background:${on ? "var(--accent-ink)" : "var(--muted)"}"></i></span>`;
  const conn = (name, logoBg, letter, where, on, note) => `<div class="row" style="padding:12px 16px;gap:12px;border-top:1px solid var(--line)">
    <span style="width:30px;height:30px;border-radius:8px;background:${logoBg};display:grid;place-items:center;font-weight:700;color:#fff;font-size:13px;flex:none">${letter}</span>
    <div class="grow"><div style="font-weight:500">${name}</div><div class="muted" style="font-size:12px">${note}</div></div>
    <span class="pill ${where.startsWith("Not") ? "" : "ok"}">${where}</span>${tog(on)}</div>`;
  return `<div style="display:grid;grid-template-columns:200px 1fr;gap:32px;max-width:1180px">
    <nav class="nav" style="padding-top:4px">${sub.map((s, i) => `<a class="${i === (o.on ?? 4) ? "on" : ""}" style="height:32px">${s}</a>`).join("")}</nav>
    <div style="display:flex;flex-direction:column;gap:20px">
      <div><h1 class="page">Settings</h1><p class="lede">Keys and connectors live here. Everything syncs to your account, so you only set it up once.</p></div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
        <div class="card" style="padding:16px">
          <div class="sec-h"><h3>Agents run on</h3></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <div class="card" style="padding:12px;box-shadow:inset 0 0 0 1.5px var(--accent);border-color:transparent"><div class="row"><b style="font-weight:600">Claude Code</b><span class="pill acc" style="margin-left:auto;height:18px">In use</span></div><div class="muted" style="font-size:12px;margin-top:4px">Max plan · signed in on this PC</div></div>
            <div class="card" style="padding:12px;box-shadow:none"><div class="row"><b style="font-weight:600">Codex</b></div><div class="muted" style="font-size:12px;margin-top:4px">Not signed in. Run <span class="mono">codex login</span> first.</div></div>
          </div>
        </div>
        <div class="card" style="padding:16px">
          <div class="sec-h"><h3>Account</h3><span class="r row" style="gap:6px"><span class="dot"></span>Synced 12s ago</span></div>
          <div class="row" style="gap:10px"><span class="me"><span class="pfp">SK</span></span><div class="grow"><div style="font-weight:500">sam@inclined.gg</div><div class="muted" style="font-size:12px">MacBook Air, this PC, iPhone</div></div><button class="btn sm">Devices</button></div>
        </div>
      </div>

      <div class="card" style="overflow:hidden">
        <div style="padding:14px 16px 12px"><div class="sec-h" style="margin:0"><h3>Connectors</h3><span class="r">Rescan</span></div>
        <div class="muted" style="font-size:12.5px;margin-top:2px">We look at what's already connected in Claude Code or Codex. Turn one on and the agents can use it. Nothing new gets installed.</div></div>
        ${conn("Figma", "#1e1e1e", "F", "Found in Claude Code", true, "Frame pulls frames and styles from your files when you link one in a task")}
        ${conn("GitHub", "#24292f", "G", "Found in Claude Code", true, "Builder pushes to inclined/anime-rng on a branch, never main")}
        ${conn("Linear", "#5e6ad2", "L", "Found in Claude Code", false, "Producer files bugs from Reviewer and Playtest as Linear issues")}
        ${conn("Notion", "#2f2f2f", "N", "Not connected", false, "Connect it in Claude Code first, then hit Rescan")}
      </div>

      <div class="card" style="padding:16px">
        <div class="sec-h"><h3>Keys</h3><span class="r">Stored encrypted, never shown to agents in plain text</span></div>
        ${[["Roblox Open Cloud", "rbx-oc-••••••••••••3fa9", true, "Publishing, DataStores, analytics"], ["RoWatcher", "rw_live_••••••••a71c", true, "Market and Pitches data"], ["Discord webhook", "", false, "Optional. Posts approvals to a channel"]].map(([n, k, ok, what]) => `
          <div class="row" style="gap:12px;padding:10px 0;border-top:1px solid var(--line)">${ic("key", "color:var(--muted)")}<div style="width:200px"><div style="font-weight:500">${n}</div><div class="muted" style="font-size:12px">${what}</div></div>
          <div class="input grow mono" style="color:${k ? "var(--text)" : "var(--dim)"}">${k || "Paste a webhook URL"}</div>${ok ? `<span class="pill ok">${ic("check", "width:11px;height:11px")}Works</span>` : `<button class="btn sm">Save</button>`}</div>`).join("")}
        <div class="card" style="box-shadow:none;background:var(--raise);padding:12px 14px;margin-top:8px">
          <div style="font-weight:600;margin-bottom:6px">Getting a Roblox Open Cloud key</div>
          <ol style="padding-left:18px;color:var(--muted);font-size:12.5px;display:flex;flex-direction:column;gap:3px">
            <li>Go to create.roblox.com, then Credentials, then Create API key.</li>
            <li>Add your experiences, and give it Place publishing, DataStore read/write and Analytics read.</li>
            <li>Copy the key right away. Roblox only shows it once, so if you lose it just make a new one.</li>
          </ol>
        </div>
      </div>
    </div>
  </div>`;
}


/* ---------- Settings: computers and apps ---------- */
function settingsApps() {
  const tog = on => `<span style="width:34px;height:20px;border-radius:99px;background:${on ? "var(--accent)" : "var(--line-2)"};position:relative;flex:none;display:inline-block"><i style="position:absolute;top:2px;${on ? "right:2px" : "left:2px"};width:16px;height:16px;border-radius:99px;background:${on ? "var(--accent-ink)" : "var(--muted)"}"></i></span>`;
  const sub = ["Account and sync", "Computers and apps", "AI provider", "Keys", "Connectors", "Roblox Studio", "Notifications", "Look and feel"];
  const comp = (icon, name, meta, role, roleCls, right, last) => `<div class="row" style="gap:14px;padding:14px 16px;${last ? "" : "border-bottom:1px solid var(--line)"}">
    <span style="width:36px;height:36px;border-radius:9px;background:var(--raise);border:1px solid var(--line);display:grid;place-items:center;color:var(--muted)">${ic(icon)}</span>
    <div class="grow"><div class="row" style="gap:8px"><b style="font-weight:600">${name}</b><span class="pill ${roleCls}" style="height:18px">${role}</span></div><div class="muted" style="font-size:12px;margin-top:2px">${meta}</div></div>${right}</div>`;
  const app = (bg, letter, name, ver, path, who, on, how) => `<div class="row" style="gap:14px;padding:13px 16px;border-top:1px solid var(--line)">
    <span style="width:34px;height:34px;border-radius:9px;background:${bg};display:grid;place-items:center;font-weight:700;color:#fff;font-size:14px;flex:none">${letter}</span>
    <div style="width:260px"><div style="font-weight:500">${name} <span class="dim mono">${ver}</span></div><div class="mono dim trunc" style="font-size:10.5px;margin-top:2px">${path}</div></div>
    <div class="grow muted" style="font-size:12px">${how}</div>
    <div class="row" style="gap:3px;width:70px;justify-content:flex-end">${who.map(k => av(k, "sm")).join("")}</div>${tog(on)}</div>`;
  return `<div style="display:grid;grid-template-columns:200px 1fr;gap:32px;max-width:1180px">
    <nav class="nav" style="padding-top:4px">${sub.map((s, i) => `<a class="${i === 1 ? "on" : ""}" style="height:32px">${s}</a>`).join("")}</nav>
    <div style="display:flex;flex-direction:column;gap:20px">
      <div><h1 class="page">Computers and apps</h1><p class="lede">Agents run on one computer. Everything else, your phone included, is a remote that sends it work and shows you what's happening.</p></div>

      <div class="card" style="overflow:hidden">
        <div style="padding:14px 16px 12px;border-bottom:1px solid var(--line)" class="sec-h"><h3>Your computers</h3><span class="r">Signed in on 3</span></div>
        ${comp("studio", "Sam's PC", "Windows 11 · Claude Code (Max) · 4 Studio slots · up 3 days", "Runs the agents", "acc", `<span class="row muted" style="gap:6px;font-size:12px"><span class="dot pulse"></span>Online, 4 busy</span>`)}
        ${comp("studio", "MacBook Air", "macOS 15 · Claude Code (Max) · 2 Studio slots", "Backup", "", `<span class="muted" style="font-size:12px;margin-right:6px">Take over if the PC goes offline</span>${tog(true)}`)}
        ${comp("phone", "iPhone 15", "Remote only. Nothing runs on the phone, it just sends tasks to Sam's PC", "Remote", "info", `<span class="row muted" style="gap:6px;font-size:12px"><span class="dot"></span>Seen 2m ago</span>`, true)}
      </div>
      <div class="row" style="gap:10px;padding:12px 14px;border-radius:10px;border:1px dashed var(--line-2);color:var(--muted);font-size:12.5px">${ic("cloud")}If Sam's PC is off, new tasks wait in the queue and start the second it's back. You'll get a ping if something's been waiting over an hour.</div>

      <div class="card" style="overflow:hidden">
        <div style="padding:14px 16px 12px"><div class="sec-h" style="margin:0"><h3>Apps the agents can use on Sam's PC</h3><span class="r">Scanned 4 min ago</span></div>
        <div class="muted" style="font-size:12.5px;margin-top:2px">They open these like you would, do the work, and drop the result in Library. Turn off anything you don't want them touching.</div></div>
        ${app("#e87d0d", "B", "Blender", "4.2", "C:\\Program Files\\Blender Foundation\\Blender 4.2", ["librarian", "scenic"], true, "Clean up and retopo models, bake textures, export .fbx straight into Studio")}
        ${app("#7b4fd6", "A", "Aseprite", "1.3", "C:\\Program Files\\Aseprite", ["splash", "frame"], true, "Pixel icons, UI sprites and small animations")}
        ${app("#31a8ff", "Ps", "Photoshop", "2025", "C:\\Program Files\\Adobe\\Adobe Photoshop 2025", ["splash"], false, "Thumbnails and store art. Off until you say so")}
        ${app("#0d3b66", "Au", "Audacity", "3.6", "C:\\Program Files\\Audacity", ["librarian"], true, "Trim, normalize and loop sounds before upload")}
        <div class="row" style="padding:12px 16px;border-top:1px solid var(--line);gap:10px"><button class="btn sm">${ic("plus", "width:14px;height:14px")}Add an app</button><span class="muted" style="font-size:12px">Point it at any program and write one line about what it's for. The agents figure out the rest.</span></div>
      </div>
    </div>
  </div>`;
}

/* ---------- Playtest ---------- */
function playtest() {
  const marks = [[8, "ok"], [21, "ok"], [34, "warn"], [47, "ok"], [58, "bad"], [71, "ok"], [86, "bad"]];
  const steps = [
    ["0:00", "Spawned, read the tutorial popup in 3s", "ok"],
    ["0:41", "Found the shovel, first dig worked", "ok"],
    ["1:52", "Couldn't tell which rocks are diggable. Tried 6 before one worked", "warn"],
    ["3:05", "Filled the backpack, walked back to sell", "ok"],
    ["3:58", "Sell button hidden behind the chat on phone. Gave up after 40s", "bad"],
    ["5:10", "Bought shovel #2 on PC run, dig speed felt the same", "ok"],
    ["6:22", "Swamp gate says 'Need 500 Fossils' but nothing says where to get them", "bad"],
  ];
  const col = c => c === "bad" ? "var(--bad)" : c === "warn" ? "var(--warn)" : "var(--ok)";
  return `
  <div class="row" style="align-items:flex-end;margin-bottom:18px">
    <div class="grow"><div class="row" style="gap:10px"><h1 class="page">Playtest run #14</h1><span class="pill">Dig Up a Dino</span></div>
    <p class="lede" style="margin-top:4px">Clueless Tester and Playtest played it fresh on phone and PC. Two places people will quit.</p></div>
    <button class="btn">${ic("reload", "width:14px;height:14px")}Run again</button><button class="btn pri">Send both fixes to Builder</button>
  </div>
  <div style="display:grid;grid-template-columns:1fr 360px;gap:20px">
    <div style="display:flex;flex-direction:column;gap:14px;min-width:0">
      <div class="card" style="padding:10px;background:#0a0a09;border-color:#22231f">
        <div style="display:grid;grid-template-columns:1.6fr 1fr;gap:6px">
          ${thumb("dino", 31, { tag: "PC · PLAYTEST", hud: "FOSSILS 212", guys: 2, k: "pt1" })}
          ${thumb("dino", 33, { tag: "PHONE · KID TESTER", guys: 1, k: "pt2", ar: "auto", style: "height:100%" })}
        </div>
        <div style="padding:12px 4px 4px">
          <div style="position:relative;height:6px;border-radius:99px;background:#2a2a26"><i style="position:absolute;left:0;top:0;bottom:0;width:58%;border-radius:99px;background:#ecebe4"></i>
          ${marks.map(([x, c]) => `<span style="position:absolute;left:${x}%;top:-4px;width:4px;height:14px;border-radius:2px;background:${col(c)}"></span>`).join("")}</div>
          <div class="row" style="margin-top:8px;color:#8d8c84">${play}<span class="mono">3:58 / 6:50</span><span class="grow"></span><span class="mono">markers = where it struggled</span></div>
        </div>
      </div>
      <div class="card" style="padding:6px 16px">
        ${steps.map(([t, txt, c], i) => `<div class="row" style="gap:12px;padding:9px 0;align-items:flex-start;${i ? "border-top:1px solid var(--line)" : ""}"><span class="mono dim" style="width:34px;padding-top:1px">${t}</span><span style="width:8px;height:8px;border-radius:99px;background:${col(c)};margin-top:5px;flex:none"></span><span class="grow ${c === "ok" ? "muted" : ""}">${txt}</span>${c === "bad" ? `<button class="btn sm">Fix this</button>` : ""}</div>`).join("")}
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:14px">
      <div class="card" style="padding:16px">
        <div class="sec-h"><h3>How it read your game</h3></div>
        ${[["Type", "Digging and collecting sim"], ["Goal it set", "Dig a full T-Rex, sell it, open the swamp"], ["Controls", "WASD, click to dig, E to sell, tap on phone"], ["Played as", "New player, phone + PC, 1 and 2 players"]].map(([k, v]) => `<div class="row" style="align-items:flex-start;gap:10px;padding:6px 0"><span class="muted" style="width:86px;flex:none;font-size:12px;padding-top:1px">${k}</span><span>${v}</span></div>`).join("")}
        <div class="muted" style="font-size:12px;margin-top:8px;padding-top:10px;border-top:1px solid var(--line)">It reads your scripts and UI first, then plays. Obby, tycoon, RNG, shooter, horror, story, anything. If it can't work out the goal it asks you once and remembers.</div>
      </div>
      <div class="card" style="padding:16px">
        <div class="sec-h"><h3>Next run</h3></div>
        <div style="font-size:12px;font-weight:500;margin-bottom:6px">Devices</div>
        <div class="row" style="gap:6px;margin-bottom:12px;flex-wrap:wrap"><span class="pill ok">${ic("phone", "width:12px;height:12px")}Phone</span><span class="pill ok">${ic("studio", "width:12px;height:12px")}PC</span><span class="pill">${ic("games", "width:12px;height:12px")}Controller</span><span class="pill">Tablet</span></div>
        <div style="font-size:12px;font-weight:500;margin-bottom:6px">Players</div>
        <div class="seg" style="margin-bottom:12px"><a>1</a><a class="on">2</a><a>4</a><a>8</a></div>
        <div style="font-size:12px;font-weight:500;margin-bottom:6px">Tell it anything</div>
        <div class="input" style="height:58px;align-items:flex-start;padding-top:8px;color:var(--dim)">e.g. skip the tutorial, go straight for the swamp</div>
      </div>
    </div>
  </div>`;
}

/* ---------- Mobile ---------- */
const sbar = `<div class="sb"><span>9:41</span><span class="ic"><svg width="18" height="11" viewBox="0 0 18 11"><rect x="0" y="7" width="3" height="4" rx="1" fill="currentColor"/><rect x="5" y="5" width="3" height="6" rx="1" fill="currentColor"/><rect x="10" y="2.5" width="3" height="8.5" rx="1" fill="currentColor"/><rect x="15" y="0" width="3" height="11" rx="1" fill="currentColor"/></svg><svg width="26" height="12" viewBox="0 0 26 12"><rect x=".5" y=".5" width="22" height="11" rx="3" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="16" height="8" rx="1.6" fill="currentColor"/><rect x="24" y="4" width="1.6" height="4" rx=".8" fill="currentColor" opacity=".4"/></svg></span></div>`;
const tabbar = on => `<div style="margin-top:auto;border-top:1px solid var(--line);background:color-mix(in srgb,var(--side) 92%,transparent);backdrop-filter:blur(10px);padding:8px 10px 26px;display:flex;justify-content:space-around">
  ${[["home", "Home"], ["tasks", "Tasks"], ["lead", "Lead"], ["review", "Review"], ["grid", "More"]].map(([k, l]) => `<div style="display:flex;flex-direction:column;align-items:center;gap:3px;font-size:10.5px;font-weight:500;color:${k === on ? "var(--text)" : "var(--dim)"};position:relative">
    ${k === "lead" ? `<span style="width:40px;height:30px;border-radius:10px;background:var(--accent);color:var(--accent-ink);display:grid;place-items:center">${ic("lead", "width:18px;height:18px")}</span>` : ic(k, "width:22px;height:22px")}${k === "lead" ? "" : l}
    ${k === "review" ? `<span style="position:absolute;top:-3px;right:-2px;background:var(--bad);color:#fff;font:600 9.5px var(--mono);padding:0 4px;border-radius:99px;line-height:15px">6</span>` : ""}</div>`).join("")}
</div>`;
const mHead = (title, right = "") => `<div class="row" style="padding:6px 18px 10px">${logo(26)}<b style="font-size:17px;font-weight:600;letter-spacing:-0.02em;margin-left:2px">${title}</b><div class="grow"></div>${right}</div>`;

function mHome() {
  return `${sbar}${mHead("Home", `<span class="pill ok" style="font-size:11px"><span class="dot"></span>Sam's PC</span>`)}
  <div style="padding:0 18px;overflow:hidden;display:flex;flex-direction:column;gap:16px">
    <div><h1 class="page" style="font-size:24px">Evening, Sam.</h1><div class="muted" style="margin-top:3px">4 need you · 4 working · 5 queued</div></div>
    <div class="row" style="gap:10px;padding:10px 12px;border-radius:10px;background:var(--raise);border:1px solid var(--line);font-size:12px">${ic("studio", "color:var(--muted)")}<span class="grow muted">This phone is just the remote. Everything runs on <b style="color:var(--text);font-weight:500">Sam's PC</b>, 2 Studios open.</span></div>
    <div class="card" style="padding:12px 14px;display:flex;align-items:center;gap:10px;color:var(--dim)">${ic("lead", "color:var(--accent-text)")}Tell the Lead what you want<span style="margin-left:auto">${ic("mic")}</span></div>
    <div>
      <div class="sec-h"><h3>Needs you</h3><span class="c">4</span></div>
      <div style="display:flex;flex-direction:column;gap:8px">
      ${[["playtest", "Try party raid quick join with a second account", "12m", `<button class="btn sm" style="flex:1;justify-content:center">Works for me</button><button class="btn sm" style="flex:1;justify-content:center">Something's off</button>`],
        ["balance", "How much stronger should a 1 in a million hero be?", "1h", `<button class="btn sm pri" style="flex:1;justify-content:center">Keep 4x cap</button><button class="btn sm" style="flex:1;justify-content:center">Raise to 6x</button>`],
        ["reviewer", "Stopped a ship. Daily reward can be claimed twice", "2h", `<button class="btn sm" style="flex:1;justify-content:center">Hand to Builder</button>`]].map(([k, t, a, b]) => `
        <div class="card" style="padding:12px 14px"><div class="row" style="margin-bottom:5px">${av(k, "sm")}<span class="muted" style="font-size:12px">${AG[k][0]} · Anime RNG</span><span class="mono dim" style="margin-left:auto">${a}</span></div>
        <div style="font-weight:600;font-size:14px;line-height:1.3;margin-bottom:10px">${t}</div><div class="row" style="gap:6px">${b}</div></div>`).join("")}
      </div>
    </div>
    <div>
      <div class="sec-h"><h3>Working now</h3><span class="c">4</span></div>
      <div class="card">${[["builder", "Raid lava + weekly reset", 62], ["frame", "Loading screen fix", 35]].map(([k, t, p], i) => `<div style="padding:10px 14px;${i ? "border-top:1px solid var(--line)" : ""}"><div class="row">${av(k, "sm")}<span class="grow" style="font-weight:500">${t}</span><span class="mono dim">${p}%</span></div><div class="bar" style="margin-top:7px"><i style="width:${p}%"></i></div></div>`).join("")}</div>
    </div>
  </div>${tabbar("home")}`;
}

function mReview() {
  return `${sbar}<div class="row" style="padding:6px 18px 10px">${ic("left", "width:22px;height:22px")}<b style="font-size:15px;font-weight:600;margin:0 auto">Review</b><span class="mono dim">1 / 6</span></div>
  <div style="padding:0 14px;display:flex;flex-direction:column;gap:12px;flex:1;min-height:0">
    <div style="display:grid;grid-template-columns:1fr;gap:4px;background:#0a0a09;padding:6px;border-radius:14px">
      ${thumb("grove", 11, { tag: "BEFORE", vfxSize: 70, vfx: "#ff6fd6", sparks: 40, guys: 4, k: "ma", style: "border-radius:9px" })}
      ${thumb("grove", 11, { tag: "AFTER", vfxSize: 26, vfx: "#ff6fd6", sparks: 8, guys: 4, k: "mb", style: "border-radius:9px" })}
    </div>
    <div class="row">${av("frame", "sm")}<span class="muted" style="font-size:12px">Frame · Anime Awakening RNG · 2h</span></div>
    <div style="font-size:18px;font-weight:600;letter-spacing:-0.02em;line-height:1.25">Calmer Special abilities. Enough, or go further?</div>
    <div class="muted" style="font-size:13px">No more screen dim, smaller smoke, fewer spikes. Leftovers clear in about 2 seconds. Ultimates untouched.</div>
    <div class="input" style="height:40px;color:var(--dim)">Add a note (needed for changes)</div>
  </div>
  <div style="padding:12px 14px 30px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;border-top:1px solid var(--line)">
    <button class="btn" style="height:46px;justify-content:center;flex-direction:column;gap:2px;color:var(--bad)">${ic("x")}<span style="font-size:11px">Reject</span></button>
    <button class="btn" style="height:46px;justify-content:center;flex-direction:column;gap:2px">${ic("msg")}<span style="font-size:11px">Changes</span></button>
    <button class="btn pri" style="height:46px;justify-content:center;flex-direction:column;gap:2px">${ic("check")}<span style="font-size:11px">Approve</span></button>
  </div>`;
}

function mLead() {
  const msg = (me, html) => `<div style="display:flex;${me ? "justify-content:flex-end" : "gap:8px"}">${me ? "" : av("lead", "sm")}<div style="max-width:84%;padding:10px 12px;border-radius:14px;${me ? "background:var(--accent);color:var(--accent-ink);border-bottom-right-radius:4px" : "background:var(--panel);border:1px solid var(--line);border-top-left-radius:4px"};font-size:13.5px">${html}</div></div>`;
  const task = (k, t) => `<div class="row" style="gap:8px;padding:7px 0;border-top:1px solid var(--line)">${av(k, "sm")}<span class="grow" style="font-size:12.5px">${t}</span><span class="pill" style="height:18px;font-size:10px">queued</span></div>`;
  return `${sbar}${mHead("Lead", `<span class="pill ok" style="font-size:11px"><span class="dot"></span>Sam's PC</span>`)}
  <div style="padding:4px 14px;display:flex;flex-direction:column;gap:12px;flex:1;overflow:hidden">
    <div class="mono dim" style="text-align:center">TODAY 6:12 PM</div>
    ${msg(true, "people are quitting at the ice bridge in frostpeak. fix it but don't make it baby mode")}
    ${msg(false, `Makes sense. It's less the bridge and more that Frozza is right after it and new players show up underleveled. Plan:
      <div style="margin-top:8px">${task("kid", "Play Frostpeak fresh, note every death")}${task("balance", "Find the level where Frozza feels fair")}${task("builder", "Add a checkpoint after the bridge")}${task("frame", "Warn people if they're under level 12")}</div>
      <div class="row" style="gap:6px;margin-top:8px"><button class="btn sm pri" style="flex:1;justify-content:center">Start all 4</button><button class="btn sm" style="flex:1;justify-content:center">Change it</button></div>`)}
    ${msg(true, "start them. skip the warning popup, people hate popups")}<div class="mono dim" style="text-align:right;margin-top:-6px">sent to Sam's PC</div>
    ${msg(false, "Done, dropped Frame's popup. Clueless Tester is opening Studio 3 now. I'll ping you when there's a clip.")}
  </div>
  <div style="padding:10px 14px 30px;border-top:1px solid var(--line)"><div class="row card" style="padding:8px 8px 8px 14px;border-radius:99px;gap:8px;color:var(--dim)">${ic("plus")}<span class="grow">Message the Lead</span><span class="mono" style="font-size:10px">runs on PC</span><span style="width:30px;height:30px;border-radius:99px;background:var(--accent);color:var(--accent-ink);display:grid;place-items:center">${ic("up", "width:16px;height:16px")}</span></div></div>`;
}

/* ---------- Frames ---------- */
const winCtl = `<span><svg width="10" height="10" viewBox="0 0 10 10"><path d="M0 5h10" stroke="currentColor"/></svg></span><span><svg width="10" height="10" viewBox="0 0 10 10"><rect x=".5" y=".5" width="9" height="9" fill="none" stroke="currentColor"/></svg></span><span><svg width="10" height="10" viewBox="0 0 10 10"><path d="M0 0l10 10M10 0L0 10" stroke="currentColor"/></svg></span>`;

const SHOTS = {
  "pc-site": { stage: "win", w: 1600, h: 1000, html: () => `<div class="window" style="width:1600px;height:1000px">
    <div class="chrome"><div class="tabs"><div class="tab on">${logo(14)}<span>Home · RoSlop</span><span class="x">✕</span></div><div class="tab">Anime Awakening RNG - Roblox</div><span style="padding:0 10px 8px;color:#888">+</span>
    <div class="ctl">${winCtl}</div></div>
    <div class="bar2"><div class="navb">${ic("left")}${ic("right")}${ic("reload")}</div><div class="omni">${ic("lock", "width:13px;height:13px;color:#8a8a8f")}<span>roslop.app<span class="path">/home</span></span></div>${ic("user", "color:#8a8a8f")}</div></div>
    <div class="body">${shell("home", `<b>Home</b>`, home(), { win: true })}</div></div>` },

  "mac-site": { stage: "paper", w: 1560, h: 900, html: () => `<div class="window" style="width:1560px;height:900px">
    <div class="safari"><div class="lights"><i></i><i></i><i></i></div><div class="tools">${ic("left")}${ic("right")}</div><div class="url">${ic("lock", "width:12px;height:12px")}roslop.app</div><div class="tools">${ic("upload")}${ic("plus")}${ic("copy")}</div></div>
    <div class="body">${shell("games", `<span>Games</span>${ic("right", "width:13px;height:13px")}<b>Anime Awakening RNG</b>`, games(), { light: true })}</div></div>` },

  "mac-app": { stage: "warm", w: 1560, h: 960, html: () => `<div class="window" style="width:1560px;height:960px">
    <div class="body">${shell("review", `<b>Review</b><span class="dim">·</span><span>Anime Awakening RNG</span>`, review(), { mac: true, pad: "padding:0" })}</div></div>` },

  "windows-app": { stage: "win", w: 1560, h: 980, html: () => `<div class="window win" style="width:1560px;height:980px">
    <div class="winbar">${logo(16)}<span class="ttl">RoSlop</span><div class="ctl">${winCtl}</div></div>
    <div class="body">${shell("tasks", `<b>Tasks</b>`, tasks(), { win: true })}</div></div>` },

  "mac-app-market": { stage: "paper", w: 1560, h: 920, html: () => `<div class="window" style="width:1560px;height:920px">
    <div class="body">${shell("market", `<b>Market</b>`, market(), { mac: true, light: true })}</div></div>` },

  "windows-app-apps": { stage: "win", w: 1560, h: 1000, html: () => `<div class="window win" style="width:1560px;height:1000px">
    <div class="winbar">${logo(16)}<span class="ttl">RoSlop</span><div class="ctl">${winCtl}</div></div>
    <div class="body">${shell("settings", `<b>Settings</b><span class="dim">·</span><span>Computers and apps</span>`, settingsApps(), { win: true })}</div></div>` },

  "pc-site-playtest": { stage: "win", w: 1600, h: 1000, html: () => `<div class="window" style="width:1600px;height:1000px">
    <div class="chrome"><div class="tabs"><div class="tab on">${logo(14)}<span>Playtest · RoSlop</span><span class="x">✕</span></div><span style="padding:0 10px 8px;color:#888">+</span>
    <div class="ctl">${winCtl}</div></div>
    <div class="bar2"><div class="navb">${ic("left")}${ic("right")}${ic("reload")}</div><div class="omni">${ic("lock", "width:13px;height:13px;color:#8a8a8f")}<span>roslop.app<span class="path">/games/dig-up-a-dino/playtest/14</span></span></div>${ic("user", "color:#8a8a8f")}</div></div>
    <div class="body">${shell("games", `<span>Games</span>${ic("right", "width:13px;height:13px")}<span>Dig Up a Dino</span>${ic("right", "width:13px;height:13px")}<b>Playtest</b>`, playtest(), { win: true })}</div></div>` },

  "windows-app-settings": { stage: "win", w: 1560, h: 1060, html: () => `<div class="window win" style="width:1560px;height:1060px">
    <div class="winbar">${logo(16)}<span class="ttl">RoSlop</span><div class="ctl">${winCtl}</div></div>
    <div class="body">${shell("settings", `<b>Settings</b><span class="dim">·</span><span>Connectors</span>`, settings(), { win: true })}</div></div>` },

  "mobile-site": { stage: "warm", w: 1366, h: 900, html: () => `<div class="phones">
    ${[[mHome(), "Home"], [mReview(), "Review"], [mLead(), "Lead"]].map(([s, c]) => `<div><div class="phone"><div class="island"></div><div class="scr">${s}</div></div><div class="cap">${c}</div></div>`).join("")}
  </div>` },
};

