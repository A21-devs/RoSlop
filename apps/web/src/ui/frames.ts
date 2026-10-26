// Agents can't watch a video, so each one gets a sheet of frames taken across it, with the time
// on each, saved next to the video.

export const isVideo = (name: string, type = "") => type.startsWith("video/") || /\.(mp4|webm|mov|m4v|mkv|avi)$/i.test(name);

export async function frameSheet(file: File, count = 12): Promise<Blob | null> {
  const url = URL.createObjectURL(file);
  try {
    const v = document.createElement("video");
    v.muted = true;
    v.preload = "auto";
    v.src = url;
    await new Promise<void>((ok, bad) => {
      v.onloadedmetadata = () => ok();
      v.onerror = () => bad(new Error("can't read this video"));
    });
    const length = v.duration;
    if (!Number.isFinite(length) || !v.videoWidth) return null;
    const cols = 4, rows = Math.ceil(count / cols);
    const w = 480, h = Math.round((w * v.videoHeight) / v.videoWidth);
    const c = document.createElement("canvas");
    c.width = cols * w;
    c.height = rows * h;
    const g = c.getContext("2d")!;
    g.fillStyle = "#000";
    g.fillRect(0, 0, c.width, c.height);
    g.font = "bold 20px sans-serif";
    for (let i = 0; i < count; i++) {
      const t = (length * (i + 0.5)) / count;
      await new Promise<void>(ok => {
        v.onseeked = () => ok();
        v.currentTime = t;
        setTimeout(ok, 4000);
      });
      const x = (i % cols) * w, y = Math.floor(i / cols) * h;
      g.drawImage(v, x, y, w, h);
      const label = `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
      g.fillStyle = "rgba(0,0,0,.65)";
      g.fillRect(x + 6, y + 6, g.measureText(label).width + 12, 28);
      g.fillStyle = "#fff";
      g.fillText(label, x + 12, y + 27);
    }
    return await new Promise(done => c.toBlob(done, "image/jpeg", 0.85));
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}
