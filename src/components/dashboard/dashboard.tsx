import React, { useContext, useMemo } from "react";
import { NextPage } from "next";
import { useQuery } from "@tanstack/react-query";
import { Card, CardBody, CardHeader, Chip, Divider, Progress } from "@nextui-org/react";
import {
  FiActivity,
  FiBarChart2,
  FiBox,
  FiCheckCircle,
  FiClock,
  FiLayers,
  FiPackage,
  FiShoppingBag,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import DashboardTile from "./dashboard-tile";
import InsightCard from "./InsightCard";
import TrendChart from "./TrendChart";
import EssentialTabContent from "./Essentials/essential-tab-content";
import AuthContext from "@/context/AuthContext";
import { getData } from "@/core/api/apiHandler";
import { apiRoutes, associateRoutes, productRoutes, variantRateRoutes } from "@/core/api/apiRoutes";
import { routeRoles } from "@/utils/roleHelpers";
import { sidebarOptions } from "@/utils/utils";

const Dashboard: NextPage = () => {
  const { user } = useContext(AuthContext);
  const role = user?.role || "";
  const isAdmin = role === "Admin";
  const isAssociate = role === "Associate";
  const isEmployee = role === "Employee";

  const { data: variantRateResponse } = useQuery({
    queryKey: ["variantRates"],
    queryFn: () => getData(`${variantRateRoutes.getAll}`, {}),
    enabled: !!user?.id,
  });

  const { data: associatesResponse } = useQuery({
    queryKey: ["associates"],
    queryFn: () => getData(`${associateRoutes.getAll}`, {}),
    enabled: !!user?.id && (isAdmin || isEmployee),
  });

  const { data: productResponse } = useQuery({
    queryKey: ["product"],
    queryFn: () => getData(`${productRoutes.getAll}`, {}),
    enabled: !!user?.id,
  });

  const { data: enquiryResponse } = useQuery({
    queryKey: ["dashboardEnquiry"],
    queryFn: () => getData(apiRoutes.enquiry.getAll, { page: 1, limit: 100 }),
    enabled: !!user?.id,
  });

  const { data: orderResponse } = useQuery({
    queryKey: ["dashboardOrder"],
    queryFn: () => getData(apiRoutes.orders.getAll, { page: 1, limit: 100 }),
    enabled: !!user?.id,
  });

  const { data: trendData } = useQuery({
    queryKey: ["enquiryTrends"],
    queryFn: () => getData(apiRoutes.analytics.enquiryTrends, {}),
    enabled: !!user?.id && (isAdmin || isEmployee),
  });

  const { data: topProductsData } = useQuery({
    queryKey: ["productPerformance"],
    queryFn: () => getData(apiRoutes.analytics.productPerformance, { limit: 5 }),
    enabled: !!user?.id && (isAdmin || isEmployee),
  });

  const { data: systemMetricsData } = useQuery({
    queryKey: ["systemMetrics"],
    queryFn: () => getData(apiRoutes.analytics.systemMetrics, {}),
    enabled: !!user?.id && (isAdmin || isEmployee),
  });

  const { data: associateMetricsData } = useQuery({
    queryKey: ["associateMetrics"],
    queryFn: () => getData(apiRoutes.analytics.associateMetrics, {}),
    enabled: !!user?.id && isAssociate,
  });

  const extractList = (raw: any): any[] => {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.data?.data)) return raw.data.data;
    if (Array.isArray(raw?.data?.data?.data)) return raw.data.data.data;
    return [];
  };

  const extractCount = (raw: any, list: any[]) => {
    return (
      raw?.totalCount ||
      raw?.data?.totalCount ||
      raw?.data?.data?.totalCount ||
      raw?.data?.data?.data?.totalCount ||
      list.length ||
      0
    );
  };

  const enquiries = extractList(enquiryResponse);
  const orders = extractList(orderResponse);
  const rateList = extractList(variantRateResponse);
  const topProducts = extractList(topProductsData);
  const trendList = extractList(trendData);

  const totalEnquiries = extractCount(enquiryResponse, enquiries);
  const totalOrders = extractCount(orderResponse, orders);
  const totalProducts = extractCount(productResponse, extractList(productResponse));
  const totalAssociates = extractCount(associatesResponse, extractList(associatesResponse));
  const liveRates = Array.isArray(rateList) ? rateList.filter((rate: any) => rate?.isLive).length : 0;

  const pendingEnquiries = enquiries.filter((item: any) => {
    const s = String(item?.status || "").toUpperCase();
    return !["COMPLETED", "CLOSED", "CANCELLED", "CONVERTED"].includes(s);
  }).length;

  const convertedEnquiries = enquiries.filter((item: any) => String(item?.status || "").toUpperCase() === "CONVERTED").length;
  const activeOrders = orders.filter((item: any) => {
    const s = String(item?.status || "").toUpperCase();
    return !["COMPLETED", "CANCELLED"].includes(s);
  }).length;
  const completedOrders = orders.filter((item: any) => String(item?.status || "").toUpperCase() === "COMPLETED").length;
  const orderCompletionPct = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

  const associateMetrics = associateMetricsData?.data?.data || {};
  const systemMetrics = systemMetricsData?.data?.data || {};
  const userId = user?.id?.toString() || "";

  const associateBuyingCount = enquiries.filter(
    (item: any) => (item?.buyerAssociateId?._id || item?.buyerAssociateId)?.toString() === userId
  ).length;
  const associateSellingCount = enquiries.filter(
    (item: any) => (item?.sellerAssociateId?._id || item?.sellerAssociateId)?.toString() === userId
  ).length;
  const associateActionRequired = enquiries.filter((item: any) => {
    const isBuying = (item?.buyerAssociateId?._id || item?.buyerAssociateId)?.toString() === userId;
    const isSelling = (item?.sellerAssociateId?._id || item?.sellerAssociateId)?.toString() === userId;
    const sellerPending = isSelling && !item?.sellerAcceptedAt;
    const buyerPending = isBuying && item?.sellerAcceptedAt && !item?.buyerConfirmedAt;
    return sellerPending || buyerPending;
  }).length;

  const adminActionRequired = enquiries.filter((item: any) => {
    const isConverted = String(item?.status || "").toUpperCase() === "CONVERTED";
    return (!item?.sellerAcceptedAt || !item?.buyerConfirmedAt || !isConverted);
  }).length;

  const activityFeed = useMemo(() => {
    const enquiryFeed = enquiries.slice(0, 3).map((item: any) => ({
      type: "Enquiry",
      id: item?._id,
      status: item?.status || "Pending",
      at: item?.updatedAt || item?.createdAt,
    }));
    const orderFeed = orders.slice(0, 3).map((item: any) => ({
      type: "Order",
      id: item?._id,
      status: item?.status || "Procuring",
      at: item?.updatedAt || item?.createdAt,
    }));
    return [...enquiryFeed, ...orderFeed]
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 5);
  }, [enquiries, orders]);

  const filteredOptions = sidebarOptions.filter((option) => {
    const allowedRoles = routeRoles[option.link] || [];
    return user?.role ? allowedRoles.includes(user.role) : false;
  });

  const welcomeName = isAssociate
    ? associateMetrics.associateName || user?.email
    : user?.name || user?.email || "User";

  return (
    <div className="w-full p-6 space-y-6">
      <Card className="border-none shadow-md bg-gradient-to-r from-slate-900 via-cyan-900 to-teal-700 text-white">
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">Operations Command Center</h1>
              <p className="text-sm md:text-base text-white/85">
                Welcome back, {welcomeName}. Track enquiries, orders, market position, and pending actions in one place.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Chip size="sm" variant="flat" className="bg-white/20 text-white border border-white/20 font-semibold">
                {role || "User"}
              </Chip>
              <Chip size="sm" variant="flat" className="bg-white/20 text-white border border-white/20 font-semibold">
                {activeOrders} Active Orders
              </Chip>
            </div>
          </div>
        </CardBody>
      </Card>

      {(isAdmin || isEmployee) && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <InsightCard
              title="Total Enquiries"
              metric={(systemMetrics.totalEnquiries ?? totalEnquiries).toLocaleString()}
              trend={{ value: `${systemMetrics.newEnquiriesToday ?? 0} today`, isPositive: true }}
              icon={<FiActivity size={18} />}
              footer={<span className="text-xs text-default-500">All-time inbound enquiry volume</span>}
            />
            <InsightCard
              title="Pending Actions"
              metric={adminActionRequired.toLocaleString()}
              icon={<FiClock size={18} />}
              footer={<span className="text-xs text-default-500">Need acceptance/confirmation/conversion</span>}
            />
            <InsightCard
              title="Orders In Progress"
              metric={activeOrders.toLocaleString()}
              icon={<FiShoppingBag size={18} />}
              footer={<span className="text-xs text-default-500">Operational orders currently active</span>}
            />
            <InsightCard
              title="Completion Rate"
              metric={`${orderCompletionPct}%`}
              icon={<FiCheckCircle size={18} />}
              footer={<span className="text-xs text-default-500">Completed orders out of all created orders</span>}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-[350px]">
              <TrendChart
                title="Enquiry Trends (Last 30 Days)"
                data={Array.isArray(trendList) ? trendList : []}
                dataKey="count"
                categoryKey="_id"
                color="#06b6d4"
                type="area"
              />
            </div>
            <div className="space-y-4">
              <Card className="bg-content1/70 border border-default-100 shadow-sm">
                <CardHeader className="pb-2">
                  <h4 className="font-semibold text-foreground">System Snapshot</h4>
                </CardHeader>
                <CardBody className="pt-0 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-default-500 flex items-center gap-2"><FiUsers size={14} /> Associates</span>
                    <span className="font-semibold">{(systemMetrics.totalAssociates ?? totalAssociates).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-default-500 flex items-center gap-2"><FiBox size={14} /> Products</span>
                    <span className="font-semibold">{totalProducts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-default-500 flex items-center gap-2"><FiTrendingUp size={14} /> Live Rates</span>
                    <span className="font-semibold">{(systemMetrics.totalLiveRates ?? liveRates).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-default-500 flex items-center gap-2"><FiLayers size={14} /> Converted Enquiries</span>
                    <span className="font-semibold">{convertedEnquiries.toLocaleString()}</span>
                  </div>
                </CardBody>
              </Card>
              <Card className="bg-content1/70 border border-default-100 shadow-sm">
                <CardHeader className="pb-2">
                  <h4 className="font-semibold text-foreground">Top Performing Products</h4>
                </CardHeader>
                <CardBody className="pt-0 space-y-3">
                  {(Array.isArray(topProducts) ? topProducts : []).slice(0, 5).map((prod: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="truncate max-w-[70%] text-default-600">{prod?.name || "Unknown Product"}</span>
                      <Chip size="sm" variant="flat" color="primary">{prod?.enquiryCount || 0}</Chip>
                    </div>
                  ))}
                  {(!Array.isArray(topProducts) || topProducts.length === 0) && (
                    <div className="text-xs text-default-400">No product analytics available yet.</div>
                  )}
                </CardBody>
              </Card>
            </div>
          </div>
        </>
      )}

      {isAssociate && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <InsightCard
              title="Buying Enquiries"
              metric={(associateMetrics.totalInquiries || associateBuyingCount || 0).toLocaleString()}
              icon={<FiShoppingBag size={18} />}
              footer={<span className="text-xs text-default-500">Enquiries where you are buyer-side</span>}
            />
            <InsightCard
              title="Selling Enquiries"
              metric={associateSellingCount.toLocaleString()}
              icon={<FiPackage size={18} />}
              footer={<span className="text-xs text-default-500">Enquiries where you are supplier-side</span>}
            />
            <InsightCard
              title="Action Required"
              metric={associateActionRequired.toLocaleString()}
              icon={<FiClock size={18} />}
              footer={<span className="text-xs text-default-500">Pending your accept/confirm actions</span>}
            />
            <InsightCard
              title="Live Catalog Presence"
              metric={(associateMetrics.liveProducts || 0).toLocaleString()}
              icon={<FiTrendingUp size={18} />}
              footer={<span className="text-xs text-default-500">Your currently live products</span>}
            />
          </div>

          <Card className="border border-default-100 shadow-sm bg-content1/70">
            <CardHeader className="pb-1">
              <h4 className="font-semibold text-foreground">Conversion Readiness</h4>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-default-500">Orders Completed Ratio</span>
                <span className="font-semibold">{orderCompletionPct}%</span>
              </div>
              <Progress value={orderCompletionPct} color="success" className="max-w-full" />
              <p className="text-xs text-default-500 mt-3">
                Keep responses fast on supplier acceptance and buyer confirmation to improve conversion speed.
              </p>
            </CardBody>
          </Card>
        </>
      )}

      {!isAdmin && !isAssociate && !isEmployee && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <InsightCard title="Enquiries" metric={totalEnquiries.toLocaleString()} icon={<FiActivity size={18} />} />
          <InsightCard title="Pending Enquiries" metric={pendingEnquiries.toLocaleString()} icon={<FiClock size={18} />} />
          <InsightCard title="Orders" metric={totalOrders.toLocaleString()} icon={<FiShoppingBag size={18} />} />
          <InsightCard title="Products" metric={totalProducts.toLocaleString()} icon={<FiBox size={18} />} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border border-default-100 shadow-sm bg-content1/70">
          <CardHeader>
            <h4 className="font-semibold text-foreground">Action Radar</h4>
          </CardHeader>
          <Divider />
          <CardBody className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-default-500">Pending Enquiries</span>
              <Chip color="warning" variant="flat">{pendingEnquiries}</Chip>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-default-500">Converted Enquiries</span>
              <Chip color="primary" variant="flat">{convertedEnquiries}</Chip>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-default-500">Active Orders</span>
              <Chip color="success" variant="flat">{activeOrders}</Chip>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-default-500">Completed Orders</span>
              <Chip color="secondary" variant="flat">{completedOrders}</Chip>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-default-100 shadow-sm bg-content1/70">
          <CardHeader>
            <h4 className="font-semibold text-foreground">Recent Activity</h4>
          </CardHeader>
          <Divider />
          <CardBody className="space-y-3">
            {activityFeed.map((item) => (
              <div key={`${item.type}-${item.id}`} className="text-sm flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-medium text-foreground truncate">{item.type} #{String(item.id || "").slice(-6).toUpperCase()}</div>
                  <div className="text-xs text-default-500 truncate">{item.status}</div>
                </div>
                <Chip size="sm" variant="flat">{new Date(item.at).toLocaleDateString()}</Chip>
              </div>
            ))}
            {activityFeed.length === 0 && (
              <div className="text-xs text-default-400">No activity to show yet.</div>
            )}
          </CardBody>
        </Card>
      </div>

      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-default-500 mb-3">Quick Navigation</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredOptions.map((option, index) =>
            option.name !== "Dashboard" ? (
              <div key={index} className="aspect-square">
                <DashboardTile data={option} type="view" />
              </div>
            ) : null
          )}
        </div>
      </div>

      {isEmployee && (
        <Card className="border border-default-100 shadow-sm bg-content1/70">
          <CardHeader>
            <h4 className="font-semibold text-foreground">My Assigned Company Worklist</h4>
          </CardHeader>
          <Divider />
          <CardBody>
            <EssentialTabContent
              essentialName="researchedCompany"
              filter={{ submittedBy: user.id }}
              hideAdd={true}
            />
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
