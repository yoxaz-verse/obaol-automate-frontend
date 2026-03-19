"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  ButtonGroup,
  Autocomplete,
  AutocompleteItem,
  Input,
  Textarea,
  Select,
  SelectItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { useRouter, useSearchParams } from "next/navigation";
import Title from "@/components/titles";
import { getData, patchData, postData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import AuthContext from "@/context/AuthContext";
import { toast } from "react-toastify";
import BrandedLoader from "@/components/ui/BrandedLoader";
import { FiPlus, FiLayers, FiBriefcase } from "react-icons/fi";

type ServiceRequestRow = {
  _id: string;
  requestType: string;
  title: string;
  serviceSpecifications: string;
  fromState?: { _id?: string; name?: string } | string;
  fromDistrict?: { _id?: string; name?: string } | string;
  toState?: { _id?: string; name?: string } | string;
  toDistrict?: { _id?: string; name?: string } | string;
  requiredFromDate?: string;
  requiredToDate?: string;
  status: string;
  candidateProviders?: any[];
  bids?: any[];
  committedProvider?: any;
  createdByCompanyId?: any;
  bidAmount?: number;
  commitNote?: string;
  createdByRole?: string;
  createdByAssociateId?: string;
  createdAt?: string;
};

const SERVICE_TYPE_OPTIONS = [
  { key: "PROCUREMENT", label: "Procurement" },
  { key: "QUALITY_TESTING", label: "Quality Testing" },
  { key: "PACKAGING", label: "Packaging" },
  { key: "TRANSPORTATION", label: "Transportation" },
  { key: "CUSTOMS_CLEARANCE", label: "Customs Clearance" },
  { key: "WAREHOUSING", label: "Warehousing" },
];

const SERVICE_STATUS_OPTIONS = ["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

const formatDate = (value?: string) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString("en-IN");
  } catch {
    return "-";
  }
};

const getName = (value: any) => {
  if (!value) return "-";
  if (typeof value === "string") return value;
  return String(value?.name || value?._id || "-");
};

const getActiveBackendTarget = () =>
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:5001 (dev default)";

const showServiceRequestApiUnavailableToast = (err: any): boolean => {
  const status = err?.response?.status;
  if (status === 404) {
    toast.error(
      `Service Requests API not available on current backend target. Check NEXT_PUBLIC_BACKEND_ORIGIN. Current target: ${getActiveBackendTarget()}`
    );
    return true;
  }
  return false;
};

