"use client";
import React, { useState, useEffect } from "react";

import QueryComponent from "@/components/queryComponent";
import { Spacer } from "@nextui-org/react";
import AddModal from "@/components/CurdTable/add-model";
import UserDeleteModal from "@/components/CurdTable/delete";
import CommonTable from "@/components/CurdTable/common-table";
import {
  apiRoutesByRole,
  generateColumns,
  initialTableConfig,
} from "@/utils/tableValues";
import { useQuery } from "@tanstack/react-query";
import { getData } from "@/core/api/apiHandler";
import {
  locationManagerRoutes,
  locationRoutes,
  locationTypeRoutes,
} from "@/core/api/apiRoutes";
import DetailsModal from "@/components/CurdTable/details";
import DynamicFilter from "@/components/CurdTable/dynamic-filtering";

const EssentialTabContent = ({
  essentialName,
  filter,
}: {
  essentialName: string;
  filter?: any;
}) => {
  const tableConfig = { ...initialTableConfig }; // Create a copy to avoid mutations
  const [filters, setFilters] = React.useState<Record<string, any>>({}); // Dynamic filters
  if (filter) setFilters(filter);
  const columns = generateColumns(essentialName, tableConfig);
  const { data: locationTypeResponse } = useQuery({
    queryKey: ["LocationType"],
    queryFn: () => getData(locationTypeRoutes.getAll),
    enabled: essentialName === "location",
  });
  const { data: locationManagerResponse } = useQuery({
    queryKey: ["LocationManager"],
    queryFn: () => getData(locationManagerRoutes.getAll),
    enabled: essentialName === "location",
  });
  const { data: locationResponse } = useQuery({
    queryKey: ["Location"],
    queryFn: () => getData(locationRoutes.getAll),
    enabled: essentialName === "associateCompany",
  });

  const locationTypeValue = locationTypeResponse?.data?.data.data;

  const locationManagerValue = locationManagerResponse?.data?.data.data;
  const locationValue = locationResponse?.data?.data.data;

  const refetchData = () => {
    // Implement refetch logic if necessary
  };
  // Update filters from AddProject
  const handleFiltersUpdate = (updatedFilters: Record<string, any>) => {
    setFilters(updatedFilters); // Update the filters
    console.log(updatedFilters);
  };
  // Form fields for add/edit modal

  // Define columns for the data table
  let formFields = tableConfig[essentialName];

  if (essentialName === "location" && locationTypeValue) {
    if (locationTypeValue) {
      const locationTypeValues = locationTypeValue.map((locationType: any) => ({
        key: String(locationType._id),
        value: locationType.name,
      }));
      formFields = formFields.map((field: any) =>
        field.key === "locationType"
          ? { ...field, values: locationTypeValues }
          : field
      );
    }
    if (locationManagerValue) {
      const locationManagerValues = locationManagerValue.map(
        (locationManager: any) => ({
          key: String(locationManager._id),
          value: locationManager.name,
        })
      );
      formFields = formFields.map((field: any) =>
        field.key === "locationManager"
          ? { ...field, values: locationManagerValues }
          : field
      );
    }
  }

  if (essentialName === "associateCompany" && locationValue) {
    const locationValues = locationValue.map((location: any) => ({
      key: String(location._id),
      value: location.name,
    }));
    formFields = formFields.map((field: any) =>
      field.key === "location" ? { ...field, values: locationValues } : field
    );
  }
  return (
    <div className="flex items-center justify-center">
      <div className="w-[95%]">
        <div className="my-4">
          <div className="flex items-center justify-between  gap-3">
            {}{" "}
            <AddModal
              currentTable={""}
              formFields={formFields}
              apiEndpoint={apiRoutesByRole[essentialName]}
              refetchData={refetchData}
            />
            {essentialName === "location" && (
              <DynamicFilter
                currentTable={essentialName}
                formFields={formFields}
                onApply={handleFiltersUpdate} // Pass the callback to DynamicFilter
              />
            )}
          </div>{" "}
          <QueryComponent
            api={apiRoutesByRole[essentialName]}
            queryKey={[essentialName, apiRoutesByRole[essentialName], filters]}
            page={1}
            limit={100}
            additionalParams={filters}
          >
            {(data: any) => {
              const fetchedData = data?.data || [];
              // const tableData = fetchedData.map((item: any) => ({
              //   ...item,
              // }));

              const tableData = fetchedData.map((item: any) => {
                const { isDeleted, isActive, password, __v, ...rest } = item;

                if (essentialName === "location") {
                  return {
                    ...rest,

                    locationType: item.locationType.name,
                  };
                  // Handle other user types similarly if needed
                }
                // Handle other user types similarly if needed

                return rest;
              });
              return (
                <>
                  <Spacer y={5} />
                  <CommonTable
                    TableData={tableData}
                    columns={columns}
                    isLoading={false}
                    viewModal={(item: any) => (
                      // Implement view modal if needed
                      <>
                        <DetailsModal
                          currentTable={""}
                          data={item}
                          columns={columns}
                        />
                      </>
                    )}
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
