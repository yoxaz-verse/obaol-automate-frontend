"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useDashboardNavigation } from "@/context/DashboardNavigationContext";

export default function DashboardContentReady() {
  const pathname = usePathname();
  const { markContentReady } = useDashboardNavigation();

  useEffect(() => {
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => markContentReady(pathname));
    });
    return () => {
      cancelAnimationFrame(firstFrame);
      if (secondFrame) cancelAnimationFrame(secondFrame);
    };
  }, [markContentReady, pathname]);

  return null;
}
