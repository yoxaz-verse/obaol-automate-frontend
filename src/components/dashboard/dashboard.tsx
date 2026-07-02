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
  Progress,
  Skeleton,
} from "@nextui-org/react";
import {
  LuActivity,
  LuArrowRight,
  LuBox,
  LuCheck,
  LuClock,
  LuLayers,
  LuPackage,
  LuSearch,
  LuShoppingBag,
  LuAnchor,
  LuSend,
  LuShield,
  LuTruck,
  LuTrendingUp,
  LuUsers,
  LuChevronRight,
  LuPlus,
  LuFileText,
  LuSearch as LuSearchIcon,
  LuZap,
  LuInfo as LuAlertIcon,
  LuHistory,
  LuAirplay as LuRadioIcon
} from "react-icons/lu";
import InsightCard from "./InsightCard";
import AuthContext from "@/context/AuthContext";
import { apiRoutes } from "@/core/api/apiRoutes";
import { getData } from "@/core/api/apiHandler";
import { DEFAULT_STALE_TIME, extractList, useDashboardData } from "@/core/data";
import { useCompanyFunctionDashboard } from "@/core/data/useCompanyFunctionDashboard";
import { sidebarOptions } from "@/utils/utils";
import { dashboardCopy } from "@/utils/dashboardCopy";
import { normalizeTradeMode } from "@/utils/dashboardAccess";
import { getRoleFilteredSidebarOptions } from "@/utils/dashboardNav";

