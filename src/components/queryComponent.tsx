"use client";
import React, { useEffect, useMemo } from "react";
import { getData } from "@/core/api/apiHandler";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { loadingFacts } from "@/data/loading-facts";
import BrandedLoader from "@/components/ui/BrandedLoader";
import InlineLoader from "@/components/ui/InlineLoader";
import SectionSkeleton from "@/components/ui/SectionSkeleton";
import { QueryComponentProps } from "@/data/interface-data";

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
    onMetaChange,
    enabled = true,
  } = props;
  const randomFact = useMemo(() => {
    return loadingFacts[Math.floor(Math.random() * loadingFacts.length)];
  }, []);

  const params = {
    ...(page !== undefined && { page }),
    ...(limit !== undefined && { limit }),
    ...(search && { search }),
    ...(additionalParams || {}),
  };

  const effectiveQueryKey = useMemo(() => {
    return [
      ...queryKey,
      page ?? null,
      limit ?? null,
      search ?? "",
      additionalParams ?? {},
    ];
  }, [queryKey, page, limit, search, additionalParams]);

  const { data, isLoading, isError, refetch, isFetching, isPlaceholderData } = useQuery({
    queryKey: effectiveQueryKey,
    queryFn: () => getData(api, params),
    staleTime: 30_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    retry: 1,
    placeholderData: keepPreviousData,
    enabled,
  });

  const rawResult = page !== undefined ? data?.data?.data : data?.data;
  const responseData =
    page !== undefined
      ? Array.isArray(rawResult?.data)
        ? rawResult.data
        : Array.isArray(rawResult)
          ? rawResult
          : []
      : rawResult;
  const responseMeta = useMemo(
    () =>
      page !== undefined && rawResult && !Array.isArray(rawResult)
        ? {
            totalCount: rawResult?.totalCount,
            currentPage: rawResult?.currentPage,
            totalPages: rawResult?.totalPages,
          }
        : undefined,
    [page, rawResult]
  );

  useEffect(() => {
    if (!onMetaChange) return;
    onMetaChange(responseMeta);
  }, [onMetaChange, responseMeta]);

  if (!enabled) {
    return null;
  }

  const renderLoading = () => {
    if (loadingVariant === "inline") {
      return <InlineLoader message={loadingMessage} className="py-8 justify-center" />;
    }
    if (loadingVariant === "skeleton") {
      return <SectionSkeleton rows={4} className="py-4" />;
    }

    return (
      <div className="flex h-full py-6 w-full justify-center items-center flex-col rounded-md px-6 text-center">
        <BrandedLoader variant="compact" size="md" message={loadingMessage} />
        <span className="mt-3 text-xs uppercase tracking-widest text-default-500">
          Industry Insight
        </span>
        <p className="mt-3 text-lg text-foreground max-w-sm leading-relaxed">
          {randomFact}
        </p>
      </div>
    );
  };

  if (isLoading && !data) {
    return <div className="w-full">{renderLoading()}</div>;
  }

  if (isError) {
    return (
      <div className="text-center p-4">
        {emptyState || (
          <div className="rounded-xl border border-danger-300/50 bg-danger-500/10 px-4 py-3 text-danger-600 dark:text-danger-300">
            Failed to fetch data.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative w-full min-w-0 max-w-full transition-opacity duration-300 ${isFetching && !isLoading ? "opacity-90" : "opacity-100"}`}>
      {isFetching && !isLoading && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-end px-2 pt-2">
          <div className="rounded-full border border-warning-500/20 bg-background/85 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-warning-500 shadow-sm backdrop-blur-sm">
            {isPlaceholderData ? "Refreshing view" : "Syncing"}
          </div>
        </div>
      )}
      {children(responseData as T, refetch, responseMeta)}
    </div>
  );
}

export default QueryComponent;
