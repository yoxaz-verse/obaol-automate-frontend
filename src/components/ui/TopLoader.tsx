"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function TopLoader() {
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // When pathname changes, we show the loader briefly
        // This isn't a perfect representation of "loading" in Next.js App Router
        // but it provides the feeling of "something happened" immediately.
        // For more complex states, we rely on the Sidebar's useTransition.
        setLoading(true);
        const timeout = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timeout);
    }, [pathname]);

    return (
        <AnimatePresence>
            {loading && (
                <motion.div
                    initial={{ scaleX: 0, opacity: 1, originX: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="fixed top-0 left-0 right-0 h-1 bg-warning-500 z-[99999] shadow-[0_0_10px_rgba(245,165,36,0.5)]"
                />
            )}
        </AnimatePresence>
    );
}
