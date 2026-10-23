import { ago } from "@roslop/core";
import { messageAgent } from "../data/actions";
import { useSnap } from "../data/store";
import { Empty, Icon } from "../ui/bits";

const short = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 100000 ? 0 : 1)}k` : String(n));

export function Market() {
  const s = useSnap();
  const snaps = [...s.market_snapshots].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const now = snaps[0];
  const before = snaps[1];
  const pulling = s.tasks.some(t => t.agent === "pulse" && t.title === "Pull the charts" && ["queued", "working"].includes(t.status));

  const rows = (now?.items ?? []).map(i => {
    const old = before?.items.find(o => o.name === i.name);
    const change = old && old.playing ? (i.playing - old.playing) / old.playing : null;
    return { ...i, change };
  }).sort((a, b) => (b.change ?? -1) - (a.change ?? -1));

  const pull = () => messageAgent(s, "pulse", "Pull the charts", "Pull the charts: what's rising, top played and new this week. No pitches this time, just the market block.", null);
  const pitch = (name: string) => messageAgent(s, "pulse", `Pitch something off ${name}`, `${name} is climbing. Is there a game in this for us? Pitch it if there is, say no if there isn't.`, null);

  return (
    <div className="content">
      <div className="head">
        <div className="grow"><h1 className="page">Market</h1><p className="lede">What's climbing on Roblox. Pulse pulls the Roblox charts, plus RoWatcher if you've added a key.</p></div>
        <span className="muted small">{now ? `Pulled ${ago(now.created_at)} ago` : "Never pulled"}</span>
        <button className="btn" disabled={pulling} onClick={pull}>{pulling ? "Pulse is on it" : "Pull the charts"}</button>
      </div>
      {!now ? <Empty>No chart data yet. Hit "Pull the charts" and Pulse grabs it. It's a light job, about 1% of a window.</Empty> : (
        <div className="card" style={{ overflow: "hidden" }}>
          <div className="row mono dim" style={{ padding: "9px 16px", gap: 14, background: "var(--raise)" }}>
            <span style={{ width: 18 }}>#</span><span className="grow">GAME</span><span style={{ width: 80, textAlign: "right" }}>PLAYING</span><span className="hide-m" style={{ width: 60, textAlign: "right" }}>LIKES</span><span style={{ width: 70, textAlign: "right" }}>7 DAYS</span><span className="hide-m" style={{ width: 90 }} />
          </div>
          <div className="list">
            {rows.map((r, i) => (
              <div key={r.name} className="row" style={{ padding: "10px 16px", gap: 14 }}>
                <span className="mono dim" style={{ width: 18 }}>{i + 1}</span>
                <div className="grow"><div style={{ fontWeight: 500 }} className="trunc">{r.name}</div><div className="muted small">{r.genre}</div></div>
                <span className="mono" style={{ width: 80, textAlign: "right" }}>{short(r.playing)}</span>
                <span className="mono dim hide-m" style={{ width: 60, textAlign: "right" }}>{r.likes !== null ? `${r.likes}%` : ""}</span>
                <span className="mono" style={{ width: 70, textAlign: "right", color: r.change === null ? "var(--dim)" : r.change < 0 ? "var(--bad)" : "var(--ok)" }}>
                  {r.change === null ? "new" : `${r.change > 0 ? "+" : ""}${Math.round(r.change * 100)}%`}
                </span>
                <button className="btn sm ghost hide-m" style={{ width: 90 }} onClick={() => pitch(r.name)}><Icon name="pitches" size={13} />Pitch it</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
