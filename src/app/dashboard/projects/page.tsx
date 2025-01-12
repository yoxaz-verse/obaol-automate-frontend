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
import { getData, postData } from "@/core/api/apiHandler";
import {
  projectStatusRoutes,
  locationRoutes,
  projectRoutes,
} from "@/core/api/apiRoutes";
import AddProject from "@/components/dashboard/Projects/add-projects";
import { apiRoutesByRole, initialTableConfig } from "@/utils/tableValues";
import AuthContext from "@/context/AuthContext";
import BulkAdd from "@/components/CurdTable/bulk-add";

const refetchData = () => {
  // Implement refetch logic if necessary
};
interface Status {
  _id: string;
  status: string;
  count: number;
}
export default function ProjectsPage() {
  const [currentTable, setCurrentTable] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const { user } = useContext(AuthContext);

  // Fetch project counts by status using the count-by-status API
  const { data: projectCountsResponse, isLoading: isProjectCountsLoading } =
    useQuery({
      queryKey: ["projectCounts", selectedLocation],
      queryFn: () =>
        postData(`${projectRoutes.getAll}/count-by-status`, {
          location: selectedLocation,
        }),
    });

  // Convert object to array
  const projectCounts: Status[] = projectCountsResponse
    ? Object.values(projectCountsResponse.data.data)
    : [];
  console.log(projectCounts);

  // Fetch locations using react-query
  const { data: locationsResponse, isLoading: isLocationsLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: () => getData(locationRoutes.getAll),
  });

  const tableConfig = { ...initialTableConfig };
  const locations = locationsResponse?.data?.data?.data;
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
                  const selectedKey = Array.from(keys)[0];
                  if (typeof selectedKey === "string") {
                    setSelectedLocation(selectedKey);
                  }
                }}
              >
                <SelectItem key={""} value={undefined}>
                  All
                </SelectItem>
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
          {isProjectCountsLoading ? (
            <Spinner
              label={`Loading ${current}`}
              color="default"
              labelColor="foreground"
            />
          ) : projectCounts && projectCounts.length > 0 ? (
            <Tabs
              aria-label="Project Tabs"
              selectedKey={currentTable || null}
              onSelectionChange={(key) => setCurrentTable(key as string)}
            >
              <Tab key={null} title="All">
                <ProjectTabContent
                  currentTable={current}
                  tableConfig={tableConfig}
                  user={user}
                  selectedLocation={selectedLocation}
                />
              </Tab>

              {projectCounts.map(
                (status: { _id: string; status: string; count: number }) => (
                  <Tab
                    key={status._id}
                    title={
                      <div className="flex items-center space-x-2">
                        <span>{status.status}</span>
                        {status.count ? (
                          <Chip size="sm" color="primary">
                            {status.count}
                          </Chip>
                        ) : (
                          ""
                        )}{" "}
                      </div>
                    }
                  >
                    <ProjectTabContent
                      selectedTab={status._id}
                      currentTable={current}
                      tableConfig={tableConfig}
                      user={user}
                      selectedLocation={selectedLocation}
                    />
                  </Tab>
                )
              )}
            </Tabs>
          ) : (
            <p>No project statuses found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
