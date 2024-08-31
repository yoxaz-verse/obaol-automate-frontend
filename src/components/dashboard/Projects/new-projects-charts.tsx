import React from "react";
import DashboardTile from "../dashboard-tile";

const NewProjectsCharts = () => {
  return (
    <div className="flex flex-wrap lg:justify-between py-5 gap-5">
      <div className="w-full lg:w-[23%]">
        <DashboardTile type="percentage charts" heading="Total Projects" />
      </div>
      <div className="w-full lg:w-[23%]">
        <DashboardTile type="percentage charts" heading="Pending Projects" />
      </div>
      <div className="w-full lg:w-[23%]">
        <DashboardTile type="percentage charts" heading="Worked Projects" />
      </div>
      <div className="w-full lg:w-[23%]">
        <DashboardTile type="percentage charts" heading="Pending Projects" />
      </div>
    </div>
  );
};

export default NewProjectsCharts;
