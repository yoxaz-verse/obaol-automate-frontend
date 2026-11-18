import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { normalizeWhatsAppNumber, warehouseWhatsAppHref, warehouseWhatsAppMessage } from "../src/utils/warehouseContact.ts";

const managementPage = readFileSync(new URL("../src/app/dashboard/warehouses/page.tsx", import.meta.url), "utf8");
const directoryPage = readFileSync(new URL("../src/app/dashboard/warehouse-rent/page.tsx", import.meta.url), "utf8");
const map = readFileSync(new URL("../src/components/Warehouse/WarehouseRentMap.tsx", import.meta.url), "utf8");

test("warehouse WhatsApp links use the dedicated international number and named message", () => {
  const href = warehouseWhatsAppHref("Meridian Warehouse", "+919876543210");
  assert.equal(normalizeWhatsAppNumber("+919876543210"), "919876543210");
  assert.match(href, /^https:\/\/wa\.me\/919876543210\?text=/);
  assert.match(decodeURIComponent(href), /I found Meridian Warehouse on OBAOL/);
  assert.match(warehouseWhatsAppMessage("Meridian Warehouse"), /facilities and availability/);
});

test("missing or invalid dedicated WhatsApp numbers do not create links", () => {
  assert.equal(warehouseWhatsAppHref("Meridian Warehouse", ""), undefined);
  assert.equal(warehouseWhatsAppHref("Meridian Warehouse", "+123"), undefined);
  assert.equal(warehouseWhatsAppHref("Meridian Warehouse", "9876543210"), undefined);
});

for (const [surface, source] of [["management cards", managementPage], ["rental cards", directoryPage], ["map popups", map]]) {
  test(`${surface} expose provider-specific WhatsApp without hiding phone contact`, () => {
    assert.match(source, /warehouseWhatsAppHref\((?:wh|warehouse)\.name, (?:wh|warehouse)\.whatsappPhone\)/);
    assert.match(source, /<FaWhatsapp/);
    assert.doesNotMatch(source, /md:hidden/);
  });
}
