import { nativeImage } from "electron";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative, resolve, sep } from "node:path";

// Pictures already in the vault, so the owner can pick some and put them in the Library.

const IMAGES = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp"]);

export interface VaultImage {
  path: string;
  area: string;
  name: string;
  size: number;
  modified: string;
}

function inside(root: string, file: string) {
  const r = resolve(root), f = resolve(file);
  return f === r || f.startsWith(r + sep);
}

export function vaultImages(root: string): VaultImage[] {
  const out: VaultImage[] = [];
  const walk = (dir: string, depth: number) => {
    if (depth > 8 || out.length > 5000) return;
    let list;
    try {
      list = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of list) {
      if (e.name.startsWith(".")) continue;
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p, depth + 1);
      else if (IMAGES.has(extname(e.name).toLowerCase())) {
        const st = statSync(p);
        const rel = relative(root, p).split(sep);
        // References/Building/img/x.png is in the Building area; anything else goes by its top folder.
        const area = rel[0] === "References" && rel.length > 2 ? rel[1] : rel.length > 1 ? rel[0] : "Vault";
        out.push({ path: p, area, name: e.name.replace(/\.[^.]+$/, ""), size: st.size, modified: st.mtime.toISOString() });
      }
    }
  };
  walk(root, 0);
  return out.sort((a, b) => b.modified.localeCompare(a.modified));
}

export function vaultThumb(root: string, file: string): string | null {
  if (!inside(root, file)) return null;
  const img = nativeImage.createFromPath(file);
  if (img.isEmpty()) return null;
  return img.resize({ width: 260 }).toDataURL();
}

export function vaultFile(root: string, file: string): Uint8Array | null {
  if (!inside(root, file)) return null;
  return new Uint8Array(readFileSync(file));
}
