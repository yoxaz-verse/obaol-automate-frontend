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

import DetailsModal from "@/components/CurdTable/details";
import DynamicFilter from "@/components/CurdTable/dynamic-filtering";
import EditModal from "@/components/CurdTable/edit-model";

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

  // const { data: stateResponse } = useQuery({
  //   queryKey: ["State"],
  //   queryFn: () => getData(stateRoutes.getAll, { limit: 10000 }),
  //   enabled: essentialName === "associateCompany",
  // });

  const refetchData = () => {
    // Implement refetch logic if necessary
  };
  // Update filters from AddProject
  const handleFiltersUpdate = (updatedFilters: Record<string, any>) => {
    setFilters(updatedFilters); // Update the filters
  };
  // Form fields for add/edit modal

  // Define columns for the data table
  let formFields = tableConfig[essentialName];

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
            limit={1000}
            additionalParams={filters}
          >
            {(data: any) => {
              const fetchedData = data?.data || [];
              // const tableData = fetchedData.map((item: any) => ({
              //   ...item,
              // }));


              const tableData = fetchedData.map((item: any) => {
                const { isDeleted, isActive, password, __v, ...rest } = item;
                // Helper function to join array of objects by `name`
                const joinNames = (arr: any[] = []) =>
                  arr.length > 0
                    ? arr.map((x) => x.name).join(", ")
                    : "Not Defined";

                if (essentialName === "associateCompany") {
                  return {
                    ...rest,
                    location: item.state
                      ? item.district.name + ", " + item.state.name
                      : "Unknown",
                    companyType: item.companyType
                      ? item.companyType.name
                      : "Not Defined",
                  };

                  // Handle other user types similarly if needed
                }
                if (essentialName === "researchedCompany") {
                  return {
                    ...rest,
                    location: item.state
                      ? `${item.district?.name || ""}, ${
                          item.state?.name || ""
                        }`
                      : "Unknown",
                    companyType: item.companyType?.name || "Not Defined",
                    companyStage: item.companyStage?.name || "Not Defined",
                    product: joinNames(item.product),
                    certification: joinNames(item.certification),
                    companyBusinessModel: joinNames(item.companyBusinessModel),
                    companyIntent: joinNames(item.companyIntent),
                  };
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
                    editModal={(item: any) => (
                      <EditModal
                        _id={item._id}
                        initialData={item}
                        currentTable={essentialName}
                        formFields={formFields}
                        apiEndpoint={apiRoutesByRole[essentialName]} // Assuming API endpoint for update
                        refetchData={refetchData}
                      />
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
