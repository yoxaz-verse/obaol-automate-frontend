import type { ProductionMethod } from "@/utils/productClassification";

export type RateWizardForm = Record<string, unknown>;
export type RateWizardOption = { key?: unknown; _id?: unknown; id?: unknown; value?: unknown };

export type LaunchValidationContext = {
  form: RateWizardForm;
  fixedVariantId?: string;
  categories: RateWizardOption[];
  subCategories: RateWizardOption[];
  products: RateWizardOption[];
  variants: RateWizardOption[];
  productionMethod?: ProductionMethod | null;
  isAssociateUser: boolean;
  isOperatorUser: boolean;
  resolvedCompanyId?: string;
};

export const optionKey = (item: unknown) => {
  const option = item as RateWizardOption | null;
  return String(option?.key ?? option?._id ?? option?.id ?? option?.value ?? "");
};

export const stepForRateWizardErrors = (keys: string[]): number => {
  const step1 = new Set([
    "category", "subCategory", "product", "productVariant", "classification",
    "giName", "giCertificateNumber", "organicCertificationBody", "organicCertificationBodyOther",
    "organicCertificateNumber", "organicCertificateValidFrom", "organicCertificateValidTo",
    "organicCertifiedQuantity", "organicCertifiedQuantityUnit", "organicCertificationScope",
  ]);
  const step2 = new Set(["rate", "unit", "associate"]);
  const step3 = new Set(["locationSource", "warehouseId", "officeAddress"]);
  if (keys.some((key) => step1.has(key))) return 1;
  if (keys.some((key) => step2.has(key))) return 2;
  if (keys.some((key) => step3.has(key))) return 3;
  return 4;
};

export function validateRateWizardLaunch(context: LaunchValidationContext): Record<string, string> {
  const { form, fixedVariantId, categories, subCategories, products, variants } = context;
  const errors: Record<string, string> = {};
  if (!fixedVariantId) {
    if (!form.category) errors.category = "Select a category.";
    if (!form.subCategory) errors.subCategory = "Select a sub category.";
    if (!form.product) errors.product = "Select a product.";
    if (!form.productVariant) errors.productVariant = "Select a product variant.";
    if (form.category && !categories.some((item) => optionKey(item) === String(form.category))) errors.category = "Select a valid category.";
    if (form.subCategory && !subCategories.some((item) => optionKey(item) === String(form.subCategory))) errors.subCategory = "This subcategory is not associated with the selected category.";
    if (form.product && !products.some((item) => optionKey(item) === String(form.product))) errors.product = "This product is not associated with the selected subcategory.";
    if (form.productVariant && !variants.some((item) => optionKey(item) === String(form.productVariant))) errors.productVariant = "This variant is not associated with the selected product.";
  }
  if (!context.productionMethod) errors.classification = "Select one production / farming method.";
  if (form.isGiTagged) {
    if (!String(form.giName || "").trim()) errors.giName = "Enter GI name.";
    if (!String(form.giCertificateNumber || "").trim()) errors.giCertificateNumber = "Enter GI certificate number.";
  }
  if (form.isOrganic) {
    if (!String(form.organicCertificationBody || "").trim()) errors.organicCertificationBody = "Select organic certification body.";
    if (String(form.organicCertificationBody || "").trim() === "OTHER" && !String(form.organicCertificationBodyOther || "").trim()) errors.organicCertificationBodyOther = "Specify certification body.";
    if (!String(form.organicCertificateNumber || "").trim()) errors.organicCertificateNumber = "Enter organic certificate number.";
    if (!String(form.organicCertificateValidFrom || "").trim()) errors.organicCertificateValidFrom = "Select organic valid from date.";
    if (!String(form.organicCertificateValidTo || "").trim()) errors.organicCertificateValidTo = "Select organic valid to date.";
    const from = Date.parse(String(form.organicCertificateValidFrom || ""));
    const to = Date.parse(String(form.organicCertificateValidTo || ""));
    if (Number.isFinite(from) && Number.isFinite(to) && to < from) errors.organicCertificateValidTo = "Valid to date cannot be before valid from date.";
    const quantity = Number(form.organicCertifiedQuantity || 0);
    if (!Number.isFinite(quantity) || quantity <= 0) errors.organicCertifiedQuantity = "Enter certified quantity greater than zero.";
    if (!String(form.organicCertifiedQuantityUnit || "").trim()) errors.organicCertifiedQuantityUnit = "Select certified quantity unit.";
    if (!String(form.organicCertificationScope || "").trim()) errors.organicCertificationScope = "Select certification scope.";
  }
  if (!form.rate) errors.rate = "Enter price per KG.";
  if (!form.unit) errors.unit = "Select a unit.";
  if (!form.locationSource) errors.locationSource = "Select a location source.";
  if (form.locationSource === "WAREHOUSE" && !form.warehouseId) errors.warehouseId = "Select a warehouse.";
  if (form.locationSource === "OFFICE_ADDRESS" && !String(form.officeAddress || "").trim()) errors.officeAddress = "Enter office address.";
  if (!context.isAssociateUser && !form.associate) errors.associate = "Select an associate.";
  if (!context.isAssociateUser && context.isOperatorUser && form.associate && !context.resolvedCompanyId) errors.associate = "Selected associate is not linked to a company.";
  return errors;
}

