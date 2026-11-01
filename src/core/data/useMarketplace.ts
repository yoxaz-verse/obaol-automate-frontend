import { queryOptions } from "@tanstack/react-query";
import { getData } from "@/core/api/apiHandler";
import { variantRateRoutes } from "@/core/api/apiRoutes";
import { resolveMarketplaceSort } from "@/utils/marketplaceSort";

export const marketplaceKeys = {
  all: ["marketplace"] as const,
  stats: () => [...marketplaceKeys.all, "stats"] as const,
  visibility: () => [...marketplaceKeys.all, "visibility"] as const,
  listings: (
    baseParams: Record<string, unknown>,
    requestParams: Record<string, unknown>,
  ) => [
    "variantRate",
    variantRateRoutes.getAll,
    null,
    JSON.stringify(baseParams),
    JSON.stringify({}),
    "",
    1,
    24,
    "",
    requestParams,
  ] as const,
};

export const marketplaceStatsQueryOptions = () => queryOptions({
  queryKey: marketplaceKeys.stats(),
  queryFn: async () => (await getData(variantRateRoutes.marketplaceStats))?.data?.data || {},
  staleTime: 60_000,
});

export const marketplaceVisibilityQueryOptions = () => queryOptions({
  queryKey: marketplaceKeys.visibility(),
  queryFn: async () => (await getData(variantRateRoutes.marketplaceVisibilitySummary))?.data?.data || {},
  staleTime: 60_000,
});

export const marketplaceListingParams = (isLive: boolean) => ({
  view: "marketplace",
  isLive,
  excludeOwned: isLive,
  sort: resolveMarketplaceSort(isLive),
});

export const marketplaceFirstPageQueryOptions = () => {
  const baseParams = { view: "marketplace", isLive: true, excludeOwned: true };
  const params = marketplaceListingParams(true);
  return queryOptions({
    queryKey: marketplaceKeys.listings(baseParams, params),
    queryFn: () => getData(variantRateRoutes.getAll, { page: 1, limit: 24, ...params }),
    staleTime: 30_000,
    gcTime: 300_000,
  });
};