const GlobalSearch = dynamic(() => import("./GlobalSearch"), { ssr: false });
const TrendChart = dynamic(() => import("./TrendChart"), {
  loading: () => <Skeleton className="h-64 w-full rounded-2xl" />,
});
const EssentialTabContent = dynamic(() => import("./Essentials/essential-tab-content"), {
  loading: () => <Skeleton className="h-72 w-full rounded-2xl" />,
});
const CompanyFunctionComponent = dynamic(() => import("./CompanyFunctionComponent"), {
  loading: () => <Skeleton className="h-48 w-full rounded-2xl" />,
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
  const tradeMode = normalizeTradeMode(user?.tradeMode, user?.role);
  const [workspaceFocus, setWorkspaceFocus] = useState<"BUY" | "SELL" | "BOTH">("BOTH");
  const effectiveTradeMode = tradeMode === "BOTH" ? workspaceFocus : tradeMode;
  const isBuyingMode = isAssociate && (effectiveTradeMode === "BUY" || effectiveTradeMode === "BOTH");
  const isSellingMode = isAssociate && (effectiveTradeMode === "SELL" || effectiveTradeMode === "BOTH");
  const hubTitle = isAdmin
    ? "Admin Dashboard"
    : isOperatorUser
      ? "Operator Dashboard"
      : tradeMode === "SERVICE"
        ? "Service Provider Workspace"
      : tradeMode === "BUY"
        ? "Buying Workspace"
        : tradeMode === "SELL"
          ? "Selling Workspace"
          : "Trading Workspace";
  const hubSubtitle = isAdmin
    ? "System overview is ready."
    : isOperatorUser
      ? "Operator overview is ready."
      : tradeMode === "SERVICE"
        ? "Your company services and execution work are ready."
      : tradeMode === "BUY"
        ? "Your buying pipeline and next actions are ready."
        : tradeMode === "SELL"
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

  const companyFunctionDashboard = useCompanyFunctionDashboard({
    companyId: associateCompanyId,
    isAdmin: false,
  });

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

  const filteredOptions = getRoleFilteredSidebarOptions(
    sidebarOptions as any[],
    role,
    tradeMode,
    user?.companyInterests || []
  );

  const prioritizedLinks = useMemo(() => {
    const priorityMap = isAdmin
      ? ["/dashboard/approvals", "/dashboard/enquiries", "/dashboard/orders", "/dashboard/users", "/dashboard/operator/team"]
      : isAssociate
        ? isBuyingMode && !isSellingMode
          ? ["/dashboard/marketplace", "/dashboard/enquiries", "/dashboard/sample-requests", "/dashboard/orders", "/dashboard/documents", "/dashboard/profile"]
          : ["/dashboard/product", "/dashboard/marketplace", "/dashboard/enquiries", "/dashboard/orders", "/dashboard/company", "/dashboard/profile"]
        : isOperatorUser
          ? ["/dashboard/product", "/dashboard/enquiries", "/dashboard/execution-enquiries", "/dashboard/orders", "/dashboard/operator/hierarchy"]
          : ["/dashboard/enquiries", "/dashboard/orders", "/dashboard/product", "/dashboard/profile"];

    return priorityMap
      .map((link) => filteredOptions.find((option) => option.link === link))
      .filter(Boolean) as typeof sidebarOptions;
  }, [filteredOptions, isAdmin, isAssociate, isBuyingMode, isOperatorUser, isSellingMode]);

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
    <Card className="lg:col-span-2 border db-border-subtle shadow-none db-subtle backdrop-blur-3xl rounded-[2rem]">
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

         {isAssociate && associateActionRequired > 0 && (
            <div className="p-5 bg-danger/5 border border-danger/10 rounded-2xl animate-in slide-in-from-right duration-500">
               <div className="flex items-center gap-2 mb-3">
                  <LuAlertIcon className="text-danger" size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-danger">Urgent Action Required</span>
               </div>
               <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                     <span className="text-default-600">High Priority Enquiries</span>
                     <span className="text-danger">{associateActionRequired} Action(s)</span>
                  </div>
                  <Progress value={100} size="sm" color="danger" className="opacity-20" />
               </div>
            </div>
         )}

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
    <Card className="border db-border-subtle shadow-none db-subtle backdrop-blur-3xl rounded-[2rem]">
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

      <Card className="border border-warning-500/20 bg-warning-500/5 rounded-[1.5rem] shadow-none">
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
    <>
      {!user?.companyInterestsConfigured && (
        <Card className="border border-warning-500/30 bg-warning-500/10">
          <CardBody className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h4 className="font-semibold text-warning-600 dark:text-warning-300">
                Configure your company responsibilities to unlock full panels.
              </h4>
              <p className="text-xs text-warning-600/80 dark:text-warning-200/80 mt-1">
                Add your company functions so the dashboard can tailor execution and routing.
              </p>
            </div>
            <Button
              color="warning"
              variant="flat"
              onPress={() => router.push("/dashboard/company")}
            >
              Configure Now
            </Button>
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <InsightCard
          title="Action Required"
          metric={associateActionRequired.toLocaleString()}
          icon={<LuClock size={18} />}
          footer={<span className="text-xs text-default-500">Pending your accept/confirm actions</span>}
        />
        {isBuyingMode && <InsightCard
          title="Buying Enquiries"
          metric={(Number(associateMetrics.totalInquiries || associateBuyingCount) || 0).toLocaleString()}
          icon={<LuShoppingBag size={18} />}
          footer={<span className="text-xs text-default-500">Enquiries where you are buyer-side</span>}
        />}
        {isSellingMode && <InsightCard
          title="Selling Enquiries"
          metric={associateSellingCount.toLocaleString()}
          icon={<LuPackage size={18} />}
          footer={<span className="text-xs text-default-500">Enquiries where you are supplier-side</span>}
        />}
        <InsightCard
          title="Active Orders"
          metric={activeOrders.toLocaleString()}
          icon={<LuTrendingUp size={18} />}
          footer={<span className="text-xs text-default-500">Orders currently active</span>}
        />
      </div>

      {isBuyingMode && !isSellingMode && (
        <Card className="border border-primary-500/20 bg-primary-500/5">
          <CardBody className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-bold text-foreground">Next best action: discover a verified product</h3>
              <p className="mt-1 text-xs text-default-500">Compare live listings, open a product, and create your buying enquiry.</p>
            </div>
            <Button color="primary" onPress={() => router.push("/dashboard/marketplace")}>Browse Marketplace</Button>
          </CardBody>
        </Card>
      )}

      {isSellingMode && <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-default-400">Company Functions</h3>
            <p className="text-xs text-default-500">Panels reflect your company priorities and capabilities.</p>
          </div>
        </div>

        {companyFunctionDashboard.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Card key={idx} className="border db-border-subtle db-panel">
                <CardBody className="space-y-3">
                  <Skeleton className="h-5 w-1/3 rounded-lg" />
                  <Skeleton className="h-4 w-2/3 rounded-lg" />
                  <div className="grid grid-cols-3 gap-2">
                    <Skeleton className="h-14 rounded-xl" />
                    <Skeleton className="h-14 rounded-xl" />
                    <Skeleton className="h-14 rounded-xl" />
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : companyFunctionDashboard.isError ? (
          <Card className="border border-danger-200 bg-danger-50/40">
            <CardBody className="text-sm text-danger-600">
              Unable to load company function panels right now.
            </CardBody>
          </Card>
        ) : companyFunctionDashboard.orderedFunctions.length === 0 ? (
          <Card className="border border-warning-200 bg-warning-50/60">
            <CardBody className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h4 className="font-semibold text-warning-700">No company functions configured yet.</h4>
                <p className="text-xs text-warning-600/80 mt-1">
                  Add company priorities so this dashboard can personalize your workflow.
                </p>
              </div>
              <Button color="warning" variant="flat" onPress={() => router.push("/dashboard/company")}>
                Configure Company
              </Button>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {companyFunctionDashboard.orderedFunctions.map((fn: any) => (
              <CompanyFunctionComponent
                key={fn._id}
                name={fn.name}
                slug={fn.slug}
                priorityRank={fn.priorityRank}
                metrics={fn.metrics}
                recentExecutionInquiries={fn.recentExecutionInquiries}
                recentOrders={fn.recentOrders}
              />
            ))}
          </div>
        )}
      </div>}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
           <Card className="border db-border-subtle shadow-none db-subtle backdrop-blur-3xl rounded-[2rem] overflow-hidden">
              <CardHeader className="px-8 pt-8">
                 <div className="flex items-center gap-2">
                    <LuRadioIcon className="text-primary animate-pulse" size={18} />
                    <h4 className="font-black text-foreground uppercase tracking-widest text-[11px]">Market Updates</h4>
                 </div>
              </CardHeader>
              <Divider className="my-4 mx-8 w-auto opacity-50" />
              <CardBody className="px-8 pb-8 space-y-4">
                 <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                       <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">System Update</span>
                       <p className="text-xs font-bold text-foreground leading-snug">Marketplace update released successfully.</p>
                       <span className="text-[9px] text-default-400 font-medium uppercase tracking-widest">2h ago</span>
                    </div>
                    <div className="flex flex-col gap-1">
                       <span className="text-[9px] font-black uppercase tracking-[0.2em] text-warning-500">Market Insight</span>
                       <p className="text-xs font-bold text-foreground leading-snug">New logistics route opened for sea freight.</p>
                       <span className="text-[9px] text-default-400 font-medium uppercase tracking-widest">5h ago</span>
                    </div>
                    <div className="flex flex-col gap-1">
                       <span className="text-[9px] font-black uppercase tracking-[0.2em] text-success-500">Engagement</span>
                       <p className="text-xs font-bold text-foreground leading-snug">Enquiry volume has increased in your region.</p>
                       <span className="text-[9px] text-default-400 font-medium uppercase tracking-widest">1d ago</span>
                    </div>
                 </div>
              </CardBody>
           </Card>

           <Card className="border db-border-subtle shadow-none db-subtle backdrop-blur-3xl rounded-[2rem] overflow-hidden group cursor-pointer hover:db-inset transition-all border-dashed">
              <CardBody className="p-8 flex items-center justify-between">
                 <div className="flex flex-col gap-1">
                    <h4 className="font-black text-foreground uppercase tracking-widest text-[10px]">History</h4>
                    <p className="text-xs text-default-500 font-medium">Review your recent activity.</p>
                 </div>
                 <div className="w-10 h-10 rounded-full db-inset flex items-center justify-center text-foreground opacity-50 group-hover:opacity-100 transition-opacity">
                    <LuHistory size={20} />
                 </div>
              </CardBody>
           </Card>
        </div>
        <div className="lg:col-span-3 space-y-6">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {renderActionCenter()}
             {renderRecentActivity()}
           </div>
        </div>
      </div>
    </>
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
      <Card className="border db-border-subtle shadow-none db-subtle backdrop-blur-3xl rounded-[2.5rem] overflow-hidden">
        <CardBody className="p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                 <span className="text-[10px] font-black tracking-widest uppercase text-primary">Workspace ready</span>
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-foreground uppercase italic">{hubTitle}</h1>
                <p className="text-sm text-default-500 font-bold uppercase tracking-tight">
                  Welcome, <span className="text-foreground">{welcomeName}</span>. {hubSubtitle}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-5">
              <div className="w-full md:w-auto md:min-w-[320px]">
                <GlobalSearch />
              </div>
              {isAssociate && tradeMode === "BOTH" && (
                <div aria-label="Workspace focus" className="flex rounded-xl border db-border-subtle db-inset p-1">
                  {(["BUY", "SELL", "BOTH"] as const).map((focus) => (
                    <button key={focus} type="button" onClick={() => setWorkspaceFocus(focus)} aria-pressed={workspaceFocus === focus} className={`min-h-9 rounded-lg px-3 text-xs font-bold ${workspaceFocus === focus ? "bg-warning-500 text-slate-950" : "db-muted hover:text-foreground"}`}>
                      {focus === "BUY" ? "Buying" : focus === "SELL" ? "Selling" : "All"}
                    </button>
                  ))}
                </div>
              )}
              <div className="hidden md:block h-6 w-px db-border-subtle border-l" />
              <div className="flex items-center gap-2.5">
                <Chip variant="flat" className="h-10 rounded-full font-black uppercase tracking-[0.1em] text-[9px] px-5 db-inset border db-border-subtle">
                  {isAssociate ? (tradeMode === "BUY" ? "Buyer" : tradeMode === "SELL" ? "Seller" : tradeMode === "SERVICE" ? "Service Provider" : "Buyer & Seller") : isOperatorUser ? "Operator" : "Admin"}
                </Chip>
                <Chip variant="flat" color="primary" className="h-10 rounded-full font-black uppercase tracking-[0.1em] text-[9px] px-5 border border-primary/20">
                  {activeOrders} Active Orders
                </Chip>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {executiveLoading ? (
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
