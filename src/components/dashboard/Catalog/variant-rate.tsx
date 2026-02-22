"use client";

import React, { useContext, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  CardBody,
  Chip,
  Divider,
  Input,
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
} from "@heroui/react";
import { FiMessageSquare, FiPlusCircle, FiCheckCircle, FiPhone, FiUser, FiPackage, FiInfo } from "react-icons/fi";
import { motion } from "framer-motion";

import AddModal from "@/components/CurdTable/add-model";
import CommonTable from "@/components/CurdTable/common-table";
import QueryComponent from "@/components/queryComponent";
import SelectModal from "./select-modal"; // Commission logic
import AddToCatalogModal from "./AddToCatalogModal";
import AuthContext from "@/context/AuthContext";
import { getData, patchData, postData } from "@/core/api/apiHandler";
import { associateRoutes, variantRateRoutes, apiRoutes, displayedRateRoutes, catalogItemRoutes } from "@/core/api/apiRoutes";
import {
  apiRoutesByRole,
  generateColumns,
  initialTableConfig,
} from "@/utils/tableValues";
import EditModal from "@/components/CurdTable/edit-model";
import DeleteModal from "@/components/CurdTable/delete";
import DynamicFilter from "@/components/CurdTable/dynamic-filtering";
import { useCurrency } from "@/context/CurrencyContext";
import CurrencySelector from "./currency-selector";

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
}) => {
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
  const filterVariantRateFormFields = Array.from(fieldMap.values());

  const { convertRate } = useCurrency();

  // If we only fetch associates if "rate" is "variantRate"
  const { data: associateByIdResponse } = useQuery({
    queryKey: ["associate", user?.id],
    queryFn: () => getData(`${associateRoutes.getAll}/${user?.id}`),
    enabled: user?.role === "Associate",
  });

  const associateByIdValue = associateByIdResponse?.data;
  const [filters, setFilters] = useState<Record<string, any>>({}); // Dynamic filters
  const handleFiltersUpdate = (updatedFilters: Record<string, any>) => {
    setFilters(updatedFilters); // Update the filters
  };

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

  // Build the columns from table config
  const currentTable = rate;

  let columns = generateColumns(
    currentTable,
    tableConfig,
    user?.role
  );

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
        filters,
        addedRateIds.size, // Refresh when catalog items change
      ]}
      page={1}
      limit={1000}
      additionalParams={{
        ...(filters || {}),
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
        if (user?.role === "Associate") {
          // Hide both associate and commission for associates
          variantRateFormFields = variantRateFormFields.filter(
            (field: any) => field.key !== "associate" && field.key !== "commission"
          );
        }

        var variantRateFetchedData: any;
        const isMarketplace = additionalParams?.view === "marketplace";

        // Helper: extract array from either a raw array OR a paginated wrapper
        // QueryComponent returns data?.data?.data which is { data: [...], totalCount: N, ... }
        // when the backend uses the generic CRUD engine with pagination.
        const extractArray = (raw: any): any[] => {
          if (Array.isArray(raw)) return raw;
          if (raw?.data && Array.isArray(raw.data)) return raw.data;
          return [];
        };

        // DEBUGGING: Log Marketplace raw data
        if (isMarketplace) {
          console.log("=== MARKETPLACE DEBUG START ===");
          console.log("[1] Raw variantRateData:", variantRateData);
          console.log("[2] Is Array?:", Array.isArray(variantRateData));
          console.log("[3] Has .data array?:", variantRateData?.data && Array.isArray(variantRateData?.data));
        }

        // For Marketplace, use ONLY raw VariantRate data (no merge with DisplayedRate)
        if (isMarketplace || rate === "catalogItem") {
          variantRateFetchedData = extractArray(variantRateData);
          if (isMarketplace) {
            console.log("[4] variantRateFetchedData after extraction:", variantRateFetchedData);
            console.log("[5] variantRateFetchedData length:", variantRateFetchedData.length);
          }
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
          .filter((item: any) =>
            // 1) CatalogItem / DisplayedRate: assume current user owns it, show it.
            // 2) VariantRate (Marketplace): must have valid associate/company to show.
            (rate !== "variantRate") ||
            (item.associate || item.associateCompany || item.associateId || item.associateCompanyId)
          )
          .map((item: any) => {
            const { isDeleted, isActive, password, __v, ...rest } = item;

            if (rate === "variantRate") {
              // Row is a VariantRate (My Products OR Marketplace)
              const isMarketplace = additionalParams?.view === "marketplace";
              const isOwner = item.associate?._id === user?.id || item.associate === user?.id;

              const supplierRate = item.rate || 0;
              const adminCommission = item.commission || 0;
              const totalRate = supplierRate + adminCommission;

              // Rule: Owners see base rate only. Non-owners see final price (base + admin commission).
              const displayedPrice = (isOwner && !isMarketplace)
                ? supplierRate
                : totalRate;

              return {
                ...rest,
                isLive: item.isLive,
                associate:
                  isOwner
                    ? (item.associateCompany?.name || "My Company")
                    : (item.associateCompany?.name || "OBAOL"),
                associateId: item.associate?._id || item.associate,
                companyId: item.associateCompany?._id || item.associateCompany || item.associate?.associateCompany,
                productVariant:
                  (item.productVariant?.product?.name || "") +
                  " " +
                  (item.productVariant?.name || ""),
                product: item.productVariant?.product?.name,
                productId: item.productVariant?.product?._id || item.productVariant?.product,
                productVariantId: item.productVariant?._id,

                // Column Mapping
                rate: user?.role === "Admin" ? convertRate(supplierRate) : convertRate(displayedPrice),
                commission: adminCommission ? convertRate(adminCommission) : 0,
                finalRate: convertRate(totalRate),

                rawBasePrice: totalRate,
                rawCommission: 0,
                isMarketplaceView: isMarketplace,
                isOwnerView: isOwner && !isMarketplace,
                isAdded: addedRateIds.has(item._id)
              };
            } else if (rate === "catalogItem") {
              // Row is a CatalogItem (Added to Catalog)
              const baseRate = item.baseRateId;
              const supplierRate = baseRate?.rate || 0;
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
                isOwnerView: true
              };
            } else {
              // Row is a DisplayedRate (Personalized - fallback/old)
              const supplierRate = item.variantRate?.rate || 0;
              const adminCommission = item.variantRate?.commission || 0;
              const basePriceForUser = supplierRate + adminCommission;

              const associateMargin = item.commission || 0;
              const totalRate = basePriceForUser + associateMargin;
              return {
                ...rest,
                isLive: item.isLive,
                associate: item.associateCompany?.name || "My Company",
                rate: convertRate(totalRate),
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

        return (
          <div className="w-full max-w-full min-w-0 overflow-x-auto">
            <div className="flex justify-between">
              <CurrencySelector />
              {!displayOnly && rate === "variantRate" ? (
                <>
                  <div>
                    <DynamicFilter
                      currentTable={"variantRate"}
                      formFields={filterVariantRateFormFields}
                      onApply={handleFiltersUpdate} // Pass the callback to DynamicFilter
                    />{" "}
                    <div className="h-2" />
                    <AddModal
                      name="Rate"
                      currentTable={rate}
                      formFields={variantRateFormFields}
                      apiEndpoint={apiRoutesByRole[rate]}
                      refetchData={refetchData}
                      additionalVariable={{
                        ...(productVariantValue && {
                          productVariant: productVariantValue._id,
                        }),
                        ...(user?.role === "Associate" && {
                          associate: user?.id,
                        }),
                      }}
                    />
                  </div>
                </>
              ) : (
                "Add Associates for Variant rates"
              )}
            </div>{" "}
            <div className="h-5" />
            <section className="hidden md:block overflow-x-auto w-full max-w-full">
              <CommonTable
                TableData={tableData}
                columns={columns}
                isLoading={false}
                otherModal={(rowItem: any) => {
                  if (rowItem.isMarketplaceView) {
                    return (
                      <div className="flex items-center gap-2">
                        <AddToCatalogButton
                          rowItem={rowItem}
                          onSuccess={() => refetchData()}
                        />
                        {user?.role === "Associate" && (
                          <CreateEnquiryButton
                            productVariant={rowItem.productVariantId}
                            variantRate={rowItem}
                          />
                        )}
                      </div>
                    );
                  }
                  return (
                    <div className="flex items-center justify-end">
                      {/* LiveToggle or Live Chip */}
                      {(user?.role === "Admin" || (rowItem.isOwnerView && !rowItem.isCatalogView)) ? (
                        <div className="flex flex-col items-center gap-1">
                          <LiveToggle
                            variantRate={rowItem}
                            refetchData={refetchData}
                            apiEndpoint={rate === "catalogItem" ? apiRoutes.catalog.update : apiRoutesByRole[rate]}
                          />
                          {rowItem.isCatalogView && !rowItem.supplierIsLive && (
                            <Tooltip content="Supplier rate is currently not live. This item will not be visible to customers.">
                              {/* @ts-ignore */}
                              <Chip size="sm" color="danger" variant="flat" className="h-5 text-[10px]">Supplier Offline</Chip>
                            </Tooltip>
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
                            </div>
                          ) : (
                            <span className="text-default-400 text-tiny italic whitespace-nowrap h-[20px] flex items-center">
                              Not Live
                            </span>
                          )}
                          <div className="h-[10px]" /> {/* Spacer to align with Edit/Delete/LiveToggle layout */}
                        </div>
                      )}
                    </div>
                  );
                }}
                editModal={(item: any) => {
                  if (!user) return null;
                  const isAdmin = user.role === "Admin";
                  const isOwner = item.isOwnerView;

                  if (isAdmin || isOwner) {
                    const isCoolingTime = isCooling(item.coolingStartTime);
                    const isDifferentAssociate = item.associateId !== user.id;

                    if (isAdmin || (isDifferentAssociate && isCoolingTime)) {
                      return (
                        <EditModal
                          _id={item._id}
                          initialData={item}
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
                  const isAdmin = user.role === "Admin";
                  const isOwner = item.isOwnerView;
                  const isCatalog = item.isCatalogView;

                  if (isAdmin || isOwner || isCatalog) {
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
            </section >
            <section className="md:hidden block">
              {tableData.map((item: any, index: number) => {
                return (
                  // @ts-ignore
                  <Card
                    key={index}
                    {...({
                      className:
                        "border-none bg-background/60 hover:bg-background/95 my-2 max-w-full",
                      shadow: "sm",
                    } as any)}
                  >
                    <CardBody>
                      <div className="grid grid-cols-6 md:grid-cols-12 gap-6 md:gap-4 items-center justify-center">
                        <div className="flex flex-col col-span-6 md:col-span-8">
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-0">
                              <h3 className="font-semibold text-foreground/90 truncate">
                                {item.product || "Product"}
                              </h3>
                              <p className="text-small text-foreground/80 truncate">
                                {item.productVariant || "Product Variant"}
                              </p>
                              <h1 className="text-large font-medium mt-2 truncate">
                                {item.rate || "Price"}
                              </h1>
                            </div>

                            <div className="flex items-center gap-2">
                              {user?.role === "Admin" ||
                                (!item.variantRate &&
                                  item.associateId === user?.id &&
                                  user?.id !== undefined) ? (
                                <LiveToggle
                                  variantRate={item}
                                  refetchData={refetchData}
                                  apiEndpoint={apiRoutesByRole[rate]}
                                />
                              ) : (
                                <div className="flex flex-col items-center gap-2">
                                  {item.isLive ? (
                                    <>
                                      <CreateEnquiryButton
                                        productVariant={
                                          item.productVariantId ||
                                          item.variantRate?.productVariant?._id
                                        }
                                        variantRate={item}
                                      />
                                      {/* @ts-ignore */}
                                      <Chip color={"success"} variant="dot">
                                        Live
                                      </Chip>
                                    </>
                                  ) : (
                                    <span className="text-default-400 text-tiny italic">
                                      Not Live
                                    </span>
                                  )}
                                </div>
                              )}
                              {item.isAdded && !item.supplierIsLive && (
                                <Tooltip content="Supplier rate is currently not live. This item will not be visible to customers.">
                                  {/* @ts-ignore */}
                                  <Chip size="sm" color="danger" variant="flat" className="h-5 text-[10px]">Supplier Offline</Chip>
                                </Tooltip>
                              )}
                            </div>
                            {/* Mobile Actions (Edit/Delete) */}
                            <div className="flex items-center gap-4">
                              {user?.role === "Admin" || item.isOwnerView ? (
                                <div className="flex items-center gap-3">
                                  <EditModal
                                    _id={item._id}
                                    initialData={item}
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
                                </div>
                              ) : item.isMarketplaceView && (
                                <div className="flex items-center gap-2">
                                  <AddToCatalogButton
                                    rowItem={item}
                                    onSuccess={() => refetchData()}
                                  />
                                  {user?.role === "Associate" && (
                                    <CreateEnquiryButton
                                      productVariant={item.productVariantId}
                                      variantRate={item}
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col mt-3 gap-1">
                            {(item.variantRate &&
                              item.associateId === user?.id) ||
                              (item.associateId !== user?.id &&
                                item.companyId !==
                                associateByIdValue?.associateCompany?._id) ? (
                              <SelectModal
                                variantRate={item}
                                refetchData={refetchData}
                              />
                            ) : user?.id !== undefined ? (
                              <>
                                {item.companyId ===
                                  associateByIdValue?.associateCompany?._id && (
                                    <div key={index} className="flex-1 min-w-[300px]" />
                                  )}
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </section>
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
          className="text-xl text-primary cursor-pointer active:opacity-50 hover:text-primary-600 transition-all duration-200 transform hover:scale-110"
        >
          <FiMessageSquare />
        </span>
      </Tooltip>
      {/* @ts-ignore */}
      <Modal
        {...({
          placement: "center",
          isOpen: isOpen,
          className: "dark text-foreground mx-4",
          onOpenChange: onOpenChange,
          size: "lg",
          backdrop: "blur",
        } as any)}
      >
        <ModalContent className="bg-gradient-to-br from-background to-content1 border border-divider/50">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b border-divider/10 pb-6 px-8">
                <div className="flex items-center gap-4 pt-2">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary-500 shadow-sm shadow-primary/10">
                    <FiMessageSquare size={26} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight text-foreground">New Enquiry</h3>
                    <p className="text-xs text-default-400 font-bold uppercase tracking-widest mt-0.5">Direct Manufacturer Protocol</p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="py-6">
                <div className="mb-8 p-5 bg-default-100/50 rounded-3xl border border-divider/30 flex justify-between items-center shadow-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-default-400 uppercase tracking-widest">Target Product</span>
                    <span className="text-sm font-bold text-foreground">{variantRate.product}</span>
                  </div>
                  <div className="px-4 py-2 bg-primary/10 text-primary-600 rounded-2xl text-xs font-black border border-primary/20 shadow-inner">
                    {variantRate.productVariant || "Standard"}
                  </div>
                </div>
                <AddEnquiryForm
                  productVariant={productVariant}
                  variantRate={variantRate}
                  onClose={onClose}
                />
              </ModalBody>
              <ModalFooter className="flex flex-col gap-2 border-t border-divider/30 pt-4">
                <div className="flex items-center gap-2 text-primary-500 bg-primary-500/10 px-4 py-2 rounded-2xl w-full">
                  <FiInfo size={16} />
                  <p className="text-sm font-medium">Our team will respond within 10 minutes</p>
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
  const queryClient = useQueryClient();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { user } = useContext(AuthContext);

  // Robust Associate ID Fetching
  const { data: associateDetail } = useQuery({
    queryKey: ["associate-me", user?.id],
    queryFn: () => getData(`${apiRoutesByRole["associate"]}/${user?.id}`),
    enabled: !!user?.id,
  });

  const activeAssociateId = associateDetail?.data?._id || user?.id;

  // Auto-fill user details when available
  useEffect(() => {
    if (associateDetail?.data) {
      if (!name) setName(associateDetail.data.name || "");
      if (!phoneNumber) setPhoneNumber(associateDetail.data.phone || associateDetail.data.phoneNumber || "");
    }
  }, [associateDetail?.data]);

  const createEnquiryMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        productId: variantRate.productId || variantRate.product?._id || variantRate.product,
        quantity: Number(quantity) || 1,
        specifications: `Phone: ${phoneNumber}\nName: ${name}\nVariant: ${variantRate.productVariant || "Standard"}`,
        buyerAssociateId: activeAssociateId || undefined,
        sellerAssociateId: variantRate.associateId || variantRate.associate?._id || variantRate.associate,
        mediatorAssociateId: variantRate.mediatorAssociateId || null,
        rate: variantRate.rawBasePrice || (typeof variantRate.rate === 'number' ? variantRate.rate : 0),
        adminCommission: variantRate.rawCommission || (typeof variantRate.adminCommission === 'number' ? variantRate.adminCommission : 0),
        mediatorCommission: variantRate.mediatorCommission || 0,
        notes: `Enquiry from Marketplace for ${variantRate.product} - ${variantRate.productVariant}`
      };

      console.log("Submitting Enquiry Payload:", payload);

      return postData(`${apiRoutesByRole["enquiry"]}`, payload);
    },
    onMutate: () => {
      setIsLoading(true);
    },
    onSuccess: () => {
      setIsLoading(false);
      setIsSuccess(true);
      queryClient.invalidateQueries();
    },
    onError: (error: any) => {
      console.error("Enquiry submission failed:", error);
      console.error("Error Response:", error?.response?.data);
      alert(error?.response?.data?.message || error?.message || "Something went wrong. Please try again.");
      setIsLoading(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEnquiryMutation.mutate();
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-10 gap-6 text-center"
      >
        <div className="w-24 h-24 bg-success-500/10 rounded-full flex items-center justify-center text-success-500 shadow-lg shadow-success-500/20">
          <FiCheckCircle size={50} />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-foreground">Request Sent!</h3>
          <p className="text-default-500 max-w-[280px]">Your enquiry for {variantRate.product} has been successfully submitted.</p>
        </div>
        <Button
          color="success"
          variant="flat"
          size="lg"
          className="rounded-2xl font-bold mt-4"
          onPress={onClose}
        >
          Got it, Thanks!
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-3 bg-content2/10 p-4 rounded-3xl border border-divider/30">
        <div className="bg-success-500/10 text-success-600 px-4 py-1.5 rounded-full border border-success-500/20 flex items-center gap-2">
          <FiPackage className="text-lg" />
          <span className="text-sm font-bold uppercase tracking-wider">Truck Load Supplier</span>
        </div>
        <p className="text-default-500 text-xs italic">Our suppliers primarily handle FTL (Full Truck Load) orders for efficiency.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 px-2">
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-black text-default-400 uppercase tracking-widest pl-1">Your Name</label>
          <Input
            variant="bordered"
            labelPlacement="outside"
            placeholder="Enter full name"
            startContent={<FiUser className="text-primary-500 mr-1" />}
            className="w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            classNames={{
              input: "font-bold",
              inputWrapper: "h-14 rounded-2xl border-2 group-data-[focus=true]:border-primary"
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-black text-default-400 uppercase tracking-widest pl-1">Contact Number</label>
          <Input
            variant="bordered"
            labelPlacement="outside"
            placeholder="9876543210"
            type="tel"
            startContent={<FiPhone className="text-primary-500 mr-1" />}
            className="w-full"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            classNames={{
              input: "font-bold",
              inputWrapper: "h-14 rounded-2xl border-2 group-data-[focus=true]:border-primary"
            }}
          />
        </div>
      </div>

      <div className="w-full px-2">
        <div className="flex flex-col gap-2 bg-content2/10 p-6 rounded-[2.5rem] border border-divider/30 shadow-inner">
          <label className="text-[11px] font-black text-primary-500 uppercase tracking-widest pl-2 mb-1">Quantity Required (Tons)</label>
          <Input
            placeholder="e.g. 30"
            variant="bordered"
            labelPlacement="outside"
            type="number"
            startContent={<FiPackage className="text-primary-500 mr-2" size={22} />}
            className="w-full"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            classNames={{
              input: "text-xl font-black",
              inputWrapper: "h-20 rounded-3xl border-2 group-data-[focus=true]:border-primary bg-background/50 backdrop-blur-sm"
            }}
          />
          <p className="text-[10px] text-default-400 font-bold uppercase tracking-tight pl-2 mt-2">
            Tip: Most suppliers prefer FTL (Full Truck Load) orders of 20+ tons.
          </p>
        </div>
      </div>

      <Button
        type="submit"
        isLoading={isLoading}
        size="lg"
        color="primary"
        className="font-bold text-white shadow-2xl shadow-primary/30 h-16 rounded-[2rem] text-lg active:scale-95 transition-transform"
        startContent={!isLoading && <FiMessageSquare size={22} />}
      >
        {isLoading ? "Submitting Request..." : "Send Request to Manufacturer"}
      </Button>
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
  onSuccess?: () => void;
}

const AddToCatalogButton: React.FC<AddToCatalogButtonProps> = ({ rowItem, onSuccess }) => {
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
          productVariantId={rowItem.productVariantId || rowItem.productVariant?._id}
          baseRateId={rowItem._id}
          basePrice={rowItem.rawBasePrice || rowItem.rate}
          productName={productName}
        />
      )}
    </>
  );
};
