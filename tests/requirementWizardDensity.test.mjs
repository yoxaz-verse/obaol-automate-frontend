import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const page = readFileSync(new URL("../src/app/dashboard/requirements/new/page.tsx", import.meta.url), "utf8");
const compactStyles = readFileSync(new URL("../src/app/dashboard/requirements/new/compact.css", import.meta.url), "utf8");

test("requirement wizard supports automatic and persisted density", () => {
  assert.match(page, /obaol:requirement-wizard-density/);
  assert.match(page, /\(max-width: 1535px\), \(max-height: 900px\)/);
  assert.match(page, /window\.matchMedia\(COMPACT_VIEWPORT_QUERY\)/);
  assert.match(page, /media\.addEventListener\("change", syncViewportDensity\)/);
  assert.match(page, /window\.localStorage\.setItem\(DENSITY_STORAGE_KEY, next\)/);
});

test("requirement wizard exposes an accessible compact layout control", () => {
  assert.match(page, /data-requirement-density=\{compact \? "compact" : "comfortable"\}/);
  assert.match(page, /aria-label=\{`Switch to \$\{compact \? "comfortable" : "compact"\} layout`\}/);
  assert.match(page, /onPress=\{toggleDensity\}/);
  assert.match(page, /compact \? "Comfortable" : "Compact"/);
});

test("compact density reduces wizard cards, panels, and summary spacing", () => {
  assert.match(page, /compact \? "min-h-52 rounded-2xl p-5" : "min-h-72 rounded-\[2rem\] p-7"/);
  assert.match(page, /compact \? "gap-4 xl:grid-cols-\[1fr_280px\]" : "gap-8 xl:grid-cols-\[1fr_330px\]"/);
  assert.match(compactStyles, /main \.p-6/);
  assert.match(compactStyles, /main \.md\\:p-8/);
  assert.match(compactStyles, /aside \.space-y-4/);
});
