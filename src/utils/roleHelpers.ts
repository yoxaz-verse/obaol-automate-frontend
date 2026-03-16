export const routeRoles: { [key: string]: string[] } = {
  "/dashboard": [
    "Admin",
    "Customer",
    "Associate",
    "ProjectManager",
    "Worker",
    "Operator",
  ],
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
  "/dashboard/companyProduct": ["Admin", "Operator"],
  "/dashboard/company": ["Associate"],
  "/dashboard/operator/hierarchy": ["Admin", "Operator", "team"],
  "/dashboard/operator/team": ["Admin", "Operator", "team"],
  "/dashboard/operator/earnings": ["Admin", "Operator", "team"],
  "/dashboard/catalog": ["Admin", "Associate", "Operator"],
  "/dashboard/inventory": ["Admin", "Associate", "Operator"],
  "/dashboard/map": ["Admin", "Associate"],
  "/dashboard/geosphere": ["Admin", "Associate"],
  "/dashboard/enquiries": ["Admin", "Associate", "Operator", "ProjectManager", "Worker", "Customer"],
  "/dashboard/orders": ["Admin", "Associate", "Operator", "ProjectManager", "Worker", "Customer"],
  "/dashboard/orders/:id": ["Admin", "Associate", "Operator", "ProjectManager", "Worker", "Customer"],
  "/dashboard/documents": ["Admin", "Associate", "Operator", "team"],
  "/dashboard/documents/:id": ["Admin", "Associate", "Operator", "team"],
  "/dashboard/news": ["Admin", "Associate", "Operator", "team"],
  "/dashboard/documentation-rules": ["Admin"],
  "/dashboard/documentation-preview": ["Admin"],
  "/dashboard/enquiry-rules": ["Admin"],
  "/dashboard/order-rules": ["Admin"],
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
  // "/dashboard/rsForm": ["Associate"],
  "/dashboard/marketplace": [
    "Admin",
    "Customer",
    "Associate",
    "ProjectManager",
    "Worker",
    "Operator",
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
