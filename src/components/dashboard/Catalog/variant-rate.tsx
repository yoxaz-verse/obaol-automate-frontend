"use client";

import React, { useContext, useEffect, useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  CardBody,
  Chip,
  Divider,
  Input,
  Textarea,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Spacer,
  Switch,
  useDisclosure,
  Tooltip,
  Spinner,
  Autocomplete,
  AutocompleteItem,
  Pagination,
} from "@nextui-org/react";
import {
  FiMessageSquare,
  FiPlusCircle,
  FiCheckCircle,
  FiPhone,
  FiUser,
  FiPackage,
  FiInfo,
  FiArrowRight,
  FiList,
  FiGrid,
  FiLayout,
  FiX,
  FiShoppingBag,
  FiPlus,
  FiMenu,
} from "react-icons/fi";
import { LuMessageSquare, LuBox } from "react-icons/lu";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import AssociateSearch from "../Users/AssociateSearch";

import VariantRateWizardModal from "@/components/dashboard/Catalog/VariantRateWizardModal";
import CommonTable from "@/components/CurdTable/common-table";
import QueryComponent from "@/components/queryComponent";
import SelectModal from "./select-modal"; // Commission logic
import AddToCatalogModal from "./AddToCatalogModal";
import AuthContext from "@/context/AuthContext";
import { getData, patchData, postData } from "@/core/api/apiHandler";
import {
  associateRoutes,
  variantRateRoutes,
  apiRoutes,
  displayedRateRoutes,
  catalogItemRoutes,
  inventoryRoutes,
} from "@/core/api/apiRoutes";
import {
  apiRoutesByRole,
  generateColumns,
  initialTableConfig,
} from "@/utils/tableValues";
import EditModal from "@/components/CurdTable/edit-model";
import DeleteModal from "@/components/CurdTable/delete";
import DynamicFilter from "@/components/CurdTable/dynamic-filtering";
import TableFrame from "@/components/CurdTable/table-frame";
import { useCurrency } from "@/context/CurrencyContext";
import { fetchDependentOptions } from "@/utils/fetchDependentOptions";
import { showToastMessage } from "@/utils/utils";
import {
  useCalculationConfig,
  DEFAULT_CALCULATION_CONFIG,
} from "@/hooks/useCalculationConfig";
import type { QueryComponentMeta } from "@/data/interface-data";

const round2 = (value: number) =>
  Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
const isValidObjectId = (value: any) =>
  /^[a-f0-9]{24}$/i.test(String(value || "").trim());
