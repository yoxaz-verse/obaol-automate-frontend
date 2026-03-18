import React, { useCallback, useContext, useMemo } from "react";
import { NextPage } from "next";
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
  FiActivity,
  FiArrowRight,
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
import { apiRoutes } from "@/core/api/apiRoutes";
import { routeRoles } from "@/utils/roleHelpers";
import { sidebarOptions } from "@/utils/utils";

const DEFAULT_STALE_TIME = 45 * 1000;

const Dashboard: NextPage = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const role = String(user?.role || "");
  const roleLower = role.trim().toLowerCase();
  const userId = String(user?.id || "");

  const isAdmin = roleLower === "admin";
  const isAssociate = roleLower === "associate";
  const isOperatorUser = roleLower === "operator" || roleLower === "team";

  const enquiriesQuery = useQuery({
    queryKey: ["dashboardEnquiry", roleLower, userId],
    queryFn: () => getData(apiRoutes.enquiry.getAll, { page: 1, limit: 50 }),
    enabled: !!userId,
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const ordersQuery = useQuery({
    queryKey: ["dashboardOrder", roleLower, userId],
    queryFn: () => getData(apiRoutes.orders.getAll, { page: 1, limit: 50 }),
    enabled: !!userId,
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const trendQuery = useQuery({
    queryKey: ["enquiryTrends"],
    queryFn: () => getData(apiRoutes.analytics.enquiryTrends, {}),
    enabled: !!userId && isAdmin,
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const topProductsQuery = useQuery({
    queryKey: ["productPerformance"],
    queryFn: () => getData(apiRoutes.analytics.productPerformance, { limit: 5 }),
    enabled: !!userId && isAdmin,
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const systemMetricsQuery = useQuery({
    queryKey: ["systemMetrics"],
    queryFn: () => getData(apiRoutes.analytics.systemMetrics, {}),
    enabled: !!userId && isAdmin,
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const associateMetricsQuery = useQuery({
    queryKey: ["associateMetrics", userId],
    queryFn: () => getData(apiRoutes.analytics.associateMetrics, {}),
    enabled: !!userId && isAssociate,
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const operatorMetricsQuery = useQuery({
    queryKey: ["operatorMetrics", userId, roleLower],
    queryFn: () => getData(apiRoutes.analytics.operatorMetrics, {}),
    enabled: !!userId && isOperatorUser,
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const approvalsAssociatesQuery = useQuery({
    queryKey: ["dashboardApprovalsAssociates"],
    queryFn: () =>
      getData(apiRoutes.approvals.associatesList, {
        status: "PENDING_REVIEW",
        page: 1,
        limit: 1,
      }),
    enabled: !!userId && isAdmin,
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const approvalsCompaniesQuery = useQuery({
    queryKey: ["dashboardApprovalsCompanies"],
    queryFn: () =>
      getData(apiRoutes.approvals.companiesList, {
        status: "PENDING_REVIEW",
        page: 1,
        limit: 1,
      }),
    enabled: !!userId && isAdmin,
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
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

  const enquiries = extractList(enquiriesQuery.data);
  const orders = extractList(ordersQuery.data);
  const trendList = extractList(trendQuery.data);
  const topProducts = extractList(topProductsQuery.data);

  const totalEnquiries = extractCount(enquiriesQuery.data, enquiries);
  const totalOrders = extractCount(ordersQuery.data, orders);
  const pendingEnquiries = enquiries.filter((item: any) => {
    const s = String(item?.status || "").toUpperCase();
    return !["COMPLETED", "CLOSED", "CANCELLED", "CONVERTED"].includes(s);
  }).length;
  const convertedEnquiries = enquiries.filter(
    (item: any) => String(item?.status || "").toUpperCase() === "CONVERTED"
  ).length;
  const activeOrders = orders.filter((item: any) => {
    const s = String(item?.status || "").toUpperCase();
    return !["COMPLETED", "CANCELLED"].includes(s);
  }).length;
  const completedOrders = orders.filter(
    (item: any) => String(item?.status || "").toUpperCase() === "COMPLETED"
  ).length;
  const orderCompletionPct = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

  const systemMetrics = systemMetricsQuery.data?.data?.data || {};
  const associateMetrics = associateMetricsQuery.data?.data?.data || {};
  const operatorMetrics = operatorMetricsQuery.data?.data?.data || {};
  const pendingAssociateApprovals = Number(approvalsAssociatesQuery.data?.data?.meta?.total || 0);
  const pendingCompanyApprovals = Number(approvalsCompaniesQuery.data?.data?.meta?.total || 0);
  const pendingApprovalsTotal = pendingAssociateApprovals + pendingCompanyApprovals;

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
    return !item?.sellerAcceptedAt || !item?.buyerConfirmedAt || !isConverted;
  }).length;

  const filteredOptions = sidebarOptions.filter((option) => {
    const allowedRoles = routeRoles[option.link] || [];
    const normalizedAllowed = allowedRoles.map((allowed) => String(allowed).toLowerCase());
    return normalizedAllowed.includes(roleLower);
  });

  const prioritizedLinks = useMemo(() => {
    const priorityMap = isAdmin
      ? ["/dashboard/approvals", "/dashboard/enquiries", "/dashboard/orders", "/dashboard/users", "/dashboard/companyProduct", "/dashboard/operator/team"]
      : isAssociate
        ? ["/dashboard/marketplace", "/dashboard/catalog", "/dashboard/enquiries", "/dashboard/orders", "/dashboard/product", "/dashboard/profile"]
        : isOperatorUser
          ? ["/dashboard/companyProduct", "/dashboard/product", "/dashboard/enquiries", "/dashboard/execution-enquiries", "/dashboard/orders", "/dashboard/operator/hierarchy"]
          : ["/dashboard/enquiries", "/dashboard/orders", "/dashboard/product", "/dashboard/profile"];

    return priorityMap
      .map((link) => filteredOptions.find((option) => option.link === link))
      .filter(Boolean) as typeof sidebarOptions;
  }, [filteredOptions, isAdmin, isAssociate, isOperatorUser]);

  const isEnquiryRelevantForRole = useCallback((item: any) => {
    if (isAdmin) return true;
    if (isAssociate) {
      return (
        (item?.buyerAssociateId?._id || item?.buyerAssociateId)?.toString() === userId ||
        (item?.sellerAssociateId?._id || item?.sellerAssociateId)?.toString() === userId ||
        (item?.mediatorAssociateId?._id || item?.mediatorAssociateId)?.toString() === userId
      );
    }
    if (isOperatorUser) {
      return (
        (item?.assignedOperatorId?._id || item?.assignedOperatorId)?.toString() === userId ||
        (item?.createdBy?._id || item?.createdBy)?.toString() === userId
      );
    }
    return true;
  }, [isAdmin, isAssociate, isOperatorUser, userId]);

  const isOrderRelevantForRole = useCallback((item: any) => {
    if (isAdmin) return true;
    if (isOperatorUser) {
      return (
        (item?.assignedOperatorId?._id || item?.assignedOperatorId)?.toString() === userId ||
        (item?.createdBy?._id || item?.createdBy)?.toString() === userId
      );
    }
    if (isAssociate) {
      return (
        (item?.buyerAssociateId?._id || item?.buyerAssociateId)?.toString() === userId ||
        (item?.sellerAssociateId?._id || item?.sellerAssociateId)?.toString() === userId ||
        (item?.mediatorAssociateId?._id || item?.mediatorAssociateId)?.toString() === userId
      );
    }
    return true;
  }, [isAdmin, isAssociate, isOperatorUser, userId]);

  const activityFeed = useMemo(() => {
    const enquiryFeed = enquiries
      .filter(isEnquiryRelevantForRole)
      .slice(0, 4)
      .map((item: any) => ({
        type: "Enquiry",
        id: item?._id,
        status: item?.status || "Pending",
        at: item?.updatedAt || item?.createdAt,
      }));
    const orderFeed = orders
      .filter(isOrderRelevantForRole)
      .slice(0, 4)
      .map((item: any) => ({
        type: "Order",
        id: item?._id,
        status: item?.status || "Procuring",
        at: item?.updatedAt || item?.createdAt,
      }));
    return [...enquiryFeed, ...orderFeed]
      .filter((item) => item.id && item.at)
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 6);
  }, [enquiries, orders, isEnquiryRelevantForRole, isOrderRelevantForRole]);

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
          detail: "Missing seller/buyer confirmations or conversion",
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
      ];
    }

    if (isAssociate) {
      return [
        {
          label: "Action required enquiries",
          value: associateActionRequired,
          detail: "Pending accept/confirm actions",
          route: "/dashboard/enquiries",
          color: "warning" as const,
        },
        {
          label: "Catalog opportunities",
          value: Number(associateMetrics.obaolCatalogCount || 0),
          detail: "Rates available in OBAOL catalog",
          route: "/dashboard/marketplace",
          color: "primary" as const,
        },
        {
          label: "Live catalog products",
          value: Number(associateMetrics.liveProducts || 0),
          detail: "Your live listed products",
          route: "/dashboard/product",
          color: "success" as const,
        },
      ];
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
          detail: "Assigned products not yet live",
          route: "/dashboard/product",
          color: "primary" as const,
        },
        {
          label: "Assigned companies",
          value: Number(operatorMetrics.assignedCompanies || 0),
          detail: "Companies currently mapped to you",
          route: "/dashboard/companyProduct",
          color: "success" as const,
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
    operatorMetrics.assignedCompanies,
    operatorMetrics.liveAssignedProducts,
    operatorMetrics.pendingAssignedEnquiries,
    operatorMetrics.totalAssignedProducts,
    isAdmin,
    isAssociate,
    isOperatorUser,
    pendingApprovalsTotal,
    pendingAssociateApprovals,
    pendingCompanyApprovals,
  ]);

  const pendingActionsList = useMemo(() => {
    const missingLabel = (item: any) => {
      if (!item?.sellerAcceptedAt) return "Awaiting supplier accept";
      if (!item?.buyerConfirmedAt) return "Awaiting buyer confirm";
      return "Awaiting conversion";
    };

    const baseList = enquiries.filter((item: any) => {
      if (isAdmin) {
        const isConverted = String(item?.status || "").toUpperCase() === "CONVERTED";
        return !item?.sellerAcceptedAt || !item?.buyerConfirmedAt || !isConverted;
      }

      if (isAssociate) {
        const isBuying = (item?.buyerAssociateId?._id || item?.buyerAssociateId)?.toString() === userId;
        const isSelling = (item?.sellerAssociateId?._id || item?.sellerAssociateId)?.toString() === userId;
        const sellerPending = isSelling && !item?.sellerAcceptedAt;
        const buyerPending = isBuying && item?.sellerAcceptedAt && !item?.buyerConfirmedAt;
        return sellerPending || buyerPending;
      }

      if (isOperatorUser) {
        const assigned = (item?.assignedOperatorId?._id || item?.assignedOperatorId)?.toString() === userId
          || (item?.createdBy?._id || item?.createdBy)?.toString() === userId;
        if (!assigned) return false;
        const status = String(item?.status || "").toUpperCase();
        return !["COMPLETED", "CLOSED", "CANCELLED", "CONVERTED"].includes(status);
      }

      return false;
    });

    return baseList.slice(0, 10).map((item: any) => ({
      id: item?._id,
      missingStep: missingLabel(item),
    }));
  }, [enquiries, isAdmin, isAssociate, isOperatorUser, userId]);

  const welcomeName = isAssociate
    ? associateMetrics.associateName || user?.email
    : user?.name || user?.email || "User";

  const executiveLoading = isAdmin
    ? systemMetricsQuery.isLoading
    : isAssociate
      ? associateMetricsQuery.isLoading
      : isOperatorUser
        ? operatorMetricsQuery.isLoading
        : enquiriesQuery.isLoading;

  const executiveError = isAdmin
    ? systemMetricsQuery.isError
    : isAssociate
      ? associateMetricsQuery.isError
      : isOperatorUser
        ? operatorMetricsQuery.isError
        : false;

  const renderActionCenter = () => (
    <Card className="lg:col-span-2 border border-default-100 shadow-sm bg-content1/70">
      <CardHeader>
        <h4 className="font-semibold text-foreground">Action Center</h4>
      </CardHeader>
      <Divider />
      <CardBody className="space-y-3">
        {actionCenterItems.map((item) => (
          <div key={item.label} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border border-default-200/60 rounded-xl p-3 bg-content1/70">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{item.label}</span>
                <Chip color={item.color} variant="flat" size="sm">
                  {item.value}
                </Chip>
              </div>
              <p className="text-xs text-default-500 mt-1">{item.detail}</p>
            </div>
            <Button
              size="sm"
              variant="flat"
              color={item.color}
              endContent={<FiArrowRight className="w-3.5 h-3.5" />}
              onPress={() => router.push(item.route)}
            >
              Open
            </Button>
          </div>
        ))}
        <div className="border border-default-200/60 rounded-xl p-3 bg-content1/70">
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
            <div className="text-xs text-default-500">No pending actions right now.</div>
          ) : (
            <div className="space-y-2">
              {pendingActionsList.map((item) => (
                <button
                  key={item.id}
                  className="w-full flex items-center justify-between gap-2 text-left text-xs px-2 py-1.5 rounded-lg hover:bg-default-100/70 transition-colors"
                  onClick={() => router.push(`/dashboard/enquiries/${item.id}`)}
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
    <Card className="border border-default-100 shadow-sm bg-content1/70">
      <CardHeader>
        <h4 className="font-semibold text-foreground">Recent Activity</h4>
      </CardHeader>
      <Divider />
      <CardBody className="space-y-3">
        {enquiriesQuery.isLoading || ordersQuery.isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="space-y-2">
              <Skeleton className="h-4 w-2/3 rounded-lg" />
              <Skeleton className="h-3 w-1/2 rounded-lg" />
            </div>
          ))
        ) : activityFeed.length > 0 ? (
          activityFeed.map((item) => (
            <div key={`${item.type}-${item.id}`} className="text-sm flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="font-medium text-foreground truncate">
                  {item.type} #{String(item.id || "").slice(-6).toUpperCase()}
                </div>
                <div className="text-xs text-default-500 truncate">{item.status}</div>
              </div>
              <Chip size="sm" variant="flat">
                {new Date(item.at).toLocaleDateString()}
              </Chip>
            </div>
          ))
        ) : (
          <div className="text-xs text-default-400">
            {isAssociate
              ? "No associate activity yet. Start from Marketplace or Enquiries."
              : isOperatorUser
                ? "No assigned activity yet. Check your companies and enquiries."
                : "No recent activity available yet."}
          </div>
        )}
      </CardBody>
    </Card>
  );

  const renderShortcuts = () => (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-default-500 mb-3">Priority Shortcuts</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {prioritizedLinks.map((option, index) => (
          <div key={`${option.link}-${index}`} className="aspect-square">
            <DashboardTile data={option} type="view" />
          </div>
        ))}
      </div>
    </div>
  );

  const renderPartialService = () => (
    (isAdmin || isAssociate || isOperatorUser) ? (
      <Card className="border border-default-100 shadow-sm bg-content1/70">
        <CardHeader className="flex items-center justify-between gap-3">
          <div>
            <h4 className="font-semibold text-foreground">Need Only One Service?</h4>
            <p className="text-xs text-default-500">Create a partial service request for procurement, packaging, testing, transport, or customs.</p>
          </div>
          <Button
            color="primary"
            endContent={<FiArrowRight size={14} />}
            onPress={() => router.push("/dashboard/execution-enquiries?tab=service-requests")}
          >
            Create Partial Service
          </Button>
        </CardHeader>
      </Card>
    ) : null
  );

  const renderAdminDashboard = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {actionCenterItems.map((item) => (
          <InsightCard
            key={item.label}
            title={item.label}
            metric={Number(item.value || 0).toLocaleString()}
            icon={item.color === "warning" ? <FiClock size={18} /> : item.color === "primary" ? <FiActivity size={18} /> : <FiShoppingBag size={18} />}
            footer={<span className="text-xs text-default-500">{item.detail}</span>}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <InsightCard
          title="Total Enquiries"
          metric={Number(systemMetrics.totalEnquiries ?? totalEnquiries).toLocaleString()}
          trend={{
            value: `${Number(systemMetrics.newEnquiriesToday ?? 0)} today`,
            isPositive: true,
          }}
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
          {trendQuery.isLoading ? (
            <Card className="h-full border border-default-100 bg-content1/70">
              <CardBody className="p-5 space-y-4">
                <Skeleton className="h-5 w-1/3 rounded-lg" />
                <Skeleton className="h-full w-full rounded-lg" />
              </CardBody>
            </Card>
          ) : trendQuery.isError ? (
            <Card className="h-full border border-danger-200 bg-danger-50/40 dark:bg-danger-500/10">
              <CardBody className="flex items-center justify-center text-sm text-danger-700 dark:text-danger-300">
                Unable to load enquiry trend chart.
              </CardBody>
            </Card>
          ) : (
            <TrendChart
              title="Enquiry Trends (Last 30 Days)"
              data={Array.isArray(trendList) ? trendList : []}
              dataKey="count"
              categoryKey="_id"
              color="#06b6d4"
              type="area"
            />
          )}
        </div>

        <Card className="bg-content1/70 border border-default-100 shadow-sm">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {renderActionCenter()}
        {renderRecentActivity()}
      </div>

      {renderShortcuts()}
      {renderPartialService()}
    </>
  );

  const renderAssociateDashboard = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <InsightCard
          title="Action Required"
          metric={associateActionRequired.toLocaleString()}
          icon={<FiClock size={18} />}
          footer={<span className="text-xs text-default-500">Pending your accept/confirm actions</span>}
        />
        <InsightCard
          title="Buying Enquiries"
          metric={(Number(associateMetrics.totalInquiries || associateBuyingCount) || 0).toLocaleString()}
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
          title="Live Catalog Presence"
          metric={Number(associateMetrics.liveProducts || 0).toLocaleString()}
          icon={<FiTrendingUp size={18} />}
          footer={<span className="text-xs text-default-500">Your currently live products</span>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border border-default-100 shadow-sm bg-content1/70">
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

        <Card className="border border-default-100 shadow-sm bg-content1/70">
          <CardHeader>
            <h4 className="font-semibold text-foreground">Active Orders</h4>
          </CardHeader>
          <Divider />
          <CardBody className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-default-500">Active orders</span>
              <span className="font-semibold">{activeOrders.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-default-500">Completed orders</span>
              <span className="font-semibold">{completedOrders.toLocaleString()}</span>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {renderActionCenter()}
        {renderRecentActivity()}
      </div>

      {renderShortcuts()}
      {renderPartialService()}
    </>
  );

  const renderOperatorDashboard = () => {
    const totalAssignedProducts = Number(operatorMetrics.totalAssignedProducts || 0);
    const liveAssignedProducts = Number(operatorMetrics.liveAssignedProducts || 0);
    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <InsightCard
            title="Pending Assigned Enquiries"
            metric={Number(operatorMetrics.pendingAssignedEnquiries || 0).toLocaleString()}
            icon={<FiClock size={18} />}
            footer={<span className="text-xs text-default-500">Assigned enquiries awaiting next action</span>}
          />
          <InsightCard
            title="Assigned Companies"
            metric={Number(operatorMetrics.assignedCompanies || 0).toLocaleString()}
            icon={<FiUsers size={18} />}
            footer={<span className="text-xs text-default-500">Companies currently mapped to you</span>}
          />
          <InsightCard
            title="Live-rate Gap"
            metric={Math.max(totalAssignedProducts - liveAssignedProducts, 0).toLocaleString()}
            icon={<FiTrendingUp size={18} />}
            footer={<span className="text-xs text-default-500">Assigned products not yet live</span>}
          />
          <InsightCard
            title="Assigned Products"
            metric={`${liveAssignedProducts}/${totalAssignedProducts}`}
            icon={<FiBox size={18} />}
            footer={<span className="text-xs text-default-500">Live products out of assigned products</span>}
          />
        </div>

        <Card className="border border-default-100 shadow-sm bg-content1/70">
          <CardHeader>
            <h4 className="font-semibold text-foreground">My Assigned Company Worklist</h4>
          </CardHeader>
          <Divider />
          <CardBody>
            <EssentialTabContent essentialName="researchedCompany" filter={{ submittedByOperator: user.id }} hideAdd={true} />
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {renderActionCenter()}
          {renderRecentActivity()}
        </div>

        {renderShortcuts()}
        {renderPartialService()}
      </>
    );
  };

  return (
    <div className="w-full p-4 md:p-6 space-y-6">
      <Card className="border-none shadow-md bg-gradient-to-r from-slate-900 via-cyan-900 to-teal-700 text-white">
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Operations Command Center</h1>
              <p className="text-sm md:text-base text-white/85">
                Welcome back, {welcomeName}. Track your priorities, activity, and progress from one screen.
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

      {executiveLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx} className="border border-default-200/60 bg-content1/60">
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
        <Card className="border border-danger-200 bg-danger-50/40 dark:bg-danger-500/10">
          <CardBody className="text-sm text-danger-700 dark:text-danger-300">
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
