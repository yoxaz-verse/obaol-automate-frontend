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

test("documentation surfaces share the dashboard action, field, and card system", () => {
  const workspace = read("src/app/dashboard/documentation/page.tsx");
  const workspaceUi = read("src/components/dashboard/Documentation/DocumentationUI.tsx");
  const styles = read("src/app/globals.css");
  const detail = read("src/app/dashboard/documentation/[id]/page.tsx");
  const creator = read("src/components/dashboard/Documentation/DocumentCreator.tsx");

  for (const variant of ["primary", "secondary", "tertiary", "danger", "icon"]) assert.match(styles, new RegExp(`doc-action--${variant}`));
  assert.match(workspaceUi, /DocumentationButton/);
  assert.match(workspaceUi, /DocumentationInteractiveCard/);
  assert.match(workspaceUi, /focus-visible:ring-offset-2/);
  assert.match(workspace, /fullWidth/);
  assert.match(detail, /documentationActionClass/);
  assert.match(creator, /doc-field/);
  assert.match(styles, /doc-interactive-card:hover/);
});

test("document detail header uses compact, centered shared actions", () => {
  const detail = read("src/app/dashboard/documentation/[id]/page.tsx");
  const workspaceUi = read("src/components/dashboard/Documentation/DocumentationUI.tsx");
  const styles = read("src/app/globals.css");

  assert.match(detail, /actionAlignment="center"/);
  assert.match(detail, /DocumentationButton size="sm" variant="primary"/);
  assert.match(detail, /documentationActionClass\("secondary", false, "sm"\)/);
  assert.match(workspaceUi, /DocumentationActionSize = "sm" \| "md"/);
  assert.match(styles, /\.doc-action--sm/);
  assert.doesNotMatch(detail.match(/<PageHeader[\s\S]*?\/>/)?.[0] || "", /min-h-11|w-full/);
});

test("accepted quotations expose reviewed conversion and bidirectional order navigation", () => {
  const detail = read("src/app/dashboard/documentation/[id]/page.tsx");
  const order = read("src/app/dashboard/orders/[id]/page.tsx");

  assert.match(detail, /Ready to convert/);
  assert.match(detail, /doc\.convertedOrder\.route/);
  assert.match(detail, /packaging specifications/);
  assert.match(detail, /externalProduct: \{ name: form\.product\.trim\(\), variant: form\.variant\.trim\(\)/);
  assert.match(order, /Created from accepted quotation/);
  assert.match(order, /sourceQuotation\.route/);
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

test("document draft validation always produces visible and accessible feedback", () => {
  const creator = read("src/components/dashboard/Documentation/DocumentCreator.tsx");
  assert.match(creator, /<form[^>]*noValidate/);
  assert.match(creator, /Complete.*required field.*before saving/);
  assert.match(creator, /showToastMessage/);
  assert.match(creator, /scrollIntoView/);
  assert.match(creator, /aria-invalid/);
  assert.match(creator, /aria-describedby/);
  assert.match(creator, /Draft was not saved/);
  assert.doesNotMatch(creator, /disabled=\{saving \|\| customers\.isLoading \|\| !\(customers\.data \|\| \[\]\)\.length\}/);
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

test("document decisions, governed conversion, and public invitation safety are actionable", () => {
  const detail = read("src/app/dashboard/documentation/[id]/page.tsx");
  const shared = read("src/app/documents/share/[token]/page.tsx");
  const conversions = read("src/app/dashboard/documentation-conversions/page.tsx");
  assert.match(detail, /Issue document/);
  assert.match(detail, /Share document/);
  assert.match(detail, /safeInvitationUrl/);
  assert.match(detail, /Create operational order/);
  assert.match(detail, /executionContext/);
  assert.match(detail, /responsibilities/);
  assert.match(shared, /Verify recipient email/);
  assert.match(shared, /decisionToken/);
  assert.match(shared, /Accept quotation/);
  assert.match(shared, /Reject quotation/);
  assert.match(conversions, /sourceStatuses/);
  assert.match(conversions, /selectionMode="multiple"/);
});

test("document header actions align right without changing other page headers", () => {
  const detail = read("src/app/dashboard/documentation/[id]/page.tsx");
  const header = read("src/components/ui/PageHeader.tsx");
  assert.match(detail, /reserveCompanionSpace=\{false\}/);
  assert.match(header, /reserveCompanionSpace = true/);
  assert.match(header, /lg:justify-self-end/);
  assert.match(header, /sm:justify-end/);
  assert.match(header, /\[&>\*\]:w-full/);
});
