"use client";
import {
  activityFileRoutes,
  activityRoutes,
  activityStatusRoutes,
  activityTypeRoutes,
  adminRoutes,
  associateCompanyRoutes,
  associateRoutes,
  categoryRoutes,
  customerRoutes,
  displayedRateRoutes,
  enquiryRoutes,
  inventoryManagerRoutes,
  locationManagerRoutes,
  locationRoutes,
  locationTypeRoutes,
  productRoutes,
  productVariantRoutes,
  projectManagerRoutes,
  projectRoutes,
  projectStatusRoutes,
  projectTypeRoutes,
  serviceCompanyRoutes,
  subCategoryRoutes,
  timeSheetRoutes,
  variantRateRoutes,
  workerRoutes,
} from "@/core/api/apiRoutes";
import { fetchDependentOptions } from "./fetchDependentOptions";

// Helper function to generate columns based on the current table
export const generateColumns = (currentTable: string, tableConfig: any) => {
  // Filter out the "Actions" column initially
  const nonActionColumns = tableConfig[currentTable]
    .filter(
      (field: any) =>
        field.inTable && field.type !== "select" && field.key !== "actions2"
    )
    .map((field: any) => ({
      name: field.label.toUpperCase(),
      uid: field.key,
      type: field.type,
    }));

  if (currentTable === "worker") {
    nonActionColumns.push({ name: "SERVICE COMPANY", uid: "serviceCompany" });
  } else if (currentTable === "projects") {
    // nonActionColumns.push({ name: "Admin Name", uid: "adminName" });
    nonActionColumns.push({
      name: "Project Manager",
      uid: "projectManagerName",
    });
    nonActionColumns.push({ name: "Customer", uid: "customerName" });
    nonActionColumns.push({ name: "ProjectStatus", uid: "projectStatus" });
    nonActionColumns.push({ name: "Project Type", uid: "projectType" });
    nonActionColumns.push({ name: "Location", uid: "location" });
  } else if (currentTable === "activity") {
    // nonActionColumns.push({ name: "Admin Name", uid: "adminName" });
    nonActionColumns.push({
      name: "Activity Manager",
      uid: "activityManagerName",
    });
    nonActionColumns.push({ name: "Activity Status", uid: "activityStatus" });
    nonActionColumns.push({ name: "Activity Type", uid: "activityType" });
  } else if (currentTable === "variantRate") {
    nonActionColumns.push({ name: "Associate", uid: "associate" });
    nonActionColumns.push({ name: "Product", uid: "productVariant" });
  } else if (
    currentTable === "projectManager" ||
    currentTable === "activityManager"
  ) {
    nonActionColumns.push({ name: "ADMIN", uid: "admin" });
  }

  // Find the "Actions" column separately
  const actionsColumn = tableConfig[currentTable].find(
    (field: any) => field.type === "action" && field.inTable
  );

  // Append the "Actions" column at the end
  if (actionsColumn) {
    nonActionColumns.push({
      name: actionsColumn.label.toUpperCase(),
      uid: actionsColumn.key,
      type: actionsColumn.type,
    });
  }

  return nonActionColumns;
};

export const apiRoutesByRole: Record<string, string> = {
  admin: adminRoutes.getAll,
  inventoryManager: inventoryManagerRoutes.getAll,
  projectManager: projectManagerRoutes.getAll,
  customer: customerRoutes.getAll,
  worker: workerRoutes.getAll,
  location: locationRoutes.getAll,
  locationManager: locationManagerRoutes.getAll,
  locationType: locationTypeRoutes.getAll,
  projectType: projectTypeRoutes.getAll,
  serviceCompany: serviceCompanyRoutes.getAll,
  projectStatus: projectStatusRoutes.getAll,
  projects: projectRoutes.getAll,
  activity: activityRoutes.getAll,
  activityType: activityTypeRoutes.getAll,
  activityStatus: activityStatusRoutes.getAll,
  timeSheet: timeSheetRoutes.getAll,
  activityFile: activityFileRoutes.getAll,
  associateCompany: associateCompanyRoutes.getAll,
  associate: associateRoutes.getAll,
  category: categoryRoutes.getAll,
  subCategory: subCategoryRoutes.getAll,
  product: productRoutes.getAll,
  productVariant: productVariantRoutes.getAll,
  variantRate: variantRateRoutes.getAll,
  displayedRate: displayedRateRoutes.getAll,
  enquiry: enquiryRoutes.getAll,
};

