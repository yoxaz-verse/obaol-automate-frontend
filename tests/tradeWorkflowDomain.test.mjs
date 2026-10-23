import test from "node:test";
import assert from "node:assert/strict";
import {
  getOwnerLabel,
  normalizeExecutionContext,
  sanitizeBuyerOrObaol,
  sanitizeOwner,
} from "../src/features/trade-workflow/domain.ts";
import {
  getProductDisplayName,
  getVariantDisplayName,
  tradeInputLabel,
} from "../src/features/enquiries/display.ts";

test("normalizes legacy responsibility owners safely", () => {
  assert.equal(sanitizeOwner("SELLER"), "seller");
  assert.equal(sanitizeOwner("unexpected"), "obaol");
  assert.equal(sanitizeBuyerOrObaol("seller"), "buyer");
  assert.equal(getOwnerLabel("obaol"), "OBAOL Team");
  assert.equal(getOwnerLabel(""), "Not set");
});

test("normalizes execution context without changing persisted text", () => {
  const context = {
    tradeType: "DOMESTIC",
    originCountry: " India ",
    originState: "Kerala",
    originDistrict: "Kochi",
    originPort: "",
    destinationCountry: "India",
    destinationState: "Delhi",
    destinationDistrict: "Delhi",
    destinationPort: "",
    routeNotes: " Keep spacing ",
  };
  assert.deepEqual(normalizeExecutionContext(context), context);
});

test("uses stable enquiry display fallbacks for legacy response shapes", () => {
  assert.equal(getProductDisplayName({ productVariant: { product: { name: "Pepper" } } }), "Pepper");
  assert.equal(getVariantDisplayName({ specifications: "Grade A Notes: private" }, null), "Grade A");
  assert.equal(getVariantDisplayName({}, {}), "Unknown Variant");
  assert.equal(tradeInputLabel({ contributor: "seller" }), "Seller’s opinion");
});
