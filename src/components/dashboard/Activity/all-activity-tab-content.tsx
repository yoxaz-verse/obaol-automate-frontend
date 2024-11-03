// components/dashboard/Projects/project-tab-content.tsx
"use client";

import React, { useMemo } from "react";
import {
  adminRoutes,
  managerRoutes,
  customerRoutes,
  projectRoutes,
  projectStatusRoutes,
  projectTypeRoutes,
  activityRoutes,
  activityTypeRoutes,
  activityStatusRoutes,
  workerRoutes,
} from "@/core/api/apiRoutes";
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

interface ActivityTabContentProps {
  currentTable: string;
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
}) => {
  const tableConfig = { ...initialTableConfig }; // Create a copy to avoid mutations
  const columns = generateColumns(currentTable, tableConfig);

  const refetchData = () => {
    // Implement refetch logic if necessary
  };

  // Fetch related data for dropdowns
  const {
    data: projectsResponse,
    isLoading: isProjectsLoading,
    isError: isProjectsError,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: () => getData(apiRoutesByRole["project"]),
  });

  // Fetch related data for dropdowns
  const {
    data: customersResponse,
    isLoading: isCustomersLoading,
    isError: isCustomersError,
  } = useQuery({
    queryKey: ["customers"],
    queryFn: () => getData(apiRoutesByRole["customer"]),
  });

  const {
    data: adminsResponse,
    isLoading: isAdminsLoading,
    isError: isAdminsError,
  } = useQuery({
    queryKey: ["admins"],
    queryFn: () => getData(apiRoutesByRole["admin"]),
  });

  const {
    data: managersResponse,
    isLoading: isManagersLoading,
    isError: isManagersError,
  } = useQuery({
    queryKey: ["managers"],
    queryFn: () => getData(apiRoutesByRole["manager"]),
  });

  const {
    data: activityStatusesResponse,
    isLoading: isActivityStatusesLoading,
    isError: isActivityStatusesError,
  } = useQuery({
    queryKey: ["ActivityStatuses"],
    queryFn: () => getData(apiRoutesByRole["activityStatus"]),
  });

  const {
    data: activityTypeResponse,
    isLoading: isActivityTypeLoading,
    isError: isActivityTypeError,
  } = useQuery({
    queryKey: ["ActivityType"],
    queryFn: () => getData(apiRoutesByRole["activityType"]),
  });

  const {
    data: workersResponse,
    isLoading: isworkerLoading,
    isError: isworkerError,
  } = useQuery({
    queryKey: ["workerType"],
    queryFn: () => getData(apiRoutesByRole["worker"]),
  });

  console.log(workersResponse);
  // Extract data or set as empty arrays
  const customers = customersResponse?.data.data.data;
  const workers = workersResponse?.data.data.data;
  const admins = adminsResponse?.data?.data.data;
  const managers = managersResponse?.data?.data.data;
  const activityStatuses = activityStatusesResponse?.data?.data.data;
  const activityType = activityTypeResponse?.data?.data.data;
  const projects = projectsResponse?.data?.data.data;

  return (
    <>
      {customers &&
      managers &&
      activityStatuses &&
      activityType &&
      workers &&
      // isAdminsLoading &&
      admins ? (
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
            //Project
            const projectValues = projects.map((project: any) => ({
              key: String(project._id),
              value: project.title,
            }));
            formFields = formFields.map((field: any) =>
              field.key === "project"
                ? { ...field, values: projectValues }
                : field
            );
            //Customer
            const customerValues = customers.map((customer: any) => ({
              key: String(customer._id),
              value: customer.name,
            }));
            formFields = formFields.map((field: any) =>
              field.key === "customer"
                ? { ...field, values: customerValues }
                : field
            );
            //Worker
            const workerValues = workers.map((worker: any) => ({
              key: String(worker._id),
              value: worker.name,
            }));
            formFields = formFields.map((field: any) =>
              field.key === "worker"
                ? { ...field, values: workerValues }
                : field
            );
            //Admin
            const adminValues = admins.map((admin: any) => ({
              key: String(admin._id),
              value: admin.name,
            }));
            formFields = formFields.map((field: any) =>
              field.key === "admin" ? { ...field, values: adminValues } : field
            );
            //Manager
            const managerValues = managers.map((manager: any) => ({
              key: String(manager._id),
              value: manager.name,
            }));
            formFields = formFields.map((field: any) =>
              field.key === "manager"
                ? { ...field, values: managerValues }
                : field
            );
            //Activity Status
            const activityStatusValues = activityStatuses.map(
              (status: any) => ({
                key: String(status._id),
                value: status.name,
              })
            );

            formFields = formFields.map((field: any) =>
              field.key === "status"
                ? { ...field, values: activityStatusValues }
                : field
            );
            //Activity Type
            const activityTypeValues = activityType.map((type: any) => ({
              key: String(type._id),
              value: type.name,
            }));

            formFields = formFields.map((field: any) =>
              field.key === "type"
                ? { ...field, values: activityTypeValues }
                : field
            );

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
      ) : (
        "Loading"
      )}{" "}
    </>
  );
};
export default ActivityTabContent;
