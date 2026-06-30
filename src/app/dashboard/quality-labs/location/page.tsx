"use client";

import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button, Card, CardBody, CardHeader, Chip, Input, Select, SelectItem, Textarea } from "@nextui-org/react";
import { FiLoader, FiMapPin } from "react-icons/fi";
import AuthContext from "@/context/AuthContext";
import { apiRoutes } from "@/core/api/apiRoutes";
import { getData, patchData } from "@/core/api/apiHandler";
import { extractList } from "@/core/data/queryUtils";
import { showToastMessage } from "@/utils/utils";
import { WarehouseLocationValue } from "@/components/Warehouse/WarehouseLocationPicker";

type FormState = {
  name: string;
  email: string;
  phone: string;
  phoneSecondary: string;
  country: string;
  state: string;
  district: string;
  pincodeEntry: string;
  address: string;
  description: string;
  location: {
    latitude?: number;
    longitude?: number;
    label?: string;
  } | null;
};

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  phoneSecondary: "",
  country: "",
  state: "",
  district: "",
  pincodeEntry: "",
  address: "",
  description: "",
  location: null,
};

type TagSectionProps = {
  label: string;
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder: string;
  masterOptions?: string[];
};

type FieldLabelProps = {
  label: string;
  required?: boolean;
};

function FieldLabel({ label, required }: FieldLabelProps) {
  return (
    <p className="text-[10px] font-black uppercase tracking-widest text-default-500 ml-1 mb-2">
      {label}
      {required ? <span className="text-danger-500 ml-1">*</span> : null}
    </p>
  );
}

const suppressAutoSelectionOnFocus = (event: React.FocusEvent<HTMLInputElement>) => {
  const input = event.currentTarget;
  requestAnimationFrame(() => {
    if (document.activeElement !== input) return;
    const length = input.value.length;
    input.setSelectionRange(length, length);
  });
};

const normalizeTag = (value: string) => String(value || "").trim();

function TagSection({ label, tags, setTags, placeholder, masterOptions = [] }: TagSectionProps) {
  const [draft, setDraft] = useState("");

  const addTag = (raw: string) => {
    const next = normalizeTag(raw);
    if (!next) return;
    if (tags.some((tag) => tag.toLowerCase() === next.toLowerCase())) return;
    setTags([...tags, next]);
    setDraft("");
  };

  const removeTag = (value: string) => {
    setTags(tags.filter((tag) => tag !== value));
  };

  return (
    <div className="space-y-3">
      <FieldLabel label={label} />
      {masterOptions.length ? (
        <Select
          aria-label={`${label} master options`}
          selectionMode="multiple"
          selectedKeys={new Set(tags)}
          onSelectionChange={(keys) => {
            if (keys === "all") return;
            setTags(Array.from(keys as Set<React.Key>).map((k) => String(k)));
          }}
          variant="bordered"
          radius="lg"
          classNames={{
            trigger: `${SELECT_TRIGGER_CLASS} min-h-12`,
          }}
        >
          {masterOptions.map((option) => (
            <SelectItem key={option} textValue={option}>
              {option}
            </SelectItem>
          ))}
        </Select>
      ) : null}
      <div className="flex gap-2">
        <Input
          value={draft}
          onValueChange={setDraft}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addTag(draft);
            }
          }}
          placeholder={placeholder}
          variant="bordered"
          radius="lg"
          classNames={{ inputWrapper: INPUT_WRAPPER_CLASS, input: INPUT_CLASS }}
        />
        <Button color="success" variant="flat" className="font-bold uppercase text-[10px] tracking-widest h-12 px-4" onPress={() => addTag(draft)}>
          Add
        </Button>
      </div>
      {tags.length ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Chip key={tag} variant="flat" color="success" onClose={() => removeTag(tag)}>
              {tag}
            </Chip>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-default-500">No entries yet.</p>
      )}
    </div>
  );
}

const WarehouseLocationPicker = dynamic(() => import("@/components/Warehouse/WarehouseLocationPicker"), {
  ssr: false,
});

const INPUT_WRAPPER_CLASS =
  "bg-content1/50 border-divider shadow-inner h-12 ring-0 outline-none data-[focus=true]:ring-0 data-[focus-visible=true]:ring-0 data-[focus=true]:border-default-400 data-[focus-visible=true]:border-default-400";
const INPUT_CLASS = "text-sm leading-5 focus:outline-none focus:ring-0 focus-visible:outline-none";
const READONLY_WRAPPER_CLASS =
  "bg-content1/40 border-divider shadow-inner h-12 ring-0 outline-none data-[focus=true]:ring-0 data-[focus-visible=true]:ring-0 data-[focus=true]:border-default-400 data-[focus-visible=true]:border-default-400";
