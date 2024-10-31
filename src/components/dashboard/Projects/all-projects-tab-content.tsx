// components/dashboard/Projects/project-tab-content.tsx
"use client";

import React, { useMemo } from "react";
import {
  adminRoutes,
  managerRoutes,
  customerRoutes,
  projectRoutes,
  projectStatusRoutes,
} from "@/core/api/apiRoutes";
import QueryComponent from "@/components/queryComponent";
import { useQuery } from "@tanstack/react-query"; // Import useQuery
import { getData } from "@/core/api/apiHandler"; // Import getData function
import { Spacer } from "@nextui-org/react";
import AddModal from "@/components/CurdTable/add-model";
import CommonTable from "../Table/common-table";
import DeleteModal from "@/components/Modals/delete";
import DetailsModal from "@/components/Modals/details";

interface ProjectTabContentProps {
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

const initialTableConfig: Record<string, FormField[]> = {
  projects: [
    { label: "Title", type: "text", key: "title", inForm: true, inTable: true },
    {
      label: "Description",
      type: "textarea",
      key: "description",
      inForm: true,
      inTable: true,
    },
    {
      label: "Custom ID",
      type: "text",
      key: "customId",
      inForm: false,
      inTable: true,
    },
    {
      label: "Budget",
      type: "text",
      key: "budget",
      inForm: true,
      inTable: true,
    },
    {
      label: "Customer",
      type: "select",
      key: "customer",
      values: [],
      inForm: true,
      inTable: true,
    },
    {
      label: "Admin",
      type: "select",
      key: "admin",
      values: [],
      inForm: true,
      inTable: true,
    },
    {
      label: "Manager",
      type: "select",
      key: "manager",
      values: [],
      inForm: true,
      inTable: true,
    },
    {
      label: "Status",
      type: "select",
      key: "status",
      values: [],
      inForm: true,
      inTable: true,
    },
    {
      label: "Created At",
      type: "text",
      key: "createdAt",
      inForm: false,
      inTable: true,
    },
    {
      label: "Actions",
      type: "action",
      key: "actions2",
      inForm: false,
      inTable: true,
    },
  ],
  // Add more configurations if needed
};

// Mapping roles to their API endpoints
const apiRoutesByRole: Record<string, string> = {
  projects: projectRoutes.getAll,
};

const ProjectTabContent: React.FC<ProjectTabContentProps> = ({
  currentTable,
}) => {
  const tableConfig = { ...initialTableConfig }; // Create a copy to avoid mutations

  // Fetch related data for dropdowns
  const {
    data: customersResponse,
    isLoading: isCustomersLoading,
    isError: isCustomersError,
  } = useQuery({
    queryKey: ["customers"],
    queryFn: () => getData(customerRoutes.getAll),
  });

  const {
    data: adminsResponse,
    isLoading: isAdminsLoading,
    isError: isAdminsError,
  } = useQuery({
    queryKey: ["admins"],
    queryFn: () => getData(adminRoutes.getAll),
  });

  const {
    data: managersResponse,
    isLoading: isManagersLoading,
    isError: isManagersError,
  } = useQuery({
    queryKey: ["managers"],
    queryFn: () => getData(managerRoutes.getAll),
  });

  const {
    data: projectStatusesResponse,
    isLoading: isProjectStatusesLoading,
    isError: isProjectStatusesError,
  } = useQuery({
    queryKey: ["projectStatuses"],
    queryFn: () => getData(projectStatusRoutes.getAll),
  });

  // Extract data or set as empty arrays
  const customers = customersResponse?.data?.data.data;
  const admins = adminsResponse?.data?.data.data;
  const managers = managersResponse?.data?.data.data;
  const projectStatuses = projectStatusesResponse?.data?.data.data;

  // Populate dropdowns
  useMemo(() => {
    if (currentTable === "projects" && projectStatuses) {
      tableConfig[currentTable] = tableConfig[currentTable].map((field) => {
        if (field.key === "customer" && admins) {
          return {
            ...field,
            values: customers.map((customer: any) => ({
              key: customer._id,
              value: customer.name,
            })),
          };
        }
        if (field.key === "admin" && admins) {
          console.log(admins);

          return {
            ...field,
            values: admins.map((admin: any) => ({
              key: admin._id,
              value: admin.name,
            })),
          };
        }
        if (field.key === "manager" && managers) {
          return {
            ...field,
            values: managers.map((manager: any) => ({
              key: manager._id,
              value: manager.name,
            })),
          };
        }
        if (field.key === "status") {
          return {
            ...field,
            values: projectStatuses.map((status: any) => ({
              key: status._id,
              value: status.name,
            })),
          };
        }
        return field;
      });
    }
  }, [currentTable, customers, admins, managers, projectStatuses, tableConfig]);

  const columns = useMemo(() => {
    return tableConfig[currentTable]
      .filter((field) => field.inTable && field.type !== "select")
      .map((field) => ({
        name: field.label.toUpperCase(),
        uid: field.key,
      }))
      .concat(
        currentTable === "projects"
          ? [
              { name: "CUSTOMER", uid: "customerName" },
              { name: "ADMIN", uid: "adminName" },
              { name: "MANAGER", uid: "managerName" },
              { name: "STATUS", uid: "statusName" },
            ]
          : []
      );
  }, [currentTable, tableConfig]);

  // Handle refetching data if necessary
  const refetchData = () => {
    // Implement refetch logic if necessary
  };

  // Check if any related data is loading or has errors
  const isRelatedDataLoading =
    isCustomersLoading ||
    isAdminsLoading ||
    isManagersLoading ||
    isProjectStatusesLoading;

  const isRelatedDataError =
    isCustomersError ||
    isAdminsError ||
    isManagersError ||
    isProjectStatusesError;

  if (isRelatedDataLoading) {
    return <div>Loading related data...</div>;
  }

  if (isRelatedDataError) {
    return <div>Failed to load related data.</div>;
  }

  return (
    <>
      <AddModal
        currentTable={currentTable}
        formFields={tableConfig[currentTable]}
        apiEndpoint={apiRoutesByRole[currentTable]}
        refetchData={refetchData}
      />
      <Spacer y={2} />
      <QueryComponent
        api={apiRoutesByRole[currentTable]}
        queryKey={[currentTable, apiRoutesByRole[currentTable]]}
        page={1}
        limit={100}
      >
        {(data: any) => {
          const fetchedData = data?.data || [];

          const tableData = fetchedData.map((item: any) => {
            const { isDeleted, isActive, __v, ...rest } = item;

            return {
              ...rest,
              customerName: item.customer ? item.customer.name : "N/A",
              adminName: item.admin ? item.admin.name : "N/A",
              managerName: item.manager ? item.manager.name : "N/A",
              statusName: item.status ? item.status.name : "N/A",
            };
          });

          return (
            <>
              {tableData.length > 0 ? (
                <CommonTable
                  TableData={tableData}
                  columns={columns}
                  viewModal={(item: any) => <DetailsModal data={item} />}
                  deleteModal={(item: any) => (
                    <DeleteModal
                      _id={item._id}
                      name={item.title}
                      deleteApiEndpoint={projectRoutes.delete}
                      refetchData={refetchData}
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
    </>
  );
};

export default ProjectTabContent;
