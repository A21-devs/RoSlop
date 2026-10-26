import { useEffect, useRef, useState } from "react";

// The desktop app doesn't support the browser's prompt(), so this asks for text in the app instead.
interface Request {
  title: string;
  value: string;
  placeholder?: string;
  done: (v: string | null) => void;
}

let open: ((r: Request) => void) | null = null;

export function askText(title: string, value = "", placeholder?: string): Promise<string | null> {
  return new Promise(done => (open ? open({ title, value, placeholder, done }) : done(null)));
}

export function AskHost() {
  const [req, setReq] = useState<Request | null>(null);
  const [text, setText] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    open = r => {
      setText(r.value);
      setReq(r);
    };
    return () => {
      open = null;
    };
  }, []);
  useEffect(() => {
    if (req) setTimeout(() => input.current?.select(), 0);
  }, [req]);
  if (!req) return null;
  const finish = (v: string | null) => {
    req.done(v);
    setReq(null);
  };
  return (
    <div className="viewer" style={{ display: "grid", placeItems: "center", background: "rgba(5, 6, 9, .6)" }} onClick={() => finish(null)}>
      <form className="card pad col" style={{ width: "min(420px, calc(100vw - 32px))", gap: 12 }} onClick={e => e.stopPropagation()} onSubmit={e => { e.preventDefault(); finish(text); }}>
        <b style={{ fontSize: 15 }}>{req.title}</b>
        <input ref={input} className="input" value={text} placeholder={req.placeholder} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Escape" && finish(null)} />
        <div className="row" style={{ justifyContent: "flex-end" }}>
          <button type="button" className="btn ghost" onClick={() => finish(null)}>Cancel</button>
          <button type="submit" className="btn pri" disabled={!text.trim()}>OK</button>
        </div>
      </form>
    </div>
  );
}