export function buildClassificationPayload(form: RateWizardForm) {
  const method = form.productionMethod as ProductionMethod | null | undefined;
  const organic = method === "organic";
  const giTagged = Boolean(form.isGiTagged);
  return {
    isConventional: method === "conventional", isNatural: method === "natural", isOrganic: organic,
    isIpmQuality: method === "ipm", isOrganicCertified: organic,
    organicCertificationBody: organic ? String(form.organicCertificationBody || "").trim() : "",
    organicCertificationBodyOther: organic ? String(form.organicCertificationBodyOther || "").trim() : "",
    organicCertificateNumber: organic ? String(form.organicCertificateNumber || "").trim() : "",
    organicCertificateValidFrom: organic ? String(form.organicCertificateValidFrom || "").trim() : "",
    organicCertificateValidTo: organic ? String(form.organicCertificateValidTo || "").trim() : "",
    organicCertifiedQuantity: organic ? Number(form.organicCertifiedQuantity || 0) : 0,
    organicCertifiedQuantityUnit: organic ? String(form.organicCertifiedQuantityUnit || "KG").trim() : "KG",
    organicCertificationScope: organic ? String(form.organicCertificationScope || "NPOP").trim() : "NPOP",
    organicCertificateDocumentUrl: organic ? String(form.organicCertificateDocumentUrl || "").trim() : "",
    isGiTagged: giTagged, giName: giTagged ? String(form.giName || "").trim() : "",
    giCertificateNumber: giTagged ? String(form.giCertificateNumber || "").trim() : "",
    giDocumentUrl: giTagged ? String(form.giDocumentUrl || "").trim() : "",
  };
}

export function mapRateWizardBackendError(message: string): Record<string, string> {
  const value = String(message || "").toLowerCase();
  const errors: Record<string, string> = {};
  if (value.includes("organic certification body")) errors.organicCertificationBody = "Select a valid organic certification body.";
  if (value.includes("specify organic certification body")) errors.organicCertificationBodyOther = "Specify certification body.";
  if (value.includes("organic certificate number")) errors.organicCertificateNumber = "Enter organic certificate number.";
  if (value.includes("organic certificate validity")) { errors.organicCertificateValidFrom = "Provide valid certification dates."; errors.organicCertificateValidTo = "Provide valid certification dates."; }
  if (value.includes("valid to date")) errors.organicCertificateValidTo = "Valid to date cannot be before valid from date.";
  if (value.includes("organic certified quantity")) errors.organicCertifiedQuantity = "Certified quantity must be greater than zero.";
  if (value.includes("gi details")) { errors.giName = "GI details are required."; errors.giCertificateNumber = "GI details are required."; }
  if (value.includes("production / farming method")) errors.classification = "Select exactly one production / farming method.";
  if (value.includes("warehouse is required")) errors.warehouseId = "Select a warehouse.";
  if (value.includes("office address is required")) errors.officeAddress = "Enter office address.";
  if (value.includes("selected associate is not linked to a company")) errors.associate = "Selected associate is not linked to a company.";
  if (value.includes("select a location source")) errors.locationSource = "Select a location source.";
  if (value.includes("subcategory is no longer associated")) errors.subCategory = "Select a subcategory associated with this category.";
  if (value.includes("product is no longer associated")) errors.product = "Select a product associated with this subcategory.";
  if (value.includes("variant is no longer associated")) errors.productVariant = "Select a variant associated with this product.";
  return errors;
}
