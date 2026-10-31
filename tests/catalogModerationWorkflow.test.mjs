import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("catalog additions use a dedicated owner workspace", () => {
  const wizard = read("../src/components/dashboard/Catalog/VariantRateWizardModal.tsx");
  const additions = read("../src/app/dashboard/catalog/additions/page.tsx");
  const catalog = read("../src/app/dashboard/catalog/page.tsx");
  assert.equal(wizard.includes("Requested name"), false);
  assert.match(wizard, /dashboard\/catalog\/additions/);
  assert.match(additions, /Private — catalog approval pending/);
  assert.match(additions, /Locked after approval/);
  assert.match(additions, /deletePreview/);
  assert.match(additions, /What do you want to add\?/);
  assert.match(additions, /Where does it belong\?/);
  assert.match(additions, /Hierarchy preview/);
  assert.match(additions, /grouped by category/);
  assert.match(additions, /Choose a category first/);
  assert.match(additions, /Description \(optional\)/);
  assert.equal(additions.match(/catalog-hierarchy-field/g)?.length, 3);
  assert.equal(additions.includes('description={'), false);
  assert.match(additions, /Autocomplete, AutocompleteItem/);
  assert.equal(additions.match(/allowsCustomValue=\{false\}/g)?.length, 3);
  assert.equal(additions.match(/defaultFilter=\{filterCatalogOption\}/g)?.length, 3);
  assert.match(additions, /setCategoryId\(id\); setSubCategoryId\(""\); setParentId/);
  assert.match(additions, /setSubCategoryId\(id\); setParentId/);
  assert.match(additions, /row\.entityType === "subCategory" \? nextCategoryId/);
  assert.ok(catalog.indexOf('placeholder="Deep search') < catalog.indexOf(">My Additions<"));
});

test("catalog moderation has a dedicated audited admin queue", () => {
  const page = read("../src/app/dashboard/catalog-requests/page.tsx");
  const queue = read("../src/components/dashboard/Approvals/CatalogApprovalQueues.tsx");
  const approvals = read("../src/app/dashboard/approvals/page.tsx");
  assert.match(page, /CatalogApprovalQueues/);
  assert.equal(approvals.includes("CatalogApprovalQueues"), false);
  assert.match(queue, /Approve chain/);
  assert.match(queue, /Save audited edit/);
  assert.match(queue, /Associate/);
  assert.match(queue, /Company/);
});
