import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AGENT } from "@roslop/core";
import { askLead } from "../data/actions";
import { useData, useGameFilter, useSnap } from "../data/store";
import { Av, Icon } from "../ui/bits";

export function Lead() {
  const s = useSnap();
  const { game } = useData();
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const messages = useGameFilter(s.messages);
  const worker = s.machines.find(m => m.role === "worker");
  const online = worker && Date.now() - Date.parse(worker.last_seen) < 3 * 60000;

  useEffect(() => end.current?.scrollIntoView({ block: "end" }), [messages.length]);

  const send = () => {
    askLead(s, text, game === "all" ? null : game);
    setText("");
  };

  return (
    <div className="content" style={{ display: "flex", flexDirection: "column", maxWidth: 860, margin: "0 auto", width: "100%" }}>
      <div className="chat grow">
        {!messages.length && (
          <div className="empty" style={{ marginTop: 40 }}>
            Tell the Lead what you want, big or small. It splits the work and hands each piece to the right agent.
          </div>
        )}
        {messages.map(m => {
          const tasks = s.tasks.filter(t => m.task_ids.includes(t.id) && t.agent !== "lead");
          if (m.author === "you") {
            return (
              <div key={m.id} style={{ alignSelf: "flex-end", maxWidth: "74%" }} className="col">
                <div className="bubble me" style={{ maxWidth: "100%" }}>{m.text}</div>
                <span className="mono dim" style={{ alignSelf: "flex-end" }}>sent to {worker?.name ?? "your worker"}</span>
              </div>
            );
          }
          return (
            <div key={m.id} className="row" style={{ alignItems: "flex-start", gap: 10 }}>
              <Av who={m.author} />
              <div className="bubble them">
                {m.text}
                {!!tasks.length && (
                  <div className="list" style={{ marginTop: 10 }}>
                    {tasks.map(t => (
                      <Link key={t.id} to={`/tasks?open=${t.id}`} className="row" style={{ padding: "7px 0" }}>
                        <Av who={t.agent} size="sm" />
                        <span className="grow small">{t.title}</span>
                        <span className="pill" style={{ height: 18, fontSize: 10 }}>{t.status.replace("_", " ")}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={end} />
      </div>
      <div style={{ position: "sticky", bottom: 0, paddingTop: 12, background: "var(--bg)" }}>
        {!online && <div className="small warn" style={{ marginBottom: 6 }}>{worker ? `${worker.name} looks offline. This waits in the queue until it's back.` : "No computer is set up to run the crew yet. Open the desktop app and sign in."}</div>}
        <div className="card row" style={{ padding: 8, alignItems: "flex-end" }}>
          <textarea
            className="grow"
            rows={2}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
            placeholder={`Message the Lead${game !== "all" ? ` about ${s.games.find(g => g.id === game)?.name}` : ""}`}
            style={{ background: "none", border: 0, outline: 0, resize: "none", padding: 6, fontSize: 14 }}
          />
          <button className="btn pri" disabled={!text.trim()} onClick={send}><Icon name="up" size={15} /></button>
        </div>
        <div className="dim small" style={{ marginTop: 6 }}>{AGENT.lead.job}</div>
      </div>
    </div>
  );
}
