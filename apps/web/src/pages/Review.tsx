import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AGENT, ago, type Verdict } from "@roslop/core";
import { decide } from "../data/actions";
import { useGameFilter, useSnap } from "../data/store";
import { Av, Icon, Media, Seg } from "../ui/bits";

type Show = "waiting" | "approved" | "changes";

export function Review() {
  const s = useSnap();
  const nav = useNavigate();
  const { id } = useParams();
  const [show, setShow] = useState<Show>("waiting");
  const [note, setNote] = useState("");
  const all = useGameFilter(s.proofs).sort((a, b) => b.created_at.localeCompare(a.created_at));
  const list = all.filter(p => (show === "changes" ? p.verdict === "changes" || p.verdict === "rejected" : p.verdict === show));
  const p = all.find(x => x.id === id) ?? list[0];
  const idx = p ? list.indexOf(p) : -1;

  const go = (d: number) => {
    const next = list[idx + d];
    if (next) nav(`/review/${next.id}`);
  };

  const verdict = async (v: Verdict) => {
    if (!p || (v === "changes" && !note.trim())) return;
    const next = list[idx + 1] ?? list[idx - 1];
    await decide(s, p, v, note);
    setNote("");
    nav(next && next.id !== p.id ? `/review/${next.id}` : "/review");
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "TEXTAREA") return;
      if (e.key === "a") verdict("approved");
      if (e.key === "c") document.getElementById("note")?.focus();
      if (e.key === "r") verdict("rejected");
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  });

  return (
    <div className="content flush split" style={{ display: "grid", gridTemplateColumns: "280px 1fr 340px", height: "100%" }}>
      <div className="hide-m" style={{ borderRight: "1px solid var(--line)", overflowY: "auto" }}>
        <div style={{ padding: "14px 14px 10px" }}>
          <Seg value={show} onChange={setShow} options={[["waiting", <>Waiting <span className="mono">{all.filter(x => x.verdict === "waiting").length}</span></>], ["approved", "Approved"], ["changes", "Sent back"]]} />
        </div>
        <div style={{ padding: "0 8px" }}>
          {list.map(x => (
            <Link key={x.id} to={`/review/${x.id}`} className="row" style={{ gap: 10, padding: 8, borderRadius: 8, alignItems: "flex-start", background: x.id === p?.id ? "var(--raise)" : "" }}>
              <Media src={x.url} kind={x.kind} style={{ width: 86, flex: "none", borderRadius: 6 }} />
              <div className="grow">
                <div style={{ fontWeight: 500, fontSize: 12.5, lineHeight: 1.3 }}>{x.title}</div>
                <div className="row" style={{ marginTop: 5, gap: 6 }}><Av who={x.agent} size="sm" /><span className="muted" style={{ fontSize: 11.5 }}>{AGENT[x.agent].name}</span></div>
              </div>
            </Link>
          ))}
          {!list.length && <div className="muted small" style={{ padding: 12 }}>Nothing here.</div>}
        </div>
      </div>

      {p ? (
        <>
          <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
            <div className="row">
              <span className="mono dim">{idx + 1} / {list.length}</span>
              <div className="grow" />
              <button className="btn sm ghost" onClick={() => go(-1)}><Icon name="left" size={14} /></button>
              <button className="btn sm ghost" onClick={() => go(1)}><Icon name="right" size={14} /></button>
            </div>
            <div className="card" style={{ padding: 10, background: "#0a0a09" }}>
              <Media src={p.url} kind={p.kind} style={{ aspectRatio: "auto", minHeight: 240 }} />
            </div>
            <span className="muted small hide-m">A to approve, C to write a note, R to reject, arrows to move.</span>
          </div>
          <div style={{ borderLeft: "1px solid var(--line)", padding: 20, display: "flex", flexDirection: "column", gap: 16, background: "var(--side)" }}>
            <div className="row"><Av who={p.agent} size="lg" /><div><div style={{ fontWeight: 600 }}>{AGENT[p.agent].name}</div><div className="muted small">{s.games.find(g => g.id === p.game_id)?.name ?? "No game"} · {ago(p.created_at)} ago</div></div></div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.3, marginBottom: 8 }}>{p.title}</div>
              <div className="muted" style={{ whiteSpace: "pre-wrap" }}>{p.note}</div>
            </div>
            {p.verdict === "waiting" ? (
              <>
                <label className="field"><span>Note for {AGENT[p.agent].name} (needed to ask for changes)</span>
                  <textarea id="note" className="textarea" value={note} onChange={e => setNote(e.target.value)} placeholder="What would make it right?" />
                </label>
                <div className="col" style={{ marginTop: "auto" }}>
                  <button className="btn lg pri" onClick={() => verdict("approved")}><Icon name="check" />Approve<kbd>A</kbd></button>
                  <button className="btn lg" disabled={!note.trim()} onClick={() => verdict("changes")}><Icon name="msg" />Ask for changes<kbd>C</kbd></button>
                  <button className="btn lg danger" onClick={() => verdict("rejected")}><Icon name="x" />Reject<kbd>R</kbd></button>
                  <div className="dim small">Approve tells {AGENT[p.agent].name} to use it. Changes goes back with your note. Reject is just a no.</div>
                </div>
              </>
            ) : (
              <div className="card flat pad">
                <span className={`pill ${p.verdict === "approved" ? "ok" : "warn"}`}>{p.verdict === "approved" ? "Approved" : p.verdict === "changes" ? "Sent back" : "Rejected"}</span>
                {p.feedback && <div className="muted" style={{ marginTop: 8 }}>{p.feedback}</div>}
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={{ gridColumn: "span 2", padding: 40 }}><div className="empty">Nothing to look at. Screenshots and clips from the crew show up here.</div></div>
      )}
    </div>
  );
}
