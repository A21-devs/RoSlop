import { useRef, useState } from "react";
import type { BlenderRules } from "@roslop/core";
import { uploadAsset } from "../data/actions";
import { toast, useData, useSnap } from "../data/store";
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
  const text = [rules ? modelRulesText(rules) : "", refs.length ? `Reference files: ${refs.map(r => r.path).join(", ")}` : ""].filter(Boolean).join("\n\n");
  return {
    refs, setRefs, rules, setRules, text,
    attach: (body: string) => [body.trim(), text].filter(Boolean).join("\n\n"),
    reset() {
      setRefs([]);
      setRules(null);
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
        {x.refs.map(r => (
          <span key={r.path} className="pill">{r.name}<button style={{ marginLeft: 4 }} onClick={() => x.setRefs(list => list.filter(l => l.path !== r.path))}><Icon name="x" size={10} /></button></span>
        ))}
      </div>
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
