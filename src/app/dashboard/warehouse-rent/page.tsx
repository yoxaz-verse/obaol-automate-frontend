"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Input,
  Textarea,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from "@heroui/react";
import Title from "@/components/titles";
import AuthContext from "@/context/AuthContext";
import { getData, postData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { showToastMessage } from "@/utils/utils";
import { FiLoader, FiMapPin, FiSearch } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useCalculationConfig } from "@/hooks/useCalculationConfig";
import type { WarehouseMapItem } from "@/components/Warehouse/WarehouseRentMap";

const WarehouseRentMap = dynamic(() => import("@/components/Warehouse/WarehouseRentMap"), {
  ssr: false,
});

type Warehouse = {
  _id: string;
  name: string;
  address?: string;
  category?: "GENERAL" | "COLD_STORAGE" | "BONDED" | "AGRO";
  storageRatePerUnit?: number;
  unit?: "KG" | "MT";
  listingType?: "PRIVATE" | "RENTAL";
  isRentalActive?: boolean;
  isActive?: boolean;
  location?: {
    latitude?: number;
    longitude?: number;
    city?: string;
    state?: string;
  } | null;
};

type AssociateCompany = {
  _id: string;
  name: string;
};

type WarehouseAssignment = {
  _id: string;
  warehouseId?: string | { _id?: string };
  companyId?: string | { _id?: string };
  status?: "ACTIVE" | "INACTIVE";
  bookingStatus?: "PENDING_QUOTE" | "BOOKED" | "REJECTED" | "CANCELLED";
};

type ApiListResponse<T> = {
  data?: {
    data?: T[];
  } | T[];
};

const toArrayData = <T,>(response: ApiListResponse<T> | null | undefined): T[] => {
  const direct = response?.data;
  if (Array.isArray(direct)) return direct;
  if (Array.isArray(direct?.data)) return direct.data;
  return [];
};

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;
const SEARCH_RADIUS_KM = 100;

const CATEGORY_COLOR: Record<string, string> = {
  GENERAL: "#f59e0b",
  COLD_STORAGE: "#06b6d4",
  BONDED: "#8b5cf6",
  AGRO: "#22c55e",
};

type SearchPoint = { latitude: number; longitude: number; label: string };

const toRad = (deg: number) => (deg * Math.PI) / 180;
const haversineKm = (aLat: number, aLng: number, bLat: number, bLng: number) => {
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const aa =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(aLat)) *
      Math.cos(toRad(bLat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return 6371 * (2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa)));
};

const toErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error !== "object" || error === null) return fallback;
  const maybeResponse = (error as { response?: { data?: { message?: string } } }).response;
  return maybeResponse?.data?.message || fallback;
};

const toErrorStatus = (error: unknown) => {
  if (typeof error !== "object" || error === null) return 0;
  const status = (error as { response?: { status?: number } }).response?.status;
  return Number(status || 0);
};

