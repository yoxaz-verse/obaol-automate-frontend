// src/core/api/apiRoutes.ts

// Remove unnecessary imports
// import { count } from "console"; // Removed as it's not used

// Define base paths as constants for clarity and reusability
const BASE_PATHS = {
  USER: "/user",
  ADMIN: "/admin",
  EMPLOYEE: "/employee",
  INVENTORY_MANAGER: "/inventoryManager",
  PROJECT_MANAGER: "/projectManager",
  SERVICE_COMPANY: "/serviceCompany",
  ACTIVITY: "/activity",
  ACTIVITY_TYPE: "/activityType",
  ACTIVITY_STATUS: "/activityStatus",
  ACTIVITY_FILE: "/activityFile",
  PROJECT: "/projects",
  PROJECT_TYPE: "/projectType",
  PROJECT_STATUS: "/projectStatus",
  TIME_SHEET: "/timeSheet",
  CUSTOMER: "/customer",
  WORKER: "/worker",
  STATUS: "/status",
  STATUS_HISTORY: "/statusHistory",
  SUB_STATUS: "/subStatus",
  ASSOCIATE: "/associate",
  ASSOCIATE_COMPANY: "/associateCompany",
  CATEGORY: "/category",
  SUB_CATEGORY: "/subCategory",
  PRODUCT: "/product",
  PRODUCT_VARIANT: "/productVariant",
  VARIANT_RATE: "/variantRate",
  DISPLAYED_RATE: "/displayedRate",
  ENQUIRY: "/enquiry",
  PINCODE_ENTRY: "/pincodeEntry",
  DIVISION: "/division",
  DISTRICT: "/district",
  STATE: "/state",
  DESIGNATION: "/designation",
  ENQUIRY_PROCESS_STATUS: "/enquiryProcessStatus",
  COUNTRY: "/country",
  UN_LO_CODE: "/unLoCode",
  UN_LO_CODE_STATUS: "/unLoCodeFunction",
  UN_LO_CODE_FUNCTION: "/unLoCodeStatus",
  CERTIFICATION: "/certification",
  COMPANY_BUSINESS_MODEL: "/companyBusinessModel",
  GENERAL_INTENT: "/generalIntent",
  SUB_INTENT: "/subIntent",
  COMPANY_TYPE: "/companyType",
  COMPANY_STAGE: "/companyStage",
  RESEARCHED_COMPANY: "/researchedCompany",
  JOB_ROLE: "/jobRole",
  JOB_TYPE: "/jobType",
  LANGUAGE: "/language",
};

// Define account-related routes separately
export const accountRoutes = {
  superAdminLogin: "/superadmin/login",
  adminLogin: "/admin/login",
  managerLogin: "/manager/login",
  customerLogin: "/customer/login",
  servicesLogin: "/services/login",
  workerLogin: "/worker/login",
};

// Helper function to generate standard CRUD routes
const createCRUDRoutes = (basePath: string) => ({
  getAll: `${basePath}`,
  delete: `${basePath}`,
});

// Helper function to add custom routes to the standard CRUD routes
const addCustomRoutes = (
  crudRoutes: Record<string, string>,
  customRoutes: Record<string, string>
) => ({
  ...crudRoutes,
  ...customRoutes,
});

// Define resource-specific routes using the CRUD generator
export const userRoutes = createCRUDRoutes(BASE_PATHS.USER);
export const adminRoutes = createCRUDRoutes(BASE_PATHS.ADMIN);
export const employeeRoutes = createCRUDRoutes(BASE_PATHS.EMPLOYEE);
export const statusHistoryRoutes = createCRUDRoutes(BASE_PATHS.STATUS_HISTORY);
export const inventoryManagerRoutes = createCRUDRoutes(
  BASE_PATHS.INVENTORY_MANAGER
);
export const activityFileRoutes = createCRUDRoutes(BASE_PATHS.ACTIVITY_FILE);
export const projectManagerRoutes = createCRUDRoutes(
  BASE_PATHS.PROJECT_MANAGER
);

