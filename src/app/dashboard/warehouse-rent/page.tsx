"use client";

import React, { useMemo, useState, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Card, CardBody, CardHeader, Chip, Divider, Input, Select, SelectItem, Textarea } from "@heroui/react";
import { useRouter } from "next/navigation";
import AuthContext from "@/context/AuthContext";
import Title from "@/components/titles";
import { apiRoutes } from "@/core/api/apiRoutes";
import { getData, postData } from "@/core/api/apiHandler";
import { showToastMessage } from "@/utils/utils";

const EMPTY_FORM = {
  title: "",
  serviceSpecifications: "",
  fromState: "",
  fromDistrict: "",
  requiredFromDate: "",
  requiredToDate: "",
  createdByCompanyId: "",
  warehouseId: "",
};

export default function WarehouseRentPage() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const queryClient = useQueryClient();
  const roleLower = String(user?.role || "").toLowerCase();
  const isAdmin = roleLower === "admin";

  const [form, setForm] = useState(EMPTY_FORM);

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
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw)) return raw;
    return [];
  }, [warehousesResponse]);

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
        title: form.title,
        serviceSpecifications: form.serviceSpecifications,
        fromState: form.fromState,
        fromDistrict: form.fromDistrict,
        requiredFromDate: form.requiredFromDate || null,
        requiredToDate: form.requiredToDate || null,
        createdByCompanyId: isAdmin ? form.createdByCompanyId || null : undefined,
        warehouseId: form.warehouseId,
      }),
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Warehouse rental request submitted." });
      setForm(EMPTY_FORM);
      queryClient.invalidateQueries({ queryKey: ["service-requests"] });
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || "Failed to submit request.",
      });
    },
  });

  const handleSubmit = () => {
    if (!form.warehouseId) {
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

  return (
    <div className="flex flex-col gap-6">
      <Title title="Warehouse Space" />

      <Card className="border border-default-200/60 bg-content1">
        <CardHeader className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">Request Warehouse Space</h3>
            <p className="text-xs text-default-500">Choose a listed warehouse and submit your storage request.</p>
          </div>
          <Button size="sm" variant="flat" onPress={() => router.push("/dashboard/execution-enquiries?tab=service-requests")}>
            View Service Requests
          </Button>
        </CardHeader>
        <Divider />
        <CardBody className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Available Warehouse"
              placeholder="Select warehouse"
              selectedKeys={form.warehouseId ? [form.warehouseId] : []}
              onSelectionChange={(keys) => setForm((prev) => ({ ...prev, warehouseId: Array.from(keys)[0] as string }))}
              isRequired
            >
              {warehouseOptions.map((wh: any) => (
                <SelectItem key={wh._id}>
                  {wh.name} · ₹{wh.storageRatePerUnit}/{wh.unit}
                </SelectItem>
              ))}
            </Select>
            {isAdmin && (
              <Select
                label="Company (Admin)"
                placeholder="Select company"
                selectedKeys={form.createdByCompanyId ? [form.createdByCompanyId] : []}
                onSelectionChange={(keys) => setForm((prev) => ({ ...prev, createdByCompanyId: Array.from(keys)[0] as string }))}
              >
                {companyOptions.map((company: any) => (
                  <SelectItem key={company._id}>{company.name}</SelectItem>
                ))}
              </Select>
            )}
            <Input
              label="Request Title"
              placeholder="e.g. 200 MT storage in Chennai"
              value={form.title}
              onValueChange={(v) => setForm((prev) => ({ ...prev, title: v }))}
              isRequired
            />
            <Select
              label="State"
              placeholder="Select state"
              selectedKeys={form.fromState ? [form.fromState] : []}
              onSelectionChange={(keys) => setForm((prev) => ({ ...prev, fromState: Array.from(keys)[0] as string, fromDistrict: "" }))}
              isRequired
            >
              {states.map((state: any) => (
                <SelectItem key={state._id}>{state.name}</SelectItem>
              ))}
            </Select>
            <Select
              label="District"
              placeholder="Select district"
              selectedKeys={form.fromDistrict ? [form.fromDistrict] : []}
              onSelectionChange={(keys) => setForm((prev) => ({ ...prev, fromDistrict: Array.from(keys)[0] as string }))}
              isRequired
            >
              {fromDistrictOptions.map((district: any) => (
                <SelectItem key={district._id}>{district.name}</SelectItem>
              ))}
            </Select>
            <Input
              type="date"
              label="Required From"
              value={form.requiredFromDate}
              onValueChange={(v) => setForm((prev) => ({ ...prev, requiredFromDate: v }))}
            />
            <Input
              type="date"
              label="Required To"
              value={form.requiredToDate}
              onValueChange={(v) => setForm((prev) => ({ ...prev, requiredToDate: v }))}
            />
            <Textarea
              label="Specifications"
              placeholder="Quantity, temperature, duration, special handling..."
              value={form.serviceSpecifications}
              onValueChange={(v) => setForm((prev) => ({ ...prev, serviceSpecifications: v }))}
              className="md:col-span-2"
              isRequired
            />
          </div>

          <Card className="border border-default-200/60 bg-content2/40 h-full">
            <CardHeader className="pb-1">
              <div>
                <p className="text-xs font-semibold text-default-500 uppercase tracking-widest">Selected Warehouse</p>
                <h4 className="text-base font-black text-foreground mt-1">{selectedWarehouse?.name || "Choose a warehouse"}</h4>
              </div>
            </CardHeader>
            <CardBody className="gap-3">
              {selectedWarehouse ? (
                <>
                  <div className="text-xs text-default-500">{selectedWarehouse.address || "Address not provided"}</div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-default-400">
                      {selectedWarehouse.category === "COLD_STORAGE"
                        ? "Cold Storage"
                        : selectedWarehouse.category === "BONDED"
                          ? "Bonded Warehouse"
                          : selectedWarehouse.category === "AGRO"
                            ? "Agro Warehouse"
                            : "General Warehouse"}
                    </span>
                    <span className="font-bold text-foreground">₹{selectedWarehouse.storageRatePerUnit} / {selectedWarehouse.unit}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(selectedWarehouse.allowedCategoryIds) && selectedWarehouse.allowedCategoryIds.length > 0 ? (
                      selectedWarehouse.allowedCategoryIds.map((catId: string) => (
                        <Chip key={catId} size="sm" variant="flat" className="text-[10px] font-bold uppercase">
                          {categoryNameMap.get(String(catId)) || "Category"}
                        </Chip>
                      ))
                    ) : (
                      <Chip size="sm" variant="flat" className="text-[10px] font-bold uppercase">
                        All commodities
                      </Chip>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-xs text-default-500">Select an available warehouse to see rate and commodity details.</p>
              )}
            </CardBody>
          </Card>
          <div className="lg:col-span-3 flex justify-end">
            <Button color="warning" isLoading={createMutation.isPending} onPress={handleSubmit}>
              Submit Request
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
