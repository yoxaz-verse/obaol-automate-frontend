"use client";
import React, { useMemo } from "react";
import { getData } from "@/core/api/apiHandler";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { loadingFacts } from "@/data/loading-facts";
import BrandedLoader from "@/components/ui/BrandedLoader";
import InlineLoader from "@/components/ui/InlineLoader";
import SectionSkeleton from "@/components/ui/SectionSkeleton";
import { QueryComponentProps } from "@/data/interface-data";
import { useReducedMotion } from "framer-motion";
import { sectionTransition } from "@/lib/motion/variants";

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
  const reducedMotion = useReducedMotion();
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
        <motion.span
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
          className="mt-3 text-xs uppercase tracking-widest text-default-500"
        >
          Industry Insight
        </motion.span>
        <motion.p
          key={randomFact}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ delay: reducedMotion ? 0 : 0.15, duration: reducedMotion ? 0 : 0.25 }}
          className="mt-3 text-lg text-foreground max-w-sm leading-relaxed"
        >
          {randomFact}
        </motion.p>
      </div>
    );
  };

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={sectionTransition(Boolean(reducedMotion)).initial}
          animate={sectionTransition(Boolean(reducedMotion)).animate}
          transition={sectionTransition(Boolean(reducedMotion)).transition}
          className="w-full"
        >
          {renderLoading()}
        </motion.div>


      )
        : isError ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center p-4"
          >
            {emptyState || (
              <div className="rounded-xl border border-danger-300/50 bg-danger-500/10 px-4 py-3 text-danger-600 dark:text-danger-300">
                Failed to fetch data.
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="data"
            initial={sectionTransition(Boolean(reducedMotion)).initial}
            animate={sectionTransition(Boolean(reducedMotion)).animate}
            transition={sectionTransition(Boolean(reducedMotion)).transition}
            className="w-full min-w-0 max-w-full"
          >
            {children(responseData as T, refetch)}
          </motion.div>
        )}
    </AnimatePresence>
  );
}

export default QueryComponent;
