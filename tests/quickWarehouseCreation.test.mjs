import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (path) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");
const modal = read("../src/components/Warehouse/QuickCreateWarehouseModal.tsx");
const enquiry = read("../src/app/dashboard/enquiries/[id]/page.tsx");
const inventory = read("../src/components/dashboard/Inventory/InventoryList.tsx");

test("quick warehouse form requires name, city, and phone", () => {
  assert.match(modal, /Warehouse name, city, and contact phone are required/);
  assert.match(modal, /label="Warehouse name"/);
  assert.match(modal, /label="City"/);
  assert.match(modal, /label="Contact phone"/);
});

test("quick warehouse payload is private and supports contextual product stock", () => {
  assert.match(modal, /listingType: "PRIVATE"/);
  assert.match(modal, /isRentalActive: false/);
  assert.match(modal, /address: warehouseCity/);
  assert.match(modal, /Available quantity in this warehouse/);
  assert.match(modal, /productVariant: stockContext\.productVariantId/);
  assert.match(modal, /warehouseId: warehouse\?\._id \|\| warehouse\?\.id/);
});

test("enquiry creates inline and automatically selects the returned warehouse", () => {
  assert.match(enquiry, /setQuickWarehouseOpen\(true\)/);
  assert.match(enquiry, /isSystemAdmin && Boolean\(sellerCompanyId\)/);
  assert.match(enquiry, /setSelectedWarehouseOptionId\(`warehouse:\$\{warehouseId\}`\)/);
  assert.match(enquiry, /initialQuantity: requiredQty/);
  assert.match(enquiry, /setSelectedInventoryId\(String\(stockResult\?\.inventory/);
  assert.doesNotMatch(enquiry, /router\.push\(`\/dashboard\/warehouses\/location\?returnTo=/);
});

test("enquiry warehouse creation identifies the selected product and preserves stock retry", () => {
  assert.match(enquiry, /productName: productNameLabel/);
  assert.match(enquiry, /variantName: variantNameLabel/);
  assert.match(enquiry, /The warehouse is selected so you can retry adding stock/);
});

test("inventory exposes the shared warehouse setup card to permitted roles", () => {
  assert.match(inventory, />Your Warehouses</);
  assert.match(inventory, /canQuickCreateWarehouse = isAssociate \|\| \(isAdmin/);
  assert.match(inventory, /Select a company before creating its warehouse/);
  assert.match(inventory, /QuickCreateWarehouseModal/);
});
