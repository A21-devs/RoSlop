import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AGENT, AGENTS, ago, MODELS, type AgentId } from "@roslop/core";
import { messageAgent } from "../data/actions";
import { useData, useSnap } from "../data/store";
import { Av, Icon } from "../ui/bits";

export function Team() {
  const s = useSnap();
  const { game } = useData();
  const { agent = "lead" } = useParams();
  const id = (agent in AGENT ? agent : "lead") as AgentId;
  const a = AGENT[id];
  const [text, setText] = useState("");

  const mine = s.tasks.filter(t => t.agent === id).sort((x, y) => y.created_at.localeCompare(x.created_at));
  const current = mine.find(t => t.status === "working") ?? mine.find(t => t.status === "queued") ?? mine[0];
  const events = current ? s.task_events.filter(e => e.task_id === current.id).slice(-12) : [];
  const queued = mine.filter(t => t.status === "queued" || t.status === "held").length;

  const statusOf = (k: AgentId) => {
    const w = s.tasks.find(t => t.agent === k && t.status === "working");
    if (w) return { text: w.title, pill: "working" };
    const q = s.tasks.filter(t => t.agent === k && (t.status === "queued" || t.status === "held")).length;
    return q ? { text: `${q} waiting`, pill: "queued" } : { text: AGENT[k].job, pill: "" };
  };

  const send = () => {
    messageAgent(s, id, text.split("\n")[0], text, game === "all" ? null : game);
    setText("");
  };

  return (
    <div className="content flush split" style={{ display: "grid", gridTemplateColumns: "300px 1fr", height: "100%" }}>
      <div style={{ borderRight: "1px solid var(--line)", padding: "16px 10px", overflowY: "auto" }}>
        <div className="row" style={{ padding: "0 8px 10px" }}><b style={{ fontSize: 15 }}>Team</b><span className="muted small" style={{ marginLeft: "auto" }}>{AGENTS.length} agents</span></div>
        {AGENTS.map(x => {
          const st = statusOf(x.id);
          return (
            <Link key={x.id} to={`/team/${x.id}`} className="row" style={{ gap: 10, padding: "7px 8px", borderRadius: 8, background: x.id === id ? "var(--raise)" : "" }}>
              <Av who={x.id} />
              <div className="grow"><div style={{ fontWeight: 500 }}>{x.name}</div><div className="muted trunc" style={{ fontSize: 11.5 }}>{st.text}</div></div>
              {st.pill && <span className={`pill ${st.pill === "working" ? "ok" : ""}`} style={{ height: 18 }}>{st.pill}</span>}
            </Link>
          );
        })}
      </div>

      <div style={{ overflowY: "auto", padding: "20px 24px" }}>
        <div className="row" style={{ gap: 12, marginBottom: 18 }}>
          <Av who={id} size="lg" />
          <div className="grow">
            <div style={{ fontSize: 15, fontWeight: 600 }}>{a.name}</div>
            <div className="muted small">{a.job} Runs on {MODELS[s.settings.provider][a.tier] ?? "the default model"}. {queued ? `${queued} queued.` : ""}</div>
          </div>
        </div>

        <div className="grid2">
          <div className="card" style={{ padding: "18px 20px" }}>
            {current ? (
              <>
                <div className="row muted small" style={{ marginBottom: 6 }}>
                  <Av who={current.requested_by} size="sm" />
                  {current.requested_by === "you" ? "You asked for this" : `${AGENT[current.requested_by as AgentId].name} wrote this brief`} {ago(current.created_at)} ago
                </div>
                <div style={{ fontSize: 17, fontWeight: 600, margin: "6px 0 10px" }}>{current.title}</div>
                <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{current.brief || <span className="muted">No brief yet.</span>}</div>
                {current.result && <div className="card flat pad" style={{ marginTop: 14, background: "var(--raise)" }}><div className="mono dim">WHAT CAME BACK</div>{current.result}</div>}
              </>
            ) : (
              <div className="muted">Nothing for {a.name} yet.</div>
            )}
          </div>
          <div className="col" style={{ gap: 12 }}>
            <div className="sec-h" style={{ margin: 0 }}><h3>Activity</h3></div>
            <div className="card list" style={{ padding: "0 14px" }}>
              {events.map(e => (
                <div key={e.id} className="row" style={{ padding: "7px 0", alignItems: "flex-start" }}>
                  <span className="mono dim" style={{ width: 40, flex: "none" }}>{new Date(e.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  <span className={e.kind === "error" ? "bad small" : "small"}>{e.text}</span>
                </div>
              ))}
              {!events.length && <div className="muted small" style={{ padding: "12px 0" }}>Quiet.</div>}
            </div>
            <div className="card row" style={{ padding: 6 }}>
              <input className="grow" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && text.trim() && send()} placeholder={`Give ${a.name} a job directly`} style={{ background: "none", border: 0, outline: 0, padding: "0 8px" }} />
              <button className="btn sm pri" disabled={!text.trim()} onClick={send}><Icon name="up" size={14} /></button>
            </div>
            <div className="dim small">Going straight to an agent skips the Lead. Fine for small stuff.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
