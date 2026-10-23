/* ---------- Library stickers ---------- */
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

/* ---------- Team ---------- */
function team() {
  const list = [
    ["lead", "Splitting your Frostpeak ask", "working"], ["builder", "Raid lava + weekly reset", "working"], ["frame", "Loading screen fix", "working"],
    ["balance", "Skill tree costs", "working"], ["playtest", "Waiting on Builder", "queued"], ["kid", "1 task waiting", "queued"],
    ["scenic", "1 task waiting", "queued"], ["librarian", "Idle", "idle"], ["architect", "Idle", "idle"], ["pulse", "Watching the charts", "idle"],
    ["splash", "Idle", "idle"], ["merchant", "Idle", "idle"], ["producer", "Checked 3 moves today", "idle"], ["reviewer", "Idle", "idle"], ["liveops", "Day 14 grade due Fri", "idle"],
  ];
  const pill = st => st === "working" ? `<span class="pill ok" style="height:18px">working</span>` : st === "queued" ? `<span class="pill" style="height:18px">queued</span>` : "";
  const h = t => `<div class="mono dim" style="margin:14px 0 6px">${t}</div>`;
  return `<div style="display:grid;grid-template-columns:300px 1fr;height:100%">
    <div style="border-right:1px solid var(--line);padding:16px 10px;overflow:hidden">
      <div class="row" style="padding:0 8px 10px"><b style="font-weight:600;font-size:15px">Team</b><span class="muted" style="margin-left:auto;font-size:12px">4 working · 15 total</span></div>
      ${list.map(([k, t, st]) => `<div class="row" style="gap:10px;padding:7px 8px;border-radius:8px;${k === "builder" ? "background:var(--raise);box-shadow:inset 0 0 0 1px var(--line-2)" : ""}">${av(k)}<div class="grow" style="min-width:0"><div style="font-weight:500">${AG[k][0]}</div><div class="muted trunc" style="font-size:11.5px">${t}</div></div>${pill(st)}</div>`).join("")}
    </div>
    <div style="display:flex;flex-direction:column;min-height:0">
      <div class="row" style="padding:16px 24px;border-bottom:1px solid var(--line);gap:12px">${av("builder", "lg")}<div><div class="row" style="gap:8px"><b style="font-size:15px;font-weight:600">Builder</b><span class="pill ok"><span class="dot pulse"></span>Working in Studio 2</span></div><div class="muted" style="font-size:12px">Writes the code and wires up the game · 2 queued after this</div></div>
        <div class="grow"></div><div class="seg"><a>Chat</a><a class="on">Brief from Lead</a><a>Memory</a><a>Rules</a></div></div>
      <div style="padding:20px 24px;display:grid;grid-template-columns:1fr 340px;gap:22px;overflow:hidden;flex:1">
        <div class="card" style="padding:20px 22px;overflow:hidden">
          <div class="row" style="margin-bottom:4px">${av("lead", "sm")}<span class="muted" style="font-size:12px">Lead wrote this 11m ago from your message "raid lava is broken and the weekly raid never resets"</span></div>
          <div style="font-size:17px;font-weight:600;letter-spacing:-0.02em;margin:8px 0 2px">Raid lava + weekly raid reset</div>
          ${h("GOAL")}<div>Lava in the Frostpeak raid should hurt, not kill instantly, and the weekly raid should reset every Monday for everyone.</div>
          ${h("WHAT'S WRONG NOW")}<ul style="padding-left:18px;display:flex;flex-direction:column;gap:3px"><li>Lava parts use Touched and stack, so players die in under a second</li><li>The weekly timer starts when a server starts, so every server resets at a different time</li></ul>
          ${h("DO")}<ul style="padding-left:18px;display:flex;flex-direction:column;gap:3px"><li>One damage tick per player per 0.5s, 20 damage per tick, server side</li><li>Respawn at the raid gate, not the hub</li><li>Reset on Monday 00:00 UTC using os.time, saved in the RaidState DataStore</li></ul>
          ${h("DON'T")}<div>Touch the boss AI or the loot table. Balance owns those this week.</div>
          ${h("DONE WHEN")}<div>A 2 player test survives 10s in lava, and changing the clock to Monday resets the raid on two separate servers.</div>
          ${h("READ FIRST")}<div class="row" style="gap:6px;flex-wrap:wrap">${["Vault / Raids and bosses", "Vault / Saving data safely", "Library / RaidState system"].map(t => `<span class="pill">${ic("vault", "width:12px;height:12px")}${t}</span>`).join("")}</div>
          ${h("SEND BACK")}<div>A 15s clip of the lava and the diff. Playtest runs it after you.</div>
          <div class="row" style="margin-top:16px;gap:8px"><button class="btn sm">${ic("prompt", "width:14px;height:14px")}Edit brief</button><span class="muted" style="font-size:12px">Edits go to Builder right away. The Lead sees them too.</span></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;min-height:0">
          <div class="sec-h" style="margin:0"><h3>Live</h3><span class="c">Studio 2</span></div>
          ${thumb("arena", 9, { tag: "S2 LIVE", hud: "BUILDER", vfxSize: 30, vfx: "#ff6a2a", sparks: 12, k: "tm" })}
          <div class="card" style="padding:4px 14px">
            ${[["11:02", "Read the 3 notes in Read first"], ["11:04", "Found 14 lava parts using Touched"], ["11:06", "Wrote RaidLava.server.lua"], ["11:09", "Weekly reset now uses os.time"], ["now", "Testing with 2 players"]].map(([t, l], i) => `<div class="row" style="gap:10px;padding:7px 0;${i ? "border-top:1px solid var(--line)" : ""}"><span class="mono dim" style="width:34px">${t}</span><span class="${t === "now" ? "" : "muted"}" style="font-size:12.5px">${l}</span></div>`).join("")}
          </div>
          <div class="input" style="margin-top:auto">${ic("msg")}Message Builder directly</div>
        </div>
      </div>
    </div>
  </div>`;
}

