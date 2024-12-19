// components/dashboard/Projects/project-tab-content.tsx
"use client";

import React, { useContext, useMemo } from "react";
import QueryComponent from "@/components/queryComponent";
import { Spacer } from "@nextui-org/react";
import AddModal from "@/components/CurdTable/add-model";
import CommonTable from "../../CurdTable/common-table";
import DeleteModal from "@/components/CurdTable/delete";
import {
  apiRoutesByRole,
  generateColumns,
  initialTableConfig,
} from "@/utils/tableValues";
import AuthContext from "@/context/AuthContext";
import DetailsModal from "@/components/CurdTable/details";
import StatusUpdate from "@/components/CurdTable/status-update";

interface TimeSheetTabContentProps {
  currentTable: string;
  activityId?: string;
  isMode?: string | null;
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
const tabs = [
  { key: "isPending", label: "Pending" },
  { key: "isAccepted", label: "Accepted" },
  { key: "isResubmitted", label: "Resubmitted" },
  { key: "isRejected", label: "Rejected" },
  // Add more tabs if needed, e.g., "Archived Projects"
];
const TimeSheetTabContent: React.FC<TimeSheetTabContentProps> = ({
  currentTable = "timeSheet",
  activityId,
  isMode,
}) => {
  const tableConfig = { ...initialTableConfig }; // Create a copy to avoid mutations
  const columns = generateColumns(currentTable, tableConfig);
  const { user } = useContext(AuthContext); // Get current user from context

  return (
    <>
      {
        <QueryComponent
          api={apiRoutesByRole[currentTable]}
          queryKey={[currentTable, apiRoutesByRole[currentTable]]}
          page={1}
          limit={100}
          additionalParams={{ activityId, isMode }}
        >
          {(data: any, refetch) => {
            const fetchedData = data?.data || [];
            // Generate formFields with updated values
            const refetchData = () => {
              refetch?.(); // Safely call refetch if it's available
            };

            const tableData = fetchedData.map((item: any) => {
              const { isDeleted, isActive, password, __v, ...rest } = item;
              if (currentTable === "timeSheet") {
                return {
                  ...rest,
                };
                // Handle other user types similarly if needed
              }
              return rest;
            });

            return (
              <>
                <Spacer y={5} />
                {tableData.length > 0 ? (
                  <CommonTable
                    TableData={tableData}
                    columns={columns}
                    isLoading={false}
                    // viewModal={(item: any) => (
                    //   <DetailsModal columns={columns} data={item} />
                    // )}
                    // editModal={(item: any) => (
                    //   <EditModal
                    //     initialData={item}
                    //     currentTable={currentTable}
                    //     formFields={tableConfig[currentTable]}
                    //     apiEndpoint={`${apiRoutesByRole[currentTable]}/${item._id}`} // Assuming API endpoint for update
                    //     refetchData={refetchData}
                    //   />
                    // )}
                    otherModal={(item: any) => {
                      // Determine the current status dynamically
                      const currentStatus =
                        tabs.find((tab) => item[tab.key])?.key || "Unknown";

                      return (
                        <StatusUpdate
                          currentEntity="Time Sheet"
                          statusOptions={tabs}
                          apiEndpoint={apiRoutesByRole[currentTable]}
                          recordId={item._id}
                          currentStatus={currentStatus}
                          refetchData={refetchData}
                        />
                      );
                    }}
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
