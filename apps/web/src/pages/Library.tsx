import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { assetKind, type AssetKind, type RunnerStatus } from "@roslop/core";
import { messageAgent, remove, uploadAsset } from "../data/actions";
import { db, toast, useData, useGameFilter, useSnap } from "../data/store";
import { Del, Empty, Icon, Media, Seg } from "../ui/bits";

type Tab = "assets" | "references";
const KINDS: (AssetKind | "all")[] = ["all", "icon", "model", "sound", "vfx", "ui"];


// Already on Roblox some other way? Paste the id or the link.
async function setId(a: { id: string; name: string; roblox_id: string | null }) {
  const text = prompt(`Roblox asset id or link for ${a.name}`, a.roblox_id ?? "");
  if (text === null) return;
  const id = text.match(/\d{5,}/)?.[0] ?? null;
  if (text.trim() && !id) return toast("That doesn't look like an asset id or link.", true);
  await db.update("assets", a.id, { roblox_id: id });
  toast(id ? `${a.name} marked as on Roblox` : `Cleared the id on ${a.name}`);
}

function useUploads() {
  const [state, setState] = useState<RunnerStatus["uploads"]>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!window.roslop) return;
    let alive = true;
    const poll = async () => {
      const [st, key, creator] = await Promise.all([window.roslop!.status(), window.roslop!.getKey("roblox_open_cloud"), window.roslop!.getKey("roblox_creator")]);
      if (!alive) return;
      setState(st.uploads);
      setReady(!!key && !!creator);
    };
    void poll();
    const t = setInterval(poll, 5000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);
  return { state, ready };
}