const TEXTAREA_WRAPPER_CLASS =
  "bg-content1/50 border-divider shadow-inner ring-0 outline-none data-[focus=true]:ring-0 data-[focus-visible=true]:ring-0 data-[focus=true]:border-default-400 data-[focus-visible=true]:border-default-400";
const TEXTAREA_INPUT_CLASS = "text-sm leading-5 focus:outline-none focus:ring-0 focus-visible:outline-none";
const SELECT_TRIGGER_CLASS =
  "bg-content1/50 border-divider shadow-inner h-12 ring-0 outline-none data-[focus=true]:ring-0 data-[focus-visible=true]:ring-0 data-[focus=true]:border-default-400 data-[focus-visible=true]:border-default-400";

const reverseGeocode = async (latitude: number, longitude: number) => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Reverse geocoding failed");
  const data = await res.json();
  const address = data?.address || {};
  const district = address.city_district || address.state_district || address.county || "";
  const city = address.city || address.town || address.village || address.county || "";
  const state = address.state || address.region || "";
  const country = address.country || "";
  const postcode = String(address.postcode || "").trim();
  const label = [city, state].filter(Boolean).join(", ") || data?.display_name || "Selected location";
  return {
    displayName: data?.display_name || "",
    district,
    state,
    country,
    postcode,
    label,
  };
};

const forwardGeocode = async (query: string) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Forward geocoding failed");
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  return {
    latitude: Number(data[0].lat),
    longitude: Number(data[0].lon),
  };
};

const sanitizeToIndianPincode = (value: string) => String(value || "").replace(/\D/g, "").slice(0, 6);

const toNumberOrNull = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const safeErrorMessage = (error: any) => {
  const responseMessage = String(error?.response?.data?.message || "").trim();
  if (responseMessage && responseMessage.toLowerCase() !== "null") return responseMessage;
  const responseError = String(error?.response?.data?.error || "").trim();
  if (responseError && responseError.toLowerCase() !== "null") return responseError;
  const directMessage = String(error?.message || "").trim();
  if (directMessage && directMessage.toLowerCase() !== "null") return directMessage;
  return "Unable to save lab details.";
};

