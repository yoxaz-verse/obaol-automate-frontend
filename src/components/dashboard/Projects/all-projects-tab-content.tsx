// components/dashboard/Projects/project-tab-content.tsx
"use client";

import React, { useContext, useMemo } from "react";
import {
  adminRoutes,
  customerRoutes,
  projectRoutes,
  projectStatusRoutes,
  projectTypeRoutes,
  projectManagerRoutes,
  locationRoutes,
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
import AuthContext from "@/context/AuthContext";
import { FiEye } from "react-icons/fi";
import Link from "next/link";
import AddProject from "./add-projects";

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

// const ProjectTabContents: React.FC<ProjectTabContentProps> = ({
//   currentTable,
// }) => {
//   const tableConfig = { initialTableConfig }; // Create a copy to avoid mutations

//   // Fetch related data for dropdowns
//   const {
//     data: customersResponse,
//     isLoading: isCustomersLoading,
//     isError: isCustomersError,
//   } = useQuery({
//     queryKey: ["customers"],
//     queryFn: () => getData(customerRoutes.getAll),
//   });

//   const {
//     data: adminsResponse,
//     isLoading: isAdminsLoading,
//     isError: isAdminsError,
//   } = useQuery({
//     queryKey: ["admins"],
//     queryFn: () => getData(adminRoutes.getAll),
//   });

//   const {
//     data: managersResponse,
//     isLoading: isManagersLoading,
//     isError: isManagersError,
//   } = useQuery({
//     queryKey: ["managers"],
//     queryFn: () => getData(managerRoutes.getAll),
//   });

//   const {
//     data: projectStatusesResponse,
//     isLoading: isProjectStatusesLoading,
//     isError: isProjectStatusesError,
//   } = useQuery({
//     queryKey: ["projectStatuses"],
//     queryFn: () => getData(projectStatusRoutes.getAll),
//   });

//   // Extract data or set as empty arrays
//   const customers = customersResponse?.data?.data.data;
//   const admins = adminsResponse?.data?.data.data;
//   const managers = managersResponse?.data?.data.data;
//   const projectStatuses = projectStatusesResponse?.data?.data.data;

//   // Populate dropdowns
//   useMemo(() => {
//     if (currentTable === "projects" && projectStatuses) {
//       tableConfig[currentTable] = tableConfig[currentTable].map((field) => {
//         if (field.key === "customer" && admins) {
//           return {
//             ...field,
//             values: customers.map((customer: any) => ({
//               key: customer._id,
//               value: customer.name,
//             })),
//           };
//         }
//         if (field.key === "admin" && admins) {
//           console.log(admins);

//           return {
//             ...field,
//             values: admins.map((admin: any) => ({
//               key: admin._id,
//               value: admin.name,
//             })),
//           };
//         }
//         if (field.key === "manager" && managers) {
//           return {
//             ...field,
//             values: managers.map((manager: any) => ({
//               key: manager._id,
//               value: manager.name,
//             })),
//           };
//         }
//         if (field.key === "status") {
//           return {
//             ...field,
//             values: projectStatuses.map((status: any) => ({
//               key: status._id,
//               value: status.name,
//             })),
//           };
//         }
//         return field;
//       });
//     }
//   }, [currentTable, customers, admins, managers, projectStatuses, tableConfig]);

//   const columns = useMemo(() => {
//     return tableConfig[currentTable]
//       .filter((field) => field.inTable && field.type !== "select")
//       .map((field) => ({
//         name: field.label.toUpperCase(),
//         uid: field.key,
//       }))
//       .concat(
//         currentTable === "projects"
//           ? [
//               { name: "CUSTOMER", uid: "customerName" },
//               { name: "ADMIN", uid: "adminName" },
//               { name: "MANAGER", uid: "managerName" },
//               { name: "STATUS", uid: "statusName" },
//             ]
//           : []
//       );
//   }, [currentTable, tableConfig]);

//   // Handle refetching data if necessary
//   const refetchData = () => {
//     // Implement refetch logic if necessary
//   };

//   // Check if any related data is loading or has errors
//   const isRelatedDataLoading =
//     isCustomersLoading ||
//     isAdminsLoading ||
//     isManagersLoading ||
//     isProjectStatusesLoading;

//   const isRelatedDataError =
//     isCustomersError ||
//     isAdminsError ||
//     isManagersError ||
//     isProjectStatusesError;

//   if (isRelatedDataLoading) {
//     return <div>Loading related data...</div>;
//   }

//   if (isRelatedDataError) {
//     return <div>Failed to load related data.</div>;
//   }

//   return (
//     <>
//       <AddModal
//         currentTable={currentTable}
//         formFields={tableConfig[currentTable]}
//         apiEndpoint={apiRoutesByRole[currentTable]}
//         refetchData={refetchData}
//       />
//       <Spacer y={2} />
//       <QueryComponent
//         api={apiRoutesByRole[currentTable]}
//         queryKey={[currentTable, apiRoutesByRole[currentTable]]}
//         page={1}
//         limit={100}
//       >
//         {(data: any) => {
//           const fetchedData = data?.data || [];

//           const tableData = fetchedData.map((item: any) => {
//             const { isDeleted, isActive, __v, ...rest } = item;

//             return {
//               ...rest,
//               customerName: item.customer ? item.customer.name : "N/A",
//               adminName: item.admin ? item.admin.name : "N/A",
//               managerName: item.manager ? item.manager.name : "N/A",
//               statusName: item.status ? item.status.name : "N/A",
//             };
//           });

//           return (
//             <>
//               {tableData.length > 0 ? (
//                 <CommonTable
//                   TableData={tableData}
//                   columns={columns}
//                   viewModal={(item: any) => <DetailsModal data={item} />}
//                   deleteModal={(item: any) => (
//                     <DeleteModal
//                       _id={item._id}
//                       name={item.title}
//                       deleteApiEndpoint={projectRoutes.delete}
//                       refetchData={refetchData}
//                     />
//                   )}
//                 />
//               ) : (
//                 <div>No data available</div>
//               )}
//             </>
//           );
//         }}
//       </QueryComponent>
//     </>
//   );
// };

const ProjectTabContent: React.FC<ProjectTabContentProps> = ({
  currentTable,
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
    >
      {(data: any) => {
        const fetchedData = data?.data || [];

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
            {/* AddModal for adding new entries */}
            {user?.role === "Admin" && (
              <AddProject
                currentTable={currentTable}
                formFields={tableConfig[currentTable]} // Pass the updated formFields
                apiEndpoint={apiRoutesByRole[currentTable]}
                refetchData={refetchData}
              />
            )}
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
