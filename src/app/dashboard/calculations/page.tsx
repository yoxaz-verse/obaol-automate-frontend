"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, CardBody, CardHeader, Divider, Input, Spacer } from "@nextui-org/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Title from "@/components/titles";
import EssentialTabContent from "@/components/dashboard/Essentials/essential-tab-content";
import { apiRoutes } from "@/core/api/apiRoutes";
import { postData } from "@/core/api/apiHandler";
import { showToastMessage } from "@/utils/utils";
import { DEFAULT_CALCULATION_CONFIG, useCalculationConfig } from "@/hooks/useCalculationConfig";

const toNumber = (value: string) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return num;
};

export default function CalculationsPage() {
  const queryClient = useQueryClient();
  const { data: config, isLoading } = useCalculationConfig();

  const [form, setForm] = useState({
    variantRateCommissionPercent: String(DEFAULT_CALCULATION_CONFIG.variantRateCommissionPercent),
    gstPercent: String(DEFAULT_CALCULATION_CONFIG.gstPercent),
    importAdminCommissionDefault: String(DEFAULT_CALCULATION_CONFIG.importAdminCommissionDefault),
    warehouseStorageRateDefault: String(DEFAULT_CALCULATION_CONFIG.warehouseStorageRateDefault),
  });

  useEffect(() => {
    if (!config) return;
    setForm({
      variantRateCommissionPercent: String(config.variantRateCommissionPercent ?? DEFAULT_CALCULATION_CONFIG.variantRateCommissionPercent),
      gstPercent: String(config.gstPercent ?? DEFAULT_CALCULATION_CONFIG.gstPercent),
      importAdminCommissionDefault: String(config.importAdminCommissionDefault ?? DEFAULT_CALCULATION_CONFIG.importAdminCommissionDefault),
      warehouseStorageRateDefault: String(config.warehouseStorageRateDefault ?? DEFAULT_CALCULATION_CONFIG.warehouseStorageRateDefault),
    });
  }, [config]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      return postData(apiRoutes.systemConfig.calculations, {
        variantRateCommissionPercent: toNumber(form.variantRateCommissionPercent),
        gstPercent: toNumber(form.gstPercent),
        importAdminCommissionDefault: toNumber(form.importAdminCommissionDefault),
        warehouseStorageRateDefault: toNumber(form.warehouseStorageRateDefault),
      });
    },
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Calculation settings updated.", position: "top-right" });
      queryClient.invalidateQueries({ queryKey: ["system-config-calculations"] });
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || error?.message || "Failed to update calculation settings.",
        position: "top-right",
      });
    },
  });

  const [sampleRate, setSampleRate] = useState("100");
  const [sampleSubtotal, setSampleSubtotal] = useState("250000");
  const [sampleCommission, setSampleCommission] = useState("5000");
  const [sampleWarehouseQty, setSampleWarehouseQty] = useState("12");
  const [sampleWarehouseDays, setSampleWarehouseDays] = useState("30");

  const commissionPercent = toNumber(form.variantRateCommissionPercent);
  const gstPercent = toNumber(form.gstPercent);
  const warehouseRate = toNumber(form.warehouseStorageRateDefault);

  const sampleCommissionValue = useMemo(() => {
    return (toNumber(sampleRate) * commissionPercent) / 100;
  }, [sampleRate, commissionPercent]);

  const sampleTaxValue = useMemo(() => {
    return ((toNumber(sampleSubtotal) + toNumber(sampleCommission)) * gstPercent) / 100;
  }, [sampleSubtotal, sampleCommission, gstPercent]);

  const sampleWarehouseCharge = useMemo(() => {
    return warehouseRate * toNumber(sampleWarehouseQty) * toNumber(sampleWarehouseDays);
  }, [warehouseRate, sampleWarehouseQty, sampleWarehouseDays]);

  return (
    <section>
      <Title title="Calculations" />

      <div className="mx-2 md:mx-6 mb-6">
        <div className="mb-5 rounded-2xl border border-default-200/60 bg-content1/95 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-default-400">
            Calculation Control Panel
          </p>
          <h2 className="text-base font-semibold text-foreground">
            Adjust defaults for commissions, GST, imports, and storage charges in one place.
          </h2>
        </div>

        <Card className="mb-6 border border-default-200/60 bg-content1/95">
          <CardHeader className="font-semibold">Global Parameters</CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Variant Rate Commission %"
                type="number"
                value={form.variantRateCommissionPercent}
                onChange={(e) => setForm((prev) => ({ ...prev, variantRateCommissionPercent: e.target.value }))}
              />
              <Input
                label="GST/Tax Percent"
                type="number"
                value={form.gstPercent}
                onChange={(e) => setForm((prev) => ({ ...prev, gstPercent: e.target.value }))}
              />
              <Input
                label="Import Admin Commission Default"
                type="number"
                value={form.importAdminCommissionDefault}
                onChange={(e) => setForm((prev) => ({ ...prev, importAdminCommissionDefault: e.target.value }))}
              />
              <Input
                label="Warehouse Storage Rate Default"
                type="number"
                value={form.warehouseStorageRateDefault}
                onChange={(e) => setForm((prev) => ({ ...prev, warehouseStorageRateDefault: e.target.value }))}
              />
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Button
                color="warning"
                onPress={() => saveMutation.mutate()}
                isLoading={saveMutation.isPending}
              >
                Save Settings
              </Button>
              <div className="text-xs text-default-500">
                {isLoading ? "Loading current configuration..." : "Changes apply to new or edited records."}
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="mb-6 border border-default-200/60 bg-content1/95">
          <CardHeader className="font-semibold">Formula Preview</CardHeader>
          <CardBody className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-default-200/60 bg-content1/70 p-4">
                <div className="text-xs uppercase tracking-widest text-default-400">Variant Rate Commission</div>
                <Input
                  label="Sample Rate"
                  type="number"
                  value={sampleRate}
                  onChange={(e) => setSampleRate(e.target.value)}
                />
                <div className="mt-2 text-sm text-default-600">
                  Commission: <span className="font-semibold text-foreground">{sampleCommissionValue.toFixed(2)}</span>
                </div>
              </div>
              <div className="rounded-xl border border-default-200/60 bg-content1/70 p-4">
                <div className="text-xs uppercase tracking-widest text-default-400">GST Tax</div>
                <Input
                  label="Subtotal"
                  type="number"
                  value={sampleSubtotal}
                  onChange={(e) => setSampleSubtotal(e.target.value)}
                />
                <Input
                  label="Commission Total"
                  type="number"
                  className="mt-2"
                  value={sampleCommission}
                  onChange={(e) => setSampleCommission(e.target.value)}
                />
                <div className="mt-2 text-sm text-default-600">
                  Tax: <span className="font-semibold text-foreground">{sampleTaxValue.toFixed(2)}</span>
                </div>
              </div>
              <div className="rounded-xl border border-default-200/60 bg-content1/70 p-4">
                <div className="text-xs uppercase tracking-widest text-default-400">Warehouse Charge</div>
                <Input
                  label="Quantity"
                  type="number"
                  value={sampleWarehouseQty}
                  onChange={(e) => setSampleWarehouseQty(e.target.value)}
                />
                <Input
                  label="Days"
                  type="number"
                  className="mt-2"
                  value={sampleWarehouseDays}
                  onChange={(e) => setSampleWarehouseDays(e.target.value)}
                />
                <div className="mt-2 text-sm text-default-600">
                  Total: <span className="font-semibold text-foreground">{sampleWarehouseCharge.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Divider className="my-6" />
        <Title title="Commission Rules" />
        <Spacer y={4} />
        <EssentialTabContent essentialName="commissionRule" />
      </div>
    </section>
  );
}
