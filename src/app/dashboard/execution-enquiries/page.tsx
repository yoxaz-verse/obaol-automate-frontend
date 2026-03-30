"use client";

import React, { useState, useMemo, useContext, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Divider,
  Input,
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
  Switch,
  Textarea,
} from "@nextui-org/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getData, patchData, postData } from "@/core/api/apiHandler";
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
  FiPlus,
  FiSearch,
  FiFilter,
  FiMenu,
  FiCpu,
  FiBox,
  FiShare2,
  FiTruck,
  FiAnchor,
  FiShoppingCart,
  FiShield,
  FiLayers,
  FiZap,
  FiPackage,
  FiFileText,
  FiCheckCircle,
  FiGlobe,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";


dayjs.extend(relativeTime);

const SERVICE_TYPE_OPTIONS = [
  { key: "PACKAGING", label: "Packaging" },
  { key: "QUALITY_TESTING", label: "Quality Testing" },
  { key: "TRANSPORTATION", label: "Inland Transportation" },
  { key: "FREIGHT_FORWARDING", label: "Freight Forwarding" },
  { key: "EXPORT_CUSTOMS", label: "Export Customs" },
  { key: "IMPORT_CUSTOMS", label: "Import Customs" },
  { key: "PORT_HANDLING", label: "Port Handling" },
  { key: "INLAND_TRANSPORTATION", label: "Inland Transportation" },
  { key: "INSPECTION", label: "Inspection" },
];

