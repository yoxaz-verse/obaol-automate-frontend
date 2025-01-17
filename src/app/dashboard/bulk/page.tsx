// pages/locations.tsx
"use client";

import React from "react";
import { Tabs, Tab, Spacer } from "@nextui-org/react";
import Title from "@/components/titles";
import EssentialTabContent from "@/components/dashboard/Essentials/essential-tab-content";
import BulkAdd from "@/components/CurdTable/bulk-add";
import { locationRoutes } from "@/core/api/apiRoutes";
import { apiRoutesByRole } from "@/utils/tableValues";

export default function Essentials() {
  const [locationTab, setLocationTab] = React.useState("location");
  const [activityTab, setActivityTab] = React.useState("activityStatus");
  const [projectTab, setProjectTab] = React.useState("projectStatus");

  // Define static tabs
  const projectTabs = [
    { key: "projectStatus", title: "Project Status" },
    { key: "projectType", title: "Project Types" },
  ];

  // Define static tabs
  const activityTabs = [
    { key: "activityStatus", title: "Activity Status" },
    { key: "activityType", title: "Activity Types" },
  ];

  const locationTabs = [
    { key: "location", title: "Location" },
    { key: "locationManager", title: "Location Managers" },
    { key: "locationType", title: "Location Types" },
  ];

  // Optionally, add dynamic tabs based on fetched data
  // For example, if ProjectStatus or ActivityStatus have sub-categories
  // For simplicity, we'll stick to static tabs in this example
  const refetchData = () => {
    // Implement refetch logic if necessary
  };

  return (
    <div className="flex items-center justify-center">
      <div className="w-[95%]">
        <div className="my-4">
          <Title title="Project" />{" "}
          <BulkAdd
            apiEndpoint={`${apiRoutesByRole["projects"]}/bulk`}
            refetchData={refetchData}
            currentTable={"Projects"}
          />
          <Spacer y={12} />
          <Title title="Activity" />
          <BulkAdd
            apiEndpoint={`${apiRoutesByRole["activity"]}/bulk`}
            refetchData={refetchData}
            currentTable={"Activities"}
          />{" "}
          <Spacer y={12} />
          <Title title="Location" />
          <BulkAdd
            apiEndpoint={`${locationRoutes.getAll}/bulk`}
            refetchData={refetchData} // Function to refetch activities list
            currentTable={"Locations"}
          />
          <Spacer y={12} />
        </div>
      </div>
    </div>
  );
}