/* ---------- Prompt coach ---------- */
function promptCoach() {
  const check = (ok, t, hint) => `<div class="row" style="gap:10px;padding:8px 0;border-top:1px solid var(--line);align-items:flex-start"><span style="width:18px;height:18px;border-radius:99px;display:grid;place-items:center;flex:none;background:${ok ? "color-mix(in srgb,var(--ok) 18%,transparent)" : "color-mix(in srgb,var(--warn) 18%,transparent)"};color:${ok ? "var(--ok)" : "var(--warn)"}">${ic(ok ? "check" : "plus", "width:11px;height:11px;stroke-width:2.5")}</span><div class="grow"><div style="font-weight:500">${t}</div>${hint ? `<div class="muted" style="font-size:12px">${hint}</div>` : ""}</div></div>`;
  const add = t => `<span style="background:color-mix(in srgb,var(--accent) 16%,transparent);box-shadow:inset 0 -1px 0 var(--accent-text);border-radius:3px;padding:0 2px">${t}</span>`;
  const tpl = [["New boss fight", "Moves, phases, arena, who it's for"], ["I found a bug", "What you did, what happened, what you expected"], ["First 5 minutes", "Where people quit and what they should feel"], ["Copy a feeling", "Drop a clip, say what you like about it"], ["Add a shop item", "Price, who buys it, what it can't break"], ["Balance pass", "What feels too slow or too fast, and when"]];
  return `
  <div class="row" style="align-items:flex-end;margin-bottom:18px"><div class="grow"><h1 class="page">Prompt coach</h1><p class="lede">Write it however you want. This shows what the agents will have to guess, and fixes it before it goes to the Lead.</p></div></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
    <div style="display:flex;flex-direction:column;gap:14px">
      <div class="card" style="padding:16px">
        <div class="row" style="margin-bottom:10px"><b style="font-weight:600">What you wrote</b><span class="pill" style="margin-left:auto">Anime Awakening RNG</span></div>
        <div style="font-size:15px;line-height:1.5;min-height:60px">add a boss to frostpeak thats actually hard, like dark souls hard. players are bored</div>
        <div class="row" style="margin-top:14px;gap:12px"><div class="grow"><div class="row" style="font-size:12px"><span class="muted grow">How much the agents have to guess</span><b style="color:var(--warn)">a lot</b></div><div class="bar" style="margin-top:6px;height:6px"><i style="width:30%;background:var(--warn)"></i></div></div></div>
      </div>
      <div class="card" style="padding:6px 16px 8px">
        ${check(true, "Which game and where", "Frostpeak, Anime Awakening RNG")}
        ${check(true, "Why you want it", "Players are bored. Good, the Lead will check the data on that")}
        ${check(false, "Who should be able to beat it", "Level 30 squad? Only the top 5%? This changes everything about the numbers")}
        ${check(false, "What hard means to you", "More HP is the lazy version. Dodgeable attacks? Phases? A timer?")}
        ${check(false, "When it's done", "e.g. Playtest beats it in 3 to 6 tries with a level 30 squad")}
        ${check(false, "A reference", "A clip or a boss you like. Drag one in or pick from References")}
      </div>
      <div class="card" style="padding:14px 16px"><div style="font-weight:600;margin-bottom:8px">Quick answers</div>
        <div class="muted" style="font-size:12px;margin-bottom:8px">Who should beat it?</div>
        <div class="row" style="gap:6px;flex-wrap:wrap">${["Anyone past level 20", "Level 30 squads", "Top 5% only", "4 player raids"].map((t, i) => `<span class="pill ${i === 1 ? "acc" : ""}" style="height:26px;padding:0 10px">${t}</span>`).join("")}</div>
        <div class="muted" style="font-size:12px;margin:12px 0 8px">What makes it hard?</div>
        <div class="row" style="gap:6px;flex-wrap:wrap">${["Attacks you can dodge", "Phases", "Adds", "Enrage timer", "More HP"].map((t, i) => `<span class="pill ${i < 2 ? "acc" : ""}" style="height:26px;padding:0 10px">${t}</span>`).join("")}</div>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:14px">
      <div class="card" style="padding:16px;border-color:var(--line-2)">
        <div class="row" style="margin-bottom:10px"><b style="font-weight:600">What the Lead will get</b><span class="muted" style="margin-left:auto;font-size:12px">${add("highlighted")} = added from your answers</span></div>
        <div style="font-size:13.5px;line-height:1.6;display:flex;flex-direction:column;gap:8px">
          <p>Add a new boss to Frostpeak in Anime Awakening RNG. Players say it's boring right now, so this should be the fight people talk about.</p>
          <p>It's for ${add("level 30 squads")}. Hard should come from ${add("attacks you can see coming and dodge, and 3 phases")}, not from a huge HP bar.</p>
          <p>Done when ${add("Playtest beats it in 3 to 6 tries with a level 30 squad, and a level 20 squad can't")}.</p>
          <p>${add("Look at the Lord Frozza fight for what not to repeat: the red floor covered everything.")}</p>
        </div>
        <div class="row" style="gap:8px;margin-top:16px"><button class="btn pri">${ic("up", "width:14px;height:14px")}Send to Lead</button><button class="btn">${ic("copy", "width:14px;height:14px")}Copy</button><button class="btn ghost">Send mine as is</button></div>
      </div>
      <div class="card" style="padding:16px">
        <div class="sec-h"><h3>Start from a template</h3><span class="r">Make your own</span></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${tpl.map(([t, d]) => `<div class="card" style="box-shadow:none;background:var(--raise);padding:10px 12px"><div style="font-weight:500">${t}</div><div class="muted" style="font-size:12px">${d}</div></div>`).join("")}</div>
      </div>
      <div class="card" style="padding:14px 16px">
        <div style="font-weight:600;margin-bottom:6px">Things that actually help</div>
        <ul class="muted" style="padding-left:16px;font-size:12.5px;display:flex;flex-direction:column;gap:3px"><li>Say what done looks like. The agents stop guessing when they know where the finish line is.</li><li>One clip beats three paragraphs about a vibe.</li><li>Say what not to touch. Otherwise someone will "improve" it.</li></ul>
      </div>
    </div>
  </div>`;
}