export function Library() {
  const s = useSnap();
  const { game } = useData();
  const [tab, setTab] = useState<Tab>("assets");
  const [kind, setKind] = useState<AssetKind | "all">("all");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const up = useUploads();
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [anchor, setAnchor] = useState<string | null>(null);
  const assets = useGameFilter(s.assets);
  const shown = assets.filter(a => (tab === "references" ? a.kind === "reference" : a.kind !== "reference"))
    .filter(a => tab === "references" || kind === "all" || a.kind === kind)
    .filter(a => !q || a.name.toLowerCase().includes(q.toLowerCase()) || a.roblox_id?.includes(q));

  // Click to pick, shift-click to pick everything between that and the last one.
  const pick = (id: string, range: boolean) => {
    setPicked(prev => {
      const next = new Set(prev);
      if (range && anchor) {
        const a = shown.findIndex(x => x.id === anchor);
        const b = shown.findIndex(x => x.id === id);
        if (a >= 0 && b >= 0) {
          for (const x of shown.slice(Math.min(a, b), Math.max(a, b) + 1)) next.add(x.id);
          return next;
        }
      }
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setAnchor(id);
  };
  const clearPick = () => {
    setPicked(new Set());
    setAnchor(null);
  };
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && clearPick();
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  }, []);
  useEffect(clearPick, [tab, kind]);

  const moveTo = async (ids: string[], to: string) => {
    if (!ids.length || !to) return;
    const [field, value] = to.split(":");
    const patch = field === "kind" ? { kind: value as AssetKind } : { game_id: value === "none" ? null : value };
    await db.updateMany("assets", ids, patch);
    const where = field === "kind" ? (value === "reference" ? "References" : value === "ui" ? "UI" : value === "vfx" ? "VFX" : `${value}s`) : value === "none" ? "no game" : s.games.find(g => g.id === value)?.name;
    toast(`Moved ${ids.length.toLocaleString()} to ${where}`);
    clearPick();
  };
  const deleteMany = async (ids: string[]) => {
    if (!ids.length || !confirm(`Delete ${ids.length.toLocaleString()} item${ids.length > 1 ? "s" : ""}? Copies on Roblox stay.`)) return;
    await db.removeMany("assets", ids);
    toast(`Deleted ${ids.length.toLocaleString()}`);
    clearPick();
  };
  const moveOptions = (
    <>
      <optgroup label="Tab">
        {(["icon", "model", "sound", "vfx", "ui", "reference"] as AssetKind[]).map(k => (
          <option key={k} value={`kind:${k}`}>{k === "reference" ? "References" : k === "ui" ? "UI" : k === "vfx" ? "VFX" : `${k[0].toUpperCase()}${k.slice(1)}s`}</option>
        ))}
      </optgroup>
      {s.games.length > 0 && (
        <optgroup label="Game">
          <option value="game:none">No game</option>
          {s.games.map(g => <option key={g.id} value={`game:${g.id}`}>{g.name}</option>)}
        </optgroup>
      )}
    </>
  );

  const add = async (files: FileList | null) => {
    if (!files) return;
    const list = [...files];
    setBusy(n => n + list.length);
    for (const f of list) {
      try {
        await uploadAsset(f, tab === "references" ? "reference" : kind !== "all" ? kind : assetKind(f.name, f.type), game === "all" ? null : game);
      } finally {
        setBusy(n => n - 1);
      }
    }
    // With a key on this computer RoSlop uploads them itself; otherwise the Librarian does it.
    if (tab === "assets" && !up.ready) {
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
        <select className="input" style={{ width: 170 }} value="" disabled={!shown.length} onChange={e => moveTo(shown.map(a => a.id), e.target.value)}>
          <option value="">Move all {shown.length.toLocaleString()} to…</option>
          {moveOptions}
        </select>
        <input className="input" style={{ width: 240 }} placeholder="Search names or asset ids" value={q} onChange={e => setQ(e.target.value)} />
      </div>
      {picked.size > 0 && (
        <div className="card row wrap" style={{ position: "sticky", top: 8, zIndex: 5, padding: "8px 12px", marginBottom: 12, gap: 8, borderColor: "var(--accent)" }}>
          <b>{picked.size.toLocaleString()} selected</b>
          <button className="btn sm ghost" onClick={() => setPicked(new Set(shown.map(a => a.id)))}>Select all {shown.length.toLocaleString()}</button>
          <div className="grow" />
          <select className="input" style={{ width: 150, minHeight: 28 }} value="" onChange={e => moveTo([...picked], e.target.value)}>
            <option value="">Move to…</option>
            {moveOptions}
          </select>
          <button className="btn sm danger" onClick={() => deleteMany([...picked])}>Delete</button>
          <button className="btn sm ghost" onClick={clearPick}>Clear</button>
        </div>
      )}
      <div className="card flat pad row" style={{ borderStyle: "dashed", marginBottom: 16, gap: 14 }}>
        <Icon name="upload" size={20} style={{ color: "var(--accent-text)" }} />
        <div className="grow"><b>Drop files anywhere on this page.</b>{tab === "assets" && kind !== "all" && <> They go in <b>{kind === "ui" ? "UI" : kind === "vfx" ? "VFX" : `${kind}s`}</b>.</>} <span className="muted">Images, .fbx, .obj, .rbxm, sounds. Librarian puts them on Roblox and adds the asset id, then the crew can use them.</span></div>
        {busy > 0 && <span className="row muted small"><span className="dot pulse" />{busy} uploading</span>}
      </div>
      {window.roslop && tab === "assets" && (
        <div className={`small ${up.state?.error ? "warn" : "muted"}`} style={{ margin: "-6px 0 14px" }}>
          {!up.ready ? <>RoSlop can put these on Roblox itself, for free and with no limit. Add your Open Cloud key and creator id in <Link to="/settings/keys" className="acc">Settings, Keys</Link>.</>
            : up.state?.error ? up.state.error
            : up.state && up.state.left > 0 ? <><span className="dot pulse" /> Putting {up.state.left.toLocaleString()} on Roblox{up.state.done ? `, ${up.state.done.toLocaleString()} done so far` : ""}.</>
            : "Everything with a file is on Roblox. New uploads go up within a minute."}
        </div>
      )}
      {!shown.length ? <Empty>Nothing here yet.</Empty> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
          {shown.map(a => (
            <div
              key={a.id}
              className={`card flat has-del pickable ${picked.has(a.id) ? "picked" : ""} ${picked.size ? "picking" : ""}`}
              style={{ padding: 10, cursor: "pointer", userSelect: "none" }}
              onClick={e => pick(a.id, e.shiftKey)}
            >
              <span className="check"><Icon name="check" size={11} /></span>
              <Del onDelete={() => remove("assets", a).then(() => toast(`Deleted ${a.name}`))} />
              {a.file_url ? <Media src={a.file_url} style={{ aspectRatio: "1", background: "var(--raise)" }} /> : <div style={{ aspectRatio: "1", background: "var(--raise)", borderRadius: 8 }} />}
              <div className="row" style={{ marginTop: 8 }}><b className="grow trunc">{a.name}</b><span className="pill" style={{ height: 18, fontSize: 10 }}>{a.kind}</span></div>
              {a.kind === "reference" ? <div className="mono dim" style={{ marginTop: 3 }}>reference</div> : (
                <button className={`mono ${a.roblox_id ? "dim" : "warn"}`} style={{ marginTop: 3, textAlign: "left" }} title="Set the Roblox asset id by hand" onClick={e => {
                  e.stopPropagation();
                  setId(a);
                }}>
                  {a.roblox_id ? `rbx ${a.roblox_id}` : "not on Roblox yet"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
