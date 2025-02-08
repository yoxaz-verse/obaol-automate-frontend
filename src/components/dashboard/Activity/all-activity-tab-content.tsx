// components/dashboard/Projects/project-tab-content.tsx

import React, { useContext, useMemo } from "react";

import QueryComponent from "@/components/queryComponent";
import { Spacer } from "@nextui-org/react";
import CommonTable from "../../CurdTable/common-table";
import DeleteModal from "@/components/CurdTable/delete";
import { apiRoutesByRole, generateColumns } from "@/utils/tableValues";
import { User } from "@/context/AuthContext";
import Link from "next/link";
import { FiEye } from "react-icons/fi";
import StatusUpdate from "@/components/CurdTable/status-update";
import useFilteredStatusOptions from "@/utils/roleActivityStatus";

interface ActivityTabContentProps {
  selectedTab?: string;
  currentTable: string;
  projectId?: string;
  tableConfig: any;
  user?: User | null;
  refetchData: () => void; // Callback to refresh the data
  additionalParams?: Record<string, any>; // Accept additional filters
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
  refetchData,
  additionalParams,
}) => {
  const columns = generateColumns(currentTable, tableConfig);
  const filteredStatusOptions = useFilteredStatusOptions();

  return (
    <QueryComponent
      api={apiRoutesByRole[currentTable]}
      queryKey={[
        currentTable,
        additionalParams,
        filteredStatusOptions,
        apiRoutesByRole[currentTable],
      ]}
      page={1}
      limit={100}
      additionalParams={{ ...additionalParams, projectId, status: selectedTab }}
    >
      {(data: any, refetchData) => {
        const fetchedData = data?.data || [];
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
                otherModal={(item: any) => {
                  const currentStatus = item.status
                    ? {
                        key: item.status._id,
                        label: item.status.name,
                      }
                    : {
                        key: "Unknown",
                        label: "Unknown",
                      };

                  return (
                    filteredStatusOptions && (
                      <StatusUpdate
                        currentEntity="Activity"
                        statusOptions={filteredStatusOptions}
                        apiEndpoint={apiRoutesByRole[currentTable]}
                        recordId={item._id}
                        currentStatus={currentStatus}
                        refetchData={refetchData ?? (() => {})} // ✅ Ensures refetchData is always a function
                      />
                    )
                  );
                }}
                deleteModal={(item: any) => (
                  <DeleteModal
                    _id={item._id}
                    name={item.name}
                    deleteApiEndpoint={apiRoutesByRole[currentTable]}
                    refetchData={refetchData ?? (() => {})} // ✅ Ensures refetchData is always a function
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
  );
};

export default ActivityTabContent;
