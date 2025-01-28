import AddModal from "@/components/CurdTable/add-model";
import { getData } from "@/core/api/apiHandler";

import { FormField } from "@/data/interface-data";
import { apiRoutesByRole } from "@/utils/tableValues";
import { useQuery } from "@tanstack/react-query";
import React from "react";

type AddActivityProps = {
  currentTable: string;
  formFields: FormField[];
  apiEndpoint: string;
  refetchData: () => void;
  params?: string;

  additionalVariable?: Record<string, any>; // Dynamic additional parameters
};

function AddActivity({
  currentTable,
  formFields,
  apiEndpoint,
  refetchData,
  params,
  additionalVariable,
}: AddActivityProps) {
  const { data: activityManagersResponse } = useQuery({
    queryKey: ["activityManager"],
    queryFn: () => getData(apiRoutesByRole["activityManager"]),
  });

  // const { data: activityStatusesResponse } = useQuery({
  //   queryKey: ["ActivityStatuses"],
  //   queryFn: () => getData(apiRoutesByRole["activityStatus"]),
  // });

  const { data: activityTypeResponse } = useQuery({
    queryKey: ["ActivityType"],
    queryFn: () => getData(apiRoutesByRole["activityType"]),
  });

  const { data: workersResponse } = useQuery({
    queryKey: ["worker"],
    queryFn: () => getData(apiRoutesByRole["worker"]),
  });

  // Extract data or set as empty arrays
  const workers = workersResponse?.data.data.data;
  const activityManagers = activityManagersResponse?.data?.data.data;
  // const activityStatuses = activityStatusesResponse?.data?.data.data;
  const activityType = activityTypeResponse?.data?.data.data;

  // Populate related field values dynamically

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

  // //Activity Status
  // if (activityStatuses) {
  //   const activityStatusValues = activityStatuses.map((status: any) => ({
  //     key: String(status._id),
  //     value: status.name,
  //   }));

  //   formFields = formFields.map((field: any) =>
  //     field.key === "status"
  //       ? { ...field, values: activityStatusValues }
  //       : field
  //   );
  // }

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
      {activityManagers && activityType && workers ? ( // isAdminsLoading &&
        <AddModal
          currentTable={currentTable}
          formFields={formFields} // Pass the updated formFields
          apiEndpoint={apiEndpoint}
          refetchData={refetchData}
          additionalVariable={additionalVariable}
        />
      ) : (
        "Allocating Add Model" //Translate
      )}{" "}
    </div>
  );
}

export default AddActivity;