const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function QualityLabsLocationPage() {
  type SyncOrigin = "map" | "pincode" | "address" | "system" | null;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);
  const roleLower = String(user?.role || "").toLowerCase();
  const isAssociate = roleLower === "associate";
  const isAdminLevel = !isAssociate;

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [labTests, setLabTests] = useState<string[]>([]);
  const [labCertifications, setLabCertifications] = useState<string[]>([]);
  const [labSpecifications, setLabSpecifications] = useState<string[]>([]);
  const [labAcceptedItems, setLabAcceptedItems] = useState<string[]>([]);
  const [labNotes, setLabNotes] = useState("");

  const [pendingLocation, setPendingLocation] = useState<WarehouseLocationValue | null>(null);
  const [pincodeInput, setPincodeInput] = useState("");
  const [locationBusy, setLocationBusy] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [matchWarning, setMatchWarning] = useState<string | null>(null);
  const [pincodeInfo, setPincodeInfo] = useState<string | null>(null);
  const [selectedAssociateCompanyId, setSelectedAssociateCompanyId] = useState("");
  const suppressLinkRef = useRef(false);
  const manualInputRef = useRef(false);
  const skipForwardUntilRef = useRef(0);
  const skipPendingApplyRef = useRef(false);
  const mapSyncOriginRef = useRef<SyncOrigin>(null);
  const pincodeSyncOriginRef = useRef<SyncOrigin>(null);
  const pincodeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const countriesQuery = useQuery({
    queryKey: ["lab-location-countries"],
    queryFn: async () => extractList(await getData(apiRoutes.country.getAll, { page: 1, limit: 400, sort: "name:asc" })),
  });
  const adminAssociateCompaniesQuery = useQuery({
    queryKey: ["lab-location-admin-associate-companies"],
    queryFn: async () => {
      const res: any = await getData(apiRoutes.associateCompany.getAll, { page: 1, limit: 500, sort: "name:asc" });
      const payload = res?.data;
      if (Array.isArray(payload?.data?.data)) return payload.data.data;
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload)) return payload;
      return [];
    },
    enabled: isAdminLevel,
  });
  const certificationsQuery = useQuery({
    queryKey: ["lab-location-certifications-master"],
    queryFn: async () => extractList(await getData(apiRoutes.certification.getAll, { page: 1, limit: 500, sort: "name:asc" })),
  });

  const associateCompanyId = String(user?.associateCompanyId || "").trim();
  const associateCompanyQuery = useQuery({
    queryKey: ["lab-location-associate-company", associateCompanyId],
    queryFn: async () => {
      const res: any = await getData(`${apiRoutes.associateCompany.getAll}/${associateCompanyId}`);
      return res?.data?.data || res?.data || null;
    },
    enabled: isAssociate && Boolean(associateCompanyId),
  });

  useEffect(() => {
    if (!isAssociate) return;
    setSelectedAssociateCompanyId(associateCompanyId);
  }, [associateCompanyId, isAssociate]);

  useEffect(() => {
    if (!associateCompanyQuery.data) return;
    const company: any = associateCompanyQuery.data;
    const pincodeId = String(company?.pincodeEntry?._id || company?.pincodeEntry || "");
    const hasLocation = Number.isFinite(Number(company?.location?.latitude)) && Number.isFinite(Number(company?.location?.longitude));
    setForm((prev) => ({
      ...prev,
      name: prev.name || String(company?.labDisplayName || ""),
      email: prev.email || String(company?.labContactEmail || ""),
      phone: prev.phone || String(company?.labContactPhone || ""),
      phoneSecondary: prev.phoneSecondary || String(company?.labContactPhoneSecondary || ""),
      country: prev.country || String(company?.country?._id || company?.country || ""),
      state: prev.state || String(company?.state?._id || company?.state || ""),
      district: prev.district || String(company?.district?._id || company?.district || ""),
      pincodeEntry: prev.pincodeEntry || String(company?.pincodeEntry?._id || pincodeId),
      address: prev.address || "",
      description: prev.description || "",
      location:
        prev.location || !hasLocation
          ? prev.location
          : {
              latitude: Number(company?.location?.latitude),
              longitude: Number(company?.location?.longitude),
              label: String(company?.location?.label || ""),
            },
    }));

    setPincodeInput(String(company?.pincodeEntry?.pincode || ""));

    if (hasLocation) {
      mapSyncOriginRef.current = "system";
      setPendingLocation({ latitude: Number(company.location.latitude), longitude: Number(company.location.longitude) });
    }
  }, [associateCompanyQuery.data]);
  const countries = useMemo(() => (Array.isArray(countriesQuery.data) ? countriesQuery.data : []), [countriesQuery.data]);
  const adminAssociateCompanies = useMemo(
    () => (Array.isArray(adminAssociateCompaniesQuery.data) ? adminAssociateCompaniesQuery.data : []),
    [adminAssociateCompaniesQuery.data]
  );
  const selectedAdminAssociateCompany = useMemo(
    () =>
      adminAssociateCompanies.find((company: any) => {
        const id = String(company?._id || company?.id || "");
        return id === selectedAssociateCompanyId;
      }) || null,
    [adminAssociateCompanies, selectedAssociateCompanyId]
  );
  const certificationOptions = useMemo(
    () =>
      (Array.isArray(certificationsQuery.data) ? certificationsQuery.data : [])
        .map((row: any) => String(row?.name || "").trim())
        .filter(Boolean),
    [certificationsQuery.data]
  );

  const activeAssociateCompanyId = isAssociate ? associateCompanyId : selectedAssociateCompanyId;
  const adminHasNoCompanies = isAdminLevel && !adminAssociateCompaniesQuery.isLoading && adminAssociateCompanies.length === 0;
  const requiredValid = Boolean(
    form.name.trim() &&
      form.email.trim() &&
      form.phone.trim() &&
      form.phoneSecondary.trim() &&
      activeAssociateCompanyId.trim() &&
      !adminHasNoCompanies
  );

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!activeAssociateCompanyId) {
        throw new Error("Please select an associate company before submitting lab details.");
      }
      const payload: Record<string, any> = {
        country: form.country,
        state: form.state,
        district: form.district,
        pincodeEntry: form.pincodeEntry,
        location: form.location,
        isQualityLabListed: true,
        labDisplayName: form.name.trim(),
        labContactEmail: form.email.trim(),
        labContactPhone: form.phone.trim(),
        labContactPhoneSecondary: form.phoneSecondary.trim(),
        serviceCapabilities: ["QUALITY_TESTING"],
        labTests,
        labCertifications,
        labSpecifications,
        labAcceptedItems,
        labNotes: labNotes.trim(),
      };

      ["country", "state", "district", "pincodeEntry"].forEach((key) => {
        if (!String(payload[key] || "").trim()) delete payload[key];
      });
      if (!payload.location || !Number.isFinite(Number(payload.location?.latitude)) || !Number.isFinite(Number(payload.location?.longitude))) {
        delete payload.location;
      }
      return patchData(`${apiRoutes.associateCompany.getAll}/${activeAssociateCompanyId}`, payload);
    },
    onSuccess: () => {
      const addedName = form.name.trim() || selectedAdminAssociateCompany?.name || "Lab";
      showToastMessage({ type: "success", message: `Quality lab details added: ${addedName}` });
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "qualityLabsLastAdded",
          JSON.stringify({
            name: addedName,
            ts: Date.now(),
          })
        );
      }
      queryClient.invalidateQueries({ queryKey: ["quality-labs-directory"] });
      router.push("/dashboard/quality-labs");
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: safeErrorMessage(error),
      });
    },
  });

  const resolvePincodeAndApply = useCallback(async (
    rawPincode: string,
    options?: { coords?: WarehouseLocationValue | null; addressOverride?: string; silent?: boolean }
  ) => {
    const cleaned = sanitizeToIndianPincode(rawPincode);
    if (cleaned.length !== 6) return false;
    if (!options?.silent) setLocationBusy(true);
    setLocationError(null);
    setMatchWarning(null);
    setPincodeInfo(null);
    try {
      let rows = extractList(
        await getData(apiRoutes.pincodeEntry.getAll, {
          pincode: cleaned,
          page: 1,
          limit: 20,
          sort: "pincode:asc",
        })
      );
      if (!rows.length) {
        rows = extractList(
          await getData(apiRoutes.pincodeEntry.getAll, {
            search: cleaned,
            page: 1,
            limit: 20,
            sort: "pincode:asc",
          })
        );
      }
      if (!rows.length) {
        setForm((prev) => ({ ...prev, country: "", state: "", district: "", pincodeEntry: "" }));
        setMatchWarning("No pincode entry found. Try another pincode or select from map.");
        return false;
      }
      if (rows.length > 1) {
        setPincodeInfo("Multiple offices found for this pincode; first match selected.");
      }
      const selected = rows[0];
      const selectedId = String(selected?._id || "");
      const selectedLat = toNumberOrNull(selected?.latitude);
      const selectedLng = toNumberOrNull(selected?.longitude);
      const resolvedCoords = options?.coords
        ? options.coords
        : selectedLat !== null && selectedLng !== null
          ? { latitude: selectedLat, longitude: selectedLng }
          : null;
      let districtId = "";
      let stateId = "";
      let districtName = "";
      let stateName = "";
      try {
        const divisionId = String(selected?.division?._id || selected?.division || "");
        const divisionRes: any = divisionId ? await getData(`${apiRoutes.division.getAll}/${divisionId}`) : null;
        const divisionData: any = divisionRes?.data?.data || divisionRes?.data || null;
        districtId = String(divisionData?.district?._id || divisionData?.district || "");
        const districtRes: any = districtId ? await getData(`${apiRoutes.district.getAll}/${districtId}`) : null;
        const districtData: any = districtRes?.data?.data || districtRes?.data || null;
        districtName = String(districtData?.name || "");
        stateId = String(districtData?.state?._id || districtData?.state || "");
        const stateRes: any = stateId ? await getData(`${apiRoutes.state.getAll}/${stateId}`) : null;
        const stateData: any = stateRes?.data?.data || stateRes?.data || null;
        stateName = String(stateData?.name || "");
      } catch {
        setPincodeInfo("Pincode matched. Some location details could not be mapped; you can continue or repin.");
      }
      const india = countries.find((row: any) => String(row?.name || "").trim().toLowerCase() === "india");
      const indiaId = String(india?._id || "");
      const countryName = "India";
      const officeName = String(selected?.officename || "").trim();
      const generatedAddress = [officeName, districtName && `${districtName} District`, stateName, cleaned, countryName]
        .filter(Boolean)
        .join(", ");

      setForm((prev) => ({
        ...prev,
        country: indiaId,
        state: stateId,
        district: districtId,
        pincodeEntry: selectedId,
        address: options?.addressOverride || generatedAddress || prev.address,
        location: resolvedCoords
          ? {
              latitude: resolvedCoords.latitude,
              longitude: resolvedCoords.longitude,
              label: prev.location?.label || "Selected location",
            }
          : prev.location,
      }));
      if (resolvedCoords) {
        mapSyncOriginRef.current = "pincode";
        setPendingLocation(resolvedCoords);
      }
      pincodeSyncOriginRef.current = options?.coords ? "map" : "pincode";
      setPincodeInput(cleaned);

      if (options?.coords) {
        setPincodeInfo("Pinned location kept. Pincode mapped.");
      }
      return true;
    } catch {
      setLocationError("Couldn't fully map pincode. You can continue or repin.");
      return false;
    } finally {
      if (!options?.silent) setLocationBusy(false);
    }
  }, [countries]);

  const resolveNearestPincodeFromCoords = useCallback(
    async (coords: WarehouseLocationValue, options?: { addressOverride?: string; silent?: boolean }) => {
      if (!options?.silent) setLocationBusy(true);
      setLocationError(null);
      setMatchWarning(null);
      setPincodeInfo(null);
      try {
        const pagesToScan = [1, 2, 3];
        const responses = await Promise.all(
          pagesToScan.map((page) =>
            getData(apiRoutes.pincodeEntry.getAll, {
              page,
              limit: 200,
              sort: "updatedAt:desc",
            })
          )
        );
        const rows = responses.flatMap((res: any) => extractList(res));
        const withCoords = rows
          .map((row: any) => {
            const lat = toNumberOrNull(row?.latitude);
            const lng = toNumberOrNull(row?.longitude);
            const pin = sanitizeToIndianPincode(String(row?.pincode || ""));
            if (lat === null || lng === null || pin.length !== 6) return null;
            return { lat, lng, pin };
          })
          .filter(Boolean) as Array<{ lat: number; lng: number; pin: string }>;

        if (!withCoords.length) {
          setMatchWarning("Map pin was saved, but no nearby pincode could be auto-resolved. Enter pincode manually.");
          return false;
        }

        let nearest = withCoords[0];
        let nearestDistance = haversineKm(coords.latitude, coords.longitude, nearest.lat, nearest.lng);
        for (let i = 1; i < withCoords.length; i += 1) {
          const candidate = withCoords[i];
          const d = haversineKm(coords.latitude, coords.longitude, candidate.lat, candidate.lng);
          if (d < nearestDistance) {
            nearest = candidate;
            nearestDistance = d;
          }
        }

        const resolved = await resolvePincodeAndApply(nearest.pin, {
          coords,
          addressOverride: options?.addressOverride,
          silent: true,
        });
        if (resolved) {
          setPincodeInfo(`Pincode auto-mapped from nearest location (${nearest.pin}).`);
          return true;
        }

        setMatchWarning("Nearest pincode lookup failed. Enter pincode manually.");
        return false;
      } catch {
        setMatchWarning("Pincode could not be auto-resolved from map. Enter pincode manually.");
        return false;
      } finally {
        if (!options?.silent) setLocationBusy(false);
      }
    },
    [resolvePincodeAndApply]
  );

  const handleLocationApply = async (coords?: WarehouseLocationValue) => {
    const target = coords || pendingLocation;
    if (!target) return;
    setLocationBusy(true);
    setLocationError(null);
    setMatchWarning(null);
    try {
      const details = await reverseGeocode(target.latitude, target.longitude);
      suppressLinkRef.current = true;
      manualInputRef.current = false;
      skipForwardUntilRef.current = Date.now() + 1500;

      setForm((prev) => ({
        ...prev,
        address: details.displayName || prev.address,
        location: {
          latitude: target.latitude,
          longitude: target.longitude,
          label: details.label,
        },
      }));

      const postcode = sanitizeToIndianPincode(details.postcode);
      if (postcode.length === 6) {
        const resolved = await resolvePincodeAndApply(postcode, {
          coords: target,
          addressOverride: details.displayName || "",
          silent: true,
        });
        if (!resolved) {
          const fallbackResolved = await resolveNearestPincodeFromCoords(target, {
            addressOverride: details.displayName || "",
            silent: true,
          });
          if (!fallbackResolved) {
            setMatchWarning("Map location selected, but pincode mapping failed. Enter pincode to complete auto-mapping.");
            pincodeSyncOriginRef.current = "map";
            setPincodeInput(postcode);
          }
        }
      } else {
        const fallbackResolved = await resolveNearestPincodeFromCoords(target, {
          addressOverride: details.displayName || "",
          silent: true,
        });
        if (!fallbackResolved) {
          setMatchWarning("Map location has no resolvable pincode. Enter pincode to complete auto-mapping.");
        }
      }
    } catch {
      suppressLinkRef.current = true;
      manualInputRef.current = false;
      skipForwardUntilRef.current = Date.now() + 1500;
      setForm((prev) => ({
        ...prev,
        location: {
          latitude: target.latitude,
          longitude: target.longitude,
          label: "Selected location",
        },
      }));
      const fallbackResolved = await resolveNearestPincodeFromCoords(target, { silent: true });
      if (!fallbackResolved) {
        setLocationError("Pinned location kept. Enter pincode manually.");
      } else {
        setPincodeInfo("Pinned location kept. Pincode mapped from nearest location.");
      }
    } finally {
      setLocationBusy(false);
      setTimeout(() => {
        suppressLinkRef.current = false;
      }, 0);
    }
  };

  useEffect(() => {
    if (suppressLinkRef.current) return;
    if (!manualInputRef.current) return;
    if (Date.now() < skipForwardUntilRef.current) return;
    const address = form.address.trim();
    if (!address) {
      setLinkError(null);
      manualInputRef.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const coords = await forwardGeocode(address);
        if (!coords) {
          setLinkError("Address could not be mapped yet. Try adding more detail.");
          return;
        }
        setPendingLocation(coords);
        setForm((prev) => ({
          ...prev,
          location: {
            latitude: coords.latitude,
            longitude: coords.longitude,
            label: prev.location?.label || "Selected location",
          },
        }));
        setLinkError(null);
        skipPendingApplyRef.current = true;
      } catch {
        setLinkError("Unable to sync address to map right now.");
      } finally {
        manualInputRef.current = false;
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [form.address]);

  useEffect(() => {
    if (!isAdminLevel) return;
    if (!selectedAdminAssociateCompany) return;
    const company: any = selectedAdminAssociateCompany;
    const companyPincode = sanitizeToIndianPincode(String(company?.pincodeEntry?.pincode || company?.pincode || ""));
    const hasCoords =
      Number.isFinite(Number(company?.location?.latitude)) &&
      Number.isFinite(Number(company?.location?.longitude));
    const nextCoords = hasCoords
      ? {
          latitude: Number(company.location.latitude),
          longitude: Number(company.location.longitude),
        }
      : null;

    // Treat selection-based prefill as system-origin so sync effects don't loop.
    mapSyncOriginRef.current = "system";
    pincodeSyncOriginRef.current = "system";

    setLocationError(null);
    setMatchWarning(null);
    setPincodeInfo(null);

    setForm((prev) => ({
      ...prev,
      name: String(company?.labDisplayName || ""),
      email: String(company?.labContactEmail || ""),
      phone: String(company?.labContactPhone || ""),
      phoneSecondary: String(company?.labContactPhoneSecondary || ""),
      address: "",
      country: String(company?.country?._id || company?.country || ""),
      state: String(company?.state?._id || company?.state || ""),
      district: String(company?.district?._id || company?.district || ""),
      pincodeEntry: companyPincode.length === 6 ? String(company?.pincodeEntry?._id || company?.pincodeEntry || "") : "",
      location: nextCoords
        ? {
            latitude: nextCoords.latitude,
            longitude: nextCoords.longitude,
            label: String(company?.location?.label || prev.location?.label || "Selected location"),
          }
        : null,
    }));
    setPincodeInput(companyPincode.length === 6 ? companyPincode : "");
    setPendingLocation(nextCoords);
  }, [isAdminLevel, selectedAdminAssociateCompany]);

  useEffect(() => {
    if (!pendingLocation) return;
    if (mapSyncOriginRef.current === "pincode" || mapSyncOriginRef.current === "system") {
      mapSyncOriginRef.current = null;
      return;
    }
    if (skipPendingApplyRef.current) {
      skipPendingApplyRef.current = false;
      return;
    }
    handleLocationApply(pendingLocation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingLocation]);

  useEffect(() => {
    if (pincodeSyncOriginRef.current === "map" || pincodeSyncOriginRef.current === "system") {
      pincodeSyncOriginRef.current = null;
      return;
    }
    const cleaned = String(pincodeInput || "").replace(/\D/g, "").slice(0, 6);
    if (pincodeDebounceRef.current) clearTimeout(pincodeDebounceRef.current);
    if (cleaned.length !== 6) {
      return;
    }
    pincodeSyncOriginRef.current = "pincode";
    pincodeDebounceRef.current = setTimeout(() => {
      resolvePincodeAndApply(cleaned);
    }, 450);
    return () => {
      if (pincodeDebounceRef.current) clearTimeout(pincodeDebounceRef.current);
    };
  }, [pincodeInput, resolvePincodeAndApply]);

  return (
    <section className="w-full min-h-screen p-4 md:p-8 bg-background text-foreground">
      <div className="max-w-[1280px] mx-auto space-y-6">
        <Card className="border border-default-200/70 bg-content1/90 dark:border-default-100/20 dark:bg-content1/40">
          <CardHeader className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase">Add Quality Lab</h1>
              <p className="text-xs text-default-500 uppercase tracking-widest">Warehouse-style location-first onboarding</p>
            </div>
            <Chip color="success" variant="flat" className="font-black uppercase tracking-wider text-[10px]">
              New Page Flow
            </Chip>
          </CardHeader>
          <CardBody className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-default-400">
                <FiMapPin /> Pin Lab Location
              </div>
              <div className="h-[320px] rounded-2xl overflow-hidden border border-default-200/70">
                <WarehouseLocationPicker
                  value={pendingLocation}
                  onChange={(value) => {
                    mapSyncOriginRef.current = "map";
                    setPendingLocation(value);
                  }}
                  height={320}
                />
              </div>
              {locationBusy ? (
                <div className="flex items-center gap-2 text-xs text-default-500"><FiLoader className="animate-spin" /> Syncing location...</div>
              ) : null}
              {locationError ? <p className="text-xs text-warning-500">{locationError}</p> : null}
              {linkError ? <p className="text-xs text-warning-500">{linkError}</p> : null}
              {matchWarning ? <p className="text-xs text-warning-500">{matchWarning}</p> : null}
              {pincodeInfo ? <p className="text-xs text-success-500">{pincodeInfo}</p> : null}
              <div className="pt-1">
                <Button
                  size="sm"
                  variant="flat"
                  color="warning"
                  className="font-bold uppercase tracking-wider text-[10px]"
                  onPress={() => {
                    setPendingLocation(null);
                    setLocationError(null);
                    setLinkError(null);
                    setMatchWarning(null);
                    setPincodeInfo(null);
                    mapSyncOriginRef.current = null;
                    pincodeSyncOriginRef.current = null;
                    setPincodeInput("");
                    setForm((prev) => ({
                      ...prev,
                      address: "",
                      country: "",
                      state: "",
                      district: "",
                      pincodeEntry: "",
                      location: null,
                    }));
                  }}
                >
                  Reset Location
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FieldLabel label="Associate Company" required />
                {isAssociate ? (
                  <Input
                    variant="bordered"
                    radius="lg"
                    value={String(associateCompanyQuery.data?.name || "")}
                    isReadOnly
                    classNames={{ inputWrapper: READONLY_WRAPPER_CLASS, input: INPUT_CLASS }}
                  />
                ) : (
                  <>
                    <Select
                      variant="bordered"
                      radius="lg"
                      isDisabled={adminAssociateCompaniesQuery.isLoading || adminHasNoCompanies}
                      placeholder={adminAssociateCompaniesQuery.isLoading ? "Loading companies..." : "Select associate company"}
                      selectedKeys={selectedAssociateCompanyId ? new Set([selectedAssociateCompanyId]) : new Set()}
                      onSelectionChange={(keys) => setSelectedAssociateCompanyId(String(Array.from(keys as Set<string>)[0] || ""))}
                      classNames={{
                        trigger: SELECT_TRIGGER_CLASS,
                      }}
                    >
                      {adminAssociateCompanies.length ? (
                        adminAssociateCompanies.map((company: any) => {
                          const id = String(company?._id || company?.id || "");
                          const name = String(company?.name || "Associate Company");
                          const email = String(company?.email || "").trim();
                          return (
                            <SelectItem key={id} textValue={name}>
                              {email ? `${name} (${email})` : name}
                            </SelectItem>
                          );
                        })
                      ) : (
                        <SelectItem key="__no_companies__" isDisabled textValue="No associate companies found">
                          No associate companies found
                        </SelectItem>
                      )}
                    </Select>
                    {adminHasNoCompanies ? (
                      <p className="text-[10px] text-warning-500 ml-1 mt-2">Create/select associate company first.</p>
                    ) : null}
                  </>
                )}
              </div>
              <div>
                <FieldLabel label="Lab Name" required />
                <Input
                  variant="bordered"
                  radius="lg"
                  value={form.name}
                  onValueChange={(v) => setForm((c) => ({ ...c, name: v }))}
                  onFocus={suppressAutoSelectionOnFocus}
                  autoComplete="name"
                  classNames={{ inputWrapper: INPUT_WRAPPER_CLASS, input: INPUT_CLASS }}
                />
              </div>
              <div>
                <FieldLabel label="Lab Email" required />
                <Input
                  variant="bordered"
                  radius="lg"
                  value={form.email}
                  onValueChange={(v) => setForm((c) => ({ ...c, email: v }))}
                  onFocus={suppressAutoSelectionOnFocus}
                  autoComplete="email"
                  classNames={{ inputWrapper: INPUT_WRAPPER_CLASS, input: INPUT_CLASS }}
                />
              </div>
              <div>
                <FieldLabel label="Primary Phone" required />
                <Input
                  variant="bordered"
                  radius="lg"
                  value={form.phone}
                  onValueChange={(v) => setForm((c) => ({ ...c, phone: v }))}
                  onFocus={suppressAutoSelectionOnFocus}
                  autoComplete="tel"
                  classNames={{ inputWrapper: INPUT_WRAPPER_CLASS, input: INPUT_CLASS }}
                />
              </div>
              <div>
                <FieldLabel label="Secondary Phone" required />
                <Input
                  variant="bordered"
                  radius="lg"
                  value={form.phoneSecondary}
                  onValueChange={(v) => setForm((c) => ({ ...c, phoneSecondary: v }))}
                  onFocus={suppressAutoSelectionOnFocus}
                  autoComplete="tel"
                  classNames={{ inputWrapper: INPUT_WRAPPER_CLASS, input: INPUT_CLASS }}
                />
              </div>
              <div>
                <FieldLabel label="Address" />
                <Input
                  variant="bordered"
                  radius="lg"
                  value={form.address}
                  onValueChange={(v) => {
                    manualInputRef.current = true;
                    setForm((c) => ({ ...c, address: v }));
                  }}
                  onFocus={suppressAutoSelectionOnFocus}
                  autoComplete="street-address"
                  classNames={{ inputWrapper: INPUT_WRAPPER_CLASS, input: INPUT_CLASS }}
                />
              </div>
              <div>
                <FieldLabel label="Pincode Entry" />
                <Input
                  variant="bordered"
                  radius="lg"
                  value={pincodeInput}
                  onValueChange={(v) => setPincodeInput(String(v || "").replace(/\D/g, "").slice(0, 6))}
                  onFocus={suppressAutoSelectionOnFocus}
                  autoComplete="postal-code"
                  description="Enter pincode or select location from map."
                  classNames={{
                    inputWrapper: INPUT_WRAPPER_CLASS,
                    input: INPUT_CLASS,
                    description: "text-[10px] text-default-500",
                  }}
                />
              </div>
            </div>

            <TagSection label="Lab Tests" tags={labTests} setTags={setLabTests} placeholder="Add custom lab test" />
            <TagSection
              label="Certifications"
              tags={labCertifications}
              setTags={setLabCertifications}
              placeholder="Add custom certification"
              masterOptions={certificationOptions}
            />
            <TagSection label="Specifications" tags={labSpecifications} setTags={setLabSpecifications} placeholder="Add custom specification" />
            <TagSection label="Accepted Items" tags={labAcceptedItems} setTags={setLabAcceptedItems} placeholder="Add accepted item category" />

            <div>
              <FieldLabel label="Lab Notes" />
              <Textarea
                variant="bordered"
                minRows={3}
                value={labNotes}
                onValueChange={setLabNotes}
                placeholder="Add lab operational notes, constraints, sample handling preferences, or timelines."
                classNames={{
                  inputWrapper: TEXTAREA_WRAPPER_CLASS,
                  input: TEXTAREA_INPUT_CLASS,
                }}
              />
            </div>
            <div>
              <FieldLabel label="Public Summary" />
              <Textarea
                variant="bordered"
                minRows={2}
                value={form.description}
                onValueChange={(v) => setForm((c) => ({ ...c, description: v }))}
                placeholder="Optional short summary used in card previews."
                classNames={{
                  inputWrapper: TEXTAREA_WRAPPER_CLASS,
                  input: TEXTAREA_INPUT_CLASS,
                }}
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              {!requiredValid ? (
                <p className="mr-auto text-[10px] text-warning-500">
                  Fill required fields: company, lab display name, lab email, primary and secondary lab phone.
                </p>
              ) : null}
              <Button variant="light" onPress={() => router.push("/dashboard/quality-labs")} className="font-black uppercase text-[10px] tracking-widest h-10 px-8">
                Cancel
              </Button>
              <Button
                color="success"
                isLoading={createMutation.isPending}
                isDisabled={!requiredValid}
                onPress={() => {
                  if (!activeAssociateCompanyId) {
                    showToastMessage({ type: "error", message: "Please select an associate company before saving lab details." });
                    return;
                  }
                  createMutation.mutate();
                }}
                className="font-black uppercase text-[10px] tracking-widest h-10 px-8"
              >
                Save Lab Details
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </section>
  );
}
