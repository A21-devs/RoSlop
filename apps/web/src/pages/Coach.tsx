import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { askLead } from "../data/actions";
import { useData, useSnap } from "../data/store";
import { Icon } from "../ui/bits";

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
  { id: "done", label: "When it's done", hint: "Without a finish line, agents keep polishing and you pay for it.", test: /\b(done when|until|should be able|tries|at least|under \d|within|test)\b/i, ask: "How will you know it worked?", write: a => `Done when ${a}.`, picks: ["Playtest gets through it without help", "It fits on an iPhone SE", "Kid Tester doesn't get stuck"] },
  { id: "keep", label: "What not to touch", hint: "Otherwise someone will improve something you liked.", test: /\b(don'?t|do not|leave|keep|without changing|not the)\b/i, ask: "Anything they should leave alone?", write: a => `Leave alone: ${a}.`, picks: ["The economy", "Existing UI", "Saves and data"] },
  { id: "ref", label: "A reference", hint: "One clip or game beats three paragraphs about a vibe.", test: /(https?:\/\/|\blike (in )?[A-Z]|\bsimilar to\b|\breference\b)/, ask: "Anything it should feel like?", write: a => `Reference: ${a}.`, picks: [] },
];

const TEMPLATES = [
  ["A boss fight", "Add a boss to [zone]. It's for [who]. It should be hard because of [attacks you dodge, phases, adds], not a huge HP bar. Done when Playtest beats it in 3 to 6 tries with [squad]."],
  ["Something's broken", "When I [what you did], [what happened]. I expected [what should happen]. It happens on [PC / phone]."],
  ["The first 5 minutes", "New players [what they do wrong or where they quit]. By minute 5 they should have [goal]. Don't add more popups."],
  ["Copy a feeling", "Make [thing] feel like [game or clip]. What I like about it is [specific part]."],
  ["A shop item", "Add [item] to the shop for [price]. It's for [who buys it]. It must not [what it can't break]."],
  ["Too slow or too fast", "[Part of the game] feels too [slow / fast] around [level or minute]. It should take about [time]."],
];

export function Coach() {
  const s = useSnap();
  const { game } = useData();
  const nav = useNavigate();
  const [text, setText] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const missing = CHECKS.filter(c => !c.test.test(text));
  const added = missing.filter(c => answers[c.id]?.trim()).map(c => c.write(answers[c.id].trim()));
  const better = [text.trim(), ...added].filter(Boolean).join("\n\n");
  const guesses = missing.length - added.length;
  const words = text.trim().split(/\s+/).filter(Boolean).length;

  const send = async (t: string) => {
    await askLead(s, t, game === "all" ? null : game);
    nav("/lead");
  };

  return (
    <div className="content">
      <div className="head">
        <div className="grow"><h1 className="page">Prompt coach</h1><p className="lede">Write it however you want. This shows what the crew would have to guess, and fills the gaps before it goes to the Lead. Guesses turn into rework, and rework eats your usage.</p></div>
      </div>
      <div className="grid2" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="col" style={{ gap: 14 }}>
          <div className="card pad">
            <div className="sec-h"><h3>What you want</h3></div>
            <textarea className="textarea" rows={5} value={text} onChange={e => setText(e.target.value)} placeholder="add a boss to frostpeak thats actually hard, players are bored" />
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
        </div>
        <div className="col" style={{ gap: 14 }}>
          <div className="card pad" style={{ borderColor: "var(--line-2)" }}>
            <div className="sec-h"><h3>What the Lead will get</h3></div>
            <div style={{ whiteSpace: "pre-wrap", minHeight: 80, lineHeight: 1.6 }} className={better ? "" : "muted"}>{better || "Start typing on the left."}</div>
            <div className="row wrap" style={{ marginTop: 14 }}>
              <button className="btn pri" disabled={!better} onClick={() => send(better)}><Icon name="up" size={14} />Send to Lead</button>
              <button className="btn" disabled={!better} onClick={() => navigator.clipboard.writeText(better)}>Copy</button>
              {added.length > 0 && <button className="btn ghost" onClick={() => send(text)}>Send mine as is</button>}
            </div>
          </div>
          <div className="card pad">
            <div className="sec-h"><h3>Start from a template</h3></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {TEMPLATES.map(([t, body]) => (
                <button key={t} className="card flat" style={{ padding: "10px 12px", textAlign: "left", background: "var(--raise)" }} onClick={() => setText(body)}>
                  <div style={{ fontWeight: 500 }}>{t}</div>
                  <div className="muted small trunc">{body}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
