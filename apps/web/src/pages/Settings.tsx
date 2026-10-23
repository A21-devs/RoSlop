import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { AGENTS, ago, CONNECTORS, KEYS, MODELS, pct, projected, SAVINGS, WINDOW_MIN, type AppEntry, type MachineRole, type Settings as S, type Tier } from "@roslop/core";
import { resetDemo } from "../data/demo";
import { db, useData, useSnap, useUsage } from "../data/store";
import { Av, Icon, Toggle } from "../ui/bits";

const SECTIONS = [["usage", "Usage"], ["computers", "Computers and apps"], ["connectors", "Connectors"], ["keys", "Keys"], ["provider", "AI provider"], ["account", "Account"], ["look", "Look"]] as const;

const save = (patch: Partial<S>) => db.saveSettings(patch);

function Row({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="row" style={{ padding: "12px 0", gap: 16 }}>
      <div className="grow"><div style={{ fontWeight: 500 }}>{title}</div>{sub && <div className="muted small">{sub}</div>}</div>
      {children}
    </div>
  );
}

function PaceChart() {
  const u = useUsage();
  const w = 600, h = 200, L = 34, B = 20;
  const x = (m: number) => L + (m / WINDOW_MIN) * (w - L - 8);
  const y = (p: number) => h - B - p * (h - B - 10);
  const end = projected(u.used, u.elapsed);
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      {[0, 0.25, 0.5, 0.75, 1].map(p => (
        <g key={p}><line x1={L} x2={w - 8} y1={y(p)} y2={y(p)} stroke="var(--line)" /><text x={L - 6} y={y(p) + 4} textAnchor="end" style={{ fill: "var(--dim)", font: "10px var(--mono)" }}>{p * 100}%</text></g>
      ))}
      <line x1={L} x2={w - 8} y1={y(u.cap)} y2={y(u.cap)} stroke="var(--bad)" strokeDasharray="5 4" />
      <text x={w - 10} y={y(u.cap) - 6} textAnchor="end" style={{ fill: "var(--bad)", font: "10.5px var(--mono)" }}>stop line {pct(u.cap)}</text>
      <line x1={x(0)} y1={y(0)} x2={x(WINDOW_MIN)} y2={y(u.cap)} stroke="var(--dim)" strokeDasharray="2 4" />
      <line x1={x(0)} y1={y(0)} x2={x(u.elapsed)} y2={y(u.used)} stroke="var(--accent)" strokeWidth="2.5" />
      <line x1={x(u.elapsed)} y1={y(u.used)} x2={x(WINDOW_MIN)} y2={y(end)} stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="3 5" />
      <circle cx={x(u.elapsed)} cy={y(u.used)} r="4.5" fill="var(--accent)" />
      {[0, 1, 2, 3, 4, 5].map(i => <text key={i} x={x(i * 60)} y={h - 4} textAnchor="middle" style={{ fill: "var(--dim)", font: "10px var(--mono)" }}>{i}h</text>)}
    </svg>
  );
}

