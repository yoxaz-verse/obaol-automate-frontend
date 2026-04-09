"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRoutes } from "@/core/api/apiRoutes";
import { getData } from "@/core/api/apiHandler";

export type CalculationConfig = {
  variantRateCommissionPercent: number;
  gstPercent: number;
  importAdminCommissionDefault: number;
  warehouseStorageRateDefault: number;
};

export const DEFAULT_CALCULATION_CONFIG: CalculationConfig = {
  variantRateCommissionPercent: 2.5,
  gstPercent: 0,
  importAdminCommissionDefault: 0,
  warehouseStorageRateDefault: 0,
};

const normalizeConfig = (value: any): CalculationConfig => {
  const source = value && typeof value === "object" ? value : {};
  const toNumber = (v: any, fallback: number) => {
    const num = Number(v);
    if (!Number.isFinite(num) || num < 0) return fallback;
    return num;
  };
  return {
    variantRateCommissionPercent: toNumber(
      (source as any).variantRateCommissionPercent,
      DEFAULT_CALCULATION_CONFIG.variantRateCommissionPercent
    ),
    gstPercent: toNumber((source as any).gstPercent, DEFAULT_CALCULATION_CONFIG.gstPercent),
    importAdminCommissionDefault: toNumber(
      (source as any).importAdminCommissionDefault,
      DEFAULT_CALCULATION_CONFIG.importAdminCommissionDefault
    ),
    warehouseStorageRateDefault: toNumber(
      (source as any).warehouseStorageRateDefault,
      DEFAULT_CALCULATION_CONFIG.warehouseStorageRateDefault
    ),
  };
};

export const useCalculationConfig = (enabled = true) => {
  return useQuery({
    queryKey: ["system-config-calculations"],
    queryFn: async () => {
      const response = await getData(apiRoutes.systemConfig.calculations);
      return normalizeConfig(response?.data?.data);
    },
    staleTime: 60_000,
    enabled,
  });
};
