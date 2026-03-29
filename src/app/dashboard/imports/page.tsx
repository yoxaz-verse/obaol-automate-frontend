"use client";

import React, { useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Chip,
} from "@nextui-org/react";
import { Tabs, Tab } from "@nextui-org/tabs";
import AuthContext from "@/context/AuthContext";
import { getData, patchData, postData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { DEFAULT_STALE_TIME, extractList, useImportReservations, useImportsList } from "@/core/data";
import Title from "@/components/titles";
import InlineLoader from "@/components/ui/InlineLoader";
import { showToastMessage } from "@/utils/utils";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiPackage, 
  FiMapPin, 
  FiCalendar, 
  FiPlus, 
  FiTrendingUp, 
  FiMoreVertical, 
  FiClock, 
  FiArrowRight,
  FiUser,
  FiBriefcase,
  FiLock,
  FiActivity,
  FiTruck,
  FiEdit3,
  FiX,
  FiExternalLink
} from "react-icons/fi";
import { 
  LuFileCheck, 
  LuShip, 
  LuPackage, 
  LuCalendar, 
  LuChevronRight,
  LuTrash2,
  LuClock,
  LuCheck,
  LuLoader,
  LuMapPin
} from "react-icons/lu";

type ImportTab = "all" | "mine" | "reservations";