const SERVICE_STATUS_OPTIONS = ["OPEN", "BIDDING", "COMMITTED", "COMPLETED", "CANCELLED"];

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
  const [serviceTypeFilter, setServiceTypeFilter] = useState("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [bidMap, setBidMap] = useState<Record<string, string>>({});
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});
  const [selectedExecutionCommitProvider, setSelectedExecutionCommitProvider] = useState<Record<string, string>>({});
  const [selectedCommitProvider, setSelectedCommitProvider] = useState<Record<string, string>>({});
  const [createForm, setCreateForm] = useState({
    title: "",
    requestType: "PACKAGING" as any,
    serviceSpecifications: "",
    fromState: "",
    fromDistrict: "",
    toState: "",
    toDistrict: "",
    requiredFromDate: "",
    requiredToDate: "",
    createdByCompanyId: "",
  });

  // Filters & State for creation
  const { data: statesResponse } = useQuery({
    queryKey: ["states"],
    queryFn: () => getData(apiRoutes.state.getAll, { page: 1, limit: 100 }),
  });
  const states = useMemo(() => extractArray(statesResponse), [statesResponse]);

  const { data: fromDistrictsResponse } = useQuery({
    queryKey: ["districts", createForm.fromState],
    queryFn: () => getData(apiRoutes.district.getAll, { state: createForm.fromState, page: 1, limit: 100 }),
    enabled: !!createForm.fromState,
  });
  const fromDistrictOptions = useMemo(() => extractArray(fromDistrictsResponse), [fromDistrictsResponse]);

  const { data: toDistrictsResponse } = useQuery({
    queryKey: ["districts", createForm.toState],
    queryFn: () => getData(apiRoutes.district.getAll, { state: createForm.toState, page: 1, limit: 100 }),
    enabled: !!createForm.toState,
  });
  const toDistrictOptions = useMemo(() => extractArray(toDistrictsResponse), [toDistrictsResponse]);

  const { data: companiesResponse } = useQuery({
    queryKey: ["associate-companies"],
    queryFn: () => getData(apiRoutes.associateCompany.getAll, { page: 1, limit: 1000 }),
    enabled: isAdmin,
  });
  const companyOptions = useMemo(() => extractArray(companiesResponse), [companiesResponse]);

  // Data Fetching — deal executions come from inquiries that have executionInquiries embedded
  const { data: dealExecutionsResponse, isLoading: dealsLoading } = useQuery({
    queryKey: ["deal-executions"],
    queryFn: () => getData(apiRoutes.enquiry.getAll, { page: 1, limit: 100, hasExecution: true }),
    enabled: activeTab === "deal-execution" || activeTab === "execution-bidding",
  });

  const { data: serviceRequestsResponse, isLoading: requestsLoading } = useQuery({
    queryKey: ["service-requests", serviceTypeFilter],
    queryFn: () =>
      getData(apiRoutes.serviceRequests.list, {
        page: 1,
        limit: 100,
        ...(serviceTypeFilter !== "ALL" && { requestType: serviceTypeFilter }),
      }),
    enabled: activeTab === "service-requests" || activeTab === "execution-bidding",
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
  const serviceRequests = useMemo(() => extractArray(serviceRequestsResponse), [serviceRequestsResponse]);
  const isServiceApiMissing =
    (activeTab === "service-requests" || activeTab === "execution-bidding") &&
    !serviceRequestsResponse?.data &&
    !requestsLoading;

  // Mutations
  const updateTaskMutation = useMutation({
    mutationFn: (payload: { enquiryId: string; type: string; bidAmount?: number; commitNote?: string; committedProvider?: string; status?: string }) =>
      patchData(`${apiRoutes.enquiry.getAll}/${payload.enquiryId}/execution-inquiries/${payload.type}`, {
        bidAmount: payload.bidAmount,
        commitNote: payload.commitNote,
        committedProvider: payload.committedProvider,
        status: payload.status,
      }),
    onSuccess: () => {
      toast.success("Task updated successfully");
      queryClient.invalidateQueries({ queryKey: ["deal-executions"] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to update task"),
  });

  const bidServiceRequestMutation = useMutation({
    mutationFn: (payload: { id: string; amount: number; note: string }) =>
      postData(`${apiRoutes.serviceRequests.list}/${payload.id}/bid`, { amount: payload.amount, note: payload.note }),
    onSuccess: () => {
      toast.success("Bid placed successfully");
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to place bid"),
  });

  const commitServiceRequestMutation = useMutation({
    mutationFn: (payload: { id: string; committedProvider?: string; bidAmount?: number; commitNote?: string }) =>
      postData(`${apiRoutes.serviceRequests.list}/${payload.id}/commit`, payload),
    onSuccess: () => {
      toast.success("Request committed successfully");
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to commit request"),
  });

  const updateServiceStatusMutation = useMutation({
    mutationFn: (payload: { id: string; status: string }) =>
      patchData(`${apiRoutes.serviceRequests.list}/${payload.id}/status`, { status: payload.status }),
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to update status"),
  });

  const createServiceRequestMutation = useMutation({
    mutationFn: () => postData(apiRoutes.serviceRequests.create, createForm),
    onSuccess: () => {
      toast.success("Service request created");
      setIsCreateModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to create request"),
  });

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
          buyer:
            [inquiry.executionContext?.destinationDistrict, inquiry.executionContext?.destinationState]
              .filter((p: any) => p && (typeof p !== "string" || !/^[0-9a-fA-F]{24}$/.test(p)))
              .join(", ")
            || inquiry.buyerAssociateId?.address
            || "Unknown Destination",
          seller:
            [inquiry.executionContext?.originDistrict, inquiry.executionContext?.originState]
              .filter((p: any) => p && (typeof p !== "string" || !/^[0-9a-fA-F]{24}$/.test(p)))
              .join(", ")
            || inquiry.sellerAssociateId?.address
            || "Unknown Origin",
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
          buyer:
            [inquiry.executionContext?.destinationDistrict, inquiry.executionContext?.destinationState]
              .filter((p: any) => p && (typeof p !== "string" || !/^[0-9a-fA-F]{24}$/.test(p)))
              .join(", ") ||
            inquiry.buyerAssociateId?.address ||
            "Unknown Destination",
          seller:
            [inquiry.executionContext?.originDistrict, inquiry.executionContext?.originState]
              .filter((p: any) => p && (typeof p !== "string" || !/^[0-9a-fA-F]{24}$/.test(p)))
              .join(", ") ||
            inquiry.sellerAssociateId?.address ||
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

  const getName = (obj: any) => obj?.name || obj?.email || String(obj || "Unknown Entity");
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
            <Button
              size="sm"
              variant={activeTab === "service-requests" ? "solid" : "light"}
              color={activeTab === "service-requests" ? "warning" : "default"}
              className={`font-black uppercase tracking-widest text-xs h-9 px-6 rounded-xl transition-all ${activeTab === "service-requests" ? "shadow-lg shadow-warning-500/20" : "opacity-60"}`}
              onPress={() => setActiveTab("service-requests")}
            >
              <FiBox className="mr-2" /> Service Requests
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
          {activeTab === "service-requests" && (
            <Button
              isIconOnly
              color="warning"
              className="rounded-xl shadow-lg shadow-warning-500/20 h-10 w-10 min-w-0"
              onPress={() => setIsCreateModalOpen(true)}
            >
              <FiPlus className="text-lg" />
            </Button>
          )}
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

                    <div className="relative flex flex-col gap-6 border-l-2 border-divider ml-8 pl-8">
                      {enq.tasks.map((task: any) => {
                        const key = task.key;
                        const candidates = Array.isArray(task.candidateProviders) ? task.candidateProviders : [];
                        const bids = Array.isArray(task.bids) ? task.bids : [];
                        const commitOptions = candidates.length ? candidates : bids.map((bid: any) => bid?.company).filter(Boolean);
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
                        const canViewBidDetails = isAdmin || isCandidate || isBuyerOwner || isSellerOwner;

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
                                        {task.details.routeNotes && <span>Route: {task.details.routeNotes}</span>}
                                        {task.details.packagingSpecifications && <span>Pkg: {task.details.packagingSpecifications}</span>}
                                        {task.details.fromDistrict && <span>From: {task.details.fromDistrict}</span>}
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
                                    <table className="w-full min-w-[280px] text-[10px]">
                                      <thead>
                                        <tr className="text-default-400 font-black uppercase tracking-tight">
                                          <th className="text-left py-0.5">Entity</th>
                                          <th className="text-left py-0.5">Quote</th>
                                          <th className="text-left py-0.5">Status</th>
                                          <th className="text-left py-0.5">Meta</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {bids.map((bid: any, bidIdx: number) => (
                                          <tr key={`${key}-task-bid-${bidIdx}`} className="border-t border-default-100/50 font-bold">
                                            <td className="py-0.5 truncate max-w-[100px] text-foreground">{getName(bid?.company)}</td>
                                            <td className="py-0.5 text-warning-600">
                                              {typeof bid?.amount === "number" && !Number.isNaN(bid.amount) ? `₹${bid.amount.toLocaleString()}` : "-"}
                                            </td>
                                            <td className="py-0.5 text-default-500 opacity-80">{String(bid?.status || "SUBMITTED")}</td>
                                            <td className="py-0.5 text-default-400 opacity-60">{formatDate(bid?.updatedAt || bid?.createdAt)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>

                              {task.status !== "COMPLETED" && task.status !== "CANCELLED" && (
                                <>
                                  <div className="flex flex-col sm:flex-row items-center gap-2 mt-3 mx-2">
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
                                        isDisabled={!canBid}
                                        isLoading={updateTaskMutation.isPending}
                                        onPress={() =>
                                          updateTaskMutation.mutate({
                                            enquiryId: task.enquiryId,
                                            type: task.type,
                                            bidAmount: Number(bidMap[key] || 0),
                                            commitNote: noteMap[key] || "",
                                          })
                                        }
                                      >
                                        Place Bid
                                      </Button>
                                    </div>
                                  </div>

                                  {canCommit && commitOptions.length > 0 && (
                                    <div className="flex flex-col sm:flex-row items-center gap-2 mt-2 mx-2 pb-2">
                                      <div className="flex-1 w-full">
                                        {/* @ts-ignore */}
                                        <Autocomplete
                                          placeholder="Provider to Commit"
                                          variant="flat"
                                          radius="md"
                                          selectedKey={selectedExecutionCommitProvider[key] || ""}
                                          onSelectionChange={(value) =>
                                            setSelectedExecutionCommitProvider((prev) => ({ ...prev, [key]: String(value || "") }))
                                          }
                                          classNames={{ listbox: "bg-content1", trigger: "h-8 min-h-[32px] text-xs bg-content2/50 px-3 py-0" }}
                                          items={commitOptions}
                                        >
                                          {(company: any) => {
                                            const companyId = String(company?._id || company || "");
                                            const companyName = String(company?.name || company?.companyName || companyId);
                                            return (
                                              <AutocompleteItem key={companyId} textValue={companyName} className="font-bold text-xs">
                                                {companyName}
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
                                          isLoading={updateTaskMutation.isPending}
                                          onPress={() =>
                                            updateTaskMutation.mutate({
                                              enquiryId: task.enquiryId,
                                              type: task.type,
                                              committedProvider: selectedExecutionCommitProvider[key],
                                              status: "IN_PROGRESS",
                                            })
                                          }
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

            {/* Service Request Bids */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-widest text-warning-500">Service Request Bids</h2>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-default-400">OPEN REQUESTS</span>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <Chip
                  variant={serviceTypeFilter === "ALL" ? "solid" : "flat"}
                  color={serviceTypeFilter === "ALL" ? "warning" : "default"}
                  className="cursor-pointer"
                  onClick={() => setServiceTypeFilter("ALL")}
                >
                  All Types
                </Chip>
                {SERVICE_TYPE_OPTIONS.map((item) => (
                  <Chip
                    key={item.key}
                    variant={serviceTypeFilter === item.key ? "solid" : "flat"}
                    color={serviceTypeFilter === item.key ? "warning" : "default"}
                    className="cursor-pointer"
                    onClick={() => setServiceTypeFilter(item.key)}
                  >
                    {item.label}
                  </Chip>
                ))}
              </div>

              {requestsLoading ? (
                <SectionLoader />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {serviceRequests
                    .filter((item) => ["OPEN", "BIDDING"].includes(String(item.status || "").toUpperCase()))
                    .filter((item) => {
                      if (!searchQuery.trim()) return true;
                      const q = searchQuery.toLowerCase();
                      return (
                        String(item.title || "").toLowerCase().includes(q) ||
                        String(item.serviceSpecifications || "").toLowerCase().includes(q) ||
                        String(item.requestType || "").toLowerCase().includes(q)
                      );
                    })
                    .map((item) => {
                      const key = String(item._id);
                      const bids = Array.isArray(item.bids) ? item.bids : [];
                      const candidates = Array.isArray(item.candidateProviders) ? item.candidateProviders : [];
                      const commitOptions = candidates.length ? candidates : bids.map((bid: any) => bid?.company).filter(Boolean);
                      const isCandidate = !!myCompanyId && candidates.some((provider: any) => String(provider?._id || provider) === myCompanyId);
                      const creatorAssociateId = String((item as any)?.createdByAssociateId?._id || (item as any)?.createdByAssociateId || "");
                      const isCreatorAssociate = roleLower === "associate" && creatorAssociateId === String(user?.id || "");
                      const canViewServiceBidDetails = isAdmin || isCandidate || isCreatorAssociate;
                      const canBid = roleLower === "associate" ? isCandidate : isAdmin;

                      return (
                        <Card key={key} className="border border-default-200/50 shadow-sm relative overflow-hidden bg-content1/70 backdrop-blur-md rounded-xl">
                          {item.createdAt && Date.now() - new Date(item.createdAt).getTime() < 86400000 && (
                            <div className="absolute top-1 right-1 z-20 flex items-center justify-center">
                              <span className="relative flex h-1 w-1">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1 w-1 bg-success-500"></span>
                              </span>
                            </div>
                          )}
                          <CardHeader className="px-3 py-2 flex justify-between items-center gap-2 border-b border-default-100/50">
                            <div className="flex items-center gap-3">
                              <div className="text-xs uppercase tracking-widest font-black text-warning-600 bg-warning-500/10 px-2 py-0.5 rounded w-fit">{item.requestType}</div>
                              <div className="font-black text-sm text-foreground tracking-tight uppercase">{item.title}</div>
                            </div>
                            <div className={`text-xs font-black uppercase tracking-tight ${item.status === "COMPLETED" ? "text-success-600" : "text-warning-600"}`}>
                              ● {item.status}
                            </div>
                          </CardHeader>
                          <CardBody className="p-3 pt-2 flex flex-col gap-3">
                            <div className="rounded-xl bg-default-100/40 p-3 text-sm text-default-600 border border-default-200/30">
                              <div className="italic leading-relaxed font-bold">{item.serviceSpecifications}</div>
                              <div className="mt-3 flex flex-wrap gap-4 pt-3 border-t border-default-200/50">
                                <div className="flex flex-col gap-1 text-xs">
                                  <span className="font-black uppercase tracking-[0.2em] text-default-400 text-[9px]">Execution Window</span>
                                  <span className="font-black text-foreground/80">{formatDate(item.requiredFromDate)} → {formatDate(item.requiredToDate)}</span>
                                </div>
                                {item.requiredFromDate && (
                                  <div className="flex flex-col gap-1 text-xs border-l border-default-200/60 pl-4">
                                    <span className="font-black uppercase tracking-[0.2em] text-warning-600/80 flex items-center gap-1 text-[9px]">
                                      <FiZap size={10} className="animate-pulse" /> Bidding Closes Before
                                    </span>
                                    <span className="font-black text-warning-700">{formatDate(item.requiredFromDate)}</span>
                                  </div>
                                )}
                                <div className="flex flex-col gap-1 text-xs border-l border-default-200/60 pl-4">
                                  <span className="font-black uppercase tracking-[0.2em] text-default-400 text-[9px]">Candidates</span>
                                  <span className="font-black text-foreground/80">{candidates.length} Entities</span>
                                </div>
                                {isAdmin && (
                                  <div className="flex flex-col gap-1 text-xs border-l border-warning-200/40 pl-4">
                                    <span className="font-black uppercase tracking-[0.2em] text-warning-500/80 text-[9px]">Origin Entity</span>
                                    <span className="font-black text-warning-700/80">{getName(item.createdByCompanyId)}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="rounded-xl border border-default-200/50 bg-default-50/40 p-3 text-xs text-default-700">
                              <div className="flex items-center justify-between font-black uppercase text-xs tracking-widest text-default-400 mb-2 border-b border-default-200/30 pb-2">
                                <span>Bid Summary</span>
                                <span>Bids: {bids.length}</span>
                              </div>
                              {canViewServiceBidDetails ? (
                                <div className="overflow-x-auto scrollbar-hide">
                                  <table className="w-full min-w-[320px] text-xs">
                                    <thead>
                                      <tr className="text-default-400 font-black uppercase tracking-tight">
                                        <th className="text-left py-1">Entity</th>
                                        <th className="text-left py-1">Quote</th>
                                        <th className="text-left py-1">Status</th>
                                        <th className="text-left py-1">Meta</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {bids.map((bid: any, bidIdx: number) => (
                                        <tr key={`${key}-service-bid-${bidIdx}`} className="border-t border-default-100/50 font-black">
                                          <td className="py-1 truncate max-w-[120px] text-foreground">{getName(bid?.company)}</td>
                                          <td className="py-1 text-warning-600 font-black">
                                            {typeof bid?.amount === "number" && !Number.isNaN(bid.amount) ? `₹${bid.amount.toLocaleString()}` : "-"}
                                          </td>
                                          <td className="py-1 text-default-500 opacity-80 text-xs">{String(bid?.status || "SUBMITTED")}</td>
                                          <td className="py-1 text-xs text-default-400 opacity-60">{formatDate(bid?.updatedAt || bid?.createdAt)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="mt-1 text-default-500">Detailed bid amounts are restricted for this request.</div>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                size="sm"
                                type="number"
                                placeholder="Bid amount"
                                variant="bordered"
                                radius="lg"
                                classNames={{ inputWrapper: "h-8 min-h-0 bg-content2/30 border-default-200/50 px-3", input: "text-xs font-black" }}
                                value={bidMap[key] ?? ""}
                                onValueChange={(v) => setBidMap((prev) => ({ ...prev, [key]: v }))}
                                isDisabled={!canBid || item.status === "COMPLETED" || item.status === "CANCELLED"}
                              />
                              <Input
                                size="sm"
                                placeholder="Note"
                                variant="bordered"
                                radius="lg"
                                classNames={{ inputWrapper: "h-8 min-h-0 bg-content2/30 border-default-200/50 px-3", input: "text-xs font-black" }}
                                value={noteMap[key] ?? ""}
                                onValueChange={(v) => setNoteMap((prev) => ({ ...prev, [key]: v }))}
                                isDisabled={!canBid || item.status === "COMPLETED" || item.status === "CANCELLED"}
                              />
                            </div>

                            {isAdmin && commitOptions.length > 0 && (
                              /* @ts-ignore */
                              <Autocomplete
                                size="sm"
                                placeholder="Provider to Commit"
                                variant="bordered"
                                radius="lg"
                                selectedKey={selectedCommitProvider[key] || ""}
                                onSelectionChange={(value) => setSelectedCommitProvider((prev) => ({ ...prev, [key]: String(value || "") }))}
                                classNames={{
                                  listbox: "bg-content1",
                                  trigger: "h-8 min-h-0 text-xs bg-content2/50 border-default-200/50 px-3",
                                }}
                                items={commitOptions}
                              >
                                {(company: any) => {
                                  const companyId = String(company?._id || company || "");
                                  const companyName = String(company?.name || company?.companyName || companyId);
                                  return (
                                    <AutocompleteItem key={companyId} textValue={companyName} className="font-bold text-xs">
                                      {companyName}
                                    </AutocompleteItem>
                                  );
                                }}
                              </Autocomplete>
                            )}

                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                variant="flat"
                                color="warning"
                                className="h-8 text-xs font-black uppercase"
                                isDisabled={!canBid || item.status === "COMPLETED" || item.status === "CANCELLED"}
                                isLoading={bidServiceRequestMutation.isPending}
                                onPress={() =>
                                  bidServiceRequestMutation.mutate({
                                    id: key,
                                    amount: Number(bidMap[key] || 0),
                                    note: noteMap[key] || "",
                                  })
                                }
                              >
                                Place Bid
                              </Button>

                              <Button
                                size="sm"
                                color="success"
                                className="h-8 text-xs font-black uppercase"
                                isDisabled={
                                  !isAdmin ||
                                  item.status === "COMPLETED" ||
                                  item.status === "CANCELLED" ||
                                  (isAdmin && commitOptions.length > 0 ? !selectedCommitProvider[key] : false)
                                }
                                isLoading={commitServiceRequestMutation.isPending}
                                onPress={() =>
                                  commitServiceRequestMutation.mutate({
                                    id: key,
                                    committedProvider: isAdmin ? selectedCommitProvider[key] : undefined,
                                    bidAmount: Number(bidMap[key] || item.bidAmount || 0),
                                    commitNote: noteMap[key] || item.commitNote || "",
                                  })
                                }
                              >
                                Commit
                              </Button>

                              {isAdmin
                                ? SERVICE_STATUS_OPTIONS.map((status) => (
                                  <Button
                                    key={`${key}-${status}`}
                                    size="sm"
                                    variant="light"
                                    className="h-8 text-xs font-black uppercase"
                                    isDisabled={item.status === status}
                                    isLoading={updateServiceStatusMutation.isPending}
                                    onPress={() => updateServiceStatusMutation.mutate({ id: key, status })}
                                  >
                                    {status}
                                  </Button>
                                ))
                                : null}
                            </div>
                          </CardBody>
                        </Card>
                      );
                    })}
                </div>
              )}

              {!requestsLoading &&
                serviceRequests.filter((item) => ["OPEN", "BIDDING"].includes(String(item.status || "").toUpperCase())).length === 0 && (
                  <div className="text-center font-bold uppercase tracking-widest text-xs text-default-500 py-12">
                    No open service bids right now.
                  </div>
                )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="service-req"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {isServiceApiMissing ? (
              <Card className="mt-3 border border-danger-300 bg-danger-50/70 dark:bg-danger-950/20">
                <CardBody className="py-3 text-sm text-danger-700 dark:text-danger-300">
                  Service Requests API is currently unavailable. Please ensure the backend is running and try again.
                </CardBody>
              </Card>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2 items-center">
              <Chip
                variant={serviceTypeFilter === "ALL" ? "solid" : "flat"}
                color={serviceTypeFilter === "ALL" ? "warning" : "default"}
                className="cursor-pointer"
                onClick={() => setServiceTypeFilter("ALL")}
              >
                All Types
              </Chip>
              {SERVICE_TYPE_OPTIONS.map((item) => (
                <Chip
                  key={item.key}
                  variant={serviceTypeFilter === item.key ? "solid" : "flat"}
                  color={serviceTypeFilter === item.key ? "warning" : "default"}
                  className="cursor-pointer"
                  onClick={() => setServiceTypeFilter(item.key)}
                >
                  {item.label}
                </Chip>
              ))}
            </div>

            {requestsLoading ? (
              <SectionLoader />
            ) : (
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {serviceRequests.map((item) => {
                  const key = String(item._id);
                  const bids = Array.isArray(item.bids) ? item.bids : [];
                  const candidates = Array.isArray(item.candidateProviders) ? item.candidateProviders : [];
                  const commitOptions = candidates.length ? candidates : bids.map((bid: any) => bid?.company).filter(Boolean);
                  const isCandidate = !!myCompanyId && candidates.some((provider: any) => String(provider?._id || provider) === myCompanyId);
                  const creatorAssociateId = String((item as any)?.createdByAssociateId?._id || (item as any)?.createdByAssociateId || "");
                  const isCreatorAssociate = roleLower === "associate" && creatorAssociateId === String(user?.id || "");
                  const canViewServiceBidDetails = isAdmin || isCandidate || isCreatorAssociate;
                  const canBid = roleLower === "associate" ? isCandidate : isAdmin;

                  return (
                    <Card key={key} className="border border-default-200/50 shadow-sm relative overflow-hidden bg-content1/70 backdrop-blur-md rounded-xl">
                      {/* Recently Opened / New Indicator Dot */}
                      {item.createdAt && Date.now() - new Date(item.createdAt).getTime() < 86400000 && (
                        <div className="absolute top-1 right-1 z-20 flex items-center justify-center">
                          <span className="relative flex h-1 w-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1 w-1 bg-success-500"></span>
                          </span>
                        </div>
                      )}
                      <CardHeader className="px-3 py-2 flex justify-between items-center gap-2 border-b border-default-100/50">
                        <div className="flex items-center gap-3">
                          <div className="text-xs uppercase tracking-widest font-black text-warning-600 bg-warning-500/10 px-2 py-0.5 rounded w-fit">{item.requestType}</div>
                          <div className="font-black text-sm text-foreground tracking-tight uppercase">{item.title}</div>
                        </div>
                        <div className={`text-xs font-black uppercase tracking-tight ${item.status === "COMPLETED" ? "text-success-600" : "text-warning-600"}`}>
                          ● {item.status}
                        </div>
                      </CardHeader>
                      <CardBody className="p-3 pt-2 flex flex-col gap-3">
                        <div className="rounded-xl bg-default-100/40 p-3 text-sm text-default-600 border border-default-200/30">
                          <div className="italic leading-relaxed font-bold">{item.serviceSpecifications}</div>
                          <div className="mt-2 flex flex-wrap gap-3 pt-2 border-t border-default-200/50">
                            <span className="text-xs font-black uppercase text-default-400 opacity-80">
                              Window: {formatDate(item.requiredFromDate)} → {formatDate(item.requiredToDate)}
                            </span>
                            <span className="text-xs font-black uppercase text-default-400 opacity-80">Candidates: {candidates.length}</span>
                            {isAdmin && <span className="text-xs font-black uppercase text-warning-600/60">Entity: {getName(item.createdByCompanyId)}</span>}
                          </div>
                        </div>

                        <div className="rounded-xl border border-default-200/50 bg-default-50/40 p-3 text-xs text-default-700">
                          <div className="flex items-center justify-between font-black uppercase text-xs tracking-widest text-default-400 mb-2 border-b border-default-200/30 pb-2">
                            <span>Bid Summary</span>
                            <span>Bids: {bids.length}</span>
                          </div>
                          {canViewServiceBidDetails ? (
                            <div className="overflow-x-auto scrollbar-hide">
                              <table className="w-full min-w-[320px] text-xs">
                                <thead>
                                  <tr className="text-default-400 font-black uppercase tracking-tight">
                                    <th className="text-left py-1">Entity</th>
                                    <th className="text-left py-1">Quote</th>
                                    <th className="text-left py-1">Status</th>
                                    <th className="text-left py-1">Meta</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {bids.map((bid: any, bidIdx: number) => (
                                    <tr key={`${key}-service-bid-${bidIdx}`} className="border-t border-default-100/50 font-black">
                                      <td className="py-1 truncate max-w-[120px] text-foreground">{getName(bid?.company)}</td>
                                      <td className="py-1 text-warning-600 font-black">
                                        {typeof bid?.amount === "number" && !Number.isNaN(bid.amount) ? `₹${bid.amount.toLocaleString()}` : "-"}
                                      </td>
                                      <td className="py-1 text-default-500 opacity-80 text-xs">{String(bid?.status || "SUBMITTED")}</td>
                                      <td className="py-1 text-xs text-default-400 opacity-60">{formatDate(bid?.updatedAt || bid?.createdAt)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="mt-1 text-default-500">Detailed bid amounts are restricted for this request.</div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            size="sm"
                            type="number"
                            placeholder="Bid amount"
                            variant="bordered"
                            radius="lg"
                            classNames={{ inputWrapper: "h-8 min-h-0 bg-content2/30 border-default-200/50 px-3", input: "text-xs font-black" }}
                            value={bidMap[key] ?? ""}
                            onValueChange={(v) => setBidMap((prev) => ({ ...prev, [key]: v }))}
                            isDisabled={!canBid || item.status === "COMPLETED" || item.status === "CANCELLED"}
                          />
                          <Input
                            size="sm"
                            placeholder="Note"
                            variant="bordered"
                            radius="lg"
                            classNames={{ inputWrapper: "h-8 min-h-0 bg-content2/30 border-default-200/50 px-3", input: "text-xs font-black" }}
                            value={noteMap[key] ?? ""}
                            onValueChange={(v) => setNoteMap((prev) => ({ ...prev, [key]: v }))}
                            isDisabled={!canBid || item.status === "COMPLETED" || item.status === "CANCELLED"}
                          />
                        </div>

                        {isAdmin && commitOptions.length > 0 && (
                          /* @ts-ignore */
                          <Autocomplete
                            size="sm"
                            placeholder="Provider to Commit"
                            variant="bordered"
                            radius="lg"
                            selectedKey={selectedCommitProvider[key] || ""}
                            onSelectionChange={(value) => setSelectedCommitProvider((prev) => ({ ...prev, [key]: String(value || "") }))}
                            classNames={{
                              listbox: "bg-content1",
                              trigger: "h-8 min-h-0 text-xs bg-content2/50 border-default-200/50 px-3",
                            }}
                            items={commitOptions}
                          >
                            {(company: any) => {
                              const companyId = String(company?._id || company || "");
                              const companyName = String(company?.name || company || companyId);
                              return (
                                <AutocompleteItem key={companyId} textValue={companyName} className="font-bold text-xs">
                                  {companyName}
                                </AutocompleteItem>
                              );
                            }}
                          </Autocomplete>
                        )}

                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="flat"
                            color="warning"
                            className="h-8 text-xs font-black uppercase"
                            isDisabled={!canBid || item.status === "COMPLETED" || item.status === "CANCELLED"}
                            isLoading={bidServiceRequestMutation.isPending}
                            onPress={() =>
                              bidServiceRequestMutation.mutate({
                                id: key,
                                amount: Number(bidMap[key] || 0),
                                note: noteMap[key] || "",
                              })
                            }
                          >
                            Place Bid
                          </Button>

                          <Button
                            size="sm"
                            color="success"
                            className="h-8 text-xs font-black uppercase"
                            isDisabled={
                              !isAdmin ||
                              item.status === "COMPLETED" ||
                              item.status === "CANCELLED" ||
                              (isAdmin && commitOptions.length > 0 ? !selectedCommitProvider[key] : false)
                            }
                            isLoading={commitServiceRequestMutation.isPending}
                            onPress={() =>
                              commitServiceRequestMutation.mutate({
                                id: key,
                                committedProvider: isAdmin ? selectedCommitProvider[key] : undefined,
                                bidAmount: Number(bidMap[key] || item.bidAmount || 0),
                                commitNote: noteMap[key] || item.commitNote || "",
                              })
                            }
                          >
                            Commit
                          </Button>

                          {isAdmin
                            ? SERVICE_STATUS_OPTIONS.map((status) => (
                              <Button
                                key={`${key}-${status}`}
                                size="sm"
                                variant="light"
                                className="h-8 text-xs font-black uppercase"
                                isDisabled={item.status === status}
                                isLoading={updateServiceStatusMutation.isPending}
                                onPress={() => updateServiceStatusMutation.mutate({ id: key, status })}
                              >
                                {status}
                              </Button>
                            ))
                            : null}
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            )}

            {!requestsLoading && serviceRequests.length === 0 && (
              <div className="text-center font-bold uppercase tracking-widest text-xs text-default-500 py-16">No service requests available yet.</div>
            )}

            <Modal
              isOpen={isCreateModalOpen}
              onOpenChange={(open) => setIsCreateModalOpen(open)}
              size="2xl"
              scrollBehavior="inside"
              isDismissable={false}
              isKeyboardDismissDisabled
            >
              <ModalContent>
                {(closeModal) => (
                  <>
                    <ModalHeader>Create Partial Service Request</ModalHeader>
                    <ModalBody>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input label="Requested By" value={String((user as any)?.name || user?.email || "-")} isReadOnly />
                        {isAdmin ? (
                          /* @ts-ignore */
                          <Autocomplete
                            label="Target Company"
                            placeholder="Select target company"
                            variant="bordered"
                            radius="lg"
                            selectedKey={createForm.createdByCompanyId || ""}
                            onSelectionChange={(value) => setCreateForm((prev) => ({ ...prev, createdByCompanyId: String(value || "") }))}
                            items={companyOptions}
                            classNames={{ trigger: "h-10 text-xs", listbox: "bg-content1" }}
                          >
                            {(company: any) => {
                              const companyId = String(company?._id || "");
                              const companyName = String(company?.name || companyId || "-");
                              return (
                                <AutocompleteItem key={companyId} textValue={companyName} className="font-bold text-xs">
                                  {companyName}
                                </AutocompleteItem>
                              );
                            }}
                          </Autocomplete>
                        ) : null}
                        <Select
                          label="Request Type"
                          selectedKeys={[createForm.requestType]}
                          onSelectionChange={(keys) => {
                            const arr = Array.from(keys as Set<string>);
                            setCreateForm((prev) => ({ ...prev, requestType: String(arr[0] || "PACKAGING") }));
                          }}
                        >
                          {SERVICE_TYPE_OPTIONS.map((item) => (
                            <SelectItem key={item.key} value={item.key}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </Select>
                        <Input
                          label="Title"
                          value={createForm.title}
                          onValueChange={(v) => setCreateForm((prev) => ({ ...prev, title: v }))}
                        />
                        <Select
                          label="From State"
                          selectedKeys={createForm.fromState ? [createForm.fromState] : []}
                          onSelectionChange={(keys) => {
                            const arr = Array.from(keys as Set<string>);
                            const value = String(arr[0] || "");
                            setCreateForm((prev) => ({ ...prev, fromState: value, fromDistrict: "" }));
                          }}
                        >
                          {states.map((item: any) => (
                            <SelectItem key={item._id} value={item._id}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </Select>
                        <Select
                          label="From District"
                          selectedKeys={createForm.fromDistrict ? [createForm.fromDistrict] : []}
                          isDisabled={!createForm.fromState}
                          onSelectionChange={(keys) => {
                            const arr = Array.from(keys as Set<string>);
                            setCreateForm((prev) => ({ ...prev, fromDistrict: String(arr[0] || "") }));
                          }}
                        >
                          {fromDistrictOptions.map((item: any) => (
                            <SelectItem key={item._id} value={item._id}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </Select>
                        <Select
                          label="To State (Optional)"
                          selectedKeys={createForm.toState ? [createForm.toState] : []}
                          onSelectionChange={(keys) => {
                            const arr = Array.from(keys as Set<string>);
                            const value = String(arr[0] || "");
                            setCreateForm((prev) => ({ ...prev, toState: value, toDistrict: "" }));
                          }}
                        >
                          {states.map((item: any) => (
                            <SelectItem key={item._id} value={item._id}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </Select>
                        <Select
                          label="To District (Optional)"
                          selectedKeys={createForm.toDistrict ? [createForm.toDistrict] : []}
                          isDisabled={!createForm.toState}
                          onSelectionChange={(keys) => {
                            const arr = Array.from(keys as Set<string>);
                            setCreateForm((prev) => ({ ...prev, toDistrict: String(arr[0] || "") }));
                          }}
                        >
                          {toDistrictOptions.map((item: any) => (
                            <SelectItem key={item._id} value={item._id}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </Select>
                        <Input
                          type="date"
                          label="Required From Date"
                          value={createForm.requiredFromDate}
                          onValueChange={(v) => setCreateForm((prev) => ({ ...prev, requiredFromDate: v }))}
                        />
                        <Input
                          type="date"
                          label="Required To Date"
                          value={createForm.requiredToDate}
                          onValueChange={(v) => setCreateForm((prev) => ({ ...prev, requiredToDate: v }))}
                        />
                      </div>

                      <Textarea
                        label="Service Specifications"
                        value={createForm.serviceSpecifications}
                        onValueChange={(v) => setCreateForm((prev) => ({ ...prev, serviceSpecifications: v }))}
                        minRows={5}
                        placeholder="Enter full service requirement details."
                      />
                    </ModalBody>
                    <ModalFooter>
                      <Button
                        variant="light"
                        onPress={() => {
                          setIsCreateModalOpen(false);
                          closeModal();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        color="primary"
                        isLoading={createServiceRequestMutation.isPending}
                        isDisabled={
                          !createForm.requestType ||
                          !createForm.title.trim() ||
                          !createForm.serviceSpecifications.trim() ||
                          !createForm.fromState ||
                          !createForm.fromDistrict
                        }
                        onPress={() => createServiceRequestMutation.mutate()}
                      >
                        Create Request
                      </Button>
                    </ModalFooter>
                  </>
                )}
              </ModalContent>
            </Modal>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
