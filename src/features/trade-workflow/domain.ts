export type ResponsibilityOwner = "buyer" | "seller" | "obaol";
export type ResponsibilitySelection = ResponsibilityOwner | "";

export type ResponsibilityPlan = {
  procurementBy: ResponsibilitySelection;
  certificateBy: ResponsibilitySelection;
  transportBy: ResponsibilitySelection;
  shippingBy: ResponsibilitySelection;
  packagingBy: ResponsibilitySelection;
  qualityTestingBy: ResponsibilitySelection;
  cargoInsuranceBy: ResponsibilitySelection;
  exportCustomsBy: ResponsibilitySelection;
  importCustomsBy: "buyer" | "obaol" | "";
  dutiesTaxesBy: "buyer" | "";
  portHandlingBy: "buyer" | "obaol" | "";
  destinationInlandTransportBy: "buyer" | "obaol" | "";
  destinationInspectionBy: "buyer" | "obaol" | "";
  finalDeliveryConfirmationBy: "obaol" | "";
};

export type ExecutionContext = {
  tradeType: "DOMESTIC" | "INTERNATIONAL";
  originCountry: string;
  originState: string;
  originDistrict: string;
  originPort: string;
  destinationCountry: string;
  destinationState: string;
  destinationDistrict: string;
  destinationPort: string;
  routeNotes: string;
};

export const OWNER_OPTIONS = [
  { key: "buyer", label: "Buyer" },
  { key: "seller", label: "Supplier" },
  { key: "obaol", label: "OBAOL Team" },
] as const;

const OWNER_KEYS: ReadonlySet<string> = new Set(OWNER_OPTIONS.map(({ key }) => key));

export const sanitizeOwner = (value: unknown): ResponsibilityOwner => {
  const owner = String(value ?? "").toLowerCase();
  return OWNER_KEYS.has(owner) ? (owner as ResponsibilityOwner) : "obaol";
};

export const sanitizeBuyerOrObaol = (value: unknown): "buyer" | "obaol" =>
  String(value ?? "").toLowerCase() === "obaol" ? "obaol" : "buyer";

export const sanitizeBuyerOnly = (_value?: unknown): "buyer" => "buyer";
export const sanitizeObaolOnly = (_value?: unknown): "obaol" => "obaol";

export const normalizeExecutionContext = (context: ExecutionContext): ExecutionContext => ({
  tradeType: context.tradeType === "INTERNATIONAL" ? "INTERNATIONAL" : "DOMESTIC",
  originCountry: String(context.originCountry || ""),
  originState: String(context.originState || ""),
  originDistrict: String(context.originDistrict || ""),
  originPort: String(context.originPort || ""),
  destinationCountry: String(context.destinationCountry || ""),
  destinationState: String(context.destinationState || ""),
  destinationDistrict: String(context.destinationDistrict || ""),
  destinationPort: String(context.destinationPort || ""),
  routeNotes: String(context.routeNotes || ""),
});

export const getOwnerLabel = (owner: string): string =>
  OWNER_OPTIONS.find(({ key }) => key === owner)?.label ?? "Not set";
