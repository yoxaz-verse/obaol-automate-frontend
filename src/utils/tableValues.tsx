import {
  activityRoutes,
  activityStatusRoutes,
  activityTypeRoutes,
  adminRoutes,
  customerRoutes,
  locationManagerRoutes,
  locationRoutes,
  locationTypeRoutes,
  managerRoutes,
  projectRoutes,
  projectStatusRoutes,
  projectTypeRoutes,
  serviceCompanyRoutes,
  workerRoutes,
} from "@/core/api/apiRoutes";

// Helper function to generate columns based on the current table
export const generateColumns = (currentTable: string, tableConfig: any) => {
  const columns = tableConfig[currentTable]
    .filter((field: any) => field.inTable && field.type !== "select") // Exclude select fields
    .map((field: any) => ({
      name: field.label.toUpperCase(),
      uid: field.key,
    }));

  // Dynamically add related columns based on the current table
  if (currentTable === "manager") {
    columns.push({ name: "ADMIN", uid: "adminName" });
  } else if (currentTable === "worker") {
    columns.push({ name: "MANAGER", uid: "managerName" });
  }
  // Add conditions for 'customer' if needed

  return columns;
};

export const apiRoutesByRole: Record<string, string> = {
  admin: adminRoutes.getAll,
  manager: managerRoutes.getAll,
  customer: customerRoutes.getAll,
  worker: workerRoutes.getAll,
  location: locationRoutes.getAll,
  locationManager: locationManagerRoutes.getAll,
  locationType: locationTypeRoutes.getAll,
  projectType: projectTypeRoutes.getAll,
  serviceCompany: serviceCompanyRoutes.getAll,
  projectStatus: projectStatusRoutes.getAll,
  project: projectRoutes.getAll,
  activity: activityRoutes.getAll,
  activityType: activityTypeRoutes.getAll,
  activityStatus: activityStatusRoutes.getAll,
};

// Define the table and form configuration dynamically
export const initialTableConfig: Record<
  any,
  {
    label: string;
    type: string;
    key: string;
    inForm: boolean;
    inTable: boolean;
    values?: { key: string; value: string }[];
  }[]
> = {
  admin: [
    { label: "Name", type: "text", key: "name", inForm: true, inTable: true },
    {
      label: "Email",
      type: "email",
      key: "email",
      inForm: true,
      inTable: true,
    },
    {
      label: "Created At",
      type: "text",
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
  manager: [
    { label: "Name", type: "text", key: "name", inForm: true, inTable: true },
    {
      label: "Email",
      type: "email",
      key: "email",
      inForm: true,
      inTable: true,
    },
    {
      label: "Password",
      type: "password",
      key: "password",
      inForm: true,
      inTable: false,
    },
    {
      label: "Profile Picture",
      type: "file",
      key: "fileURL",
      // accept: "image/*", // Accept only image files
      // multiple: false, // Single file upload
      inForm: true,
      inTable: true,
    },
    {
      label: "Admin",
      type: "select",
      key: "admin",
      values: [], // We'll populate this dynamically
      inForm: true,
      inTable: false,
    },
    {
      label: "Created At",
      type: "text",
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
    },
    {
      label: "Email",
      type: "email",
      key: "email",
      inForm: true,
      inTable: true,
    },
    {
      label: "Password",
      type: "password",
      key: "password",
      inForm: true,
      inTable: false,
    },
    {
      label: "Created At",
      type: "text",
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
    },
    {
      label: "Email",
      type: "email",
      key: "email",
      inForm: true,
      inTable: true,
    },
    {
      label: "Skill",
      type: "text",
      key: "skill",
      inForm: true,
      inTable: true,
    },
    {
      label: "Manager",
      type: "select",
      key: "manager",
      values: [], // We'll populate this dynamically
      inForm: true,
      inTable: false,
    },
    {
      label: "Created At",
      type: "text",
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
  locationType: [
    {
      label: "Name",
      type: "text",
      key: "name",
      inForm: true,
      inTable: true,
    },
    {
      label: "Created At",
      type: "text",
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
  locationManager: [
    {
      label: "Code",
      type: "text",
      key: "code",
      inForm: true,
      inTable: true,
    },
    {
      label: "Name",
      type: "text",
      key: "name",
      inForm: true,
      inTable: true,
    },
    {
      label: "Created At",
      type: "text",
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
  serviceCompany: [
    {
      label: "Name",
      type: "text",
      key: "name",
      inForm: true,
      inTable: true,
    },
    {
      label: "Address",
      type: "text",
      key: "address",
      inForm: true,
      inTable: true,
    },
    {
      label: "Description",
      type: "textarea",
      key: "description",
      inForm: true,
      inTable: false,
    },
    {
      label: "Map URL",
      type: "text",
      key: "map",
      inForm: true,
      inTable: false,
    },
    {
      label: "Website URL",
      type: "text",
      key: "url",
      inForm: true,
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
  projectType: [
    {
      label: "Name",
      type: "text",
      key: "name",
      inForm: true,
      inTable: true,
    },
    {
      label: "Created At",
      type: "text",
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
    },
    {
      label: "Created At",
      type: "text",
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
  activityStatus: [
    {
      label: "Name",
      type: "text",
      key: "name",
      inForm: true,
      inTable: true,
    },
    {
      label: "Created At",
      type: "text",
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
    },
    {
      label: "Created At",
      type: "text",
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
};