export default function ExecutionEnquiriesPage() {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "service-requests" ? "service-requests" : "deal-execution";

  const [activeTab, setActiveTab] = useState<"deal-execution" | "service-requests">(initialTab as any);
  const [bidMap, setBidMap] = useState<Record<string, string>>({});
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});
  const [activeType, setActiveType] = useState<string>("ALL");
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>("ALL");
  const [createForm, setCreateForm] = useState({
    requestType: "PACKAGING",
    title: "",
    serviceSpecifications: "",
    fromState: "",
    fromDistrict: "",
    toState: "",
    toDistrict: "",
    requiredFromDate: "",
    requiredToDate: "",
    createdByCompanyId: "",
  });
  const [selectedCommitProvider, setSelectedCommitProvider] = useState<Record<string, string>>({});
  const [selectedExecutionCommitProvider, setSelectedExecutionCommitProvider] = useState<Record<string, string>>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const roleLower = String(user?.role || "").toLowerCase();
  const isAdmin = roleLower === "admin";
  const isOperatorUser = roleLower === "operator" || roleLower === "team";

  useEffect(() => {
    patchData(apiRoutes.notifications.markSectionRead("execution"), {}).catch(() => { });
  }, []);
  const myCompanyId = String(
    (user as any)?.associateCompany?._id ||
    (user as any)?.associateCompany ||
    (user as any)?.associateCompanyId ||
    ""
  );

  const typeFilters = [
    { key: "ALL", label: "All" },
    { key: "PROCUREMENT", label: "Procurement" },
    { key: "CERTIFICATION", label: "Certification" },
    { key: "TRANSPORTATION", label: "Transportation" },
    { key: "SHIPPING", label: "Shipping" },
    { key: "PACKAGING", label: "Packaging" },
    { key: "QUALITY_TESTING", label: "Quality Testing" },
    { key: "WAREHOUSING", label: "Warehousing" },
  ];

  const { data: enquiryRes, isLoading: isDealLoading } = useQuery({
    queryKey: ["execution-enquiries"],
    queryFn: () => getData(apiRoutes.enquiry.getAll, { page: 1, limit: 200, sort: "createdAt:desc" }),
    enabled: activeTab === "deal-execution",
  });

  const { data: interestsStatusRes } = useQuery({
    queryKey: ["company-interests-status"],
    queryFn: () => getData("/auth/company-interests/status"),
    enabled: !!user?.id,
  });

  const {
    data: serviceRequestRes,
    isLoading: isServiceLoading,
    isError: isServiceError,
    error: serviceRequestError,
  } = useQuery({
    queryKey: ["service-requests", serviceTypeFilter],
    queryFn: () =>
      getData(apiRoutes.serviceRequests.list, {
        page: 1,
        limit: 200,
        ...(serviceTypeFilter !== "ALL" ? { requestType: serviceTypeFilter } : {}),
      }),
    enabled: activeTab === "service-requests",
  });

  const { data: statesResponse } = useQuery({
    queryKey: ["states", "service-requests"],
    queryFn: () => getData(apiRoutes.state.getAll, { page: 1, limit: 500 }),
    enabled: activeTab === "service-requests",
  });

  const { data: districtsResponse } = useQuery({
    queryKey: ["districts", "service-requests"],
    queryFn: () => getData(apiRoutes.district.getAll, { page: 1, limit: 2000 }),
    enabled: activeTab === "service-requests",
  });

  const { data: companiesResponse } = useQuery({
    queryKey: ["service-requests-company-options"],
    queryFn: () => getData(apiRoutes.associateCompany.getAll, { page: 1, limit: 1000, sort: "name:asc" }),
    enabled: activeTab === "service-requests" && isAdmin,
  });

  const states = useMemo(() => {
    const raw = statesResponse?.data?.data;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw)) return raw;
    return [];
  }, [statesResponse]);

  const districts = useMemo(() => {
    const raw = districtsResponse?.data?.data;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw)) return raw;
    return [];
  }, [districtsResponse]);

  const companyOptions = useMemo(() => {
    const raw = companiesResponse?.data?.data;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw)) return raw;
    return [];
  }, [companiesResponse]);

  const fromDistrictOptions = useMemo(
    () => districts.filter((item: any) => String(item?.state?._id || item?.state || "") === createForm.fromState),
    [districts, createForm.fromState]
  );

  const toDistrictOptions = useMemo(
    () => districts.filter((item: any) => String(item?.state?._id || item?.state || "") === createForm.toState),
    [districts, createForm.toState]
  );

  const enquiries = useMemo(() => {
    const raw = enquiryRes?.data?.data;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw)) return raw;
    return [];
  }, [enquiryRes]);

  const serviceRequests = useMemo<ServiceRequestRow[]>(() => {
    const raw = serviceRequestRes?.data?.data;
    if (Array.isArray(raw?.data)) return raw.data as ServiceRequestRow[];
    if (Array.isArray(raw)) return raw as ServiceRequestRow[];
    return [];
  }, [serviceRequestRes]);

  const isServiceApiMissing = Boolean(
    isServiceError && (serviceRequestError as any)?.response?.status === 404
  );

  const rows = useMemo(() => {
    const userId = user?.id?.toString();
    const configuredInterests = Array.isArray((interestsStatusRes as any)?.data?.data?.companyInterests)
      ? (interestsStatusRes as any).data.data.companyInterests.map((x: any) => String(x || "").toUpperCase())
      : Array.isArray((user as any)?.companyInterests)
        ? (user as any).companyInterests.map((x: any) => String(x || "").toUpperCase())
        : [];
    const isSystemAdmin = isAdmin;
    const isProviderAssociate = roleLower === "associate";

    return enquiries.flatMap((enq: any) => {
      const buyerId = (enq?.buyerAssociateId?._id || enq?.buyerAssociateId || "").toString();
      const sellerId = (enq?.sellerAssociateId?._id || enq?.sellerAssociateId || "").toString();
      const isBuyer = userId && buyerId === userId;
      const isSeller = userId && sellerId === userId;
      const assignedOperatorId = (enq?.assignedOperatorId?._id || enq?.assignedOperatorId || "").toString();
      const isAssignedOperator = Boolean(isOperatorUser && userId && assignedOperatorId === userId);
      const createdById = String(enq?.createdBy?._id || enq?.createdBy || "");
      const isCreatedByOperator = Boolean(isOperatorUser && userId && createdById === userId);
      const canSeeEnquiry = isSystemAdmin || !isOperatorUser || isAssignedOperator || isCreatedByOperator;
      if (!canSeeEnquiry) return [];

      return (Array.isArray(enq?.executionInquiries) ? enq.executionInquiries : [])
        .map((task: any, idx: number) => {
          const owner = String(task?.ownerBy || "");
          const candidates = Array.isArray(task?.candidateProviders) ? task.candidateProviders : [];
          const providerCandidate = Boolean(
            myCompanyId && candidates.some((c: any) => String(c?._id || c || "") === myCompanyId)
          );
          const canBid =
            providerCandidate ||
            (owner === "buyer" && isBuyer) ||
            (owner === "seller" && isSeller);
          const canCommit = isSystemAdmin || isAssignedOperator;
          const canViewBidDetails = isSystemAdmin || isAssignedOperator || providerCandidate;
          const typeUpper = String(task?.type || "").toUpperCase();
          const matchesInterest = configuredInterests.length === 0 || configuredInterests.includes(typeUpper);
          const shouldShowByDefault = isSystemAdmin || isAssignedOperator || !isProviderAssociate || (providerCandidate && matchesInterest);
          if (!shouldShowByDefault) return null;

          const productName = enq?.productId?.name || enq?.productVariant?.product?.name || "Unknown Product";
          const variantName = enq?.productVariant?.name || enq?.variantId?.name || "Unknown Variant";
          const buyerName = enq?.buyerAssociateId?.name || enq?.buyerAssociateName || "Buyer";
          const sellerName = enq?.sellerAssociateId?.name || enq?.sellerAssociateName || "Supplier";

          return {
            key: `${enq?._id}-${task?.type}-${idx}`,
            enquiryId: enq?._id,
            enquiryCode: String(enq?._id || "").slice(-6).toUpperCase(),
            anchorName: `${productName} - ${variantName}`,
            productName,
            variantName,
            buyerName,
            sellerName,
            type: task?.type,
            title: task?.title || task?.type,
            ownerBy: owner,
            status: task?.status || "OPEN",
            bidAmount: task?.bidAmount,
            commitNote: task?.commitNote,
            details: task?.details || {},
            candidateCount: candidates.length,
            candidateProviders: candidates,
            providerCandidate,
            bids: Array.isArray(task?.bids) ? task.bids : [],
            committedProvider: task?.committedProvider || null,
            canBid,
            canCommit,
            canViewBidDetails,
            matchesInterest,
          };
        })
        .filter(Boolean) as any[];
    });
  }, [enquiries, user, interestsStatusRes, roleLower, myCompanyId, isAdmin, isOperatorUser]);

  const filteredRows = useMemo(() => {
    if (activeType === "ALL") return rows;
    return rows.filter((row: any) => String(row?.type || "").toUpperCase() === activeType);
  }, [rows, activeType]);

  const enquiriesWithTasks = useMemo(() => {
    const grouped: Record<string, any> = {};
    for (const row of filteredRows) {
      const key = String(row.enquiryId || "");
      if (!grouped[key]) {
        grouped[key] = {
          enquiryId: row.enquiryId,
          enquiryCode: row.enquiryCode,
          anchorName: row.anchorName,
          productName: row.productName,
          variantName: row.variantName,
          buyerName: row.buyerName,
          sellerName: row.sellerName,
          tradeType: row.details?.tradeType || "DOMESTIC",
          from: row.details?.from || "N/A",
          to: row.details?.to || "N/A",
          tasks: [],
        };
      }
      grouped[key].tasks.push(row);
    }
    return Object.values(grouped);
  }, [filteredRows]);

  const createServiceRequestMutation = useMutation({
    mutationFn: () =>
      postData(apiRoutes.serviceRequests.create, {
        requestType: createForm.requestType,
        title: createForm.title,
        serviceSpecifications: createForm.serviceSpecifications,
        fromState: createForm.fromState,
        fromDistrict: createForm.fromDistrict,
        toState: createForm.toState || null,
        toDistrict: createForm.toDistrict || null,
        requiredFromDate: createForm.requiredFromDate || null,
        requiredToDate: createForm.requiredToDate || null,
        createdByCompanyId: isAdmin ? createForm.createdByCompanyId || null : undefined,
      }),
    onSuccess: () => {
      toast.success("Service request created.");
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
      setCreateForm({
        requestType: "PACKAGING",
        title: "",
        serviceSpecifications: "",
        fromState: "",
        fromDistrict: "",
        toState: "",
        toDistrict: "",
        requiredFromDate: "",
        requiredToDate: "",
        createdByCompanyId: "",
      });
      setIsCreateModalOpen(false);
    },
    onError: (err: any) => {
      if (showServiceRequestApiUnavailableToast(err)) return;
      toast.error(err?.response?.data?.message || "Failed to create service request.");
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (payload: {
      enquiryId: string;
      type: string;
      bidAmount?: number;
      commitNote?: string;
      status?: string;
      committedProvider?: string;
    }) => {
      return patchData(`${apiRoutes.enquiry.getAll}/${payload.enquiryId}/execution-inquiries/${encodeURIComponent(payload.type)}`, {
        bidAmount: payload.bidAmount,
        commitNote: payload.commitNote,
        status: payload.status,
        committedProvider: payload.committedProvider,
      });
    },
    onSuccess: () => {
      toast.success("Execution inquiry updated.");
      queryClient.invalidateQueries({ queryKey: ["execution-enquiries"] });
    },
    onError: () => {
      toast.error("Failed to update execution inquiry.");
    },
  });

  const bidServiceRequestMutation = useMutation({
    mutationFn: (payload: { id: string; amount: number; note: string }) =>
      patchData(apiRoutes.serviceRequests.bid(payload.id), {
        amount: payload.amount,
        note: payload.note,
      }),
    onSuccess: () => {
      toast.success("Bid submitted.");
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
    },
    onError: (err: any) => {
      if (showServiceRequestApiUnavailableToast(err)) return;
      toast.error(err?.response?.data?.message || "Failed to submit bid.");
    },
  });

  const commitServiceRequestMutation = useMutation({
    mutationFn: (payload: { id: string; committedProvider?: string; bidAmount?: number; commitNote?: string }) =>
      patchData(apiRoutes.serviceRequests.commit(payload.id), payload),
    onSuccess: () => {
      toast.success("Service request committed.");
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
    },
    onError: (err: any) => {
      if (showServiceRequestApiUnavailableToast(err)) return;
      toast.error(err?.response?.data?.message || "Failed to commit service request.");
    },
  });

  const updateServiceStatusMutation = useMutation({
    mutationFn: (payload: { id: string; status: string }) => patchData(apiRoutes.serviceRequests.status(payload.id), { status: payload.status }),
    onSuccess: () => {
      toast.success("Service request status updated.");
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
    },
    onError: (err: any) => {
      if (showServiceRequestApiUnavailableToast(err)) return;
      toast.error(err?.response?.data?.message || "Failed to update status.");
    },
  });

  const switchTab = (tab: "deal-execution" | "service-requests") => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "service-requests") params.set("tab", "service-requests");
    else params.delete("tab");
    router.replace(`/dashboard/execution-enquiries${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const canCreateServiceRequest = isAdmin || isOperatorUser || roleLower === "associate";

  if ((activeTab === "deal-execution" && isDealLoading) || (activeTab === "service-requests" && isServiceLoading)) {
    return <BrandedLoader message="Loading execution enquiries" />;
  }

  return (
    <section>
      <Title title="Execution Enquiries Panel" />

      <Card className="mt-3 border border-default-200 bg-content1/70">
        <CardBody className="py-3">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <ButtonGroup radius="sm" variant="flat">
              <Button
                color={activeTab === "deal-execution" ? "warning" : "default"}
                variant={activeTab === "deal-execution" ? "solid" : "flat"}
                startContent={<FiLayers size={14} />}
                onPress={() => switchTab("deal-execution")}
              >
                Deal Execution
              </Button>
              <Button
                color={activeTab === "service-requests" ? "warning" : "default"}
                variant={activeTab === "service-requests" ? "solid" : "flat"}
                startContent={<FiBriefcase size={14} />}
                onPress={() => switchTab("service-requests")}
              >
                Service Requests
              </Button>
            </ButtonGroup>

            {activeTab === "service-requests" && canCreateServiceRequest && (
              <Button
                color="primary"
                size="md"
                className="w-full md:w-auto md:ml-auto font-bold shadow-lg shadow-primary/20"
                startContent={<FiPlus size={18} />}
                onPress={() => setIsCreateModalOpen(true)}
              >
                Create Partial Service
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {activeTab === "deal-execution" && (
        <>
          <div className="mt-3 flex flex-wrap gap-2">
            {typeFilters.map((item) => (
              <Chip
                key={item.key}
                variant={activeType === item.key ? "solid" : "flat"}
                color={activeType === item.key ? "warning" : "default"}
                className="cursor-pointer"
                onClick={() => setActiveType(item.key)}
              >
                {item.label}
              </Chip>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-5">
            {enquiriesWithTasks.map((enq: any) => (
              <Card key={enq.enquiryId} className="border border-default-200 shadow-sm">
                <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest font-bold text-default-400">Execution Anchor</div>
                    <div className="text-base font-bold text-foreground">{enq.anchorName}</div>
                    <div className="text-xs text-default-500 mt-1">Enquiry #{enq.enquiryCode}</div>
                  </div>
                  <div className="rounded-md bg-default-100 p-2 text-xs text-default-600 min-w-[220px]">
                    <div>Trade: {enq.tradeType}</div>
                    <div>From: {enq.from}</div>
                    <div>To: {enq.to}</div>
                    <div>Buyer: {enq.buyerName}</div>
                    <div>Supplier: {enq.sellerName}</div>
                  </div>
                </CardHeader>
                <CardBody className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {enq.tasks.map((row: any) => (
                      <Card key={row.key} className="border border-default-200 relative overflow-hidden">
                        {/* Recently Opened / New Indicator Dot */}
                        {enq.createdAt && (Date.now() - new Date(enq.createdAt).getTime() < 86400000) && (
                          <div className="absolute top-3 right-3 z-20 flex items-center justify-center">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-success-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                            </span>
                          </div>
                        )}
                        <CardHeader className="flex justify-between items-start gap-2">
                          <div>
                            <div className="font-semibold">{row.title}</div>
                            <div className="text-xs text-default-500">Owner: {String(row.ownerBy || "obaol").toUpperCase()}</div>
                            <div className="text-[10px] text-default-400">Providers: {row.candidateCount || 0}</div>
                          </div>
                          <Chip size="sm" color={row.status === "COMPLETED" ? "success" : row.status === "IN_PROGRESS" ? "warning" : "default"} variant="flat">
                            {row.status}
                          </Chip>
                        </CardHeader>
                        <CardBody className="flex flex-col gap-3">
                          {String(row.type || "").toUpperCase() === "PACKAGING" ? (
                            <div className="rounded-md bg-default-100 p-2 text-xs text-default-600">
                              <div>From State: {row.details?.fromState || "N/A"}</div>
                              <div>From District: {row.details?.fromDistrict || "N/A"}</div>
                              <div className="mt-1">Packaging Specs: {row.details?.packagingSpecifications || "Not provided"}</div>
                              {row.providerCandidate ? <div className="mt-1 text-success">You are eligible to bid for this inquiry.</div> : null}
                            </div>
                          ) : (
                            <div className="rounded-md bg-default-100 p-2 text-xs text-default-600">
                              {row.details?.routeNotes ? <div>Notes: {row.details.routeNotes}</div> : <div>No additional notes.</div>}
                              {row.providerCandidate ? <div className="mt-1 text-success">You are eligible to bid for this inquiry.</div> : null}
                            </div>
                          )}

                          <div className="rounded-md border border-default-200 bg-default-50/40 p-2 text-xs text-default-700">
                            <div className="font-semibold mb-1">Bid Summary</div>
                            <div>Total Bids: {Array.isArray(row.bids) ? row.bids.length : 0}</div>
                            <div>Committed Provider: {getName(row.committedProvider)}</div>
                            <div>Awarded Amount: {typeof row.bidAmount === "number" ? row.bidAmount : "-"}</div>
                            {row.canViewBidDetails ? (
                              <div className="mt-2 overflow-x-auto">
                                <table className="w-full min-w-[320px] text-[11px]">
                                  <thead>
                                    <tr className="text-default-500">
                                      <th className="text-left py-1">Company</th>
                                      <th className="text-left py-1">Amount</th>
                                      <th className="text-left py-1">Note</th>
                                      <th className="text-left py-1">Status</th>
                                      <th className="text-left py-1">Updated</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(Array.isArray(row.bids) ? row.bids : []).map((bid: any, bidIdx: number) => (
                                      <tr key={`${row.key}-bid-${bidIdx}`} className="border-t border-default-200/60">
                                        <td className="py-1">{getName(bid?.company)}</td>
                                        <td className="py-1">
                                          {typeof bid?.amount === "number" && !Number.isNaN(bid.amount) ? bid.amount : "-"}
                                        </td>
                                        <td className="py-1">{String(bid?.note || "-")}</td>
                                        <td className="py-1">{String(bid?.status || "SUBMITTED")}</td>
                                        <td className="py-1">{formatDate(bid?.updatedAt || bid?.createdAt)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="mt-1 text-default-500">Detailed bid amounts are restricted for this task.</div>
                            )}
                          </div>

                          {row.canCommit ? (
                            <Autocomplete
                              size="sm"
                              label="Select Company to Commit (Optional)"
                              selectedKey={selectedExecutionCommitProvider[row.key] || ""}
                              onSelectionChange={(key) =>
                                setSelectedExecutionCommitProvider((prev) => ({ ...prev, [row.key]: String(key || "") }))
                              }
                            >
                              {(Array.isArray(row.candidateProviders) && row.candidateProviders.length > 0
                                ? row.candidateProviders
                                : Array.isArray(row.bids)
                                  ? row.bids.map((bid: any) => bid?.company).filter(Boolean)
                                  : []
                              ).map((company: any, idx: number) => {
                                const companyId = String(company?._id || company || "");
                                const companyName = getName(company);
                                return (
                                  <AutocompleteItem key={companyId || `company-${idx}`} textValue={companyName}>
                                    {companyName}
                                  </AutocompleteItem>
                                );
                              })}
                            </Autocomplete>
                          ) : null}

                          <Input
                            size="sm"
                            type="number"
                            label="Bid Amount"
                            value={bidMap[row.key] ?? (row.bidAmount?.toString() || "")}
                            onValueChange={(v) => setBidMap((prev) => ({ ...prev, [row.key]: v }))}
                            isDisabled={!(row.canBid || row.canCommit)}
                          />
                          <Textarea
                            size="sm"
                            label="Commit Note"
                            value={noteMap[row.key] ?? (row.commitNote || "")}
                            onValueChange={(v) => setNoteMap((prev) => ({ ...prev, [row.key]: v }))}
                            isDisabled={!(row.canBid || row.canCommit)}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="flat"
                              color="warning"
                              isDisabled={!row.canBid}
                              isLoading={updateTaskMutation.isPending}
                              onPress={() =>
                                updateTaskMutation.mutate({
                                  enquiryId: row.enquiryId,
                                  type: row.type,
                                  bidAmount: Number(bidMap[row.key] || row.bidAmount || 0),
                                  commitNote: noteMap[row.key] ?? row.commitNote,
                                  status: isAdmin ? "IN_PROGRESS" : undefined,
                                })
                              }
                            >
                              Place Bid
                            </Button>
                            <Button
                              size="sm"
                              color="success"
                              isDisabled={
                                !row.canCommit || !selectedExecutionCommitProvider[row.key]
                              }
                              isLoading={updateTaskMutation.isPending}
                              onPress={() =>
                                updateTaskMutation.mutate({
                                  enquiryId: row.enquiryId,
                                  type: row.type,
                                  bidAmount: Number(bidMap[row.key] || row.bidAmount || 0),
                                  commitNote: noteMap[row.key] ?? row.commitNote,
                                  committedProvider: selectedExecutionCommitProvider[row.key] || undefined,
                                })
                              }
                            >
                              Commit
                            </Button>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
          {enquiriesWithTasks.length === 0 && <div className="text-center text-default-500 py-16">No execution enquiries available yet.</div>}
        </>
      )}

      {activeTab === "service-requests" && (
        <>
          {isServiceApiMissing ? (
            <Card className="mt-3 border border-danger-300 bg-danger-50/70 dark:bg-danger-950/20">
              <CardBody className="py-3 text-sm text-danger-700 dark:text-danger-300">
                Service Requests API is unavailable on the current backend target.
                {" "}
                <span className="font-semibold">Current target:</span> {getActiveBackendTarget()}.
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

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {serviceRequests.map((item) => {
              const key = String(item._id);
              const bids = Array.isArray(item.bids) ? item.bids : [];
              const candidates = Array.isArray(item.candidateProviders) ? item.candidateProviders : [];
              const commitOptions = candidates.length
                ? candidates
                : bids.map((bid: any) => bid?.company).filter(Boolean);
              const isCandidate = !!myCompanyId && candidates.some((provider: any) => String(provider?._id || provider) === myCompanyId);
              const creatorAssociateId = String((item as any)?.createdByAssociateId?._id || (item as any)?.createdByAssociateId || "");
              const isCreatorAssociate =
                roleLower === "associate" &&
                creatorAssociateId === String(user?.id || "");
              const canViewServiceBidDetails = isAdmin || isCandidate || isCreatorAssociate;
              const canBid = roleLower === "associate" ? isCandidate : isAdmin;

              return (
                <Card key={key} className="border border-default-200 shadow-sm relative overflow-hidden">
                  {/* Recently Opened / New Indicator Dot */}
                  {item.createdAt && (Date.now() - new Date(item.createdAt).getTime() < 86400000) && (
                    <div className="absolute top-3 right-3 z-20 flex items-center justify-center">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-success-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                      </span>
                    </div>
                  )}
                  <CardHeader className="flex justify-between items-start gap-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest font-bold text-default-400">{item.requestType}</div>
                      <div className="font-semibold text-base">{item.title}</div>
                      <div className="text-xs text-default-500 mt-1">
                        From: {getName(item.fromState)}, {getName(item.fromDistrict)}
                        {item.toState || item.toDistrict ? ` | To: ${getName(item.toState)}, ${getName(item.toDistrict)}` : ""}
                      </div>
                    </div>
                    <Chip size="sm" color={item.status === "COMPLETED" ? "success" : item.status === "IN_PROGRESS" ? "warning" : item.status === "CANCELLED" ? "danger" : "default"}>
                      {item.status}
                    </Chip>
                  </CardHeader>
                  <CardBody className="pt-0 flex flex-col gap-3">
                    <div className="rounded-md bg-default-100 p-2 text-xs text-default-600">
                      <div>{item.serviceSpecifications}</div>
                      <div className="mt-1">Date Window: {formatDate(item.requiredFromDate)} → {formatDate(item.requiredToDate)}</div>
                      <div className="mt-1">Candidate Providers: {candidates.length}</div>
                      <div className="mt-1">Created By: {item.createdByRole || "-"}</div>
                      {isAdmin ? <div className="mt-1">Company: {getName(item.createdByCompanyId)}</div> : null}
                    </div>

                    <div className="rounded-md border border-default-200 bg-default-50/40 p-2 text-xs text-default-700">
                      <div className="font-semibold mb-1">Bid Summary</div>
                      <div>Total Bids: {bids.length}</div>
                      <div>Committed Provider: {getName(item.committedProvider)}</div>
                      <div>Awarded Amount: {typeof item.bidAmount === "number" ? item.bidAmount : "-"}</div>
                      {canViewServiceBidDetails ? (
                        <div className="mt-2 overflow-x-auto">
                          <table className="w-full min-w-[320px] text-[11px]">
                            <thead>
                              <tr className="text-default-500">
                                <th className="text-left py-1">Company</th>
                                <th className="text-left py-1">Amount</th>
                                <th className="text-left py-1">Note</th>
                                <th className="text-left py-1">Status</th>
                                <th className="text-left py-1">Updated</th>
                              </tr>
                            </thead>
                            <tbody>
                              {bids.map((bid: any, bidIdx: number) => (
                                <tr key={`${key}-service-bid-${bidIdx}`} className="border-t border-default-200/60">
                                  <td className="py-1">{getName(bid?.company)}</td>
                                  <td className="py-1">
                                    {typeof bid?.amount === "number" && !Number.isNaN(bid.amount) ? bid.amount : "-"}
                                  </td>
                                  <td className="py-1">{String(bid?.note || "-")}</td>
                                  <td className="py-1">{String(bid?.status || "SUBMITTED")}</td>
                                  <td className="py-1">{formatDate(bid?.updatedAt || bid?.createdAt)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="mt-1 text-default-500">Detailed bid amounts are restricted for this request.</div>
                      )}
                    </div>

                    <Input
                      size="sm"
                      type="number"
                      label="Bid Amount"
                      value={bidMap[key] ?? ""}
                      onValueChange={(v) => setBidMap((prev) => ({ ...prev, [key]: v }))}
                      isDisabled={!canBid || item.status === "COMPLETED" || item.status === "CANCELLED"}
                    />
                    <Textarea
                      size="sm"
                      label="Bid / Commit Note"
                      value={noteMap[key] ?? ""}
                      onValueChange={(v) => setNoteMap((prev) => ({ ...prev, [key]: v }))}
                      isDisabled={!canBid || item.status === "COMPLETED" || item.status === "CANCELLED"}
                    />

                    {isAdmin && commitOptions.length > 0 && (
                      <Autocomplete
                        size="sm"
                        label="Select Company to Commit (Optional)"
                        selectedKey={selectedCommitProvider[key] || ""}
                        onSelectionChange={(value) =>
                          setSelectedCommitProvider((prev) => ({ ...prev, [key]: String(value || "") }))
                        }
                      >
                        {commitOptions.map((company: any, idx: number) => {
                          const companyId = String(company?._id || company || "");
                          const companyName = String(company?.name || company || companyId);
                          return (
                            <AutocompleteItem key={companyId || `company-${idx}`} textValue={companyName}>
                              {companyName}
                            </AutocompleteItem>
                          );
                        })}
                      </Autocomplete>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="flat"
                        color="warning"
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

          {serviceRequests.length === 0 && <div className="text-center text-default-500 py-16">No service requests available yet.</div>}

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
                      <Input
                        label="Requested By"
                        value={String(user?.name || user?.email || "-")}
                        isReadOnly
                      />
                      {isAdmin ? (
                        <Autocomplete
                          label="Company Needing Service (Optional)"
                          selectedKey={createForm.createdByCompanyId || ""}
                          onSelectionChange={(value) =>
                            setCreateForm((prev) => ({ ...prev, createdByCompanyId: String(value || "") }))
                          }
                        >
                          {companyOptions.map((company: any, idx: number) => {
                            const companyId = String(company?._id || "");
                            const companyName = String(company?.name || companyId || "-");
                            return (
                              <AutocompleteItem key={companyId || `company-${idx}`} textValue={companyName}>
                                {companyName}
                              </AutocompleteItem>
                            );
                          })}
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
        </>
      )}
    </section>
  );
}
