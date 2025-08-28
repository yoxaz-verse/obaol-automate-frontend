// pages/locations.tsx
"use client";

import React from "react";
import { Tabs, Tab, Spacer } from "@nextui-org/react";
import Title from "@/components/titles";
import BulkAdd from "@/components/CurdTable/bulk-add";
import { apiRoutesByRole } from "@/utils/tableValues";

export default function Essentials() {
  const refetchData = () => {
    // Implement refetch logic if necessary
  };

  return (
    <div className="flex items-center justify-center">
      <div className="w-[95%]">
        <div className="my-4">
          <Title title="Project" /> {/* Translate */}
          <BulkAdd
            apiEndpoint={`${apiRoutesByRole["projects"]}/bulk`}
            refetchData={refetchData}
            currentTable={"Projects"} // Translate
          />
          <Spacer y={12} />
          <Title title="Activity" />
          <BulkAdd
            apiEndpoint={`${apiRoutesByRole["activity"]}/bulk`}
            refetchData={refetchData}
            currentTable={"Activities"} // Translate
          />{" "}
          <Spacer y={12} />
          <Title title="Location" />
          {/* <BulkAdd
            apiEndpoint={`${locationRoutes.getAll}/bulk`}
            refetchData={refetchData} // Function to refetch activities list
            currentTable={"Locations"} // Translate
          /> */}
          <Spacer y={12} />
        </div>
      </div>
    </div>
  );
}
