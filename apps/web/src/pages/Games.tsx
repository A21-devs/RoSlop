import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { STAGES, type Game, type Stage } from "@roslop/core";
import { addGame, publish } from "../data/actions";
import { db, toast, useSnap } from "../data/store";
import { Av, Empty, LineChart } from "../ui/bits";

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

export function Games() {
  const s = useSnap();
  const [params, setParams] = useSearchParams();
  const [adding, setAdding] = useState(false);
  const g = s.games.find(x => x.id === params.get("g")) ?? s.games[0];
  const stats = g ? s.game_stats.filter(x => x.game_id === g.id) : [];
  const last = stats.at(-1);
  const day = stats.filter(x => Date.parse(x.created_at) > Date.now() - 864e5);
  const peak = Math.max(0, ...day.map(x => x.playing));
  const likes = last && last.up_votes + last.down_votes ? Math.round((last.up_votes / (last.up_votes + last.down_votes)) * 100) : null;
  const visitsToday = day.length > 1 ? day.at(-1)!.visits - day[0].visits : null;

  return (
    <div className="content">
      <div className="head">
        <div className="grow"><h1 className="page">Games</h1><p className="lede">Live numbers come straight from Roblox every few minutes while your worker is on.</p></div>
        <button className="btn" onClick={() => setAdding(true)}>Add a game</button>
      </div>
      {adding && <AddGame done={id => { setAdding(false); if (id) setParams({ g: id }); }} />}
      {!g && !adding && <Empty>No games yet. Add one you already have, or approve a pitch and the crew starts a new one.</Empty>}
      {g && (
        <>
          <div className="row wrap" style={{ marginBottom: 16 }}>
            {s.games.map(x => <button key={x.id} className={`pill ${x.id === g.id ? "on" : ""}`} style={{ height: 28, padding: "0 12px" }} onClick={() => setParams({ g: x.id })}>{x.name}</button>)}
          </div>
          <div className="kpis" style={{ marginBottom: 18 }}>
            {[["Playing now", last?.playing ?? "–"], ["Peak today", peak || "–"], ["Visits today", visitsToday ?? "–"], ["Total visits", last ? last.visits.toLocaleString() : "–"], ["Likes", likes !== null ? `${likes}%` : "–"], ["Favorites", last?.favorites.toLocaleString() ?? "–"]].map(([l, v]) => (
              <div key={l as string} className="card kpi"><div className="muted small">{l}</div><div className="v">{v}</div></div>
            ))}
          </div>
          <div className="grid2" style={{ marginBottom: 18 }}>
            <div className="card pad">
              <div className="sec-h"><h3>Playing at once</h3><span className="c">last 3 days</span></div>
              {stats.length > 1 ? <LineChart series={[{ data: stats.slice(-72).map(x => x.playing), color: "var(--accent-text)", area: true }]} /> : <div className="muted small">{g.universe_id ? "Waiting for the first numbers." : "Add the universe id to see live numbers."}</div>}
            </div>
            <div className="card pad col">
              <div className="sec-h" style={{ margin: 0 }}><h3>Details</h3></div>
              <div className="row"><span className="muted grow">Version</span>{g.version}</div>
              <div className="row"><span className="muted grow">Universe id</span><span className="mono">{g.universe_id ?? "not set"}</span></div>
              <div className="row"><span className="muted grow">Project folder</span><span className="mono trunc" style={{ maxWidth: 220 }}>{g.project_path ?? "default"}</span></div>
              <label className="field" style={{ marginTop: 6 }}><span>Stage</span>
                <select className="input" value={g.stage} onChange={e => db.update("games", g.id, { stage: e.target.value as Stage })}>
                  {STAGES.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
                </select>
              </label>
            </div>
          </div>
          <Pipeline g={g} />
        </>
      )}
    </div>
  );
}
