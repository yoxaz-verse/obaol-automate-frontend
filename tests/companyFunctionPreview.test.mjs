import test from "node:test";
import assert from "node:assert/strict";
import {
  CANONICAL_COMPANY_FUNCTION_SLUGS,
  COMPANY_FUNCTION_PREVIEW_DEFINITIONS,
  filterCanonicalPreviewFunctions,
  getCompanyFunctionRoleContext,
  getPreviewDefinition,
} from "../src/utils/companyFunctionPreview.ts";
import { getDashboardRoute } from "../src/utils/dashboardAccess.ts";

test("preview contains the complete canonical taxonomy once", () => {
  assert.equal(COMPANY_FUNCTION_PREVIEW_DEFINITIONS.length, 11);
  assert.deepEqual(
    COMPANY_FUNCTION_PREVIEW_DEFINITIONS.map(({ slug }) => slug),
    CANONICAL_COMPANY_FUNCTION_SLUGS
  );
  assert.equal(new Set(CANONICAL_COMPANY_FUNCTION_SLUGS).size, 11);
});

test("legacy buying and selling rows do not duplicate canonical buyer and seller", () => {
  const rows = [
    { _id: "legacy-buy", slug: "buying" },
    { _id: "seller", slug: "seller" },
    { _id: "legacy-sell", slug: "selling" },
    { _id: "buyer", slug: "buyer" },
    { _id: "unknown", slug: "unimplemented-function" },
  ];
  const filtered = filterCanonicalPreviewFunctions(rows);
  assert.deepEqual(filtered.map(({ slug }) => slug), ["buyer", "seller"]);
  assert.deepEqual(filtered.map(({ _id }) => _id), ["buyer", "seller"]);
});

test("buyer and seller have distinct role-specific primary actions", () => {
  const buyer = getPreviewDefinition("buyer");
  const seller = getPreviewDefinition("seller");
  assert.equal(buyer?.actions.find(({ primary }) => primary)?.href, "/dashboard/marketplace");
  assert.equal(seller?.actions.find(({ primary }) => primary)?.label, "Start selling");
  assert.equal(seller?.actions.find(({ primary }) => primary)?.href, "/dashboard/product");
});

test("sought trade capabilities use the counterparty workflow", () => {
  const seekingSeller = getPreviewDefinition("seller", "sought");
  const seekingBuyer = getPreviewDefinition("buyer", "sought");
  assert.equal(seekingSeller?.actions.find(({ primary }) => primary)?.href, "/dashboard/marketplace");
  assert.equal(seekingBuyer?.actions.find(({ primary }) => primary)?.href, "/dashboard/product");
  assert.doesNotMatch(seekingSeller?.actions.find(({ primary }) => primary)?.label || "", /start selling/i);
});

test("buyer and seller capability context explains the user's actual trade role", () => {
  assert.deepEqual(getCompanyFunctionRoleContext("buyer", "sought"), {
    perspectiveLabel: "Seeking",
    roleLabel: "Seller workspace",
    explanation: "You are selling to buyers your company wants to reach.",
  });
  assert.deepEqual(getCompanyFunctionRoleContext("seller", "sought"), {
    perspectiveLabel: "Seeking",
    roleLabel: "Buyer workspace",
    explanation: "You are finding sellers and products for your company to buy.",
  });
  assert.equal(getCompanyFunctionRoleContext("seller", "provided").roleLabel, "Seller workspace");
});

test("all preview actions point to registered dashboard screens", () => {
  for (const definition of COMPANY_FUNCTION_PREVIEW_DEFINITIONS) {
    for (const action of definition.actions) {
      assert.ok(getDashboardRoute(action.href), `${definition.slug}: ${action.href} must be registered`);
    }
  }
});

test("labs and imports expose their implemented workspaces", () => {
  assert.ok(getPreviewDefinition("testing")?.actions.some(({ href }) => href === "/dashboard/quality-labs"));
  assert.ok(getPreviewDefinition("testing")?.actions.some(({ href }) => href === "/dashboard/sample-requests"));
  assert.ok(getPreviewDefinition("importing-to-india")?.actions.some(({ href }) => href === "/dashboard/imports"));
});
