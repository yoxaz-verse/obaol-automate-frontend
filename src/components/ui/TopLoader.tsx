"use client";

import React, { useEffect, useState } from "react";
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
        <div
            aria-hidden="true"
            className={`fixed left-0 right-0 top-0 z-[99999] h-1 origin-left bg-obaol-500 shadow-[0_0_10px_rgba(207,152,60,0.55)] transition-[opacity,transform] duration-500 ease-in-out ${
                loading ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
            }`}
        />
    );
}
