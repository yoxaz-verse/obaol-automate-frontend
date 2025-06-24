"use client";
import React from "react";
import { getData } from "@/core/api/apiHandler";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface QueryComponentProps<T> {
  api: string;
  queryKey: any[];
  children: (data: T, refetch?: () => void) => React.ReactNode;
  page?: number;
  limit?: number;
  search?: string | null;
  additionalParams?: Record<string, any>;
}

function QueryComponent<T>(props: QueryComponentProps<T>) {
  const { api, queryKey, children, page, limit, search, additionalParams } =
    props;

  const params = {
    ...(page !== undefined && { page }),
    ...(limit !== undefined && { limit }),
    ...(search && { search }),
    ...(additionalParams || {}),
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: () => getData(api, params),
  });

  const responseData = page ? data?.data?.data : data?.data;

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3 }}
          className="flex h-full py-4 w-full justify-center items-center flex-col bg-neutral-950 rounded-md"
        >
          <Image
            src="/obaol.gif"
            width={200}
            height={200}
            alt="Obaol Supreme"
            className="w-max rounded-md"
          />
          <b className="text-warning-400">Loading ..</b>
        </motion.div>
      ) : isError ? (
        <motion.div
          key="error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-red-500 text-center p-4"
        >
          <p>❌ Failed to fetch data.</p>
        </motion.div>
      ) : (
        <motion.div
          key="data"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children(responseData as T, refetch)}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default QueryComponent;
