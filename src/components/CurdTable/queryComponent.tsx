"use client";
import React from "react";
import { getData } from "@/core/api/apiHandler";
import { useQuery } from "@tanstack/react-query";
import { QueryComponentProps } from "@/data/interface-data";
import BrandedLoader from "@/components/ui/BrandedLoader";
import SectionSkeleton from "@/components/ui/SectionSkeleton";
import InlineLoader from "@/components/ui/InlineLoader";

function QueryComponent<T>(props: QueryComponentProps<T>) {
  const {
    api,
    queryKey,
    children,
    page,
    limit,
    search,
    additionalParams,
    loadingVariant = "skeleton",
    loadingMessage = "Loading",
    emptyState,
  } =
    props;

  // Dynamically construct parameters, excluding undefined or null values
  const params = {
    ...(page !== undefined && { page }),
    ...(limit !== undefined && { limit }),
    ...(search && { search }),
    ...(additionalParams || {}), // Include additional dynamic params
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: () => getData(api, params),
    staleTime: 30_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  if (isLoading) {
    if (loadingVariant === "inline") {
      return <InlineLoader message={loadingMessage} className="py-6 justify-center" />;
    }

    if (loadingVariant === "branded") {
      return <BrandedLoader variant="compact" message={loadingMessage} />;
    }

    return <SectionSkeleton rows={4} className="py-3" />;
  }

  if (isError) {
    return (
      <>
        {emptyState || (
          <div className="rounded-xl border border-danger-300/60 bg-danger-500/10 px-4 py-3 text-sm text-danger-600 dark:text-danger-300">
            Failed to fetch data.
          </div>
        )}
      </>
    );
  }

  // Pass the correct data structure to children based on the presence of `page`
  const responseData = page ? data?.data?.data : data?.data;

  return (
    <div>
      {children && children(responseData as T, refetch)} {/* Pass refetch */}
    </div>
  );
}

export default QueryComponent;
