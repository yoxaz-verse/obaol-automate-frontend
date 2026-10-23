import test from "node:test";
import assert from "node:assert/strict";
import {
  buildClassificationPayload,
  mapRateWizardBackendError,
  stepForRateWizardErrors,
  validateRateWizardLaunch,
} from "../src/features/catalog/rateWizardDomain.ts";

const options = (id) => [{ id }];
const validForm = {
  category: "category-1", subCategory: "subcategory-1", product: "product-1", productVariant: "variant-1",
  productionMethod: "conventional", rate: 100, unit: "KG", locationSource: "WAREHOUSE", warehouseId: "warehouse-1",
};

test("validates a complete catalog rate launch", () => {
  assert.deepEqual(validateRateWizardLaunch({
    form: validForm,
    categories: options("category-1"), subCategories: options("subcategory-1"),
    products: options("product-1"), variants: options("variant-1"),
    productionMethod: "conventional", isAssociateUser: true, isOperatorUser: false,
  }), {});
});

test("rejects hierarchy mismatches and routes errors to their wizard step", () => {
  const errors = validateRateWizardLaunch({
    form: validForm,
    categories: options("other"), subCategories: options("other"), products: options("other"), variants: options("other"),
    productionMethod: "conventional", isAssociateUser: true, isOperatorUser: false,
  });
  assert.equal(errors.category, "Select a valid category.");
  assert.equal(errors.productVariant, "This variant is not associated with the selected product.");
  assert.equal(stepForRateWizardErrors(Object.keys(errors)), 1);
  assert.equal(stepForRateWizardErrors(["rate"]), 2);
  assert.equal(stepForRateWizardErrors(["warehouseId"]), 3);
});

test("validates organic certification dates and quantity", () => {
  const errors = validateRateWizardLaunch({
    form: {
      ...validForm, productionMethod: "organic", isOrganic: true,
      organicCertificationBody: "OTHER", organicCertificateNumber: "CERT",
      organicCertificateValidFrom: "2026-10-24", organicCertificateValidTo: "2026-10-23",
      organicCertifiedQuantity: 0, organicCertifiedQuantityUnit: "KG", organicCertificationScope: "NPOP",
    },
    categories: options("category-1"), subCategories: options("subcategory-1"),
    products: options("product-1"), variants: options("variant-1"),
    productionMethod: "organic", isAssociateUser: true, isOperatorUser: false,
  });
  assert.equal(errors.organicCertificationBodyOther, "Specify certification body.");
  assert.equal(errors.organicCertificateValidTo, "Valid to date cannot be before valid from date.");
  assert.equal(errors.organicCertifiedQuantity, "Enter certified quantity greater than zero.");
});

test("builds a normalized classification payload and maps backend failures", () => {
  const payload = buildClassificationPayload({
    productionMethod: "organic", isGiTagged: true, giName: "  Malabar Pepper ",
    giCertificateNumber: " GI-1 ", organicCertificationBody: " APEDA_NPOP ",
    organicCertifiedQuantity: "25", organicCertifiedQuantityUnit: "KG",
  });
  assert.equal(payload.isOrganic, true);
  assert.equal(payload.organicCertifiedQuantity, 25);
  assert.equal(payload.giName, "Malabar Pepper");
  assert.deepEqual(mapRateWizardBackendError("Warehouse is required for this listing"), {
    warehouseId: "Select a warehouse.",
  });
});
