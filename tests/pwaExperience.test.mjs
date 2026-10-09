import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import test from "node:test";

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

test("PWA runtime never caches API or mutation responses", () => {
  const worker = read("public/sw.js");
  assert.match(worker, /request\.method !== "GET"/);
  assert.match(worker, /url\.pathname\.startsWith\("\/api\/"\)/);
  assert.match(worker, /request\.mode === "navigate"/);
  assert.match(worker, /offline\.html/);
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
