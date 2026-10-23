const CREW = {
  lead: ["Lead", "#ffb199", "M12 4l2.2 5.3 5.8.5-4.4 3.8 1.3 5.6L12 16.3l-4.9 2.9 1.3-5.6L4 9.8l5.8-.5z"],
  pulse: ["Pulse", "#ffd36b", "M3 12h4l2-5 4 10 2-5h6"],
  architect: ["Architect", "#a9c8ff", "M12 4l8 15H4z"],
  builder: ["Builder", "#f6c28b", "M4 7h16v5H4z M4 12h8v5H4z M12 12h8v5h-8z"],
  frame: ["Frame", "#f5a8d0", "M4 9V4h5 M15 4h5v5 M20 15v5h-5 M9 20H4v-5"],
  scenic: ["Scenic", "#a7e0a9", "M3 19l6-9 4 6 3-4 5 7z"],
  librarian: ["Librarian", "#c9b6ff", "M5 4v16 M10 4v16 M15 5l4 15"],
  balance: ["Balance", "#8fe0d4", "M12 4v16 M5 8h14 M5 8l-2.5 6h5z M19 8l-2.5 6h5z"],
  kid: ["Kid Tester", "#fff07a", "M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M9 10h.01 M15 10h.01 M8.5 14a4 4 0 0 0 7 0"],
  playtest: ["Playtest", "#ffc48a", "M8 5l11 7-11 7z"],
  splash: ["Splash", "#f0a6ff", "M12 3v4 M12 17v4 M3 12h4 M17 12h4 M6 6l3 3 M15 15l3 3 M18 6l-3 3 M9 15l-3 3"],
  merchant: ["Merchant", "#e9d48a", "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M15 9.5c-.6-1-1.7-1.5-3-1.5-1.6 0-2.8.8-2.8 2s1.2 1.7 2.8 2 2.8.8 2.8 2-1.2 2-2.8 2c-1.3 0-2.4-.5-3-1.5 M12 6v2 M12 16v2"],
  producer: ["Producer", "#c7d0da", "M5 12l4 4L19 6"],
  reviewer: ["Reviewer", "#ff9d9d", "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"],
  liveops: ["Liveops", "#9fe3ff", "M3 17l5-6 4 3 4-7 5 5"],
};
const cg = (k, size = "") => `<span class="cg ${size}" style="--c:${CREW[k][1]}" title="${CREW[k][0]}"><svg viewBox="0 0 24 24"><path d="${CREW[k][2]}"/></svg></span>`;
const who = (k, size = "sm") => `<span class="row" style="gap:7px">${cg(k, size)}<span>${CREW[k][0]}</span></span>`;

const mark = (s = 26) => `<svg width="${s}" height="${s}" viewBox="0 0 32 32" style="display:block;flex:none"><path d="M16 3c7.2 0 13 5.2 13 12 0 4-2 7.2-5 9.2v3.3a2.1 2.1 0 0 1-4.2 0v-1.8c-1.2.3-2.5.4-3.8.4C8.8 26.1 3 20.9 3 14.6S8.8 3 16 3z" fill="var(--acc)"/><circle cx="11.5" cy="11" r="2.6" fill="#fff" opacity=".9"/></svg>`;
const word = (s = 26) => `<span class="word">${mark(s)}roslop</span>`;

function ring(p, s = 28, w = 3.5) {
  const r = (s - w) / 2, c = 2 * Math.PI * r;
  return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" style="display:block;transform:rotate(-90deg)"><circle cx="${s / 2}" cy="${s / 2}" r="${r}" fill="none" style="stroke:var(--rule)" stroke-width="${w}"/><circle cx="${s / 2}" cy="${s / 2}" r="${r}" fill="none" style="stroke:var(--acc)" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="${c * p} ${c}"/></svg>`;
}
const meter = (p = .41) => `<div class="meter">${ring(p)}<div class="t"><b>${Math.round(p * 100)}% used</b><span>5h window · on pace</span></div></div>`;

const TABS = [["desk", "Desk", 4], ["queue", "Queue"], ["proofs", "Proofs", 6], ["live", "Live"], ["ideas", "Ideas", 3], ["charts", "Charts"], ["shelf", "Shelf"], ["notebook", "Notebook"], ["crew", "Crew"], ["coach", "Coach"]];
const GAMES = ["Everything", "Anime Awakening RNG", "Dig Up a Dino"];

function shell(tab, body, o = {}) {
  const scope = o.scope === false ? "" : `<div class="scope">${GAMES.map((g, i) => `<span class="chip ${i === (o.scope ?? 0) ? "on" : ""}">${g}</span>`).join("")}<span class="chip dash">${ic("plus", "width:13px;height:13px")}New game</span><div class="grow"></div>${o.actions || ""}</div>`;
  const ask = o.ask === false ? "" : `<div class="ask">${cg("lead")}<span class="ph">${o.askText || "Ask the Lead. Try “make Frostpeak easier for new players”"}</span><span class="tag">${o.askGame || "Anime Awakening RNG"}</span>${ic("clip", "color:var(--ink3)")}<span class="send">${ic("up")}</span></div>`;
  return `<div class="app ${o.theme || "paper"} ${o.mac ? "mac" : ""}">
    <header class="bar">${o.mac ? `<div class="lights"><i></i><i></i><i></i></div>` : ""}${word()}
      <nav class="tabs">${TABS.map(([k, l, n]) => `<a class="${k === tab ? "on" : ""}">${l}${n ? `<b>${n}</b>` : ""}</a>`).join("")}</nav>
      <div class="grow"></div>${meter(o.usage ?? .41)}
      <span class="host"><span class="dot live"></span>Sam's PC</span>
      <span class="i3" style="${tab === "settings" ? "color:var(--acc)" : ""}">${ic("settings", "width:18px;height:18px")}</span><span class="pfp">SK</span>
    </header>${scope}
    <div class="page" style="${o.pad || ""}">${body}</div>${ask}
  </div>`;
}

const winCtlBar = `<div class="winbar">${mark(16)}<span class="ttl">RoSlop</span><div class="ctl">${winCtl}</div></div>`;
const chromeBar = (title, path) => `<div class="chrome"><div class="tabs"><div class="tab on">${mark(14)}<span>${title}</span><span class="x">✕</span></div><span style="padding:0 10px 8px;color:#888">+</span><div class="ctl">${winCtl}</div></div>
  <div class="bar2"><div class="navb">${ic("left")}${ic("right")}${ic("reload")}</div><div class="omni">${ic("lock", "width:13px;height:13px;color:#8a8a8f")}<span>roslop.app<span class="path">${path}</span></span></div>${ic("user", "color:#8a8a8f")}</div></div>`;
const safariBar = (dark) => `<div class="safari ${dark ? "dark" : ""}"><div class="lights"><i></i><i></i><i></i></div><div class="tools">${ic("left")}${ic("right")}</div><div class="url">${ic("lock", "width:12px;height:12px")}roslop.app</div><div class="tools">${ic("upload")}${ic("plus")}${ic("copy")}</div></div>`;

const SHOTS = {};
const win = (w, h, inner, cls = "") => `<div class="window ${cls}" style="width:${w}px;height:${h}px">${inner}</div>`;
