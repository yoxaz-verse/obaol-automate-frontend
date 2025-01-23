// pages/locations.tsx
"use client";

import React from "react";
import { Tabs, Tab, Spacer } from "@nextui-org/react";
import Title from "@/components/titles";
import BulkAdd from "@/components/CurdTable/bulk-add";
import { locationRoutes } from "@/core/api/apiRoutes";
import { apiRoutesByRole } from "@/utils/tableValues";

export default function Essentials() {
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
