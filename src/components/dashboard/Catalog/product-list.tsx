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
      <div className="flex justify-between items-start border-b border-foreground/10 pb-6 mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            {product.name}
          </h2>
          {product.description && (
            <p className="text-default-400 mt-2 text-sm max-w-2xl leading-relaxed">{product.description}</p>
          )}
        </div>
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
                  <Accordion key={product._id} className="px-0 ml-4">
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
                            <div className="flex items-center justify-between w-full px-2 py-2">
                              <span className="font-bold text-lg tracking-wide text-foreground/90">{variant.name}</span>
                              {isAdded && (
                                <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-bold shadow-[0_0_12px_rgba(251,146,60,0.15)] border border-orange-500/20">
                                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                  IN MY CATALOG
                                </span>
                              )}
                            </div>
                          }
                          className={`group mb-4 border border-foreground/10 bg-foreground/[0.02] hover:bg-foreground/[0.04] backdrop-blur-md rounded-2xl transition-all shadow-sm data-[open=true]:border-orange-500/30 data-[open=true]:bg-orange-500/5 data-[open=true]:shadow-[0_4px_24px_rgba(251,146,60,0.05)] ${isAdded ? "border-l-4 !border-l-orange-500" : ""}`}
                        >
                          {variant.description && (
                            <p className="text-default-700">
                              {variant.description}
                            </p>
                          )}
                          <div className="h-6" />
                          <div className="space-y-6">
                            {user?.role === "Associate" ? (
                              <>
                                <div className="p-1">
                                  {isAdded && (
                                    <section className="bg-orange-500/5 p-5 rounded-2xl border border-orange-500/20 mb-6">
                                      <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-4 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-orange-500" /> My Added Rates
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

                                  <section className="bg-foreground/[0.02] p-5 rounded-2xl border border-foreground/10">
                                    <p className="text-xs font-bold uppercase tracking-widest text-default-500 mb-4 flex items-center gap-2">
                                      <span className="w-2 h-2 rounded-full bg-default-500" /> Marketplace Rates
                                    </p>
                                    <VariantRate
                                      productVariant={variant}
                                      rate="variantRate"
                                      additionalParams={{ view: "marketplace" }}
                                    />
                                  </section>
                                </div>
                              </>
                            ) : (
                              /* Standard View for Admin/Others (No filtering) */
                              <div className="p-1">
                                <section className="bg-foreground/[0.02] p-5 rounded-2xl border border-foreground/10">
                                  <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-4">All Rates</p>
                                  <VariantRate
                                    productVariant={variant}
                                    rate="variantRate"
                                  />
                                </section>
                              </div>
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
      </QueryComponent >
    </section >
  ) : (
    <div className="h-full flex flex-col items-center justify-center text-center gap-4 text-default-400">
      <div className="w-20 h-20 rounded-full bg-foreground/5 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-foreground">No Product Selected</h3>
      <p className="text-sm max-w-[250px] leading-relaxed">Select a product from the catalog on the left to view its variants and rates.</p>
    </div>
  );
};
