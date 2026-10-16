import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (path) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");

test("enquiry detail exposes anonymous locations and a privacy-safe support email", () => {
  const page = read("../src/app/dashboard/enquiries/[id]/page.tsx");

  assert.match(page, /Buyer from:/);
  assert.match(page, /Seller from:/);
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
