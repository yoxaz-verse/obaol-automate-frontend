import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import test from "node:test";

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

test("PWA runtime never caches API or mutation responses", () => {
  const worker = read("public/sw.js");
  assert.match(worker, /obaol-shell-v2/);
  assert.match(worker, /request\.method !== "GET"/);
  assert.match(worker, /url\.pathname\.startsWith\("\/api\/"\)/);
  assert.match(worker, /request\.mode === "navigate"/);
  assert.match(worker, /offline\.html/);
});

test("offline fallback is branded, accessible, and reconnects automatically", () => {
  const offline = read("public/offline.html");
  assert.match(offline, /src="\/logo\.png" alt="OBAOL"/);
  assert.match(offline, /#cf983c/i);
  assert.match(offline, /prefers-color-scheme:dark/);
  assert.match(offline, /prefers-reduced-motion:reduce/);
  assert.match(offline, /aria-live="polite"/);
  assert.match(offline, /id="retry-button"/);
  assert.match(offline, /Still offline\. Check your connection and try again\./);
  assert.match(offline, /addEventListener\("online",reloadWhenConnected\)/);
  assert.match(offline, /window\.location\.reload\(\)/);
  assert.match(offline, /transaction data is never stored for offline use/);
});

test("install manager supports browser prompts, iOS guidance, cooldown, and updates", () => {
  const context = read("src/context/PwaInstallContext.tsx");
  assert.match(context, /beforeinstallprompt/);
  assert.match(context, /display-mode: standalone/);
  assert.match(context, /DISMISS_COOLDOWN/);
  assert.match(context, /SKIP_WAITING/);
  assert.match(context, /process\.env\.NODE_ENV !== "production"/);
});

test("production PWA icon set contains standard and maskable sizes", () => {
  for (const file of ["icon-192.png", "icon-512.png", "icon-maskable-192.png", "icon-maskable-512.png"]) {
    assert.ok(statSync(new URL(`../public/pwa/${file}`, import.meta.url)).size > 1000, `${file} should be a real image asset`);
  }
});
