import { getData } from "@/core/api/apiHandler";
import { useQuery } from "@tanstack/react-query";
import React from "react";

interface QueryComponentProps<T> {
  api: string;
  queryKey: string[];
  children?: (data: T) => React.ReactNode;
  page: number;
  limit?: number;
}

function QueryComponent<T>(props: QueryComponentProps<T>) {
  const { api, queryKey, children } = props;

  const data = useQuery({
    queryKey,
    queryFn: () => getData(api, { page: props.page, limit: props.limit }),
  });
  console.log(data)

  if (data.isLoading) {
    return <div>Query Loading...</div>;
  }

  if (data.isError) {
    return <div>Query Failed...</div>;
  }

  // Pass the data to the children
  return <div>{children && children(data.data?.data?.data as T)}</div>;
}

export default QueryComponent;
