export type CompanyFunctionAction = { label: string; href: string; description: string; primary?: boolean };
export type CompanyFunctionPreviewDefinition = { slug: string; name: string; description: string; actions: CompanyFunctionAction[] };

export type CompanyFunctionRoleContext = {
  perspectiveLabel: "Seeking" | "Providing";
  roleLabel: string;
  explanation: string;
};

export const COMPANY_FUNCTION_PREVIEW_DEFINITIONS: CompanyFunctionPreviewDefinition[] = [
  { slug: "buyer", name: "Buyer", description: "Find products available on OBAOL and manage the steps from enquiry to order.", actions: [
    { label: "Browse live trade listings", href: "/dashboard/marketplace", description: "See products that are currently listed on the marketplace.", primary: true },
    { label: "Buying requests", href: "/dashboard/bidding/my", description: "Tell sellers what you need, compare their confidential offers, and choose a seller." },
    { label: "Browse commodity catalog", href: "/dashboard/catalog", description: "Explore commodities available through OBAOL." },
    { label: "Manage enquiries", href: "/dashboard/enquiries", description: "Review and follow up on product enquiries." },
    { label: "Sample requests", href: "/dashboard/sample-requests", description: "Request and track product samples." },
    { label: "Track orders", href: "/dashboard/orders", description: "Follow confirmed orders through their lifecycle." },
  ] },
  { slug: "seller", name: "Seller", description: "List products for buyers and manage your active selling activity on OBAOL.", actions: [
    { label: "Start selling", href: "/dashboard/product", description: "Create a trade listing for a product you want to sell.", primary: true },
    { label: "Buyer requests", href: "/dashboard/bidding", description: "Find products buyers need and submit a confidential price offer." },
    { label: "Manage my trade listings", href: "/dashboard/product", description: "Review and update your existing product listings." },
    { label: "View live trade listings", href: "/dashboard/marketplace", description: "See products that are currently live on the marketplace." },
    { label: "Manage inventory", href: "/dashboard/inventory", description: "Keep product stock and availability up to date." },
    { label: "Manage enquiries", href: "/dashboard/enquiries", description: "Respond to buyer interest and continue to confirmed orders." },
    { label: "Track orders", href: "/dashboard/orders", description: "Follow confirmed sales through their lifecycle." },
  ] },
  { slug: "sourcing", name: "Sourcing", description: "Find suitable products and suppliers using the existing marketplace and enquiry tools.", actions: [
    { label: "Browse trade listings", href: "/dashboard/marketplace", description: "Review current product and supply listings.", primary: true },
    { label: "Manage enquiries", href: "/dashboard/enquiries", description: "Capture requirements and follow up with suppliers." },
    { label: "Track orders", href: "/dashboard/orders", description: "Follow sourced products after confirmation." },
  ] },
  { slug: "packaging", name: "Packaging", description: "Coordinate packaging requirements through active requests, orders, and documents.", actions: [
    { label: "Packaging Services", href: "/dashboard/packaging", description: "Find providers or create a sealed packaging requirement.", primary: true },
    { label: "My Packaging", href: "/dashboard/packaging/my", description: "Maintain packaging capabilities, credentials, and coverage." },
    { label: "Packaging Execution", href: "/dashboard/packaging/execution", description: "Track awarded packaging work and dispatch readiness." },
  ] },
  { slug: "testing", name: "Quality Testing & Labs", description: "Find quality laboratories and manage product samples and test documentation.", actions: [
    { label: "Find quality labs", href: "/dashboard/quality-labs", description: "Search the quality lab directory and view lab details.", primary: true },
    { label: "My Lab", href: "/dashboard/quality-labs/my", description: "Maintain your laboratory profile, credentials, and testing capabilities." },
    { label: "Lab execution", href: "/dashboard/quality-labs/execution", description: "Track awarded testing work and received sample custody." },
    { label: "Sample requests", href: "/dashboard/sample-requests", description: "Create and track product sample requests." },
    { label: "Test documents", href: "/dashboard/documents", description: "Keep certificates and testing files together." },
  ] },
  { slug: "warehouse-storage", name: "Warehouse / Storage", description: "Manage storage locations, inventory, and warehouse requirements.", actions: [
    { label: "My Warehouses", href: "/dashboard/warehouses", description: "View and manage warehouse locations.", primary: true },
    { label: "Warehouse operations", href: "/dashboard/warehouses/operations", description: "Record movements and review storage charges." },
    { label: "Inventory", href: "/dashboard/inventory", description: "Track stock held for trading and fulfillment." },
    { label: "Warehouse booking", href: "/dashboard/warehouse-rent", description: "Find or allocate additional storage space." },
  ] },
  { slug: "finance-risk", name: "Finance & Insurance", description: "Review the existing payment, order, and commercial-document workflows.", actions: [
    { label: "Payments", href: "/dashboard/payments", description: "Review payment activity available in OBAOL.", primary: true },
    { label: "Orders", href: "/dashboard/orders", description: "Review commercial status by order." },
    { label: "Documentation", href: "/dashboard/documentation", description: "Create, upload, and manage trade documents." },
  ] },
  { slug: "importing-to-india", name: "Importing into India", description: "Manage inbound imports to India using the current shipment and trade workflows.", actions: [
    { label: "Import Opportunities", href: "/dashboard/imports", description: "Browse incoming import listings and reserve available quantities.", primary: true },
    { label: "My Import Listings", href: "/dashboard/imports/my-listings", description: "Create and manage your company’s incoming listings." },
    { label: "My Import Reservations", href: "/dashboard/imports/reservations", description: "Track quantities your company has reserved from inbound import opportunities." },
    { label: "Orders", href: "/dashboard/orders", description: "Track the orders connected to imported products." },
    { label: "Documents", href: "/dashboard/documents", description: "Manage import and customs documentation." },
    { label: "Execution requests", href: "/dashboard/execution-enquiries", description: "Follow customs, logistics, and handoff requests." },
  ] },
  { slug: "exporting-from-india", name: "Exporting from India", description: "List products for international buyers and manage outbound trade activity.", actions: [
    { label: "Create export listing", href: "/dashboard/product", description: "Publish a product for buyers on OBAOL.", primary: true },
    { label: "Orders", href: "/dashboard/orders", description: "Track confirmed outbound orders." },
    { label: "Documents", href: "/dashboard/documents", description: "Manage export and dispatch documentation." },
    { label: "Execution requests", href: "/dashboard/execution-enquiries", description: "Coordinate export work already supported by OBAOL." },
  ] },
  { slug: "freight-forwarding", name: "Freight Forwarding", description: "Coordinate freight work through execution requests, orders, and shipping documents.", actions: [
    { label: "Execution requests", href: "/dashboard/execution-enquiries", description: "Review freight work and shipment handoffs.", primary: true },
    { label: "Orders", href: "/dashboard/orders", description: "Track freight requirements by order." },
    { label: "Documents", href: "/dashboard/documents", description: "Manage shipping and freight files." },
  ] },
  { slug: "inland-logistics", name: "Inland Logistics", description: "Coordinate inland movement using the existing execution, order, and warehouse tools.", actions: [
    { label: "Execution requests", href: "/dashboard/execution-enquiries", description: "Review dispatch and delivery work.", primary: true },
    { label: "Orders", href: "/dashboard/orders", description: "Track inland movement requirements by order." },
    { label: "Warehouses", href: "/dashboard/warehouses", description: "Coordinate storage and logistics handoffs." },
  ] },
];

