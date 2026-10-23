import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { AGENTS, ago, CONNECTORS, KEYS, MODELS, pct, projected, SAVINGS, serverFor, WINDOW_MIN, type AppEntry, type MachineRole, type RunnerStatus, type Settings as S, type Tier } from "@roslop/core";
import { resetDemo } from "../data/demo";
import { db, toast, useData, useSnap, useUsage } from "../data/store";
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

// What the desktop app sees on this machine, so problems aren't a guessing game.
function ThisComputer() {
  const [st, setSt] = useState<RunnerStatus | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let alive = true;
    const poll = () => window.roslop!.status().then(s => alive && setSt(s), () => {});
    poll();
    const t = setInterval(poll, 4000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);
  const recheck = async () => {
    setBusy(true);
    const session = await db.session();
    if (session) {
      await window.roslop!.stopRunner();
      setSt(await window.roslop!.startRunner(session));
    } else toast("Sign in with your Supabase project first. The demo can't run the crew.", true);
    setBusy(false);
  };
  const pick = async () => {
    const path = await window.roslop!.pickFile();
    if (!path || !st) return;
    await window.roslop!.setCliPath(st.provider, path);
    recheck();
  };
  const line = (label: string, value: React.ReactNode, ok?: boolean) => (
    <div className="row" style={{ padding: "7px 0", alignItems: "flex-start" }}>
      <span className="muted" style={{ width: 130, flex: "none" }}>{label}</span>
      <span className={`grow ${ok === false ? "bad" : ok ? "ok" : ""}`} style={{ wordBreak: "break-word", userSelect: "text" }}>{value}</span>
    </div>
  );
  return (
    <div className="card pad" style={{ marginTop: 18 }}>
      <div className="sec-h"><h3>This computer</h3><button className="btn sm r" disabled={!st} onClick={pick}>Point at the file</button><button className="btn sm" disabled={busy} onClick={recheck}>{busy ? "Checking…" : "Check again"}</button></div>
      {!st ? <div className="muted">Asking the desktop app…</div> : (
        <div className="list">
          {line("Crew", db.mode === "demo" ? "Not running, this is the demo" : st.running ? "Running" : "Stopped", db.mode !== "demo" && st.running)}
          {line(st.provider === "claude" ? "Claude Code" : "Codex", st.cli_detail ?? (st.cli_found ? "Found" : "Not checked yet"), st.cli_found)}
          {line("Working on", st.working.length ? st.working.join(", ") : "Nothing right now")}
          {st.note && line("Why it's waiting", st.note)}
          {!st.cli_found && st.provider === "claude" && (
            <div className="small muted" style={{ padding: "10px 0", lineHeight: 1.6 }}>
              The Claude desktop app isn't the same as Claude Code's command line, and RoSlop needs the command line.
              {window.roslop!.platform === "windows"
                ? <> Open PowerShell, run <code>irm https://claude.ai/install.ps1 | iex</code>, close it, open a new one and run <code>claude</code> once to sign in with the same account. </>
                : <> Open Terminal, run <code>curl -fsSL https://claude.ai/install.sh | bash</code>, then run <code>claude</code> once to sign in. </>}
              Then hit Check again. If you already have it somewhere odd, point at the file instead.
            </div>
          )}
          {st.last_error && line("Last problem", st.last_error, false)}
        </div>
      )}
    </div>
  );
}

function Computers() {
  const s = useSnap();
  const st = s.settings;
  const setApps = (apps: AppEntry[]) => save({ apps });
  const scan = async () => {
    const found = await window.roslop!.scanApps();
    const known = new Set(st.apps.map(a => a.path));
    const fresh = found.filter(a => !known.has(a.path));
    if (fresh.length) await setApps([...st.apps, ...fresh]);
    toast(fresh.length ? `Found ${fresh.map(a => a.name).join(", ")}. Switch on the ones the crew can use.` : found.length ? "Nothing new, you've got them all." : "Didn't find any of the usual apps. Use Add an app to point at one.");
  };
  const addApp = async () => {
    const path = await window.roslop!.pickFile();
    if (!path) return;
    const name = path.split(/[\\/]/).pop()!.replace(/\.(exe|app)$/i, "");
    await setApps([...st.apps, { name, path, use: "", agents: ["librarian"], on: true }]);
  };
  const role = (id: string, r: MachineRole) => db.update("machines", id, { role: r });
  return (
    <>
      <h1 className="page">Computers and apps</h1>
      <p className="lede">One computer does the work. Everything else, your phone included, is a remote that sends it jobs. If it's off, jobs wait and start when it's back.</p>
      {window.roslop && <ThisComputer />}
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

      <div className="sec-h" style={{ marginTop: 24 }}><h3>Apps the crew can open</h3>{window.roslop && <span className="r row"><button className="btn sm" onClick={scan}>Scan this computer</button><button className="btn sm" onClick={addApp}>Add an app</button></span>}</div>
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

const SETUP: Record<string, string> = {
  figma: "claude mcp add --transport http figma https://mcp.figma.com/mcp",
  blender: "claude mcp add blender -- uvx blender-mcp",
};

function BlenderRules() {
  const r = useSnap().settings.blender;
  const set = (patch: Partial<typeof r>) => save({ blender: { ...r, ...patch } });
  return (
    <div className="card pad col" style={{ marginTop: 14, gap: 12 }}>
      <div><b>How Blender models should come out</b><div className="muted small">Every model the crew makes follows these, so they look like one game and stay light on phones.</div></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <label className="field"><span>Style</span>
          <select className="input" value={r.style} onChange={e => set({ style: e.target.value as typeof r.style })}>
            {["low poly", "stylized", "toon", "realistic", "voxel"].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
        <label className="field"><span>Max triangles per model</span>
          <select className="input" value={r.max_tris} onChange={e => set({ max_tris: Number(e.target.value) })}>
            {[500, 1500, 4000, 8000, 15000].map(v => <option key={v} value={v}>{v.toLocaleString()}</option>)}
          </select>
        </label>
        <label className="field"><span>Texture size</span>
          <select className="input" value={r.texture} onChange={e => set({ texture: Number(e.target.value) as typeof r.texture })}>
            {[256, 512, 1024].map(v => <option key={v} value={v}>{v} x {v}</option>)}
          </select>
        </label>
        <label className="field"><span>Collision in Studio</span>
          <select className="input" value={r.collision} onChange={e => set({ collision: e.target.value as typeof r.collision })}>
            <option value="box">Box, cheapest</option><option value="hull">Hull</option><option value="precise">Precise, only if needed</option>
          </select>
        </label>
      </div>
      <div className="list">
        <Row title="One material per model" sub="Fewer draw calls. Extra colors go in a texture atlas."><Toggle on={r.single_material} onChange={v => set({ single_material: v })} /></Row>
        <Row title="Bake detail into textures" sub="Instead of adding geometry"><Toggle on={r.bake} onChange={v => set({ bake: v })} /></Row>
        <Row title="Pivot at the bottom center" sub="So models drop onto the ground cleanly in Studio"><Toggle on={r.pivot_bottom} onChange={v => set({ pivot_bottom: v })} /></Row>
      </div>
      <label className="field"><span>Anything else they should stick to</span>
        <textarea className="textarea" style={{ minHeight: 60 }} value={r.notes} placeholder="No pure black, round every edge a bit, keep props under 6 studs tall…" onChange={e => set({ notes: e.target.value })} />
      </label>
    </div>
  );
}

function Connectors() {
  const st = useSnap().settings;
  const found = st.mcp_found;
  const status = (id: string) => {
    if (found === null) return <span className="pill">Not checked yet</span>;
    return serverFor(id, found) ? <span className="pill ok">Found</span> : <span className="pill warn">Not set up</span>;
  };
  return (
    <>
      <h1 className="page">Connectors</h1>
      <p className="lede">Switch on whatever you want the crew to use. Your worker checks what's actually set up in {st.provider === "claude" ? "Claude Code" : "Codex"}, and anything that isn't gets switched back off with a note on how to add it.</p>
      <div className="card list" style={{ marginTop: 18, padding: "0 16px" }}>
        {CONNECTORS.map(c => (
          <div key={c.id} style={{ padding: "12px 0" }}>
            <div className="row" style={{ gap: 12 }}>
              <div className="grow"><div style={{ fontWeight: 500 }}>{c.name}</div><div className="muted small">{c.use}</div></div>
              {status(c.id)}
              <Toggle on={!!st.connectors[c.id]} onChange={v => save({ connectors: { ...st.connectors, [c.id]: v } })} />
            </div>
            {found !== null && !serverFor(c.id, found) && (
              <div className="small muted" style={{ marginTop: 6 }}>
                To add it, run this on your worker{SETUP[c.id] ? ":" : ", then switch it on again."}
                {SETUP[c.id] ? <code className="mono" style={{ display: "block", marginTop: 4, padding: "6px 8px", background: "var(--raise)", borderRadius: 6, userSelect: "all" }}>{SETUP[c.id]}</code> : <span className="mono"> claude mcp add …</span>}
                {c.id === "blender" && <div style={{ marginTop: 4 }}>You also need the Blender MCP add-on installed and turned on inside Blender.</div>}
              </div>
            )}
          </div>
        ))}
      </div>
      {found === null && <p className="muted small" style={{ marginTop: 10 }}>Open the desktop app on your worker and it checks these automatically.</p>}
      <BlenderRules />
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
