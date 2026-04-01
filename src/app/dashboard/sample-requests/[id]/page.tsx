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
import { apiRoutes } from "@/core/api/apiRoutes";
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
  const [courierModalOpen, setCourierModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [quoteMinQty, setQuoteMinQty] = useState("");
  const [quotePrice, setQuotePrice] = useState("");
  const [samplePaymentTerm, setSamplePaymentTerm] = useState("ADVANCE");
  const [courierAgencyName, setCourierAgencyName] = useState("");
  const [courierTrackingNumber, setCourierTrackingNumber] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const { data: detailResponse, isLoading } = useQuery({
    queryKey: ["sample-request", id],
    queryFn: () => getData(apiRoutes.sampleRequest.getOne(id)),
    enabled: Boolean(id),
  });

  const request = detailResponse?.data?.data;
  const status = String(request?.status || "").toUpperCase();
  const statusLabel = status === "RECEIPT_CONFIRMED" ? "BUYER ACCEPTED" : status.replace(/_/g, " ");

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
    mutationFn: async () => patchData(apiRoutes.sampleRequest.paymentReceived(id), {}),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Payment confirmed.", position: "top-right" });
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

  const variantName = request?.variantRateId?.productVariant?.name || "Variant";
  const productName = request?.variantRateId?.productVariant?.product?.name || "Product";
  const buyerName = request?.buyerAssociateId?.name || "Buyer";
  const supplierName = request?.supplierCompanyId?.name || "Supplier";
  const samplePaymentTermLabel =
    String(request?.samplePaymentTerm || "ADVANCE") === "COURIER_CHARGES"
      ? "Courier Charges"
      : "Advance";
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
                    <p className="text-sm font-bold uppercase tracking-tight">{buyerName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <LuBuilding2 size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-default-400 block mb-0.5">Supplier</span>
                    <p className="text-sm font-bold uppercase tracking-tight">{supplierName}</p>
                  </div>
                </div>
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
           <Card className="rounded-[2rem] bg-foreground/[0.02] backdrop-blur-3xl border border-foreground/5 dark:border-white/5 shadow-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
                  <LuActivity size={16} />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Next Action</h3>
              </div>

              <div className="flex flex-col gap-4">
                {status === "REQUESTED" && canSupplier && (
                  <Button 
                    color="warning" 
                    className="h-12 rounded-xl font-bold uppercase tracking-wider text-black"
                    onPress={() => {
                      setSamplePaymentTerm(String(request?.samplePaymentTerm || "ADVANCE"));
                      setQuoteModalOpen(true);
                    }}
                    startContent={<LuQuote size={18} />}
                  >
                    Quote Sample
                  </Button>
                )}
                {status === "QUOTED" && canBuyer && (
                  <div className="flex flex-col gap-3">
                    <Button 
                      color="success" 
                      className="h-12 rounded-xl font-bold uppercase tracking-wider text-white"
                      onPress={() => decisionMutation.mutate("ACCEPT")}
                      startContent={<LuCheck size={18} />}
                    >
                      Accept Quote
                    </Button>
                    <Button 
                      color="danger" 
                      variant="flat" 
                      className="h-12 rounded-xl font-bold uppercase tracking-wider"
                      onPress={() => decisionMutation.mutate("REJECT")}
                      startContent={<LuX size={18} />}
                    >
                      Reject
                    </Button>
                  </div>
                )}
                {status === "ACCEPTED" && canBuyer && (
                  <Button 
                    color="primary" 
                    className="h-12 rounded-xl font-bold uppercase tracking-wider"
                    onPress={() => paymentMutation.mutate()}
                    startContent={<LuWallet size={18} />}
                  >
                    Mark Payment Received
                  </Button>
                )}
                {status === "PAYMENT_RECEIVED" && canSupplier && (
                  <Button 
                    color="warning" 
                    className="h-12 rounded-xl font-bold uppercase tracking-wider text-black"
                    onPress={() => packagingStartMutation.mutate()}
                    startContent={<LuPackageOpen size={18} />}
                  >
                    Start Packaging
                  </Button>
                )}
                {status === "PREPARING_PACKAGING" && canSupplier && (
                  <Button 
                    color="warning" 
                    className="h-12 rounded-xl font-bold uppercase tracking-wider text-black"
                    onPress={() => packagedMutation.mutate()}
                    startContent={<LuPackage size={18} />}
                  >
                    Mark Packaged
                  </Button>
                )}
                {status === "PACKAGED" && canSupplier && (
                  <Button 
                    color="primary" 
                    className="h-12 rounded-xl font-bold uppercase tracking-wider"
                    onPress={() => setCourierModalOpen(true)}
                    startContent={<LuTruck size={18} />}
                  >
                    Submit to Courier
                  </Button>
                )}
                {status === "COURIER_SUBMITTED" && canSupplier && (
                  <Button 
                    color="secondary" 
                    className="h-12 rounded-xl font-bold uppercase tracking-wider"
                    onPress={() => inTransitMutation.mutate()}
                    startContent={<LuMapPin size={18} />}
                  >
                    Mark In Transit
                  </Button>
                )}
                {status === "IN_TRANSIT" && canBuyer && (
                  <Button 
                    color="success" 
                    className="h-12 rounded-xl font-bold uppercase tracking-wider text-white"
                    onPress={() => setReceiptModalOpen(true)}
                    startContent={<LuCheck size={18} />}
                  >
                    Buyer Accept Delivery
                  </Button>
                )}
                {status === "IN_TRANSIT" && !canBuyer && (
                  <div className="flex flex-col items-center gap-3 py-6 text-center bg-foreground/[0.03] rounded-2xl border border-divider/40">
                    <LuClock size={28} className="text-default-500" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-default-500">
                      Waiting for buyer acceptance
                    </p>
                  </div>
                )}
                {(status === "REJECTED" || status === "CANCELLED") && (
                  <div className="flex flex-col items-center gap-4 py-8 text-center bg-foreground/[0.03] rounded-2xl border border-divider/40">
                    <LuX size={32} className="text-danger" />
                    <p className="text-xs font-bold uppercase tracking-widest text-default-500">Flux Inhibited // Flow Terminated</p>
                  </div>
                )}
                {status === "RECEIPT_CONFIRMED" && (
                  <div className="flex flex-col items-center gap-4 py-8 text-center bg-success-500/5 rounded-2xl border border-success-500/20">
                    <LuCheck size={32} className="text-success" />
                    <p className="text-xs font-bold uppercase tracking-widest text-success-600">Buyer Accepted // Mission Complete</p>
                  </div>
                )}
              </div>
           </Card>

           <div className="mt-6 flex justify-center">
              <p className="text-[9px] font-bold text-default-400 uppercase tracking-[0.3em] opacity-40">Obaol Core Telemetry // {id.slice(-8).toUpperCase()}</p>
           </div>
        </div>
      </div>
    </motion.section>

      <Modal isOpen={quoteModalOpen} onOpenChange={setQuoteModalOpen} size="md" placement="center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Quote Sample</ModalHeader>
              <ModalBody className="gap-4">
                <Input
                  label="Supplier Min Qty (kg)"
                  type="number"
                  value={quoteMinQty}
                  onChange={(e) => setQuoteMinQty(e.target.value)}
                />
                <Input
                  label="Supplier Price (per kg)"
                  type="number"
                  value={quotePrice}
                  onChange={(e) => setQuotePrice(e.target.value)}
                />
                <Select
                  label="Sample Payment Term"
                  selectedKeys={new Set([samplePaymentTerm])}
                  onSelectionChange={(keys) => {
                    const nextValue = Array.from(keys as Set<string>)[0] || "ADVANCE";
                    setSamplePaymentTerm(String(nextValue));
                  }}
                >
                  <SelectItem key="ADVANCE">Advance</SelectItem>
                  <SelectItem key="COURIER_CHARGES">Courier Charges</SelectItem>
                </Select>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>Cancel</Button>
                <Button color="warning" onPress={() => quoteMutation.mutate()} isDisabled={!quoteMinQty || !quotePrice}>
                  Submit Quote
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={courierModalOpen} onOpenChange={setCourierModalOpen} size="md" placement="center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Courier Details</ModalHeader>
              <ModalBody className="gap-4">
                <Input
                  label="Courier Agency (optional)"
                  value={courierAgencyName}
                  onChange={(e) => setCourierAgencyName(e.target.value)}
                />
                <Input
                  label="Tracking Number"
                  value={courierTrackingNumber}
                  onChange={(e) => setCourierTrackingNumber(e.target.value)}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>Cancel</Button>
                <Button color="primary" onPress={() => courierSubmitMutation.mutate()} isDisabled={!courierTrackingNumber}>
                  Submit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={receiptModalOpen} onOpenChange={setReceiptModalOpen} size="md" placement="center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Confirm Delivery</ModalHeader>
              <ModalBody className="gap-4">
                <Input
                  type="file"
                  label="Upload Receipt (optional)"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>Cancel</Button>
                <Button color="success" onPress={() => receiptMutation.mutate()}>
                  Buyer Accept Delivery
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
