import { useState } from "react";
import { ago, type Pitch } from "@roslop/core";
import { decidePitch, pitchIdea, remove } from "../data/actions";
import { useSnap } from "../data/store";
import { Av, Del, Empty, Icon, Seg } from "../ui/bits";

type Show = "waiting" | "approved" | "other";

const fmt = (n?: number | null) => (n === undefined || n === null ? "–" : n >= 1e9 ? `${(n / 1e9).toFixed(1)}B` : n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="row" style={{ alignItems: "flex-start", gap: 20, padding: "10px 0", borderTop: "1px solid var(--line)" }}>
      <span className="muted" style={{ width: 170, flex: "none" }}>{label}</span>
      <span style={{ lineHeight: 1.55 }}>{children}</span>
    </div>
  );
}

function Detail({ p }: { p: Pitch }) {
  const s = useSnap();
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(true);
  const d = p.details ?? {};
  const buy = d.kind === "acquire";
  const t = d.target;
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div className="row" style={{ padding: "22px 24px", gap: 18, alignItems: "flex-start", background: buy ? "linear-gradient(120deg, color-mix(in srgb, #c45cff 14%, var(--panel)), var(--panel) 60%)" : "linear-gradient(120deg, color-mix(in srgb, var(--ok) 12%, var(--panel)), var(--panel) 60%)", borderBottom: "1px solid var(--line)" }}>
        <span className="av lg" style={{ "--c": buy ? "#c45cff" : "#2ec27e", width: 56, height: 56, borderRadius: 14 } as React.CSSProperties}><Icon name={buy ? "market" : "pitches"} size={24} /></span>
        <div className="grow" style={{ minWidth: 0 }}>
          <div className="row wrap" style={{ gap: 6, marginBottom: 8 }}>
            <span className="pill" style={{ background: buy ? "color-mix(in srgb, #c45cff 22%, transparent)" : "color-mix(in srgb, var(--ok) 20%, transparent)" }}>{buy ? "Acquisition" : "Build"}</span>
            {d.window && <span className="pill warn">{d.window}</span>}
            {(d.tags ?? []).map(x => <span key={x} className="pill">{x}</span>)}
            <span className="pill acc" style={{ marginLeft: "auto" }}>{p.score}/10</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>{p.title}</div>
          <div className="muted" style={{ marginTop: 6, fontSize: 14.5 }}>{p.summary}</div>
          <div className="row small dim" style={{ marginTop: 8, gap: 6 }}><Av who="pulse" size="sm" />{p.source === "you" ? "Your idea, checked by Pulse" : "Pulse"} · {ago(p.created_at)} ago</div>
        </div>
      </div>

      <div className="col" style={{ padding: "18px 24px", gap: 16 }}>
        {buy && t && (
          <div className="card flat pad row wrap" style={{ background: "var(--raise)", gap: 18 }}>
            <div className="grow"><div className="mono dim">THE GAME</div><b style={{ fontSize: 15 }}>{t.name}</b>{t.creator && <div className="muted small">by {t.creator}</div>}</div>
            {[["Playing", fmt(t.playing)], ["Visits", fmt(t.visits)], ["Likes", t.likes != null ? `${Math.round(t.likes)}%` : "–"], ["Age", t.age_days != null ? `${t.age_days} days` : "–"]].map(([l, v]) => <div key={l}><div className="mono dim">{l}</div><b>{v}</b></div>)}
            {t.place_id && <a className="btn sm" href={`https://www.roblox.com/games/${t.place_id}`} target="_blank" rel="noreferrer"><Icon name="ext" size={13} />Open on Roblox</a>}
          </div>
        )}

        {buy && !!d.deals?.length && (
          <div className="card pad" style={{ borderColor: "color-mix(in srgb, #c45cff 40%, var(--line))" }}>
            <div className="mono" style={{ color: "#c45cff", marginBottom: 10 }}>THE DEAL</div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(d.deals.length, 2)}, minmax(0, 1fr))`, gap: 12 }}>
              {d.deals.map((x, i) => (
                <div key={i} className="card flat pad" style={{ background: "var(--raise)" }}>
                  <div className="muted small">{x.type === "stake" ? "Stake" : "Full buyout"}</div>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{x.type === "stake" ? `${x.percent ?? "?"}%` : "100%"}</div>
                  <div style={{ fontWeight: 600, margin: "4px 0" }}>{x.price}</div>
                  <div className="muted small" style={{ lineHeight: 1.5 }}>{x.terms}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!buy && d.different && (
          <div className="card pad" style={{ background: "linear-gradient(120deg, color-mix(in srgb, var(--accent) 10%, var(--panel)), var(--panel))" }}>
            <div className="mono" style={{ color: "var(--accent-text)", marginBottom: 6 }}>HOW WE'RE DIFFERENT</div>
            <div style={{ fontSize: 15, lineHeight: 1.6 }}>{d.different}</div>
            {!!d.vs?.length && <div className="row wrap" style={{ gap: 6, marginTop: 10 }}>{d.vs.map(v => <span key={v} className="pill">{v}</span>)}</div>}
          </div>
        )}

        {!!p.stats.length && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
            {p.stats.map(st => <div key={st.label} className="card flat kpi"><div className="mono dim">{st.label.toUpperCase()}</div><div className="v" style={{ fontSize: 24 }}>{st.value}</div>{st.sub && <div className="muted small">{st.sub}</div>}</div>)}
          </div>
        )}

        {d.proof && <div className="row" style={{ gap: 8, alignItems: "flex-start" }}><span style={{ color: "var(--ok)", fontWeight: 700 }}>$</span><span>{d.proof}</span></div>}
        {p.why && <div className="muted" style={{ lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{p.why}</div>}
        {d.chosen && <div className="muted" style={{ lineHeight: 1.6 }}>{d.chosen}</div>}

        {buy && (d.valuation || d.upside || d.outreach) && (
          <div>
            {d.valuation && <Row label="What it's worth">{d.valuation}</Row>}
            {d.upside && <Row label="What we'd change">{d.upside}</Row>}
            {d.outreach && <Row label="Reaching the owner"><span style={{ whiteSpace: "pre-wrap" }}>{d.outreach}</span></Row>}
          </div>
        )}

        {(!!p.beats.length || p.money || p.clip) && (
          <div>
            <button className="row" style={{ gap: 8, fontWeight: 600, fontSize: 15, marginBottom: 4 }} onClick={() => setOpen(!open)}><Icon name={open ? "down" : "right"} size={14} />{buy ? "The game today" : "The game"}</button>
            {open && (
              <div style={{ paddingLeft: 22 }}>
                {p.beats.map(b => <Row key={b.at + b.text} label={b.at}>{b.text}</Row>)}
                {p.money && <Row label="How it makes money">{p.money}</Row>}
                {p.clip && <Row label="The clip moment">{p.clip}</Row>}
              </div>
            )}
          </div>
        )}

        {!!p.reuses.length && <div className="row wrap" style={{ gap: 6 }}><span className="muted" style={{ width: 170 }}>Reuses</span>{p.reuses.map(r => <span key={r} className="pill"><Icon name="library" size={11} />{r}</span>)}</div>}
        {!!p.risks.length && <div><b>What could go wrong</b><ul className="muted" style={{ paddingLeft: 18, marginTop: 6, lineHeight: 1.6 }}>{p.risks.map(r => <li key={r}>{r}</li>)}</ul></div>}
      </div>

      {p.status === "waiting" && (
        <div className="col" style={{ padding: "14px 24px", borderTop: "1px solid var(--line)", background: "var(--raise)" }}>
          <input className="input" value={note} onChange={e => setNote(e.target.value)} placeholder="Note, if you want changes" />
          <div className="row wrap">
            <button className="btn pri" onClick={() => decidePitch(s, p, "approved")}><Icon name="check" size={14} />{buy ? "Go after it" : "Approve"}</button>
            <button className="btn" disabled={!note.trim()} onClick={() => decidePitch(s, p, "changes", note)}>Ask for changes</button>
            <div className="grow" />
            <button className="btn ghost" onClick={() => decidePitch(s, p, "declined")}>Not for us</button>
          </div>
          <div className="dim small">{buy ? "Going after it has the Producer find the creator and draft the first message. Nothing gets sent without you." : "Approving starts a new game and the Architect writes the plan."}</div>
        </div>
      )}
    </div>
  );
}

export function Pitches() {
  const s = useSnap();
  const [show, setShow] = useState<Show>("waiting");
  const [kind, setKind] = useState<"all" | "build" | "acquire">("all");
  const [pick, setPick] = useState<string | null>(null);
  const [idea, setIdea] = useState("");
  const [ideaOpen, setIdeaOpen] = useState(false);
  const list = s.pitches
    .filter(p => (show === "other" ? p.status === "declined" || p.status === "changes" : p.status === show))
    .filter(p => kind === "all" || (p.details?.kind ?? "build") === kind)
    .sort((a, b) => b.score - a.score);
  const p = list.find(x => x.id === pick) ?? list[0];

  return (
    <div className="content">
      <div className="head">
        <div className="grow"><h1 className="page">Pitches</h1><p className="lede">Games worth building, and games worth buying into. Pitch any game from the Market as our own take, a stake or a buyout. Nothing happens until you say so.</p></div>
        <button className="btn pri" onClick={() => setIdeaOpen(v => !v)}><Icon name="plus" size={14} />I have an idea</button>
      </div>
      {ideaOpen && (
        <div className="card pad col" style={{ marginBottom: 18, maxWidth: 640 }}>
          <textarea className="textarea" value={idea} onChange={e => setIdea(e.target.value)} placeholder="A tycoon where you run a dino museum and trade fossils with friends" />
          <div className="row"><button className="btn pri" disabled={!idea.trim()} onClick={async () => { await pitchIdea(s, idea); setIdea(""); setIdeaOpen(false); }}>Have Pulse check it</button><span className="muted small">Pulse looks at the charts and writes it up honestly.</span></div>
        </div>
      )}
      <div className="row wrap" style={{ marginBottom: 14, gap: 10 }}>
        <Seg value={show} onChange={setShow} options={[["waiting", <>Needs your call <span className="mono">{s.pitches.filter(x => x.status === "waiting").length}</span></>], ["approved", "Approved"], ["other", "Passed or reworking"]]} />
        <Seg value={kind} onChange={setKind} options={[["all", "All"], ["build", "Build"], ["acquire", "Buy"]]} />
      </div>
      {!p ? <Empty>No pitches here yet. Hit Pitch on any game in the Market, or Pulse pitches when something's worth it.</Empty> : (
        <div className="grid2" style={{ gridTemplateColumns: "270px minmax(0, 1fr)" }}>
          <div className="col">
            {list.map(x => (
              <div key={x.id} className="has-del"><Del onDelete={() => remove("pitches", x)} /><button className="card pad row" style={{ width: "100%", textAlign: "left", alignItems: "flex-start", gap: 10, borderColor: x.id === p.id ? "var(--accent)" : "" }} onClick={() => setPick(x.id)}>
                <span className="pill acc">{x.score}/10</span>
                <div style={{ minWidth: 0, paddingRight: 18 }}>
                  <div style={{ fontWeight: 500, lineHeight: 1.3 }}>{x.title}</div>
                  <div className="muted small">{x.details?.kind === "acquire" ? "Buy" : "Build"} · {x.source === "you" ? "your idea" : "Pulse"} · {ago(x.created_at)}</div>
                </div>
              </button></div>
            ))}
          </div>
          <Detail key={p.id} p={p} />
        </div>
      )}
    </div>
  );
}
