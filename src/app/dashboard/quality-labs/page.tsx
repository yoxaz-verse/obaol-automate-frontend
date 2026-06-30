"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, CardBody, Chip, Input } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import Title from "@/components/titles";
import AuthContext from "@/context/AuthContext";
import { getData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { showToastMessage } from "@/utils/utils";
import { FiGrid, FiLoader, FiMap, FiMapPin, FiPhoneCall, FiSearch } from "react-icons/fi";
import { LuPlus } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import type { QualityLabMapItem } from "@/components/Labs/QualityLabsMap";

const QualityLabsMap = dynamic(() => import("@/components/Labs/QualityLabsMap"), {
  ssr: false,
});

type PincodeEntry = {
  latitude?: number;
  longitude?: number;
  pincode?: string;
  officename?: string;
};

type AssociateCompany = {
  _id: string;
  name?: string;
  phone?: string;
  phoneSecondary?: string;
  isQualityLabListed?: boolean;
  labDisplayName?: string;
  labContactEmail?: string;
  labContactPhone?: string;
  labContactPhoneSecondary?: string;
  address?: string;
  description?: string;
  aboutUs?: string;
  serviceCapabilities?: string[];
  labTests?: string[];
  labCertifications?: string[];
  labSpecifications?: string[];
  labAcceptedItems?: string[];
  labNotes?: string;
  labListingState?: string;
  isExternalDirectoryListing?: boolean;
  externalListingSource?: "SPICES_BOARD_QEL" | "SPICES_BOARD_EMPANELLED" | "";
  externalListingSourceUrl?: string;
  externalListingReference?: string;
  externalListingDate?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    label?: string;
  } | null;
  pincodeEntry?: PincodeEntry | null;
};

type ApiListResponse<T> = {
  data?: {
    data?:
      | T[]
      | {
          data?: T[];
          totalCount?: number;
          currentPage?: number;
          totalPages?: number;
        };
  } | T[];
};

const toArrayData = <T,>(response: ApiListResponse<T> | null | undefined): T[] => {
  const root = response?.data;
  if (Array.isArray(root)) return root;
  const level1 = root && typeof root === "object" ? (root as any).data : null;
  if (Array.isArray(level1)) return level1;
  const level2 = level1 && typeof level1 === "object" ? (level1 as any).data : null;
  if (Array.isArray(level2)) return level2;
  return [];
};

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;
const SEARCH_RADIUS_KM = 100;

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

const normalizeDialPhone = (value: string) => String(value || "").trim().replace(/[\s()-]/g, "");

const getLabCoords = (lab: AssociateCompany) => {
  const primaryLat = Number(lab?.location?.latitude);
  const primaryLng = Number(lab?.location?.longitude);
  const fallbackLat = Number(lab?.pincodeEntry?.latitude);
  const fallbackLng = Number(lab?.pincodeEntry?.longitude);
  const lat = Number.isFinite(primaryLat) ? primaryLat : fallbackLat;
  const lng = Number.isFinite(primaryLng) ? primaryLng : fallbackLng;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { latitude: lat, longitude: lng };
};

const isListedLab = (row: AssociateCompany) =>
  row?.isQualityLabListed === true &&
  String(row?.labListingState || "LIVE").toUpperCase() === "LIVE" &&
  Boolean(getLabCoords(row));

const getCertificatesSummary = (company: AssociateCompany) => {
  const certs = Array.isArray(company?.labCertifications) ? company.labCertifications.map((v) => String(v || "").trim()).filter(Boolean) : [];
  const tests = Array.isArray(company?.labTests) ? company.labTests.map((v) => String(v || "").trim()).filter(Boolean) : [];
  const specs = Array.isArray(company?.labSpecifications) ? company.labSpecifications.map((v) => String(v || "").trim()).filter(Boolean) : [];
  const accepted = Array.isArray(company?.labAcceptedItems) ? company.labAcceptedItems.map((v) => String(v || "").trim()).filter(Boolean) : [];
  const structured = [...certs, ...tests, ...specs, ...accepted].slice(0, 4).join(", ");
  if (structured) return structured;
  const notes = String(company?.labNotes || "").trim();
  if (notes) return notes;
  return "";
};

