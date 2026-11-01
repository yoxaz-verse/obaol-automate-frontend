import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildDashboardAccessInfoUrl,
  isDashboardAccessReason,
  resolveDashboardAccessTarget,
} from "../src/utils/dashboardAccess.ts";

test("access-info URLs retain only known dashboard destinations", () => {
  assert.equal(resolveDashboardAccessTarget("/dashboard/product?create=true"), "/dashboard/product");
  assert.equal(resolveDashboardAccessTarget("/dashboard/orders/order-1"), "/dashboard/orders/order-1");
  assert.equal(resolveDashboardAccessTarget("https://example.com/dashboard/product"), null);
  assert.equal(resolveDashboardAccessTarget("/dashboard/not-a-real-route"), null);
  assert.equal(resolveDashboardAccessTarget("/dashboard/access-info"), null);
});

test("access-info URL construction is encoded and falls back safely", () => {
  assert.equal(
    buildDashboardAccessInfoUrl("/dashboard/product", "company-function"),
    "/dashboard/access-info?target=%2Fdashboard%2Fproduct&reason=company-function",
  );
  assert.equal(
    buildDashboardAccessInfoUrl("https://example.com", "role"),
    "/dashboard/access-info?target=%2Fdashboard&reason=role",
  );
});

test("access reasons are closed to the supported values", () => {
  assert.equal(isDashboardAccessReason("role"), true);
  assert.equal(isDashboardAccessReason("company-function"), true);
  assert.equal(isDashboardAccessReason("coming-soon"), true);
  assert.equal(isDashboardAccessReason("not-available"), false);
});

test("the shared route guard explains role, function, and coming-soon access", () => {
  const guard = readFileSync(new URL("../src/components/Login/private-route.tsx", import.meta.url), "utf8");
  assert.match(guard, /buildDashboardAccessInfoUrl\(pathname, "role"\)/);
  assert.match(guard, /governedStatus === "COMING_SOON" \? "coming-soon" : "company-function"/);
  assert.doesNotMatch(guard, /router\.replace\("\/403"\)/);
});

test("marketplace keeps the seller action visible and explains an unavailable provider workspace", () => {
  const marketplace = readFileSync(new URL("../src/app/dashboard/marketplace/page.tsx", import.meta.url), "utf8");
  const accessPage = readFileSync(new URL("../src/app/dashboard/access-info/page.tsx", import.meta.url), "utf8");
  assert.match(marketplace, /\(isAdminUser \|\| isAssociateUser\)/);
  assert.match(marketplace, /buildDashboardAccessInfoUrl\("\/dashboard\/product", "company-function"\)/);
  assert.match(accessPage, /Who this workspace is for/);
  assert.match(accessPage, /Update company functions/);
  assert.match(accessPage, /reason === "coming-soon"/);
});
