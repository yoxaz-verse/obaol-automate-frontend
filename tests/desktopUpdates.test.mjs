import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("desktop settings expose an accessible synchronized auto-update preference", () => {
  const settings = read("src/components/desktop/DesktopUpdateSettings.tsx");
  const page = read("src/app/dashboard/settings/page.tsx");
  const types = read("src/types/desktop.d.ts");
  assert.match(page, /<DesktopUpdateSettings \/>/);
  assert.match(settings, /role="switch"/);
  assert.match(settings, /Automatically update OBAOL Supreme/);
  assert.match(settings, /getAutoUpdatePreference/);
  assert.match(settings, /setAutoUpdatePreference/);
  assert.match(settings, /onAutoUpdatePreferenceChanged/);
  assert.match(types, /getAutoUpdatePreference/);
  assert.match(types, /setAutoUpdatePreference/);
});
