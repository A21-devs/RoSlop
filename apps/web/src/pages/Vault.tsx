import { useEffect, useRef, useState } from "react";
import { AGENTS, withGroup } from "@roslop/core";
import { buildVault, importRefs, uploadAsset } from "../data/actions";
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
      {path && window.roslop && <VaultPictures root={path} />}
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

type Pic = { path: string; area: string; name: string; size: number; modified: string };
const thumbs = new Map<string, Promise<string | null>>();

function Thumb({ root, file }: { root: string; file: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let alive = true;
    // Only make previews for pictures that scroll into view.
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      if (!thumbs.has(file)) thumbs.set(file, window.roslop!.vaultThumb(root, file));
      void thumbs.get(file)!.then(v => alive && setSrc(v));
    }, { rootMargin: "300px" });
    io.observe(el);
    return () => {
      alive = false;
      io.disconnect();
    };
  }, [file]);
  return <div ref={box} className="media" style={{ aspectRatio: "1", background: "var(--raise)" }}>{src && <img src={src} alt="" style={{ objectFit: "cover" }} />}</div>;
}

// Pictures already in the vault: pick some and they go to the Library's References.
function VaultPictures({ root }: { root: string }) {
  const s = useSnap();
  const [pics, setPics] = useState<Pic[] | null>(null);
  const [area, setArea] = useState("All");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [anchor, setAnchor] = useState<string | null>(null);
  const [group, setGroup] = useState("");
  const [busy, setBusy] = useState<{ done: number; of: number } | null>(null);
  const [show, setShow] = useState(60);
  const load = () => window.roslop!.vaultImages(root).then(setPics, () => setPics([]));
  useEffect(() => {
    void load();
  }, [root]);
  if (!pics) return <div className="card pad muted" style={{ marginBottom: 16 }}>Looking for pictures in your vault…</div>;
  if (!pics.length) return null;
  const areas = ["All", ...new Set(pics.map(p => p.area))];
  const list = area === "All" ? pics : pics.filter(p => p.area === area);
  const inLibrary = new Set(s.assets.filter(a => a.kind === "reference").map(a => a.name));
  const pick = (p: Pic, range: boolean) => {
    setPicked(prev => {
      const next = new Set(prev);
      if (range && anchor) {
        const a = list.findIndex(x => x.path === anchor), b = list.findIndex(x => x.path === p.path);
        if (a >= 0 && b >= 0) for (const x of list.slice(Math.min(a, b), Math.max(a, b) + 1)) next.add(x.path);
      } else if (next.has(p.path)) next.delete(p.path);
      else next.add(p.path);
      return next;
    });
    setAnchor(p.path);
  };
  const send = async () => {
    const chosen = pics.filter(p => picked.has(p.path));
    setBusy({ done: 0, of: chosen.length });
    let ok = 0;
    for (const p of chosen) {
      try {
        const bytes = await window.roslop!.vaultFile(root, p.path);
        if (!bytes) continue;
        const ext = p.path.slice(p.path.lastIndexOf(".") + 1).toLowerCase();
        const file = new File([new Uint8Array(bytes)], `${p.name}.${ext}`, { type: `image/${ext === "jpg" ? "jpeg" : ext}` });
        await uploadAsset(file, "reference", null, withGroup([], group.trim() || `Vault/${p.area}`));
        ok++;
      } catch (e) {
        toast(e instanceof Error ? e.message : String(e), true);
      }
      setBusy(b => (b ? { ...b, done: b.done + 1 } : b));
    }
    setBusy(null);
    setPicked(new Set());
    toast(`Added ${ok} to Library references${group.trim() ? ` in ${group.trim()}` : ""}`);
  };
  return (
    <div className="card pad col" style={{ marginBottom: 16, gap: 12 }}>
      <div className="row wrap" style={{ gap: 10 }}>
        <div className="grow"><b style={{ fontSize: 14 }}>Pictures in your vault</b><div className="muted small">Pick any and send them to the Library's References, so every agent sees them with its tasks. Shift-click picks a run.</div></div>
        <button className="btn sm ghost" onClick={() => void load()}>Refresh</button>
      </div>
      <div className="row wrap" style={{ gap: 8 }}>
        <div className="seg">{areas.map(a => <button key={a} className={area === a ? "on" : ""} onClick={() => { setArea(a); setShow(60); }}>{a} <span className="mono dim">{a === "All" ? pics.length : pics.filter(p => p.area === a).length}</span></button>)}</div>
        <span className="grow" />
        {picked.size > 0 && (
          <>
            <button className="btn sm ghost" onClick={() => setPicked(new Set())}>Clear</button>
            <input className="input" style={{ width: 200, minHeight: 28 }} placeholder="Library group (Vault/<area>)" value={group} onChange={e => setGroup(e.target.value)} />
            <button className="btn pri sm" disabled={!!busy} onClick={send}>{busy ? `Sending ${busy.done} of ${busy.of}…` : `Send ${picked.size} to References`}</button>
          </>
        )}
        {!picked.size && <button className="btn sm" onClick={() => setPicked(new Set(list.filter(p => !inLibrary.has(p.name)).map(p => p.path)))}>Pick all new</button>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10 }}>
        {list.slice(0, show).map(p => (
          <div key={p.path} className={`card flat ${picked.has(p.path) ? "picked" : ""}`} style={{ padding: 6, cursor: "pointer", borderColor: picked.has(p.path) ? "var(--accent)" : undefined, position: "relative" }} onClick={e => pick(p, e.shiftKey)} title={p.path}>
            <Thumb root={root} file={p.path} />
            <div className="small trunc" style={{ marginTop: 4 }}>{p.name}</div>
            <div className="dim" style={{ fontSize: 10.5 }}>{p.area}{inLibrary.has(p.name) ? " · in Library" : ""}</div>
            {picked.has(p.path) && <span className="pill ok" style={{ position: "absolute", top: 10, left: 10, height: 18 }}><Icon name="check" size={10} /></span>}
          </div>
        ))}
      </div>
      {list.length > show && <button className="btn sm" style={{ alignSelf: "center" }} onClick={() => setShow(n => n + 120)}>Show more ({list.length - show} left)</button>}
    </div>
  );
}
