const { contextBridge, ipcRenderer } = require("electron");
const { version } = require("../package.json");

const desktopApi = Object.freeze({
  isDesktop: true,
  platform: process.platform,
  version,
  focusWindow: () => ipcRenderer.send("desktop:focus-window"),
});

contextBridge.exposeInMainWorld("obaolDesktop", desktopApi);

contextBridge.exposeInMainWorld("obaolOffline", Object.freeze({
  retry: () => ipcRenderer.send("desktop:retry"),
}));
