import type { AgentId, AppEntry } from "@roslop/core";
import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join, sep } from "node:path";

interface Known {
  name: string;
  use: string;
  agents: AgentId[];
  mac: string[];
  win: string[];
  linux: string[];
}

// Paths can have one or more "*" segments, e.g. a version number in the folder name.
const KNOWN: Known[] = [
  {
    name: "Blender",
    use: "Models and props, exported as FBX",
    agents: ["librarian", "scenic"],
    mac: ["/Applications/Blender.app/Contents/MacOS/Blender"],
    win: ["%ProgramFiles%/Blender Foundation/*/blender.exe", "%ProgramFiles(x86)%/Steam/steamapps/common/Blender/blender.exe"],
    linux: ["/usr/bin/blender", "/snap/bin/blender"],
  },
  {
    name: "Aseprite",
    use: "Pixel art icons and sprites",
    agents: ["splash", "frame"],
    mac: ["/Applications/Aseprite.app/Contents/MacOS/aseprite"],
    win: ["%ProgramFiles%/Aseprite/Aseprite.exe", "%ProgramFiles(x86)%/Steam/steamapps/common/Aseprite/Aseprite.exe"],
    linux: ["/usr/bin/aseprite"],
  },
  {
    name: "Photoshop",
    use: "Thumbnails, icons and UI art",
    agents: ["splash", "frame"],
    mac: ["/Applications/Adobe Photoshop*/Adobe Photoshop*.app/Contents/MacOS/Adobe Photoshop*"],
    win: ["%ProgramFiles%/Adobe/Adobe Photoshop*/Photoshop.exe"],
    linux: [],
  },
  {
    name: "Audacity",
    use: "Cutting and cleaning up sounds",
    agents: ["librarian"],
    mac: ["/Applications/Audacity.app/Contents/MacOS/Audacity"],
    win: ["%ProgramFiles%/Audacity/Audacity.exe", "%ProgramFiles(x86)%/Audacity/Audacity.exe"],
    linux: ["/usr/bin/audacity"],
  },
  {
    name: "Krita",
    use: "Painting thumbnails and textures",
    agents: ["splash"],
    mac: ["/Applications/krita.app/Contents/MacOS/krita"],
    win: ["%ProgramFiles%/Krita (x64)/bin/krita.exe", "%ProgramFiles%/Krita/bin/krita.exe"],
    linux: ["/usr/bin/krita"],
  },
  {
    name: "GIMP",
    use: "Quick image edits and resizing",
    agents: ["splash", "frame"],
    mac: ["/Applications/GIMP*.app/Contents/MacOS/gimp*"],
    win: ["%ProgramFiles%/GIMP*/bin/gimp-*.exe", "%LOCALAPPDATA%/Programs/GIMP*/bin/gimp-*.exe"],
    linux: ["/usr/bin/gimp"],
  },
];

function expandEnv(p: string): string | null {
  let missing = false;
  const out = p.replace(/%([^%]+)%/g, (_, name: string) => {
    const value = process.env[name];
    if (!value) missing = true;
    return value ?? "";
  });
  return missing ? null : out;
}

function wildcard(part: string): RegExp {
  const escaped = part.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`^${escaped}$`, "i");
}

// Expands "*" segments against the disk and returns the first file that exists.
function find(pattern: string): string | null {
  const parts = pattern.split(/[\\/]/);
  let found: string[] = [parts[0] === "" ? sep : parts[0] + sep];
  for (const part of parts.slice(1)) {
    if (!part) continue;
    const next: string[] = [];
    for (const dir of found) {
      if (!part.includes("*")) {
        next.push(join(dir, part));
        continue;
      }
      try {
        const re = wildcard(part);
        // Newest version folders tend to sort last.
        for (const entry of readdirSync(dir).sort().reverse()) if (re.test(entry)) next.push(join(dir, entry));
      } catch {
        // folder doesn't exist
      }
    }
    found = next;
  }
  return found.find(p => existsSync(p)) ?? null;
}

export function scanApps(): AppEntry[] {
  const key = process.platform === "darwin" ? "mac" : process.platform === "win32" ? "win" : "linux";
  const apps: AppEntry[] = [];
  for (const app of KNOWN) {
    let candidates = app[key];
    if (key === "mac") candidates = [...candidates, ...candidates.map(p => join(homedir(), p))];
    for (const raw of candidates) {
      const pattern = expandEnv(raw);
      const path = pattern && find(pattern);
      if (path) {
        apps.push({ name: app.name, path, use: app.use, agents: app.agents, on: false });
        break;
      }
    }
  }
  return apps;
}
