import type { SupabaseClient } from "@supabase/supabase-js";
import { mkdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

// Files the owner attached to a task, as storage paths on a "Reference files:" line.
export function refPaths(brief: string): string[] {
  const line = brief.match(/^Reference files: (.+)$/m)?.[1];
  return line ? line.split(",").map(p => p.trim()).filter(Boolean) : [];
}

export const isVideo = (path: string) => /\.(mp4|webm|mov|m4v|mkv|avi)$/i.test(path);

export const refName = (path: string) => basename(path).replace(/^\d+-/, "");

// Pulled down into .roslop/refs so the agent can open them like any other file.
export async function fetchRefs(db: SupabaseClient, brief: string, cwd: string) {
  const paths = refPaths(brief);
  if (!paths.length) return;
  const dir = join(cwd, ".roslop", "refs");
  mkdirSync(dir, { recursive: true });
  for (const p of paths) {
    const { data, error } = await db.storage.from("files").download(p);
    if (error || !data) throw new Error(error?.message ?? `missing ${p}`);
    writeFileSync(join(dir, refName(p)), Buffer.from(await data.arrayBuffer()));
    if (isVideo(p)) {
      const sheet = await db.storage.from("files").download(`${p}.frames.jpg`);
      if (sheet.data) writeFileSync(join(dir, `${refName(p)}.frames.jpg`), Buffer.from(await sheet.data.arrayBuffer()));
    }
  }
}
