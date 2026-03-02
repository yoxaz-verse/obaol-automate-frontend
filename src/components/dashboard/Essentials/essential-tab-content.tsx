"use client";
import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

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
import ApproveRejectButtons from "@/components/CurdTable/approve-reject-button";
import TableFrame from "@/components/CurdTable/table-frame";

const EssentialTabContent = ({
  essentialName,
  filter,
  hideAdd,
}: {
  essentialName: string;
  filter?: any;
  hideAdd?: boolean;
}) => {
  const queryClient = useQueryClient();
  const tableConfig = { ...initialTableConfig }; // Create a copy to avoid mutations
  const [filters, setFilters] = React.useState<Record<string, any>>({});

  // ✅ Apply filter only when prop changes
  React.useEffect(() => {
    if (filter) {
      setFilters(filter);
    }
  }, [filter]);

  const columns = generateColumns(essentialName, tableConfig);

  // const { data: stateResponse } = useQuery({
  //   queryKey: ["State"],
  //   queryFn: () => getData(stateRoutes.getAll, { limit: 10000 }),
  //   enabled: essentialName === "associateCompany",
  // });

  const refetchData = () => {
    queryClient.invalidateQueries({ queryKey: [essentialName] });
  };
  // Update filters from AddProject
  const handleFiltersUpdate = (updatedFilters: Record<string, any>) => {
    setFilters(updatedFilters); // Update the filters
  };
  // Form fields for add/edit modal

  // Define columns for the data table
  let formFields = tableConfig[essentialName];

  return (
    <div className="w-full max-w-full min-w-0">
      <div className="min-w-0">
        <div className="my-4">
          <div className="flex items-center justify-between  gap-3">
            {!hideAdd && (
              <AddModal
                currentTable={""}
                formFields={formFields}
                apiEndpoint={apiRoutesByRole[essentialName]}
                refetchData={refetchData}
              />
            )}{" "}
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
                  const locationParts = [
                    item.district?.name,
                    item.state?.name
                  ].filter(Boolean);

                  return {
                    ...rest,
                    location: locationParts.length > 0
                      ? locationParts.join(", ")
                      : "Unknown",
                    companyType: item.companyType?.name || "Not Defined",
                  };
                }
                if (essentialName === "companySubFunction") {
                  return {
                    ...rest,
                    functionName: item.functionId?.name || "Not Defined",
                  };
                }

                if (essentialName === "researchedCompany") {
                  const locationParts = [
                    item.district?.name,
                    item.state?.name
                  ].filter(Boolean);

                  return {
                    ...rest,
                    location: locationParts.length > 0
                      ? locationParts.join(", ")
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
              console.log(tableData);

              return (
                tableData.length > 0 && (
                  <>
                    <Spacer y={5} />
                    <TableFrame>
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
                        otherModal={(item: any) =>
                          essentialName === "researchedCompany" && (
                            <ApproveRejectButtons
                              item={item}
                              refetchData={refetchData}
                            />
                          )
                        }
                      />
                    </TableFrame>
                  </>
                )
              );
            }}
          </QueryComponent>
        </div>
      </div>
    </div>
  );
};

export default EssentialTabContent;
