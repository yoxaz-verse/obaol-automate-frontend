"use client";
import React, { useMemo } from "react";
import { getData } from "@/core/api/apiHandler";
import { useQuery } from "@tanstack/react-query";
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
  } =
    props;
  const randomFact = useMemo(() => {
    return loadingFacts[Math.floor(Math.random() * loadingFacts.length)];
  }, []);

  const params = {
    ...(page !== undefined && { page }),
    ...(limit !== undefined && { limit }),
    ...(search && { search }),
    ...(additionalParams || {}),
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: () => getData(api, params),
    staleTime: 30_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    retry: 1,
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
  const responseMeta = page !== undefined && rawResult && !Array.isArray(rawResult)
    ? {
      totalCount: rawResult?.totalCount,
      currentPage: rawResult?.currentPage,
      totalPages: rawResult?.totalPages,
    }
    : undefined;

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

  if (isLoading) {
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

  return <div className="w-full min-w-0 max-w-full">{children(responseData as T, refetch, responseMeta)}</div>;
}

export default QueryComponent;
