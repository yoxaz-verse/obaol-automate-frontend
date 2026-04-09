// src/core/api/apiRoutes.ts

// Remove unnecessary imports
// import { count } from "console"; // Removed as it's not used

// Define base paths as constants for clarity and reusability
const BASE_PATHS = {
  USER: "/user",
  ADMIN: "/admins",
  OPERATOR: "/operators",
  INVENTORY_MANAGER: "/inventory-managers",
  PROJECT_MANAGER: "/project-managers",
  SERVICE_COMPANY: "/service-companies",
  ACTIVITY: "/activities",
  ACTIVITY_TYPE: "/activity-types",
  ACTIVITY_STATUS: "/activity-statuses",
  ACTIVITY_FILE: "/activity-files",
  PROJECT: "/projects",
  PROJECT_TYPE: "/project-types",
  PROJECT_STATUS: "/project-statuses",
  TIME_SHEET: "/time-sheets",
  WORKER: "/workers",
  STATUS: "/statuses",
  STATUS_HISTORY: "/status-histories",
  SUB_STATUS: "/sub-statuses",
  ASSOCIATE: "/associates",
  ASSOCIATE_COMPANY: "/associate-companies",
  CATEGORY: "/categories",
  SUB_CATEGORY: "/sub-categories",
  PRODUCT: "/products",
  PRODUCT_VARIANT: "/product-variants",
  VARIANT_RATE: "/variant-rates",
  DISPLAYED_RATE: "/displayed-rates",
  ENQUIRY: "/inquiries",
  PINCODE_ENTRY: "/pincode-entries",
  DIVISION: "/divisions",
  DISTRICT: "/districts",
  STATE: "/states",
  CITY: "/cities",
  DESIGNATION: "/designations",
  ENQUIRY_PROCESS_STATUS: "/enquiry-process-statuses",
  COUNTRY: "/countries",
  UN_LO_CODE: "/un-lo-codes",
  UN_LO_CODE_STATUS: "/un-lo-code-statuses",
  UN_LO_CODE_FUNCTION: "/un-lo-code-functions",
  CERTIFICATION: "/certifications",
  COMPANY_BUSINESS_MODEL: "/company-business-models",
  GENERAL_INTENT: "/general-intents",
  SUB_INTENT: "/sub-intents",
  COMPANY_TYPE: "/company-types",
  COMPANY_STAGE: "/company-stages",
  RESEARCHED_COMPANY: "/researched-companies",
  JOB_ROLE: "/job-roles",
  JOB_TYPE: "/job-types",
  LANGUAGE: "/languages",
  INCOTERM: "/incoterms",
  PAYMENT_TERM: "/payment-terms",
  COMMISSION_RULE: "/commission-rules",
  COMPANY_FUNCTION: "/company-functions",
  COMPANY_SUB_FUNCTION: "/company-sub-functions",
  COMPANY_FUNCTION_MAPPING: "/company-function-mappings",
  ORGANIZATION_REPORT: "/organization-reports",
  INVENTORY: "/inventories",
  INVENTORY_RESERVATION: "/inventory-reservations",
  SAMPLE_REQUEST: "/sample-requests",
  TRADE_DOCUMENT: "/trade-documents",
  DOCUMENT_RULE: "/document-rules",
  ENQUIRY_RULE: "/enquiry-rules",
  ORDER_RULE: "/order-rules",
  FLOW_RULE: "/flow-rules",
  IMPORTS: "/imports",
  IMPORT_RESERVATION: "/import-reservations",
  WAREHOUSES: "/warehouses",
  DEMO: "/demo",
};

