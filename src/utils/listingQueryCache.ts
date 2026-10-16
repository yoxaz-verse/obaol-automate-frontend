import type { QueryClient } from "@tanstack/react-query";

const LISTING_QUERY_ROOTS = new Set([
  "variantRate",
  "displayedRate",
  "catalogItems",
  "inventory-status",
  "marketplace-stats",
  "marketplace-visibility-summary",
]);

export const invalidateListingQueries = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({
    predicate: ({ queryKey }) => LISTING_QUERY_ROOTS.has(String(queryKey[0] || "")),
  });
