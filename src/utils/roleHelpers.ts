export const routeRoles: { [key: string]: string[] } = {
  "/dashboard": ["Admin", "Customer", "Associate", "ProjectManager", "Worker"],
  "/dashboard/projects": [
    "Admin",
    "Customer",
    "Associate",
    "ProjectManager",
    "Worker",
  ],
  "/dashboard/essentials": ["Admin"],
  "/dashboard/users": ["Admin"],
  // "/dashboard/bulk": ["Admin"],

  "/dashboard/product": [
    "Admin",
    "Customer",
    "Associate",
    "ProjectManager",
    "Worker",
  ],
  "/dashboard/companyProduct": ["Admin"],
  "/dashboard/logistics": ["Admin"],
  "/dashboard/catalog": ["Admin", "Associate"],
  "/dashboard/map": ["Admin", "Associate"],
  "/dashboard/geosphere": ["Admin", "Associate"],
  "/dashboard/enquires": ["Admin", "Associate"],
  "/dashboard/rates": ["Admin"],
  "/dashboard/profile": [
    "Admin",
    "Customer",
    "Associate",
    "ProjectManager",
    "Worker",
  ],
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
