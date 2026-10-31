const { app, BrowserWindow, Menu, Tray, ipcMain, nativeImage, session, shell } = require("electron");
const path = require("node:path");

const APP_URL = process.env.OBAOL_DESKTOP_URL || "https://www.obaol.com/auth";
const APP_ORIGIN = parsedUrl(APP_URL)?.origin;
const OBAOL_HOSTS = new Set(["obaol.com", "www.obaol.com"]);
const GOOGLE_AUTH_HOSTS = new Set(["accounts.google.com", "accounts.googleusercontent.com"]);

let mainWindow = null;
let tray = null;
let isQuitting = false;

function parsedUrl(value) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function isTrustedOBAOLUrl(value) {
  const url = parsedUrl(value);
  if (!url) return false;
  if (!app.isPackaged && APP_ORIGIN && url.origin === APP_ORIGIN) return true;
  return url.protocol === "https:" && (OBAOL_HOSTS.has(url.hostname) || url.hostname.endsWith(".obaol.com"));
}

function isGoogleAuthUrl(value) {
  const url = parsedUrl(value);
  return Boolean(url && url.protocol === "https:" && GOOGLE_AUTH_HOSTS.has(url.hostname));
}

function showMainWindow() {
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
}

function loadApplication() {
  if (!mainWindow) return;
  mainWindow.loadURL(APP_URL).catch(() => {
    mainWindow?.loadFile(path.join(__dirname, "offline.html"));
  });
}

function createTray() {
  const trayImage = nativeImage.createFromPath(path.join(__dirname, "../build/tray.png"));
  tray = new Tray(trayImage.resize({ width: 18, height: 18 }));
  tray.setToolTip("OBAOL Supreme");
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: "Open OBAOL Supreme", click: showMainWindow },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]));
  tray.on("double-click", showMainWindow);
}

function createMenu() {
  const template = [
    ...(process.platform === "darwin" ? [{ role: "appMenu" }] : []),
    { role: "fileMenu" },
    { role: "editMenu" },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    { role: "windowMenu" },
    {
      role: "help",
      submenu: [
        { label: "OBAOL website", click: () => shell.openExternal("https://www.obaol.com") },
        { label: "Contact support", click: () => shell.openExternal("mailto:info@support.obaol.com") },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function secureWebContents(webContents) {
  webContents.setWindowOpenHandler(({ url }) => {
    if (isGoogleAuthUrl(url)) {
      return {
        action: "allow",
        overrideBrowserWindowOptions: {
          autoHideMenuBar: true,
          webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
          },
        },
      };
    }

    if (isTrustedOBAOLUrl(url)) {
      void webContents.loadURL(url);
      return { action: "deny" };
    }
    if (/^(https:|mailto:)/.test(url)) void shell.openExternal(url);
    return { action: "deny" };
  });

  webContents.on("will-navigate", (event, url) => {
    if (isTrustedOBAOLUrl(url)) return;
    event.preventDefault();
    if (/^(https:|mailto:)/.test(url)) void shell.openExternal(url);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    title: "OBAOL Supreme",
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    backgroundColor: "#0a0a0a",
    icon: path.join(__dirname, "../build/icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: true,
    },
  });

  secureWebContents(mainWindow.webContents);
  mainWindow.once("ready-to-show", () => mainWindow?.show());
  mainWindow.on("close", (event) => {
    if (isQuitting) return;
    event.preventDefault();
    mainWindow?.hide();
  });
  mainWindow.on("closed", () => { mainWindow = null; });
  mainWindow.webContents.on("did-fail-load", (_event, errorCode, _description, validatedURL, isMainFrame) => {
    if (isMainFrame && errorCode !== -3 && validatedURL !== "") {
      mainWindow?.loadFile(path.join(__dirname, "offline.html"));
    }
  });

  loadApplication();
}

app.whenReady().then(() => {
  if (process.platform === "win32") app.setAppUserModelId("com.obaol.desktop");
  const persistentSession = session.defaultSession;
  persistentSession.setPermissionCheckHandler((_webContents, permission, requestingOrigin) => (
    permission === "notifications" && isTrustedOBAOLUrl(requestingOrigin)
  ));
  persistentSession.setPermissionRequestHandler((webContents, permission, callback) => {
    callback(permission === "notifications" && isTrustedOBAOLUrl(webContents.getURL()));
  });

  createMenu();
  createWindow();
  createTray();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
    else showMainWindow();
  });
});

ipcMain.on("desktop:focus-window", showMainWindow);
ipcMain.on("desktop:retry", loadApplication);

app.on("before-quit", () => { isQuitting = true; });
app.on("window-all-closed", () => {
  if (process.platform !== "darwin" && isQuitting) app.quit();
});

const singleInstanceLock = app.requestSingleInstanceLock();
if (!singleInstanceLock) {
  app.quit();
} else {
  app.on("second-instance", showMainWindow);
}
