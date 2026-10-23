import test from "node:test";
import assert from "node:assert/strict";
import {
  buildInventoryPresentation,
  daysStored,
  normalizeObjectId,
  unwrapInventoryList,
} from "../src/features/inventory/domain.ts";

test("normalizes identifiers and legacy list envelopes", () => {
  const id = "507f1f77bcf86cd799439011";
  assert.equal(normalizeObjectId({ _id: id }), id);
  assert.equal(normalizeObjectId("invalid"), "");
  assert.deepEqual(unwrapInventoryList({ data: { data: { data: [{ _id: id }] } } }), [{ _id: id }]);
});

test("calculates stored days with legacy minimum-day behavior", () => {
  const now = Date.parse("2026-10-23T00:00:00Z");
  assert.equal(daysStored("2026-10-22T12:00:00Z", now), 1);
  assert.equal(daysStored("2026-10-20T00:00:00Z", now), 3);
  assert.equal(daysStored("invalid", now), null);
  assert.equal(daysStored(null, now), null);
});

test("aggregates reservations and prevents negative availability", () => {
  const result = buildInventoryPresentation({
    inventory: [{
      _id: "inventory-1",
      quantity: 5,
      product: { _id: "product-1", name: "Pepper" },
      productVariant: { _id: "variant-1", name: "Grade A" },
      associateCompany: { _id: "company-1", name: "Seller" },
      warehouseName: "Main Warehouse",
    }],
    reservations: [
      { inventoryId: "inventory-1", productVariant: "variant-1", associateCompany: "company-1", quantity: 3 },
      { inventoryId: "inventory-1", productVariant: "variant-1", associateCompany: "company-1", quantity: 4 },
    ],
    warehouses: [],
    rates: [],
  });
  assert.equal(result.tableData[0].reservedQty, 7);
  assert.equal(result.tableData[0].availableQty, 0);
  assert.equal(result.summaryRows[0].reservedQty, 7);
  assert.equal(result.summaryRows[0].totalQty, 5);
  assert.deepEqual([...result.summaryRows[0].warehouses], ["Main Warehouse"]);
});

test("indexes rates and only suggests listings without matching inventory", () => {
  const result = buildInventoryPresentation({
    inventory: [{ _id: "i1", quantity: 1, productVariant: "v1", associateCompany: "c1" }],
    reservations: [],
    warehouses: [{ _id: "w1", name: "Warehouse" }],
    rates: [
      { _id: "r1", productVariant: "v1", associateCompany: "c1" },
      { _id: "r2", productVariant: "v2", associateCompany: "c1" },
      { _id: "r3", productVariant: "v3", associateCompany: "c2" },
    ],
    companyId: "c1",
  });
  assert.equal(result.warehouseMap.get("w1")?.name, "Warehouse");
  assert.equal(result.rateMap.get("v1::c1")?._id, "r1");
  assert.equal(result.rateById.get("r2")?.productVariant, "v2");
  assert.deepEqual(result.suggestedRates.map((rate) => rate._id), ["r2"]);
});
