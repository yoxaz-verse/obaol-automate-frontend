import EditModal from "@/components/CurdTable/edit-model"; // Import your EditModal
import { getData } from "@/core/api/apiHandler";
import {
  adminRoutes,
  customerRoutes,
  locationRoutes,
  projectManagerRoutes,
  projectStatusRoutes,
  projectTypeRoutes,
} from "@/core/api/apiRoutes";
import { FormField } from "@/data/interface-data";
import { apiRoutesByRole } from "@/utils/tableValues";
import { Spacer } from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import React from "react";

type EditProjectProps = {
  currentTable: string;
  formFields: FormField[];
  apiEndpoint: string;
  refetchData: () => void;
  initialValues: any;
  params?: string;
  additionalVariable?: Record<string, any>; // Dynamic additional parameters
};

function EditProject({
  currentTable,
  formFields,
  refetchData,
  initialValues,
}: EditProjectProps) {
  // Fetch related data for dropdowns
  const { data: customersResponse } = useQuery({
    queryKey: ["customers"],
    queryFn: () => getData(customerRoutes.getAll),
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

  // Extract data or set as empty arrays
  const customers = customersResponse?.data.data.data;
  console.log(formFields);
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
      <Spacer y={2} />
      {customers &&
      managers &&
      projectStatuses &&
      projectType &&
      customers &&
      location ? (
        <EditModal
          _id={initialValues._id}
          currentTable={currentTable}
          formFields={formFields}
          apiEndpoint={apiRoutesByRole[currentTable]} // Assuming API endpoint for update
          refetchData={refetchData}
        />
      ) : (
        // <EditModal
        //   currentTable={currentTable}
        //   formFields={formFields} // Pass updated formFields with dropdown options
        //   apiEndpoint={apiEndpoint}
        //   refetchData={refetchData}
        //   initialData={initialValues} // Pre-fill the modal with initial values
        //   // additionalVariable={additionalVariable}
        // />
        "Loading Edit Modal..."
      )}
      <Spacer y={5} />
    </div>
  );
}

export default EditProject;