/* ---------- Vault ---------- */
function vault() {
  const chapters = ["Start here", "The first five minutes", "Core loop", "Rolls and rarity", "Economy and progression", "UI and HUD", "World and lighting", "VFX, models and sound", "Phones", "Shops", "Coming back tomorrow", "Thumbnails and icons", "Updates and events", "Code that doesn't break"];
  const counts = [3, 12, 9, 16, 21, 18, 11, 14, 8, 10, 9, 7, 6, 22];
  const learned = [
    ["playtest", "Sell buttons on phones go above the chat box", "From playtest run #14 · Dig Up a Dino", "Phones"],
    ["balance", "Cap hero power at 4x a common, two exceptions", "You decided this on Oct 23", "Rolls and rarity"],
    ["reviewer", "Save before you grant a daily reward, never after", "From a blocked ship · Dig Up a Dino", "Code that doesn't break"],
  ];
  return `<div style="display:grid;grid-template-columns:250px 1fr 330px;height:100%">
    <div style="border-right:1px solid var(--line);padding:18px 12px;overflow:hidden">
      <div class="row" style="padding:0 6px 4px"><b style="font-weight:600;font-size:15px">Vault</b><span class="mono dim" style="margin-left:auto">166 notes</span></div>
      <div class="muted" style="font-size:11.5px;padding:0 6px 12px" class="trunc">~/Documents/Inclined Vault</div>
      ${chapters.map((c, i) => `<div class="row" style="gap:8px;height:28px;padding:0 6px;border-radius:6px;font-size:12.5px;${i === 3 ? "background:var(--raise);box-shadow:inset 0 0 0 1px var(--line-2);font-weight:500" : "color:var(--muted)"}"><span class="mono dim" style="width:18px">${String(i).padStart(2, "0")}</span><span class="grow trunc">${c}</span><span class="mono dim">${counts[i]}</span></div>`).join("")}
      <div class="row" style="gap:8px;height:28px;padding:0 6px;font-size:12.5px;color:var(--accent-text);margin-top:4px">${ic("plus", "width:13px;height:13px")}New chapter</div>
    </div>
    <div style="padding:22px 28px;overflow:hidden">
      <div class="row" style="margin-bottom:14px;gap:8px"><span class="muted" style="font-size:12px">Vault</span>${ic("right", "width:12px;height:12px;color:var(--dim)")}<span class="muted" style="font-size:12px">03 Rolls and rarity</span><div class="grow"></div><button class="btn sm">${ic("ext", "width:13px;height:13px")}Open in Obsidian</button></div>
      <h1 class="page" style="font-size:24px">Rolls and rarity</h1>
      <div class="card" style="box-shadow:none;padding:10px 14px;margin:14px 0;background:var(--raise)">
        <div class="row" style="gap:12px;padding:3px 0"><span class="muted" style="width:90px;font-size:12px">Read by</span>${["balance", "architect"].map(k => `<span class="row" style="gap:5px">${av(k, "sm")}${AG[k][0]}</span>`).join("")}</div>
        <div class="row" style="gap:12px;padding:3px 0"><span class="muted" style="width:90px;font-size:12px">Also checks it</span>${["builder", "merchant", "frame"].map(k => `<span class="row" style="gap:5px">${av(k, "sm")}${AG[k][0]}</span>`).join("")}</div>
        <div class="row" style="gap:12px;padding:3px 0"><span class="muted" style="width:90px;font-size:12px">Last edit</span><span>Balance, 2 days ago · you approved it</span></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;font-size:13.5px;line-height:1.6;max-width:640px">
        <p>Any game where you roll, open, hatch, dig or spin for something lives or dies on how the odds feel. This is what we've learned about making a rare pull feel worth the wait.</p>
        <h3 style="font-size:15px;margin-top:6px">Rules we stick to</h3>
        <ol style="padding-left:20px;display:flex;flex-direction:column;gap:5px">
          <li><b>Show the odds.</b> Players trust a 1 in 2.5M they can see more than a mystery.</li>
          <li><b>Pity, always.</b> After a bad streak the next roll gets better. Nobody should go 10,000 rolls with nothing.</li>
          <li><b>Duplicates are never junk.</b> They turn into upgrade material or index progress.</li>
          <li><b>The reveal is half the reward.</b> Rarer means a longer, louder reveal, but skippable after the first time.</li>
          <li><b>Power caps at 4x.</b> Past that, people who get lucky early stop playing. <span class="pill info" style="height:18px">added Oct 23</span></li>
        </ol>
        <div class="row" style="gap:10px;margin-top:4px">${thumb("night", 41, { tag: "GOOD · slow reveal", vfxSize: 40, vfx: "#b48cff", sparks: 20, k: "v1", style: "width:220px" })}${thumb("grove", 42, { tag: "BAD · instant popup", guys: 2, k: "v2", style: "width:220px" })}</div>
      </div>
    </div>
    <div style="border-left:1px solid var(--line);padding:20px;display:flex;flex-direction:column;gap:16px;background:var(--side)">
      <div class="card" style="padding:16px">
        <div style="font-weight:600;margin-bottom:4px">Grow it with the agents</div>
        <div class="muted" style="font-size:12.5px;margin-bottom:12px">Starting from nothing, or yours is thin? The agents write notes from your games, your Review history and what's working on the charts. You approve every page.</div>
        <button class="btn pri" style="width:100%;justify-content:center">${ic("lead", "width:14px;height:14px")}Start building the vault</button>
        <div class="dim" style="font-size:11.5px;margin-top:8px;text-align:center">Takes about an hour on your PC</div>
      </div>
      <div><div class="sec-h"><h3>Learned this week</h3><span class="c">3 to approve</span></div>
        <div style="display:flex;flex-direction:column;gap:8px">${learned.map(([k, t, src, ch]) => `<div class="card" style="padding:12px 14px"><div class="row" style="margin-bottom:5px">${av(k, "sm")}<span class="muted" style="font-size:11.5px">${AG[k][0]} · into ${ch}</span></div><div style="font-weight:500;line-height:1.35">${t}</div><div class="dim" style="font-size:11.5px;margin-top:3px">${src}</div><div class="row" style="gap:6px;margin-top:10px"><button class="btn sm">Add to vault</button><button class="btn sm ghost">Skip</button></div></div>`).join("")}</div>
      </div>
      <div class="row muted" style="gap:8px;font-size:12px;margin-top:auto">${ic("reload", "width:13px;height:13px")}Watching the folder. Edits in Obsidian show up here.</div>
    </div>
  </div>`;
}

