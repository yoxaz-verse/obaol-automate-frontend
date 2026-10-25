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

test("document creator is canonical, guided, and preserves the legacy URL", () => {
  const canonical = read("src/app/dashboard/documentation/new/page.tsx");
  const creator = read("src/components/dashboard/Documentation/DocumentCreator.tsx");
  const legacy = read("src/app/dashboard/commercial-documents/new/page.tsx");
  assert.match(canonical, /DocumentCreator/);
  assert.match(legacy, /dashboard\/documentation\/new/);
  assert.match(legacy, /searchParams/);
  for (const section of ["Document setup", "Parties", "Terms and notes", "Review draft"]) assert.match(creator, new RegExp(section));
  assert.match(creator, /beforeunload/);
  assert.match(creator, /Save draft/);
});

test("purpose-built creator configuration covers every studio document type", () => {
  const studio = read("src/components/dashboard/CommercialDocuments/documentStudio.ts");
  const config = read("src/components/dashboard/Documentation/documentCreatorConfig.ts");
  const typeBlock = studio.match(/DOCUMENT_STUDIO_TYPES\s*=\s*\[([\s\S]*?)\]\s*as const/)?.[1] || "";
  const types = [...typeBlock.matchAll(/"([A-Z_]+)"/g)].map(match => match[1]);
  assert.ok(types.length >= 20);
  for (const type of types) assert.match(config, new RegExp(`\\b${type}:`), `missing creator config for ${type}`);
  for (const kind of ["commercial", "packing", "logistics", "customs", "quality", "payment"]) assert.match(config, new RegExp(`"${kind}"`));
});
