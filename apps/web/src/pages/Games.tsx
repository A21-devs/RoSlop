import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ago, STAGES, type Game, type GameInfo, type Stage } from "@roslop/core";
import { addGame, messageAgent, publish } from "../data/actions";
import { db, toast, useSnap } from "../data/store";
import { Av, Empty, Icon } from "../ui/bits";
import { Chart } from "../ui/Chart";
import { playGame } from "../ui/Board";

function AddGame({ done }: { done(id?: string): void }) {
  const [name, setName] = useState("");
  const [universe, setUniverse] = useState("");
  const [folder, setFolder] = useState("");
  const save = async () => {
    const g = await addGame({ name: name.trim(), universe_id: universe ? Number(universe) : null, project_path: folder || null, stage: "built" });
    toast(`Added ${g.name}.`);
    done(g.id);
  };
  return (
    <div className="card pad col" style={{ gap: 12, maxWidth: 520, marginBottom: 20 }}>
      <b>Add a game</b>
      <label className="field"><span>Name</span><input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Dig Up a Dino" /></label>
      <label className="field"><span>Universe id (optional, for live numbers)</span><input className="input" value={universe} onChange={e => setUniverse(e.target.value.replace(/\D/g, ""))} placeholder="Find it in Creator Hub under the experience" /></label>
      <label className="field"><span>Project folder on the worker (optional)</span>
        <div className="row">
          <input className="input" value={folder} onChange={e => setFolder(e.target.value)} placeholder="Where the place file and scripts live" />
          {window.roslop && <button className="btn" onClick={async () => setFolder((await window.roslop!.pickFolder()) ?? folder)}>Pick</button>}
        </div>
      </label>
      <div className="row"><button className="btn pri" disabled={!name.trim()} onClick={save}>Add it</button><button className="btn ghost" onClick={() => done()}>Cancel</button></div>
    </div>
  );
}

