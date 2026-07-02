import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  canAccessDashboardRoute,
  getAccessibleDashboardRoutes,
  getDashboardRoute,
  normalizeDashboardRole,
  normalizeTradeMode,
} from "../src/utils/dashboardAccess.ts";

const collectPages = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const fullPath = join(directory, entry.name);
  if (entry.isDirectory()) return collectPages(fullPath);
  return entry.name === "page.tsx" ? [fullPath] : [];
});

test("unknown dashboard routes are denied", () => {
  assert.equal(getDashboardRoute("/dashboard/not-a-real-route"), null);
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/not-a-real-route", role: "Admin" }), false);
});

test("legacy Customer is normalized to a buying Associate", () => {
  assert.equal(normalizeDashboardRole("Customer"), "associate");
  assert.equal(normalizeTradeMode(undefined, "Customer"), "BUY");
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/marketplace", role: "Customer" }), true);
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/product", role: "Customer" }), false);
});

test("BUY, SELL, BOTH, and SERVICE receive the intended Associate navigation", () => {
  const linksFor = (tradeMode) => new Set(
    getAccessibleDashboardRoutes({ role: "Associate", tradeMode }).map((route) => route.path)
  );
  assert.equal(linksFor("BUY").has("/dashboard/marketplace"), true);
  assert.equal(linksFor("BUY").has("/dashboard/product"), false);
  assert.equal(linksFor("SELL").has("/dashboard/product"), true);
  assert.equal(linksFor("BOTH").has("/dashboard/product"), true);
  assert.equal(normalizeTradeMode("SERVICE", "Associate"), "SERVICE");
  assert.equal(linksFor("SERVICE").has("/dashboard"), true);
  assert.equal(linksFor("SERVICE").has("/dashboard/company"), true);
  assert.equal(linksFor("SERVICE").has("/dashboard/product"), false);
});

test("SERVICE Associates receive only capability-relevant service navigation", () => {
  const links = new Set(getAccessibleDashboardRoutes({
    role: "Associate",
    tradeMode: "SERVICE",
    companyInterests: ["WAREHOUSING"],
  }).map((route) => route.path));
  assert.equal(links.has("/dashboard/warehouse-rent"), true);
  assert.equal(links.has("/dashboard/quality-labs"), false);
});

test("Team receives Operator routes without Admin routes", () => {
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/operator/team", role: "team" }), true);
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/product", role: "team" }), true);
  assert.equal(canAccessDashboardRoute({ path: "/dashboard/approvals", role: "team" }), false);
});

test("Associate services are filtered by configured interests", () => {
  const links = new Set(getAccessibleDashboardRoutes({
    role: "Associate",
    tradeMode: "BOTH",
    companyInterests: ["WAREHOUSING"],
  }).map((route) => route.path));
  assert.equal(links.has("/dashboard/warehouse-rent"), true);
  assert.equal(links.has("/dashboard/quality-labs"), false);
});

test("every dashboard page has an explicit access policy", () => {
  const dashboardDirectory = fileURLToPath(new URL("../src/app/dashboard", import.meta.url));
  const unmapped = collectPages(dashboardDirectory)
    .map((file) => {
      const directory = relative(dashboardDirectory, file.slice(0, -"/page.tsx".length));
      const suffix = directory
        ? `/${directory.split(sep).map((part) => part.replace(/^\[(.+)\]$/, ":$1")).join("/")}`
        : "";
      return `/dashboard${suffix}`;
    })
    .filter((route) => !getDashboardRoute(route.replace(/:\w+/g, "test-id")));
  assert.deepEqual(unmapped, []);
});

test("every dashboard route exposes complete experience metadata", () => {
  const routes = getAccessibleDashboardRoutes({ role: "Admin", tradeMode: "BOTH" });
  for (const route of routes) {
    assert.ok(route.description, `${route.path} needs a description`);
    assert.ok(route.journeyStage, `${route.path} needs a journey stage`);
    assert.ok(route.helpId, `${route.path} needs a help id`);
    assert.ok(route.requiredApprovalStates.length > 0, `${route.path} needs approval policy`);
  }
});
