const { app, BrowserWindow, Menu, Tray, ipcMain, nativeImage, session, shell } = require("electron");
const path = require("node:path");

const APP_URL = process.env.OBAOL_DESKTOP_URL || "https://www.obaol.com/auth";
const APP_ORIGIN = parsedUrl(APP_URL)?.origin;
const APP_LOAD_TIMEOUT_MS = 20_000;
const SPLASH_MINIMUM_MS = 2_800;
const SPLASH_REDUCED_MOTION_MS = 900;
const OBAOL_HOSTS = new Set(["obaol.com", "www.obaol.com"]);
const GOOGLE_AUTH_HOSTS = new Set(["accounts.google.com", "accounts.googleusercontent.com"]);
const PUBLIC_PAGES = Object.freeze({
  home: "https://www.obaol.com/",
  "account-types": "https://www.obaol.com/roles",
});

let mainWindow = null;
let splashWindow = null;
let tray = null;
let isQuitting = false;
let isLoadingApplication = false;
let hasPlayedLaunchCinematic = false;

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
  if (splashWindow && !splashWindow.isDestroyed()) {
    splashWindow.show();
    splashWindow.focus();
    return;
  }
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
}

function closeSplashWindow() {
  if (!splashWindow) return;
  if (!splashWindow.isDestroyed()) splashWindow.destroy();
  splashWindow = null;
}

async function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 1120,
    height: 700,
    minWidth: 840,
    minHeight: 525,
    frame: false,
    resizable: true,
    movable: true,
    show: false,
    skipTaskbar: true,
    backgroundColor: "#050403",
    icon: path.join(__dirname, "../build/icon.png"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  splashWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  splashWindow.webContents.on("will-navigate", (event) => event.preventDefault());
  splashWindow.once("ready-to-show", () => {
    splashWindow?.center();
    splashWindow?.show();
  });

  await splashWindow.loadFile(path.join(__dirname, "loading.html"));
  const reducedMotion = await splashWindow.webContents
    .executeJavaScript("window.matchMedia('(prefers-reduced-motion: reduce)').matches", true)
    .catch(() => false);
  return { reducedMotion };
}

function waitFor(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, milliseconds)));
}

async function showOfflineScreen() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  await mainWindow.loadFile(path.join(__dirname, "offline.html")).catch(() => {});
}

async function loadApplication() {
  if (!mainWindow || mainWindow.isDestroyed() || isLoadingApplication) return;
  isLoadingApplication = true;
  let timeoutId = null;
  const playCinematic = !hasPlayedLaunchCinematic;
  const cinematicStartedAt = Date.now();
  let splashStatePromise = null;

  try {
    if (playCinematic) {
      hasPlayedLaunchCinematic = true;
      splashStatePromise = createSplashWindow();
    }
    await Promise.race([
      mainWindow.loadURL(APP_URL),
      new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("Application load timed out.")), APP_LOAD_TIMEOUT_MS);
      }),
    ]);
    if (playCinematic) {
      const splashState = await splashStatePromise.catch(() => ({ reducedMotion: false }));
      const minimumDuration = splashState.reducedMotion ? SPLASH_REDUCED_MOTION_MS : SPLASH_MINIMUM_MS;
      await waitFor(minimumDuration - (Date.now() - cinematicStartedAt));
      closeSplashWindow();
    }
    showMainWindow();
  } catch (error) {
    if (error?.code !== "ERR_ABORTED" && error?.errno !== -3) {
      mainWindow?.webContents.stop();
      await showOfflineScreen();
      if (playCinematic) {
        const splashState = await splashStatePromise?.catch(() => ({ reducedMotion: false }));
        const minimumDuration = splashState?.reducedMotion ? SPLASH_REDUCED_MOTION_MS : SPLASH_MINIMUM_MS;
        await waitFor(minimumDuration - (Date.now() - cinematicStartedAt));
        closeSplashWindow();
      }
      showMainWindow();
    }
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
    isLoadingApplication = false;
  }
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
      void shell.openExternal(url);
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
  mainWindow.on("close", (event) => {
    if (isQuitting) return;
    event.preventDefault();
    mainWindow?.hide();
  });
  mainWindow.on("closed", () => { mainWindow = null; });
  mainWindow.webContents.on("did-fail-load", (_event, errorCode, _description, validatedURL, isMainFrame) => {
    if (!isLoadingApplication && isMainFrame && errorCode !== -3 && validatedURL !== "") {
      void showOfflineScreen();
    }
  });

  void loadApplication();
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
ipcMain.on("desktop:retry", () => { void loadApplication(); });
ipcMain.on("desktop:open-public-page", (_event, page) => {
  const destination = PUBLIC_PAGES[page];
  if (destination) void shell.openExternal(destination);
});

app.on("before-quit", () => {
  isQuitting = true;
  closeSplashWindow();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin" && isQuitting) app.quit();
});

const singleInstanceLock = app.requestSingleInstanceLock();
if (!singleInstanceLock) {
  app.quit();
} else {
  app.on("second-instance", showMainWindow);
}
