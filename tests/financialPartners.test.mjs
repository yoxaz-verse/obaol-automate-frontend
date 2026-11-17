import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");

test("financial partner routes are registered in API and dashboard access", () => {
  const api = read("../src/core/api/apiRoutes.tsx"), access = read("../src/utils/dashboardAccess.ts");
  assert.match(api, /financialPartnerRoutes/);
  assert.match(api, /financial-partners\/directory/);
  assert.match(access, /My Financial Portfolio/);
  assert.match(access, /Finance Applications/);
});

test("financial partner UI includes directory, map, criteria, applications, and disclaimer", () => {
  const directory = read("../src/app/dashboard/financial-partners/page.tsx");
  const detail = read("../src/app/dashboard/financial-partners/[id]/page.tsx");
  const applications = read("../src/app/dashboard/financial-partners/applications/page.tsx");
  assert.match(directory, /FinancialPartnersMap/);
  assert.match(directory, /do not guarantee approval/);
  assert.match(detail, /Required documents/);
  assert.match(detail, /Submit finance application/);
  assert.match(applications, /MORE_INFORMATION_REQUIRED/);
  assert.match(applications, /Withdraw/);
});

test("financial portfolio uses dashboard styling without an overlapping action bar", () => {
  const portfolio = read("../src/app/dashboard/financial-partners/my/page.tsx");
  const directory = read("../src/app/dashboard/financial-partners/page.tsx");
  assert.doesNotMatch(portfolio, /sticky bottom/);
  assert.match(portfolio, /DashboardPanel/);
  assert.match(portfolio, /app-button--primary/);
  assert.match(portfolio, /FiDollarSign/);
  assert.match(portfolio, /<details/);
  assert.doesNotMatch(directory, /emerald-/);
  assert.match(directory, /dashboard-feature-panel|DashboardPanel/);
});
