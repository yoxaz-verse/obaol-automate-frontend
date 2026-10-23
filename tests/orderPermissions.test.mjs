import test from "node:test";
import assert from "node:assert/strict";
import {
  buildOrderActorContext,
  canActOnOrderRule,
  canEditOrderSubflow,
  canViewOrderFleet,
  canViewOrderRule,
} from "../src/features/orders/permissions.ts";

const enquiry = { buyerAssociateId: { _id: "buyer-1" }, sellerAssociateId: "seller-1" };
const buyer = buildOrderActorContext({ id: "buyer-1", role: "Associate" }, enquiry);
const seller = buildOrderActorContext({ id: "seller-1", role: "Associate" }, enquiry);
const operator = buildOrderActorContext({ id: "operator-1", role: "Operator" }, enquiry);

test("order rule visibility respects participant isolation", () => {
  assert.equal(canViewOrderRule({ visibility: "BUYER" }, buyer), true);
  assert.equal(canViewOrderRule({ visibility: "BUYER" }, seller), false);
  assert.equal(canViewOrderRule({ visibility: "INTERNAL" }, buyer), false);
  assert.equal(canViewOrderRule({ visibility: "INTERNAL" }, operator), true);
});

test("order actions remain assigned to the responsible participant", () => {
  assert.equal(canActOnOrderRule({ responsibleRole: "SELLER" }, seller), true);
  assert.equal(canActOnOrderRule({ responsibleRole: "SELLER" }, buyer), false);
  assert.equal(canActOnOrderRule({ responsibleRole: "SELLER" }, operator), true);
});

test("subflow and fleet editing follow the responsibility plan", () => {
  const responsibilities = { transportBy: "seller", qualityTestingBy: "buyer" };
  assert.equal(canEditOrderSubflow("QUALITY_QA", responsibilities, buyer), true);
  assert.equal(canEditOrderSubflow("QUALITY_QA", responsibilities, seller), false);
  assert.equal(canViewOrderFleet(["INLAND_TRANSPORTATION"], responsibilities, seller), true);
  assert.equal(canViewOrderFleet([], responsibilities, seller), false);
});
