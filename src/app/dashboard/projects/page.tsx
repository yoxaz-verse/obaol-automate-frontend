"use client";

import React, { useContext, useState } from "react";
import {
  Tabs,
  Tab,
  Spinner,
  Spacer,
  Select,
  SelectItem,
  Chip,
} from "@nextui-org/react";
import ProjectTabContent from "@/components/dashboard/Projects/all-projects-tab-content";
import { useQuery } from "@tanstack/react-query";
import { postData } from "@/core/api/apiHandler";
import { projectRoutes } from "@/core/api/apiRoutes";
import AddProject from "@/components/dashboard/Projects/add-projects";
import { apiRoutesByRole, initialTableConfig } from "@/utils/tableValues";
import AuthContext from "@/context/AuthContext";
import BulkAdd from "@/components/CurdTable/bulk-add";
import { Status } from "@/data/interface-data";

export default function ProjectsPage() {
  const [currentTable, setCurrentTable] = useState<string>(""); // For tabs
  const [filters, setFilters] = useState<Record<string, any>>({}); // Dynamic filters
  const { user } = useContext(AuthContext);

  // Fetch project counts by status using the count-by-status API
  const { data: projectCountsResponse, isLoading: isProjectCountsLoading } =
    useQuery({
      queryKey: ["projectCounts", filters], // Include filters in queryKey
      queryFn: async () => {
        console.log("Fetching project counts with filters:", filters); // Debugging filters
        const response = await postData(
          `${projectRoutes.getAll}/count-by-status`,
          {
            filters, // Pass filters to the API
          }
        );
        return response;
      },
      staleTime: 5000, // Optional: Cache for 5 seconds
    });

  // Convert object to array for easier rendering
  const projectCounts: Status[] = projectCountsResponse
    ? Object.values(projectCountsResponse?.data?.data || [])
    : [];

  const tableConfig = { ...initialTableConfig };
  const current = "projects";

  // Update filters from AddProject
  const handleFiltersUpdate = (updatedFilters: Record<string, any>) => {
    setFilters(updatedFilters); // Update the filters
  };

  return (
    <div className="flex justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-6xl">
        <Spacer y={5} />
        {user?.role === "Admin" && (
          <BulkAdd
            apiEndpoint={`${apiRoutesByRole[current]}/bulk`}
            refetchData={() => {}} // Placeholder for refetch logic if needed
            currentTable={"Projects"} // Translate
          />
        )}
        <Spacer y={2} />
        <div className="my-4">
            <AddProject
              currentTable={current}
              formFields={tableConfig[current]}
              apiEndpoint={apiRoutesByRole[current]}
              refetchData={() => {}} // Placeholder for refetch logic if needed
              role={user?.role}
              onFiltersUpdate={handleFiltersUpdate} // Pass callback to AddProject
            />
          {isProjectCountsLoading ? (
            <Spinner
              label={`Loading ${current}`} // Translate
              color="default"
              labelColor="foreground"
            />
          ) : projectCounts && projectCounts.length > 0 ? (
            <Tabs
              aria-label="Project Tabs" // Translate
              selectedKey={currentTable || null}
              onSelectionChange={(key) => setCurrentTable(key as string)}
            >
              <Tab key={null} title="All">
                <ProjectTabContent
                  currentTable={current}
                  tableConfig={tableConfig}
                  user={user}
                  additionalParams={filters} // Pass filters to ProjectTabContent
                />
              </Tab>

              {projectCounts.map(
                (status: { _id: string; status: string; count: number }) => (
                  <Tab
                    key={status._id}
                    title={
                      <div className="flex items-center space-x-2">
                        <span>{status.status}</span>
                        {status.count > 0 &&
                        Object.keys(filters).length === 0 ? (
                          <Chip size="sm" color="primary">
                            {status.count}
                          </Chip>
                        ) : (
                          ""
                        )}
                      </div>
                    }
                  >
                    <ProjectTabContent
                      selectedTab={status._id}
                      currentTable={current}
                      tableConfig={tableConfig}
                      user={user}
                      additionalParams={filters} // Pass filters to ProjectTabContent
                    />
                  </Tab>
                )
              )}
            </Tabs>
          ) : (
            <p>No project statuses found.</p> // Translate
          )}
        </div>
      </div>
    </div>
  );
}
