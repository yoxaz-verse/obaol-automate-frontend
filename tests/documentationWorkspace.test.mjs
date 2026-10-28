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
  assert.match(workspaceUi, /Recipients/);
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

test("creation workflows are compact, URL-backed, and immediately actionable", () => {
  const workspace = read("src/app/dashboard/documentation/page.tsx");
  assert.match(workspace, /type CreateMode = "create" \| "upload"/);
  assert.match(workspace, /params\.get\("mode"\)/);
  assert.match(workspace, /role="tablist"/);
  assert.match(workspace, /Create from OBAOL/);
  assert.match(workspace, /Upload existing document/);
  assert.match(workspace, /documentation-create-workflow/);
  assert.match(workspace, /Open guided creator/);
  assert.match(workspace, /Upload and extract/);
  assert.doesNotMatch(workspace, /Start upload/);
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

test("recipient management is connected to the creator and remains company-private", () => {
  const manager = read("src/components/dashboard/Documentation/RecipientManager.tsx");
  const creator = read("src/components/dashboard/Documentation/DocumentCreator.tsx");
  const routes = read("src/core/api/apiRoutes.tsx");
  for (const role of ["BUYER", "SELLER", "BOTH"]) assert.match(manager, new RegExp(role));
  assert.match(manager, /Import referred company/);
  assert.match(manager, /Add recipient/);
  assert.match(creator, /Manage recipients/);
  assert.match(creator, /setCustomerId\(row\._id\)/);
  assert.match(routes, /recipient-directory/);
});

test("manual terms and Indian document-money formatting are shared across document surfaces", () => {
  const creator = read("src/components/dashboard/Documentation/DocumentCreator.tsx");
  const money = read("src/components/dashboard/Documentation/documentMoney.ts");
  const sheet = read("src/components/dashboard/CommercialDocuments/DocumentSheet.tsx");
  const preview = read("src/components/dashboard/Documents/TemplateCanvasRenderer.tsx");
  assert.match(creator, /termsAndConditions/);
  assert.match(creator, /Terms and conditions/);
  assert.match(money, /"en-IN"/);
  assert.match(money, /minimumFractionDigits: 2/);
  assert.match(sheet, /formatDocumentMoney/);
  assert.match(preview, /termsAndConditions/);
});

test("document preview and sharing use dynamic published templates and canonical rendering", () => {
  const detail = read("src/app/dashboard/documentation/[id]/page.tsx");
  const shared = read("src/app/documents/share/[token]/page.tsx");
  const admin = read("src/app/dashboard/documentation-templates/page.tsx");
  const api = read("src/core/api/apiRoutes.tsx");
  assert.match(detail, /Document template/);
  assert.match(detail, /selectedTemplateId/);
  assert.match(detail, /srcDoc/);
  assert.match(detail, /admin-published template/);
  assert.match(detail, /ShareDialog/);
  assert.match(detail, /Generate secure link/);
  assert.match(detail, /Open recipient preview/);
  assert.match(detail, /expiresInDays/);
  assert.match(shared, /\/render/);
  assert.match(shared, /srcDoc/);
  assert.match(admin, /Published template catalog/);
  assert.match(admin, /Make default/);
  assert.match(admin, /Document variable/);
  assert.match(api, /selectTemplate/);
  assert.match(api, /available/);
});
