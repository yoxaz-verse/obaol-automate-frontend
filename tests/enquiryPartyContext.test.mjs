import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (path) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");

test("enquiry detail exposes anonymous locations and a privacy-safe support email", () => {
  const page = read("../src/app/dashboard/enquiries/[id]/page.tsx");

  assert.match(page, /Buyer from:/);
  assert.match(page, /Seller from:/);
  assert.match(page, /partyLocations\?\.buyer\?\.state/);
  assert.match(page, /partyLocations\?\.seller\?\.state/);
  assert.doesNotMatch(page, /partyLocations\?\.buyer\?\.label/);
  assert.doesNotMatch(page, /partyLocations\?\.seller\?\.label/);
  assert.match(page, /Location not provided/);
  assert.match(page, /Contact support: info@support\.obaol\.com/);
  assert.match(page, /OBAOL Support Request\\nEnquiry ID:/);
  assert.doesNotMatch(page, /const supportBody = .*buyerCompanyName/);
  assert.doesNotMatch(page, /const supportBody = .*sellerCompanyName/);
});

test("trade inputs render contributor attribution with a neutral legacy fallback", () => {
  const page = read("../src/app/dashboard/enquiries/[id]/page.tsx");
  const form = read("../src/components/dashboard/responsibilities/ResponsibilityEventForm.tsx");
  const combined = `${page}\n${form}`;

  assert.match(combined, /Buyer’s opinion/);
  assert.match(combined, /Seller’s opinion/);
  assert.match(combined, /OBAOL input/);
  assert.match(combined, /Party input/);
  assert.match(form, /attributionLabel\("packagingSpecifications"\)/);
  assert.match(form, /attributionLabel\("routeNotes"\)/);
  assert.match(form, /attributionLabel\("inlandTransportSegments"\)/);
});

test("enquiry detail keeps constrained cards and trade terms responsive", () => {
  const page = read("../src/app/dashboard/enquiries/[id]/page.tsx");
  const form = read("../src/components/dashboard/responsibilities/ResponsibilityEventForm.tsx");

  assert.match(page, /xl:grid-cols-3/);
  assert.match(page, /Contact support: info@support\.obaol\.com/);
  assert.match(page, /break-all/);
  assert.match(form, /ResponsiveDisclosure title="Incoterms & Payment"/);
  assert.match(form, /ResponsiveDisclosure title="Execution & Ownership"[^>]*defaultOpen/);
  assert.match(form, /ResponsiveDisclosure title="Packaging & Route Notes"/);
  assert.match(form, /min-h-16 h-auto w-full max-w-full/);
  assert.match(form, /renderValue=\{\(\) => selectedIncoterm/);
  assert.match(form, /renderValue=\{\(\) => selectedPaymentTerm/);
  assert.match(form, /placeholder="Select an Incoterm"/);
  assert.match(form, /placeholder="Select payment terms"/);
  assert.match(form, /textValue=\{\[item\.code, item\.name\]/);
  assert.match(form, /textValue=\{item\.label \|\| "Payment Term"\}/);
  assert.match(form, /w-full max-w-full min-w-0 overflow-hidden/);
  assert.match(form, /max-w-full self-start items-center/);
  assert.match(form, /grid-cols-\[minmax\(0,1fr\)_auto\]/);
});

test("responsibility owner selection is visible by default and remains permission-aware", () => {
  const page = read("../src/app/dashboard/enquiries/[id]/page.tsx");
  const form = read("../src/components/dashboard/responsibilities/ResponsibilityEventForm.tsx");

  assert.match(form, /ResponsiveDisclosure title="Execution & Ownership"[^>]*defaultOpen/);
  assert.match(form, /responsibilityFieldConfig[\s\S]*\.map\(\(field\)/);
  assert.match(form, /canSelect = canEditResponsibilityPlan/);
  assert.match(form, /disabled=\{!canSelect\}/);
  assert.match(page, /label: "Procurement \/ Sourcing"/);
  assert.match(page, /label: "Quality Testing"/);
  assert.match(page, /label: "Packaging & Labelling"/);
  assert.match(page, /label: "Inland Transportation"/);
  assert.match(page, /label: "Freight Forwarding & Shipping"/);
});

test("responsibility event uses one explicit save action for terms and responsibilities", () => {
  const page = read("../src/app/dashboard/enquiries/[id]/page.tsx");
  const form = read("../src/components/dashboard/responsibilities/ResponsibilityEventForm.tsx");

  assert.match(form, /Save All Changes/);
  assert.match(form, /Unsaved changes/);
  assert.match(form, /All changes saved/);
  assert.doesNotMatch(form, /Save Terms/);
  assert.doesNotMatch(form, /Synchronize Workspace/);
  assert.doesNotMatch(form, /Workspace Synchronized/);
  assert.match(page, /preferredIncoterm: selectedIncotermId \|\| null/);
  assert.match(page, /paymentTermId: selectedPaymentTermId \|\| null/);
  assert.match(page, /hasUnsavedResponsibilityChanges = isResponsibilityEventChanged \|\| isTradeTermsChanged/);
  assert.doesNotMatch(page, /updateTradeTermsMutation/);
});
