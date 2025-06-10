import AddModal from "@/components/CurdTable/add-model";
import CommonTable from "@/components/CurdTable/common-table";
import QueryComponent from "@/components/queryComponent";
import Title from "@/components/titles";
import AuthContext from "@/context/AuthContext";
import { getData, patchData, postData } from "@/core/api/apiHandler";
import {
  associateRoutes,
  displayedRateRoutes,
  locationRoutes,
} from "@/core/api/apiRoutes";
import {
  apiRoutesByRole,
  generateColumns,
  initialTableConfig,
} from "@/utils/tableValues";
import {
  Accordion,
  AccordionItem,
  Button,
  Divider,
  Spacer,
  Tab,
  Tabs,
  toast,
  useDisclosure,
} from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useContext, useEffect, useState } from "react";
import SelectModal from "./select-modal";
import { Input, Switch } from "@nextui-org/react";
import VariantRate from "./variant-rate";
import UserDeleteModal from "@/components/CurdTable/delete";

// ... other imports

interface IProductList {
  product: any;
  setProduct: (product: any) => void; // ✅ Add this line
}

export const ProductList = ({ product, setProduct }: IProductList) => {
  const tableConfig = { ...initialTableConfig };
  const [isDeleted, setIsDeleted] = useState(false);

  useEffect(() => {
    if (isDeleted) {
      setProduct(null);
      setIsDeleted(false);
    }
  }, [isDeleted, setProduct]);

  const refetchData = () => {
    // ✅ Trigger deletion effect
    setIsDeleted(true);
  };

  return product ? (
    <section>
      <div className="flex justify-between">
        <Title title={product.name} />
        <UserDeleteModal
          _id={product._id}
          name={product.name}
          deleteApiEndpoint={apiRoutesByRole["product"]}
          refetchData={refetchData}
        />
      </div>
      <Spacer y={1} />

      <QueryComponent
        api={apiRoutesByRole["productVariant"]}
        queryKey={[
          "productVariant",
          apiRoutesByRole["productVariant"],
          product._id,
        ]}
        page={1}
        limit={100}
        additionalParams={{ product: product._id }}
      >
        {(productVariantData: any) => {
          const productVariantFormFields = tableConfig["productVariant"];
          const productVariantValue = productVariantData || [];

          return (
            <section>
              {productVariantFormFields && (
                <AddModal
                  name="Product Variant"
                  currentTable={"ProductVariant"}
                  formFields={productVariantFormFields}
                  apiEndpoint={apiRoutesByRole["productVariant"]}
                  refetchData={refetchData}
                  additionalVariable={{ product: product._id }}
                />
              )}
              <Spacer y={1} />
              {productVariantValue && (
                <>
                  <Accordion variant="splitted">
                    {productVariantValue.map((productVariantValue: any) => (
                      <AccordionItem
                        key={productVariantValue._id}
                        aria-label={productVariantValue.name}
                        title={productVariantValue.name}
                        className="opacity-60 hover:opacity-100 "
                      >
                        <VariantRate
                          productVariant={productVariantValue}
                          rate="variantRate"
                        />
                        <Spacer y={2} />
                        <Divider />
                        <Spacer y={5} />
                        <div className="flex gap-5">
                          <p>{productVariantValue.name} actions</p>

                          <UserDeleteModal
                            _id={productVariantValue._id}
                            name={productVariantValue.name}
                            deleteApiEndpoint={
                              apiRoutesByRole["productVariant"]
                            }
                            refetchData={refetchData}
                          />
                        </div>{" "}
                      </AccordionItem>
                    ))}
                  </Accordion>
                </>
              )}
            </section>
          );
        }}
      </QueryComponent>
    </section>
  ) : (
    <Title title="Select Any Product" />
  );
};
