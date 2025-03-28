"use client";
import React from "react";
import {
  adminRoutes,
  associateCompanyRoutes,
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
    enabled:
      currentTable === "inventoryManager" || currentTable === "projectManager", // Only fetch when currentTable is 'manager'
  });

  // Extract admin data
  const adminData = adminResponse?.data.data.data || [];

  // Fetch admin data when currentTable is 'serviceCompany'
  const { data: associateCompanyResponse } = useQuery({
    queryKey: ["associateCompany"],
    queryFn: () => getData(associateCompanyRoutes.getAll),
    enabled: currentTable === "associate", // Only fetch when currentTable is 'associateCompany'
  });

  // Extract associateCompany data
  const associateCompanyData = associateCompanyResponse?.data.data.data || [];

  return (
    <>
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
          if (
            currentTable === "inventoryManager" ||
            currentTable === "projectManager"
          ) {
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
          } else if (currentTable === "associate") {
            // You can similarly fetch manager data and populate 'Manager' select options
            const relatedValues = associateCompanyData.map(
              (associateCompany: any) => ({
                key: String(associateCompany._id),
                value: associateCompany.name,
              })
            );
            // Update formFields with relatedValues
            formFields = formFields.map((field: any) =>
              field.key === "associateCompany"
                ? { ...field, values: relatedValues }
                : field
            );
          }
          // Handle other user types similarly if needed

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
            } else if (currentTable === "worker") {
              return {
                ...rest,
                associateCompany: item.associateCompany
                  ? item.associateCompany.name
                  : "N/A",
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
