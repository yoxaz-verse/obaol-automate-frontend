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
} from "@nextui-org/react";
import { FiMessageSquare, FiPlusCircle, FiCheckCircle, FiPhone, FiUser, FiPackage, FiInfo, FiArrowRight, FiList, FiX, FiShoppingBag, FiPlus } from "react-icons/fi";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import AddModal from "@/components/CurdTable/add-model";
import CommonTable from "@/components/CurdTable/common-table";
import QueryComponent from "@/components/queryComponent";
import SelectModal from "./select-modal"; // Commission logic
import AddToCatalogModal from "./AddToCatalogModal";
import AuthContext from "@/context/AuthContext";
import { getData, patchData, postData } from "@/core/api/apiHandler";
import { associateRoutes, variantRateRoutes, apiRoutes, displayedRateRoutes, catalogItemRoutes, inventoryRoutes } from "@/core/api/apiRoutes";
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
}) => {
  const router = useRouter();
  const productVariantValue = productVariant || null;
  const tableConfig = { ...initialTableConfig }; // avoid mutations
  const { user } = useContext(AuthContext);
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
        field.key !== "pincodeEntry"
    );
  }

  const { convertRate } = useCurrency();
  const roleLower = String(user?.role || "").toLowerCase();
  const isOperatorUser = roleLower === "operator" || roleLower === "team";
  const isAdminUser = roleLower === "admin" || isOperatorUser;
  const isAssociateUser = roleLower === "associate";
  const hasLinkedCompany = Boolean((user as any)?.associateCompanyId);
  const canAddOwnRate = isAdminUser || (isAssociateUser && hasLinkedCompany);
  const isMarketplaceView = additionalParams?.view === "marketplace";
  const canManageRow = (item: any) => {
    if (!item) return false;
    if (roleLower === "admin") return true;
    if (isOperatorUser && !item.isMarketplaceView && !item.isCatalogView && Boolean(item.companyId)) return true;
    return Boolean(item.isOwnerView || item.isCatalogView);
  };

  // If we only fetch associates if "rate" is "variantRate"
  const { data: associateByIdResponse } = useQuery({
    queryKey: ["associate", user?.id],
    queryFn: () => getData(`${associateRoutes.getAll}/${user?.id}`),
    enabled: user?.role === "Associate",
  });

  const associateByIdValue = associateByIdResponse?.data;
  const [filters, setFilters] = useState<Record<string, any>>({}); // Dynamic filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [inventoryQty, setInventoryQty] = useState("");
  const [inventorySubmitting, setInventorySubmitting] = useState(false);
  const [selectedInventoryRate, setSelectedInventoryRate] = useState<any>(null);
  const effectiveFilters = externalFilters ?? filters;
  const effectiveSearch = String(externalSearch ?? debouncedSearch ?? "").trim();
  const shouldUseServerSearch = !(isMarketplaceView && typeof externalSearch === "string");
  const serverSearch = shouldUseServerSearch ? effectiveSearch : "";
  const handleFiltersUpdate = (updatedFilters: Record<string, any>) => {
    setFilters(updatedFilters); // Update the filters
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

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
    enabled: !!user?.id && user?.role === "Associate",
  });

  const catalogItems = Array.isArray(catalogItemsResponse?.data?.data)
    ? catalogItemsResponse?.data?.data
    : (catalogItemsResponse?.data?.data?.data || []);

  const addedRateIds = new Set(catalogItems.map((item: any) => item.baseRateId?._id || item.baseRateId));

  const { data: inventoryResponse } = useQuery({
    queryKey: ["inventory-status", inventoryCompanyId, user?.id],
    queryFn: () =>
      getData(inventoryRoutes.getAll, {
        limit: 1000,
        ...(inventoryCompanyId && { associateCompany: inventoryCompanyId }),
        ...(isAssociateUser && !inventoryCompanyId && { associate: user?.id }),
      }),
    enabled: showInventoryStatus && (Boolean(inventoryCompanyId) || isAssociateUser),
  });

  const inventoryRows = Array.isArray(inventoryResponse?.data?.data?.data)
    ? inventoryResponse?.data?.data?.data
    : (inventoryResponse?.data?.data || []);

  const { data: statesResponse } = useQuery({
    queryKey: ["sample-request-states"],
    queryFn: () => getData(apiRoutes.state.getAll, { page: 1, limit: 1000 }),
  });
  const { data: districtsResponse } = useQuery({
    queryKey: ["sample-request-districts"],
    queryFn: () => getData(apiRoutes.district.getAll, { page: 1, limit: 2000 }),
  });
  const states = Array.isArray(statesResponse?.data?.data?.data)
    ? statesResponse?.data?.data?.data
    : (statesResponse?.data?.data || []);
  const districts = Array.isArray(districtsResponse?.data?.data?.data)
    ? districtsResponse?.data?.data?.data
    : (districtsResponse?.data?.data || []);

  const inventorySummaryMap = new Map<string, { totalQty: number; warehouses: Set<string> }>();
  for (const inv of inventoryRows || []) {
    const pvId = inv.productVariant?._id || inv.productVariant;
    const compId = inv.associateCompany?._id || inv.associateCompany || "";
    if (!pvId) continue;
    const key = `${pvId}::${compId}`;
    if (!inventorySummaryMap.has(key)) {
      inventorySummaryMap.set(key, { totalQty: 0, warehouses: new Set<string>() });
    }
    const summary = inventorySummaryMap.get(key)!;
    summary.totalQty += Number(inv.quantity || 0);
    if (inv.warehouseName) summary.warehouses.add(String(inv.warehouseName));
  }

  // Build the columns from table config
  const currentTable = rate;

  let columns = generateColumns(
    currentTable,
    tableConfig,
    user?.role
  );

  if (!showInventoryStatus) {
    columns = columns.filter((column: any) => column.uid !== "inventoryStatus");
  }

  if (
    rate === "variantRate" &&
    showAssociateColumn &&
    isOperatorUser &&
    !columns.some((column: any) => column.uid === "associate")
  ) {
    const productIndex = columns.findIndex((column: any) => column.uid === "productVariant");
    const associateColumn = { name: "ASSOCIATE", uid: "associate" };
    if (productIndex >= 0) {
      columns.splice(productIndex, 0, associateColumn);
    } else {
      columns.push(associateColumn);
    }
  }

  // Return the entire QueryComponent for data fetching
  return (
    <QueryComponent
      api={apiRoutesByRole[rate]}
      queryKey={[
        rate,
        apiRoutesByRole[rate],
        productVariantValue?._id,
        additionalParams,
        refetchData,
        effectiveFilters,
        serverSearch,
        addedRateIds.size, // Refresh when catalog items change
      ]}
      page={1}
      limit={1000}
      search={serverSearch}
      additionalParams={{
        ...(effectiveFilters || {}),
        ...(additionalParams || {}),
        ...(displayOnly && { selected: "true" }),
        // ...(!user?.id && { isLive: "true" }),
        ...(productVariantValue && { productVariant: productVariantValue._id }),
      }}
    >
      {(variantRateData: any, refetch) => {
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
                dynamicValuesFn: (categoryId: string) => fetchDependentOptions("subCategory", "category", categoryId),
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
                dynamicValuesFn: (subCategoryId: string) => fetchDependentOptions("product", "subCategory", subCategoryId),
                inForm: true,
                required: true,
              }
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
                  dynamicValuesFn: (productId: string) => fetchDependentOptions("productVariant", "product", productId),
                };
              })
            ];
          } else {
            // If fixed, just ensure productVariant is in correct state (usually it's hidden or disabled since we pass it in additionalVariable)
            variantRateFormFields = (variantRateFormFields || []).map((field: any) => {
              if (field.key === "productVariant") {
                return { ...field, inForm: false }; // Hide it as it's pre-selected
              }
              return field;
            });
          }
        }

        if (user?.role === "Associate") {
          // Hide both associate and commission for associates
          variantRateFormFields = variantRateFormFields.filter(
            (field: any) => field.key !== "associate" && field.key !== "commission"
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
              variantResponse?.data.data.data // Personal (DisplayedRate)
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
            return Boolean(item.associate || item.associateCompany || item.associateId || item.associateCompanyId);
          })
          .map((item: any) => {
            const { isDeleted, isActive, password, __v, ...rest } = item;

            if (rate === "variantRate") {
              // Row is a VariantRate (My Products OR Marketplace)
              const isMarketplace = isMarketplaceView;
              const isOwner = item.associate?._id === user?.id || item.associate === user?.id;
              const pvId = item.productVariant?._id || item.productVariant || item.productVariantId;
              const compId = item.associateCompany?._id || item.associateCompany || "";
              const inventorySummary = showInventoryStatus ? inventorySummaryMap.get(`${pvId}::${compId}`) : null;
              const inventoryStatus = inventorySummary
                ? `In Stock: ${inventorySummary.totalQty} MT • Warehouses: ${inventorySummary.warehouses.size}`
                : "No inventory";
              const hasInventory = Boolean(inventorySummary && inventorySummary.totalQty > 0);

              const supplierRate = item.rate || 0;
              const quantityValue = item.quantity;
              const adminCommission = item.commission || 0;
              const totalRate = supplierRate + adminCommission;
              const isCommissionAdded = Number(adminCommission) > 0;

              // Rule: Owners see base rate only. Non-owners see final price (base + admin commission).
              const displayedPrice = (isOwner && !isMarketplace)
                ? supplierRate
                : totalRate;

              return {
                ...rest,
                isLive: item.isLive,
                associate:
                  item.associateCompany?.name || (isOwner ? "My Company" : "OBAOL"),
                associateId: item.associate?._id || item.associate,
                companyId: item.associateCompany?._id || item.associateCompany || item.associate?.associateCompany,
                productVariant: String(
                  (
                    (item.productVariant?.product?.name || "") +
                    " " +
                    (item.productVariant?.name || item.productVariantName || "")
                  ).trim() || "N/A"
                ),
                product: item.productVariant?.product?.name,
                productId: item.productVariant?.product?._id || item.productVariant?.product,
                productVariantId: item.productVariant?._id || item.productVariant || item.productVariantId,

                // Column Mapping
                rate: isAdminUser && isMarketplace
                  ? convertRate(totalRate)
                  : user?.role?.toLowerCase() === "admin"
                    ? convertRate(supplierRate)
                    : convertRate(displayedPrice),
                commission: isAdminUser && isMarketplace
                  ? (isCommissionAdded ? convertRate(adminCommission) : "-")
                  : adminCommission
                    ? convertRate(adminCommission)
                    : 0,
                commissionStatus: isCommissionAdded ? "+" : "-",
                finalRate: convertRate(totalRate),
                quantity: quantityValue !== undefined && quantityValue !== null && quantityValue !== ""
                  ? `${quantityValue} MT`
                  : "-",
                quantityRaw: quantityValue,
                inventoryQty: inventorySummary
                  ? `${inventorySummary.totalQty} MT`
                  : "-",
                inventoryStatus,
                hasInventory,

                rawBasePrice: totalRate,
                rawCommission: 0,
                isMarketplaceView: isMarketplace,
                isOwnerView: isOwner && !isMarketplace,
                isAdded: addedRateIds.has(item._id),
                lastLiveDate: item.lastLiveDate || item.updatedAt || item.createdAt
              };
            } else if (rate === "catalogItem") {
              // Row is a CatalogItem (Added to Catalog)
              const baseRate = item.baseRateId;
              const supplierRate = baseRate?.rate || 0;
              const quantityValue = baseRate?.quantity;
              const adminCommission = baseRate?.commission || 0;
              const mediatorMarkup = item.margin || 0;

              // Rule: Mediator sees final display rate (Base + Admin + Mediator Markup)
              const finalPrice = supplierRate + adminCommission + mediatorMarkup;

              return {
                ...rest,
                isLive: item.isLive && (baseRate?.isLive !== false),
                actualIsLive: item.isLive,
                supplierIsLive: baseRate?.isLive !== false,
                associate: item.associateCompanyId?.name || "My Company",
                rate: convertRate(finalPrice),
                commission: mediatorMarkup ? convertRate(mediatorMarkup) : convertRate(0),
                quantity: quantityValue !== undefined && quantityValue !== null && quantityValue !== ""
                  ? `${quantityValue} MT`
                  : "-",
                quantityRaw: quantityValue,
                associateId: item.associateId?._id || item.associateId,
                originalOwnerId: baseRate?.associate?._id || baseRate?.associate,
                companyId: item.associateCompanyId?._id || item.associateCompanyId,
                productVariant: item.productVariantId?.name,
                product: item.productVariantId?.product?.name,
                productId: item.productVariantId?.product?._id || item.productVariantId?.product,
                productVariantId: item.productVariantId?._id,
                rawBasePrice: (supplierRate + adminCommission),
                rawCommission: mediatorMarkup,
                customTitle: item.customTitle,
                variantRate: item.baseRateId,
                isCatalogView: true,
                isAdded: true,
                isOwnerView: true,
                lastLiveDate: item.lastLiveDate || item.updatedAt || item.createdAt
              };
            } else {
              // Row is a DisplayedRate (Personalized - fallback/old)
              const supplierRate = item.variantRate?.rate || 0;
              const quantityValue = item.variantRate?.quantity;
              const adminCommission = item.variantRate?.commission || 0;
              const basePriceForUser = supplierRate + adminCommission;

              const associateMargin = item.commission || 0;
              const totalRate = basePriceForUser + associateMargin;
              return {
                ...rest,
                isLive: item.isLive,
                associate: item.associateCompany?.name || "My Company",
                rate: convertRate(totalRate),
                quantity: quantityValue !== undefined && quantityValue !== null && quantityValue !== ""
                  ? `${quantityValue} MT`
                  : "-",
                quantityRaw: quantityValue,
                associateId: item.associate?._id,
                companyId: item.associate?.associateCompany,
                productVariant: item.variantRate?.productVariant?.name,
                product: item.variantRate?.productVariant?.product?.name,
                productId: item.variantRate?.productVariant?.product?._id || item.variantRate?.productVariant?.product,
                productVariantId: item.variantRate?.productVariant?._id,
                rawBasePrice: basePriceForUser,
                rawCommission: associateMargin,
                variantRateId: item.variantRate?._id,
              };
            }
          });

        const searchText = effectiveSearch.toLowerCase();
        const finalTableData =
          searchText
            ? tableData.filter((row: any) => {
              const haystack = [
                row.product,
                row.productVariant,
                row.associate,
                row.warehouseName,
                row.rate,
                row.quantity,
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
              return haystack.includes(searchText);
            })
            : tableData;

        return (
          <div className="w-full max-w-full min-w-0">
            {(!hideBuiltInFilters || (!displayOnly && rate === "variantRate" && canAddOwnRate)) && (
              <div className="flex justify-between items-center gap-3 mb-4">
                {!hideBuiltInFilters && (
                  <DynamicFilter
                    currentTable={"variantRate"}
                    formFields={filterVariantRateFormFields}
                    onApply={handleFiltersUpdate}
                    searchValue={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search rates..."
                  />
                )}
                {!displayOnly && rate === "variantRate" && canAddOwnRate && (
                  <AddModal
                    buttonLabel="Add"
                    currentTable={rate}
                    formFields={variantRateFormFields}
                    apiEndpoint={apiRoutesByRole[rate]}
                    refetchData={refetchData}
                    additionalVariable={{
                      ...(productVariantValue && { productVariant: productVariantValue._id }),
                      ...(user?.role === "Associate" && { associate: user?.id }),
                    }}
                  />
                )}
              </div>
            )}
            {!displayOnly && rate === "variantRate" && isAssociateUser && !hasLinkedCompany && (
              <Card className="mb-4 border border-warning-300/30 bg-warning-500/10">
                <CardBody className="py-3 px-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-warning-700 dark:text-warning-300">
                        Link a company to add your own rates
                      </p>
                      <p className="text-xs text-warning-700/80 dark:text-warning-200/90">
                        You can still add marketplace products to your personal catalog.
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
            <section className="hidden md:block w-full min-w-0 max-w-full overflow-hidden">
              <TableFrame>
                <CommonTable
                  TableData={finalTableData}
                  columns={columns}
                  isLoading={false}
                  emptyContent={
                    rate === "catalogItem" && isAssociateUser && finalTableData.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                        <div className="relative mb-6">
                          <div className="absolute inset-0 bg-warning-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
                          <div className="relative p-6 bg-content2 border border-divider rounded-[2.5rem] text-warning-500 shadow-xl">
                            <FiShoppingBag size={48} strokeWidth={1.5} />
                          </div>
                          <div className="absolute -bottom-2 -right-2 p-2 bg-success-500 text-white rounded-full border-4 border-background shadow-lg">
                            <FiPlus size={16} strokeWidth={3} />
                          </div>
                        </div>
                        <h3 className="text-xl font-black text-foreground tracking-tight uppercase">Your Catalog is Empty</h3>
                        <p className="text-default-500 max-w-[340px] mt-2 mb-8 text-sm leading-relaxed font-medium">
                          Personalize your catalog to share best rates with your buyers. Discover and add global products from the marketplace.
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
                    ) : null
                  }
                  otherModal={(rowItem: any) => {
                    const canAddInventory =
                      showInventoryStatus &&
                      rowItem &&
                      !rowItem.hasInventory &&
                      (roleLower === "admin" || isOperatorUser || isAssociateUser);
                    if (rowItem.isMarketplaceView) {
                      return (
                        <div className="flex items-center justify-center gap-2">
                          {!isAdminUser && (
                            <AddToCatalogButton
                              rowItem={rowItem}
                              isPersonalCatalogMode={isAssociateUser && !hasLinkedCompany}
                              onSuccess={() => refetchData()}
                            />
                          )}
                          {(user?.role === "Associate" || isAdminUser) && (
                            <CreateEnquiryButton
                              productVariant={rowItem.productVariantId}
                              variantRate={rowItem}
                            />
                          )}
                          <RequestSampleButton
                            variantRate={rowItem}
                            states={states}
                            districts={districts}
                          />
                          {canAddInventory && (
                            <Button
                              size="sm"
                              variant="flat"
                              color="warning"
                              onPress={() => {
                                setSelectedInventoryRate(rowItem);
                                setInventoryQty("");
                                setInventoryModalOpen(true);
                              }}
                            >
                              Add Inventory
                            </Button>
                          )}
                        </div>
                      );
                    }
                    return (
                      <div className="flex items-center justify-center">
                        {/* LiveToggle or Live Chip */}
                        {canManageRow(rowItem) ? (
                          <div className="flex flex-col items-center gap-1">
                            <LiveToggle
                              variantRate={rowItem}
                              refetchData={refetchData}
                              apiEndpoint={rate === "catalogItem" ? apiRoutes.catalog.update : apiRoutesByRole[rate]}
                            />
                            {rowItem.isCatalogView && !rowItem.supplierIsLive && (
                              <Tooltip content="Supplier rate is currently not live. This item will not be visible to buyers.">
                                {/* @ts-ignore */}
                                <Chip size="sm" color="danger" variant="flat" className="h-5 text-[10px]">Supplier Offline</Chip>
                              </Tooltip>
                            )}
                            {canAddInventory && (
                              <Button
                                size="sm"
                                variant="flat"
                                color="warning"
                                onPress={() => {
                                  setSelectedInventoryRate(rowItem);
                                  setInventoryQty("");
                                  setInventoryModalOpen(true);
                                }}
                              >
                                Add Inventory
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            {rowItem.isLive ? (
                              <div className="flex items-center gap-2">
                                {/* @ts-ignore */}
                                <Chip color={"success"} variant="dot" size="sm">
                                  Live
                                </Chip>
                                {!rowItem.isCatalogView && (
                                  <CreateEnquiryButton
                                    productVariant={
                                      rowItem.productVariantId ||
                                      rowItem.variantRate?.productVariant?._id
                                    }
                                    variantRate={rowItem}
                                  />
                                )}
                                <RequestSampleButton
                                  variantRate={rowItem}
                                  states={states}
                                  districts={districts}
                                />
                                {canAddInventory && (
                                  <Button
                                    size="sm"
                                    variant="flat"
                                    color="warning"
                                    onPress={() => {
                                      setSelectedInventoryRate(rowItem);
                                      setInventoryQty("");
                                      setInventoryModalOpen(true);
                                    }}
                                  >
                                    Add Inventory
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <>
                                <span className="text-default-400 text-tiny italic whitespace-nowrap h-[20px] flex items-center">
                                  Not Live
                                </span>
                                {isAdminUser && !rowItem.isCatalogView && (
                                  <div className="flex items-center gap-2">
                                    <CreateEnquiryButton
                                      productVariant={
                                        rowItem.productVariantId ||
                                        rowItem.variantRate?.productVariant?._id
                                      }
                                      variantRate={rowItem}
                                    />
                                    <RequestSampleButton
                                      variantRate={rowItem}
                                      states={states}
                                      districts={districts}
                                    />
                                  </div>
                                )}
                                {canAddInventory && (
                                  <Button
                                    size="sm"
                                    variant="flat"
                                    color="warning"
                                    onPress={() => {
                                      setSelectedInventoryRate(rowItem);
                                      setInventoryQty("");
                                      setInventoryModalOpen(true);
                                    }}
                                  >
                                    Add Inventory
                                  </Button>
                                )}
                              </>
                            )}
                            <div className="h-[10px]" /> {/* Spacer to align with Edit/Delete/LiveToggle layout */}
                          </div>
                        )}
                      </div>
                    );
                  }}
                  editModal={(item: any) => {
                    if (!user) return null;
                    if (canManageRow(item)) {
                      const isCoolingTime = isCooling(item.coolingStartTime);
                      const isDifferentAssociate = item.associateId !== user.id;

                      if (roleLower === "admin" || isOperatorUser || (isDifferentAssociate && isCoolingTime)) {
                        return (
                          <EditModal
                            _id={item._id}
                            initialData={{
                              ...item,
                              quantity: item.quantityRaw
                            }}
                            currentTable={rate}
                            formFields={tableConfig[rate]}
                            apiEndpoint={rate === "catalogItem" ? apiRoutes.catalog.update : `${apiRoutesByRole[rate]}`}
                            refetchData={refetchData}
                          />
                        );
                      }
                    }
                    return null;
                  }}
                  deleteModal={(item: any) => {
                    if (!user) return null;
                    if (canManageRow(item)) {
                      return (
                        <DeleteModal
                          _id={item._id}
                          name={item.name || item.customTitle || item.productVariant}
                          deleteApiEndpoint={rate === "catalogItem" ? apiRoutes.catalog.remove : apiRoutesByRole[rate]}
                          refetchData={refetchData}
                          useBody={true}
                        />
                      );
                    }
                    return null;
                  }}
                />
              </TableFrame>
            </section >
            <section className="md:hidden space-y-2">
              {finalTableData.length === 0 && rate === "catalogItem" && isAssociateUser && (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-content2/50 rounded-3xl border border-divider/50">
                  <div className="p-5 bg-warning-500/10 rounded-2xl text-warning-500 mb-5">
                    <FiShoppingBag size={40} />
                  </div>
                  <h3 className="text-lg font-black text-foreground uppercase tracking-tight">Your Catalog is Empty</h3>
                  <p className="text-xs text-default-500 mt-2 mb-6 leading-relaxed">
                    Personalize your catalog by adding products from the marketplace.
                  </p>
                  <Button
                    color="warning"
                    variant="shadow"
                    className="font-black px-8 rounded-xl h-12 text-xs uppercase tracking-widest text-black"
                    onPress={() => router.push("/dashboard/marketplace")}
                  >
                    Explore Marketplace
                  </Button>
                </div>
              )}
              {finalTableData.map((item: any, index: number) => {
                const isLive = item.isLive;
                const canAddInventory =
                  showInventoryStatus &&
                  item &&
                  !item.hasInventory &&
                  (roleLower === "admin" || isOperatorUser || isAssociateUser);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="rounded-2xl border border-foreground/[0.07] bg-foreground/[0.02] px-4 py-3"
                  >
                    {/* Top row: product info + live badge */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="text-[10px] font-semibold text-warning-500 uppercase tracking-widest truncate mb-0.5">
                          {item.product || "Product"}
                        </p>
                        <p className="text-sm font-bold text-foreground truncate">
                          {item.productVariant || "Variant"}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <FiUser size={10} className="shrink-0 text-default-400" />
                          <span className="text-[10px] text-default-400 truncate">{item.associate || "N/A"}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${isLive
                          ? "text-success-600 bg-success-500/10"
                          : "text-default-400 bg-foreground/5"
                          }`}>
                          {isLive ? "● Live" : "○ Off"}
                        </span>
                        {item.isAdded && !item.supplierIsLive && (
                          <span className="text-[9px] text-danger-400 font-bold">Supplier Off</span>
                        )}
                      </div>
                    </div>

                    {/* Bottom row: rate + actions */}
                    <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-foreground/[0.06]">
                      <div>
                        <p className="text-[10px] font-semibold text-default-400 uppercase tracking-widest">Rate</p>
                        <p className="text-xl font-black text-foreground">{item.rate || "—"}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {canManageRow(item) ? (
                          <>
                            <EditModal
                              _id={item._id}
                              initialData={{
                                ...item,
                                quantity: item.quantityRaw
                              }}
                              currentTable={rate}
                              formFields={tableConfig[rate]}
                              apiEndpoint={rate === "catalogItem" ? apiRoutes.catalog.update : `${apiRoutesByRole[rate]}`}
                              refetchData={refetchData}
                            />
                            <DeleteModal
                              _id={item._id}
                              name={item.name || item.customTitle || item.productVariant}
                              deleteApiEndpoint={rate === "catalogItem" ? apiRoutes.catalog.remove : apiRoutesByRole[rate]}
                              refetchData={refetchData}
                              useBody={true}
                            />
                          </>
                        ) : item.isMarketplaceView ? (
                          <>
                            {!isAdminUser && (
                              <AddToCatalogButton
                                rowItem={item}
                                isPersonalCatalogMode={isAssociateUser && !hasLinkedCompany}
                                onSuccess={() => refetchData()}
                              />
                            )}
                            {(user?.role === "Associate" || isAdminUser) && (
                              <CreateEnquiryButton productVariant={item.productVariantId} variantRate={item} />
                            )}
                            <RequestSampleButton
                              variantRate={item}
                              states={states}
                              districts={districts}
                            />
                          </>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {!item.isCatalogView && (isLive || isAdminUser) && (
                              <CreateEnquiryButton
                                productVariant={item.productVariantId || item.variantRate?.productVariant?._id}
                                variantRate={item}
                              />
                            )}
                            {(isAdminUser || (isLive && !item.isCatalogView)) && (
                              <RequestSampleButton
                                variantRate={item}
                                states={states}
                                districts={districts}
                              />
                            )}
                          </div>
                        )}
                        {canAddInventory && (
                          <Button
                            size="sm"
                            variant="flat"
                            color="warning"
                            onPress={() => {
                              setSelectedInventoryRate(item);
                              setInventoryQty("");
                              setInventoryModalOpen(true);
                            }}
                          >
                            Add Inventory
                          </Button>
                        )}
                      </div>
                    </div>

                    {canManageRow(item) && (
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-foreground/[0.05]">
                        <span className="text-[10px] text-default-400">Visibility</span>
                        <LiveToggle
                          variantRate={item}
                          refetchData={refetchData}
                          apiEndpoint={rate === "catalogItem" ? apiRoutes.catalog.update : apiRoutesByRole[rate]}
                        />
                      </div>
                    )}
                  </motion.div>
                );
              })}
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
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-black tracking-tight text-foreground">Add Inventory</h3>
                      <p className="text-[10px] text-default-400 font-bold uppercase tracking-widest mt-0.5">Stock in Metric Tonnes (MT)</p>
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody className="py-5 px-6 flex flex-col gap-4">
                  {/* Product context card */}
                  {selectedInventoryRate && (
                    <div className="p-3 bg-default-100/50 rounded-xl border border-divider/30 flex justify-between items-center gap-3">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-[10px] font-black text-default-400 uppercase tracking-widest">Product</span>
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
                      <span className="text-default-400 text-sm font-semibold pointer-events-none">MT</span>
                    }
                    description="Enter the quantity available at this location in Metric Tonnes."
                    classNames={{
                      label: "text-xs font-bold text-default-500 uppercase tracking-wider",
                    }}
                  />

                  {/* Info note */}
                  <div className="flex items-start gap-2 text-xs text-default-400 bg-default-100/40 px-3 py-2.5 rounded-xl border border-divider/20">
                    <svg className="w-3.5 h-3.5 shrink-0 mt-0.5 text-warning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Location, state, and district will be inherited from the rate record.
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
                        const pvId = selectedInventoryRate.productVariantId || selectedInventoryRate.productVariant?._id || selectedInventoryRate.productVariant;
                        const productId = selectedInventoryRate.productId || selectedInventoryRate.productVariant?.product?._id || selectedInventoryRate.productVariant?.product;
                        const compId = selectedInventoryRate.companyId || selectedInventoryRate.associateCompany?._id || selectedInventoryRate.associateCompany || inventoryCompanyId;
                        let associateId = selectedInventoryRate.associateId || selectedInventoryRate.associate?._id || selectedInventoryRate.associate;

                        if (!associateId && compId) {
                          const assocResponse = await getData(associateRoutes.getAll, {
                            associateCompany: compId,
                            limit: 1,
                          });
                          const assocRows = Array.isArray(assocResponse?.data?.data?.data)
                            ? assocResponse?.data?.data?.data
                            : (assocResponse?.data?.data || []);
                          associateId = assocRows?.[0]?._id || assocRows?.[0]?.id;
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
                          state: selectedInventoryRate.stateId || selectedInventoryRate.state?._id || selectedInventoryRate.state,
                          district: selectedInventoryRate.districtId || selectedInventoryRate.district?._id || selectedInventoryRate.district,
                          division: selectedInventoryRate.divisionId || selectedInventoryRate.division?._id || selectedInventoryRate.division,
                          pincodeEntry: selectedInventoryRate.pincodeEntryId || selectedInventoryRate.pincodeEntry?._id || selectedInventoryRate.pincodeEntry,
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
                        console.error("Inventory add failed:", error?.response?.data || error);
                        showToastMessage({
                          type: "error",
                          message: error?.response?.data?.message || "Unable to add inventory. Please try again.",
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
    </QueryComponent >
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
        className={`text-[10px] font-bold m-0 p-0 leading-none ${isSelected ? "text-success-500" : "text-danger-500"
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
  states: any[];
  districts: any[];
}

const RequestSampleButton: React.FC<RequestSampleButtonProps> = ({
  variantRate,
  states,
  districts,
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { user } = useContext(AuthContext);
  const [requestState, setRequestState] = useState("");
  const [requestDistrict, setRequestDistrict] = useState("");
  const [requestDivision, setRequestDivision] = useState("");
  const [requestAddress, setRequestAddress] = useState("");
  const [requestPincode, setRequestPincode] = useState("");
  const [pincodeSearch, setPincodeSearch] = useState("");
  const [requestedSampleQtyKg, setRequestedSampleQtyKg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
    }
  }, [isOpen]);

  // Dynamic Divisions Fetching
  const { data: divisionResponse, isLoading: divisionsLoading } = useQuery({
    queryKey: ["request-divisions", requestDistrict],
    queryFn: () => getData(apiRoutes.division.getAll, { district: requestDistrict, limit: 1000 }),
    enabled: !!requestDistrict,
  });

  // Dynamic Pincodes Fetching
  const { data: pincodeResponse, isLoading: pincodesLoading } = useQuery({
    queryKey: ["request-pincodes", requestDivision, debouncedPincodeSearch],
    queryFn: () =>
      getData(apiRoutes.pincodeEntry.getAll, {
        division: requestDivision,
        search: debouncedPincodeSearch,
        limit: 100,
      }),
    enabled: !!requestDivision,
  });

  const divisionOptions = useMemo(() => {
    const raw = divisionResponse?.data?.data?.data || divisionResponse?.data?.data || divisionResponse?.data || [];
    return Array.isArray(raw) ? raw : [];
  }, [divisionResponse]);

  const pincodeOptions = useMemo(() => {
    const raw = pincodeResponse?.data?.data?.data || pincodeResponse?.data?.data || pincodeResponse?.data || [];
    return Array.isArray(raw) ? raw : [];
  }, [pincodeResponse]);

  const districtOptions = useMemo(() => {
    return districts.filter((d: any) => String(d.state?._id || d.state) === String(requestState));
  }, [districts, requestState]);

  const handleSubmit = async () => {
    if (!requestState || !requestDistrict || !requestDivision) {
      showToastMessage({
        type: "error",
        message: "Select state, district, and division.",
      });
      return;
    }
    if (!requestedSampleQtyKg || Number.isNaN(Number(requestedSampleQtyKg)) || Number(requestedSampleQtyKg) <= 0) {
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
    if (!window.confirm("Are you sure you want to request a sample?")) return;
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
      });
      showToastMessage({
        type: "success",
        message: "Sample request sent to supplier.",
      });
      setIsSuccess(true);
      setRequestState("");
      setRequestDistrict("");
      setRequestDivision("");
      setRequestAddress("");
      setRequestPincode("");
      setRequestedSampleQtyKg("");
    } catch (error: any) {
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || "Unable to request sample.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const role = String(user?.role || "").toLowerCase();
  if (role !== "associate" && role !== "admin" && role !== "operator") return null;

  return (
    <div className="flex flex-col items-center gap-2">
      <Tooltip content="Request Sample">
        <span
          onClick={onOpen}
          className="text-lg text-warning-500 cursor-pointer active:opacity-50 hover:text-warning-600 transition-all duration-200 transform hover:scale-110"
        >
          <FiPackage />
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
        <ModalContent className="bg-gradient-to-br from-background to-content1 border border-divider max-h-[90vh] overflow-hidden">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b border-divider pb-3 px-6">
                <h3 className="text-lg font-black tracking-tight text-foreground">Request Sample</h3>
                <p className="text-xs text-default-400 font-bold uppercase tracking-widest mt-0.5">
                  Confirm location for sample delivery
                </p>
              </ModalHeader>
              <ModalBody className="py-6 px-8 flex flex-col gap-6 overflow-y-auto">
                {isSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-10 gap-6 text-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-2">
                      <FiCheckCircle className="text-success text-5xl" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-black text-2xl tracking-tight text-foreground uppercase">Request Sent!</h3>
                      <p className="text-sm text-default-500 font-medium max-w-[240px] leading-relaxed">
                        Your sample request has been successfully submitted to the supplier.
                      </p>
                    </div>
                    <Button
                      className="font-black uppercase tracking-widest mt-4 px-10 shadow-lg shadow-success/20"
                      color="success"
                      variant="shadow"
                      onPress={onClose}
                    >
                      Acknowledge
                    </Button>
                  </motion.div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        size="sm"
                        label="State"
                        labelPlacement="outside"
                        placeholder="Select state"
                        variant="bordered"
                        selectedKeys={requestState ? [requestState] : []}
                        onSelectionChange={(keys) => {
                          const value = Array.from(keys as Set<string>)[0] || "";
                          setRequestState(value);
                          setRequestDistrict("");
                          setRequestDivision("");
                          setRequestPincode("");
                          setPincodeSearch("");
                        }}
                      >
                        {states.map((state: any) => (
                          <SelectItem key={state._id} value={state._id}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </Select>

                      <Select
                        size="sm"
                        label="District"
                        labelPlacement="outside"
                        placeholder="Select district"
                        variant="bordered"
                        selectedKeys={requestDistrict ? [requestDistrict] : []}
                        isDisabled={!requestState}
                        onSelectionChange={(keys) => {
                          const value = Array.from(keys as Set<string>)[0] || "";
                          setRequestDistrict(value);
                          setRequestDivision("");
                          setRequestPincode("");
                          setPincodeSearch("");
                        }}
                      >
                        {districtOptions.map((district: any) => (
                          <SelectItem key={district._id} value={district._id}>
                            {district.name}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        size="sm"
                        label="Division"
                        labelPlacement="outside"
                        placeholder={divisionsLoading ? "Loading divisions..." : "Select division"}
                        variant="bordered"
                        selectedKeys={requestDivision ? [requestDivision] : []}
                        isDisabled={!requestDistrict || divisionsLoading}
                        isLoading={divisionsLoading}
                        onSelectionChange={(keys) => {
                          const value = Array.from(keys as Set<string>)[0] || "";
                          setRequestDivision(value);
                          setRequestPincode("");
                          setPincodeSearch("");
                        }}
                      >
                        {divisionOptions.map((division: any) => (
                          <SelectItem key={division._id} value={division._id}>
                            {division.name}
                          </SelectItem>
                        ))}
                      </Select>

                      {/* @ts-ignore */}
                      <Autocomplete
                        size="sm"
                        label="Pincode"
                        labelPlacement="outside"
                        placeholder={pincodesLoading ? "Searching..." : "Type pincode or office..."}
                        variant="bordered"
                        isLoading={pincodesLoading}
                        allowsCustomValue={true}
                        isDisabled={!requestDivision}
                        onSelectionChange={(id) => {
                          const selected = pincodeOptions.find((p: any) => p._id === id);
                          if (selected) {
                            setRequestPincode(selected.pincode);
                            setPincodeSearch(selected.pincode);
                          }
                        }}
                        onInputChange={(value) => {
                          setRequestPincode(value);
                          setPincodeSearch(value);
                        }}
                      >
                        {pincodeOptions.map((p: any) => (
                          /* @ts-ignore */
                          <AutocompleteItem key={p._id} textValue={p.pincode}>
                            {p.pincode} - {p.officename}
                          </AutocompleteItem>
                        ))}
                      </Autocomplete>
                    </div>

                    <Textarea
                      size="sm"
                      label="Full Address"
                      labelPlacement="outside"
                      placeholder="Street, locality, landmark"
                      variant="bordered"
                      minRows={3}
                      value={requestAddress}
                      onValueChange={setRequestAddress}
                    />

                    <Input
                      size="sm"
                      label="Sample Qty (kg)"
                      labelPlacement="outside"
                      placeholder="Enter quantity in kg"
                      variant="bordered"
                      type="number"
                      min={0}
                      value={requestedSampleQtyKg}
                      onValueChange={setRequestedSampleQtyKg}
                    />

                    <div className="flex items-start gap-2.5 p-3.5 bg-primary/5 rounded-2xl border border-primary/10">
                      <FiInfo className="text-primary mt-0.5 shrink-0" size={16} />
                      <p className="text-xs text-default-600 leading-relaxed font-medium">
                        Are you sure you want to request a sample? The supplier will provide the minimum available quantity and a corresponding quote.
                      </p>
                    </div>
                  </>
                )}
              </ModalBody>
              <ModalFooter className={`border-t border-divider py-3 px-6 ${isSuccess ? "hidden" : "flex"}`}>
                <Button size="sm" variant="light" onPress={onClose} isDisabled={submitting}>
                  Cancel
                </Button>
                <Button size="sm" color="warning" onPress={handleSubmit} isLoading={submitting}>
                  Request Sample
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
      <Tooltip content="Create Enquiry">
        <span
          onClick={onOpen}
          className="text-lg text-primary cursor-pointer active:opacity-50 hover:text-primary-600 transition-all duration-200 transform hover:scale-110"
        >
          <FiMessageSquare />
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
                    <h3 className="text-lg font-black tracking-tight text-foreground">New Enquiry</h3>
                    <p className="text-[10px] text-default-400 font-bold uppercase tracking-widest mt-0.5">Direct Manufacturer Protocol</p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="py-4 px-6 overflow-y-auto">
                <div className="mb-4 p-3 bg-default-100/50 rounded-xl border border-divider/30 flex justify-between items-center shadow-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-default-400 uppercase tracking-widest">Target Product</span>
                    <span className="text-sm font-bold text-foreground">{variantRate.product}</span>
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
              </ModalBody>
              <ModalFooter className="flex flex-col gap-2 border-t border-divider py-3 px-6">
                <div className="flex items-center gap-2 text-primary-500 bg-primary-500/10 px-3 py-2 rounded-xl w-full">
                  <FiInfo size={16} />
                  <p className="text-xs font-medium">Our team will respond within 10 minutes</p>
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
const AddEnquiryForm: React.FC<AddEnquiryFormProps> = ({
  variantRate,
  productVariant,
  onClose,
}) => {
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
  const isAdminUser = user?.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "operator";

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
  const activeAssociateId = associateProfile?._id || user?.id;
  const defaultSellerAssociateId = variantRate.associateId || variantRate.associate?._id || variantRate.associate || "";

  const { data: associatesResponse } = useQuery({
    queryKey: ["associates-list-for-enquiry"],
    queryFn: () => getData(apiRoutesByRole["associate"], { page: 1, limit: 200 }),
    enabled: isAdminUser,
  });

  const associateOptions = (() => {
    const raw = associatesResponse?.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.data?.data)) return raw.data.data;
    return [];
  })();

  useEffect(() => {
    if (!name) {
      setName(
        associateProfile?.name ||
        (user as any)?.name ||
        (user as any)?.fullName ||
        ""
      );
    }
    if (!phoneNumber) {
      setPhoneNumber(
        associateProfile?.phone ||
        associateProfile?.phoneNumber ||
        (user as any)?.phone ||
        (user as any)?.phoneNumber ||
        ""
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
      const isOperatorCreator = roleLower === "operator" || roleLower === "team";
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
        const pvRes: any = await getData(`${apiRoutesByRole["productVariant"]}/${resolvedProductVariantId}`);
        const pv = pvRes?.data?.data || pvRes?.data || pvRes;
        resolvedProductId = pv?.product?._id || pv?.product || null;
      }
      const resolvedSellerAssociateId = defaultSellerAssociateId;
      const resolvedBuyerAssociateId = isAdminUser
        ? buyerAssociateId
        : activeAssociateId;

      if (!resolvedProductId) {
        throw new Error("Product is missing for this rate. Please refresh and try again.");
      }
      if (!resolvedBuyerAssociateId) {
        throw new Error("Buyer associate is required.");
      }
      if (!resolvedSellerAssociateId) {
        throw new Error("Seller associate is required.");
      }

      const baseSpecification = `Variant: ${variantRate.productVariant || "Standard"}`;
      const finalSpecification =
        specification?.trim().length > 0
          ? `${baseSpecification}\n\nNotes: ${specification.trim()}`
          : baseSpecification;

      const payload = {
        productId: resolvedProductId,
        quantity: Number(quantity) || 1,
        specifications: finalSpecification,
        buyerAssociateId: resolvedBuyerAssociateId,
        sellerAssociateId: resolvedSellerAssociateId,
        mediatorAssociateId: variantRate.mediatorAssociateId || null,
        variantRateId: variantRate.isCatalogView ? null : variantRate._id,
        catalogItemId: variantRate.isCatalogView ? variantRate._id : null,
        preferredIncoterm: preferredIncotermId || null,
        ...(isOperatorCreator && user?.id ? { assignedOperatorId: user.id } : {}),
        // Optional name/phone if they were overridden in the form
        ...(name && name !== associateProfile?.name && { name }),
        ...(phoneNumber && phoneNumber !== (associateProfile?.phone || associateProfile?.phoneNumber) && { phoneNumber }),
        notes: `Enquiry for ${variantRate.product} - ${variantRate.productVariant}`
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
      const fallback = error?.message || "Something went wrong. Please try again.";
      alert(backendMessage || validationMessage || fallback);
      setIsLoading(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdminUser && !buyerAssociateId) {
      alert("Please select a buyer associate.");
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
          <h3 className="text-2xl font-black tracking-tight text-foreground">Enquiry Created</h3>
          <p className="text-default-500 max-w-[360px] text-sm leading-relaxed">
            Your enquiry for {variantRate.product} was created successfully. Continue to enquiry details to proceed with responses, negotiation, and execution.
          </p>
        </div>
        <div className="w-full max-w-[420px] rounded-2xl border border-primary-300/35 bg-primary-500/10 px-4 py-3 text-left">
          <p className="text-[11px] font-black uppercase tracking-widest text-primary-600 dark:text-primary-300">Next Step</p>
          <p className="text-sm text-foreground mt-1">Open enquiry details now to continue the transaction flow.</p>
        </div>
        <div className="mt-1 flex w-full max-w-[420px] flex-col gap-2.5">
          <Button
            color="primary"
            size="lg"
            className="rounded-2xl font-black tracking-wide shadow-md"
            isDisabled={!createdEnquiryId}
            onPress={() => {
              if (!createdEnquiryId) return;
              onClose?.();
              router.push(`/dashboard/enquiries/${createdEnquiryId}`);
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
                  <label className="text-xs font-semibold text-default-600">Buyer Associate</label>
                  <select
                    value={buyerAssociateId}
                    onChange={(e) => setBuyerAssociateId(e.target.value)}
                    className="w-full rounded-xl border border-default-300 bg-default-50 text-foreground h-9 px-3 text-sm outline-none focus:border-primary transition-colors"
                    required
                  >
                    <option value="">Select buyer</option>
                    {associateOptions.map((item: any) => {
                      const id = String(item?._id || "");
                      return (
                        <option key={id} value={id}>
                          {item?.name || item?.email || "Associate"}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-default-600">Full Name</label>
              <input
                className="w-full rounded-xl border border-default-300 bg-default-50 text-foreground h-9 px-3 text-sm outline-none focus:border-primary transition-colors"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!user}
                autoComplete="name"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-default-600">Phone Number</label>
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
              <label className="text-xs font-semibold text-default-600">Quantity (Ton)</label>
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
              <label className="text-xs font-semibold text-default-600">Preferred Incoterm</label>
              <select
                value={preferredIncotermId}
                onChange={(e) => setPreferredIncotermId(e.target.value)}
                disabled={incotermOptions.length === 0}
                className="w-full rounded-xl border border-default-200 bg-default-50 text-foreground h-9 px-3 text-sm outline-none focus:border-primary transition-colors disabled:opacity-60"
              >
                <option value="">Choose incoterm</option>
                {(Array.isArray(incotermOptions) ? incotermOptions : []).map((item: any) => {
                  const id = String(item?._id || "");
                  return (
                    <option key={id} value={id}>
                      {item?.code || "NA"} - {item?.name || "Incoterm"}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <label className="text-xs font-semibold text-default-600">Specification (Optional)</label>
            <textarea
              className="w-full rounded-xl border border-default-300 bg-default-50 text-foreground min-h-[90px] px-3 py-2 text-sm outline-none focus:border-primary transition-colors resize-y"
              value={specification}
              onChange={(e) => setSpecification(e.target.value)}
            />
          </div>
        </CardBody>
      </Card>

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-default-500">
          Tip: 1 Ton = 1,000 KG
        </span>
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

function mergeVariantAndDisplayedOnce(
  variantRates: any,
  displayedRates: any
) {
  // Extract arrays if they are wrapped in a pagination object
  const vrList = Array.isArray(variantRates) ? variantRates : (variantRates?.data || []);
  const drList = Array.isArray(displayedRates) ? displayedRates : (displayedRates?.data || []);

  // 1) Identify all variantRate IDs that have a corresponding personalized displayedRate
  const displayedVariantRateIds = new Set(
    drList.map((dr: any) => dr.variantRate?._id || dr.variantRate)
  );

  // 2) Filter the global variantRates to remove those that are already personalized
  const filteredVariantRates = vrList.filter(
    (vr: any) => !displayedVariantRateIds.has(vr._id)
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
  onSuccess
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Construct product name from row data
  const productName = rowItem.productVariant || "Product";

  return (
    <>
      <Tooltip content={rowItem.isAdded ? "Already in Catalog" : "Add to Catalog"}>
        <span
          onClick={!rowItem.isAdded ? onOpen : undefined}
          className={`text-lg cursor-pointer active:opacity-50 transition-colors ${rowItem.isAdded ? "text-success cursor-default" : "text-primary hover:text-primary-600"}`}
        >
          {rowItem.isAdded ? <FiCheckCircle size={22} /> : <FiPlusCircle size={22} />}
        </span>
      </Tooltip>

      {isOpen && (
        <AddToCatalogModal
          isOpen={isOpen}
          onClose={onClose}
          onSuccess={onSuccess}
          productVariantId={rowItem.productVariantId || rowItem.productVariant?._id}
          baseRateId={rowItem._id}
          basePrice={rowItem.rawBasePrice || rowItem.rate}
          productName={productName}
          isPersonalCatalogMode={isPersonalCatalogMode}
        />
      )}
    </>
  );
};
