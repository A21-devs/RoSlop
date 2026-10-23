// Little SVG game frames and stickers for demo mode, so it looks alive before
// any real screenshots exist.

function rng(seed: number) {
  let s = seed * 9301 + 49297;
  return () => (s = (s * 9301 + 49297) % 233280) / 233280;
}

function guy(x: number, y: number, c: string) {
  return `<g transform="translate(${x} ${y}) scale(1.15)"><rect x="-5" y="0" width="4" height="9" fill="#2b2b33"/><rect x="1" y="0" width="4" height="9" fill="#2b2b33"/><rect x="-6" y="-12" width="12" height="12" rx="1" fill="${c}"/><rect x="-9" y="-12" width="3" height="10" fill="${c}" opacity=".85"/><rect x="6" y="-12" width="3" height="10" fill="${c}" opacity=".85"/><rect x="-4.5" y="-21" width="9" height="9" rx="1.5" fill="#f1c7a1"/><rect x="-5" y="-23" width="10" height="4" rx="1" fill="#2a1c14"/></g>`;
}

const LOOKS = {
  grove: { sky: ["#69b6ea", "#d7eef9"], far: "#5f9c63", ground: ["#5bab4b", "#3f8a37"] },
  snow: { sky: ["#8fb3dd", "#e3edf7"], far: "#b9cde3", ground: ["#f3f6fa", "#d5e1ee"] },
  arena: { sky: ["#2f2a4a", "#e58a5a"], far: "#5b3f4c", ground: ["#d99447", "#9c5a26"] },
  dino: { sky: ["#f2b46b", "#fde3b5"], far: "#c47f45", ground: ["#e3b77c", "#c48f55"] },
  night: { sky: ["#141032", "#45305f"], far: "#2a2148", ground: ["#3c3550", "#221d30"] },
};

export type Look = keyof typeof LOOKS;

