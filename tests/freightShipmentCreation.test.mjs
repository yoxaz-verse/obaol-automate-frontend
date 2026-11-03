import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL("../src/app/dashboard/freight-forwarding/shipments/new/page.tsx", import.meta.url),
  "utf8",
);

test("staff must select an owner company when creating a freight shipment", () => {
  assert.match(source, /\["admin","operator","team"\]/);
  assert.match(source, /<CompanySearch/);
  assert.match(source, /ownerCompany:ownerCompany\|\|""/);
  assert.match(source, /isStaff&&!form\.ownerCompany/);
  assert.match(source, /Select an owner company before creating the shipment\./);
});

test("the owner company selector remains staff-only", () => {
  assert.match(source, /\{isStaff&&<section/);
  assert.doesNotMatch(source, /\["admin","operator","team","associate"\]/);
});
