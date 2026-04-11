export const routeRoles: { [key: string]: string[] } = {
  "/dashboard": [
    "Admin",
    "Customer",
    "Associate",
    "ProjectManager",
    "Worker",
    "Operator",
  ],
  "/dashboard/onboarding": ["Associate", "Operator", "team"],
  "/dashboard/essentials": ["Admin"],
  "/dashboard/users": ["Admin"],
  // "/dashboard/bulk": ["Admin","Operator"],

  "/dashboard/product": [
    "Admin",
    "Customer",
    "Associate",
    "ProjectManager",
    "Worker",
    "Operator",
  ],
  "/dashboard/company": ["Associate", "Admin", "Operator", "team"],
  "/dashboard/companies": ["Admin"],
  "/dashboard/operator/hierarchy": ["Admin", "Operator", "team"],
  "/dashboard/operator/team": ["Admin", "Operator", "team"],
  "/dashboard/operator/earnings": ["Admin", "Operator", "team"],
  "/dashboard/operators/overview": ["Admin"],
  "/dashboard/catalog": ["Admin", "Associate", "Operator"],
  "/dashboard/inventory": ["Admin", "Associate", "Operator"],
  "/dashboard/warehouses": ["Admin", "Associate", "Operator"],
  "/dashboard/warehouses/location": ["Admin", "Associate", "Operator"],
  "/dashboard/warehouse-rent": ["Admin", "Associate", "Operator"],
  "/dashboard/map": ["Admin", "Associate"],
  "/dashboard/geosphere": ["Admin"],
  "/dashboard/enquiries": ["Admin", "Associate", "Operator", "ProjectManager", "Worker", "Customer"],
  "/dashboard/sample-requests": ["Admin", "Associate", "Operator", "team"],
  "/dashboard/orders": ["Admin", "Associate", "Operator", "ProjectManager", "Worker", "Customer"],
  "/dashboard/external-orders": ["Admin", "Associate", "Operator", "team"],
  "/dashboard/external-orders/new": ["Admin", "Associate", "Operator", "team"],
  "/dashboard/orders/:id": ["Admin", "Associate", "Operator", "ProjectManager", "Worker", "Customer"],
  "/dashboard/documents": ["Admin", "Associate", "Operator", "team"],
  "/dashboard/documents/:id": ["Admin", "Associate", "Operator", "team"],
  "/dashboard/news": ["Admin", "Operator", "team"],
  "/dashboard/documentation-rules": ["Admin"],
  "/dashboard/documentation-preview": ["Admin"],
  "/dashboard/payments": ["Admin"],
  "/dashboard/flow-rules": ["Admin"],
  "/dashboard/order-rules": ["Admin"],
  "/dashboard/enquiry-rules": ["Admin"],
  "/dashboard/function-preview": ["Admin"],
  "/dashboard/calculations": ["Admin"],
  "/dashboard/shortcuts": ["Admin", "Associate", "Operator", "team", "Customer", "ProjectManager", "Worker"],
  "/dashboard/execution-enquiries": ["Admin", "Associate", "Operator", "team"],
  "/dashboard/notifications": ["Admin", "Associate", "Operator", "Customer", "ProjectManager", "Worker"],
  "/dashboard/approvals": ["Admin"],
  "/dashboard/reports": ["Admin"],
  "/export-resources": [
    "Admin",
    "Customer",
    "Associate",
    "ProjectManager",
    "Worker",
    "Operator",
  ],
  "/dashboard/rates": ["Admin"],
  "/dashboard/profile": [
    "Admin",
    "Operator",
    "Customer",
    "Associate",
    "ProjectManager",
    "Worker",
  ],
  "/dashboard/guidance": [
    "Admin",
    "Operator",
    "Customer",
    "Associate",
    "ProjectManager",
    "Worker",
    "team",
  ],
  // "/dashboard/rsForm": ["Associate"],
  "/dashboard/marketplace": [
    "Admin",
    "Customer",
    "Associate",
    "ProjectManager",
    "Worker",
    "Operator",
  ],
  "/dashboard/imports": [
    "Admin",
    "Associate",
    "Operator",
    "team",
  ],
  "/dashboard/rejected": [
    "Admin",
    "Associate",
    "Operator",
    "team",
  ],
};

export const getAllowedRoles = (pathname: string): string[] => {
  const normalizedPath = pathname.endsWith("/") && pathname.length > 1
    ? pathname.slice(0, -1)
    : pathname;

  if (normalizedPath.startsWith("/dashboard/orders/")) {
    return routeRoles["/dashboard/orders/:id"] || routeRoles["/dashboard/orders"] || [];
  }
  if (normalizedPath.startsWith("/dashboard/enquiries/")) {
    return routeRoles["/dashboard/enquiries"] || [];
  }

  const dynamicRoute = Object.keys(routeRoles).find((route) => {
    const dynamicPattern = new RegExp(
      `^${route.replace(/:\w+/g, "[^/]+")}$` // Replace ":param" with dynamic segments
    );
    return dynamicPattern.test(normalizedPath);
  });
  return routeRoles[dynamicRoute || ""] || [];
};
