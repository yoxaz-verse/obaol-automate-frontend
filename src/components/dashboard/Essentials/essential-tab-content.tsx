// components/ServiceCompany/ServiceCompanyTabContent.tsx
"use client";
import React, { useState, useEffect } from "react";

import QueryComponent from "@/components/queryComponent";
import { Spacer } from "@nextui-org/react";
import { showToastMessage } from "@/utils/utils";
import { serviceCompanyRoutes } from "@/core/api/apiRoutes";
import AddModal from "@/components/CurdTable/add-model";
import UserDeleteModal from "@/components/Modals/delete";
import CommonTable from "@/components/dashboard/Table/common-table";
import {
  apiRoutesByRole,
  generateColumns,
  initialTableConfig,
  useSelectValues,
} from "@/utils/tableValues";

const EssentialTabContent = ({ essentialName }: { essentialName: string }) => {
  const tableConfig = { ...initialTableConfig }; // Create a copy to avoid mutations
  const columns = generateColumns(essentialName, tableConfig);
  const { locationTypes, isLoading: isLocationTypeLoading } = useSelectValues();

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
        {locationTypes && (
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
                const locationTypeValues = locationTypes.map((admin: any) => ({
                  key: String(admin._id),
                  value: admin.name,
                }));
                formFields = formFields.map((field: any) =>
                  field.key === "type"
                    ? { ...field, values: locationTypeValues }
                    : field
                );
                const tableData = fetchedData.map((item: any) => {
                  const { isDeleted, isActive, password, __v, ...rest } = item;
                  if (essentialName === "location") {
                    return {
                      ...rest,
                      locationType: item.locationType
                        ? item.projectType
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
        )}
      </div>
    </div>
  );
};

export default EssentialTabContent;
