import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page = fs.readFileSync(new URL("../src/app/dashboard/bidding/page.tsx", import.meta.url), "utf8");
const buyerPage = fs.readFileSync(new URL("../src/app/dashboard/bidding/my/page.tsx", import.meta.url), "utf8");
const access = fs.readFileSync(new URL("../src/utils/dashboardAccess.ts", import.meta.url), "utf8");
const sidebar = fs.readFileSync(new URL("../src/utils/utils.tsx", import.meta.url), "utf8");

test("buyer and seller bidding workspaces are registered independently", () => {
  assert.match(access, /path: "\/dashboard\/bidding"/);
  assert.match(access, /path: "\/dashboard\/bidding\/my"/);
  assert.match(sidebar, /link: "\/dashboard\/bidding"/);
  assert.match(sidebar, /link: "\/dashboard\/bidding\/my"/);
});

test("bidding workspace fixes the seller page and buyer page to separate modes", () => {
  assert.match(page, /Offer identities and prices unlock only after closing/);
  assert.match(page, /Available/);
  assert.match(page, /Participating/);
  assert.match(page, /History/);
  assert.match(page, /Create buying request/);
  assert.match(page, /Variant \/ Grade/);
  assert.match(page, /productVariant/);
  assert.match(page, /isDismissable=\{false\}/);
  assert.match(page, /Review draft/);
  assert.match(page, /Confirm enquiry/);
  assert.match(page, /Open now/);
  assert.match(page, /Schedule for later/);
  assert.match(page, /Delivery must be on a later day than closing/);
  assert.match(page, /detectOffPlatformDisclosure/);
  assert.match(page, /role="alert"/);
  assert.match(page, /maxListboxHeight=\{224\}/);
  assert.match(buyerPage, /fixedMode="buyer"/);
});

test("buying request catalog pickers use controlled debounced server search", () => {
  assert.match(page, /useDebouncedValue\(productSearch\.trim\(\), 300\)/);
  assert.match(page, /useDebouncedValue\(variantSearch\.trim\(\), 300\)/);
  assert.match(page, /queryKey: \["bidding-products", debouncedProductSearch\]/);
  assert.match(page, /queryKey: \["bidding-product-variants", draft\.product, debouncedVariantSearch\]/);
  assert.match(page, /search: debouncedProductSearch/);
  assert.match(page, /product: draft\.product/);
  assert.match(page, /search: debouncedVariantSearch/);
  assert.match(page, /inputValue=\{productSearch\}/);
  assert.match(page, /inputValue=\{variantSearch\}/);
  assert.match(page, /clearProductSelection\(\)/);
  assert.match(page, /variantInputRef\.current\?\.blur\(\)/);
  assert.match(page, /productInputRef\.current\?\.blur\(\)/);
  assert.match(page, /allowsCustomValue=\{false\}/);
});

test("buying request modal exposes useful catalog states and flat surfaces", () => {
  assert.match(page, /Searching products\.\.\./);
  assert.match(page, /Unable to load products\./);
  assert.match(page, /No matching products found/);
  assert.match(page, /Searching variants\.\.\./);
  assert.match(page, /Unable to load variants\./);
  assert.match(page, /No matching variants found/);
  assert.match(page, /backdrop="opaque"/);
  assert.match(page, /base: "border border-default-200 bg-content1 shadow-none/);
  assert.match(page, /content: "border border-default-200 bg-content1 shadow-none/);
});
