import { useRef, useState } from "react";
import { AGENTS } from "@roslop/core";
import { buildVault, importRefs } from "../data/actions";
import { db, toast, useSnap } from "../data/store";
import { Icon } from "../ui/bits";
import { VaultAsk } from "../ui/VaultAsk";

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
  const building = s.tasks.some(t => (t.title === "Start the vault" || t.title.startsWith("Vault: ")) && !["done", "dropped", "failed"].includes(t.status));

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
        <div className="col" style={{ gap: 16, minWidth: 0 }}>
        <AddRefs />
        <VaultAsk />
        <div className="card pad col">
          <b style={{ fontSize: 14 }}>Grow it with the crew</b>
          <div className="muted">Starting from nothing, or yours is thin? The Lead splits it into tasks and the crew writes real notes into the folder: a page per game, design rules from what you approved or sent back, web references with screenshots, and what's working on the charts.</div>
          <button className="btn pri" disabled={building} onClick={() => buildVault(s).then(() => toast(path ? "Sent to the Lead. Notes land in your vault as each task finishes." : "Sent to the Lead. No folder picked, so it starts one in Documents/RoSlop Vault."))}><Icon name="lead" size={14} />{building ? "The crew is on it" : "Start building the vault"}</button>
          <div className="dim small">{path ? "Notes show up in the folder as each task finishes." : "No folder yet? It starts one in Documents/RoSlop Vault."}</div>
        </div>
        </div>
      </div>
    </div>
  );
}

const AREAS = ["Building", "Modeling", "VFX", "UI", "Animation", "SFX"];

// Paste links or drop pictures and they land in References/<area>, linked from the topic's note.
function AddRefs() {
  const s = useSnap();
  const [area, setArea] = useState("Building");
  const [topic, setTopic] = useState("");
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const links = text.split(/\s+/).map(t => t.trim()).filter(t => /^https?:\/\//.test(t));
  const running = s.tasks.filter(t => t.title.startsWith("Vault import:") && ["queued", "working", "held"].includes(t.status)).length;
  const go = async () => {
    setBusy(true);
    try {
      await importRefs(s, { area, topic, links, files });
      toast(`Pulling them into References/${area}${topic.trim() ? `/${topic.trim()}` : ""}`);
      setText("");
      setFiles([]);
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), true);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="card pad col" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); setFiles(f => [...f, ...Array.from(e.dataTransfer.files)]); }}>
      <b style={{ fontSize: 14 }}>Add to references</b>
      <div className="muted small">Paste links (pictures, X posts, YouTube, TikTok or Medal clips, DevForum or ArtStation pages) or drop pictures here. Your computer pulls the images straight into the vault, video frames included, and the crew uses them as the look to match. No AI usage.</div>
      <div className="row wrap" style={{ gap: 8 }}>
        <select className="input" style={{ width: 140 }} value={area} onChange={e => setArea(e.target.value)}>{AREAS.map(a => <option key={a}>{a}</option>)}</select>
        <input className="input grow" placeholder="Topic, like Stylized lobby or Pet designs (optional)" value={topic} onChange={e => setTopic(e.target.value)} />
      </div>
      <textarea className="textarea" style={{ minHeight: 70 }} placeholder="Links, one per line" value={text} onChange={e => setText(e.target.value)} />
      <div className="row wrap" style={{ gap: 8 }}>
        <button className="btn sm" onClick={() => input.current?.click()}><Icon name="upload" size={13} />Pictures</button>
        <input ref={input} type="file" accept="image/*,video/*" multiple hidden onChange={e => setFiles(f => [...f, ...Array.from(e.target.files ?? [])])} />
        {files.map((f, i) => <span key={i} className="pill">{f.name}<button style={{ marginLeft: 4 }} onClick={() => setFiles(list => list.filter((_, j) => j !== i))}><Icon name="x" size={10} /></button></span>)}
        <span className="grow" />
        {running > 0 && <span className="muted small"><span className="dot pulse" /> {running} importing</span>}
        <button className="btn pri sm" disabled={busy || (!links.length && !files.length)} onClick={go}>{busy ? "Sending…" : `Add${links.length + files.length ? ` ${links.length + files.length}` : ""}`}</button>
      </div>
    </div>
  );
}
