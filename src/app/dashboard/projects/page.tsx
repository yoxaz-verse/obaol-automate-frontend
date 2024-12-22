// pages/projects.tsx
"use client";

import React, { useContext, useState } from "react";
import { Tabs, Tab, user, Spinner, Spacer } from "@nextui-org/react";
import ProjectTabContent from "@/components/dashboard/Projects/all-projects-tab-content";
import NewProjectsCharts from "@/components/dashboard/Projects/new-projects-charts";
import { useQuery } from "@tanstack/react-query"; // Assuming react-query is being used
import { getData } from "@/core/api/apiHandler";
import { projectStatusRoutes } from "@/core/api/apiRoutes";
import AddProject from "@/components/dashboard/Projects/add-projects";
import { apiRoutesByRole, initialTableConfig } from "@/utils/tableValues";
import AuthContext from "@/context/AuthContext";
import BulkAdd from "@/components/CurdTable/bulk-add";

const refetchData = () => {
  // Implement refetch logic if necessary
};

export default function ProjectsPage() {
  const [currentTable, setCurrentTable] = useState<string>("");
  const { user } = useContext(AuthContext); // Get current user from context

  // Fetch project statuses using react-query
  const { data: projectStatusesResponse, isLoading } = useQuery({
    queryKey: ["projectStatuses"],
    queryFn: () => getData(projectStatusRoutes.getAll),
  });
  const tableConfig = { ...initialTableConfig }; // Create a copy to avoid mutations
  const projectStatuses = projectStatusesResponse?.data?.data?.data;
  const current = "projects";

  return (
    <div className="flex  justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-6xl">
        {/* <NewProjectsCharts /> */}
        <Spacer y={5} />{" "}
        {user?.role === "Admin" && (
          <BulkAdd
            apiEndpoint={`${apiRoutesByRole[current]}/bulk`}
            refetchData={refetchData} // Function to refetch activities list
            currentTable={"Activities"}
          />
        )}{" "}
        <Spacer y={2} />{" "}
        <div className="my-4">
          {/* AddModal for adding new entries */}
          {user?.role === "Admin" && (
            <AddProject
              currentTable={current}
              formFields={tableConfig[current]} // Pass the updated formFields
              apiEndpoint={apiRoutesByRole[current]}
              refetchData={refetchData}
            />
          )}{" "}
          {isLoading ? (
            <p>
              {" "}
              <Spinner
                label={`loading ${current} `}
                color="default"
                labelColor="foreground"
              />
            </p>
          ) : projectStatuses && projectStatuses.length > 0 ? (
            <Tabs
              aria-label="Project Tabs"
              selectedKey={currentTable || projectStatuses[0]._id} // Default to the first tab if none selected
              onSelectionChange={(key) => setCurrentTable(key as string)}
            >
              <Tab key={null} title="All">
                <ProjectTabContent
                  currentTable={current}
                  tableConfig={tableConfig}
                  user={user}
                />{" "}
              </Tab>

              {projectStatuses.map((status: { _id: string; name: string }) => (
                <Tab key={status._id} title={status.name}>
                  <ProjectTabContent
                    selectedTab={status._id}
                    currentTable={current}
                    tableConfig={tableConfig}
                    user={user}
                  />
                </Tab>
              ))}
            </Tabs>
          ) : (
            <p>No project statuses found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
