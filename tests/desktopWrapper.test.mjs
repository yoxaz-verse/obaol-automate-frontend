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
  assert.match(main, /https:\/\/www\.obaol\.com\/auth/);
});

test("desktop shell exposes only the minimal read-only bridge", () => {
  const preload = read("desktop/src/preload.cjs");
  assert.match(preload, /Object\.freeze/);
  assert.match(preload, /isDesktop:\s*true/);
  assert.match(preload, /focusWindow/);
  assert.doesNotMatch(preload, /require\([^)]*child_process/);
  assert.doesNotMatch(preload, /require\([^)]*fs/);
});

test("homepage provides stable Windows and macOS installer links", () => {
  const downloads = read("src/components/home/DesktopDownloadSection.tsx");
  const home = read("src/components/home/HomeDeferredContent.tsx");
  const footer = read("src/components/home/footer.tsx");
  assert.match(downloads, /OBAOL-Supreme-Windows-x64\.exe/);
  assert.match(downloads, /OBAOL-Supreme-macOS-Universal\.dmg/);
  assert.match(downloads, /unsigned/);
  assert.match(home, /<DesktopDownloadSection \/>/);
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
