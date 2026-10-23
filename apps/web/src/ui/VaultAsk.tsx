import { useState } from "react";
import { vaultRequest } from "../data/actions";
import { db, toast, useData, useSnap } from "../data/store";
import { Icon } from "./bits";

const IDEAS: { label: string; text: string; games?: string }[] = [
  {
    label: "Study the charts",
    text: "Go through the whole game data pull, hundreds of games, not just the famous ones. Group them by genre, age and size and find the patterns: which loops, titles, server sizes and update habits go with lots of players. Write a Design note per pattern with the numbers and 5 to 10 named examples each, and write \"What works in this type\" in every type note in Game Types, covering the standout games inside it. No notes for single games.",
  },
  {
    label: "Study AI slop games",
    text: "Use the quick game signs in the data pull to find the low effort, often AI-made games that still get real players, there should be dozens. Check them on Roblox: UI, thumbnails, icons, titles, the loop and the monetization. Work out why they get players anyway, what's cheap to copy and what makes them feel cheap. Write a Design note on what to steal and what to avoid, with counts and examples, and add what you find to the type notes they belong to. No notes for single games.",
  },
  {
    label: "UI teardown",
    text: "Break down the UI of these games screen by screen: HUD, shop, menus, popups, buttons, fonts and colors. Screenshot each one into References/img and write what works and why. Finish with a UI rules note in Design for Frame.",
  },
  {
    label: "Thumbnails and icons",
    text: "Collect thumbnails and icons from games that are growing right now. Save them, sort them by style and write what makes people click. Make a note in Design for Splash.",
  },
  {
    label: "How games make money",
    text: "Write up how top games make money: gamepasses, dev products, limited items, daily rewards, prices and where the buy buttons sit. One note in Design for Merchant and Balance, with examples and numbers.",
  },
  {
    label: "Update a game's notes",
    text: "Update the notes for this game with everything that's changed: what we built, what got approved or sent back, current numbers and what's next.",
  },
  {
    label: "Clean up the vault",
    text: "Tidy the vault: merge near copies, fix broken [[links]], add missing for: tags, and make sure every note is linked from Home.md. Don't delete anything useful.",
  },
];

function recentVaults(): string[] {
  try {
    return JSON.parse(localStorage.getItem("roslop-vaults") ?? "[]");
  } catch {
    return [];
  }
}

function remember(path: string) {
  try {
    localStorage.setItem("roslop-vaults", JSON.stringify([path, ...recentVaults().filter(p => p !== path)].slice(0, 8)));
  } catch {}
}

export function VaultAsk() {
  const s = useSnap();
  const { game } = useData();
  const main = s.settings.vault_path;
  const [vault, setVault] = useState(main ?? "");
  const [ask, setAsk] = useState("");
  const [games, setGames] = useState("");
  const [busy, setBusy] = useState(false);
  const options = [...new Set([main, vault, ...recentVaults()].filter(Boolean) as string[])];

  const pick = async () => {
    const p = await window.roslop?.pickFolder();
    if (!p) return;
    remember(p);
    setVault(p);
  };

  const [pulling, setPulling] = useState(false);
  const pull = async () => {
    setPulling(true);
    try {
      const r = await window.roslop!.pullGames(vault || null);
      if (!main) await db.saveSettings({ vault_path: r.vault });
      toast(`Sorted ${r.count.toLocaleString()} games into ${r.types} type notes in ${r.vault}. Start at Game Types in Obsidian.`);
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), true);
    } finally {
      setPulling(false);
    }
  };

  const send = async () => {
    setBusy(true);
    try {
      if (vault) remember(vault);
      await vaultRequest(s, { vault: vault && vault !== main ? vault : null, ask, games, game_id: game === "all" ? null : game });
      toast(`Sent to the Lead. Notes land in ${vault || "Documents/RoSlop Vault"} as each task finishes.`);
      setAsk("");
      setGames("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card pad col">
      <div className="sec-h" style={{ margin: 0 }}><h3>Tell the crew what to add</h3></div>
      <div className="muted">Ask for a kind of note, a set of games to study, or changes to what's there. Pick one to start from or write your own.</div>
      <div className="row wrap" style={{ gap: 6 }}>
        {IDEAS.map(i => (
          <button key={i.label} className="pill" style={{ cursor: "pointer" }} onClick={() => { setAsk(i.text); if (i.games) setGames(i.games); }}>{i.label}</button>
        ))}
      </div>
      <textarea className="input" rows={4} value={ask} onChange={e => setAsk(e.target.value)} placeholder="e.g. Study 10 AI slop simulators that hit 1k+ players this week. Focus on the shop UI and the first minute." style={{ minWidth: 0, width: "100%", resize: "vertical" }} />
      <input className="input" value={games} onChange={e => setGames(e.target.value)} placeholder="Games to look at (names or links, optional)" />
      <div className="row wrap" style={{ gap: 8 }}>
        <span className="muted small">Vault</span>
        <select className="input grow" style={{ minWidth: 0 }} value={vault} onChange={e => setVault(e.target.value)}>
          {!options.length && <option value="">Documents/RoSlop Vault (new)</option>}
          {options.map(p => <option key={p} value={p}>{p === main ? `${p} (main)` : p}</option>)}
        </select>
        {window.roslop && <button className="btn sm" onClick={pick}>Other folder</button>}
        {window.roslop && vault && vault !== main && (
          <button className="btn sm" onClick={() => db.saveSettings({ vault_path: vault }).then(() => toast("That's the main vault now."))}>Make main</button>
        )}
      </div>
      <div className="row wrap" style={{ gap: 8 }}>
        <button className="btn pri" disabled={!ask.trim() || busy} onClick={send}><Icon name="lead" size={14} />Send to the crew</button>
        {window.roslop && <button className="btn" disabled={pulling} onClick={pull}>{pulling ? "Pulling games…" : "Pull game data now"}</button>}
      </div>
      <div className="dim small">Game data is real numbers for 1,000+ Roblox games from the charts and searches, sorted into one note per type of game (Tycoon, Tower Defense...) with the games listed inside. It runs by itself before vault work once a day, takes a couple of minutes and uses none of your Claude usage.</div>
    </div>
  );
}
