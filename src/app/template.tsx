"use client";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
function Template({ children }: { children: React.ReactNode }) {
  return (
    <AnimatePresence>
      <motion.div
        key={usePathname()}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        // exit={{ y: -50, opacity: 0 }}
        transition={{ duration: 1, delay: 0.3, ease: "easeIn" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default Template;
