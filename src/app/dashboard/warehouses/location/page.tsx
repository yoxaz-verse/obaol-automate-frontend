"use client";

import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Input,
  Select,
  SelectItem,
  Switch,
  Textarea,
} from "@nextui-org/react";
import Title from "@/components/titles";
import { getData, postData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { showToastMessage } from "@/utils/utils";
import { WarehouseLocationValue } from "@/components/Warehouse/WarehouseLocationPicker";
import { FiMapPin, FiLoader } from "react-icons/fi";
import { LuWarehouse } from "react-icons/lu";
import AuthContext from "@/context/AuthContext";

type WarehouseForm = {
  name: string;
  address: string;
  pincode: string;
  totalCapacity: number;
  ownerCompanyId: string;
  category: "GENERAL" | "COLD_STORAGE" | "BONDED" | "AGRO";
  allowedCategoryIds: string[];
  storageRatePerUnit: number;
  isActive: boolean;
  listingType: "PRIVATE" | "RENTAL";
  isRentalActive: boolean;
  location: {
    latitude?: number;
    longitude?: number;
    label?: string;
    district?: string;
    pincode?: string;
    city?: string;
    state?: string;
    country?: string;
  } | null;
};

const EMPTY_FORM: WarehouseForm = {
  name: "",
  address: "",
  pincode: "",
  totalCapacity: 0,
  ownerCompanyId: "",
  category: "GENERAL",
  allowedCategoryIds: [],
  storageRatePerUnit: 0,
  isActive: true,
  listingType: "PRIVATE",
  isRentalActive: false,
  location: null,
};

const WarehouseLocationPicker = dynamic(
  () => import("@/components/Warehouse/WarehouseLocationPicker"),
  { ssr: false }
);

const reverseGeocode = async (latitude: number, longitude: number) => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Reverse geocoding failed");
  const data = await res.json();
  const address = data?.address || {};
  const district =
    address.city_district ||
    address.state_district ||
    address.county ||
    "";
  const city =
    address.city ||
    address.town ||
    address.village ||
    address.county ||
    address.state_district ||
    "";
  const state = address.state || address.region || "";
  const country = address.country || "";
  const pincode = String(address.postcode || "").trim();
  const label = [city, state].filter(Boolean).join(", ") || data?.display_name || "Selected location";
  return {
    displayName: data?.display_name || "",
    district,
    pincode,
    city,
    state,
    country,
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

export default function WarehouseLocationPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);
  const roleLower = String(user?.role || "").toLowerCase();
  const isAdmin = roleLower === "admin";
  const [form, setForm] = useState<WarehouseForm>(EMPTY_FORM);
  const [pendingLocation, setPendingLocation] = useState<WarehouseLocationValue | null>(null);
  const [locationBusy, setLocationBusy] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const suppressLinkRef = useRef(false);
  const manualInputRef = useRef(false);
  const skipForwardUntilRef = useRef(0);
  const skipPendingApplyRef = useRef(false);

  const { data: categoriesData } = useQuery({
    queryKey: ["warehouse-categories"],
    queryFn: async () => {
      const res: any = await getData(apiRoutes.category.getAll, { page: 1, limit: 500 });
      const raw = res?.data?.data;
      if (Array.isArray(raw?.data)) return raw.data;
      if (Array.isArray(raw)) return raw;
      if (Array.isArray(res?.data)) return res.data;
      return [];
    },
  });

  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const { data: associateCompaniesData } = useQuery({
    queryKey: ["associate-companies"],
    queryFn: async () => {
      const res: any = await getData(apiRoutes.associateCompany.getAll, { limit: 500 });
      const raw = res?.data?.data;
      if (Array.isArray(raw?.data)) return raw.data;
      if (Array.isArray(raw)) return raw;
      if (Array.isArray(res?.data)) return res.data;
      return [];
    },
    enabled: isAdmin,
  });

  const associateCompanies = Array.isArray(associateCompaniesData) ? associateCompaniesData : [];

  const createMutation = useMutation({
    mutationFn: (payload: WarehouseForm) => {
      const cleaned = {
        ...payload,
        ownerCompanyId: payload.ownerCompanyId || undefined,
      };
      return postData(apiRoutes.warehouses.create, cleaned);
    },
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Warehouse created successfully!" });
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      router.push("/dashboard/warehouses");
    },
    onError: () => showToastMessage({ type: "error", message: "Failed to create warehouse." }),
  });

  const handleLocationApply = async (coords?: WarehouseLocationValue) => {
    const target = coords || pendingLocation;
    if (!target) return;
    setLocationBusy(true);
    setLocationError(null);
    try {
      const details = await reverseGeocode(target.latitude, target.longitude);
      suppressLinkRef.current = true;
      manualInputRef.current = false;
      skipForwardUntilRef.current = Date.now() + 1500;
      setForm((prev) => ({
        ...prev,
        address: details.displayName || prev.address,
        pincode: details.pincode || prev.pincode,
        location: {
          latitude: target.latitude,
          longitude: target.longitude,
          label: details.label,
          district: details.district,
          pincode: details.pincode,
          city: details.city,
          state: details.state,
          country: details.country,
        },
      }));
    } catch (error) {
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
      setLocationError("Unable to resolve the exact address. Location saved with coordinates.");
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
    const pincode = form.pincode.trim();
    if (!address && !pincode) {
      setLinkError(null);
      manualInputRef.current = false;
      return;
    }
    const timer = setTimeout(async () => {
      const query = pincode ? `${pincode}, India` : address;
      try {
        const coords = await forwardGeocode(query);
        if (!coords) {
          setLinkError("Unable to locate — check pincode/address.");
          manualInputRef.current = false;
          return;
        }
        skipPendingApplyRef.current = true;
        setPendingLocation(coords);
        const details = await reverseGeocode(coords.latitude, coords.longitude);
        suppressLinkRef.current = true;
        skipForwardUntilRef.current = Date.now() + 1500;
        setForm((prev) => ({
          ...prev,
          address: details.displayName || prev.address,
          pincode: prev.pincode || details.pincode || "",
          location: {
            latitude: coords.latitude,
            longitude: coords.longitude,
            label: details.label,
            district: details.district,
            pincode: details.pincode,
            city: details.city,
            state: details.state,
            country: details.country,
          },
        }));
        setLinkError(null);
      } catch (err) {
        setLinkError("Unable to locate — check pincode/address.");
      } finally {
        manualInputRef.current = false;
        setTimeout(() => {
          suppressLinkRef.current = false;
        }, 0);
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [form.address, form.pincode]);

  useEffect(() => {
    if (!pendingLocation) return;
    if (suppressLinkRef.current) return;
    if (skipPendingApplyRef.current) {
      skipPendingApplyRef.current = false;
      return;
    }
    const timer = setTimeout(() => {
      handleLocationApply(pendingLocation);
    }, 300);
    return () => clearTimeout(timer);
  }, [pendingLocation]);

  const locationLabel = useMemo(() => {
    if (!form.location) return "";
    return form.location.label || "Selected location";
  }, [form.location]);

  return (
    <>
      <section className="w-full min-h-screen p-6 md:p-10 bg-[#04070f] text-white dark">
      <div className="flex items-center justify-between mb-10 gap-4 flex-wrap">
        <Title title="Warehouse Location" />
        <Button 
          variant="flat" 
          className="bg-white/5 text-white font-bold uppercase tracking-widest text-[10px] rounded-xl px-6 h-10 border border-white/10"
          onPress={() => router.push("/dashboard/warehouses")}
        >
          Back to Asset Registry
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6">
        <Card className="border border-white/10 bg-[#04070f] rounded-[2.5rem] shadow-2xl overflow-hidden">
          <CardHeader className="p-8 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-1 h-3 bg-warning-500 rounded-full" />
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">Pin Warehouse Location</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-default-400 mt-1">
                  Global Coordinate Synchronization
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="px-6 pb-6 space-y-4">
            {form.location && (
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex flex-wrap gap-x-2 gap-y-1">
                <span className="text-warning-500">Detected Node:</span> {locationLabel}
                {form.location.district && <><span className="text-white/10">•</span> {form.location.district}</>}
                {form.location.pincode && <><span className="text-white/10">•</span> {form.location.pincode}</>}
                {form.location.city && <><span className="text-white/10">•</span> {form.location.city}</>}
                {form.location.state && <><span className="text-white/10">•</span> {form.location.state}</>}
              </div>
            )}
            <div className="rounded-[2rem] overflow-hidden border border-white/10 shadow-lg shadow-warning-500/5 warehouse-location-map">
              <WarehouseLocationPicker value={pendingLocation} onChange={setPendingLocation} height={460} />
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {pendingLocation && (
                <span className="text-xs text-default-500">
                  Selected: {pendingLocation.latitude.toFixed(5)}, {pendingLocation.longitude.toFixed(5)}
                </span>
              )}
              {locationError && <span className="text-xs text-danger-400">{locationError}</span>}
            </div>
            {linkError && (
              <div className="text-xs text-danger-400">{linkError}</div>
            )}
          </CardBody>
        </Card>

        <Card className="border border-white/10 bg-[#04070f] rounded-[2.5rem] shadow-2xl overflow-hidden">
          <CardHeader className="p-8 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-1 h-3 bg-primary-500 rounded-full" />
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">Warehouse Parameters</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-default-400 mt-1">Entity Asset Configuration</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="px-6 pb-6 space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-default-400 px-1">Warehouse Profile</label>
              <Input
                label="Full Commercial Name"
                variant="flat"
                placeholder="e.g. OBAOL CORE CHENNAI"
                value={form.name}
                onValueChange={(v) => setForm((f) => ({ ...f, name: v }))}
                classNames={{
                  inputWrapper: "bg-white/5 border border-white/10 h-14 rounded-2xl hover:bg-white/10 transition-colors",
                  label: "text-default-400 font-medium",
                  input: "text-white font-bold uppercase text-sm"
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-default-400 px-1">Operational Category</label>
              <Select
                label="Classification"
                variant="flat"
                selectedKeys={[form.category]}
                onSelectionChange={(keys) => setForm((f) => ({ ...f, category: Array.from(keys)[0] as any }))}
                classNames={{
                  trigger: "bg-white/5 border border-white/10 h-14 rounded-2xl hover:bg-white/10 transition-colors",
                  label: "text-default-400 font-medium",
                  value: "text-white font-bold uppercase text-xs",
                  popoverMain: "bg-[#0a0f1d] border border-white/10 rounded-2xl",
                }}
                popoverProps={{ shouldCloseOnBlur: false }}
              >
                <SelectItem key="GENERAL" className="text-white">General Logistic Node</SelectItem>
                <SelectItem key="COLD_STORAGE" className="text-white">Cold Chain Facility</SelectItem>
                <SelectItem key="BONDED" className="text-white">Bonded Secure Node</SelectItem>
                <SelectItem key="AGRO" className="text-white">Agricultural Asset</SelectItem>
              </Select>
            </div>
            {isAdmin && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-default-400 px-1">Management Entity</label>
                <Select
                  label="Associate Company"
                  variant="flat"
                  selectedKeys={form.ownerCompanyId ? [form.ownerCompanyId] : []}
                  onSelectionChange={(keys) =>
                    setForm((f) => ({ ...f, ownerCompanyId: String(Array.from(keys)[0] || "") }))
                  }
                  classNames={{
                    trigger: "bg-white/5 border border-white/10 h-14 rounded-2xl hover:bg-white/10 transition-colors",
                    label: "text-default-400 font-medium",
                    value: "text-white font-bold uppercase text-xs",
                    popoverMain: "bg-[#0a0f1d] border border-white/10 rounded-2xl",
                  }}
                  popoverProps={{ shouldCloseOnBlur: false }}
                  placeholder={associateCompanies.length ? "Select associate company" : "No companies available"}
                >
                  {associateCompanies.map((company: any) => (
                    <SelectItem key={company._id} className="text-white">
                      {company.name || company.companyName || "Company"}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-default-400 px-1">Logistics Permissions</label>
              <Select
                label="Allowed Commodities"
                variant="flat"
                selectionMode="multiple"
                selectedKeys={form.allowedCategoryIds}
                onSelectionChange={(keys) => setForm((f) => ({ ...f, allowedCategoryIds: Array.from(keys) as string[] }))}
                classNames={{
                  trigger: "bg-white/5 border border-white/10 h-14 rounded-2xl hover:bg-white/10 transition-colors",
                  label: "text-default-400 font-medium",
                  value: "text-white font-bold uppercase text-xs",
                  popoverMain: "bg-[#0a0f1d] border border-white/10 rounded-2xl",
                }}
                popoverProps={{ shouldCloseOnBlur: false }}
                placeholder={categories.length ? "Select categories" : "No categories available"}
              >
                {categories.map((cat: any) => (
                  <SelectItem key={cat._id} className="text-white">{cat.name}</SelectItem>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-default-400 px-1">Spatial Identity</label>
              <Textarea
                label="Physical Address"
                variant="flat"
                placeholder="Full warehouse address"
                value={form.address}
                onValueChange={(v) => {
                  manualInputRef.current = true;
                  setForm((f) => ({ ...f, address: v }));
                }}
                minRows={3}
                classNames={{
                  inputWrapper: "bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors p-4",
                  label: "text-default-400 font-medium",
                  input: "text-white font-bold uppercase text-sm"
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Input
                label="Mission Pincode"
                variant="flat"
                placeholder="e.g. 600001"
                value={form.pincode}
                onValueChange={(v) => {
                  manualInputRef.current = true;
                  setForm((f) => ({ ...f, pincode: v }));
                }}
                classNames={{
                  inputWrapper: "bg-white/5 border border-white/10 h-14 rounded-2xl hover:bg-white/10 transition-colors",
                  label: "text-default-400 font-medium",
                  input: "text-white font-bold uppercase text-sm"
                }}
              />
            </div>
            {form.location && (
              <div className="flex flex-wrap gap-2 px-1">
                {form.location.city && <Chip size="sm" variant="flat" className="bg-white/5 text-white/60 font-bold uppercase text-[9px] border border-white/10">{form.location.city}</Chip>}
                {form.location.district && <Chip size="sm" variant="flat" className="bg-white/5 text-white/60 font-bold uppercase text-[9px] border border-white/10">{form.location.district}</Chip>}
                {form.location.state && <Chip size="sm" variant="flat" className="bg-white/5 text-white/60 font-bold uppercase text-[9px] border border-white/10">{form.location.state}</Chip>}
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-default-400 px-1">Infrastructure Capacity</label>
              <Input
                label="Total Mission Volume (MT)"
                variant="flat"
                placeholder="00.00"
                type="number"
                value={String(form.totalCapacity)}
                onValueChange={(v) => setForm((f) => ({ ...f, totalCapacity: Number(v) }))}
                classNames={{
                  inputWrapper: "bg-white/5 border border-white/10 h-14 rounded-2xl hover:bg-white/10 transition-colors",
                  label: "text-default-400 font-medium",
                  input: "text-white font-bold uppercase text-sm"
                }}
              />
            </div>
            <div className="flex items-center justify-between px-2 py-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">List for Rental</p>
                <p className="text-[10px] text-default-400 uppercase tracking-widest mt-1">Open node to associate network</p>
              </div>
              <Switch
                isSelected={form.listingType === "RENTAL" && form.isRentalActive}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    listingType: v ? "RENTAL" : "PRIVATE",
                    isRentalActive: v,
                  }))
                }
                color="warning"
              />
            </div>
            <div className="flex items-center justify-between px-2 py-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">Active Status</p>
                <p className="text-[10px] text-default-400 uppercase tracking-widest mt-1">Ready for operational deployment</p>
              </div>
              <Switch
                isSelected={form.isActive}
                onValueChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
                color="warning"
              />
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <div className="text-xs text-default-500 flex items-center gap-2">
                {createMutation.isPending && <FiLoader className="animate-spin" />}
                <span>Location required for clarity.</span>
              </div>
              <Button
                color="warning"
                className="h-12 rounded-2xl font-bold uppercase tracking-widest text-[10px] px-8 bg-warning-500 text-black shadow-lg shadow-warning-500/20 hover:scale-105 active:scale-95 transition-all"
                isDisabled={!form.name.trim() || !form.location}
                isLoading={createMutation.isPending}
                onPress={() => createMutation.mutate(form)}
              >
                Deploy Infrastructure
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
      </section>
      <style jsx global>{`
        .warehouse-location-map .leaflet-control-attribution {
          display: none !important;
        }
        .warehouse-location-map .leaflet-tile {
          filter: brightness(1.1) contrast(1.15) saturate(1.05);
        }
      `}</style>
    </>
  );
}
