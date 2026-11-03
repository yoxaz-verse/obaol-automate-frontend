import test from "node:test";
import assert from "node:assert/strict";
import {
  actionByLabel,
  companyName,
  executionBidLabel,
  executionTaskLabel,
  documentReadiness,
  isValidHandlerRating,
  paymentProgress,
  unwrapList,
} from "../src/features/orders/readModel.ts";
import {
  DOCUMENT_TYPE_LABELS,
  ORDER_CORE_DOCUMENT_TYPES,
  SUBFLOW_DATE_MAP,
  SUBFLOW_DOCUMENT_TYPES,
} from "../src/features/orders/config.ts";

test("unwraps every supported legacy order-list envelope", () => {
  const rows = [{ id: "one" }];
  for (const response of [
    { data: { data: { data: rows } } },
    { data: { data: { docs: rows } } },
    { data: { docs: rows } },
    { data: { data: rows } },
    { data: rows },
    rows,
  ]) assert.deepEqual(unwrapList(response), rows);
  assert.deepEqual(unwrapList({ data: null }), []);
});

test("normalizes payment, document, and handler states for the workspace", () => {
  assert.deepEqual(paymentProgress([{ percent: 30, status: "PAID" }, { percent: 20, status: "DUE" }, { percent: 50, status: "PENDING" }]), { paidPercent: 30, duePercent: 20, totalPercent: 100 });
  assert.equal(documentReadiness(null), "MISSING");
  assert.equal(documentReadiness({ verifiedStatus: "VERIFIED" }), "VERIFIED");
  assert.equal(documentReadiness({ verifiedStatus: "REJECTED" }), "REJECTED");
  assert.equal(isValidHandlerRating(5), true);
  assert.equal(isValidHandlerRating(2.5), false);
  assert.equal(isValidHandlerRating(6), false);
});

test("preserves workflow-facing order labels", () => {
  assert.equal(executionTaskLabel("QUALITY_QA"), "Quality Testing");
  assert.equal(executionTaskLabel("CUSTOM_TASK"), "CUSTOM TASK");
  assert.equal(actionByLabel("supplier"), "Supplier");
  assert.equal(actionByLabel("both"), "Buyer & Supplier");
  assert.equal(companyName({ companyName: "Acme" }), "Acme");
});

test("derives execution bidding status without assuming a response class", () => {
  assert.equal(executionBidLabel(null), "Awaiting bids");
  assert.equal(executionBidLabel({ bids: [{}] }), "Under bidding");
  assert.equal(executionBidLabel({ committedProvider: "company-1" }), "Provider committed");
  assert.equal(executionBidLabel({ status: "COMPLETED" }), "Completed");
});

test("keeps document and milestone configuration centralized", () => {
  assert.equal(DOCUMENT_TYPE_LABELS.INVOICE, "Invoice");
  assert.ok(ORDER_CORE_DOCUMENT_TYPES.includes("PAYMENT_ADVICE"));
  assert.deepEqual(SUBFLOW_DOCUMENT_TYPES.PACKAGING, ["PACKING_LIST"]);
  assert.ok(SUBFLOW_DATE_MAP.QUALITY_QA.some((field) => field.key === "qualityApprovedDate"));
});
