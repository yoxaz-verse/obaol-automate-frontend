"use client";
import AddModal from "@/components/CurdTable/add-model";
import QueryComponent from "@/components/queryComponent";
import Title from "@/components/titles";
import { } from "@/core/api/apiRoutes";
import { apiRoutesByRole, initialTableConfig } from "@/utils/tableValues";
import { Accordion, AccordionItem, Divider, Spacer, Chip } from "@heroui/react";
import React, { useState, useContext } from "react";
import VariantRate from "./variant-rate";
import UserDeleteModal from "@/components/CurdTable/delete";
import EditModal from "@/components/CurdTable/edit-model";
import { FiCheckCircle } from "react-icons/fi";
import AuthContext from "@/context/AuthContext";

// ... other imports

interface IProductList {
  product: any;
  setProduct: (product: any) => void;
  onProductDeleted: () => void;
  myCatalogItems: any[];
}
export const ProductList = ({ product, setProduct, myCatalogItems }: IProductList) => {
  const tableConfig = { ...initialTableConfig };
  const [isDeleted, setIsDeleted] = useState(false);
  const { user } = useContext(AuthContext);

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
        {user?.role !== "Associate" && (
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
        )}
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
                  <Accordion key={product._id}>
                    {productVariantValue.map((variant: any) => {
                      const safeItems = Array.isArray(myCatalogItems) ? myCatalogItems : [];
                      const isAdded = safeItems.some(item =>
                        item.productVariantId?._id === variant._id
                      );

                      return (
                        <AccordionItem
                          key={variant._id}
                          aria-label={variant.name}
                          title={
                            <div className="flex items-center justify-between w-full pr-4">
                              <span className="font-medium">{variant.name}</span>
                              {isAdded && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-success-500 text-white text-[10px] font-bold shadow-sm">
                                  <FiCheckCircle size={10} />
                                  IN MY CATALOG
                                </span>
                              )}
                            </div>
                          }
                          className={`opacity-90 hover:opacity-100 ${isAdded ? "border-l-4 border-success-500 bg-success-500/5" : ""}`}
                        >
                          {variant.description && (
                            <p className="text-gray-700">
                              {variant.description}
                            </p>
                          )}
                          <div className="h-6" />
                          <div className="space-y-6">
                            {user?.role === "Associate" ? (
                              <>
                                {/* 1. My Added Rates (Specific to this Associate) */}
                                {isAdded && (
                                  <section className="bg-success-50/30 p-4 rounded-2xl border border-success-100">
                                    <p className="text-xs font-bold uppercase tracking-widest text-success-600 mb-3 flex items-center gap-2">
                                      <FiCheckCircle size={14} /> My Added Rates
                                    </p>
                                    <VariantRate
                                      productVariant={variant}
                                      rate="catalogItem"
                                      additionalParams={{
                                        associateId: user?.id,
                                        productVariantId: variant._id
                                      }}
                                    />
                                  </section>
                                )}

                                {/* 2. Marketplace Rates */}
                                <section className="bg-content1/50 p-4 rounded-2xl border border-divider/50">
                                  <p className="text-xs font-bold uppercase tracking-widest text-default-500 mb-3">Marketplace Rates</p>
                                  <VariantRate
                                    productVariant={variant}
                                    rate="variantRate"
                                    additionalParams={{ view: "marketplace" }}
                                  />
                                </section>
                              </>
                            ) : (
                              /* Standard View for Admin/Others (No filtering) */
                              <section className="bg-content1/50 p-4 rounded-2xl border border-divider/50">
                                <p className="text-xs font-bold uppercase tracking-widest text-primary-500 mb-3">All Rates</p>
                                <VariantRate
                                  productVariant={variant}
                                  rate="variantRate"
                                />
                              </section>
                            )}
                          </div>
                          {user?.role !== "Associate" && (
                            <>
                              <div className="h-4" />
                              <Divider />
                              <div className="h-5" />
                              <div className="flex items-center justify-between px-1">
                                <p className="text-xs font-bold uppercase tracking-wider text-default-400">Variant Management</p>
                                <div className="flex gap-4 items-center">
                                  <EditModal
                                    _id={variant._id}
                                    initialData={variant}
                                    currentTable="Product Variant"
                                    formFields={tableConfig["productVariant"].filter(
                                      (f: any) => f.key !== "product"
                                    )}
                                    apiEndpoint={apiRoutesByRole["productVariant"]}
                                    refetchData={refetchData}
                                  />{" "}
                                  <UserDeleteModal
                                    _id={variant._id}
                                    name={variant.name}
                                    deleteApiEndpoint={
                                      apiRoutesByRole["productVariant"]
                                    }
                                    refetchData={refetchData}
                                  />
                                </div>
                              </div>
                            </>
                          )}
                        </AccordionItem>
                      );
                    })}
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
