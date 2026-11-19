import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../src/app/dashboard/freight-forwarding/finance/page.tsx", import.meta.url), "utf8");

test("finance document picker requests and explains eligible shipments", () => {
  assert.match(source, /eligibleFor:"finance"/);
  assert.match(source, /No eligible shipments available/);
  assert.match(source, /Only active shipments you can manage financially are shown/);
  assert.match(source, /Retry loading shipments/);
});

test("finance document creation links the selected shipment and reports success", () => {
  assert.match(source, /postData\(api\.finance,\{\.\.\.form/);
  assert.match(source, /Finance document draft created/);
  assert.match(source, /isDisabled=\{!form\.shipment/);
});
