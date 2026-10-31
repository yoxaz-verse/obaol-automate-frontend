import test from "node:test";
import assert from "node:assert/strict";
import { getCapabilityActions, getCapabilityActionLinks } from "../src/utils/companyFunctionPreview.ts";

test("capability actions retain capability context and input priority", () => {
  const actions = getCapabilityActions(["seller", "buyer"], "provided");
  assert.deepEqual(actions.slice(0, 3).map(({ label, capabilityName }) => [label, capabilityName]), [
    ["Start selling", "Seller"],
    ["Buyer requests", "Seller"],
    ["View live trade listings", "Seller"],
  ]);
  assert.equal(actions.find(({ capabilityName }) => capabilityName === "Buyer")?.perspective, "provided");
});

test("capability actions deduplicate destinations while preserving the first capability", () => {
  const actions = getCapabilityActions(["seller", "exporting-from-india"], "provided");
  assert.equal(actions.filter(({ href }) => href === "/dashboard/product").length, 1);
  assert.equal(actions.find(({ href }) => href === "/dashboard/product")?.capabilitySlug, "seller");
});

test("sought buyer and seller capabilities use opposite-party workflows", () => {
  const seekingSeller = getCapabilityActions(["seller"], "sought");
  const seekingBuyer = getCapabilityActions(["buyer"], "sought");
  assert.equal(seekingSeller[0]?.href, "/dashboard/marketplace");
  assert.equal(seekingSeller[0]?.capabilityName, "Seller");
  assert.equal(seekingBuyer[0]?.href, "/dashboard/product");
  assert.equal(seekingBuyer[0]?.capabilityName, "Buyer");
});

test("link-only capability helper remains compatible", () => {
  assert.deepEqual(
    getCapabilityActionLinks(["testing"], "provided"),
    getCapabilityActions(["testing"], "provided").map(({ href }) => href),
  );
});
