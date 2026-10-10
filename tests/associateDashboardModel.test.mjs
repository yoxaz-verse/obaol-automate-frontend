import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildAssociateDashboardModel } from "../src/components/dashboard/associateDashboardModel.ts";

const base = { providedCapabilities: [], soughtCapabilities: [], actionRequired: 0, buyingCount: 4, sellingCount: 3, activeOrders: 2, liveProducts: 5 };

test("BUY associates receive buying metrics and marketplace next action", () => {
  const model = buildAssociateDashboardModel({ ...base, providedCapabilities: ["buyer"] });
  assert.equal(model.showBuying, true);
  assert.equal(model.showSelling, false);
  assert.equal(model.showFunctions, true);
  assert.deepEqual(model.metrics.map((metric) => metric.key), ["actions", "buying", "orders"]);
  assert.equal(model.primaryAction.href, "/dashboard/marketplace");
});

test("SELL associates receive listings and company functions", () => {
  const model = buildAssociateDashboardModel({ ...base, providedCapabilities: ["seller"] });
  assert.equal(model.showBuying, false);
  assert.equal(model.showSelling, true);
  assert.equal(model.showFunctions, true);
  assert.deepEqual(model.metrics.map((metric) => metric.key), ["actions", "selling", "listings", "orders"]);
  assert.equal(model.primaryAction.href, "/dashboard/product");
});

test("provided and sought profiles are combined for personalization", () => {
  const model = buildAssociateDashboardModel({ ...base, providedCapabilities: ["seller"], soughtCapabilities: ["buyer"] });
  assert.equal(model.showBuying, false);
  assert.equal(model.showSelling, true);
});

test("sought counterparty roles personalize the opposite trade workflow", () => {
  const seekingBuyer = buildAssociateDashboardModel({ ...base, soughtCapabilities: ["buyer"] });
  const seekingSeller = buildAssociateDashboardModel({ ...base, soughtCapabilities: ["seller"] });
  assert.equal(seekingBuyer.showSelling, true);
  assert.equal(seekingBuyer.showBuying, false);
  assert.equal(seekingSeller.showBuying, true);
  assert.equal(seekingSeller.showSelling, false);
});

test("operational capabilities prioritize execution", () => {
  const model = buildAssociateDashboardModel({ ...base, providedCapabilities: ["freight-forwarding"] });
  assert.equal(model.showBuying, false);
  assert.equal(model.showSelling, false);
  assert.equal(model.showFunctions, true);
  assert.deepEqual(model.metrics.map((metric) => metric.key), ["actions", "orders"]);
  assert.equal(model.primaryAction.href, "/dashboard/execution-enquiries");
});

test("outstanding actions take priority for every capability profile", () => {
  const model = buildAssociateDashboardModel({ ...base, providedCapabilities: ["buyer"], actionRequired: 2 });
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
