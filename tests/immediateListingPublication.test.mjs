import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("trade listings publish without an admin approval message or queue", () => {
  const wizard = read("../src/components/dashboard/Catalog/VariantRateWizardModal.tsx");
  const approvals = read("../src/components/dashboard/Approvals/CatalogApprovalQueues.tsx");
  assert.match(wizard, /Trade listing launched successfully\./);
  assert.match(wizard, /Trade listing saved successfully\./);
  assert.doesNotMatch(wizard, /Listing submitted for admin approval/);
  assert.doesNotMatch(approvals, /\["variantRate", "Listings"\]/);
});
