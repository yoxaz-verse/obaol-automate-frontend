import React, { useContext, useState } from "react";
import DashboardTile from "./dashboard-tile";
import { NextPage } from "next";
import { useQuery } from "@tanstack/react-query";
import { getData } from "@/core/api/apiHandler";
import {
  associateRoutes,
  productRoutes,
  projectRoutes,
  variantRateRoutes,
  apiRoutes,
} from "@/core/api/apiRoutes";
import AuthContext from "@/context/AuthContext";
import { sidebarOptions } from "@/utils/utils";
import { routeRoles } from "@/utils/roleHelpers";
import { Spacer, Tab, Tabs, Card, Chip } from "@nextui-org/react";
import EssentialTabContent from "./Essentials/essential-tab-content";
import InsightCard from "./InsightCard";
import TrendChart from "./TrendChart";

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

  const liveRate =
    rateValue && Array.isArray(rateValue?.data)
      ? rateValue?.data.filter((rate: any) => rate.isLive === true).length
      : "0";

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

  // Fetch Analytics Data
  const { data: trendData } = useQuery({
    queryKey: ["enquiryTrends"],
    queryFn: () => getData(apiRoutes.analytics.enquiryTrends, {}),
  });

  const { data: topProductsData } = useQuery({
    queryKey: ["productPerformance"],
    queryFn: () => getData(apiRoutes.analytics.productPerformance, { limit: 5 }),
  });

  const { data: systemMetricsData } = useQuery({
    queryKey: ["systemMetrics"],
    queryFn: () => getData(apiRoutes.analytics.systemMetrics, {}),
  });

  const systemMetrics = systemMetricsData?.data?.data || {};

  const { user } = useContext(AuthContext);
  let filteredOptions;
  if (user != null)
    filteredOptions = sidebarOptions.filter((option) => {
      const allowedRoles = routeRoles[option.link] || [];
      return allowedRoles.includes(user.role);
    });

  return (
    <div className="w-full p-6 space-y-6">
      {user?.id && user?.role === "Admin" && (
        <>
          {/* --- Insight Cards Section --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <InsightCard
              title="Total Enquiries"
              metric={systemMetrics.totalEnquiries?.toLocaleString() ?? "0"}
              trend={{ value: `+${systemMetrics.newEnquiriesToday ?? 0} today`, isPositive: true }}
              icon={<span className="text-xl">📩</span>}
            />
            <InsightCard
              title="Live Rates"
              metric={systemMetrics.totalLiveRates?.toLocaleString() ?? "0"}
              icon={<span className="text-xl">⚡</span>}
            />
            <InsightCard
              title="Total Associates"
              metric={systemMetrics.totalAssociates?.toLocaleString() ?? "0"}
              icon={<span className="text-xl">🤝</span>}
            />
            <InsightCard
              title="Products"
              metric={productValue?.totalCount?.toLocaleString() ?? "0"}
              icon={<span className="text-xl">📦</span>}
            />
          </div>

          {/* --- Charts & Quick Actions Section --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-[350px]">
              <TrendChart
                title="Enquiry Trends (Last 30 Days)"
                data={Array.isArray(trendData?.data?.data) ? trendData.data.data : []}
                dataKey="count"
                categoryKey="_id"
                color="#f5a524" // Warning color to match theme
                type="area"
              />
            </div>
            <div className="space-y-6">
              <Card className="bg-content1/50 backdrop-blur-lg border-none shadow-sm p-4">
                <h4 className="font-semibold text-foreground/90 mb-4">Top Performing Products</h4>
                <div className="space-y-3">
                  {(Array.isArray(topProductsData?.data?.data) ? topProductsData.data.data : []).map((prod: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-default-600 truncate max-w-[70%]">{prod.name}</span>
                      <Chip size="sm" variant="flat" color="warning">{prod.enquiryCount} leads</Chip>
                    </div>
                  ))}
                  {(Array.isArray(topProductsData?.data?.data) ? topProductsData.data.data : []).length === 0 && (
                    <div className="text-default-400 text-xs italic text-center">No data available</div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* --- Standard Grid (Existing Sidebar Options) --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredOptions?.map((option, index) =>
          option.name !== "Dashboard" ? (
            <div key={index} className="aspect-square">
              <DashboardTile data={option} type="view" />
            </div>
          ) : null
        )}
      </div>

      {/* Employee-specific section */}
      {user?.id && user?.role === "Employee" && (
        <EssentialTabContent
          essentialName="researchedCompany"
          filter={{ submittedBy: user.id }}
          hideAdd={true}
        />
      )}
    </div>
  );
};

export default Dashboard;
