import { app } from "electron";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Agents can't see Studio on their own, so they get a command that saves a picture of a Studio
// window without bringing it to the front. They aim the camera with the Studio connection first.

const WINDOWS = String.raw`param([string]$Out, [string]$Title = "")
Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Shot {
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr dc, uint flags);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int cmd);
  [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr h, IntPtr after, int x, int y, int cx, int cy, uint flags);
  public struct RECT { public int Left, Top, Right, Bottom; }
}
"@
$p = Get-Process RobloxStudioBeta -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 -and $_.MainWindowTitle -like "*$Title*" } | Select-Object -First 1
if (-not $p) { Write-Error "No Roblox Studio window$(if ($Title) { " with '$Title' in its title" })"; exit 1 }
$h = $p.MainWindowHandle
$was = [Shot]::IsIconic($h)
if ($was) {
  # Restore without focus and keep it underneath everything else, then put it back.
  [Shot]::ShowWindow($h, 4) | Out-Null
  [Shot]::SetWindowPos($h, [IntPtr]1, 0, 0, 0, 0, 0x0013) | Out-Null
  Start-Sleep -Milliseconds 700
}
$r = New-Object Shot+RECT
[Shot]::GetWindowRect($h, [ref]$r) | Out-Null
$w = $r.Right - $r.Left; $hgt = $r.Bottom - $r.Top
$bmp = New-Object System.Drawing.Bitmap $w, $hgt
$g = [System.Drawing.Graphics]::FromImage($bmp)
$dc = $g.GetHdc()
[Shot]::PrintWindow($h, $dc, 2) | Out-Null
$g.ReleaseHdc($dc); $g.Dispose()
if ($was) { [Shot]::ShowWindow($h, 7) | Out-Null }
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $Out) | Out-Null
$bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose()
Write-Output "saved $Out"
`;

const MAC_FIND = `ObjC.import('CoreGraphics');
function run(argv) {
  const title = argv[0] || '';
  const list = ObjC.deepUnwrap(ObjC.castRefToObject($.CGWindowListCopyWindowInfo($.kCGWindowListOptionAll, 0)));
  const w = list.find(w => /Roblox ?Studio/i.test(w.kCGWindowOwnerName || '') && (w.kCGWindowLayer === 0) && (w.kCGWindowName || '').includes(title) && (w.kCGWindowBounds || {}).Height > 200);
  return w ? String(w.kCGWindowNumber) : '';
}`;

const MAC = `#!/bin/sh
out="$1"; title="$2"
id=$(osascript -l JavaScript "$(dirname "$0")/studio-window.js" "$title")
if [ -z "$id" ]; then echo "No Roblox Studio window" >&2; exit 1; fi
mkdir -p "$(dirname "$out")"
screencapture -x -o -l "$id" "$out" && echo "saved $out"
`;

let made: string | null = null;

// The command to put in the prompt, with <file.png> and an optional title to fill in.
export function shotCommand(): string | null {
  if (made !== null) return made || null;
  try {
    const dir = join(app.getPath("userData"), "tools");
    mkdirSync(dir, { recursive: true });
    if (process.platform === "win32") {
      const file = join(dir, "studio-shot.ps1");
      writeFileSync(file, WINDOWS);
      made = `powershell -NoProfile -ExecutionPolicy Bypass -File "${file}" -Out <file.png> [-Title "<part of the window title>"]`;
    } else if (process.platform === "darwin") {
      writeFileSync(join(dir, "studio-window.js"), MAC_FIND);
      const file = join(dir, "studio-shot.sh");
      writeFileSync(file, MAC, { mode: 0o755 });
      made = `"${file}" <file.png> ["<part of the window title>"]`;
    } else {
      made = "";
    }
  } catch {
    made = "";
  }
  return made || null;
}
