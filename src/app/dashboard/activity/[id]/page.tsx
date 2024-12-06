"use client";
import { NextPage } from "next";
import ActivityDetailCard from "@/components/dashboard/Activity/activity-card";
import QueryComponent from "@/components/queryComponent";
import { activityRoutes } from "@/core/api/apiRoutes";
import { Tab, Tabs } from "@nextui-org/tabs";
import TimeSheetTabContent from "@/components/dashboard/TimeSheet/all-timesheet-tab-content";
import { usePathname } from "next/navigation";
import { useState } from "react";
import AddModal from "@/components/CurdTable/add-model";
import { apiRoutesByRole, initialTableConfig } from "@/utils/tableValues";
import { Spacer } from "@nextui-org/react";
const refetchData = () => {
  // Implement refetch logic if necessary
};
const ViewActivityById: NextPage = () => {
  const [currentTable, setCurrentTable] = useState(""); // Default tab
  const tabs = [
    { key: "", title: "All" },
    { key: "isPending", title: "Pending" },
    { key: "isAccepted", title: "Accepted" },
    { key: "isResubmitted", title: "Resubmitted" },
    { key: "isRejected", title: "Rejected" },
    // Add more tabs if needed, e.g., "Archived Projects"
  ];
  const pathname = usePathname().split("/").pop()?.toString() || ""; // Gets the current URL pathname
  const activityId = pathname || ""; // Replace with dynamic ID if available
  const current = "timeSheet";
  const tableConfig = { ...initialTableConfig }; // Create a copy to avoid mutations

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:justify-between">
        <div className="lg:w-[49%]">
          <QueryComponent
            api={`${activityRoutes.getAll}/${activityId}`} // API endpoint to fetch activity details
            queryKey={["activityDetailData", activityId]}
          >
            {(data) => <ActivityDetailCard data={data} />}
          </QueryComponent>
        </div>

        <div className="lg:w-[49%] mt-4 lg:mt-0">
          <div className="w-full h-[400px] lg:h-full">
            <iframe
              src="https://www.google.com/maps/embed/v1/place?q=Door+No:730+E+Abg+Tower+Mundakayam+P.O,+near+South+Indian+Bank,+Kerala+686513&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8"
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      </div>
      <div className="my-4">
        <AddModal
          currentTable={current}
          formFields={tableConfig[current]} // Pass the updated formFields
          apiEndpoint={`${apiRoutesByRole[current]}`}
          refetchData={refetchData}
          additionalVariable={{ activity: activityId }}
        />{" "}
        <Spacer y={6} />
        <Tabs
          aria-label="TimeSheet Tabs"
          selectedKey={currentTable}
          onSelectionChange={(key) => setCurrentTable(key as string)}
        >
          {tabs.map((tab) => (
            <Tab key={tab.key} title={tab.title}>
              <TimeSheetTabContent
                currentTable={current}
                activityId={activityId}
                isMode={tab.key}
              />
            </Tab>
          ))}
        </Tabs>
      </div>
    </>
  );
};

export default ViewActivityById;
