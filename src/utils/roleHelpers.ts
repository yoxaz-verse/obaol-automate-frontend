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
};

export const getAllowedRoles = (pathname: string): string[] => {
  const dynamicRoute = Object.keys(routeRoles).find((route) => {
    const dynamicPattern = new RegExp(
      `^${route.replace(/:\w+/g, "[^/]+")}$` // Replace ":param" with dynamic segments
    );
    return dynamicPattern.test(pathname);
  });
  return routeRoles[dynamicRoute || ""] || [];
};
