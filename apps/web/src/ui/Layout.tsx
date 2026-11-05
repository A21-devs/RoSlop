import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Crash } from "./Crash";
import { CrewBar } from "./CrewBar";
import { Viewer } from "./Viewer";
import { AskHost } from "./Ask";
import { useRunner } from "./Board";
import { AGENTS, pace, pct } from "@roslop/core";
import { useData, useSnap, useToasts, useUsage } from "../data/store";
import { Av, Icon, Logo, Ring, type IconName } from "./bits";

const isMac = navigator.userAgent.includes("Mac");
const desktop = !!window.roslop;

function Sidebar() {
  const s = useSnap();
  const { user } = useData();
  const needs = s.tasks.filter(t => t.status === "needs_you").length + s.proofs.filter(p => p.verdict === "waiting").length;
  const open = s.tasks.filter(t => ["queued", "held", "working"].includes(t.status)).length;
  const waiting = s.proofs.filter(p => p.verdict === "waiting").length;
  const working = new Map(s.tasks.filter(t => t.status === "working").map(t => [t.agent, t]));
  const crew = [...AGENTS].sort((a, b) => Number(working.has(b.id)) - Number(working.has(a.id))).slice(0, 8);
  const worker = s.machines.find(m => m.role === "worker");

  const link = (to: string, icon: IconName, label: string, n?: number, hot?: boolean) => (
    <NavLink to={to} end={to === "/"}>
      <Icon name={icon} />
      {label}
      {!!n && <span className={`n ${hot ? "hot" : ""}`}>{n}</span>}
    </NavLink>
  );

  return (
    <aside className="side">
      <div className="ws">
        <Logo />
        <div>
          <b>RoSlop</b>
          <span>{worker ? `Runs on ${worker.name}` : "No worker yet"}</span>
        </div>
      </div>
      <nav className="nav">
        {link("/", "home", "Home", needs, true)}
        {link("/lead", "lead", "Lead")}
        {link("/team", "team", "Team")}
        {link("/tasks", "tasks", "Tasks", open)}
        {link("/review", "review", "Review", waiting)}
        {link("/coach", "coach", "Prompt engineering")}
      </nav>
      <div className="nav-h">Studio</div>
      <nav className="nav">
        {link("/games", "games", "Games")}
        {link("/pitches", "pitches", "Pitches", s.pitches.filter(p => p.status === "waiting").length)}
        {link("/market", "market", "Market")}
        {link("/library", "library", "Library")}
        {link("/vault", "vault", "Vault")}
      </nav>
      <div className="nav-h">Team <span className="mono" style={{ marginLeft: "auto" }}>{working.size} busy</span></div>
      <div className="team-list">
        {crew.map(a => (
          <NavLink key={a.id} to={`/team/${a.id}`} className={`m ${working.has(a.id) ? "busy" : ""}`}>
            <Av who={a.id} size="sm" />
            {a.name}
            <span className="st">{working.has(a.id) ? "working" : "idle"}</span>
          </NavLink>
        ))}
      </div>
      <div className="side-foot">
        <nav className="nav">{link("/guide", "guide", "Guide")}{link("/settings", "settings", "Settings")}</nav>
        <div className="me">
          <span className="pfp">{(user?.email ?? "?").slice(0, 2)}</span>
          <div className="grow">
            <div className="trunc" style={{ fontWeight: 500 }}>{user?.email}</div>
            <div className="sync"><span className="dot" />{s.machines.length > 1 ? `Synced on ${s.machines.length} devices` : "Synced"}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Meter() {
  const u = useUsage();
  const p = pace(u.used, u.elapsed, u.cap);
  const nav = useNavigate();
  return (
    <button className="meter" onClick={() => nav("/settings/usage")} title="Usage this 5 hour window">
      <Ring value={u.used} />
      <b>{pct(u.used)}</b>
      <span className="hide-m">{p === "ahead" ? "slowing down" : p === "behind" ? "plenty left" : "on pace"}</span>
    </button>
  );
}

const TITLES: Record<string, string> = {
  "": "Home", lead: "Lead", team: "Team", tasks: "Tasks", review: "Review", coach: "Prompt engineering",
  games: "Games", pitches: "Pitches", market: "Market", library: "Library", vault: "Vault", guide: "Guide", settings: "Settings", more: "More",
};

function Top() {
  const s = useSnap();
  const { game, setGame } = useData();
  const loc = useLocation();
  const nav = useNavigate();
  const page = TITLES[loc.pathname.split("/")[1]] ?? "";
  const worker = s.machines.find(m => m.role === "worker");
  const st = useRunner();
  // Real Studio windows from the desktop app; tasks marked as in Studio only if it can't tell.
  const busyStudios = st?.studios_open ?? worker?.studios_open ?? s.tasks.filter(t => t.status === "working" && t.needs_studio).length;
  const slots = Math.max(s.settings.studio.limit ?? s.settings.studio.lanes.length, busyStudios, 1);
  return (
    <header className="top">
      <div className="crumb"><span className="only-m"><Logo size={24} /></span><b>{page}</b></div>
      <select className="input hide-m" style={{ width: 200, minHeight: 28 }} value={game} onChange={e => setGame(e.target.value)}>
        <option value="all">All games</option>
        {s.games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
      </select>
      <div className="grow" />
      <Meter />
      <div className="slots hide-m" title="Roblox Studio windows open on the computer running the crew">
        Studios {Array.from({ length: slots }, (_, i) => <i key={i} className={i < busyStudios ? "on" : ""} />)}
        <span>{busyStudios} of {slots}</span>
      </div>
      <button className="btn sm pri" onClick={() => nav("/lead")}><Icon name="plus" size={14} /><span className="hide-m">New task</span></button>
    </header>
  );
}

function Tabbar() {
  const s = useSnap();
  const waiting = s.proofs.filter(p => p.verdict === "waiting").length;
  const tab = (to: string, icon: IconName, label: string, n = 0) => (
    <NavLink to={to} end={to === "/"}>
      <Icon name={icon} />
      {label}
      {n > 0 && <span className="n">{n}</span>}
    </NavLink>
  );
  return (
    <nav className="tabbar">
      {tab("/", "home", "Home")}
      {tab("/tasks", "tasks", "Tasks")}
      {tab("/lead", "lead", "Lead")}
      {tab("/review", "review", "Review", waiting)}
      {tab("/more", "grid", "More")}
    </nav>
  );
}

function Toasts() {
  const list = useToasts();
  return (
    <div className="toasts">
      {list.map(t => <div key={t.id} className={`toast ${t.bad ? "bad" : ""}`}>{t.text}</div>)}
    </div>
  );
}

export function Layout() {
  return (
    <div className={`app ${desktop && isMac ? "mac" : ""}`}>
      <Sidebar />
      <main className="main">
        <Top />
        <Crash quiet>
          <CrewBar />
        </Crash>
        <Crash key={useLocation().pathname}>
          <Outlet />
        </Crash>
      </main>
      <Tabbar />
      <Toasts />
      <Viewer />
      <AskHost />
    </div>
  );
}
