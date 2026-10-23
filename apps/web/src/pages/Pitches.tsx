import { useState } from "react";
import { ago } from "@roslop/core";
import { decidePitch, pitchIdea } from "../data/actions";
import { useSnap } from "../data/store";
import { Av, Empty, Icon, Seg } from "../ui/bits";

type Show = "waiting" | "approved" | "other";

export function Pitches() {
  const s = useSnap();
  const [show, setShow] = useState<Show>("waiting");
  const [pick, setPick] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [idea, setIdea] = useState("");
  const [ideaOpen, setIdeaOpen] = useState(false);
  const list = s.pitches
    .filter(p => (show === "other" ? p.status === "declined" || p.status === "changes" : p.status === show))
    .sort((a, b) => b.score - a.score);
  const p = list.find(x => x.id === pick) ?? list[0];

  return (
    <div className="content">
      <div className="head">
        <div className="grow"><h1 className="page">Pitches</h1><p className="lede">Pulse pitches games from what's growing on Roblox right now, with the reasons. Nothing gets built until you say so.</p></div>
        <button className="btn pri" onClick={() => setIdeaOpen(v => !v)}><Icon name="plus" size={14} />I have an idea</button>
      </div>
      {ideaOpen && (
        <div className="card pad col" style={{ marginBottom: 18, maxWidth: 640 }}>
          <textarea className="textarea" value={idea} onChange={e => setIdea(e.target.value)} placeholder="A tycoon where you run a dino museum and trade fossils with friends" />
          <div className="row"><button className="btn pri" disabled={!idea.trim()} onClick={async () => { await pitchIdea(s, idea); setIdea(""); setIdeaOpen(false); }}>Have Pulse check it</button><span className="muted small">Pulse looks at the charts and writes it up honestly.</span></div>
        </div>
      )}
      <div style={{ marginBottom: 14 }}>
        <Seg value={show} onChange={setShow} options={[["waiting", <>Needs your call <span className="mono">{s.pitches.filter(x => x.status === "waiting").length}</span></>], ["approved", "Approved"], ["other", "Passed or reworking"]]} />
      </div>
      {!p ? <Empty>No pitches here yet. Pulse checks the charts and pitches when something's worth it.</Empty> : (
        <div className="grid2" style={{ gridTemplateColumns: "260px 1fr" }}>
          <div className="col">
            {list.map(x => (
              <button key={x.id} className="card pad row" style={{ textAlign: "left", alignItems: "flex-start", gap: 10, borderColor: x.id === p.id ? "var(--line-2)" : "" }} onClick={() => setPick(x.id)}>
                <span className="pill acc">{x.score}/10</span>
                <div><div style={{ fontWeight: 500, lineHeight: 1.3 }}>{x.title}</div><div className="muted small">{x.source === "you" ? "your idea" : "Pulse"} · {ago(x.created_at)}</div></div>
              </button>
            ))}
          </div>
          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--line)" }}>
              <div className="row" style={{ marginBottom: 8 }}><Av who="pulse" size="sm" /><span className="muted small">Pulse · {ago(p.created_at)} ago</span><span className="pill acc" style={{ marginLeft: "auto" }}>{p.score}/10</span></div>
              <div style={{ fontSize: 21, fontWeight: 600, letterSpacing: "-0.02em" }}>{p.title}</div>
              <div className="muted" style={{ marginTop: 4 }}>{p.summary}</div>
            </div>
            <div style={{ padding: "16px 22px" }} className="col">
              <div className="card flat pad" style={{ background: "var(--raise)" }}><div className="mono dim" style={{ marginBottom: 4 }}>WHY THIS ONE</div>{p.why}</div>
              {!!p.stats.length && (
                <div className="kpis">
                  {p.stats.map(st => <div key={st.label} className="card flat kpi"><div className="mono dim">{st.label.toUpperCase()}</div><div className="v" style={{ fontSize: 20 }}>{st.value}</div>{st.sub && <div className="muted small">{st.sub}</div>}</div>)}
                </div>
              )}
              {!!p.beats.length && <div><b>The game</b>{p.beats.map(b => <div key={b.at} className="row" style={{ alignItems: "flex-start", gap: 16, padding: "8px 0", borderTop: "1px solid var(--line)" }}><span className="muted" style={{ width: 140, flex: "none" }}>{b.at}</span><span>{b.text}</span></div>)}</div>}
              {p.money && <div className="row" style={{ alignItems: "flex-start", gap: 16 }}><span className="muted" style={{ width: 140, flex: "none" }}>How it makes money</span><span>{p.money}</span></div>}
              {p.clip && <div className="row" style={{ alignItems: "flex-start", gap: 16 }}><span className="muted" style={{ width: 140, flex: "none" }}>The clip moment</span><span>{p.clip}</span></div>}
              {!!p.reuses.length && <div className="row wrap"><span className="muted" style={{ width: 140 }}>Reuses</span>{p.reuses.map(r => <span key={r} className="pill"><Icon name="library" size={11} />{r}</span>)}</div>}
              {!!p.risks.length && <div><b>What could go wrong</b><ul className="muted" style={{ paddingLeft: 18, marginTop: 4 }}>{p.risks.map(r => <li key={r}>{r}</li>)}</ul></div>}
            </div>
            {p.status === "waiting" && (
              <div className="col" style={{ padding: "14px 22px", borderTop: "1px solid var(--line)", background: "var(--raise)" }}>
                <input className="input" value={note} onChange={e => setNote(e.target.value)} placeholder="Note, if you want changes" />
                <div className="row wrap">
                  <button className="btn pri" onClick={() => decidePitch(s, p, "approved")}><Icon name="check" size={14} />Approve</button>
                  <button className="btn" disabled={!note.trim()} onClick={() => decidePitch(s, p, "changes", note)}>Ask for changes</button>
                  <div className="grow" />
                  <button className="btn ghost" onClick={() => decidePitch(s, p, "declined")}>Not for us</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
