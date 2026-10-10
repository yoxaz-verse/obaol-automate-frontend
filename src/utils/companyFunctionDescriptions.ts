export type CompanyFunctionPerspective = "provided" | "sought";

type PerspectiveCopy = Record<CompanyFunctionPerspective, string>;

export const COMPANY_FUNCTION_PERSPECTIVE_COPY: Record<string, PerspectiveCopy> = {
  buyer: {
    provided: "We purchase commodities or products from suppliers.",
    sought: "We want to connect with buyers for our products.",
  },
  seller: {
    provided: "We sell or supply commodities and products.",
    sought: "We want to connect with sellers or suppliers.",
  },
  sourcing: {
    provided: "We source suitable products and suppliers for businesses.",
    sought: "We need help finding suitable products or suppliers.",
  },
  packaging: {
    provided: "We provide packaging, labeling, or packing services.",
    sought: "We need packaging, labeling, or packing support.",
  },
  testing: {
    provided: "We provide product testing, inspection, or certification services.",
    sought: "We need products tested, inspected, or certified.",
  },
  "warehouse-storage": {
    provided: "We provide warehousing or storage facilities.",
    sought: "We need warehouse space or storage services.",
  },
  "finance-risk": {
    provided: "We provide trade finance, payment, or insurance solutions.",
    sought: "We need financing, payment, or insurance support.",
  },
  "importing-to-india": {
    provided: "We import products from other countries into India.",
    sought: "We need help importing products into India.",
  },
  "exporting-from-india": {
    provided: "We export Indian products to international markets.",
    sought: "We need help exporting products from India.",
  },
  "freight-forwarding": {
    provided: "We coordinate domestic or international freight movement.",
    sought: "We need freight forwarding for our shipments.",
  },
  "inland-logistics": {
    provided: "We provide road or inland transportation services.",
    sought: "We need inland transportation for our goods.",
  },
};

export const getCompanyFunctionPerspectiveDescription = (
  slug: unknown,
  perspective: CompanyFunctionPerspective,
  apiDescription?: unknown
) => {
  const normalizedSlug = String(slug || "").trim().toLowerCase();
  const configured = COMPANY_FUNCTION_PERSPECTIVE_COPY[normalizedSlug]?.[perspective];
  if (configured) return configured;

  const fallback = String(apiDescription || "").trim();
  if (fallback) return fallback;

  return perspective === "provided"
    ? "We provide this capability to customers and partners."
    : "We are seeking this capability from customers or partners.";
};
