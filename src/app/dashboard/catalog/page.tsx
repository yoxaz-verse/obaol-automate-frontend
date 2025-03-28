// pages/Catalog.tsx
"use client";

import React from "react";
import { Spacer } from "@heroui/react";
import { ProductList } from "@/components/dashboard/Catalog/product-list";
import CategoryDivision from "@/components/dashboard/Catalog/category-division";

export default function Essentials() {
  const [selectedProduct, setSelectedProduct] = React.useState<any | null>(
    null
  );

  return (
    <div className="flex items-center justify-center ">
      <div className="w-[95%]  ">
        <div className=" ">
          <div className="flex w-[100%] gap-4 max-h-[80vh]">
            <div className="w-[40%] pb-10  pr-6 overflow-auto">
              <CategoryDivision
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
              />{" "}
            </div>
            <div className="w-[60%] gap-4  max-h-[80vh]">
              <ProductList product={selectedProduct} />
            </div>
          </div>
          <Spacer y={4} />
        </div>
      </div>
    </div>
  );
}
