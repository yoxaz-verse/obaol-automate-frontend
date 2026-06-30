"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, CardBody, Chip, Input, Select, SelectItem } from "@nextui-org/react";
import Title from "@/components/titles";
import AuthContext from "@/context/AuthContext";
import { getData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { showToastMessage } from "@/utils/utils";
import { FiGrid, FiLoader, FiMap, FiMapPin, FiPhoneCall, FiSearch } from "react-icons/fi";
import { LuPlus } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import type { WarehouseMapItem } from "@/components/Warehouse/WarehouseRentMap";

const WarehouseRentMap = dynamic(() => import("@/components/Warehouse/WarehouseRentMap"), {
  ssr: false,
  loading: () => <div className="h-[520px] w-full animate-pulse rounded-xl bg-default-100" />,
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
  contactPhone?: string;
  contactPhoneSecondary?: string;
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
type ViewMode = "map" | "cards";

const toRad = (deg: number) => (deg * Math.PI) / 180;
const haversineKm = (aLat: number, aLng: number, bLat: number, bLng: number) => {
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const aa =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
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

const normalizeDialPhone = (value: string) => String(value || "").trim().replace(/[\s()-]/g, "");

export default function WarehouseRentPage() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const roleLower = String(user?.role || "").toLowerCase();
  const isAdmin = roleLower === "admin";
  const isOperatorFamily = roleLower === "operator" || roleLower === "team";
  const canAdd = isAdmin || isOperatorFamily;
  const needsCompanySelect = roleLower === "admin" || roleLower === "operator" || roleLower === "team";

  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [searchPoint, setSearchPoint] = useState<SearchPoint | null>(null);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("map");

  const {
    data: warehousesData,
    isLoading: isLoadingWarehouses,
    isError: isWarehousesError,
    error: warehousesError,
    refetch: refetchWarehouses,
  } = useQuery({
    queryKey: ["warehouse-rentals-directory", roleLower, user?.id],
    queryFn: async () => {
      const res: any = await getData(apiRoutes.warehouses.directory, { page: 1, limit: 100 });
      return toArrayData(res);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: companiesData } = useQuery({
    queryKey: ["warehouse-rent-companies", roleLower, user?.id],
    queryFn: async () => {
      const res: any = await getData(apiRoutes.associateCompany.getAll, { page: 1, limit: 500, sort: "name:asc" });
      return toArrayData(res);
    },
    enabled: needsCompanySelect,
  });

  const companies: AssociateCompany[] = useMemo(() => (Array.isArray(companiesData) ? companiesData : []), [companiesData]);

  useEffect(() => {
    if (needsCompanySelect && !selectedCompanyId && companies.length > 0) {
      setSelectedCompanyId(String(companies[0]?._id || ""));
    }
  }, [needsCompanySelect, selectedCompanyId, companies]);

  const rentalWarehouses = useMemo(() => {
    const list: Warehouse[] = Array.isArray(warehousesData) ? warehousesData : [];
    return list.filter((w) => w?.listingType === "RENTAL" && w?.isRentalActive !== false);
  }, [warehousesData]);

  const mappableWarehouses = useMemo(() => {
    return rentalWarehouses.filter((warehouse) => {
      const lat = Number(warehouse?.location?.latitude);
      const lng = Number(warehouse?.location?.longitude);
      return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
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

  const mapWarehouses: WarehouseMapItem[] = useMemo(
    () =>
      filteredWarehouses.map((warehouse) => ({
        _id: String(warehouse._id || ""),
        name: warehouse.name,
        category: warehouse.category,
        storageRatePerUnit: warehouse.storageRatePerUnit,
        unit: warehouse.unit,
        contactPhone: warehouse.contactPhone,
        contactPhoneSecondary: warehouse.contactPhoneSecondary,
        location: warehouse.location,
      })),
    [filteredWarehouses]
  );

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

  const handleContact = (warehouse: { name: string; contactPhone?: string }) => {
    const phone = String(warehouse.contactPhone || "").trim();
    if (!phone) {
      showToastMessage({ type: "warning", message: "Contact number is not available for this warehouse yet." });
      return;
    }
    const dialPhone = normalizeDialPhone(phone);
    if (typeof window !== "undefined") {
      window.location.href = `tel:${dialPhone}`;
    }
    showToastMessage({ type: "success", message: `Calling ${warehouse.name}: ${phone}` });
  };

  const warehousesErrorStatus = toErrorStatus(warehousesError);
  const warehousesErrorMessage =
    warehousesErrorStatus === 403
      ? "Access denied for your role."
      : toErrorMessage(warehousesError, "Unable to load warehouse contact listings right now.");
  const [isWarehouseLoadSlow, setIsWarehouseLoadSlow] = useState(false);

  useEffect(() => {
    if (!isLoadingWarehouses) {
      setIsWarehouseLoadSlow(false);
      return;
    }
    const t = window.setTimeout(() => setIsWarehouseLoadSlow(true), 3500);
    return () => window.clearTimeout(t);
  }, [isLoadingWarehouses]);

  const renderDirectoryState = () => {
    if (isLoadingWarehouses) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 border border-dashed border-default-300 rounded-3xl">
          <FiLoader className="animate-spin text-orange-500 mb-4" size={24} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-default-500 font-mono">Initializing_Nodes...</span>
          {isWarehouseLoadSlow ? (
            <div className="mt-4 flex flex-col items-center gap-3">
              <span className="text-[11px] text-default-400">Still loading. You can retry now.</span>
              <Button size="sm" color="warning" variant="flat" onPress={() => refetchWarehouses()}>
                Retry
              </Button>
            </div>
          ) : null}
        </motion.div>
      );
    }

    if (isWarehousesError) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 border border-dashed border-danger-500/30 rounded-3xl text-center px-6">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-danger-300 font-mono">{warehousesErrorMessage}</span>
        </motion.div>
      );
    }

    if (filteredWarehouses.length === 0) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 border border-dashed border-default-300 rounded-3xl text-center px-6">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-default-500 font-mono">No_Available_Capacity_Detected</span>
        </motion.div>
      );
    }

    return null;
  };

  const renderWarehouseCard = (warehouse: Warehouse, idx: number) => {
    const color = CATEGORY_COLOR[warehouse.category || "GENERAL"];

    return (
      <motion.div key={warehouse._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04, duration: 0.22 }} whileHover={{ y: -1 }}>
        <Card className="group h-full overflow-hidden rounded-2xl border border-default-200/70 bg-content1/90 shadow-sm transition-all hover:bg-content2/70 hover:border-default-300 dark:border-default-100/20 dark:bg-content1/40">
          <CardBody className="p-6">
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="w-2.5 h-2.5 rounded-full mt-2 shrink-0" style={{ background: color, boxShadow: `0 0 0 4px ${color}22` }} />
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold tracking-tight text-foreground group-hover:text-warning-400 transition-colors truncate">{warehouse.name}</h3>
                  <div className="mt-2 flex items-center gap-2 text-default-400 min-w-0">
                    <FiMapPin size={13} className="text-default-500 shrink-0" />
                    <span className="text-sm truncate">{warehouse.address || "Location not specified"}</span>
                  </div>
                </div>
              </div>
              <Chip size="sm" variant="flat" className="border border-default-200 bg-default-100 px-2 text-[10px] font-bold uppercase tracking-wide" color="warning">
                Available
              </Chip>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5 mb-4">
              <div className="rounded-xl border border-default-200/70 bg-content2/60 p-3">
                <div className="text-[11px] font-semibold text-default-400 mb-1">Category</div>
                <div className="text-sm font-semibold text-foreground">{(warehouse.category || "GENERAL").replace("_", " ")}</div>
              </div>
              <div className="rounded-xl border border-default-200/70 bg-content2/60 p-3">
                <div className="text-[11px] font-semibold text-default-400 mb-1">Rate</div>
                <div className="text-sm font-semibold text-warning-400">
                  {warehouse.storageRatePerUnit ?? "0"} <span className="text-default-400 font-medium">{warehouse.unit || "MT"}</span>
                </div>
              </div>
            </div>

            <div className="mb-4 rounded-xl border border-default-200/70 bg-content2/60 p-3">
              <div className="text-[11px] font-semibold text-default-400 mb-1">Contact</div>
              <div className="text-sm font-semibold text-foreground">{warehouse.contactPhone || "Not available yet"}</div>
              {warehouse.contactPhoneSecondary ? <div className="text-xs text-default-500 mt-1">Alt: {warehouse.contactPhoneSecondary}</div> : null}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                color="warning"
                size="md"
                fullWidth
                isDisabled={!warehouse.contactPhone}
                onPress={() => handleContact(warehouse)}
                className="font-bold tracking-wide text-sm rounded-xl h-11"
                startContent={<FiPhoneCall />}
              >
                Contact
              </Button>
              {isAdmin ? (
                <Button color="default" variant="bordered" size="md" fullWidth isDisabled className="font-bold tracking-wide text-sm rounded-xl h-11">
                  Book Now (Coming Soon)
                </Button>
              ) : null}
            </div>
          </CardBody>
        </Card>
      </motion.div>
    );
  };

  return (
    <section className="w-full min-h-screen p-4 md:p-8 bg-background text-foreground">
      <div className="max-w-[1400px] mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-orange-500 mb-2">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] font-mono">Operations_Terminal</span>
            </motion.div>
            <Title title="Warehouse Contact Directory" />
            <p className="text-sm text-default-400 max-w-xl">
              Contact warehouse operators directly for rental coordination. Booking automation remains visible as coming soon.
            </p>
          </div>
          {canAdd ? (
            <Button
              color="warning"
              className="h-11 px-6 font-black uppercase tracking-widest text-[11px] rounded-xl"
              startContent={<LuPlus size={16} />}
              onPress={() => router.push("/dashboard/warehouses/location")}
            >
              Add Warehouse
            </Button>
          ) : null}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex w-full lg:w-auto overflow-x-auto rounded-xl border border-default-200/70 bg-content1/70 p-1">
            {[
              { key: "map" as const, label: "Map View", icon: <FiMap size={14} /> },
              { key: "cards" as const, label: "Card View", icon: <FiGrid size={14} /> },
            ].map((option) => {
              const isSelected = viewMode === option.key;
              return (
                <Button
                  key={option.key}
                  size="sm"
                  variant={isSelected ? "solid" : "light"}
                  color={isSelected ? "warning" : "default"}
                  className="h-10 px-4 rounded-lg font-black uppercase tracking-widest text-[10px] whitespace-nowrap"
                  startContent={option.icon}
                  onPress={() => setViewMode(option.key)}
                >
                  {option.label}
                </Button>
              );
            })}
          </div>
          <div className="flex items-center justify-between lg:justify-end gap-4">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-default-400 font-mono">Node_Catalog</h2>
            <span className="text-[10px] font-mono text-orange-500/60">{filteredWarehouses.length} Nodes Found</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {viewMode === "map" ? (
            <motion.div
              key="map-view"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="relative overflow-hidden rounded-3xl border border-default-200/70 bg-content1/90 p-4 md:p-6 backdrop-blur-xl dark:border-default-100/20 dark:bg-content1/40"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <FiMapPin size={120} />
              </div>

              <div className="relative z-10 space-y-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {needsCompanySelect ? (
                    <div className="flex-1">
                      <div className="text-[10px] font-black uppercase tracking-widest text-default-400 mb-2 font-mono">Trade Entity</div>
                      <Select
                        variant="bordered"
                        classNames={{
                          base: "max-w-md",
                          trigger: "bg-default-100/60 border-default-200 hover:border-orange-500/50 transition-colors h-12",
                          value: "text-sm font-bold truncate",
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
                  ) : null}

                  <div className="flex-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-default-400 mb-2 font-mono">Strategic Location</div>
                    <Input
                      placeholder="Search city, district, or state"
                      variant="bordered"
                      classNames={{
                        base: "w-full",
                        inputWrapper: "bg-default-100/60 border-default-200 hover:border-orange-500/50 transition-colors h-12",
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
                    <Button color="warning" className="h-12 px-8 font-black uppercase tracking-widest text-xs rounded-xl" isLoading={isSearchingLocation} onPress={handleLocationSearch}>
                      Search
                    </Button>
                    <Button
                      variant="bordered"
                      className="h-12 px-6 border-default-300 hover:bg-default-100 font-black uppercase tracking-widest text-xs rounded-xl"
                      onPress={() => {
                        setLocationQuery("");
                        setSearchPoint(null);
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                <div className="relative h-[min(68vh,620px)] min-h-[420px] w-full overflow-hidden rounded-2xl border border-default-200 bg-content1 shadow-inner">
                  <WarehouseRentMap
                    center={DEFAULT_CENTER}
                    zoom={DEFAULT_ZOOM}
                    searchPoint={searchPoint}
                    warehouses={mapWarehouses}
                    onContact={(item) => handleContact(item)}
                    showBookNow={isAdmin}
                  />
                </div>

                {isLoadingWarehouses || isWarehousesError || filteredWarehouses.length === 0 ? <div>{renderDirectoryState()}</div> : null}
              </div>
            </motion.div>
          ) : (
            <motion.div key="card-view" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-5">
              <AnimatePresence mode="popLayout">
                {renderDirectoryState() || (
                  <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 md:gap-5">
                    {filteredWarehouses.map((warehouse, idx) => renderWarehouseCard(warehouse, idx))}
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
