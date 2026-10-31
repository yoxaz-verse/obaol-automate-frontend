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

test("quick warehouse payload is private and creates no stock or listing", () => {
  assert.match(modal, /listingType: "PRIVATE"/);
  assert.match(modal, /isRentalActive: false/);
  assert.match(modal, /address: warehouseCity/);
  assert.doesNotMatch(modal, /inventoryRoutes|variantRateRoutes/);
});

test("enquiry creates inline and automatically selects the returned warehouse", () => {
  assert.match(enquiry, /setQuickWarehouseOpen\(true\)/);
  assert.match(enquiry, /isSystemAdmin && Boolean\(sellerCompanyId\)/);
  assert.match(enquiry, /setSelectedWarehouseOptionId\(`warehouse:\$\{warehouseId\}`\)/);
  assert.match(enquiry, /setInlineQuantity\(String\(requiredQty/);
  assert.doesNotMatch(enquiry, /router\.push\(`\/dashboard\/warehouses\/location\?returnTo=/);
});

test("inventory exposes the shared warehouse setup card to permitted roles", () => {
  assert.match(inventory, />Your Warehouses</);
  assert.match(inventory, /canQuickCreateWarehouse = isAssociate \|\| \(isAdmin/);
  assert.match(inventory, /Select a company before creating its warehouse/);
  assert.match(inventory, /QuickCreateWarehouseModal/);
});
