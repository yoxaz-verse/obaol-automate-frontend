import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");

test("dashboard routes share one constrained workspace surface", () => {
  const layout = read("src/app/dashboard/layout.tsx");
  const styles = read("src/app/globals.css");

  assert.match(layout, /data-dashboard-content/);
  assert.match(layout, /max-w-\[var\(--db-content-width\)\]/);
  assert.match(styles, /--db-content-width:\s*1440px/);
  assert.match(styles, /--db-radius-card:\s*1rem/);
  assert.match(styles, /--db-radius-panel:\s*1\.5rem/);
  assert.match(styles, /\[data-dashboard-content\].*rounded-\[2\.5rem\]/s);
});

test("profile uses human-facing workspace components and empty values", () => {
  const profile = read("src/app/dashboard/profile/page.tsx");
  const ui = read("src/components/dashboard/DashboardUI.tsx");

  assert.match(profile, /<DashboardPage/);
  assert.match(profile, /<PageHeader/);
  assert.match(profile, /<DashboardPanel/);
  assert.match(profile, /<DashboardField/);
  assert.doesNotMatch(profile, /NODE_NUL|Market Identity Matrix|Geographic Footprint|Tactical Personnel Data/);
  assert.match(ui, /emptyValue = "Not provided"/);
});
