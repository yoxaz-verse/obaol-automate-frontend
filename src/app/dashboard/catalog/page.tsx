// pages/Catalog.tsx
"use client";

import React from "react";
import { Spacer } from "@heroui/react";
import { ProductList } from "@/components/dashboard/Catalog/product-list";
import CategoryDivision from "@/components/dashboard/Catalog/category-division";
import { Button } from "@nextui-org/react";

export default function Essentials() {
  const [selectedProduct, setSelectedProduct] = React.useState<any | null>(
    null
  );

  return (
    <div className="flex items-center justify-center ">
      <div className="w-[95%]  ">
        <div className=" ">
          <div className="md:hidden flex w-[100%] flex-col md:flex-row gap-4 max-h-[80vh]">
            {!selectedProduct ? (
              <div className="md:w-[40%] pb-10  pr-6 overflow-auto">
                <CategoryDivision
                  selectedProduct={selectedProduct}
                  setSelectedProduct={setSelectedProduct}
                />{" "}
              </div>
            ) : (
              <div className="md:w-[60%] gap-4  max-h-[80vh]">
                <div>
                  <Button
                    onPress={() => {
                      setSelectedProduct(null);
                    }}
                    size="sm"
                    className="bg-red-500 text-white"
                  >
                    Back to Category
                  </Button>{" "}
                  <Spacer y={4} />
                </div>
                <ProductList
                  product={selectedProduct}
                  setProduct={setSelectedProduct}
                />
              </div>
            )}
          </div>
          <div className=" w-[100%] hidden md:flex flex-col md:flex-row gap-4  max-h-[80vh]">
            <div className="md:w-[40%] pb-10  pr-6 overflow-auto">
              <CategoryDivision
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
              />{" "}
            </div>
            <div className="md:w-[60%] gap-4  max-h-[80vh]">
              <ProductList
                product={selectedProduct}
                setProduct={setSelectedProduct}
              />
            </div>
          </div>
          <Spacer y={4} />
        </div>
      </div>
    </div>
  );
}