function Pipeline({ g }: { g: Game }) {
  const at = STAGES.findIndex(x => x.id === g.stage);
  return (
    <div className="card pad">
      <div className="sec-h"><h3>Where it is</h3><span className="r">Producer checks the proof on every move. Only you publish.</span></div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${STAGES.length}, 1fr)`, gap: 6 }}>
        {STAGES.map((st, i) => (
          <div key={st.id} className="col" style={{ gap: 6, alignItems: "flex-start" }}>
            <div style={{ height: 4, width: "100%", borderRadius: 99, background: i <= at ? "var(--accent)" : "var(--line)" }} />
            <div className="row" style={{ gap: 5 }}>{st.owner && <Av who={st.owner} size="sm" />}<span className="small" style={{ fontWeight: i === at ? 600 : 400, color: i === at ? "var(--text)" : "var(--muted)" }}>{st.name}</span></div>
          </div>
        ))}
      </div>
      {g.stage === "ready" && <button className="btn pri" style={{ marginTop: 14 }} onClick={() => publish(g)}>Publish {g.version}</button>}
    </div>
  );
}

type Tab = "charts" | "money" | "badges" | "servers" | "liveops" | "details";

function useGameInfo(g: Game | undefined) {
  const [info, setInfo] = useState<GameInfo | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    setInfo(null);
    setErr(null);
    if (!g?.universe_id || !window.roslop) return;
    let alive = true;
    const load = () => window.roslop!.gameInfo(g.universe_id!, g.place_id).then(i => alive && setInfo(i), e => alive && setErr(String(e)));
    load();
    const t = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [g?.id, g?.universe_id, g?.place_id]);
  return { info, err };
}

const day = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });

function Panel({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="card pad">
      <div className="sec-h" style={{ marginBottom: 2 }}><h3>{title}</h3></div>
      <div className="muted small" style={{ marginBottom: 10 }}>{sub}</div>
      {children}
    </div>
  );
}

const when = (iso: string) => new Date(iso).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const hourName = (h: number) => new Date(2000, 0, 1, h).toLocaleTimeString(undefined, { hour: "numeric" });

// The reading closest to a moment, for "compared with yesterday" numbers.
function near<T extends { created_at: string }>(rows: T[], t: number): T | undefined {
  let best: T | undefined;
  for (const r of rows) if (!best || Math.abs(Date.parse(r.created_at) - t) < Math.abs(Date.parse(best.created_at) - t)) best = r;
  return best && Math.abs(Date.parse(best.created_at) - t) < 3 * 3600_000 ? best : undefined;
}

function Delta({ now, then, suffix = "" }: { now: number | undefined; then: number | undefined; suffix?: string }) {
  if (now === undefined || then === undefined) return <span className="dim small">no reading a day ago</span>;
  const d = now - then;
  const pct = then ? Math.round((d / then) * 100) : null;
  return <span className="small" style={{ color: d > 0 ? "var(--ok)" : d < 0 ? "var(--bad)" : "var(--dim)" }}>{d > 0 ? "+" : ""}{d.toLocaleString(undefined, { maximumFractionDigits: 1 })}{suffix}{pct !== null && suffix === "" ? ` (${pct > 0 ? "+" : ""}${pct}%)` : ""} vs a day ago</span>;
}

export function Games() {
  const s = useSnap();
  const [params, setParams] = useSearchParams();
  const [adding, setAdding] = useState(false);
  const [tab, setTab] = useState<Tab>("charts");
  const g = s.games.find(x => x.id === params.get("g")) ?? s.games[0];
  const { info, err } = useGameInfo(g);
  const stats = g ? s.game_stats.filter(x => x.game_id === g.id) : [];
  const last = stats.at(-1);
  const today = stats.filter(x => Date.parse(x.created_at) > Date.now() - 864e5);
  const peak = Math.max(0, ...today.map(x => x.playing));
  const likesOf = (x: { up_votes: number; down_votes: number }) => (x.up_votes + x.down_votes ? Math.round((x.up_votes / (x.up_votes + x.down_votes)) * 1000) / 10 : 0);
  const likes = last && last.up_votes + last.down_votes ? likesOf(last) : null;
  const visitsToday = today.length > 1 ? today.at(-1)!.visits - today[0].visits : null;

  // One reading per day for the longer charts.
  const daily = useMemo(() => {
    const by = new Map<string, (typeof stats)[number]>();
    for (const x of stats) by.set(x.created_at.slice(0, 10), x);
    return [...by.values()];
  }, [stats]);
  const recent = stats.slice(-72);
  const empty = g?.universe_id ? "Waiting for more readings. The desktop app records them every few minutes." : "Add the universe id in Details to see live numbers.";

  const tasks = g ? s.tasks.filter(t => t.game_id === g.id) : [];
  // Finished work as markers on the timeline, so a change in players lines up with what shipped.
  const marksFor = (rows: { created_at: string }[]) => {
    if (rows.length < 2) return [];
    const from = Date.parse(rows[0].created_at), to = Date.parse(rows.at(-1)!.created_at);
    return tasks.filter(t => t.status === "done" && t.finished_at && Date.parse(t.finished_at) >= from && Date.parse(t.finished_at) <= to).map(t => {
      const at = Date.parse(t.finished_at!);
      let i = 0;
      rows.forEach((r, k) => { if (Math.abs(Date.parse(r.created_at) - at) < Math.abs(Date.parse(rows[i].created_at) - at)) i = k; });
      return { at: i, label: `${t.title} (done ${when(t.finished_at!)})` };
    });
  };
  const hours = Array.from({ length: 24 }, (_, h) => {
    const at = stats.filter(x => new Date(x.created_at).getHours() === h);
    return at.length ? Math.round(at.reduce((a, x) => a + x.playing, 0) / at.length) : 0;
  });
  const dayAgo = near(stats, Date.now() - 864e5);
  const weekAgo = near(stats, Date.now() - 7 * 864e5);
  const timeline = [
    ...tasks.filter(t => t.status === "done" && t.finished_at).map(t => ({ at: t.finished_at!, who: t.agent, text: t.title, sub: t.result, link: `/tasks?open=${t.id}` })),
    ...(g ? s.proofs.filter(p => p.game_id === g.id && p.decided_at) : []).map(p => ({ at: p.decided_at!, who: p.agent, text: `${p.verdict === "approved" ? "You approved" : p.verdict === "changes" ? "You sent back" : "You rejected"}: ${p.title}`, sub: p.feedback, link: `/review/${p.id}` })),
  ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 25);
  const ask = (agent: Parameters<typeof messageAgent>[1], title: string, brief: string) => messageAgent(s, agent, title, brief, g!.id).then(() => toast(`Sent to ${agent}`));
  const dash = g?.universe_id ? `https://create.roblox.com/dashboard/creations/experiences/${g.universe_id}` : null;

  return (
    <div className="content">
      <div className="head">
        <div className="grow"><h1 className="page">Games</h1><p className="lede">Live numbers straight from Roblox every few minutes while the desktop app is on, plus everything the crew is doing on each game.</p></div>
        <button className="btn" onClick={() => setAdding(true)}>Add a game</button>
      </div>
      {adding && <AddGame done={id => { setAdding(false); if (id) setParams({ g: id }); }} />}
      {!g && !adding && <Empty>No games yet. Add one you already have, or approve a pitch and the crew starts a new one.</Empty>}
      {g && (
        <>
          <div className="row wrap" style={{ marginBottom: 14 }}>
            {s.games.map(x => <button key={x.id} className={`pill ${x.id === g.id ? "on" : ""}`} style={{ height: 28, padding: "0 12px" }} onClick={() => setParams({ g: x.id })}>{x.name}</button>)}
          </div>
          <div className="row wrap" style={{ gap: 8, marginBottom: 16 }}>
            <button className="btn play" onClick={() => playGame(g)}><Icon name="right" size={14} />Open in Studio</button>
            {dash && <a className="btn" href={`${dash}/overview`} target="_blank" rel="noreferrer"><Icon name="ext" size={13} />Creator Dashboard</a>}
            {dash && <a className="btn" href={`${dash}/analytics/overview`} target="_blank" rel="noreferrer"><Icon name="ext" size={13} />Analytics</a>}
            {dash && <a className="btn" href={`${dash}/monetization/passes`} target="_blank" rel="noreferrer"><Icon name="ext" size={13} />Monetization</a>}
            {g.place_id && <a className="btn ghost" href={`https://www.roblox.com/games/${g.place_id}`} target="_blank" rel="noreferrer"><Icon name="ext" size={13} />Roblox page</a>}
          </div>
          <div className="kpis" style={{ marginBottom: 18 }}>
            {[
              ["Playing now", last?.playing.toLocaleString() ?? "–"], ["Peak today", peak ? peak.toLocaleString() : "–"], ["Visits today", visitsToday?.toLocaleString() ?? "–"],
              ["Total visits", last ? last.visits.toLocaleString() : "–"], ["Likes", likes !== null ? `${likes}%` : "–"], ["Favorites", last?.favorites.toLocaleString() ?? "–"],
              ["Servers", info ? `${info.servers.count}${info.servers.count >= 100 ? "+" : ""}` : "–"], ["Passes", info ? info.passes.length : "–"],
            ].map(([l, v]) => (
              <div key={l as string} className="card kpi"><div className="muted small">{l}</div><div className="v">{v}</div></div>
            ))}
          </div>
          <div className="row wrap" style={{ gap: 4, borderBottom: "1px solid var(--line)", marginBottom: 16 }}>
            {([["charts", "Charts"], ["money", "Money"], ["badges", "Badges"], ["servers", "Servers"], ["liveops", "Live ops"], ["details", "Details"]] as [Tab, string][]).map(([id, label]) => (
              <button key={id} className="btn ghost" style={{ borderRadius: 0, borderBottom: `2px solid ${tab === id ? "var(--accent)" : "transparent"}`, color: tab === id ? "var(--text)" : undefined }} onClick={() => setTab(id)}>
                {label}
                {id === "liveops" && tasks.filter(t => ["working", "queued", "needs_you"].includes(t.status)).length > 0 && <span className="mono dim" style={{ marginLeft: 6 }}>{tasks.filter(t => ["working", "queued", "needs_you"].includes(t.status)).length}</span>}
                {id === "badges" && info && <span className="mono dim" style={{ marginLeft: 6 }}>{info.badges.length}</span>}
              </button>
            ))}
          </div>

          {tab === "charts" && (
            <>
              {stats.length < 2 && <div className="card pad muted" style={{ marginBottom: 14 }}>{empty}</div>}
              <div className="grid2" style={{ marginBottom: 14, gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)" }}>
                <Panel title="Players online" sub="every few minutes, last 3 days. Dashed lines are updates the crew finished.">
                  <Chart lines={[{ name: "Playing", data: recent.map(x => x.playing), color: "var(--accent-text)", area: true }]} labels={recent.map(x => day(x.created_at))} fmtX={i => when(recent[i].created_at)} marks={marksFor(recent)} />
                </Panel>
                <Panel title="Visits per day" sub="new visits each day">
                  <Chart bars lines={[{ name: "Visits", data: daily.slice(1).map((x, i) => Math.max(0, x.visits - daily[i].visits)), color: "var(--ok)" }]} labels={daily.slice(1).map(x => day(x.created_at))} />
                </Panel>
                <Panel title="Favorites" sub="total, by day">
                  <Chart lines={[{ name: "Favorites", data: daily.map(x => x.favorites), color: "#c45cff", area: true }]} labels={daily.map(x => day(x.created_at))} />
                </Panel>
                <Panel title="Likes" sub="share of thumbs up, by day">
                  <Chart lines={[{ name: "Likes", data: daily.map(likesOf), color: "var(--warn)", area: true }]} labels={daily.map(x => day(x.created_at))} unit="%" />
                </Panel>
              </div>
              <div className="card flat pad muted small" style={{ background: "var(--raise)" }}>
                Daily users, retention, the first minute, session time and Robux spent live in your Creator Dashboard. Roblox doesn't let other apps read those yet.{dash && <> <a className="acc" href={`${dash}/analytics/overview`} target="_blank" rel="noreferrer">Open them there</a>.</>}
              </div>
            </>
          )}

          {(tab === "money" || tab === "badges" || tab === "servers") && !window.roslop && <div className="card pad muted">Passes, badges and servers come straight from Roblox through the desktop app. Open it on your computer to see them.</div>}
          {(tab === "money" || tab === "badges" || tab === "servers") && window.roslop && !g.universe_id && <div className="card pad muted">Add the universe id in Details first.</div>}
          {err && <div className="card pad bad small">{err}</div>}

          {tab === "money" && info && (
            <div className="card list" style={{ padding: "0 16px" }}>
              {info.passes.map(p => <div key={p.id} className="row" style={{ padding: "10px 0" }}><span className="grow">{p.name}</span><span className="mono">{p.price !== null ? `R$ ${p.price.toLocaleString()}` : "off sale"}</span></div>)}
              {!info.passes.length && <div className="muted small" style={{ padding: 14 }}>No game passes yet.</div>}
              <div className="dim small" style={{ padding: "10px 0" }}>Developer products and Robux earned are in the Creator Dashboard under Monetization.</div>
            </div>
          )}

          {tab === "badges" && info && (
            <div className="card list" style={{ padding: "0 16px" }}>
              {info.badges.map(b => <div key={b.id} className="row" style={{ padding: "10px 0", gap: 12 }}><span className="grow">{b.name}</span><span className="mono dim">{b.rate !== null ? `${b.rate.toFixed(1)}% get it` : ""}</span><span className="mono" style={{ width: 110, textAlign: "right" }}>{b.awarded.toLocaleString()} awarded</span></div>)}
              {!info.badges.length && <div className="muted small" style={{ padding: 14 }}>No badges yet.</div>}
            </div>
          )}

          {tab === "servers" && info && (
            <div className="kpis">
              {[["Public servers", `${info.servers.count}${info.servers.count >= 100 ? "+" : ""}`], ["Players in them", info.servers.players.toLocaleString()], ["Average ping", info.servers.avgPing !== null ? `${info.servers.avgPing} ms` : "–"], ["Average FPS", info.servers.avgFps ?? "–"]].map(([l, v]) => (
                <div key={l as string} className="card kpi"><div className="muted small">{l}</div><div className="v">{v}</div></div>
              ))}
            </div>
          )}

          {tab === "liveops" && (
            <>
            <div className="kpis" style={{ marginBottom: 14 }}>
              <div className="card kpi"><div className="muted small">Playing now</div><div className="v">{last?.playing.toLocaleString() ?? "–"}</div><Delta now={last?.playing} then={dayAgo?.playing} /></div>
              <div className="card kpi"><div className="muted small">Visits, last 24 hours</div><div className="v">{last && dayAgo ? (last.visits - dayAgo.visits).toLocaleString() : "–"}</div>{last && weekAgo && dayAgo ? <span className="dim small">{Math.round((last.visits - weekAgo.visits) / 7).toLocaleString()} a day over the week</span> : null}</div>
              <div className="card kpi"><div className="muted small">New favorites, 24 hours</div><div className="v">{last && dayAgo ? (last.favorites - dayAgo.favorites).toLocaleString() : "–"}</div></div>
              <div className="card kpi"><div className="muted small">Likes</div><div className="v">{likes !== null ? `${likes}%` : "–"}</div><Delta now={last ? likesOf(last) : undefined} then={dayAgo ? likesOf(dayAgo) : undefined} suffix=" pts" /></div>
              <div className="card kpi"><div className="muted small">Best hour</div><div className="v">{Math.max(...hours) ? hourName(hours.indexOf(Math.max(...hours))) : "–"}</div><span className="dim small">most players on average</span></div>
            </div>
            <div className="grid2" style={{ marginBottom: 14, gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)" }}>
              <Panel title="Players and updates" sub="hover to see the count and anything that shipped around then">
                <Chart lines={[{ name: "Playing", data: recent.map(x => x.playing), color: "var(--accent-text)", area: true }]} labels={recent.map(x => day(x.created_at))} fmtX={i => when(recent[i].created_at)} marks={marksFor(recent)} />
              </Panel>
              <Panel title="When people play" sub="average players by hour of day, your time, last 2 weeks">
                <Chart bars lines={[{ name: "Average playing", data: hours, color: "#7a5cff" }]} labels={hours.map((_, h) => (h % 3 === 0 ? hourName(h) : ""))} fmtX={h => hourName(h)} />
              </Panel>
            </div>
            <div className="card list" style={{ marginBottom: 14 }}>
              <div className="sec-h" style={{ padding: "12px 14px 0" }}><h3>What changed</h3><span className="r">finished work and your review calls, newest first</span></div>
              {timeline.map((e, i) => (
                <Link key={i} to={e.link} className="row" style={{ padding: "9px 14px", gap: 10, alignItems: "flex-start" }}>
                  <span className="mono dim" style={{ width: 120, flex: "none" }}>{when(e.at)}</span>
                  <Av who={e.who} size="sm" />
                  <div className="grow" style={{ minWidth: 0 }}><div className="trunc" style={{ fontWeight: 500 }}>{e.text}</div>{e.sub && <div className="muted small" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{e.sub}</div>}</div>
                </Link>
              ))}
              {!timeline.length && <div className="muted small" style={{ padding: 14 }}>Nothing finished or reviewed on this game yet.</div>}
            </div>
            <div className="grid2">
              <div className="col" style={{ gap: 14 }}>
                <div className="card pad col" style={{ gap: 8 }}>
                  <b>Ask the crew</b>
                  <div className="row wrap" style={{ gap: 6 }}>
                    <button className="btn sm" onClick={() => ask("liveops", `What's next for ${g.name}`, `Look at ${g.name}'s numbers and what players are doing, and say what the next update should be and why. Use the real numbers.`)}>What should the next update be?</button>
                    <button className="btn sm" onClick={() => ask("playtest", `Playtest ${g.name}`, `Play the newest build of ${g.name} like a new player. Record where you get stuck, what breaks and what's boring, with screenshots.`)}>Playtest it</button>
                    <button className="btn sm" onClick={() => ask("kid", `First minutes of ${g.name}`, `Play ${g.name} from a fresh save with no idea what the game is. Note every moment you didn't know what to do, with the time.`)}>Where do new players get lost?</button>
                    <button className="btn sm" onClick={() => ask("merchant", `Money check for ${g.name}`, `Look at ${g.name}'s passes and shop and say what to add, cut or reprice, with reasons.`)}>Money check</button>
                    <button className="btn sm" onClick={() => ask("reviewer", `Bug sweep for ${g.name}`, `Look for exploits, errors and broken saves in ${g.name}. Report what you find with how to reproduce it.`)}>Bug sweep</button>
                  </div>
                </div>
                <div className="card list">
                  <div className="sec-h" style={{ padding: "12px 14px 0" }}><h3>Working and queued</h3></div>
                  {tasks.filter(t => ["working", "queued", "held", "needs_you", "paused"].includes(t.status)).map(t => (
                    <Link key={t.id} to={`/tasks?open=${t.id}`} className="row" style={{ padding: "9px 14px", gap: 10 }}><Av who={t.agent} size="sm" /><span className="grow trunc">{t.title}</span><span className="pill" style={{ height: 18, fontSize: 10 }}>{t.status.replace("_", " ")}</span></Link>
                  ))}
                  {!tasks.some(t => ["working", "queued", "held", "needs_you", "paused"].includes(t.status)) && <div className="muted small" style={{ padding: 14 }}>Nothing in progress on this game.</div>}
                </div>
              </div>
              <div className="col" style={{ gap: 14 }}>
                <div className="card list">
                  <div className="sec-h" style={{ padding: "12px 14px 0" }}><h3>Done lately</h3></div>
                  {tasks.filter(t => t.status === "done").sort((a, b) => (b.finished_at ?? "").localeCompare(a.finished_at ?? "")).slice(0, 12).map(t => (
                    <Link key={t.id} to={`/tasks?open=${t.id}`} style={{ display: "block", padding: "9px 14px" }}>
                      <div className="row" style={{ gap: 10 }}><Av who={t.agent} size="sm" /><span className="grow trunc" style={{ fontWeight: 500 }}>{t.title}</span><span className="mono dim">{ago(t.finished_at)}</span></div>
                      {t.result && <div className="muted small" style={{ marginLeft: 30, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{t.result}</div>}
                    </Link>
                  ))}
                  {!tasks.some(t => t.status === "done") && <div className="muted small" style={{ padding: 14 }}>Nothing finished yet.</div>}
                </div>
                <div className="card list">
                  <div className="sec-h" style={{ padding: "12px 14px 0" }}><h3>Fixes and reports</h3></div>
                  {tasks.filter(t => t.status === "failed" || (t.status === "done" && ["playtest", "reviewer", "kid"].includes(t.agent))).slice(-10).reverse().map(t => (
                    <Link key={t.id} to={`/tasks?open=${t.id}`} className="row" style={{ padding: "9px 14px", gap: 10 }}><Av who={t.agent} size="sm" /><span className="grow trunc">{t.title}</span><span className={`pill ${t.status === "failed" ? "warn" : ""}`} style={{ height: 18, fontSize: 10 }}>{t.status === "failed" ? "failed" : "report"}</span></Link>
                  ))}
                  {!tasks.some(t => t.status === "failed" || (t.status === "done" && ["playtest", "reviewer", "kid"].includes(t.agent))) && <div className="muted small" style={{ padding: 14 }}>No reports yet. Playtest, Clueless Tester and Reviewer reports land here.</div>}
                </div>
              </div>
            </div>
            </>
          )}

          {tab === "details" && (
            <>
              <div className="card pad col" style={{ marginBottom: 18, maxWidth: 560 }}>
                <div className="row"><span className="muted grow">Version</span>{g.version}</div>
                <label className="field"><span>Universe id</span><input className="input mono" defaultValue={g.universe_id ?? ""} placeholder="Creator Dashboard, the experience's settings" onBlur={e => { const v = e.target.value.replace(/\D/g, ""); if (String(g.universe_id ?? "") !== v) db.update("games", g.id, { universe_id: v ? Number(v) : null, place_id: null }); }} /></label>
                <div className="row"><span className="muted grow">Place id</span><span className="mono">{g.place_id ?? "found from the universe id"}</span></div>
                <div className="row"><span className="muted grow">Project folder</span><span className="mono trunc" style={{ maxWidth: 260 }}>{g.project_path ?? "default"}</span></div>
                <label className="field" style={{ marginTop: 6 }}><span>Stage</span>
                  <select className="input" value={g.stage} onChange={e => db.update("games", g.id, { stage: e.target.value as Stage })}>
                    {STAGES.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
                  </select>
                </label>
              </div>
              <Pipeline g={g} />
            </>
          )}
        </>
      )}
    </div>
  );
}
