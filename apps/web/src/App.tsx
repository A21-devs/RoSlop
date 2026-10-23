import { useEffect } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { db, useData } from "./data/store";
import { Coach } from "./pages/Coach";
import { Games } from "./pages/Games";
import { Home } from "./pages/Home";
import { Lead } from "./pages/Lead";
import { Library } from "./pages/Library";
import { Login } from "./pages/Login";
import { Market } from "./pages/Market";
import { More } from "./pages/More";
import { Pitches } from "./pages/Pitches";
import { Review } from "./pages/Review";
import { Settings } from "./pages/Settings";
import { Tasks } from "./pages/Tasks";
import { Team } from "./pages/Team";
import { Vault } from "./pages/Vault";
import { Layout } from "./ui/Layout";

function deviceName() {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Android/.test(ua)) return "Android phone";
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : "Safari";
  return `${browser} on ${/Mac/.test(ua) ? "Mac" : /Win/.test(ua) ? "Windows" : "Linux"}`;
}

// The desktop app runs the crew. Browsers and phones just check in as remotes.
function useCheckIn() {
  const { user, snap } = useData();
  const ready = !!user && !!snap;
  useEffect(() => {
    if (!ready || db.mode === "demo") return;
    if (window.roslop) {
      db.session().then(s => s && window.roslop!.startRunner(s));
      return;
    }
    const key = "roslop-device";
    const beat = async () => {
      const id = localStorage.getItem(key);
      const now = new Date().toISOString();
      if (id && snap!.machines.some(m => m.id === id)) return db.update("machines", id, { last_seen: now });
      const m = await db.insert("machines", { name: deviceName(), os: /iPhone|iPad/.test(navigator.userAgent) ? "ios" : /Android/.test(navigator.userAgent) ? "android" : "web", role: "remote", last_seen: now, studio_slots: 0, provider: null });
      localStorage.setItem(key, m.id);
    };
    beat();
    const t = setInterval(beat, 120000);
    return () => clearInterval(t);
  }, [ready]);
}

export function App() {
  const { user, snap, problem, retry } = useData();
  useCheckIn();
  if (user && problem) {
    return (
      <div className="login">
        <div className="card col" style={{ gap: 12 }}>
          <b>Can't load your stuff</b>
          <div className="muted">{problem}</div>
          <div className="row"><button className="btn pri" onClick={retry}>Try again</button><button className="btn ghost" onClick={() => db.signOut()}>Sign out</button></div>
        </div>
      </div>
    );
  }
  if (user === undefined || (user && !snap)) return <div className="login muted">Loading…</div>;
  if (!user) return <Login />;
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="lead" element={<Lead />} />
          <Route path="team/:agent?" element={<Team />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="review/:id?" element={<Review />} />
          <Route path="coach" element={<Coach />} />
          <Route path="games" element={<Games />} />
          <Route path="pitches" element={<Pitches />} />
          <Route path="market" element={<Market />} />
          <Route path="library" element={<Library />} />
          <Route path="vault" element={<Vault />} />
          <Route path="settings/:section?" element={<Settings />} />
          <Route path="more" element={<More />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
