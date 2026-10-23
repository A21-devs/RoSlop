/* ---------- Ideas ---------- */
function ideas() {
  const list = [["Fishing RNG where the weather changes what bites", "8", "Pulse · today", 1], ["Co-op digs, 4 players per pit", "7", "Pulse · yesterday", 0], ["Pet tycoon with trading", "5", "you · Monday", 0]];
  const beat = (t, l, d) => `<div style="position:relative;padding-top:22px"><span style="position:absolute;top:0;left:0;width:11px;height:11px;border-radius:99px;background:var(--acc);box-shadow:0 0 0 4px var(--paper)"></span><div class="mono" style="color:var(--acc)">${t}</div><div style="font-weight:600;margin-top:2px">${l}</div><div class="i2" style="font-size:12.5px;margin-top:2px">${d}</div></div>`;
  return `<div style="display:grid;grid-template-columns:280px 1fr 300px;height:100%">
    <div style="border-right:1px solid var(--rule);padding:22px 18px">
      <div class="row" style="margin-bottom:12px"><span class="lab">Ideas</span><span class="b sm" style="margin-left:auto">${ic("plus", "width:13px;height:13px")}Mine</span></div>
      ${list.map(([t, s, src, on]) => `<div style="padding:12px;border-radius:12px;margin-bottom:6px;${on ? "background:var(--sheet);border:1px solid var(--rule2)" : ""}"><div class="row" style="align-items:flex-start;gap:10px"><span class="serif" style="font-size:26px;line-height:1;color:${on ? "var(--acc)" : "var(--ink3)"}">${s}</span><div><div style="font-weight:500;line-height:1.3">${t}</div><div class="i3" style="font-size:12px;margin-top:3px">${src}</div></div></div></div>`).join("")}
      <div class="i3" style="font-size:12px;margin-top:14px;line-height:1.5">Pulse pitches from the charts every morning. Nothing gets built until you say so.</div>
    </div>
    <div style="padding:26px 40px;overflow:hidden;position:relative">
      <div class="row" style="gap:6px;margin-bottom:12px"><span class="tag go">early window</span><span class="tag">RNG + fishing</span><span class="tag">new game</span><span class="mono i3" style="margin-left:auto">pitched 9:12 AM by ${CREW.pulse[0]}</span></div>
      <h1 class="h-xl" style="font-size:44px">Fishing RNG where the <i>weather</i> changes what bites.</h1>
      <p class="serif" style="font-size:22px;line-height:1.3;margin:18px 0;padding-left:16px;border-left:2px solid var(--acc);color:var(--ink2)">Fish It But RNG went from 2k to 48k players in three weeks and almost nobody has copied it well. The weather timer gives people a reason to come back at set times, which none of the top three do.</p>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);border-top:1px solid var(--rule);border-bottom:1px solid var(--rule);margin-bottom:22px">
        ${[["#38", "top earning"], ["48.2k", "playing the closest one"], ["92%", "likes"], ["3.1k", "upvotes a day"], ["3", "real competitors"]].map(([v, l], i) => `<div style="padding:12px 14px;${i ? "border-left:1px solid var(--rule)" : ""}"><div class="serif" style="font-size:30px;line-height:1">${v}</div><div class="i3" style="font-size:12px;margin-top:4px">${l}</div></div>`).join("")}
      </div>
      <div class="lab" style="margin-bottom:10px">The first half hour</div>
      <div style="position:relative;display:grid;grid-template-columns:repeat(4,1fr);gap:20px"><i style="position:absolute;left:5px;right:0;top:5px;border-top:1px solid var(--rule2)"></i>
        ${beat("0:00", "Cast off the dock", "Free rod, first common in under 20s, odds on screen")}${beat("2:00", "First rare", "In the rain. Enough coins for rod #2")}${beat("15:00", "The lake opens", "Rod #2 unlocks it, new index page")}${beat("20:00", "Weather flips", "Fog. New fish, fresh blanks to fill")}
      </div>
      <div style="display:grid;grid-template-columns:150px 1fr;gap:8px 18px;margin-top:22px">
        <span class="i3">Money</span><span>2x luck, a weather skip, boats as cosmetics. Nothing that wins the leaderboard.</span>
        <span class="i3">The clip</span><span>A 1 in a million fish breaking the water in a thunderstorm.</span>
        <span class="i3">Reuses</span><span class="row" style="gap:6px">${["Roll and reveal", "Index pages", "Daily chest"].map(t => `<span class="tag">${ic("library", "width:11px;height:11px")}${t}</span>`).join("")}</span>
      </div>
      <div class="row" style="gap:8px;position:absolute;left:40px;right:40px;bottom:22px;padding:12px;border-radius:16px;background:var(--sheet);border:1px solid var(--rule2);box-shadow:var(--shade)">
        <span class="b acc">${ic("check", "width:14px;height:14px")}Build it</span><span class="b">Change it first</span><span class="b q">Not now</span><div class="grow"></div><span class="i3" style="font-size:12px">Architect starts the plan when you say go. About 3 weeks.</span>
      </div>
    </div>
    <aside style="border-left:1px solid var(--rule);padding:22px 20px;display:flex;flex-direction:column;gap:20px">
      <div><div class="lab" style="margin-bottom:8px">The proof</div>
        ${[["Fish It But RNG", "48.2k", "+212%", [2, 3, 3, 5, 8, 12, 19, 26]], ["Reel Legends", "9.1k", "+18%", [6, 6, 7, 7, 8, 8, 9, 9]], ["Weather RNG", "2.4k", "+41%", [2, 2, 3, 3, 3, 4, 4, 5]]].map(([n, c, ch, d]) => `<div class="row" style="gap:10px;padding:9px 0;border-top:1px solid var(--rule)"><div class="grow"><div style="font-weight:500">${n}</div><div class="mono i3">${c} playing</div></div>${spark(d, 56, 20, "var(--acc)")}<span class="mono" style="width:44px;text-align:right">${ch}</span></div>`).join("")}</div>
      <div><div class="lab" style="margin-bottom:8px">What could go wrong</div>
        <p class="i2" style="font-size:12.5px;margin-bottom:8px">Fish It ships its own weather update first. Pulse is watching their changelog.</p>
        <p class="i2" style="font-size:12.5px">Fishing line physics are new for the team. Builder thinks 3 days on its own.</p></div>
      <div><div class="lab" style="margin-bottom:8px">Cost to build</div><p class="i2" style="font-size:12.5px">About 22 windows of agent time, spread over 3 weeks so it never crowds out fixes.</p></div>
    </aside>
  </div>`;
}