const resolveAdminCommission = (
  rateValue: any,
  commissionValue: any,
  commissionPercent: number,
) => {
  const numericCommission = Number(commissionValue);
  if (Number.isFinite(numericCommission) && numericCommission > 0)
    return numericCommission;
  const rate = Number(rateValue || 0);
  const percent = Number.isFinite(commissionPercent)
    ? commissionPercent
    : DEFAULT_CALCULATION_CONFIG.variantRateCommissionPercent;
  return round2(rate * (percent / 100));
};
const truncateWithDots = (value: any, limit = 12) => {
  const str = String(value ?? "");
  if (str.length <= limit) return str;
  return `${str.slice(0, limit)}..`;
};
const toDisplayText = (value: any, fallback = "N/A"): string => {
  if (value === null || value === undefined) return fallback;
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    const out = String(value).trim();
    return out || fallback;
  }
  if (Array.isArray(value)) {
    const out = value
      .map((entry) => toDisplayText(entry, ""))
      .filter(Boolean)
      .join(", ");
    return out || fallback;
  }
  if (typeof value === "object") {
    const out =
      toDisplayText(value?.name, "") ||
      toDisplayText(value?.label, "") ||
      toDisplayText(value?.title, "") ||
      toDisplayText(value?.slug, "");
    return out || fallback;
  }
  return fallback;
};
const extractClassifications = (product: any): string[] => {
  if (!product) return ["Conventional"];
  const labels: string[] = [];
  const hasPrimary = Boolean(
    product.isNatural || product.isOrganic || product.isIpmQuality,
  );
  if (!hasPrimary) labels.push("Conventional");
  if (product.isNatural) labels.push("Natural");
  if (product.isOrganic) labels.push("Organic");
  if (product.isIpmQuality) labels.push("IPM");
  if (product.isGiTagged) labels.push("GI Tag");
  return labels;
};
const classificationTone = (label: string): string => {
  const key = String(label || "").toLowerCase();
  if (key === "organic")
    return "bg-success-500/15 text-success-400 border-success-500/30";
  if (key === "natural")
    return "bg-secondary-500/15 text-secondary-400 border-secondary-500/30";
  if (key.includes("gi"))
    return "bg-warning-500/15 text-warning-400 border-warning-500/30";
  return "bg-default-500/15 text-default-300 border-default-400/20";
};
const formatLastLiveDate = (value: any) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, today)) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-warning-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(234,179,8,0.8)]" />
        <span className="text-[10px] font-black text-warning-500 uppercase tracking-[0.1em] italic">
          Today
        </span>
      </div>
    );
  }

  if (sameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/**
 * Props for your existing VariantRate component
 */
interface VariantRateProps {
  productVariant?: any;
  displayOnly?: boolean;
  VariantRateMixed?: boolean;
  rate: "variantRate" | "displayedRate" | "catalogItem";
  refetchData?: () => void;
  additionalParams?: Record<string, any>;
  showAssociateColumn?: boolean;
  hideBuiltInFilters?: boolean;
  externalSearch?: string;
  externalFilters?: Record<string, any>;
  showInventoryStatus?: boolean;
  inventoryCompanyId?: string | null;
  showCreateButton?: boolean;
  openCreateModalSignal?: number;
}

/**
 * The main "VariantRate" component that:
 *  - Lists variantRates or displayedRates in a table
 *  - Has an AddModal to create new variantRates (if not displayOnly)
 *  - For each row, shows SelectModal, LiveToggle, and now "CreateEnquiryButton"
 */
const VariantRate: React.FC<VariantRateProps> = ({
  productVariant,
  refetchData,
  rate,
  displayOnly,
  VariantRateMixed,
  additionalParams,
  showAssociateColumn = false,
  hideBuiltInFilters = false,
  externalSearch,
  externalFilters,
  showInventoryStatus = false,
  inventoryCompanyId = null,
  showCreateButton = true,
  openCreateModalSignal,
}) => {
  const router = useRouter();
  const productVariantValue = productVariant || null;
  const tableConfig = { ...initialTableConfig }; // avoid mutations
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  // Step 1: Combine all fields
  const combinedFields = [
    ...(tableConfig["category"] || []),
    ...(tableConfig["subCategory"] || []),
    ...(tableConfig["product"] || []),
    ...(tableConfig["productVariant"] || []),
    ...(tableConfig["variantRate"] || []),
  ];

  // Step 2: Create a map to track the preferred field (prefer "select" over "text")
  const fieldMap = new Map<string, any>();

  combinedFields.forEach((field) => {
    const existing = fieldMap.get(field.key);

    if (!existing) {
      fieldMap.set(field.key, field);
    } else if (existing.type === "text" && field.type === "select") {
      // Replace text with select if exists
      fieldMap.set(field.key, field);
    }
    // If existing is select, we ignore the text one
  });

  // Step 3: Final filtered field list
  let filterVariantRateFormFields = Array.from(fieldMap.values());

  if (user?.role === "Associate") {
    filterVariantRateFormFields = filterVariantRateFormFields.filter(
      (field) =>
        field.key !== "associate" &&
        field.key !== "associateCompany" &&
        field.key !== "district" &&
        field.key !== "division" &&
        field.key !== "pincodeEntry",
    );
  }

  const { convertRate, formatRate } = useCurrency();
  const roleLower = String(user?.role || "").toLowerCase();
  const { data: calculationConfig } = useCalculationConfig(
    roleLower === "admin",
  );
  const commissionPercent =
    calculationConfig?.variantRateCommissionPercent ??
    DEFAULT_CALCULATION_CONFIG.variantRateCommissionPercent;
  const isOperatorUser = roleLower === "operator" || roleLower === "team";
  const isAdminUser = roleLower === "admin" || isOperatorUser;
  const isAssociateUser = roleLower === "associate";
  const hasLinkedCompany = Boolean((user as any)?.associateCompanyId);
  const canAddOwnRate = isAdminUser || (isAssociateUser && hasLinkedCompany);
  const isMarketplaceView = additionalParams?.view === "marketplace";
  const canManageRow = (item: any) => {
    if (!item) return false;
    if (roleLower === "admin") return true;
    if (
      isOperatorUser &&
      !item.isMarketplaceView &&
      !item.isCatalogView &&
      Boolean(item.companyId)
    )
      return true;
    return Boolean(item.isOwnerView || item.isCatalogView);
  };

  const [filters, setFilters] = useState<Record<string, any>>({}); // Dynamic filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  type ViewMode = "grid" | "list" | "table" | "compact";
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);
  const limit = isMarketplaceView ? 24 : 24;
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [inventoryQty, setInventoryQty] = useState("");
  const [inventorySubmitting, setInventorySubmitting] = useState(false);
  const [selectedInventoryRate, setSelectedInventoryRate] = useState<any>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [publicDisplayMeta, setPublicDisplayMeta] = useState<
    QueryComponentMeta | undefined
  >(undefined);
  const effectiveFilters = externalFilters ?? filters;
  const effectiveSearch = String(
    externalSearch ?? debouncedSearch ?? "",
  ).trim();
  const serverSearch = effectiveSearch;
  const productVariantId = productVariantValue?._id;
  const stableAdditionalParams = useMemo(
    () => JSON.stringify(additionalParams || {}),
    [additionalParams],
  );
  const stableEffectiveFilters = useMemo(
    () => JSON.stringify(effectiveFilters || {}),
    [effectiveFilters],
  );
  const handleFiltersUpdate = (updatedFilters: Record<string, any>) => {
    setFilters(updatedFilters); // Update the filters
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [
    serverSearch,
    productVariantId,
    stableEffectiveFilters,
    stableAdditionalParams,
  ]);

  useEffect(() => {
    if (!openCreateModalSignal) return;
    setWizardOpen(true);
  }, [openCreateModalSignal]);

  const { data: variantResponse } = useQuery({
    queryKey: ["displayedRate", user?.id],
    queryFn: () =>
      getData(displayedRateRoutes.getAll, {
        associate: user?.id,
        ...(additionalParams || {}),
        ...(productVariantValue && { productVariant: productVariantValue._id }),
      }),
    enabled: VariantRateMixed === true && !!user?.id,
  });

  // Fetch CatalogItems for the current user to handle "Added" state in Marketplace
  const { data: catalogItemsResponse } = useQuery({
    queryKey: ["catalogItems", user?.id],
    queryFn: () => getData(catalogItemRoutes.getAll, { associateId: user?.id }),
    enabled: !!user?.id && user?.role === "Associate" && isMarketplaceView,
  });

  const catalogItems = useMemo(
    () =>
      Array.isArray(catalogItemsResponse?.data?.data)
        ? catalogItemsResponse?.data?.data
        : catalogItemsResponse?.data?.data?.data || [],
    [catalogItemsResponse],
  );

  const addedRateIds = useMemo(
    () =>
      new Set(
        catalogItems.map(
          (item: any) => item.baseRateId?._id || item.baseRateId,
        ),
      ),
    [catalogItems],
  );

  useEffect(() => {
    const shouldPrefetchPublicPages = Boolean(
      displayOnly &&
      !user?.id &&
      publicDisplayMeta?.totalPages &&
      publicDisplayMeta.totalPages > 1,
    );
    if (!shouldPrefetchPublicPages) return;

    let cancelled = false;
    const totalPages = Number(publicDisplayMeta?.totalPages || 1);
    const prefetchRemaining = async () => {
      for (let targetPage = 2; targetPage <= totalPages; targetPage += 1) {
        if (cancelled) break;
        try {
          await queryClient.prefetchQuery({
            queryKey: [
              rate,
              apiRoutesByRole[rate],
              productVariantId,
              stableAdditionalParams,
              stableEffectiveFilters,
              serverSearch,
              addedRateIds.size,
              targetPage,
              limit,
              serverSearch,
              {
                ...(effectiveFilters || {}),
                ...(additionalParams || {}),
                ...(isMarketplaceView && { sort: "lastLiveDate:asc" }),
                ...(displayOnly && { selected: "true" }),
                ...(productVariantId && { productVariant: productVariantId }),
              },
            ],
            queryFn: () =>
              getData(apiRoutesByRole[rate], {
                page: targetPage,
                limit,
                ...(serverSearch && { search: serverSearch }),
                ...(effectiveFilters || {}),
                ...(additionalParams || {}),
                ...(isMarketplaceView && { sort: "lastLiveDate:asc" }),
                ...(displayOnly && { selected: "true" }),
                ...(productVariantId && { productVariant: productVariantId }),
              }),
            staleTime: 30_000,
          });
        } catch (prefetchError) {
          console.error(
            `[VariantRate] Public prefetch failed for page ${targetPage}:`,
            prefetchError,
          );
          break;
        }
      }
    };

    prefetchRemaining();
    return () => {
      cancelled = true;
    };
  }, [
    displayOnly,
    user?.id,
    publicDisplayMeta?.totalPages,
    queryClient,
    rate,
    productVariantId,
    stableAdditionalParams,
    stableEffectiveFilters,
    serverSearch,
    addedRateIds.size,
    limit,
    effectiveFilters,
    additionalParams,
    isMarketplaceView,
  ]);

  const { data: inventoryResponse } = useQuery({
    queryKey: ["inventory-status", inventoryCompanyId, user?.id],
    queryFn: () =>
      getData(inventoryRoutes.getAll, {
        limit: 1000,
        ...(inventoryCompanyId && { associateCompany: inventoryCompanyId }),
        ...(isAssociateUser && !inventoryCompanyId && { associate: user?.id }),
      }),
    enabled:
      showInventoryStatus && (Boolean(inventoryCompanyId) || isAssociateUser),
  });

  const inventoryRows = useMemo(
    () =>
      Array.isArray(inventoryResponse?.data?.data?.data)
        ? inventoryResponse?.data?.data?.data
        : inventoryResponse?.data?.data || [],
    [inventoryResponse],
  );

  const inventorySummaryMap = useMemo(() => {
    const summaryMap = new Map<
      string,
      { totalQty: number; warehouses: Set<string> }
    >();
    for (const inv of inventoryRows || []) {
      const pvId = inv.productVariant?._id || inv.productVariant;
      const compId = inv.associateCompany?._id || inv.associateCompany || "";
      if (!pvId) continue;
      const key = `${pvId}::${compId}`;
      if (!summaryMap.has(key)) {
        summaryMap.set(key, { totalQty: 0, warehouses: new Set<string>() });
      }
      const summary = summaryMap.get(key)!;
      summary.totalQty += Number(inv.quantity || 0);
      if (inv.warehouseName) summary.warehouses.add(String(inv.warehouseName));
    }
    return summaryMap;
  }, [inventoryRows]);

  // Build the columns from table config
  const currentTable = rate;

  let columns = generateColumns(currentTable, tableConfig, user?.role);

  if (!showInventoryStatus) {
    columns = columns.filter((column: any) => column.uid !== "inventoryStatus");
  }
  if (isMarketplaceView) {
    columns = columns.filter((column: any) => column.uid !== "inventoryQty");
    if (isAssociateUser || isOperatorUser) {
      columns = columns.filter((column: any) => column.uid !== "location");
    }
  }

  if (
    rate === "variantRate" &&
    showAssociateColumn &&
    isOperatorUser &&
    !columns.some((column: any) => column.uid === "associate")
  ) {
    const productIndex = columns.findIndex(
      (column: any) => column.uid === "productVariant",
    );
    const associateColumn = { name: "ASSOCIATE", uid: "associate" };
    if (productIndex >= 0) {
      columns.splice(productIndex, 0, associateColumn);
    } else {
      columns.push(associateColumn);
    }
  }

  // Rename pricing columns for "Ex Factory" specification in the header
  columns = columns.map((col) => {
    if (col.uid === "rate") return { ...col, name: "PRICE (EX FACTORY)" };
    if (col.uid === "finalRate")
      return { ...col, name: "FINAL PRICE (EX FACTORY)" };
    if (col.uid === "commission") return { ...col, name: "COMMISSION" };
    return col;
  });

  // Return the entire QueryComponent for data fetching
  return (
    <QueryComponent
      api={apiRoutesByRole[rate]}
      queryKey={[
        rate,
        apiRoutesByRole[rate],
        productVariantValue?._id,
        stableAdditionalParams,
        stableEffectiveFilters,
        serverSearch,
        addedRateIds.size, // Refresh when catalog items change
      ]}
      page={page}
      limit={limit}
      search={serverSearch}
      additionalParams={{
        ...(effectiveFilters || {}),
        ...(additionalParams || {}),
        ...(isMarketplaceView && { sort: "lastLiveDate:asc" }),
        ...(displayOnly && { selected: "true" }),
        // ...(!user?.id && { isLive: "true" }),
        ...(productVariantValue && { productVariant: productVariantValue._id }),
      }}
      onMetaChange={displayOnly && !user?.id ? setPublicDisplayMeta : undefined}
    >
      {(variantRateData: any, refetch, meta) => {
        // If we have associates, populate the "associate" field values for AddModal
        const refetchData = () => {
          refetch?.(); // Safely call refetch if it's available
          // Also refetch catalog items if possible?
          // Actually, tanstack query will handle it if we invalidate the key.
        };
        let variantRateFormFields = tableConfig[rate];
        const hasFixedProductVariant = Boolean(productVariantValue?._id);

        // Reuse the same Add Rate flow across Marketplace/Products/Catalog:
        // if no variant is preselected, allow selecting Product Variant in the form.
        if (rate === "variantRate") {
          if (!hasFixedProductVariant) {
            // Inject Category -> SubCategory -> Product hierarchy if not fixed
            const hierarchicalFields = [
              {
                label: "Category",
                type: "select",
                filterType: "multiselect",
                key: "category",
                values: [],
                dynamicValuesFn: () => fetchDependentOptions("category"),
                inForm: true,
                required: true,
              },
              {
                label: "Sub Category",
                type: "select",
                filterType: "multiselect",
                key: "subCategory",
                dependsOn: "category",
                values: [],
                dynamicValuesFn: (categoryId: string) =>
                  fetchDependentOptions("subCategory", "category", categoryId),
                inForm: true,
                required: true,
              },
              {
                label: "Product",
                type: "select",
                filterType: "multiselect",
                key: "product",
                dependsOn: "subCategory",
                values: [],
                dynamicValuesFn: (subCategoryId: string) =>
                  fetchDependentOptions(
                    "product",
                    "subCategory",
                    subCategoryId,
                  ),
                inForm: true,
                required: true,
              },
            ];

            // Prepend hierarchical fields and update productVariant dependency
            variantRateFormFields = [
              ...hierarchicalFields,
              ...(variantRateFormFields || []).map((field: any) => {
                if (field.key !== "productVariant") return field;
                return {
                  ...field,
                  inForm: true,
                  required: true,
                  label: "Product Variant",
                  dependsOn: "product",
                  dynamicValuesFn: (productId: string) =>
                    fetchDependentOptions(
                      "productVariant",
                      "product",
                      productId,
                    ),
                };
              }),
            ];
          } else {
            // If fixed, just ensure productVariant is in correct state (usually it's hidden or disabled since we pass it in additionalVariable)
            variantRateFormFields = (variantRateFormFields || []).map(
              (field: any) => {
                if (field.key === "productVariant") {
                  return { ...field, inForm: false }; // Hide it as it's pre-selected
                }
                return field;
              },
            );
          }
        }

        if (user?.role === "Associate") {
          // Hide both associate and commission for associates
          variantRateFormFields = variantRateFormFields.filter(
            (field: any) =>
              field.key !== "associate" && field.key !== "commission",
          );
        }

        var variantRateFetchedData: any;
        const isMarketplace = isMarketplaceView;

        // Helper: extract array from either a raw array OR a paginated wrapper
        // QueryComponent returns data?.data?.data which is { data: [...], totalCount: N, ... }
        // when the backend uses the generic CRUD engine with pagination.
        const extractArray = (raw: any): any[] => {
          if (Array.isArray(raw)) return raw;
          if (raw?.data && Array.isArray(raw.data)) return raw.data;
          return [];
        };

        // For Marketplace, use ONLY raw VariantRate data (no merge with DisplayedRate)
        if (isMarketplace || rate === "catalogItem") {
          variantRateFetchedData = extractArray(variantRateData);
        } else if (variantResponse?.data.data.data) {
          // For My Products view, merge with DisplayedRate if available
          variantRateFetchedData =
            mergeVariantAndDisplayedOnce(
              variantRateData as any, // Global (VariantRate)
              variantResponse?.data.data.data, // Personal (DisplayedRate)
            ) || [];
        } else {
          variantRateFetchedData = extractArray(variantRateData);
        }

        // Inside your component, above the return:
        const FIFTEEN_MINUTES = 15 * 60 * 1000;
        const isCooling = (startTimestamp: string) =>
          new Date(startTimestamp).getTime() + FIFTEEN_MINUTES > Date.now();
        // Transform the rows if needed
        const tableData = (variantRateFetchedData || [])
          .filter((item: any) => {
            if (rate !== "variantRate") return true;
            if (isMarketplace) {
              // Marketplace must not hide rows just because some relations are sparsely populated.
              // Keep only a minimal guard against malformed documents.
              return Boolean(item?._id || item?.id);
            }
            return Boolean(
              item.associate ||
              item.associateCompany ||
              item.associateId ||
              item.associateCompanyId,
            );
          })
          .map((item: any) => {
            const { isDeleted, isActive, password, __v, ...rest } = item;

            if (rate === "variantRate") {
              // Row is a VariantRate (My Products OR Marketplace)
              const isMarketplace = isMarketplaceView;
              const isOwner =
                item.associate?._id === user?.id || item.associate === user?.id;
              const pvId =
                item.productVariant?._id ||
                item.productVariant ||
                item.productVariantId;
              const compId =
                item.associateCompany?._id || item.associateCompany || "";
              const inventorySummary = showInventoryStatus
                ? inventorySummaryMap.get(`${pvId}::${compId}`)
                : null;
              const inventoryStatus = inventorySummary
                ? `In Stock: ${inventorySummary.totalQty} MT • Warehouses: ${inventorySummary.warehouses.size}`
                : "No inventory";
              const hasInventory = Boolean(
                inventorySummary && inventorySummary.totalQty > 0,
              );

              const supplierRate = item.rate || 0;
              const quantityValue = item.quantity;
              const adminCommission = resolveAdminCommission(
                supplierRate,
                item.commission,
                commissionPercent,
              );
              const totalRate = supplierRate + adminCommission;
              const isCommissionAdded = Number(adminCommission) > 0;
              const locationDisplay =
                toDisplayText(item.locationDisplay, "").trim() ||
                (toDisplayText(item.locationSource, "").toUpperCase() ===
                "WAREHOUSE"
                  ? toDisplayText(
                      item.warehouseId?.address || item.warehouseId?.name,
                      "",
                    )
                  : toDisplayText(
                      item.officeAddress || item.associateCompany?.address,
                      "",
                    ));

              // Rule: Owners see base rate only. Non-owners see final price (base + admin commission).
              const displayedPrice =
                isOwner && !isMarketplace ? supplierRate : totalRate;

              const productVariantLabel = String(
                (
                  (item.productVariant?.product?.name || "") +
                  " " +
                  (item.productVariant?.name || item.productVariantName || "")
                ).trim() || "N/A",
              );
              const productClassifications = extractClassifications(
                item.productVariant?.product,
              );
              const classificationText = productClassifications.join(" ");

              return {
                ...rest,
                isLive: Boolean(item.isLive),
                liveStatus: (
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${item.isLive ? "bg-success-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-danger-500/40"}`}
                    />
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest ${item.isLive ? "text-success-400" : "text-default-400"}`}
                    >
                      {item.isLive ? "LIVE_NODE" : "OFFLINE"}
                    </span>
                  </div>
                ),
                associate: (
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-foreground uppercase tracking-tight line-clamp-1">
                      {toDisplayText(
                        item.associateCompany?.name,
                        isOwner ? "My Company" : "OBAOL",
                      )}
                    </span>
                    <span className="text-[9px] text-default-400 uppercase tracking-widest">
                      ID:{" "}
                      {String(
                        item.associate?._id || item.associate || "---",
                      ).slice(-6)}
                    </span>
                  </div>
                ),
                associateId: item.associate?._id || item.associate,
                companyId:
                  item.associateCompany?._id ||
                  item.associateCompany ||
                  item.associate?.associateCompany,
                productVariant: productVariantLabel,
                product: toDisplayText(item.productVariant?.product?.name),
                location: locationDisplay || "--",
                productId:
                  item.productVariant?.product?._id ||
                  item.productVariant?.product,
                productVariantId:
                  item.productVariant?._id ||
                  item.productVariant ||
                  item.productVariantId,
                classification: (
                  <div className="flex flex-wrap gap-1">
                    {productClassifications.map((label) => (
                      <span
                        key={`${item._id}-${label}`}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${classificationTone(label)}`}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                ),
                classificationText,

                // Column Mapping
                rate: (
                  <span className="text-warning-500 font-bold tracking-tight text-sm">
                    {isAdminUser && isMarketplace
                      ? formatRate(totalRate)
                      : user?.role?.toLowerCase() === "admin"
                        ? formatRate(supplierRate)
                        : formatRate(displayedPrice)}
                  </span>
                ),
                commission: (
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-black ${isCommissionAdded ? "text-primary-400" : "text-default-400"}`}
                    >
                      {isAdminUser && isMarketplace
                        ? isCommissionAdded
                          ? formatRate(adminCommission)
                          : "-"
                        : adminCommission
                          ? formatRate(adminCommission)
                          : "0.00"}
                    </span>
                    {isCommissionAdded && (
                      <div className="w-1 h-3 bg-primary-500/20 rounded-full" />
                    )}
                  </div>
                ),
                commissionStatus: isCommissionAdded ? "+" : "-",
                finalRate: (
                  <span className="text-foreground font-black text-sm tracking-tight border-b border-default-200 pb-0.5">
                    {formatRate(totalRate)}
                  </span>
                ),
                quantity:
                  quantityValue !== undefined &&
                  quantityValue !== null &&
                  quantityValue !== "" ? (
                    <div className="flex items-center gap-1.5">
                      <FiPackage size={12} className="text-default-400" />
                      <span className="font-bold text-foreground">
                        {quantityValue}
                      </span>
                      <span className="text-[9px] text-default-400 uppercase">
                        {item.quantityUnit || "MT"}
                      </span>
                    </div>
                  ) : (
                    "-"
                  ),
                quantityRaw: quantityValue,
                inventoryQty: inventorySummary ? (
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-3 bg-success-500/40 rounded-full" />
                    <span className="font-bold text-success-400">
                      {inventorySummary.totalQty} MT
                    </span>
                  </div>
                ) : (
                  ""
                ),
                inventoryStatus,
                hasInventory,

                rawBasePrice: totalRate,
                rawCommission: 0,
                isMarketplaceView: isMarketplace,
                isOwnerView: isOwner && !isMarketplace,
                isAdded: addedRateIds.has(item._id),
                lastLiveDate: (
                  <div className="flex items-center justify-start min-w-[80px]">
                    {formatLastLiveDate(
                      item.lastLiveDate || item.updatedAt || item.createdAt,
                    )}
                  </div>
                ),
              };
            } else if (rate === "catalogItem") {
              // Row is a CatalogItem (Added to Catalog)
              const baseRate = item.baseRateId;
              const supplierRate = baseRate?.rate || 0;
              const quantityValue = baseRate?.quantity;
              const adminCommission = resolveAdminCommission(
                baseRate?.rate,
                baseRate?.commission,
                commissionPercent,
              );
              const mediatorMarkup = item.margin || 0;

              // Rule: Mediator sees final display rate (Base + Admin + Mediator Markup)
              const finalPrice =
                supplierRate + adminCommission + mediatorMarkup;

              return {
                ...rest,
                isLive: item.isLive && baseRate?.isLive !== false,
                actualIsLive: item.isLive,
                supplierIsLive: baseRate?.isLive !== false,
                associate: toDisplayText(
                  item.associateCompanyId?.name || item.associateCompanyId,
                  "My Company",
                ),
                rate: finalPrice,
                commission: mediatorMarkup || 0,
                quantity:
                  quantityValue !== undefined &&
                  quantityValue !== null &&
                  quantityValue !== ""
                    ? `${quantityValue} MT`
                    : "-",
                quantityRaw: quantityValue,
                associateId: item.associateId?._id || item.associateId,
                originalOwnerId:
                  baseRate?.associate?._id || baseRate?.associate,
                companyId:
                  item.associateCompanyId?._id || item.associateCompanyId,
                productVariant: toDisplayText(item.productVariantId?.name),
                product: toDisplayText(item.productVariantId?.product?.name),
                productId:
                  item.productVariantId?.product?._id ||
                  item.productVariantId?.product,
                productVariantId: item.productVariantId?._id,
                classification: (
                  <div className="flex flex-wrap gap-1">
                    {extractClassifications(item.productVariantId?.product).map(
                      (label) => (
                        <span
                          key={`${item._id}-${label}`}
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${classificationTone(label)}`}
                        >
                          {label}
                        </span>
                      ),
                    )}
                  </div>
                ),
                classificationText: extractClassifications(
                  item.productVariantId?.product,
                ).join(" "),
                rawBasePrice: supplierRate + adminCommission,
                rawCommission: mediatorMarkup,
                customTitle: item.customTitle,
                variantRate: item.baseRateId,
                isCatalogView: true,
                isAdded: true,
                isOwnerView: true,
                lastLiveDate: (
                  <div className="flex items-center justify-start min-w-[80px]">
                    {formatLastLiveDate(
                      item.lastLiveDate || item.updatedAt || item.createdAt,
                    )}
                  </div>
                ),
              };
            } else {
              // Row is a DisplayedRate (Personalized - fallback/old)
              const supplierRate = item.variantRate?.rate || 0;
              const quantityValue = item.variantRate?.quantity;
              const adminCommission = resolveAdminCommission(
                item.variantRate?.rate,
                item.variantRate?.commission,
                commissionPercent,
              );
              const basePriceForUser = supplierRate + adminCommission;

              const associateMargin = item.commission || 0;
              const totalRate = basePriceForUser + associateMargin;
              return {
                ...rest,
                isLive: item.isLive,
                associate: toDisplayText(
                  item.associateCompany?.name || item.associateCompany,
                  "My Company",
                ),
                rate: totalRate,
                quantity:
                  quantityValue !== undefined &&
                  quantityValue !== null &&
                  quantityValue !== ""
                    ? `${quantityValue} MT`
                    : "-",
                quantityRaw: quantityValue,
                associateId: item.associate?._id,
                companyId: item.associate?.associateCompany,
                productVariant: toDisplayText(
                  item.variantRate?.productVariant?.name,
                ),
                product: toDisplayText(
                  item.variantRate?.productVariant?.product?.name,
                ),
                productId:
                  item.variantRate?.productVariant?.product?._id ||
                  item.variantRate?.productVariant?.product,
                productVariantId: item.variantRate?.productVariant?._id,
                classification: (
                  <div className="flex flex-wrap gap-1">
                    {extractClassifications(
                      item.variantRate?.productVariant?.product,
                    ).map((label) => (
                      <span
                        key={`${item._id}-${label}`}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${classificationTone(label)}`}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                ),
                classificationText: extractClassifications(
                  item.variantRate?.productVariant?.product,
                ).join(" "),
                rawBasePrice: basePriceForUser,
                rawCommission: associateMargin,
                variantRateId: item.variantRate?._id,
                lastLiveDate: (
                  <div className="flex items-center justify-start min-w-[80px]">
                    {formatLastLiveDate(
                      item.lastLiveDate || item.updatedAt || item.createdAt,
                    )}
                  </div>
                ),
              };
            }
          });

        const searchText = effectiveSearch.toLowerCase();
        const shouldApplyClientSearch =
          !serverSearch && !isMarketplaceView && Boolean(searchText);
        let finalTableData = shouldApplyClientSearch
          ? tableData.filter((row: any) => {
              const haystack = [
                toDisplayText(row.product, ""),
                toDisplayText(row.productVariant, ""),
                toDisplayText(row.associate, ""),
                row.warehouseName,
                toDisplayText(row.rate, ""),
                toDisplayText(row.quantity, ""),
                toDisplayText(row.classificationText, ""),
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
              return haystack.includes(searchText);
            })
          : tableData;

        finalTableData = finalTableData.map((row: any) => {
          let vName = toDisplayText(row.productVariant, "");
          let pName = toDisplayText(row.product, "");
          if (vName && pName && vName.toLowerCase().startsWith(pName.toLowerCase())) {
            vName = vName.slice(pName.length).trim();
            vName = vName || "Base";
          }
          return { ...row, productVariant: vName };
        });

        return (
          <div className="w-full max-w-full min-w-0">
            {(!hideBuiltInFilters ||
              (!displayOnly && rate === "variantRate" && canAddOwnRate)) && (
              <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 mb-8 bg-foreground/[0.03] p-4 rounded-[2rem] border border-foreground/5 backdrop-blur-md shadow-inner">
                {!hideBuiltInFilters && (
                  <div className="w-full sm:flex-1">
                    <DynamicFilter
                      currentTable={"variantRate"}
                      formFields={filterVariantRateFormFields}
                      onApply={handleFiltersUpdate}
                      searchValue={search}
                      onSearchChange={setSearch}
                      searchPlaceholder="Search marketplace rates..."
                      actionElement={
                        !displayOnly &&
                        rate === "variantRate" &&
                        canAddOwnRate &&
                        showCreateButton ? (
                          <div className="shrink-0 shadow-lg shadow-warning-500/10 rounded-2xl overflow-hidden">
                            <Button
                              size="sm"
                              onPress={() => setWizardOpen(true)}
                              variant="shadow"
                              color="warning"
                              className="font-black tracking-widest px-3 sm:px-5 h-10 rounded-xl uppercase text-[9px] sm:text-[11px] shadow-warning-500/30"
                              startContent={
                                <FiPlus size={14} className="sm:w-4 sm:h-4" />
                              }
                            >
                              List your product
                            </Button>
                            <VariantRateWizardModal
                              isOpen={wizardOpen}
                              onClose={() => setWizardOpen(false)}
                              apiEndpoint={apiRoutesByRole[rate]}
                              productVariantValue={productVariantValue}
                              user={user}
                              additionalVariable={{
                                ...(productVariantValue && {
                                  productVariant: productVariantValue._id,
                                }),
                                ...(user?.role === "Associate" && {
                                  associate: user?.id,
                                }),
                              }}
                              onSuccess={() => {
                                refetchData();
                              }}
                            />
                          </div>
                        ) : null
                      }
                    />
                  </div>
                )}
                {hideBuiltInFilters &&
                  !displayOnly &&
                  rate === "variantRate" &&
                  canAddOwnRate &&
                  showCreateButton && (
                    <div className="shrink-0 shadow-lg shadow-warning-500/10 rounded-2xl overflow-hidden ml-auto">
                      <Button
                        size="sm"
                        onPress={() => setWizardOpen(true)}
                        variant="shadow"
                        color="warning"
                        className="font-black tracking-widest px-5 h-10 rounded-xl uppercase text-[11px] shadow-warning-500/30"
                        startContent={<FiPlus size={16} />}
                      >
                        List your product
                      </Button>
                      <VariantRateWizardModal
                        isOpen={wizardOpen}
                        onClose={() => setWizardOpen(false)}
                        apiEndpoint={apiRoutesByRole[rate]}
                        productVariantValue={productVariantValue}
                        user={user}
                        additionalVariable={{
                          ...(productVariantValue && {
                            productVariant: productVariantValue._id,
                          }),
                          ...(user?.role === "Associate" && {
                            associate: user?.id,
                          }),
                        }}
                        onSuccess={() => {
                          refetchData();
                        }}
                      />
                    </div>
                  )}
              </div>
            )}
            {!displayOnly &&
              rate === "variantRate" &&
              isAssociateUser &&
              !hasLinkedCompany && (
                <Card className="mb-4 border border-warning-300/30 bg-warning-500/10">
                  <CardBody className="py-3 px-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-warning-700 dark:text-warning-300">
                          Link a company to add your own rates
                        </p>
                        <p className="text-xs text-warning-700/80 dark:text-warning-200/90">
                          You can still add marketplace products to your
                          personal catalog.
                        </p>
                      </div>
                      <Button
                        size="sm"
                        color="warning"
                        variant="flat"
                        endContent={<FiArrowRight size={14} />}
                        onPress={() => router.push("/dashboard/profile")}
                      >
                        Link Company
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              )}
            <div className="h-5" />
            <section className="w-full">
              {finalTableData.length === 0 &&
              rate === "catalogItem" &&
              isAssociateUser ? (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-content1/30 backdrop-blur-md rounded-[2rem] border border-white/5 shadow-inner">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-warning-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
                    <div className="relative p-6 bg-content2 border border-divider rounded-[2.5rem] text-warning-500 shadow-xl">
                      <FiShoppingBag size={48} strokeWidth={1.5} />
                    </div>
                    <div className="absolute -bottom-2 -right-2 p-2 bg-success-500 text-white rounded-full border-4 border-background shadow-lg">
                      <FiPlus size={16} strokeWidth={3} />
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-foreground tracking-tight uppercase">
                    Your Catalog is Empty
                  </h3>
                  <p className="text-default-500 max-w-[340px] mt-2 mb-8 text-sm leading-relaxed font-medium">
                    Personalize your catalog to share best rates with your
                    buyers. Discover and add global products from the
                    marketplace.
                  </p>
                  <Button
                    color="warning"
                    variant="shadow"
                    size="lg"
                    className="font-black px-10 rounded-2xl h-14 text-sm uppercase tracking-widest shadow-warning-500/20 shadow-lg hover:scale-105 active:scale-95 transition-all text-black"
                    onPress={() => router.push("/dashboard/marketplace")}
                    startContent={<FiShoppingBag size={20} strokeWidth={2.5} />}
                  >
                    Explore Marketplace
                  </Button>
                </div>
              ) : finalTableData.length === 0 &&
                isMarketplaceView &&
                canAddOwnRate ? (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-content1/30 backdrop-blur-md rounded-[2rem] border border-white/5 shadow-inner">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-primary-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
                    <div className="relative p-6 bg-content2 border border-divider rounded-[2.5rem] text-primary-500 shadow-xl">
                      <FiPackage size={48} strokeWidth={1.5} />
                    </div>
                    <div className="absolute -bottom-2 -right-2 p-2 bg-success-500 text-white rounded-full border-4 border-background shadow-lg">
                      <FiPlus size={16} strokeWidth={3} />
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-foreground tracking-tight uppercase">
                    No Live Products Found
                  </h3>
                  <p className="text-default-500 max-w-[340px] mt-2 mb-8 text-sm leading-relaxed font-medium">
                    Be the first to list your products in the live market.
                    Redirect to your personal catalog to set live rates for the
                    network.
                  </p>
                  <Button
                    color="primary"
                    variant="shadow"
                    size="lg"
                    className="font-black px-10 rounded-2xl h-14 text-sm uppercase tracking-widest shadow-primary-500/20 shadow-lg hover:scale-105 active:scale-95 transition-all"
                    onPress={() => router.push("/dashboard/product")}
                    startContent={<FiPlusCircle size={20} strokeWidth={2.5} />}
                  >
                    Add Products to Market
                  </Button>
                </div>
              ) : finalTableData.length === 0 &&
                additionalParams?.isLive === true ? (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-content1/30 backdrop-blur-md rounded-[2rem] border border-white/5 shadow-inner">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-warning-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
                    <div className="relative p-6 bg-content2 border border-divider rounded-[2.5rem] text-warning-500 shadow-xl">
                      <FiShoppingBag size={48} strokeWidth={1.5} />
                    </div>
                    <div className="absolute -bottom-2 -right-2 p-2 bg-default-100 text-default-400 rounded-full border-4 border-background shadow-lg">
                      <FiInfo size={16} strokeWidth={3} />
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-foreground tracking-tight uppercase">
                    No Products Live
                  </h3>
                  <p className="text-default-500 max-w-[340px] mt-2 mb-8 text-sm leading-relaxed font-medium">
                    You haven't activated any products for the live market yet.
                    Switch to your general product list and toggle them live to
                    start trading.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* View Toggle Header */}
                  <div className="flex justify-between items-center bg-content1/30 px-4 py-2 rounded-2xl border border-white/5 backdrop-blur-md mb-2">
                    <p className="text-xs font-bold text-default-500 uppercase tracking-widest">
                      {finalTableData.length} Items
                    </p>
                    <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl">
                      <Button
                        size="sm"
                        isIconOnly
                        variant={viewMode === "grid" ? "shadow" : "light"}
                        color={viewMode === "grid" ? "warning" : "default"}
                        className={
                          viewMode === "grid"
                            ? "text-black"
                            : "text-default-400"
                        }
                        onPress={() => setViewMode("grid")}
                      >
                        <FiGrid size={16} />
                      </Button>
                      <Button
                        size="sm"
                        isIconOnly
                        variant={viewMode === "list" ? "shadow" : "light"}
                        color={viewMode === "list" ? "warning" : "default"}
                        className={
                          viewMode === "list"
                            ? "text-black"
                            : "text-default-400"
                        }
                        onPress={() => setViewMode("list")}
                      >
                        <FiList size={16} />
                      </Button>
                      <Button
                        size="sm"
                        isIconOnly
                        variant={viewMode === "table" ? "shadow" : "light"}
                        color={viewMode === "table" ? "warning" : "default"}
                        className={
                          viewMode === "table"
                            ? "text-black"
                            : "text-default-400"
                        }
                        onPress={() => setViewMode("table")}
                      >
                        <FiLayout size={16} />
                      </Button>
                      <Button
                        size="sm"
                        isIconOnly
                        variant={viewMode === "compact" ? "shadow" : "light"}
                        color={viewMode === "compact" ? "warning" : "default"}
                        className={
                          viewMode === "compact"
                            ? "text-black"
                            : "text-default-400"
                        }
                        onPress={() => setViewMode("compact")}
                      >
                        <FiMenu size={16} />
                      </Button>
                    </div>
                  </div>

                  {viewMode === "table" ? (
                    <div className="w-full overflow-x-auto rounded-3xl border border-white/5 bg-content1/60 backdrop-blur-2xl shadow-lg pb-2">
                      <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                          <tr className="border-b border-white/5 bg-black/20 text-[10px] text-default-500 font-bold uppercase tracking-widest">
                            <th className="py-4 px-6 w-32">Status / Class</th>
                            <th className="py-4 px-6">Product & Variant</th>
                            <th className="py-4 px-6">Final Price</th>
                            <th className="py-4 px-6">Stock / Loc</th>
                            <th className="py-4 px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {finalTableData.map((item: any, index: number) => {
                            const isLive = item.isLive;
                            const canAddInventory =
                              showInventoryStatus &&
                              item &&
                              !item.hasInventory &&
                              (roleLower === "admin" ||
                                isOperatorUser ||
                                isAssociateUser);
                            const isSameCompany = Boolean(
                              (user as any)?.associateCompanyId &&
                              item.companyId &&
                              String((user as any)?.associateCompanyId) ===
                                String(item.companyId),
                            );
                            const shouldShowAssociateDetails =
                              roleLower === "admin" || isSameCompany;

                            const actionButtons = (
                              <div className="flex items-center gap-2">
                                {canManageRow(item) ? (
                                  <>
                                    <EditModal
                                      _id={item._id}
                                      initialData={{
                                        ...item,
                                        quantity: item.quantityRaw,
                                      }}
                                      currentTable={rate}
                                      formFields={tableConfig[rate]}
                                      apiEndpoint={
                                        rate === "catalogItem"
                                          ? apiRoutes.catalog.update
                                          : `${apiRoutesByRole[rate]}`
                                      }
                                      refetchData={refetchData}
                                    />
                                    <DeleteModal
                                      _id={item._id}
                                      name={
                                        item.name ||
                                        item.customTitle ||
                                        item.productVariant
                                      }
                                      deleteApiEndpoint={
                                        rate === "catalogItem"
                                          ? apiRoutes.catalog.remove
                                          : apiRoutesByRole[rate]
                                      }
                                      refetchData={refetchData}
                                      useBody={true}
                                    />
                                  </>
                                ) : item.isMarketplaceView ? (
                                  <>
                                    {!isAdminUser &&
                                      typeof AddToCatalogButton !==
                                        "undefined" && (
                                        <AddToCatalogButton
                                          rowItem={item}
                                          isPersonalCatalogMode={
                                            isAssociateUser && !hasLinkedCompany
                                          }
                                          onSuccess={() => refetchData()}
                                        />
                                      )}
                                    {(user?.role === "Associate" ||
                                      isAdminUser) &&
                                      typeof CreateEnquiryButton !==
                                        "undefined" && (
                                        <CreateEnquiryButton
                                          productVariant={item.productVariantId}
                                          variantRate={item}
                                        />
                                      )}
                                    {typeof RequestSampleButton !==
                                      "undefined" && (
                                      <RequestSampleButton variantRate={item} />
                                    )}
                                  </>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    {!item.isCatalogView &&
                                      (isLive || isAdminUser) &&
                                      typeof CreateEnquiryButton !==
                                        "undefined" && (
                                        <CreateEnquiryButton
                                          productVariant={
                                            item.productVariantId ||
                                            item.variantRate?.productVariant
                                              ?._id
                                          }
                                          variantRate={item}
                                        />
                                      )}
                                    {(isAdminUser ||
                                      (isLive && !item.isCatalogView)) &&
                                      typeof RequestSampleButton !==
                                        "undefined" && (
                                        <RequestSampleButton
                                          variantRate={item}
                                        />
                                      )}
                                  </div>
                                )}
                              </div>
                            );

                            const secondaryActions = (
                              <div className="flex items-center gap-2 shrink-0">
                                {canAddInventory && (
                                  <Button
                                    size="sm"
                                    variant="flat"
                                    color="warning"
                                    className="h-8 font-bold"
                                    onPress={() => {
                                      setSelectedInventoryRate(item);
                                      setInventoryQty("");
                                      setInventoryModalOpen(true);
                                    }}
                                  >
                                    + Inventory
                                  </Button>
                                )}
                                {canManageRow(item) && (
                                  <LiveToggle
                                    variantRate={item}
                                    refetchData={refetchData}
                                    apiEndpoint={
                                      rate === "catalogItem"
                                        ? apiRoutes.catalog.update
                                        : apiRoutesByRole[rate]
                                    }
                                  />
                                )}
                              </div>
                            );

                            return (
                              <tr
                                key={`table-${item._id || index}`}
                                className="hover:bg-white/[0.02] transition-colors group"
                              >
                                <td className="py-4 px-6 align-top">
                                  <div className="flex flex-col gap-2">
                                    {item.liveStatus ? (
                                      item.liveStatus
                                    ) : (
                                      <span
                                        className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full w-fit ${isLive ? "text-success-600 bg-success-500/10" : "text-default-400 bg-foreground/5"}`}
                                      >
                                        {isLive ? "● Live" : "○ Off"}
                                      </span>
                                    )}
                                    {item.classification}
                                  </div>
                                </td>
                                <td className="py-4 px-6 align-top">
                                  <div className="flex flex-col gap-1 min-w-0">
                                    <p
                                      className="text-[10px] sm:text-xs font-semibold text-warning-500 uppercase tracking-widest truncate"
                                      title={toDisplayText(
                                        item.product,
                                        "Product",
                                      )}
                                    >
                                      {toDisplayText(item.product, "Product")}
                                    </p>
                                    <h4
                                      className="text-sm font-black text-foreground leading-tight truncate"
                                      title={toDisplayText(
                                        item.productVariant,
                                        "Variant",
                                      )}
                                    >
                                      {toDisplayText(
                                        item.productVariant,
                                        "Variant",
                                      )}
                                    </h4>
                                    {shouldShowAssociateDetails && (
                                      <div className="flex items-center gap-1.5 mt-1 overflow-hidden">
                                        <FiUser
                                          size={12}
                                          className="text-default-400 shrink-0"
                                        />
                                        <div
                                          className="truncate text-xs text-default-600"
                                          title={toDisplayText(
                                            item.associate,
                                            "N/A",
                                          )}
                                        >
                                          {item.associate}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4 px-6 align-top whitespace-nowrap">
                                  <div className="text-base font-black text-warning-500 drop-shadow-md">
                                    {formatRate(item.rawBasePrice)}
                                  </div>
                                </td>
                                <td className="py-4 px-6 align-top">
                                  <div className="flex flex-col gap-1">
                                    {item.inventoryQty ? (
                                      <div className="text-sm font-medium">
                                        {item.inventoryQty}
                                      </div>
                                    ) : (
                                      <div className="text-sm font-bold text-foreground">
                                        {item.quantity}
                                      </div>
                                    )}
                                    {shouldShowAssociateDetails &&
                                      item.location &&
                                      item.location !== "--" && (
                                        <span
                                          className="text-[10px] text-default-500 truncate max-w-[120px]"
                                          title={item.location}
                                        >
                                          📍 {item.location}
                                        </span>
                                      )}
                                  </div>
                                </td>
                                <td className="py-4 px-6 align-top text-right">
                                  <div className="flex items-center gap-2 justify-end">
                                    {actionButtons}
                                    {secondaryActions}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div
                      className={
                        viewMode === "grid"
                          ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4"
                          : "flex flex-col gap-3"
                      }
                    >
                      {finalTableData.map((item: any, index: number) => {
                        const isLive = item.isLive;
                        const canAddInventory =
                          showInventoryStatus &&
                          item &&
                          !item.hasInventory &&
                          (roleLower === "admin" ||
                            isOperatorUser ||
                            isAssociateUser);
                        const isSameCompany = Boolean(
                          (user as any)?.associateCompanyId &&
                          item.companyId &&
                          String((user as any)?.associateCompanyId) ===
                            String(item.companyId),
                        );
                        const shouldShowAssociateDetails =
                          roleLower === "admin" || isSameCompany;

                        const actionButtons = (
                          <div className="flex items-center gap-2">
                            {canManageRow(item) ? (
                              <>
                                <EditModal
                                  _id={item._id}
                                  initialData={{
                                    ...item,
                                    quantity: item.quantityRaw,
                                  }}
                                  currentTable={rate}
                                  formFields={tableConfig[rate]}
                                  apiEndpoint={
                                    rate === "catalogItem"
                                      ? apiRoutes.catalog.update
                                      : `${apiRoutesByRole[rate]}`
                                  }
                                  refetchData={refetchData}
                                />
                                <DeleteModal
                                  _id={item._id}
                                  name={
                                    item.name ||
                                    item.customTitle ||
                                    item.productVariant
                                  }
                                  deleteApiEndpoint={
                                    rate === "catalogItem"
                                      ? apiRoutes.catalog.remove
                                      : apiRoutesByRole[rate]
                                  }
                                  refetchData={refetchData}
                                  useBody={true}
                                />
                              </>
                            ) : item.isMarketplaceView ? (
                              <>
                                {!isAdminUser &&
                                  typeof AddToCatalogButton !== "undefined" && (
                                    <AddToCatalogButton
                                      rowItem={item}
                                      isPersonalCatalogMode={
                                        isAssociateUser && !hasLinkedCompany
                                      }
                                      onSuccess={() => refetchData()}
                                    />
                                  )}
                                {(user?.role === "Associate" || isAdminUser) &&
                                  typeof CreateEnquiryButton !==
                                    "undefined" && (
                                    <CreateEnquiryButton
                                      productVariant={item.productVariantId}
                                      variantRate={item}
                                    />
                                  )}
                                {typeof RequestSampleButton !== "undefined" && (
                                  <RequestSampleButton variantRate={item} />
                                )}
                              </>
                            ) : (
                              <div className="flex items-center gap-2">
                                {!item.isCatalogView &&
                                  (isLive || isAdminUser) &&
                                  typeof CreateEnquiryButton !==
                                    "undefined" && (
                                    <CreateEnquiryButton
                                      productVariant={
                                        item.productVariantId ||
                                        item.variantRate?.productVariant?._id
                                      }
                                      variantRate={item}
                                    />
                                  )}
                                {(isAdminUser ||
                                  (isLive && !item.isCatalogView)) &&
                                  typeof RequestSampleButton !==
                                    "undefined" && (
                                    <RequestSampleButton variantRate={item} />
                                  )}
                              </div>
                            )}
                          </div>
                        );

                        const secondaryActions = (
                          <div className="flex items-center gap-2 shrink-0">
                            {canAddInventory && (
                              <Button
                                size="sm"
                                variant="flat"
                                color="warning"
                                className="h-8 font-bold"
                                onPress={() => {
                                  setSelectedInventoryRate(item);
                                  setInventoryQty("");
                                  setInventoryModalOpen(true);
                                }}
                              >
                                + Inventory
                              </Button>
                            )}
                            {canManageRow(item) && (
                              <LiveToggle
                                variantRate={item}
                                refetchData={refetchData}
                                apiEndpoint={
                                  rate === "catalogItem"
                                    ? apiRoutes.catalog.update
                                    : apiRoutesByRole[rate]
                                }
                              />
                            )}
                          </div>
                        );

                        if (viewMode === "list") {
                          return (
                            <motion.div
                              key={`list-${item._id || index}`}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                delay: index * 0.05,
                                duration: 0.3,
                              }}
                              className="group relative flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 sm:p-4 bg-content1/60 backdrop-blur-2xl border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 hover:shadow-lg transition-all"
                            >
                              <div
                                className={`absolute left-0 inset-y-0 w-1 ${isLive ? "bg-gradient-to-b from-success-500 to-success-300 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-default-200/50"}`}
                              />

                              <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4 pl-2 min-w-0">
                                <div className="flex flex-col gap-2 shrink-0 md:w-32">
                                  {item.liveStatus ? (
                                    item.liveStatus
                                  ) : (
                                    <span
                                      className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full w-fit ${isLive ? "text-success-600 bg-success-500/10" : "text-default-400 bg-foreground/5"}`}
                                    >
                                      {isLive ? "● Live" : "○ Off"}
                                    </span>
                                  )}
                                  {item.classification}
                                </div>

                                <Divider
                                  orientation="vertical"
                                  className="hidden md:block h-10"
                                />

                                <div className="flex-1 flex flex-col gap-1 min-w-0">
                                  <p
                                    className="text-[10px] sm:text-xs font-semibold text-warning-500 uppercase tracking-widest truncate"
                                    title={toDisplayText(
                                      item.product,
                                      "Product",
                                    )}
                                  >
                                    {toDisplayText(item.product, "Product")}
                                  </p>
                                  <h4
                                    className="text-sm sm:text-lg font-black text-foreground leading-tight truncate"
                                    title={toDisplayText(
                                      item.productVariant,
                                      "Variant",
                                    )}
                                  >
                                    {toDisplayText(
                                      item.productVariant,
                                      "Variant",
                                    )}
                                  </h4>
                                  {shouldShowAssociateDetails && (
                                    <div className="flex items-center gap-1.5 mt-1 overflow-hidden">
                                      <FiUser
                                        size={12}
                                        className="text-default-400 shrink-0"
                                      />
                                      <div
                                        className="truncate text-xs text-default-600"
                                        title={toDisplayText(
                                          item.associate,
                                          "N/A",
                                        )}
                                      >
                                        {item.associate}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <Divider className="md:hidden" />

                              <div className="flex flex-col sm:flex-row flex-wrap md:flex-nowrap items-start sm:items-center gap-4 md:gap-6 shrink-0 justify-between md:justify-end w-full md:w-auto">
                                <div className="flex items-center gap-6">
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[8px] sm:text-[10px] font-bold text-default-400 uppercase tracking-widest">
                                      Final Price
                                    </span>
                                    <div className="text-base sm:text-xl font-black text-warning-500 drop-shadow-md">
                                      {formatRate(item.rawBasePrice)}
                                    </div>
                                  </div>

                                  <div className="flex flex-col items-end gap-1 shrink-0 w-20">
                                    <span className="text-[8px] sm:text-[10px] font-bold text-default-400 uppercase tracking-widest">
                                      Stock
                                    </span>
                                    {item.inventoryQty ? (
                                      <div className="text-xs sm:text-sm">
                                        {item.inventoryQty}
                                      </div>
                                    ) : (
                                      <div className="text-xs sm:text-sm font-bold text-foreground">
                                        {item.quantity}
                                      </div>
                                    )}
                                    {shouldShowAssociateDetails &&
                                      item.location &&
                                      item.location !== "--" && (
                                        <span
                                          className="text-[8px] text-default-500 truncate max-w-[80px]"
                                          title={item.location}
                                        >
                                          📍 {item.location}
                                        </span>
                                      )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 justify-end w-full sm:w-auto">
                                  {actionButtons}
                                  {secondaryActions}
                                </div>
                              </div>
                            </motion.div>
                          );
                        }

                        if (viewMode === "compact") {
                          return (
                            <motion.div
                              key={`compact-${item._id || index}`}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                delay: index * 0.03,
                                duration: 0.2,
                              }}
                              className="group flex flex-col md:flex-row md:items-center justify-between gap-3 p-2 px-3 sm:px-4 bg-content1/40 backdrop-blur-md border border-white/5 rounded-xl overflow-hidden hover:border-white/10 hover:bg-content1/60 transition-all"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`shrink-0 w-2 h-2 rounded-full ${isLive ? "bg-success-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" : "bg-default-300"}`} />
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0">
                                  <span className="text-[10px] font-bold text-warning-500 uppercase tracking-widest truncate w-24 sm:w-auto">
                                    {toDisplayText(item.product, "Product")}
                                  </span>
                                  <span className="hidden sm:inline text-default-500 text-xs">/</span>
                                  <span className="text-xs sm:text-sm font-black text-foreground truncate max-w-[200px]">
                                    {toDisplayText(item.productVariant, "Variant")}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 shrink-0 mt-2 sm:mt-0">
                                <div className="flex items-center gap-4">
                                  <span className="text-[10px] text-default-400 w-12 text-right">
                                    {item.inventoryQty || item.quantity || "-"}
                                  </span>
                                  <span className="text-sm font-bold text-warning-400 w-24 text-right tabular-nums">
                                    {formatRate(item.rawBasePrice)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {actionButtons}
                                </div>
                              </div>
                            </motion.div>
                          );
                        }

                        return (
                          <motion.div
                            key={item._id || index}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              delay: index * 0.05,
                              duration: 0.4,
                              ease: "easeOut",
                            }}
                            className="group relative flex flex-col justify-between bg-content1/60 backdrop-blur-2xl border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300"
                          >
                            {/* Top Accent Line */}
                            <div
                              className={`absolute top-0 inset-x-0 h-1 ${isLive ? "bg-gradient-to-r from-success-500 to-success-300 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-default-200/50"}`}
                            />

                            <div className="p-3 sm:p-4 flex flex-col gap-2 sm:gap-3">
                              {/* Header: Classifications & Status */}
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex-1 min-w-0">
                                  {item.classification}
                                </div>
                                <div className="shrink-0 flex flex-col items-end gap-1.5">
                                  {item.liveStatus ? (
                                    item.liveStatus
                                  ) : (
                                    <span
                                      className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${isLive ? "text-success-600 bg-success-500/10" : "text-default-400 bg-foreground/5"}`}
                                    >
                                      {isLive ? "● Live" : "○ Off"}
                                    </span>
                                  )}
                                  {item.isAdded && !item.supplierIsLive && (
                                    <span className="text-[9px] text-danger-400 font-bold bg-danger-500/10 px-1.5 py-0.5 rounded-md border border-danger-500/20">
                                      Supplier Off
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Product Details */}
                              <div className="flex flex-col gap-1 mt-1">
                                <p
                                  className="text-[10px] sm:text-xs font-semibold text-warning-500 uppercase tracking-widest truncate"
                                  title={toDisplayText(item.product, "Product")}
                                >
                                  {toDisplayText(item.product, "Product")}
                                </p>
                                <h4
                                  className="text-sm sm:text-lg font-black text-foreground leading-tight line-clamp-2"
                                  title={toDisplayText(
                                    item.productVariant,
                                    "Variant",
                                  )}
                                >
                                  {toDisplayText(
                                    item.productVariant,
                                    "Variant",
                                  )}
                                </h4>
                                {shouldShowAssociateDetails && (
                                  <div className="flex items-center gap-1.5 mt-2 overflow-hidden">
                                    <FiUser
                                      size={12}
                                      className="text-default-400 shrink-0"
                                    />
                                    <div
                                      className="truncate text-xs sm:text-sm text-default-600"
                                      title={toDisplayText(
                                        item.associate,
                                        "N/A",
                                      )}
                                    >
                                      {item.associate}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <Divider className="my-1 bg-white/5" />

                              {/* Price & Quantity Area */}
                              <div className="flex justify-between items-end">
                                <div className="flex flex-col gap-1">
                                  <span className="text-[8px] sm:text-[10px] font-bold text-default-400 uppercase tracking-widest">
                                    Final Price
                                  </span>
                                  <div className="text-base sm:text-xl font-black text-warning-500 drop-shadow-md">
                                    {formatRate(item.rawBasePrice)}
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <span className="text-[8px] sm:text-[10px] font-bold text-default-400 uppercase tracking-widest">
                                    Stock
                                  </span>
                                  <div className="flex flex-col items-end gap-1">
                                    {item.inventoryQty ? (
                                      <div className="text-xs sm:text-sm">
                                        {item.inventoryQty}
                                      </div>
                                    ) : (
                                      <div className="text-xs sm:text-sm font-bold text-foreground">
                                        {item.quantity}
                                      </div>
                                    )}
                                    {shouldShowAssociateDetails &&
                                      item.location &&
                                      item.location !== "--" && (
                                        <span
                                          className="text-[8px] sm:text-[10px] text-default-500 truncate max-w-[60px] sm:max-w-[100px]"
                                          title={item.location}
                                        >
                                          📍 {item.location}
                                        </span>
                                      )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Actions Footer */}
                            <div className="p-2 sm:p-3 bg-black/20 border-t border-white/5 flex flex-col gap-2 mt-auto">
                              <div className="flex justify-between items-center w-full gap-2 overflow-x-auto pb-1 hide-scrollbar">
                                {actionButtons}
                                {secondaryActions}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Pagination Section */}
              {finalTableData.length > 0 && (
                <div className="flex w-full justify-center mt-10 mb-4">
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="warning"
                    page={meta?.currentPage || page}
                    total={meta?.totalPages || 1}
                    onChange={(newPage) => setPage(newPage)}
                    classNames={{
                      wrapper:
                        "gap-2 overflow-visible h-10 rounded-2xl border border-white/5 bg-content1/50 backdrop-blur-md shadow-lg",
                      item: "w-10 h-10 text-sm font-bold bg-transparent text-default-500 hover:bg-white/5",
                      cursor:
                        "bg-warning-500 font-black text-black shadow-[0_0_15px_rgba(245,165,36,0.4)]",
                      prev: "bg-transparent text-default-500 hover:bg-white/5",
                      next: "bg-transparent text-default-500 hover:bg-white/5",
                    }}
                  />
                </div>
              )}
            </section>
            <Modal
              isOpen={inventoryModalOpen}
              onOpenChange={(open) => {
                if (!open) {
                  setInventoryModalOpen(false);
                  setInventoryQty("");
                  setSelectedInventoryRate(null);
                  setInventorySubmitting(false);
                }
              }}
              isDismissable={!inventorySubmitting}
              size="md"
            >
              <ModalContent className="bg-gradient-to-br from-background to-content1 border border-divider">
                <ModalHeader className="flex flex-col gap-1 border-b border-divider pb-4 px-6">
                  <div className="flex items-center gap-3 pt-1">
                    <div className="p-2 bg-warning/10 rounded-xl text-warning-500 shadow-sm shadow-warning/10">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-black tracking-tight text-foreground">
                        Add Inventory
                      </h3>
                      <p className="text-[10px] text-default-400 font-bold uppercase tracking-widest mt-0.5">
                        Stock in Metric Tonnes (MT)
                      </p>
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody className="py-5 px-6 flex flex-col gap-4">
                  {/* Product context card */}
                  {selectedInventoryRate && (
                    <div className="p-3 bg-default-100/50 rounded-xl border border-divider/30 flex justify-between items-center gap-3">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-[10px] font-black text-default-400 uppercase tracking-widest">
                          Product
                        </span>
                        <span className="text-sm font-bold text-foreground truncate">
                          {selectedInventoryRate.product || "—"}
                        </span>
                      </div>
                      <div className="px-3 py-1.5 bg-warning/10 text-warning-600 rounded-xl text-xs font-black border border-warning/20 shadow-inner shrink-0">
                        {selectedInventoryRate.productVariant || "Standard"}
                      </div>
                    </div>
                  )}

                  {/* Quantity input */}
                  <Input
                    size="sm"
                    label="Quantity (MT)"
                    type="number"
                    value={inventoryQty}
                    onChange={(e) => setInventoryQty(e.target.value)}
                    placeholder="e.g. 10"
                    isDisabled={inventorySubmitting}
                    variant="bordered"
                    labelPlacement="outside"
                    startContent={
                      <span className="text-default-400 text-sm font-semibold pointer-events-none">
                        MT
                      </span>
                    }
                    description="Enter the quantity available at this location in Metric Tonnes."
                    classNames={{
                      label:
                        "text-xs font-bold text-default-500 uppercase tracking-wider",
                    }}
                  />

                  {/* Info note */}
                  <div className="flex items-start gap-2 text-xs text-default-400 bg-default-100/40 px-3 py-2.5 rounded-xl border border-divider/20">
                    <svg
                      className="w-3.5 h-3.5 shrink-0 mt-0.5 text-warning-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Location, state, and district will be inherited from the
                    rate record.
                  </div>
                </ModalBody>
                <ModalFooter className="border-t border-divider py-3 px-6 gap-2">
                  <Button
                    size="sm"
                    variant="flat"
                    color="default"
                    onPress={() => setInventoryModalOpen(false)}
                    isDisabled={inventorySubmitting}
                    className="font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    color="warning"
                    isLoading={inventorySubmitting}
                    className="font-bold"
                    onPress={async () => {
                      if (!selectedInventoryRate) return;
                      const qty = Number(inventoryQty);
                      if (!qty || Number.isNaN(qty) || qty <= 0) {
                        showToastMessage({
                          type: "error",
                          message: "Enter a valid quantity in MT.",
                          position: "top-right",
                        });
                        return;
                      }
                      setInventorySubmitting(true);
                      try {
                        const pvId =
                          selectedInventoryRate.productVariantId ||
                          selectedInventoryRate.productVariant?._id ||
                          selectedInventoryRate.productVariant;
                        const productId =
                          selectedInventoryRate.productId ||
                          selectedInventoryRate.productVariant?.product?._id ||
                          selectedInventoryRate.productVariant?.product;
                        const compId =
                          selectedInventoryRate.companyId ||
                          selectedInventoryRate.associateCompany?._id ||
                          selectedInventoryRate.associateCompany ||
                          inventoryCompanyId;
                        let associateId =
                          selectedInventoryRate.associateId ||
                          selectedInventoryRate.associate?._id ||
                          selectedInventoryRate.associate;

                        if (!associateId && compId) {
                          const assocResponse = await getData(
                            associateRoutes.getAll,
                            {
                              associateCompany: compId,
                              limit: 1,
                            },
                          );
                          const assocRows = Array.isArray(
                            assocResponse?.data?.data?.data,
                          )
                            ? assocResponse?.data?.data?.data
                            : assocResponse?.data?.data || [];
                          associateId =
                            assocRows?.[0]?._id || assocRows?.[0]?.id;
                        }

                        if (!associateId) {
                          showToastMessage({
                            type: "error",
                            message: "No associate found for this company.",
                            position: "top-right",
                          });
                          setInventorySubmitting(false);
                          return;
                        }

                        await postData(inventoryRoutes.getAll, {
                          productVariant: pvId,
                          product: productId,
                          associateCompany: compId,
                          associate: associateId,
                          state:
                            selectedInventoryRate.stateId ||
                            selectedInventoryRate.state?._id ||
                            selectedInventoryRate.state,
                          district:
                            selectedInventoryRate.districtId ||
                            selectedInventoryRate.district?._id ||
                            selectedInventoryRate.district,
                          division:
                            selectedInventoryRate.divisionId ||
                            selectedInventoryRate.division?._id ||
                            selectedInventoryRate.division,
                          pincodeEntry:
                            selectedInventoryRate.pincodeEntryId ||
                            selectedInventoryRate.pincodeEntry?._id ||
                            selectedInventoryRate.pincodeEntry,
                          quantity: qty,
                          unit: "MT",
                        });

                        showToastMessage({
                          type: "success",
                          message: "Inventory added successfully.",
                          position: "top-right",
                        });
                        setInventoryModalOpen(false);
                        setInventoryQty("");
                        setSelectedInventoryRate(null);
                        setInventorySubmitting(false);
                        refetchData();
                      } catch (error: any) {
                        console.error(
                          "Inventory add failed:",
                          error?.response?.data || error,
                        );
                        showToastMessage({
                          type: "error",
                          message:
                            error?.response?.data?.message ||
                            "Unable to add inventory. Please try again.",
                          position: "top-right",
                        });
                        setInventorySubmitting(false);
                      }
                    }}
                  >
                    Add to Inventory
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </div>
        );
      }}
    </QueryComponent>
  );
};

export default VariantRate;

/**
 * The "LiveToggle" to set "isLive" on a variantRate
 */
interface LiveToggleProps {
  variantRate: any;
  refetchData?: () => void;
  apiEndpoint?: string;
}

const LiveToggle: React.FC<LiveToggleProps> = ({
  variantRate,
  refetchData,
  apiEndpoint: propApiEndpoint,
}) => {
  const [isSelected, setIsSelected] = useState<boolean>(variantRate.isLive);
  const [loading, setLoading] = useState<boolean>(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    setIsSelected(variantRate.isLive);
  }, [variantRate.isLive]);
  const apiEndpoint = propApiEndpoint || apiRoutesByRole["variantRate"];

  const updateMutation = useMutation({
    mutationFn: async (newStatus: boolean) => {
      return patchData(`${apiEndpoint}/${variantRate._id}`, {
        isLive: newStatus,
      });
    },
    onSuccess: () => {
      // Invalidate just the single item or the entire query
      queryClient.invalidateQueries({
        queryKey: [apiEndpoint, variantRate._id],
      });
      setLoading(false);
      if (typeof refetchData === "function") {
        refetchData();
      }
    },
    onError: () => {
      setLoading(false);
    },
  });

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStatus = e.target.checked;
    setIsSelected(newStatus);
    setLoading(true);
    updateMutation.mutate(newStatus);
  };

  return (
    <div className="flex flex-col items-center gap-1 min-w-[60px]">
      {/* @ts-ignore */}
      <Switch
        {...({
          size: "sm",
          color: "success",
          isSelected: isSelected,
          isDisabled: loading,
          onChange: handleToggle,
        } as any)}
      />
      <p
        className={`text-[10px] font-bold m-0 p-0 leading-none ${
          isSelected ? "text-success-500" : "text-danger-500"
        }`}
      >
        {isSelected ? "LIVE" : "NOT LIVE"}
      </p>
    </div>
  );
};

/**
 * "CreateEnquiryButton" toggles an inline "AddEnquiryForm"
 */
interface CreateEnquiryButtonProps {
  productVariant: string;
  variantRate: any;
}

interface RequestSampleButtonProps {
  variantRate: any;
}

const RequestSampleButton: React.FC<RequestSampleButtonProps> = ({
  variantRate,
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [requestState, setRequestState] = useState("");
  const [requestDistrict, setRequestDistrict] = useState("");
  const [requestDivision, setRequestDivision] = useState("");
  const [requestAddress, setRequestAddress] = useState("");
  const [requestPincode, setRequestPincode] = useState("");
  const [pincodeSearch, setPincodeSearch] = useState("");
  const [requestedSampleQtyKg, setRequestedSampleQtyKg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [buyerAssociateId, setBuyerAssociateId] = useState("");
  const [buyerAssociateName, setBuyerAssociateName] = useState("");

  // Use a debounced search for pincode to avoid too many API calls
  const [debouncedPincodeSearch, setDebouncedPincodeSearch] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedPincodeSearch(pincodeSearch);
    }, 300);
    return () => clearTimeout(handler);
  }, [pincodeSearch]);

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setIsConfirming(false);
      setBuyerAssociateId("");
      setBuyerAssociateName("");
    }
  }, [isOpen]);

  const { data: statesResponse } = useQuery({
    queryKey: ["sample-request-states"],
    queryFn: () => getData(apiRoutes.state.getAll, { page: 1, limit: 1000 }),
    enabled: isOpen,
  });
  const { data: districtsResponse } = useQuery({
    queryKey: ["sample-request-districts"],
    queryFn: () => getData(apiRoutes.district.getAll, { page: 1, limit: 2000 }),
    enabled: isOpen,
  });
  const states = useMemo(
    () =>
      Array.isArray(statesResponse?.data?.data?.data)
        ? statesResponse?.data?.data?.data
        : statesResponse?.data?.data || [],
    [statesResponse],
  );
  const districts = useMemo(
    () =>
      Array.isArray(districtsResponse?.data?.data?.data)
        ? districtsResponse?.data?.data?.data
        : districtsResponse?.data?.data || [],
    [districtsResponse],
  );

  // Dynamic Divisions Fetching
  const { data: divisionResponse, isLoading: divisionsLoading } = useQuery({
    queryKey: ["request-divisions", requestDistrict],
    queryFn: () =>
      getData(apiRoutes.division.getAll, {
        district: requestDistrict,
        limit: 1000,
      }),
    enabled: !!requestDistrict,
  });

  // Dynamic Pincodes Fetching
  const { data: pincodeResponse, isLoading: pincodesLoading } = useQuery({
    queryKey: ["request-pincodes", requestDivision, debouncedPincodeSearch],
    queryFn: () =>
      getData(apiRoutes.pincodeEntry.getAll, {
        division: requestDivision,
        ...(debouncedPincodeSearch ? { search: debouncedPincodeSearch } : {}),
        limit: 100,
      }),
    enabled: !!requestDivision,
  });

  const divisionOptions = useMemo(() => {
    const raw =
      divisionResponse?.data?.data?.data ||
      divisionResponse?.data?.data ||
      divisionResponse?.data ||
      [];
    return Array.isArray(raw) ? raw : [];
  }, [divisionResponse]);

  const pincodeOptions = useMemo(() => {
    const raw =
      pincodeResponse?.data?.data?.data ||
      pincodeResponse?.data?.data ||
      pincodeResponse?.data ||
      [];
    return Array.isArray(raw) ? raw : [];
  }, [pincodeResponse]);

  const districtOptions = useMemo(() => {
    return districts.filter(
      (d: any) => String(d.state?._id || d.state) === String(requestState),
    );
  }, [districts, requestState]);

  const role = String(user?.role || "").toLowerCase();
  const isAdminOrOperator = role === "admin" || role === "operator";
  const buyerIdForSample = isAdminOrOperator
    ? buyerAssociateId
    : String(user?.id || "");
  const sampleCooldownDays = 3;

  const { data: recentSampleResponse } = useQuery({
    queryKey: [
      "sample-requests",
      "cooldown",
      variantRate?._id,
      buyerIdForSample,
    ],
    queryFn: () =>
      getData(apiRoutes.sampleRequest.list, {
        page: 1,
        limit: 1,
        variantRateId: variantRate?._id,
        ...(buyerIdForSample ? { buyerAssociateId: buyerIdForSample } : {}),
      }),
    enabled: Boolean(variantRate?._id) && Boolean(buyerIdForSample),
  });

  const recentSampleRows = Array.isArray(recentSampleResponse?.data?.data?.data)
    ? recentSampleResponse?.data?.data?.data
    : recentSampleResponse?.data?.data || [];
  const latestSample = recentSampleRows?.[0] || null;
  const latestRequestedAt = latestSample?.requestedAt
    ? new Date(latestSample.requestedAt)
    : null;
  const latestStatus = String(latestSample?.status || "").toUpperCase();
  const cooldownMs = sampleCooldownDays * 24 * 60 * 60 * 1000;
  const nextAllowedAt = latestRequestedAt
    ? new Date(latestRequestedAt.getTime() + cooldownMs)
    : null;
  const isCooldownActive =
    Boolean(latestRequestedAt) &&
    !["REJECTED", "CANCELLED"].includes(latestStatus) &&
    nextAllowedAt !== null &&
    nextAllowedAt.getTime() > Date.now();
  const remainingDays = nextAllowedAt
    ? Math.max(
        1,
        Math.ceil(
          (nextAllowedAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000),
        ),
      )
    : 0;
  const cooldownLabel = isCooldownActive
    ? `Sample already requested. Try again in ${remainingDays} day${remainingDays === 1 ? "" : "s"}.`
    : "Request Sample";

  const handleSubmit = () => {
    if (isCooldownActive) {
      showToastMessage({
        type: "error",
        message: cooldownLabel,
      });
      return;
    }
    if (isAdminOrOperator && !buyerAssociateId) {
      showToastMessage({
        type: "error",
        message: "Select a buyer associate.",
      });
      return;
    }
    if (!requestState || !requestDistrict || !requestDivision) {
      showToastMessage({
        type: "error",
        message: "Select state, district, and division.",
      });
      return;
    }
    if (
      !requestedSampleQtyKg ||
      Number.isNaN(Number(requestedSampleQtyKg)) ||
      Number(requestedSampleQtyKg) <= 0
    ) {
      showToastMessage({
        type: "error",
        message: "Enter sample quantity in kg.",
      });
      return;
    }
    if (!requestAddress.trim()) {
      showToastMessage({
        type: "error",
        message: "Enter the full address.",
      });
      return;
    }
    if (!requestPincode.trim()) {
      showToastMessage({
        type: "error",
        message: "Select or enter the pincode.",
      });
      return;
    }
    setIsConfirming(true);
  };

  const handleFinalSubmit = async () => {
    showToastMessage({
      type: "info",
      message: "Authorizing sample dispatch protocol...",
    });
    setSubmitting(true);
    try {
      await postData(apiRoutes.sampleRequest.create, {
        variantRateId: variantRate._id,
        requestState,
        requestDistrict,
        requestDivision,
        requestAddress: requestAddress.trim(),
        requestPincode: requestPincode.trim(),
        requestedSampleQtyKg: Number(requestedSampleQtyKg),
        ...(isAdminOrOperator ? { buyerAssociateId } : {}),
      });
      showToastMessage({
        type: "success",
        message: "Sample request sent to supplier.",
      });
      setIsSuccess(true);
      setIsConfirming(false);
      queryClient.invalidateQueries({
        queryKey: [
          "sample-requests",
          "cooldown",
          variantRate?._id,
          buyerIdForSample,
        ],
      });
      setRequestState("");
      setRequestDistrict("");
      setRequestDivision("");
      setRequestAddress("");
      setRequestPincode("");
      setRequestedSampleQtyKg("");
      setBuyerAssociateId("");
      setBuyerAssociateName("");
    } catch (error: any) {
      if (error?.response?.status === 409) {
        showToastMessage({
          type: "error",
          message:
            error?.response?.data?.message ||
            "Sample already requested. Please try again later.",
        });
        queryClient.invalidateQueries({
          queryKey: [
            "sample-requests",
            "cooldown",
            variantRate?._id,
            buyerIdForSample,
          ],
        });
        return;
      }
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || "Unable to request sample.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (
    role !== "associate" &&
    role !== "admin" &&
    role !== "operator" &&
    role !== "team"
  )
    return null;

  return (
    <div className="flex flex-col items-center gap-2">
      <Tooltip
        content={
          <span className="text-[10px] font-black uppercase tracking-widest px-1">
            Request Sample Protocol
          </span>
        }
        closeDelay={0}
        className="bg-[#0B0F14] border border-white/10 rounded-lg shadow-2xl"
      >
        <span
          onClick={onOpen}
          className={`flex flex-col items-center justify-center p-2.5 rounded-xl transition-all duration-300 ${
            isCooldownActive
              ? "bg-success-500/10 text-success-500 cursor-not-allowed opacity-50"
              : "bg-warning-500/10 hover:bg-warning-500/20 text-warning-500 cursor-pointer active:scale-90"
          }`}
        >
          <LuBox
            size={22}
            className={
              isCooldownActive ? "text-success-600/80" : "text-warning-600/80"
            }
          />
          <div className="h-[2px]" />
        </span>
      </Tooltip>
      <Modal
        placement="center"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        className="text-foreground mx-4"
        size="md"
        backdrop="blur"
      >
        <ModalContent className="bg-gradient-to-br from-background to-content1 border border-divider max-h-[95vh] overflow-hidden rounded-[2.5rem] shadow-2xl">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b border-divider/50 pb-4 px-8 bg-foreground/[0.02]">
                <div className="flex items-center gap-3 pt-2">
                  <div className="p-2.5 bg-orange-500/10 rounded-2xl text-orange-500 shadow-inner">
                    <FiPackage size={22} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-foreground uppercase">
                      Request Sample
                    </h3>
                    <p className="text-[10px] text-default-400 font-bold uppercase tracking-widest mt-0.5">
                      Logistics Protocol & Sample Dispatch
                    </p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="py-8 px-8 flex flex-col gap-6 overflow-y-auto">
                {!isSuccess && isCooldownActive && (
                  <div className="flex items-start gap-3 rounded-2xl border border-danger-500/30 bg-danger-500/10 px-4 py-3">
                    <FiX
                      className="text-danger-400 mt-0.5 shrink-0"
                      size={18}
                    />
                    <div className="text-[11px] font-semibold text-danger-300 leading-relaxed">
                      {cooldownLabel} Please wait before creating another sample
                      request for the same buyer.
                    </div>
                  </div>
                )}
                {isSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-12 gap-8 text-center"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-success-500/20 blur-[30px] rounded-full animate-pulse" />
                      <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-success-500 to-emerald-600 flex items-center justify-center relative shadow-[0_15px_40px_rgba(16,185,129,0.3)] border border-white/20">
                        <FiCheckCircle className="text-white text-4xl" />
                      </div>
                    </div>

                    <div className="space-y-4 px-4">
                      <div className="space-y-1">
                        <h3 className="font-black text-3xl tracking-tighter text-foreground uppercase italic underline decoration-success-500/30 underline-offset-8">
                          Protocol Initiated
                        </h3>
                        <p className="text-[10px] font-black text-success-500 uppercase tracking-[0.4em] mt-3">
                          Tactical Dispatch Sent
                        </p>
                      </div>

                      <div className="max-w-[280px] mx-auto py-2">
                        <p className="text-xs text-default-500 font-bold leading-relaxed uppercase tracking-wide">
                          Your sample request has been successfully submitted to
                          the supplier for preparation.
                        </p>
                      </div>

                      <div className="p-4 bg-foreground/[0.03] border border-divider/50 rounded-2xl backdrop-blur-md">
                        <p className="text-[9px] text-default-400 font-black uppercase tracking-[0.2em] leading-loose italic">
                          Logistics Lock: Next sample dispatch protocol
                          available in{" "}
                          <span className="text-warning-500">
                            {sampleCooldownDays} days
                          </span>{" "}
                          for this node.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col w-full gap-3 mt-4">
                      <Button
                        fullWidth
                        variant="light"
                        className="h-14 font-black uppercase tracking-[0.2em] text-[11px] text-success-500 hover:bg-success-500/10 transition-all"
                        onPress={onClose}
                      >
                        Acknowledge Protocol
                      </Button>
                      <Button
                        fullWidth
                        variant="light"
                        className="h-14 font-black uppercase tracking-[0.2em] text-[11px] text-default-500 hover:text-foreground transition-all"
                        onPress={() => {
                          onClose();
                          router.push("/dashboard/sample-requests");
                        }}
                      >
                        Navigate to Hub
                      </Button>
                    </div>
                  </motion.div>
                ) : isConfirming ? (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col gap-6"
                  >
                    <div className="p-6 bg-warning-500/5 rounded-[2rem] border border-warning-500/10 backdrop-blur-md">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-warning-500/10 rounded-xl text-warning-500">
                          <FiInfo size={18} />
                        </div>
                        <h4 className="text-sm font-black uppercase tracking-widest">
                          Protocol Review
                        </h4>
                      </div>
                      <div className="space-y-4">
                        {isAdminOrOperator && (
                          <div className="flex justify-between items-start py-2 border-b border-divider/30">
                            <span className="text-[10px] font-black uppercase text-default-400 tracking-widest mt-1">
                              Authorized Associate
                            </span>
                            <span className="text-sm font-black text-right max-w-[200px]">
                              {buyerAssociateName || "Not Identified"}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center py-2 border-b border-divider/30">
                          <span className="text-[10px] font-black uppercase text-default-400 tracking-widest">
                            State
                          </span>
                          <span className="text-sm font-bold">
                            {states.find((s) => s._id === requestState)?.name ||
                              "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-divider/30">
                          <span className="text-[10px] font-black uppercase text-default-400 tracking-widest">
                            District
                          </span>
                          <span className="text-sm font-bold">
                            {districtOptions.find(
                              (d) => d._id === requestDistrict,
                            )?.name || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-divider/30">
                          <span className="text-[10px] font-black uppercase text-default-400 tracking-widest">
                            Quantity
                          </span>
                          <span className="text-sm font-black text-warning-500">
                            {requestedSampleQtyKg} KG
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 py-1">
                          <span className="text-[10px] font-black uppercase text-default-400 tracking-widest mb-1">
                            Dispatch Point
                          </span>
                          <span className="text-xs font-semibold leading-relaxed text-default-600 italic">
                            {requestAddress}, {requestPincode}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-[1.5rem] border border-primary/10">
                      <FiCheckCircle
                        className="text-primary mt-0.5 shrink-0"
                        size={18}
                      />
                      <p className="text-[11px] text-default-600 leading-relaxed font-semibold">
                        Authorized officers will process this request for
                        immediate preparation. Once initiated, the protocol
                        cannot be cancelled from the marketplace.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {isAdminOrOperator && (
                      <div className="flex flex-col gap-1.5 p-5 bg-foreground/[0.03] border border-divider/50 rounded-3xl mb-2">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-default-400 ml-1 mb-2">
                          Buyer Associate Selection
                        </h4>
                        <div className="w-full">
                          <AssociateSearch
                            onSelect={(associate) => {
                              setBuyerAssociateId(associate?._id || "");
                              setBuyerAssociateName(associate?.name || "");
                            }}
                            onSearchChange={(name) =>
                              setBuyerAssociateName(name)
                            }
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Select
                        size="md"
                        label="State Protocol"
                        labelPlacement="outside"
                        placeholder="Select state"
                        variant="bordered"
                        className="font-medium"
                        classNames={{
                          label:
                            "text-[10px] font-black uppercase tracking-widest text-default-400 mb-1.5",
                          trigger:
                            "h-12 rounded-2xl border-divider/50 hover:border-primary transition-colors",
                        }}
                        selectedKeys={requestState ? [requestState] : []}
                        onSelectionChange={(keys) => {
                          const value =
                            Array.from(keys as Set<string>)[0] || "";
                          setRequestState(value);
                          setRequestDistrict("");
                          setRequestDivision("");
                          setRequestPincode("");
                          setPincodeSearch("");
                        }}
                      >
                        {states.map((state: any) => (
                          <SelectItem
                            key={state._id}
                            value={state._id}
                            className="rounded-xl"
                          >
                            {state.name}
                          </SelectItem>
                        ))}
                      </Select>

                      <Select
                        size="md"
                        label="District Registry"
                        labelPlacement="outside"
                        placeholder="Select district"
                        variant="bordered"
                        className="font-medium"
                        classNames={{
                          label:
                            "text-[10px] font-black uppercase tracking-widest text-default-400 mb-1.5",
                          trigger:
                            "h-12 rounded-2xl border-divider/50 hover:border-primary transition-colors",
                        }}
                        selectedKeys={requestDistrict ? [requestDistrict] : []}
                        isDisabled={!requestState}
                        onSelectionChange={(keys) => {
                          const value =
                            Array.from(keys as Set<string>)[0] || "";
                          setRequestDistrict(value);
                          setRequestDivision("");
                          setRequestPincode("");
                          setPincodeSearch("");
                        }}
                      >
                        {districtOptions.map((district: any) => (
                          <SelectItem
                            key={district._id}
                            value={district._id}
                            className="rounded-xl"
                          >
                            {district.name}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Select
                        size="md"
                        label="Postal Division"
                        labelPlacement="outside"
                        placeholder={
                          divisionsLoading
                            ? "Loading divisions..."
                            : "Select division"
                        }
                        variant="bordered"
                        className="font-medium"
                        classNames={{
                          label:
                            "text-[10px] font-black uppercase tracking-widest text-default-400 mb-1.5",
                          trigger:
                            "h-12 rounded-2xl border-divider/50 hover:border-primary transition-colors",
                        }}
                        selectedKeys={requestDivision ? [requestDivision] : []}
                        isDisabled={!requestDistrict || divisionsLoading}
                        isLoading={divisionsLoading}
                        onSelectionChange={(keys) => {
                          const value =
                            Array.from(keys as Set<string>)[0] || "";
                          setRequestDivision(value);
                          setRequestPincode("");
                          setPincodeSearch("");
                        }}
                      >
                        {divisionOptions.map((division: any) => (
                          <SelectItem
                            key={division._id}
                            value={division._id}
                            className="rounded-xl"
                          >
                            {division.name}
                          </SelectItem>
                        ))}
                      </Select>

                      {/* @ts-ignore */}
                      <Autocomplete
                        size="md"
                        label="Pincode Lookup"
                        labelPlacement="outside"
                        placeholder={
                          pincodesLoading ? "Searching..." : "Pincode or Office"
                        }
                        variant="bordered"
                        className="font-medium"
                        isLoading={pincodesLoading}
                        allowsCustomValue={true}
                        isDisabled={!requestDivision}
                        onSelectionChange={(id) => {
                          const selected = pincodeOptions.find(
                            (p: any) => p._id === id,
                          );
                          if (selected) {
                            setRequestPincode(selected.pincode);
                            setPincodeSearch(selected.pincode);
                          }
                        }}
                        onInputChange={(value) => {
                          setRequestPincode(value);
                          setPincodeSearch(value);
                        }}
                        inputProps={{
                          classNames: {
                            inputWrapper:
                              "h-12 rounded-2xl border-divider/50 hover:border-primary transition-colors",
                            label:
                              "text-[10px] font-black uppercase tracking-widest text-default-400 mb-1.5",
                            input: "text-sm",
                          },
                        }}
                        popoverProps={{
                          offset: 10,
                          className:
                            "rounded-2xl border border-divider shadow-2xl bg-content1 backdrop-blur-xl",
                          placement: "bottom",
                        }}
                        itemHeight={75}
                        maxListboxHeight={450}
                        listboxProps={{
                          className: "p-2",
                        }}
                      >
                        {pincodeOptions.map((p: any) => (
                          <AutocompleteItem
                            key={p._id}
                            textValue={p.pincode}
                            className="rounded-xl px-4 py-2"
                            description={`${p.officename} - ${p.divisionname}`}
                          >
                            {p.pincode}
                          </AutocompleteItem>
                        ))}
                      </Autocomplete>
                    </div>

                    <Textarea
                      size="md"
                      label="Detailed Delivery Address"
                      labelPlacement="outside"
                      placeholder="Street, locality, landmark..."
                      variant="bordered"
                      minRows={3}
                      classNames={{
                        label:
                          "text-[10px] font-black uppercase tracking-widest text-default-400 mb-1.5",
                        inputWrapper:
                          "rounded-2xl border-divider/50 hover:border-primary transition-colors",
                      }}
                      value={requestAddress}
                      onValueChange={setRequestAddress}
                    />

                    <Input
                      size="md"
                      label="Target Quantity (KG)"
                      labelPlacement="outside"
                      placeholder="Enter quantity in kg"
                      variant="bordered"
                      className="font-medium"
                      classNames={{
                        label:
                          "text-[10px] font-black uppercase tracking-widest text-default-400 mb-1.5",
                        inputWrapper:
                          "h-12 rounded-2xl border-divider/50 hover:border-primary transition-colors",
                      }}
                      type="number"
                      min={0}
                      value={requestedSampleQtyKg}
                      onValueChange={setRequestedSampleQtyKg}
                    />

                    <div className="flex items-start gap-4 p-4 bg-orange-500/5 rounded-[1.5rem] border border-orange-500/10 backdrop-blur-md">
                      <FiInfo
                        className="text-orange-500 mt-0.5 shrink-0"
                        size={18}
                      />
                      <p className="text-[11px] text-default-600 leading-relaxed font-semibold">
                        Confirming this protocol will notify the manufacturer to
                        prepare sample dispatch. Standard minimum quantities
                        apply.
                      </p>
                    </div>
                  </>
                )}
              </ModalBody>
              <ModalFooter
                className={`border-t border-divider/50 py-4 px-8 bg-foreground/[0.01] items-center justify-between ${isSuccess ? "hidden" : "flex"}`}
              >
                <Button
                  size="md"
                  variant="light"
                  onPress={() =>
                    isConfirming ? setIsConfirming(false) : onClose()
                  }
                  isDisabled={submitting}
                  className="rounded-xl font-bold uppercase tracking-widest text-[10px]"
                >
                  {isConfirming ? "Back to Edit" : "Cancel"}
                </Button>
                <Button
                  size="lg"
                  color={isConfirming ? "success" : "warning"}
                  onPress={() =>
                    isConfirming ? handleFinalSubmit() : handleSubmit()
                  }
                  isLoading={submitting}
                  isDisabled={submitting || isCooldownActive}
                  className="rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-orange-500/20 px-8"
                >
                  {isConfirming
                    ? "Authorize Sample Dispatch"
                    : "Request Sample Dispatch"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
const CreateEnquiryButton: React.FC<CreateEnquiryButtonProps> = ({
  variantRate,
  productVariant,
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <div className="flex flex-col items-center gap-2 ">
      <Tooltip
        content={
          <span className="text-[10px] font-black uppercase tracking-widest px-1">
            Initialize Enquiry Protocol
          </span>
        }
        closeDelay={0}
        className="bg-[#0B0F14] border border-white/10 rounded-lg shadow-2xl"
      >
        <span
          onClick={onOpen}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-primary-500/10 hover:bg-primary-500/20 text-primary-500 cursor-pointer active:scale-90 transition-all duration-300"
        >
          <LuMessageSquare size={22} className="text-primary-600/80" />
          <div className="h-[2px]" />
        </span>
      </Tooltip>
      {/* @ts-ignore */}
      <Modal
        placement="center"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        className="text-foreground mx-4"
        size="md"
        backdrop="blur"
      >
        <ModalContent className="bg-gradient-to-br from-background to-content1 border border-divider max-h-[90vh] overflow-hidden">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b border-divider pb-3 px-6">
                <div className="flex items-center gap-3 pt-1">
                  <div className="p-2 bg-primary/10 rounded-xl text-primary-500 shadow-sm shadow-primary/10">
                    <FiMessageSquare size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-foreground">
                      New Enquiry
                    </h3>
                    <p className="text-[10px] text-default-400 font-bold uppercase tracking-widest mt-0.5">
                      Direct Manufacturer Protocol
                    </p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="py-4 px-6 overflow-y-auto">
                <div className="mb-4 p-3 bg-default-100/50 rounded-xl border border-divider/30 flex justify-between items-center shadow-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-default-400 uppercase tracking-widest">
                      Target Product
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {variantRate.product}
                    </span>
                  </div>
                  <div className="px-3 py-1.5 bg-primary/10 text-primary-600 rounded-xl text-xs font-black border border-primary/20 shadow-inner">
                    {variantRate.productVariant || "Standard"}
                  </div>
                </div>
                <AddEnquiryForm
                  productVariant={productVariant}
                  variantRate={variantRate}
                  onClose={onClose}
                />
                <div className="mt-4 rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-xs text-primary-700 dark:text-primary-300 flex items-start gap-2">
                  <FiInfo size={14} className="mt-0.5" />
                  <span>
                    LOI will be created automatically from your company to our
                    company when you submit this enquiry.
                  </span>
                </div>
              </ModalBody>
              <ModalFooter className="flex flex-col gap-2 border-t border-divider py-3 px-6">
                <div className="flex items-center gap-2 text-primary-500 bg-primary-500/10 px-3 py-2 rounded-xl w-full">
                  <FiInfo size={16} />
                  <p className="text-xs font-medium">
                    Our team will respond within 10 minutes
                  </p>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

/**
 * "AddEnquiryForm": a small inline form to create an Enquiry referencing the chosen variantRate
 */
interface AddEnquiryFormProps {
  productVariant: string;
  variantRate: any;
  onClose: any;
}
type BuyerOption = {
  _id: string;
  name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  user?: { name?: string; phone?: string; email?: string };
  associateCompany?: { name?: string } | string;
  isDeleted?: boolean;
};
const AddEnquiryForm: React.FC<AddEnquiryFormProps> = ({
  variantRate,
  productVariant,
  onClose,
}) => {
  const OBJECT_ID_REGEX = /^[a-fA-F0-9]{24}$/;
  const normalizeObjectId = (value: any): string => {
    const raw =
      typeof value === "string"
        ? value
        : typeof value === "object" && value !== null
          ? value._id || value.id || ""
          : "";
    const normalized = String(raw || "").trim();
    return OBJECT_ID_REGEX.test(normalized) ? normalized : "";
  };
  const router = useRouter();
  const queryClient = useQueryClient();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [preferredIncotermId, setPreferredIncotermId] = useState<string>("");
  const [specification, setSpecification] = useState("");
  const [buyerAssociateId, setBuyerAssociateId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdEnquiryId, setCreatedEnquiryId] = useState<string | null>(null);

  const { user } = useContext(AuthContext);
  const roleLower = String(user?.role || "").toLowerCase();
  const isAdminUser =
    roleLower === "admin" || roleLower === "operator" || roleLower === "team";

  // Robust Associate ID Fetching
  const { data: associateDetail } = useQuery({
    queryKey: ["associate-me", user?.id],
    queryFn: () => getData(`${apiRoutesByRole["associate"]}/${user?.id}`),
    enabled: !!user?.id,
  });

  const associateRaw = associateDetail?.data;
  const associateProfile = Array.isArray(associateRaw)
    ? associateRaw[0]
    : associateRaw?.data || associateRaw?.data?.data || associateRaw || null;
  const activeAssociateId = normalizeObjectId(
    associateProfile?._id || user?.id,
  );
  const defaultSellerAssociateId = normalizeObjectId(
    variantRate.associateId ||
      variantRate.associate?._id ||
      variantRate.originalOwnerId ||
      variantRate.variantRate?.associate?._id ||
      variantRate.baseRateId?.associate?._id,
  );

  const { data: associatesResponse, isLoading: buyerOptionsLoading } = useQuery(
    {
      queryKey: ["enquiry-buyer-options"],
      queryFn: () => getData(apiRoutes.enquiry.buyerOptions, { limit: 2000 }),
      enabled: isAdminUser,
    },
  );

  const parseAssociateRows = (raw: any): BuyerOption[] => {
    if (Array.isArray(raw?.data?.data?.data)) return raw.data.data.data;
    if (Array.isArray(raw?.data?.data?.docs)) return raw.data.data.docs;
    if (Array.isArray(raw?.data?.docs)) return raw.data.docs;
    if (Array.isArray(raw?.data?.data)) return raw.data.data;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw)) return raw;
    return [];
  };
  const associateOptions = parseAssociateRows(associatesResponse).filter(
    (item: any) => !item?.isDeleted,
  );

  useEffect(() => {
    if (!name) {
      setName(
        associateProfile?.name ||
          (user as any)?.name ||
          (user as any)?.fullName ||
          "",
      );
    }
    if (!phoneNumber) {
      setPhoneNumber(
        associateProfile?.phone ||
          associateProfile?.phoneNumber ||
          (user as any)?.phone ||
          (user as any)?.phoneNumber ||
          "",
      );
    }
  }, [associateProfile, user, name, phoneNumber]);

  // Load available incoterms from essentials
  const { data: incotermResponse } = useQuery({
    queryKey: ["incoterms"],
    queryFn: () => getData(apiRoutes.incoterm.getAll),
  });

  const incotermOptions = (() => {
    const raw = incotermResponse?.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.data?.data)) return raw.data.data;
    return [];
  })();

  const createEnquiryMutation = useMutation({
    mutationFn: async () => {
      const roleLower = String(user?.role || "").toLowerCase();
      const isOperatorCreator =
        roleLower === "operator" || roleLower === "team";
      let resolvedProductId: any =
        variantRate.productId ||
        variantRate.product?._id ||
        variantRate.productVariant?.product?._id ||
        variantRate.productVariant?.product ||
        variantRate.variantRate?.productVariant?.product?._id ||
        variantRate.baseRateId?.productVariant?.product?._id;
      const resolvedProductVariantId =
        productVariant ||
        variantRate.productVariantId ||
        variantRate.productVariant?._id ||
        variantRate.variantRate?.productVariant?._id ||
        variantRate.baseRateId?.productVariant?._id;

      if (!resolvedProductId && resolvedProductVariantId) {
        const pvRes: any = await getData(
          `${apiRoutesByRole["productVariant"]}/${resolvedProductVariantId}`,
        );
        const pv = pvRes?.data?.data || pvRes?.data || pvRes;
        resolvedProductId = pv?.product?._id || pv?.product || null;
      }
      const normalizedProductId = normalizeObjectId(resolvedProductId);
      const resolvedSellerAssociateId = defaultSellerAssociateId;
      const resolvedBuyerAssociateId = isAdminUser
        ? normalizeObjectId(buyerAssociateId)
        : activeAssociateId;
      const normalizedPreferredIncotermId = preferredIncotermId
        ? normalizeObjectId(preferredIncotermId)
        : "";
      const normalizedVariantRateId = variantRate.isCatalogView
        ? ""
        : normalizeObjectId(variantRate._id);
      const normalizedCatalogItemId = variantRate.isCatalogView
        ? normalizeObjectId(variantRate._id)
        : "";
      const normalizedMediatorAssociateId = variantRate.mediatorAssociateId
        ? normalizeObjectId(variantRate.mediatorAssociateId)
        : "";

      if (!normalizedProductId) {
        throw new Error(
          "Product is missing for this rate. Please refresh and try again.",
        );
      }
      if (!resolvedBuyerAssociateId) {
        throw new Error("Buyer associate is required.");
      }
      if (!resolvedSellerAssociateId) {
        throw new Error(
          "Invalid seller mapping for this row. Please refresh marketplace data or contact admin.",
        );
      }
      if (preferredIncotermId && !normalizedPreferredIncotermId) {
        throw new Error(
          "Preferred incoterm is invalid. Please reselect and try again.",
        );
      }
      if (!variantRate.isCatalogView && !normalizedVariantRateId) {
        throw new Error(
          "Variant rate is invalid. Please refresh and try again.",
        );
      }
      if (variantRate.isCatalogView && !normalizedCatalogItemId) {
        throw new Error(
          "Catalog item is invalid. Please refresh and try again.",
        );
      }

      const baseSpecification = `Variant: ${variantRate.productVariant || "Standard"}`;
      const finalSpecification =
        specification?.trim().length > 0
          ? `${baseSpecification}\n\nNotes: ${specification.trim()}`
          : baseSpecification;

      const payload = {
        productId: normalizedProductId,
        quantity: Number(quantity) || 1,
        specifications: finalSpecification,
        buyerAssociateId: resolvedBuyerAssociateId,
        sellerAssociateId: resolvedSellerAssociateId,
        mediatorAssociateId: normalizedMediatorAssociateId || null,
        variantRateId: variantRate.isCatalogView
          ? null
          : normalizedVariantRateId,
        catalogItemId: variantRate.isCatalogView
          ? normalizedCatalogItemId
          : null,
        preferredIncoterm: normalizedPreferredIncotermId || null,
        ...(isOperatorCreator && user?.id
          ? { assignedOperatorId: user.id }
          : {}),
        // Optional name/phone if they were overridden in the form
        ...(name && name !== associateProfile?.name && { name }),
        ...(phoneNumber &&
          phoneNumber !==
            (associateProfile?.phone || associateProfile?.phoneNumber) && {
            phoneNumber,
          }),
        notes: `Enquiry for ${variantRate.product} - ${variantRate.productVariant}`,
      };

      console.log("Submitting Enquiry Payload:", payload);

      return postData(`${apiRoutesByRole["enquiry"]}`, payload);
    },
    onMutate: () => {
      setIsLoading(true);
    },
    onSuccess: (response: any) => {
      setIsLoading(false);
      const createdId =
        response?.data?.data?._id ||
        response?.data?._id ||
        response?._id ||
        null;
      setCreatedEnquiryId(createdId ? String(createdId) : null);
      setIsSuccess(true);
      queryClient.invalidateQueries();
    },
    onError: (error: any) => {
      console.error("Enquiry submission failed:", error);
      console.error("Error Response:", error?.response?.data);
      const backendMessage = error?.response?.data?.message;
      const validationMessage = error?.response?.data?.error?.message;
      const fallback =
        error?.message || "Something went wrong. Please try again.";
      showToastMessage({
        type: "error",
        message: backendMessage || validationMessage || fallback,
      });
      setIsLoading(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdminUser && !normalizeObjectId(buyerAssociateId)) {
      showToastMessage({
        type: "error",
        message: "Please select a valid buyer associate.",
      });
      return;
    }
    if (!defaultSellerAssociateId) {
      showToastMessage({
        type: "error",
        message:
          "Invalid seller mapping for this row. Please refresh marketplace data.",
      });
      return;
    }
    createEnquiryMutation.mutate();
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-8 gap-5 text-center"
      >
        <div className="w-20 h-20 bg-success-500/10 rounded-2xl flex items-center justify-center text-success-500 shadow-lg shadow-success-500/20 border border-success-500/20">
          <FiCheckCircle size={50} />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-2xl font-black tracking-tight text-foreground">
            Enquiry Created
          </h3>
          <p className="text-default-500 max-w-[360px] text-sm leading-relaxed">
            Your enquiry for {variantRate.product} was created successfully.
            Continue to enquiry details to proceed with responses, negotiation,
            and execution.
          </p>
        </div>
        <div className="w-full max-w-[420px] rounded-2xl border border-primary-300/35 bg-primary-500/10 px-4 py-3 text-left">
          <p className="text-[11px] font-black uppercase tracking-widest text-primary-600 dark:text-primary-300">
            Next Step
          </p>
          <p className="text-sm text-foreground mt-1">
            Open enquiry details now to continue the transaction flow.
          </p>
        </div>
        <div className="mt-1 flex w-full max-w-[420px] flex-col gap-2.5">
          <Button
            color="primary"
            size="lg"
            className="rounded-2xl font-black tracking-wide shadow-md"
            isDisabled={!createdEnquiryId}
            onPress={() => {
              const enquiryId = String(createdEnquiryId || "").trim();
              if (!isValidObjectId(enquiryId)) {
                showToastMessage({
                  type: "error",
                  message:
                    "Unable to open enquiry details. Invalid enquiry ID.",
                });
                return;
              }
              onClose?.();
              router.push(`/dashboard/enquiries/${enquiryId}`);
            }}
            endContent={<FiArrowRight size={16} />}
          >
            Open Enquiry Details
          </Button>
          <Button
            color="default"
            variant="flat"
            size="lg"
            className="rounded-2xl font-semibold border border-default-300/60"
            onPress={() => {
              onClose?.();
              router.push("/dashboard/enquiries");
            }}
            startContent={<FiList size={16} />}
          >
            Go to Enquiries
          </Button>
          <Button
            color="default"
            variant="light"
            size="sm"
            className="rounded-xl font-medium text-default-500"
            onPress={onClose}
            startContent={<FiX size={14} />}
          >
            Close
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Card className="border border-default-200 bg-content1 shadow-sm">
        <CardBody className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isAdminUser && (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-default-600">
                    Buyer Associate
                  </label>
                  <select
                    value={buyerAssociateId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBuyerAssociateId(val);
                      if (val) {
                        const selectedItem = associateOptions.find(
                          (a: any) => String(a._id) === val,
                        );
                        if (selectedItem) {
                          setName(
                            selectedItem.name ||
                              selectedItem.fullName ||
                              selectedItem.user?.name ||
                              "",
                          );
                          setPhoneNumber(
                            selectedItem.phone ||
                              selectedItem.phoneNumber ||
                              selectedItem.user?.phone ||
                              "",
                          );
                        }
                      } else {
                        setName("");
                        setPhoneNumber("");
                      }
                    }}
                    className="w-full rounded-xl border border-default-300 bg-default-50 text-foreground h-9 px-3 text-sm outline-none focus:border-primary transition-colors"
                    required
                    disabled={buyerOptionsLoading}
                  >
                    <option value="">
                      {buyerOptionsLoading
                        ? "Loading buyers..."
                        : "Select buyer"}
                    </option>
                    {associateOptions.map((item: any) => {
                      const id = String(item?._id || "");
                      const label =
                        item?.name ||
                        item?.user?.name ||
                        item?.associateCompany?.name ||
                        item?.fullName ||
                        item?.email ||
                        item?.user?.email ||
                        "Associate";
                      return (
                        <option key={id} value={id}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                  {!buyerOptionsLoading && associateOptions.length === 0 && (
                    <p className="text-[11px] text-default-500">
                      No active buyer associates available.
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-default-600">
                Full Name
              </label>
              <input
                className="w-full rounded-xl border border-default-300 bg-default-50 text-foreground h-9 px-3 text-sm outline-none focus:border-primary transition-colors"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!user}
                autoComplete="name"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-default-600">
                Phone Number
              </label>
              <input
                className="w-full rounded-xl border border-default-300 bg-default-50 text-foreground h-9 px-3 text-sm outline-none focus:border-primary transition-colors"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required={!user}
                autoComplete="tel"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-default-600">
                Quantity (Ton)
              </label>
              <input
                className="w-full rounded-xl border border-default-300 bg-default-50 text-foreground h-9 px-3 text-sm outline-none focus:border-primary transition-colors"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-default-600">
                Preferred Incoterm
              </label>
              <select
                value={preferredIncotermId}
                onChange={(e) => setPreferredIncotermId(e.target.value)}
                disabled={incotermOptions.length === 0}
                className="w-full rounded-xl border border-default-200 bg-default-50 text-foreground h-9 px-3 text-sm outline-none focus:border-primary transition-colors disabled:opacity-60"
              >
                <option value="">Choose incoterm</option>
                {(Array.isArray(incotermOptions) ? incotermOptions : []).map(
                  (item: any) => {
                    const id = String(item?._id || "");
                    return (
                      <option key={id} value={id}>
                        {item?.code || "NA"} - {item?.name || "Incoterm"}
                      </option>
                    );
                  },
                )}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <label className="text-xs font-semibold text-default-600">
              Specification (Optional)
            </label>
            <textarea
              className="w-full rounded-xl border border-default-300 bg-default-50 text-foreground min-h-[90px] px-3 py-2 text-sm outline-none focus:border-primary transition-colors resize-y"
              value={specification}
              onChange={(e) => setSpecification(e.target.value)}
            />
          </div>
        </CardBody>
      </Card>

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-default-500">Tip: 1 Ton = 1,000 KG</span>
        <Button
          type="submit"
          isLoading={isLoading}
          color="primary"
          size="sm"
          className="font-semibold rounded-lg min-w-[160px]"
          startContent={!isLoading && <FiMessageSquare size={14} />}
        >
          {isLoading ? "Submitting..." : "Create Enquiry"}
        </Button>
      </div>
    </form>
  );
};

/**
 * Merges two arrays—one of variantRates and one of displayedRates—by matching
 * variantRates._id with displayedRate.variantRate._id.
 *
 * When a match is found, it merges:
 *  - The base variantRate (vr)
 *  - The properties from the nested displayedRate.variantRate (which may override vr)
 *  - The additional properties from the displayedRate (like commission, selected, etc.)
 *
 * The nested "variantRate" property is removed so that all keys appear at the top level.
 * If no displayedRate match is found, the variantRate is only returned if it is selected.
 *
 * @param {Array} variantRates - Array of variantRate objects.
 * @param {Array} displayedRates - Array of displayedRate objects.
 * @returns {Array} - New array with merged objects.
 */

function mergeVariantAndDisplayedOnce(variantRates: any, displayedRates: any) {
  // Extract arrays if they are wrapped in a pagination object
  const vrList = Array.isArray(variantRates)
    ? variantRates
    : variantRates?.data || [];
  const drList = Array.isArray(displayedRates)
    ? displayedRates
    : displayedRates?.data || [];

  // 1) Identify all variantRate IDs that have a corresponding personalized displayedRate
  const displayedVariantRateIds = new Set(
    drList.map((dr: any) => dr.variantRate?._id || dr.variantRate),
  );

  // 2) Filter the global variantRates to remove those that are already personalized
  const filteredVariantRates = vrList.filter(
    (vr: any) => !displayedVariantRateIds.has(vr._id),
  );

  // 3) Return the personalized rates plus the remaining global rates
  return [...drList, ...filteredVariantRates];
}

/**
 * Button to open AddToCatalogModal
 */
interface AddToCatalogButtonProps {
  rowItem: any;
  isPersonalCatalogMode?: boolean;
  onSuccess?: () => void;
}

const AddToCatalogButton: React.FC<AddToCatalogButtonProps> = ({
  rowItem,
  isPersonalCatalogMode = false,
  onSuccess,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Construct product name from row data
  const productName = rowItem.productVariant || "Product";

  return (
    <>
      <Tooltip
        content={rowItem.isAdded ? "Already in Catalog" : "Add to Catalog"}
        closeDelay={0}
      >
        <span
          onClick={!rowItem.isAdded ? onOpen : undefined}
          className={`flex flex-col items-center justify-center p-2 rounded-xl cursor-pointer active:opacity-50 transition-all duration-200 ${
            rowItem.isAdded
              ? "bg-success-500/10 text-success-500 cursor-default"
              : "bg-blue-500/10 hover:bg-blue-500/20 text-blue-500"
          }`}
        >
          {rowItem.isAdded ? (
            <FiCheckCircle size={20} className="text-success-600/80" />
          ) : (
            <FiPlusCircle size={20} className="text-blue-600/80" />
          )}
          <div className="h-[2px]" />
        </span>
      </Tooltip>

      {isOpen && (
        <AddToCatalogModal
          isOpen={isOpen}
          onClose={onClose}
          onSuccess={onSuccess}
          productVariantId={
            rowItem.productVariantId || rowItem.productVariant?._id
          }
          baseRateId={rowItem._id}
          basePrice={rowItem.rawBasePrice || rowItem.rate}
          productName={productName}
          isPersonalCatalogMode={isPersonalCatalogMode}
        />
      )}
    </>
  );
};
