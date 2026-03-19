import React, { useCallback, useContext, useMemo, useState } from "react";
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
  FiSearch,
  FiShoppingBag,
  FiAnchor,
  FiSend,
  FiShield,
  FiTruck,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import DashboardTile from "./dashboard-tile";
import InsightCard from "./InsightCard";
import TrendChart from "./TrendChart";
import EssentialTabContent from "./Essentials/essential-tab-content";
import AuthContext from "@/context/AuthContext";
import { apiRoutes } from "@/core/api/apiRoutes";
import { getData } from "@/core/api/apiHandler";
import { DEFAULT_STALE_TIME, extractList, useDashboardData } from "@/core/data";
import { routeRoles } from "@/utils/roleHelpers";
import { sidebarOptions } from "@/utils/utils";

const Dashboard: NextPage = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const role = String(user?.role || "");
  const roleLower = role.trim().toLowerCase();
  const userId = String(user?.id || "");

  const isAdmin = roleLower === "admin";
  const isAssociate = roleLower === "associate";
  const isOperatorUser = roleLower === "operator" || roleLower === "team";

  const [companyLookup, setCompanyLookup] = useState("");
  const [associateLookup, setAssociateLookup] = useState("");

  const {
    enquiriesQuery,
    ordersQuery,
    trendQuery,
    topProductsQuery,
    systemMetricsQuery,
    associateMetricsQuery,
    operatorMetricsQuery,
    approvalsAssociatesQuery,
    approvalsCompaniesQuery,
    enquiries,
    orders,
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

  const companyDirectoryQuery = useQuery({
    queryKey: ["operatorCompanyDirectory", userId],
    queryFn: () => getData(apiRoutes.associateCompany.getAll, { page: 1, limit: 200, sortBy: "name", sortOrder: "asc" }),
    enabled: !!userId && isOperatorUser,
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const associateDirectoryQuery = useQuery({
    queryKey: ["operatorAssociateDirectory", userId],
    queryFn: () => getData(apiRoutes.associate.getAll, { page: 1, limit: 200, sortBy: "name", sortOrder: "asc" }),
    enabled: !!userId && isOperatorUser,
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const directoryCompanies = extractList(companyDirectoryQuery.data);
  const directoryAssociates = extractList(associateDirectoryQuery.data);
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
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 p-5">
          <div className="flex-1">
            <h4 className="font-black text-lg tracking-tight text-foreground mb-1">Need Only One Service?</h4>
            <p className="text-xs text-default-500 max-w-lg leading-relaxed">
              Create a partial service request for procurement, packaging, testing, transport, or customs.
            </p>
          </div>
          <Button
            color="primary"
            size="md"
            className="font-bold w-full sm:w-auto shadow-lg shadow-primary/20"
            endContent={<FiArrowRight size={16} />}
            onPress={() => router.push("/dashboard/execution-enquiries?tab=service-requests")}
          >
            Create Partial Service
          </Button>
        </CardHeader>
      </Card>
    ) : null
  );

  const associateInterestChips = useMemo(() => {
    const rawInterests = Array.isArray(user?.companyInterests)
      ? user?.companyInterests.map((value) => String(value || "").toUpperCase())
      : [];

    const map: Record<string, { label: string; icon: React.ReactNode }> = {
      BUYER: { label: "Buyer", icon: <FiShoppingBag size={14} /> },
      SUPPLIER: { label: "Supplier", icon: <FiPackage size={14} /> },
      PROCUREMENT_PARTNER: { label: "Procurement", icon: <FiSearch size={14} /> },
      PACKAGING_PARTNER: { label: "Packaging", icon: <FiBox size={14} /> },
      LOGISTICS_PARTNER: { label: "Logistics", icon: <FiTruck size={14} /> },
      INLAND_LOGISTICS: { label: "Logistics", icon: <FiTruck size={14} /> },
      OCEAN_FREIGHT: { label: "Ocean Freight", icon: <FiAnchor size={14} /> },
      SEA_FREIGHT_FORWARDING: { label: "Ocean Freight", icon: <FiAnchor size={14} /> },
      AIR_FREIGHT: { label: "Air Freight", icon: <FiSend size={14} /> },
      AIR_FREIGHT_FORWARDING: { label: "Air Freight", icon: <FiSend size={14} /> },
      CUSTOMS_CLEARANCE: { label: "Customs", icon: <FiShield size={14} /> },
      WAREHOUSING: { label: "Warehousing", icon: <FiLayers size={14} /> },
      QUALITY_TESTING_PARTNER: { label: "Quality", icon: <FiCheckCircle size={14} /> },
      CERTIFICATION_PARTNER: { label: "Certification", icon: <FiCheckCircle size={14} /> },
    };

    const seen = new Set<string>();
    const chips = rawInterests
      .map((key) => map[key])
      .filter(Boolean)
      .filter((item) => {
        const token = item.label;
        if (seen.has(token)) return false;
        seen.add(token);
        return true;
      });

    return chips;
  }, [user?.companyInterests]);

  const getAssociateOpsHint = (type: "execution" | "documents" | "enquiries" | "orders") => {
    const interests = Array.isArray(user?.companyInterests)
      ? user?.companyInterests.map((value) => String(value || "").toUpperCase())
      : [];
    const hasLogistics = interests.includes("LOGISTICS_PARTNER") || interests.includes("INLAND_LOGISTICS");
    const hasProcurement = interests.includes("PROCUREMENT_PARTNER");
    const hasPackaging = interests.includes("PACKAGING_PARTNER");
    const hasQuality = interests.includes("QUALITY_TESTING_PARTNER") || interests.includes("CERTIFICATION_PARTNER");

    if (type === "execution") {
      if (hasLogistics) return "Manage shipment execution and delivery coordination.";
      if (hasPackaging) return "Track packaging assignments and readiness.";
      if (hasProcurement) return "Follow procurement execution milestones.";
      return "Monitor execution tasks and fulfillment updates.";
    }
    if (type === "documents") {
      if (hasQuality) return "Track certificates and compliance files.";
      return "Manage deal documents and trade files.";
    }
    if (type === "enquiries") {
      return "Track active enquiries and incoming requests.";
    }
    return "Monitor orders and execution stages.";
  };

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
        {renderActionCenter()}
        {renderRecentActivity()}
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
            <Card className="h-full border border-default-100 bg-content1/70">
              <CardHeader className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground">Enquiry Trends (Last 30 Days)</h4>
                <Button
                  size="sm"
                  variant="flat"
                  color="primary"
                  endContent={<FiArrowRight className="w-3.5 h-3.5" />}
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

      {renderShortcuts()}
      {renderPartialService()}
    </>
  );

  const renderAssociateDashboard = () => (
    <>
      {!user?.companyInterestsConfigured && (
        <Card className="border border-warning-500/30 bg-warning-500/10">
          <CardBody className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h4 className="font-semibold text-warning-700 dark:text-warning-300">
                Configure your company responsibilities to unlock full panels.
              </h4>
              <p className="text-xs text-warning-600/80 dark:text-warning-200/70 mt-1">
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

      <Card className="border border-default-100 shadow-sm bg-content1/70">
        <CardHeader className="pb-2">
          <h4 className="font-semibold text-foreground">Your Roles</h4>
        </CardHeader>
        <Divider />
        <CardBody className="flex flex-wrap gap-2">
          {associateInterestChips.length > 0 ? (
            associateInterestChips.map((chip) => (
              <Chip key={chip.label} color="primary" variant="flat" startContent={chip.icon}>
                {chip.label}
              </Chip>
            ))
          ) : (
            <div className="text-xs text-default-500">No responsibilities configured yet.</div>
          )}
        </CardBody>
      </Card>

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
          title="Active Orders"
          metric={activeOrders.toLocaleString()}
          icon={<FiTrendingUp size={18} />}
          footer={<span className="text-xs text-default-500">Orders currently active</span>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="border border-default-100 shadow-sm bg-content1/70">
          <CardBody className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground">Execution Panel</h4>
              <FiActivity className="text-default-400" />
            </div>
            <p className="text-xs text-default-500">{getAssociateOpsHint("execution")}</p>
            <Button size="sm" variant="flat" color="primary" onPress={() => router.push("/dashboard/execution-enquiries")}>
              Open Execution
            </Button>
          </CardBody>
        </Card>
        <Card className="border border-default-100 shadow-sm bg-content1/70">
          <CardBody className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground">Documents</h4>
              <FiCheckCircle className="text-default-400" />
            </div>
            <p className="text-xs text-default-500">{getAssociateOpsHint("documents")}</p>
            <Button size="sm" variant="flat" color="primary" onPress={() => router.push("/dashboard/documents")}>
              View Documents
            </Button>
          </CardBody>
        </Card>
        <Card className="border border-default-100 shadow-sm bg-content1/70">
          <CardBody className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground">Enquiries</h4>
              <FiShoppingBag className="text-default-400" />
            </div>
            <p className="text-xs text-default-500">{getAssociateOpsHint("enquiries")}</p>
            <Button size="sm" variant="flat" color="primary" onPress={() => router.push("/dashboard/enquiries")}>
              Open Enquiries
            </Button>
          </CardBody>
        </Card>
        <Card className="border border-default-100 shadow-sm bg-content1/70">
          <CardBody className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground">Orders</h4>
              <FiPackage className="text-default-400" />
            </div>
            <p className="text-xs text-default-500">{getAssociateOpsHint("orders")}</p>
            <Button size="sm" variant="flat" color="primary" onPress={() => router.push("/dashboard/orders")}>
              Open Orders
            </Button>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <InsightCard
          title="Marketplace"
          metric={Number(associateMetrics.obaolCatalogCount || 0).toLocaleString()}
          icon={<FiShoppingBag size={18} />}
          footer={<Button size="sm" variant="flat" onPress={() => router.push("/dashboard/marketplace")}>Explore</Button>}
        />
        <InsightCard
          title="Catalog"
          metric={Number(associateMetrics.obaolCatalogCount || 0).toLocaleString()}
          icon={<FiLayers size={18} />}
          footer={<Button size="sm" variant="flat" onPress={() => router.push("/dashboard/catalog")}>View Catalog</Button>}
        />
        <InsightCard
          title="My Products"
          metric={Number(associateMetrics.liveProducts || 0).toLocaleString()}
          icon={<FiPackage size={18} />}
          footer={<Button size="sm" variant="flat" onPress={() => router.push("/dashboard/product")}>Manage</Button>}
        />
        <InsightCard
          title="Inventory"
          metric={Number(associateMetrics.liveProducts || 0).toLocaleString()}
          icon={<FiBox size={18} />}
          footer={<Button size="sm" variant="flat" onPress={() => router.push("/dashboard/inventory")}>Open</Button>}
        />
        <InsightCard
          title="Imports"
          metric="New"
          icon={<FiPackage size={18} />}
          footer={<Button size="sm" variant="flat" onPress={() => router.push("/dashboard/imports")}>Open</Button>}
        />
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

        <Card className="border border-default-100 shadow-sm bg-content1/70">
          <CardHeader className="flex flex-col gap-1">
            <h4 className="font-semibold text-foreground">Directory Lookup</h4>
            <p className="text-xs text-default-500">Check whether a company or associate already exists in the system.</p>
          </CardHeader>
          <Divider />
          <CardBody className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-semibold text-foreground">Company Finder</h5>
                <span className="text-xs text-default-500">{directoryCompanies.length} total</span>
              </div>
              <input
                value={companyLookup}
                onChange={(event) => setCompanyLookup(event.target.value)}
                placeholder="Search company name"
                className="w-full rounded-xl border border-default-200 bg-content2 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
              <div className="space-y-2">
                {companyNeedle ? (
                  matchedCompanies.length ? (
                    matchedCompanies.slice(0, 6).map((item: any) => (
                      <div key={item?._id} className="flex items-center justify-between rounded-lg border border-default-200/70 bg-content1 px-3 py-2 text-xs text-default-600">
                        <span className="font-medium text-foreground">{item?.name}</span>
                        <span className="text-default-500">ID: {String(item?._id || "").slice(-6)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-default-500">No companies found for that search.</p>
                  )
                ) : (
                  <p className="text-xs text-default-500">Type to search company names.</p>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-semibold text-foreground">Associate Finder</h5>
                <span className="text-xs text-default-500">{directoryAssociates.length} total</span>
              </div>
              <input
                value={associateLookup}
                onChange={(event) => setAssociateLookup(event.target.value)}
                placeholder="Search associate name"
                className="w-full rounded-xl border border-default-200 bg-content2 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
              <div className="space-y-2">
                {associateNeedle ? (
                  matchedAssociates.length ? (
                    matchedAssociates.slice(0, 6).map((item: any) => (
                      <div key={item?._id} className="flex items-center justify-between rounded-lg border border-default-200/70 bg-content1 px-3 py-2 text-xs text-default-600">
                        <span className="font-medium text-foreground">{item?.name}</span>
                        <span className="text-default-500">{item?.email || "No email"}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-default-500">No associates found for that search.</p>
                  )
                ) : (
                  <p className="text-xs text-default-500">Type to search associate names.</p>
                )}
              </div>
            </div>
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
