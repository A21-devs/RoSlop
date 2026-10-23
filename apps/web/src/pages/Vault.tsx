import { AGENTS } from "@roslop/core";
import { buildVault } from "../data/actions";
import { db, toast, useSnap } from "../data/store";
import { Icon } from "../ui/bits";

const EXAMPLE = `---
for: [balance, architect]
also: [builder, merchant]
---

# Rolls and rarity

Show the odds. People trust a 1 in 2.5M they can see.
Bad streaks end. After enough misses the next roll gets better.`;

export function Vault() {
  const s = useSnap();
  const path = s.settings.vault_path;
  const building = s.tasks.some(t => t.title === "Start the vault" && !["done", "dropped", "failed"].includes(t.status));

  const pick = async () => {
    const p = await window.roslop?.pickFolder();
    if (!p) return;
    await db.saveSettings({ vault_path: p });
    toast("Vault set. Agents read the notes tagged for them from now on.");
  };

  return (
    <div className="content">
      <div className="head">
        <div className="grow"><h1 className="page">Vault</h1><p className="lede">Your Obsidian vault is what the crew knows about making Roblox games. They read the notes meant for them before they start, and write down what they learn.</p></div>
      </div>
      <div className="grid2">
        <div className="col" style={{ gap: 16 }}>
          <div className="card pad col">
            <div className="sec-h" style={{ margin: 0 }}><h3>The folder</h3></div>
            {path ? (
              <div className="row"><span className="mono grow trunc">{path}</span>
                <button className="btn sm" onClick={() => window.open(`obsidian://open?path=${encodeURIComponent(path)}`)}><Icon name="ext" size={13} />Open in Obsidian</button>
              </div>
            ) : (
              <div className="muted">No vault yet. Point at a folder of Markdown notes, or let the crew start one.</div>
            )}
            {window.roslop
              ? <button className="btn" style={{ alignSelf: "flex-start" }} onClick={pick}>{path ? "Change folder" : "Pick a folder"}</button>
              : <div className="dim small">Set the folder from the desktop app on the computer that runs the crew. The vault stays on that computer.</div>}
          </div>
          <div className="card pad col">
            <div className="sec-h" style={{ margin: 0 }}><h3>How agents find their notes</h3></div>
            <div className="muted">Put a <span className="mono">for:</span> list in each note's frontmatter. An agent only loads notes that name it, which keeps every job small and cheap.</div>
            <pre className="mono" style={{ background: "var(--raise)", padding: 12, borderRadius: 8, whiteSpace: "pre-wrap", fontSize: 11.5 }}>{EXAMPLE}</pre>
            <div className="row wrap" style={{ gap: 4 }}>{AGENTS.map(a => <span key={a.id} className="pill mono">{a.id}</span>)}</div>
          </div>
        </div>
        <div className="card pad col" style={{ alignSelf: "flex-start" }}>
          <b style={{ fontSize: 14 }}>Grow it with the crew</b>
          <div className="muted">Starting from nothing, or yours is thin? The Lead plans a starter vault from your games, what you approved or sent back in Review, and what's working on the charts. You approve every page.</div>
          <button className="btn pri" disabled={building} onClick={() => buildVault(s)}><Icon name="lead" size={14} />{building ? "The crew is on it" : "Start building the vault"}</button>
          <div className="dim small">Runs as low priority, so it never pushes your real work out of the window.</div>
        </div>
      </div>
    </div>
  );
}
