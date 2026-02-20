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
} from "@heroui/react";

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

        // DEBUGGING: Log Marketplace raw data
        if (isMarketplace) {
          console.log("=== MARKETPLACE DEBUG START ===");
          console.log("[1] Raw variantRateData:", variantRateData);
          console.log("[2] Is Array?:", Array.isArray(variantRateData));
          console.log("[3] Array length:", Array.isArray(variantRateData) ? variantRateData.length : 'N/A');
        }

        // For Marketplace, use ONLY raw VariantRate data (no merge with DisplayedRate)
        // Note: QueryComponent already extracts data from the paginated response
        if (isMarketplace || rate === "catalogItem") {
          variantRateFetchedData = Array.isArray(variantRateData) ? variantRateData : [];
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
          variantRateFetchedData = Array.isArray(variantRateData) ? variantRateData : [];
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
            (item.associate?.name || item.associateId || item.associateCompanyId)
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
                isLive: item.isLive,
                associate: item.associateCompanyId?.name || "My Company",
                rate: convertRate(finalPrice),
                associateId: item.associateId?._id || item.associateId,
                originalOwnerId: baseRate?.associate?._id || baseRate?.associate,
                companyId: item.associateCompanyId?._id || item.associateCompanyId,
                productVariant: item.productVariantId?.name,
                product: item.productVariantId?.product?.name,
                rawBasePrice: (supplierRate + adminCommission),
                rawCommission: mediatorMarkup,
                customTitle: item.customTitle,
                variantRate: item.baseRateId,
                isCatalogView: true,
                isAdded: true
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
                rawBasePrice: basePriceForUser,
                rawCommission: associateMargin,
                productVariantId: item.variantRate?.productVariant?._id,
                variantRateId: item.variantRate?._id,
              };
            }
          });

        return (
          <>
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
            <section className="hidden md:block">
              <CommonTable
                TableData={tableData}
                columns={columns}
                isLoading={false}
                otherModal={(rowItem: any) => {
                  if (rowItem.isMarketplaceView) {
                    return (
                      <div className="flex w-full gap-8 items-end justify-end">
                        <AddToCatalogButton
                          rowItem={rowItem}
                          onSuccess={() => refetchData()}
                        />
                      </div>
                    );
                  }
                  return (
                    <div className="flex w-full gap-2 items-center justify-end">
                      {/* LiveToggle or Live Chip */}
                      {(user?.role === "Admin" || rowItem.isOwnerView) ? (
                        <LiveToggle
                          variantRate={rowItem}
                          refetchData={refetchData}
                          apiEndpoint={apiRoutesByRole[rate]}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          {rowItem.isLive ? (
                            <>
                              {/* @ts-ignore */}
                              <Chip color={"success"} variant="dot">
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
                            </>
                          ) : (
                            <span className="text-default-400 text-tiny italic">
                              {rowItem.isCatalogView ? "Hidden" : "Not Live"}
                            </span>
                          )}
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
                        <div className="flex w-full h-[50px] gap-8 items-end justify-end align-bottom">
                          <EditModal
                            _id={item._id}
                            initialData={item}
                            currentTable={rate}
                            formFields={tableConfig[rate]}
                            apiEndpoint={`${apiRoutesByRole[rate]}`}
                            refetchData={refetchData}
                          />
                        </div>
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
                      <div className="flex w-full h-[50px] gap-8 items-end justify-end align-bottom">
                        <DeleteModal
                          _id={item._id}
                          name={item.name || item.customTitle || item.productVariant}
                          deleteApiEndpoint={apiRoutesByRole[rate]}
                          refetchData={refetchData}
                          triggerText={isCatalog ? "Remove from Catalog" : "Delete"}
                          triggerColor="danger"
                          useBody={true}
                        />
                      </div>
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
                              <h3 className="font-semibold text-foreground/90">
                                {item.product || "Product"}
                              </h3>
                              <p className="text-small text-foreground/80">
                                {item.productVariant || "Product Variant"}
                              </p>
                              <h1 className="text-large font-medium mt-2">
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
                                />
                              ) : (
                                <div className="flex flex-col items-center gap-2">
                                  {new Date(item.updatedAt).toDateString() === new Date().toDateString() ? (
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
                                    <span className="text-default-400 text-tiny italic">Not Live</span>
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
                                {item.associateId === user.id ? (
                                  <b className="text-warning-300">Your Rate</b>
                                ) : (
                                  item.companyId ===
                                  associateByIdValue.associateCompany._id && (
                                    <div key={index} className="flex-1 min-w-[300px]">
                                      {/* @ts-ignore */}
                                      <Card
                                        className="p-4"
                                        /* @ts-ignore */
                                        shadow={"sm" as any}
                                      >
                                      </Card>
                                    </div>
                                  )
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
          </>
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
    <div className="flex flex-col items-start gap-2">
      <p
        className={`text-small m-0 p-0 ${isSelected ? "text-green-500" : "text-red-500"
          }`}
      >
        {isSelected ? "Live" : "Not Live"}
      </p>
      {/* @ts-ignore */}
      <Switch
        {...({
          color: "success",
          isSelected: isSelected,
          isDisabled: loading,
          onChange: handleToggle,
        } as any)}
      />
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
      <Button onPress={onOpen} color="success" variant="flat">
        Enquiry
      </Button>
      {/* @ts-ignore */}
      <Modal
        {...({
          placement: "center",
          isOpen: isOpen,
          className: "dark text-foreground mx-4",
          onOpenChange: onOpenChange,
        } as any)}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Enquiry for {variantRate.product}{" "}
              </ModalHeader>
              <ModalBody>
                Variant: {variantRate.productVariant}
                <AddEnquiryForm
                  productVariant={productVariant}
                  variantRate={variantRate}
                  onClose={onClose}
                />{" "}
              </ModalBody>
              <ModalFooter>
                {/* <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button> */}
                {/* <Button color="primary" onPress={onClose}>
                  Action
                </Button> */}
                <div className="h-2" />
                <p>Enquiry will be responded with 10 mins</p>
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

  const { user } = useContext(AuthContext);
  console.log(variantRate);

  const createEnquiryMutation = useMutation({
    mutationFn: async () => {
      var payload: any;
      if (variantRate.variantRate) {
        // Adjust to your actual enquiry endpoint
        payload = {
          phoneNumber,
          name,
          quantity,
          variantRate: variantRate.variantRate._id,
          displayedRate: variantRate._id,
          mediatorAssociate: variantRate.variantRate.associate._id,
          productAssociate: user?.id,
          productVariant: productVariant,
        };
      } else {
        {
          // Adjust to your actual enquiry endpoint
          payload = {
            phoneNumber,
            name,
            quantity,
            variantRate: variantRate._id,

            productAssociate: user?.id,
            productVariant: productVariant,
          };
        }
      }
      return postData("/enquiry", payload);
    },
    onMutate: () => {
      setIsLoading(true);
    },
    onSuccess: () => {
      alert("Enquiry created!");
      setIsLoading(false);
      setPhoneNumber("");
      setName("");
      setQuantity("");
      // optionally refetch or do something
      queryClient.invalidateQueries();
      onClose();
    },
    onError: () => {
      alert("Failed to create enquiry");
      setIsLoading(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEnquiryMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="   flex flex-col gap-2">
      <div>
        <Divider className="bg-orange-400" />
        {/* @ts-ignore */}
        <Spacer y={4} />
        {/* <label className="block text-sm font-medium"></label> */}
        <Input
          label={"Phone Number"}
          variant="bordered"
          type="number"
          // labelPlacement="outside"
          className=" px-2 py-1 w-full text-orange-400 "
          value={phoneNumber}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)}
          required
        />
      </div>
      <div>
        <Input
          label={"Name"}
          // labelPlacement="outside"
          variant="bordered"
          className=" px-2 py-1 w-full text-orange-400 "
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <Input
          label="Quantity in Tons"
          variant="bordered"
          // labelPlacement="outside"
          className=" px-2 py-1 w-full text-orange-400 "
          value={quantity}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(e.target.value)}
        />
      </div>
      <Button
        type="submit"
        disabled={isLoading}
        className="bg-warning-400 text-white px-3 py-1 "
      >
        {isLoading ? "Creating..." : "Create Enquiry"}
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
      <Button
        size="sm"
        color={rowItem.isAdded ? "success" : "primary"}
        variant="flat"
        onPress={onOpen}
        isDisabled={rowItem.isAdded}
        startContent={<span className="text-lg">{rowItem.isAdded ? "✓" : "+"}</span>}
      >
        {rowItem.isAdded ? "Added" : "Add to Catalog"}
      </Button>

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