/* ---------- Pipeline ---------- */
function pipeline() {
  const cols = [
    ["Pitched", "pulse", [["Dino co-op digs", "update", 2]]],
    ["Designed", "architect", [["Fishing weather RNG", "new game", 4]]],
    ["Assets ready", "librarian", []],
    ["Built", "builder", []],
    ["Balanced", "balance", [["Dig Up a Dino", "v0.9", 7, true]]],
    ["Art done", "splash", []],
    ["Ready to publish", "producer", [["Anime Awakening RNG", "v1.5", 11]]],
    ["Live", null, [["Anime Awakening RNG", "v1.4", 0, false, true]]],
    ["Graded", "liveops", [["Anime Awakening RNG", "v1.3", 0, false, false, "Day 14: 18% came back"]]],
  ];
  const card = ([n, v, proof, moving, live, grade]) => `<div class="card" style="padding:11px 12px;${moving ? "box-shadow:inset 0 0 0 1.5px var(--ok)" : ""}">
    <div style="font-weight:600;font-size:12.5px;line-height:1.3">${n}</div><div class="mono dim" style="margin-top:2px">${v}</div>
    ${grade ? `<div class="muted" style="font-size:11.5px;margin-top:8px">${grade}</div>` : ""}
    ${proof ? `<div class="row" style="gap:6px;margin-top:8px;font-size:11.5px" class="muted">${ic("review", "width:12px;height:12px;color:var(--muted)")}<span class="muted">${proof} pieces of proof</span></div>` : ""}
    ${moving ? `<div class="row" style="gap:6px;margin-top:8px">${av("producer", "sm")}<span style="font-size:11.5px;color:var(--ok)">Producer checking the move</span></div>` : ""}
    ${live ? `<div class="row" style="gap:6px;margin-top:8px"><span class="dot pulse"></span><span style="font-size:11.5px">214 playing</span></div>` : ""}
    ${n === "Anime Awakening RNG" && v === "v1.5" ? `<button class="btn sm pri" style="width:100%;justify-content:center;margin-top:10px">Publish</button>` : ""}
  </div>`;
  return `
  <div class="row" style="align-items:flex-end;margin-bottom:18px"><div class="grow"><h1 class="page">Pipeline</h1><p class="lede">Every game and update, stage by stage. Agents move the cards, Producer checks the proof on every move, and only you can publish.</p></div>
    <div class="seg"><a class="on">Board</a><a>List</a></div></div>
  <div style="display:grid;grid-template-columns:repeat(9,1fr);gap:10px;align-items:start">
    ${cols.map(([name, who, cards]) => `<div style="min-width:0">
      <div class="row" style="gap:6px;margin-bottom:8px;padding:0 2px">${who ? av(who, "sm") : `<span class="av sm" style="--c:#3d7eff">${ic("user", "width:11px;height:11px")}</span>`}<b style="font-size:12px;font-weight:600" class="trunc">${name}</b><span class="mono dim" style="margin-left:auto">${cards.length}</span></div>
      <div style="display:flex;flex-direction:column;gap:8px;min-height:420px;padding:6px;border-radius:10px;background:color-mix(in srgb,var(--panel) 50%,transparent);border:1px dashed var(--line)">
        ${cards.map(card).join("")}
        ${name === "Live" ? `<div class="dim" style="font-size:11px;text-align:center;padding:6px">Only you can move things here</div>` : ""}
      </div></div>`).join("")}
  </div>
  <div class="card" style="padding:12px 16px;margin-top:16px"><div class="row" style="gap:12px">${av("producer")}<div class="grow"><b style="font-weight:600">Dig Up a Dino wants to move to Art done</b><div class="muted" style="font-size:12px">Balance ran 500 sims, first upgrade lands at 4m 10s, nobody stalls past 9 minutes. 7 pieces of proof attached.</div></div><button class="btn sm">See the proof</button><button class="btn sm ghost">Hold it</button></div></div>`;
}

