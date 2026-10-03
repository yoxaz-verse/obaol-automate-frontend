import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildAssociateDashboardModel, getAssociateFocusStorageKey, normalizeAssociateFocus } from "../src/components/dashboard/associateDashboardModel.ts";

const base = { focus: "BOTH", actionRequired: 0, buyingCount: 4, sellingCount: 3, activeOrders: 2, liveProducts: 5 };

test("associate focus validation defaults invalid persisted values to BOTH", () => {
  assert.equal(normalizeAssociateFocus("buy"), "BUY");
  assert.equal(normalizeAssociateFocus("SELL"), "SELL");
  assert.equal(normalizeAssociateFocus("unexpected"), "BOTH");
  assert.equal(getAssociateFocusStorageKey("associate-1"), "obaol:associate-dashboard-focus:associate-1");
});

test("BUY associates receive buying metrics and marketplace next action", () => {
  const model = buildAssociateDashboardModel({ ...base, tradeMode: "BUY" });
  assert.equal(model.showBuying, true);
  assert.equal(model.showSelling, false);
  assert.equal(model.showFunctions, false);
  assert.deepEqual(model.metrics.map((metric) => metric.key), ["actions", "buying", "orders"]);
  assert.equal(model.primaryAction.href, "/dashboard/marketplace");
});

test("SELL associates receive listings and company functions", () => {
  const model = buildAssociateDashboardModel({ ...base, tradeMode: "SELL" });
  assert.equal(model.showBuying, false);
  assert.equal(model.showSelling, true);
  assert.equal(model.showFunctions, true);
  assert.deepEqual(model.metrics.map((metric) => metric.key), ["actions", "selling", "listings", "orders"]);
  assert.equal(model.primaryAction.href, "/dashboard/product");
});

test("BOTH mode consistently applies the selected focus", () => {
  const buying = buildAssociateDashboardModel({ ...base, tradeMode: "BOTH", focus: "BUY" });
  const selling = buildAssociateDashboardModel({ ...base, tradeMode: "BOTH", focus: "SELL" });
  const all = buildAssociateDashboardModel({ ...base, tradeMode: "BOTH", focus: "BOTH" });
  assert.equal(buying.showFunctions, false);
  assert.equal(selling.showFunctions, true);
  assert.equal(all.showBuying && all.showSelling, true);
});

test("SERVICE mode prioritizes execution and company functions", () => {
  const model = buildAssociateDashboardModel({ ...base, tradeMode: "SERVICE" });
  assert.equal(model.showBuying, false);
  assert.equal(model.showSelling, false);
  assert.equal(model.showFunctions, true);
  assert.deepEqual(model.metrics.map((metric) => metric.key), ["actions", "orders"]);
  assert.equal(model.primaryAction.href, "/dashboard/execution-enquiries");
});

test("outstanding actions take priority in every associate mode", () => {
  const model = buildAssociateDashboardModel({ ...base, tradeMode: "BUY", actionRequired: 2 });
  assert.equal(model.primaryAction.href, "/dashboard/enquiries");
  assert.equal(model.primaryAction.tone, "warning");
});

test("company-function requests are gated and fabricated updates are absent", () => {
  const hook = readFileSync("src/core/data/useCompanyFunctionDashboard.ts", "utf8");
  const panel = readFileSync("src/components/dashboard/AssociateDashboard.tsx", "utf8");
  assert.match(hook, /const canLoad = enabled && Boolean\(companyId\)/);
  assert.equal((hook.match(/enabled: canLoad/g) || []).length, 3);
  assert.doesNotMatch(panel, /Trade listing update released successfully|New logistics route opened/);
  assert.match(panel, /disabled=\{!canOpen\}/);
});
