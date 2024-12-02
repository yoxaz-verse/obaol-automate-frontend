"use client";
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
import { useQuery } from "@tanstack/react-query";
import React from "react";

type AddProjectProps = {
  currentTable: string;
  formFields: FormField[];
  apiEndpoint: string;
  refetchData: () => void;
  params?: string;
};

function AddProject({
  currentTable,
  formFields,
  apiEndpoint,
  refetchData,
  params,
}: AddProjectProps) {
  // Fetch related data for dropdowns
  const { data: customersResponse } = useQuery({
    queryKey: ["customers"],
    queryFn: () => getData(customerRoutes.getAll),
  });

  const { data: adminsResponse } = useQuery({
    queryKey: ["admins"],
    queryFn: () => getData(adminRoutes.getAll),
  });

  const { data: managersResponse } = useQuery({
    queryKey: ["projectManager"],
    queryFn: () => getData(projectManagerRoutes.getAll),
  });

  const { data: projectStatusesResponse } = useQuery({
    queryKey: ["projectStatuses"],
    queryFn: () => getData(projectStatusRoutes.getAll),
  });

  const { data: projectTypeResponse } = useQuery({
    queryKey: ["projectType"],
    queryFn: () => getData(projectTypeRoutes.getAll),
  });
  const { data: locationResponse } = useQuery({
    queryKey: ["location"],
    queryFn: () => getData(locationRoutes.getAll),
  });

  console.log(adminsResponse);

  // Extract data or set as empty arrays
  const customers = customersResponse?.data.data.data;
  const admins = adminsResponse?.data?.data.data;
  const managers = managersResponse?.data?.data.data;
  const projectStatuses = projectStatusesResponse?.data?.data.data;
  const projectType = projectTypeResponse?.data?.data.data;
  const location = locationResponse?.data?.data.data;
  // Populate related field values dynamically
  if (customers) {
    const customerValues = customers.map((admin: any) => ({
      key: String(admin._id),
      value: admin.name,
    }));
    formFields = formFields.map((field: any) =>
      field.key === "customer" ? { ...field, values: customerValues } : field
    );
  }
  if (admins) {
    const adminValues = admins.map((admin: any) => ({
      key: String(admin._id),
      value: admin.name,
    }));
    formFields = formFields.map((field: any) =>
      field.key === "admin" ? { ...field, values: adminValues } : field
    );
  }
  if (managers) {
    const managerValues = managers.map((manager: any) => ({
      key: String(manager._id),
      value: manager.name,
    }));
    formFields = formFields.map((field: any) =>
      field.key === "projectManager"
        ? { ...field, values: managerValues }
        : field
    );
  }
  if (projectStatuses) {
    const projectStatusValues = projectStatuses.map((status: any) => ({
      key: String(status._id),
      value: status.name,
    }));

    formFields = formFields.map((field: any) =>
      field.key === "status" ? { ...field, values: projectStatusValues } : field
    );
  }
  if (projectType) {
    const projectTypeValues = projectType.map((type: any) => ({
      key: String(type._id),
      value: type.name,
    }));

    formFields = formFields.map((field: any) =>
      field.key === "type" ? { ...field, values: projectTypeValues } : field
    );
  }
  if (location) {
    const locationValues = location.map((location: any) => ({
      key: String(location._id),
      value: location.name,
    }));
    formFields = formFields.map((field: any) =>
      field.key === "location" ? { ...field, values: locationValues } : field
    );
  }
  return (
    <div>
      {customers &&
      managers &&
      projectStatuses &&
      projectType &&
      location && //
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

export default AddProject;
