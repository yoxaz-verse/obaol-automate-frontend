import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { getEnquiryCardStatus, getEnquiryPendingOwnerLabel } from "../src/utils/enquiryCardStatus.ts";

const cardSource = readFileSync(
    fileURLToPath(new URL("../src/components/dashboard/enquiries/EnquiryCard.tsx", import.meta.url)),
    "utf8"
);
const detailSource = readFileSync(
    fileURLToPath(new URL("../src/app/dashboard/enquiries/[id]/page.tsx", import.meta.url)),
    "utf8"
);
const listSource = readFileSync(
    fileURLToPath(new URL("../src/app/dashboard/enquiries/page.tsx", import.meta.url)),
    "utf8"
);

test("details action uses card navigation and not an operator phone link", () => {
    assert.match(cardSource, /View Enquiry Details/);
    assert.match(cardSource, /onPrefetch\?\.\(\);\s*onCardClick\?\.\(\);/);
    assert.doesNotMatch(cardSource, /tel:\$\{data\.operatorPhone\}/);
});

test("card type badges retain concise direction labels and distinct icons", () => {
    assert.match(cardSource, /label: "PURCHASE"/);
    assert.match(cardSource, /Icon: FiShoppingCart/);
    assert.match(cardSource, /label: "SALE"/);
    assert.match(cardSource, /Icon: FiTag/);
    assert.match(cardSource, /label: "MEDIATED"/);
    assert.match(cardSource, /Icon: FiRepeat/);
});

test("trade directions use distinct light and dark border accents", () => {
    assert.match(cardSource, /border-amber-300\/70 dark:border-amber-400\/25/);
    assert.match(cardSource, /border-emerald-300\/70 dark:border-emerald-400\/25/);
    assert.match(cardSource, /border-orange-300\/70 dark:border-orange-400\/25/);
});

test("empty workflow sections are conditionally hidden", () => {
    assert.match(detailSource, /shouldShowRevisionHub &&/);
    assert.match(detailSource, /shouldShowDocumentationChecklist &&/);
    assert.doesNotMatch(detailSource, /No documents are needed at this stage/);
});

test("enquiry list exposes workflow-backed pending filters and counts", () => {
    assert.match(listSource, /Buyer Pending \(\$\{buyerPendingCount\}\)/);
    assert.match(listSource, /Seller Pending \(\$\{sellerPendingCount\}\)/);
    assert.match(listSource, /workflowSummary: item\.workflowSummary/);
});

test("workflow updates invalidate both enquiry details and paginated card lists", () => {
    assert.match(detailSource, /invalidateQueries\(\{ queryKey: \["enquiry"\] \}\)/);
    assert.doesNotMatch(detailSource, /invalidateQueries\(\{ queryKey: \["enquiry", enquiryId\] \}\)/);
});

test("shows seller pending until the seller accepts", () => {
    assert.deepEqual(
        getEnquiryCardStatus({ workflowStage: "ENQUIRY_CREATED", viewerRole: "BUYER" }),
        {
            stageLabel: "Enquiry Created",
            responsibilityLabel: "Action required from Supplier",
            pendingParty: "SELLER",
            terminalState: null,
        }
    );
});

test("shows viewer-relative buyer action after seller acceptance", () => {
    const result = getEnquiryCardStatus({
        workflowStage: "PRE_CLARIFICATION",
        sellerAcceptedAt: "2026-10-30T10:00:00.000Z",
        viewerRole: "BUYER",
    });
    assert.equal(result.stageLabel, "Pre Clarification");
    assert.equal(result.responsibilityLabel, "Action required from Buyer (You)");
    assert.equal(result.pendingParty, "BUYER");
});

test("shows buyer pending to the seller", () => {
    const result = getEnquiryCardStatus({
        sellerAcceptedAt: "2026-10-30T10:00:00.000Z",
        viewerRole: "SELLER",
    });
    assert.equal(result.responsibilityLabel, "Action required from Buyer");
});

test("workflow summary overrides legacy milestones", () => {
    const result = getEnquiryCardStatus({
        workflowStage: "QUOTATION_REVISION",
        sellerAcceptedAt: null,
        buyerConfirmedAt: null,
        viewerRole: "SELLER",
        workflowSummary: {
            hasWorkflowRule: true,
            isSatisfied: false,
            pendingParty: "BUYER",
            pendingActions: ["REVISION_CONFIRMED"],
        },
    });
    assert.equal(result.responsibilityLabel, "Action required from Buyer");
    assert.equal(result.pendingParty, "BUYER");
});

test("a satisfied workflow rule removes legacy pending labels", () => {
    const result = getEnquiryCardStatus({
        workflowStage: "QUOTATION_REVISION",
        viewerRole: "BUYER",
        workflowSummary: { hasWorkflowRule: true, isSatisfied: true, pendingParty: null },
    });
    assert.equal(result.responsibilityLabel, null);
    assert.equal(result.pendingParty, null);
});

test("removes party pending once buyer and seller actions are complete", () => {
    const result = getEnquiryCardStatus({
        workflowStage: "RESPONSIBILITIES_FINALIZED",
        sellerAcceptedAt: "2026-10-30T10:00:00.000Z",
        buyerConfirmedAt: "2026-10-30T11:00:00.000Z",
        viewerRole: "BUYER",
    });
    assert.equal(result.stageLabel, "Responsibilities Finalized");
    assert.equal(result.responsibilityLabel, null);
    assert.equal(result.pendingParty, null);
});

for (const [status, expected] of [
    ["CONVERTED", "Converted"],
    ["COMPLETED", "Completed"],
    ["CLOSED", "Completed"],
    ["CANCELLED", "Cancelled"],
]) {
    test(`${status} is terminal and never shows a pending party`, () => {
        const result = getEnquiryCardStatus({ status, viewerRole: "SELLER" });
        assert.equal(result.stageLabel, expected);
        assert.equal(result.responsibilityLabel, null);
        assert.equal(result.pendingParty, null);
    });
}

test("pending owner labels are explicit and viewer-aware", () => {
    assert.equal(getEnquiryPendingOwnerLabel("BUYER", "BUYER"), "Buyer (You)");
    assert.equal(getEnquiryPendingOwnerLabel("SELLER", "SELLER"), "Supplier (You)");
    assert.equal(getEnquiryPendingOwnerLabel("BOTH", "BUYER"), "Buyer and Supplier (You)");
    assert.equal(getEnquiryPendingOwnerLabel("EITHER", "OTHER"), "Buyer or Supplier");
    assert.equal(getEnquiryPendingOwnerLabel(null, "OTHER"), null);
});

test("details use explicit ownership copy without ambiguous standalone wording", () => {
    assert.match(detailSource, /Action required from:/);
    assert.doesNotMatch(detailSource, /Your action is pending/);
    assert.doesNotMatch(detailSource, /Waiting for supplier action/);
});
