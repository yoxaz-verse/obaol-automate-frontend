"use client";

import React, { useMemo, useState, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Card, CardBody, CardHeader, Chip, Divider, Input, Select, SelectItem, Textarea } from "@heroui/react";
import { useRouter } from "next/navigation";
import AuthContext from "@/context/AuthContext";
import Title from "@/components/titles";
import { apiRoutes } from "@/core/api/apiRoutes";
import { getData, postData } from "@/core/api/apiHandler";
import dayjs from "dayjs";
import { showToastMessage } from "@/utils/utils";
import {
  FiBox, FiMapPin, FiCalendar, FiFileText,
  FiPackage, FiTag, FiArrowRight, FiAlertCircle, FiHome, FiCheckCircle, FiSearch, FiPlus
} from "react-icons/fi";

const EMPTY_FORM = {
  title: "",
  serviceSpecifications: "",
  fromState: "",
  fromDistrict: "",
  requiredFromDate: "",
  requiredToDate: "",
  createdByCompanyId: "",
  warehouseId: "",
  requestMode: "DIRECT",
};

export default function WarehouseRentPage() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const queryClient = useQueryClient();
  const roleLower = String(user?.role || "").toLowerCase();
  const isAdmin = roleLower === "admin";

  const [form, setForm] = useState(EMPTY_FORM);
  const [warehouseSearch, setWarehouseSearch] = useState("");

  const { data: serviceRequestsResponse, isLoading: requestsLoading } = useQuery({
    queryKey: ["warehouse-service-requests"],
    queryFn: () => getData(apiRoutes.serviceRequests.list, { requestType: "WAREHOUSING", limit: 100 }),
  });
  const serviceRequests = useMemo(() => {
    const axiosData = serviceRequestsResponse?.data;
    if (!axiosData) return [];
    if (Array.isArray(axiosData?.data)) return axiosData.data;
    if (Array.isArray(axiosData)) return axiosData;
    if (Array.isArray(axiosData?.data?.data)) return axiosData.data.data;
    return [];
  }, [serviceRequestsResponse]);

  const { data: statesResponse } = useQuery({
    queryKey: ["warehouse-rent-states"],
    queryFn: () => getData(apiRoutes.state.getAll, { page: 1, limit: 500 }),
  });
  const { data: districtsResponse } = useQuery({
    queryKey: ["warehouse-rent-districts"],
    queryFn: () => getData(apiRoutes.district.getAll, { page: 1, limit: 2000 }),
  });

  const { data: companiesResponse } = useQuery({
    queryKey: ["warehouse-rent-companies"],
    queryFn: () => getData(apiRoutes.associateCompany.getAll, { page: 1, limit: 1000, sort: "name:asc" }),
    enabled: isAdmin,
  });

  const { data: warehousesResponse } = useQuery({
    queryKey: ["warehouse-rent-available"],
    queryFn: () => getData(apiRoutes.warehouses.list, { scope: "available" }),
  });
  const { data: warehousesAllResponse } = useQuery({
    queryKey: ["warehouse-rent-all"],
    queryFn: () => getData(apiRoutes.warehouses.list, { scope: "all" }),
    enabled: isAdmin,
  });

  const { data: categoriesResponse } = useQuery({
    queryKey: ["warehouse-rent-categories"],
    queryFn: () => getData(apiRoutes.category.getAll, { page: 1, limit: 500 }),
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

  const warehouseOptions = useMemo(() => {
    const raw = warehousesResponse?.data?.data;
    let availableList: any[] = [];
    if (Array.isArray(raw?.data)) availableList = raw.data;
    if (Array.isArray(raw)) availableList = raw;

    if (availableList.length > 0) return availableList;

    if (isAdmin) {
      const allRaw = warehousesAllResponse?.data?.data;
      let allList: any[] = [];
      if (Array.isArray(allRaw?.data)) allList = allRaw.data;
      if (Array.isArray(allRaw)) allList = allRaw;
      return allList.filter((wh: any) => {
        const listingType = String(wh?.listingType || "").toUpperCase();
        const rentalActive = wh?.isRentalActive === true || wh?.isRentalActive === "true" || wh?.isRentalActive === 1;
        const active = wh?.isActive === true || wh?.isActive === "true" || wh?.isActive === 1;
        return active && ((listingType === "RENTAL" && rentalActive) || (!wh?.listingType && rentalActive));
      });
    }

    return [];
  }, [warehousesResponse, warehousesAllResponse, isAdmin]);

  const filteredWarehouses = useMemo(() => {
    if (!warehouseSearch.trim()) return warehouseOptions;
    const q = warehouseSearch.toLowerCase();
    return warehouseOptions.filter((wh: any) =>
      String(wh.name || "").toLowerCase().includes(q) ||
      String(wh.address || "").toLowerCase().includes(q) ||
      String(wh.category || "").toLowerCase().includes(q) ||
      String(wh.state?.name || "").toLowerCase().includes(q) ||
      String(wh.district?.name || "").toLowerCase().includes(q)
    );
  }, [warehouseOptions, warehouseSearch]);

  const categories = useMemo(() => {
    const raw = categoriesResponse?.data?.data;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw)) return raw;
    return [];
  }, [categoriesResponse]);

  const categoryNameMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((cat: any) => {
      if (cat?._id) map.set(String(cat._id), cat?.name || "");
    });
    return map;
  }, [categories]);

  const fromDistrictOptions = useMemo(
    () => districts.filter((item: any) => String(item?.state?._id || item?.state || "") === form.fromState),
    [districts, form.fromState]
  );

  const createMutation = useMutation({
    mutationFn: () =>
      postData(apiRoutes.serviceRequests.create, {
        requestType: "WAREHOUSING",
        requestMode: form.requestMode,
        title: form.title,
        serviceSpecifications: form.serviceSpecifications,
        fromState: form.fromState,
        fromDistrict: form.fromDistrict,
        requiredFromDate: form.requiredFromDate || null,
        requiredToDate: form.requiredToDate || null,
        createdByCompanyId: isAdmin ? form.createdByCompanyId || null : undefined,
        warehouseId: form.requestMode === "DIRECT" ? form.warehouseId : null,
      }),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Warehouse rental request submitted." });
      setForm(EMPTY_FORM);
      queryClient.invalidateQueries({ queryKey: ["warehouse-service-requests"] });
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || "Failed to submit request.",
      });
    },
  });

  const handleSubmit = () => {
    if (form.requestMode === "DIRECT" && !form.warehouseId) {
      showToastMessage({ type: "error", message: "Please select an available warehouse." });
      return;
    }
    if (!form.title.trim() || !form.serviceSpecifications.trim() || !form.fromState || !form.fromDistrict) {
      showToastMessage({ type: "error", message: "Please fill all required fields." });
      return;
    }
    createMutation.mutate();
  };

  const selectedWarehouse = warehouseOptions.find((wh: any) => String(wh?._id || "") === form.warehouseId);

  const getCategoryLabel = (cat: string) =>
    cat === "COLD_STORAGE" ? "Cold Storage"
      : cat === "BONDED" ? "Bonded Warehouse"
        : cat === "AGRO" ? "Agro Warehouse"
          : "General Warehouse";

  // Auto-fill location when a warehouse is selected
  React.useEffect(() => {
    if (selectedWarehouse && form.requestMode === "DIRECT") {
      const wState = selectedWarehouse.state?._id || selectedWarehouse.state;
      const wDistrict = selectedWarehouse.district?._id || selectedWarehouse.district;

      if (wState || wDistrict) {
        setForm(prev => ({
          ...prev,
          fromState: wState ? String(wState) : prev.fromState,
          fromDistrict: wDistrict ? String(wDistrict) : prev.fromDistrict
        }));
      }
    }
  }, [selectedWarehouse, form.requestMode]);

  return (
    <div className="flex flex-col gap-6 pb-10">
      <Title title="Warehouse Space" />

      {/* Live Warehouses */}
      <div className="rounded-2xl border border-default-200/50 bg-content1 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-default-200/40 bg-gradient-to-r from-default-50/60 to-transparent flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
              <FiHome className="text-warning-500" /> Live Warehouses
            </h3>
            <p className="text-[11px] text-default-500 mt-0.5">Rental‑active warehouses available right now. Click Select to pre-fill the form.</p>
          </div>
          <Input
            placeholder="Search by name, location or type..."
            value={warehouseSearch}
            onValueChange={setWarehouseSearch}
            size="sm"
            variant="bordered"
            radius="full"
            className="max-w-xs"
            classNames={{
              inputWrapper: "bg-content2/40 border-default-200/60 h-9",
              input: "text-xs font-bold"
            }}
            startContent={<FiSearch className="text-default-400" size={14} />}
          />
        </div>
        <div className="p-4">
          {filteredWarehouses.length === 0 ? (
            <div className="flex items-center gap-3 py-12 justify-center opacity-50">
              <FiAlertCircle className="text-xl" />
              <span className="text-sm font-bold text-default-400">No matching warehouses found.</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {filteredWarehouses.map((wh: any) => {
                const isSelected = form.warehouseId === String(wh._id);
                return (
                  <div
                    key={wh._id}
                    className={`relative flex flex-col gap-3 p-5 rounded-[1.5rem] border-2 transition-all cursor-pointer w-full max-w-[300px] group
                      ${isSelected
                        ? "border-warning-500 bg-warning-500/5 shadow-xl shadow-warning-500/10"
                        : "border-default-200/50 bg-content2/20 hover:border-default-400/50 hover:bg-content2/40"
                      } ${form.requestMode === "OPEN" ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => {
                      if (form.requestMode === "OPEN") return;
                      setForm((prev) => ({ ...prev, warehouseId: String(wh._id) }));
                    }}
                  >
                    {isSelected && (
                      <div className="absolute top-4 right-4 z-10">
                        <div className="bg-warning-500 text-white p-1 rounded-full shadow-lg shadow-warning-500/40">
                          <FiCheckCircle size={14} />
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      <h4 className="text-sm font-black text-foreground leading-tight group-hover:text-warning-500 transition-colors uppercase tracking-tight">{wh.name}</h4>
                      <div className="flex items-center gap-1.5 opacity-60">
                        <FiMapPin size={10} />
                        <span className="text-[10px] font-bold truncate">
                          {wh.district?.name ? `${wh.district.name}, ${wh.state?.name || ""}` : wh.address || "Location not set"}
                        </span>
                      </div>
                    </div>
                    <Divider className="opacity-40" />
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-default-400 uppercase tracking-widest">Pricing</span>
                        <span className="text-sm font-black text-warning-500 leading-none">₹{wh.storageRatePerUnit}<span className="text-[10px] opacity-70">/{wh.unit}</span></span>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-[9px] font-black text-default-400 uppercase tracking-widest">Classification</span>
                        <span className="text-[10px] font-black text-foreground uppercase tracking-tight">{getCategoryLabel(wh.category)}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.isArray(wh.allowedCategoryIds) && wh.allowedCategoryIds.length > 0 ? (
                        wh.allowedCategoryIds.slice(0, 3).map((catId: string) => (
                          <span key={catId} className="text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-md bg-default-100/50 text-default-500 border border-default-200/50">
                            {categoryNameMap.get(String(catId)) || "Category"}
                          </span>
                        ))
                      ) : (
                        <span className="text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-md bg-default-100/50 text-default-500 border border-default-200/50">
                          General Product Support
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Open Warehouse Requests Section */}
      <div className="rounded-2xl border border-default-200/50 bg-content1 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-default-200/40 bg-gradient-to-r from-default-50/60 to-transparent flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
              <FiPackage className="text-warning-500" /> Open Warehouse Requests
            </h3>
            <p className="text-[11px] text-default-500 mt-0.5">Track your active storage fulfillment requests and bids.</p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button
                size="sm"
                variant="flat"
                color="warning"
                onPress={() => document.getElementById("warehouse-request-form")?.scrollIntoView({ behavior: "smooth" })}
                className="text-[10px] font-black uppercase tracking-widest h-8 px-4 rounded-xl shadow-lg shadow-warning-500/10 border border-warning-500/20"
                startContent={<FiPlus size={14} className="stroke-[3px]" />}
              >
                Add Request
              </Button>
            )}
            <span className="text-[10px] font-black uppercase tracking-widest text-warning-500 bg-warning-500/10 px-3 py-1 rounded-full border border-warning-500/20">
              {serviceRequests.length} Active
            </span>
          </div>
        </div>
        <div className="p-6">
          {requestsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-10 h-10 border-2 border-warning-500/20 border-t-warning-500 rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest text-default-400">Loading fulfillment data...</p>
            </div>
          ) : serviceRequests.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-12 opacity-40">
              <div className="w-16 h-16 rounded-full bg-default-100 flex items-center justify-center">
                <FiPackage size={32} className="text-default-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-black uppercase tracking-widest text-default-500">No active requests</p>
                <p className="text-[10px] font-bold text-default-400 mt-1 uppercase tracking-wider">Storage orders will appear here once submitted.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {serviceRequests.map((req: any) => (
                <div key={req._id} className="p-5 rounded-[1.5rem] border border-default-200/50 bg-content2/10 hover:bg-content2/30 hover:border-warning-500/30 transition-all flex flex-col gap-4 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <FiArrowRight size={48} className="-rotate-45" />
                  </div>
                  <div className="flex items-start justify-between">
                    <div className="shrink-0 p-2 rounded-xl bg-warning-500/10 text-warning-500 border border-warning-500/20">
                      <FiPackage size={18} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border border-warning-500/20 text-warning-500 bg-warning-500/10">
                        {String(req.requestMode || "DIRECT").toUpperCase() === "OPEN" ? "OPEN REQUEST" : "BOOKED WAREHOUSE"}
                      </span>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={
                          req.status === "COMPLETED" ? "success"
                            : req.status === "CANCELLED" ? "danger"
                              : req.status === "COMMITTED" ? "primary"
                                : "warning"
                        }
                        className="text-[9px] font-black uppercase tracking-widest px-2"
                      >
                        {req.status || "PENDING"}
                      </Chip>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-foreground uppercase tracking-tight line-clamp-1">{req.title || "Warehouse Request"}</h4>
                    <div className="flex items-center gap-1.5 mt-1.5 text-[10px] font-bold text-default-400">
                      <FiCalendar size={10} />
                      <span>{req.requiredFromDate ? dayjs(req.requiredFromDate).format("DD MMM") : "TBD"} — {req.requiredToDate ? dayjs(req.requiredToDate).format("DD MMM") : "TBD"}</span>
                    </div>
                  </div>
                  <Divider className="opacity-40" />
                  <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                    <div className="flex flex-col">
                      <span className="text-[9px] opacity-60">Location</span>
                      <span className="text-foreground">{req.fromDistrict?.name || req.fromDistrict || "Anywhere"}, {req.fromState?.name || req.fromState || ""}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="light"
                      color="warning"
                      className="font-black text-[10px] uppercase h-7 min-w-0 px-2"
                      onPress={() => router.push("/dashboard/execution-enquiries?tab=service-requests")}
                    >
                      DETAILS
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Request Form */}
      <div id="warehouse-request-form" className="rounded-2xl border border-default-200/50 bg-content1 overflow-hidden transition-all duration-500 scroll-mt-6">
        {/* Form Header */}
        <div className="px-6 py-4 border-b border-default-200/40 bg-gradient-to-r from-default-50/60 to-transparent flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
              <FiFileText className="text-warning-500" /> Request Warehouse Space
            </h3>
            <p className="text-[11px] text-default-500 mt-0.5">Fill in the details below to submit your storage request.</p>
          </div>
          <button
            onClick={() => router.push("/dashboard/execution-enquiries?tab=service-requests")}
            className="text-[10px] font-black uppercase tracking-widest text-default-400 hover:text-warning-500 flex items-center gap-1 transition-colors"
          >
            View Requests <FiArrowRight />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Form Fields */}
            <div className="lg:col-span-2 space-y-5">

              {/* Section: Warehouse & Company */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FiHome className="text-warning-500 text-xs" />
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-default-400">Warehouse Selection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={form.requestMode === "DIRECT" ? "solid" : "light"}
                      color={form.requestMode === "DIRECT" ? "warning" : "default"}
                      className="h-7 px-3 text-[9px] font-black uppercase tracking-widest rounded-lg"
                      onPress={() => setForm((prev) => ({ ...prev, requestMode: "DIRECT" }))}
                    >
                      Book Warehouse
                    </Button>
                    <Button
                      size="sm"
                      variant={form.requestMode === "OPEN" ? "solid" : "light"}
                      color={form.requestMode === "OPEN" ? "warning" : "default"}
                      className="h-7 px-3 text-[9px] font-black uppercase tracking-widest rounded-lg"
                      onPress={() => setForm((prev) => ({ ...prev, requestMode: "OPEN", warehouseId: "" }))}
                    >
                      Open Request
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {form.requestMode === "DIRECT" && (
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-default-500 mb-1.5">
                        Available Warehouse <span className="text-danger-500">*</span>
                      </label>
                      <Select
                        placeholder="Select a warehouse"
                        selectedKeys={form.warehouseId ? [form.warehouseId] : []}
                        onSelectionChange={(keys) => setForm((prev) => ({ ...prev, warehouseId: Array.from(keys)[0] as string }))}
                        variant="bordered"
                        radius="lg"
                        classNames={{ trigger: "bg-content2/50 border-default-200/60 h-10" }}
                        items={warehouseOptions}
                      >
                        {(wh: any) => (
                          <SelectItem key={wh._id} textValue={wh.name}>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold">{wh.name}</span>
                              <span className="text-[10px] opacity-60">₹{wh.storageRatePerUnit}/{wh.unit}</span>
                            </div>
                          </SelectItem>
                        )}
                      </Select>
                    </div>
                  )}
                  {isAdmin && (
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-default-500 mb-1.5">
                        Company <span className="text-default-400 font-normal normal-case">(Admin)</span>
                      </label>
                      <Select
                        placeholder="Select company"
                        selectedKeys={form.createdByCompanyId ? [form.createdByCompanyId] : []}
                        onSelectionChange={(keys) => setForm((prev) => ({ ...prev, createdByCompanyId: Array.from(keys)[0] as string }))}
                        variant="bordered"
                        radius="lg"
                        classNames={{ trigger: "bg-content2/50 border-default-200/60 h-10" }}
                        items={companyOptions}
                      >
                        {(company: any) => (
                          <SelectItem key={company._id} textValue={company.name}>
                            <span className="text-xs font-bold">{company.name}</span>
                          </SelectItem>
                        )}
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              {/* Section: Request Details */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FiTag className="text-warning-500 text-xs" />
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-default-400">Request Details</span>
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-default-500 mb-1.5">
                    Request Title <span className="text-danger-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. 200 MT cold storage in Chennai"
                    value={form.title}
                    onValueChange={(v) => setForm((prev) => ({ ...prev, title: v }))}
                    variant="bordered"
                    radius="lg"
                    classNames={{ inputWrapper: "bg-content2/50 border-default-200/60 h-10" }}
                    startContent={<FiFileText className="text-default-400 text-sm shrink-0" />}
                  />
                </div>
              </div>

              {/* Section: Location */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <FiMapPin className="text-warning-500 text-xs" />
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-default-400">Storage Location</span>
                  </div>
                  {selectedWarehouse && form.requestMode === "DIRECT" && (
                    <div className="flex items-center gap-1 opacity-80">
                      <FiCheckCircle className="text-success-500 text-[10px]" />
                      <span className="text-[9px] font-black text-success-600 uppercase tracking-widest">Inherited from Warehouse</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-default-500 mb-1.5">
                      State <span className="text-danger-500">*</span>
                    </label>
                    <Select
                      placeholder="Select state"
                      selectedKeys={form.fromState ? [form.fromState] : []}
                      onSelectionChange={(keys) => setForm((prev) => ({ ...prev, fromState: Array.from(keys)[0] as string, fromDistrict: "" }))}
                      variant="bordered"
                      radius="lg"
                      classNames={{ trigger: "bg-content2/50 border-default-200/60 h-10" }}
                      items={states}
                      isDisabled={!!selectedWarehouse && form.requestMode === "DIRECT"}
                    >
                      {(state: any) => (
                        <SelectItem key={state._id} textValue={state.name}>
                          <span className="text-xs font-bold">{state.name}</span>
                        </SelectItem>
                      )}
                    </Select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-default-500 mb-1.5">
                      District <span className="text-danger-500">*</span>
                    </label>
                    <Select
                      placeholder={form.fromState ? "Select district" : "Select state first"}
                      selectedKeys={form.fromDistrict ? [form.fromDistrict] : []}
                      onSelectionChange={(keys) => setForm((prev) => ({ ...prev, fromDistrict: Array.from(keys)[0] as string }))}
                      variant="bordered"
                      radius="lg"
                      isDisabled={!form.fromState || (!!selectedWarehouse && form.requestMode === "DIRECT")}
                      classNames={{ trigger: "bg-content2/50 border-default-200/60 h-10" }}
                      items={fromDistrictOptions}
                    >
                      {(district: any) => (
                        <SelectItem key={district._id} textValue={district.name}>
                          <span className="text-xs font-bold">{district.name}</span>
                        </SelectItem>
                      )}
                    </Select>
                  </div>
                </div>

                {selectedWarehouse && form.requestMode === "DIRECT" && (
                  <div className="p-3 rounded-xl bg-gradient-to-br from-warning-500/10 to-transparent border border-warning-500/20 shadow-sm flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-warning-500 flex items-center justify-center shrink-0 shadow-lg shadow-warning-500/20">
                      <FiMapPin className="text-white" size={16} />
                    </div>
                    <div className="flex flex-col text-left">
                      <div className="flex items-center gap-1.5 leading-none mb-1">
                        <span className="text-[9px] font-black text-warning-600 uppercase tracking-[0.1em]">Verified Location</span>
                        <div className="h-2 w-2 rounded-full bg-success-500 animate-pulse" />
                      </div>
                      <span className="text-xs font-bold text-default-700">
                        {states.find(s => String(s._id || s) === form.fromState)?.name || "Detecting State..."}, {fromDistrictOptions.find(d => String(d._id || d) === form.fromDistrict)?.name || "Detecting District..."}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Section: Duration */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FiCalendar className="text-warning-500 text-xs" />
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-default-400">Storage Duration</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-default-500 mb-1.5">Required From</label>
                    <Input
                      type="date"
                      value={form.requiredFromDate}
                      onValueChange={(v) => setForm((prev) => ({ ...prev, requiredFromDate: v }))}
                      variant="bordered"
                      radius="lg"
                      classNames={{ inputWrapper: "bg-content2/50 border-default-200/60 h-10" }}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-default-500 mb-1.5">Required To</label>
                    <Input
                      type="date"
                      value={form.requiredToDate}
                      onValueChange={(v) => setForm((prev) => ({ ...prev, requiredToDate: v }))}
                      variant="bordered"
                      radius="lg"
                      classNames={{ inputWrapper: "bg-content2/50 border-default-200/60 h-10" }}
                    />
                  </div>
                </div>
              </div>

              {/* Section: Specifications */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FiPackage className="text-warning-500 text-xs" />
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-default-400">Storage Specifications</span>
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-default-500 mb-1.5">
                    Specifications <span className="text-danger-500">*</span>
                  </label>
                  <Textarea
                    placeholder="Describe quantity, temperature requirements, special handling, duration notes..."
                    value={form.serviceSpecifications}
                    onValueChange={(v) => setForm((prev) => ({ ...prev, serviceSpecifications: v }))}
                    variant="bordered"
                    radius="lg"
                    classNames={{ inputWrapper: "bg-content2/50 border-default-200/60" }}
                    minRows={3}
                  />
                </div>
              </div>
            </div>

            {/* Right: Selected Warehouse Preview */}
            {form.requestMode === "DIRECT" && (
              <div className="flex flex-col gap-4">
                <div className="rounded-xl border-2 border-default-200/50 bg-content2/30 overflow-hidden sticky top-4">
                  <div className="px-4 py-3 border-b border-default-200/40 bg-default-50/40">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-default-400">Selected Warehouse</span>
                  </div>
                  <div className="p-4">
                    {selectedWarehouse ? (
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-black text-foreground leading-tight">{selectedWarehouse.name}</h4>
                          <p className="text-[10px] text-default-400 mt-0.5">{selectedWarehouse.address || "Address not provided"}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-default-400 uppercase">{getCategoryLabel(selectedWarehouse.category)}</span>
                          <span className="text-sm font-black text-warning-500">₹{selectedWarehouse.storageRatePerUnit}/{selectedWarehouse.unit}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(selectedWarehouse.allowedCategoryIds) && selectedWarehouse.allowedCategoryIds.length > 0 ? (
                            selectedWarehouse.allowedCategoryIds.map((catId: string) => (
                              <span key={catId} className="text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-default-100 text-default-500">
                                {categoryNameMap.get(String(catId)) || "Category"}
                              </span>
                            ))
                          ) : (
                            <span className="text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-default-100 text-default-500">
                              All Commodities
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-success-600 uppercase tracking-widest">
                          <FiCheckCircle size={11} /> Ready to Request
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-6 opacity-40">
                        <FiHome className="text-2xl" />
                        <p className="text-[10px] font-bold text-center text-default-400 text-wrap">Select a warehouse above or from the cards to preview its details here.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              color="warning"
              variant="shadow"
              className="w-full md:w-auto font-black uppercase tracking-widest h-11 text-sm rounded-xl shadow-warning-500/20"
              isLoading={createMutation.isPending}
              onPress={handleSubmit}
            >
              Submit Request <FiArrowRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
