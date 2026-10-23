import { useState } from "react";
import { db } from "../data/store";
import { Logo } from "../ui/bits";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const demo = db.mode === "demo";

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
            <p className="muted">This copy isn't connected to a database, so it runs as a demo with sample data that stays in your browser.</p>
            <button className="btn lg pri" onClick={() => db.signIn("", "")}>Try the demo</button>
            <p className="dim small">To sync across devices, add your Supabase URL and key to <span className="mono">apps/web/.env</span>. The README walks through it.</p>
          </>
        ) : (
          <>
            <button className="btn lg" onClick={() => db.signInWith("github")}>Continue with GitHub</button>
            <button className="btn lg" onClick={() => db.signInWith("google")}>Continue with Google</button>
            <div className="row dim small"><hr className="grow" style={{ border: 0, borderTop: "1px solid var(--line)" }} />or<hr className="grow" style={{ border: 0, borderTop: "1px solid var(--line)" }} /></div>
            <input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && go()} />
            {error && <div className="small warn">{error}</div>}
            <button className="btn lg pri" disabled={busy || !email || password.length < 6} onClick={go}>{mode === "in" ? "Sign in" : "Make an account"}</button>
            <button className="btn ghost small" onClick={() => setMode(mode === "in" ? "up" : "in")}>{mode === "in" ? "New here? Make an account" : "Have an account? Sign in"}</button>
          </>
        )}
      </div>
    </div>
  );
}