export default function WarehouseRentPage() {
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);
  const roleLower = String(user?.role || "").toLowerCase();
  const isAssociate = roleLower === "associate";
  const needsCompanySelect = roleLower === "admin" || roleLower === "operator" || roleLower === "team";
  const userAssociateCompanyId = String(user?.associateCompanyId || "");

  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [requiredMT, setRequiredMT] = useState("1");
  const [durationMonths, setDurationMonths] = useState("1");
  const [requirementNotes, setRequirementNotes] = useState("");
  const [expectedStartDate, setExpectedStartDate] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [searchPoint, setSearchPoint] = useState<SearchPoint | null>(null);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  const {
    data: warehousesData,
    isLoading: isLoadingWarehouses,
    isError: isWarehousesError,
    error: warehousesError,
  } = useQuery({
    queryKey: ["warehouse-rentals"],
    queryFn: async () => {
      const res: any = await getData(apiRoutes.warehouses.list, { scope: "available" });
      return toArrayData(res);
    },
  });
  const { data: calculationConfig } = useCalculationConfig(true);

  const { data: companiesData } = useQuery({
    queryKey: ["warehouse-rent-companies", roleLower, user?.id],
    queryFn: async () => {
      const res: any = await getData(apiRoutes.associateCompany.getAll, { page: 1, limit: 500, sort: "name:asc" });
      return toArrayData(res);
    },
    enabled: needsCompanySelect,
  });

  const resolvedCompanyIdForAssignments = isAssociate ? userAssociateCompanyId : selectedCompanyId;
  const { data: assignmentsData } = useQuery({
    queryKey: ["warehouse-assignments", roleLower, user?.id, resolvedCompanyIdForAssignments],
    queryFn: async () => {
      const params: any = { status: "ACTIVE" };
      if (resolvedCompanyIdForAssignments) params.companyId = resolvedCompanyIdForAssignments;
      const res: any = await getData(apiRoutes.warehouses.assignments, params);
      return toArrayData(res);
    },
    enabled: isAssociate ? Boolean(userAssociateCompanyId) : Boolean(selectedCompanyId),
  });

  const companies: AssociateCompany[] = useMemo(
    () => (Array.isArray(companiesData) ? companiesData : []),
    [companiesData]
  );
  useEffect(() => {
    if (isAssociate) {
      if (userAssociateCompanyId && selectedCompanyId !== userAssociateCompanyId) {
        setSelectedCompanyId(userAssociateCompanyId);
      }
      return;
    }
    if (needsCompanySelect && !selectedCompanyId && companies.length > 0) {
      setSelectedCompanyId(String(companies[0]?._id || ""));
    }
  }, [isAssociate, needsCompanySelect, userAssociateCompanyId, selectedCompanyId, companies]);

  const rentalWarehouses = useMemo(() => {
    const list: Warehouse[] = Array.isArray(warehousesData) ? warehousesData : [];
    return list.filter((w) => w?.listingType === "RENTAL" && w?.isRentalActive !== false);
  }, [warehousesData]);

  const mappableWarehouses = useMemo(() => {
    return rentalWarehouses.filter((warehouse) => {
      const lat = Number(warehouse?.location?.latitude);
      const lng = Number(warehouse?.location?.longitude);
      return Number.isFinite(lat) && Number.isFinite(lng);
    });
  }, [rentalWarehouses]);

  const filteredWarehouses = useMemo(() => {
    if (!searchPoint) return mappableWarehouses;
    return mappableWarehouses.filter((warehouse) => {
      const lat = Number(warehouse?.location?.latitude);
      const lng = Number(warehouse?.location?.longitude);
      const distance = haversineKm(searchPoint.latitude, searchPoint.longitude, lat, lng);
      return distance <= SEARCH_RADIUS_KM;
    });
  }, [mappableWarehouses, searchPoint]);

  const activeAssignments: WarehouseAssignment[] = useMemo(
    () => (Array.isArray(assignmentsData) ? assignmentsData : []),
    [assignmentsData]
  );
  const bookedWarehouseIdSet = useMemo(() => {
    const ids = new Set<string>();
    const pendingIds = new Set<string>();
    activeAssignments.forEach((assignment) => {
      const value = assignment?.warehouseId;
      const warehouseId = typeof value === "string" ? value : String(value?._id || "");
      if (!warehouseId) return;
      if (assignment?.bookingStatus === "PENDING_QUOTE") pendingIds.add(warehouseId);
      if ((assignment?.bookingStatus || "BOOKED") === "BOOKED") ids.add(warehouseId);
    });
    return { booked: ids, pending: pendingIds };
  }, [activeAssignments]);

  const mapWarehouses: WarehouseMapItem[] = useMemo(
    () =>
      filteredWarehouses.map((warehouse) => {
        const warehouseId = String(warehouse._id || "");
        const category = String(warehouse.category || "GENERAL");
        return {
          id: warehouseId,
          name: warehouse.name,
          lat: Number(warehouse.location?.latitude),
          lng: Number(warehouse.location?.longitude),
          category,
          color: CATEGORY_COLOR[category] || CATEGORY_COLOR.GENERAL,
          storageRatePerUnit: warehouse.storageRatePerUnit,
          unit: warehouse.unit,
          isBooked: bookedWarehouseIdSet.booked.has(warehouseId),
          isQuoteRequested: bookedWarehouseIdSet.pending.has(warehouseId),
          isActionDisabled:
            bookedWarehouseIdSet.booked.has(warehouseId) ||
            (needsCompanySelect && !selectedCompanyId) ||
            bookMutation.isPending,
          source: warehouse,
        };
      }),
    [bookMutation.isPending, bookedWarehouseIdSet, filteredWarehouses, needsCompanySelect, selectedCompanyId]
  );

  const bookMutation = useMutation({
    mutationFn: (payload: {
      warehouseId: string;
      companyId?: string;
      requestType: "QUOTE_REQUEST" | "DIRECT_BOOKING";
      requiredMT: number;
      durationMonths: number;
      requirementNotes?: string;
      expectedStartDate?: string;
      taxPercent: number;
      handlingPercent: number;
      estimateCurrency: string;
    }) =>
      postData(apiRoutes.warehouses.assignments, payload),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Warehouse booking request submitted successfully." });
      queryClient.invalidateQueries({ queryKey: ["warehouse-assignments"] });
      setIsBookModalOpen(false);
      setSelectedWarehouse(null);
    },
    onError: (error: unknown) => {
      showToastMessage({
        type: "error",
        message: toErrorMessage(error, "Failed to submit warehouse booking request."),
      });
    },
  });

  const openBookModal = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setRequiredMT("1");
    setDurationMonths("1");
    setRequirementNotes("");
    setExpectedStartDate("");
    setIsBookModalOpen(true);
  };

  const geocodeLocation = async (query: string): Promise<SearchPoint | null> => {
    const q = String(query || "").trim();
    if (!q) return null;
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const lat = Number(data[0]?.lat);
    const lon = Number(data[0]?.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return {
      latitude: lat,
      longitude: lon,
      label: String(data[0]?.display_name || q),
    };
  };

  const handleLocationSearch = async () => {
    const q = String(locationQuery || "").trim();
    if (!q) {
      setSearchPoint(null);
      return;
    }
    try {
      setIsSearchingLocation(true);
      const result = await geocodeLocation(q);
      if (!result) {
        showToastMessage({ type: "warning", message: "Location not found. Try a more specific area." });
        return;
      }
      setSearchPoint(result);
    } catch {
      showToastMessage({ type: "warning", message: "Unable to search location right now." });
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const taxPercent = Number(calculationConfig?.warehouseTaxPercent ?? calculationConfig?.gstPercent ?? 0);
  const handlingPercent = Number(
    calculationConfig?.warehouseHandlingPercent ?? calculationConfig?.importAdminCommissionDefault ?? 0
  );
  const parsedRequiredMT = Math.max(0, Number(requiredMT || 0));
  const parsedMonths = Math.max(1, Math.floor(Number(durationMonths || 1)));
  const ratePerUnit = Number(selectedWarehouse?.storageRatePerUnit ?? 0);
  const estimateBase = Number((parsedRequiredMT * ratePerUnit * parsedMonths).toFixed(2));
  const estimateTax = Number(((estimateBase * taxPercent) / 100).toFixed(2));
  const estimateHandling = Number(((estimateBase * handlingPercent) / 100).toFixed(2));
  const estimateTotal = Number((estimateBase + estimateTax + estimateHandling).toFixed(2));

  const submitBooking = (requestType: "QUOTE_REQUEST" | "DIRECT_BOOKING") => {
    if (!selectedWarehouse?._id) return;
    if (!isAssociate && !selectedCompanyId) {
      showToastMessage({ type: "warning", message: "Select an associate company first." });
      return;
    }
    if (!Number.isFinite(parsedRequiredMT) || parsedRequiredMT <= 0) {
      showToastMessage({ type: "warning", message: "Enter a valid required quantity in MT." });
      return;
    }
    if (!Number.isFinite(parsedMonths) || parsedMonths <= 0) {
      showToastMessage({ type: "warning", message: "Enter a valid duration in months." });
      return;
    }

    bookMutation.mutate({
      warehouseId: selectedWarehouse._id,
      ...(isAssociate ? {} : { companyId: selectedCompanyId }),
      requestType,
      requiredMT: Number(parsedRequiredMT.toFixed(3)),
      durationMonths: parsedMonths,
      requirementNotes: requirementNotes.trim(),
      ...(expectedStartDate ? { expectedStartDate } : {}),
      taxPercent,
      handlingPercent,
      estimateCurrency: "INR",
    });
  };

  const warehousesErrorStatus = toErrorStatus(warehousesError);
  const warehousesErrorMessage =
    warehousesErrorStatus === 403
      ? "Access denied for your role."
      : toErrorMessage(warehousesError, "Unable to load warehouse booking right now.");

  return (
    <section className="w-full min-h-screen p-4 md:p-8 bg-[#030303] text-foreground">
      <div className="max-w-[1400px] mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-orange-500 mb-2"
            >
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] font-mono">Operations_Terminal</span>
            </motion.div>
            <Title title="Warehouse Booking" />
            <p className="text-sm text-default-400 max-w-xl">
              Centralized warehouse booking management. Capture requirement in MT and get an approximate quotation before final allocation.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end gap-1 font-mono text-[9px] text-default-400 uppercase tracking-tighter">
              <span>Link_Status: Encrypted</span>
              <span>Hub_Location: Asia-South</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: CONTROLS & MAP */}
          <div className="xl:col-span-8 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative p-6 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <FiMapPin size={120} />
              </div>
              
              <div className="relative z-10 space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {needsCompanySelect && (
                    <div className="flex-1">
                      <div className="text-[10px] font-black uppercase tracking-widest text-default-400 mb-2 font-mono">
                        Trade Entity
                      </div>
                      <Select
                        variant="bordered"
                        classNames={{
                          base: "max-w-md",
                          trigger: "bg-white/[0.03] border-white/10 hover:border-orange-500/50 transition-colors h-12",
                          value: "text-sm font-bold truncate",
                          popoverContent: "bg-[#0A0A0A] border border-white/10 rounded-xl",
                        }}
                        selectedKeys={selectedCompanyId ? [selectedCompanyId] : []}
                        onSelectionChange={(keys) => {
                          const key = Array.from(keys)[0] as string | undefined;
                          setSelectedCompanyId(key || "");
                        }}
                        placeholder="Select associate company"
                      >
                        {companies.map((company) => (
                          <SelectItem key={company._id} value={company._id} className="hover:bg-orange-500/10">
                            {company.name}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-default-400 mb-2 font-mono">
                      Strategic Location
                    </div>
                    <Input
                      placeholder="Search city, district, or state"
                      variant="bordered"
                      classNames={{
                        base: "w-full",
                        inputWrapper: "bg-white/[0.03] border-white/10 hover:border-orange-500/50 transition-colors h-12",
                        input: "text-sm",
                      }}
                      value={locationQuery}
                      onValueChange={setLocationQuery}
                      startContent={<FiSearch className="text-orange-500" />}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleLocationSearch();
                        }
                      }}
                    />
                  </div>
                  
                  <div className="flex items-end gap-2 pb-[1px]">
                    <Button
                      color="warning"
                      className="h-12 px-8 font-black uppercase tracking-widest text-xs rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.2)]"
                      isLoading={isSearchingLocation}
                      onPress={handleLocationSearch}
                    >
                      Search
                    </Button>
                    <Button
                      variant="bordered"
                      className="h-12 px-6 border-white/10 hover:bg-white/5 font-black uppercase tracking-widest text-xs rounded-xl"
                      onPress={() => {
                        setLocationQuery("");
                        setSearchPoint(null);
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                <div className="relative group">
                  {/* Corner Accents */}
                  <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-orange-500/40 rounded-tl z-20" />
                  <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-orange-500/40 rounded-tr z-20" />
                  <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-orange-500/40 rounded-bl z-20" />
                  <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-orange-500/40 rounded-br z-20" />
                  
                  <div className="h-[450px] w-full overflow-hidden rounded-2xl border border-white/10 relative shadow-inner">
                    <WarehouseRentMap
                      center={DEFAULT_CENTER}
                      zoom={DEFAULT_ZOOM}
                      searchPoint={searchPoint}
                      warehouses={mapWarehouses}
                      onBook={(item) => openBookModal(item.source as Warehouse)}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: LIST VIEW */}
          <div className="xl:col-span-4 space-y-6 h-full flex flex-col">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-default-400 font-mono">Node_Catalog</h2>
              <span className="text-[10px] font-mono text-orange-500/60">{filteredWarehouses.length} Nodes Found</span>
            </div>

            <div className="flex-1 space-y-4 max-h-[680px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {isLoadingWarehouses ? (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-3xl"
                  >
                    <FiLoader className="animate-spin text-orange-500 mb-4" size={24} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-default-500 font-mono">Initializing_Nodes...</span>
                  </motion.div>
                ) : filteredWarehouses.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-3xl text-center px-6"
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-default-500 font-mono">No_Available_Capacity_Detected</span>
                  </motion.div>
                ) : (
                  filteredWarehouses.map((warehouse, idx) => {
                    const warehouseId = String(warehouse._id || "");
                    const isBooked = bookedWarehouseIdSet.booked.has(warehouseId);
                    const isQuoteRequested = bookedWarehouseIdSet.pending.has(warehouseId);
                    const bookingDisabled = isBooked || (needsCompanySelect && !selectedCompanyId) || bookMutation.isPending;
                    const color = CATEGORY_COLOR[warehouse.category || "GENERAL"];

                    return (
                      <motion.div
                        key={warehouse._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04, duration: 0.22 }}
                        whileHover={{ y: -1 }}
                      >
                        <Card className="border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/20 transition-all rounded-2xl overflow-hidden shadow-[0_10px_28px_rgba(0,0,0,0.2)] group">
                          <CardBody className="p-6">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex items-start gap-3 min-w-0 flex-1">
                                <div
                                  className="w-2.5 h-2.5 rounded-full mt-2 shrink-0"
                                  style={{ background: color, boxShadow: `0 0 0 4px ${color}22` }}
                                />
                                <div className="min-w-0 flex-1">
                                  <h3 className="text-lg font-bold tracking-tight text-foreground group-hover:text-warning-400 transition-colors truncate">
                                    {warehouse.name}
                                  </h3>
                                  <div className="mt-2 flex items-center gap-2 text-default-400 min-w-0">
                                    <FiMapPin size={13} className="text-default-500 shrink-0" />
                                    <span className="text-sm truncate">{warehouse.address || "Location not specified"}</span>
                                  </div>
                                </div>
                              </div>
                              <Chip 
                                size="sm" 
                                variant="flat" 
                                className="font-bold uppercase tracking-wide text-[10px] bg-white/5 border border-white/15 px-2"
                                color={isBooked ? "success" : isQuoteRequested ? "secondary" : "warning"}
                              >
                                {isBooked ? "Booked" : isQuoteRequested ? "Quote Requested" : "Available"}
                              </Chip>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-5 mb-6">
                              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                                <div className="text-[11px] font-semibold text-default-400 mb-1">Category</div>
                                <div className="text-sm font-semibold text-foreground">
                                  {(warehouse.category || "GENERAL").replace("_", " ")}
                                </div>
                              </div>
                              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                                <div className="text-[11px] font-semibold text-default-400 mb-1">Rate</div>
                                <div className="text-sm font-semibold text-warning-400">
                                  {warehouse.storageRatePerUnit ?? "0"}{" "}
                                  <span className="text-default-400 font-medium">{warehouse.unit || "MT"}</span>
                                </div>
                              </div>
                            </div>

                            <Button
                              color={isBooked ? "success" : "warning"}
                              variant={isBooked ? "flat" : "solid"}
                              size="md"
                              fullWidth
                              isDisabled={bookingDisabled}
                              onPress={() => openBookModal(warehouse)}
                              className="font-bold tracking-wide text-sm rounded-xl h-11"
                            >
                              {isBooked ? "Already Booked" : isQuoteRequested ? "Quote Requested" : "Book Warehouse"}
                            </Button>
                          </CardBody>
                        </Card>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isBookModalOpen} 
        onOpenChange={setIsBookModalOpen}
        classNames={{
          backdrop: "bg-black/80 backdrop-blur-sm",
          base: "bg-[#0A0A0A] border border-white/10 rounded-[2.5rem]",
          header: "border-b border-white/5 px-8 py-6",
          footer: "border-t border-white/5 px-8 py-6",
          body: "px-8 py-6",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className="space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 font-mono">Allocation_Protocol</div>
                  <h3 className="text-xl font-black">Warehouse Booking & Quotation</h3>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-default-500">Target Module</span>
                    <span className="font-bold text-foreground">{selectedWarehouse?.name || "Unspecified Node"}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-default-500">Assigned Entity</span>
                    <span className="font-bold text-orange-500">
                      {companies.find((company) => String(company._id) === String(selectedCompanyId))?.name || "System Authorization"}
                    </span>
                  </div>
                  <Divider className="bg-white/5" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      type="number"
                      min={0}
                      step={0.001}
                      label="Required Quantity (MT)"
                      value={requiredMT}
                      onValueChange={setRequiredMT}
                      variant="bordered"
                    />
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      label="Duration (Months)"
                      value={durationMonths}
                      onValueChange={setDurationMonths}
                      variant="bordered"
                    />
                    <Input
                      type="date"
                      label="Expected Start Date (Optional)"
                      value={expectedStartDate}
                      onValueChange={setExpectedStartDate}
                      variant="bordered"
                    />
                  </div>
                  <Textarea
                    label="Requirement Notes"
                    placeholder="Share storage requirement details for quotation."
                    value={requirementNotes}
                    onValueChange={setRequirementNotes}
                    variant="bordered"
                    minRows={3}
                  />
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-default-400">Approximate Quote (INR)</div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-default-400">Base ({parsedRequiredMT || 0} MT × {ratePerUnit} × {parsedMonths} months)</span>
                      <span className="font-semibold">{estimateBase.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-default-400">Tax ({taxPercent}%)</span>
                      <span className="font-semibold">{estimateTax.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-default-400">Handling ({handlingPercent}%)</span>
                      <span className="font-semibold">{estimateHandling.toFixed(2)}</span>
                    </div>
                    <Divider className="bg-white/10 my-2" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold">Estimated Total</span>
                      <span className="font-black text-orange-400">{estimateTotal.toFixed(2)}</span>
                    </div>
                    <p className="text-[11px] text-default-500 italic">This is an approximate quotation; final charges may vary by warehouse policy and operational conditions.</p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button 
                  variant="light" 
                  onPress={onClose}
                  className="font-black uppercase tracking-widest text-[10px]"
                >
                  Abort
                </Button>
                <Button 
                  color="secondary" 
                  isLoading={bookMutation.isPending} 
                  onPress={() => submitBooking("QUOTE_REQUEST")}
                  className="font-black uppercase tracking-widest text-[10px] shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                >
                  Request Quote
                </Button>
                <Button 
                  color="warning" 
                  isLoading={bookMutation.isPending} 
                  onPress={() => submitBooking("DIRECT_BOOKING")}
                  className="font-black uppercase tracking-widest text-[10px] shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                >
                  Book Now
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </section>
  );
}
