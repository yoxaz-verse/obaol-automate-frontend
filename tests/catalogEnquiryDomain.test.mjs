import assert from "node:assert/strict";
import test from "node:test";
import {
  buildEnquiryPayload, buyerContacts, buyerLabel, companyNames, normalizeObjectId,
  resolveProductId, resolveProductVariantId, resolveSellerId,
} from "../src/features/catalog/rates/enquiry/domain.ts";

const objectId = (suffix) => `${"0".repeat(24 - suffix.length)}${suffix}`;

test("normalizes only valid object identifiers", () => {
  const id = objectId("12");
  assert.equal(normalizeObjectId({ _id: id }), id);
  assert.equal(normalizeObjectId("invalid"), "");
});

test("resolves nested product, variant and seller identifiers", () => {
  const product = objectId("1");
  const variant = objectId("2");
  const seller = objectId("3");
  const rate = { baseRateId: { productVariant: { _id: variant, product: { _id: product } }, associate: { _id: seller } } };
  assert.equal(resolveProductId(rate), product);
  assert.equal(resolveProductVariantId(rate, ""), variant);
  assert.equal(resolveSellerId(rate), seller);
});

test("normalizes represented buyer labels, contacts and company names", () => {
  const buyer = { _id: objectId("4"), user: { name: "Buyer", phone: "123" }, associateCompany: { name: "Trade Co", registeredTradeName: "Trade Company" } };
  assert.equal(buyerLabel(buyer), "Buyer");
  assert.deepEqual(buyerContacts(buyer), { name: "Buyer", phoneNumber: "123" });
  assert.deepEqual(companyNames(buyer), ["Trade Co", "Trade Company"]);
});

test("builds unchanged rate and catalog enquiry source fields", () => {
  const productId = objectId("1");
  const buyerId = objectId("2");
  const sellerId = objectId("3");
  const rateId = objectId("4");
  const form = { name: "Buyer", phoneNumber: "123", quantity: "5", preferredIncotermId: "", specification: "Moisture below 10%", buyerAssociateId: buyerId };
  const ratePayload = buildEnquiryPayload({ rate: { _id: rateId, product: "Rice", productVariant: "A" }, form, productId, buyerId, sellerId, role: "associate", profileName: "Buyer", profilePhone: "123" });
  assert.equal(ratePayload.variantRateId, rateId);
  assert.equal(ratePayload.catalogItemId, null);
  assert.equal(ratePayload.quantity, 5);
  assert.match(ratePayload.specifications, /Notes: Moisture below 10%/);
  assert.equal("name" in ratePayload, false);
  const catalogPayload = buildEnquiryPayload({ rate: { _id: rateId, isCatalogView: true, product: "Rice" }, form, productId, buyerId, sellerId, role: "operator", userId: "operator-1" });
  assert.equal(catalogPayload.variantRateId, null);
  assert.equal(catalogPayload.catalogItemId, rateId);
  assert.equal(catalogPayload.assignedOperatorId, "operator-1");
});

test("rejects missing seller and invalid incoterm mappings", () => {
  const id = objectId("1");
  const form = { name: "", phoneNumber: "", quantity: "1", preferredIncotermId: "bad", specification: "", buyerAssociateId: id };
  assert.throws(() => buildEnquiryPayload({ rate: { _id: id }, form, productId: id, buyerId: id, sellerId: "", role: "associate" }), /seller mapping/);
  assert.throws(() => buildEnquiryPayload({ rate: { _id: id }, form, productId: id, buyerId: id, sellerId: id, role: "associate" }), /incoterm is invalid/);
});
