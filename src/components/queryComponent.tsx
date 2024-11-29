// components/QueryComponent.tsx
"use client";
import React from "react";
import { getData } from "@/core/api/apiHandler";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Spinner } from "@nextui-org/react";

interface QueryComponentProps<T> {
  api: string;
  queryKey: string[];
  children: (data: T) => React.ReactNode;
  page: number;
  limit?: number;
  search?: string | null;
}

function QueryComponent<T>(props: QueryComponentProps<T>) {
  const { api, queryKey, children } = props;

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () =>
      getData(api, {
        page: props.page,
        limit: props.limit,
        search: props.search,
      }),
  });

  if (isLoading) {
    toast.loading(`Fetching API for ${queryKey}`, {
      position: "top-right",
    });
    return <Spinner label="Loading..." color="primary" labelColor="primary" />;
  }

  if (isError) {
    toast.error(data?.data.message, {
      position: "top-right",
    });
    return <div>Query Failed...</div>;
  }
  toast.success(data?.data.message, {
    position: "top-right",
  });
  // Pass the data to the children
  return <div>{children && children(data?.data?.data as T)}</div>;
}

export default QueryComponent;
