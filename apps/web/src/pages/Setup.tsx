import { useState } from "react";
import sql from "../../../../supabase/setup.sql?raw";
import { cloud, db } from "../data/store";
import { Icon, Logo } from "../ui/bits";

export const needsSetup = (problem: string) => /missing some tables|version behind/.test(problem);

// Walks someone through creating the tables, since the app itself isn't allowed to.
export function Setup({ retry }: { retry(): void }) {
  const [copied, setCopied] = useState(false);
  const ref = cloud?.url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  const editor = ref ? `https://supabase.com/dashboard/project/${ref}/sql/new` : "https://supabase.com/dashboard";

  const copy = async () => {
    await navigator.clipboard.writeText(sql);
    setCopied(true);
  };

  const step = (n: number, body: React.ReactNode) => (
    <div className="row" style={{ alignItems: "flex-start", gap: 12 }}>
      <span className="pill acc" style={{ width: 22, justifyContent: "center", padding: 0, flex: "none" }}>{n}</span>
      <div className="grow">{body}</div>
    </div>
  );

  return (
    <div className="login">
      <div className="card col" style={{ gap: 16, maxWidth: 460 }}>
        <div className="row"><Logo size={30} /><b style={{ fontSize: 16 }}>One last bit of setup</b></div>
        <p className="muted">Your Supabase project needs RoSlop's tables before it can save anything. It takes about a minute, and you only do it once.</p>
        {step(1, <><div style={{ marginBottom: 8 }}>Copy the setup code.</div><button className="btn pri" onClick={copy}><Icon name={copied ? "check" : "clip"} size={14} />{copied ? "Copied" : "Copy setup code"}</button></>)}
        {step(2, <><div style={{ marginBottom: 8 }}>Open your project's SQL editor. Sign in to Supabase if it asks.</div><button className="btn" onClick={() => window.open(editor)}><Icon name="ext" size={14} />Open my SQL editor</button></>)}
        {step(3, <div>Click in the big empty box, paste (Ctrl+V, or Cmd+V on a Mac), then press <b>Run</b> in the bottom right. It should say "Success. No rows returned."</div>)}
        {step(4, <><div style={{ marginBottom: 8 }}>Come back here.</div><button className="btn pri" onClick={retry}>I ran it, try again</button></>)}
        <button className="btn ghost small" style={{ alignSelf: "flex-start" }} onClick={() => db.signOut()}>Sign out</button>
      </div>
    </div>
  );
}
