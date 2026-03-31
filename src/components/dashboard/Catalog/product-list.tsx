"use client";
import AddModal from "@/components/CurdTable/add-model";
import QueryComponent from "@/components/queryComponent";
import { apiRoutesByRole, initialTableConfig } from "@/utils/tableValues";
import { Accordion, AccordionItem } from "@heroui/react";
import React, { useState, useContext } from "react";
import VariantRate from "./variant-rate";
import UserDeleteModal from "@/components/CurdTable/delete";
import EditModal from "@/components/CurdTable/edit-model";
import AuthContext from "@/context/AuthContext";
import { FiPackage, FiLayers, FiInfo, FiCheckCircle, FiGrid, FiDatabase } from "react-icons/fi";

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
    setIsDeleted(true);
  };

  return product ? (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ─── Product Tactical Header ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-foreground/5 pb-12 mb-12 relative">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-warning-500/10 flex items-center justify-center text-warning-500 border border-warning-500/20 shadow-lg shadow-warning-500/5">
              <FiPackage size={24} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-warning-500 opacity-80">Product Record</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
                <span className="text-[10px] font-bold text-default-400 uppercase tracking-widest">Active in Catalog</span>
              </div>
            </div>
          </div>

          <h2 className="text-5xl font-black tracking-tighter text-foreground mb-4 leading-[0.9] uppercase hyphens-auto text-left">
            {product.name}
          </h2>

          {product.description && (
            <div className="relative pl-6 border-l-2 border-warning-500/20 py-1 text-left">
              <p className="text-default-500 text-sm max-w-3xl leading-relaxed font-medium">
                {product.description}
              </p>
            </div>
          )}
        </div>

        {user?.role !== "Associate" && (
          <div className="flex gap-3 items-center bg-foreground/[0.03] p-2.5 rounded-[2.5rem] border border-foreground/5 backdrop-blur-md self-start shrink-0 shadow-xl">
            <EditModal
              _id={product._id}
              initialData={product}
              currentTable="Product"
              formFields={tableConfig["product"].filter(
                (f: any) => f.key !== "subCategory"
              )}
              apiEndpoint={apiRoutesByRole["product"]}
              refetchData={refetchData}
            />
            <div className="w-px h-8 bg-foreground/10" />
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
          const productVariantValue = Array.isArray(productVariantData)
            ? productVariantData
            : (productVariantData?.data || []);

          return (
            <div className="space-y-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-1 h-8 bg-warning-500 rounded-full" />
                  <div>
                    <h3 className="text-2xl font-black text-foreground tracking-tight uppercase">Product Variants</h3>
                    <p className="text-xs text-default-400 font-bold uppercase tracking-widest mt-0.5">Specifications & Real-time Market Rates</p>
                  </div>
                </div>
                {productVariantFormFields && user?.role !== "Associate" && (
                  <div className="shadow-2xl shadow-warning-500/10 rounded-[1.5rem] overflow-hidden">
                    <AddModal
                      name="Product Variant"
                      buttonLabel="Create New Variant"
                      currentTable={"ProductVariant"}
                      formFields={productVariantFormFields}
                      apiEndpoint={apiRoutesByRole["productVariant"]}
                      refetchData={refetchData}
                      additionalVariable={{ product: product._id }}
                    />
                  </div>
                )}
              </div>

              {productVariantValue && (
                <div className="grid grid-cols-1 gap-6">
                  {/* @ts-ignore */}
                  <Accordion
                    key={product._id}
                    className="px-0 gap-6"
                    variant="splitted"
                    itemClasses={{
                      base: "group/item py-0 mb-6 bg-foreground/[0.02] dark:bg-foreground/[0.01] border border-foreground/[0.06] rounded-[2.5rem] transition-all duration-300 hover:bg-foreground/[0.04] !shadow-none data-[open=true]:bg-foreground/[0.03] data-[open=true]:border-warning-500/20 data-[open=true]:rounded-[3rem] data-[open=true]:shadow-2xl data-[open=true]:shadow-warning-500/5",
                      title: "font-black text-lg tracking-wide text-foreground/90 py-5",
                      trigger: "px-8 py-6 rounded-[2.5rem]",
                      content: "px-8 pb-8 pt-2",
                      indicator: "text-default-400 group-data-[open=true]/item:rotate-180",
                    }}
                  >
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
                            <div className="flex items-center justify-between w-full">
                              <div className="flex flex-col">
                                <span className="text-2xl font-black uppercase tracking-tight">{variant.name}</span>
                                {isAdded && <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest mt-0.5">Active in my catalog</span>}
                              </div>
                              {isAdded && (
                                <div className="hidden sm:flex items-center gap-2.5 px-5 py-2 rounded-full bg-gradient-to-r from-orange-500/10 to-warning-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-black border border-orange-500/20 shadow-xl shadow-orange-500/5 transition-all">
                                  <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
                                  </span>
                                  MANAGED
                                </div>
                              )}
                            </div>
                          }
                        >
                          {variant.description && (
                            <div className="mb-10 ml-0 relative text-left">
                              <p className="text-default-500 text-base leading-relaxed max-w-3xl font-medium">
                                {variant.description}
                              </p>
                            </div>
                          )}

                          <div className="space-y-12">
                            {user?.role === "Associate" ? (
                              <div className="space-y-12">
                                {isAdded && (
                                  <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                                    <div className="flex items-center gap-4 mb-8 text-left">
                                      <div className="h-[1px] flex-1 bg-gradient-to-r from-warning-500/50 to-transparent" />
                                      <div className="flex items-center gap-2">
                                        <FiCheckCircle className="text-warning-500" size={14} />
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-warning-500">Proprietary Assets</h4>
                                      </div>
                                    </div>
                                    <div className="bg-content1/40 border border-divider/50 rounded-[2.5rem] p-8 backdrop-blur-md shadow-inner text-left">
                                      <VariantRate
                                        productVariant={variant}
                                        rate="catalogItem"
                                        additionalParams={{
                                          associateId: user?.id,
                                          productVariantId: variant._id
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <div className="flex items-center gap-4 mb-8 text-left">
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-default-300/30 to-transparent" />
                                    <div className="flex items-center gap-2">
                                      <FiGrid className="text-default-400" size={14} />
                                      <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-default-400">Global Liquidity</h4>
                                    </div>
                                  </div>
                                  <div className="bg-foreground/[0.01] border border-divider/20 rounded-[2.5rem] p-8 backdrop-blur-sm text-left">
                                    <VariantRate
                                      productVariant={variant}
                                      rate="variantRate"
                                      additionalParams={{ view: "marketplace" }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              /* Standard View for Admin/Others */
                              <div className="animate-in fade-in duration-500">
                                <div className="flex items-center gap-4 mb-8 text-left">
                                  <div className="h-[1px] flex-1 bg-gradient-to-r from-warning-500/50 to-transparent" />
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-warning-500">Unified Rate Ledger</h4>
                                  </div>
                                </div>
                                <div className="bg-foreground/[0.01] border border-divider/50 rounded-[3rem] p-8 shadow-inner overflow-hidden text-left">
                                  <VariantRate
                                    productVariant={variant}
                                    rate="variantRate"
                                  />
                                </div>
                              </div>
                            )}

                            {user?.role !== "Associate" && (
                              <div className="mt-12 pt-10 border-t border-divider/30 flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-3 text-default-400/60 bg-default-100/30 px-5 py-2 rounded-full border border-divider/20 text-left">
                                  <FiInfo size={16} />
                                  <p className="text-[11px] font-black uppercase tracking-[0.2em]">Administrative Shell — Variant {variant._id.slice(-6).toUpperCase()}</p>
                                </div>
                                <div className="flex gap-4 items-center bg-foreground/[0.04] p-2.5 rounded-[2rem] border border-divider/40 backdrop-blur-sm shadow-xl">
                                  <EditModal
                                    _id={variant._id}
                                    initialData={variant}
                                    currentTable="Product Variant"
                                    formFields={tableConfig["productVariant"].filter(
                                      (f: any) => f.key !== "product"
                                    )}
                                    apiEndpoint={apiRoutesByRole["productVariant"]}
                                    refetchData={refetchData}
                                  />
                                  <div className="w-px h-8 bg-divider" />
                                  <UserDeleteModal
                                    _id={variant._id}
                                    name={variant.name}
                                    deleteApiEndpoint={apiRoutesByRole["productVariant"]}
                                    refetchData={refetchData}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </div>
              )}
            </div>
          );
        }}
      </QueryComponent >
    </section >
  ) : (
    <div className="h-full flex flex-col items-center justify-center text-center gap-6 py-20 animate-in fade-in duration-700">
      <div className="relative">
        <div className="absolute inset-0 bg-warning-500/10 blur-3xl rounded-full animate-pulse scale-150" />
        <div className="relative w-32 h-32 rounded-[3rem] bg-foreground/5 flex items-center justify-center border border-foreground/10 rotate-6 hover:rotate-0 transition-transform duration-500">
          <FiPackage size={48} className="opacity-20" />
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-black text-foreground tracking-tight uppercase">Operational Deadlock</h3>
        <p className="text-default-400 text-sm max-w-[320px] leading-relaxed mt-2 font-medium">Select a commodity from the master catalog system to initialize the detailed variant registry.</p>
      </div>
    </div>
  );
};
