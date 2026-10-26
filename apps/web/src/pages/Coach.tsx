import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { askLead } from "../data/actions";
import type { Template } from "@roslop/core";
import { toast, useData, useSnap } from "../data/store";
import { suggestions, TEMPLATES, useTemplates } from "../data/templates";
import { Del, Icon } from "../ui/bits";
import { Extras, useExtras } from "../ui/Extras";
import { askText } from "../ui/Ask";

// Runs in the browser, so coaching a prompt costs none of your usage.
interface Check {
  id: string;
  label: string;
  hint: string;
  test: RegExp;
  ask: string;
  write: (a: string) => string;
  picks: string[];
}

const CHECKS: Check[] = [
  { id: "why", label: "Why you want it", hint: "The Lead can check the numbers behind it before anyone builds.", test: /\b(because|bored|quit|leave|leaving|feel|so that|players|people|retention)\b/i, ask: "What's the problem with how it is now?", write: a => `Why: ${a}.`, picks: ["People get bored", "New players quit early", "It feels unfair", "It looks bad on phones"] },
  { id: "who", label: "Who it's for", hint: "A boss for level 30 squads and one for anyone past 20 are different jobs.", test: /\b(level|new players|beginners|everyone|top \d|squad|veterans|for (kids|new|everyone))\b/i, ask: "Who should this be for?", write: a => `It's for ${a}.`, picks: ["Brand new players", "Players around the midgame", "The top players", "Everyone"] },
  { id: "done", label: "When it's done", hint: "Without a finish line, agents keep polishing and you pay for it.", test: /\b(done when|until|should be able|tries|at least|under \d|within|test)\b/i, ask: "How will you know it worked?", write: a => `Done when ${a}.`, picks: ["Playtest gets through it without help", "It fits on an iPhone SE", "Clueless Tester doesn't get stuck"] },
  { id: "keep", label: "What not to touch", hint: "Otherwise someone will improve something you liked.", test: /\b(don'?t|do not|leave|keep|without changing|not the)\b/i, ask: "Anything they should leave alone?", write: a => `Leave alone: ${a}.`, picks: ["The economy", "Existing UI", "Saves and data"] },
  { id: "ref", label: "A reference", hint: "One clip or game beats three paragraphs about a vibe.", test: /(https?:\/\/|\blike (in )?[A-Z]|\bsimilar to\b|\breference\b)/, ask: "Anything it should feel like?", write: a => `Reference: ${a}.`, picks: [] },
];


export function Coach() {
  const s = useSnap();
  const { game } = useData();
  const nav = useNavigate();
  const [text, setText] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [forGame, setForGame] = useState(game === "all" ? s.games[0]?.id ?? "" : game);
  const [group, setGroup] = useState("All");

  const g = s.games.find(x => x.id === forGame);
  const name = g?.name ?? "the game";
  const ideas = useMemo(() => suggestions(s, forGame), [s, forGame]);
  const groups = ["All", ...new Set(TEMPLATES.map(t => t.group))];
  const shown = TEMPLATES.filter(t => group === "All" || t.group === group);

  const missing = CHECKS.filter(c => !c.test.test(text));
  const added = missing.filter(c => answers[c.id]?.trim()).map(c => c.write(answers[c.id].trim()));
  const written = [text.trim(), ...added].filter(Boolean).join("\n\n");
  const extras = useExtras();
  const better = written ? extras.attach(written) : "";
  const mine = useTemplates();
  const guesses = missing.length - added.length;
  const words = text.trim().split(/\s+/).filter(Boolean).length;

  const use = (body: string) => {
    setText(body);
    setAnswers({});
    scrollTo({ top: 0, behavior: "smooth" });
  };
  const send = async (t: string) => {
    await askLead(s, t, forGame || null);
    extras.reset();
    nav("/lead");
  };
  const saveTemplate = async () => {
    const title = (await askText("Name this template", written.split("\n")[0].slice(0, 60)))?.trim();
    if (!title) return;
    await mine.save({ id: crypto.randomUUID(), title, body: written, refs: extras.refs.map(r => r.path) });
    toast(`Saved "${title}" to your templates`);
  };
  const useMine = (t: Template) => {
    use(t.body);
    extras.setRefs(t.refs.map(path => ({ path, name: s.assets.find(a => a.file_url === path)?.name ?? path.split("/").pop()!.replace(/^\d+-/, "") })));
  };

  return (
    <div className="content">
      <div className="head">
        <div className="grow"><h1 className="page">Prompt engineering</h1><p className="lede">Write it however you want. This shows what the crew would have to guess and fills the gaps before it goes to the Lead. Guesses turn into rework, and rework eats your usage. It all runs on your device, so it's free.</p></div>
        <label className="field" style={{ minWidth: 220 }}><span>For</span>
          <select className="input" value={forGame} onChange={e => setForGame(e.target.value)}>
            <option value="">No particular game</option>
            {s.games.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </label>
      </div>

      <div className="grid2" style={{ gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)" }}>
        <div className="col" style={{ gap: 14 }}>
          <div className="card pad">
            <div className="sec-h"><h3>What you want</h3>{text && <button className="r btn sm ghost" onClick={() => use("")}>Clear</button>}</div>
            <textarea className="textarea" rows={6} style={{ width: "100%", minHeight: 140 }} value={text} onChange={e => setText(e.target.value)} placeholder={`add a boss to ${g ? name.toLowerCase() : "frostpeak"} thats actually hard, players are bored`} />
            {words > 0 && (
              <div style={{ marginTop: 12 }}>
                <div className="row small"><span className="muted grow">How much the crew would have to guess</span><b className={guesses > 2 ? "warn" : "ok"}>{guesses === 0 ? "nothing" : guesses > 2 ? "a lot" : "a little"}</b></div>
                <div className="bar" style={{ marginTop: 6, height: 6 }}><i style={{ width: `${(guesses / CHECKS.length) * 100}%`, background: guesses > 2 ? "var(--warn)" : "var(--ok)" }} /></div>
              </div>
            )}
          </div>
          {words > 0 && (
            <div className="card list" style={{ padding: "4px 16px" }}>
              {CHECKS.map(c => {
                const ok = !missing.includes(c) || !!answers[c.id]?.trim();
                return (
                  <div key={c.id} style={{ padding: "10px 0" }}>
                    <div className="row" style={{ alignItems: "flex-start" }}>
                      <span className={`pill ${ok ? "ok" : "warn"}`} style={{ width: 20, padding: 0, justifyContent: "center" }}><Icon name={ok ? "check" : "plus"} size={11} /></span>
                      <div className="grow"><div style={{ fontWeight: 500 }}>{c.label}</div>{!ok && <div className="muted small">{c.hint}</div>}</div>
                    </div>
                    {missing.includes(c) && (
                      <div className="col" style={{ marginTop: 8, paddingLeft: 28 }}>
                        <input className="input" placeholder={c.ask} value={answers[c.id] ?? ""} onChange={e => setAnswers({ ...answers, [c.id]: e.target.value })} />
                        {!!c.picks.length && <div className="row wrap" style={{ gap: 6 }}>{c.picks.map(p => <button key={p} className={`pill ${answers[c.id] === p ? "on" : ""}`} onClick={() => setAnswers({ ...answers, [c.id]: p })}>{p}</button>)}</div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <div className="card pad" style={{ borderColor: "var(--line-2)" }}>
            <div className="sec-h"><h3>What the Lead will get</h3></div>
            <div style={{ marginBottom: 12 }}><Extras x={extras} about={text} /></div>
            <div style={{ whiteSpace: "pre-wrap", minHeight: 60, lineHeight: 1.6 }} className={better ? "" : "muted"}>{better || "Start typing above, or pick something on the right."}</div>
            <div className="row wrap" style={{ marginTop: 14 }}>
              <button className="btn pri" disabled={!better} onClick={() => send(better)}><Icon name="up" size={14} />Send to Lead</button>
              <button className="btn" disabled={!better} onClick={() => navigator.clipboard.writeText(better)}>Copy</button>
              {added.length > 0 && <button className="btn ghost" onClick={() => send(extras.attach(text))}>Send mine as is</button>}
              <button className="btn ghost" disabled={!written} onClick={saveTemplate}><Icon name="plus" size={14} />Save as template</button>
            </div>
          </div>
        </div>

        <div className="col" style={{ gap: 14 }}>
          {ideas.length > 0 && (
            <div className="card pad">
              <div className="sec-h"><h3>Suggested for {name}</h3><span className="r">from what's going on with it</span></div>
              <div className="col">
                {ideas.map(i => (
                  <button key={i.title} className="card flat" style={{ padding: "10px 12px", textAlign: "left", background: "var(--raise)" }} onClick={() => use(i.body)}>
                    <div className="row"><b className="grow">{i.title}</b><span className="muted small">{i.why}</span></div>
                    <div className="muted small" style={{ marginTop: 3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{i.body}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="card pad">
            <div className="sec-h"><h3>Your templates</h3><span className="c">{mine.list.length}</span></div>
            {!mine.list.length && <div className="muted small">Write something on the left and hit Save as template. Reference files you attached come with it.</div>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
              {mine.list.map(t => (
                <div key={t.id} className="has-del">
                  <Del onDelete={() => mine.remove(t.id)} />
                  <button className="card flat" style={{ padding: "10px 12px", textAlign: "left", background: "var(--raise)", width: "100%", minWidth: 0 }} onClick={() => useMine(t)}>
                    <div style={{ fontWeight: 500, paddingRight: 24 }}>{t.title}</div>
                    <div className="muted small" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{t.body}</div>
                    {t.refs.length > 0 && <div className="dim small" style={{ marginTop: 4 }}>{t.refs.length} reference file{t.refs.length > 1 ? "s" : ""}</div>}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="card pad">
            <div className="sec-h"><h3>Templates</h3><span className="c">{TEMPLATES.length}</span></div>
            <div className="row wrap" style={{ gap: 6, marginBottom: 10 }}>
              {groups.map(x => <button key={x} className={`pill ${group === x ? "on" : ""}`} onClick={() => setGroup(x)}>{x}</button>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
              {shown.map(t => (
                <button key={t.title} className="card flat" style={{ padding: "10px 12px", textAlign: "left", background: "var(--raise)", minWidth: 0 }} onClick={() => use(t.body(name))}>
                  <div style={{ fontWeight: 500 }}>{t.title}</div>
                  <div className="muted small" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{t.body(name)}</div>
                </button>
              ))}
            </div>
            <div className="dim small" style={{ marginTop: 8 }}>Square brackets are yours to fill in.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
