// components/dashboard/Projects/project-tab-content.tsx
"use client";

import React, { useEffect, useMemo } from "react";
import QueryComponent from "@/components/queryComponent";
import { Spacer } from "@nextui-org/react";
import CommonTable from "../../CurdTable/common-table";
import DeleteModal from "@/components/CurdTable/delete";
import {
  apiRoutesByRole,
  generateColumns,
  initialTableConfig,
} from "@/utils/tableValues";
import { FiEye } from "react-icons/fi";
import Link from "next/link";
import { getData } from "@/core/api/apiHandler";
import { projectStatusRoutes } from "@/core/api/apiRoutes";
import { useQuery } from "@tanstack/react-query";
import StatusUpdate from "@/components/CurdTable/status-update";

interface ProjectTabContentProps {
  selectedTab?: string;
  currentTable: string;
  tableConfig: any;
  user: any;
  additionalParams?: Record<string, any>; // Accept additional filters
}

interface Option {
  key: string;
  value: string;
}

const ProjectTabContent: React.FC<ProjectTabContentProps> = ({
  selectedTab,
  currentTable,
  tableConfig,
  user,
  additionalParams = {},
}) => {
  const columns = generateColumns(currentTable, tableConfig);

  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ["projectStatuses"],
    queryFn: () => getData(projectStatusRoutes.getAll),
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
      queryKey={[
        currentTable,
        selectedTab,
        additionalParams,
        apiRoutesByRole[currentTable],
      ]}
      page={1}
      limit={100}
      additionalParams={{
        ...additionalParams,
        status: selectedTab,
      }}
    >
      {(data: any, refetch) => {
        const fetchedData = data?.data || [];
        const refetchData = () => {
          refetch?.(); // Safely call refetch if it's available
        };
        const tableData = fetchedData.map((item: any) => {
          const { isDeleted, isActive, password, __v, ...rest } = item;
          if (currentTable === "projects") {
            return {
              ...rest,
              // adminName: item.admin ? item.admin.name : "N/A",
              projectManagerName: item.projectManager
                ? item.projectManager.name
                : "N/A",
              customerName: item.customer ? item.customer.name : "N/A",
              projectStatus: item.status ? item.status.name : "N/A",
              projectType: item.type ? item.type.name : "N/A",
              location: item.location ? item.location.name : "N/A",
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
                    <Link href={`/dashboard/projects/${item._id}`}>
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
                //  otherModal={(item: any) => {
                //   return (
                //     <StatusUpdate
                //       currentEntity="Activity"
                //       statusOptions={statusOptions}
                //       apiEndpoint={apiRoutesByRole[currentTable]}
                //       recordId={item._id}
                //       currentStatus={item.status._id}
                //       refetchData={refetchData}
                //     />
                //   );
                // }}
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
export default ProjectTabContent;
