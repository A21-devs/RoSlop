import { BLENDER_EDGES, BLENDER_PALETTES, BLENDER_STYLES, type BlenderRules } from "@roslop/core";

// The model look, used in Settings for the defaults and on a task to change them for that task.
export function ModelFields({ r, set }: { r: BlenderRules; set: (patch: Partial<BlenderRules>) => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
      <label className="field"><span>Style</span>
        <select className="input" value={r.style} onChange={e => set({ style: e.target.value })}>
          {[...new Set([r.style, ...BLENDER_STYLES])].map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </label>
      <label className="field"><span>Colors</span>
        <select className="input" value={r.palette} onChange={e => set({ palette: e.target.value })}>
          {[...new Set([r.palette, ...BLENDER_PALETTES])].map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </label>
      <label className="field"><span>Edges</span>
        <select className="input" value={r.edges} onChange={e => set({ edges: e.target.value })}>
          {[...new Set([r.edges, ...BLENDER_EDGES])].map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </label>
      <label className="field"><span>Max triangles per model</span>
        <select className="input" value={r.max_tris} onChange={e => set({ max_tris: Number(e.target.value) })}>
          {[300, 500, 1500, 4000, 8000, 15000, 20000].map(v => <option key={v} value={v}>{v.toLocaleString()}</option>)}
        </select>
      </label>
      <label className="field"><span>Texture size</span>
        <select className="input" value={r.texture} onChange={e => set({ texture: Number(e.target.value) as BlenderRules["texture"] })}>
          {[256, 512, 1024].map(v => <option key={v} value={v}>{v} x {v}</option>)}
        </select>
      </label>
      <label className="field"><span>Collision in Studio</span>
        <select className="input" value={r.collision} onChange={e => set({ collision: e.target.value as BlenderRules["collision"] })}>
          <option value="box">Box, cheapest</option><option value="hull">Hull</option><option value="precise">Precise, only if needed</option>
        </select>
      </label>
    </div>
  );
}

export function modelRulesText(r: BlenderRules): string {
  return [
    "Model rules (this task only):",
    `- Style: ${r.style}, ${r.palette} colors, ${r.edges} edges`,
    `- At most ${r.max_tris.toLocaleString()} triangles per model, textures ${r.texture}x${r.texture}`,
    `- Collision: ${r.collision}${r.single_material ? ", one material per model" : ""}${r.bake ? ", detail baked into textures" : ""}`,
    r.notes.trim() ? `- Also: ${r.notes.trim()}` : "",
  ].filter(Boolean).join("\n");
}
