import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { assetKind, groupOf, previewOf, withGroup, type AssetKind, type RunnerStatus } from "@roslop/core";
import { messageAgent, remove, uploadAsset } from "../data/actions";
import { db, toast, useData, useGameFilter, useSnap } from "../data/store";
import { Del, Empty, Icon, Seg } from "../ui/bits";
import { openViewer } from "../ui/Viewer";
import { AssetPreview } from "../ui/Preview";
import { VirtualGrid } from "../ui/VirtualGrid";

type Tab = "assets" | "references";
const KINDS: (AssetKind | "all")[] = ["all", "icon", "model", "animation", "sound", "vfx", "ui"];


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
  const [path, setPath] = useState("");
  const [dropOn, setDropOn] = useState<string | null>(null);
  const assets = useGameFilter(s.assets);
  const inTab = assets.filter(a => (tab === "references" ? a.kind === "reference" : a.kind !== "reference"))
    .filter(a => tab === "references" || kind === "all" || a.kind === kind);
  // Searching looks everywhere; otherwise you see what's in the group you're in.
  const shown = q
    ? inTab.filter(a => a.name.toLowerCase().includes(q.toLowerCase()) || a.roblox_id?.includes(q) || groupOf(a.tags).toLowerCase().includes(q.toLowerCase()))
    : inTab.filter(a => groupOf(a.tags) === path);

  // Groups you made plus any an asset sits in, so nothing gets lost.
  const folders = [...new Set([...s.settings.folders, ...assets.map(a => groupOf(a.tags)).filter(Boolean)].flatMap(f => f.split("/").map((_, i, parts) => parts.slice(0, i + 1).join("/"))))].sort((a, b) => a.localeCompare(b));
  const children = q ? [] : folders.filter(f => f.startsWith(path ? `${path}/` : "") && f.split("/").length === (path ? path.split("/").length + 1 : 1));
  const inside = (f: string) => inTab.filter(a => groupOf(a.tags) === f || groupOf(a.tags).startsWith(`${f}/`)).length;
  const crumbs = path ? path.split("/").map((name, i, parts) => ({ name, path: parts.slice(0, i + 1).join("/") })) : [];

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

  const saveFolders = (list: string[]) => db.saveSettings({ folders: [...new Set(list)].sort() });
  const newGroup = async () => {
    const name = prompt(path ? `New group inside ${path}` : "New group")?.trim().replace(/\//g, "-");
    if (!name) return;
    await saveFolders([...s.settings.folders, path ? `${path}/${name}` : name]);
    toast(`Made ${name}`);
  };
  // Re-tags each asset with its new group. Assets with the same tags go in one request.
  const regroup = async (list: typeof assets, to: (current: string) => string) => {
    const by = new Map<string, { ids: string[]; tags: string[] }>();
    for (const a of list) {
      const tags = withGroup(a.tags, to(groupOf(a.tags)));
      const key = JSON.stringify(tags);
      by.set(key, { ids: [...(by.get(key)?.ids ?? []), a.id], tags });
    }
    for (const { ids, tags } of by.values()) await db.updateMany("assets", ids, { tags });
  };
  const renameGroup = async (f: string) => {
    const name = prompt("Rename group", f.split("/").pop())?.trim().replace(/\//g, "-");
    if (!name) return;
    const to = [...f.split("/").slice(0, -1), name].join("/");
    const move = (g: string) => (g === f ? to : g.startsWith(`${f}/`) ? to + g.slice(f.length) : g);
    await saveFolders(folders.map(move));
    await regroup(assets.filter(a => groupOf(a.tags) === f || groupOf(a.tags).startsWith(`${f}/`)), move);
    if (path === f || path.startsWith(`${f}/`)) setPath(move(path));
  };
  const deleteGroup = async (f: string) => {
    const parent = f.split("/").slice(0, -1).join("/");
    const n = inside(f);
    if (!confirm(`Delete the group ${f}?${n ? ` Its ${n} item${n > 1 ? "s" : ""} move up to ${parent || "the top"}.` : ""}`)) return;
    await regroup(assets.filter(a => groupOf(a.tags) === f || groupOf(a.tags).startsWith(`${f}/`)), () => parent);
    await saveFolders(folders.filter(g => g !== f && !g.startsWith(`${f}/`)));
  };
  const dragIds = (id: string) => (picked.has(id) ? [...picked] : [id]);
  const dropInto = (f: string) => ({
    onDragOver: (e: React.DragEvent) => {
      if (!e.dataTransfer.types.includes("text/roslop-assets")) return;
      e.preventDefault();
      setDropOn(f);
    },
    onDragLeave: () => setDropOn(null),
    onDrop: (e: React.DragEvent) => {
      const raw = e.dataTransfer.getData("text/roslop-assets");
      if (!raw) return;
      e.preventDefault();
      e.stopPropagation();
      setDropOn(null);
      void moveTo(JSON.parse(raw), `group:${f}`);
    },
  });

  const moveTo = async (ids: string[], to: string) => {
    if (!ids.length || !to) return;
    if (to.startsWith("group:")) {
      const target = to.slice(6);
      await regroup(assets.filter(a => ids.includes(a.id)), () => target);
      toast(`Moved ${ids.length.toLocaleString()} to ${target || "the top level"}`);
      clearPick();
      return;
    }
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
        {(["icon", "model", "animation", "sound", "vfx", "ui", "reference"] as AssetKind[]).map(k => (
          <option key={k} value={`kind:${k}`}>{k === "reference" ? "References" : k === "ui" ? "UI" : k === "vfx" ? "VFX" : `${k[0].toUpperCase()}${k.slice(1)}s`}</option>
        ))}
      </optgroup>
      <optgroup label="Group">
        <option value="group:">Top level</option>
        {folders.map(f => <option key={f} value={`group:${f}`}>{f.split("/").map((_, i) => (i ? "  " : "")).join("")}{f.replace(/\//g, " / ")}</option>)}
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
        await uploadAsset(f, tab === "references" ? "reference" : kind !== "all" ? kind : assetKind(f.name, f.type), game === "all" ? null : game, withGroup([], path));
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
      onDragOver={e => e.dataTransfer.types.includes("Files") && e.preventDefault()}
      onDrop={e => {
        if (!e.dataTransfer.files.length) return;
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
        <div className="grow"><b>Drop files anywhere on this page.</b> <span className="muted">Double-click anything to look closer.</span>{tab === "assets" && kind !== "all" && <> They go in <b>{kind === "ui" ? "UI" : kind === "vfx" ? "VFX" : `${kind}s`}</b>.</>} <span className="muted">Images, .fbx, .obj, .rbxm, sounds. Librarian puts them on Roblox and adds the asset id, then the crew can use them.</span></div>
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
      <div className="row wrap" style={{ gap: 6, marginBottom: 12 }}>
        <button className={`pill ${dropOn === "" ? "on" : ""}`} style={{ height: 28, padding: "0 12px" }} onClick={() => setPath("")} {...dropInto("")}><Icon name="library" size={12} />{tab === "references" ? "References" : "Assets"}</button>
        {crumbs.map(c => (
          <span key={c.path} className="row" style={{ gap: 6 }}>
            <Icon name="right" size={12} style={{ color: "var(--dim)" }} />
            <button className={`pill ${c.path === path ? "on" : ""} ${dropOn === c.path ? "on" : ""}`} style={{ height: 28, padding: "0 12px" }} onClick={() => setPath(c.path)} {...dropInto(c.path)}>{c.name}</button>
          </span>
        ))}
        <div className="grow" />
        {!q && <button className="btn sm" onClick={newGroup}><Icon name="plus" size={13} />New group{path ? " here" : ""}</button>}
        {q && <span className="muted small">Searching every group</span>}
      </div>
      {children.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10, marginBottom: 14 }}>
          {children.map(f => (
            <div key={f} className={`card flat has-del row ${dropOn === f ? "picked" : ""}`} style={{ padding: "12px 14px", gap: 10, cursor: "pointer", borderColor: dropOn === f ? "var(--accent)" : undefined }} onClick={() => setPath(f)} onDoubleClick={e => { e.stopPropagation(); renameGroup(f); }} {...dropInto(f)} title="Click to open, double-click to rename, drop items here to move them in">
              <Del title="Delete group" onDelete={() => deleteGroup(f)} />
              <Icon name="library" size={18} style={{ color: "var(--accent-text)" }} />
              <div className="grow" style={{ minWidth: 0 }}><b className="trunc" style={{ display: "block" }}>{f.split("/").pop()}</b><span className="muted small">{inside(f).toLocaleString()} item{inside(f) === 1 ? "" : "s"}</span></div>
            </div>
          ))}
        </div>
      )}
      {!shown.length ? <Empty>{path ? "Nothing in this group yet. Drag items onto it, or use Move to." : "Nothing here yet."}</Empty> : (
        <VirtualGrid items={shown} keyOf={a => a.id} extra={54} render={a => (
            <div
              key={a.id}
              className={`card flat has-del pickable ${picked.has(a.id) ? "picked" : ""} ${picked.size ? "picking" : ""}`}
              style={{ padding: 10, cursor: "pointer", userSelect: "none", height: "100%", overflow: "hidden" }}
              onClick={e => pick(a.id, e.shiftKey)}
              draggable
              onDragStart={e => e.dataTransfer.setData("text/roslop-assets", JSON.stringify(dragIds(a.id)))}
              onDoubleClick={() => {
                // Pictures and rendered previews; models and sounds play on their card instead.
                const pic = (x: typeof a) => previewOf(x.tags) || (/\.(png|jpe?g|webp|gif|bmp)(\?|$)|^data:image|^https?:\/\/tr\.rbxcdn/i.test(x.file_url ?? "") ? x.file_url : "");
                const list = shown.filter(x => pic(x));
                if (pic(a)) openViewer(list.map(x => ({ src: pic(x)!, title: x.name })), list.indexOf(a));
              }}
            >
              <span className="check"><Icon name="check" size={11} /></span>
              <Del onDelete={() => remove("assets", a).then(() => toast(`Deleted ${a.name}`))} />
              <AssetPreview a={a} />
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
          )} />
      )}
    </div>
  );
}
