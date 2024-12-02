import AddModal, { FormField } from "@/components/CurdTable/add-model";
import { getData } from "@/core/api/apiHandler";
import {
  adminRoutes,
  customerRoutes,
  locationRoutes,
  projectManagerRoutes,
  projectStatusRoutes,
  projectTypeRoutes,
} from "@/core/api/apiRoutes";
import { apiRoutesByRole } from "@/utils/tableValues";
import { useQuery } from "@tanstack/react-query";
import React from "react";

type AddActivityProps = {
  currentTable: string;
  formFields: FormField[];
  apiEndpoint: string;
  refetchData: () => void;
  params?: string;
};

function AddActivity({
  currentTable,
  formFields,
  apiEndpoint,
  refetchData,
  params,
}: AddActivityProps) {
  // Fetch related data for dropdowns
  const { data: projectsResponse } = useQuery({
    queryKey: ["projects"],
    queryFn: () => getData(apiRoutesByRole["projects"]),
  });

  // Fetch related data for dropdowns
  const { data: customersResponse } = useQuery({
    queryKey: ["customers"],
    queryFn: () => getData(apiRoutesByRole["customer"]),
  });

  const { data: adminsResponse } = useQuery({
    queryKey: ["admins"],
    queryFn: () => getData(apiRoutesByRole["admin"]),
  });

  const { data: activityManagersResponse } = useQuery({
    queryKey: ["activityManager"],
    queryFn: () => getData(apiRoutesByRole["activityManager"]),
  });

  const { data: activityStatusesResponse } = useQuery({
    queryKey: ["ActivityStatuses"],
    queryFn: () => getData(apiRoutesByRole["activityStatus"]),
  });

  const { data: activityTypeResponse } = useQuery({
    queryKey: ["ActivityType"],
    queryFn: () => getData(apiRoutesByRole["activityType"]),
  });

  const { data: workersResponse } = useQuery({
    queryKey: ["worker"],
    queryFn: () => getData(apiRoutesByRole["worker"]),
  });

  // Extract data or set as empty arrays
  const customers = customersResponse?.data.data.data;
  const workers = workersResponse?.data.data.data;
  const admins = adminsResponse?.data?.data.data;
  const activityManagers = activityManagersResponse?.data?.data.data;
  const activityStatuses = activityStatusesResponse?.data?.data.data;
  const activityType = activityTypeResponse?.data?.data.data;
  const projects = projectsResponse?.data?.data.data;

  // Populate related field values dynamically

  //Project
  if (projects) {
    const projectValues = projects.map((project: any) => ({
      key: String(project._id),
      value: project.title,
    }));
    formFields = formFields.map((field: any) =>
      field.key === "project" ? { ...field, values: projectValues } : field
    );
  }

  //Customer
  if (customers) {
    const customerValues = customers.map((customer: any) => ({
      key: String(customer._id),
      value: customer.name,
    }));
    formFields = formFields.map((field: any) =>
      field.key === "customer" ? { ...field, values: customerValues } : field
    );
  }

  //Worker
  if (workers) {
    const workerValues = workers.map((worker: any) => ({
      key: String(worker._id),
      value: worker.name,
    }));
    formFields = formFields.map((field: any) =>
      field.key === "worker" ? { ...field, values: workerValues } : field
    );
  }

  //Admin

  if (admins) {
    const adminValues = admins.map((admin: any) => ({
      key: String(admin._id),
      value: admin.name,
    }));
    formFields = formFields.map((field: any) =>
      field.key === "admin" ? { ...field, values: adminValues } : field
    );
  }

  //Manager

  if (activityManagers) {
    const activityManagersValues = activityManagers.map(
      (activityManagers: any) => ({
        key: String(activityManagers._id),
        value: activityManagers.name,
      })
    );
    formFields = formFields.map((field: any) =>
      field.key === "activityManager"
        ? { ...field, values: activityManagersValues }
        : field
    );
  }

  //Activity Status
  if (activityStatuses) {
    const activityStatusValues = activityStatuses.map((status: any) => ({
      key: String(status._id),
      value: status.name,
    }));

    formFields = formFields.map((field: any) =>
      field.key === "status"
        ? { ...field, values: activityStatusValues }
        : field
    );
  }

  //Activity Type
  if (activityType) {
    const activityTypeValues = activityType.map((type: any) => ({
      key: String(type._id),
      value: type.name,
    }));

    formFields = formFields.map((field: any) =>
      field.key === "type" ? { ...field, values: activityTypeValues } : field
    );
  }

  return (
    <div>
      {customers &&
      activityManagers &&
      activityStatuses &&
      activityType &&
      workers &&
      projects && // isAdminsLoading &&
      admins ? (
        <AddModal
          currentTable={currentTable}
          formFields={formFields} // Pass the updated formFields
          apiEndpoint={apiEndpoint}
          refetchData={refetchData}
        />
      ) : (
        "Allocating Add Model"
      )}{" "}
    </div>
  );
}

export default AddActivity;