/* ---------- Charts ---------- */
function charts() {
  const movers = [["Fish It But RNG", "RNG · fishing", "48.2k", 41, 1], ["Steal a Pet", "PvP · collect", "88.4k", 12, 3], ["Build a Boat Tycoon", "tycoon", "12.9k", 27, 7], ["Dig to China RNG", "RNG · digging", "6.1k", 63, 12], ["Grow a Garden 2", "sim · farming", "391k", 2, 2], ["Obby but you're a cat", "obby", "21.7k", 18, 9], ["Anime Card Clash", "cards · anime", "33.0k", -9, 15]];
  const genres = ["RNG", "Simulator", "Tycoon", "Obby", "Tower defense", "Horror", "Anime fighting", "Roleplay"];
  const heat = genres.map((g, gi) => Array.from({ length: 12 }, (_, w) => Math.max(.05, Math.min(1, .3 + Math.sin(w / 3 + gi) * .25 + (gi === 0 ? w * .05 : 0) - (gi === 6 ? w * .03 : 0)))));
  return `
  <div class="row" style="align-items:flex-end;margin-bottom:20px"><div class="grow"><h1 class="h-l">What's moving on Roblox.</h1><p class="lede" style="margin-top:4px;font-size:14.5px">From RoWatcher and the Roblox charts. Pulled 6 minutes ago.</p></div><span class="seg"><a class="on">Movers</a><a>Top played</a><a>Top earning</a><a>New</a></span></div>
  <div style="display:grid;grid-template-columns:1.15fr 1fr;gap:28px">
    <div>
      ${movers.map(([n, g, ccu, d, rank], i) => `<div class="row" style="gap:16px;padding:12px 0;border-top:1px solid var(--rule)">
        <span class="serif" style="font-size:28px;width:34px;line-height:1;color:var(--ink3)">${rank}</span>
        <div style="width:52px">${thumb(["grove", "night", "arena", "dino", "grove", "snow", "night"][i], 60 + i, { ar: "1/1", guys: 1, k: "ch" + i, style: "border-radius:10px" })}</div>
        <div class="grow"><div style="font-weight:600">${n}</div><div class="i3" style="font-size:12px">${g}</div></div>
        <span class="mono" style="width:60px;text-align:right">${ccu}</span>
        <span class="mono" style="width:70px;text-align:right;color:${d < 0 ? "var(--stop)" : "var(--go)"}">${d < 0 ? "▼" : "▲"} ${Math.abs(d)} places</span>
      </div>`).join("")}
    </div>
    <div style="display:flex;flex-direction:column;gap:22px">
      <div class="sheet" style="padding:18px">
        <div class="row" style="margin-bottom:12px"><span class="h-m" style="font-size:21px">Where people are playing</span><span class="mono i3" style="margin-left:auto">share by week, last 12</span></div>
        ${heat.map((r, gi) => `<div class="row" style="gap:3px;margin-bottom:3px"><span style="width:110px;font-size:12px" class="i2">${genres[gi]}</span>${r.map(v => `<i style="flex:1;height:20px;border-radius:4px;background:color-mix(in srgb,var(--acc) ${Math.round(v * v * 100)}%,var(--sunk))"></i>`).join("")}</div>`).join("")}
        <div class="row mono i3" style="margin-top:6px;padding-left:113px;justify-content:space-between"><span>Aug 4</span><span>Oct 20</span></div>
      </div>
      <div><div class="lab" style="margin-bottom:10px">Breaking out this week</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">${[["Fish It But RNG", "2k → 48k in 3 weeks", "grove"], ["Dig to China RNG", "new, already 6k", "dino"], ["Obby but you're a cat", "back in the top 50", "snow"]].map(([n, d, s], i) => `<div>${thumb(s, 70 + i, { guys: 2, k: "bo" + i })}<div style="font-weight:600;margin-top:8px">${n}</div><div class="i3" style="font-size:12px">${d}</div></div>`).join("")}</div>
        <span class="b sm" style="margin-top:14px">${ic("lead", "width:13px;height:13px")}Ask Pulse for a pitch on one of these</span></div>
    </div>
  </div>`;
}

