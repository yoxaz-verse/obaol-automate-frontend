import React from "react";
import DashboardTile from "../dashboard-tile";

const NewProjectsCharts = () => {
  return (
    <div className="flex flex-wrap lg:justify-between py-5 gap-5">
      <div className="w-full lg:w-[23%]">
        <DashboardTile type="percentage charts" heading="Total Projects" />
        {/* Translate */}
      </div>
      <div className="w-full lg:w-[23%]">
        <DashboardTile type="percentage charts" heading="Pending Projects" />
        {/* Translate */}
      </div>
      <div className="w-full lg:w-[23%]">
        <DashboardTile type="percentage charts" heading="Worked Projects" />
        {/* Translate */}
      </div>
      <div className="w-full lg:w-[23%]">
        <DashboardTile type="percentage charts" heading="Pending Projects" />
        {/* Translate */}
      </div>
    </div>
  );
};

export default NewProjectsCharts;
