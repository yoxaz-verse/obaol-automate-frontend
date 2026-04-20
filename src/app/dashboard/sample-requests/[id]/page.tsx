"use client";

import React, { useContext, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@heroui/react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { 
  LuFileText, 
  LuQuote, 
  LuCheck, 
  LuWallet, 
  LuPackageOpen, 
  LuPackage, 
  LuTruck, 
  LuMapPin, 
  LuChevronLeft,
  LuClock,
  LuFileSearch,
  LuUser,
  LuBuilding2,
  LuX,
  LuActivity
} from "react-icons/lu";
import { motion } from "framer-motion";

import Title from "@/components/titles";
import AuthContext from "@/context/AuthContext";
import { apiRoutes, associateCompanyRoutes } from "@/core/api/apiRoutes";
import { getData, patchData, postMultipart } from "@/core/api/apiHandler";
import { showToastMessage } from "@/utils/utils";

const STAGES = [
  { key: "REQUESTED", label: "Requested", dateKey: "requestedAt", icon: <LuFileText size={16} /> },
  { key: "QUOTED", label: "Quoted", dateKey: "quotedAt", icon: <LuQuote size={16} /> },
  { key: "ACCEPTED", label: "Accepted", dateKey: "acceptedAt", icon: <LuCheck size={16} /> },
  { key: "PAYMENT_RECEIVED", label: "Payment Received", dateKey: "paymentReceivedAt", icon: <LuWallet size={16} /> },
  { key: "PREPARING_PACKAGING", label: "Preparing Packaging", dateKey: "packagingStartedAt", icon: <LuPackageOpen size={16} /> },
  { key: "PACKAGED", label: "Packaged", dateKey: "packagedAt", icon: <LuPackage size={16} /> },
  { key: "COURIER_SUBMITTED", label: "Courier Submitted", dateKey: "courierSubmittedAt", icon: <LuTruck size={16} /> },
  { key: "IN_TRANSIT", label: "In Transit", dateKey: "inTransitAt", icon: <LuMapPin size={16} /> },
  { key: "RECEIPT_CONFIRMED", label: "Buyer Accepted", dateKey: "receiptConfirmedAt", icon: <LuCheck size={16} /> },
];

const statusColor = (status: string) => {
  switch (status) {
    case "REQUESTED":
      return "warning";
    case "QUOTED":
      return "primary";
    case "ACCEPTED":
    case "PAYMENT_RECEIVED":
    case "PREPARING_PACKAGING":
    case "PACKAGED":
    case "COURIER_SUBMITTED":
    case "IN_TRANSIT":
      return "secondary";
    case "RECEIPT_CONFIRMED":
      return "success";
    case "REJECTED":
      return "danger";
    case "CANCELLED":
      return "default";
    default:
      return "default";
  }
};

export default function SampleRequestDetailPage() {
  const { user } = useContext(AuthContext);
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = String((params as any)?.id || "");

  const roleLower = String(user?.role || "").toLowerCase();
  const isAdmin = roleLower === "admin";
  const isOperatorUser = roleLower === "operator" || roleLower === "team";
  const isAssociate = roleLower === "associate";
  const associateCompanyId = (user as any)?.associateCompanyId || null;

  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [courierModalOpen, setCourierModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [quoteMinQty, setQuoteMinQty] = useState("");
  const [quotePrice, setQuotePrice] = useState("");
  const [samplePaymentTerm, setSamplePaymentTerm] = useState("ADVANCE");
  const [paymentMode, setPaymentMode] = useState<"CASH" | "ONLINE" | "">("");
  const [onlinePaymentMethod, setOnlinePaymentMethod] = useState<"GPAY" | "CARD" | "">("");
  const [courierAgencyName, setCourierAgencyName] = useState("");
  const [courierTrackingNumber, setCourierTrackingNumber] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const { data: detailResponse, isLoading, isError, error } = useQuery({
    queryKey: ["sample-request", id],
    queryFn: () => getData(apiRoutes.sampleRequest.getOne(id)),
    enabled: Boolean(id),
  });

  const { data: operatorCompanyData, isLoading: operatorCompaniesLoading } = useQuery({
    queryKey: ["sample-request-operator-companies", associateCompanyRoutes.getAll, user?.id, roleLower],
    queryFn: () => getData(associateCompanyRoutes.getAll, { limit: 300 }),
    enabled: isOperatorUser,
  });

  const operatorCompanyIds: string[] = useMemo(() => {
    if (!isOperatorUser) return [];
    return ((operatorCompanyData?.data?.data?.data || []) as Array<{ _id?: string }>)
      .map((company) => company?._id)
      .filter((cid): cid is string => Boolean(cid));
  }, [operatorCompanyData, isOperatorUser]);

  const request = detailResponse?.data?.data;
  const status = String(request?.status || "").toUpperCase();
  const statusLabel = status === "RECEIPT_CONFIRMED" ? "BUYER ACCEPTED" : status.replace(/_/g, " ");

  const supplierCompanyId =
    request?.supplierCompanyId?._id || request?.supplierCompanyId || "";
  const buyerCompanyId =
    request?.buyerAssociateId?.associateCompanyId?._id ||
    request?.buyerAssociateId?.associateCompanyId ||
    request?.buyerAssociateCompanyId?._id ||
    request?.buyerAssociateCompanyId ||
    "";
  const isOperatorScoped = !isOperatorUser
    ? true
    : operatorCompanyIds.length > 0 &&
      (operatorCompanyIds.includes(String(supplierCompanyId)) ||
        operatorCompanyIds.includes(String(buyerCompanyId)));

  const isBuyer = isAssociate && String(request?.buyerAssociateId?._id || request?.buyerAssociateId) === String(user?.id || "");
  const isSupplier = isAssociate && associateCompanyId && String(request?.supplierCompanyId?._id || request?.supplierCompanyId) === String(associateCompanyId);
  const canSupplier = isSupplier || isAdmin || isOperatorUser;
  const canBuyer = isBuyer || isAdmin || isOperatorUser;

  const formatDate = (value: any) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString();
  };

  const quoteMutation = useMutation({
    mutationFn: async () => {
      return patchData(apiRoutes.sampleRequest.quote(id), {
        supplierMinQty: Number(quoteMinQty),
        supplierPrice: Number(quotePrice),
        samplePaymentTerm,
      });
    },
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Sample quote submitted.", position: "top-right" });
      setQuoteModalOpen(false);
      setQuoteMinQty("");
      setQuotePrice("");
      setSamplePaymentTerm("ADVANCE");
      queryClient.invalidateQueries({ queryKey: ["sample-request", id] });
      queryClient.invalidateQueries({ queryKey: ["sample-requests"] });
    },
    onError: (error: any) => {
      showToastMessage({ type: "error", message: error?.response?.data?.message || "Unable to submit quote.", position: "top-right" });
    },
  });

  const decisionMutation = useMutation({
    mutationFn: async (decision: "ACCEPT" | "REJECT") => {
      return patchData(apiRoutes.sampleRequest.decision(id), { decision });
    },
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Decision updated.", position: "top-right" });
      queryClient.invalidateQueries({ queryKey: ["sample-request", id] });
      queryClient.invalidateQueries({ queryKey: ["sample-requests"] });
    },
    onError: (error: any) => {
      showToastMessage({ type: "error", message: error?.response?.data?.message || "Unable to update decision.", position: "top-right" });
    },
  });

  const paymentMutation = useMutation({
    mutationFn: async () =>
      patchData(apiRoutes.sampleRequest.paymentReceived(id), {
        paymentMode,
        onlinePaymentMethod: paymentMode === "ONLINE" ? onlinePaymentMethod : undefined,
      }),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Payment confirmed.", position: "top-right" });
      setPaymentModalOpen(false);
      setPaymentMode("");
      setOnlinePaymentMethod("");
      queryClient.invalidateQueries({ queryKey: ["sample-request", id] });
      queryClient.invalidateQueries({ queryKey: ["sample-requests"] });
    },
    onError: (error: any) => {
      showToastMessage({ type: "error", message: error?.response?.data?.message || "Unable to confirm payment.", position: "top-right" });
    },
  });

  const packagingStartMutation = useMutation({
    mutationFn: async () => patchData(apiRoutes.sampleRequest.packagingStart(id), {}),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Packaging started.", position: "top-right" });
      queryClient.invalidateQueries({ queryKey: ["sample-request", id] });
      queryClient.invalidateQueries({ queryKey: ["sample-requests"] });
    },
    onError: (error: any) => {
      showToastMessage({ type: "error", message: error?.response?.data?.message || "Unable to start packaging.", position: "top-right" });
    },
  });

  const packagedMutation = useMutation({
    mutationFn: async () => patchData(apiRoutes.sampleRequest.packaged(id), {}),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Marked as packaged.", position: "top-right" });
      queryClient.invalidateQueries({ queryKey: ["sample-request", id] });
      queryClient.invalidateQueries({ queryKey: ["sample-requests"] });
    },
    onError: (error: any) => {
      showToastMessage({ type: "error", message: error?.response?.data?.message || "Unable to update packaging.", position: "top-right" });
    },
  });

  const courierSubmitMutation = useMutation({
    mutationFn: async () =>
      patchData(apiRoutes.sampleRequest.courierSubmit(id), {
        courierAgencyName: courierAgencyName || undefined,
        courierTrackingNumber,
      }),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Courier details saved.", position: "top-right" });
      setCourierModalOpen(false);
      setCourierAgencyName("");
      setCourierTrackingNumber("");
      queryClient.invalidateQueries({ queryKey: ["sample-request", id] });
      queryClient.invalidateQueries({ queryKey: ["sample-requests"] });
    },
    onError: (error: any) => {
      showToastMessage({ type: "error", message: error?.response?.data?.message || "Unable to submit courier details.", position: "top-right" });
    },
  });

  const inTransitMutation = useMutation({
    mutationFn: async () => patchData(apiRoutes.sampleRequest.inTransit(id), {}),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Marked as in transit.", position: "top-right" });
      queryClient.invalidateQueries({ queryKey: ["sample-request", id] });
      queryClient.invalidateQueries({ queryKey: ["sample-requests"] });
    },
    onError: (error: any) => {
      showToastMessage({ type: "error", message: error?.response?.data?.message || "Unable to mark in transit.", position: "top-right" });
    },
  });

  const receiptMutation = useMutation({
    mutationFn: async () => {
      let receiptFileId: string | null = null;
      if (receiptFile) {
        const formData = new FormData();
        formData.append("file", receiptFile);
        const uploadResp: any = await postMultipart("/upload", formData);
        const payload = uploadResp?.data?.data || uploadResp?.data || {};
        receiptFileId = payload?._id || payload?.fileId || payload?.id || null;
      }
      return patchData(apiRoutes.sampleRequest.receiptConfirm(id), {
        receiptFileId: receiptFileId || undefined,
      });
    },
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Receipt confirmed.", position: "top-right" });
      setReceiptModalOpen(false);
      setReceiptFile(null);
      queryClient.invalidateQueries({ queryKey: ["sample-request", id] });
      queryClient.invalidateQueries({ queryKey: ["sample-requests"] });
    },
    onError: (error: any) => {
      showToastMessage({ type: "error", message: error?.response?.data?.message || "Unable to confirm receipt.", position: "top-right" });
    },
  });

  const stageItems = useMemo(() => {
    return STAGES.map((stage) => {
      const dateValue = request?.[stage.dateKey];
      return {
        ...stage,
        dateValue,
      };
    });
  }, [request]);

  if (isLoading) {
    return (
      <section className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-warning border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold uppercase tracking-widest text-default-400">Establishing Data Link...</p>
        </div>
      </section>
    );
  }

  const errorStatus = (error as any)?.response?.status;
  const errorMessage = (error as any)?.response?.data?.message || "Unable to load this sample request right now.";

  if (isError) {
    const isAccessError = errorStatus === 403;
    const isMissingError = errorStatus === 404;
    return (
      <section className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        <div className="w-20 h-20 bg-default-100 rounded-full flex items-center justify-center text-default-400 mb-6">
          <LuFileSearch size={40} />
        </div>
        <h2 className="text-xl font-bold mb-2">
          {isAccessError ? "Access Restricted" : isMissingError ? "Request Not Found" : "Unable to Load Request"}
        </h2>
        <p className="text-default-500 text-sm mb-8 text-center max-w-sm">
          {errorMessage}
        </p>
        <Button
          variant="flat"
          className="h-11 rounded-xl font-bold px-8"
          onPress={() => router.push("/dashboard/sample-requests")}
          startContent={<LuChevronLeft size={18} />}
        >
          Return to Hub
        </Button>
      </section>
    );
  }

  if (!request) {
    return (
      <section className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        <div className="w-20 h-20 bg-default-100 rounded-full flex items-center justify-center text-default-400 mb-6">
          <LuFileSearch size={40} />
        </div>
        <h2 className="text-xl font-bold mb-2">Request Not Found</h2>
        <p className="text-default-500 text-sm mb-8 text-center max-w-xs">The sample request you are looking for might have been removed or moved.</p>
        <Button 
          variant="flat" 
          className="h-11 rounded-xl font-bold px-8"
          onPress={() => router.push("/dashboard/sample-requests")}
          startContent={<LuChevronLeft size={18} />}
        >
          Return to Hub
        </Button>
      </section>
    );
  }

  if (isOperatorUser && operatorCompaniesLoading) {
    return (
      <section className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-warning border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold uppercase tracking-widest text-default-400">Validating Operator Scope...</p>
        </div>
      </section>
    );
  }

  if (isOperatorUser && !isOperatorScoped) {
    return (
      <section className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        <div className="w-20 h-20 bg-default-100 rounded-full flex items-center justify-center text-default-400 mb-6">
          <LuFileSearch size={40} />
        </div>
        <h2 className="text-xl font-bold mb-2">Access Restricted</h2>
        <p className="text-default-500 text-sm mb-8 text-center max-w-xs">
          This sample request is outside your assigned company scope.
        </p>
        <Button
          variant="flat"
          className="h-11 rounded-xl font-bold px-8"
          onPress={() => router.push("/dashboard/sample-requests")}
          startContent={<LuChevronLeft size={18} />}
        >
          Return to Hub
        </Button>
      </section>
    );
  }

  const variantName = request?.variantRateId?.productVariant?.name || "Variant";
  const productName = request?.variantRateId?.productVariant?.product?.name || "Product";
  const buyerName = request?.buyerAssociateId?.name || "Buyer";
  const supplierName = request?.supplierCompanyId?.name || "Supplier";
  const buyerDisplay = !isAssociate ? buyerName : isBuyer ? buyerName : "";
  const supplierDisplay = !isAssociate ? supplierName : isSupplier ? supplierName : "";
  const samplePaymentTermLabel =
    String(request?.samplePaymentTerm || "ADVANCE") === "COURIER_CHARGES"
      ? "Courier Charges"
      : "Advance";
  const paymentModeLabel =
    String(request?.paymentMode || "").toUpperCase() === "ONLINE"
      ? "Online"
      : String(request?.paymentMode || "").toUpperCase() === "CASH"
        ? "Cash"
        : "—";
  const onlinePaymentMethodLabel =
    String(request?.onlinePaymentMethod || "").toUpperCase() === "GPAY"
      ? "GPay"
      : String(request?.onlinePaymentMethod || "").toUpperCase() === "CARD"
        ? "Card"
        : "—";
  const receiptFileUrl = request?.receiptFileId?.fileURL || request?.receiptFileId?.fileId || null;

  return (
    <>
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-8 max-w-7xl mx-auto w-full"
    >
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
             <Button 
               isIconOnly 
               variant="flat" 
               radius="full" 
               size="sm" 
               className="bg-default-100/50 hover:bg-default-200"
               onPress={() => router.push("/dashboard/sample-requests")}
             >
               <LuChevronLeft size={16} />
             </Button>
             <div className="w-1.5 h-1.5 bg-warning rounded-full" />
             <span className="text-[10px] font-bold tracking-widest uppercase text-warning">Sample Procurement</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{productName} • {variantName}</h1>
          <p className="text-default-500 text-xs font-medium uppercase tracking-[0.15em] opacity-80">
            Internal Sample Management Flow
          </p>
        </div>

        <div className="flex items-center gap-3">
           <Chip 
             variant="flat" 
             color={statusColor(status)}
             className="h-10 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px] border border-current/10"
           >
             {statusLabel}
           </Chip>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Main Info Card */}
          <Card className="rounded-[2.5rem] bg-foreground/[0.02] backdrop-blur-3xl border border-foreground/5 dark:border-white/5 shadow-2xl overflow-hidden p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-warning/10 text-warning flex items-center justify-center">
                    <LuUser size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-default-400 block mb-0.5">Request Owner</span>
                    <p className="text-sm font-bold uppercase tracking-tight">{buyerDisplay || "—"}</p>
                  </div>
                </div>

                {!isAssociate && (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                      <LuBuilding2 size={24} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-default-400 block mb-0.5">Supplier</span>
                      <p className="text-sm font-bold uppercase tracking-tight">{supplierDisplay || "—"}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-6 p-6 rounded-[2rem] bg-foreground/[0.03] border border-foreground/5 justify-center">
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-default-400">Requested Quantity</span>
                  <div className="flex-1 border-b border-divider border-dashed mx-2 mb-1" />
                  <span className="text-xl font-bold text-foreground">{request?.requestedSampleQtyKg || 0} KG</span>
                </div>
                
                {request?.supplierPrice && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-default-400">Quote Rate</span>
                    <div className="flex-1 border-b border-divider border-dashed mx-2 mb-1" />
                    <span className="text-xl font-bold text-warning">{request.supplierPrice} <span className="text-[10px] text-default-400">/KG</span></span>
                  </div>
                )}
                {request?.supplierPrice && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-default-400">Sample Payment Term</span>
                    <div className="flex-1 border-b border-divider border-dashed mx-2 mb-1" />
                    <span className="text-sm font-bold text-foreground">{samplePaymentTermLabel}</span>
                  </div>
                )}
                {request?.paymentMode && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-default-400">Payment Mode</span>
                    <div className="flex-1 border-b border-divider border-dashed mx-2 mb-1" />
                    <span className="text-sm font-bold text-foreground">{paymentModeLabel}</span>
                  </div>
                )}
                {String(request?.paymentMode || "").toUpperCase() === "ONLINE" && request?.onlinePaymentMethod && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-default-400">Online Method</span>
                    <div className="flex-1 border-b border-divider border-dashed mx-2 mb-1" />
                    <span className="text-sm font-bold text-foreground">{onlinePaymentMethodLabel}</span>
                  </div>
                )}
              </div>
            </div>

            {request?.courierTrackingNumber && (
              <div className="mt-8 p-6 rounded-[1.5rem] bg-primary/5 border border-primary/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
                    <LuTruck size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-0.5">Logistics Tracking</span>
                    <p className="text-sm font-bold uppercase">{request.courierAgencyName || "Standard Courier"} • {request.courierTrackingNumber}</p>
                  </div>
                </div>
                {receiptFileUrl && (
                  <Button 
                    size="sm" 
                    variant="flat" 
                    color="primary"
                    className="rounded-xl font-bold h-9"
                    onPress={() => window.open(receiptFileUrl, "_blank")}
                  >
                    View Receipt
                  </Button>
                )}
              </div>
            )}
          </Card>

          {/* Timeline / Stepper */}
          <div className="px-4">
             <div className="flex items-center gap-3 mb-8">
                <LuClock size={18} className="text-warning" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Execution Timeline</h3>
             </div>

             <div className="relative flex flex-col gap-8 ml-3 border-l-2 border-divider/40">
                {stageItems.map((stage, idx) => {
                  const isActive = !!stage.dateValue;
                  const isCurrent = status === stage.key;
                  return (
                    <div key={stage.key} className="relative pl-10 group">
                      <div className={`absolute top-0 -left-[11px] w-5 h-5 rounded-full border-2 bg-background flex items-center justify-center transition-all duration-300 ${
                        isActive ? "border-warning text-warning scale-110 shadow-[0_0_15px_rgba(255,193,7,0.3)]" : "border-divider text-default-300"
                      }`}>
                        {isActive ? <LuCheck size={12} strokeWidth={4} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                      </div>
                      
                      <div className="flex flex-col gap-1 transition-all duration-300 group-hover:translate-x-1">
                        <div className="flex items-center gap-3">
                           <span className={`text-[11px] font-bold uppercase tracking-widest ${isActive ? "text-foreground" : "text-default-400"}`}>
                             {stage.label}
                           </span>
                           {isCurrent && <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />}
                        </div>
                        <span className="text-[10px] font-medium text-default-400 uppercase tracking-widest">
                          {isActive ? formatDate(stage.dateValue) : "Awaiting Progression"}
                        </span>
                      </div>
                    </div>
                  );
                })}
             </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-4 sticky top-8">
          <Card className="rounded-[2.5rem] bg-foreground/[0.02] backdrop-blur-3xl border border-foreground/5 dark:border-white/5 shadow-2xl overflow-hidden p-0">
            <div className="p-8 border-b border-foreground/5 bg-foreground/[0.01]">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-warning-500/10 rounded-2xl text-warning-500 shadow-inner group">
                  <LuActivity className="group-hover:animate-pulse" size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Operational Protocol</h3>
                  <p className="text-[9px] font-black text-default-400 uppercase tracking-widest mt-1 italic">Tactical Fulfillment Sequence</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex flex-col gap-4">
                {status === "REQUESTED" && canSupplier && (
                  <div className="space-y-4">
                     <div className="p-5 rounded-2xl bg-warning-500/5 border border-warning-500/10 mb-2">
                        <p className="text-[11px] font-bold text-warning-200/80 uppercase tracking-widest leading-relaxed">
                          Awaiting Quote Submission. Tactical parameter input required for procurement link.
                        </p>
                     </div>
                     <Button 
                       fullWidth
                       className="h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] text-black bg-warning-500 shadow-[0_10px_30px_rgba(245,158,11,0.25)] hover:scale-[1.02] active:scale-95 transition-all border-none"
                       onPress={() => {
                         setSamplePaymentTerm(request?.samplePaymentTerm || "ADVANCE");
                         setQuoteModalOpen(true);
                       }}
                       startContent={<LuFileText size={18} />}
                     >
                       INITIALIZE SAMPLE QUOTE
                     </Button>
                  </div>
                )}

                {status === "QUOTED" && canBuyer && (
                  <div className="flex flex-col gap-4">
                    <div className="p-5 rounded-2xl bg-primary-500/5 border border-primary-500/10 mb-2">
                       <p className="text-[11px] font-bold text-primary-200/80 uppercase tracking-widest leading-relaxed">
                         Quote received. Awaiting Associate Authorization to proceed with procurement.
                       </p>
                    </div>
                    <Button 
                      fullWidth
                      className="h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] text-white bg-success-500 shadow-[0_10px_30px_rgba(34,197,94,0.25)] hover:scale-[1.02] active:scale-95 transition-all border-none"
                      onPress={() => decisionMutation.mutate("ACCEPT")}
                      startContent={<LuCheck size={18} />}
                    >
                      AUTHORIZE QUOTE
                    </Button>
                    <Button 
                      fullWidth
                      variant="flat"
                      className="h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] text-danger-500 bg-danger-500/10 hover:bg-danger-500/20 border-none transition-all"
                      onPress={() => decisionMutation.mutate("REJECT")}
                      startContent={<LuX size={18} />}
                    >
                      ABORT REQUEST
                    </Button>
                  </div>
                )}

                {status === "ACCEPTED" && canBuyer && (
                  <Button 
                    fullWidth
                    className="h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] text-white bg-primary-500 shadow-[0_10px_30px_rgba(0,112,243,0.25)] hover:scale-[1.02] active:scale-95 transition-all border-none"
                    onPress={() => {
                      setPaymentMode("");
                      setOnlinePaymentMethod("");
                      setPaymentModalOpen(true);
                    }}
                    startContent={<LuWallet size={18} />}
                  >
                    MAKE PAYMENT
                  </Button>
                )}

                {status === "PAYMENT_RECEIVED" && canBuyer && !canSupplier && (
                  <div className="p-5 rounded-2xl bg-primary-500/5 border border-primary-500/10">
                    <p className="text-[11px] font-bold text-primary-200/80 uppercase tracking-widest leading-relaxed">
                      Payment recorded ({paymentModeLabel}{String(request?.paymentMode || "").toUpperCase() === "ONLINE" ? ` • ${onlinePaymentMethodLabel}` : ""}). Supplier will now continue with packaging protocol.
                    </p>
                  </div>
                )}

                {status === "PAYMENT_RECEIVED" && canSupplier && (
                  <div className="space-y-4">
                    <div className="p-5 rounded-2xl bg-warning-500/5 border border-warning-500/10">
                      <p className="text-[11px] font-bold text-warning-200/80 uppercase tracking-widest leading-relaxed">
                        Buyer payment received ({paymentModeLabel}{String(request?.paymentMode || "").toUpperCase() === "ONLINE" ? ` • ${onlinePaymentMethodLabel}` : ""}). Next step: initiate packaging protocol.
                      </p>
                    </div>
                    <Button 
                      fullWidth
                      className="h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] text-black bg-warning-500 shadow-[0_10px_30px_rgba(245,158,11,0.25)] hover:scale-[1.02] active:scale-95 transition-all border-none"
                      onPress={() => packagingStartMutation.mutate()}
                      startContent={<LuPackageOpen size={18} />}
                    >
                      INITIATE PACKAGING PROTOCOL
                    </Button>
                  </div>
                )}

                {status === "PREPARING_PACKAGING" && canSupplier && (
                  <Button 
                    fullWidth
                    className="h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] text-black bg-warning-500 shadow-[0_10px_30_rgba(245,158,11,0.25)] hover:scale-[1.02] active:scale-95 transition-all border-none"
                    onPress={() => packagedMutation.mutate()}
                    startContent={<LuPackage size={18} />}
                  >
                    FINALIZE SHIPMENT READY
                  </Button>
                )}

                {status === "PACKAGED" && canSupplier && (
                  <Button 
                    fullWidth
                    className="h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] text-white bg-primary-500 shadow-[0_10px_30px_rgba(0,112,243,0.25)] hover:scale-[1.02] active:scale-95 transition-all border-none"
                    onPress={() => setCourierModalOpen(true)}
                    startContent={<LuTruck size={18} />}
                  >
                    SUBMIT COURIER TELEMETRY
                  </Button>
                )}

                {status === "COURIER_SUBMITTED" && canSupplier && (
                  <Button 
                    fullWidth
                    className="h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] text-white bg-secondary-500 shadow-[0_10px_30px_rgba(151,114,255,0.25)] hover:scale-[1.02] active:scale-95 transition-all border-none"
                    onPress={() => inTransitMutation.mutate()}
                    startContent={<LuMapPin size={18} />}
                  >
                    ACTIVATE IN-TRANSIT STATE
                  </Button>
                )}

                {status === "IN_TRANSIT" && canBuyer && (
                  <Button 
                    fullWidth
                    className="h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] text-white bg-success-500 shadow-[0_10px_30px_rgba(34,197,94,0.25)] hover:scale-[1.02] active:scale-95 transition-all border-none"
                    onPress={() => setReceiptModalOpen(true)}
                    startContent={<LuCheck size={18} />}
                  >
                    AUTHORIZE DELIVERY RECEIPT
                  </Button>
                )}

                {status === "IN_TRANSIT" && !canBuyer && (
                  <div className="flex flex-col items-center gap-4 py-10 text-center bg-foreground/[0.03] rounded-[2rem] border border-divider/40">
                    <LuClock size={32} className="text-default-500 animate-[spin_10s_linear_infinite]" />
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-default-500">
                         Logistics Hold
                       </p>
                       <p className="text-[9px] font-bold text-default-400/60 uppercase tracking-widest mt-2 px-10 leading-loose italic">
                         Waiting for buyer authorization at the destination terminal.
                       </p>
                    </div>
                  </div>
                )}

                {(status === "REJECTED" || status === "CANCELLED") && (
                  <div className="flex flex-col items-center gap-6 py-10 text-center bg-danger-500/5 rounded-[2rem] border border-danger-500/10">
                    <div className="w-16 h-16 rounded-2xl bg-danger-500/10 flex items-center justify-center text-danger-500">
                       <LuX size={32} />
                    </div>
                    <div>
                       <p className="text-xs font-black uppercase tracking-[0.3em] text-danger-500">Flow Terminated</p>
                       <p className="text-[9px] font-bold text-default-400 uppercase tracking-widest mt-2">Operational inhibitors detected.</p>
                    </div>
                  </div>
                )}

                {status === "RECEIPT_CONFIRMED" && (
                  <div className="flex flex-col items-center gap-6 py-10 text-center bg-success-500/5 rounded-[2rem] border border-success-500/20 shadow-[0_0_50px_rgba(34,197,94,0.05)]">
                    <div className="w-16 h-16 rounded-2xl bg-success-500/10 flex items-center justify-center text-success-500">
                       <LuCheck size={32} />
                    </div>
                    <div>
                       <p className="text-xs font-black uppercase tracking-[0.3em] text-success-500">Mission Complete</p>
                       <p className="text-[9px] font-bold text-default-400 uppercase tracking-widest mt-2">Delivery handshake successful.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

           <div className="mt-6 flex justify-center">
              <p className="text-[9px] font-bold text-default-400 uppercase tracking-[0.3em] opacity-40">Obaol Core Telemetry // {id.slice(-8).toUpperCase()}</p>
           </div>
        </div>
      </div>
    </motion.section>

      <Modal 
        isOpen={quoteModalOpen} 
        onOpenChange={setQuoteModalOpen} 
        size="md" 
        placement="center"
        backdrop="opaque"
        isDismissable={false}
        isKeyboardDismissDisabled
        classNames={{
          base: "bg-[#05070c]/95 border border-white/10 shadow-2xl backdrop-blur-2xl",
          header: "border-b border-white/5",
          footer: "border-t border-white/5",
          closeButton: "hover:bg-white/5 active:scale-95 transition-all",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 py-6 px-8">
                 <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-warning rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                    <span className="text-xl font-black uppercase italic tracking-tight text-white">Project Quote Initiation</span>
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-[0.25em] text-warning-500/60 mt-1 italic">Tactical Parameter Selection</p>
              </ModalHeader>
              <ModalBody className="px-8 py-8">
                <div className="space-y-10">
                  <Input
                    label="Supplier Min Qty (kg)"
                    type="number"
                    variant="flat"
                    labelPlacement="outside"
                    placeholder="Enforce minimum operational volume..."
                    value={quoteMinQty}
                    onChange={(e) => setQuoteMinQty(e.target.value)}
                    classNames={{
                      inputWrapper: "bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all rounded-2xl h-14",
                      label: "text-[10px] font-black uppercase tracking-widest text-white/40 mb-2",
                      input: "text-sm font-bold text-white"
                    }}
                  />
                  <Input
                    label="Supplier Price (per kg)"
                    type="number"
                    variant="flat"
                    labelPlacement="outside"
                    placeholder="Declare unit rate for execution..."
                    value={quotePrice}
                    onChange={(e) => setQuotePrice(e.target.value)}
                    classNames={{
                      inputWrapper: "bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all rounded-2xl h-14",
                      label: "text-[10px] font-black uppercase tracking-widest text-white/40 mb-2",
                      input: "text-sm font-bold text-white text-warning"
                    }}
                  />
                  <Select
                    label="Sample Payment Term"
                    variant="flat"
                    labelPlacement="outside"
                    selectedKeys={new Set([samplePaymentTerm])}
                    onSelectionChange={(keys) => {
                      const nextValue = Array.from(keys as Set<string>)[0] || "ADVANCE";
                      setSamplePaymentTerm(String(nextValue));
                    }}
                    classNames={{
                      trigger: "bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all rounded-2xl h-14",
                      label: "text-[10px] font-black uppercase tracking-widest text-white/40 mb-2",
                      popoverContent: "bg-[#0B0F14] border border-white/10",
                    }}
                  >
                    <SelectItem key="ADVANCE" className="text-white font-bold text-xs uppercase tracking-widest">Advance</SelectItem>
                    <SelectItem key="COURIER_CHARGES" className="text-white font-bold text-xs uppercase tracking-widest">Courier Charges</SelectItem>
                  </Select>
                </div>
              </ModalBody>
              <ModalFooter className="px-8 py-6 flex items-center justify-between gap-4">
                <Button 
                   variant="light" 
                   onPress={onClose}
                   className="px-8 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest text-white/40 hover:text-white"
                >
                   Abort
                </Button>
                <Button 
                   color="warning" 
                   variant="shadow"
                   onPress={() => quoteMutation.mutate()} 
                   isDisabled={!quoteMinQty || !quotePrice}
                   className="flex-1 h-12 rounded-xl font-black uppercase text-[10px] tracking-[0.15em] shadow-[0_0_30px_rgba(245,158,11,0.2)] bg-gradient-to-r from-warning to-warning-600"
                >
                   Execute Submission
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal 
         isOpen={paymentModalOpen} 
         onOpenChange={setPaymentModalOpen} 
         size="md" 
         placement="center"
         backdrop="opaque"
         isDismissable={false}
         isKeyboardDismissDisabled
         classNames={{
           base: "bg-[#05070c]/95 border border-white/10 shadow-2xl backdrop-blur-2xl",
           closeButton: "hover:bg-white/5 active:scale-95 transition-all",
         }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 py-8 px-10">
                 <div className="flex items-center gap-3">
                    <LuWallet className="text-primary" size={24} />
                    <span className="text-xl font-black uppercase italic tracking-tight text-white">Payment Confirmation</span>
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/60 mt-1 italic">Select Payment Type</p>
              </ModalHeader>
              <ModalBody className="gap-8 px-10 pb-10">
                <Select
                  label="Payment Type"
                  variant="flat"
                  labelPlacement="outside"
                  selectedKeys={paymentMode ? new Set([paymentMode]) : new Set([])}
                  onSelectionChange={(keys) => {
                    const nextValue = (Array.from(keys as Set<string>)[0] || "") as "CASH" | "ONLINE" | "";
                    setPaymentMode(nextValue);
                    if (nextValue !== "ONLINE") setOnlinePaymentMethod("");
                  }}
                  classNames={{
                    trigger: "bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all rounded-2xl h-14",
                    label: "text-[10px] font-black uppercase tracking-widest text-white/40 mb-2",
                    popoverContent: "bg-[#0B0F14] border border-white/10",
                  }}
                >
                  <SelectItem key="CASH" className="text-white font-bold text-xs uppercase tracking-widest">Cash</SelectItem>
                  <SelectItem key="ONLINE" className="text-white font-bold text-xs uppercase tracking-widest">Online</SelectItem>
                </Select>

                {paymentMode === "ONLINE" && (
                  <Select
                    label="Online Method"
                    variant="flat"
                    labelPlacement="outside"
                    selectedKeys={onlinePaymentMethod ? new Set([onlinePaymentMethod]) : new Set([])}
                    onSelectionChange={(keys) => {
                      const nextValue = (Array.from(keys as Set<string>)[0] || "") as "GPAY" | "CARD" | "";
                      setOnlinePaymentMethod(nextValue);
                    }}
                    classNames={{
                      trigger: "bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all rounded-2xl h-14",
                      label: "text-[10px] font-black uppercase tracking-widest text-white/40 mb-2",
                      popoverContent: "bg-[#0B0F14] border border-white/10",
                    }}
                  >
                    <SelectItem key="GPAY" className="text-white font-bold text-xs uppercase tracking-widest">GPay</SelectItem>
                    <SelectItem key="CARD" className="text-white font-bold text-xs uppercase tracking-widest">Card</SelectItem>
                  </Select>
                )}
              </ModalBody>
              <ModalFooter className="px-10 pb-10 pt-2 flex items-center justify-between gap-4">
                <Button 
                   variant="light" 
                   onPress={onClose}
                   className="px-8 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest text-white/40 hover:text-white"
                >
                   Abort
                </Button>
                <Button 
                   color="primary" 
                   variant="shadow"
                   onPress={() => paymentMutation.mutate()}
                   isDisabled={!paymentMode || (paymentMode === "ONLINE" && !onlinePaymentMethod)}
                   className="flex-1 h-12 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-[0_0_30px_rgba(0,112,243,0.2)] bg-gradient-to-r from-primary to-primary-600"
                >
                   Confirm Payment
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal 
         isOpen={courierModalOpen} 
         onOpenChange={setCourierModalOpen} 
         size="md" 
         placement="center"
         backdrop="opaque"
         isDismissable={false}
         isKeyboardDismissDisabled
         classNames={{
           base: "bg-[#05070c]/95 border border-white/10 shadow-2xl backdrop-blur-2xl",
           closeButton: "hover:bg-white/5 active:scale-95 transition-all",
         }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 py-8 px-10">
                 <div className="flex items-center gap-3">
                    <LuTruck className="text-primary" size={24} />
                    <span className="text-xl font-black uppercase italic tracking-tight text-white">Logistics Protocol</span>
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/60 mt-1 italic">Submit Distribution Data</p>
              </ModalHeader>
              <ModalBody className="gap-10 px-10 pb-10">
                <Input
                  label="Courier Agency"
                  placeholder="Carrier service identity..."
                  variant="flat"
                  labelPlacement="outside"
                  value={courierAgencyName}
                  onChange={(e) => setCourierAgencyName(e.target.value)}
                  classNames={{
                    inputWrapper: "bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all rounded-2xl h-14",
                    label: "text-[10px] font-black uppercase tracking-widest text-white/40 mb-2",
                    input: "text-sm font-bold text-white text-primary"
                  }}
                />
                <Input
                  label="Tracking Number"
                  placeholder="Link operational sequence code..."
                  variant="flat"
                  labelPlacement="outside"
                  value={courierTrackingNumber}
                  onChange={(e) => setCourierTrackingNumber(e.target.value)}
                  classNames={{
                    inputWrapper: "bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all rounded-2xl h-14",
                    label: "text-[10px] font-black uppercase tracking-widest text-white/40 mb-2",
                    input: "text-sm font-bold text-white"
                  }}
                />
              </ModalBody>
              <ModalFooter className="px-10 pb-10 pt-2 flex items-center justify-between gap-4">
                <Button 
                   variant="light" 
                   onPress={onClose}
                   className="px-8 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest text-white/40 hover:text-white"
                >
                   Abort
                </Button>
                <Button 
                   color="primary" 
                   variant="shadow"
                   onPress={() => courierSubmitMutation.mutate()} 
                   isDisabled={!courierTrackingNumber}
                   className="flex-1 h-12 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-[0_0_30px_rgba(0,112,243,0.2)] bg-gradient-to-r from-primary to-primary-600"
                >
                   Finalize Segment
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal 
         isOpen={receiptModalOpen} 
         onOpenChange={setReceiptModalOpen} 
         size="md" 
         placement="center"
         backdrop="opaque"
         isDismissable={false}
         isKeyboardDismissDisabled
         classNames={{
           base: "bg-[#05070c]/95 border border-white/10 shadow-2xl backdrop-blur-2xl",
           closeButton: "hover:bg-white/5 active:scale-95 transition-all",
         }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 py-8 px-10">
                 <div className="flex items-center gap-3">
                    <LuCheck className="text-success" size={24} />
                    <span className="text-xl font-black uppercase italic tracking-tight text-white">Delivery Acceptance</span>
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-[0.25em] text-success-500/60 mt-1 italic">Confirmation Phase</p>
              </ModalHeader>
              <ModalBody className="gap-6 px-10 pb-10">
                <div className="p-6 rounded-[1.5rem] bg-white/[0.02] border border-white/5 space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Resource Verification</span>
                  <p className="text-[10px] font-medium text-default-400 italic">No file required for this step.</p>
                </div>
              </ModalBody>
              <ModalFooter className="px-10 pb-10 pt-2 flex items-center justify-between gap-4">
                <Button 
                   variant="light" 
                   onPress={onClose}
                   className="px-8 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest text-white/40"
                >
                   Close
                </Button>
                <Button 
                   color="success" 
                   variant="shadow"
                   onPress={() => receiptMutation.mutate()}
                   className="flex-1 h-12 rounded-xl font-black uppercase text-[10px] tracking-[0.15em] text-white bg-gradient-to-r from-success to-success-600 shadow-[0_0_30px_rgba(34,197,94,0.2)]"
                >
                   Accept Sequence
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
    </Modal>
    </>
  );
}
