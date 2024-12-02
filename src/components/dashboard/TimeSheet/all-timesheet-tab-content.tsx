// components/dashboard/Projects/project-tab-content.tsx
"use client";

import React, { useContext, useMemo } from "react";
import QueryComponent from "@/components/queryComponent";
import { useQuery } from "@tanstack/react-query"; // Import useQuery
import { getData } from "@/core/api/apiHandler"; // Import getData function
import { Spacer } from "@nextui-org/react";
import AddModal from "@/components/CurdTable/add-model";
import CommonTable from "../Table/common-table";
import DeleteModal from "@/components/Modals/delete";
import DetailsModal from "@/components/Modals/details";
import {
  apiRoutesByRole,
  generateColumns,
  initialTableConfig,
} from "@/utils/tableValues";
import EditModal from "@/components/CurdTable/edit-model";
import AuthContext from "@/context/AuthContext";
import Link from "next/link";
import { FiEye } from "react-icons/fi";

interface TimeSheetTabContentProps {
  currentTable: string;
  activityId?: string;
}

interface Option {
  key: string;
  value: string;
}

interface FormField {
  label: string;
  type: string;
  key: string;
  inForm: boolean;
  inTable: boolean;
  values?: Option[];
  accept?: string;
  multiple?: boolean;
}

const TimeSheetTabContent: React.FC<TimeSheetTabContentProps> = ({
  currentTable = "timeSheet",
  activityId,
}) => {
  const tableConfig = { ...initialTableConfig }; // Create a copy to avoid mutations
  const columns = generateColumns(currentTable, tableConfig);
  const { user } = useContext(AuthContext); // Get current user from context

  const refetchData = () => {
    // Implement refetch logic if necessary
  };

  return (
    <>
      {
        <QueryComponent
          api={apiRoutesByRole[currentTable]}
          queryKey={[currentTable, apiRoutesByRole[currentTable]]}
          page={1}
          limit={100}
          additionalParams={{ activityId }}
        >
          {(data: any) => {
            const fetchedData = data?.data || [];
            // Generate formFields with updated values
            let formFields = tableConfig[currentTable];

            const tableData = fetchedData.map((item: any) => {
              const { isDeleted, isActive, password, __v, ...rest } = item;
              if (currentTable === "activity") {
                return {
                  ...rest,
                  projectName: item.project ? item.project.name : "N/A",
                  adminName: item.admin ? item.admin.name : "N/A",
                  managerName: item.manager ? item.manager.name : "N/A",
                  customerName: item.customer ? item.customer.name : "N/A",
                  projectStatus: item.projectStatus
                    ? item.projectStatus
                    : "N/A",
                  projectType: item.projectType ? item.projectType : "N/A",
                };
                // Handle other user types similarly if needed
              }
              return rest;
            });

            return (
              <>
                {/* AddModal for adding new entries */}
                <AddModal
                  currentTable={currentTable}
                  formFields={formFields} // Pass the updated formFields
                  apiEndpoint={`${apiRoutesByRole[currentTable]}`}
                  refetchData={refetchData}
                  additionalVariable={{ activity: activityId }}
                />
                <Spacer y={5} />
                {tableData.length > 0 ? (
                  <CommonTable
                    TableData={tableData}
                    columns={columns}
                    isLoading={false}
                    viewModal={(item: any) => (
                      <div>
                        <Link href={`/dashboard/activity/${item._id}`}>
                          <FiEye className="cursor-pointer" />
                        </Link>
                      </div>
                    )}
                    // editModal={(item: any) => (
                    //   <EditModal
                    //     initialData={item}
                    //     currentTable={currentTable}
                    //     formFields={tableConfig[currentTable]}
                    //     apiEndpoint={`${apiRoutesByRole[currentTable]}/${item._id}`} // Assuming API endpoint for update
                    //     refetchData={refetchData}
                    //   />
                    // )}
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
      }{" "}
    </>
  );
};
export default TimeSheetTabContent;
