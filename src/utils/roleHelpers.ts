export const routeRoles: { [key: string]: string[] } = {
  "/dashboard": [
    "Admin",
    "Customer",
    "Associate",
    "ProjectManager",
    "Worker",
    "Employee",
  ],
  "/dashboard/essentials": ["Admin"],
  "/dashboard/users": ["Admin"],
  // "/dashboard/bulk": ["Admin","Employee"],

  "/dashboard/product": [
    "Admin",
    "Customer",
    "Associate",
    "ProjectManager",
    "Worker",
    "Employee",
  ],
  "/dashboard/companyProduct": ["Admin", "Employee"],
  "/dashboard/logistics": ["Admin"],
  "/dashboard/catalog": ["Admin", "Associate", "Employee"],
  "/dashboard/map": ["Admin", "Associate"],
  "/dashboard/geosphere": ["Admin", "Associate"],
  "/dashboard/enquiries": ["Admin", "Associate", "Employee", "ProjectManager", "Worker", "Customer"],
  "/dashboard/orders": ["Admin", "Associate", "Employee", "ProjectManager", "Worker", "Customer"],
  "/dashboard/orders/:id": ["Admin", "Associate", "Employee", "ProjectManager", "Worker", "Customer"],
  "/dashboard/execution-enquiries": ["Admin", "Associate", "Employee"],
  "/dashboard/rates": ["Admin"],
  "/dashboard/profile": [
    "Admin",
    "Employee",
    "Customer",
    "Associate",
    "ProjectManager",
    "Worker",
  ],
  "/dashboard/rsForm": ["Admin", "Employee"],
  "/dashboard/marketplace": [
    "Admin",
    "Customer",
    "Associate",
    "ProjectManager",
    "Worker",
    "Employee",
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
