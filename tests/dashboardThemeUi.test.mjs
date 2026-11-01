import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (path) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");

test("dashboard theme exposes layered semantic surfaces for both modes", () => {
  const css = read("../src/app/globals.css");
  for (const token of ["--brand-palladian: #eee9df", "--brand-oatmeal: #c9c1b1", "--brand-blue: #2c3b4d", "--brand-flame: #ffb162", "--brand-truffle: #a35139", "--brand-abyssal: #1b2632"]) assert.match(css, new RegExp(token));
  assert.match(css, /:root\s*\{[\s\S]*--db-bg: var\(--brand-palladian\);[\s\S]*--db-panel: #fbf8f2;/);
  assert.match(css, /\.dark\s*\{[\s\S]*--db-bg: var\(--brand-abyssal\);[\s\S]*--db-panel: rgba\(44, 59, 77, 0\.98\);[\s\S]*--db-inset: rgba\(30, 43, 56, 0\.94\);/);
  assert.match(css, /\.db-paper\s*\{[\s\S]*background: #fff;[\s\S]*color: #0f172a;/);
});

test("catalog cards and nested controls consume dashboard theme surfaces", () => {
  const workspace = read("../src/features/catalog/rates/VariantRateWorkspace.tsx");
  assert.match(workspace, /catalog-grid-card db-panel/);
  assert.match(workspace, /catalog-card-status-row db-inset/);
  assert.match(workspace, /className="db-subtle mt-auto/);
  assert.doesNotMatch(workspace, /dark:bg-\[#12100d\]|dark:from-\[#21190f\]|dark:via-\[#191510\]/);
});

test("portalled dashboard panels use semantic theme classes", () => {
  const notifications = read("../src/components/dashboard/NotificationPanel.tsx");
  const onboarding = read("../src/components/dashboard/Company/OnboardingModal.tsx");
  const samples = read("../src/app/dashboard/sample-requests/[id]/page.tsx");
  assert.match(notifications, /className="db-panel/);
  assert.match(onboarding, /base: "db-panel/);
  assert.equal((samples.match(/popoverContent: "db-panel border db-border-strong text-foreground"/g) || []).length, 3);
});

test("document-like previews remain explicit white paper", () => {
  const commercial = read("../src/components/dashboard/CommercialDocuments/DocumentSheet.tsx");
  const template = read("../src/components/dashboard/Documents/TemplateCanvasRenderer.tsx");
  const email = read("../src/app/dashboard/email-templates/page.tsx");
  assert.match(commercial, /bg-white text-slate-900/);
  assert.match(template, /bg-white text-black/);
  assert.match(email, /bg-white p-3 text-black/);
});

