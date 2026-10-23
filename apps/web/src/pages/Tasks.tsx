import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AGENT, ago, pct, type Task, type TaskStatus } from "@roslop/core";
import { answer, bump, drop, pause, resume } from "../data/actions";
import { useGameFilter, useSnap } from "../data/store";
import { Av, Icon, Seg } from "../ui/bits";

type Filter = "all" | "working" | "queued" | "you" | "done";

const GROUPS: { key: Filter; title: string; note: string; statuses: TaskStatus[]; dot: string }[] = [
  { key: "working", title: "Working now", note: "Click one to see what it's doing", statuses: ["working"], dot: "pulse" },
  { key: "you", title: "Back to you", note: "Waiting on your call", statuses: ["needs_you"], dot: "warn" },
  { key: "queued", title: "Queued", note: "Starts when the agent is free and there's room in your usage", statuses: ["queued", "held", "paused"], dot: "off" },
  { key: "done", title: "Done and dropped", note: "", statuses: ["done", "dropped", "failed"], dot: "off" },
];

function Status({ t, s }: { t: Task; s: ReturnType<typeof useSnap> }) {
  if (t.status === "working") return <span className="pill ok"><span className="dot pulse" />Working</span>;
  if (t.status === "needs_you") return <span className="pill warn">Back to you</span>;
  if (t.status === "paused") return <span className="pill">Paused</span>;
  if (t.status === "held") return <span className="pill info" title="Waiting for room in your usage window">Held for usage</span>;
  if (t.status === "queued") {
    const parent = t.parent_id && s.tasks.find(p => p.id === t.parent_id && p.status !== "done");
    return <span className="pill">{parent ? `after ${AGENT[parent.agent].name}` : "Queued"}</span>;
  }
  if (t.status === "failed") return <span className="pill bad">Failed</span>;
  return <span className="pill">{t.status === "done" ? "Done" : "Dropped"}</span>;
}

function Detail({ t }: { t: Task }) {
  const s = useSnap();
  const events = s.task_events.filter(e => e.task_id === t.id);
  const proofs = s.proofs.filter(p => p.task_id === t.id);
  return (
    <div className="grid2" style={{ padding: "4px 16px 16px 50px" }}>
      <div>
        {t.ask && t.status === "needs_you" && (
          <div className="card flat pad" style={{ marginBottom: 12, background: "var(--raise)" }}>
            <div style={{ marginBottom: 10, whiteSpace: "pre-wrap" }}>{t.ask.question}</div>
            <div className="row wrap">{t.ask.options.map((o, i) => <button key={o} className={`btn sm ${i ? "" : "pri"}`} onClick={() => answer(t, o)}>{o}</button>)}</div>
          </div>
        )}
        {events.map(e => (
          <div key={e.id} className="row" style={{ alignItems: "flex-start", gap: 12, padding: "5px 0" }}>
            <span className="mono dim" style={{ width: 40, flex: "none" }}>{new Date(e.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            <span className={e.kind === "error" ? "bad" : "muted"}>{e.text}</span>
          </div>
        ))}
        {t.result && <div style={{ marginTop: 8 }}><span className="mono dim">RESULT </span>{t.result}</div>}
        {!events.length && !t.result && <div className="muted small">{t.brief || "No brief."}</div>}
        <div className="row wrap" style={{ marginTop: 12, gap: 6 }}>
          {(t.status === "working" || t.status === "queued") && <button className="btn sm" onClick={() => pause(t)}><Icon name="pause" size={14} />Pause</button>}
          {t.status === "paused" && <button className="btn sm pri" onClick={() => resume(t)}>Resume</button>}
          {(t.status === "queued" || t.status === "held") && t.priority !== "high" && <button className="btn sm" onClick={() => bump(t, "high")}>Do this sooner</button>}
          {!["done", "dropped"].includes(t.status) && <button className="btn sm ghost danger" onClick={() => drop(t)}>Drop it</button>}
          <span className="mono dim" style={{ marginLeft: "auto" }}>{t.used ? `used ${pct(t.used)} of a window` : `about ${pct(t.estimate)} of a window`}</span>
        </div>
      </div>
      <div className="col">
        {proofs.map(p => <a key={p.id} href={`#/review/${p.id}`} className="pill">{p.title}</a>)}
        <div className="muted small" style={{ whiteSpace: "pre-wrap" }}>{t.brief}</div>
      </div>
    </div>
  );
}

export function Tasks() {
  const s = useSnap();
  const [params, setParams] = useSearchParams();
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const open = params.get("open");
  const tasks = useGameFilter(s.tasks).filter(t => !q || t.title.toLowerCase().includes(q.toLowerCase()));
  const count = (st: TaskStatus[]) => tasks.filter(t => st.includes(t.status)).length;

  return (
    <div className="content">
      <div className="head">
        <div className="grow"><h1 className="page">Tasks</h1><p className="lede">Everything the crew is doing, waiting to do, or has handed back to you.</p></div>
      </div>
      <div className="row wrap" style={{ marginBottom: 16, gap: 10 }}>
        <Seg value={filter} onChange={setFilter} options={[
          ["all", <>All <span className="mono">{tasks.length}</span></>],
          ["working", <>Working <span className="mono">{count(["working"])}</span></>],
          ["queued", <>Queued <span className="mono">{count(["queued", "held", "paused"])}</span></>],
          ["you", <>Back to you <span className="mono">{count(["needs_you"])}</span></>],
          ["done", <>Done <span className="mono">{count(["done", "dropped", "failed"])}</span></>],
        ]} />
        <div className="grow" />
        <input className="input" style={{ width: 220 }} placeholder="Find a task" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      {GROUPS.filter(g => filter === "all" ? g.key !== "done" : g.key === filter).map(g => {
        const rows = tasks.filter(t => g.statuses.includes(t.status)).sort((a, b) => b.created_at.localeCompare(a.created_at));
        if (!rows.length && filter === "all") return null;
        return (
          <div key={g.key} className="card" style={{ overflow: "hidden", marginBottom: 14 }}>
            <div className="row" style={{ padding: "10px 16px", background: "var(--raise)" }}>
              <span className={`dot ${g.dot}`} /><b>{g.title}</b><span className="mono dim">{rows.length}</span>
              <span className="muted small hide-m" style={{ marginLeft: 6 }}>{g.note}</span>
            </div>
            <div className="list">
              {rows.map(t => (
                <div key={t.id} style={{ background: open === t.id ? "var(--raise)" : "" }}>
                  <button className="row" style={{ padding: "11px 16px", gap: 12, width: "100%", textAlign: "left" }} onClick={() => setParams(open === t.id ? {} : { open: t.id })}>
                    <Av who={t.agent} />
                    <div className="grow">
                      <div className="trunc" style={{ fontWeight: 500 }}>{t.title}</div>
                      <div className="muted small trunc">{AGENT[t.agent].name} · from {t.requested_by === "you" ? "you" : AGENT[t.requested_by].name}{t.game_id ? ` · ${s.games.find(x => x.id === t.game_id)?.name ?? ""}` : ""}</div>
                    </div>
                    <span className="mono dim hide-m">{ago(t.started_at ?? t.created_at)}</span>
                    <Status t={t} s={s} />
                    <Icon name={open === t.id ? "down" : "right"} style={{ color: "var(--dim)" }} />
                  </button>
                  {open === t.id && <Detail t={t} />}
                </div>
              ))}
              {!rows.length && <div className="muted small" style={{ padding: 16 }}>Nothing here.</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
