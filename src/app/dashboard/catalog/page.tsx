// pages/Catalog.tsx
"use client";

import React from "react";
import { Button } from "@heroui/react";
import { ProductList } from "@/components/dashboard/Catalog/product-list";
import CategoryDivision from "@/components/dashboard/Catalog/category-division";
import QueryComponent from "@/components/queryComponent";
import { apiRoutesByRole } from "@/utils/tableValues";

export default function Essentials() {
  const [selectedProduct, setSelectedProduct] = React.useState<any | null>(
    null
  );

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-64px)] w-full py-8 relative overflow-hidden">
      {/* Background Ambient Effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-warning/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[1400px] px-6 relative z-10 flex flex-col h-full">
        <QueryComponent
          api={apiRoutesByRole["catalogItem"]}
          queryKey={["my-catalog-items"]}
        >
          {(catalogItemsData: any) => {
            // Robust extraction: handle both raw arrays and paginated { data: [...] }
            const myItems = Array.isArray(catalogItemsData)
              ? catalogItemsData
              : (catalogItemsData?.data || catalogItemsData?.data?.data || []);

            return (
              <QueryComponent
                api={apiRoutesByRole["product"]}
                queryKey={["total-products-count"]}
                limit={1} // We just want the total from metadata
              >
                {(productsData: any) => {
                  const totalProducts = productsData?.totalCount || 0;

                  return (
                    <>
                      {/* Layout Grid */}
                      <div className="flex flex-col md:flex-row gap-8 h-full min-h-[600px] flex-1">
                        {/* mobile view */}
                        <div className="md:hidden flex w-full flex-col gap-4">
                          {!selectedProduct ? (
                            <div className="pb-10 pr-0 overflow-auto">
                              <CategoryDivision
                                selectedProduct={selectedProduct}
                                setSelectedProduct={setSelectedProduct}
                                myCatalogItems={myItems}
                              />
                            </div>
                          ) : (
                            <div className="gap-4 min-w-0 overflow-x-auto">
                              <Button
                                onPress={() => setSelectedProduct(null)}
                                size="sm"
                                variant="flat"
                                color="danger"
                              >
                                Back to Category
                              </Button>
                              <div className="h-4" />
                              <ProductList
                                product={selectedProduct}
                                setProduct={setSelectedProduct}
                                onProductDeleted={() => setSelectedProduct(null)}
                                myCatalogItems={myItems}
                              />
                            </div>
                          )}
                        </div>

                        {/* desktop view */}
                        <div className="hidden md:flex flex-row gap-8 w-full h-[calc(100vh-140px)]">
                          {/* LEFT PANEL: Categories */}
                          <div
                            className={`${selectedProduct ? "w-[280px]" : "w-[380px]"
                              } transition-all duration-300 ease-in-out flex-shrink-0 h-full overflow-y-auto scrollbar-hide pr-2 flex flex-col gap-4`}
                          >
                            <CategoryDivision
                              selectedProduct={selectedProduct}
                              setSelectedProduct={setSelectedProduct}
                              myCatalogItems={myItems}
                            />
                          </div>

                          {/* RIGHT PANEL: Product Details */}
                          <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-foreground/[0.02] rounded-3xl p-8 border border-foreground/10 backdrop-blur-xl shadow-2xl relative">
                            {/* Inner glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none rounded-3xl" />

                            <div className="relative z-10 h-full">
                              <ProductList
                                product={selectedProduct}
                                setProduct={setSelectedProduct}
                                onProductDeleted={() => setSelectedProduct(null)}
                                myCatalogItems={myItems}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                }}
              </QueryComponent>
            );
          }}
        </QueryComponent>
      </div>
    </div>
  );
}