/* ---------- Library ---------- */
function library() {
  const items = [["gem", "Gem", "icon", "1452 0198 3341"], ["chest", "Daily chest", "icon", "1452 0198 7712"], ["coin", "Coin", "icon", "1452 0201 0042"], ["gift", "Free gift", "icon", "1452 0201 2219"], ["clover", "Luck", "icon", "1452 0203 4410"], ["potion", "Luck potion", "icon", "1452 0203 9981"],
    ["egg", "Dino egg", "model", "1452 1102 3301"], ["sword", "Starter sword", "model", "1452 1102 5520"], ["shovel", "Shovel", "model", "1452 1104 0007"], ["crown", "VIP", "icon", "1452 0207 1178"], ["scroll", "Quests", "icon", "1452 0207 6602"], ["bone", "Fossil", "model", "not uploaded"]];
  return `
  <div class="row" style="align-items:flex-end;margin-bottom:16px"><div class="grow"><h1 class="page">Library</h1><p class="lede">Everything you own and can reuse. Every new task checks here first, so the agents don't make a fourth coin icon.</p></div>
    <button class="btn pri">${ic("upload", "width:14px;height:14px")}Upload</button></div>
  <div class="row" style="margin-bottom:14px;gap:10px"><div class="seg"><a class="on">Assets <span class="mono">214</span></a><a>Systems <span class="mono">38</span></a><a>References <span class="mono">52</span></a></div>
    <div class="seg"><a class="on">All</a><a>Models</a><a>Icons</a><a>Sounds</a><a>VFX</a><a>UI</a></div><div class="grow"></div>
    <div class="input" style="width:240px">${ic("search")}Search names or asset ids</div><button class="btn">Any game ${ic("down", "width:13px;height:13px")}</button></div>
  <div class="card" style="padding:16px 18px;margin-bottom:16px;border-style:dashed;box-shadow:none;display:flex;align-items:center;gap:14px">
    <span style="width:40px;height:40px;border-radius:10px;background:var(--raise);display:grid;place-items:center;color:var(--accent-text)">${ic("upload")}</span>
    <div class="grow"><div style="font-weight:600">Drop files anywhere on this page</div><div class="muted" style="font-size:12.5px">Images, .fbx, .obj, .rbxm, .mp3 and .ogg. They get uploaded to Roblox, get an asset id, and the agents can use them in the next task.</div></div>
    <div class="row muted" style="gap:6px;font-size:12px"><span class="dot"></span>2 uploading</div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:12px">
    ${items.map(([k, n, t, id]) => `<div class="card" style="padding:10px;box-shadow:none">
      <div style="aspect-ratio:1;border-radius:8px;background:radial-gradient(circle at 50% 40%,var(--hover),var(--raise));display:grid;place-items:center;padding:16%">${sticker(k)}</div>
      <div class="row" style="margin-top:8px"><b style="font-weight:600" class="grow">${n}</b><span class="pill" style="height:18px;font-size:10px">${t}</span></div>
      <div class="mono ${id.startsWith("not") ? "" : "dim"}" style="margin-top:3px;${id.startsWith("not") ? "color:var(--warn)" : ""}">${id.startsWith("not") ? "not uploaded yet" : "rbx " + id}</div></div>`).join("")}
  </div>`;
}

