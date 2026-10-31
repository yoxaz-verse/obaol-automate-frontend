import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (path) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");

test("My Company reuses onboarding categories and priority requests", () => {
  const company = read("../src/app/dashboard/company/page.tsx");
  assert.equal(company.includes("const INTEREST_OPTIONS"), false);
  assert.equal(company.includes("requestedProvidedFunctionIds"), true);
  assert.equal(company.includes("requestedSoughtFunctionIds"), true);
  assert.equal(company.includes("requestedProvidedFunctionPriorities"), true);
  assert.equal(company.includes("requestedSoughtFunctionPriorities"), true);
  assert.equal(company.includes("Your first three selections become priorities automatically"), true);
  assert.equal(company.includes("Set as priority"), false);
  assert.equal(company.includes("Select 1–6 categories"), true);
  assert.equal(company.includes("getCompanyFunctionPerspectiveDescription(capability?.slug, kind, capability?.description)"), true);
  assert.equal(company.includes("line-clamp-2"), true);
  assert.equal(company.includes('className="mt-3 grid grid-cols-2 gap-2"'), true);
});

test("capability descriptions use perspective copy with safe fallbacks", async () => {
  const { getCompanyFunctionPerspectiveDescription } = await import("../src/utils/companyFunctionDescriptions.ts");
  assert.equal(getCompanyFunctionPerspectiveDescription("buyer", "provided"), "We purchase commodities or products from suppliers.");
  assert.equal(getCompanyFunctionPerspectiveDescription("buyer", "sought"), "We want to connect with buyers for our products.");
  assert.equal(getCompanyFunctionPerspectiveDescription("seller", "sought"), "We want to connect with sellers or suppliers.");
  assert.equal(getCompanyFunctionPerspectiveDescription("packaging", "provided"), "We provide packaging, labeling, or packing services.");
  assert.equal(getCompanyFunctionPerspectiveDescription("packaging", "sought"), "We need packaging, labeling, or packing support.");
  assert.equal(getCompanyFunctionPerspectiveDescription("future-function", "provided", "API description"), "API description");
  assert.equal(getCompanyFunctionPerspectiveDescription("future-function", "sought"), "We are seeking this capability from customers or partners.");
});

test("My Company exposes operational overview sections", () => {
  const company = `${read("../src/app/dashboard/company/page.tsx")}\n${read("../src/components/dashboard/Company/CompanyOverviewCards.tsx")}`;
  for (const label of ["Profile readiness", "Company members", "Live listings", "Enquiries handled", "Orders completed", "Capability Request Tracking"]) {
    assert.equal(company.includes(label), true, `missing ${label}`);
  }
});

test("My Company quick actions follow approved capability responsibilities", () => {
  const company = read("../src/app/dashboard/company/page.tsx");
  assert.equal(company.includes("getCapabilityActions("), true);
  assert.equal(company.includes("orderedCapabilitySlugs(providedFunctionIds, providedPriorityIds)"), true);
  assert.equal(company.includes("orderedCapabilitySlugs(soughtFunctionIds, soughtPriorityIds)"), true);
  assert.equal(company.includes(".slice(0, 3)"), true);
  assert.equal(company.includes('label: "Providing", actions: providingQuickActions'), true);
  assert.equal(company.includes('label: "Seeking", actions: seekingQuickActions'), true);
  assert.equal(company.includes("{group.label} · {action.capabilityName}"), true);
  assert.equal(company.includes("Common actions"), true);
  assert.equal(company.includes("Configure company capabilities"), true);
  assert.equal(company.includes('aria-label="Loading company actions"'), true);
  assert.equal(company.includes("Open commodity directory"), false);
  assert.equal(company.includes("Manage trade listings"), false);
});

test("company capabilities show one authoritative review state and cooldown eligibility", () => {
  const company = read("../src/app/dashboard/company/page.tsx");
  assert.equal(company.includes('label: "Changes pending review"'), true);
  assert.equal(company.includes('label: "Changes approved"'), true);
  assert.equal(company.includes('label: "Changes rejected"'), true);
  assert.equal(company.includes('label: "Capabilities approved"'), true);
  assert.equal(company.includes('capabilityEligibility.reason === "APPROVAL_COOLDOWN"'), true);
  assert.equal(company.includes("Capability changes are locked for 7 days after approval"), true);
  assert.equal(company.includes('capabilityEligibility.reason === "PENDING_REVIEW" ? latestPendingCandidate : null'), true);
  assert.equal(company.includes('errorCode === "APPROVAL_COOLDOWN"'), true);
  assert.equal(company.includes("setIsInterestModalOpen(false)"), true);
  assert.equal(company.includes("if (capabilitySubmissionBlocked) return"), true);
  assert.equal(company.includes("Pending: {interestStatusSummary.pending}"), false);
  assert.equal(company.includes("Under Review: {interestStatusSummary.underReview}"), false);
  assert.equal(company.includes("Action Taken: {interestStatusSummary.actionTaken}"), false);
});
