"use client";

import { useEffect, useState, type ComponentType } from "react";
import DashboardRouteSkeleton from "@/components/dashboard/DashboardRouteSkeleton";

export default function DeferredInventoryList() {
  const [InventoryList, setInventoryList] = useState<ComponentType | null>(null);

  useEffect(() => {
    let active = true;
    const load = () => {
      void import("./InventoryList").then((module) => {
        if (active) setInventoryList(() => module.default);
      });
    };
    const idleWindow = window as Window & { requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (idleWindow.requestIdleCallback) {
      const id = idleWindow.requestIdleCallback(load, { timeout: 250 });
      return () => {
        active = false;
        idleWindow.cancelIdleCallback?.(id);
      };
    }
    const id = window.setTimeout(load, 0);
    return () => {
      active = false;
      window.clearTimeout(id);
    };
  }, []);

  return InventoryList ? <InventoryList /> : <DashboardRouteSkeleton label="Preparing inventory" />;
}