/* ---------- Pitch ---------- */
function pitch() {
  const stat = (l, v, s, c) => `<div class="card" style="padding:12px 14px;box-shadow:none"><div class="mono dim">${l}</div><div style="font-size:21px;font-weight:600;letter-spacing:-0.02em;margin-top:2px;${c ? `color:${c}` : ""}">${v}</div><div class="muted" style="font-size:11.5px">${s}</div></div>`;
  const row = (k, v) => `<div class="row" style="align-items:flex-start;gap:16px;padding:8px 0;border-top:1px solid var(--line)"><span class="muted" style="width:150px;flex:none">${k}</span><span>${v}</span></div>`;
  return `
  <div class="row" style="margin-bottom:14px;gap:10px"><div class="seg"><a class="on">Needs your call <span class="mono">3</span></a><a>Waiting on Pulse <span class="mono">1</span></a><a>Your ideas <span class="mono">2</span></a><a>History</a></div><div class="grow"></div><button class="btn">${ic("grid", "width:14px;height:14px")}Compare side by side</button><button class="btn pri">${ic("plus", "width:14px;height:14px")}I have an idea</button></div>
  <div style="display:grid;grid-template-columns:1fr 320px;gap:20px">
    <div class="card" style="overflow:hidden">
      <div style="display:flex;gap:16px;padding:20px 22px;border-bottom:1px solid var(--line)">
        <div style="width:96px;flex:none">${thumb("grove", 51, { ar: "1/1", guys: 1, vfxSize: 20, vfx: "#7fd0ff", sparks: 6, style: "border-radius:14px" })}</div>
        <div class="grow"><div class="row" style="gap:6px;margin-bottom:8px">${["early window", "RNG + fishing", "new game"].map((t, i) => `<span class="pill ${i === 0 ? "ok" : ""}">${t}</span>`).join("")}<span class="pill acc" style="margin-left:auto">8/10</span></div>
          <div style="font-size:22px;font-weight:600;letter-spacing:-0.025em">Fishing RNG where the weather changes what bites</div>
          <div class="muted" style="margin-top:4px">Cast, wait, reel, roll for what's on the hook. Every 20 minutes the weather flips and a different set of fish shows up.</div></div>
      </div>
      <div style="padding:18px 22px">
        <div class="card" style="box-shadow:none;padding:12px 14px;background:var(--raise);margin-bottom:14px"><div class="mono dim" style="margin-bottom:4px">WHY THIS ONE</div>
          <div>Fish It But RNG went from 2k to 48k players in 3 weeks and almost nobody has copied it well yet. The weather timer is the twist: it gives people a reason to come back at set times, which none of the top 3 have.</div>
          <div class="row" style="gap:6px;margin-top:8px"><span class="pill">vs Fish It But RNG</span><span class="pill">vs Reel Legends</span></div></div>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:16px">
          ${stat("TOP EARNING", "#38", "Fish It But RNG", "var(--accent-text)")}${stat("PLAYING NOW", "48.2k", "top comparable")}${stat("LIKES", "92%", "80%+ gets pushed", "var(--ok)")}${stat("UPVOTES / DAY", "3.1k", "still climbing")}${stat("SIMILAR GAMES", "3", "in the top 200")}
        </div>
        <div style="font-weight:600;margin-bottom:4px">The game</div>
        ${row("First 60 seconds", "Grab the free rod, cast off the dock, land a common in under 20 seconds and see the roll odds on screen.")}
        ${row("By minute 15", "First rare in rain weather and enough coins for rod #2, which unlocks the lake.")}
        ${row("Minutes 15 to 30", "Weather flips to fog. New fish, so the index has fresh blanks to fill.")}
        ${row("How it makes money", "2x luck, a weather skip, and boats as cosmetics. Nothing that wins the leaderboard.")}
        ${row("The clip moment", "A 1 in a million fish breaking the water during a thunderstorm.")}
        ${row("Reuses", `<span class="row" style="gap:6px;flex-wrap:wrap"><span class="pill">${ic("library", "width:11px;height:11px")}Roll + reveal system</span><span class="pill">${ic("library", "width:11px;height:11px")}Index UI</span><span class="pill">${ic("library", "width:11px;height:11px")}Daily chest</span></span>`)}
      </div>
      <div class="row" style="gap:8px;padding:14px 22px;border-top:1px solid var(--line);background:var(--raise)"><button class="btn pri">${ic("check", "width:14px;height:14px")}Approve</button><button class="btn">Edit and approve</button><button class="btn">Ask for changes</button><div class="grow"></div><button class="btn ghost">Decline</button></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:14px">
      <div class="card" style="padding:14px 16px"><div class="sec-h"><h3>Evidence</h3><span class="c">3</span></div>
        ${[["Fish It But RNG", "48.2k", "+212%", [2, 3, 3, 5, 8, 12, 19, 26]], ["Reel Legends", "9.1k", "+18%", [6, 6, 7, 7, 8, 8, 9, 9]], ["Weather RNG", "2.4k", "+41%", [2, 2, 3, 3, 3, 4, 4, 5]]].map(([n, c, ch, d], i) => `<div class="row" style="gap:10px;padding:8px 0;${i ? "border-top:1px solid var(--line)" : ""}"><div class="grow"><div style="font-weight:500">${n}</div><div class="mono dim">${c} playing</div></div>${spark(d, 60, 20)}<span class="mono" style="color:var(--ok);width:44px;text-align:right">${ch}</span></div>`).join("")}
        <div class="muted" style="font-size:11.5px;margin-top:6px">From RoWatcher and Roblox charts, 6 min ago</div></div>
      <div class="card" style="padding:14px 16px"><div class="sec-h"><h3>Risks</h3><span class="c">2</span></div>
        <ul class="muted" style="padding-left:16px;font-size:12.5px;display:flex;flex-direction:column;gap:5px"><li>If Fish It ships its own weather update first, the twist is gone. Pulse is watching their changelog.</li><li>Water and fishing line physics are new for the team. Builder thinks 3 days on its own.</li></ul></div>
      <div class="card" style="padding:14px 16px"><div class="sec-h"><h3>Building it</h3></div>
        <div class="muted" style="font-size:12.5px">About 3 weeks with the current team. Architect writes the plan the moment you approve.</div></div>
    </div>
  </div>`;
}

