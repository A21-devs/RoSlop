import { useRef, useState } from "react";
import type { AssetKind } from "@roslop/core";
import { messageAgent, remove, uploadAsset } from "../data/actions";
import { toast, useData, useGameFilter, useSnap } from "../data/store";
import { Del, Empty, Icon, Media, Seg } from "../ui/bits";

type Tab = "assets" | "references";
const KINDS: (AssetKind | "all")[] = ["all", "icon", "model", "sound", "vfx", "ui"];

// Uploads on the All tab go wherever the file name points.
function guessKind(f: File): AssetKind {
  const n = f.name.toLowerCase();
  if (/\.(fbx|obj|rbxm|rbxmx|glb|gltf|blend|dae|stl)$/.test(n)) return "model";
  if (/^audio\//.test(f.type) || /\.(mp3|ogg|wav|flac|m4a)$/.test(n) || /(^|[^a-z])(sfx|sound|music|audio)([^a-z]|$)/.test(n)) return "sound";
  if (/vfx|fx[_\- .]|particle|effect|flipbook|spritesheet|explosion|smoke|fire|flame|spark|trail|beam|aura|glow|slash|impact|magic|lightning|shockwave/.test(n)) return "vfx";
  if (/(^|[^a-z])(ui|gui|hud)([^a-z]|$)|button|btn|frame|menu|panel|window|popup|shop|bar|slot|inventory|screen|layout|tab|card|badge|banner|title/.test(n)) return "ui";
  if (/model|mesh|prop|rig|character/.test(n)) return "model";
  return "icon";
}

export function Library() {
  const s = useSnap();
  const { game } = useData();
  const [tab, setTab] = useState<Tab>("assets");
  const [kind, setKind] = useState<AssetKind | "all">("all");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const assets = useGameFilter(s.assets);
  const shown = assets.filter(a => (tab === "references" ? a.kind === "reference" : a.kind !== "reference"))
    .filter(a => tab === "references" || kind === "all" || a.kind === kind)
    .filter(a => !q || a.name.toLowerCase().includes(q.toLowerCase()) || a.roblox_id?.includes(q));

  const add = async (files: FileList | null) => {
    if (!files) return;
    const list = [...files];
    setBusy(n => n + list.length);
    for (const f of list) {
      try {
        await uploadAsset(f, tab === "references" ? "reference" : kind !== "all" ? kind : guessKind(f), game === "all" ? null : game);
      } finally {
        setBusy(n => n - 1);
      }
    }
    if (tab === "assets") {
      const names = list.map(f => f.name).join(", ");
      await messageAgent(s, "librarian", `Put ${list.length === 1 ? list[0].name : `${list.length} uploads`} on Roblox`, `I just added these to the library: ${names}. Upload them to Roblox with Open Cloud and print an ASSET line with the library name and asset id for each one, so the Library marks them as uploaded.`, game === "all" ? null : game);
    }
  };

  return (
    <div
      className="content"
      onDragOver={e => e.preventDefault()}
      onDrop={e => {
        e.preventDefault();
        add(e.dataTransfer.files);
      }}
    >
      <div className="head">
        <div className="grow"><h1 className="page">Library</h1><p className="lede">{tab === "assets" ? "Everything you own and can reuse. Every new task checks here first, so the agents don't make a fourth coin icon." : "Stuff you like the look of. Screenshots, clips, other games. Agents look here when you say \"like this\"."}</p></div>
        <button className="btn pri" onClick={() => input.current?.click()}><Icon name="upload" size={14} />Upload</button>
        <input ref={input} type="file" multiple hidden onChange={e => add(e.target.files)} />
      </div>
      <div className="row wrap" style={{ marginBottom: 14, gap: 10 }}>
        <Seg value={tab} onChange={setTab} options={[["assets", <>Assets <span className="mono">{assets.filter(a => a.kind !== "reference").length}</span></>], ["references", <>References <span className="mono">{assets.filter(a => a.kind === "reference").length}</span></>]]} />
        {tab === "assets" && <Seg value={kind} onChange={setKind} options={KINDS.map(k => [k, k === "all" ? "All" : k === "vfx" ? "VFX" : k === "ui" ? "UI" : `${k[0].toUpperCase()}${k.slice(1)}s`])} />}
        <div className="grow" />
        <input className="input" style={{ width: 240 }} placeholder="Search names or asset ids" value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <div className="card flat pad row" style={{ borderStyle: "dashed", marginBottom: 16, gap: 14 }}>
        <Icon name="upload" size={20} style={{ color: "var(--accent-text)" }} />
        <div className="grow"><b>Drop files anywhere on this page.</b>{tab === "assets" && kind !== "all" && <> They go in <b>{kind === "ui" ? "UI" : kind === "vfx" ? "VFX" : `${kind}s`}</b>.</>} <span className="muted">Images, .fbx, .obj, .rbxm, sounds. Librarian puts them on Roblox and adds the asset id, then the crew can use them.</span></div>
        {busy > 0 && <span className="row muted small"><span className="dot pulse" />{busy} uploading</span>}
      </div>
      {!shown.length ? <Empty>Nothing here yet.</Empty> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
          {shown.map(a => (
            <div key={a.id} className="card flat has-del" style={{ padding: 10 }}>
              <Del onDelete={() => remove("assets", a).then(() => toast(`Deleted ${a.name}`))} />
              {a.file_url ? <Media src={a.file_url} style={{ aspectRatio: "1", background: "var(--raise)" }} /> : <div style={{ aspectRatio: "1", background: "var(--raise)", borderRadius: 8 }} />}
              <div className="row" style={{ marginTop: 8 }}><b className="grow trunc">{a.name}</b><span className="pill" style={{ height: 18, fontSize: 10 }}>{a.kind}</span></div>
              <div className={`mono ${a.roblox_id ? "dim" : "warn"}`} style={{ marginTop: 3 }}>{a.kind === "reference" ? "reference" : a.roblox_id ? `rbx ${a.roblox_id}` : "not on Roblox yet"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
