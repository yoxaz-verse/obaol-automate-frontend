export type OperatorCapabilitySummary = {
  companyCount: number;
  providedCapabilities: string[];
  soughtCapabilities: string[];
  eligibility: Record<string, { provided: string[]; sought: string[] }>;
};

type WorkflowGroup = { label: string; links: string[] };

const GROUP_CAPABILITIES: Record<string, string[]> = {
  Buying: ["buyer", "importing-to-india"],
  Selling: ["seller", "exporting-from-india"],
  Trade: ["buyer", "seller", "importing-to-india", "exporting-from-india"],
  Agritech: ["agritech-companies"],
  Labs: ["testing"],
  Packaging: ["packaging"],
  Finance: ["finance-risk"],
  Insurance: ["insurance-risk"],
  Freight: ["freight-forwarding"],
  Transportation: ["inland-logistics"],
  Warehouse: ["warehouse-storage"],
};

const PROVIDER_ONLY_ROUTES: Record<string, string> = {
  "/dashboard/quality-labs/my": "testing",
  "/dashboard/quality-labs/execution": "testing",
  "/dashboard/packaging/my": "packaging",
  "/dashboard/packaging/execution": "packaging",
  "/dashboard/financial-partners/my": "finance-risk",
  "/dashboard/insurance-partners/my": "insurance-risk",
  "/dashboard/insurance-partners/requests": "insurance-risk",
  "/dashboard/freight-forwarding/my": "freight-forwarding",
  "/dashboard/inland-transportation/fleet": "inland-logistics",
  "/dashboard/inland-transportation/profile": "inland-logistics",
  "/dashboard/warehouses": "warehouse-storage",
  "/dashboard/warehouses/operations": "warehouse-storage",
};

export const EMPTY_OPERATOR_CAPABILITY_SUMMARY: OperatorCapabilitySummary = {
  companyCount: 0,
  providedCapabilities: [],
  soughtCapabilities: [],
  eligibility: {},
};

export const filterOperatorWorkflowGroups = (
  groups: WorkflowGroup[],
  summary: OperatorCapabilitySummary,
): WorkflowGroup[] => {
  const provided = new Set(summary.providedCapabilities);
  const all = new Set([...summary.providedCapabilities, ...summary.soughtCapabilities]);
  return groups.flatMap((group) => {
    const required = GROUP_CAPABILITIES[group.label];
    if (required && !required.some((slug) => all.has(slug))) return [];
    if (!required && group.label === "Other Services" && all.size === 0) return [];
    const links = group.links.filter((path) => {
      const providerCapability = PROVIDER_ONLY_ROUTES[path];
      return !providerCapability || provided.has(providerCapability);
    });
    return links.length ? [{ ...group, links }] : [];
  });
};