export const CANONICAL_COMPANY_FUNCTION_SLUGS = COMPANY_FUNCTION_PREVIEW_DEFINITIONS.map(({ slug }) => slug);
const LEGACY_SLUGS: Record<string, string> = { buying: "buyer", buy: "buyer", selling: "seller", sell: "seller" };

export const normalizePreviewFunctionSlug = (value: unknown) => {
  const slug = String(value || "").trim().toLowerCase().replace(/_/g, "-");
  return LEGACY_SLUGS[slug] || slug;
};

export const getPreviewDefinition = (slug: unknown, perspective: "provided" | "sought" = "provided") => {
  const normalized = normalizePreviewFunctionSlug(slug);
  const definition = COMPANY_FUNCTION_PREVIEW_DEFINITIONS.find((item) => item.slug === normalized);
  if (!definition || perspective === "provided") return definition;
  const actionSlug = normalized === "seller" ? "buyer" : normalized === "buyer" ? "seller" : normalized;
  const actionDefinition = COMPANY_FUNCTION_PREVIEW_DEFINITIONS.find((item) => item.slug === actionSlug);
  return {
    ...definition,
    description: normalized === "seller"
      ? "Find sellers and products your company is looking for on OBAOL."
      : normalized === "buyer"
        ? "Reach buyers your company wants to serve and manage selling activity."
        : `Find and coordinate ${definition.name.toLowerCase()} support through existing OBAOL workflows.`,
    actions: actionDefinition?.actions || definition.actions,
  };
};

