import { useRef, useState } from "react";
import { GAME_TYPES, type BlenderRules } from "@roslop/core";
import { uploadAsset } from "../data/actions";
import { db, toast, useData, useSnap } from "../data/store";
import { Icon } from "./bits";
import { ModelFields, modelRulesText } from "./ModelRules";

export interface Ref {
  path: string;
  name: string;
}

const MODELING = /\b(model|models|modeling|modelling|blender|mesh|meshes|prop|props|3d|low ?poly|character|rig|sculpt|asset)\b/i;

// What gets attached to a task besides the words: reference files and, for modeling, the model rules.
export function useExtras() {
  const [refs, setRefs] = useState<Ref[]>([]);
  const [rules, setRules] = useState<BlenderRules | null>(null);
  // null means use the style targets saved in Settings for this kind of game.
  const [styles, setStyles] = useState<string[] | null>(null);
  const text = [
    rules ? modelRulesText(rules) : "",
    refs.length ? `Reference files: ${refs.map(r => r.path).join(", ")}` : "",
    styles?.length ? `Style targets (this task only): ${styles.join(" | ")}` : "",
  ].filter(Boolean).join("\n\n");
  return {
    refs, setRefs, rules, setRules, styles, setStyles, text,
    attach: (body: string) => [body.trim(), text].filter(Boolean).join("\n\n"),
    reset() {
      setRefs([]);
      setRules(null);
      setStyles(null);
    },
  };
}

export function Extras({ x, about, compact }: { x: ReturnType<typeof useExtras>; about: string; compact?: boolean }) {
  const s = useSnap();
  const { game } = useData();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(0);
  const library = s.assets.filter(a => a.kind === "reference" && a.file_url && !x.refs.some(r => r.path === a.file_url));
  const modeling = MODELING.test(about);

  const add = async (files: FileList | null) => {
    if (!files) return;
    for (const f of [...files]) {
      setBusy(n => n + 1);
      try {
        const path = await uploadAsset(f, "reference", game === "all" ? null : game);
        x.setRefs(r => [...r, { path, name: f.name }]);
      } catch (e) {
        toast(e instanceof Error ? e.message : String(e), true);
      } finally {
        setBusy(n => n - 1);
      }
    }
  };

  return (
    <div className="col" style={{ gap: 8 }}>
      <div className="row wrap" style={{ gap: 6 }}>
        <button className="btn sm" onClick={() => input.current?.click()}><Icon name="upload" size={13} />{busy ? `Uploading ${busy}…` : "Add reference files"}</button>
        <input ref={input} type="file" multiple hidden onChange={e => add(e.target.files)} />
        {library.length > 0 && (
          <select className="input" style={{ width: compact ? 150 : 190, minHeight: 28 }} value="" onChange={e => {
            const a = library.find(l => l.id === e.target.value);
            if (a) x.setRefs(r => [...r, { path: a.file_url!, name: a.name }]);
          }}>
            <option value="">From your references…</option>
            {library.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        )}
        <button className={`btn sm ${x.rules ? "pri" : modeling ? "" : "ghost"}`} onClick={() => x.setRules(x.rules ? null : { ...s.settings.blender })}>
          <Icon name="settings" size={13} />{x.rules ? "Model rules on" : modeling ? "Set model rules for this" : "Model rules"}
        </button>
        <button className={`btn sm ${x.styles ? "pri" : "ghost"}`} onClick={() => x.setStyles(x.styles ? null : [])}>
          <Icon name="right" size={13} />{x.styles ? `Style: ${x.styles.length || "pick"}` : "Style"}
        </button>
        {x.refs.map(r => (
          <span key={r.path} className="pill">{r.name}<button style={{ marginLeft: 4 }} onClick={() => x.setRefs(list => list.filter(l => l.path !== r.path))}><Icon name="x" size={10} /></button></span>
        ))}
      </div>
      {x.styles && <StylePick x={x} />}
      {x.rules && (
        <div className="card flat pad col" style={{ background: "var(--raise)", gap: 10 }}>
          <div className="muted small">Just for this task. Your defaults in Settings stay the same.</div>
          <ModelFields r={x.rules} set={patch => x.setRules(r => (r ? { ...r, ...patch } : r))} />
          <input className="input" placeholder="Anything else for these models…" value={x.rules.notes} onChange={e => x.setRules(r => (r ? { ...r, notes: e.target.value } : r))} />
        </div>
      )}
    </div>
  );
}

// Pick which saved style targets this one task should aim for, or add new ones, and save them
// for a kind of game if they should stick.
function StylePick({ x }: { x: ReturnType<typeof useExtras> }) {
  const st = useSnap().settings;
  const [text, setText] = useState("");
  const [type, setType] = useState("");
  const on = x.styles ?? [];
  const toggle = (t: string) => x.setStyles(on.includes(t) ? on.filter(y => y !== t) : [...on, t]);
  const add = (keep: boolean) => {
    const items = text.split(/\n/).map(t => t.trim()).filter(Boolean);
    if (!items.length) return;
    x.setStyles([...new Set([...on, ...items])]);
    if (keep) {
      void db.saveSettings({ style: [...st.style, ...items.filter(t => !st.style.some(s => s.target === t && s.type === type.trim())).map(target => ({ type: type.trim(), target }))] });
      toast(`Saved for ${type.trim() || "every game"}`);
    }
    setText("");
  };
  const groups = [...new Set(st.style.map(s => s.type))];
  return (
    <div className="card flat pad col" style={{ background: "var(--raise)", gap: 10 }}>
      <div className="muted small">What this task should look like. Pick saved targets or paste gameplay videos (YouTube, X, TikTok) or game names. With none picked, it uses the ones saved for its kind of game.</div>
      {groups.map(g => (
        <div key={g || "any"} className="row wrap" style={{ gap: 6 }}>
          <span className="small" style={{ fontWeight: 600, minWidth: 90 }}>{g || "Every game"}</span>
          {st.style.filter(s => s.type === g).map(s => (
            <button key={s.target} className={`pill ${on.includes(s.target) ? "ok" : ""}`} onClick={() => toggle(s.target)} title={s.target} style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.target.replace(/^https?:\/\/(www\.)?/, "")}</button>
          ))}
        </div>
      ))}
      <textarea className="textarea" style={{ minHeight: 48 }} placeholder="Paste video links or game names, one per line" value={text} onChange={e => setText(e.target.value)} />
      <div className="row wrap" style={{ gap: 8 }}>
        <button className="btn sm" disabled={!text.trim()} onClick={() => add(false)}>Use for this task</button>
        <span className="muted small">or save for</span>
        <input className="input" list="extras-types" style={{ width: 150, minHeight: 28 }} placeholder="Every game" value={type} onChange={e => setType(e.target.value)} />
        <button className="btn sm" disabled={!text.trim()} onClick={() => add(true)}>Save and use</button>
        <datalist id="extras-types">{GAME_TYPES.map(t => <option key={t} value={t} />)}</datalist>
      </div>
    </div>
  );
}
