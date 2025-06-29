"use client";
import React, { useState } from "react";
import {
  adminRoutes,
  associateCompanyRoutes,
  designationRoutes,
  serviceCompanyRoutes,
} from "@/core/api/apiRoutes";
import QueryComponent from "@/components/queryComponent";
import AddModal from "@/components/CurdTable/add-model";
import CommonTable from "../../CurdTable/common-table";
import { useQuery } from "@tanstack/react-query"; // Import useQuery
import { getData } from "@/core/api/apiHandler"; // Import getData function
import { Spacer } from "@nextui-org/react";
import DeleteModal from "@/components/CurdTable/delete";
import DetailsModal from "@/components/CurdTable/details";
import EditModal from "@/components/CurdTable/edit-model";
import {
  apiRoutesByRole,
  generateColumns,
  initialTableConfig,
} from "@/utils/tableValues";
import DynamicFilter from "@/components/CurdTable/dynamic-filtering";

interface UserTabContentProps {
  currentTable: string;
}

const UserTabContent: React.FC<UserTabContentProps> = ({ currentTable }) => {
  const tableConfig = { ...initialTableConfig }; // Create a copy to avoid mutations
  const columns = generateColumns(currentTable, tableConfig);
  const [filters, setFilters] = useState<Record<string, any>>({}); // Dynamic filters
  const handleFiltersUpdate = (updatedFilters: Record<string, any>) => {
    setFilters(updatedFilters); // Update the filters
  };
  const refetchData = () => {
    // Implement refetch logic if necessary
  };

  return (
    <>
      <QueryComponent
        api={apiRoutesByRole[currentTable]}
        queryKey={[
          currentTable,
          apiRoutesByRole[currentTable],
          filters,
          handleFiltersUpdate,
        ]}
        page={1}
        limit={1000}
        additionalParams={{
          ...filters,
        }}
      >
        {(data: any) => {
          const fetchedData = data?.data || [];
          // Generate formFields with updated values
          let formFields = tableConfig[currentTable];

          const tableData = fetchedData.map((item: any) => {
            const { isDeleted, isActive, password, __v, ...rest } = item;
            if (
              currentTable === "inventoryManager" ||
              currentTable === "projectManager"
            ) {
              return {
                ...rest,
                admin: item.admin ? item.admin.name : "N/A",
              };
            } else if (currentTable === "associate") {
              return {
                ...rest,
                associateCompany: item.associateCompany
                  ? item.associateCompany.name
                  : "N/A",
                designation: item.designation
                  ? item.designation.name
                  : "Unknown",
              };
            }
            // Handle other user types similarly if needed

            return rest;
          });

          return (
            <>
              <div className="flex items-center justify-between">
                {/* AddModal for adding new entries */}
                <AddModal
                  currentTable={currentTable}
                  formFields={formFields} // Pass the updated formFields
                  apiEndpoint={apiRoutesByRole[currentTable]}
                  refetchData={refetchData}
                />
                <DynamicFilter
                  currentTable={currentTable}
                  formFields={tableConfig[currentTable]}
                  onApply={handleFiltersUpdate} // Pass the callback to DynamicFilter
                />{" "}
              </div>
              <Spacer y={5} />
              {tableData.length > 0 ? (
                <CommonTable
                  TableData={tableData}
                  columns={columns}
                  isLoading={false}
                  viewModal={(item: any) => (
                    <DetailsModal
                      currentTable={currentTable}
                      columns={columns}
                      data={item}
                    />
                  )}
                  editModal={(item: any) => (
                    <EditModal
                      _id={item._id}
                      initialData={item}
                      currentTable={currentTable}
                      formFields={formFields}
                      apiEndpoint={apiRoutesByRole[currentTable]} // Assuming API endpoint for update
                      refetchData={refetchData}
                    />
                  )}
                  deleteModal={(item: any) => (
                    <DeleteModal
                      _id={item._id}
                      name={item.name}
                      deleteApiEndpoint={apiRoutesByRole[currentTable]}
                      refetchData={refetchData}
                      useBody={true}
                    />
                  )}
                />
              ) : (
                <div>No data available</div> // Translate
              )}
            </>
          );
        }}
      </QueryComponent>
    </>
  );
};

export default UserTabContent;