export const getCapabilityActionLinks = (
  capabilities: unknown[],
  perspective: "provided" | "sought" = "provided",
) => {
  const links: string[] = [];
  const seen = new Set<string>();

  capabilities.forEach((slug) => {
    getPreviewDefinition(slug, perspective)?.actions.forEach(({ href }) => {
      if (seen.has(href)) return;
      seen.add(href);
      links.push(href);
    });
  });

  return links;
};

export const getCompanyFunctionRoleContext = (
  slug: unknown,
  perspective: "provided" | "sought" = "provided",
): CompanyFunctionRoleContext => {
  const normalized = normalizePreviewFunctionSlug(slug);
  const perspectiveLabel = perspective === "sought" ? "Seeking" : "Providing";

  if (normalized === "buyer") {
    return perspective === "sought"
      ? { perspectiveLabel, roleLabel: "Seller workspace", explanation: "You are selling to buyers your company wants to reach." }
      : { perspectiveLabel, roleLabel: "Buyer workspace", explanation: "You are buying products and managing enquiries through to orders." };
  }

  if (normalized === "seller") {
    return perspective === "sought"
      ? { perspectiveLabel, roleLabel: "Buyer workspace", explanation: "You are finding sellers and products for your company to buy." }
      : { perspectiveLabel, roleLabel: "Seller workspace", explanation: "You are listing products and managing buyer interest through to orders." };
  }

  const definition = getPreviewDefinition(normalized, perspective);
  return {
    perspectiveLabel,
    roleLabel: perspective === "sought" ? "Partner workspace" : "Service workspace",
    explanation: perspective === "sought"
      ? `You are finding and coordinating ${definition?.name.toLowerCase() || "this capability"} support.`
      : `You are providing and managing ${definition?.name.toLowerCase() || "this capability"} services.`,
  };
};

export const filterCanonicalPreviewFunctions = <T extends { slug?: unknown }>(rows: T[]): T[] => {
  const bySlug = new Map<string, T>();
  for (const row of rows) {
    const slug = normalizePreviewFunctionSlug(row.slug);
    if (!CANONICAL_COMPANY_FUNCTION_SLUGS.includes(slug)) continue;
    const existing = bySlug.get(slug);
    const isCanonicalRow = String(row.slug || "").trim().toLowerCase() === slug;
    const existingIsCanonical = existing && String(existing.slug || "").trim().toLowerCase() === slug;
    if (!existing || (isCanonicalRow && !existingIsCanonical)) bySlug.set(slug, row);
  }
  return CANONICAL_COMPANY_FUNCTION_SLUGS.map((slug) => bySlug.get(slug)).filter(Boolean) as T[];
};