const getSourceLabel = (lab: AssociateCompany) => {
  if (lab.externalListingSource === "SPICES_BOARD_QEL") return "Spices Board QEL";
  if (lab.externalListingSource === "SPICES_BOARD_EMPANELLED") return "Spices Board Empanelled";
  return "Quality Lab";
};

const getSourceChipColor = (lab: AssociateCompany): "success" | "primary" | "default" => {
  if (lab.externalListingSource === "SPICES_BOARD_QEL") return "primary";
  if (lab.externalListingSource === "SPICES_BOARD_EMPANELLED") return "success";
  return "default";
};

const toErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error !== "object" || error === null) return fallback;
  const maybeResponse = (error as { response?: { data?: { message?: string } } }).response;
  return maybeResponse?.data?.message || fallback;
};

export default function QualityLabsPage() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const roleLower = String(user?.role || "").toLowerCase();
  const canAddLabDetails = roleLower === "admin" || roleLower === "associate";
  const [locationQuery, setLocationQuery] = useState("");
  const [searchPoint, setSearchPoint] = useState<SearchPoint | null>(null);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [postCreateFlash, setPostCreateFlash] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("map");

  const {
    data: labsData,
    isLoading: isLoadingLabs,
    isError: isLabsError,
    error: labsError,
    refetch: refetchLabs,
  } = useQuery({
    queryKey: ["quality-labs-directory", roleLower],
    queryFn: async () => {
      const res: any = await getData(apiRoutes.associateCompany.labsDirectory, {
        page: 1,
        limit: 100,
      });
      return toArrayData<AssociateCompany>(res);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
  const labs = useMemo(() => {
    const rows = Array.isArray(labsData) ? labsData : [];
    return rows.filter((row) => isListedLab(row));
  }, [labsData]);
  const totalRowsFromApi = Array.isArray(labsData) ? labsData.length : 0;
  const listedByFlagCount = useMemo(() => {
    const rows = Array.isArray(labsData) ? labsData : [];
    return rows.filter((row) => row?.isQualityLabListed === true).length;
  }, [labsData]);
  const filteredByListingFlagCount = Math.max(0, totalRowsFromApi - listedByFlagCount);
  const missingCoordsCount = Math.max(0, listedByFlagCount - labs.length);

  const mappableLabs = useMemo(() => {
    return labs.filter((lab) => Boolean(getLabCoords(lab)));
  }, [labs]);

  const filteredMappableLabs = useMemo(() => {
    if (!searchPoint) return mappableLabs;
    return mappableLabs.filter((lab) => {
      const coords = getLabCoords(lab);
      if (!coords) return false;
      const distance = haversineKm(searchPoint.latitude, searchPoint.longitude, coords.latitude, coords.longitude);
      return distance <= SEARCH_RADIUS_KM;
    });
  }, [mappableLabs, searchPoint]);

  const allowedLabIds = useMemo(() => new Set(filteredMappableLabs.map((lab) => String(lab._id))), [filteredMappableLabs]);

  const filteredLabs = useMemo(() => {
    if (!searchPoint) return labs;
    return labs.filter((lab) => allowedLabIds.has(String(lab._id)));
  }, [labs, searchPoint, allowedLabIds]);

  const mapLabs: QualityLabMapItem[] = useMemo(
    () =>
      filteredMappableLabs
        .map((lab) => {
          const coords = getLabCoords(lab);
          if (!coords) return null;
          return {
            _id: String(lab._id || ""),
            name: String(lab.labDisplayName || "").trim() || "Unnamed Lab",
            contactPhone: lab.labContactPhone,
            contactPhoneSecondary: lab.labContactPhoneSecondary,
            certificatesSummary: getCertificatesSummary(lab),
            location: coords,
          };
        })
        .filter(Boolean) as QualityLabMapItem[],
    [filteredMappableLabs]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("qualityLabsLastAdded");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { name?: string; ts?: number };
      const name = String(parsed?.name || "").trim();
      const ts = Number(parsed?.ts || 0);
      const isFresh = Number.isFinite(ts) && Date.now() - ts <= 2 * 60 * 1000;
      if (name && isFresh) {
        setPostCreateFlash(`Added successfully: ${name}`);
      }
    } catch {
      // no-op
    } finally {
      window.localStorage.removeItem("qualityLabsLastAdded");
    }
  }, []);

  const geocodeLocation = async (query: string): Promise<SearchPoint | null> => {
    const q = String(query || "").trim();
    if (!q) return null;
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
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

  const handleContact = (lab: { name: string; contactPhone?: string }) => {
    const phone = String(lab.contactPhone || "").trim();
    if (!phone) {
      showToastMessage({ type: "warning", message: "Contact number is not available for this lab yet." });
      return;
    }
    const dialPhone = normalizeDialPhone(phone);
    if (typeof window !== "undefined") {
      window.location.href = `tel:${dialPhone}`;
    }
    showToastMessage({ type: "success", message: `Calling ${lab.name}: ${phone}` });
  };

  const labsErrorMessage = toErrorMessage(labsError, "Unable to load quality labs directory right now.");
  const [isLabsLoadSlow, setIsLabsLoadSlow] = useState(false);

  useEffect(() => {
    if (!isLoadingLabs) {
      setIsLabsLoadSlow(false);
      return;
    }
    const t = window.setTimeout(() => setIsLabsLoadSlow(true), 3500);
    return () => window.clearTimeout(t);
  }, [isLoadingLabs]);

  const renderDirectoryState = () => {
    if (isLoadingLabs) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 border border-dashed border-default-300 rounded-3xl">
          <FiLoader className="animate-spin text-success-500 mb-4" size={24} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-default-500 font-mono">Initializing_Labs...</span>
          {isLabsLoadSlow ? (
            <div className="mt-4 flex flex-col items-center gap-3">
              <span className="text-[11px] text-default-400">Still loading. You can retry now.</span>
              <Button size="sm" color="success" variant="flat" onPress={() => refetchLabs()}>
                Retry
              </Button>
            </div>
          ) : null}
        </motion.div>
      );
    }

    if (isLabsError) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 border border-dashed border-danger-500/30 rounded-3xl text-center px-6">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-danger-300 font-mono">{labsErrorMessage}</span>
        </motion.div>
      );
    }

    if (filteredLabs.length === 0) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 border border-dashed border-default-300 rounded-3xl text-center px-6">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-default-500 font-mono">No_Quality_Labs_Detected</span>
          <div className="text-[11px] text-default-500 mt-3 space-y-1">
            <div>{totalRowsFromApi} total row(s) fetched.</div>
            <div>{filteredByListingFlagCount} row(s) filtered by `isQualityLabListed`.</div>
            <div>{missingCoordsCount} listed row(s) missing valid coordinates.</div>
          </div>
        </motion.div>
      );
    }

    return null;
  };

  const renderLabCard = (lab: AssociateCompany, idx: number) => {
    const certificatesSummary = getCertificatesSummary(lab);
    const hasCertificatesSummary = Boolean(String(certificatesSummary || "").trim());
    const labPhone = String(lab.labContactPhone || "").trim();
    const sourceLabel = getSourceLabel(lab);

    return (
      <motion.div key={lab._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04, duration: 0.22 }} whileHover={{ y: -1 }}>
        <Card className="group h-full overflow-hidden rounded-2xl border border-default-200/70 bg-content1/90 shadow-sm transition-all hover:bg-content2/70 hover:border-default-300 dark:border-default-100/20 dark:bg-content1/40">
          <CardBody className="p-6">
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="w-2.5 h-2.5 rounded-full mt-2 shrink-0 bg-success-500 shadow-[0_0_0_4px_rgba(34,197,94,0.15)]" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold tracking-tight text-foreground group-hover:text-success-400 transition-colors truncate">
                    {String(lab.labDisplayName || "").trim() || "Unnamed Lab"}
                  </h3>
                  <div className="mt-2 flex items-center gap-2 text-default-400 min-w-0">
                    <FiMapPin size={13} className="text-default-500 shrink-0" />
                    <span className="text-sm truncate">{lab.address || lab?.pincodeEntry?.officename || "Location not specified"}</span>
                  </div>
                </div>
              </div>
              <Chip size="sm" variant="flat" className="border border-default-200 bg-default-100 px-2 text-[10px] font-bold uppercase tracking-wide" color={getSourceChipColor(lab)}>
                {sourceLabel}
              </Chip>
            </div>

            {hasCertificatesSummary ? (
              <div className="mt-4 rounded-xl border border-default-200/70 bg-content2/60 p-3">
                <div className="text-[11px] font-semibold text-default-400 mb-1">Certificates / Services</div>
                <div className="text-sm text-default-200 line-clamp-3">{certificatesSummary}</div>
              </div>
            ) : null}

            <div className="mt-4 rounded-xl border border-default-200/70 bg-content2/60 p-3">
              <div className="text-[11px] font-semibold text-default-400 mb-1">Contact</div>
              <div className="text-sm font-semibold text-foreground">{labPhone || "Contact not available from source"}</div>
              {lab.labContactPhoneSecondary ? <div className="text-xs text-default-500 mt-1">Alt: {lab.labContactPhoneSecondary}</div> : null}
              {lab.labContactEmail ? <div className="text-xs text-default-500 mt-1 break-all">{lab.labContactEmail}</div> : null}
              {lab.externalListingReference ? <div className="text-[10px] uppercase tracking-wider text-default-500 mt-2">{lab.externalListingReference}</div> : null}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
              <Button
                color="success"
                size="md"
                fullWidth
                isDisabled={!labPhone}
                onPress={() =>
                  handleContact({
                    name: String(lab.labDisplayName || "").trim() || "Lab",
                    contactPhone: labPhone,
                  })
                }
                className="font-bold tracking-wide text-sm rounded-xl h-11"
                startContent={<FiPhoneCall />}
              >
                Contact
              </Button>
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
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-success-500 mb-2">
              <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] font-mono">Quality_Network</span>
            </motion.div>
            <Title title="Quality Testing Labs" />
            <p className="text-sm text-default-400 max-w-xl">
              Discover quality testing labs, review certificates/services, and directly contact labs for immediate coordination.
            </p>
            {postCreateFlash ? <p className="text-xs text-success-500 font-semibold">{postCreateFlash}</p> : null}
          </div>
          {canAddLabDetails ? (
            <Button
              color="success"
              className="h-11 px-6 font-black uppercase tracking-widest text-[11px] rounded-xl"
              startContent={<LuPlus size={16} />}
              onPress={() => router.push("/dashboard/quality-labs/location")}
            >
              Add Lab Details
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
                  color={isSelected ? "success" : "default"}
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
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-default-400 font-mono">Lab_Catalog</h2>
            <span className="text-[10px] font-mono text-success-500/70">{filteredLabs.length} Labs Found</span>
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
                  <div className="flex-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-default-400 mb-2 font-mono">Strategic Location</div>
                    <Input
                      placeholder="Search city, district, or state"
                      variant="bordered"
                      classNames={{
                        base: "w-full",
                        inputWrapper: "bg-default-100/60 border-default-200 hover:border-success-500/50 transition-colors h-12",
                        input: "text-sm",
                      }}
                      value={locationQuery}
                      onValueChange={setLocationQuery}
                      startContent={<FiSearch className="text-success-500" />}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleLocationSearch();
                        }
                      }}
                    />
                  </div>

                  <div className="flex items-end gap-2 pb-[1px]">
                    <Button color="success" className="h-12 px-8 font-black uppercase tracking-widest text-xs rounded-xl" isLoading={isSearchingLocation} onPress={handleLocationSearch}>
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
                  <QualityLabsMap center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} searchPoint={searchPoint} labs={mapLabs} onContact={(item) => handleContact(item)} />
                </div>

                {isLoadingLabs || isLabsError || filteredLabs.length === 0 ? <div>{renderDirectoryState()}</div> : null}
              </div>
            </motion.div>
          ) : (
            <motion.div key="card-view" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-5">
              <AnimatePresence mode="popLayout">
                {renderDirectoryState() || (
                  <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 md:gap-5">
                    {filteredLabs.map((lab, idx) => renderLabCard(lab, idx))}
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
