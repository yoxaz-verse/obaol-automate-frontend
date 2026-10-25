import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("unified documentation workspace exposes the complete trade operations catalog", () => {
  const catalog = read("src/components/dashboard/Documentation/documentCatalog.ts");
  for (const type of ["SHIPPING_BILL", "CERTIFICATE_OF_ORIGIN", "DISPATCH_CHALLAN", "BILL_OF_ENTRY", "CUSTOMS_CLEARANCE", "GOODS_RECEIPT"]) assert.match(catalog, new RegExp(type));
  assert.doesNotMatch(catalog, /VENDOR_BILL|PURCHASE_RETURN|LANDED_COST/);
});

test("documentation provides one workspace and legacy redirects", () => {
  const workspace = read("src/app/dashboard/documentation/page.tsx");
  const workspaceUi = read("src/components/dashboard/Documentation/DocumentationUI.tsx");
  assert.match(workspaceUi, /Overview/);
  assert.match(workspaceUi, /Library/);
  assert.match(workspace, /Create or upload/);
  assert.match(workspace, /Requirements/);
  assert.match(workspace, /Recipients/);
  assert.match(read("src/app/dashboard/documents/page.tsx"), /redirect\("\/dashboard\/documentation"\)/);
  assert.match(read("src/app/dashboard/commercial-documents/page.tsx"), /redirect\("\/dashboard\/documentation"\)/);
});

test("uploaded documents require an extraction review before completion", () => {
  const workspace = read("src/app/dashboard/documentation/page.tsx");
  const workspaceUi = read("src/components/dashboard/Documentation/DocumentationUI.tsx");
  assert.match(workspace, /Confirm review and keep as draft/);
  assert.match(workspace, /REVIEW_REQUIRED/);
  assert.match(workspaceUi, /application\/pdf,image\/png,image\/jpeg/);
});

test("documentation views are URL-backed and configuration remains admin-only", () => {
  const workspace = read("src/app/dashboard/documentation/page.tsx");
  assert.match(workspace, /useSearchParams/);
  assert.match(workspace, /next\.set\("view", nextView\)/);
  assert.match(workspace, /requestedView !== "configuration" \|\| isAdmin/);
});

test("document detail uses the shared lifecycle, status, and dashboard components", () => {
  const detail = read("src/app/dashboard/documentation/[id]/page.tsx");
  assert.match(detail, /LifecycleTracker/);
  assert.match(detail, /DashboardStatusBadge/);
  assert.match(detail, /Structured data/);
  assert.match(detail, /Secure recipient invitation/);
});
