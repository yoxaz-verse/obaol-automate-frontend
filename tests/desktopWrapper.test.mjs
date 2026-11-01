import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("desktop shell keeps remote content isolated and navigation restricted", () => {
  const main = read("desktop/src/main.cjs");
  assert.match(main, /contextIsolation:\s*true/);
  assert.match(main, /nodeIntegration:\s*false/);
  assert.match(main, /sandbox:\s*true/);
  assert.match(main, /setWindowOpenHandler/);
  assert.match(main, /isTrustedOBAOLUrl/);
  assert.match(main, /isTrustedOBAOLUrl\(url\)[\s\S]*shell\.openExternal\(url\)/);
  assert.match(main, /https:\/\/www\.obaol\.com\/auth/);
});

test("desktop shell exposes only the minimal read-only bridge", () => {
  const preload = read("desktop/src/preload.cjs");
  assert.match(preload, /Object\.freeze/);
  assert.match(preload, /isDesktop:\s*true/);
  assert.match(preload, /focusWindow/);
  assert.match(preload, /page === "home" \|\| page === "account-types"/);
  assert.doesNotMatch(preload, /require\([^)]*child_process/);
  assert.doesNotMatch(preload, /require\([^)]*fs/);
});

test("desktop cold launch uses a sandboxed cinematic splash", () => {
  const main = read("desktop/src/main.cjs");
  const loading = read("desktop/src/loading.html");
  const manifest = JSON.parse(read("desktop/package.json"));
  assert.match(main, /SPLASH_MINIMUM_MS\s*=\s*2_800/);
  assert.match(main, /hasPlayedLaunchCinematic/);
  assert.match(main, /nodeIntegration:\s*false/);
  assert.match(main, /sandbox:\s*true/);
  assert.match(main, /closeSplashWindow\(\);[\s\S]*showMainWindow\(\)/);
  assert.match(loading, /splash-logo\.webp/);
  assert.match(loading, /opening-chime\.wav/);
  assert.match(loading, /class="wave-shell"/);
  assert.match(loading, /class="contours"/);
  assert.match(loading, /class="logo-stage"/);
  assert.doesNotMatch(loading, /statue/i);
  assert.match(loading, /prefers-reduced-motion:\s*reduce/);
  assert.equal(manifest.version, "0.1.5");
  assert.ok(manifest.build.files.includes("build/splash-logo.webp"));
  assert.ok(manifest.build.files.includes("build/opening-chime.wav"));
  assert.ok(!manifest.build.files.some((file) => file.includes("statue")));
});

test("desktop updater is user-controlled and platform safe", () => {
  const main = read("desktop/src/main.cjs");
  const preload = read("desktop/src/preload.cjs");
  const banner = read("src/components/desktop/DesktopUpdateBanner.tsx");
  const workflow = read(".github/workflows/desktop-release.yml");
  const manifest = JSON.parse(read("desktop/package.json"));
  assert.equal(manifest.version, "0.1.5");
  assert.equal(manifest.dependencies["electron-updater"], "^6.6.2");
  assert.match(main, /autoDownload\s*=\s*false/);
  assert.match(main, /autoInstallOnAppQuit\s*=\s*false/);
  assert.match(main, /isTrustedUpdateSender/);
  assert.match(main, /process\.platform === "darwin"[\s\S]*shell\.openExternal\(MAC_INSTALLER_URL\)/);
  assert.match(main, /quitAndInstall\(false, true\)/);
  assert.match(preload, /desktop:update-check/);
  assert.match(preload, /desktop:update-status/);
  assert.match(banner, /window\.obaolDesktop/);
  assert.match(banner, /Restart and install/);
  assert.match(workflow, /latest\.yml/);
  assert.match(workflow, /\.exe\.blockmap/);
});

test("homepage provides stable Windows and macOS installer links", () => {
  const downloads = read("src/components/home/DesktopDownloadSection.tsx");
  const home = read("src/components/home/HomeContent.tsx");
  const deferredHome = read("src/components/home/HomeDeferredContent.tsx");
  const footer = read("src/components/home/footer.tsx");
  assert.match(downloads, /OBAOL-Supreme-Windows-x64\.exe/);
  assert.match(downloads, /OBAOL-Supreme-macOS-Universal\.dmg/);
  assert.match(downloads, /unsigned/);
  assert.match(downloads, /Windows application/);
  assert.match(downloads, /macOS application/);
  assert.match(downloads, /Use OBAOL online/);
  assert.match(downloads, /href="\/auth"/);
  assert.doesNotMatch(downloads, /Recommended/);
  assert.doesNotMatch(downloads, /detectPlatform/);
  assert.match(downloads, /order-1 md:order-3[\s\S]*Use OBAOL online[\s\S]*downloads\.map/);
  assert.ok(home.indexOf("<DesktopDownloadSection />") > home.indexOf("<HeroSection />"));
  assert.ok(home.indexOf("<DesktopDownloadSection />") < home.indexOf("<DeferredServiceShowcase />"));
  assert.doesNotMatch(deferredHome, /DesktopDownloadSection/);
  assert.match(footer, /Windows App \(Beta\)/);
  assert.match(footer, /macOS App \(Beta\)/);
});

test("desktop notifications reuse the authenticated live event stream", () => {
  const subscriber = read("src/components/dashboard/LiveNotificationSubscriber.tsx");
  assert.match(subscriber, /new EventSource/);
  assert.match(subscriber, /new Notification/);
  assert.match(subscriber, /desktopNotificationIds/);
  assert.match(subscriber, /focusWindow/);
});
