export type AdminWorkflowGroup =
  | "Buying"
  | "Selling"
  | "Trade"
  | "Labs"
  | "Packaging"
  | "Freight"
  | "Warehouse";

export const DASHBOARD_ADMIN_WORKFLOW_GROUPS: Array<{ label: AdminWorkflowGroup; links: string[] }> = [
  {
    label: "Buying",
    links: [
      "/dashboard/marketplace",
      "/dashboard/bidding/my",
      "/dashboard/imports",
      "/dashboard/catalog",
    ],
  },
  {
    label: "Selling",
    links: [
      "/dashboard/product",
      "/dashboard/bidding",
      "/dashboard/imports/my-listings",
      "/dashboard/inventory",
    ],
  },
  {
    label: "Trade",
    links: [
      "/dashboard/enquiries",
      "/dashboard/sample-requests",
      "/dashboard/orders",
      "/dashboard/imports/reservations",
      "/dashboard/external-orders",
      "/dashboard/execution-enquiries",
    ],
  },
  {
    label: "Labs",
    links: [
      "/dashboard/quality-labs",
      "/dashboard/quality-labs/my",
      "/dashboard/quality-labs/execution",
    ],
  },
  {
    label: "Packaging",
    links: [
      "/dashboard/packaging",
      "/dashboard/packaging/my",
      "/dashboard/packaging/execution",
    ],
  },
  {
    label: "Freight",
    links: [
      "/dashboard/freight-forwarding",
      "/dashboard/freight-forwarding/my",
      "/dashboard/freight-forwarding/associates",
      "/dashboard/freight-forwarding/shipments",
      "/dashboard/freight-forwarding/customs",
      "/dashboard/freight-forwarding/finance",
    ],
  },
  {
    label: "Warehouse",
    links: [
      "/dashboard/warehouse-rent",
      "/dashboard/warehouses",
      "/dashboard/warehouses/operations",
    ],
  },
];
