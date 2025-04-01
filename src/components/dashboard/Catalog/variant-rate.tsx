"use client";

import React, { useContext, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Spacer } from "@heroui/react";
import {
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
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
                      user?.id !== undefined && <p>Your Rate</p>
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
    <div className="flex flex-col items-center gap-2">
      <Button onPress={onOpen} color="success" variant="flat">
        Enquiry
      </Button>
      <Modal isDismissable={false} isOpen={isOpen} onOpenChange={onOpenChange}>
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
/* ============================
   Example Usage:
   ============================
Assume you have two arrays: one for variantRates and one for displayedRates.
Below are sample objects similar to your provided data.
*/

[
  {
    _id: "67d7f6f13a643f0618596258",
    rate: 23450,
    selected: true,
    productVariant: {
      _id: "67d7f0903a643f06185961e1",
      name: "Cardamom 8mm",
      description: "A Quality",
      isAvailable: true,
      isLive: true,
      product: "67d7f0433a643f06185961da",
      createdAt: "2025-03-17T09:51:12.176Z",
      __v: 0,
    },
    associate: {
      _id: "67d7ef493a643f061859617e",
      name: "Athi K Ani",
      email: "athi@obaol.com",
      phone: "2313132231",
      phoneSecondary: "7306096942",
      associateCompany: "67d7ef183a643f0618596150",
      password: "$2a$10$z2KIfq/x681L3/nXyDuw7uxY0mpkMYTx6yYNdMfRHufXKuNh757Z6",
      role: "Associate",
      createdAt: "2025-03-17T09:45:45.769Z",
      updatedAt: "2025-03-17T09:45:45.769Z",
      __v: 0,
    },
    isLive: true,
    createdAt: "2025-03-17T10:18:25.696Z",
    __v: 0,
  },
  {
    _id: "67d7f7963a643f0618596309",
    rate: 2121,
    selected: true,
    productVariant: {
      _id: "67d7f0903a643f06185961e1",
      name: "Cardamom 8mm",
      description: "A Quality",
      isAvailable: true,
      isLive: true,
      product: "67d7f0433a643f06185961da",
      createdAt: "2025-03-17T09:51:12.176Z",
      __v: 0,
    },
    associate: {
      _id: "67d7f77f3a643f06185962e1",
      name: "patricia",
      email: "patricia@obaol.com",
      phone: "2313132231",
      phoneSecondary: "2313132231",
      associateCompany: "67d7ef183a643f0618596150",
      password: "$2a$10$6V5L59kKEozJwKI84fMxH.Aw1nuWU3dmVxlN2ZW2Kr3FJDU8xi8Ey",
      role: "Associate",
      createdAt: "2025-03-17T10:20:47.214Z",
      updatedAt: "2025-03-17T10:20:47.214Z",
      __v: 0,
    },
    isLive: true,
    createdAt: "2025-03-17T10:21:10.123Z",
    __v: 0,
  },
  {
    _id: "67d7f7a23a643f0618596313",
    rate: 2321,
    selected: false,
    productVariant: {
      _id: "67d7f0903a643f06185961e1",
      name: "Cardamom 8mm",
      description: "A Quality",
      isAvailable: true,
      isLive: true,
      product: "67d7f0433a643f06185961da",
      createdAt: "2025-03-17T09:51:12.176Z",
      __v: 0,
    },
    associate: {
      _id: "67d7f77f3a643f06185962e1",
      name: "patricia",
      email: "patricia@obaol.com",
      phone: "2313132231",
      phoneSecondary: "2313132231",
      associateCompany: "67d7ef183a643f0618596150",
      password: "$2a$10$6V5L59kKEozJwKI84fMxH.Aw1nuWU3dmVxlN2ZW2Kr3FJDU8xi8Ey",
      role: "Associate",
      createdAt: "2025-03-17T10:20:47.214Z",
      updatedAt: "2025-03-17T10:20:47.214Z",
      __v: 0,
    },
    isLive: false,
    createdAt: "2025-03-17T10:21:22.798Z",
    __v: 0,
  },
  {
    _id: "67e7e9b46636fac1fae8437c",
    variantRate: {
      _id: "67e7a8f7bfe8f3d044efdbaf",
      rate: 2750,
      selected: true,
      productVariant: {
        _id: "67e7a8c0bfe8f3d044efdb6c",
        name: "7mm",
        product: { _id: "67d7f0433a643f06185961da", name: "Cardamom" },
      },
      associate: "67e7a86abfe8f3d044efdb20",
      isLive: true,
      createdAt: "2025-03-29T08:01:59.242Z",
      __v: 0,
      commission: 50,
    },
    commission: 43,
    selected: true,
    associate: {
      _id: "67d7ef493a643f061859617e",
      name: "Athi K Ani",
      email: "athi@obaol.com",
      phone: "2313132231",
      phoneSecondary: "7306096942",
      associateCompany: "67d7ef183a643f0618596150",
      password: "$2a$10$z2KIfq/x681L3/nXyDuw7uxY0mpkMYTx6yYNdMfRHufXKuNh757Z6",
      role: "Associate",
      createdAt: "2025-03-17T09:45:45.769Z",
      updatedAt: "2025-03-17T09:45:45.769Z",
      __v: 0,
    },
    associateCompany: {
      _id: "67d7ef183a643f0618596150",
      name: "OBAOL",
      email: "exports@obaol.com",
      phone: "7306096942",
      location: "67d7eed43a643f061859612b",
      phoneSecondary: "2313132231",
      createdAt: "2025-03-17T09:44:56.002Z",
      updatedAt: "2025-03-17T09:44:56.002Z",
      __v: 0,
    },
    __v: 0,
  },
];
