import { execFile } from "node:child_process";

// How many Roblox Studio windows are really open. Each place Studio has open is its own process.
export function countStudios(): Promise<number> {
  return new Promise(done => {
    if (process.platform === "win32") {
      execFile("tasklist", ["/FO", "CSV", "/NH"], { windowsHide: true, timeout: 10_000 }, (err, out) => {
        if (err) return done(0);
        done(String(out).split("\n").filter(l => /^"RobloxStudio(Beta)?\.exe"/i.test(l)).length);
      });
    } else {
      execFile("pgrep", ["-f", "RobloxStudio"], { timeout: 10_000 }, (err, out) => {
        if (err) return done(0);
        done(String(out).split("\n").filter(Boolean).length);
      });
    }
  });
}
