"use client";

import React, { useContext, useState, useEffect } from "react";
import {
  Tabs,
  Tab,
  Spinner,
  Spacer,
  Select,
  SelectItem,
} from "@nextui-org/react";
import ProjectTabContent from "@/components/dashboard/Projects/all-projects-tab-content";
import { useQuery } from "@tanstack/react-query"; // Assuming react-query is being used
import { getData } from "@/core/api/apiHandler";
import { projectStatusRoutes, locationRoutes } from "@/core/api/apiRoutes"; // Include location API route
import AddProject from "@/components/dashboard/Projects/add-projects";
import { apiRoutesByRole, initialTableConfig } from "@/utils/tableValues";
import AuthContext from "@/context/AuthContext";
import BulkAdd from "@/components/CurdTable/bulk-add";

const refetchData = () => {
  // Implement refetch logic if necessary
};

export default function ProjectsPage() {
  const [currentTable, setCurrentTable] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null); // Manage selected location
  const { user } = useContext(AuthContext); // Get current user from context

  // Fetch project statuses using react-query
  const { data: projectStatusesResponse, isLoading: isStatusesLoading } =
    useQuery({
      queryKey: ["projectStatuses"],
      queryFn: () => getData(projectStatusRoutes.getAll),
    });

  // Fetch locations using react-query
  const { data: locationsResponse, isLoading: isLocationsLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: () => getData(locationRoutes.getAll), // Fetch locations
  });

  const tableConfig = { ...initialTableConfig }; // Create a copy to avoid mutations
  const projectStatuses = projectStatusesResponse?.data?.data?.data;
  const locations = locationsResponse?.data?.data?.data; // Assuming API returns a similar structure
  const current = "projects";

  return (
    <div className="flex justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-6xl">
        <Spacer y={5} />
        {user?.role === "Admin" && (
          <BulkAdd
            apiEndpoint={`${apiRoutesByRole[current]}/bulk`}
            refetchData={refetchData}
            currentTable={"Projects"}
          />
        )}
        <Spacer y={2} />
        <div className="my-4">
          {user?.role === "Admin" && (
            <AddProject
              currentTable={current}
              formFields={tableConfig[current]}
              apiEndpoint={apiRoutesByRole[current]}
              refetchData={refetchData}
            />
          )}
          <div className="my-4 flex justify-end">
            {/* Location Filter */}
            {!isLocationsLoading && locations ? (
              <Select
                name="location"
                label="Filter by Location"
                placeholder="Select Location"
                className="py-2 border rounded-md w-full max-w-sm"
                selectedKeys={
                  selectedLocation ? new Set([selectedLocation]) : new Set()
                }
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0]; // Ensure a single selection
                  if (typeof selectedKey === "string") {
                    setSelectedLocation(selectedKey); // Updates `selectedLocation`
                  }
                }}
              >
                <SelectItem key={""} value={undefined}>
                  All
                </SelectItem>{" "}
                {locations.map((location: { _id: string; name: string }) => (
                  <SelectItem key={location._id} value={location._id}>
                    {location.name}
                  </SelectItem>
                ))}
              </Select>
            ) : (
              <Spinner label="Loading locations" />
            )}
          </div>
          {isStatusesLoading && isLocationsLoading ? (
            <Spinner
              label={`Loading ${current}`}
              color="default"
              labelColor="foreground"
            />
          ) : projectStatuses && projectStatuses.length > 0 ? (
            <Tabs
              aria-label="Project Tabs"
              selectedKey={currentTable || projectStatuses[0]._id}
              onSelectionChange={(key) => setCurrentTable(key as string)}
            >
              <Tab key={null} title="All">
                <ProjectTabContent
                  currentTable={current}
                  tableConfig={tableConfig}
                  user={user}
                  selectedLocation={selectedLocation} // Pass location filter to tab content
                />
              </Tab>

              {projectStatuses.map((status: { _id: string; name: string }) => (
                <Tab key={status._id} title={status.name}>
                  <ProjectTabContent
                    selectedTab={status._id}
                    currentTable={current}
                    tableConfig={tableConfig}
                    user={user}
                    selectedLocation={selectedLocation} // Pass location filter to tab content
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
