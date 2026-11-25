export type OperatorCapabilitySummary = {
  companyCount: number;
  providedCapabilities: string[];
  soughtCapabilities: string[];
  eligibility: Record<string, { provided: string[]; sought: string[] }>;
};

export const EMPTY_OPERATOR_CAPABILITY_SUMMARY: OperatorCapabilitySummary = {
  companyCount: 0,
  providedCapabilities: [],
  soughtCapabilities: [],
  eligibility: {},
};

export const normalizeOperatorCapabilitySummary = (value: unknown): OperatorCapabilitySummary => {
  const source = value && typeof value === "object" ? value as Partial<OperatorCapabilitySummary> : {};
  const strings = (items: unknown) => Array.isArray(items)
    ? items.filter((item): item is string => typeof item === "string")
    : [];

  return {
    companyCount: Number.isFinite(Number(source.companyCount)) ? Number(source.companyCount) : 0,
    providedCapabilities: strings(source.providedCapabilities),
    soughtCapabilities: strings(source.soughtCapabilities),
    eligibility: source.eligibility && typeof source.eligibility === "object" && !Array.isArray(source.eligibility)
      ? source.eligibility
      : {},
  };
};
