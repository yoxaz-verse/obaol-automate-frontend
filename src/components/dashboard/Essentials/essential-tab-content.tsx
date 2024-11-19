// components/ServiceCompany/ServiceCompanyTabContent.tsx
"use client";
import React, { useState, useEffect } from "react";

import QueryComponent from "@/components/queryComponent";
import { Spacer } from "@nextui-org/react";
import AddModal from "@/components/CurdTable/add-model";
import UserDeleteModal from "@/components/Modals/delete";
import CommonTable from "@/components/dashboard/Table/common-table";
import {
  apiRoutesByRole,
  generateColumns,
  initialTableConfig,
} from "@/utils/tableValues";
import { useQuery } from "@tanstack/react-query";
import { getData } from "@/core/api/apiHandler";
import { locationRoutes, locationTypeRoutes } from "@/core/api/apiRoutes";

const EssentialTabContent = ({ essentialName }: { essentialName: string }) => {
  const tableConfig = { ...initialTableConfig }; // Create a copy to avoid mutations

  const columns = generateColumns(essentialName, tableConfig);
  const { data: locationTypeResponse, isLoading: isLocationTypeLoading } =
    useQuery({
      queryKey: ["LocationType"],
      queryFn: () => getData(locationTypeRoutes.getAll),
      enabled: essentialName === "location",
    });
  const { data: locationResponse, isLoading: isLocationLoading } = useQuery({
    queryKey: ["Location"],
    queryFn: () => getData(locationRoutes.getAll),
    enabled: essentialName === "locationManager",
  });

  const locationTypeValue = locationTypeResponse?.data?.data.data;
  console.log(locationTypeValue);

  const locationValue = locationResponse?.data?.data.data;
  console.log(locationValue);

  const queryKey = [essentialName];
  const [refetchFlag, setRefetchFlag] = useState(false);

  const refetchData = () => {
    // Implement refetch logic if necessary
  };

  // Form fields for add/edit modal

  // Define columns for the data table

  return (
    <div className="flex items-center justify-center">
      <div className="w-[95%]">
        <div className="my-4">
          <QueryComponent
            api={apiRoutesByRole[essentialName]}
            queryKey={queryKey}
            page={1}
            limit={100}
          >
            {(data: any) => {
              const fetchedData = data?.data || [];
              // const tableData = fetchedData.map((item: any) => ({
              //   ...item,
              // }));
              let formFields = tableConfig[essentialName];

              if (essentialName === "location") {
                const locationTypeValues = locationTypeValue.map(
                  (locationType: any) => ({
                    key: String(locationType._id),
                    value: locationType.name,
                  })
                );
                formFields = formFields.map((field: any) =>
                  field.key === "locationType"
                    ? { ...field, values: locationTypeValues }
                    : field
                );
              }
              if (essentialName === "locationManager") {
                const locationValues = locationValue.map(
                  (locationManager: any) => ({
                    key: String(locationManager._id),
                    value: locationManager.name,
                  })
                );
                formFields = formFields.map((field: any) =>
                  field.key === "location"
                    ? { ...field, values: locationValues }
                    : field
                );
              }
              const tableData = fetchedData.map((item: any) => {
                const { isDeleted, isActive, password, __v, ...rest } = item;

                if (essentialName === "location") {
                  return {
                    ...rest,
                    type: item.locationType.name
                      ? item.locationType.name
                      : "N/A",
                  };
                  // Handle other user types similarly if needed
                }
                if (essentialName === "locationManager") {
                  return {
                    ...rest,
                    managedLocation: item.location.name
                      ? item.location.name
                      : "N/A",
                  };
                  // Handle other user types similarly if needed
                }
                return rest;
              });
              return (
                <>
                  <AddModal
                    currentTable={essentialName}
                    formFields={formFields}
                    apiEndpoint={apiRoutesByRole[essentialName]}
                    refetchData={refetchData}
                  />
                  <Spacer y={5} />
                  <CommonTable
                    TableData={tableData}
                    columns={columns}
                    isLoading={false}
                    // viewModal={(item: any) => (
                    //   // Implement view modal if needed
                    //   // <div>ddd</div>
                    // )}
                    deleteModal={(item: any) => (
                      <UserDeleteModal
                        _id={item._id}
                        name={item.name}
                        deleteApiEndpoint={apiRoutesByRole[essentialName]}
                        refetchData={refetchData}
                      />
                    )}
                  />
                </>
              );
            }}
          </QueryComponent>
        </div>
      </div>
    </div>
  );
};

export default EssentialTabContent;
