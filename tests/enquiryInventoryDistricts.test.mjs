import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const page = readFileSync(
  fileURLToPath(new URL("../src/app/dashboard/enquiries/[id]/page.tsx", import.meta.url)),
  "utf8"
);

test("supplier acceptance loads the seller's active owned warehouses", () => {
  assert.match(page, /queryKey: \["seller-warehouses", sellerCompanyId\]/);
  assert.match(page, /scope: "my"/);
  assert.match(page, /isActive: true/);
  assert.match(page, /ownerCompanyId: sellerCompanyId/);
});

test("district loading remains scoped to enquiry execution locations", () => {
  assert.match(page, /\[executionContext\.originState, executionContext\.destinationState\]\.filter\(Boolean\)/);
  assert.match(page, /queryKey: \["districts", districtStateIds\.join\("\|"\)\]/);
  assert.match(page, /state: districtStateIds/);
  assert.match(page, /enabled: districtStateIds\.length > 0/);
});

test("new product stock links to the selected real warehouse", () => {
  assert.match(page, /storageLocation: "MY"/);
  assert.match(page, /warehouseId: selectedWarehouseOption\.warehouseId/);
  assert.doesNotMatch(page, /warehouseName: inlineWarehouseName/);
});

test("district options remain scoped to origin and destination", () => {
  assert.match(page, /const originDistrictOptions = districts\.filter/);
  assert.match(page, /const destinationDistrictOptions = districts\.filter/);
  assert.doesNotMatch(page, /const inlineDistrictOptions = districts\.filter/);
});