/* ---------- Crew ---------- */
function crew() {
  const order = ["lead", "builder", "frame", "balance", "playtest", "kid", "scenic", "librarian", "architect", "pulse", "splash", "merchant", "producer", "reviewer", "liveops"];
  const busy = ["lead", "builder", "frame", "balance"];
  const h = t => `<div class="lab" style="margin:16px 0 6px">${t}</div>`;
  return `
  <div style="display:flex;gap:12px;justify-content:space-between;margin-bottom:26px">${order.map(k => `<div style="display:flex;flex-direction:column;align-items:center;gap:7px;width:76px;${k === "builder" ? "" : "opacity:.85"}"><span style="border-radius:99px;padding:3px;${busy.includes(k) ? "box-shadow:0 0 0 2px var(--acc)" : "box-shadow:0 0 0 1px var(--rule2)"};${k === "builder" ? "background:var(--acc-soft)" : ""}">${cg(k, "xl")}</span><span style="font-size:12px;font-weight:${k === "builder" ? 600 : 500}">${CREW[k][0]}</span></div>`).join("")}</div>
  <div style="display:grid;grid-template-columns:1fr 380px;gap:30px">
    <article class="sheet" style="padding:28px 34px">
      <div class="row i3" style="font-size:12px;margin-bottom:6px">${cg("lead", "sm")}<span>The Lead wrote this for Builder at 12:22 from your message “raid lava is broken and the weekly raid never resets”</span></div>
      <h2 class="h-l" style="margin:10px 0 2px">Raid lava and the weekly reset</h2>
      ${h("The goal")}<p>Lava in the Frostpeak raid should hurt, not kill instantly. The weekly raid should reset every Monday for everyone.</p>
      ${h("What's wrong now")}<p class="i2">Lava parts use Touched and stack, so players die in under a second. The weekly timer starts when a server starts, so every server resets at a different time.</p>
      ${h("Do this")}<p>One damage tick per player every 0.5s, 20 damage each, on the server. Respawn at the raid gate. Reset Monday 00:00 UTC with os.time, saved in RaidState.</p>
      ${h("Leave alone")}<p class="i2">The boss AI and the loot table. Balance has those this week.</p>
      ${h("Done when")}<p>Two players survive 10 seconds in lava, and moving the clock to Monday resets the raid on two separate servers.</p>
      <div class="row" style="gap:6px;margin-top:16px;flex-wrap:wrap"><span class="lab" style="margin-right:4px">Read first</span>${["Notebook / Raids and bosses", "Notebook / Saving data", "Shelf / RaidState"].map(t => `<span class="tag">${t}</span>`).join("")}</div>
      <div class="row" style="gap:8px;margin-top:20px"><span class="b sm">${ic("prompt", "width:13px;height:13px")}Edit the brief</span><span class="i3" style="font-size:12px">Builder picks up edits on its next step.</span></div>
    </article>
    <aside style="display:flex;flex-direction:column;gap:14px">
      <div class="row"><span class="lab">Builder, live</span><span class="tag go" style="margin-left:auto"><span class="dot live"></span>Studio 2</span></div>
      ${thumb("arena", 9, { tag: "S2", vfxSize: 30, vfx: "#ff6a2a", sparks: 12, k: "cr" })}
      <div>${[["12:24", "Read the 3 notes"], ["12:41", "Found 14 lava parts using Touched"], ["13:20", "Wrote RaidLava.server.lua"], ["13:58", "Weekly reset moved to os.time"], ["now", "Testing with 2 players"]].map(([t, l]) => `<div class="row" style="gap:10px;padding:7px 0;border-top:1px solid var(--rule)"><span class="mono i3" style="width:36px">${t}</span><span class="${t === "now" ? "" : "i2"}">${l}</span></div>`).join("")}</div>
      <div class="row i3" style="font-size:12px;gap:8px">${ic("gauge", "width:14px;height:14px")}Sonnet · 4.8% of the window so far</div>
      <div class="field">${ic("msg")}Say something to Builder</div>
    </aside>
  </div>`;
}

/* ---------- Notebook ---------- */
function notebook() {
  const ch = ["Read me first", "The first five minutes", "The core loop", "Rolls and rarity", "Economy", "UI and HUD", "World and light", "VFX, models, sound", "Phones", "Shops", "Coming back tomorrow", "Thumbnails and icons", "Updates and events", "Code that holds up"];
  const learned = [["playtest", "Phone sell buttons go above the chat box", "Phones", "playtest run #14"], ["balance", "Cap hero power at 4x a common, with two exceptions", "Rolls and rarity", "your call on Oct 23"], ["reviewer", "Save before you grant a daily reward, never after", "Code that holds up", "a blocked ship"]];
  return `<div style="display:grid;grid-template-columns:240px 1fr 330px;height:100%">
    <nav style="padding:22px 16px;border-right:1px solid var(--rule)">
      <div class="lab" style="margin-bottom:4px">Notebook</div><div class="mono i3" style="margin-bottom:14px">~/Notes/Inclined · 166 pages</div>
      ${ch.map((c, i) => `<div class="row" style="gap:10px;padding:6px 8px;border-radius:8px;${i === 3 ? "background:var(--ink);color:var(--paper)" : "color:var(--ink2)"}"><span class="mono" style="opacity:.6">${String(i).padStart(2, "0")}</span><span class="trunc">${c}</span></div>`).join("")}
    </nav>
    <article style="padding:30px 46px;overflow:hidden">
      <div class="row" style="margin-bottom:16px"><span class="lab">03 · Rolls and rarity</span><span class="b sm" style="margin-left:auto">${ic("ext", "width:13px;height:13px")}Open in Obsidian</span></div>
      <h1 class="h-xl" style="font-size:52px">Rolls and rarity</h1>
      <div class="row i2" style="gap:14px;margin:14px 0 22px;font-size:12.5px;flex-wrap:wrap"><span class="row" style="gap:6px">Mostly for ${cg("balance", "sm")}${cg("architect", "sm")}</span><span class="row" style="gap:6px">also checked by ${cg("builder", "sm")}${cg("merchant", "sm")}${cg("frame", "sm")}</span><span class="i3">edited 2 days ago</span></div>
      <div style="max-width:640px;font-size:14.5px;line-height:1.65;display:flex;flex-direction:column;gap:12px">
        <p>Any game where you roll, open, hatch, dig or spin lives on how the odds feel. Here's what we keep coming back to.</p>
        <p><b>Show the odds.</b> People trust a 1 in 2.5M they can see.</p>
        <p><b>Bad streaks end.</b> After enough misses the next roll gets better. Nobody goes 10,000 rolls with nothing.</p>
        <p><b>Duplicates are never junk.</b> They turn into upgrade material or index progress.</p>
        <p><b>The reveal is half the reward.</b> Rarer means a longer, louder reveal. Skippable after the first time.</p>
        <p><b>Power stops at 4x.</b> Past that, people who got lucky early quit. <span class="tag acc" style="height:19px">new</span></p>
      </div>
    </article>
    <aside style="border-left:1px solid var(--rule);padding:22px;display:flex;flex-direction:column;gap:16px">
      <div class="sheet" style="padding:16px"><div class="serif" style="font-size:22px;line-height:1.15">Let the crew write it.</div>
        <p class="i2" style="font-size:12.5px;margin:6px 0 12px">Starting from nothing? They'll draft pages from your games, your proofs and the charts. You keep or bin each one.</p>
        <span class="b acc" style="width:100%">${ic("lead", "width:14px;height:14px")}Start writing the notebook</span>
        <div class="i3 mono" style="text-align:center;margin-top:8px;font-size:10.5px">paced to about 15% of a window</div></div>
      <div class="lab">In the margins this week</div>
      ${learned.map(([k, t, c, src]) => `<div style="padding-left:12px;border-left:2px solid ${CREW[k][1]}"><div class="row i3" style="font-size:11.5px;gap:6px">${cg(k, "sm")}${CREW[k][0]} · for “${c}”</div><div class="serif" style="font-size:18px;line-height:1.25;margin:5px 0">${t}</div><div class="row" style="gap:6px"><span class="i3" style="font-size:11.5px">from ${src}</span><span class="b sm" style="margin-left:auto">Keep</span><span class="b sm q">Bin</span></div></div>`).join("")}
    </aside>
  </div>`;
}