Object.assign(SHOTS, {
  "mac-app-team": { stage: "warm", w: 1560, h: 960, html: () => `<div class="window" style="width:1560px;height:960px">
    <div class="body">${shell("team", `<b>Team</b><span class="dim">·</span><span>Builder</span>`, team(), { mac: true, pad: "padding:0" })}</div></div>` },
  "windows-app-prompt": { stage: "win", w: 1560, h: 1000, html: () => `<div class="window win" style="width:1560px;height:1000px">
    <div class="winbar">${logo(16)}<span class="ttl">RoSlop</span><div class="ctl">${winCtl}</div></div>
    <div class="body">${shell("prompt", `<b>Prompt coach</b>`, promptCoach(), { win: true })}</div></div>` },
  "mac-app-vault": { stage: "paper", w: 1560, h: 960, html: () => `<div class="window" style="width:1560px;height:960px">
    <div class="body">${shell("vault", `<b>Vault</b><span class="dim">·</span><span>Rolls and rarity</span>`, vault(), { mac: true, light: true, pad: "padding:0" })}</div></div>` },
  "pc-site-pipeline": { stage: "win", w: 1600, h: 960, html: () => `<div class="window" style="width:1600px;height:960px">
    <div class="chrome"><div class="tabs"><div class="tab on">${logo(14)}<span>Pipeline · RoSlop</span><span class="x">✕</span></div><span style="padding:0 10px 8px;color:#888">+</span><div class="ctl">${winCtl}</div></div>
    <div class="bar2"><div class="navb">${ic("left")}${ic("right")}${ic("reload")}</div><div class="omni">${ic("lock", "width:13px;height:13px;color:#8a8a8f")}<span>roslop.app<span class="path">/games/pipeline</span></span></div>${ic("user", "color:#8a8a8f")}</div></div>
    <div class="body">${shell("games", `<span>Games</span>${ic("right", "width:13px;height:13px")}<b>Pipeline</b>`, pipeline(), { win: true })}</div></div>` },
  "windows-app-library": { stage: "win", w: 1560, h: 960, html: () => `<div class="window win" style="width:1560px;height:960px">
    <div class="winbar">${logo(16)}<span class="ttl">RoSlop</span><div class="ctl">${winCtl}</div></div>
    <div class="body">${shell("library", `<b>Library</b>`, library(), { win: true })}</div></div>` },
  "mac-site-pitch": { stage: "warm", w: 1560, h: 1000, html: () => `<div class="window" style="width:1560px;height:1000px">
    <div class="safari dark"><div class="lights"><i></i><i></i><i></i></div><div class="tools">${ic("left")}${ic("right")}</div><div class="url">${ic("lock", "width:12px;height:12px")}roslop.app</div><div class="tools">${ic("upload")}${ic("plus")}${ic("copy")}</div></div>
    <div class="body">${shell("pitches", `<b>Pitches</b>`, pitch())}</div></div>` },
});
