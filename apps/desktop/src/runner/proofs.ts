import type { SupabaseClient } from "@supabase/supabase-js";
import type { Task } from "@roslop/core";
import { existsSync, readFileSync } from "node:fs";
import { basename, extname, resolve } from "node:path";
import { fail } from "./db";

const TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
};

export async function uploadProof(
  db: SupabaseClient,
  userId: string,
  task: Task,
  cwd: string,
  proof: { path: string; title: string; note: string },
) {
  const file = resolve(cwd, proof.path);
  if (!existsSync(file)) throw new Error(`Couldn't find the proof at ${proof.path}`);
  const name = basename(file);
  const type = TYPES[extname(name).toLowerCase()] ?? "application/octet-stream";
  const path = `${userId}/proofs/${task.id}/${name}`;

  const { error } = await db.storage.from("files").upload(path, readFileSync(file), { contentType: type, upsert: true });
  fail("Couldn't upload the proof", error);

  const { error: rowError } = await db.from("proofs").insert({
    user_id: userId,
    task_id: task.id,
    game_id: task.game_id,
    agent: task.agent,
    title: proof.title,
    note: proof.note,
    kind: type.startsWith("video/") ? "video" : "image",
    url: path,
  });
  fail("Couldn't save the proof", rowError);
}

// An agent rendered a picture of a Library item in Studio. It becomes that card's preview.
export async function uploadPreview(db: SupabaseClient, userId: string, cwd: string, assetId: string, rel: string) {
  const file = resolve(cwd, rel);
  if (!existsSync(file)) throw new Error(`Couldn't find the preview at ${rel}`);
  const type = TYPES[extname(file).toLowerCase()] ?? "image/png";
  const path = `${userId}/previews/${assetId}${extname(file).toLowerCase()}`;
  const { error } = await db.storage.from("files").upload(path, readFileSync(file), { contentType: type, upsert: true });
  fail("Couldn't upload the preview", error);
  const { data } = await db.from("assets").select("tags").eq("id", assetId).maybeSingle();
  const tags = ((data?.tags ?? []) as string[]).filter(t => !t.startsWith("preview:"));
  const { error: e2 } = await db.from("assets").update({ tags: [...tags, `preview:${path}`] }).eq("id", assetId);
  fail("Couldn't save the preview", e2);
}
