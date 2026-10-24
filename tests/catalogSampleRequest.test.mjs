import assert from "node:assert/strict";
import test from "node:test";
import ts from "typescript";
import vm from "node:vm";
import fs from "node:fs";

let source = fs.readFileSync(new URL("../src/features/catalog/rates/sample/domain.ts", import.meta.url), "utf8");
source = source.replace(/import[^;]+from "\.\.\/domain";/, `
  const buildSampleRequestPayload = (draft) => draft;
  const validateSampleRequest = () => null;
`);
source = source.replace(/export \{ buildSampleRequestPayload, validateSampleRequest \};/, "");
const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const module = { exports: {} };
vm.runInNewContext(output, { module, exports: module.exports });
const { calculateSampleCooldown, filterDistricts, toSampleDraft } = module.exports;

test("filters districts by string and populated state identifiers", () => {
  const rows = [
    { _id: "a", name: "A", state: "state-1" },
    { _id: "b", name: "B", state: { _id: "state-2" } },
  ];
  assert.deepEqual(filterDistricts(rows, "state-2").map((row) => row._id), ["b"]);
});

test("applies the three-day cooldown and rounds remaining calendar days up", () => {
  const now = new Date("2026-01-02T12:00:00Z");
  const cooldown = calculateSampleCooldown({ requestedAt: "2026-01-01T00:00:00Z", status: "PENDING" }, now);
  assert.equal(cooldown.active, true);
  assert.equal(cooldown.remainingDays, 2);
  assert.match(cooldown.label, /2 days/);
});

test("rejected and cancelled requests do not block another request", () => {
  const now = new Date("2026-01-02T00:00:00Z");
  assert.equal(calculateSampleCooldown({ requestedAt: "2026-01-01T00:00:00Z", status: "REJECTED" }, now).active, false);
  assert.equal(calculateSampleCooldown({ requestedAt: "2026-01-01T00:00:00Z", status: "CANCELLED" }, now).active, false);
});

test("builds the unchanged sample draft including represented buyer", () => {
  const draft = toSampleDraft("rate-1", {
    state: "s", district: "d", division: "v", address: "address", pincode: "1",
    quantityKg: "2", buyerAssociateId: "buyer", buyerAssociateName: "Buyer", pincodeSearch: "1",
  }, true);
  assert.equal(draft.variantRateId, "rate-1");
  assert.equal(draft.buyerAssociateId, "buyer");
  assert.equal(draft.quantityKg, "2");
});
