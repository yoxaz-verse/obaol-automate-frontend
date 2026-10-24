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
  Popover,
  PopoverContent,
  PopoverTrigger,
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
  FiMoreHorizontal,
  FiSearch,
  FiRefreshCw,
  FiTrash2,
} from "react-icons/fi";
import { LuMessageSquare, LuBox } from "react-icons/lu";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import AssociateSearch from "@/components/dashboard/Users/AssociateSearch";

import QueryComponent from "@/components/queryComponent";
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
import { useCurrency } from "@/context/CurrencyContext";
import { resolveMarketplaceSort } from "@/utils/marketplaceSort";
import { formatLastLiveDate, LastLiveAgeBadge } from "./ListingFreshness";
import { RequestSampleButton } from "./sample/RequestSampleButton";
import { CreateEnquiryButton } from "./enquiry/CreateEnquiryButton";
import { InventoryEditorDialog } from "./InventoryEditorDialog";
import { MarketplacePrice } from "./MarketplacePrice";
import { useRateReveal } from "./useRateReveal";
import { fetchDependentOptions } from "@/utils/fetchDependentOptions";
import { showToastMessage } from "@/utils/utils";
import { detectOffPlatformDisclosure } from "@/utils/offPlatformDisclosure";
import {
  useCalculationConfig,
  DEFAULT_CALCULATION_CONFIG,
} from "@/hooks/useCalculationConfig";
import type { QueryComponentMeta } from "@/data/interface-data";
import { invalidateListingQueries } from "@/utils/listingQueryCache";
import { AddToCatalogAction, LiveStatusToggle } from "./RateActions";
import { LISTING_ACTION_CLASS, LISTING_DELETE_WINDOW_MS } from "./constants";
import { normalizeApiError } from "@/core/api/apiErrors";
import {
  canDeleteRate,
  canManageRate,
  buildSampleRequestPayload,
  classificationTone,
  extractClassifications,
  isValidObjectId,
  mergeVariantAndDisplayedOnce,
  resolveAdminCommission,
  toDisplayText,
  truncateWithDots,
  validateSampleRequest,
} from "@/features/catalog/rates/domain";

