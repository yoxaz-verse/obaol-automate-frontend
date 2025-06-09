import React, { useContext, useState } from "react";
import DashboardTilesComponent from "./dashboard-tiles-component";
import DashboardCharts from "./dashboard-charts";
import DashboardTile from "./dashboard-tile";
import { NextPage } from "next";
import { useQuery } from "@tanstack/react-query";
import { getData, postData } from "@/core/api/apiHandler";
import { projectRoutes } from "@/core/api/apiRoutes";
import { Status } from "@/data/interface-data";
import AuthContext from "@/context/AuthContext";
import { sidebarOptions } from "@/utils/utils";
import { routeRoles } from "@/utils/roleHelpers";
import { Spacer, Tab, Tabs } from "@nextui-org/react";
import TimeSheetTabContent from "./TimeSheet/all-timesheet-tab-content";

const Dashboard: NextPage = () => {
  // Fetch project counts by status using the count-by-status API
  const { data: projectCountsResponse } = useQuery({
    queryKey: ["projectCounts"],
    queryFn: () => postData(`${projectRoutes.getAll}/count-by-status`, {}),
  });

  const [currentTable, setCurrentTable] = useState(""); // Default tab
  const tabs = [
    { key: "", title: "All" },
    { key: "isPending", title: "Pending" }, // Translate Title
    { key: "isAccepted", title: "Accepted" }, // Translate Title
    { key: "isResubmitted", title: "Resubmitted" }, // Translate Title
    { key: "isRejected", title: "Rejected" }, // Translate Title
    // Add more tabs if needed, e.g., "Archived Projects"
  ]; // Convert object to array

  const current = "timeSheet";

  const projectCounts: Status[] = projectCountsResponse
    ? Object.values(projectCountsResponse.data.data)
    : [];

    
  // Calculate total projects
  const totalProjects = projectCounts.reduce(
    (sum, project) => sum + project.count,
    0
  );

  // Calculate open projects
  const openProjects =
    projectCounts.find((project) => project.status === "Open")?.count || 0;

  // Calculate open projects
  const closedProjects =
    projectCounts.find((project) => project.status === "Closed")?.count || 0;

  // Calculate the percentage of open projects
  const openPercentage =
    totalProjects > 0 ? ((openProjects / totalProjects) * 100).toFixed(2) : "0";

  // Calculate the percentage of open projects
  const closedPercentage =
    totalProjects > 0
      ? ((closedProjects / totalProjects) * 100).toFixed(2)
      : "0";
  const { user } = useContext(AuthContext);
  let filteredOptions;
  // Filter options based on the user's role
  if (user != null)
    filteredOptions = sidebarOptions.filter((option) => {
      const allowedRoles = routeRoles[option.link] || [];
      return allowedRoles.includes(user.role);
    });

  return (
    <div className="w-full">
      {/* <DashboardTilesComponent projectCounts={projectCounts} /> */}
      <div className="px-4 py-5 ">
        {(user?.role === "ActivityManager" || user?.role === "Worker") && (
          <Tabs
            aria-label="TimeSheet Tabs" // Translate
            selectedKey={currentTable}
            onSelectionChange={(key) => setCurrentTable(key as string)}
          >
            {tabs.map((tab) => (
              <Tab key={tab.key} title={tab.title}>
                <TimeSheetTabContent
                  currentTable={current}
                  isMode={tab.key}
                  user={user}
                />
              </Tab>
            ))}
          </Tabs>
        )}
      </div>

      <div className="flex px-4 py-5 justify-between w-full flex-col lg:flex-row">
        <div className="lg:w-[70%] grid grid-cols-2 gap-5">
          {filteredOptions?.map((option, index) =>
            option.name !== "Dashboard" ? (
              <div key={index}>
                <DashboardTile data={option} type="view" />
                <Spacer y={4} />
              </div>
            ) : null
          )}
          {/* <DashboardCharts /> */}
        </div>

        <div className="flex flex-col lg:w-[23%] lg:pt-12">
          <div className="flex flex-col"></div>
          <div className="flex flex-col">
            {/* <div className="text-[#5F5F5F] font-medium pt-5">
              Recent Projects</div> */}
            <div className="pb-5">
              {/* <DashboardTile
                type="percentage charts"
                stats={openPercentage}
                heading="Open Projects" 
              /> */}
            </div>
            {/* <DashboardTile
              type="percentage charts"
              stats={closedPercentage}
              heading="Closed Projects" 
            />{" "} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
