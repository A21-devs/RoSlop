import { contextBridge, ipcRenderer } from "electron";
import type { DesktopBridge, RunnerStatus } from "@roslop/core";

const info = ipcRenderer.sendSync("roslop:info") as Pick<DesktopBridge, "platform" | "machineName">;

const bridge: DesktopBridge = {
  platform: info.platform,
  machineName: info.machineName,
  startRunner: auth => ipcRenderer.invoke("roslop:startRunner", auth),
  stopRunner: () => ipcRenderer.invoke("roslop:stopRunner"),
  status: () => ipcRenderer.invoke("roslop:status"),
  onStatus(cb) {
    const listener = (_: unknown, s: RunnerStatus) => cb(s);
    ipcRenderer.on("roslop:status", listener);
    return () => {
      ipcRenderer.removeListener("roslop:status", listener);
    };
  },
  getKey: id => ipcRenderer.invoke("roslop:getKey", id),
  setKey: (id, value) => ipcRenderer.invoke("roslop:setKey", id, value),
  pickFolder: () => ipcRenderer.invoke("roslop:pickFolder"),
  pickFile: () => ipcRenderer.invoke("roslop:pickFile"),
  setCliPath: (provider, path) => ipcRenderer.invoke("roslop:setCliPath", provider, path),
  scanApps: () => ipcRenderer.invoke("roslop:scanApps"),
  openPath: path => ipcRenderer.invoke("roslop:openPath", path),
};

contextBridge.exposeInMainWorld("roslop", bridge);
