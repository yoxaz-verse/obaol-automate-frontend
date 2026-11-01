const { contextBridge, ipcRenderer } = require("electron");
const { version } = require("../package.json");

const desktopApi = Object.freeze({
  isDesktop: true,
  platform: process.platform,
  version,
  focusWindow: () => ipcRenderer.send("desktop:focus-window"),
  openPublicPage: (page) => {
    if (page === "home" || page === "account-types") {
      ipcRenderer.send("desktop:open-public-page", page);
    }
  },
  checkForUpdates: () => ipcRenderer.invoke("desktop:update-check"),
  downloadUpdate: () => ipcRenderer.invoke("desktop:update-download"),
  installUpdate: () => ipcRenderer.invoke("desktop:update-install"),
  onUpdateStatus: (listener) => {
    if (typeof listener !== "function") return () => {};
    const handler = (_event, status) => listener(status);
    ipcRenderer.on("desktop:update-status", handler);
    ipcRenderer.invoke("desktop:update-status-current").then(listener).catch(() => {});
    return () => ipcRenderer.removeListener("desktop:update-status", handler);
  },
});

contextBridge.exposeInMainWorld("obaolDesktop", desktopApi);

contextBridge.exposeInMainWorld("obaolOffline", Object.freeze({
  retry: () => ipcRenderer.send("desktop:retry"),
}));
