"use client";

export type ShortcutAction =
  | "marketplace"
  | "enquiries"
  | "sampleRequests"
  | "orders"
  | "documents"
  | "imports"
  | "panels"
  | "warehouseSpace"
  | "externalOrders";

export type ShortcutConfig = Record<ShortcutAction, string>;

export const SHORTCUT_STORAGE_KEY = "dashboardShortcuts";

export const DEFAULT_SHORTCUTS: ShortcutConfig = {
  marketplace: "M",
  enquiries: "E",
  sampleRequests: "S",
  orders: "O",
  documents: "K",
  imports: "I",
  panels: "P",
  warehouseSpace: "Y",
  externalOrders: "U",
};

export const ACTION_LABELS: Record<ShortcutAction, string> = {
  marketplace: "Marketplace",
  enquiries: "Enquiries",
  sampleRequests: "Sample Requests",
  orders: "Orders",
  documents: "Documents",
  imports: "Imports",
  panels: "Dashboard Panels",
  warehouseSpace: "Warehouse Space",
  externalOrders: "External Orders",
};

export const ACTION_ROUTES: Record<ShortcutAction, string> = {
  marketplace: "/dashboard/marketplace",
  enquiries: "/dashboard/enquiries",
  sampleRequests: "/dashboard/sample-requests",
  orders: "/dashboard/orders",
  documents: "/dashboard/documents",
  imports: "/dashboard/imports",
  panels: "/dashboard",
  warehouseSpace: "/dashboard/warehouse-rent",
  externalOrders: "/dashboard/external-orders",
};

export const loadShortcuts = () => {
  if (typeof window === "undefined") return DEFAULT_SHORTCUTS;
  try {
    const stored = window.localStorage.getItem(SHORTCUT_STORAGE_KEY);
    if (!stored) return DEFAULT_SHORTCUTS;
    const parsed = JSON.parse(stored) as Partial<ShortcutConfig>;
    return { ...DEFAULT_SHORTCUTS, ...parsed };
  } catch {
    return DEFAULT_SHORTCUTS;
  }
};

export const saveShortcuts = (config: ShortcutConfig) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SHORTCUT_STORAGE_KEY, JSON.stringify(config));
};
