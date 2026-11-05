import { useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import guide from "../../../../docs/GUIDE.md?raw";

// The guide is docs/GUIDE.md, shown here as-is, so the app and the repo never disagree.

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Bold, inline code and links inside a line.
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*]+\*)/g;
  let at = 0, m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > at) out.push(text.slice(at, m.index));
    const t = m[0];
    if (t.startsWith("**")) out.push(<b key={m.index}>{t.slice(2, -2)}</b>);
    else if (t.startsWith("`")) out.push(<code key={m.index} className="mono" style={{ background: "var(--raise)", padding: "1px 5px", borderRadius: 4, fontSize: "0.92em" }}>{t.slice(1, -1)}</code>);
    else if (t.startsWith("[")) {
      const [, label, href] = t.match(/\[([^\]]+)\]\(([^)]+)\)/)!;
      out.push(/^https?:/.test(href) ? <a key={m.index} className="acc" href={href} target="_blank" rel="noreferrer">{label}</a> : <span key={m.index} className="acc">{label}</span>);
    } else out.push(<i key={m.index}>{t.slice(1, -1)}</i>);
    at = m.index + t.length;
  }
  if (at < text.length) out.push(text.slice(at));
  return out;
}

function render(md: string): { body: ReactNode[]; toc: { id: string; title: string }[] } {
  const lines = md.split("\n");
  const body: ReactNode[] = [];
  const toc: { id: string; title: string }[] = [];
  let i = 0, k = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("```")) {
      const code: string[] = [];
      for (i++; i < lines.length && !lines[i].startsWith("```"); i++) code.push(lines[i]);
      body.push(<pre key={k++} className="mono" style={{ background: "var(--raise)", padding: 14, borderRadius: 8, overflowX: "auto", fontSize: 12, lineHeight: 1.5 }}>{code.join("\n")}</pre>);
      i++;
      continue;
    }
    const h = line.match(/^(#{1,3}) (.+)$/);
    if (h) {
      const id = slug(h[2]);
      if (h[1].length === 2) toc.push({ id, title: h[2] });
      const size = h[1].length === 1 ? 26 : h[1].length === 2 ? 19 : 15.5;
      body.push(<div key={k++} id={id} style={{ fontSize: size, fontWeight: 650, margin: h[1].length === 1 ? "0 0 10px" : h[1].length === 2 ? "34px 0 10px" : "22px 0 8px", scrollMarginTop: 16 }}>{h[2]}</div>);
      i++;
      continue;
    }
    if (line.startsWith("|")) {
      const rows: string[][] = [];
      for (; i < lines.length && lines[i].startsWith("|"); i++) if (!/^\|[\s|:-]+\|$/.test(lines[i])) rows.push(lines[i].split("|").slice(1, -1).map(c => c.trim()));
      body.push(
        <div key={k++} className="card list" style={{ padding: "0 14px", margin: "8px 0" }}>
          {rows.map((r, j) => <div key={j} className="row" style={{ padding: "8px 0", gap: 12, fontWeight: j === 0 ? 600 : 400, alignItems: "flex-start" }}>{r.map((c, n) => <span key={n} style={{ flex: n === 1 ? 3 : 1, minWidth: 0 }}>{inline(c)}</span>)}</div>)}
        </div>,
      );
      continue;
    }
    if (/^(\s*)([-*]|\d+\.) /.test(line)) {
      const items: { depth: number; text: string; num: boolean }[] = [];
      for (; i < lines.length && /^(\s*)([-*]|\d+\.) /.test(lines[i]); i++) {
        const m = lines[i].match(/^(\s*)([-*]|\d+\.) (.*)$/)!;
        items.push({ depth: m[1].length >= 2 ? 1 : 0, text: m[3], num: /\d/.test(m[2]) });
      }
      const List = items[0].num ? "ol" : "ul";
      body.push(<List key={k++} style={{ margin: "6px 0 10px", paddingLeft: 22, lineHeight: 1.65 }}>{items.map((it, j) => <li key={j} style={{ marginLeft: it.depth * 18 }}>{inline(it.text)}</li>)}</List>);
      continue;
    }
    if (!line.trim()) {
      i++;
      continue;
    }
    const para: string[] = [];
    for (; i < lines.length && lines[i].trim() && !/^(#|```|\||\s*([-*]|\d+\.) )/.test(lines[i]); i++) para.push(lines[i]);
    body.push(<p key={k++} style={{ margin: "6px 0 10px", lineHeight: 1.7 }}>{inline(para.join(" "))}</p>);
  }
  return { body, toc };
}

export function Guide() {
  const { body, toc } = useMemo(() => render(guide), []);
  return (
    <div className="content" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 220px", gap: 28, alignItems: "start" }}>
      <div style={{ maxWidth: 760 }}>{body}</div>
      <div className="card pad col hide-m" style={{ position: "sticky", top: 0, gap: 6 }}>
        <b className="small">On this page</b>
        {toc.map(t => <a key={t.id} className="small muted" href={`#${t.id}`} onClick={e => { e.preventDefault(); document.getElementById(t.id)?.scrollIntoView({ behavior: "smooth" }); }}>{t.title}</a>)}
        <Link className="small acc" to="/settings" style={{ marginTop: 8 }}>Open Settings</Link>
      </div>
    </div>
  );
}
