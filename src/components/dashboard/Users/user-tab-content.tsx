"use client";
import React from "react";
import {
  adminRoutes,
  managerRoutes,
  customerRoutes,
  workerRoutes,
} from "@/core/api/apiRoutes";
import QueryComponent from "@/components/queryComponent";
import AddModal from "@/components/CurdTable/add-model";
import CommonTable from "../Table/common-table";
import { useQuery } from "@tanstack/react-query"; // Import useQuery
import { getData } from "@/core/api/apiHandler"; // Import getData function
import { Spacer } from "@nextui-org/react";
import DeleteModal from "@/components/Modals/delete";
import DetailsModal from "@/components/Modals/details";
import EditModal from "@/components/CurdTable/edit-model";
import {
  apiRoutesByRole,
  generateColumns,
  initialTableConfig,
} from "@/utils/tableValues";

interface UserTabContentProps {
  currentTable: string;
}

const UserTabContent: React.FC<UserTabContentProps> = ({ currentTable }) => {
  const tableConfig = { ...initialTableConfig }; // Create a copy to avoid mutations
  const columns = generateColumns(currentTable, tableConfig);

  const refetchData = () => {
    // Implement refetch logic if necessary
  };

  // Fetch admin data when currentTable is 'manager'
  const {
    data: adminResponse,
    isLoading: isAdminLoading,
    isError: isAdminError,
  } = useQuery({
    queryKey: ["adminData"],
    queryFn: () => getData(adminRoutes.getAll),
    enabled: currentTable === "manager", // Only fetch when currentTable is 'manager'
  });

  // Extract admin data
  const adminData = adminResponse?.data.data.data || [];

  // Fetch admin data when currentTable is 'manager'
  const { data: managerResponse } = useQuery({
    queryKey: ["managerData"],
    queryFn: () => getData(managerRoutes.getAll),
    enabled: currentTable === "manager", // Only fetch when currentTable is 'manager'
  });

  // Extract manager data
  const managerData = managerResponse?.data.data.data || [];

  return (
    <>
      {isAdminLoading && currentTable === "manager" ? (
        <div>Loading Admin Data...</div>
      ) : isAdminError && currentTable === "manager" ? (
        <div>Failed to load Admin Data</div>
      ) : (
        <QueryComponent
          api={apiRoutesByRole[currentTable]}
          queryKey={[currentTable, apiRoutesByRole[currentTable]]}
          page={1}
          limit={100}
        >
          {(data: any) => {
            const fetchedData = data?.data || [];
            // Generate formFields with updated values
            let formFields = tableConfig[currentTable];
            // Populate related field values dynamically
            if (currentTable === "manager") {
              // Use adminData to populate 'Admin' select options
              const relatedValues = adminData.map((admin: any) => ({
                key: String(admin._id),
                value: admin.name,
              }));
              // Update formFields with relatedValues
              formFields = formFields.map((field: any) =>
                field.key === "admin"
                  ? { ...field, values: relatedValues }
                  : field
              );
            } else if (currentTable === "worker") {
              // You can similarly fetch manager data and populate 'Manager' select options
              const relatedValues = managerData.map((manager: any) => ({
                key: String(manager._id),
                value: manager.name,
              }));
              // Update formFields with relatedValues
              formFields = formFields.map((field: any) =>
                field.key === "manager"
                  ? { ...field, values: relatedValues }
                  : field
              );
            }
            // Handle other user types similarly if needed

            const tableData = fetchedData.map((item: any) => {
              const { isDeleted, isActive, password, __v, ...rest } = item;
              if (currentTable === "manager") {
                return {
                  ...rest,
                  adminName: item.admin ? item.admin.name : "N/A",
                };
              } else if (currentTable === "worker") {
                return {
                  ...rest,
                  managerName: item.manager ? item.manager.name : "N/A",
                };
              }
              // Handle other user types similarly if needed

              return rest;
            });

            return (
              <>
                {/* AddModal for adding new entries */}
                <AddModal
                  currentTable={currentTable}
                  formFields={formFields} // Pass the updated formFields
                  apiEndpoint={apiRoutesByRole[currentTable]}
                  refetchData={refetchData}
                />
                <Spacer y={5} />
                {tableData.length > 0 ? (
                  <CommonTable
                    TableData={tableData}
                    columns={columns}
                    isLoading={false}
                    viewModal={(item: any) => <DetailsModal data={item} />}
                    editModal={(item: any) => (
                      <EditModal
                        initialData={item}
                        currentTable={currentTable}
                        formFields={tableConfig[currentTable]}
                        apiEndpoint={`${apiRoutesByRole[currentTable]}/${item._id}`} // Assuming API endpoint for update
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
                  <div>No data available</div>
                )}
              </>
            );
          }}
        </QueryComponent>
      )}
    </>
  );
};

export default UserTabContent;