export function scene(kind: Look, seed = 1, o: { guys?: number; vfx?: string; glow?: number; sparks?: number } = {}) {
  const t = LOOKS[kind];
  const r = rng(seed);
  const id = `${kind}${seed}`;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="s${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.sky[0]}"/><stop offset="1" stop-color="${t.sky[1]}"/></linearGradient><linearGradient id="g${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.ground[0]}"/><stop offset="1" stop-color="${t.ground[1]}"/></linearGradient><radialGradient id="v${id}"><stop offset="0" stop-color="${o.vfx ?? "#ff7ad9"}" stop-opacity=".95"/><stop offset=".5" stop-color="${o.vfx ?? "#ff7ad9"}" stop-opacity=".35"/><stop offset="1" stop-color="${o.vfx ?? "#ff7ad9"}" stop-opacity="0"/></radialGradient></defs><rect width="320" height="180" fill="url(#s${id})"/>`;
  let hills = "0,100 ";
  for (let x = 0; x <= 320; x += 20) hills += `${x},${78 + r() * 26} `;
  s += `<polygon points="${hills}320,100" fill="${t.far}"/><polygon points="0,98 320,92 320,180 0,180" fill="url(#g${id})"/>`;
  if (kind === "grove") {
    for (let i = 0; i < 6; i++) s += `<circle cx="${20 + i * 52 + r() * 10}" cy="${86 - r() * 8}" r="${14 + r() * 8}" fill="#2f7a3a"/>`;
    s += `<g fill="#d8442f"><rect x="226" y="72" width="4" height="34"/><rect x="258" y="72" width="4" height="34"/><rect x="220" y="70" width="48" height="5" rx="1"/></g>`;
  }
  if (kind === "snow") for (let i = 0; i < 7; i++) {
    const x = 15 + r() * 290, h = 16 + r() * 26;
    s += `<polygon points="${x},${120 - h} ${x + 7},120 ${x - 7},120" fill="#5fa6e8"/>`;
  }
  if (kind === "arena") {
    s += `<ellipse cx="160" cy="138" rx="120" ry="30" fill="#e8a352" stroke="#7a3c13" stroke-width="2"/><ellipse cx="160" cy="138" rx="70" ry="17" fill="none" stroke="#ffcf4a" stroke-width="2" stroke-dasharray="6 4"/>`;
    for (let i = 0; i < 4; i++) s += `<rect x="${40 + i * 78}" y="62" width="8" height="40" fill="#6a4a3a"/><circle cx="${44 + i * 78}" cy="56" r="4" fill="#ffb84a"/>`;
  }
  if (kind === "dino") {
    s += `<ellipse cx="170" cy="140" rx="70" ry="18" fill="#7a4d26"/><ellipse cx="170" cy="137" rx="60" ry="13" fill="#5b3618"/><path d="M135 136c10-10 24-12 34-6s22 6 30-2" stroke="#f3ead6" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  }
  if (kind === "night") {
    for (let i = 0; i < 20; i++) s += `<circle cx="${r() * 320}" cy="${r() * 70}" r=".8" fill="#fff" opacity=".7"/>`;
    s += `<g transform="translate(165 132)"><rect x="-16" y="-44" width="32" height="40" rx="3" fill="#6b3fa0"/><rect x="-10" y="-60" width="20" height="18" rx="3" fill="#8a5bc4"/></g>`;
  }
  const cols = ["#3c6fd8", "#d84a7a", "#36a36b", "#e0a93a", "#7a55d6"];
  for (let i = 0; i < (o.guys ?? 3); i++) s += guy(90 + i * 46 + r() * 20, 128 + r() * 18, cols[(seed + i) % cols.length]);
  if (o.glow) s += `<circle cx="165" cy="118" r="${o.glow}" fill="url(#v${id})"/>`;
  for (let i = 0; i < (o.sparks ?? 0); i++) s += `<circle cx="${110 + r() * 110}" cy="${80 + r() * 70}" r="${1 + r() * 2.5}" fill="${o.vfx ?? "#ffd2f2"}"/>`;
  return s + "</svg>";
}

const STICKERS = {
  gem: `<path d="M30 22h36l14 18-32 38-32-38z" fill="#58b8ff"/><path d="M30 22l8 18h20l8-18 M16 40h64 M38 40l10 38 10-38" fill="none"/>`,
  coin: `<circle cx="48" cy="50" r="30" fill="#f7c234"/><circle cx="48" cy="50" r="21" fill="#ffd95c"/><path d="M48 36l4.5 9 10 1.5-7 7 1.6 10L48 59l-9 4.5 1.6-10-7-7 10-1.5z" fill="#f7a823"/>`,
  chest: `<path d="M20 44h56v30H20z" fill="#b8693a"/><path d="M20 44c0-14 10-22 28-22s28 8 28 22z" fill="#d07c45"/><path d="M20 44h56v8H20z M44 40h8v16h-8z" fill="#f7c234"/>`,
  gift: `<path d="M20 42h56v34H20z" fill="#ff6fa8"/><path d="M16 32h64v12H16z" fill="#ff8dbd"/><path d="M44 32h8v44h-8z" fill="#ffd95c"/>`,
  clover: `<circle cx="38" cy="38" r="12" fill="#3fbf5f"/><circle cx="58" cy="38" r="12" fill="#3fbf5f"/><circle cx="38" cy="58" r="12" fill="#3fbf5f"/><circle cx="58" cy="58" r="12" fill="#3fbf5f"/>`,
  egg: `<path d="M48 18c16 0 26 24 26 38s-11 22-26 22-26-8-26-22 10-38 26-38z" fill="#9fe08a"/><circle cx="40" cy="40" r="5" fill="#5aa848"/><circle cx="58" cy="54" r="7" fill="#5aa848"/>`,
  potion: `<path d="M40 18h16v16c12 4 18 14 18 24 0 14-11 22-26 22s-26-8-26-22c0-10 6-20 18-24z" fill="#b48cff"/><path d="M26 56h44c0 12-10 20-22 20s-22-8-22-20z" fill="#8a4dff"/>`,
  sword: `<path d="M62 14l14 4-4 14-30 30-10-10z" fill="#d7e3f0"/><path d="M26 58l12 12-6 6-12-12z" fill="#f7c234"/><path d="M22 70l6 6-8 8-6-6z" fill="#8a5130"/>`,
  shovel: `<path d="M64 16l12 12-26 26-6-6z" fill="#b8693a"/><path d="M42 48l8 8-8 18c-4 6-14 6-18 2s-4-14 2-18z" fill="#c9d4df"/>`,
  crown: `<path d="M18 34l16 12 14-22 14 22 16-12-6 38H24z" fill="#f7c234"/><circle cx="48" cy="58" r="5" fill="#ff5a5a"/>`,
  scroll: `<path d="M28 20h40v56H28z" fill="#f3d9a4"/><rect x="22" y="14" width="52" height="10" rx="5" fill="#d9a85f"/><rect x="22" y="72" width="52" height="10" rx="5" fill="#d9a85f"/>`,
  bone: `<path d="M30 30a8 8 0 1 1 10-10l26 26a8 8 0 1 1 10 10 8 8 0 1 1-10 10L40 40a8 8 0 1 1-10-10z" fill="#f3ead6"/>`,
};

export type Sticker = keyof typeof STICKERS;

export function sticker(k: Sticker) {
  const d = STICKERS[k];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><g stroke="#fff" stroke-width="10" stroke-linejoin="round">${d.replace(/fill="[^"]*"/g, 'fill="#fff"')}</g><g stroke="#1d1712" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">${d}</g></svg>`;
}

export const svgUrl = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
