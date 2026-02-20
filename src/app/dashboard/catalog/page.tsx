// pages/Catalog.tsx
"use client";

import React from "react";
import { Button } from "@heroui/react";
import { ProductList } from "@/components/dashboard/Catalog/product-list";
import CategoryDivision from "@/components/dashboard/Catalog/category-division";
import { StatsHeader } from "@/components/dashboard/Catalog/stats-header";
import QueryComponent from "@/components/queryComponent";
import { apiRoutesByRole } from "@/utils/tableValues";

export default function Essentials() {
  const [selectedProduct, setSelectedProduct] = React.useState<any | null>(
    null
  );

  return (
    <div className="flex items-center text-foreground justify-center py-6">
      <div className="w-[95%]">
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
                      <StatsHeader
                        myCatalogCount={myItems.length}
                        marketplaceCount={totalProducts}
                      />

                      <div className="flex flex-col md:flex-row gap-6 md:h-[calc(100vh-280px)] min-h-[500px]">
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
                        <div className="hidden md:flex w-full flex-row gap-6">
                          <div className="md:w-[400px] flex-shrink-0 h-full pb-10 pr-2 overflow-y-auto scrollbar-hide">
                            <CategoryDivision
                              selectedProduct={selectedProduct}
                              setSelectedProduct={setSelectedProduct}
                              myCatalogItems={myItems}
                            />
                          </div>
                          <div className="flex-grow min-w-0 max-w-full h-full overflow-y-auto bg-content1/30 rounded-3xl p-6 border border-divider/50 backdrop-blur-sm">
                            <ProductList
                              product={selectedProduct}
                              setProduct={setSelectedProduct}
                              onProductDeleted={() => setSelectedProduct(null)}
                              myCatalogItems={myItems}
                            />
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