/* ---------- Coach ---------- */
function coach() {
  const note = (n, t, d) => `<div class="row" style="align-items:flex-start;gap:10px;padding:10px 0;border-top:1px solid var(--rule)"><span class="mono" style="width:20px;height:20px;border-radius:99px;background:var(--acc);color:#fff;display:grid;place-items:center;font-size:10.5px;flex:none">${n}</span><div><div style="font-weight:600">${t}</div><div class="i2" style="font-size:12.5px">${d}</div></div></div>`;
  const pick = (t, on) => `<span class="chip ${on ? "on" : ""}" style="height:30px">${t}</span>`;
  return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:44px">
    <div>
      <div class="lab" style="margin-bottom:12px">What you typed</div>
      <p class="serif" style="font-size:38px;line-height:1.2">“add a boss to frostpeak thats <span class="squig">actually hard</span><sup class="mono" style="color:var(--acc);font-size:12px"> 1</sup>, like dark souls hard. <span class="squig">players are bored</span><sup class="mono" style="color:var(--acc);font-size:12px"> 2</sup>”<sup class="mono" style="color:var(--acc);font-size:12px"> 3</sup></p>
      <div class="row" style="gap:10px;margin:18px 0 8px">${ring(.7, 30, 4)}<div style="line-height:1.3"><b style="font-weight:600">The crew would be guessing on 3 things</b><div class="i3" style="font-size:12px">Guesses turn into rework, and rework eats your window.</div></div></div>
      ${note(1, "Hard how?", "More HP is the lazy version. Pick what makes it hard below.")}
      ${note(2, "Bored of what?", "Liveops can check where people actually drop off before anyone builds.")}
      ${note(3, "When is it done?", "Without a finish line, Builder keeps polishing and you pay for it.")}
      <div style="margin-top:16px"><div class="i3" style="font-size:12.5px;margin-bottom:8px">Who should beat it?</div><div class="row" style="gap:6px;flex-wrap:wrap">${pick("Anyone past 20")}${pick("Level 30 squads", 1)}${pick("Top 5% only")}${pick("4 player raids")}</div>
        <div class="i3" style="font-size:12.5px;margin:14px 0 8px">What makes it hard?</div><div class="row" style="gap:6px;flex-wrap:wrap">${pick("Attacks you can dodge", 1)}${pick("Phases", 1)}${pick("Adds")}${pick("Enrage timer")}${pick("More HP")}</div></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:18px">
      <div class="sheet" style="padding:22px 24px">
        <div class="row" style="margin-bottom:12px"><span class="lab">What the Lead gets</span><span class="i3" style="margin-left:auto;font-size:12px"><span class="mark">marked</span> = from your answers</span></div>
        <div style="font-size:14.5px;line-height:1.7;display:flex;flex-direction:column;gap:10px">
          <p>Add a new boss to Frostpeak in Anime Awakening RNG. People are getting bored, so this should be the fight they talk about.</p>
          <p>It's for <span class="mark">level 30 squads</span>. Hard comes from <span class="mark">attacks you can see coming and dodge, across 3 phases</span>, not a huge HP bar.</p>
          <p>Done when <span class="mark">Playtest beats it in 3 to 6 tries with a level 30 squad and a level 20 squad can't</span>.</p>
          <p><span class="mark">Don't repeat Frozza's red floor. It hid everything.</span></p>
        </div>
        <div class="row" style="gap:8px;margin-top:18px"><span class="b acc">${ic("up", "width:14px;height:14px")}Send to the Lead</span><span class="b">${ic("copy", "width:14px;height:14px")}Copy</span><span class="b q">Send mine as is</span><span class="mono i3" style="margin-left:auto">≈ 7% of a window</span></div>
      </div>
      <div><div class="lab" style="margin-bottom:10px">Start from one of these</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">${[["A boss fight", "moves, phases, who it's for"], ["Something's broken", "what you did, what happened"], ["The first 5 minutes", "where people quit"], ["Copy this feeling", "drop a clip, say why"], ["A new shop item", "price, buyer, what it can't break"], ["Too slow / too fast", "where it drags"]].map(([t, d]) => `<div style="padding:12px 14px;border:1px solid var(--rule2);border-radius:12px"><div class="serif" style="font-size:18px;line-height:1.15">${t}</div><div class="i3" style="font-size:12px;margin-top:3px">${d}</div></div>`).join("")}</div></div>
    </div>
  </div>`;
}

/* ---------- Shelf ---------- */
function shelf() {
  const items = [["gem", "Gem", "1452 0198 3341"], ["chest", "Daily chest", "1452 0198 7712"], ["coin", "Coin", "1452 0201 0042"], ["gift", "Free gift", "1452 0201 2219"], ["clover", "Luck", "1452 0203 4410"], ["potion", "Luck potion", "1452 0203 9981"], ["egg", "Dino egg", "1452 1102 3301"], ["sword", "Starter sword", "1452 1102 5520"], ["shovel", "Shovel", "1452 1104 0007"], ["crown", "VIP", "1452 0207 1178"], ["scroll", "Quests", "1452 0207 6602"], ["bone", "Fossil", ""]];
  const f = (l, n, on) => `<div class="row" style="padding:6px 10px;border-radius:8px;${on ? "background:var(--sheet);font-weight:600" : "color:var(--ink2)"}"><span class="grow">${l}</span><span class="mono i3">${n}</span></div>`;
  return `<div style="display:grid;grid-template-columns:210px 1fr;gap:30px">
    <div>
      <h1 class="h-l" style="margin-bottom:16px">Shelf</h1>
      <div class="lab" style="margin:0 10px 6px">What</div>${f("Everything", 304, 1)}${f("Icons", 118)}${f("Models", 61)}${f("Sounds", 35)}${f("Effects", 22)}${f("Systems", 38)}${f("References", 52)}
      <div class="lab" style="margin:16px 10px 6px">State</div>${f("On Roblox", 281)}${f("Not uploaded", 23)}
    </div>
    <div>
      <div class="row" style="gap:14px;padding:14px 16px;border:1.5px dashed var(--rule2);border-radius:14px;margin-bottom:18px">${ic("upload", "width:20px;height:20px;color:var(--acc)")}<div class="grow"><b style="font-weight:600">Drop anything here.</b> <span class="i2">Images, .fbx, .rbxm, sounds. It goes up to Roblox, gets an id, and the crew can use it on the next job.</span></div><span class="mono i3">2 uploading</span></div>
      <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:14px">
        ${items.map(([k, n, id]) => `<div><div style="aspect-ratio:1;border-radius:16px;background:var(--sheet);border:1px solid var(--rule);display:grid;place-items:center;padding:20%">${sticker(k)}</div><div style="font-weight:600;margin-top:8px">${n}</div><div class="mono" style="color:${id ? "var(--ink3)" : "var(--hold)"};font-size:10.5px">${id ? "rbx " + id : "not on Roblox yet"}</div></div>`).join("")}
      </div>
    </div>
  </div>`;
}

/* ---------- Settings ---------- */
const setNav = on => `<nav style="padding:24px 16px;border-right:1px solid var(--rule)"><div class="h-m" style="margin:0 8px 14px">Settings</div>${["Usage", "Machines", "Apps", "Connectors", "Keys", "AI provider", "Account", "Look"].map(l => `<div style="padding:7px 10px;border-radius:8px;font-weight:500;${l === on ? "background:var(--ink);color:var(--paper)" : "color:var(--ink2)"}">${l}</div>`).join("")}</nav>`;

function paceChart(w = 760, h = 250) {
  const T = 300, now = 162, cap = .8, L = 40, B = 24;
  const x = m => L + (m / T) * (w - L - 10), y = p => h - B - p * (h - B - 12);
  const actual = [0, .03, .07, .12, .14, .19, .24, .26, .3, .34, .38, .41];
  const pts = actual.map((p, i) => `${x(i * now / (actual.length - 1)).toFixed(1)},${y(p).toFixed(1)}`).join(" ");
  const loose = [0, .08, .17, .29, .4, .53, .66, .79, .9, 1].map((p, i) => `${x(i * 26).toFixed(1)},${y(p).toFixed(1)}`).join(" ");
  return `<svg width="100%" viewBox="0 0 ${w} ${h}" style="display:block">
    ${[0, .25, .5, .75, 1].map(p => `<line x1="${L}" x2="${w - 10}" y1="${y(p)}" y2="${y(p)}" style="stroke:var(--rule)"/><text x="${L - 8}" y="${y(p) + 4}" text-anchor="end" style="fill:var(--ink3);font:10.5px var(--mono)">${p * 100}%</text>`).join("")}
    <rect x="${L}" y="${y(1)}" width="${w - L - 10}" height="${y(cap) - y(1)}" style="fill:var(--stop);opacity:.07"/>
    <line x1="${L}" x2="${w - 10}" y1="${y(cap)}" y2="${y(cap)}" style="stroke:var(--stop);stroke-width:1.5;stroke-dasharray:5 4"/>
    <text x="${w - 12}" y="${y(cap) - 7}" text-anchor="end" style="fill:var(--stop);font:11px var(--mono)">your stop line, 80%</text>
    <polyline points="${loose}" fill="none" style="stroke:var(--ink3);stroke-width:1.5;stroke-dasharray:2 4"/>
    <text x="${x(234) - 10}" y="${y(1) + 4}" text-anchor="end" style="fill:var(--ink3);font:11px var(--mono)">no pacing: limit hit at 3h 54m</text>
    <polyline points="${pts}" fill="none" style="stroke:var(--acc);stroke-width:2.6;stroke-linejoin:round"/>
    <line x1="${x(now)}" y1="${y(.41)}" x2="${x(T)}" y2="${y(.68)}" style="stroke:var(--acc);stroke-width:2;stroke-dasharray:3 5"/>
    <circle cx="${x(now)}" cy="${y(.41)}" r="5" style="fill:var(--acc);stroke:var(--sheet);stroke-width:2.5"/>
    <text x="${x(now)}" y="${y(.41) + 22}" text-anchor="middle" style="fill:var(--ink);font:500 11px var(--mono)">now, 41%</text>
    <text x="${x(T) - 2}" y="${y(.68) + 18}" text-anchor="end" style="fill:var(--acc);font:500 11px var(--mono)">ends ~68%</text>
    ${[0, 1, 2, 3, 4, 5].map(i => `<text x="${x(i * 60)}" y="${h - 6}" text-anchor="${i === 0 ? "start" : i === 5 ? "end" : "middle"}" style="fill:var(--ink3);font:10.5px var(--mono)">${i}h</text>`).join("")}
  </svg>`;
}

function usage() {
  const tiers = [["Heavy", "Opus", ["lead", "architect", "reviewer"], "Planning and anything that touches money or saves"], ["Standard", "Sonnet", ["builder", "frame", "balance", "scenic", "merchant"], "Writing code, UI and numbers"], ["Light", "Haiku", ["librarian", "kid", "playtest", "splash", "producer", "pulse", "liveops"], "Lookups, playing, checking, summaries"]];
  const saves = [["Short handoffs", "Agents pass a summary to the next one, not the whole chat", 30, 1], ["One Studio snapshot", "The place is read once per change and shared, not re-read by everyone", 12, 1], ["Only the notes they need", "Each agent loads the Notebook pages tagged for it", 9, 1], ["Smaller screenshots", "Shrunk to what's readable before they're sent", 6, 1], ["Try light first", "Simple retries go to a lighter model before a heavy one", 4, 0]];
  return `<div style="display:grid;grid-template-columns:220px 1fr;height:100%">${setNav("Usage")}
    <div style="padding:28px 40px;overflow:hidden">
      <h1 class="h-xl">Stay inside the <i>window.</i></h1>
      <p class="lede" style="margin:10px 0 22px;max-width:760px">Your Claude plan gives you a usage limit that refills every 5 hours. RoSlop paces the crew so it never runs out early. Right now you're at 41% with 2h 18m to go.</p>
      <div style="display:grid;grid-template-columns:1fr 330px;gap:22px">
        <div class="sheet" style="padding:18px 20px">${paceChart()}</div>
        <div style="display:flex;flex-direction:column;gap:16px">
          <div><div class="row"><b style="font-weight:600">Stop the crew at</b><span class="serif" style="font-size:28px;margin-left:auto;color:var(--acc)">80%</span></div>
            <div style="position:relative;height:20px;margin-top:6px"><i style="position:absolute;top:8px;left:0;right:0;height:4px;border-radius:99px;background:var(--rule)"></i><i style="position:absolute;top:8px;left:0;width:80%;height:4px;border-radius:99px;background:var(--acc)"></i><i style="position:absolute;top:1px;left:calc(80% - 9px);width:18px;height:18px;border-radius:99px;background:var(--sheet);border:2px solid var(--acc)"></i></div>
            <div class="i3" style="font-size:12px">The last 20% stays yours for your own Claude Code work.</div></div>
          <div class="row"><div class="grow"><b style="font-weight:600">Agents at once</b><div class="i3" style="font-size:12px">Drops to 1 when you're running hot</div></div><span class="row sheet" style="border-radius:99px;padding:3px"><span class="b sm q">−</span><span class="mono" style="width:22px;text-align:center">3</span><span class="b sm q">+</span></span></div>
          <div class="row"><div class="grow"><b style="font-weight:600">Ahead of pace?</b><div class="i3" style="font-size:12px">What happens to low priority jobs</div></div><span class="b sm">Hold them ${ic("down", "width:12px;height:12px")}</span></div>
          <div class="row"><div class="grow"><b style="font-weight:600">Weekly limit</b><div class="i3" style="font-size:12px">Keep this much spare across the week</div></div><span class="mono">15%</span></div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-top:24px">
        <div><div class="lab" style="margin-bottom:8px">Right size for each job</div>
          ${tiers.map(([t, m, ks, d]) => `<div class="row" style="gap:14px;padding:11px 0;border-top:1px solid var(--rule)"><div style="width:110px"><div style="font-weight:600">${t}</div><div class="mono i3">${m}</div></div><div class="grow"><div class="row" style="gap:3px">${ks.map(k => cg(k, "sm")).join("")}</div><div class="i3" style="font-size:12px;margin-top:4px">${d}</div></div></div>`).join("")}
          <div class="i3" style="font-size:12px;margin-top:6px">On Codex this maps to its own model sizes.</div></div>
        <div><div class="row" style="margin-bottom:8px"><span class="lab">Savings that are on</span><span class="mono" style="margin-left:auto;color:var(--go)">saved ~41% today</span></div>
          ${saves.map(([t, d, p, on]) => `<div class="row" style="gap:12px;padding:9px 0;border-top:1px solid var(--rule)"><div class="grow"><div style="font-weight:600">${t}</div><div class="i3" style="font-size:12px">${d}</div></div><span class="mono i3">−${p}%</span><span class="tog ${on ? "on" : ""}"></span></div>`).join("")}</div>
      </div>
    </div>
  </div>`;
}

function machines() {
  const machine = (i, n, meta, role, right) => `<div class="row" style="gap:14px;padding:14px 0;border-top:1px solid var(--rule)"><span style="width:38px;height:38px;border-radius:99px;border:1px solid var(--rule2);display:grid;place-items:center;color:var(--ink2)">${ic(i)}</span><div class="grow"><div class="row" style="gap:8px"><b style="font-weight:600">${n}</b>${role}</div><div class="i3" style="font-size:12px">${meta}</div></div>${right}</div>`;
  const app = (n, v, how, ks, on, color, letter) => `<div class="row" style="gap:14px;padding:12px 0;border-top:1px solid var(--rule)"><span style="width:34px;height:34px;border-radius:10px;background:${color};display:grid;place-items:center;color:#fff;font-weight:700">${letter}</span><div style="width:180px"><b style="font-weight:600">${n}</b> <span class="mono i3">${v}</span></div><span class="grow i2" style="font-size:12.5px">${how}</span><span class="row" style="gap:3px">${ks.map(k => cg(k, "sm")).join("")}</span><span class="tog ${on ? "on" : ""}"></span></div>`;
  const conn = (n, where, on, d) => `<div class="row" style="gap:12px;padding:11px 0;border-top:1px solid var(--rule)"><div class="grow"><b style="font-weight:600">${n}</b> <span class="i3" style="font-size:12px">· ${where}</span><div class="i2" style="font-size:12.5px">${d}</div></div><span class="tog ${on ? "on" : ""}"></span></div>`;
  return `<div style="display:grid;grid-template-columns:220px 1fr;height:100%">${setNav("Machines")}
    <div style="padding:28px 40px;overflow:hidden;display:grid;grid-template-columns:1fr 1fr;gap:20px 40px;align-content:start">
      <div style="grid-column:span 2"><h1 class="h-l">One computer does the work.</h1><p class="lede" style="margin-top:6px">Everything else, your phone included, is a remote. If the PC is off, jobs wait and start the moment it's back.</p></div>
      <section><div class="lab" style="margin-bottom:4px">Machines</div>
        ${machine("studio", "Sam's PC", "Windows 11 · Claude Code Max · 4 Studios · up 3 days", `<span class="tag acc">does the work</span>`, `<span class="row i2" style="font-size:12px;gap:6px"><span class="dot live"></span>online</span>`)}
        ${machine("studio", "MacBook Air", "macOS 15 · Claude Code Max · 2 Studios", `<span class="tag">backup</span>`, `<span class="i3" style="font-size:12px;margin-right:6px">take over if PC is off</span><span class="tog on"></span>`)}
        ${machine("phone", "iPhone 15", "nothing runs here, it sends jobs to Sam's PC", `<span class="tag">remote</span>`, `<span class="mono i3">seen 2m ago</span>`)}</section>
      <section><div class="lab" style="margin-bottom:4px">Connectors, from Claude Code</div>
        ${conn("Figma", "found", 1, "Frame pulls frames and styles when you link a file")}${conn("GitHub", "found", 1, "Builder pushes to a branch, never main")}${conn("Linear", "found", 0, "Producer files bugs from Playtest and Reviewer")}${conn("Notion", "not connected", 0, "Connect it in Claude Code, then rescan")}</section>
      <section style="grid-column:span 2"><div class="row" style="margin-bottom:4px"><span class="lab">Apps on Sam's PC the crew can open</span><span class="b sm" style="margin-left:auto">${ic("plus", "width:13px;height:13px")}Add any app</span></div>
        ${app("Blender", "4.2", "Clean up and retopo models, bake textures, export .fbx straight into Studio", ["librarian", "scenic"], 1, "#e87d0d", "B")}
        ${app("Aseprite", "1.3", "Pixel icons, UI sprites, small animations", ["splash", "frame"], 1, "#7b4fd6", "A")}
        ${app("Photoshop", "2025", "Thumbnails and store art. Off until you say so", ["splash"], 0, "#2f8fd6", "Ps")}
        ${app("Audacity", "3.6", "Trim, level and loop sounds before upload", ["librarian"], 1, "#14365a", "Au")}</section>
    </div>
  </div>`;
}

/* ---------- Playtest ---------- */
function playtestRun() {
  const steps = [["0:00", "Spawned, read the tutorial in 3s", "go"], ["0:41", "First dig worked", "go"], ["1:52", "Couldn't tell which rocks dig. Tried 6", "hold"], ["3:05", "Backpack full, walked back to sell", "go"], ["3:58", "Sell button behind the chat on phone. Gave up after 40s", "stop"], ["5:10", "Shovel #2 felt the same as #1", "hold"], ["6:22", "Swamp gate wants 500 fossils, no hint where", "stop"]];
  const col = c => `var(--${c})`;
  return `<div style="display:grid;grid-template-columns:1fr 360px;gap:34px">
    <div>
      <div class="lab" style="margin-bottom:8px">Playtest #14 · Dig Up a Dino · fresh accounts</div>
      <h1 class="h-l" style="margin-bottom:16px">Two places new players <i>give up.</i></h1>
      <div style="display:grid;grid-template-columns:1.7fr 1fr;gap:10px">${thumb("dino", 31, { tag: "PC · PLAYTEST", guys: 2, k: "p1" })}${thumb("dino", 33, { tag: "PHONE · KID TESTER", guys: 1, k: "p2", ar: "auto", style: "height:100%" })}</div>
      <div style="position:relative;height:6px;border-radius:99px;background:var(--rule);margin:16px 0 6px"><i style="position:absolute;left:0;top:0;bottom:0;width:58%;border-radius:99px;background:var(--ink)"></i>${[[8, "go"], [21, "go"], [34, "hold"], [47, "go"], [58, "stop"], [71, "hold"], [86, "stop"]].map(([x, c]) => `<i style="position:absolute;left:${x}%;top:-5px;width:4px;height:16px;border-radius:2px;background:${col(c)}"></i>`).join("")}</div>
      <div class="row mono i3"><span>3:58 / 6:50</span><span style="margin-left:auto">marks are where it struggled</span></div>
      <div style="margin-top:12px">${steps.map(([t, l, c]) => `<div class="row" style="gap:12px;padding:8px 0;border-top:1px solid var(--rule)"><span class="mono i3" style="width:36px">${t}</span><span class="dot" style="background:${col(c)}"></span><span class="grow ${c === "go" ? "i2" : ""}">${l}</span>${c === "stop" ? `<span class="b sm">Hand to Builder</span>` : ""}</div>`).join("")}</div>
    </div>
    <aside style="display:flex;flex-direction:column;gap:20px">
      <div class="sheet" style="padding:18px"><div class="lab" style="margin-bottom:8px">How it read the game</div>
        ${[["Kind", "Digging and collecting"], ["Goal it set", "Full T-Rex, sell it, open the swamp"], ["Controls", "WASD, click to dig, E to sell, tap on phone"], ["Played as", "Brand new, phone and PC, 2 players"]].map(([a, b]) => `<div style="padding:6px 0;border-top:1px solid var(--rule)"><div class="i3" style="font-size:11.5px">${a}</div><div>${b}</div></div>`).join("")}
        <p class="i2" style="font-size:12.5px;margin-top:10px">It reads your scripts and UI first, then plays. Obby, tycoon, shooter, horror, story, anything. If it can't work out the goal it asks you once.</p></div>
      <div><div class="lab" style="margin-bottom:8px">Next run</div>
        <div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:10px"><span class="chip on">Phone</span><span class="chip on">PC</span><span class="chip">Controller</span><span class="chip">Tablet</span></div>
        <div class="row" style="gap:6px;margin-bottom:10px"><span class="i2" style="font-size:12.5px">Players</span><span class="seg"><a>1</a><a class="on">2</a><a>4</a><a>8</a></span></div>
        <div class="field" style="min-height:60px;align-items:flex-start;padding-top:10px">Anything it should try? “skip the tutorial, rush the swamp”</div>
        <div class="row" style="margin-top:10px"><span class="b ink">Run it again</span><span class="mono i3" style="margin-left:auto">≈ 3% of a window</span></div></div>
    </aside>
  </div>`;
}

/* ---------- Track ---------- */
function track() {
  const st = ["Pitched", "Planned", "Assets", "Built", "Balanced", "Art", "Ready", "Live", "Graded"];
  const owner = ["pulse", "architect", "librarian", "builder", "balance", "splash", "producer", null, "liveops"];
  const lines = [["Anime Awakening RNG v1.5", 6, "Waiting on you to publish. 11 proofs checked by Producer.", true], ["Dig Up a Dino v0.9", 4, "Producer is checking the move to Art. 7 proofs.", false], ["Fishing weather RNG", 1, "Architect is writing the plan.", false], ["Dino co-op digs", 0, "Pulse pitched it yesterday.", false], ["Anime Awakening RNG v1.4", 8, "Day 14: 18.2% came back next day.", false]];
  const W = 100 / (st.length - 1);
  return `
  <div class="row" style="align-items:flex-end;margin-bottom:28px"><div class="grow"><h1 class="h-l">Every game, on its line.</h1><p class="lede" style="margin-top:6px;font-size:14.5px">Agents move a game to the next stop. Producer checks the proof each time. Only you can take it Live.</p></div></div>
  <div style="position:relative;padding:0 30px 0 250px">
    <div style="position:relative;height:66px">${st.map((s, i) => `<div style="position:absolute;left:${i * W}%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:5px">${owner[i] ? cg(owner[i], "sm") : `<span class="cg sm" style="--c:var(--acc);color:#fff"><svg viewBox="0 0 24 24"><path d="M20 21a8 8 0 0 0-16 0 M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10z"/></svg></span>`}<span style="font-size:12px;font-weight:600;white-space:nowrap">${s}</span></div>`).join("")}</div>
    ${lines.map(([n, at, d, mine]) => `<div style="position:relative;height:74px;border-top:1px solid var(--rule)">
      <div style="position:absolute;left:-250px;top:16px;width:230px"><div style="font-weight:600">${n}</div><div class="i3" style="font-size:12px;line-height:1.35">${d}</div></div>
      <i style="position:absolute;left:0;right:0;top:34px;height:4px;border-radius:99px;background:var(--rule)"></i>
      <i style="position:absolute;left:0;width:${at * W}%;top:34px;height:4px;border-radius:99px;background:${at === 8 ? "var(--ink3)" : "var(--acc)"}"></i>
      ${st.map((_, i) => `<i style="position:absolute;left:${i * W}%;top:29px;width:14px;height:14px;margin-left:-7px;border-radius:99px;background:${i < at ? (at === 8 ? "var(--ink3)" : "var(--acc)") : "var(--paper)"};border:2px solid ${i <= at ? (at === 8 ? "var(--ink3)" : "var(--acc)") : "var(--rule2)"}"></i>`).join("")}
      <span style="position:absolute;left:${at * W}%;top:22px;margin-left:-19px;width:38px;height:38px;border-radius:99px;background:var(--ink);color:var(--paper);display:grid;place-items:center;box-shadow:0 0 0 4px var(--paper)">${ic("games", "width:17px;height:17px")}</span>
      ${mine ? `<span class="b sm acc" style="position:absolute;left:calc(${7 * W}% - 34px);top:22px">Publish</span>` : ""}
    </div>`).join("")}
  </div>`;
}

Object.assign(SHOTS, {
  "mac-app-ideas": { stage: "paper", w: 1560, h: 980, html: () => win(1560, 980, `<div class="body">${shell("ideas", ideas(), { mac: true, ask: false, pad: "padding:0" })}</div>`) },
  "windows-app-charts": { stage: "win", w: 1560, h: 1000, html: () => win(1560, 1000, winCtlBar + `<div class="body">${shell("charts", charts(), { theme: "night" })}</div>`, "win") },
  "pc-site-crew": { stage: "win", w: 1600, h: 1030, html: () => win(1600, 1030, chromeBar("Crew · RoSlop", "/crew/builder") + `<div class="body">${shell("crew", crew(), { theme: "night" })}</div>`) },
  "mac-app-notebook": { stage: "paper", w: 1560, h: 960, html: () => win(1560, 960, `<div class="body">${shell("notebook", notebook(), { mac: true, ask: false, pad: "padding:0" })}</div>`) },
  "windows-app-coach": { stage: "win", w: 1560, h: 1000, html: () => win(1560, 1000, winCtlBar + `<div class="body">${shell("coach", coach(), { ask: false })}</div>`, "win") },
  "pc-site-shelf": { stage: "win", w: 1600, h: 1000, html: () => win(1600, 1000, chromeBar("Shelf · RoSlop", "/shelf") + `<div class="body">${shell("shelf", shelf(), { theme: "night" })}</div>`) },
  "mac-app-usage": { stage: "paper", w: 1560, h: 980, html: () => win(1560, 980, `<div class="body">${shell("settings", usage(), { mac: true, ask: false, scope: false, pad: "padding:0" })}</div>`) },
  "windows-app-machines": { stage: "win", w: 1560, h: 1000, html: () => win(1560, 1000, winCtlBar + `<div class="body">${shell("settings", machines(), { theme: "night", ask: false, scope: false, pad: "padding:0" })}</div>`, "win") },
  "pc-site-playtest": { stage: "warm", w: 1600, h: 1040, html: () => win(1600, 1040, chromeBar("Playtest · RoSlop", "/live/dig-up-a-dino/playtest/14") + `<div class="body">${shell("live", playtestRun(), { scope: 2, ask: false })}</div>`) },
  "mac-site-track": { stage: "warm", w: 1560, h: 760, html: () => win(1560, 760, safariBar(true) + `<div class="body">${shell("live", track(), { theme: "night", ask: false })}</div>`) },
});
