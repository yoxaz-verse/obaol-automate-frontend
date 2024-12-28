import EditModal from "@/components/CurdTable/edit-model"; // Import your EditModal
import { getData } from "@/core/api/apiHandler";
import { FormField } from "@/data/interface-data";
import { apiRoutesByRole } from "@/utils/tableValues";
import { Spacer } from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import React from "react";

type EditActivityProps = {
  currentTable: string;
  formFields: FormField[];
  apiEndpoint: string;
  refetchData: () => void;
  initialValues: Record<string, any>;
  params?: string;
  additionalVariable?: Record<string, any>; // Dynamic additional parameters
};

function EditActivity({
  currentTable,
  formFields,
  apiEndpoint,
  refetchData,
  initialValues,
  params,
  additionalVariable,
}: EditActivityProps) {
  const { data: activityManagersResponse } = useQuery({
    queryKey: ["activityManager"],
    queryFn: () => getData(apiRoutesByRole["activityManager"]),
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
  const workers = workersResponse?.data?.data?.data || [];
  const activityManagers = activityManagersResponse?.data?.data?.data || [];
  const activityType = activityTypeResponse?.data?.data?.data || [];

  // Worker Options
  if (workers.length) {
    const workerValues = workers.map((worker: any) => ({
      key: String(worker._id),
      value: worker.name,
    }));
    formFields = formFields.map((field: any) =>
      field.key === "worker" ? { ...field, values: workerValues } : field
    );
  }

  // Manager Options
  if (activityManagers.length) {
    const activityManagersValues = activityManagers.map((manager: any) => ({
      key: String(manager._id),
      value: manager.name,
    }));
    formFields = formFields.map((field: any) =>
      field.key === "activityManager"
        ? { ...field, values: activityManagersValues }
        : field
    );
  }

  // Activity Type Options
  if (activityType.length) {
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
      <Spacer y={2} />
      {activityManagers && activityType && workers ? (
        <EditModal
          _id={initialValues._id}
          currentTable={currentTable}
          formFields={formFields}
          apiEndpoint={apiRoutesByRole[currentTable]} // Assuming API endpoint for update
          refetchData={refetchData}
        />
      ) : (
        //     <EditModal
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

export default EditActivity;
