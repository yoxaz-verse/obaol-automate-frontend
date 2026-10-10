import React, { useContext, useEffect, useMemo, useState } from "react";
import { NextPage } from "next";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Skeleton,
} from "@nextui-org/react";
import {
  LuActivity,
  LuArrowRight,
  LuBox,
  LuCheck,
  LuClock,
  LuShoppingBag,
  LuTrendingUp,
  LuUsers,
  LuChevronRight,
} from "react-icons/lu";
import InsightCard from "./InsightCard";
import AuthContext from "@/context/AuthContext";
import { apiRoutes } from "@/core/api/apiRoutes";
import { getData } from "@/core/api/apiHandler";
import { DEFAULT_STALE_TIME, extractList, useDashboardData } from "@/core/data";
import { dashboardCopy } from "@/utils/dashboardCopy";
import AssociateDashboard from "./AssociateDashboard";

const GlobalSearch = dynamic(() => import("./GlobalSearch"), { ssr: false });
const TrendChart = dynamic(() => import("./TrendChart"), {
  loading: () => <Skeleton className="h-64 w-full rounded-2xl" />,
});
const EssentialTabContent = dynamic(() => import("./Essentials/essential-tab-content"), {
  loading: () => <Skeleton className="h-72 w-full rounded-2xl" />,
});
const Dashboard: NextPage = () => {
  const isValidObjectId = (value: any) => /^[a-f0-9]{24}$/i.test(String(value || "").trim());
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const role = String(user?.role || "");
  const roleLower = role.trim().toLowerCase();
  const userId = String(user?.id || "");
  const associateCompanyId = String(user?.associateCompanyId || "");

  const isAdmin = roleLower === "admin";
  const isAssociate = roleLower === "associate" || roleLower === "customer";
  const isOperatorUser = roleLower === "operator" || roleLower === "team";
  const providedCapabilities = user?.providedCapabilities || [];
  const soughtCapabilities = user?.soughtCapabilities || [];
  const companyCapabilities = Array.from(new Set([...providedCapabilities, ...soughtCapabilities]));
  const hasBuyingCapability = providedCapabilities.includes("buyer") || soughtCapabilities.includes("seller") || companyCapabilities.includes("sourcing");
  const hasSellingCapability = providedCapabilities.includes("seller") || soughtCapabilities.includes("buyer");
  const profileMode = hasBuyingCapability && hasSellingCapability ? "BOTH" : hasBuyingCapability ? "BUY" : hasSellingCapability ? "SELL" : "SERVICE";
  const isBuyingMode = isAssociate && hasBuyingCapability;
  const isSellingMode = isAssociate && hasSellingCapability;
  const hubTitle = isAdmin
    ? "Admin Dashboard"
    : isOperatorUser
      ? "Operator Dashboard"
      : profileMode === "SERVICE"
        ? "Service Provider Workspace"
      : profileMode === "BUY"
        ? "Buying Workspace"
        : profileMode === "SELL"
          ? "Selling Workspace"
          : "Trading Workspace";
  const hubSubtitle = isAdmin
    ? "System overview is ready."
    : isOperatorUser
      ? "Operator overview is ready."
      : profileMode === "SERVICE"
        ? "Your company services and execution work are ready."
      : profileMode === "BUY"
        ? "Your buying pipeline and next actions are ready."
        : profileMode === "SELL"
          ? "Your selling pipeline and next actions are ready."
          : "Your buying and selling pipelines are ready.";

  const [companyLookup, setCompanyLookup] = useState("");
  const [associateLookup, setAssociateLookup] = useState("");
  const [debouncedCompanyLookup, setDebouncedCompanyLookup] = useState("");
  const [debouncedAssociateLookup, setDebouncedAssociateLookup] = useState("");

  const {
    hasPrimarySummary,
    dashboardSummaryQuery,
    trendQuery,
    topProductsQuery,
    approvalsAssociatesQuery,
    approvalsCompaniesQuery,
    summary,
    metrics,
    enquiries,
    trendList,
    topProducts,
    totalEnquiries,
    totalOrders,
  } = useDashboardData({
    userId,
    roleLower,
    isAdmin,
    isAssociate,
    isOperatorUser,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedCompanyLookup(companyLookup.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [companyLookup]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedAssociateLookup(associateLookup.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [associateLookup]);

  const companyDirectoryQuery = useQuery({
    queryKey: ["operatorCompanyDirectory", userId],
    queryFn: () => getData(apiRoutes.associateCompany.getAll, { page: 1, limit: 80, sortBy: "name", sortOrder: "asc" }),
    enabled: !!userId && isOperatorUser && hasPrimarySummary && debouncedCompanyLookup.length >= 2,
    staleTime: DEFAULT_STALE_TIME * 2,
    refetchOnWindowFocus: false,
  });

  const associateDirectoryQuery = useQuery({
    queryKey: ["operatorAssociateDirectory", userId],
    queryFn: () => getData(apiRoutes.associate.getAll, { page: 1, limit: 80, sortBy: "name", sortOrder: "asc" }),
    enabled: !!userId && isOperatorUser && hasPrimarySummary && debouncedAssociateLookup.length >= 2,
    staleTime: DEFAULT_STALE_TIME * 2,
    refetchOnWindowFocus: false,
  });

  const directoryCompanies = extractList(companyDirectoryQuery.data);
  const directoryAssociates = extractList(associateDirectoryQuery.data);
  const pendingEnquiries = Number(summary?.pendingEnquiries || 0);
  const convertedEnquiries = Number(summary?.convertedEnquiries || 0);
  const activeOrders = Number(summary?.activeOrders || 0);
  const completedOrders = Number(summary?.completedOrders || 0);
  const orderCompletionPct = Number(summary?.orderCompletionPct || (totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0));

  const systemMetrics = metrics || {};
  const associateMetrics = metrics || {};
  const operatorMetrics = metrics || {};
  const pendingAssociateApprovals = Number(approvalsAssociatesQuery.data?.data?.meta?.total || 0);
  const pendingCompanyApprovals = Number(approvalsCompaniesQuery.data?.data?.meta?.total || 0);
  const pendingApprovalsTotal = pendingAssociateApprovals + pendingCompanyApprovals;

  const associateBuyingCount = Number(summary?.associateBuyingCount || 0);
  const associateSellingCount = Number(summary?.associateSellingCount || 0);
  const associateActionRequired = Number(summary?.associateActionRequired || 0);
  const adminActionRequired = Number(summary?.adminActionRequired || 0);

  const activityFeed = useMemo(() => {
    const summaryFeed = Array.isArray(summary?.recentActivity) ? summary.recentActivity : [];
    return summaryFeed
      .filter((item: any) => item?.id && item?.at)
      .slice(0, 6);
  }, [summary]);

  const actionCenterItems = useMemo(() => {
    if (isAdmin) {
      return [
        {
          label: "Pending approvals",
          value: pendingApprovalsTotal,
          detail: `${pendingAssociateApprovals} associates, ${pendingCompanyApprovals} companies`,
          route: "/dashboard/approvals",
          color: "warning" as const,
        },
        {
          label: "Enquiry milestones pending",
          value: adminActionRequired,
          detail: "Missing seller or buyer confirmations",
          route: "/dashboard/enquiries",
          color: "primary" as const,
        },
        {
          label: "Orders in progress",
          value: activeOrders,
          detail: "Track active operational orders",
          route: "/dashboard/orders",
          color: "success" as const,
        },
        {
          label: "Unassigned companies",
          value: Number(systemMetrics.unassignedCompanies || 0),
          detail: "Assign operators to unmapped companies",
          route: "/dashboard/companies",
          color: "primary" as const,
        },
      ];
    }

    if (isAssociate) {
      const items = [
        {
          label: "Action required enquiries",
          value: associateActionRequired,
          detail: "Pending accept/confirm actions",
          route: "/dashboard/enquiries",
          color: "warning" as const,
        },
        ...(isBuyingMode ? [{
          label: "Catalog opportunities",
          value: Number(associateMetrics.obaolCatalogCount || 0),
          detail: "Discover products and create a buying enquiry",
          route: "/dashboard/marketplace",
          color: "primary" as const,
        }] : []),
        ...(isSellingMode ? [{
          label: "Live catalog products",
          value: Number(associateMetrics.liveProducts || 0),
          detail: "Your live listed products",
          route: "/dashboard/product",
          color: "success" as const,
        }] : []),
      ];
      return items;
    }

    if (isOperatorUser) {
      const totalAssignedProducts = Number(operatorMetrics.totalAssignedProducts || 0);
      const liveAssignedProducts = Number(operatorMetrics.liveAssignedProducts || 0);
      return [
        {
          label: "Pending assigned enquiries",
          value: Number(operatorMetrics.pendingAssignedEnquiries || 0),
          detail: "Assigned enquiries awaiting next action",
          route: "/dashboard/enquiries",
          color: "warning" as const,
        },
        {
          label: "Live-rate gap",
          value: Math.max(totalAssignedProducts - liveAssignedProducts, 0),
          detail: "Assigned products not live yet",
          route: "/dashboard/product",
          color: "primary" as const,
        },
      ];
    }

    return [];
  }, [
    activeOrders,
    adminActionRequired,
    associateActionRequired,
    associateMetrics.liveProducts,
    associateMetrics.obaolCatalogCount,
    operatorMetrics.liveAssignedProducts,
    operatorMetrics.pendingAssignedEnquiries,
    operatorMetrics.totalAssignedProducts,
    isAdmin,
    isAssociate,
    isBuyingMode,
    isOperatorUser,
    isSellingMode,
    pendingApprovalsTotal,
    pendingAssociateApprovals,
    pendingCompanyApprovals,
    systemMetrics.unassignedCompanies,
  ]);

  const pendingActionsList = useMemo(() => {
    const missingLabel = (item: any) => {
      if (!item?.sellerAcceptedAt) return "Awaiting supplier accept";
      if (!item?.buyerConfirmedAt) return "Awaiting buyer confirm";
      return "Awaiting conversion";
    };

    const summaryActions = Array.isArray(summary?.pendingActions) ? summary.pendingActions : enquiries;
    return summaryActions.slice(0, 10).map((item: any) => ({
      id: item?._id || item?.id,
      missingStep: item?.missingStep || missingLabel(item),
    }));
  }, [enquiries, summary]);

  const welcomeName = isAssociate
    ? associateMetrics.associateName || user?.email
    : user?.name || user?.email || "User";

  const executiveLoading = dashboardSummaryQuery.isLoading;

  const executiveError = dashboardSummaryQuery.isError;

  const renderActionCenter = () => (
    <Card className="lg:col-span-2 border border-slate-200/90 dark:border-white/10 bg-content1 shadow-sm rounded-[2rem]">
      <CardHeader className="px-8 pt-8">
        <div className="flex flex-col gap-1">
          <h4 className="font-bold text-foreground">Task Overview</h4>
          <p className="text-[10px] font-semibold text-default-400 uppercase tracking-widest opacity-60">Management priorities and pending actions.</p>
        </div>
      </CardHeader>
      <Divider className="my-4 mx-8 w-auto opacity-50" />
      <CardBody className="px-8 pb-8 space-y-4">
        {actionCenterItems.map((item) => (
           <div key={item.label} className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border db-border-subtle rounded-2xl p-4 db-inset hover:db-subtle transition-all">
             <div className="min-w-0">
               <div className="flex items-center gap-3">
                 <span className="text-sm font-black text-foreground uppercase tracking-tight">{item.label}</span>
                 <Chip size="sm" variant="flat" color={item.color} className="font-bold border-none h-6 db-inset">
                   {item.value}
                 </Chip>
               </div>
               <p className="text-[11px] font-medium text-default-500 mt-1 opacity-70 group-hover:opacity-100 transition-opacity">{item.detail}</p>
             </div>
             <Button
               size="sm"
               variant="flat"
               color={item.color}
               className="h-9 min-w-24 rounded-xl font-bold uppercase tracking-wider text-[10px] border db-border-subtle shadow-sm"
               endContent={<LuChevronRight className="w-3.5 h-3.5" />}
               onPress={() => router.push(item.route)}
             >
               Open
             </Button>
           </div>
         ))}

         <div className="border db-border-subtle rounded-2xl p-4 db-inset">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-foreground">Pending Actions</span>
            <Button
              size="sm"
              variant="light"
              className="text-xs"
              onPress={() => router.push("/dashboard/enquiries")}
            >
              View all enquiries
            </Button>
          </div>
          {pendingActionsList.length === 0 ? (
            <div className="text-[11px] font-semibold text-default-400 italic py-4 text-center">You don’t have any enquiries yet</div>
          ) : (
            <div className="space-y-2">
              {pendingActionsList.map((item) => (
                <button
                  key={item.id}
                  className="w-full flex items-center justify-between gap-2 text-left text-xs px-2 py-1.5 rounded-lg hover:bg-default-100/70 transition-colors"
                  onClick={() => {
                    const targetId = String((item as any)?._id || item?.id || "").trim();
                    if (!isValidObjectId(targetId)) return;
                    router.push(`/dashboard/enquiries/${targetId}`);
                  }}
                >
                  <span className="font-semibold text-foreground">
                    Enquiry #{String(item.id || "").slice(-6).toUpperCase()}
                  </span>
                  <span className="text-default-500">{item.missingStep}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {actionCenterItems.length === 0 && (
          <div className="text-xs text-default-500">No role-specific actions available.</div>
        )}
      </CardBody>
    </Card>
  );

  const renderRecentActivity = () => (
    <Card className="border border-slate-200/90 dark:border-white/10 bg-content1 shadow-sm rounded-[2rem]">
      <CardHeader className="px-8 pt-8">
        <h4 className="font-bold text-foreground">Recent Activity</h4>
      </CardHeader>
      <Divider className="my-4 mx-8 w-auto opacity-50" />
      <CardBody className="px-8 pb-8 space-y-4">
        {dashboardSummaryQuery.isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="space-y-3">
              <Skeleton className="h-4 w-2/3 rounded-lg" />
              <Skeleton className="h-3 w-1/2 rounded-lg opacity-60" />
            </div>
          ))
        ) : activityFeed.length > 0 ? (
          activityFeed.map((item) => (
            <div key={`${item.type}-${item.id}`} className="text-sm flex items-center justify-between gap-4 p-2 rounded-xl border border-transparent hover:db-border-subtle hover:db-inset transition-all group">
              <div className="min-w-0">
                <div className="font-bold text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">
                  {item.type} <span className="text-[10px] text-default-400 ml-1 font-medium">{String(item.id || "").slice(-6).toUpperCase()}</span>
                </div>
                <div className="text-[10px] text-default-500 uppercase tracking-widest font-bold opacity-60">{dashboardCopy(item.status || "")}</div>
              </div>
              <span className="text-[9px] font-bold text-default-400 db-inset px-2 py-1 rounded-md uppercase tracking-widest whitespace-nowrap">
                {new Date(item.at).toLocaleDateString()}
              </span>
            </div>
          ))
        ) : (
          <div className="text-[11px] font-medium text-default-500 italic opacity-60">
            {isAssociate
              ? "No associate activity found yet."
              : isOperatorUser
                ? "No operator activity found yet."
                : "No recent activity found."}
          </div>
        )}
      </CardBody>
    </Card>
  );


  const renderAdminDashboard = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {actionCenterItems.map((item) => (
          <InsightCard
            key={item.label}
            title={item.label}
            metric={Number(item.value || 0).toLocaleString()}
            icon={item.color === "warning" ? <LuClock size={18} /> : item.color === "primary" ? <LuActivity size={18} /> : <LuShoppingBag size={18} />}
            footer={<span className="text-xs text-default-500">{item.detail}</span>}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <InsightCard
          title="Total Enquiries"
          metric={Number(systemMetrics.totalEnquiries ?? totalEnquiries).toLocaleString()}
          trend={{
            value: `${Number(systemMetrics.newEnquiriesToday ?? 0)} today`,
            isPositive: true,
          }}
          icon={<LuActivity size={18} />}
          footer={<span className="text-xs text-default-500">All-time inbound enquiry volume</span>}
        />
        <InsightCard
          title="Pending Actions"
          metric={adminActionRequired.toLocaleString()}
          icon={<LuClock size={18} />}
          footer={<span className="text-xs text-default-500">Need acceptance/confirmation/conversion</span>}
        />
        <InsightCard
          title="Orders In Progress"
          metric={activeOrders.toLocaleString()}
          icon={<LuShoppingBag size={18} />}
          footer={<span className="text-xs text-default-500">Operational orders currently active</span>}
        />
        <InsightCard
          title="Completion Rate"
          metric={`${orderCompletionPct}%`}
          icon={<LuCheck size={18} />}
          footer={<span className="text-xs text-default-500">Completed orders out of all created orders</span>}
        />
        <InsightCard
          title="Companies With Live Products"
          metric={Number(systemMetrics.companiesWithLiveProducts || 0).toLocaleString()}
          icon={<LuBox size={18} />}
          footer={<span className="text-xs text-default-500">Companies with at least one live listing</span>}
        />
      </div>

      <Card className="border border-obaol-500/20 bg-obaol-500/5 rounded-[1.5rem] shadow-none">
        <CardBody className="px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-black text-foreground uppercase tracking-widest">Unassigned Companies</h4>
            <p className="text-xs text-default-500">
              {Number(systemMetrics.unassignedCompanies || 0).toLocaleString()} companies currently have no operator mapped.
            </p>
          </div>
          <Button
            color="warning"
            variant="flat"
            className="font-black uppercase tracking-[0.2em] text-[10px]"
            endContent={<LuArrowRight className="w-3.5 h-3.5" />}
            onPress={() => router.push("/dashboard/companies")}
          >
            Assign Operators
          </Button>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {renderActionCenter()}
        {renderRecentActivity()}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[350px]">
          {trendQuery.isLoading ? (
            <Card className="h-full border db-border-subtle db-panel">
              <CardBody className="p-5 space-y-4">
                <Skeleton className="h-5 w-1/3 rounded-lg" />
                <Skeleton className="h-full w-full rounded-lg" />
              </CardBody>
            </Card>
          ) : trendQuery.isError ? (
            <Card className="h-full border border-danger-500/25 bg-danger-500/10">
              <CardBody className="flex items-center justify-center text-sm text-danger-600 dark:text-danger-300">
                Unable to load enquiry trend chart.
              </CardBody>
            </Card>
          ) : (
            <Card className="h-full border db-border-subtle db-panel">
              <CardHeader className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground">Enquiry Trends (Last 30 Days)</h4>
                <Button
                  size="sm"
                  variant="flat"
                  color="primary"
                  endContent={<LuArrowRight className="w-3.5 h-3.5" />}
                  onPress={() => router.push("/dashboard/enquiries")}
                >
                  View Enquiries
                </Button>
              </CardHeader>
              <Divider />
              <CardBody className="p-0">
                <TrendChart
                  title=""
                  data={Array.isArray(trendList) ? trendList : []}
                  dataKey="count"
                  categoryKey="_id"
                  color="#06b6d4"
                  type="area"
                />
              </CardBody>
            </Card>
          )}
        </div>

        <Card className="db-panel border db-border-subtle shadow-sm">
          <CardHeader className="pb-2">
            <h4 className="font-semibold text-foreground">Top Performing Products</h4>
          </CardHeader>
          <CardBody className="pt-0 space-y-3">
            {topProductsQuery.isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => <Skeleton key={idx} className="h-5 w-full rounded-lg" />)
            ) : topProductsQuery.isError ? (
              <div className="text-xs text-danger-500">Unable to load product analytics.</div>
            ) : (Array.isArray(topProducts) ? topProducts : []).length > 0 ? (
              (Array.isArray(topProducts) ? topProducts : []).slice(0, 5).map((prod: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="truncate max-w-[70%] text-default-600">{prod?.name || "Unknown Product"}</span>
                  <Chip size="sm" variant="flat" color="primary">
                    {prod?.enquiryCount || 0}
                  </Chip>
                </div>
              ))
            ) : (
              <div className="text-xs text-default-400">No product analytics available yet.</div>
            )}
          </CardBody>
        </Card>
      </div>

    </>
  );

  const renderAssociateDashboard = () => (
    <AssociateDashboard
      providedCapabilities={user?.providedCapabilities || []}
      soughtCapabilities={user?.soughtCapabilities || []}
      associateCompanyId={associateCompanyId}
      companyCapabilitiesConfigured={Boolean(user?.companyCapabilitiesConfigured)}
      metrics={associateMetrics}
      pendingActions={pendingActionsList}
      activity={activityFeed}
      activeOrders={activeOrders}
      actionRequired={associateActionRequired}
      buyingCount={Number(associateMetrics.totalInquiries || associateBuyingCount) || 0}
      sellingCount={associateSellingCount}
      isLoading={dashboardSummaryQuery.isLoading}
    />
  );


  const renderOperatorDashboard = () => {
    const totalAssignedProducts = Number(operatorMetrics.totalAssignedProducts || 0);
    const liveAssignedProducts = Number(operatorMetrics.liveAssignedProducts || 0);
    const companyNeedle = companyLookup.trim().toLowerCase();
    const associateNeedle = associateLookup.trim().toLowerCase();
    const matchedCompanies = companyNeedle
      ? directoryCompanies.filter((item: any) =>
          String(item?.name || "")
            .toLowerCase()
            .includes(companyNeedle)
        )
      : [];
    const matchedAssociates = associateNeedle
      ? directoryAssociates.filter((item: any) =>
          String(item?.name || "")
            .toLowerCase()
            .includes(associateNeedle)
        )
      : [];
    const ongoingEnquiries = Array.isArray(summary?.ongoingEnquiries)
      ? summary.ongoingEnquiries.slice(0, 5)
      : [];

    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <InsightCard
            title="Pending Assigned Enquiries"
            metric={Number(operatorMetrics.pendingAssignedEnquiries || 0).toLocaleString()}
            icon={<LuClock size={18} />}
            footer={<span className="text-xs text-default-500">Assigned enquiries awaiting next action</span>}
          />
          <InsightCard
            title="Assigned Companies"
            metric={Number(operatorMetrics.assignedCompanies || 0).toLocaleString()}
            icon={<LuUsers size={18} />}
            footer={<span className="text-xs text-default-500">Companies currently mapped to you</span>}
          />
          <InsightCard
            title="Live-rate Gap"
            metric={Math.max(totalAssignedProducts - liveAssignedProducts, 0).toLocaleString()}
            icon={<LuTrendingUp size={18} />}
            footer={<span className="text-xs text-default-500">Assigned products not live yet</span>}
          />
          <InsightCard
            title="Assigned Products"
            metric={`${liveAssignedProducts}/${totalAssignedProducts}`}
            icon={<LuBox size={18} />}
            footer={<span className="text-xs text-default-500">Live products out of assigned products</span>}
          />
          <InsightCard
            title="Companies With Live Products"
            metric={Number(operatorMetrics.assignedCompaniesWithLiveProducts || 0).toLocaleString()}
            icon={<LuCheck size={18} />}
            footer={<span className="text-xs text-default-500">Assigned companies with at least one live listing</span>}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {renderActionCenter()}
          {renderRecentActivity()}
        </div>

        <Card className="border db-border-subtle shadow-none db-subtle backdrop-blur-3xl rounded-[2rem] overflow-hidden">
           <CardHeader className="px-8 pt-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                 <h4 className="font-black text-foreground uppercase tracking-widest text-[11px]">Ongoing Enquiries</h4>
              </div>
              <Button size="sm" variant="light" className="text-[10px] font-bold uppercase tracking-widest" onPress={() => router.push("/dashboard/enquiries")}>
                 View all
              </Button>
           </CardHeader>
           <Divider className="my-4 mx-8 w-auto opacity-50" />
           <CardBody className="px-8 pb-8">
              {ongoingEnquiries.length > 0 ? (
                 <div className="space-y-4">
                    {ongoingEnquiries.map((item: any) => (
                       <div key={item._id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border db-border-subtle db-inset hover:db-subtle transition-all group">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                                {String(item._id).slice(-2).toUpperCase()}
                             </div>
                             <div>
                                <div className="text-[11px] font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">
                                   Enquiry #{String(item._id).slice(-6).toUpperCase()}
                                </div>
                                <div className="text-[10px] text-default-400 font-bold uppercase tracking-tight mt-0.5">
                                   {item.buyerAssociateId?.name || "Anonymous Buyer"}
                                </div>
                             </div>
                          </div>
                          <div className="flex items-center gap-6 mt-4 md:mt-0">
                             <div className="flex flex-col items-end">
                                <span className="text-[9px] font-black uppercase tracking-widest text-default-400">Status</span>
                                 <Chip size="sm" variant="flat" color="primary" className="h-6 font-bold uppercase text-[9px] border-none bg-primary/10">
                                   {dashboardCopy(String(item.status || ""))}
                                </Chip>
                             </div>
                             <Button 
                                size="sm" 
                                variant="flat" 
                                className="h-9 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px] border db-border-subtle"
                                onPress={() => {
                                  const targetId = String(item?._id || item?.id || "").trim();
                                  if (!isValidObjectId(targetId)) return;
                                  router.push(`/dashboard/enquiries/${targetId}`);
                                }}
                             >
                                Open
                             </Button>
                          </div>
                       </div>
                    ))}
                 </div>
              ) : (
                 <div className="py-12 text-center text-[11px] font-bold text-default-400 italic">No ongoing enquiries detected in your pipeline.</div>
              )}
           </CardBody>
        </Card>

        <Card className="border db-border-subtle shadow-sm db-panel rounded-3xl overflow-hidden">
          <CardHeader className="px-6 pt-6">
            <h4 className="font-semibold text-foreground">My Assigned Company Worklist</h4>
          </CardHeader>
          <Divider className="my-4" />
          <CardBody className="px-6 pb-6">
            <EssentialTabContent essentialName="researchedCompany" filter={{ submittedByOperator: user?.id }} hideAdd={true} />
          </CardBody>
        </Card>

        <Card className="border db-border-subtle shadow-sm db-panel rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-col gap-1 px-6 pt-6">
            <h4 className="font-semibold text-foreground">Directory Lookup</h4>
            <p className="text-xs text-default-500">Check whether a company or associate already exists in the system.</p>
          </CardHeader>
          <Divider className="my-4" />
          <CardBody className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-6 pb-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-semibold text-foreground uppercase tracking-tight">Company Finder</h5>
                <span className="text-xs text-default-500 font-bold">{directoryCompanies.length} total</span>
              </div>
              <input
                value={companyLookup}
                onChange={(event) => setCompanyLookup(event.target.value)}
                placeholder="Search company name"
                className="w-full rounded-2xl border db-border-subtle db-subtle px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none transition-all"
              />
              <div className="space-y-2">
                {companyNeedle ? (
                  matchedCompanies.length ? (
                    matchedCompanies.slice(0, 6).map((item: any) => (
                      <div key={item?._id} className="flex items-center justify-between rounded-xl border db-border-subtle db-panel px-3 py-2.5 text-xs text-default-600 hover:border-primary/30 transition-colors">
                        <span className="font-bold text-foreground">{item?.name}</span>
                        <span className="text-[10px] uppercase font-black text-default-400">ID: {String(item?._id || "").slice(-6)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-default-500 italic">No companies found for that search.</p>
                  )
                ) : (
                  <p className="text-[10px] text-default-400 uppercase font-black tracking-widest">Awaiting input...</p>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-semibold text-foreground uppercase tracking-tight">Associate Finder</h5>
                <span className="text-xs text-default-500 font-bold">{directoryAssociates.length} total</span>
              </div>
              <input
                value={associateLookup}
                onChange={(event) => setAssociateLookup(event.target.value)}
                placeholder="Search associate name"
                className="w-full rounded-2xl border db-border-subtle db-subtle px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none transition-all"
              />
              <div className="space-y-2">
                {associateNeedle ? (
                  matchedAssociates.length ? (
                    matchedAssociates.slice(0, 6).map((item: any) => (
                      <div key={item?._id} className="flex items-center justify-between rounded-xl border db-border-subtle db-panel px-3 py-2.5 text-xs text-default-600 hover:border-primary/30 transition-colors">
                        <span className="font-bold text-foreground">{item?.name}</span>
                        <span className="text-[10px] font-bold text-default-400">{item?.email || "No email"}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-default-500 italic">No associates found for that search.</p>
                  )
                ) : (
                  <p className="text-[10px] text-default-400 uppercase font-black tracking-widest">Awaiting input...</p>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

      </>
    );
  };

  return (
    <div className="w-full p-4 md:p-6 space-y-8">
      <Card className={`border border-slate-200/90 dark:border-white/10 bg-content1 shadow-sm overflow-hidden ${isAssociate ? "rounded-2xl" : "rounded-[2.5rem]"}`}>
        <CardBody className={isAssociate ? "p-5 sm:p-6" : "p-8"}>
          <div className="flex flex-col gap-6">
            {/* Top Row: Workspace Status & Role Badges */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-default-200/60 dark:border-white/10">
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-obaol-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-obaol-500"></span>
                  </span>
                  <span className="text-[10px] font-black tracking-widest uppercase text-obaol-700 dark:text-obaol-400">Workspace ready</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-foreground uppercase italic">{hubTitle}</h1>
                <p className="text-xs md:text-sm text-default-500 font-semibold tracking-tight">
                  Welcome, <span className="text-foreground">{welcomeName}</span>. {hubSubtitle}
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-center">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-default-200/80 dark:border-white/10 bg-default-100/50 dark:bg-white/5 text-[10px] font-black uppercase tracking-wider text-foreground/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-obaol-500" />
                  {isAssociate ? (companyCapabilities.length ? "Capability-led company" : "Company profile setup") : isOperatorUser ? "Operator" : "Admin"}
                </div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-primary-500/30 bg-primary-500/10 text-[10px] font-black uppercase tracking-wider text-primary-600 dark:text-primary-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                  {activeOrders} Active Orders
                </div>
              </div>
            </div>

            {/* Bottom Row: Unified Command Bar */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              <div className="w-full lg:max-w-xl flex-1">
                <GlobalSearch />
              </div>

            </div>
          </div>
        </CardBody>
      </Card>

      {executiveLoading && !isAssociate ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx} className="border db-border-subtle db-panel">
              <CardBody className="p-5 space-y-3">
                <Skeleton className="h-4 w-2/3 rounded-lg" />
                <Skeleton className="h-8 w-1/2 rounded-lg" />
                <Skeleton className="h-3 w-full rounded-lg" />
              </CardBody>
            </Card>
          ))}
        </div>
      ) : null}

      {executiveError ? (
        <Card className="border border-danger-500/25 bg-danger-500/10">
          <CardBody className="text-sm text-danger-600 dark:text-danger-300">
            Unable to load role metrics right now. Core dashboard actions are still available below.
          </CardBody>
        </Card>
      ) : null}

      {isAdmin && renderAdminDashboard()}
      {isAssociate && renderAssociateDashboard()}
      {isOperatorUser && !isAdmin && !isAssociate && renderOperatorDashboard()}
    </div>
  );
};

export default Dashboard;
