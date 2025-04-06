"use client";

import React, { useContext, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Spacer } from "@heroui/react";
import {
  Button,
  Card,
  CardBody,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Slider,
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
import Image from "next/image";

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

  // If we only fetch associates if "rate" is "variantRate"
  const { data: associateResponse } = useQuery({
    queryKey: ["associate"],
    queryFn: () => getData(associateRoutes.getAll),
    enabled: rate === "variantRate" && user?.role === "Admin",
  });

  const associateValue = associateResponse?.data?.data?.data;

  // If we only fetch associates if "rate" is "variantRate"
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
        refetchData,
      ]}
      page={1}
      limit={100}
      additionalParams={{
        ...(additionalParams || {}),
        ...(displayOnly && { selected: "true" }),
        // ...(!user?.id && { isLive: "true" }),
        ...(productVariantValue && { productVariant: productVariantValue._id }),
      }}
    >
      {(variantRateData: any) => {
        // If we have associates, populate the "associate" field values for AddModal

        let variantRateFormFields = tableConfig[rate];
        if (associateValue) {
          const associateValues = associateValue.map((associate: any) => ({
            key: String(associate._id),
            value: associate.name,
          }));
          variantRateFormFields = variantRateFormFields.map((field: any) =>
            field.key === "associate"
              ? { ...field, values: associateValues }
              : field
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

        // Transform the rows if needed
        const tableData = variantRateFetchedData.map((item: any) => {
          const { isDeleted, isActive, password, __v, ...rest } = item;
          if (!item.variantRate?.rate) {
            return {
              ...rest,
              associate:
                item.associate._id === user?.id || user?.role === "Admin"
                  ? item.associate.name
                  : "OBAOL",
              associateId: item.associate._id,
              productVariant: item.productVariant.name,
              product: item.productVariant?.product?.name,
              productVariantId: item.productVariant._id,
            };
          } else {
            // displayedRate

            return {
              ...rest,
              rate: item.variantRate?.rate,
              // associateId: item.associate._id,
              productVariant: item.variantRate?.productVariant?.name,
              product: item.variantRate?.productVariant?.product?.name,
            };
          }
        });
        console.log("tableData");
        console.log(tableData);

        return (
          <>
            {!displayOnly && rate === "variantRate" && (
              <AddModal
                currentTable={rate}
                formFields={variantRateFormFields}
                apiEndpoint={apiRoutesByRole[rate]}
                refetchData={refetchData}
                additionalVariable={
                  productVariantValue && {
                    productVariant: productVariantValue?._id,
                  }
                }
              />
            )}
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
                      {rowItem.associateId !== user?.id ? (
                        <SelectModal
                          variantRate={rowItem}
                          refetchData={refetchData}
                        />
                      ) : (
                        rowItem.associateId === user?.id &&
                        user?.id !== undefined && (
                          <b className="text-warning-300">Your Rate</b>
                        )
                      )}
                      {/* LiveToggle if user is Admin or the same associate */}
                      {user?.role === "Admin" ||
                      (rowItem.associateId === user?.id &&
                        user?.id !== undefined) ? (
                        <LiveToggle
                          variantRate={rowItem}
                          refetchData={refetchData}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <Chip color="success" variant="dot">
                            Live
                          </Chip>
                          {/* CreateEnquiry if user is Admin or rowItem.associateId != user */}
                          <CreateEnquiryButton
                            productVariant={
                              rowItem.productVariantId ||
                              rowItem.variantRate.productVariant._id
                            }
                            variantRate={rowItem}
                          />
                        </div>
                      )}
                    </div>
                  );
                }}
              />
            </section>
            <section className="md:hidden block">
              {tableData.map((item: any, index: number) => (
                <Card
                  key={index}
                  isBlurred
                  className="border-none bg-background/60 my-2  dark:bg-default-100/50 max-w-full"
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
                            <div className="flex w-full gap-8 items-end justify-end">
                              {user?.role === "Admin" ||
                              (item.associateId === user?.id &&
                                user?.id !== undefined) ? (
                                <LiveToggle
                                  variantRate={item}
                                  refetchData={refetchData}
                                />
                              ) : (
                                <div className="flex flex-col items-center gap-2">
                                  {/* CreateEnquiry if user is Admin or item.associateId != user */}
                                  <CreateEnquiryButton
                                    productVariant={
                                      item.productVariantId ||
                                      item.variantRate.productVariant._id
                                    }
                                    variantRate={item}
                                  />
                                  <Chip color="success" variant="dot">
                                    Live
                                  </Chip>{" "}
                                </div>
                              )}{" "}
                              {/* LiveToggle if user is Admin or the same associate */}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col mt-3 gap-1">
                          {/* Commission / selection logic */}
                          {item.associateId !== user?.id ? (
                            <SelectModal
                              variantRate={item}
                              refetchData={refetchData}
                            />
                          ) : (
                            item.associateId === user?.id &&
                            user?.id !== undefined && (
                              <b className="text-warning-300">Your Rate</b>
                            )
                          )}
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
        isDismissable={false}
        isOpen={isOpen}
        className="max-w-full max-h-full"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Enquiry for {variantRate.product} {variantRate.productVariant}{" "}
              </ModalHeader>
              <ModalBody>
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
    <form
      onSubmit={handleSubmit}
      className="border p-2 rounded flex flex-col gap-2"
    >
      <div>
        <label className="block text-sm font-medium">Phone Number</label>
        <Input
          className="border px-2 py-1 w-full"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Name</label>
        <Input
          className="border px-2 py-1 w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Quantity in Tons</label>
        <Input
          className="border px-2 py-1 w-full"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>
      <Button
        type="submit"
        disabled={isLoading}
        className="bg-blue-600 text-white px-3 py-1 rounded"
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
