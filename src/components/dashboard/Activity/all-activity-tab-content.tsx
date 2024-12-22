// components/dashboard/Projects/project-tab-content.tsx

import React, { useContext, useMemo } from "react";

import QueryComponent from "@/components/queryComponent";
import { Spacer } from "@nextui-org/react";
import CommonTable from "../../CurdTable/common-table";
import DeleteModal from "@/components/CurdTable/delete";
import {
  apiRoutesByRole,
  generateColumns,
  initialTableConfig,
} from "@/utils/tableValues";
import AuthContext, { User } from "@/context/AuthContext";
import Link from "next/link";
import { FiEye } from "react-icons/fi";
import AddActivity from "./add-activity";
import StatusUpdate from "@/components/CurdTable/status-update";
import { getData } from "@/core/api/apiHandler";
import { useQuery } from "@tanstack/react-query";
import { activityStatusRoutes } from "@/core/api/apiRoutes";

interface ActivityTabContentProps {
  selectedTab?: string;
  currentTable: string;
  projectId?: string;
  tableConfig: any;
  user?: User | null;
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

const ActivityTabContent: React.FC<ActivityTabContentProps> = ({
  selectedTab,
  currentTable,
  projectId,
  tableConfig,
  user,
}) => {
  const columns = generateColumns(currentTable, tableConfig);
  // Fetch available activity statuses
  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ["activityStatuses"],
    queryFn: () => getData(activityStatusRoutes.getAll),
  });

  const statusOptions = useMemo(() => {
    if (statusData?.data.data.data) {
      return statusData.data.data.data.map((status: any) => ({
        key: status._id,
        label: status.name,
      }));
    }
    return [];
  }, [statusData]);

  return (
    <QueryComponent
      api={apiRoutesByRole[currentTable]}
      queryKey={[currentTable, apiRoutesByRole[currentTable]]}
      page={1}
      limit={100}
      additionalParams={{ projectId, status: selectedTab }}
    >
      {(data: any, refetch) => {
        const fetchedData = data?.data || [];
        const refetchData = () => {
          refetch?.(); // Trigger refetch when needed
        };

        const tableData = fetchedData.map((item: any) => {
          const { isDeleted, isActive, password, __v, ...rest } = item;

          if (currentTable === "activity") {
            return {
              ...rest,
              activityManagerName: item.activityManager
                ? item.activityManager.name
                : "N/A",
              customerName: item.customer ? item.customer.name : "N/A",
              activityStatus: item.status ? item.status.name : "N/A",
              activityType: item.type ? item.type.name : "N/A",
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

                otherModal={(item: any) => {
                  const currentStatus = item.status
                    ? {
                        key: item.status._id, // Use the status ID as the key
                        label: item.status.name, // Use the status name as the label
                      }
                    : {
                        key: "Unknown",
                        label: "Unknown",
                      };

                  // Dynamically filter status options based on user roles
                  const filteredStatusOptions = statusOptions.filter(
                    (tab: any) => {
                      if (user?.role === "Worker") {
                        // Exclude "Approved" and "Rejected" for Workers
                        return tab.key === "6751760121b483f14e02b7fa";
                      }
                      if (
                        user?.role === "Admin" ||
                        user?.role === "ProjectManager"
                      ) {
                        // Exclude "Approved" and "Rejected" for Workers
                        return (
                          tab.key === "6751760121b483f14e02b7fa" ||
                          tab.key === "6751778921b483f14e02b83a" ||
                          tab.key === "6751778921b483f14e02b83a" ||
                          tab.key === "6751781121b483f14e02b840" ||
                          tab.key === "6751781e21b483f14e02b842" ||
                          tab.key === "6751777221b483f14e02b838"
                        );
                      }
                      if (user?.role === "ActivityManager") {
                        // Exclude "Approved" and "Rejected" for Workers
                        return (
                          tab.key === "6751760121b483f14e02b7fa" ||
                          tab.key === "6751778921b483f14e02b83a" ||
                          tab.key === "6751778921b483f14e02b83a" ||
                          tab.key === "6751781121b483f14e02b840"
                        );
                      }
                      return false; // Allow all statuses for other roles
                    }
                  );

                  return (
                    filteredStatusOptions && (
                      <StatusUpdate
                        currentEntity="Activity"
                        statusOptions={filteredStatusOptions}
                        apiEndpoint={apiRoutesByRole[currentTable]}
                        recordId={item._id}
                        currentStatus={currentStatus}
                        refetchData={refetchData}
                      />
                    )
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
  );
};
export default ActivityTabContent;
