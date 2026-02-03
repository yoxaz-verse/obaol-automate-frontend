"use client";
import React, { useMemo } from "react";
import { getData } from "@/core/api/apiHandler";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Spinner } from "@nextui-org/react";
import { loadingFacts } from "@/data/loading-facts";

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
          className="flex h-full py-6 w-full justify-center items-center flex-col rounded-md px-6 text-center"
        >
          {/* Logo */}
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >

            <Image
              src="/logo.png"
              priority
              width={100}
              height={100}
              alt="Obaol Supreme"
              className="rounded-md"
            />
          </motion.div>

          {/* Context Label */}
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-6 text-xs uppercase tracking-widest text-neutral-500"
          >
            Industry Insight
          </motion.span>

          {/* Fact */}
          <motion.p
            key={randomFact}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="mt-3 text-lg text-foreground max-w-sm leading-relaxed"
          >
            {randomFact}
          </motion.p>
        </motion.div>


      )
        : isError ? (
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
