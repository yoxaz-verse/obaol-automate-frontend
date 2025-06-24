"use client";

import React, { useContext, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Spacer } from "@heroui/react";
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
  Switch,
  useDisclosure,
} from "@nextui-org/react";

import AddModal from "@/components/CurdTable/add-model";
import CommonTable from "@/components/CurdTable/common-table";
import QueryComponent from "@/components/queryComponent";
import SelectModal from "./select-modal"; // Commission logic
import AuthContext from "@/context/AuthContext";
import { getData, patchData, postData } from "@/core/api/apiHandler";
import { associateRoutes, variantRateRoutes } from "@/core/api/apiRoutes";
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
  rate: "variantRate" | "displayedRate";
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
    queryKey: ["variantRate"],
    queryFn: () =>
      getData(variantRateRoutes.getAll, {
        ...(additionalParams || {}),
        // ...(displayOnly && { selected: "true" }),
        ...(productVariantValue && { productVariant: productVariantValue._id }),
      }),
    enabled: VariantRateMixed === true,
  });

  // Build the columns from table config
  let columns = generateColumns(rate, tableConfig);

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
      ]}
      page={1}
      limit={1000}
      additionalParams={{
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
        };
        let variantRateFormFields = tableConfig[rate];
        if (user?.role === "Associate") {
          variantRateFormFields = variantRateFormFields.filter(
            (field: any) => field.key !== "associate"
          );
        }
        var variantRateFetchedData: any;
        if (variantResponse?.data.data.data) {
          variantRateFetchedData =
            mergeVariantAndDisplayedOnce(
              variantResponse?.data.data.data,
              variantRateData?.data
            ) || [];
        } else {
          variantRateFetchedData = variantRateData?.data || [];
        }

        // Inside your component, above the return:
        const FIFTEEN_MINUTES = 15 * 60 * 1000;
        const isCooling = (startTimestamp: string) =>
          new Date(startTimestamp).getTime() + FIFTEEN_MINUTES > Date.now();
        // Transform the rows if needed
        const tableData = variantRateFetchedData
          .filter((item: any) => item.associate?.name) // filters out items with no associate name
          .map((item: any) => {
            const { isDeleted, isActive, password, __v, ...rest } = item;

            if (!item.variantRate?.rate) {
              return {
                ...rest,
                associate:
                  item.associate?._id === user?.id || user?.role === "Admin"
                    ? item.associateCompany?.name
                    : "OBAOL",
                associateId: item.associate._id,
                companyId: item.associate.associateCompany,
                productVariant:
                  item.productVariant?.product?.name +
                  " " +
                  item.productVariant?.name,
                product: item.productVariant?.product?.name,
                productVariantId: item.productVariant?._id,
                rate: convertRate(item.rate),
              };
            } else {
              return {
                ...rest,
                rate: convertRate(item.variantRate?.rate),
                associateId: item.associate._id,
                companyId: item.associate.associateCompany,
                productVariant: item.variantRate?.productVariant?.name,
                product: item.variantRate?.productVariant?.product?.name,
              };
            }
          });

        return (
          <>
            <CurrencySelector />
            <Spacer y={5} />
            <section className="hidden md:block">
              <CommonTable
                TableData={tableData}
                columns={columns}
                isLoading={false}
                otherModal={(rowItem: any) => {
                  return (
                    <div className="flex w-full gap-8 items-end justify-end">
                      {/* Commission / selection logic */}

                      {(rowItem.variantRate &&
                        rowItem.associateId === user?.id) ||
                      (rowItem.associateId !== user?.id &&
                        rowItem.companyId !==
                          associateByIdValue?.associateCompany?._id) ? (
                        <SelectModal
                          variantRate={rowItem}
                          refetchData={refetchData}
                        />
                      ) : user?.id !== undefined ? (
                        <>
                          {rowItem.associateId === user.id ? (
                            <b className="text-warning-200">Own Rate</b>
                          ) : (
                            rowItem.companyId ===
                              associateByIdValue?.associateCompany?._id && (
                              <b className="text-warning-200">Company Rate</b>
                            )
                          )}
                        </>
                      ) : null}
                      {/* LiveToggle or Live Chip + Enquiry Button */}
                      {(!VariantRateMixed && user?.role === "Admin") ||
                      (!rowItem.variantRate &&
                        rowItem.associateId === user?.id &&
                        user?.id !== undefined) ? (
                        <>
                          {" "}
                          <LiveToggle
                            variantRate={rowItem}
                            refetchData={refetchData}
                          />
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Chip color="success" variant="dot">
                            Live
                          </Chip>
                          <CreateEnquiryButton
                            productVariant={
                              rowItem.productVariantId ||
                              rowItem.variantRate?.productVariant?._id
                            }
                            variantRate={rowItem}
                          />
                        </div>
                      )}
                    </div>
                  );
                }}
                editModal={(item: any) => {
                  if (!user) return null;

                  const isAdmin = user.role === "Admin";
                  const isCoolingTime = isCooling(item.coolingStartTime);
                  const isDifferentAssociate = item.associateId !== user.id;

                  if (isAdmin || (isDifferentAssociate && isCoolingTime)) {
                    return (
                      <div className="flex w-full h-[50px]  gap-8 items-end justify-end align-bottom">
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

                  return null;
                }}
                deleteModal={(item: any) => {
                  if (!user) return null;

                  const isAdmin = user.role === "Admin";
                  const isCoolingTime = isCooling(item.coolingStartTime);
                  const isDifferentAssociate = item.associateId !== user.id;

                  if (isAdmin || (isDifferentAssociate && isCoolingTime)) {
                    return (
                      <div className="flex w-full h-[50px]  gap-8 items-end justify-end align-bottom">
                        <DeleteModal
                          _id={item._id}
                          name={item.name}
                          deleteApiEndpoint={apiRoutesByRole[rate]}
                          refetchData={refetchData}
                          useBody={true}
                        />
                      </div>
                    );
                  }

                  return null;
                }}
              />
            </section>
            <section className="md:hidden block">
              {tableData.map((item: any, index: number) => (
                <Card
                  key={index}
                  isBlurred
                  className="border-none bg-background/60 hover:bg-background/95 my-2   max-w-full"
                  shadow="sm"
                >
                  <CardBody>
                    <div className="grid grid-cols-6 md:grid-cols-12 gap-6 md:gap-4 items-center justify-center">
                      {/* Album Cover (optional)
        <div className="relative col-span-6 md:col-span-4">
          <Image
            alt="Album cover"
            className="object-cover"
            height={200}
            src="https://heroui.com/images/album-cover.png"
          />
        </div>
        */}

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
                            {/* LiveToggle or Live indicator with Enquiry for non-Admin */}
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
                                <CreateEnquiryButton
                                  productVariant={
                                    item.productVariantId ||
                                    item.variantRate.productVariant._id
                                  }
                                  variantRate={item}
                                />
                                <Chip color="success" variant="dot">
                                  Live
                                </Chip>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Commission / selection logic */}
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
                                  <b className="text-warning-300">
                                    Company Rate
                                  </b>
                                )
                              )}
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </section>
          </>
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
}

const LiveToggle: React.FC<LiveToggleProps> = ({
  variantRate,
  refetchData,
}) => {
  const [isSelected, setIsSelected] = useState<boolean>(variantRate.isLive);
  const [loading, setLoading] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const apiEndpoint = apiRoutesByRole["variantRate"];

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
        className={`text-small m-0 p-0 ${
          isSelected ? "text-green-500" : "text-red-500"
        }`}
      >
        {isSelected ? "Live" : "Not Live"}
      </p>
      <Switch
        color="success"
        isSelected={isSelected}
        isDisabled={loading}
        onChange={handleToggle}
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
      <Modal
        placement={"center"}
        // isDismissable={false}
        isOpen={isOpen}
        className="max-w-[600px] max-h-full"
        onOpenChange={onOpenChange}
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
                <Spacer y={2} />
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
        <Spacer y={4} />
        {/* <label className="block text-sm font-medium"></label> */}
        <Input
          label={"Phone Number"}
          variant="bordered"
          type="number"
          // labelPlacement="outside"
          className=" px-2 py-1 w-full text-orange-400 "
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
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
          onChange={(e) => setName(e.target.value)}
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
          onChange={(e) => setQuantity(e.target.value)}
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
  variantRates: any[],
  displayedRates: any[]
) {
  // 1) Remove displayedRates whose variantRate._id is found in variantRates
  const variantRateIds = new Set(variantRates.map((vr) => vr._id));
  console.log(variantRateIds);

  const filteredDisplayedRates = displayedRates.filter(
    (dr) => !variantRateIds.has(dr.variantRate?._id)
  );
  console.log(filteredDisplayedRates);

  console.log([...variantRates, ...filteredDisplayedRates]);

  // 2) Combine remaining displayedRates with variantRates
  return [...variantRates, ...filteredDisplayedRates];
}