export const divisionRoutes = addCustomRoutes(
  createCRUDRoutes(BASE_PATHS.DIVISION),
  {
    // If you have other custom routes for location, add them here
  }
);

export const pincodeEntryRoutes = addCustomRoutes(
  createCRUDRoutes(BASE_PATHS.PINCODE_ENTRY),
  {
    // If you have other custom routes for location, add them here
  }
);

export const districtRoutes = addCustomRoutes(
  createCRUDRoutes(BASE_PATHS.DISTRICT),
  {
    // If you have other custom routes for location, add them here
  }
);

export const stateRoutes = addCustomRoutes(createCRUDRoutes(BASE_PATHS.STATE), {
  // If you have other custom routes for location, add them here
});

export const serviceCompanyRoutes = addCustomRoutes(
  createCRUDRoutes(BASE_PATHS.SERVICE_COMPANY),
  {
    // If you have other custom routes for serviceCompany, add them here
  }
);
export const timeSheetRoutes = addCustomRoutes(
  createCRUDRoutes(BASE_PATHS.TIME_SHEET),
  {
    // If you have other custom routes for serviceCompany, add them here
  }
);

export const activityTypeRoutes = addCustomRoutes(
  createCRUDRoutes(BASE_PATHS.ACTIVITY_TYPE),
  {
    // If you have other custom routes for activityType, add them here
  }
);

export const activityStatusRoutes = addCustomRoutes(
  createCRUDRoutes(BASE_PATHS.ACTIVITY_STATUS),
  {
    // If you have other custom routes for activityType, add them here
  }
);
export const projectTypeRoutes = addCustomRoutes(
  createCRUDRoutes(BASE_PATHS.PROJECT_TYPE),
  {
    // If you have other custom routes for projectType, add them here
  }
);
export const projectStatusRoutes = addCustomRoutes(
  createCRUDRoutes(BASE_PATHS.PROJECT_STATUS),
  {
    // If you have other custom routes for projectType, add them here
  }
);
export const customerRoutes = addCustomRoutes(
  createCRUDRoutes(BASE_PATHS.CUSTOMER),
  {
    // If you have other custom routes for customer, add them here
  }
);
export const workerRoutes = addCustomRoutes(
  createCRUDRoutes(BASE_PATHS.WORKER),
  {
    // If you have other custom routes for worker, add them here
  }
);
export const statusRoutes = createCRUDRoutes(BASE_PATHS.STATUS);
export const subStatusRoutes = createCRUDRoutes(BASE_PATHS.SUB_STATUS);

// Define project routes with additional custom endpoints
export const projectRoutes = addCustomRoutes(
  createCRUDRoutes(BASE_PATHS.PROJECT),
  {
    count: `${BASE_PATHS.PROJECT}/count`,
  }
);

// Define activity routes with additional custom endpoints
export const activityRoutes =
  // addCustomRoutes(
  createCRUDRoutes(BASE_PATHS.ACTIVITY);
// {
//   getByProject: `${BASE_PATHS.ACTIVITY}/projects`,
// }
// );

export const associateRoutes = createCRUDRoutes(BASE_PATHS.ASSOCIATE);
export const associateCompanyRoutes = createCRUDRoutes(
  BASE_PATHS.ASSOCIATE_COMPANY
);
export const companyTypeRoutes = createCRUDRoutes(BASE_PATHS.COMPANY_TYPE);
export const designationRoutes = createCRUDRoutes(BASE_PATHS.DESIGNATION);
export const enquiryProcessStatusRoutes = createCRUDRoutes(
  BASE_PATHS.ENQUIRY_PROCESS_STATUS
);
export const categoryRoutes = createCRUDRoutes(BASE_PATHS.CATEGORY);
export const subCategoryRoutes = createCRUDRoutes(BASE_PATHS.SUB_CATEGORY);
export const productRoutes = createCRUDRoutes(BASE_PATHS.PRODUCT);
export const productVariantRoutes = createCRUDRoutes(
  BASE_PATHS.PRODUCT_VARIANT
);

