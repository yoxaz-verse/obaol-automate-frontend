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
                    className="fixed left-0 right-0 top-0 z-[99999] h-1 bg-obaol-500 shadow-[0_0_10px_rgba(207,152,60,0.55)]"
                />
            )}
        </AnimatePresence>
    );
}
