// components/dashboard/Projects/project-tab-content.tsx

import React, { useContext, useMemo } from "react";

import QueryComponent from "@/components/queryComponent";
import { Spacer } from "@nextui-org/react";
import CommonTable from "../Table/common-table";
import DeleteModal from "@/components/Modals/delete";
import {
  apiRoutesByRole,
  generateColumns,
  initialTableConfig,
} from "@/utils/tableValues";
import AuthContext from "@/context/AuthContext";
import Link from "next/link";
import { FiEye } from "react-icons/fi";
import AddActivity from "./add-activity";

interface ActivityTabContentProps {
  currentTable: string;
  projectId?: string;
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
  currentTable,
  projectId,
}) => {
  const tableConfig = { ...initialTableConfig }; // Create a copy to avoid mutations
  const columns = generateColumns(currentTable, tableConfig);
  const { user } = useContext(AuthContext); // Get current user from context

  const refetchData = () => {
    // Implement refetch logic if necessary
  };

  return (
    <QueryComponent
      api={apiRoutesByRole[currentTable]}
      queryKey={[currentTable, apiRoutesByRole[currentTable]]}
      page={1}
      limit={100}
      additionalParams={{ projectId }}
    >
      {(data: any) => {
        const fetchedData = data?.data || [];

        const tableData = fetchedData.map((item: any) => {
          const { isDeleted, isActive, password, __v, ...rest } = item;
          if (currentTable === "activity") {
            return {
              ...rest,
              projectName: item.project ? item.project.name : "N/A",
              adminName: item.admin ? item.admin.name : "N/A",
              managerName: item.manager ? item.manager.name : "N/A",
              customerName: item.customer ? item.customer.name : "N/A",
              projectStatus: item.projectStatus ? item.projectStatus : "N/A",
              projectType: item.projectType ? item.projectType : "N/A",
            };
            // Handle other user types similarly if needed
          }

          return rest;
        });

        return (
          <>
            {/* AddModal for adding new entries */}
            <AddActivity
              currentTable={currentTable}
              formFields={tableConfig[currentTable]} // Pass the updated formFields
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
  );
};
export default ActivityTabContent;
