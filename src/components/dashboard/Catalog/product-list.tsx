"use client";
import AddModal from "@/components/CurdTable/add-model";
import QueryComponent from "@/components/queryComponent";
import Title from "@/components/titles";
import { } from "@/core/api/apiRoutes";
import { apiRoutesByRole, initialTableConfig } from "@/utils/tableValues";
import { Accordion, AccordionItem, Divider, Spacer } from "@heroui/react";
import React, { useState } from "react";
import VariantRate from "./variant-rate";
import UserDeleteModal from "@/components/CurdTable/delete";
import EditModal from "@/components/CurdTable/edit-model";

// ... other imports

interface IProductList {
  product: any;
  setProduct: (product: any) => void;
  onProductDeleted: () => void;
}
export const ProductList = ({ product, setProduct }: IProductList) => {
  const tableConfig = { ...initialTableConfig };
  const [isDeleted, setIsDeleted] = useState(false);

  const refetchData = () => {
    // ✅ Trigger deletion effect
    console.log(product);

    setIsDeleted(true);
  };

  return product ? (
    <section>
      {/* <Title title={isDeleted ? "DSsd" : "aaaaaaaaaaaaaaaa"} /> */}
      <div className="flex justify-between">
        <Title title={product.name} />
        <div className="flex gap-2 items-center">
          <EditModal
            _id={product._id}
            initialData={product}
            currentTable="Product"
            formFields={tableConfig["product"].filter(
              (f: any) => f.key !== "subCategory"
            )}
            apiEndpoint={apiRoutesByRole["product"]}
            refetchData={refetchData}
          />{" "}
          <UserDeleteModal
            _id={product._id}
            name={product.name}
            deleteApiEndpoint={apiRoutesByRole["product"]}
            refetchData={refetchData}
          />
        </div>
      </div>
      {product.description && (
        <p className="text-white">{product.description}</p>
      )}

      <div className="h-6" />

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
          const productVariantValue = productVariantData?.data || [];

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
              <div className="h-1" />
              {productVariantValue && (
                <>
                  <Accordion>
                    {productVariantValue.map((productVariantValue: any) => (
                      <AccordionItem
                        key={productVariantValue._id}
                        aria-label={productVariantValue.name}
                        title={productVariantValue.name}
                        className="opacity-60 hover:opacity-100 "
                      >
                        {productVariantValue.description && (
                          <p className="text-gray-700">
                            {productVariantValue.description}
                          </p>
                        )}
                        <div className="h-6" />
                        <VariantRate
                          productVariant={productVariantValue}
                          rate="variantRate"
                        />
                        <div className="h-2" />
                        <Divider />
                        <div className="h-5" />
                        <div className="flex gap-5">
                          <p>{productVariantValue.name} actions</p>
                          <EditModal
                            _id={productVariantValue._id}
                            initialData={productVariantValue}
                            currentTable="Product Variant"
                            formFields={tableConfig["productVariant"].filter(
                              (f: any) => f.key !== "product"
                            )}
                            apiEndpoint={apiRoutesByRole["productVariant"]}
                            refetchData={refetchData}
                          />{" "}
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
