/* ---------- Desk ---------- */
function usageMini(w = 330, h = 120) {
  const T = 300, now = 162, cap = .8;
  const actual = [0, .04, .07, .12, .15, .2, .24, .27, .31, .35, .38, .41];
  const x = m => 8 + (m / T) * (w - 16), y = p => h - 18 - p * (h - 30);
  const pts = actual.map((p, i) => `${x(i * now / (actual.length - 1)).toFixed(1)},${y(p).toFixed(1)}`).join(" ");
  return `<svg width="100%" viewBox="0 0 ${w} ${h}" style="display:block">
    <line x1="8" x2="${w - 8}" y1="${y(cap)}" y2="${y(cap)}" style="stroke:var(--stop);stroke-dasharray:3 4"/>
    <text x="${w - 8}" y="${y(cap) - 5}" text-anchor="end" style="fill:var(--stop);font:10px var(--mono)">your cap 80%</text>
    <line x1="${x(0)}" y1="${y(0)}" x2="${x(T)}" y2="${y(cap)}" style="stroke:var(--rule2);stroke-dasharray:2 3"/>
    <polyline points="${pts}" fill="none" style="stroke:var(--acc);stroke-width:2.2;stroke-linejoin:round"/>
    <line x1="${x(now)}" y1="${y(.41)}" x2="${x(T)}" y2="${y(.68)}" style="stroke:var(--acc);stroke-width:1.6;stroke-dasharray:2 4"/>
    <circle cx="${x(now)}" cy="${y(.41)}" r="4" style="fill:var(--acc);stroke:var(--sheet);stroke-width:2"/>
    <line x1="8" x2="${w - 8}" y1="${h - 18}" y2="${h - 18}" style="stroke:var(--rule)"/>
    ${["0h", "1h", "2h", "3h", "4h", "5h"].map((t, i) => `<text x="${x(i * 60)}" y="${h - 4}" text-anchor="${i === 0 ? "start" : i === 5 ? "end" : "middle"}" style="fill:var(--ink3);font:10px var(--mono)">${t}</text>`).join("")}
  </svg>`;
}

function call({ k, game, ago, title, body, acts, media }) {
  return `<div style="display:grid;grid-template-columns:170px 1fr auto;gap:24px;padding:20px 0;border-top:1px solid var(--rule)">
    <div style="display:flex;flex-direction:column;gap:5px">${who(k)}<span class="i3" style="font-size:12px">${game}</span><span class="mono i3">${ago} ago</span></div>
    <div style="min-width:0"><div class="h-m" style="margin-bottom:5px">${title}</div><div class="i2" style="max-width:560px">${body}</div>${media ? `<div class="row" style="gap:8px;margin-top:12px">${media}</div>` : ""}</div>
    <div style="display:flex;flex-direction:column;gap:7px;align-items:stretch;min-width:150px">${acts}</div>
  </div>`;
}

