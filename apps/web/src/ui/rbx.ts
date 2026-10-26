// Reads just enough of a Roblox .rbxm (binary) or .rbxmx (XML) file to say what's in it:
// which classes and how many, names, and keyframe times for animations.

export interface RbxSummary {
  classes: Record<string, number>;
  names: string[];
  duration: number | null;
  error?: string;
}

function lz4(src: Uint8Array, size: number): Uint8Array {
  const out = new Uint8Array(size);
  let i = 0, o = 0;
  while (i < src.length) {
    const token = src[i++];
    let lit = token >> 4;
    if (lit === 15) for (let b = 255; b === 255; ) lit += (b = src[i++]);
    out.set(src.subarray(i, i + lit), o);
    i += lit;
    o += lit;
    if (i >= src.length) break;
    const off = src[i] | (src[i + 1] << 8);
    i += 2;
    let len = token & 15;
    if (len === 15) for (let b = 255; b === 255; ) len += (b = src[i++]);
    len += 4;
    for (let k = 0; k < len; k++, o++) out[o] = out[o - off];
  }
  return out;
}

// Roblox stores floats with the sign bit moved to the end, then interleaves the bytes.
function floats(buf: Uint8Array, at: number, count: number): number[] {
  const out: number[] = [];
  const view = new DataView(new ArrayBuffer(4));
  for (let k = 0; k < count; k++) {
    const v = (buf[at + k] << 24) | (buf[at + count + k] << 16) | (buf[at + 2 * count + k] << 8) | buf[at + 3 * count + k];
    view.setUint32(0, ((v >>> 1) | (v << 31)) >>> 0);
    out.push(view.getFloat32(0));
  }
  return out;
}

function binary(bytes: Uint8Array): RbxSummary {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const text = new TextDecoder();
  const classes: Record<string, number> = {};
  const byId = new Map<number, string>();
  const names: string[] = [];
  const times: number[] = [];
  let at = 32;
  while (at + 16 <= bytes.length) {
    const name = text.decode(bytes.subarray(at, at + 4));
    const packed = dv.getUint32(at + 4, true);
    const size = dv.getUint32(at + 8, true);
    const start = at + 16;
    if (name === "END\0") break;
    let data: Uint8Array;
    if (packed === 0) data = bytes.subarray(start, start + size);
    else if (bytes[start] === 0x28 && bytes[start + 1] === 0xb5) return { classes, names, duration: null, error: "Saved with newer compression this preview can't read" };
    else data = lz4(bytes.subarray(start, start + packed), size);
    const d = new DataView(data.buffer, data.byteOffset, data.byteLength);
    if (name === "INST") {
      const id = d.getUint32(0, true);
      const len = d.getUint32(4, true);
      const cls = text.decode(data.subarray(8, 8 + len));
      const count = d.getUint32(8 + len + 1, true);
      byId.set(id, cls);
      classes[cls] = (classes[cls] ?? 0) + count;
    } else if (name === "PROP") {
      const id = d.getUint32(0, true);
      const len = d.getUint32(4, true);
      const prop = text.decode(data.subarray(8, 8 + len));
      const type = data[8 + len];
      const body = 9 + len;
      const cls = byId.get(id) ?? "";
      if (prop === "Name" && type === 0x01) {
        let p = body;
        while (p + 4 <= data.length && names.length < 40) {
          const n = d.getUint32(p, true);
          const s = text.decode(data.subarray(p + 4, p + 4 + n));
          if (s && !/^(Keyframe|Pose|Part|MeshPart|Attachment)$/.test(s) && /Sequence|Emitter|Beam|Trail|Model|Animation/.test(cls)) names.push(s);
          p += 4 + n;
        }
      } else if (prop === "Time" && type === 0x04 && cls === "Keyframe") {
        times.push(...floats(data, body, (data.length - body) / 4));
      }
    }
    at = start + (packed || size);
  }
  return { classes, names: [...new Set(names)], duration: times.length ? Math.max(...times) : null };
}

function xml(textContent: string): RbxSummary {
  const doc = new DOMParser().parseFromString(textContent, "text/xml");
  const classes: Record<string, number> = {};
  const names: string[] = [];
  let duration: number | null = null;
  for (const item of Array.from(doc.getElementsByTagName("Item"))) {
    const cls = item.getAttribute("class") ?? "?";
    classes[cls] = (classes[cls] ?? 0) + 1;
    const props = item.querySelector(":scope > Properties");
    const name = props?.querySelector(':scope > string[name="Name"]')?.textContent;
    if (name && /Sequence|Emitter|Beam|Trail|Model|Animation/.test(cls)) names.push(name);
    const t = props?.querySelector(':scope > float[name="Time"]')?.textContent;
    if (cls === "Keyframe" && t) duration = Math.max(duration ?? 0, Number(t));
  }
  return { classes, names: [...new Set(names)].slice(0, 40), duration };
}

export function readRbx(buf: ArrayBuffer): RbxSummary {
  const bytes = new Uint8Array(buf);
  const head = new TextDecoder().decode(bytes.subarray(0, 14));
  try {
    if (head.startsWith("<roblox!")) return binary(bytes);
    if (head.startsWith("<roblox")) return xml(new TextDecoder().decode(bytes));
    return { classes: {}, names: [], duration: null, error: "Not a Roblox model file" };
  } catch (e) {
    return { classes: {}, names: [], duration: null, error: e instanceof Error ? e.message : String(e) };
  }
}

const VFX = ["ParticleEmitter", "Beam", "Trail", "Fire", "Smoke", "Sparkles", "Explosion", "PointLight", "SpotLight", "Highlight"];

// One line for the card, and what kind of thing it is.
export function describe(s: RbxSummary): { kind: "animation" | "vfx" | "model" | "other"; line: string; detail: string[] } {
  const c = s.classes;
  const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;
  if (c.KeyframeSequence || c.CurveAnimation || c.Animation) {
    const joints = c.Pose && c.Keyframe ? Math.round(c.Pose / c.Keyframe) : null;
    return {
      kind: "animation",
      line: ["Animation", s.duration !== null ? `${s.duration.toFixed(2)}s` : null, c.Keyframe ? plural(c.Keyframe, "keyframe") : null, joints ? plural(joints, "joint") : null].filter(Boolean).join(" · "),
      detail: s.names,
    };
  }
  const fx = VFX.filter(k => c[k]);
  if (fx.length) {
    const label: Record<string, string> = { ParticleEmitter: "particle emitter", PointLight: "light", SpotLight: "spotlight" };
    return { kind: "vfx", line: ["VFX", ...fx.map(k => plural(c[k], label[k] ?? k.toLowerCase()))].join(" · "), detail: s.names };
  }
  const parts = (c.Part ?? 0) + (c.MeshPart ?? 0) + (c.UnionOperation ?? 0);
  if (parts) return { kind: "model", line: ["Model", plural(parts, "part"), c.Script || c.LocalScript || c.ModuleScript ? plural((c.Script ?? 0) + (c.LocalScript ?? 0) + (c.ModuleScript ?? 0), "script") : null].filter(Boolean).join(" · "), detail: s.names };
  const top = Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, n]) => `${n} ${k}`);
  return { kind: "other", line: top.join(" · ") || "Empty", detail: s.names };
}
