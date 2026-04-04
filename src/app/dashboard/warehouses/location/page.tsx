"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
} from "@heroui/react";
import Title from "@/components/titles";
import { getData, postData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { showToastMessage } from "@/utils/utils";
import { WarehouseLocationValue } from "@/components/Warehouse/WarehouseLocationPicker";
import { FiMapPin, FiLoader } from "react-icons/fi";
import { LuWarehouse } from "react-icons/lu";

type WarehouseForm = {
  name: string;
  address: string;
  pincode: string;
  totalCapacity: number;
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

  const createMutation = useMutation({
    mutationFn: (payload: WarehouseForm) => postData(apiRoutes.warehouses.create, payload),
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
      <section className="w-full min-h-screen p-6 md:p-10 bg-background text-foreground">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <Title title="Warehouse Location" />
        <Button variant="light" onPress={() => router.push("/dashboard/warehouses")}>
          Back to Warehouses
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6">
        <Card className="border border-default-200/60 bg-content1/70 backdrop-blur-md rounded-2xl">
          <CardHeader className="px-6 pt-6">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-warning-500/10 flex items-center justify-center text-warning-500">
                <FiMapPin />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight">Pin Warehouse Location</h2>
                <p className="text-xs text-default-500 mt-1">
                  Click the map to pin the exact warehouse location. City, district, and state will be filled automatically.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="px-6 pb-6 space-y-4">
            {form.location && (
              <div className="text-xs text-default-500">
                <span className="font-semibold text-foreground">Detected:</span> {locationLabel}
                {form.location.district && ` • ${form.location.district}`}
                {form.location.pincode && ` • ${form.location.pincode}`}
                {form.location.city && ` • ${form.location.city}`}
                {form.location.state && ` • ${form.location.state}`}
              </div>
            )}
            <div className="rounded-2xl overflow-hidden border border-default-200/60 warehouse-location-map">
              <WarehouseLocationPicker value={pendingLocation} onChange={setPendingLocation} height={420} />
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

        <Card className="border border-default-200/60 bg-content1/70 backdrop-blur-md rounded-2xl">
          <CardHeader className="px-6 pt-6">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500">
                <LuWarehouse />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight">Warehouse Details</h2>
                <p className="text-xs text-default-500 mt-1">Complete the details and save the warehouse.</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="px-6 pb-6 space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground pl-0.5">Warehouse Name <span className="text-danger-500">*</span></label>
              <Input
                placeholder="e.g. Chennai Cold Storage"
                value={form.name}
                onValueChange={(v) => setForm((f) => ({ ...f, name: v }))}
                classNames={{ inputWrapper: "bg-default-100/60 border-default-200" }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground pl-0.5">Category <span className="text-danger-500">*</span></label>
              <Select
                selectedKeys={[form.category]}
                onSelectionChange={(keys) => setForm((f) => ({ ...f, category: Array.from(keys)[0] as any }))}
                classNames={{ trigger: "bg-default-100/60 border-default-200" }}
              >
                <SelectItem key="GENERAL">General warehouse</SelectItem>
                <SelectItem key="COLD_STORAGE">Cold storage</SelectItem>
                <SelectItem key="BONDED">Bonded warehouse</SelectItem>
                <SelectItem key="AGRO">Agro warehouse</SelectItem>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground pl-0.5">Allowed Commodities</label>
              <Select
                selectionMode="multiple"
                selectedKeys={form.allowedCategoryIds}
                onSelectionChange={(keys) => setForm((f) => ({ ...f, allowedCategoryIds: Array.from(keys) as string[] }))}
                classNames={{ trigger: "bg-default-100/60 border-default-200" }}
                placeholder={categories.length ? "Select categories" : "No categories available"}
              >
                {categories.map((cat: any) => (
                  <SelectItem key={cat._id}>{cat.name}</SelectItem>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground pl-0.5">Address</label>
              <Textarea
                placeholder="Full warehouse address"
                value={form.address}
                onValueChange={(v) => {
                  manualInputRef.current = true;
                  setForm((f) => ({ ...f, address: v }));
                }}
                minRows={3}
                classNames={{ inputWrapper: "bg-default-100/60 border-default-200" }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground pl-0.5">Pincode</label>
              <Input
                placeholder="e.g. 600001"
                value={form.pincode}
                onValueChange={(v) => {
                  manualInputRef.current = true;
                  setForm((f) => ({ ...f, pincode: v }));
                }}
                classNames={{ inputWrapper: "bg-default-100/60 border-default-200" }}
              />
            </div>
            {form.location && (
              <div className="flex flex-wrap gap-2">
                {form.location.city && <Chip size="sm" variant="flat">{form.location.city}</Chip>}
                {form.location.district && <Chip size="sm" variant="flat">{form.location.district}</Chip>}
                {form.location.state && <Chip size="sm" variant="flat">{form.location.state}</Chip>}
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground pl-0.5">Total Capacity</label>
              <Input
                placeholder="e.g. 2500"
                type="number"
                value={String(form.totalCapacity)}
                onValueChange={(v) => setForm((f) => ({ ...f, totalCapacity: Number(v) }))}
                classNames={{ inputWrapper: "bg-default-100/60 border-default-200" }}
              />
            </div>
            <div className="flex items-center justify-between px-1">
              <div>
                <p className="text-sm font-semibold text-foreground">List for Rental</p>
                <p className="text-xs text-default-400">Allow other associates to use this warehouse</p>
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
            <div className="flex items-center justify-between px-1">
              <div>
                <p className="text-sm font-semibold text-foreground">Active</p>
                <p className="text-xs text-default-400">Enable this warehouse for use</p>
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
                className="font-bold"
                isDisabled={!form.name.trim() || !form.location}
                isLoading={createMutation.isPending}
                onPress={() => createMutation.mutate(form)}
              >
                Create Warehouse
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
      </section>
      <style jsx global>{`
        .warehouse-location-map .leaflet-control-attribution a[href*="leaflet"] {
          display: none !important;
        }
      `}</style>
    </>
  );
}