function desk() {
  const running = [["builder", "Raid lava and the weekly reset", 62], ["frame", "Loading screen is a brown box", 35], ["balance", "Late skill tree too cheap", 80]];
  return `<div style="display:grid;grid-template-columns:1fr 360px;gap:56px">
    <div>
      <div class="lab" style="margin-bottom:12px">Thursday, October 23</div>
      <h1 class="h-xl">Afternoon, Sam. <i>Four</i> calls<br>are waiting on you.</h1>
      <p class="lede" style="margin:14px 0 26px;max-width:620px">Builder and Frame are mid-job and five more are lined up. You've used 41% of this 5-hour window and you're on pace to finish it around 68%.</p>
      <div class="row" style="margin-bottom:2px"><span class="lab">Your call</span><span class="mono i3">4</span></div>
      ${call({ k: "playtest", game: "Anime Awakening RNG", ago: "12m", title: "Try party raid quick join with a second account?", body: "Start a raid on PC, then join from your phone. It worked in Studio with two test players, but Studio isn't the real servers.", acts: `<span class="b sm ink">It works</span><span class="b sm">Something's off</span>` })}
      ${call({ k: "balance", game: "Anime Awakening RNG", ago: "1h", title: "How much stronger should a 1 in a million hero be?", body: "Kenaki (1 in 2.5M) hits 4.1x a common right now, and people who roll one mostly stop rolling. I'd cap everyone at 4x and only let Kenaki and Zoru go past it.", acts: `<span class="b sm acc">Keep the 4x cap</span><span class="b sm">Raise it to 6x</span><span class="b sm q">Talk it through</span>` })}
      ${call({ k: "frame", game: "Dig Up a Dino", ago: "40m", title: "Phone shop: A or B?", body: "B keeps the buy button under your thumb. A cuts off the last row on an iPhone SE.", media: `<div style="width:130px">${thumb("dino", 4, { ar: "4/3", tag: "A", guys: 1, k: "da" })}</div><div style="width:130px">${thumb("dino", 7, { ar: "4/3", tag: "B", guys: 1, k: "db" })}</div>`, acts: `<span class="b sm">A</span><span class="b sm ink">B</span>` })}
    </div>
    <aside style="display:flex;flex-direction:column;gap:26px">
      <div><div class="row" style="margin-bottom:10px"><span class="lab">On the floor</span><span class="mono i3" style="margin-left:auto">2 of 4 Studios</span></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          ${thumb("arena", 3, { tag: "S1 · BUILDER", guys: 1, k: "f1" })}${thumb("snow", 5, { tag: "S2 · PLAYTEST", vfxSize: 24, vfx: "#ff9b4a", sparks: 10, k: "f2" })}
          <div class="sheet" style="aspect-ratio:16/9;display:grid;place-items:center;border-style:dashed;color:var(--ink3)">S3 free</div><div class="sheet" style="aspect-ratio:16/9;display:grid;place-items:center;border-style:dashed;color:var(--ink3)">S4 free</div>
        </div></div>
      <div><div class="row" style="margin-bottom:4px"><span class="lab">Running</span><span class="mono i3" style="margin-left:auto">3 of 3 max</span></div>
        ${running.map(([k, t, p]) => `<div style="padding:11px 0;border-bottom:1px solid var(--rule)"><div class="row">${cg(k, "sm")}<span class="grow trunc" style="font-weight:500">${t}</span><span class="mono i3">${p}%</span></div><div class="line" style="margin:8px 0 0 27px"><i style="width:${p}%"></i></div></div>`).join("")}
        <div class="i3" style="font-size:12px;margin-top:8px">5 more queued. Holding them so you stay on pace.</div></div>
      <div class="sheet" style="padding:14px 16px"><div class="row" style="margin-bottom:6px"><span class="lab">This window</span><span class="mono i3" style="margin-left:auto">resets 4:40 PM</span></div>${usageMini()}</div>
    </aside>
  </div>`;
}

/* ---------- Proofs ---------- */
const compare = (a, b, o = {}) => `<div class="cmp" style="aspect-ratio:${o.ar || "16/9"}">${a}<div class="after">${b}</div><span class="handle"><i>${ic("expand", "width:15px;height:15px;transform:rotate(45deg)")}</i></span><span class="l">BEFORE</span><span class="r">AFTER</span></div>`;

function proofs() {
  const strip = [["grove", 11, 70], ["arena", 4, 0], ["grove", 6, 0], ["night", 3, 30], ["dino", 7, 0], ["night", 8, 26]];
  return `<div style="display:grid;grid-template-columns:1fr 400px;height:100%">
    <div style="padding:22px 30px;display:flex;flex-direction:column;gap:16px;min-width:0">
      <div class="row"><span class="lab">Proof 1 of 6</span><span class="i3">·</span>${who("frame")}<span class="i3">· Anime Awakening RNG · 2h ago</span><div class="grow"></div><span class="b sm q">${ic("dl", "width:14px;height:14px")}</span><span class="b sm q">${ic("expand", "width:14px;height:14px")}</span></div>
      ${compare(scene("grove", 11, { vfxSize: 70, vfx: "#ff6fd6", sparks: 40, guys: 4, k: "pa" }), scene("grove", 11, { vfxSize: 26, vfx: "#ff6fd6", sparks: 8, guys: 4, k: "pb" }))}
      <div class="row" style="gap:10px"><span class="mono i3">drag the line to compare</span><div class="grow"></div><span class="seg"><a class="on">Specials</a><a>Boss fight</a><a>Phone</a></span></div>
      <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-top:auto">${strip.map(([s, n, v], i) => `<div style="${i === 0 ? "outline:2px solid var(--acc);outline-offset:3px;border-radius:10px" : "opacity:.6"}">${thumb(s, n, { vfxSize: v, vfx: "#ff6fd6", sparks: v ? 10 : 0, guys: 2, k: "st" + i })}</div>`).join("")}</div>
    </div>
    <aside style="border-left:1px solid var(--rule);background:var(--sheet);padding:24px;display:flex;flex-direction:column;gap:18px">
      <h2 class="h-l" style="font-size:30px">Calmer Specials. Enough, or push further?</h2>
      <p class="i2">You said the effects were so loud you couldn't see anyone. This is the same three casts, old then new. In the real Frozza fight the gain is smaller, because the boss's red floor is what covers the screen.</p>
      <div><div class="lab" style="margin-bottom:6px">What changed</div>
        ${[["Screen dim", "100% → off"], ["Smoke size", "45% smaller"], ["Ice spikes", "12 → 5"], ["Leftovers clear in", "6s → 2s"]].map(([a, b]) => `<div class="row" style="padding:6px 0;border-top:1px solid var(--rule)"><span class="grow i2">${a}</span><span class="mono">${b}</span></div>`).join("")}</div>
      <div class="row i3" style="font-size:12px;gap:6px">${ic("reload", "width:13px;height:13px")}Third try. You sent it back twice, Tue and Wed.</div>
      <div class="field" style="min-height:76px;align-items:flex-start;padding-top:10px">Note for Frame. Only needed if you want changes.</div>
      <div style="display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:8px;margin-top:auto">
        <span class="b lg acc">${ic("check")}Ship it <kbd>1</kbd></span><span class="b lg">Rework <kbd>2</kbd></span><span class="b lg q">Drop <kbd>3</kbd></span>
      </div>
    </aside>
  </div>`;
}

/* ---------- Queue ---------- */
function queue() {
  const H0 = 10, H1 = 18, now = 14.33, reset = 16.67;
  const pct = h => ((h - H0) / (H1 - H0)) * 100;
  const rows = [
    ["lead", [[10.0, 10.4, "Split Frostpeak ask", "done"], [14.0, 14.9, "Plan boss brief", "run"]]],
    ["builder", [[10.4, 12.2, "Hall regen + fall-through", "done"], [12.4, 15.0, "Raid lava + weekly reset", "run"], [16.7, 18, "Level 15 XP curve", "held"]]],
    ["frame", [[11.0, 13.0, "Shonk's entrance + tips", "done"], [13.2, 15.2, "Loading screen fix", "run"], [15.3, 16.6, "Celgear hit feedback", "q"]]],
    ["balance", [[12.0, 14.9, "Skill tree costs", "run"], [16.7, 17.6, "1 in a million power", "held"]]],
    ["playtest", [[10.2, 11.0, "Party raid join", "done"], [15.1, 16.1, "Run raid lava", "q"]]],
    ["kid", [[16.1, 17.4, "Frostpeak fresh run", "q"]]],
    ["scenic", [[10.0, 12.6, "Swamp dig site blockout", "done"], [16.7, 18, "Swamp lighting", "held"]]],
    ["librarian", [[12.6, 13.1, "Ice crystal models", "done"]]],
    ["reviewer", [[13.1, 13.6, "Daily reward double claim", "done"], [15.2, 15.8, "Raid saves check", "q"]]],
    ["splash", [[16.8, 17.8, "Frostpeak thumbnails", "held"]]],
    ["producer", [[11.0, 11.2, "Move Dino to Balanced", "done"], [15.8, 16.0, "Check raid proof", "q"]]],
    ["pulse", [[10.0, 10.3, "Morning chart pull", "done"], [16.0, 16.3, "Evening chart pull", "q"]]],
  ];
  const style = st => ({
    done: "background:var(--sunk);color:var(--ink3);border:1px solid var(--rule)",
    run: "background:var(--acc-soft);color:var(--ink);border:1px solid var(--acc);box-shadow:inset 3px 0 0 var(--acc)",
    q: "background:var(--sheet);color:var(--ink2);border:1px dashed var(--rule2)",
    held: "background:repeating-linear-gradient(135deg,color-mix(in srgb,var(--hold) 14%,transparent) 0 6px,transparent 6px 12px);color:var(--hold);border:1px dashed color-mix(in srgb,var(--hold) 60%,transparent)",
  })[st];
  const hours = [10, 11, 12, 13, 14, 15, 16, 17, 18];
  return `<div style="display:grid;grid-template-columns:1fr 340px;gap:30px">
    <div style="min-width:0">
      <div class="row" style="align-items:flex-end;margin-bottom:18px"><div class="grow"><h1 class="h-l">Who's doing what, and when.</h1><p class="lede" style="margin-top:6px;font-size:14.5px">Jobs that would push you past your cap wait for the next window instead of running now.</p></div><span class="seg"><a class="on">Schedule</a><a>List</a></span></div>
      <div class="row" style="gap:16px;margin-bottom:12px;font-size:12px">${[["run", "Running"], ["q", "Up next"], ["held", "Held for next window"], ["done", "Done"]].map(([s, l]) => `<span class="row" style="gap:6px"><i style="width:18px;height:10px;border-radius:3px;${style(s)}"></i><span class="i2">${l}</span></span>`).join("")}</div>
      <div style="position:relative;padding-left:120px">
        <div style="position:relative;height:22px">${hours.map(h => `<span class="mono i3" style="position:absolute;left:${pct(h)}%;transform:translateX(-50%)">${h}:00</span>`).join("")}</div>
        <div style="position:absolute;left:120px;right:0;top:22px;bottom:0;pointer-events:none">
          ${hours.map(h => `<i style="position:absolute;top:0;bottom:0;left:${pct(h)}%;border-left:1px solid var(--rule)"></i>`).join("")}
          <i style="position:absolute;top:-6px;bottom:0;left:${pct(now)}%;border-left:2px solid var(--acc)"></i>
          <span class="mono" style="position:absolute;top:-24px;left:${pct(now)}%;transform:translateX(-50%);background:var(--acc);color:#fff;border-radius:99px;padding:0 7px;font-size:10.5px">now</span>
          <i style="position:absolute;top:0;bottom:0;left:${pct(reset)}%;border-left:2px dashed var(--hold)"></i>
          <span class="mono" style="position:absolute;bottom:-20px;left:${pct(reset)}%;transform:translateX(-50%);color:var(--hold);font-size:10.5px;white-space:nowrap">window resets 4:40</span>
        </div>
        ${rows.map(([k, blocks]) => `<div style="position:relative;height:40px;border-top:1px solid var(--rule)">
          <span style="position:absolute;left:-120px;top:9px">${who(k)}</span>
          ${blocks.map(([a, b, l, st]) => `<div class="trunc" style="position:absolute;top:6px;height:28px;left:${pct(a)}%;width:calc(${pct(b) - pct(a)}% - 3px);border-radius:7px;padding:0 8px;font-size:11.5px;font-weight:500;line-height:26px;${style(st)}${k === "builder" && st === "run" ? ";outline:2px solid var(--ink);outline-offset:1px" : ""}">${b - a < .6 ? "" : l}</div>`).join("")}
        </div>`).join("")}
      </div>
    </div>
    <aside class="sheet" style="padding:20px;align-self:start;display:flex;flex-direction:column;gap:14px">
      <div class="row">${cg("builder", "lg")}<div><div style="font-weight:600">Raid lava + weekly reset</div><div class="i3" style="font-size:12px">Builder · Studio 2 · started 12:24</div></div></div>
      ${thumb("arena", 9, { tag: "LIVE · S2", vfxSize: 30, vfx: "#ff6a2a", sparks: 14, k: "qa" })}
      <div>${[["12:24", "Read the 3 notes in the brief", 0], ["12:41", "Found 14 lava parts using Touched", 0], ["13:20", "Wrote RaidLava.server.lua", 0], ["13:58", "Weekly reset moved to os.time", 0], ["now", "Testing with 2 players", 1]].map(([t, l, on]) => `<div class="row" style="gap:10px;padding:6px 0;border-top:1px solid var(--rule)"><span class="mono i3" style="width:36px">${t}</span><span class="${on ? "" : "i2"}">${l}</span></div>`).join("")}</div>
      <div class="sheet" style="background:var(--paper);padding:10px 12px"><div class="row"><span class="lab">Cost so far</span><span class="mono" style="margin-left:auto">4.8% of window</span></div><div class="i3" style="font-size:12px;margin-top:2px">Running on Sonnet. About 1.5% left to finish.</div></div>
      <div class="row" style="gap:6px"><span class="b sm">${ic("eye", "width:14px;height:14px")}Watch</span><span class="b sm">${ic("msg", "width:14px;height:14px")}Message</span><span class="b sm q">${ic("pause", "width:14px;height:14px")}Pause</span></div>
    </aside>
  </div>`;
}

/* ---------- Live ---------- */
function live() {
  const dauNew = [410, 440, 430, 470, 450, 480, 820, 560, 420, 700, 740, 1250, 1390, 780, 430, 690, 360, 180, 120, 96];
  const dauRet = [20, 24, 22, 28, 30, 32, 40, 44, 38, 46, 52, 58, 64, 60, 52, 50, 44, 30, 24, 20];
  const online = Array.from({ length: 72 }, (_, i) => Math.max(1, Math.round(140 + 70 * Math.sin(i / 3.6) + 40 * Math.sin(i / 1.3) + (i > 50 ? 30 : 0))));
  const stat = (v, l, d, c) => `<div style="padding:4px 22px;border-left:1px solid var(--rule)"><div class="serif" style="font-size:40px;line-height:1">${v}</div><div class="i2" style="margin-top:6px">${l}</div><div class="mono" style="color:${c || "var(--ink3)"};margin-top:2px">${d}</div></div>`;
  return `
  <div class="row" style="align-items:flex-end;margin-bottom:22px"><div class="grow"><div class="lab" style="margin-bottom:8px"><span class="dot live" style="margin-right:6px"></span>Live · updated 2 min ago</div><h1 class="h-xl">Anime Awakening RNG</h1></div><span class="seg"><a>Today</a><a class="on">7 days</a><a>30 days</a></span></div>
  <div style="display:grid;grid-template-columns:repeat(6,1fr);margin:0 -22px 26px">
    ${stat("214", "playing now", "+31 vs yesterday", "var(--go)")}${stat("1,384", "played today", "+12% this week", "var(--go)")}${stat("18.2%", "came back next day", "down 2.1 pts", "var(--stop)")}${stat("14m 20s", "average session", "about the same")}${stat("R$ 14.9k", "Robux this week", "+R$ 1.2k", "var(--go)")}${stat("3", "new errors", "1 since Tuesday", "var(--hold)")}
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr 320px;gap:18px">
    <div class="sheet" style="padding:16px 18px"><div class="row" style="margin-bottom:8px"><span class="h-m" style="font-size:20px">Daily players</span><div class="grow"></div><span class="row i2" style="gap:12px;font-size:12px"><span class="row" style="gap:5px"><i style="width:10px;height:3px;background:var(--ink)"></i>new</span><span class="row" style="gap:5px"><i style="width:10px;height:3px;background:var(--acc)"></i>returning</span></span></div>
      ${lineChart({ series: [{ data: dauNew, color: "var(--ink)", area: true, wd: 1.6 }, { data: dauRet, color: "var(--acc)", wd: 2.2 }], xl: ["Oct 4", "Oct 9", "Oct 14", "Oct 19", "Oct 23"], h: 200 })}</div>
    <div class="sheet" style="padding:16px 18px"><div class="row" style="margin-bottom:8px"><span class="h-m" style="font-size:20px">Playing at once</span><div class="grow"></div><span class="mono i3">peak 312, Tue 8pm</span></div>
      ${lineChart({ series: [{ data: online, color: "var(--acc)", area: true, wd: 1.6, dot: true }], xl: ["Mon", "Tue", "Wed", "Thu"], h: 200 })}</div>
    <div style="grid-row:span 2;display:flex;flex-direction:column;gap:14px;padding:4px 0 0 18px;border-left:2px solid var(--acc)">
      ${who("liveops")}
      <p class="serif" style="font-size:24px;line-height:1.2">“Fewer people came back after the Oct 14 update, and most of them quit at the ice bridge.”</p>
      <p class="i2">61% of the players we lost stopped somewhere in Frostpeak. The first boss there kills a new player in about 9 seconds.</p>
      <div>${[["Ice bridge", 61], ["Frozza fight", 22], ["Shop popup", 9], ["Other", 8]].map(([l, v]) => `<div style="padding:6px 0"><div class="row" style="font-size:12.5px"><span class="grow">${l}</span><span class="mono i3">${v}%</span></div><div class="line" style="margin-top:5px"><i style="width:${v}%"></i></div></div>`).join("")}</div>
      <span class="b ink">Have Kid Tester play it</span>
    </div>
    <div class="sheet" style="padding:16px 18px"><div class="row" style="margin-bottom:8px"><span class="h-m" style="font-size:20px">The first minute</span><div class="grow"></div><span class="mono" style="color:var(--acc)">13% gone in 60s</span></div>
      ${bars({ data: [62, 58, 52, 47, 43, 40, 37, 35, 33, 31, 30, 28, 27, 26, 25, 24, 23, 22, 21, 20], hi: 2, color: "var(--ink3)", xl: [[0, "0s"], [2, "1m"], [6, "3m"], [10, "5m"], [19, "10m"]], h: 150 }).replaceAll("var(--warn)", "var(--acc)")}</div>
    <div class="sheet" style="padding:16px 18px"><div class="h-m" style="font-size:20px;margin-bottom:6px">Where the Robux came from</div>
      ${[["2x Luck, 1 hour", 6120], ["VIP Hall pass", 4200], ["Skip raid cooldown", 2710], ["Starter pack", 1890]].map(([n, v]) => `<div style="padding:7px 0;border-top:1px solid var(--rule)"><div class="row"><span class="grow">${n}</span><span class="mono">R$ ${v.toLocaleString()}</span></div><div class="line" style="margin-top:6px"><i style="width:${(v / 6120) * 100}%;background:var(--ink)"></i></div></div>`).join("")}</div>
  </div>`;
}

/* ---------- Mobile ---------- */
const mTop = (right) => `<div class="row" style="padding:4px 20px 12px"><span class="word" style="font-size:22px">${mark(22)}roslop</span><div class="grow"></div>${right || `<span class="tag"><span class="dot live"></span>Sam's PC</span>`}</div>`;
const mDock = on => `<div style="margin-top:auto;padding:10px 14px 28px;display:flex;flex-direction:column;gap:10px">
  <div class="row" style="padding:7px 7px 7px 12px;border-radius:16px;background:var(--sheet);border:1px solid var(--rule2);box-shadow:var(--shade)">${cg("lead", "sm")}<span class="grow i3">Ask the Lead</span>${ic("mic", "color:var(--ink3)")}<span class="send" style="width:32px;height:32px;border-radius:10px">${ic("up", "width:15px;height:15px")}</span></div>
  <div class="row" style="justify-content:space-around">${[["home", "Desk"], ["tasks", "Queue"], ["review", "Proofs"], ["market", "Live"], ["grid", "More"]].map(([i, l]) => `<span style="display:flex;flex-direction:column;align-items:center;gap:2px;font-size:10.5px;font-weight:500;color:${l === on ? "var(--ink)" : "var(--ink3)"}">${ic(i, "width:20px;height:20px")}${l}</span>`).join("")}</div></div>`;

function mDesk() {
  return `${sbar}${mTop()}
  <div style="padding:0 20px;display:flex;flex-direction:column;gap:14px;overflow:hidden">
    <h1 class="h-l" style="font-size:34px">Four calls are <i>yours.</i></h1>
    <div class="row" style="gap:10px">${ring(.41, 34, 4)}<div style="font-size:12.5px;line-height:1.3"><b style="font-weight:600">41% of this window used</b><div class="i3">On pace. Resets at 4:40 PM.</div></div></div>
    <div class="i3" style="font-size:12px;padding:8px 12px;border-radius:10px;background:var(--sunk)">This phone is the remote. All the work happens on Sam's PC.</div>
    ${[["playtest", "Try party raid quick join with a second account?", "12m", `<span class="b sm ink" style="flex:1">It works</span><span class="b sm" style="flex:1">Something's off</span>`],
      ["balance", "How much stronger should a 1 in a million hero be?", "1h", `<span class="b sm acc" style="flex:1">Keep 4x cap</span><span class="b sm" style="flex:1">Raise to 6x</span>`]].map(([k, t, a, b]) => `
      <div style="padding-top:12px;border-top:1px solid var(--rule)"><div class="row i3" style="font-size:12px;margin-bottom:5px">${cg(k, "sm")}${CREW[k][0]} · Anime RNG<span class="mono" style="margin-left:auto">${a}</span></div>
      <div class="serif" style="font-size:21px;line-height:1.2;margin-bottom:10px">${t}</div><div class="row" style="gap:6px">${b}</div></div>`).join("")}
  </div>${mDock("Desk")}`;
}

function mProofs() {
  return `${sbar}<div class="row" style="padding:4px 20px 12px">${ic("left", "width:22px;height:22px")}<span class="lab" style="margin:0 auto">Proof 1 of 6</span>${ic("more", "width:22px;height:22px")}</div>
  <div style="padding:0 14px;display:flex;flex-direction:column;gap:14px;flex:1">
    ${compare(scene("grove", 11, { vfxSize: 70, vfx: "#ff6fd6", sparks: 40, guys: 4, k: "ma" }), scene("grove", 11, { vfxSize: 26, vfx: "#ff6fd6", sparks: 8, guys: 4, k: "mb" }), { ar: "4/5" })}
    <div style="padding:0 6px">${who("frame")}<div class="serif" style="font-size:24px;line-height:1.15;margin-top:8px">Calmer Specials. Enough, or push further?</div>
    <div class="i2" style="font-size:13px;margin-top:6px">No screen dim, smaller smoke, 5 spikes instead of 12. Leftovers clear in 2 seconds.</div></div>
  </div>
  <div style="padding:14px 20px 34px;display:flex;justify-content:space-between;align-items:flex-end">
    ${[["x", "Drop", ""], ["msg", "Rework", ""], ["check", "Ship it", "acc"]].map(([i, l, c]) => `<span style="display:flex;flex-direction:column;align-items:center;gap:6px;font-size:12px;font-weight:500"><span style="width:${c ? 72 : 58}px;height:${c ? 72 : 58}px;border-radius:99px;display:grid;place-items:center;${c ? "background:var(--acc);color:#fff" : "border:1px solid var(--rule2);color:var(--ink)"}">${ic(i, "width:22px;height:22px")}</span>${l}</span>`).join("")}
  </div>`;
}

function mAsk() {
  const me = t => `<div style="align-self:flex-end;max-width:82%;padding:10px 13px;border-radius:16px 16px 4px 16px;background:var(--ink);color:var(--paper);font-size:13.5px">${t}</div>`;
  const lead = h => `<div style="display:flex;gap:8px;max-width:92%">${cg("lead", "sm")}<div style="font-size:13.5px;line-height:1.5">${h}</div></div>`;
  const job = (k, t) => `<div class="row" style="gap:8px;padding:7px 0;border-top:1px solid var(--rule)">${cg(k, "sm")}<span class="grow" style="font-size:12.5px">${t}</span></div>`;
  return `${sbar}${mTop()}
  <div style="padding:0 16px;display:flex;flex-direction:column;gap:12px;overflow:hidden;flex:1">
    <div class="lab" style="text-align:center">Today 2:12 PM</div>
    ${me("people are quitting at the ice bridge in frostpeak. fix it but don't make it baby mode")}
    <div class="mono i3" style="align-self:flex-end;margin-top:-6px;font-size:10.5px">sent to Sam's PC</div>
    ${lead(`It's less the bridge and more that Frozza comes right after it and new players show up underleveled. Four jobs:
      <div class="sheet" style="padding:2px 12px;margin-top:8px">${job("kid", "Play Frostpeak fresh, note every death")}${job("balance", "Find the level where Frozza feels fair")}${job("builder", "Checkpoint after the bridge")}${job("frame", "Warn people under level 12")}</div>
      <div class="row" style="gap:6px;margin-top:8px"><span class="b sm acc" style="flex:1">Start all 4</span><span class="b sm" style="flex:1">Change it</span></div>`)}
    ${me("start them. skip the warning popup, people hate popups")}
    ${lead("Done, dropped the popup. That's about 9% of your window, so it fits.")}
  </div>
  <div style="padding:10px 14px 30px"><div class="row" style="padding:7px 7px 7px 14px;border-radius:16px;background:var(--sheet);border:1px solid var(--rule2)"><span class="grow i3">Message the Lead</span><span class="send" style="width:32px;height:32px;border-radius:10px">${ic("up", "width:15px;height:15px")}</span></div></div>`;
}

Object.assign(SHOTS, {
  "pc-site-desk": { stage: "warm", w: 1600, h: 1010, html: () => win(1600, 1010, chromeBar("Desk · RoSlop", "/desk") + `<div class="body">${shell("desk", desk())}</div>`) },
  "mac-app-proofs": { stage: "warm", w: 1560, h: 960, html: () => win(1560, 960, `<div class="body">${shell("proofs", proofs(), { mac: true, theme: "night", ask: false, pad: "padding:0" })}</div>`) },
  "windows-app-queue": { stage: "win", w: 1560, h: 1000, html: () => win(1560, 1000, winCtlBar + `<div class="body">${shell("queue", queue())}</div>`, "win") },
  "mac-site-live": { stage: "paper", w: 1560, h: 1000, html: () => win(1560, 1000, safariBar() + `<div class="body">${shell("live", live(), { scope: 1, ask: false })}</div>`) },
  "mobile-site": { stage: "warm", w: 1366, h: 900, html: () => `<div class="phones">${[[mDesk(), "Desk", "paper"], [mProofs(), "Proofs", "night"], [mAsk(), "Ask the Lead", "paper"]].map(([s, c, t]) => `<div><div class="phone"><div class="island"></div><div class="scr ${t}" style="background:var(--paper);color:var(--ink)">${s}</div></div><div class="cap">${c}</div></div>`).join("")}</div>` },
});
