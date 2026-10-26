import { useState } from "react";
import { Link } from "react-router-dom";
import { AGENT, ago, pct, projected, type Task } from "@roslop/core";
import { answer, askLead, reject } from "../data/actions";
import { useData, useGameFilter, useSnap, useUsage } from "../data/store";
import { GameBoard, StudioPanel } from "../ui/Board";
import { openViewer } from "../ui/Viewer";
import { Av, Icon, Media, Spark, agentName } from "../ui/bits";

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? "Late night" : h < 12 ? "Morning" : h < 18 ? "Afternoon" : "Evening";
}

function AskCard({ t }: { t: Task }) {
  const s = useSnap();
  const game = s.games.find(g => g.id === t.game_id);
  return (
    <div className="card pad">
      <div className="row" style={{ marginBottom: 6 }}>
        <Av who={t.agent} size="sm" />
        <span style={{ fontWeight: 500 }}>{agentName(t.agent)}</span>
        {game && <span className="muted">· {game.name}</span>}
        <span className="dim mono" style={{ marginLeft: "auto" }}>{ago(t.created_at)}</span>
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{t.title}</div>
      <div className="muted" style={{ marginBottom: 12, whiteSpace: "pre-wrap" }}>{t.ask?.question}</div>
      <div className="row wrap" style={{ gap: 6 }}>
        {(t.ask?.options ?? []).map((o, i) => (
          <button key={o} className={`btn sm ${i === 0 ? "pri" : ""}`} onClick={() => answer(t, o)}>{o}</button>
        ))}
        <button className="btn sm danger" onClick={() => reject(t)}>Reject</button>
        <Link className="btn sm ghost" to={`/tasks?open=${t.id}`}>Details</Link>
      </div>
    </div>
  );
}

export function Home() {
  const s = useSnap();
  const { user, game } = useData();
  const u = useUsage();
  const [text, setText] = useState("");
  const tasks = useGameFilter(s.tasks);
  const asks = tasks.filter(t => t.status === "needs_you");
  const proofs = useGameFilter(s.proofs).filter(p => p.verdict === "waiting");
  const working = tasks.filter(t => t.status === "working");
  const queued = tasks.filter(t => t.status === "queued" || t.status === "held").length;
  const name = user?.email.split("@")[0] ?? "";
  const needs = asks.length + proofs.length;

  const send = () => {
    askLead(s, text, game === "all" ? null : game);
    setText("");
  };

  return (
    <div className="content">
      <div className="head">
        <div className="grow">
          <div className="mono dim" style={{ marginBottom: 6 }}>{new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }).toUpperCase()}</div>
          <h1 className="page">{greeting()}, {name}.</h1>
          <p className="lede">
            {needs ? `${needs} ${needs === 1 ? "thing is" : "things are"} waiting on you.` : "Nothing's waiting on you."}{" "}
            {working.length ? `${working.length} working, ${queued} lined up behind them. ` : ""}
            {pct(u.used)} of this usage window is gone, on track to end near {pct(projected(u.used, u.elapsed))}.
          </p>
        </div>
      </div>

      <div className="card pad" style={{ marginBottom: 24, borderColor: "var(--line-2)" }}>
        <div className="row" style={{ alignItems: "flex-start", gap: 12 }}>
          <span className="av lg" style={{ "--c": "#3d7eff" } as React.CSSProperties}><Icon name="lead" size={15} /></span>
          <textarea
            className="grow"
            rows={2}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
            placeholder={`Tell the Lead what you want. "Make the first 5 minutes less boring" works fine.`}
            style={{ background: "none", border: 0, outline: 0, resize: "none", fontSize: 14 }}
          />
        </div>
        <div className="row" style={{ marginTop: 8, paddingLeft: 42 }}>
          <Link to="/coach" className="pill"><Icon name="coach" size={12} />Help me write it</Link>
          <div className="grow" />
          <span className="dim small hide-m">Enter to send</span>
          <button className="btn sm pri" disabled={!text.trim()} onClick={send}>Send to Lead <Icon name="up" size={14} /></button>
        </div>
      </div>

      <div className="grid2">
        <section>
          <div className="sec-h"><h3>Needs you</h3><span className="c">{needs}</span></div>
          <div className="col" style={{ gap: 10 }}>
            {asks.map(t => <AskCard key={t.id} t={t} />)}
            {proofs.slice(0, 3).map(p => (
              <Link key={p.id} to={`/review/${p.id}`} className="card pad row" style={{ gap: 14, alignItems: "flex-start" }}>
                <div className="grow">
                  <div className="row" style={{ marginBottom: 6 }}><Av who={p.agent} size="sm" /><span style={{ fontWeight: 500 }}>{agentName(p.agent)}</span><span className="muted">· wants your eyes</span></div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{p.title}</div>
                  <div className="muted small">{p.note}</div>
                </div>
                <Media src={p.url} kind={p.kind} className="hide-m" style={{ width: 150, flex: "none" }} onOpen={() => openViewer(proofs.map(x => ({ src: x.url, kind: x.kind, title: x.title })), proofs.indexOf(p))} />
              </Link>
            ))}
            {!needs && <div className="empty">All clear. The crew will ping you here when they need a call.</div>}
          </div>
        </section>

        <section className="col" style={{ gap: 22 }}>
          <div>
            <div className="sec-h"><h3>Working now</h3><span className="c">{working.length}</span><span className="r">{queued} queued</span></div>
            <div className="card list">
              {working.map(t => (
                <Link key={t.id} to={`/tasks?open=${t.id}`} style={{ display: "block", padding: "10px 14px" }}>
                  <div className="row"><Av who={t.agent} size="sm" /><span className="grow trunc" style={{ fontWeight: 500 }}>{t.title}</span><span className="mono dim">{ago(t.started_at)}</span></div>
                  <div className="bar" style={{ margin: "8px 0 0 26px" }}><i style={{ width: `${Math.min(95, (t.used / Math.max(t.estimate, 0.001)) * 100)}%` }} /></div>
                </Link>
              ))}
              {!working.length && <div className="muted small" style={{ padding: 14 }}>Nobody's working right now.</div>}
            </div>
          </div>
          <div>
            <div className="sec-h"><h3>Where each game is</h3><Link className="r" to="/games">All</Link></div>
            <GameBoard />
          </div>
          <div>
            <div className="sec-h"><h3>Studio</h3></div>
            <div className="card pad"><StudioPanel /></div>
          </div>
        </section>
      </div>
    </div>
  );
}
