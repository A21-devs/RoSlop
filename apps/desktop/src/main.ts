import { app, BrowserWindow, dialog, ipcMain, Menu, shell } from "electron";
import type { RunnerStatus } from "@roslop/core";
import { existsSync } from "node:fs";
import { hostname } from "node:os";
import { join } from "node:path";
import { scanApps } from "./apps";
import { gameInfo, openStudio } from "./studio";
import { getKey, setKey } from "./keys";
import { Runner } from "./runner";
import { cliPaths, fixPath } from "./runner/cli";

let win: BrowserWindow | null = null;
let quitting = false;

const runner = new Runner(status => win?.webContents.send("roslop:status", status));

function createWindow() {
  win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: "#0c0d0b",
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    show: false,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      sandbox: true,
    },
  });
  win.once("ready-to-show", () => win?.show());

  // If the page itself dies (out of memory, GPU hiccup), bring it straight back instead of sitting black.
  win.webContents.on("render-process-gone", (_, details) => {
    if (details.reason !== "clean-exit") win?.webContents.reload();
  });
  win.on("unresponsive", () => win?.webContents.reload());

  // Links to the outside world open in the browser, not in our window.
  win.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: "deny" };
  });

  // On a Mac, closing the window keeps the crew going. The web app stays loaded
  // so it keeps the sign-in fresh for the runner.
  win.on("close", e => {
    if (process.platform === "darwin" && !quitting) {
      e.preventDefault();
      win?.hide();
    }
  });
  win.on("closed", () => (win = null));

  const page = join(__dirname, "web", "index.html");
  if (__DEV_URL__) void win.loadURL(__DEV_URL__);
  else if (existsSync(page)) void win.loadFile(page);
  else void win.loadURL("data:text/html,<body style='background:%230c0d0b;color:%23ccc;font:14px sans-serif;padding:40px'>No web build yet. Run <code>npm run build</code> first.</body>");
}

function platform(): "windows" | "mac" | "linux" {
  if (process.platform === "darwin") return "mac";
  if (process.platform === "win32") return "windows";
  return "linux";
}

function handlers() {
  ipcMain.on("roslop:info", e => {
    e.returnValue = { platform: platform(), machineName: hostname() };
  });
  ipcMain.handle("roslop:startRunner", (_, auth) => runner.start(auth));
  ipcMain.handle("roslop:stopRunner", () => runner.stop());
  ipcMain.handle("roslop:status", (): RunnerStatus => runner.status());
  ipcMain.handle("roslop:getKey", (_, id: string) => getKey(id));
  ipcMain.handle("roslop:setKey", (_, id: string, value: string | null) => setKey(id, value));
  ipcMain.handle("roslop:scanApps", () => scanApps());
  ipcMain.handle("roslop:openStudio", (_, g) => openStudio(g));
  ipcMain.handle("roslop:gameInfo", (_, universeId: number, placeId: number | null) => gameInfo(universeId, placeId));
  ipcMain.handle("roslop:pullGames", async (_, vault: string | null) => {
    const path = vault || join(app.getPath("documents"), "RoSlop Vault");
    const r = await runner.pullGames(path);
    return { ...r, vault: path };
  });
  ipcMain.handle("roslop:openPath", async (_, path: string) => {
    const error = await shell.openPath(path);
    if (error) throw new Error(error);
  });
  ipcMain.handle("roslop:pickFolder", async () => {
    const r = await dialog.showOpenDialog(win!, { properties: ["openDirectory", "createDirectory"] });
    return r.canceled ? null : r.filePaths[0] ?? null;
  });
  ipcMain.handle("roslop:setCliPath", (_, provider: "claude" | "codex", path: string | null) => cliPaths.set(provider, path ?? undefined));
  ipcMain.handle("roslop:pickFile", async () => {
    const r = await dialog.showOpenDialog(win!, { properties: ["openFile"] });
    return r.canceled ? null : r.filePaths[0] ?? null;
  });
}

// The default File/Edit/View menu does nothing useful on Windows. Macs keep theirs for copy and paste.
if (process.platform !== "darwin") Menu.setApplicationMenu(null);

app.whenReady().then(async () => {
  await fixPath();
  handlers();
  createWindow();
  app.on("activate", () => {
    if (win) win.show();
    else createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// Give running agents a moment to stop and hand their tasks back to the queue.
app.on("before-quit", e => {
  quitting = true;
  if (!runner.status().running) return;
  e.preventDefault();
  void runner.stop().finally(() => app.quit());
});
