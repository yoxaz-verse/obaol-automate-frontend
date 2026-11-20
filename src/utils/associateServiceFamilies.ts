export type AssociateServiceFamily = {
  capability: string;
  label: string;
  routes: readonly string[];
};

export type AssociateServiceFamilyGroup = {
  label: string;
  links: string[];
};

const normalizeCapability = (value: unknown) => String(value || "")
  .trim()
  .toLowerCase()
  .replace(/_/g, "-");

/**
 * Canonical, deterministic service-family order for associate navigation.
 * A route may be listed in more than one family; the first active family wins.
 */
export const ASSOCIATE_SERVICE_FAMILIES: readonly AssociateServiceFamily[] = [
  {
    capability: "importing-to-india",
    label: "Importing into India",
    routes: ["/dashboard/imports", "/dashboard/imports/my-listings", "/dashboard/imports/reservations"],
  },
  {
    capability: "exporting-from-india",
    label: "Exporting from India",
    routes: ["/dashboard/product", "/dashboard/orders", "/dashboard/documentation", "/dashboard/execution-enquiries"],
  },
  {
    capability: "testing",
    label: "Quality Testing & Labs",
    routes: ["/dashboard/quality-labs", "/dashboard/quality-labs/my", "/dashboard/quality-labs/execution", "/dashboard/sample-requests"],
  },
  {
    capability: "packaging",
    label: "Packaging",
    routes: ["/dashboard/packaging", "/dashboard/packaging/my", "/dashboard/packaging/execution"],
  },
  {
    capability: "warehouse-storage",
    label: "Warehouse & Storage",
    routes: ["/dashboard/warehouse-rent", "/dashboard/warehouses", "/dashboard/warehouses/operations", "/dashboard/inventory"],
  },
  {
    capability: "freight-forwarding",
    label: "Freight Forwarding",
    routes: [
      "/dashboard/freight-forwarding", "/dashboard/freight-forwarding/my", "/dashboard/freight-forwarding/associates",
      "/dashboard/freight-forwarding/shipments", "/dashboard/freight-forwarding/customs",
      "/dashboard/freight-forwarding/finance", "/dashboard/freight-forwarding/eway-bills",
    ],
  },
  {
    capability: "inland-logistics",
    label: "Inland Logistics",
    routes: [
      "/dashboard/inland-transportation", "/dashboard/inland-transportation/directory",
      "/dashboard/inland-transportation/opportunities", "/dashboard/inland-transportation/trips",
      "/dashboard/inland-transportation/fleet", "/dashboard/inland-transportation/documents",
      "/dashboard/inland-transportation/profile",
    ],
  },
  {
    capability: "finance-risk",
    label: "Finance & Advisory",
    routes: ["/dashboard/financial-partners", "/dashboard/financial-partners/my", "/dashboard/financial-partners/applications"],
  },
  {
    capability: "insurance-risk",
    label: "Insurance",
    routes: ["/dashboard/insurance-partners", "/dashboard/insurance-partners/my", "/dashboard/insurance-partners/requests"],
  },
  {
    capability: "sourcing",
    label: "Sourcing & Procurement",
    routes: ["/dashboard/marketplace", "/dashboard/enquiries", "/dashboard/orders", "/dashboard/requirements"],
  },
  {
    capability: "buyer",
    label: "Buying",
    routes: ["/dashboard/marketplace", "/dashboard/bidding/my", "/dashboard/catalog", "/dashboard/enquiries", "/dashboard/sample-requests", "/dashboard/orders"],
  },
  {
    capability: "seller",
    label: "Selling",
    routes: ["/dashboard/bidding", "/dashboard/product", "/dashboard/marketplace", "/dashboard/inventory", "/dashboard/enquiries", "/dashboard/orders"],
  },
] as const;

export const groupAssociateServiceLinks = (
  visibleLinks: string[],
  providedCapabilities: string[] = [],
  soughtCapabilities: string[] = [],
): AssociateServiceFamilyGroup[] => {
  const remaining = new Set(visibleLinks);
  const capabilities = new Set([...providedCapabilities, ...soughtCapabilities].map(normalizeCapability));
  const groups: AssociateServiceFamilyGroup[] = [];

  ASSOCIATE_SERVICE_FAMILIES.forEach((family) => {
    if (!capabilities.has(family.capability)) return;
    const familyRoutes = new Set(family.routes);
    const links = visibleLinks.filter((route) => familyRoutes.has(route) && remaining.delete(route));
    if (links.length) groups.push({ label: family.label, links });
  });

  const otherLinks = visibleLinks.filter((route) => remaining.has(route));
  if (otherLinks.length) groups.push({ label: "Other Services", links: otherLinks });
  return groups;
};
