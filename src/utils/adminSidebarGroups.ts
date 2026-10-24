export type AdminWorkflowGroup =
  | "Buying"
  | "Selling"
  | "Trade"
  | "Labs"
  | "Packaging"
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
      "/dashboard/documents",
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
    label: "Warehouse",
    links: [
      "/dashboard/warehouse-rent",
      "/dashboard/warehouses",
      "/dashboard/warehouses/operations",
    ],
  },
];
