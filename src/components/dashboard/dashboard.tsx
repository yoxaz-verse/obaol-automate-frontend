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
import GlobalSearch from "./GlobalSearch";
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
  const hubTitle = isAdmin ? "Admin Panel" : isOperatorUser ? "Operations Hub" : "Associate Hub";
  const hubSubtitle = isAdmin
    ? "System oversight active."
    : isOperatorUser
      ? "Mission overview active."
      : "Account overview active.";

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
    <Card className="lg:col-span-2 border border-foreground/5 shadow-none bg-foreground/[0.02] backdrop-blur-3xl rounded-[2rem]">
      <CardHeader className="px-8 pt-8">
        <div className="flex flex-col gap-1">
          <h4 className="font-bold text-foreground">Task Overview</h4>
          <p className="text-[10px] font-semibold text-default-400 uppercase tracking-widest opacity-60">Management priorities and active triggers.</p>
        </div>
      </CardHeader>
      <Divider className="my-4 mx-8 w-auto opacity-50" />
      <CardBody className="px-8 pb-8 space-y-4">
        {actionCenterItems.map((item) => (
           <div key={item.label} className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-foreground/5 rounded-2xl p-4 bg-foreground/[0.01] hover:bg-foreground/[0.03] transition-all">
             <div className="min-w-0">
               <div className="flex items-center gap-3">
                 <span className="text-sm font-black text-foreground uppercase tracking-tight">{item.label}</span>
                 <Chip size="sm" variant="flat" color={item.color} className="font-bold border-none h-6 bg-foreground/5">
                   {item.value}
                 </Chip>
               </div>
               <p className="text-[11px] font-medium text-default-500 mt-1 opacity-70 group-hover:opacity-100 transition-opacity">{item.detail}</p>
             </div>
             <Button
               size="sm"
               variant="flat"
               color={item.color}
               className="h-9 min-w-24 rounded-xl font-bold uppercase tracking-wider text-[10px] border border-foreground/5 shadow-sm"
               endContent={<LuChevronRight className="w-3.5 h-3.5" />}
               onPress={() => router.push(item.route)}
             >
               Open Hub
             </Button>
           </div>
         ))}

         {isAssociate && (
            <div className="flex flex-col gap-1.5 p-5 bg-primary/5 border border-primary/10 rounded-2xl group transition-all hover:bg-primary/10">
               <div className="flex items-center gap-2 mb-1">
                  <LuZap className="text-primary" size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">Modular Service Request</span>
               </div>
               <div className="flex items-center justify-between gap-4">
                  <p className="text-[11px] font-semibold text-default-600 leading-tight">Create specialized procurement, packaging, or custom transit protocols.</p>
                  <Button 
                    size="sm" 
                    color="primary" 
                    variant="flat" 
                    className="h-8 rounded-lg font-bold text-[10px] uppercase tracking-widest"
                    onPress={() => router.push("/dashboard/execution-enquiries?tab=service-requests")}
                  >
                     Initiate
                  </Button>
               </div>
            </div>
         )}

         {isAssociate && associateActionRequired > 0 && (
            <div className="p-5 bg-danger/5 border border-danger/10 rounded-2xl animate-in slide-in-from-right duration-500">
               <div className="flex items-center gap-2 mb-3">
                  <LuAlertIcon className="text-danger" size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-danger">Urgency Protocol Required</span>
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

         <div className="border border-foreground/[0.05] rounded-2xl p-4 bg-foreground/[0.01]">
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
    <Card className="border border-foreground/5 shadow-none bg-foreground/[0.02] backdrop-blur-3xl rounded-[2rem]">
      <CardHeader className="px-8 pt-8">
        <h4 className="font-bold text-foreground">Flux Telemetry</h4>
      </CardHeader>
      <Divider className="my-4 mx-8 w-auto opacity-50" />
      <CardBody className="px-8 pb-8 space-y-4">
        {enquiriesQuery.isLoading || ordersQuery.isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="space-y-3">
              <Skeleton className="h-4 w-2/3 rounded-lg" />
              <Skeleton className="h-3 w-1/2 rounded-lg opacity-60" />
            </div>
          ))
        ) : activityFeed.length > 0 ? (
          activityFeed.map((item) => (
            <div key={`${item.type}-${item.id}`} className="text-sm flex items-center justify-between gap-4 p-2 rounded-xl border border-transparent hover:border-foreground/5 hover:bg-foreground/[0.01] transition-all group">
              <div className="min-w-0">
                <div className="font-bold text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">
                  {item.type} <span className="text-[10px] text-default-400 ml-1 font-medium">{String(item.id || "").slice(-6).toUpperCase()}</span>
                </div>
                <div className="text-[10px] text-default-500 uppercase tracking-widest font-bold opacity-60">{String(item.status || "").replace(/_/g, " ")}</div>
              </div>
              <span className="text-[9px] font-bold text-default-400 bg-foreground/5 px-2 py-1 rounded-md uppercase tracking-widest whitespace-nowrap">
                {new Date(item.at).toLocaleDateString()}
              </span>
            </div>
          ))
        ) : (
          <div className="text-[11px] font-medium text-default-500 italic opacity-60">
            {isAssociate
              ? "No associate telemetry detected. Initialize marketplace interaction."
              : isOperatorUser
                ? "No assigned activity telemetry. Check company mappings."
                : "No recent activity detected in the flux stream."}
          </div>
        )}
      </CardBody>
    </Card>
  );


  const renderPartialService = () => (
    (isAdmin || isAssociate || isOperatorUser) ? (
      <Card className="border border-foreground/5 shadow-none bg-foreground/[0.02] backdrop-blur-3xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 p-10">
          <div className="flex-1">
             <div className="flex items-center gap-3 mb-3">
               <div className="w-1.5 h-1.5 bg-primary rounded-full" />
               <span className="text-[10px] font-bold tracking-widest uppercase text-primary">Service Modularization</span>
             </div>
            <h4 className="font-bold text-2xl tracking-tight text-foreground mb-2">Need a Specific Logistics Core?</h4>
            <p className="text-sm text-default-500 max-w-lg leading-relaxed font-medium">
              Create a partial service request for localized procurement, high-spec packaging, testing, transit, or customs clearance.
            </p>
          </div>
          <Button
            color="primary"
            size="lg"
            className="h-14 px-10 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
            endContent={<LuArrowRight size={18} />}
            onPress={() => router.push("/dashboard/execution-enquiries?tab=service-requests")}
          >
            Create Modular Service
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
      BUYER: { label: "Buyer", icon: <LuShoppingBag size={14} /> },
      SUPPLIER: { label: "Supplier", icon: <LuPackage size={14} /> },
      PROCUREMENT_PARTNER: { label: "Procurement", icon: <LuSearch size={14} /> },
      PACKAGING_PARTNER: { label: "Packaging", icon: <LuBox size={14} /> },
      LOGISTICS_PARTNER: { label: "Inland Transportation", icon: <LuTruck size={14} /> },
      INLAND_TRANSPORTATION: { label: "Inland Transportation", icon: <LuTruck size={14} /> },
      OCEAN_FREIGHT: { label: "Ocean Freight", icon: <LuAnchor size={14} /> },
      SEA_FREIGHT_FORWARDING: { label: "Ocean Freight", icon: <LuAnchor size={14} /> },
      AIR_FREIGHT: { label: "Air Freight", icon: <LuSend size={14} /> },
      AIR_FREIGHT_FORWARDING: { label: "Air Freight", icon: <LuSend size={14} /> },
      CUSTOMS_CLEARANCE: { label: "Customs", icon: <LuShield size={14} /> },
      WAREHOUSING: { label: "Warehousing", icon: <LuLayers size={14} /> },
      QUALITY_TESTING_PARTNER: { label: "Quality", icon: <LuCheck size={14} /> },
      CERTIFICATION_PARTNER: { label: "Certification", icon: <LuCheck size={14} /> },
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
    const hasLogistics = interests.includes("LOGISTICS_PARTNER") || interests.includes("INLAND_TRANSPORTATION");
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
            icon={item.color === "warning" ? <LuClock size={18} /> : item.color === "primary" ? <LuActivity size={18} /> : <LuShoppingBag size={18} />}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <InsightCard
          title="Action Required"
          metric={associateActionRequired.toLocaleString()}
          icon={<LuClock size={18} />}
          footer={<span className="text-xs text-default-500">Pending your accept/confirm actions</span>}
        />
        <InsightCard
          title="Buying Enquiries"
          metric={(Number(associateMetrics.totalInquiries || associateBuyingCount) || 0).toLocaleString()}
          icon={<LuShoppingBag size={18} />}
          footer={<span className="text-xs text-default-500">Enquiries where you are buyer-side</span>}
        />
        <InsightCard
          title="Selling Enquiries"
          metric={associateSellingCount.toLocaleString()}
          icon={<LuPackage size={18} />}
          footer={<span className="text-xs text-default-500">Enquiries where you are supplier-side</span>}
        />
        <InsightCard
          title="Active Orders"
          metric={activeOrders.toLocaleString()}
          icon={<LuTrendingUp size={18} />}
          footer={<span className="text-xs text-default-500">Orders currently active</span>}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border border-foreground/5 shadow-none bg-foreground/[0.02] backdrop-blur-3xl rounded-xl overflow-hidden group">
          <CardBody className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-foreground text-xs">Execution Panel</h4>
              <LuActivity className="text-default-400" size={14} />
            </div>
            <p className="text-[9px] text-default-500 font-medium leading-tight line-clamp-2">{getAssociateOpsHint("execution")}</p>
            <Button size="sm" variant="flat" color="primary" className="h-7 w-full rounded-lg font-bold uppercase tracking-wider text-[8px]" onPress={() => router.push("/dashboard/execution-enquiries")}>
              Control Feed
            </Button>
          </CardBody>
        </Card>
        <Card className="border border-foreground/5 shadow-none bg-foreground/[0.02] backdrop-blur-3xl rounded-xl overflow-hidden group">
          <CardBody className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-foreground text-xs">Documents</h4>
              <LuCheck className="text-default-400 group-hover:text-primary transition-colors" size={14} />
            </div>
            <p className="text-[9px] text-default-500 font-medium leading-tight line-clamp-2">{getAssociateOpsHint("documents")}</p>
            <Button size="sm" variant="flat" color="primary" className="h-7 w-full rounded-xl font-bold uppercase tracking-wider text-[8px]" onPress={() => router.push("/dashboard/documents")}>
              Protocol Hub
            </Button>
          </CardBody>
        </Card>
        <Card className="border border-foreground/5 shadow-none bg-foreground/[0.02] backdrop-blur-3xl rounded-xl overflow-hidden group">
          <CardBody className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-foreground text-xs">Enquiries</h4>
              <LuShoppingBag className="text-default-400 group-hover:text-primary transition-colors" size={14} />
            </div>
            <p className="text-[9px] text-default-500 font-medium leading-tight line-clamp-2">{getAssociateOpsHint("enquiries")}</p>
            <Button size="sm" variant="flat" color="primary" className="h-7 w-full rounded-xl font-bold uppercase tracking-wider text-[8px]" onPress={() => router.push("/dashboard/enquiries")}>
              Market Stream
            </Button>
          </CardBody>
        </Card>
        <Card className="border border-foreground/5 shadow-none bg-foreground/[0.02] backdrop-blur-3xl rounded-xl overflow-hidden group">
          <CardBody className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-foreground text-xs">Orders</h4>
              <LuPackage className="text-default-400 group-hover:text-primary transition-colors" size={14} />
            </div>
            <p className="text-[9px] text-default-500 font-medium leading-tight line-clamp-2">{getAssociateOpsHint("orders")}</p>
            <Button size="sm" variant="flat" color="primary" className="h-7 w-full rounded-xl font-bold uppercase tracking-wider text-[8px]" onPress={() => router.push("/dashboard/orders")}>
              Active Missions
            </Button>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
           <Card className="border border-foreground/5 shadow-none bg-foreground/[0.02] backdrop-blur-3xl rounded-[2rem] overflow-hidden">
              <CardHeader className="px-8 pt-8">
                 <div className="flex items-center gap-2">
                    <LuRadioIcon className="text-primary animate-pulse" size={18} />
                    <h4 className="font-black text-foreground uppercase tracking-widest text-[11px]">Intelligence Stream</h4>
                 </div>
              </CardHeader>
              <Divider className="my-4 mx-8 w-auto opacity-50" />
              <CardBody className="px-8 pb-8 space-y-4">
                 <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                       <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">System Update</span>
                       <p className="text-xs font-bold text-foreground leading-snug">Autonomous marketplace engine v2.0 deployed.</p>
                       <span className="text-[9px] text-default-400 font-medium uppercase tracking-widest">2h ago</span>
                    </div>
                    <div className="flex flex-col gap-1">
                       <span className="text-[9px] font-black uppercase tracking-[0.2em] text-warning-500">Market Insight</span>
                       <p className="text-xs font-bold text-foreground leading-snug">New logistics corridor opened for sea-freight.</p>
                       <span className="text-[9px] text-default-400 font-medium uppercase tracking-widest">5h ago</span>
                    </div>
                    <div className="flex flex-col gap-1">
                       <span className="text-[9px] font-black uppercase tracking-[0.2em] text-success-500">Engagement</span>
                       <p className="text-xs font-bold text-foreground leading-snug">Higher volume of enquiries detected in your region.</p>
                       <span className="text-[9px] text-default-400 font-medium uppercase tracking-widest">1d ago</span>
                    </div>
                 </div>
              </CardBody>
           </Card>

           <Card className="border border-foreground/5 shadow-none bg-foreground/10 backdrop-blur-3xl rounded-[2rem] overflow-hidden group cursor-pointer hover:bg-foreground/20 transition-all border-dashed">
              <CardBody className="p-8 flex items-center justify-between">
                 <div className="flex flex-col gap-1">
                    <h4 className="font-black text-foreground uppercase tracking-widest text-[10px]">History Log</h4>
                    <p className="text-xs text-default-500 font-medium">Review your telemetry.</p>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center text-foreground opacity-50 group-hover:opacity-100 transition-opacity">
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
    const ongoingEnquiries = enquiries.filter((item: any) => {
      const assigned = (item?.assignedOperatorId?._id || item?.assignedOperatorId)?.toString() === userId
        || (item?.createdBy?._id || item?.createdBy)?.toString() === userId;
      if (!assigned) return false;
      const status = String(item?.status || "").toUpperCase();
      return !["COMPLETED", "CLOSED", "CANCELLED"].includes(status);
    }).slice(0, 5);

    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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
            footer={<span className="text-xs text-default-500">Assigned products not yet live</span>}
          />
          <InsightCard
            title="Assigned Products"
            metric={`${liveAssignedProducts}/${totalAssignedProducts}`}
            icon={<LuBox size={18} />}
            footer={<span className="text-xs text-default-500">Live products out of assigned products</span>}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {renderActionCenter()}
          {renderRecentActivity()}
        </div>

        <Card className="border border-foreground/5 shadow-none bg-foreground/[0.02] backdrop-blur-3xl rounded-[2rem] overflow-hidden">
           <CardHeader className="px-8 pt-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                 <h4 className="font-black text-foreground uppercase tracking-widest text-[11px]">Ongoing Enquiry Pipeline</h4>
              </div>
              <Button size="sm" variant="light" className="text-[10px] font-bold uppercase tracking-widest" onPress={() => router.push("/dashboard/enquiries")}>
                 Full Feed
              </Button>
           </CardHeader>
           <Divider className="my-4 mx-8 w-auto opacity-50" />
           <CardBody className="px-8 pb-8">
              {ongoingEnquiries.length > 0 ? (
                 <div className="space-y-4">
                    {ongoingEnquiries.map((item: any) => (
                       <div key={item._id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border border-foreground/5 bg-foreground/[0.01] hover:bg-foreground/[0.03] transition-all group">
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
                                   {String(item.status).replace(/_/g, " ")}
                                </Chip>
                             </div>
                             <Button 
                                size="sm" 
                                variant="flat" 
                                className="h-9 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px] border border-foreground/5"
                                onPress={() => router.push(`/dashboard/enquiries/${item._id}`)}
                             >
                                Track
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

        <Card className="border border-default-100 shadow-sm bg-content1/70 rounded-3xl overflow-hidden">
          <CardHeader className="px-6 pt-6">
            <h4 className="font-semibold text-foreground">My Assigned Company Worklist</h4>
          </CardHeader>
          <Divider className="my-4" />
          <CardBody className="px-6 pb-6">
            <EssentialTabContent essentialName="researchedCompany" filter={{ submittedByOperator: user?.id }} hideAdd={true} />
          </CardBody>
        </Card>

        <Card className="border border-default-100 shadow-sm bg-content1/70 rounded-3xl overflow-hidden">
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
                className="w-full rounded-2xl border border-default-200 bg-content2 px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none transition-all"
              />
              <div className="space-y-2">
                {companyNeedle ? (
                  matchedCompanies.length ? (
                    matchedCompanies.slice(0, 6).map((item: any) => (
                      <div key={item?._id} className="flex items-center justify-between rounded-xl border border-default-200/50 bg-content1 px-3 py-2.5 text-xs text-default-600 hover:border-primary/30 transition-colors">
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
                className="w-full rounded-2xl border border-default-200 bg-content2 px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none transition-all"
              />
              <div className="space-y-2">
                {associateNeedle ? (
                  matchedAssociates.length ? (
                    matchedAssociates.slice(0, 6).map((item: any) => (
                      <div key={item?._id} className="flex items-center justify-between rounded-xl border border-default-200/50 bg-content1 px-3 py-2.5 text-xs text-default-600 hover:border-primary/30 transition-colors">
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

        {renderPartialService()}
      </>
    );
  };

  return (
    <div className="w-full p-4 md:p-6 space-y-8">
      <Card className="border border-foreground/5 shadow-none bg-foreground/[0.04] backdrop-blur-3xl rounded-[2.5rem] overflow-hidden">
        <CardBody className="p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                 <span className="text-[10px] font-black tracking-widest uppercase text-primary">System Online</span>
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
              <div className="hidden md:block h-6 w-px bg-foreground/5" />
              <div className="flex items-center gap-2.5">
                <Chip variant="flat" className="h-10 rounded-full font-black uppercase tracking-[0.1em] text-[9px] px-5 bg-foreground/5 border border-foreground/5">
                  {role || "User"}
                </Chip>
                <Chip variant="flat" color="primary" className="h-10 rounded-full font-black uppercase tracking-[0.1em] text-[9px] px-5 border border-primary/20">
                  {activeOrders} Active Missions
                </Chip>
              </div>
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
