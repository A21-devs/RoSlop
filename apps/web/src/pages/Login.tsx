import { useEffect, useState } from "react";
import { connectCloud, db } from "../data/store";
import { Logo } from "../ui/bits";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState("");
  const [key, setKey] = useState("");
  const [providers, setProviders] = useState<("github" | "google")[]>([]);
  const demo = db.mode === "demo";

  // OAuth can't land back inside the desktop app yet, so it sticks to email there.
  useEffect(() => {
    if (!window.roslop) db.providers().then(setProviders);
  }, []);

  const go = async () => {
    setBusy(true);
    setError(null);
    const err = mode === "in" ? await db.signIn(email, password) : await db.signUp(email, password);
    setBusy(false);
    if (err) setError(err);
    else if (mode === "up") setError("Check your email to confirm, then sign in.");
  };

  return (
    <div className="login">
      <div className="card col" style={{ gap: 14 }}>
        <div className="row"><Logo size={34} /><div><b style={{ fontSize: 16 }}>RoSlop</b><div className="muted small">A crew of agents that builds your Roblox games</div></div></div>
        {demo ? (
          <>
            <p className="muted">To sync across your devices and run the crew, connect your Supabase project. It's free, and the README shows how to set it up in a few minutes.</p>
            <input className="input" placeholder="Project URL, like https://abcd.supabase.co" value={url} onChange={e => setUrl(e.target.value)} />
            <input className="input mono" placeholder="Anon public key" value={key} onChange={e => setKey(e.target.value)} />
            <button className="btn lg pri" disabled={!/^https:\/\//.test(url) || key.length < 20} onClick={() => connectCloud(url, key)}>Connect</button>
            <div className="row dim small"><hr className="grow" style={{ border: 0, borderTop: "1px solid var(--line)" }} />or<hr className="grow" style={{ border: 0, borderTop: "1px solid var(--line)" }} /></div>
            <button className="btn lg" onClick={() => db.signIn("", "")}>Just try the demo</button>
            <p className="dim small">The demo uses sample data that stays on this device. Nothing actually runs.</p>
          </>
        ) : (
          <>
            {providers.map(p => (
              <button key={p} className="btn lg" onClick={async () => setError(await db.signInWith(p))}>Continue with {p === "github" ? "GitHub" : "Google"}</button>
            ))}
            {providers.length > 0 && <div className="row dim small"><hr className="grow" style={{ border: 0, borderTop: "1px solid var(--line)" }} />or<hr className="grow" style={{ border: 0, borderTop: "1px solid var(--line)" }} /></div>}
            <input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && go()} />
            {error && <div className="small warn">{error}</div>}
            <button className="btn lg pri" disabled={busy || !email || password.length < 6} onClick={go}>{mode === "in" ? "Sign in" : "Make an account"}</button>
            <button className="btn ghost small" onClick={() => setMode(mode === "in" ? "up" : "in")}>{mode === "in" ? "New here? Make an account" : "Have an account? Sign in"}</button>
            {localStorage.getItem("roslop-cloud") && <button className="btn ghost small" onClick={() => connectCloud("", null)}>Use a different project</button>}
          </>
        )}
      </div>
    </div>
  );
}