// Define account-related routes separately
export const accountRoutes = {
  superAdminLogin: "/superadmin/login",
  adminLogin: "/admin/login",
  managerLogin: "/manager/login",
  servicesLogin: "/services/login",
  workerLogin: "/worker/login",
  operatorRegister: "/auth/operator/register",
  operatorRegisterOptions: "/auth/operator/register/options",
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
export const operatorRoutes = createCRUDRoutes(BASE_PATHS.OPERATOR);
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

export const inventoryRoutes = createCRUDRoutes(BASE_PATHS.INVENTORY);
export const inventoryReservationRoutes = createCRUDRoutes(
  BASE_PATHS.INVENTORY_RESERVATION
);
export const sampleRequestRoutes = createCRUDRoutes(BASE_PATHS.SAMPLE_REQUEST);
export const tradeDocumentRoutes = createCRUDRoutes(BASE_PATHS.TRADE_DOCUMENT);
export const documentRuleRoutes = createCRUDRoutes(BASE_PATHS.DOCUMENT_RULE);
export const flowRuleRoutes = createCRUDRoutes(BASE_PATHS.FLOW_RULE);
export const demoRoutes = createCRUDRoutes(BASE_PATHS.DEMO);
export const warehouseRoutes = createCRUDRoutes(BASE_PATHS.WAREHOUSES);

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
export const cityRoutes = createCRUDRoutes(BASE_PATHS.CITY);

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
export const catalogItemRoutes = createCRUDRoutes("/catalog-items");
export const enquiryRoutes = addCustomRoutes(createCRUDRoutes(BASE_PATHS.ENQUIRY), {
  seaPorts: `${BASE_PATHS.ENQUIRY}/sea-ports`,
});
export const systemConfigRoutes = {
  obaolCompany: "/system-config/obaol-company",
  calculations: "/system-config/calculations",
};

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
export const incotermRoutes = createCRUDRoutes(BASE_PATHS.INCOTERM);
export const paymentTermRoutes = createCRUDRoutes(BASE_PATHS.PAYMENT_TERM);
export const commissionRuleRoutes = createCRUDRoutes(BASE_PATHS.COMMISSION_RULE);
export const companyFunctionRoutes = createCRUDRoutes(BASE_PATHS.COMPANY_FUNCTION);
export const companySubFunctionRoutes = createCRUDRoutes(BASE_PATHS.COMPANY_SUB_FUNCTION);
export const companyFunctionMappingRoutes = createCRUDRoutes(BASE_PATHS.COMPANY_FUNCTION_MAPPING);

export const generalIntentRoutes = createCRUDRoutes(BASE_PATHS.GENERAL_INTENT);
export const companyStageRoutes = createCRUDRoutes(BASE_PATHS.COMPANY_STAGE);
export const subIntentRoutes = createCRUDRoutes(BASE_PATHS.SUB_INTENT);
export const researchedCompanyRoutes = createCRUDRoutes(
  BASE_PATHS.RESEARCHED_COMPANY
);

// Analytics Routes
export const analyticsRoutes = {
  enquiryTrends: `${BASE_PATHS.ACTIVITY}/analytics/trends/enquiries`, // Note: prefix logic handled in backend, here we map to full path relative to base API
  // Correction: The backend mounts at /api/v1/web/analytics
  // Let's define a new base for analytics
};

const ANALYTICS_BASE = "/analytics";

export const dashboardRoutes = {
  enquiryTrends: `${ANALYTICS_BASE}/trends/enquiries`,
  productPerformance: `${ANALYTICS_BASE}/performance/products`,
  systemMetrics: `${ANALYTICS_BASE}/metrics/system`,
  associateMetrics: `${ANALYTICS_BASE}/metrics/associate`,
  operatorMetrics: `${ANALYTICS_BASE}/metrics/operator`,
  companyFunctionMetrics: `${ANALYTICS_BASE}/metrics/company-functions`,
  companyFunctionComponents: `${ANALYTICS_BASE}/components/company-functions`,
  companyFunctionComponentsGlobal: `${ANALYTICS_BASE}/components/company-functions/global`,
};

export const approvalRoutes = {
  associatesList: "/approvals/associates",
  associateAction: "/approvals/associates",
  companiesList: "/approvals/companies",
  companyAction: "/approvals/companies",
  operatorsList: "/approvals/operators",
  operatorAction: "/approvals/operators",
};

export const notificationRoutes = {
  list: "/notifications",
  unreadCount: "/notifications/unread-count",
  unreadSummary: "/notifications/unread-summary",
  markSectionRead: (section: string) => `/notifications/mark-section-read?section=${section}`,
  readOne: (id: string) => `/notifications/${id}/read`,
  readAll: "/notifications/read-all",
  broadcast: "/notifications/broadcast",
};

export const presenceRoutes = {
  ping: "/presence/ping",
};

export const catalogRoutes = {
  add: "/catalog/add",
  update: "/catalog", // + /:id
  remove: "/catalog", // + /:id
  removeByVariantRate: "/catalog/variant-rate", // + /:variantRateId
  public: "/catalog/public", // + /:companySlug
  publicDetails: "/catalog/public", // + /:companySlug/:productSlug
};

export const brandPublicRoutes = {
  details: "/brand/details", // + /:slug
  products: "/brand/products", // + /:companyId
};

export const operatorHierarchyRoutes = {
  leadership: (operatorId: string) => `/operators/leadership/${operatorId}`,
  team: (operatorId: string) => `/operators/team/${operatorId}`,
  overview: (operatorId: string) => `/operators/${operatorId}/overview`,
  referralRegenerate: (operatorId: string) => `/operators/referral/regenerate/${operatorId}`,
};

export const commissionRoutes = {
  operatorHistory: (operatorId: string) => `/commissions/operator/${operatorId}`,
};

export const organizationReportRoutes = {
  list: BASE_PATHS.ORGANIZATION_REPORT,
  create: BASE_PATHS.ORGANIZATION_REPORT,
  update: BASE_PATHS.ORGANIZATION_REPORT,
  action: (id: string) => `${BASE_PATHS.ORGANIZATION_REPORT}/${id}/action`,
};

// Optionally, group all routes into a single object for easier imports
export const apiRoutes = {
  analytics: dashboardRoutes,
  approvals: approvalRoutes,
  notifications: notificationRoutes,
  presence: presenceRoutes,
  brand: brandPublicRoutes,
  account: accountRoutes,
  user: userRoutes,
  operator: operatorRoutes,
  admin: adminRoutes,

  serviceCompany: serviceCompanyRoutes,
  activityType: activityTypeRoutes,
  activityFile: activityFileRoutes,
  projectType: projectTypeRoutes,
  projectStatus: projectStatusRoutes,
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
  catalogItem: catalogItemRoutes,
  inventoryManager: inventoryManagerRoutes,
  inventoryReservation: inventoryReservationRoutes,
  sampleRequest: {
    list: `${BASE_PATHS.SAMPLE_REQUEST}`,
    create: `${BASE_PATHS.SAMPLE_REQUEST}`,
    getOne: (id: string) => `${BASE_PATHS.SAMPLE_REQUEST}/${id}`,
    quote: (id: string) => `${BASE_PATHS.SAMPLE_REQUEST}/${id}/quote`,
    decision: (id: string) => `${BASE_PATHS.SAMPLE_REQUEST}/${id}/decision`,
    markup: (id: string) => `${BASE_PATHS.SAMPLE_REQUEST}/${id}/markup`,
    paymentReceived: (id: string) => `${BASE_PATHS.SAMPLE_REQUEST}/${id}/payment-received`,
    packagingStart: (id: string) => `${BASE_PATHS.SAMPLE_REQUEST}/${id}/packaging-start`,
    packaged: (id: string) => `${BASE_PATHS.SAMPLE_REQUEST}/${id}/packaged`,
    courierSubmit: (id: string) => `${BASE_PATHS.SAMPLE_REQUEST}/${id}/courier-submit`,
    inTransit: (id: string) => `${BASE_PATHS.SAMPLE_REQUEST}/${id}/in-transit`,
    receiptConfirm: (id: string) => `${BASE_PATHS.SAMPLE_REQUEST}/${id}/receipt-confirm`,
  },
  imports: {
    list: `${BASE_PATHS.IMPORTS}`,
    create: `${BASE_PATHS.IMPORTS}`,
    update: (id: string) => `${BASE_PATHS.IMPORTS}/${id}`,
    close: (id: string) => `${BASE_PATHS.IMPORTS}/${id}/close`,
    reserve: (id: string) => `${BASE_PATHS.IMPORTS}/${id}/reservations`,
    reservationEdit: (id: string, reservationId: string) => `${BASE_PATHS.IMPORTS}/${id}/reservations/${reservationId}/edit`,
    reservationCancel: (id: string, reservationId: string) => `${BASE_PATHS.IMPORTS}/${id}/reservations/${reservationId}/cancel`,
    reservationLock: (id: string, reservationId: string) => `${BASE_PATHS.IMPORTS}/${id}/reservations/${reservationId}/lock`,
  },
  importReservations: {
    list: `${BASE_PATHS.IMPORT_RESERVATION}`,
    accept: (id: string) => `${BASE_PATHS.IMPORT_RESERVATION}/${id}/accept`,
    reject: (id: string) => `${BASE_PATHS.IMPORT_RESERVATION}/${id}/reject`,
    cancel: (id: string) => `${BASE_PATHS.IMPORT_RESERVATION}/${id}/cancel`,
  },
  tradeDocuments: {
    list: `${BASE_PATHS.TRADE_DOCUMENT}`,
    create: `${BASE_PATHS.TRADE_DOCUMENT}`,
    getOne: (id: string) => `${BASE_PATHS.TRADE_DOCUMENT}/${id}`,
    update: (id: string) => `${BASE_PATHS.TRADE_DOCUMENT}/${id}`,
    email: (id: string) => `${BASE_PATHS.TRADE_DOCUMENT}/${id}/email`,
  },
  documentRules: {
    list: `${BASE_PATHS.DOCUMENT_RULE}`,
    create: `${BASE_PATHS.DOCUMENT_RULE}`,
    seed: `${BASE_PATHS.DOCUMENT_RULE}/seed`,
    update: (id: string) => `${BASE_PATHS.DOCUMENT_RULE}/${id}`,
    delete: (id: string) => `${BASE_PATHS.DOCUMENT_RULE}/${id}`,
  },
  flowRules: {
    list: `${BASE_PATHS.FLOW_RULE}`,
    create: `${BASE_PATHS.FLOW_RULE}`,
    seed: `${BASE_PATHS.FLOW_RULE}/seed`,
    update: (id: string) => `${BASE_PATHS.FLOW_RULE}/${id}`,
    delete: (id: string) => `${BASE_PATHS.FLOW_RULE}/${id}`,
  },
  orderSubflowConfigs: {
    list: `${BASE_PATHS.FLOW_RULE}/subflows`,
    create: `${BASE_PATHS.FLOW_RULE}/subflows`,
    update: (id: string) => `${BASE_PATHS.FLOW_RULE}/subflows/${id}`,
    delete: (id: string) => `${BASE_PATHS.FLOW_RULE}/subflows/${id}`,
  },
  enquiryRules: {
    list: `${BASE_PATHS.ENQUIRY_RULE}`,
    create: `${BASE_PATHS.ENQUIRY_RULE}`,
    seed: `${BASE_PATHS.ENQUIRY_RULE}/seed`,
    update: (id: string) => `${BASE_PATHS.ENQUIRY_RULE}/${id}`,
    delete: (id: string) => `${BASE_PATHS.ENQUIRY_RULE}/${id}`,
  },
  orderRules: {
    list: `${BASE_PATHS.ORDER_RULE}`,
    create: `${BASE_PATHS.ORDER_RULE}`,
    seed: `${BASE_PATHS.ORDER_RULE}/seed`,
    update: (id: string) => `${BASE_PATHS.ORDER_RULE}/${id}`,
    delete: (id: string) => `${BASE_PATHS.ORDER_RULE}/${id}`,
  },
  demo: {
    orders: `${BASE_PATHS.DEMO}/orders`,
    inventory: `${BASE_PATHS.DEMO}/inventory`,
  },
  enquiry: enquiryRoutes,
  systemConfig: systemConfigRoutes,
  orders: {
    create: "/orders",
    createExternal: "/orders/external",
    getAll: "/orders",
    update: "/orders",
    delete: "/orders",
  },
  pincodeEntry: pincodeEntryRoutes,
  state: stateRoutes,
  city: cityRoutes,
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
  incoterm: incotermRoutes,
  paymentTerm: paymentTermRoutes,
  commissionRule: commissionRuleRoutes,
  companyFunction: companyFunctionRoutes,
  companySubFunction: companySubFunctionRoutes,
  companyFunctionMapping: companyFunctionMappingRoutes,
  catalog: catalogRoutes,
  operatorHierarchy: operatorHierarchyRoutes,
  commissions: commissionRoutes,
  organizationReports: organizationReportRoutes,
  inventory: inventoryRoutes,
  warehouses: {
    list: "/warehouses",
    create: "/warehouses",
    update: (id: string) => `/warehouses/${id}`,
    inbound: "/warehouse/inbound",
    outbound: "/warehouse/outbound",
    adjust: "/warehouse/adjust",
    movements: "/warehouse/movements",
    storageCharges: "/warehouse/storage-charges",
  },
};
