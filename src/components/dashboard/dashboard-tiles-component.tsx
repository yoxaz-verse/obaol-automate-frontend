import React from "react";
import DashboardTile from "./dashboard-tile";
import { useQuery } from "@tanstack/react-query";
import { getData } from "@/core/api/apiHandler";
import { projectRoutes } from "@/core/api/apiRoutes";

interface DashboardTilesComponentProps {
  projectCounts?: any;
}
const DashboardTilesComponent = ({
  projectCounts,
}: DashboardTilesComponentProps) => {
  // Calculate total projects
  const totalProjects = projectCounts?.reduce(
    (sum: number, project: any) => sum + project.count,
    0
  );

  // Map data to dashboard tiles
  const dashboardTilesData = [
    { title: "Total Projects", data: totalProjects || 0 }, //Translate
    ...projectCounts.map((project: any) => ({
      title: project.status,
      data: project.count,
    })),
  ];
  return (
    <div
      className="grid 
    grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
    gap-5 px-4"
    >
      {dashboardTilesData.map((tile: any, index: any) => (
        <DashboardTile
          key={index}
          heading={tile.title}
          data={tile.data}
          type="details"
        />
      ))}
    </div>
  );
};

export default DashboardTilesComponent;
