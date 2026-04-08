"use client";

import React, { useState, useMemo, useContext, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Autocomplete,
  AutocompleteItem,
} from "@nextui-org/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getData, patchData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import AuthContext from "@/context/AuthContext";
import { toast } from "react-toastify";
import {
  FiNavigation,
  FiArrowRight,
  FiClock,
  FiUser,
  FiActivity,
  FiCompass,
  FiSearch,
  FiTruck,
  FiAnchor,
  FiShoppingCart,
  FiShield,
  FiZap,
  FiPackage,
  FiGlobe,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";


dayjs.extend(relativeTime);

// Data extraction helper for inconsistent API structures
const extractArray = (response: any) => {
  const axiosData = response?.data;
  if (!axiosData) return [];
  // Case 1: Nested in data.data (standard paginated payload)
  if (Array.isArray(axiosData?.data)) return axiosData.data;
  // Case 2: axiosData itself is the array
  if (Array.isArray(axiosData)) return axiosData;
  // Case 3: Double nested in data.data.data
  if (Array.isArray(axiosData?.data?.data)) return axiosData.data.data;
  // Case 4: Search for ANY property that is an array (fallback for custom keys like 'dealExecutions')
  if (typeof axiosData === "object" && axiosData !== null) {
    const anyArray = Object.values(axiosData).find((val) => Array.isArray(val));
    if (anyArray) return anyArray as any[];
  }
  return [];
};

export default function ExecutionEnquiriesPage() {
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "Admin" || user?.role === "Operator";
  const roleLower = String(user?.role || "").toLowerCase();
  const myCompanyId = String((user as any)?.associateCompany?._id || (user as any)?.associateCompany || "");

  const [activeTab, setActiveTab] = useState("deal-execution");
  const [searchQuery, setSearchQuery] = useState("");
  const [bidMap, setBidMap] = useState<Record<string, string>>({});
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});
  const [selectedExecutionCommitProvider, setSelectedExecutionCommitProvider] = useState<Record<string, string>>({});
  const [selectedExecutionBidProvider, setSelectedExecutionBidProvider] = useState<Record<string, string>>({});
  const [bidLoadingKey, setBidLoadingKey] = useState<string | null>(null);
  const [commitLoadingKey, setCommitLoadingKey] = useState<string | null>(null);
  const [bidErrorMap, setBidErrorMap] = useState<Record<string, string>>({});

  // Data Fetching — deal executions come from inquiries that have executionInquiries embedded
  const { data: dealExecutionsResponse, isLoading: dealsLoading } = useQuery({
    queryKey: ["deal-executions"],
    queryFn: () => getData(apiRoutes.enquiry.getAll, { page: 1, limit: 100, hasExecution: true }),
    enabled: activeTab === "deal-execution" || activeTab === "execution-bidding",
  });

  const { data: subflowResponse } = useQuery({
    queryKey: ["order-subflows"],
    queryFn: () => getData(apiRoutes.orderSubflowConfigs.list),
  });

  const subflowConfigs = useMemo(() => {
    return Array.isArray(subflowResponse?.data?.data) ? subflowResponse?.data?.data : [];
  }, [subflowResponse]);

  // Flatten embedded executionInquiries from enquiry list
  const rawInquiries = useMemo(() => extractArray(dealExecutionsResponse), [dealExecutionsResponse]);

  // Mutations
  const updateTaskMutation = useMutation({
    mutationFn: (payload: { enquiryId: string; type: string; bidAmount?: number; commitNote?: string; committedProvider?: string; status?: string; bidCompanyId?: string }) =>
      patchData(`${apiRoutes.enquiry.getAll}/${payload.enquiryId}/execution-inquiries/${payload.type}`, {
        bidAmount: payload.bidAmount,
        commitNote: payload.commitNote,
        committedProvider: payload.committedProvider,
        status: payload.status,
        bidCompanyId: payload.bidCompanyId,
      }),
    onSuccess: () => {
      toast.success("Task updated successfully");
      queryClient.invalidateQueries({ queryKey: ["deal-executions"] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to update task"),
  });

  const resolveLocationPart = (value: any) => {
    if (!value) return "";
    if (typeof value === "string") {
      if (/^[0-9a-fA-F]{24}$/.test(value)) return "";
      return value;
    }
    if (typeof value === "object") {
      return (
        value.name ||
        value.label ||
        value.title ||
        value.stateName ||
        value.districtName ||
        value.cityName ||
        value.code ||
        ""
      );
    }
    return String(value);
  };
  const resolveAddressLocation = (address: any) => {
    if (!address) return "";
    if (typeof address === "string") return address;
    const parts = [
      resolveLocationPart(address.district || address.districtId || address.districtName),
      resolveLocationPart(address.city || address.cityId || address.cityName),
      resolveLocationPart(address.state || address.stateId || address.stateName),
      resolveLocationPart(address.country || address.countryId || address.countryName),
    ].filter(Boolean);
    return parts.join(", ");
  };
  const resolveExecutionLocation = (ctx: any, prefix: "origin" | "destination") => {
    if (!ctx) return "";
    const parts = [
      resolveLocationPart(ctx[`${prefix}District`]),
      resolveLocationPart(ctx[`${prefix}City`]),
      resolveLocationPart(ctx[`${prefix}State`]),
      resolveLocationPart(ctx[`${prefix}Country`]),
    ].filter(Boolean);
    return parts.join(", ");
  };
  const buildRouteSummary = (tasks: any[]) => {
    if (!Array.isArray(tasks) || tasks.length === 0) return "";
    let routeNote = "";
    let fromDistrict = "";
    for (const task of tasks) {
      if (!routeNote && task?.details?.routeNotes) routeNote = String(task.details.routeNotes);
      if (!fromDistrict && task?.details?.fromDistrict) fromDistrict = String(task.details.fromDistrict);
      if (routeNote && fromDistrict) break;
    }
    if (!routeNote && !fromDistrict) return "";
    const parts = [];
    if (routeNote) parts.push(`Route: ${routeNote}`);
    if (fromDistrict) parts.push(`From: ${fromDistrict}`);
    return parts.join(" • ");
  };

  // Build the enquiry-grouped task list from embedded executionInquiries
  const enquiriesWithTasks = useMemo(() => {
    const results = rawInquiries
      .map((inquiry: any) => {
        const tasks = (inquiry.executionInquiries || []).map((task: any) => ({
          ...task,
          key: `${inquiry._id}-${task.type}`,
          enquiryId: inquiry._id,
        }));
        if (!tasks.length) return null;
        return {
          id: inquiry._id,
          enquiryCode: inquiry.enquiryCode || (inquiry._id ? inquiry._id.slice(-6).toUpperCase() : "N/A"),
          product: inquiry.productId?.name || inquiry.productVariant?.product?.name || "Global Commodity",
          variant: inquiry.productVariant?.name || "Standard Variant",
          workflowStage: inquiry.workflowStage || "",
          status: inquiry.status || "",
          buyer:
            resolveExecutionLocation(inquiry.executionContext, "destination") ||
            resolveAddressLocation(inquiry.buyerAssociateId?.address) ||
            "Unknown Destination",
          seller:
            resolveExecutionLocation(inquiry.executionContext, "origin") ||
            resolveAddressLocation(inquiry.sellerAssociateId?.address) ||
            "Unknown Origin",
          buyerCompanyId: String(inquiry.buyerAssociateId?._id || inquiry.buyerAssociateId || ""),
          sellerCompanyId: String(inquiry.sellerAssociateId?._id || inquiry.sellerAssociateId || ""),
          supplierOperatorId: String(inquiry.supplierOperatorId?._id || inquiry.supplierOperatorId || ""),
          dealCloserOperatorId: String(inquiry.dealCloserOperatorId?._id || inquiry.dealCloserOperatorId || ""),
          tasks,
        };
      })
      .filter(Boolean) as any[];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return results.filter(
        (e) =>
          e.enquiryCode.toLowerCase().includes(q) ||
          e.product.toLowerCase().includes(q) ||
          e.buyer.toLowerCase().includes(q) ||
          e.seller.toLowerCase().includes(q)
      );
    }
    return results;
  }, [rawInquiries, searchQuery]);

  const enquiriesWithOpenTasks = useMemo(() => {
    const results = rawInquiries
      .map((inquiry: any) => {
        const tasks = (inquiry.executionInquiries || [])
          .map((task: any) => ({
            ...task,
            key: `${inquiry._id}-${task.type}`,
            enquiryId: inquiry._id,
          }))
          .filter((task: any) => String(task.status || "").toUpperCase() === "OPEN");
        if (!tasks.length) return null;
        return {
          id: inquiry._id,
          enquiryCode: inquiry.enquiryCode || (inquiry._id ? inquiry._id.slice(-6).toUpperCase() : "N/A"),
          product: inquiry.productId?.name || inquiry.productVariant?.product?.name || "Global Commodity",
          variant: inquiry.productVariant?.name || "Standard Variant",
          workflowStage: inquiry.workflowStage || "",
          status: inquiry.status || "",
          buyer:
            resolveExecutionLocation(inquiry.executionContext, "destination") ||
            resolveAddressLocation(inquiry.buyerAssociateId?.address) ||
            "Unknown Destination",
          seller:
            resolveExecutionLocation(inquiry.executionContext, "origin") ||
            resolveAddressLocation(inquiry.sellerAssociateId?.address) ||
            "Unknown Origin",
          buyerCompanyId: String(inquiry.buyerAssociateId?._id || inquiry.buyerAssociateId || ""),
          sellerCompanyId: String(inquiry.sellerAssociateId?._id || inquiry.sellerAssociateId || ""),
          supplierOperatorId: String(inquiry.supplierOperatorId?._id || inquiry.supplierOperatorId || ""),
          dealCloserOperatorId: String(inquiry.dealCloserOperatorId?._id || inquiry.dealCloserOperatorId || ""),
          tasks,
        };
      })
      .filter(Boolean) as any[];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return results.filter(
        (e) =>
          e.enquiryCode.toLowerCase().includes(q) ||
          e.product.toLowerCase().includes(q) ||
          e.buyer.toLowerCase().includes(q) ||
          e.seller.toLowerCase().includes(q)
      );
    }
    return results;
  }, [rawInquiries, searchQuery]);

  const getName = (obj: any) => obj?.name || obj?.companyName || obj?.email || String(obj || "Unknown Entity");
  const getCompanyId = (obj: any) => String(obj?._id || obj || "");
  const getCompanyLabel = (obj: any) => getName(obj);
  const buildBidCompanyOptions = (bids: any[], candidates: any[]) => {
    const bidCompanies = bids.map((bid: any) => bid?.company).filter(Boolean);
    const base = bidCompanies.length > 0 ? bidCompanies : candidates;
    const obaolCandidate = candidates.find((company: any) => getCompanyLabel(company).toLowerCase().includes("obaol"));
    const merged = [...base];
    if (obaolCandidate) merged.push(obaolCandidate);
    const seen = new Set<string>();
    return merged.filter((company: any) => {
      const id = getCompanyId(company);
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  };
  const buildCommitCompanyOptions = (bids: any[], candidates: any[]) => {
    const bidCompanies = bids.map((bid: any) => bid?.company).filter(Boolean);
    const obaolCandidate = candidates.find((company: any) => getCompanyLabel(company).toLowerCase().includes("obaol"));
    const merged = [...bidCompanies];
    if (obaolCandidate) merged.push(obaolCandidate);
    const seen = new Set<string>();
    return merged.filter((company: any) => {
      const id = getCompanyId(company);
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  };
  const formatDate = (d: any) => (d ? dayjs(d).format("DD MMM, YYYY") : "-");

  const SectionLoader = () => (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-12 h-12 border-2 border-warning-500/20 border-t-warning-500 rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-warning-500 animate-pulse">Syncing Tactical Data</p>
    </div>
  );

  return (
    <section className="w-full min-h-screen p-4 md:p-8 bg-background text-foreground selection:bg-warning-500/30">
      {/* Dynamic Header: Command Interface */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-divider">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-warning-500 text-black shadow-lg shadow-warning-500/20">
              <FiGlobe className="text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter leading-none">Agro Trading Ecosystem</h1>
              <p className="text-xs font-bold text-default-500 mt-2 uppercase tracking-widest opacity-80">Autonomous Service Routing & Logistics Terminal</p>
            </div>
          </div>

          <div className="flex items-center gap-1 mt-4">
            <Button
              size="sm"
              variant={activeTab === "deal-execution" ? "solid" : "light"}
              color={activeTab === "deal-execution" ? "warning" : "default"}
              className={`font-black uppercase tracking-widest text-xs h-9 px-6 rounded-xl transition-all ${activeTab === "deal-execution" ? "shadow-lg shadow-warning-500/20" : "opacity-60"}`}
              onPress={() => setActiveTab("deal-execution")}
            >
              <FiActivity className="mr-2" /> Deal Execution
            </Button>
            <Button
              size="sm"
              variant={activeTab === "execution-bidding" ? "solid" : "light"}
              color={activeTab === "execution-bidding" ? "warning" : "default"}
              className={`font-black uppercase tracking-widest text-xs h-9 px-6 rounded-xl transition-all ${activeTab === "execution-bidding" ? "shadow-lg shadow-warning-500/20" : "opacity-60"}`}
              onPress={() => setActiveTab("execution-bidding")}
            >
              <FiZap className="mr-2" /> Execution Bidding
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Input
            size="sm"
            placeholder="Search Intelligence..."
            radius="full"
            startContent={<FiSearch className="text-default-400" />}
            className="w-full md:w-64"
            classNames={{
              inputWrapper: "bg-default-100/50 backdrop-blur-md border border-divider h-10 px-4",
              input: "text-xs font-bold"
            }}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "deal-execution" ? (
          <motion.div
            key="deal-exec"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-6"
          >
            {dealsLoading && <SectionLoader />}
            {!dealsLoading && enquiriesWithTasks.map((enq) => (
              <motion.div
                key={enq.id}
                layout
                className="group relative overflow-hidden rounded-[2rem] border border-divider bg-default-50/50 backdrop-blur-xl hover:bg-default-100/50 transition-all duration-500"
              >
                <div className="p-6 md:p-8">
                  {/* Enquiry Header Card */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-5">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs font-black uppercase tracking-widest text-warning-600 bg-warning-500/10 px-2 py-0.5 rounded-md">
                            Anchor
                          </span>
                          <span className="text-xs font-black text-default-400">#{enq.enquiryCode}</span>
                          {(enq.workflowStage || enq.status) && (
                            <div className="flex flex-wrap gap-2 ml-2">
                              {enq.workflowStage && (
                                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-default-100 text-default-600 border border-divider">
                                  {String(enq.workflowStage).replaceAll("_", " ")}
                                </span>
                              )}
                              {enq.status && (
                                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-default-100 text-default-600 border border-divider">
                                  {String(enq.status)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter leading-none">{enq.product}</h2>
                        <div className="flex items-center gap-3 mt-2 text-xs font-black text-default-500 uppercase tracking-widest">
                          <span className="opacity-60">{enq.variant}</span>
                          <span className="w-1 h-1 rounded-full bg-divider" />
                          <span className="text-warning-500/80">{enq.tasks.length} Active Nodes</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-10">
                      <div className="hidden lg:flex flex-col text-right">
                        <span className="text-[10px] font-black text-default-400 uppercase tracking-[0.2em] mb-1">Origin</span>
                        <span className="text-sm font-black text-foreground uppercase tracking-tight">{enq.seller}</span>
                      </div>
                      <div className="w-px h-10 bg-divider hidden lg:block" />
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] font-black text-default-400 uppercase tracking-[0.2em] mb-1">Destination</span>
                        <span className="text-sm font-black text-foreground uppercase tracking-tight">{enq.buyer}</span>
                      </div>
                    </div>
                  </div>

                  {/* Task Manifest (Flow View) */}
                  <div className="relative flex flex-col gap-0 border-l-2 border-divider ml-8 pl-8">
                    {enq.tasks.map((task: any, idx: number) => (
                      <div
                        key={task.key}
                        className="relative pb-8 last:pb-0"
                      >
                        {/* Flow Node Pulse */}
                        <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-background border-2 border-warning-500 flex items-center justify-center z-10">
                          <div className={`w-1.5 h-1.5 rounded-full ${task.status === "COMPLETED" ? "bg-success-500" : "bg-warning-500 animate-pulse"}`} />
                        </div>

                        <div className="flex items-start justify-between gap-4 p-5 rounded-2xl bg-background/40 border border-divider hover:border-warning-500/30 transition-all duration-300 group/task">
                          <div className="flex items-center gap-5 min-w-0">
                            <div className={`p-2.5 rounded-xl border border-divider ${task.status === "COMPLETED" ? "bg-success-500/10 text-success-500" : "bg-warning-500/10 text-warning-600"} shrink-0`}>
                              {(() => {
                                const type = String(task.type || "").toUpperCase();
                                if (type.includes("PROCUREMENT")) return <FiShoppingCart className="text-lg" />;
                                if (type.includes("TRANSPORTATION")) return <FiTruck className="text-lg" />;
                                if (type.includes("SHIPPING") || type.includes("PORT")) return <FiAnchor className="text-lg" />;
                                if (type.includes("PACKAGING")) return <FiPackage className="text-lg" />;
                                if (type.includes("TESTING") || type.includes("INSURANCE") || type.includes("CUSTOMS")) return <FiShield className="text-lg" />;
                                return <FiActivity className="text-lg" />;
                              })()}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-black text-foreground tracking-tight uppercase leading-none mb-1">{String(task.type || "").replaceAll("_", " ")}</h4>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-black uppercase tracking-widest ${task.status === "COMPLETED" ? "text-success-500" : "text-warning-500 opacity-60"}`}>{task.status || "IDLE"}</span>
                                {task.committedProvider && (
                                  <>
                                    <span className="text-xs text-default-400">•</span>
                                    <span className="text-xs font-black text-foreground/70 uppercase truncate">{getName(task.committedProvider)}</span>
                                  </>
                                )}
                              </div>
                              {task.details && Object.keys(task.details).some(k => task.details[k]) && (
                                <div className="mt-1 flex flex-wrap gap-2 text-[10px] font-bold text-default-500 uppercase tracking-tight">
                                  {task.details.routeNotes && <span>Route: {task.details.routeNotes}</span>}
                                  {task.details.packagingSpecifications && <span>Pkg: {task.details.packagingSpecifications}</span>}
                                  {task.details.fromDistrict && <span>From: {task.details.fromDistrict}</span>}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex flex-col text-right">
                              <span className="text-[10px] font-black text-default-400 uppercase tracking-widest">State</span>
                              <span className={`text-xs font-black uppercase ${task.status === "COMPLETED" ? "text-success-500" : "text-warning-500"}`}>{task.status === "COMPLETED" ? "Verified" : "Syncing"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}

            {!dealsLoading && enquiriesWithTasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                <FiCompass className="text-4xl animate-spin-slow" />
                <div className="text-center">
                  <h3 className="text-sm font-black uppercase tracking-widest">Void Detected</h3>
                  <p className="font-black text-default-500 uppercase text-xs tracking-widest mt-2">All deal ecosystems are currently dormant or filtered.</p>
                </div>
              </div>
            )}
          </motion.div>
        ) : activeTab === "execution-bidding" ? (
          <motion.div
            key="execution-bidding"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-10"
          >
            {/* Execution Bids */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-widest text-warning-500">Execution Bids</h2>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-default-400">
                  OPEN TASKS
                </span>
              </div>

              {dealsLoading && <SectionLoader />}
              {!dealsLoading && enquiriesWithOpenTasks.map((enq) => (
                <motion.div
                  key={`bidding-${enq.id}`}
                  layout
                  className="group relative overflow-hidden rounded-[2rem] border border-divider bg-default-50/50 backdrop-blur-xl hover:bg-default-100/50 transition-all duration-500"
                >
                  <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                      <div className="flex items-center gap-5">
                        <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs font-black uppercase tracking-widest text-warning-600 bg-warning-500/10 px-2 py-0.5 rounded-md">
                            Anchor
                          </span>
                          <span className="text-xs font-black text-default-400">#{enq.enquiryCode}</span>
                          {(enq.workflowStage || enq.status) && (
                            <div className="flex flex-wrap gap-2 ml-2">
                              {enq.workflowStage && (
                                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-default-100 text-default-600 border border-divider">
                                  {String(enq.workflowStage).replaceAll("_", " ")}
                                </span>
                              )}
                              {enq.status && (
                                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-default-100 text-default-600 border border-divider">
                                  {String(enq.status)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                          <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter leading-none">{enq.product}</h2>
                          <div className="flex items-center gap-3 mt-2 text-xs font-black text-default-500 uppercase tracking-widest">
                            <span className="opacity-60">{enq.variant}</span>
                            <span className="w-1 h-1 rounded-full bg-divider" />
                            <span className="text-warning-500/80">{enq.tasks.length} Open Nodes</span>
                          </div>
                        </div>
                      </div>
                    <div className="flex items-center gap-10">
                      <div className="hidden lg:flex flex-col text-right">
                        <span className="text-[10px] font-black text-default-400 uppercase tracking-[0.2em] mb-1">Origin</span>
                        <span className="text-sm font-black text-foreground uppercase tracking-tight">{enq.seller}</span>
                      </div>
                      <div className="w-px h-10 bg-divider hidden lg:block" />
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] font-black text-default-400 uppercase tracking-[0.2em] mb-1">Destination</span>
                        <span className="text-sm font-black text-foreground uppercase tracking-tight">{enq.buyer}</span>
                      </div>
                    </div>
                  </div>

                  {buildRouteSummary(enq.tasks) && (
                    <div className="mb-6 text-[10px] font-black uppercase tracking-widest text-default-500/80">
                      {buildRouteSummary(enq.tasks)}
                    </div>
                  )}

                    <div className="relative flex flex-col gap-6 border-l-2 border-divider ml-8 pl-8">
                      {enq.tasks.map((task: any) => {
                        const key = task.key;
                        const candidates = Array.isArray(task.candidateProviders) ? task.candidateProviders : [];
                        const bids = Array.isArray(task.bids) ? task.bids : [];
                        const bidCompanyOptions = buildBidCompanyOptions(bids, candidates);
                        const commitOptions = buildCommitCompanyOptions(bids, candidates);
                        const isCandidate = !!myCompanyId && candidates.some((provider: any) => String(provider?._id || provider) === myCompanyId);
                        const ownerBy = String(task.ownerBy || "").toLowerCase();
                        const isBuyerOwner = ownerBy === "buyer" && enq.buyerCompanyId && enq.buyerCompanyId === myCompanyId;
                        const isSellerOwner = ownerBy === "seller" && enq.sellerCompanyId && enq.sellerCompanyId === myCompanyId;
                        const canBid = isAdmin || (roleLower === "associate" && (isCandidate || isBuyerOwner || isSellerOwner));
                        const isOperatorUser = user?.role === "Operator" || user?.role === "team";
                        const isAssignedOperator =
                          isOperatorUser &&
                          ((enq.supplierOperatorId && enq.supplierOperatorId === String(user?.id || "")) ||
                            (enq.dealCloserOperatorId && enq.dealCloserOperatorId === String(user?.id || "")));
                        const canCommit = isAdmin || isAssignedOperator;
                        const canViewBidDetails = isAdmin || isCandidate;

                        return (
                          <div key={key} className="relative">
                            <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-background border-2 border-warning-500 flex items-center justify-center z-10">
                              <div className="w-1.5 h-1.5 rounded-full bg-warning-500 animate-pulse" />
                            </div>

                            <div className="p-5 rounded-2xl bg-background/40 border border-divider hover:border-warning-500/30 transition-all duration-300">
                              <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex items-center gap-5 min-w-0">
                                  <div className="p-2.5 rounded-xl border border-divider bg-warning-500/10 text-warning-600 shrink-0">
                                    {(() => {
                                      const type = String(task.type || "").toUpperCase();
                                      if (type.includes("PROCUREMENT")) return <FiShoppingCart className="text-lg" />;
                                      if (type.includes("TRANSPORTATION")) return <FiTruck className="text-lg" />;
                                      if (type.includes("SHIPPING") || type.includes("PORT")) return <FiAnchor className="text-lg" />;
                                      if (type.includes("PACKAGING")) return <FiPackage className="text-lg" />;
                                      if (type.includes("TESTING") || type.includes("INSURANCE") || type.includes("CUSTOMS")) return <FiShield className="text-lg" />;
                                      return <FiActivity className="text-lg" />;
                                    })()}
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="text-sm font-black text-foreground tracking-tight uppercase leading-none mb-1">{String(task.type || "").replaceAll("_", " ")}</h4>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-black uppercase tracking-widest text-warning-500 opacity-60">{task.status || "OPEN"}</span>
                                      {task.committedProvider && (
                                        <>
                                          <span className="text-xs text-default-400">•</span>
                                          <span className="text-xs font-black text-foreground/70 uppercase truncate">{getName(task.committedProvider)}</span>
                                        </>
                                      )}
                                    </div>
                                    {task.details && Object.keys(task.details).some((k: any) => task.details[k]) && (
                                      <div className="mt-1 flex flex-wrap gap-2 text-[10px] font-bold text-default-500 uppercase tracking-tight">
                                        {task.details.packagingSpecifications && <span>Pkg: {task.details.packagingSpecifications}</span>}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  {(() => {
                                    const flowConf = subflowConfigs.find((c: any) => c.subflowType === String(task.type || "").toUpperCase());
                                    if (flowConf?.biddingEndAtOrderStage) {
                                      return (
                                        <div className="flex flex-col items-end">
                                          <span className="text-[9px] font-black text-warning-600/80 uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1">
                                            <FiZap size={10} className={task.status === "OPEN" ? "animate-pulse" : ""} /> Bidding Closes At
                                          </span>
                                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border leading-none tracking-tight ${task.status === "OPEN" ? "text-warning-700 bg-warning-500/20 border-warning-500/30 shadow-sm" : "text-default-500 bg-default-100 border-divider"
                                            }`}>
                                            {String(flowConf.biddingEndAtOrderStage).replaceAll("_", " ")}
                                          </span>
                                        </div>
                                      );
                                    }
                                    return (
                                      <div className="flex flex-col items-end">
                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${task.status === "OPEN" ? "text-warning-500" : "text-default-400"}`}>Bidding Status</span>
                                        <span className={`text-[10px] font-black uppercase ${task.status === "OPEN" ? "text-warning-600" : "text-default-500"}`}>{task.status === "OPEN" ? "IN PROCESS" : "CLOSED"}</span>
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>

                              <div className="rounded-xl border border-default-200/50 bg-default-50/40 p-2 text-xs text-default-700 mb-4 mx-2">
                                {canViewBidDetails && bids.length > 0 && (
                                  <div className="overflow-x-auto scrollbar-hide mb-2 border-b border-default-200/30 pb-2">
                                    <table className="w-full min-w-[360px] text-[10px]">
                                      <thead>
                                        <tr className="text-default-400 font-black uppercase tracking-tight">
                                          <th className="text-left py-0.5">Entity</th>
                                          <th className="text-left py-0.5">Quote</th>
                                          <th className="text-left py-0.5">Note</th>
                                          <th className="text-left py-0.5">Status</th>
                                          <th className="text-left py-0.5">Meta</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {bids.map((bid: any, bidIdx: number) => (
                                          <tr key={`${key}-task-bid-${bidIdx}`} className="border-t border-default-100/50 font-bold">
                                            <td className="py-0.5 truncate max-w-[120px] text-foreground">{getName(bid?.company)}</td>
                                            <td className="py-0.5 text-warning-600">
                                              {typeof bid?.amount === "number" && !Number.isNaN(bid.amount) ? `₹${bid.amount.toLocaleString()}` : "-"}
                                            </td>
                                            <td className="py-0.5 text-default-500 truncate max-w-[140px]">{bid?.note || "-"}</td>
                                            <td className="py-0.5 text-default-500 opacity-80">{String(bid?.status || "SUBMITTED")}</td>
                                            <td className="py-0.5 text-default-400 opacity-60">{formatDate(bid?.updatedAt || bid?.createdAt)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                                {canViewBidDetails && bids.length === 0 && (
                                  <div className="text-[10px] font-black uppercase tracking-widest text-default-400 px-2 py-2">
                                    No bids yet
                                  </div>
                                )}
                              </div>

                              {task.status !== "COMPLETED" && task.status !== "CANCELLED" && (
                                <>
                                  <div className="flex flex-col sm:flex-row items-center gap-2 mt-3 mx-2">
                                    {isAdmin && (
                                      <div className="flex-1 w-full">
                                        {/* @ts-ignore */}
                                        <Autocomplete
                                          placeholder="Bid on behalf"
                                          variant="flat"
                                          radius="lg"
                                          selectedKey={selectedExecutionBidProvider[key] || ""}
                                          onSelectionChange={(value) =>
                                            setSelectedExecutionBidProvider((prev) => ({ ...prev, [key]: String(value || "") }))
                                          }
                                          popoverProps={{
                                            classNames: {
                                              content: "bg-content1/95 dark:bg-[#0B0F14]/95 backdrop-blur-2xl border border-divider shadow-2xl rounded-[1.5rem] p-1",
                                            },
                                            offset: 8
                                          }}
                                          listboxProps={{
                                            itemClasses: {
                                              base: "rounded-xl py-2 px-3 data-[hover=true]:bg-warning-500/10 data-[selected=true]:bg-warning-500/20 data-[selected=true]:text-warning-500",
                                            }
                                          }}
                                          classNames={{ 
                                            listbox: "bg-transparent", 
                                            trigger: "h-11 min-h-[44px] text-xs bg-content2/50 hover:bg-content2 transition-all px-4 border border-divider/50",
                                            input: "text-xs font-black uppercase tracking-tight"
                                          }}
                                          items={bidCompanyOptions}
                                        >
                                          {(company: any) => {
                                            const companyId = getCompanyId(company);
                                            const companyName = getCompanyLabel(company);
                                            return (
                                              <AutocompleteItem 
                                                key={companyId} 
                                                textValue={companyName}
                                              >
                                                <div className="flex items-center gap-3">
                                                   <div className="w-8 h-8 rounded-lg bg-default-100 dark:bg-white/5 flex items-center justify-center text-default-400 group-data-[selected=true]:bg-warning-500 group-data-[selected=true]:text-black border border-divider">
                                                      <FiPackage size={14} />
                                                   </div>
                                                   <div className="flex flex-col">
                                                      <span className="text-[11px] font-black uppercase italic tracking-tighter leading-tight">{companyName}</span>
                                                      <span className="text-[8px] font-bold text-default-400 lowercase tracking-widest opacity-60">id_{companyId.slice(-6)}</span>
                                                   </div>
                                                </div>
                                              </AutocompleteItem>
                                            );
                                          }}
                                        </Autocomplete>
                                      </div>
                                    )}
                                    <div className="flex-1 w-full">
                                      <Input
                                        type="number"
                                        placeholder="Bid amount"
                                        variant="flat"
                                        radius="md"
                                        classNames={{ inputWrapper: "h-8 min-h-[32px] bg-content2/30 px-3", input: "text-xs font-black", innerWrapper: "pb-1" }}
                                        value={bidMap[key] ?? ""}
                                        onValueChange={(v) => setBidMap((prev) => ({ ...prev, [key]: v }))}
                                        isDisabled={!canBid}
                                      />
                                    </div>
                                    <div className="flex-[1.5] w-full flex gap-2 items-center">
                                      <Input
                                        placeholder="Note"
                                        variant="flat"
                                        radius="md"
                                        classNames={{ inputWrapper: "h-8 min-h-[32px] bg-content2/30 px-3", input: "text-xs font-black", innerWrapper: "pb-1" }}
                                        value={noteMap[key] ?? ""}
                                        onValueChange={(v) => setNoteMap((prev) => ({ ...prev, [key]: v }))}
                                        isDisabled={!canBid}
                                      />
                                      <Button
                                        color="warning"
                                        className="h-8 min-w-0 px-4 text-[10px] font-black uppercase tracking-widest"
                                        isDisabled={!canBid || (isAdmin && !selectedExecutionBidProvider[key])}
                                        isLoading={bidLoadingKey === key}
                                        onPress={async () => {
                                          setBidErrorMap((prev) => ({ ...prev, [key]: "" }));
                                          const rawAmount = Number(bidMap[key] || 0);
                                          if (Number.isNaN(rawAmount) || rawAmount <= 0) {
                                            setBidErrorMap((prev) => ({ ...prev, [key]: "Enter a valid bid amount." }));
                                            return;
                                          }
                                          if (isAdmin && !selectedExecutionBidProvider[key]) {
                                            setBidErrorMap((prev) => ({ ...prev, [key]: "Select a provider to bid on behalf." }));
                                            return;
                                          }
                                          setBidLoadingKey(key);
                                          try {
                                            await updateTaskMutation.mutateAsync({
                                              enquiryId: task.enquiryId,
                                              type: task.type,
                                              bidAmount: rawAmount,
                                              commitNote: noteMap[key] || "",
                                              ...(isAdmin && selectedExecutionBidProvider[key]
                                                ? { bidCompanyId: selectedExecutionBidProvider[key] }
                                                : {}),
                                            });
                                            setBidErrorMap((prev) => ({ ...prev, [key]: "" }));
                                          } catch (error: any) {
                                            const msg = error?.response?.data?.message || error?.message || "Failed to place bid.";
                                            setBidErrorMap((prev) => ({ ...prev, [key]: msg }));
                                          } finally {
                                            setBidLoadingKey(null);
                                          }
                                        }}
                                      >
                                        Place Bid
                                      </Button>
                                    </div>
                                  </div>
                                  {bidErrorMap[key] && (
                                    <div className="text-[10px] font-black uppercase tracking-widest text-danger-500 px-2 mt-1">
                                      {bidErrorMap[key]}
                                    </div>
                                  )}

                                  {canCommit && commitOptions.length > 0 && (
                                    <div className="flex flex-col sm:flex-row items-center gap-2 mt-2 mx-2 pb-2">
                                      <div className="flex-1 w-full">
                                        {/* @ts-ignore */}
                                        <Autocomplete
                                          placeholder="Provider to Commit"
                                          variant="flat"
                                          radius="lg"
                                          selectedKey={selectedExecutionCommitProvider[key] || ""}
                                          onSelectionChange={(value) =>
                                            setSelectedExecutionCommitProvider((prev) => ({ ...prev, [key]: String(value || "") }))
                                          }
                                          popoverProps={{
                                            classNames: {
                                              content: "bg-content1/95 dark:bg-[#0B0F14]/95 backdrop-blur-2xl border border-divider shadow-2xl rounded-[1.5rem] p-1",
                                            },
                                            offset: 8
                                          }}
                                          listboxProps={{
                                            itemClasses: {
                                              base: "rounded-xl py-2 px-3 data-[hover=true]:bg-warning-500/10 data-[selected=true]:bg-warning-500/20 data-[selected=true]:text-warning-500",
                                            }
                                          }}
                                          classNames={{ 
                                            listbox: "bg-transparent", 
                                            trigger: "h-11 min-h-[44px] text-xs bg-content2/50 hover:bg-content2 transition-all px-4 border border-divider/50",
                                            input: "text-xs font-black uppercase tracking-tight"
                                          }}
                                          items={commitOptions}
                                        >
                                          {(company: any) => {
                                            const companyId = getCompanyId(company);
                                            const companyName = getCompanyLabel(company);
                                            return (
                                              <AutocompleteItem 
                                                key={companyId} 
                                                textValue={companyName}
                                              >
                                                <div className="flex items-center gap-3">
                                                   <div className="w-8 h-8 rounded-lg bg-default-100 dark:bg-white/5 flex items-center justify-center text-default-400 group-data-[selected=true]:bg-warning-500 group-data-[selected=true]:text-black border border-divider">
                                                      <FiShield size={14} />
                                                   </div>
                                                   <div className="flex flex-col">
                                                      <span className="text-[11px] font-black uppercase italic tracking-tighter leading-tight">{companyName}</span>
                                                      <span className="text-[8px] font-bold text-default-400 lowercase tracking-widest opacity-60">id_{companyId.slice(-6)}</span>
                                                   </div>
                                                </div>
                                              </AutocompleteItem>
                                            );
                                          }}
                                        </Autocomplete>
                                      </div>
                                      <div className="flex items-center sm:w-auto w-full justify-end">
                                        <Button
                                          color="success"
                                          className="h-8 min-w-0 px-6 text-[10px] font-black uppercase text-white shadow-md shadow-success-500/20 tracking-widest"
                                          isDisabled={commitOptions.length > 0 ? !selectedExecutionCommitProvider[key] : false}
                                          isLoading={commitLoadingKey === key}
                                          onPress={async () => {
                                            setCommitLoadingKey(key);
                                            try {
                                              await updateTaskMutation.mutateAsync({
                                                enquiryId: task.enquiryId,
                                                type: task.type,
                                                committedProvider: selectedExecutionCommitProvider[key],
                                                status: "IN_PROGRESS",
                                              });
                                            } finally {
                                              setCommitLoadingKey(null);
                                            }
                                          }}
                                        >
                                          Commit
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}

            {!dealsLoading && enquiriesWithOpenTasks.length === 0 && (
              <div className="text-center font-bold uppercase tracking-widest text-xs text-default-500 py-12">
                No open execution bids right now.
              </div>
            )}
          </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
