import type { SupabaseClient } from "@supabase/supabase-js";
import type { Asset } from "@roslop/core";

// Puts Library uploads on Roblox through Open Cloud, straight from this computer. No Claude
// involved, so it costs no usage and gets through thousands of files. Then it fills in a Roblox
// thumbnail for anything that's on Roblox but has no picture.

const API = "https://apis.roblox.com/assets/v1";
const BATCH = 25;

export interface UploadState {
  left: number;
  done: number;
  error: string | null;
}

const TYPES: [RegExp, string, string][] = [
  [/\.png$/i, "Decal", "image/png"],
  [/\.jpe?g$/i, "Decal", "image/jpeg"],
  [/\.bmp$/i, "Decal", "image/bmp"],
  [/\.tga$/i, "Decal", "image/tga"],
  [/\.mp3$/i, "Audio", "audio/mpeg"],
  [/\.ogg$/i, "Audio", "audio/ogg"],
  [/\.fbx$/i, "Model", "model/fbx"],
  [/\.glb$/i, "Model", "model/gltf-binary"],
  [/\.gltf$/i, "Model", "model/gltf+json"],
  [/\.obj$/i, "Model", "model/obj"],
  [/\.rbxm$/i, "Model", "model/x-rbxm"],
];

export function creatorFrom(text: string): { userId: string } | { groupId: string } | null {
  const group = text.match(/group\D*(\d+)/i)?.[1];
  if (group) return { groupId: group };
  const user = text.match(/\d+/)?.[0];
  return user ? { userId: user } : null;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export class RobloxUploads {
  state: UploadState = { left: 0, done: 0, error: null };
  private busy = false;
  // Files Roblox turned down this session, so one bad file doesn't block the rest.
  private skip = new Set<string>();
  private pauseUntil = 0;

  constructor(private db: SupabaseClient, private changed: () => void) {}

  async tick(key: string | null, creatorText: string | null) {
    if (this.busy || Date.now() < this.pauseUntil) return;
    this.busy = true;
    try {
      await this.thumbnails();
      if (!key || !creatorText) {
        this.state.error = key ? "Add your Roblox creator id in Settings, Keys to upload." : null;
        return;
      }
      const creator = creatorFrom(creatorText);
      if (!creator) {
        this.state.error = "The Roblox creator id should be your user id, or group:123 for a group.";
        return;
      }
      const { data, count } = await this.db
        .from("assets")
        .select("*", { count: "exact" })
        .is("roblox_id", null)
        .not("file_url", "is", null)
        .neq("kind", "reference")
        .neq("kind", "animation")
        .order("created_at")
        .limit(BATCH + this.skip.size);
      const rows = ((data ?? []) as Asset[]).filter(a => !this.skip.has(a.id)).slice(0, BATCH).filter(a => a.file_url && !/^(https?|data|blob):/.test(a.file_url) && TYPES.some(([re]) => re.test(a.file_url!)));
      this.state.left = Math.max(0, (count ?? rows.length) - this.skip.size);
      this.changed();
      for (const a of rows) {
        const ok = await this.upload(a, key, creator);
        if (!ok) break;
        this.state.done++;
        this.state.left = Math.max(0, this.state.left - 1);
        this.state.error = null;
        this.changed();
        await sleep(1500);
      }
    } finally {
      this.busy = false;
    }
  }

  private async upload(a: Asset, key: string, creator: { userId: string } | { groupId: string }): Promise<boolean> {
    const [, assetType, mime] = TYPES.find(([re]) => re.test(a.file_url!))!;
    const { data: file, error } = await this.db.storage.from("files").download(a.file_url!);
    if (error || !file) {
      this.state.error = `Couldn't read ${a.name} from storage: ${error?.message ?? "missing"}`;
      this.skip.add(a.id);
      return true;
    }
    const form = new FormData();
    form.append("request", JSON.stringify({ assetType, displayName: a.name.slice(0, 50), description: "Uploaded with RoSlop", creationContext: { creator } }));
    form.append("fileContent", new Blob([await file.arrayBuffer()], { type: mime }), a.file_url!.split("/").pop());
    const res = await fetch(`${API}/assets`, { method: "POST", headers: { "x-api-key": key }, body: form });
    if (res.status === 429) {
      this.pauseUntil = Date.now() + 60_000;
      return false;
    }
    if (!res.ok) {
      const why = (await res.text()).slice(0, 200);
      this.state.error = res.status === 401 || res.status === 403
        ? "Roblox refused the Open Cloud key. It needs Assets read and write, and the creator id has to be you or a group the key can upload to."
        : `Roblox said no to ${a.name}: ${why}`;
      if (res.status === 401 || res.status === 403) {
        this.pauseUntil = Date.now() + 10 * 60_000;
        return false;
      }
      this.skip.add(a.id);
      return true;
    }
    let op = (await res.json()) as { path?: string; done?: boolean; response?: { assetId?: string } };
    for (let i = 0; i < 20 && !op.done && op.path; i++) {
      await sleep(2000);
      const r = await fetch(`${API}/${op.path}`, { headers: { "x-api-key": key } });
      if (r.ok) op = (await r.json()) as typeof op;
    }
    const id = op.response?.assetId;
    if (id) await this.db.from("assets").update({ roblox_id: String(id) }).eq("id", a.id);
    else this.skip.add(a.id);
    return true;
  }

  // Anything on Roblox without a picture (an agent made it, or the file wasn't kept) gets the
  // Roblox thumbnail.
  private async thumbnails() {
    const { data } = await this.db.from("assets").select("id, roblox_id").not("roblox_id", "is", null).is("file_url", null).limit(100);
    const rows = (data ?? []) as Pick<Asset, "id" | "roblox_id">[];
    if (!rows.length) return;
    const res = await fetch(`https://thumbnails.roblox.com/v1/assets?assetIds=${rows.map(r => r.roblox_id).join(",")}&returnPolicy=PlaceHolder&size=420x420&format=Png&isCircular=false`).catch(() => null);
    if (!res?.ok) return;
    const thumbs = ((await res.json()) as { data?: { targetId: number; state: string; imageUrl: string | null }[] }).data ?? [];
    for (const t of thumbs) {
      const row = rows.find(r => r.roblox_id === String(t.targetId));
      if (row && t.state === "Completed" && t.imageUrl) await this.db.from("assets").update({ file_url: t.imageUrl }).eq("id", row.id);
    }
  }
}
