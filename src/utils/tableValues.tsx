import { getData } from "@/core/api/apiHandler";
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
import { useQuery } from "@tanstack/react-query";

export const useSelectValues = () => {
  const { data: locationTypeResponse, isLoading: isLocationTypeLoading } =
    useQuery({
      queryKey: ["LocationType"],
      queryFn: () => getData(locationTypeRoutes.getAll),
    });

  const locationTypes = locationTypeResponse?.data?.data.data;

  return {
    locationTypes,
    isLoading: isLocationTypeLoading,
  };
};

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

export const initialTableConfig: Record<
  any,
  {
    label: string;
    type:
      | "text"
      | "select"
      | "multiselect"
      | "file"
      | "textarea"
      | "boolean"
      | "image"
      | "action"
      | "email"
      | "password"; // Define specific types
    key: string;
    inForm: boolean;
    inTable: boolean;
    values?: { key: string; value: string }[];
    accept?: string;
    required?: boolean;
  }[]
> = {
  // User
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
      label: "Password",
      type: "password",
      key: "password",
      inForm: true,
      inTable: false,
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
      label: "Service Company",
      type: "select",
      key: "serviceCompany",
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

  serviceCompany: [
    {
      label: "Name",
      type: "text",
      key: "name",
      inForm: true,
      inTable: true,
    },
    {
      label: "Owner",
      type: "text",
      key: "owner",
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
  // Location
  location: [
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
      label: "City",
      type: "text",
      key: "city",
      inForm: true,
      inTable: true,
    },
    {
      label: "Province",
      type: "text",
      key: "province",
      inForm: true,
      inTable: true,
    },
    {
      label: "Region",
      type: "text",
      key: "region",
      inForm: true,
      inTable: true,
    },
    {
      label: "Nation",
      type: "text",
      key: "nation",
      inForm: true,
      inTable: true,
    },
    {
      label: "Latitude",
      type: "text",
      key: "latitude",
      inForm: true,
      inTable: false,
    },
    {
      label: "Longitude",
      type: "text",
      key: "longitude",
      inForm: true,
      inTable: false,
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
      inForm: true,
      inTable: false,
      accept: "image/*",
    },
    {
      label: "Description",
      type: "textarea",
      key: "description",
      inForm: true,
      inTable: false,
    },

    {
      label: "Location Type",
      type: "select",
      key: "type",
      values: [],
      inForm: true,
      inTable: false,
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
  // Project
  projects: [
    { label: "Title", type: "text", key: "title", inForm: true, inTable: true },
    {
      label: "Description",
      type: "textarea",
      key: "description",
      inForm: true,
      inTable: true,
    },
    {
      label: "Custom ID",
      type: "text",
      key: "customId",
      inForm: false,
      inTable: true,
    },
    {
      label: "Customer",
      type: "select",
      key: "customer",
      values: [],
      inForm: true,
      inTable: true,
    },
    {
      label: "Admin",
      type: "select",
      key: "admin",
      values: [],
      inForm: true,
      inTable: true,
    },
    {
      label: "Manager",
      type: "select",
      key: "manager",
      values: [],
      inForm: true,
      inTable: true,
    },
    {
      label: "Assignment Date ",
      type: "date",
      key: "assignmentDate",
      inForm: true,
      inTable: true,
    },
    {
      label: "Status",
      type: "select",
      key: "status",
      values: [],
      inForm: true,
      inTable: true,
    },
    {
      label: "Project Type",
      type: "select",
      key: "type",
      values: [],
      inForm: true,
      inTable: true,
    },
    {
      label: "Task",
      type: "textarea",
      key: "task",
      inForm: true,
      inTable: true,
    },
    {
      label: "Order Number",
      type: "number",
      key: "orderNumber",
      inForm: true,
      inTable: true,
    },

    {
      label: "Scheda Radio Date",
      type: "date",
      key: "schedaRadioDate",
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
  // Activity
  activity: [
    { label: "Title", type: "text", key: "title", inForm: true, inTable: true },
    {
      label: "Description",
      type: "textarea",
      key: "description",
      inForm: true,
      inTable: true,
    },

    {
      label: "Project",
      type: "select",
      key: "project",
      values: [],
      inForm: true,
      inTable: true,
    },
    {
      label: "Customer",
      type: "select",
      key: "customer",
      values: [],
      inForm: true,
      inTable: true,
    },
    {
      label: "Workers",
      type: "multiselect",
      key: "worker",
      values: [],
      inForm: true,
      inTable: true,
    },
    {
      label: "Status",
      type: "select",
      key: "status",
      values: [],
      inForm: true,
      inTable: true,
    },
    {
      label: "Forecast Date",
      type: "date",
      key: "forecastDate",
      values: [],
      inForm: true,
      inTable: true,
    },
    {
      label: "Actual Date",
      type: "date",
      key: "actualDate",
      values: [],
      inForm: true,
      inTable: true,
    },
    {
      label: "Target Operation Date",
      type: "date",
      key: "targetOperationDate",
      values: [],
      inForm: true,
      inTable: true,
    },
    {
      label: "Target Finance Date",
      type: "date",
      key: "targetFinanceDate",
      values: [],
      inForm: true,
      inTable: true,
    },

    {
      label: "Updated By Model",
      type: "text",
      key: "updatedByModel",
      values: [],
      inForm: true,
      inTable: true,
    },
    {
      label: "Hours Spent",
      type: "number",
      key: "hoursSpent",
      values: [],
      inForm: true,
      inTable: true,
    },
    {
      label: "Work Complete Status",
      type: "boolean",
      key: "workCompleteStatus",
      values: [],
      inForm: true,
      inTable: true,
    },
    {
      label: "Customer Status",
      type: "boolean",
      key: "customerStatus",
      values: [],
      inForm: true,
      inTable: true,
    },
    {
      label: "Submitted",
      type: "boolean",
      key: "isSubmitted",
      values: [],
      inForm: true,
      inTable: true,
    },
    {
      label: "Accepted",
      type: "boolean",
      key: "isAccepted",
      values: [],
      inForm: true,
      inTable: true,
    },
    {
      label: "Rejected",
      type: "boolean",
      key: "isRejected",
      values: [],
      inForm: true,
      inTable: true,
    },
    {
      label: "Rejection Reason",
      type: "boolean",
      key: "rejectionReason",
      values: [],
      inForm: true,
      inTable: true,
    },
    {
      label: "Pending",
      type: "boolean",
      key: "isPending",
      values: [],
      inForm: true,
      inTable: true,
    },
    {
      label: "Hold",
      type: "boolean",
      key: "isOnHold",
      values: [],
      inForm: true,
      inTable: true,
    },
    {
      label: "Activity Type",
      type: "select",
      key: "type",
      values: [],
      inForm: true,
      inTable: true,
    },
    {
      label: "Task",
      type: "textarea",
      key: "task",
      inForm: false,
      inTable: true,
    },
    {
      label: "Order Number",
      type: "text",
      key: "orderNumber",
      inForm: false,
      inTable: true,
    },
    {
      label: "Forecast Date",
      type: "date",
      key: "forecastDate",
      inForm: false,
      inTable: true,
    },
    {
      label: "Target Finance Date",
      type: "date",
      key: "targetFinanceDate",
      inForm: false,
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
  // TimeSheet
};
