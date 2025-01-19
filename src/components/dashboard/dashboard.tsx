import React, { useContext } from "react";
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
import { Spacer } from "@nextui-org/react";

const Dashboard: NextPage = () => {
  // Fetch project counts by status using the count-by-status API
  const { data: projectCountsResponse } = useQuery({
    queryKey: ["projectCounts"],
    queryFn: () => postData(`${projectRoutes.getAll}/count-by-status`, {}),
  });

  // Convert object to array
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
  console.log(filteredOptions);

  return (
    <div className="w-full">
      <DashboardTilesComponent projectCounts={projectCounts} />
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
            <div className="text-[#5F5F5F] font-medium pt-5">
              Recent Projects
            </div>
            <div className="pb-5">
              <DashboardTile
                type="percentage charts"
                stats={openPercentage}
                heading="Open Projects"
              />
            </div>
            <DashboardTile
              type="percentage charts"
              stats={closedPercentage}
              heading="Closed Projects"
            />{" "}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