const VariantRateWizardModal = dynamic(
  () => import("@/components/dashboard/Catalog/VariantRateWizardModal"),
  { ssr: false },
);
const AddToCatalogModal = dynamic(() => import("@/components/dashboard/Catalog/AddToCatalogModal"), {
  ssr: false,
});
const EditModal = dynamic(() => import("@/components/CurdTable/edit-model"), {
  ssr: false,
});
const DeleteModal = dynamic(() => import("@/components/CurdTable/delete"), {
  ssr: false,
});
const DynamicFilter = dynamic(
  () => import("@/components/CurdTable/dynamic-filtering"),
  { ssr: false },
);

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
  isActive?: boolean;
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
  isActive = true,
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
  const isAssociateUser = roleLower === "associate" || roleLower === "customer";
  const isBuyingMode = isAssociateUser && ((user?.providedCapabilities || []).includes("buyer") || (user?.soughtCapabilities || []).includes("seller"));
  const isSellingMode = isAssociateUser && ((user?.providedCapabilities || []).includes("seller") || (user?.soughtCapabilities || []).includes("buyer"));
  const hasLinkedCompany = Boolean((user as any)?.associateCompanyId);
  const canAddOwnRate = isAdminUser || (isSellingMode && hasLinkedCompany);
  const isMarketplaceView = additionalParams?.view === "marketplace";
  const isTradeListingRate = rate === "variantRate";
  const marketplaceSort = resolveMarketplaceSort(additionalParams?.isLive);
  const canManageRow = (item: any) => canManageRate(item, {
    role: roleLower, isOperator: isOperatorUser, isSellingMode,
  });

  const [filters, setFilters] = useState<Record<string, any>>({}); // Dynamic filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  type ViewMode = "grid" | "list" | "table" | "compact";
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);
  const limit = isMarketplaceView ? 24 : 24;
  const [selectedInventoryRate, setSelectedInventoryRate] = useState<import("./domain").RateRow | null>(null);
  const [pendingDeletion, setPendingDeletion] = useState<any>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [listingPolicyNow, setListingPolicyNow] = useState(() => Date.now());
  const [inventoryStatusReady, setInventoryStatusReady] = useState(false);
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
    const timer = window.setInterval(() => setListingPolicyNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const canDeleteTradeListing = (item: any) =>
    canDeleteRate(item, roleLower, listingPolicyNow, LISTING_DELETE_WINDOW_MS);

  const lockedListingMessage = (
    <span className="max-w-40 text-right text-[9px] font-bold uppercase tracking-wider text-default-400">
      Listing locked — only status can be changed
    </span>
  );

  const deleteTrigger = (item: any) => (
    <Tooltip color="danger" content="Remove Record" closeDelay={0}>
      <Button
        isIconOnly
        size="sm"
        variant="flat"
        color="danger"
        onPress={() => setPendingDeletion(item)}
        aria-label={`Delete ${toDisplayText(item?.name || item?.customTitle || item?.productVariant, "listing")}`}
        className="h-10 min-w-10 rounded-xl shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-danger-500/60"
      >
        <FiTrash2 size={18} />
      </Button>
    </Tooltip>
  );

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

  useEffect(() => {
    if (!showInventoryStatus) {
      setInventoryStatusReady(false);
      return;
    }
    setInventoryStatusReady(false);
    const timer = window.setTimeout(() => setInventoryStatusReady(true), 350);
    return () => window.clearTimeout(timer);
  }, [showInventoryStatus, inventoryCompanyId, user?.id]);

  const revealState = useRateReveal(isMarketplaceView);
  const marketplacePrice = (item: import("./domain").RateRow, compact = false) => (
    <MarketplacePrice
      rate={item}
      gated={isMarketplaceView && isAssociateUser && !Boolean(item.isOwnedByViewer)}
      compact={compact}
      revealedPrice={revealState.prices[String(item._id || "")]}
      revealing={revealState.revealingId === String(item._id || "")}
      reveal={(id) => void revealState.reveal(id)}
      format={formatRate}
    />
  );

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
                ...(isMarketplaceView && { sort: marketplaceSort }),
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
                ...(isMarketplaceView && { sort: marketplaceSort }),
                ...(displayOnly && { selected: "true" }),
                ...(productVariantId && { productVariant: productVariantId }),
              }),
            staleTime: 30_000,
          });
        } catch {
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
    marketplaceSort,
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
      inventoryStatusReady &&
      showInventoryStatus &&
      (Boolean(inventoryCompanyId) || isAssociateUser),
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
        ...(isMarketplaceView && { sort: marketplaceSort }),
        ...(displayOnly && { selected: "true" }),
        // ...(!user?.id && { isLive: "true" }),
        ...(productVariantValue && { productVariant: productVariantValue._id }),
      }}
      onMetaChange={displayOnly && !user?.id ? setPublicDisplayMeta : undefined}
      refreshEnabled={isActive}
      refreshInterval={10_000}
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
              const lastLiveDateRaw =
                item.lastLiveDate || item.updatedAt || item.createdAt;

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
                item.productVariant?.name || item.productVariantName || "Standard",
              );
              const productClassifications = extractClassifications(item);
              const classificationText = productClassifications.join(" ");

              const effectiveIsLive =
                typeof item.effectiveIsLive === "boolean"
                  ? item.effectiveIsLive
                  : typeof item.__effectiveIsLive === "boolean"
                  ? item.__effectiveIsLive
                  : Boolean(item.isLive);
              return {
                ...rest,
                isLive: effectiveIsLive,
                liveStatus: (
                  <div className="flex flex-col items-end gap-0.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${effectiveIsLive ? "bg-success-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-danger-500/40"}`}
                      />
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest ${effectiveIsLive ? "text-success-400" : "text-default-400"}`}
                      >
                        {effectiveIsLive ? "LIVE" : "OFFLINE"}
                      </span>
                    </div>
                  </div>
                ),
                associate: (
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground uppercase tracking-tight line-clamp-1">
                        {toDisplayText(
                          item.associateCompany?.name,
                          isOwner ? "My Company" : "OBAOL",
                        )}
                      </span>
                      {isMarketplace && isOwner && (
                        <span className="rounded-full border border-obaol-500/30 bg-obaol-500/10 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-obaol-500">
                          Your listing
                        </span>
                      )}
                    </div>
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
                  <span className="text-obaol-500 font-bold tracking-tight text-sm">
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
                isOwnedByViewer: isOwner,
                isOwnerView: isOwner && !isMarketplace,
                isAdded: addedRateIds.has(item._id),
                lastLiveDateRaw,
                lastLiveDate: (
                  <div className="flex items-center justify-start min-w-[80px]">
                    {formatLastLiveDate(lastLiveDateRaw)}
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
                    {extractClassifications(item.baseRateId).map(
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
                classificationText: extractClassifications(item.baseRateId).join(" "),
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
                    {extractClassifications(item.variantRate).map((label) => (
                      <span
                        key={`${item._id}-${label}`}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${classificationTone(label)}`}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                ),
                classificationText: extractClassifications(item.variantRate).join(" "),
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
                      searchPlaceholder="Search trade listing rates..."
                      actionElement={
                        !displayOnly &&
                        rate === "variantRate" &&
                        canAddOwnRate &&
                        showCreateButton ? (
                          <div className="shrink-0 shadow-lg shadow-obaol-500/10 rounded-2xl overflow-hidden">
                            <Button
                              size="sm"
                              onPress={() => setWizardOpen(true)}
                              variant="shadow"
                              color="warning"
                              className="font-black tracking-widest px-3 sm:px-5 h-10 rounded-xl uppercase text-[9px] sm:text-[11px] shadow-obaol-500/30"
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
                                invalidateListingQueries(queryClient);
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
                    <div className="shrink-0 shadow-lg shadow-obaol-500/10 rounded-2xl overflow-hidden ml-auto">
                      <Button
                        size="sm"
                        onPress={() => setWizardOpen(true)}
                        variant="shadow"
                        color="warning"
                        className="font-black tracking-widest px-5 h-10 rounded-xl uppercase text-[11px] shadow-obaol-500/30"
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
                          invalidateListingQueries(queryClient);
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
                <Card className="mb-4 border border-obaol-300/30 bg-obaol-500/10">
                  <CardBody className="py-3 px-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-obaol-700 dark:text-obaol-300">
                          Link a company to add your own rates
                        </p>
                        <p className="text-xs text-obaol-700/80 dark:text-obaol-200/90">
                          You can still add commodity listings to your
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
              {finalTableData.length === 0 && Boolean(search?.trim()) ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-content1/30 backdrop-blur-md rounded-[2.5rem] border border-white/5 shadow-inner my-4">
                  <div className="relative mb-6">
                    <div className="p-5 bg-content2/80 border border-divider rounded-[2rem] text-default-400 shadow-xl">
                      <FiSearch size={40} strokeWidth={1.5} />
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-foreground tracking-tight uppercase">
                    No Matching Trade Listings
                  </h3>
                  <p className="text-default-500 max-w-[360px] mt-2 mb-6 text-xs sm:text-sm font-medium">
                    No trade listings matched &quot;<span className="text-foreground font-semibold">{search}</span>&quot;. Try searching for another commodity or clear the search query.
                  </p>
                  <Button
                    color="default"
                    variant="flat"
                    size="md"
                    className="font-bold px-6 rounded-xl"
                    onPress={() => setSearch("")}
                    startContent={<FiX size={16} />}
                  >
                    Clear Search Filter
                  </Button>
                </div>
              ) : finalTableData.length === 0 &&
                rate === "catalogItem" &&
                isAssociateUser ? (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-content1/30 backdrop-blur-md rounded-[2rem] border border-white/5 shadow-inner">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-obaol-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
                    <div className="relative p-6 bg-content2 border border-divider rounded-[2.5rem] text-obaol-500 shadow-xl">
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
                    trade workspace.
                  </p>
                  <Button
                    color="warning"
                    variant="shadow"
                    size="lg"
                    className="font-black px-10 rounded-2xl h-14 text-sm uppercase tracking-widest shadow-obaol-500/20 shadow-lg hover:scale-105 active:scale-95 transition-all text-black"
                    onPress={() => router.push("/dashboard/marketplace")}
                    startContent={<FiShoppingBag size={20} strokeWidth={2.5} />}
                  >
                    Explore Trade Listings
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
                    No Live Trade Listings Available
                  </h3>
                  <p className="text-default-500 max-w-[340px] mt-2 mb-8 text-sm leading-relaxed font-medium">
                    There are currently no shared live listings matching this
                    view. You can publish a listing from My Trade Listings.
                  </p>
                  <Button
                    color="primary"
                    variant="shadow"
                    size="lg"
                    className="font-black px-10 rounded-2xl h-14 text-sm uppercase tracking-widest shadow-primary-500/20 shadow-lg hover:scale-105 active:scale-95 transition-all"
                    onPress={() => router.push("/dashboard/product")}
                    startContent={<FiPlusCircle size={20} strokeWidth={2.5} />}
                  >
                    Create Trade Listing
                  </Button>
                </div>
              ) : finalTableData.length === 0 &&
                additionalParams?.isLive === true ? (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-content1/30 backdrop-blur-md rounded-[2rem] border border-white/5 shadow-inner">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-obaol-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
                    <div className="relative p-6 bg-content2 border border-divider rounded-[2.5rem] text-obaol-500 shadow-xl">
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
                    You haven&apos;t activated any products for the live market yet.
                    Switch to your general product list and toggle them live to
                    start trading.
                  </p>
                </div>
              ) : finalTableData.length === 0 &&
                isMarketplaceView &&
                additionalParams?.isLive === false ? (
                <div className="flex flex-col items-center justify-center rounded-[2rem] border border-white/5 bg-content1/30 px-6 py-20 text-center shadow-inner backdrop-blur-md">
                  <div className="mb-6 rounded-[2rem] border border-divider bg-content2 p-6 text-default-400 shadow-xl">
                    <FiRefreshCw size={46} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-foreground">
                    No Recent Past Listings
                  </h3>
                  <p className="mt-2 max-w-[390px] text-sm leading-relaxed text-default-500">
                    Past listings remain visible here for 20 days after they are manually taken offline. Owners can switch them live again at any time.
                  </p>
                </div>
              ) : finalTableData.length === 0 ? (
                <div className="relative w-full flex flex-col items-center justify-center py-16 sm:py-20 px-6 text-center bg-gradient-to-b from-content1/80 via-content1/40 to-content1/10 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 dark:border-white/5 shadow-2xl overflow-hidden my-2 group">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-obaol-500/10 dark:bg-obaol-500/15 blur-3xl rounded-full pointer-events-none scale-125 transition-all duration-700 group-hover:scale-150" />
                  
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-obaol-500/20 blur-xl rounded-full scale-125 animate-pulse" />
                    <div className="relative p-6 sm:p-7 bg-content2/80 border border-white/10 rounded-[2.5rem] text-obaol-500 shadow-2xl backdrop-blur-md">
                      <FiPackage size={48} strokeWidth={1.5} className="sm:w-14 sm:h-14" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 p-2.5 bg-gradient-to-tr from-obaol-500 to-amber-400 text-black rounded-full border-4 border-background shadow-lg">
                      <FiPlus size={18} strokeWidth={3} />
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight uppercase max-w-md">
                    List Your First Trade Product
                  </h3>
                  <p className="text-default-500 max-w-[420px] mt-2 mb-8 text-xs sm:text-sm leading-relaxed font-medium">
                    {canAddOwnRate
                      ? "Set up your commodity rates, manage available inventory, and make your products discoverable to global buyers."
                      : "Link your company profile to start listing your commodity rates and showcasing products in the global trade network."}
                  </p>

                  {canAddOwnRate ? (
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <Button
                        color="warning"
                        variant="shadow"
                        size="lg"
                        className="font-black px-8 sm:px-10 rounded-2xl h-14 text-xs sm:text-sm uppercase tracking-widest shadow-obaol-500/30 shadow-xl hover:scale-[1.03] active:scale-[0.97] transition-all text-black bg-gradient-to-r from-amber-400 via-obaol-500 to-amber-500"
                        onPress={() => setWizardOpen(true)}
                        startContent={<FiPlus size={20} strokeWidth={2.5} />}
                      >
                        List Your First Product
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <Button
                        color="warning"
                        variant="shadow"
                        size="lg"
                        className="font-black px-8 sm:px-10 rounded-2xl h-14 text-xs sm:text-sm uppercase tracking-widest shadow-obaol-500/30 shadow-xl hover:scale-[1.03] active:scale-[0.97] transition-all text-black bg-gradient-to-r from-amber-400 via-obaol-500 to-amber-500"
                        onPress={() => router.push("/dashboard/profile")}
                        startContent={<FiArrowRight size={20} strokeWidth={2.5} />}
                      >
                        Link Company to Start Listing
                      </Button>
                      <Button
                        color="default"
                        variant="flat"
                        size="lg"
                        className="font-bold px-6 rounded-2xl h-14 text-xs uppercase tracking-wider text-default-600"
                        onPress={() => router.push("/dashboard/marketplace")}
                        startContent={<FiShoppingBag size={18} />}
                      >
                        Explore Marketplace
                      </Button>
                    </div>
                  )}

                  <div className="mt-10 pt-8 border-t border-white/5 flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-default-400 text-[11px] font-semibold tracking-wide">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-content2/40 border border-white/5">
                      <FiCheckCircle size={13} className="text-obaol-500" />
                      <span>Instant Trade Publishing</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-content2/40 border border-white/5">
                      <FiCheckCircle size={13} className="text-obaol-500" />
                      <span>Inventory & Rate Control</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-content2/40 border border-white/5">
                      <FiCheckCircle size={13} className="text-obaol-500" />
                      <span>Global Network Visibility</span>
                    </div>
                  </div>

                  {canAddOwnRate && (
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
                        invalidateListingQueries(queryClient);
                        refetchData();
                      }}
                    />
                  )}
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
                            <th className="py-4 px-6">Rate</th>
                            <th className="py-4 px-6">{isAssociateUser && isMarketplaceView ? "Stock" : "Stock / Loc"}</th>
                            <th className="py-4 px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {finalTableData.map((item: any, index: number) => {
                            const isLive = item.isLive;
                            const canAddInventory =
                              showInventoryStatus &&
                              item &&
                              (roleLower === "admin" ||
                                isOperatorUser ||
                                isSellingMode);
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
                                  isTradeListingRate ? (
                                    canDeleteTradeListing(item) ? (
                                      deleteTrigger(item)
                                    ) : lockedListingMessage
                                  ) : (
                                    <>
                                      <EditModal
                                        _id={item._id}
                                        initialData={{ ...item, quantity: item.quantityRaw }}
                                        currentTable={rate}
                                        formFields={tableConfig[rate]}
                                        apiEndpoint={rate === "catalogItem" ? apiRoutes.catalog.update : apiRoutesByRole[rate]}
                                        refetchData={refetchData}
                                      />
                                      {deleteTrigger(item)}
                                    </>
                                  )
                                ) : item.isMarketplaceView && item.isOwnedByViewer ? (
                                  <Button
                                    size="sm"
                                    variant="flat"
                                    color="warning"
                                    className={LISTING_ACTION_CLASS}
                                    onPress={() => router.push("/dashboard/product")}
                                    endContent={<FiArrowRight size={14} />}
                                  >
                                    Manage listing
                                  </Button>
                                ) : item.isMarketplaceView ? (
                                  <>
                                    {!isAdminUser && isSellingMode &&
                                      typeof AddToCatalogAction !==
                                        "undefined" && (
                                        <AddToCatalogAction
                                          rowItem={item}
                                          isPersonalCatalogMode={
                                            isAssociateUser && !hasLinkedCompany
                                          }
                                          onSuccess={() => refetchData()}
                                        />
                                      )}
                                    {(isAssociateUser ||
                                      isAdminUser) &&
                                      typeof CreateEnquiryButton !==
                                        "undefined" && (
                                        <CreateEnquiryButton
                                          productVariant={item.productVariantId}
                                          variantRate={item}
                                        />
                                      )}
                                    {(isBuyingMode || isAdminUser) && typeof RequestSampleButton !==
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
                                      (isBuyingMode && isLive && !item.isCatalogView)) &&
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
                                    className={LISTING_ACTION_CLASS}
                                    onPress={() => {
                                      setSelectedInventoryRate(item);
                                    }}
                                  >
                                    + Add Stock
                                  </Button>
                                )}
                                {canManageRow(item) && (
                                  <LiveStatusToggle
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
                                    {roleLower === "admin" &&
                                      isMarketplaceView &&
                                      !isLive && (
                                        <LastLiveAgeBadge
                                          value={item.lastLiveDateRaw}
                                        />
                                      )}
                                  </div>
                                </td>
                                <td className="py-4 px-6 align-top">
                                  <div className="flex flex-col gap-1 min-w-0">
                                    <h4
                                      className="text-sm sm:text-lg font-black text-foreground leading-tight truncate"
                                      title={toDisplayText(
                                        item.product,
                                        "Product",
                                      )}
                                    >
                                      {toDisplayText(item.product, "Product")}
                                    </h4>
                                    <p
                                      className="text-[10px] sm:text-xs font-semibold text-obaol-500 uppercase tracking-widest truncate"
                                      title={toDisplayText(
                                        item.productVariant,
                                        "Variant",
                                      )}
                                    >
                                      {toDisplayText(
                                        item.productVariant,
                                        "Variant",
                                      )}
                                    </p>
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
                                  {marketplacePrice(item)}
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
                          ? "catalog-responsive-grid"
                          : "flex flex-col gap-3"
                      }
                    >
                      {finalTableData.map((item: any, index: number) => {
                        const isLive = item.isLive;
                        const canAddInventory =
                          showInventoryStatus &&
                          item &&
                          (roleLower === "admin" ||
                            isOperatorUser ||
                            isSellingMode);
                        const isSameCompany = Boolean(
                          (user as any)?.associateCompanyId &&
                          item.companyId &&
                          String((user as any)?.associateCompanyId) ===
                            String(item.companyId),
                        );
                        const shouldShowAssociateDetails =
                          roleLower === "admin" || isSameCompany;
                        const canCreateMarketplaceEnquiry =
                          item.isMarketplaceView &&
                          !item.isOwnedByViewer &&
                          (isAssociateUser || isAdminUser);
                        const primaryMarketplaceEnquiry =
                          canCreateMarketplaceEnquiry ? (
                            <CreateEnquiryButton
                              productVariant={item.productVariantId}
                              variantRate={item}
                            />
                          ) : null;

                        const actionButtons = (
                          <div className="flex items-center gap-2">
                            {canManageRow(item) ? (
                              isTradeListingRate ? (
                                canDeleteTradeListing(item) ? (
                                  deleteTrigger(item)
                                ) : lockedListingMessage
                              ) : (
                                <>
                                  <EditModal
                                    _id={item._id}
                                    initialData={{ ...item, quantity: item.quantityRaw }}
                                    currentTable={rate}
                                    formFields={tableConfig[rate]}
                                    apiEndpoint={rate === "catalogItem" ? apiRoutes.catalog.update : apiRoutesByRole[rate]}
                                    refetchData={refetchData}
                                  />
                                  {deleteTrigger(item)}
                                </>
                              )
                            ) : item.isMarketplaceView && item.isOwnedByViewer ? (
                              <Button
                                size="sm"
                                variant="flat"
                                color="warning"
                                className={`${LISTING_ACTION_CLASS} shrink-0`}
                                onPress={() => router.push("/dashboard/product")}
                                endContent={<FiArrowRight size={14} />}
                              >
                                Manage listing
                              </Button>
                            ) : item.isMarketplaceView ? (
                              <>
                                {!isAdminUser && isSellingMode &&
                                  typeof AddToCatalogAction !== "undefined" && (
                                    <AddToCatalogAction
                                      rowItem={item}
                                      isPersonalCatalogMode={
                                        isAssociateUser && !hasLinkedCompany
                                      }
                                      onSuccess={() => refetchData()}
                                    />
                                  )}
                                {primaryMarketplaceEnquiry}
                                {(isBuyingMode || isAdminUser) && typeof RequestSampleButton !== "undefined" && (
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
                                  (isBuyingMode && isLive && !item.isCatalogView)) &&
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
                                className={LISTING_ACTION_CLASS}
                                onPress={() => {
                                  setSelectedInventoryRate(item);
                                }}
                              >
                                + Add Stock
                              </Button>
                            )}
                            {canManageRow(item) && (
                              <LiveStatusToggle
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
                                  {roleLower === "admin" &&
                                    isMarketplaceView &&
                                    !isLive && (
                                      <LastLiveAgeBadge
                                        value={item.lastLiveDateRaw}
                                      />
                                    )}
                                </div>

                                <Divider
                                  orientation="vertical"
                                  className="hidden md:block h-10"
                                />

                                <div className="flex-1 flex flex-col gap-1 min-w-0">
                                  <h4
                                    className="text-sm sm:text-lg font-black text-foreground leading-tight truncate"
                                    title={toDisplayText(
                                      item.product,
                                      "Product",
                                    )}
                                  >
                                    {toDisplayText(item.product, "Product")}
                                  </h4>
                                  <p
                                    className="text-[10px] sm:text-xs font-semibold text-obaol-500 uppercase tracking-widest truncate"
                                    title={toDisplayText(
                                      item.productVariant,
                                      "Variant",
                                    )}
                                  >
                                    {toDisplayText(
                                      item.productVariant,
                                      "Variant",
                                    )}
                                  </p>
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
                                      {isMarketplaceView && !isLive ? "Previous listed price" : "Final Price"}
                                    </span>
                                    {marketplacePrice(item)}
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
                              <div className="flex min-w-0 flex-wrap items-center gap-3">
                                <div className={`shrink-0 w-2 h-2 rounded-full ${isLive ? "bg-success-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" : "bg-default-300"}`} />
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0">
                                  <span className="text-xs sm:text-sm font-black text-foreground truncate w-32 sm:w-auto">
                                    {toDisplayText(item.product, "Product")}
                                  </span>
                                  <span className="hidden sm:inline text-default-500 text-xs">/</span>
                                  <span className="text-[10px] font-semibold text-obaol-500 uppercase tracking-widest truncate max-w-[200px]">
                                    {toDisplayText(item.productVariant, "Variant")}
                                  </span>
                                </div>
                                {roleLower === "admin" &&
                                  isMarketplaceView &&
                                  !isLive && (
                                    <LastLiveAgeBadge
                                      value={item.lastLiveDateRaw}
                                    />
                                  )}
                              </div>
                              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 shrink-0 mt-2 sm:mt-0">
                                <div className="flex items-center gap-4">
                                  <span className="text-[10px] text-default-400 w-12 text-right">
                                    {item.inventoryQty || item.quantity || "-"}
                                  </span>
                                  <span className="min-w-24 text-right">{marketplacePrice(item, true)}</span>
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
                            className="catalog-grid-card group relative flex min-w-0 flex-col justify-between border border-amber-100/80 bg-white shadow-[0_4px_18px_rgba(95,65,25,0.05)] transition-all duration-300 hover:border-amber-200 hover:shadow-[0_12px_28px_rgba(95,65,25,0.11)] dark:border-white/10 dark:bg-[#12100d] dark:shadow-[0_8px_28px_rgba(0,0,0,0.28)] dark:hover:border-obaol-500/35 dark:hover:shadow-[0_12px_34px_rgba(0,0,0,0.4)] rounded-3xl overflow-hidden"
                          >
                            {/* Top Accent Line */}
                            <div
                              className={`absolute top-0 inset-x-0 h-1 ${isLive ? "bg-gradient-to-r from-success-500 to-success-300 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-gradient-to-r from-amber-200 via-amber-100 to-transparent dark:from-default-300/40 dark:via-default-200/20"}`}
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
                                  {roleLower === "admin" &&
                                    isMarketplaceView &&
                                    !isLive && (
                                      <LastLiveAgeBadge
                                        value={item.lastLiveDateRaw}
                                      />
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
                                <h4
                                  className="text-sm sm:text-lg font-black text-slate-900 dark:text-white leading-tight line-clamp-2"
                                  title={toDisplayText(item.product, "Product")}
                                >
                                  {toDisplayText(item.product, "Product")}
                                </h4>
                                <p
                                  className="text-[10px] sm:text-xs font-semibold text-obaol-600 dark:text-obaol-300 uppercase tracking-widest truncate"
                                  title={toDisplayText(
                                    item.productVariant,
                                    "Variant",
                                  )}
                                >
                                  {toDisplayText(
                                    item.productVariant,
                                    "Variant",
                                  )}
                                </p>
                                {shouldShowAssociateDetails && (
                                  <div className="flex items-center gap-1.5 mt-2 overflow-hidden">
                                    <FiUser
                                      size={12}
                                      className="text-default-400 dark:text-white/45 shrink-0"
                                    />
                                    <div
                                      className="truncate text-xs sm:text-sm text-default-600 dark:text-white/70"
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

                              <Divider className="my-1 bg-amber-100/80 dark:bg-white/15" />

                              {/* Price & Quantity Area */}
                              <div className="catalog-card-pricing flex min-w-0 justify-between items-end gap-3">
                                <div className="flex min-w-0 flex-col gap-1">
                                  <span className="text-[8px] sm:text-[10px] font-bold text-default-400 dark:text-white/50 uppercase tracking-widest">
                                    {isMarketplaceView && !isLive ? "Previous listed price" : "Final Price"}
                                  </span>
                                  {marketplacePrice(item)}
                                </div>
                                <div className="catalog-card-stock flex min-w-0 flex-col items-end gap-1">
                                  <span className="text-[8px] sm:text-[10px] font-bold text-default-400 dark:text-white/50 uppercase tracking-widest">
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
                            <div
                              className="p-2 sm:p-3 bg-gradient-to-r from-amber-50/90 via-orange-50/60 to-white dark:from-[#21190f] dark:via-[#191510] dark:to-[#12100d] border-t border-amber-100/80 dark:border-white/10 flex flex-col gap-2 mt-auto"
                              onClick={(event) => event.stopPropagation()}
                            >
                              {canManageRow(item) && (
                                <div className="catalog-card-status-row flex w-full items-center justify-between gap-3 rounded-xl border border-amber-200/70 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-white/[0.055]">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-default-500 dark:text-white/55">
                                    Listing status
                                  </span>
                                  <LiveStatusToggle
                                    variantRate={item}
                                    refetchData={refetchData}
                                    apiEndpoint={
                                      rate === "catalogItem"
                                        ? apiRoutes.catalog.update
                                        : apiRoutesByRole[rate]
                                    }
                                    layout="inline"
                                  />
                                </div>
                              )}
                              <div className="catalog-card-standard-actions flex justify-between items-center w-full gap-2 overflow-x-auto pb-1 hide-scrollbar">
                                {actionButtons}
                                {canAddInventory && (
                                  <Button
                                    size="sm"
                                    variant="flat"
                                    color="warning"
                                    className={`${LISTING_ACTION_CLASS} shrink-0`}
                                    onPress={() => {
                                      setSelectedInventoryRate(item);
                                    }}
                                  >
                                    + Add Stock
                                  </Button>
                                )}
                              </div>
                              <div className="catalog-card-compact-actions hidden w-full min-w-0 items-center gap-2">
                                <div className="min-w-0 flex-1">
                                  {canCreateMarketplaceEnquiry ? (
                                    <CreateEnquiryButton
                                      productVariant={item.productVariantId}
                                      variantRate={item}
                                      compact
                                    />
                                  ) : !canManageRow(item) ? (
                                    <span className="text-[9px] font-black uppercase tracking-widest text-default-400">
                                      {isLive ? "Live" : "Offline"}
                                    </span>
                                  ) : null}
                                </div>
                                <Popover placement="bottom-end" showArrow>
                                  <PopoverTrigger>
                                    <Button
                                      isIconOnly
                                      size="sm"
                                      variant="flat"
                                      aria-label={`More options for ${toDisplayText(item.productVariant, "listing")}`}
                                      className={`${LISTING_ACTION_CLASS} h-10 w-10 min-w-10 max-w-10 shrink-0 p-0`}
                                    >
                                      <FiMoreHorizontal size={18} />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-[min(19rem,calc(100vw-2rem))] p-0">
                                    <div className="w-full space-y-3 p-4">
                                      <div className="grid grid-cols-2 gap-3 border-b border-divider pb-3">
                                        <div className="min-w-0">
                                          <p className="text-[9px] font-black uppercase tracking-widest text-default-400">Stock</p>
                                          <p className="truncate text-sm font-bold text-foreground" title={toDisplayText(item.inventoryQty || item.quantity, "—")}>
                                            {item.inventoryQty || item.quantity || "—"}
                                          </p>
                                        </div>
                                        <div className="min-w-0 text-right">
                                          <p className="text-[9px] font-black uppercase tracking-widest text-default-400">Location</p>
                                          <p className="truncate text-sm font-bold text-foreground" title={toDisplayText(item.location, "—")}>
                                            {item.location && item.location !== "--" ? item.location : "—"}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex flex-wrap items-center justify-end gap-2">
                                        {item.isMarketplaceView && item.isOwnedByViewer ? (
                                          <Button
                                            size="sm"
                                            variant="flat"
                                            color="warning"
                                            className={LISTING_ACTION_CLASS}
                                            onPress={() => router.push("/dashboard/product")}
                                            endContent={<FiArrowRight size={14} />}
                                          >
                                            Manage listing
                                          </Button>
                                        ) : item.isMarketplaceView ? (
                                          <>
                                            {!isAdminUser && isSellingMode &&
                                              typeof AddToCatalogAction !== "undefined" && (
                                                <AddToCatalogAction
                                                  rowItem={item}
                                                  isPersonalCatalogMode={isAssociateUser && !hasLinkedCompany}
                                                  onSuccess={() => refetchData()}
                                                />
                                              )}
                                            {(isBuyingMode || isAdminUser) &&
                                              typeof RequestSampleButton !== "undefined" && (
                                                <RequestSampleButton variantRate={item} />
                                              )}
                                          </>
                                        ) : actionButtons}
                                        {canAddInventory && (
                                          <Button
                                            size="sm"
                                            variant="flat"
                                            color="warning"
                                            className={LISTING_ACTION_CLASS}
                                            onPress={() => {
                                              setSelectedInventoryRate(item);
                                            }}
                                          >
                                            + Add Stock
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </PopoverContent>
                                </Popover>
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
                        "bg-obaol-500 font-black text-black shadow-[0_0_15px_rgba(207,152,60,0.4)]",
                      prev: "bg-transparent text-default-500 hover:bg-white/5",
                      next: "bg-transparent text-default-500 hover:bg-white/5",
                    }}
                  />
                </div>
              )}
            </section>
            <InventoryEditorDialog
              rate={selectedInventoryRate}
              companyId={inventoryCompanyId}
              onClose={() => setSelectedInventoryRate(null)}
              onCreated={refetchData}
            />
            {pendingDeletion && (
              <DeleteModal
                _id={pendingDeletion._id}
                name={pendingDeletion.name || pendingDeletion.customTitle || pendingDeletion.productVariant}
                deleteApiEndpoint={rate === "catalogItem" ? apiRoutes.catalog.remove : apiRoutesByRole[rate]}
                refetchData={refetchData}
                useBody={true}
                description={
                  isTradeListingRate && roleLower !== "admin"
                    ? "Listings can only be deleted during the first hour after creation. This action cannot be undone."
                    : undefined
                }
                isOpen={true}
                onClose={() => setPendingDeletion(null)}
              />
            )}
          </div>
        );
      }}
    </QueryComponent>
  );
};

export default VariantRate;
