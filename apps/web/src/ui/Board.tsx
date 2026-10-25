import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AGENT, ago, STAGES, type Game, type RunnerStatus, type Settings, type Task } from "@roslop/core";
import { messageAgent } from "../data/actions";
import { db, toast, useSnap } from "../data/store";
import { Icon, Seg } from "./bits";

const NOW: Record<string, string> = {
  pitched: "Now: the Architect turns the pitch into a plan",
  designed: "Now: the Librarian gets the assets ready",
  assets: "Now: the Builder builds it, with Frame and Scenic",
  built: "Now: Balance tunes the numbers",
  balanced: "Now: Splash makes the art and thumbnails",
  art: "Now: the Producer checks it's ready to publish",
  ready: "Ready: waiting on you to publish",
  live: "Live: fixes and live ops",
  graded: "Graded: Liveops plans what's next",
};

const agentList = (tasks: Task[]) => {
  const counts = new Map<string, number>();
  for (const t of tasks) counts.set(AGENT[t.agent]?.name ?? t.agent, (counts.get(AGENT[t.agent]?.name ?? t.agent) ?? 0) + 1);
  return [...counts].map(([n, c]) => (c > 1 ? `${n} ×${c}` : n)).join(", ");
};

// Studio on the desktop, the game page on Roblox anywhere else.
export async function playGame(g: Game) {
  if (window.roslop) {
    try {
      toast(await window.roslop.openStudio(g));
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), true);
    }
  } else if (g.place_id) {
    window.open(`https://www.roblox.com/games/${g.place_id}`, "_blank");
  } else {
    toast("Open this on the computer that runs the crew, or add the universe id so it can open on Roblox.", true);
  }
}

export function GameBoard() {
  const s = useSnap();
  if (!s.games.length) return <Link to="/games" className="card pad muted small" style={{ display: "block" }}>Add your first game</Link>;
  return (
    <div className="col" style={{ gap: 12 }}>
      {s.games.map(g => {
        const at = STAGES.findIndex(x => x.id === g.stage);
        const live = g.stage === "live" || g.stage === "graded";
        const working = s.tasks.filter(t => t.game_id === g.id && t.status === "working");
        const playing = s.game_stats.filter(x => x.game_id === g.id).at(-1)?.playing;
        return (
          <div key={g.id} className="col" style={{ gap: 8 }}>
            <Link to={`/games?g=${g.id}`} className="card pad col" style={{ gap: 8 }}>
              <div className="row"><b className="grow" style={{ fontSize: 15 }}>{g.name}</b><span className="pill acc">{g.version} {live ? "published" : "saved"}</span></div>
              <div className="row" style={{ gap: 5 }}>
                {STAGES.map((st, i) => <span key={st.id} title={st.name} style={{ width: 9, height: 9, borderRadius: 99, background: i <= at ? "var(--ok)" : "var(--line-2)" }} />)}
                <span className="muted small" style={{ marginLeft: 6 }}>{STAGES[at]?.name}</span>
                {playing !== undefined && <span className="mono dim small" style={{ marginLeft: "auto" }}>{playing.toLocaleString()} playing</span>}
              </div>
              <div className="small">{NOW[g.stage] ?? ""}</div>
              {working.length > 0 && <div className="dim small">working on it: {agentList(working)}</div>}
            </Link>
            <div className="row" style={{ gap: 8 }}>
              <button className="btn play grow" onClick={() => playGame(g)}><Icon name="right" size={14} />Play the newest build</button>
              <button className="btn" title="Playtest plays it in the background and reports back" onClick={() => messageAgent(s, "playtest", `Playtest ${g.name}`, `Play the newest build of ${g.name} start to finish like a new player. Record where you get stuck, what breaks and what's boring, with screenshots.`, g.id).then(() => toast("Playtest is on it"))}>Playtest</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function useRunner() {
  const [st, setSt] = useState<RunnerStatus | null>(null);
  useEffect(() => {
    if (!window.roslop) return;
    let alive = true;
    const poll = () => window.roslop!.status().then(x => alive && setSt(x), () => {});
    poll();
    const t = setInterval(poll, 5000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);
  return st;
}

export function saveStudio(s: Settings, patch: Partial<Settings["studio"]>) {
  return db.saveSettings({ studio: { ...s.studio, ...patch } });
}

export function StudioPanel() {
  const s = useSnap();
  const st = useRunner();
  const lanes = s.settings.studio.lanes;
  const limit = s.settings.studio.limit;
  const value = limit === null ? "all" : String(limit);
  const inStudio = s.tasks.filter(t => t.status === "working" && t.needs_studio);
  const held = st?.lanes ?? [];
  return (
    <div className="col" style={{ gap: 10 }}>
      <div className="row wrap" style={{ gap: 10 }}>
        <span className="muted">Studios for agents</span>
        <Seg value={value} onChange={v => saveStudio(s.settings, { limit: v === "all" ? null : Number(v) })} options={[["0", "Off"], ["1", "1"], ["2", "2"], ["all", "All"]]} />
        <Link to="/settings/studios" className="r small acc">Name them</Link>
      </div>
      {held.length > 0
        ? held.map(h => (
            <div key={h.lane + h.task} className="row small warn" style={{ gap: 6 }}>
              <Icon name="key" size={13} />{AGENT[h.agent as Task["agent"]]?.name ?? h.agent} · {h.lane}{lanes.find(l => l.name === h.lane)?.type ? ` · ${lanes.find(l => l.name === h.lane)!.type}` : ""} · {ago(h.since)} ago
            </div>
          ))
        : inStudio.map(t => (
            <div key={t.id} className="row small warn" style={{ gap: 6 }}><Icon name="key" size={13} />{AGENT[t.agent]?.name} · in Studio · {ago(t.started_at)} ago</div>
          ))}
      {!held.length && !inStudio.length && <div className="muted small">{limit === 0 ? "Agents won't open Studio until you turn it back on." : `All quiet. ${lanes.length} Studio${lanes.length === 1 ? "" : "s"} free.`}</div>}
    </div>
  );
}