export const variantRateRoutes = addCustomRoutes(
  createCRUDRoutes(BASE_PATHS.VARIANT_RATE),
  {
    count: `${BASE_PATHS.VARIANT_RATE}/associateCompany`,
  }
);
export const displayedRateRoutes = createCRUDRoutes(BASE_PATHS.DISPLAYED_RATE);
export const enquiryRoutes = createCRUDRoutes(BASE_PATHS.ENQUIRY);

export const countryRoutes = createCRUDRoutes(BASE_PATHS.COUNTRY);
export const unLoCodeRoutes = createCRUDRoutes(BASE_PATHS.UN_LO_CODE);
export const unLoCodeFunctionRoutes = createCRUDRoutes(
  BASE_PATHS.UN_LO_CODE_FUNCTION
);
export const unLoCodeStatusRoutes = createCRUDRoutes(
  BASE_PATHS.UN_LO_CODE_STATUS
);

export const certificationRoutes = createCRUDRoutes(BASE_PATHS.CERTIFICATION);
export const companyBusinessModelRoutes = createCRUDRoutes(
  BASE_PATHS.COMPANY_BUSINESS_MODEL
);
export const jobRoleRoutes = createCRUDRoutes(BASE_PATHS.JOB_ROLE);
export const jobTypeRoutes = createCRUDRoutes(BASE_PATHS.JOB_TYPE);
export const languageRoutes = createCRUDRoutes(BASE_PATHS.LANGUAGE);

export const generalIntentRoutes = createCRUDRoutes(BASE_PATHS.GENERAL_INTENT);
export const companyStageRoutes = createCRUDRoutes(BASE_PATHS.COMPANY_STAGE);
export const subIntentRoutes = createCRUDRoutes(BASE_PATHS.SUB_INTENT);
export const researchedCompanyRoutes = createCRUDRoutes(
  BASE_PATHS.RESEARCHED_COMPANY
);

// Optionally, group all routes into a single object for easier imports
export const apiRoutes = {
  account: accountRoutes,
  user: userRoutes,
  employee: employeeRoutes,
  admin: adminRoutes,

  serviceCompany: serviceCompanyRoutes,
  activityType: activityTypeRoutes,
  activityFile: activityFileRoutes,
  projectType: projectTypeRoutes,
  projectStatus: projectStatusRoutes,
  customer: customerRoutes,
  worker: workerRoutes,
  status: statusRoutes,
  subStatus: subStatusRoutes,
  project: projectRoutes,
  activity: activityRoutes,
  activityStatus: activityStatusRoutes,
  timeSheet: timeSheetRoutes,
  statusHistory: statusHistoryRoutes,
  associate: associateRoutes,
  associateCompany: associateCompanyRoutes,
  category: categoryRoutes,
  subCategory: subCategoryRoutes,
  product: productRoutes,
  productVariant: productVariantRoutes,
  variantRate: variantRateRoutes,
  displayedRate: displayedRateRoutes,
  inventoryManager: inventoryManagerRoutes,
  enquiry: enquiryRoutes,
  pincodeEntry: pincodeEntryRoutes,
  state: stateRoutes,
  district: districtRoutes,
  division: divisionRoutes,
  designation: designationRoutes,
  companyType: companyTypeRoutes,
  enquiryProcessStatus: enquiryProcessStatusRoutes,
  country: countryRoutes,
  unLoCode: unLoCodeRoutes,
  unLoCodeFunction: unLoCodeFunctionRoutes,
  unLoCodeStatus: unLoCodeStatusRoutes,
  researchedCompany: researchedCompanyRoutes,
  certification: certificationRoutes,
  companyBusinessModel: companyBusinessModelRoutes,
  generalIntent: generalIntentRoutes,
  subIntent: subIntentRoutes,
  companyStage: companyStageRoutes,
  jobRole: jobRoleRoutes,
  jobType: jobTypeRoutes,
  language: languageRoutes,
};
