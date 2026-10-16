import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildAssociateDashboardModel, getAssociateWorkspaceKind } from "../src/components/dashboard/associateDashboardModel.ts";

const base = { providedCapabilities: [], soughtCapabilities: [], actionRequired: 0, sellingCount: 3, liveProducts: 5 };

test("BUY associates receive the marketplace listing statistic", () => {
  const model = buildAssociateDashboardModel({ ...base, providedCapabilities: ["buyer"] });
  assert.equal(model.showBuying, true);
  assert.equal(model.showSelling, false);
  assert.equal(model.showFunctions, true);
  assert.deepEqual(model.capabilityStats.buyer, { value: 5, label: "live listings available", href: "/dashboard/marketplace" });
  assert.equal(model.attentionAction, null);
});

test("SELL associates receive the selling enquiry statistic", () => {
  const model = buildAssociateDashboardModel({ ...base, providedCapabilities: ["seller"] });
  assert.equal(model.showBuying, false);
  assert.equal(model.showSelling, true);
  assert.equal(model.showFunctions, true);
  assert.deepEqual(model.capabilityStats.seller, { value: 3, label: "selling enquiries", href: "/dashboard/enquiries" });
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

test("operational capabilities do not receive unrelated trade statistics", () => {
  const model = buildAssociateDashboardModel({ ...base, providedCapabilities: ["freight-forwarding"] });
  assert.equal(model.showBuying, false);
  assert.equal(model.showSelling, false);
  assert.equal(model.showFunctions, true);
  assert.equal(model.attentionAction, null);
});

test("outstanding actions expose the attention panel for every capability profile", () => {
  const model = buildAssociateDashboardModel({ ...base, providedCapabilities: ["buyer"], actionRequired: 2 });
  assert.equal(model.attentionAction?.href, "/dashboard/enquiries");
  assert.equal(model.attentionAction?.tone, "warning");
});

test("perspective isolates provided and sought workflows", () => {
  const provided = buildAssociateDashboardModel({
    ...base,
    providedCapabilities: ["seller"],
    soughtCapabilities: ["seller"],
    perspective: "provided",
  });
  const sought = buildAssociateDashboardModel({
    ...base,
    providedCapabilities: ["seller"],
    soughtCapabilities: ["seller"],
    perspective: "sought",
  });
  assert.equal(provided.showSelling, true);
  assert.equal(provided.showBuying, false);
  assert.equal(sought.showBuying, true);
  assert.equal(sought.showSelling, false);
  assert.equal(getAssociateWorkspaceKind("seller", "provided"), "seller");
  assert.equal(getAssociateWorkspaceKind("seller", "sought"), "buyer");
});

test("service-only perspective has no fallback attention panel", () => {
  const model = buildAssociateDashboardModel({ ...base, providedCapabilities: ["testing"], perspective: "provided" });
  assert.equal(model.attentionAction, null);
});

test("capability statistics use singular and zero-value labels", () => {
  const singular = buildAssociateDashboardModel({ ...base, liveProducts: 1, sellingCount: 1 });
  const zero = buildAssociateDashboardModel({ ...base, liveProducts: 0, sellingCount: 0 });
  assert.equal(singular.capabilityStats.buyer.label, "live listing available");
  assert.equal(singular.capabilityStats.seller.label, "selling enquiry");
  assert.equal(zero.capabilityStats.buyer.value, 0);
  assert.equal(zero.capabilityStats.buyer.label, "live listings available");
  assert.equal(zero.capabilityStats.seller.value, 0);
  assert.equal(zero.capabilityStats.seller.label, "selling enquiries");
});

test("buyer and seller workspaces invert for sought counterparty roles", () => {
  assert.equal(getAssociateWorkspaceKind("buyer", "provided"), "buyer");
  assert.equal(getAssociateWorkspaceKind("buyer", "sought"), "seller");
  assert.equal(getAssociateWorkspaceKind("seller", "provided"), "seller");
  assert.equal(getAssociateWorkspaceKind("seller", "sought"), "buyer");
  assert.equal(getAssociateWorkspaceKind("testing", "provided"), null);
});

test("company-function requests are gated and fabricated updates are absent", () => {
  const hook = readFileSync("src/core/data/useCompanyFunctionDashboard.ts", "utf8");
  const panel = readFileSync("src/components/dashboard/AssociateDashboard.tsx", "utf8");
  assert.match(hook, /const canLoad = enabled && Boolean\(companyId\)/);
  assert.equal((hook.match(/enabled: canLoad/g) || []).length, 3);
  assert.doesNotMatch(panel, /Trade listing update released successfully|New logistics route opened/);
  assert.match(panel, /aria-label="Dashboard perspective"/);
  assert.match(panel, /Configure missing profile/);
  assert.match(panel, /What you are seeking/);
  assert.match(panel, /What you provide/);
  assert.doesNotMatch(panel, /aria-label="Associate overview"/);
  assert.doesNotMatch(panel, /Pending enquiries|Recent activity|Capabilities you provide|Capabilities you are seeking/);
  assert.doesNotMatch(panel, /CompanyFunctionComponent/);
  assert.match(panel, /model\.capabilityStats\[workspaceKind\]/);
  assert.match(panel, /bg-blue-600 text-white hover:bg-blue-700/);
  assert.match(panel, /bg-emerald-600 text-white hover:bg-emerald-700/);
  assert.match(panel, /orderedFunctions\.length > 1 \? "lg:grid-cols-2" : ""/);
  assert.match(panel, /companyFunctionDashboard\.orderedFunctions\.map/);
});
