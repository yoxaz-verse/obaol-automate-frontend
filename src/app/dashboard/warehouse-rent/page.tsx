"use client";

import React, { useMemo, useState, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Card, CardBody, CardHeader, Divider, Input, Select, SelectItem, Textarea } from "@heroui/react";
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
    if (!form.title.trim() || !form.serviceSpecifications.trim() || !form.fromState || !form.fromDistrict) {
      showToastMessage({ type: "error", message: "Please fill all required fields." });
      return;
    }
    createMutation.mutate();
  };

  return (
    <div className="flex flex-col gap-6">
      <Title title="Rent a Warehouse" />

      <Card className="border border-default-200/60 bg-content1">
        <CardHeader className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">Request Warehouse Space</h3>
            <p className="text-xs text-default-500">Submit a warehousing request to find available storage.</p>
          </div>
          <Button size="sm" variant="flat" onPress={() => router.push("/dashboard/execution-enquiries?tab=service-requests")}>
            View Service Requests
          </Button>
        </CardHeader>
        <Divider />
        <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Request Title"
            placeholder="e.g. 200 MT storage in Chennai"
            value={form.title}
            onValueChange={(v) => setForm((prev) => ({ ...prev, title: v }))}
            isRequired
          />
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
          <div className="md:col-span-2 flex justify-end">
            <Button color="warning" isLoading={createMutation.isPending} onPress={handleSubmit}>
              Submit Request
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