export const initialTableConfig: Record<
  any,
  {
    label: string;
    type:
      | "text"
      | "select"
      | "multiselect"
      | "multiselectValue"
      | "file"
      | "textarea"
      | "boolean"
      | "image"
      | "action"
      | "email"
      | "date"
      | "number"
      | "time"
      | "link"
      | "dateTime"
      | "password"
      | "week"; // Define specific types

    filterType?:
      | "text"
      | "select"
      | "multiselect"
      | "boolean"
      | "date"
      | "range";
    key: string;
    inForm: boolean;
    inTable: boolean;
    dynamicValuesFn?: any;
    inEdit?: boolean;
    dependsOn?: string;
    values?: { key: string; value: string }[];
    accept?: string;
    required?: boolean;
  }[]
> = {
  // User
  admin: [
    {
      label: "Name",
      type: "text",
      key: "name",
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "Email",
      type: "email",
      key: "email",
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "Password",
      type: "password",
      key: "password",
      inForm: true,
      inTable: false,
      inEdit: true,
      required: true,
    },
    {
      label: "Created At",
      type: "dateTime",
      key: "createdAt",
      inForm: false,
      inTable: true,
    },
    {
      label: "Actions",
      type: "action",
      key: "actions2",
      inForm: false,
      inTable: true,
    },
  ],
  projectManager: [
    {
      label: "Name",
      type: "text",
      key: "name",
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "Email",
      type: "email",
      key: "email",
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "Password",
      type: "password",
      key: "password",
      inForm: true,
      inTable: false,
      inEdit: true,
      required: true,
    },

    {
      label: "Admin",
      type: "select",
      key: "admin",
      values: [], // We'll populate this dynamically
      inEdit: true,
      inForm: true,
      inTable: false,
      required: true,
    },
    {
      label: "Created At",
      type: "dateTime",
      key: "createdAt",
      inForm: false,
      inTable: true,
    },
    {
      label: "Actions",
      type: "action",
      key: "actions2",
      inForm: false,
      inTable: true,
    },
  ],
  inventoryManager: [
    {
      label: "Name",
      type: "text",
      key: "name",
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "Email",
      type: "email",
      key: "email",
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "Password",
      type: "password",
      key: "password",
      inForm: true,
      inTable: false,
      inEdit: true,
      required: true,
    },

    {
      label: "Admin",
      type: "select",
      key: "admin",
      values: [], // We'll populate this dynamically
      inEdit: true,
      inForm: true,
      inTable: false,
      required: true,
    },
    {
      label: "Created At",
      type: "dateTime",
      key: "createdAt",
      inForm: false,
      inTable: true,
    },
    {
      label: "Actions",
      type: "action",
      key: "actions2",
      inForm: false,
      inTable: true,
    },
  ],
  customer: [
    {
      label: "Customer Name",
      type: "text",
      key: "name",
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "Email",
      type: "email",
      key: "email",
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "Password",
      type: "password",
      key: "password",
      inForm: true,
      inEdit: true,
      inTable: false,
      required: true,
    },
    {
      label: "Created At",
      type: "dateTime",
      key: "createdAt",
      inForm: false,
      inTable: true,
    },
    {
      label: "Actions",
      type: "action",
      key: "actions2",
      inForm: false,
      inTable: true,
    },
  ],
  associate: [
    {
      label: "Associate Name",
      type: "text",
      key: "name",
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "Email",
      type: "email",
      key: "email",
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "Phone",
      type: "number",
      key: "phone",
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "Phone Secondary",
      type: "number",
      key: "phoneSecondary",
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "Associate Company",
      type: "select",
      key: "associateCompany",
      values: [],
      dynamicValuesFn: () => fetchDependentOptions("associateCompany"),
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "Password",
      type: "password",
      key: "password",
      inForm: true,
      inEdit: true,
      inTable: false,
      required: true,
    },
    {
      label: "Created At",
      type: "dateTime",
      key: "createdAt",
      inForm: false,
      inTable: true,
    },
    {
      label: "Actions",
      type: "action",
      key: "actions2",
      inForm: false,
      inTable: true,
    },
  ],
  associateCompany: [
    {
      label: "Company Name",
      type: "text",
      key: "name",
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "Email",
      type: "email",
      key: "email",
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "Phone",
      type: "number",
      key: "phone",
      inForm: true,
      inTable: true,
      required: true,
    },
    // {
    //   label: "Location",
    //   type: "select",
    //   key: "location",
    //   values: [],
    //   inForm: true,
    //   inTable: true,
    //   required: true,
    // },
    {
      label: "State",
      type: "select",
      key: "state",
      values: [],
      dynamicValuesFn: () => fetchDependentOptions("state"),
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "District",
      type: "select",
      key: "district",
      dependsOn: "state",
      values: [],
      dynamicValuesFn: (stateId: string) =>
        fetchDependentOptions("district", "state", stateId),
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "City / Town",
      type: "select",
      key: "city",
      dependsOn: "district", // 👈
      dynamicValuesFn: (districtId: string) =>
        fetchDependentOptions("city", "district", districtId),
      values: [],
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "Phone Secondary",
      type: "number",
      key: "phoneSecondary",
      inForm: true,
      inTable: true,
      required: true,
    },

    {
      label: "Created At",
      type: "dateTime",
      key: "createdAt",
      inForm: false,
      inTable: true,
    },
    {
      label: "Actions",
      type: "action",
      key: "actions2",
      inForm: false,
      inTable: true,
    },
  ],
  worker: [
    {
      label: "Worker Name",
      type: "text",
      key: "name",
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "Password",
      type: "password",
      key: "password",
      inForm: true,
      inEdit: true,
      inTable: false,
      required: true,
    },
    {
      label: "Email",
      type: "email",
      key: "email",
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "Skill",
      type: "text",
      key: "skill",
      inForm: true,
      inTable: true,
    },
    {
      label: "Service Company",
      type: "select",
      key: "serviceCompany",
      values: [], // We'll populate this dynamically
      inForm: true,
      inTable: true,
      inEdit: true,
      required: true,
    },
    {
      label: "Created At",
      type: "dateTime",
      key: "createdAt",
      inForm: false,
      inTable: true,
    },
    {
      label: "Actions",
      type: "action",
      key: "actions2",
      inForm: false,
      inTable: true,
    },
  ],

  // Category
  category: [
    {
      label: "Name",
      type: "text",
      key: "name",
      inForm: true,
      inTable: true,
    },
    {
      label: "Description",
      type: "textarea",
      key: "description",
      inForm: true,
      inTable: false,
      inEdit: true,
    },

    // {
    //   label: "Admin",
    //   type: "select",
    //   key: "admin",
    //   values: [],
    //   inForm: false,
    //   inTable: false,
    // },
    {
      label: "Inventory Manager",
      type: "select",
      filterType: "select",
      key: "inventoryManager",
      values: [],
      inForm: true,
      inTable: false,
      inEdit: true,
      required: true,
    },

    {
      label: "Created At",
      type: "text",
      key: "createdAt",
      inForm: false,
      inTable: false,
    },
    {
      label: "Actions",
      type: "action",
      key: "actions2",
      inForm: false,
      inTable: true,
    },
  ],
  // Sub Category
  subCategory: [
    {
      label: "Name",
      type: "text",
      key: "name",
      inForm: true,
      inTable: false,
      required: true,
    },
    {
      label: "Description",
      type: "textarea",
      key: "description",
      inForm: true,
      inTable: false,
      inEdit: true,
      required: true,
    },

    // {
    //   label: "Admin",
    //   type: "select",
    //   key: "admin",
    //   values: [],
    //   inForm: false,
    //   inTable: false,
    // },
    {
      label: "Category",
      type: "select",
      filterType: "select",
      key: "category",
      values: [],
      inForm: true,
      inTable: false,
      inEdit: true,
      required: true,
    },

    {
      label: "Created At",
      type: "text",
      key: "createdAt",
      inForm: false,
      inTable: false,
    },
    {
      label: "Actions",
      type: "action",
      key: "actions2",
      inForm: false,
      inTable: true,
    },
  ],
  // Product
  product: [
    {
      label: "Product Name",
      type: "text",
      key: "name",
      inForm: true,
      inTable: false,
      required: true,
    },
    {
      label: "Description",
      type: "textarea",
      key: "description",
      inForm: true,
      inTable: false,
      inEdit: true,
      required: true,
    },

    // {
    //   label: "Admin",
    //   type: "select",
    //   key: "admin",
    //   values: [],
    //   inForm: false,
    //   inTable: false,
    // },
    {
      label: "Sub Category",
      type: "select",
      filterType: "select",
      key: "subCategory",
      values: [],
      inForm: true,
      inTable: true,
      inEdit: true,
      required: true,
    },
    {
      label: "Created At",
      type: "text",
      key: "createdAt",
      inForm: false,
      inTable: false,
    },
    {
      label: "Actions",
      type: "action",
      key: "actions2",
      inForm: false,
      inTable: true,
    },
  ],
  // Product Variant
  productVariant: [
    {
      label: "Variant Name",
      type: "text",
      key: "name",
      inForm: true,
      inTable: false,
    },
    {
      label: "Description",
      type: "textarea",
      key: "description",
      inForm: true,
      inTable: false,
      inEdit: true,
    },
    {
      label: "Available",
      type: "boolean",
      key: "isAvailable",
      inForm: true,
      inTable: false,
      inEdit: true,
    },
    {
      label: "Created By",
      type: "text",
      key: "createdBy",
      inForm: false,
      inTable: false,
    },
    {
      label: "Live",
      type: "boolean",
      key: "isLive",
      inForm: true,
      inTable: false,
      inEdit: true,
    },
    // {
    //   label: "Admin",
    //   type: "select",
    //   key: "admin",
    //   values: [],
    //   inForm: false,
    //   inTable: false,
    // },
    {
      label: "Product",
      type: "select",
      filterType: "select",
      key: "product",
      values: [],
      inForm: false,
      inTable: false,
      inEdit: true,
    },
    {
      label: "Created At",
      type: "text",
      key: "createdAt",
      inForm: false,
      inTable: false,
    },
    {
      label: "Actions",
      type: "action",
      key: "actions2",
      inForm: false,
      inTable: true,
    },
  ],
  // Product Variant Rate
  variantRate: [
    {
      label: "Rate",
      type: "number",
      key: "rate",
      inForm: true,
      inTable: true,
      inEdit: true,
    },
    {
      label: "Product Variant",
      type: "select",
      filterType: "select",
      key: "productVariant",
      values: [],
      inForm: false,
      inTable: true,
      // inEdit: true,
    },
    {
      label: "Associate Name",
      type: "select",
      filterType: "select",
      key: "associate",
      dynamicValuesFn: () => fetchDependentOptions("associate"),
      values: [],
      inForm: true,
      inTable: true,
      // inEdit: true,
      required: true,
    },
    {
      label: "State",
      type: "select",
      key: "state",
      filterType: "select",
      values: [],
      dynamicValuesFn: () => fetchDependentOptions("state"),
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "District",
      type: "select",
      key: "district",
      filterType: "select",
      dependsOn: "state",
      values: [],
      dynamicValuesFn: (stateId: string) =>
        fetchDependentOptions("district", "state", stateId),
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "City / Town",
      type: "select",
      key: "city",
      filterType: "select",
      dependsOn: "district", // 👈
      dynamicValuesFn: (districtId: string) =>
        fetchDependentOptions("city", "district", districtId),
      values: [],
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "Live",
      type: "boolean",
      key: "isLive",
      inForm: true,
      inTable: true,
      inEdit: true,
    },
    {
      label: "Created At",
      type: "date",
      key: "createdAt",
      inForm: false,
      inTable: true,
    },
    {
      label: "Actions",
      type: "action",
      key: "actions2",
      inForm: false,
      inTable: true,
    },
  ],
  // Product Variant Rate
  displayedRate: [
    {
      label: "Product ",
      type: "text",
      key: "product",
      inForm: false,
      inTable: true,
      inEdit: true,
    },
    {
      label: "Product Variant",
      type: "text",
      key: "productVariant",
      inForm: false,
      inTable: true,
      inEdit: true,
    },
    {
      label: "Rate",
      type: "number",
      key: "rate",
      inForm: true,
      inTable: true,
    },
    // {
    //   label: "Actions",
    //   type: "action",
    //   key: "actions2",
    //   inForm: false,
    //   inTable: true,
    // },
    {
      label: "Actions",
      type: "action",
      key: "actions2",
      inForm: false,
      inTable: true,
    },
  ],

  // Project
  projects: [
    {
      label: "Title",
      type: "text",
      key: "title",
      inForm: false,
      inTable: false,
    },
    {
      label: "Description",
      type: "textarea",
      key: "description",
      inForm: true,
      inTable: false,
      inEdit: true,
    },
    {
      label: "Custom ID",
      type: "text",
      key: "customId",
      filterType: "text",
      inForm: false,
      inTable: true,
    },
    {
      label: "Customer",
      type: "select",
      key: "customer",
      filterType: "select",
      values: [],
      inForm: true,
      inTable: true,
      inEdit: true,
      required: true,
    },
    // {
    //   label: "Admin",
    //   type: "select",
    //   key: "admin",
    //   values: [],
    //   inForm: false,
    //   inTable: false,
    // },
    {
      label: "Project Manager",
      type: "select",
      filterType: "select",
      key: "projectManager",
      values: [],
      inForm: true,
      inTable: false,
      inEdit: true,
      required: true,
    },
    {
      label: "Assignment Date ",
      type: "date",
      key: "assignmentDate",
      filterType: "date",

      inForm: true,
      inTable: true,
      inEdit: true,
    },
    {
      label: "Status",
      type: "select",
      key: "status",
      values: [],
      inForm: false,
      inTable: false,
    },
    {
      label: "Project Task",
      type: "select",
      key: "type",
      values: [],
      inForm: true,
      inTable: true,
      inEdit: true,
      required: true,
    },
    {
      label: "Location",
      type: "select",
      filterType: "multiselect",
      key: "location",
      values: [],
      inForm: true,
      inTable: true,
      inEdit: true,
      required: true,
    },
    {
      label: "Task",
      type: "textarea",
      key: "task",
      inForm: true,
      inTable: false,
      inEdit: true,
    },
    {
      label: "Order Number",
      type: "text",
      key: "orderNumber",
      inForm: true,
      inTable: false,
      inEdit: true,
    },

    {
      label: "Scheda Radio Date",
      type: "date",
      key: "schedaRadioDate",
      filterType: "date",
      inForm: true,
      inEdit: true,
      inTable: true,
    },

    {
      label: "Created At",
      type: "text",
      key: "createdAt",
      inForm: false,
      inTable: false,
    },
    {
      label: "Actions",
      type: "action",
      key: "actions2",
      inForm: false,
      inTable: true,
    },
  ],
  // Project
  enquiry: [
    {
      label: "Customer Name",
      type: "text",
      key: "name",
      inForm: false,
      inTable: true,
      inEdit: true,
      required: true,
    },
    {
      label: "Phone Number",
      type: "number",
      key: "phoneNumber",
      filterType: "text",
      inForm: false,
      inTable: true,
    },
    {
      label: "Specifications",
      type: "textarea",
      key: "specification",
      inForm: true,
      inTable: true,
      inEdit: true,
    },
    // {
    //   label: "Customer name",
    //   type: "text",
    //   key: "name",
    //   filterType: "select",
    //   values: [],
    //   inForm: true,
    //   inTable: true,
    //   inEdit: true,
    //   required: true,
    // },

    {
      label: "Mediator Associate",
      type: "text",
      key: "mediatorAssociate",
      filterType: "select",
      inForm: false,
      inTable: true,
      inEdit: true,
      required: true,
    },
    {
      label: "Product Associate",
      type: "text",
      key: "productAssociate",
      filterType: "select",
      inForm: false,
      inTable: true,
      inEdit: true,
      required: true,
    },
    {
      label: "Associate Company",
      type: "text",
      key: "associateCompany",
      filterType: "select",
      inForm: false,
      inTable: true,
      inEdit: true,
      required: true,
    },
    {
      label: "Product",
      type: "text",
      key: "product",
      filterType: "select",
      inForm: false,
      inTable: true,
      inEdit: true,
      required: true,
    },
    {
      label: "Product Variant",
      type: "text",
      key: "productVariant",
      inForm: false,
      inTable: true,
      inEdit: true,
    },
    {
      label: "Rate",
      type: "text",
      key: "rate",
      inForm: false,
      inTable: true,
      inEdit: true,
    },
    {
      label: "Commission",
      type: "text",
      key: "commission",
      inForm: false,
      inTable: true,
      inEdit: true,
    },
    // {
    //   label: "Variant Rate| Commission",
    //   type: "text",
    //   key: "variantRate",
    //   inForm: false,
    //   inTable: true,
    //   inEdit: true,
    // },
    // {
    //   label: "Displayed Rate | Commission",
    //   type: "text",
    //   key: "displayedRate",
    //   inForm: false,
    //   inTable: true,
    //   inEdit: true,
    // },
    {
      label: "Created At",
      type: "text",
      key: "createdAt",
      inForm: false,
      inTable: false,
    },
    {
      label: "Actions",
      type: "action",
      key: "actions2",
      inForm: false,
      inTable: true,
    },
  ],
  projectType: [
    {
      label: "Name",
      type: "text",
      key: "name",
      inForm: true,
      inTable: true,
      required: true,
    },

    {
      label: "Created At",
      type: "dateTime",
      key: "createdAt",
      inForm: false,
      inTable: true,
    },
    // {
    //   label: "Active",
    //   type: "checkbox",
    //   key: "isActive",
    //   inForm: false,
    //   inTable: true,
    // },
    {
      label: "Actions",
      type: "action",
      key: "actions2",
      inForm: false,
      inTable: true,
    },
  ],
  projectStatus: [
    {
      label: "Name",
      type: "text",
      key: "name",
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "Created At",
      type: "dateTime",
      key: "createdAt",
      inForm: false,
      inTable: true,
    },
    // {
    //   label: "Active",
    //   type: "checkbox",
    //   key: "isActive",
    //   inForm: false,
    //   inTable: true,
    // },
    {
      label: "Actions",
      type: "action",
      key: "actions2",
      inForm: false,
      inTable: true,
    },
  ],
  // Activity
  activity: [
    {
      label: "Title",
      type: "text",
      key: "title",
      filterType: "text",
      inForm: false,
      inTable: true,
      inEdit: false,
    },
    {
      label: "Description",
      type: "textarea",
      key: "description",

      inForm: true,
      inTable: false,
      inEdit: true,
    },

    {
      label: "Project",
      type: "select",
      key: "project",
      values: [],
      inForm: false,
      inTable: false,
      inEdit: false,
    },

    {
      label: "Activity Manager",
      type: "select",
      key: "activityManager",
      filterType: "multiselect",
      values: [],
      inForm: true,
      inTable: true,
      inEdit: true,
      required: true,
    },
    {
      label: "Workers",
      type: "multiselect",
      key: "worker",
      filterType: "multiselect",
      values: [],
      inForm: true,
      inTable: false,
      inEdit: true,
    },
    {
      label: "Status",
      type: "select",
      key: "status",
      values: [],
      inForm: false,
      inTable: false,
      inEdit: false,
    },
    {
      label: "Forecast Date",
      type: "week",
      key: "forecastDate",
      filterType: "date",
      inForm: true,
      inTable: true,
      inEdit: true,
    },
    {
      label: "Actual Date",
      type: "date",
      key: "actualDate",
      filterType: "date",
      inForm: false,
      inTable: false,
      inEdit: true,
    },
    {
      label: "Target Operation Date",
      type: "week",
      key: "targetOperationDate",
      filterType: "date",
      inForm: true,
      inTable: true,
      inEdit: true,
    },
    {
      label: "Target Finance  Date",
      type: "week",
      key: "targetFinanceDate",
      filterType: "date",
      inForm: false,
      inTable: false,
      inEdit: true,
    },

    {
      label: "Updated By ",
      type: "text",
      key: "updatedBy",
      inForm: false,
      inTable: true,
      inEdit: false,
    },
    {
      label: "Hours Spent",
      type: "number",
      key: "hoursSpent",
      inForm: false,
      inTable: true,
      // inEdit: true,
    },

    {
      label: "Rejection Reason",
      type: "textarea",
      key: "rejectionReason",
      inForm: false,
      inTable: false,
    },

    {
      label: "Activity Type",
      type: "select",
      key: "type",
      inForm: true,
      inTable: false,
      required: true,
    },

    {
      label: "Allow TimeSheets",
      type: "boolean",
      key: "allowTimesheets",
      inForm: true,
      inTable: false,
    },
    {
      label: "Created At",
      type: "dateTime",
      key: "createdAt",
      inForm: false,
      inTable: false,
    },
    {
      label: "Actions",
      type: "action",
      key: "actions2",
      inForm: false,
      inTable: true,
    },
  ],
  activityStatus: [
    {
      label: "Name",
      type: "text",
      key: "name",
      inForm: true,
      inTable: true,
      required: true,
    },

    {
      label: "Created At",
      type: "dateTime",
      key: "createdAt",
      inForm: false,
      inTable: true,
    },
    // {
    //   label: "Active",
    //   type: "checkbox",
    //   key: "isActive",
    //   inForm: false,
    //   inTable: true,
    // },
    {
      label: "Actions",
      type: "action",
      key: "actions2",
      inForm: false,
      inTable: true,
    },
  ],
  activityType: [
    {
      label: "Name",
      type: "text",
      key: "name",
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "Created At",
      type: "dateTime",
      key: "createdAt",
      inForm: false,
      inTable: true,
    },
    // {
    //   label: "Active",
    //   type: "checkbox",
    //   key: "isActive",
    //   inForm: false,
    //   inTable: true,
    // },
    {
      label: "Actions",
      type: "action",
      key: "actions2",
      inForm: false,
      inTable: true,
    },
  ],
  // TimeSheet
  timeSheet: [
    {
      label: "Activity",
      type: "select",
      key: "activity",
      values: [],
      inForm: false,
      inTable: true,
    },
    {
      label: "Note",
      type: "textarea",
      key: "note",
      inForm: true,
      inTable: true,
    },
    // {
    //   label: "Created By",
    //   type: "text",
    //   key: "createdBy",
    //   inForm: false,
    //   inTable: true,
    // },
    {
      label: "Role",
      type: "text",
      key: "createdByRole",
      inForm: false,
      inTable: true,
    },
    {
      label: "Date",
      type: "date",
      key: "date",
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "Start Time",
      type: "time",
      key: "startTime",
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "End Time",
      type: "time",
      key: "endTime",
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "Created At",
      type: "dateTime",
      key: "createdAt",
      inForm: false,
      inTable: true,
    },
    {
      label: "Updated At",
      type: "dateTime",
      key: "updatedAt",
      inForm: false,
      inTable: false,
    },

    {
      label: "Actions",
      type: "action",
      key: "actions2",
      inForm: false,
      inTable: true,
    },
  ],
  // Location
  location: [
    {
      label: "Custom ID",
      type: "text",
      key: "customId",
      filterType: "text",
      inForm: false,
      inTable: true,
      inEdit: false,
    },
    {
      label: "Name",
      type: "text",
      key: "name",
      inForm: true,
      filterType: "text",
      inTable: true,
      inEdit: true,
      required: true,
    },

    {
      label: "Owner",
      type: "text",
      key: "owner",
      filterType: "text",
      inForm: true,
      inTable: true,
      inEdit: true,
    },
    {
      label: "Address",
      type: "text",
      key: "address",
      filterType: "text",
      inForm: true,
      inTable: false,
      inEdit: true,
    },
    {
      label: "Location Manager",
      type: "multiselectValue",
      key: "locationManager",
      filterType: "multiselect",
      values: [],
      inForm: true,
      inTable: false,
      inEdit: true,
      required: true,
    },
    {
      label: "City",
      type: "text",
      key: "city",
      filterType: "text",
      inForm: true,
      inTable: false,
      inEdit: true,
    },
    {
      label: "Street",
      type: "text",
      filterType: "text",
      key: "street",
      inForm: true,
      inTable: false,
      inEdit: true,
    },
    {
      label: "Province",
      type: "text",
      filterType: "text",
      key: "province",
      inForm: true,
      inTable: false,
      inEdit: true,
    },
    {
      label: "Region",
      type: "text",
      key: "region",
      filterType: "text",
      inForm: true,
      inTable: true,
      inEdit: true,
    },

    {
      label: "Nation",
      type: "text",
      key: "nation",
      filterType: "text",
      inForm: true,
      inTable: true,
      inEdit: true,
    },

    {
      label: "Location Type",
      type: "select",
      key: "locationType",
      values: [],
      filterType: "multiselect",
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "Description",
      type: "textarea",
      key: "description",
      inForm: true,
      inTable: false,
      inEdit: true,
    },
    {
      label: "Latitude",
      type: "text",
      key: "latitude",
      inForm: false,
      inTable: false,
      inEdit: true,
    },
    {
      label: "Longitude",
      type: "text",
      key: "longitude",
      inForm: false,
      inTable: false,
      inEdit: true,
    },
    {
      label: "Map",
      type: "text",
      key: "map",
      inForm: true,
      inTable: false,
    },
    {
      label: "Image",
      type: "file",
      key: "image",
      inForm: false,
      inTable: false,
      accept: "image/*",
    },
    {
      label: "Actions",
      type: "action",
      key: "actions2",
      inForm: false,
      inTable: true,
    },

    {
      label: "Created At",
      type: "dateTime",
      key: "createdAt",
      inForm: false,
      inTable: true,
    },
  ],
  locationType: [
    {
      label: "Name",
      type: "text",
      key: "name",
      inForm: true,
      inTable: true,
      required: true,
    },

    {
      label: "Created At",
      type: "dateTime",
      key: "createdAt",
      inForm: false,
      inTable: true,
    }, // {
    //   label: "Active",
    //   type: "checkbox",
    //   key: "isActive",
    //   inForm: false,
    //   inTable: true,
    // },
    {
      label: "Actions",
      type: "action",
      key: "actions2",
      inForm: false,
      inTable: true,
    },
  ],
  locationManager: [
    {
      label: "Name",
      type: "text",
      key: "name",
      inForm: true,
      inTable: true,
      required: true,
    },

    {
      label: "Created At",
      type: "dateTime",
      key: "createdAt",
      inForm: false,
      inTable: true,
    },
    // {
    //   label: "Active",
    //   type: "checkbox",
    //   key: "isActive",
    //   inForm: false,
    //   inTable: true,
    // },
    {
      label: "Actions",
      type: "action",
      key: "actions2",
      inForm: false,
      inTable: true,
    },
  ],
  statusHistory: [
    {
      label: "Changed Role",
      type: "text",
      key: "changedRole",
      inForm: false,
      inTable: true,
      inEdit: false,
    },
    {
      label: "New Status",
      type: "text",
      key: "newStatus",
      inForm: false,
      inTable: true,
      inEdit: false,
    },
    {
      label: "Changed By",
      type: "text",
      key: "changedBy",
      inForm: false,
      inTable: true,
      inEdit: false,
    },
    {
      label: "Change Type",
      type: "text",
      key: "changeType",
      inForm: false,
      inTable: true,
      inEdit: false,
    },
    {
      label: "Changed Fields",
      type: "text",
      key: "changedFields",
      inForm: false,
      inTable: true,
      inEdit: false,
    },
    {
      label: "Changed At",
      type: "dateTime",
      key: "changedAt",
      inForm: false,
      inTable: true,
    },
  ],
};

/**
 * Basic interface for an Enquiry (example)
 */
interface IEnquiry {
  _id: string;
  phoneNumber: string;
  name: string;
  variantRate: string; // or object ID
  displayRate?: string | null;
  productVariant: string;
  mediatorAssociate?: string | null;
  realAssociate: string;
  createdAt?: string;
}
