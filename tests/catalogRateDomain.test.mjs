import test from "node:test";
import assert from "node:assert/strict";
import {
  buildSampleRequestPayload,
  canDeleteRate,
  canManageRate,
  extractClassifications,
  mergeVariantAndDisplayedOnce,
  resolveAdminCommission,
  toDisplayText,
  validateSampleRequest,
} from "../src/features/catalog/rates/domain.ts";

test("calculates configured commissions and preserves explicit values", () => {
  assert.equal(resolveAdminCommission(100, 7, 5), 7);
  assert.equal(resolveAdminCommission(100, 0, 5), 5);
});

test("applies listing ownership and deletion policies", () => {
  assert.equal(canManageRate({ companyId: "c1" }, { role: "operator", isOperator: true, isSellingMode: false }), true);
  assert.equal(canManageRate({ isMarketplaceView: true }, { role: "operator", isOperator: true, isSellingMode: false }), false);
  assert.equal(canManageRate({ isOwnerView: true }, { role: "associate", isOperator: false, isSellingMode: true }), true);
  const createdAt = "2026-10-23T10:00:00.000Z";
  assert.equal(canDeleteRate({ createdAt }, "associate", Date.parse(createdAt) + 3_599_999, 3_600_000), true);
  assert.equal(canDeleteRate({ createdAt }, "associate", Date.parse(createdAt) + 3_600_000, 3_600_000), false);
  assert.equal(canDeleteRate({}, "admin", Date.now(), 0), true);
});

test("merges personalized displayed rates without duplicate base listings", () => {
  const result = mergeVariantAndDisplayedOnce(
    [{ _id: "rate-1" }, { _id: "rate-2" }],
    [{ _id: "display-1", variantRate: { _id: "rate-1" } }],
  );
  assert.deepEqual(result.map((row) => row._id), ["display-1", "rate-2"]);
});

test("normalizes classification and display values", () => {
  assert.deepEqual(extractClassifications({ isOrganic: true, isGiTagged: true }), ["Organic", "GI Tag"]);
  assert.deepEqual(extractClassifications({}), ["Conventional"]);
  assert.equal(toDisplayText({ name: "Pepper" }), "Pepper");
  assert.equal(toDisplayText(["A", { label: "B" }]), "A, B");
});

test("validates and builds sample request payloads without losing draft values", () => {
  const draft = {
    variantRateId: "rate-1", state: "state-1", district: "district-1", division: "division-1",
    address: "  Warehouse Road ", pincode: " 682001 ", quantityKg: "2.5",
    includeBuyer: true, buyerAssociateId: "buyer-1",
  };
  assert.equal(validateSampleRequest(draft), null);
  assert.deepEqual(buildSampleRequestPayload(draft), {
    variantRateId: "rate-1", requestState: "state-1", requestDistrict: "district-1",
    requestDivision: "division-1", requestAddress: "Warehouse Road", requestPincode: "682001",
    requestedSampleQtyKg: 2.5, buyerAssociateId: "buyer-1",
  });
  assert.equal(validateSampleRequest({ ...draft, quantityKg: 0 }), "Enter sample quantity in kg.");
});