function Usage() {
  const s = useSnap();
  const u = useUsage();
  const st = s.settings;
  const left = Math.max(0, WINDOW_MIN - u.elapsed);
  return (
    <>
      <h1 className="page">Stay inside the window</h1>
      <p className="lede">Your plan's usage refills every 5 hours. RoSlop paces the crew so it never runs out early, and leaves the rest for your own work.
        {u.startedAt ? ` You're at ${pct(u.used)} with ${Math.floor(left / 60)}h ${Math.round(left % 60)}m to go.` : " Nothing's been used this window yet."}</p>
      <div className="grid2" style={{ marginTop: 18 }}>
        <div className="card pad"><PaceChart /></div>
        <div className="col">
          <div>
            <div className="row"><b className="grow">Stop the crew at</b><span className="mono" style={{ fontSize: 16, color: "var(--accent-text)" }}>{pct(st.cap)}</span></div>
            <input type="range" min={0.3} max={0.95} step={0.05} value={st.cap} onChange={e => save({ cap: Number(e.target.value) })} />
            <div className="muted small">The rest stays yours for your own Claude Code or Codex work.</div>
          </div>
          <Row title="Agents at once" sub="Drops automatically when usage runs hot">
            <div className="row"><button className="btn sm" onClick={() => save({ max_agents: Math.max(1, st.max_agents - 1) })}>−</button><span className="mono" style={{ width: 18, textAlign: "center" }}>{st.max_agents}</span><button className="btn sm" onClick={() => save({ max_agents: Math.min(6, st.max_agents + 1) })}>+</button></div>
          </Row>
          <Row title="Hold low priority work" sub="When you're ahead of pace, it waits for the next window"><Toggle on={st.hold_low_priority} onChange={v => save({ hold_low_priority: v })} /></Row>
          <Row title="Keep spare for the week" sub="So one busy day doesn't eat your weekly limit">
            <select className="input" style={{ width: 90 }} value={st.weekly_spare} onChange={e => save({ weekly_spare: Number(e.target.value) })}>{[0, 0.1, 0.15, 0.25, 0.4].map(v => <option key={v} value={v}>{pct(v)}</option>)}</select>
          </Row>
        </div>
      </div>
      <div className="grid2" style={{ marginTop: 20, gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <div className="sec-h"><h3>The right model for each job</h3></div>
          <div className="list">
            {(["heavy", "standard", "light"] as Tier[]).map(t => (
              <div key={t} className="row" style={{ padding: "10px 0", gap: 14 }}>
                <div style={{ width: 110 }}><div style={{ fontWeight: 600, textTransform: "capitalize" }}>{t}</div><div className="mono dim">{MODELS[st.provider][t] ?? "CLI default"}</div></div>
                <div className="row wrap" style={{ gap: 3 }}>{AGENTS.filter(a => a.tier === t).map(a => <Av key={a.id} who={a.id} size="sm" />)}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="sec-h"><h3>Savings</h3></div>
          <div className="list">
            {SAVINGS.map(sv => (
              <Row key={sv.id} title={sv.name} sub={`${sv.what}. Around ${pct(sv.cut)} less.`}><Toggle on={!!st.savings[sv.id]} onChange={v => save({ savings: { ...st.savings, [sv.id]: v } })} /></Row>
            ))}
          </div>
        </div>
      </div>
      <details style={{ marginTop: 18 }}>
        <summary className="muted small">Advanced</summary>
        <Row title="Tokens per window" sub="A starting guess. The desktop app corrects it once it sees your real limits.">
          <input className="input mono" style={{ width: 140 }} type="number" value={st.window_tokens} onChange={e => save({ window_tokens: Number(e.target.value) || st.window_tokens })} />
        </Row>
      </details>
    </>
  );
}

function Computers() {
  const s = useSnap();
  const st = s.settings;
  const setApps = (apps: AppEntry[]) => save({ apps });
  const scan = async () => {
    const found = await window.roslop!.scanApps();
    const known = new Set(st.apps.map(a => a.path));
    setApps([...st.apps, ...found.filter(a => !known.has(a.path))]);
  };
  const role = (id: string, r: MachineRole) => db.update("machines", id, { role: r });
  return (
    <>
      <h1 className="page">Computers and apps</h1>
      <p className="lede">One computer does the work. Everything else, your phone included, is a remote that sends it jobs. If it's off, jobs wait and start when it's back.</p>
      <div className="card list" style={{ marginTop: 18, padding: "0 16px" }}>
        {s.machines.map(m => {
          const online = Date.now() - Date.parse(m.last_seen) < 3 * 60000;
          const phone = m.os === "ios" || m.os === "android" || m.os === "web";
          return (
            <div key={m.id} className="row" style={{ padding: "12px 0", gap: 12 }}>
              <Icon name={phone ? "phone" : "studio"} size={18} style={{ color: "var(--muted)" }} />
              <div className="grow"><b>{m.name}</b><div className="muted small">{online ? "online" : `seen ${ago(m.last_seen)} ago`}{m.studio_slots ? ` · ${m.studio_slots} Studios` : ""}</div></div>
              {phone ? <span className="pill info">remote</span> : (
                <select className="input" style={{ width: 150 }} value={m.role} onChange={e => role(m.id, e.target.value as MachineRole)}>
                  <option value="worker">Does the work</option><option value="backup">Backup</option><option value="remote">Remote only</option>
                </select>
              )}
            </div>
          );
        })}
        {!s.machines.length && <div className="muted" style={{ padding: "14px 0" }}>Open the desktop app and sign in. That computer shows up here.</div>}
      </div>

      <div className="sec-h" style={{ marginTop: 24 }}><h3>Apps the crew can open</h3>{window.roslop && <button className="btn sm r" onClick={scan}>Scan this computer</button>}</div>
      <div className="card list" style={{ padding: "0 16px" }}>
        {st.apps.map((a, i) => (
          <div key={a.path} className="row" style={{ padding: "12px 0", gap: 12 }}>
            <div className="grow"><b>{a.name}</b><div className="mono dim trunc">{a.path}</div>
              <input className="input small" style={{ marginTop: 6, minHeight: 28 }} value={a.use} placeholder="What should the crew use it for?" onChange={e => setApps(st.apps.map((x, j) => (j === i ? { ...x, use: e.target.value } : x)))} />
            </div>
            <div className="row" style={{ gap: 3 }}>{a.agents.map(k => <Av key={k} who={k} size="sm" />)}</div>
            <Toggle on={a.on} onChange={v => setApps(st.apps.map((x, j) => (j === i ? { ...x, on: v } : x)))} />
          </div>
        ))}
        {!st.apps.length && <div className="muted" style={{ padding: "14px 0" }}>No apps yet. Scan from the desktop app to find Blender, Aseprite, Photoshop and friends.</div>}
      </div>
    </>
  );
}

function Connectors() {
  const st = useSnap().settings;
  return (
    <>
      <h1 className="page">Connectors</h1>
      <p className="lede">These come from what's already connected in Claude Code or Codex on your worker. Turn one on and the crew can use it. Nothing new gets installed.</p>
      <div className="card list" style={{ marginTop: 18, padding: "0 16px" }}>
        {CONNECTORS.map(c => <Row key={c.id} title={c.name} sub={c.use}><Toggle on={!!st.connectors[c.id]} onChange={v => save({ connectors: { ...st.connectors, [c.id]: v } })} /></Row>)}
      </div>
      <p className="muted small" style={{ marginTop: 10 }}>Missing one? Connect it in Claude Code first (claude mcp add), then turn it on here.</p>
    </>
  );
}

function Keys() {
  const [vals, setVals] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (!window.roslop) return;
    Promise.all(KEYS.map(async k => [k.id, !!(await window.roslop!.getKey(k.id))] as const)).then(r => setSaved(Object.fromEntries(r)));
  }, []);
  if (!window.roslop) {
    return (
      <>
        <h1 className="page">Keys</h1>
        <p className="lede">Keys never leave the computer that runs the crew, so you add them from the desktop app there.</p>
      </>
    );
  }
  const store = async (id: string) => {
    await window.roslop!.setKey(id, vals[id] || null);
    setSaved({ ...saved, [id]: !!vals[id] });
    setVals({ ...vals, [id]: "" });
  };
  return (
    <>
      <h1 className="page">Keys</h1>
      <p className="lede">Encrypted on this computer and never synced. The crew gets them only when a job needs them.</p>
      <div className="card list" style={{ marginTop: 18, padding: "0 16px" }}>
        {KEYS.map(k => (
          <div key={k.id} className="row" style={{ padding: "12px 0", gap: 12 }}>
            <Icon name="key" style={{ color: "var(--muted)" }} />
            <div style={{ width: 200 }}><b>{k.name}</b><div className="muted small">{k.use}</div></div>
            <input className="input mono grow" type="password" value={vals[k.id] ?? ""} placeholder={saved[k.id] ? "saved, paste to replace" : "paste it here"} onChange={e => setVals({ ...vals, [k.id]: e.target.value })} />
            <button className="btn sm" onClick={() => store(k.id)}>{vals[k.id] ? "Save" : saved[k.id] ? "Remove" : "Save"}</button>
          </div>
        ))}
      </div>
      <div className="card flat pad" style={{ marginTop: 14, background: "var(--raise)" }}>
        <b>Getting a Roblox Open Cloud key</b>
        <ol className="muted" style={{ paddingLeft: 18, marginTop: 6 }}>
          <li>Go to create.roblox.com, open Credentials, then Create API key.</li>
          <li>Add your experiences and give it Place publishing, DataStore read and write, and Assets read and write.</li>
          <li>Copy it straight away, Roblox only shows it once.</li>
        </ol>
      </div>
    </>
  );
}

function Provider() {
  const st = useSnap().settings;
  const [status, setStatus] = useState<string>("");
  useEffect(() => {
    window.roslop?.status().then(r => setStatus(r.cli_found ? "found on this computer" : "not found on this computer"));
  }, [st.provider]);
  const opt = (id: S["provider"], name: string, how: string) => (
    <button className="card pad" style={{ textAlign: "left", boxShadow: st.provider === id ? "inset 0 0 0 1.5px var(--accent)" : "none" }} onClick={() => save({ provider: id })}>
      <div className="row"><b>{name}</b>{st.provider === id && <span className="pill acc" style={{ marginLeft: "auto" }}>In use</span>}</div>
      <div className="muted small" style={{ marginTop: 4 }}>{how}</div>
    </button>
  );
  return (
    <>
      <h1 className="page">AI provider</h1>
      <p className="lede">The crew runs on your own account through its command line tool, on your worker. Your plan, your usage, nothing goes through us.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 18, maxWidth: 640 }}>
        {opt("claude", "Claude Code", "Install it, run claude once to sign in.")}
        {opt("codex", "Codex", "Install it, run codex login once.")}
      </div>
      {status && <p className="muted small" style={{ marginTop: 10 }}>{st.provider === "claude" ? "Claude Code" : "Codex"} is {status}.</p>}
      <label className="field" style={{ marginTop: 18, maxWidth: 640 }}><span>Roblox Studio MCP command (lets agents drive Studio)</span>
        <input className="input mono" value={st.studio_mcp ?? ""} placeholder="path to the Studio MCP server" onChange={e => save({ studio_mcp: e.target.value || null })} />
      </label>
    </>
  );
}

function Account() {
  const { user } = useData();
  return (
    <>
      <h1 className="page">Account</h1>
      <p className="lede">{db.mode === "demo" ? "You're in the demo. Everything stays in this browser." : `Signed in as ${user?.email}. Everything syncs across your devices.`}</p>
      <div className="row" style={{ marginTop: 18 }}>
        <button className="btn" onClick={() => db.signOut()}>Sign out</button>
        {db.mode === "demo" && <button className="btn ghost" onClick={resetDemo}>Reset the demo</button>}
      </div>
    </>
  );
}

function Look() {
  const [theme, setTheme] = useState(() => localStorage.getItem("roslop-theme") ?? "dark");
  const pick = (t: string) => {
    setTheme(t);
    localStorage.setItem("roslop-theme", t);
    document.documentElement.classList.toggle("light", t === "light");
  };
  return (
    <>
      <h1 className="page">Look</h1>
      <div className="row" style={{ marginTop: 18 }}>
        {["dark", "light"].map(t => <button key={t} className={`btn ${theme === t ? "pri" : ""}`} onClick={() => pick(t)} style={{ textTransform: "capitalize" }}>{t}</button>)}
      </div>
    </>
  );
}

export function Settings() {
  const { section = "usage" } = useParams();
  const Page = { usage: Usage, computers: Computers, connectors: Connectors, keys: Keys, provider: Provider, account: Account, look: Look }[section] ?? Usage;
  return (
    <div className="content flush split" style={{ display: "grid", gridTemplateColumns: "220px 1fr", height: "100%" }}>
      <nav className="nav hide-m" style={{ padding: "22px 12px", borderRight: "1px solid var(--line)" }}>
        {SECTIONS.map(([id, label]) => <NavLink key={id} to={`/settings/${id}`} className={section === id ? "active" : ""}>{label}</NavLink>)}
      </nav>
      <div style={{ padding: "24px 28px", overflowY: "auto" }}>
        <div className="only-m row wrap" style={{ marginBottom: 14 }}>{SECTIONS.map(([id, label]) => <NavLink key={id} to={`/settings/${id}`} className={`pill ${section === id ? "on" : ""}`}>{label}</NavLink>)}</div>
        <Page />
      </div>
    </div>
  );
}
