import React, { useContext, useState } from "react";
import DashboardTilesComponent from "./dashboard-tiles-component";
import DashboardCharts from "./dashboard-charts";
import DashboardTile from "./dashboard-tile";
import { NextPage } from "next";
import { useQuery } from "@tanstack/react-query";
import { getData, postData } from "@/core/api/apiHandler";
import {
  associateRoutes,
  productRoutes,
  projectRoutes,
  variantRateRoutes,
} from "@/core/api/apiRoutes";
import { Status } from "@/data/interface-data";
import AuthContext from "@/context/AuthContext";
import { sidebarOptions } from "@/utils/utils";
import { routeRoles } from "@/utils/roleHelpers";
import { Spacer, Tab, Tabs } from "@nextui-org/react";
import TimeSheetTabContent from "./TimeSheet/all-timesheet-tab-content";

const Dashboard: NextPage = () => {
  // Fetch project counts by status using the count-by-status API
  const { data: variantRateResponse } = useQuery({
    queryKey: ["variantRates"],
    queryFn: () => getData(`${variantRateRoutes.getAll}`, {}),
  });

  const { data: associatesResponse } = useQuery({
    queryKey: ["associates"],
    queryFn: () => getData(`${associateRoutes.getAll}`, {}),
  });

  const { data: productResponse } = useQuery({
    queryKey: ["product"],
    queryFn: () => getData(`${productRoutes.getAll}`, {}),
  });

  const productValue = productResponse?.data.data;

  const associateValue = associatesResponse?.data.data;

  const rateValue = variantRateResponse?.data.data;

  const [currentTable, setCurrentTable] = useState(""); // Default tab
  const tabs = [
    { key: "", title: "All" },
    { key: "isPending", title: "Pending" }, // Translate Title
    { key: "isAccepted", title: "Accepted" }, // Translate Title
    { key: "isResubmitted", title: "Resubmitted" }, // Translate Title
    { key: "isRejected", title: "Rejected" }, // Translate Title
    // Add more tabs if needed, e.g., "Archived Projects"
  ]; // Convert object to array

  // const projectCounts: Status[] = projectCountsResponse
  //   ? Object.values(projectCountsResponse.data.data)
  //   : [];

  // // Calculate total projects
  // const totalProjects = projectCounts.reduce(
  //   (sum, project) => sum + project.count,
  //   0
  // );

  // Calculate open projects
  // const openProjects =
  //   projectCounts.find((project) => project.status === "Open")?.count || 0;

  // Calculate open projects
  // const closedProjects =
  //   projectCounts.find((project) => project.status === "Closed")?.count || 0;

  // Calculate the percentage of open projects
  // const openPercentage =
  //   totalProjects > 0 ? ((openProjects / totalProjects) * 100).toFixed(2) : "0";

  // Calculate the percentage of open projects
  // const closedPercentage =
  //   totalProjects > 0
  //     ? ((closedProjects / totalProjects) * 100).toFixed(2)
  // : "0";

  const liveRate =
    rateValue && Array.isArray(rateValue?.data)
      ? rateValue?.data.filter((rate: any) => rate.isLive === true).length
      : "0";

  console.log((liveRate / rateValue?.totalCount) * 100);
  // Step 1: Extract all associate IDs from rateValue where there's a linked product
  const associatesWithProductsSet = new Set(
    Array.isArray(rateValue?.data)
      ? rateValue.data
          .filter(
            (r: any) =>
              r.associate !== null && r.productVariant?.product !== null
          )
          .map((r: any) => r.associate)
      : []
  );

  // Step 2: Count unique associates that have products
  const associatesWithProductsCount = associatesWithProductsSet.size;

  // Step 3: Total associate count
  const totalAssociates = associateValue?.totalCount ?? 0;

  // Optional: percentage of associates with products
  const percentageWithProducts = totalAssociates
    ? ((associatesWithProductsCount / totalAssociates) * 100).toFixed(2)
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
                <DashboardTile data={"GGG"} type="line charts" />
              </Tab>
            ))}
          </Tabs>
        )}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-2 px-4 py-5">
        <DashboardTile
          heading={"Total Rates"}
          data={rateValue?.totalCount ?? "0"}
          type="details"
        />
        <DashboardTile
          heading={"Live Rates"}
          data={liveRate ?? "0"}
          type="details"
        />
        <DashboardTile
          heading={"Associates"}
          data={associateValue?.totalCount ?? "0"}
          type="details"
        />
        <DashboardTile
          heading={"Total Products"}
          data={productValue?.totalCount ?? "0"}
          type="details"
        />
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

        <div className="flex flex-col lg:w-[23%] ">
          <div className="flex flex-col"> </div>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            {/* <div className="text-[#5F5F5F] font-medium pt-5">
              Recent Projects</div> */}
            <DashboardTile
              type="percentage charts"
              stats={
                ((liveRate / rateValue?.totalCount) * 100).toString() ?? "0"
              }
              heading="Live Rates"
            />
            <DashboardTile
              type="percentage charts"
              stats={percentageWithProducts.toString() ?? "0"}
              heading="Associates with Products"
            />{" "}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
