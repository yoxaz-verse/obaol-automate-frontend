import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const page = readFileSync(new URL("../src/app/dashboard/companies/page.tsx", import.meta.url), "utf8");
const brandMark = readFileSync(new URL("../src/components/dashboard/Company/CompanyBrandMark.tsx", import.meta.url), "utf8");

test("companies directory and details use shared dashboard primitives", () => {
  assert.match(page, /<DashboardPage/);
  assert.match(page, /<PageHeader/);
  assert.match(page, /<DashboardPanel/);
  assert.match(page, /<DashboardSectionHeader/);
  assert.match(page, /<DashboardStatusBadge/);
  assert.match(page, /<AppButton/);
});

test("company branding has a stable logo position and initials fallback", () => {
  assert.match(page, /<CompanyBrandMark name=\{name\} logo=\{toText\(company\?\.logo, ""\)\}/);
  assert.match(page, /<CompanyBrandMark name=\{selectedCompanyName\} logo=\{selectedCompanyLogo\}/);
  assert.match(brandMark, /object-contain/);
  assert.match(brandMark, /onError=\{\(\) => setImageFailed\(true\)\}/);
  assert.match(brandMark, /initials\(name\)/);
});

test("companies workspace uses professional labels", () => {
  assert.match(page, />Company operations</);
  assert.match(page, /title="Associates"/);
  assert.doesNotMatch(page, />Execution Proxy</);
  assert.doesNotMatch(page, />Personnel Network</);
  assert.doesNotMatch(page, />Internal Sync Only</);
});