export default function ImportsPage() {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const router = useRouter();
  const roleLower = String(user?.role || "").toLowerCase();
  const canCreate = roleLower === "associate" || roleLower === "admin" || roleLower === "operator" || roleLower === "team";
  const needsCompanySelect = roleLower === "admin" || roleLower === "operator" || roleLower === "team";
  const canSetCommission = roleLower === "admin" || roleLower === "operator" || roleLower === "team";
  const canEditAny = roleLower === "admin" || roleLower === "operator" || roleLower === "team";
  const canReserve = roleLower === "associate" || roleLower === "admin";
  const canEditListing = (listing: any) =>
    canEditAny || String(listing?.importerAssociateId?._id || listing?.importerAssociateId || "") === String(user?.id || "");
  const associateCompanyId = String(user?.associateCompanyId || "");
  const reserveNeedsCompany = needsCompanySelect;

  const [activeTab, setActiveTab] = useState<ImportTab>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [reserveOpen, setReserveOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editReservationOpen, setEditReservationOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [pendingReservationId, setPendingReservationId] = useState<string | null>(null);
  const [lockErrorById, setLockErrorById] = useState<Record<string, string>>({});
  const [actionErrorById, setActionErrorById] = useState<Record<string, string>>({});
  const [redirectingEnquiryId, setRedirectingEnquiryId] = useState<string | null>(null);
  const isFormOpen = createOpen || editOpen || reserveOpen;

  const [createForm, setCreateForm] = useState({
    productId: "",
    productVariant: "",
    totalQuantity: "",
    quantityUnit: "MT",
    price: "",
    priceUnit: "KG",
    adminCommission: "",
    expectedArrivalDate: "",
    arrivalWindowDays: "",
    portId: "",
    portName: "",
    importerCompanyId: "",
  });

  const [editForm, setEditForm] = useState({
    productId: "",
    productVariant: "",
    totalQuantity: "",
    quantityUnit: "MT",
    price: "",
    priceUnit: "KG",
    adminCommission: "",
    expectedArrivalDate: "",
    arrivalWindowDays: "",
    portId: "",
    portName: "",
    importerCompanyId: "",
  });

  const [reserveQty, setReserveQty] = useState("");
  const [reserveCompanyId, setReserveCompanyId] = useState("");
  const [editReservationQty, setEditReservationQty] = useState("");
  const [reserveFeedback, setReserveFeedback] = useState("");
  const [reserveStatus, setReserveStatus] = useState<"idle" | "success" | "error">("idle");
  const reserveSameCompany =
    !!reserveCompanyId &&
    String(reserveCompanyId) === String(selectedListing?.importerCompanyId?._id || selectedListing?.importerCompanyId || "");

  const {
    data: importsResponse,
    isLoading: importsLoading,
  } = useImportsList(
    {
      mine: activeTab === "mine",
      limit: 20,
    },
    { enabled: true }
  );

  const {
    data: reservationsResponse,
    isLoading: reservationsLoading,
  } = useImportReservations(
    {
      mine: activeTab === "reservations",
      listingId: selectedListing?._id,
      limit: 20,
    },
    { enabled: activeTab === "reservations" || !!selectedListing?._id }
  );

  const imports = importsResponse?.list ?? extractList(importsResponse?.raw ?? importsResponse);
  const reservations = reservationsResponse?.list ?? extractList(reservationsResponse?.raw ?? reservationsResponse);
  const resolveReservationStatus = (reservation: any) =>
    String(reservation?.reservationStatus || reservation?.status || "PENDING").toUpperCase();
  const resolveImportStatus = (listing: any) =>
    String(listing?.importStatus || "LISTED").toUpperCase();
  const importFlowLabels: Record<string, string> = {
    DRAFT: "Draft",
    LISTED: "Listed",
    RESERVED: "Reserved",
    APPROVED: "Approved",
    LOCKED: "Locked",
    ENQUIRY_CREATED: "Enquiry Created",
  };

  const { data: countriesResponse } = useQuery({
    queryKey: ["countries"],
    queryFn: () => getData(apiRoutes.country.getAll, { limit: 200 }),
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });
  const countries = extractList(countriesResponse?.data);
  const india = useMemo(() => countries.find((c: any) => String(c?.name || "").toLowerCase() === "india"), [countries]);

  const { data: portsResponse } = useQuery({
    queryKey: ["sea-ports", india?._id],
    queryFn: () => getData(apiRoutes.enquiry.seaPorts, { country: india?._id, limit: 500 }),
    enabled: !!india?._id && isFormOpen,
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });
  const ports = extractList(portsResponse?.data);

  const { data: productsResponse } = useQuery({
    queryKey: ["products"],
    queryFn: () => getData(apiRoutes.product.getAll, { limit: 200 }),
    enabled: isFormOpen,
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });
  const products = extractList(productsResponse?.data);

  const { data: companiesResponse } = useQuery({
    queryKey: ["associate-companies"],
    queryFn: () => getData(apiRoutes.associateCompany.getAll, { limit: 200 }),
    enabled: isFormOpen || needsCompanySelect,
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });
  const companies = extractList(companiesResponse?.data);

  const { data: variantsResponse } = useQuery({
    queryKey: ["product-variants", createForm.productId],
    queryFn: () =>
      getData(apiRoutes.productVariant.getAll, {
        limit: 200,
        product: createForm.productId || undefined,
      }),
    enabled: !!createForm.productId && isFormOpen,
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });
  const variants = extractList(variantsResponse?.data);

  const createMutation = useMutation({
    mutationFn: (payload: any) => postData(apiRoutes.imports.create, payload),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Import listing created." });
      setCreateOpen(false);
      setCreateForm({
        productId: "",
        productVariant: "",
        totalQuantity: "",
        quantityUnit: "MT",
        price: "",
        priceUnit: "KG",
        adminCommission: "",
        expectedArrivalDate: "",
        arrivalWindowDays: "",
        portId: "",
        portName: "",
        importerCompanyId: "",
      });
      queryClient.invalidateQueries({ queryKey: ["imports"] });
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || "Failed to create listing.",
      });
    },
  });

  const reserveMutation = useMutation({
    mutationFn: (payload: any) => postData(apiRoutes.imports.reserve(payload.id), payload.data),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Quantity reserved. Waiting for buyer approval." });
      setReserveFeedback("Your quantity is being reserved. The buyer will approve your request.");
      setReserveStatus("success");
      setReserveQty("");
      setReserveCompanyId("");
      queryClient.invalidateQueries({ queryKey: ["imports"] });
      queryClient.invalidateQueries({ queryKey: ["import-reservations"] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to reserve quantity.";
      setReserveFeedback(message);
      setReserveStatus("error");
      showToastMessage({
        type: "error",
        message,
      });
    },
  });

  const editReservationMutation = useMutation({
    mutationFn: (payload: { listingId: string; reservationId: string; quantityRequested: number }) =>
      patchData(apiRoutes.imports.reservationEdit(payload.listingId, payload.reservationId), {
        quantityRequested: payload.quantityRequested,
      }),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Reservation updated." });
      setEditReservationOpen(false);
      setEditReservationQty("");
      setSelectedReservation(null);
      queryClient.invalidateQueries({ queryKey: ["imports"] });
      queryClient.invalidateQueries({ queryKey: ["import-reservations"] });
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || "Failed to update reservation.",
      });
    },
  });

  const cancelReservationMutation = useMutation({
    mutationFn: (payload: { listingId: string; reservationId: string }) =>
      patchData(apiRoutes.imports.reservationCancel(payload.listingId, payload.reservationId), {}),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Reservation cancelled." });
      queryClient.invalidateQueries({ queryKey: ["imports"] });
      queryClient.invalidateQueries({ queryKey: ["import-reservations"] });
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || "Failed to cancel reservation.",
      });
    },
  });

  const lockReservationMutation = useMutation({
    mutationFn: (payload: { listingId: string; reservationId: string }) =>
      patchData(apiRoutes.imports.reservationLock(payload.listingId, payload.reservationId), {}),
    onSuccess: (response: any) => {
      showToastMessage({ type: "success", message: "Reservation locked. Enquiry created." });
      queryClient.invalidateQueries({ queryKey: ["imports"] });
      queryClient.invalidateQueries({ queryKey: ["import-reservations"] });
      setPendingReservationId(null);
      const linked = response?.data?.data?.linkedEnquiryId;
      const enquiryId = typeof linked === "string" ? linked : linked?._id;
      if (enquiryId) {
        if (response?.config?.data) {
          try {
            const parsed = JSON.parse(response.config.data);
            if (parsed?.reservationId) setRedirectingEnquiryId(parsed.reservationId);
          } catch (e) {}
        }
        router.push(`/dashboard/enquiries/${enquiryId}`);
      } else {
        showToastMessage({ type: "info", message: "Enquiry created, but ID was not returned. Please check the Enquiries list." });
      }
      // Clear any inline error for this reservation
      if (response?.config?.data) {
        try {
          const parsed = JSON.parse(response.config.data);
          if (parsed?.reservationId) {
            setLockErrorById((prev) => ({ ...prev, [parsed.reservationId]: "" }));
          }
        } catch {
          // ignore
        }
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to lock reservation.";
      showToastMessage({
        type: "error",
        message,
      });
      if (pendingReservationId) {
        setLockErrorById((prev) => ({ ...prev, [pendingReservationId]: message }));
      }
      setPendingReservationId(null);
      try {
        const parsed = typeof error?.config?.data === "string" ? JSON.parse(error.config.data) : error?.config?.data;
        if (parsed?.reservationId) {
          setLockErrorById((prev) => ({ ...prev, [parsed.reservationId]: message }));
        }
      } catch {
        // ignore
      }
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => patchData(apiRoutes.importReservations.accept(id), {}),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Reservation approved. Lock to create enquiry." });
      queryClient.invalidateQueries({ queryKey: ["imports"] });
      queryClient.invalidateQueries({ queryKey: ["import-reservations"] });
      setPendingReservationId(null);
    },
    onError: (error: any) => {
      console.error("Accept Mutation Error:", error);
      const serverMessage = error?.response?.data?.message || error?.response?.data?.error;
      showToastMessage({
        type: "error",
        message: serverMessage || "Failed to accept reservation. Check console for details.",
      });
      if (pendingReservationId) {
        setActionErrorById((prev) => ({
          ...prev,
          [pendingReservationId]: serverMessage || "Failed to accept reservation.",
        }));
      }
      setPendingReservationId(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => patchData(apiRoutes.importReservations.reject(id), {}),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Reservation rejected." });
      queryClient.invalidateQueries({ queryKey: ["import-reservations"] });
      setPendingReservationId(null);
    },
    onError: (error: any) => {
      console.error("Reject Mutation Error:", error);
      const serverMessage = error?.response?.data?.message || error?.response?.data?.error;
      showToastMessage({
        type: "error",
        message: serverMessage || "Failed to reject reservation.",
      });
      if (pendingReservationId) {
        setActionErrorById((prev) => ({
          ...prev,
          [pendingReservationId]: serverMessage || "Failed to reject reservation.",
        }));
      }
      setPendingReservationId(null);
    },
  });

  const closeMutation = useMutation({
    mutationFn: (id: string) => patchData(apiRoutes.imports.close(id), {}),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Listing closed." });
      queryClient.invalidateQueries({ queryKey: ["imports"] });
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || "Failed to close listing.",
      });
    },
  });


  const canViewSensitive = (listing: any) => {
    if (typeof listing?.canViewCommission === "boolean") return listing.canViewCommission;
    if (roleLower === "admin") return true;
    if (roleLower === "operator" || roleLower === "team") {
      const assignedOperator = listing?.importerCompanyId?.assignedOperator;
      return String(assignedOperator || "") === String(user?.id || "");
    }
    if (roleLower === "associate") {
      const importerCompanyId = String(listing?.importerCompanyId?._id || listing?.importerCompanyId || "");
      return Boolean(associateCompanyId && importerCompanyId && importerCompanyId === associateCompanyId);
    }
    return false;
  };

  const canViewImporter = (listing: any) => {
    if (typeof listing?.canViewImporter === "boolean") return listing.canViewImporter;
    return canViewSensitive(listing);
  };

  const maxReservableQty = useMemo(() => {
    if (!selectedListing) return 0;
    return Math.max(0, Number(selectedListing.availableQuantity || 0));
  }, [selectedListing]);

  const getDisplayPrice = (listing: any) => {
    if (listing?.displayPrice !== undefined && listing?.displayPrice !== null) {
      return listing.displayPrice;
    }
    return Number(listing?.price || 0);
  };

  const editMutation = useMutation({
    mutationFn: (payload: { id: string; data: any }) => patchData(apiRoutes.imports.update(payload.id), payload.data),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Import listing updated." });
      setEditOpen(false);
      queryClient.invalidateQueries({ queryKey: ["imports"] });
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || "Failed to update listing.",
      });
    },
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-start min-h-screen p-6 md:p-12 bg-background"
    >
      <div className="w-full max-w-[1500px]">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-warning-500 rounded-full" />
              <span className="text-[10px] font-bold tracking-wider uppercase text-warning-500">Imports to India</span>
            </div>
            <Title title="Import Listings" />
            <p className="text-default-500 text-xs font-medium opacity-80">
              Manage incoming shipments and secure inventory reserves across the network.
            </p>
          </div>

          {canCreate && (
             <Button 
                size="md"
                className="h-11 rounded-xl font-bold uppercase tracking-wider text-[11px] bg-warning text-black shadow-md hover:scale-105 active:scale-95 transition-all px-8"
                onClick={() => setCreateOpen(true)}
                startContent={<FiPlus size={18} />}
             >
                Create Listing
             </Button>
          )}
        </header>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-divider/40 pb-2">
            <Tabs
              aria-label="Import tabs"
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key as ImportTab)}
              variant="underlined"
              color="warning"
              classNames={{
                tabList: "gap-12 relative rounded-none p-0",
                cursor: "bg-warning w-full h-[3px] rounded-t-full shadow-[0_-1px_10px_rgba(var(--nextui-warning),0.4)]",
                tab: "max-w-fit px-4 h-14",
                tabContent: "font-semibold uppercase tracking-wider text-[11px] text-default-400 group-data-[selected=true]:text-warning group-data-[selected=true]:scale-105 transition-transform"
              }}
            >
              <Tab key="all" title="All Listings" />
              <Tab key="mine" title="My Listings" />
              <Tab key="reservations" title="My Reservations" />
            </Tabs>
          </div>

          <AnimatePresence mode="wait">
            {activeTab !== "reservations" && importsLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20">
                <InlineLoader message="Loading listings..." />
              </motion.div>
            )}

            {activeTab === "reservations" && reservationsLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20">
                <InlineLoader message="Loading reservations..." />
              </motion.div>
            )}

            {activeTab !== "reservations" && !importsLoading && (
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8"
              >
                {imports.map((listing: any, idx: number) => (
                  <motion.div
                    key={listing._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="rounded-[2.5rem] bg-white dark:bg-[#04070f] border border-default-300 dark:border-white/20 shadow-none overflow-hidden group hover:border-warning-500/30 transition-all duration-500 h-full">
                      <CardHeader className="flex flex-col gap-4 p-8 pb-4">
                        <div className="flex items-start justify-between w-full">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-warning-500">Import Details</span>
                            <h4 className="text-lg font-bold text-foreground uppercase tracking-tight line-clamp-2">
                              {listing.commodityName}
                            </h4>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-warning-500/10 border border-warning-500/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-warning-500" />
                                <span className="text-[9px] font-bold text-warning-500 uppercase tracking-widest">{listing.status}</span>
                             </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-start gap-6 text-default-400">
                           <div className="flex items-center gap-2">
                             <LuMapPin size={14} className="text-warning-500/50" />
                             <span className="text-[10px] font-bold uppercase tracking-widest">{listing.portName || "Port TBD"}</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <LuClock size={14} className="text-warning-500/50" />
                             <span className="text-[10px] font-bold uppercase tracking-widest">
                                ETA {listing.expectedArrivalDate ? new Date(listing.expectedArrivalDate).toLocaleDateString() : "TBD"}
                             </span>
                           </div>
                        </div>
                      </CardHeader>

                      <CardBody className="px-8 pb-8 pt-4 flex flex-col gap-8">
                        {/* Arrival Visual Status */}
                        <div className="p-5 rounded-[2rem] bg-foreground/[0.03] border border-foreground/5 relative overflow-hidden group/eta">
                          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/eta:scale-105 transition-transform">
                             <LuShip size={40} />
                          </div>
                           {listing.expectedArrivalDate && (() => {
                             const diffDays = Math.ceil((new Date(listing.expectedArrivalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                             let config = { color: "text-primary-500", bg: "bg-primary-500/5", border: "border-primary-500/20", label: `In ${diffDays} Days` };
                             if (diffDays === 0) config = { color: "text-success-500", bg: "bg-success-500/5", border: "border-success-500/20", label: "Arrives Today" };
                             if (diffDays < 0) config = { color: "text-danger-500", bg: "bg-danger-500/5", border: "border-danger-500/20", label: "Arrived Post ETA" };
                             
                             return (
                                <div className={`flex items-center justify-start gap-3 px-4 py-2 rounded-2xl ${config.bg} ${config.border} border w-fit`}>
                                  <div className={`w-1.5 h-1.5 rounded-full ${config.color.replace('text', 'bg')}`} />
                                  <span className={`text-[10px] font-bold uppercase tracking-widest ${config.color}`}>{config.label}</span>
                                </div>
                              );
                          })()}
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                           <div className="flex flex-col gap-2">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-default-400">Total Quantity</span>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-lg font-bold text-foreground">{listing.totalQuantity}</span>
                                <span className="text-[10px] font-bold text-default-500">{listing.quantityUnit}</span>
                              </div>
                           </div>
                           <div className="flex flex-col gap-2 items-end">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-default-400">Rate</span>
                              <div className="flex items-baseline gap-1.5 justify-end">
                                <span className="text-lg font-bold text-warning-500 tracking-tighter">
                                  {getDisplayPrice(listing)}
                                </span>
                                <span className="text-[10px] font-bold text-default-500 uppercase">/{listing.priceUnit}</span>
                              </div>
                           </div>
                        </div>

                        <div className="flex flex-col gap-6 pt-6 border-t border-divider/40">
                          {canViewSensitive(listing) && (
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-foreground/[0.03] border border-foreground/5 flex items-center justify-center">
                                <FiBriefcase size={16} className="text-default-400" />
                              </div>
                              <div className="flex-1">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-default-400 block mb-0.5">Importer</span>
                                <p className="text-xs font-bold uppercase">{listing.importerCompanyId?.name || "Confidential"}</p>
                              </div>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2.5">
                            {activeTab === "all" && canReserve && (
                               <Button
                                 fullWidth
                                 className="h-10 rounded-xl font-bold uppercase tracking-widest text-[10px] bg-foreground text-background shadow-md hover:scale-[1.02] active:scale-95 transition-all"
                                 onClick={() => {
                                   setSelectedListing(listing);
                                   setReserveOpen(true);
                                   setReserveFeedback("");
                                   setReserveStatus("idle");
                                   setReserveQty("");
                                   setReserveCompanyId("");
                                 }}
                               >
                                 Reserve Quantity
                               </Button>
                            )}
                            
                            <div className="grid grid-cols-2 gap-2.5 w-full">
                              {canEditListing(listing) && (
                                 <Button
                                   variant="flat"
                                   className="h-10 rounded-xl font-bold uppercase tracking-[0.1em] text-[9px] bg-foreground/5 hover:bg-foreground/10"
                                   onClick={() => {
                                     setSelectedListing(listing);
                                     const productId = listing?.productVariant?.product?._id || listing?.productId || "";
                                     const productVariant = listing?.productVariant?._id || listing?.productVariant || "";
                                     const arrivalDate = listing?.expectedArrivalDate
                                       ? new Date(listing.expectedArrivalDate).toISOString().slice(0, 10)
                                       : "";
                                     setEditForm({
                                       productId: productId ? String(productId) : "",
                                       productVariant: productVariant ? String(productVariant) : "",
                                       totalQuantity: String(listing.totalQuantity || ""),
                                       quantityUnit: listing.quantityUnit || "MT",
                                       price: String(listing.price || ""),
                                       priceUnit: listing.priceUnit || "KG",
                                       adminCommission: String(listing.adminCommission || ""),
                                       expectedArrivalDate: arrivalDate,
                                       arrivalWindowDays: String(listing.arrivalWindowDays || ""),
                                       portId: listing.portId?._id || listing.portId || "",
                                       portName: listing.portName || "",
                                       importerCompanyId: listing.importerCompanyId?._id || listing.importerCompanyId || "",
                                     });
                                     setEditOpen(true);
                                   }}
                                   startContent={<FiEdit3 size={14} />}
                                  >
                                    Edit
                                   </Button>
                              )}
                              {(activeTab === "mine" || canEditAny) && (
                                <Button
                                  variant="flat"
                                  className="h-10 rounded-xl font-bold uppercase tracking-[0.1em] text-[9px] bg-foreground/5 hover:bg-foreground/10"
                                  onClick={() => {
                                    setSelectedListing(listing);
                                    setManageOpen(true);
                                  }}
                                  startContent={<FiActivity size={14} />}
                                >
                                  Sync Reserves
                                </Button>
                              )}
                            </div>

                            {(activeTab === "mine" || canEditAny) && (
                               <Button
                                   fullWidth
                                   color="danger"
                                   variant="flat"
                                   className="h-10 rounded-xl font-bold uppercase tracking-widest text-[10px] border border-danger-500/20"
                                   onClick={() => {
                                     if (confirm("Are you sure you want to close this listing?")) {
                                       closeMutation.mutate(listing._id);
                                     }
                                   }}
                                >
                                   Terminate Listing
                                </Button>
                            )}
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === "reservations" && !reservationsLoading && (
              <motion.div 
                key="reservations"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8"
              >
                {reservations.map((reservation: any, idx: number) => (
                  <motion.div
                    key={reservation._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="rounded-[2.5rem] bg-white dark:bg-[#04070f] border border-default-300 dark:border-white/20 shadow-none overflow-hidden group hover:border-warning-500/30 transition-all duration-500 h-full">
                      <CardHeader className="flex items-start justify-between p-8 pb-4">
                        <div className="flex flex-col gap-1.5">
                           <span className="text-[9px] font-bold uppercase tracking-widest text-warning-500 pb-1">Reserve Node</span>
                           <h4 className="text-lg font-bold text-foreground uppercase tracking-tight line-clamp-2">
                             {reservation.listingId?.commodityName || "Import Mission"}
                           </h4>
                           <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center gap-1.5 text-default-400">
                                <LuMapPin size={12} />
                                <span className="text-[9px] font-bold uppercase tracking-widest">{reservation.listingId?.portName || "Port TBD"}</span>
                              </div>
                           </div>
                        </div>
                        <div className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          resolveReservationStatus(reservation) === "APPROVED" ? "bg-success-500/10 text-success-500 border border-success-500/20" :
                          resolveReservationStatus(reservation) === "REJECTED" ? "bg-danger-500/10 text-danger-500 border border-danger-500/20" :
                          "bg-warning-500/10 text-warning-500 border border-warning-500/20"
                        }`}>
                          {resolveReservationStatus(reservation)}
                        </div>
                      </CardHeader>

                      <CardBody className="px-8 pb-8 pt-4 gap-8">
                        <div className="grid grid-cols-2 gap-6 bg-foreground/[0.03] border border-foreground/5 p-5 rounded-[2rem]">
                           <div className="flex flex-col gap-1">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-default-400">Allocated</span>
                              <div className="flex items-baseline gap-1">
                                <span className="text-lg font-bold text-foreground">{reservation.quantityRequested}</span>
                                <span className="text-[10px] font-bold text-default-500 uppercase">MT</span>
                              </div>
                           </div>
                           <div className="flex flex-col gap-1 items-end">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-default-400 text-right">Mission ETA</span>
                              <span className="text-xs font-bold text-foreground text-right">
                                {reservation.listingId?.expectedArrivalDate ? new Date(reservation.listingId.expectedArrivalDate).toLocaleDateString() : "Pending"}
                              </span>
                           </div>
                        </div>

                        {canViewSensitive(reservation.listingId) && (
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-foreground/[0.03] border border-foreground/5 flex items-center justify-center">
                               <FiUser size={16} className="text-default-400" />
                             </div>
                             <div className="flex-1">
                               <span className="text-[9px] font-bold uppercase tracking-widest text-default-400 block mb-0.5">Mission Authority</span>
                               <p className="text-xs font-bold uppercase italic truncate">{reservation.listingId?.importerCompanyId?.name || "Encrypted Node"}</p>
                             </div>
                          </div>
                        )}

                        {resolveReservationStatus(reservation) === "PENDING" && (
                          <div className="grid grid-cols-2 gap-3 mt-2">
                             <Button
                               className="h-10 rounded-xl font-bold uppercase tracking-widest text-[10px] bg-foreground text-background shadow-md hover:scale-[1.02] active:scale-95 transition-all"
                               onClick={() => {
                                 setSelectedReservation(reservation);
                                 setEditReservationQty(String(reservation.quantityRequested || ""));
                                 setEditReservationOpen(true);
                               }}
                               startContent={<FiEdit3 size={14} />}
                             >
                               Edit
                             </Button>
                            <Button
                              variant="flat"
                              color="danger"
                              className="h-10 rounded-xl font-bold uppercase tracking-widest text-[10px] border border-danger-500/20"
                              isLoading={cancelReservationMutation.isPending}
                              onClick={() =>
                                cancelReservationMutation.mutate({
                                  listingId: String(reservation.listingId?._id || reservation.listingId || ""),
                                  reservationId: reservation._id,
                                })
                              }
                              startContent={<FiX size={14} />}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                        
                        {resolveReservationStatus(reservation) === "APPROVED" && (
                           <div className="flex flex-col gap-3">
                              <div className="flex items-center gap-2 p-4 rounded-xl bg-success-500/5 border border-success-500/10">
                                 <LuCheck size={14} className="text-success-500" />
                                 <span className="text-[9px] font-bold uppercase tracking-widest text-success-500">Reservation Secured // Ready for Enquiry</span>
                              </div>
                              <Button
                                fullWidth
                                className="h-10 rounded-xl font-bold uppercase tracking-widest text-[10px] bg-foreground text-background shadow-md transition-all active:scale-95"
                                onPress={() => lockReservationMutation.mutate({
                                   listingId: String(reservation.listingId?._id || reservation.listingId || ""),
                                   reservationId: reservation._id
                                })}
                                startContent={redirectingEnquiryId !== reservation._id && <FiLock size={16} />}
                                isLoading={lockReservationMutation.isPending || redirectingEnquiryId === reservation._id}
                              >
                                {redirectingEnquiryId === reservation._id ? "Initializing Redirection..." : "Lock & Initialize Enquiry"}
                              </Button>
                              {lockErrorById[reservation._id] && (
                                <div className="text-xs text-danger-400">{lockErrorById[reservation._id]}</div>
                              )}
                           </div>
                        )}
                        {resolveReservationStatus(reservation) === "LOCKED" && (
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 p-4 rounded-xl bg-foreground/[0.03] border border-foreground/5">
                              <LuCheck size={14} className="text-foreground" />
                              <span className="text-[9px] font-bold uppercase tracking-widest text-foreground">Enquiry Created</span>
                            </div>
                            <Button
                              fullWidth
                              className="h-10 rounded-xl font-bold uppercase tracking-widest text-[10px] bg-foreground text-background shadow-md transition-all active:scale-95"
                              isLoading={redirectingEnquiryId === reservation._id}
                              onPress={() => {
                                const linked = reservation?.linkedEnquiryId;
                                const enquiryId = typeof linked === "string" ? linked : linked?._id;
                                if (enquiryId) {
                                  setRedirectingEnquiryId(reservation._id);
                                  router.push(`/dashboard/enquiries/${enquiryId}`);
                                } else {
                                  showToastMessage({ type: "info", message: "Enquiry link not available yet. Please refresh." });
                                }
                              }}
                              startContent={redirectingEnquiryId !== reservation._id && <FiExternalLink size={16} />}
                            >
                              {redirectingEnquiryId === reservation._id ? "Redirecting Framework..." : "Open Enquiry"}
                            </Button>
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Modal
        isOpen={createOpen}
        onOpenChange={setCreateOpen}
        size="2xl"
        isDismissable={false}
        isKeyboardDismissDisabled
        shouldCloseOnInteractOutside={() => false}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Create Import Listing</ModalHeader>
              <ModalBody className="gap-4">
                {needsCompanySelect && (
                  <Select
                    label="Importer Company"
                    selectedKeys={createForm.importerCompanyId ? [createForm.importerCompanyId] : []}
                    onSelectionChange={(keys) => {
                      const key = Array.from(keys)[0] as string | undefined;
                      setCreateForm((prev) => ({ ...prev, importerCompanyId: key || "" }));
                    }}
                    popoverProps={{ shouldCloseOnBlur: false }}
                  >
                    {companies.map((company: any) => (
                      <SelectItem key={company._id} value={company._id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </Select>
                )}
                <Select
                  label="Product"
                  selectedKeys={createForm.productId ? [createForm.productId] : []}
                  onSelectionChange={(keys) => {
                    const key = Array.from(keys)[0] as string | undefined;
                    setCreateForm((prev) => ({ ...prev, productId: key || "", productVariant: "" }));
                  }}
                  popoverProps={{ shouldCloseOnBlur: false }}
                >
                  {products.map((product: any) => (
                    <SelectItem key={product._id} value={product._id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  label="Product Variant"
                  isDisabled={!createForm.productId}
                  selectedKeys={createForm.productVariant ? [createForm.productVariant] : []}
                  onSelectionChange={(keys) => {
                    const key = Array.from(keys)[0] as string | undefined;
                    setCreateForm((prev) => ({ ...prev, productVariant: key || "" }));
                  }}
                  popoverProps={{ shouldCloseOnBlur: false }}
                >
                  {variants.map((variant: any) => (
                    <SelectItem key={variant._id} value={variant._id}>
                      {variant.name}
                    </SelectItem>
                  ))}
                </Select>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Total Quantity"
                    type="number"
                    value={createForm.totalQuantity}
                    onValueChange={(value) => setCreateForm((prev) => ({ ...prev, totalQuantity: value }))}
                  />
                  <Select
                    label="Quantity Unit"
                    selectedKeys={[createForm.quantityUnit]}
                    onSelectionChange={(keys) => {
                      const key = Array.from(keys)[0] as string | undefined;
                      setCreateForm((prev) => ({ ...prev, quantityUnit: key || "MT" }));
                    }}
                    popoverProps={{ shouldCloseOnBlur: false }}
                  >
                    <SelectItem key="MT" value="MT">
                      MT
                    </SelectItem>
                    <SelectItem key="KG" value="KG">
                      KG
                    </SelectItem>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Price"
                    type="number"
                    value={createForm.price}
                    onValueChange={(value) => setCreateForm((prev) => ({ ...prev, price: value }))}
                  />
                  <Select
                    label="Price Unit"
                    selectedKeys={[createForm.priceUnit]}
                    onSelectionChange={(keys) => {
                      const key = Array.from(keys)[0] as string | undefined;
                      setCreateForm((prev) => ({ ...prev, priceUnit: key || "KG" }));
                    }}
                    popoverProps={{ shouldCloseOnBlur: false }}
                  >
                    <SelectItem key="KG" value="KG">
                      Per KG
                    </SelectItem>
                    <SelectItem key="MT" value="MT">
                      Per MT
                    </SelectItem>
                  </Select>
                </div>
                {canSetCommission && (
                  <Input
                    label="OBAOL Commission"
                    type="number"
                    value={createForm.adminCommission}
                    onValueChange={(value) => setCreateForm((prev) => ({ ...prev, adminCommission: value }))}
                  />
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Expected Arrival Date"
                    type="date"
                    value={createForm.expectedArrivalDate}
                    onValueChange={(value) => setCreateForm((prev) => ({ ...prev, expectedArrivalDate: value }))}
                  />
                  <Input
                    label="Arrival Window (days)"
                    type="number"
                    value={createForm.arrivalWindowDays}
                    onValueChange={(value) => setCreateForm((prev) => ({ ...prev, arrivalWindowDays: value }))}
                  />
                </div>
                {ports.length > 0 ? (
                  <Select
                    label="Arrival Port"
                    selectedKeys={createForm.portId ? [createForm.portId] : []}
                    onSelectionChange={(keys) => {
                      const key = Array.from(keys)[0] as string | undefined;
                      setCreateForm((prev) => ({ ...prev, portId: key || "", portName: "" }));
                    }}
                    popoverProps={{ shouldCloseOnBlur: false }}
                  >
                    {ports.map((port: any) => (
                      <SelectItem key={port._id} value={port._id}>
                        {port.name} ({port.loCode})
                      </SelectItem>
                    ))}
                  </Select>
                ) : (
                  <Input
                    label="Arrival Port (manual)"
                    value={createForm.portName}
                    onValueChange={(value) => setCreateForm((prev) => ({ ...prev, portName: value }))}
                  />
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" className="h-10 rounded-xl" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  color="warning"
                  className="h-10 rounded-xl font-bold uppercase text-[11px]"
                  isLoading={createMutation.isPending}
                  isDisabled={!createForm.productId || !createForm.productVariant}
                  onClick={() =>
                    createMutation.mutate({
                      productId: createForm.productId || undefined,
                      productVariant: createForm.productVariant || undefined,
                      totalQuantity: Number(createForm.totalQuantity),
                      quantityUnit: createForm.quantityUnit,
                      price: Number(createForm.price),
                      priceUnit: createForm.priceUnit,
                      adminCommission: canSetCommission ? Number(createForm.adminCommission || 0) : undefined,
                      expectedArrivalDate: createForm.expectedArrivalDate || undefined,
                      arrivalWindowDays: createForm.arrivalWindowDays || undefined,
                      portId: createForm.portId || undefined,
                      portName: createForm.portName || undefined,
                      importerCompanyId: needsCompanySelect ? createForm.importerCompanyId || undefined : undefined,
                    })
                  }
                >
                  Create Listing
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={reserveOpen}
        onOpenChange={(open) => {
          setReserveOpen(open);
          if (!open) {
            setReserveQty("");
            setReserveCompanyId("");
            setReserveFeedback("");
            setReserveStatus("idle");
          }
        }}
        isDismissable={false}
        isKeyboardDismissDisabled
        shouldCloseOnInteractOutside={() => false}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Reserve Quantity</ModalHeader>
              <ModalBody>
                {reserveStatus !== "success" && (
                  <>
                    {reserveNeedsCompany && (
                      <Select
                        label="Buyer Company"
                        selectedKeys={reserveCompanyId ? [reserveCompanyId] : []}
                        onSelectionChange={(keys) => {
                          const key = Array.from(keys)[0] as string | undefined;
                          setReserveCompanyId(key || "");
                          setReserveFeedback("");
                          setReserveStatus("idle");
                        }}
                        popoverProps={{ shouldCloseOnBlur: false }}
                      >
                        {companies.map((company: any) => (
                          <SelectItem key={company._id} value={company._id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </Select>
                    )}
                    <Input
                      label="Quantity (MT)"
                      type="number"
                      placeholder="Enter quantity in MT"
                      value={reserveQty}
                      onValueChange={(value) => {
                        setReserveQty(value);
                        setReserveFeedback("");
                        setReserveStatus("idle");
                      }}
                    />
                  </>
                )}
                {reserveFeedback && (
                  <div
                    className={`text-xs ${
                      reserveStatus === "success"
                        ? "text-success-500"
                        : reserveStatus === "error"
                        ? "text-danger-500"
                        : "text-warning-600"
                    }`}
                  >
                    {reserveFeedback}
                  </div>
                )}
                {!reserveFeedback && reserveSameCompany && (
                  <div className="text-xs text-danger-500">
                    Buyer company cannot be the same as the importer company.
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" className="h-10 rounded-xl" onClick={onClose}>
                  {reserveStatus === "success" ? "Close" : "Cancel"}
                </Button>
                <Button
                  color="warning"
                  className="h-10 rounded-xl font-bold uppercase text-[11px]"
                  isLoading={reserveMutation.isPending}
                  isDisabled={
                    !reserveQty ||
                    Number(reserveQty) <= 0 ||
                    (reserveNeedsCompany && !reserveCompanyId) ||
                    (maxReservableQty > 0 && Number(reserveQty) > maxReservableQty) ||
                    reserveSameCompany ||
                    reserveStatus === "success"
                  }
                  onPress={() => {
                    if (!selectedListing) return;
                    const requestedQty = Number(reserveQty || 0);
                    if (reserveSameCompany) {
                      setReserveFeedback("Buyer company cannot be the same as the importer company.");
                      setReserveStatus("error");
                      return;
                    }
                    if (maxReservableQty > 0 && requestedQty > maxReservableQty) {
                      setReserveFeedback(`Only ${maxReservableQty} MT is available. Please enter a lower quantity.`);
                      setReserveStatus("error");
                      return;
                    }
                    reserveMutation.mutate({
                      id: selectedListing._id,
                      data: {
                        quantityRequested: requestedQty,
                        buyerCompanyId: reserveNeedsCompany ? reserveCompanyId : undefined,
                      },
                    });
                  }}
                >
                  {reserveStatus === "success" ? "Reserved" : "Submit"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={editReservationOpen}
        onOpenChange={setEditReservationOpen}
        isDismissable={false}
        isKeyboardDismissDisabled
        shouldCloseOnInteractOutside={() => false}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Edit Reservation</ModalHeader>
              <ModalBody>
                <Input
                  label="Quantity (MT)"
                  type="number"
                  placeholder="Enter quantity in MT"
                  value={editReservationQty}
                  onValueChange={setEditReservationQty}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" className="h-10 rounded-xl" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  color="warning"
                  className="h-10 rounded-xl font-bold uppercase text-[11px]"
                  isLoading={editReservationMutation.isPending}
                  isDisabled={!editReservationQty || Number(editReservationQty) <= 0 || !selectedReservation}
                  onClick={() => {
                    if (!selectedReservation) return;
                    editReservationMutation.mutate({
                      listingId: String(selectedReservation.listingId?._id || selectedReservation.listingId || ""),
                      reservationId: selectedReservation._id,
                      quantityRequested: Number(editReservationQty),
                    });
                  }}
                >
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={manageOpen}
        onOpenChange={setManageOpen}
        size="3xl"
        isDismissable={false}
        isKeyboardDismissDisabled
        shouldCloseOnInteractOutside={() => false}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Manage Reservations</ModalHeader>
              <ModalBody className="gap-4">
                {reservations.length === 0 && (
                  <div className="text-default-500 text-sm">No reservations yet.</div>
                )}
                {reservations.map((reservation: any) => (
                  <Card key={reservation._id} className="border border-default-200">
                    <CardBody className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{reservation.buyerCompanyId?.name || "Buyer"}</div>
                          <div className="text-xs text-default-500">
                            {reservation.listingId?.commodityName || "Import"}{" "}
                            {reservation.listingId?.expectedArrivalDate
                              ? `• ETA ${new Date(reservation.listingId.expectedArrivalDate).toLocaleDateString()}`
                              : ""}
                          </div>
                        </div>
                        <Chip size="sm" color="warning" variant="flat">
                          {resolveReservationStatus(reservation)}
                        </Chip>
                      </div>
                      <div className="text-sm">
                        Quantity: <span className="font-semibold">{reservation.quantityRequested} MT</span>
                      </div>
                      {resolveReservationStatus(reservation) === "PENDING" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            color="warning"
                            className="rounded-xl font-bold"
                            isLoading={acceptMutation.isPending && pendingReservationId === reservation._id}
                            isDisabled={(acceptMutation.isPending || rejectMutation.isPending) && pendingReservationId === reservation._id}
                            onClick={() => {
                              setPendingReservationId(reservation._id);
                              setActionErrorById((prev) => ({ ...prev, [reservation._id]: "" }));
                              acceptMutation.mutate(reservation._id);
                            }}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="flat"
                            className="rounded-xl font-bold"
                            isLoading={rejectMutation.isPending && pendingReservationId === reservation._id}
                            isDisabled={(acceptMutation.isPending || rejectMutation.isPending) && pendingReservationId === reservation._id}
                            onClick={() => {
                              setPendingReservationId(reservation._id);
                              setActionErrorById((prev) => ({ ...prev, [reservation._id]: "" }));
                              rejectMutation.mutate(reservation._id);
                            }}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                      {actionErrorById[reservation._id] && (
                        <div className="text-xs text-danger-400 mt-1">{actionErrorById[reservation._id]}</div>
                      )}
                      {resolveReservationStatus(reservation) === "APPROVED" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            color="success"
                            className="rounded-xl font-bold"
                            isLoading={lockReservationMutation.isPending && pendingReservationId === reservation._id}
                            isDisabled={lockReservationMutation.isPending && pendingReservationId === reservation._id}
                            onPress={() =>
                              (() => {
                                setPendingReservationId(reservation._id);
                                setLockErrorById((prev) => ({ ...prev, [reservation._id]: "" }));
                                lockReservationMutation.mutate({
                                  listingId: String(reservation.listingId?._id || reservation.listingId || ""),
                                  reservationId: reservation._id,
                                });
                              })()
                            }
                          >
                            Lock & Create Enquiry
                          </Button>
                          {lockErrorById[reservation._id] && (
                            <div className="text-xs text-danger-400 mt-1">{lockErrorById[reservation._id]}</div>
                          )}
                        </div>
                      )}
                    </CardBody>
                  </Card>
                ))}
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onClick={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={editOpen}
        onOpenChange={setEditOpen}
        size="2xl"
        isDismissable={false}
        isKeyboardDismissDisabled
        shouldCloseOnInteractOutside={() => false}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Edit Import Listing</ModalHeader>
              <ModalBody className="gap-4">
                <Select
                  label="Product"
                  isDisabled
                  selectedKeys={editForm.productId ? [editForm.productId] : []}
                  onSelectionChange={(keys) => {
                    const key = Array.from(keys)[0] as string | undefined;
                    setEditForm((prev) => ({ ...prev, productId: key || "", productVariant: "" }));
                  }}
                  popoverProps={{ shouldCloseOnBlur: false }}
                >
                  {products.map((product: any) => (
                    <SelectItem key={product._id} value={product._id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  label="Product Variant"
                  isDisabled
                  selectedKeys={editForm.productVariant ? [editForm.productVariant] : []}
                  onSelectionChange={(keys) => {
                    const key = Array.from(keys)[0] as string | undefined;
                    setEditForm((prev) => ({ ...prev, productVariant: key || "" }));
                  }}
                  popoverProps={{ shouldCloseOnBlur: false }}
                >
                  {variants.map((variant: any) => (
                    <SelectItem key={variant._id} value={variant._id}>
                      {variant.name}
                    </SelectItem>
                  ))}
                </Select>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Total Quantity"
                    type="number"
                    value={editForm.totalQuantity}
                    onValueChange={(value) => setEditForm((prev) => ({ ...prev, totalQuantity: value }))}
                  />
                  <Select
                    label="Quantity Unit"
                    selectedKeys={[editForm.quantityUnit]}
                    onSelectionChange={(keys) => {
                      const key = Array.from(keys)[0] as string | undefined;
                      setEditForm((prev) => ({ ...prev, quantityUnit: key || "MT" }));
                    }}
                    popoverProps={{ shouldCloseOnBlur: false }}
                  >
                    <SelectItem key="MT" value="MT">
                      MT
                    </SelectItem>
                    <SelectItem key="KG" value="KG">
                      KG
                    </SelectItem>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Price"
                    type="number"
                    value={editForm.price}
                    onValueChange={(value) => setEditForm((prev) => ({ ...prev, price: value }))}
                  />
                  <Select
                    label="Price Unit"
                    selectedKeys={[editForm.priceUnit]}
                    onSelectionChange={(keys) => {
                      const key = Array.from(keys)[0] as string | undefined;
                      setEditForm((prev) => ({ ...prev, priceUnit: key || "KG" }));
                    }}
                    popoverProps={{ shouldCloseOnBlur: false }}
                  >
                    <SelectItem key="KG" value="KG">
                      Per KG
                    </SelectItem>
                    <SelectItem key="MT" value="MT">
                      Per MT
                    </SelectItem>
                  </Select>
                </div>
                {canSetCommission && (
                  <Input
                    label="OBAOL Commission"
                    type="number"
                    value={editForm.adminCommission}
                    onValueChange={(value) => setEditForm((prev) => ({ ...prev, adminCommission: value }))}
                  />
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Expected Arrival Date"
                    type="date"
                    value={editForm.expectedArrivalDate}
                    onValueChange={(value) => setEditForm((prev) => ({ ...prev, expectedArrivalDate: value }))}
                  />
                  <Input
                    label="Arrival Window (days)"
                    type="number"
                    value={editForm.arrivalWindowDays}
                    onValueChange={(value) => setEditForm((prev) => ({ ...prev, arrivalWindowDays: value }))}
                  />
                </div>
                {ports.length > 0 ? (
                  <Select
                    label="Arrival Port"
                    selectedKeys={editForm.portId ? [editForm.portId] : []}
                    onSelectionChange={(keys) => {
                      const key = Array.from(keys)[0] as string | undefined;
                      setEditForm((prev) => ({ ...prev, portId: key || "", portName: "" }));
                    }}
                    popoverProps={{ shouldCloseOnBlur: false }}
                  >
                    {ports.map((port: any) => (
                      <SelectItem key={port._id} value={port._id}>
                        {port.name} ({port.loCode})
                      </SelectItem>
                    ))}
                  </Select>
                ) : (
                  <Input
                    label="Arrival Port (manual)"
                    value={editForm.portName}
                    onValueChange={(value) => setEditForm((prev) => ({ ...prev, portName: value }))}
                  />
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" className="h-10 rounded-xl" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  color="warning"
                  className="h-10 rounded-xl font-bold uppercase text-[11px]"
                  isLoading={editMutation.isPending}
                  onClick={() => {
                    if (!selectedListing?._id) return;
                    editMutation.mutate({
                      id: selectedListing._id,
                      data: {
                        totalQuantity: Number(editForm.totalQuantity),
                        quantityUnit: editForm.quantityUnit,
                        price: Number(editForm.price),
                        priceUnit: editForm.priceUnit,
                        adminCommission: canSetCommission ? Number(editForm.adminCommission || 0) : undefined,
                        expectedArrivalDate: editForm.expectedArrivalDate || undefined,
                        arrivalWindowDays: editForm.arrivalWindowDays || undefined,
                        portId: editForm.portId || undefined,
                        portName: editForm.portName || undefined,
                      },
                    });
                  }}
                >
                  Save Changes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </motion.div>
  );
}
