"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Accordion, AccordionItem, Button, Divider, Chip } from "@heroui/react";
// ^ Adjust if you're using a different UI library for your accordions
import { getData } from "@/core/api/apiHandler";
import { inventoryManagerRoutes } from "@/core/api/apiRoutes";
import { apiRoutesByRole, initialTableConfig } from "@/utils/tableValues";
import UserDeleteModal from "@/components/CurdTable/delete";
import AuthContext from "@/context/AuthContext";

import Title from "@/components/titles";
import AddModal from "@/components/CurdTable/add-model";
import QueryComponent from "@/components/queryComponent";
import EditModal from "@/components/CurdTable/edit-model";

// -- Adjust these interfaces to match your data shape --
interface ICategory {
  _id: string;
  name: string;
  description?: string;
}
interface ISubCategory {
  _id: string;
  name: string;
  description?: string;
}
interface IProduct {
  _id: string;
  name: string;
  description?: string;
}

// Props for the main component (in case you pass down selectedProduct, etc.)
interface ICategoryDivisionProps {
  selectedProduct: any | null;
  setSelectedProduct: React.Dispatch<React.SetStateAction<any | null>>;
  myCatalogItems: any[];
}

/**
 * The main "CategoryDivision" page:
 * 1) Fetch categories.
 * 2) For each category, fetch subCategories to count them,
 *    display "Category (N)" in the accordion.
 * 3) On expand, fetch & display subCategories in detail.
 * 4) For each subCategory, fetch products to count them,
 *    display "SubCategory (N)" in the accordion.
 * 5) On expand, fetch & display products in detail.
 */
export default function CategoryDivision({
  selectedProduct,
  setSelectedProduct,
  myCatalogItems,
}: ICategoryDivisionProps) {
  const { user } = React.useContext(AuthContext);
  // Make a local copy of your table config
  const tableConfig = { ...initialTableConfig };

  // If you want a refetch callback for <AddModal> or React Query invalidations:
  const refetchData = React.useCallback(() => {
    // e.g. queryClient.invalidateQueries(["category","subCategory","product"]);
  }, []);

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <span className="w-8 h-px bg-orange-500/50 inline-block" />
          Catalog
        </h2>
      </div>

      {/* Add a new Category, if needed */}
      {tableConfig["category"] && user?.role !== "Associate" && (
        <AddModal
          name="Category"
          currentTable="Category"
          formFields={tableConfig["category"]}
          apiEndpoint={apiRoutesByRole["category"]}
          refetchData={refetchData}
        />
      )}

      <div className="h-2" />

      {/* 1) Fetch the main Category array. No "count" API – just normal listing. */}
      <QueryComponent
        api={apiRoutesByRole["category"]}
        queryKey={["category"]}
        page={1}
        limit={100}
      >
        {(categoryData: any) => {
          // QueryComponent already unwraps to data array when 'page' is provided
          const categoryArray: ICategory[] = Array.isArray(categoryData) ? categoryData : (categoryData?.data || []);

          return (
            <CategoryList
              categories={categoryArray}
              tableConfig={tableConfig}
              refetchData={refetchData}
              setSelectedProduct={setSelectedProduct}
              myCatalogItems={myCatalogItems}
            />
          );
        }}
      </QueryComponent>
    </section>
  );
}

/**
 * CategoryList:
 * - For each category, we fetch all subCategories (normal listing)
 *   and do subCatArray.length => subCatCount.
 * - We display "CategoryName (subCatCount)" in the accordion title.
 * - When user expands the category, we fetch subCategories again for display.
 */
function CategoryList({
  categories,
  tableConfig,
  refetchData,
  setSelectedProduct,
  myCatalogItems,
}: {
  categories: ICategory[];
  tableConfig: any;
  refetchData: () => void;
  setSelectedProduct: React.Dispatch<React.SetStateAction<any | null>>;
  myCatalogItems: any[];
}) {
  // Group my catalog items by category for instant lookup
  const myItemsByCat = React.useMemo(() => {
    const map: Record<string, number> = {};
    const items = Array.isArray(myCatalogItems) ? myCatalogItems : [];

    items.forEach(item => {
      const catId = item.productVariantId?.product?.subCategory?.category?._id ||
        item.productVariantId?.product?.category?._id;
      if (catId) map[catId] = (map[catId] || 0) + 1;
    });
    return map;
  }, [myCatalogItems]);

  const { user } = React.useContext(AuthContext);

  if (!categories || categories.length === 0) {
    return <p>No categories found.</p>;
  }

  return (
    <Accordion {...({ variant: "splitted" } as any)} className="px-0">
      {categories.map((cat) => {
        const myCount = myItemsByCat[cat._id] || 0;

        return (
          <AccordionItem
            key={cat._id}
            aria-label={cat.name}
            title={
              <div className="flex items-center justify-between w-full pr-2 py-2">
                <span className="font-semibold text-base tracking-wide text-foreground/90 group-hover:text-orange-400 transition-colors">{cat.name}</span>
                <div className="flex gap-2">
                  {myCount > 0 && (
                    <span className="flex items-center px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 text-[10px] font-bold border border-orange-500/20 shadow-[0_0_10px_rgba(251,146,60,0.1)]">
                      {myCount} Products
                    </span>
                  )}
                </div>
              </div>
            }
            className="group mb-3 border border-foreground/10 bg-foreground/[0.02] hover:bg-foreground/[0.04] backdrop-blur-md rounded-2xl transition-all shadow-sm data-[open=true]:border-orange-500/30 data-[open=true]:bg-orange-500/5 data-[open=true]:shadow-[0_4px_24px_rgba(251,146,60,0.05)]"
          >
            <div className="pl-6 ml-4 border-l-2 border-orange-500/10 pb-4">
              {cat.description && <p className="text-sm text-default-400 mb-4 px-2">{cat.description}</p>}
              {/* If you want an AddModal for subCategory creation */}
              {tableConfig["subCategory"] && user?.role !== "Associate" && (
                <div className="mb-4 px-2">
                  <AddModal
                    name="Sub Category"
                    currentTable="Sub Category"
                    formFields={tableConfig["subCategory"].filter(
                      (f: any) => f.key !== "category"
                    )}
                    apiEndpoint={apiRoutesByRole["subCategory"]}
                    additionalVariable={{ category: cat._id }}
                    refetchData={refetchData}
                  />
                </div>
              )}

              {/* 2) On expand, fetch subCategories again for actual usage */}
              <QueryComponent
                api={apiRoutesByRole["subCategory"]}
                queryKey={["subCategory", cat._id]}
                page={1}
                limit={100}
                additionalParams={{ category: cat._id }}
              >
                {(subCatData: any) => {
                  // QueryComponent already unwraps to data array when 'page' is provided
                  const subCategories: ISubCategory[] = Array.isArray(subCatData) ? subCatData : (subCatData?.data || []);
                  if (subCategories.length === 0) {
                    return <p className="px-2">No subcategories found.</p>;
                  }
                  return (
                    <SubCategoryList
                      subCategories={subCategories}
                      tableConfig={tableConfig}
                      refetchData={refetchData}
                      setSelectedProduct={setSelectedProduct}
                      myCatalogItems={myCatalogItems}
                    />
                  );
                }}
              </QueryComponent>
            </div>
            <Divider />
            <div className="h-4" />
            {user?.role !== "Associate" && (
              <div className="flex justify-around">
                <p>{cat.name} Actions</p>
                <EditModal
                  _id={cat._id}
                  initialData={cat}
                  currentTable="Category"
                  formFields={tableConfig["category"]}
                  apiEndpoint={apiRoutesByRole["category"]}
                  refetchData={refetchData}
                />
                <UserDeleteModal
                  _id={cat._id}
                  name={cat.name}
                  deleteApiEndpoint={apiRoutesByRole["category"]}
                  refetchData={refetchData}
                />
              </div>
            )}
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}



/**
 * SubCategoryList:
 * - For each subCategory, do a normal fetch of products => .length => productCount
 * - Show "SubCategoryName (productCount)" in the accordion title
 * - On expand, fetch the products again for display
 */
function SubCategoryList({
  subCategories,
  tableConfig,
  refetchData,
  setSelectedProduct,
  myCatalogItems,
}: {
  subCategories: ISubCategory[];
  tableConfig: any;
  refetchData: () => void;
  setSelectedProduct: React.Dispatch<React.SetStateAction<any | null>>;
  myCatalogItems: any[];
}) {
  // Group my items by subcategory
  const myItemsBySub = React.useMemo(() => {
    const map: Record<string, number> = {};
    const items = Array.isArray(myCatalogItems) ? myCatalogItems : [];

    items.forEach(item => {
      const subId = item.productVariantId?.product?.subCategory?._id;
      if (subId) map[subId] = (map[subId] || 0) + 1;
    });
    return map;
  }, [myCatalogItems]);

  const { user } = React.useContext(AuthContext);

  return (
    <Accordion {...({ variant: "light" } as any)} className="px-0">
      {subCategories.map((sub) => {
        const myCount = myItemsBySub[sub._id] || 0;

        return (
          <AccordionItem
            key={sub._id}
            aria-label={sub.name}
            title={
              <div className="flex items-center justify-between w-full px-2 py-1">
                <span className="text-sm font-semibold tracking-wide text-foreground/80 group-hover:text-orange-400 transition-colors">{sub.name}</span>
                {myCount > 0 && (
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-orange-500/10 text-orange-400 text-[10px] font-bold border border-orange-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_6px_rgba(251,146,60,0.8)]" />
                    {myCount} Added
                  </span>
                )}
              </div>
            }
            className="group mb-2 border border-foreground/5 bg-foreground/[0.01] hover:bg-foreground/[0.03] rounded-xl transition-all data-[open=true]:border-orange-500/20 data-[open=true]:bg-orange-500/[0.02]"
          >
            <div className="pl-6 ml-4 border-l-2 border-orange-500/10 pb-3 px-2">
              <p className="text-xs text-default-400 mb-4 px-2">{sub.description}</p>

              {/* Allow Add Product for everyone (including Associates) */}
              {tableConfig["product"] && (
                <div className="mb-4 px-2">
                  <AddModal
                    name="Product"
                    currentTable="Product"
                    formFields={tableConfig["product"].filter(
                      (f: any) => f.key !== "subCategory"
                    )}
                    apiEndpoint={apiRoutesByRole["product"]}
                    additionalVariable={{ subCategory: sub._id }}
                    refetchData={refetchData}
                  />
                </div>
              )}

              {/* 3) On expand, fetch actual products for display */}
              <ProductSection
                subCategoryId={sub._id}
                setSelectedProduct={setSelectedProduct}
                myCatalogItems={myCatalogItems}
              />
            </div>
            <Divider />
            <div className="h-4" />
            {user?.role !== "Associate" && (
              <div className="flex justify-around">
                <p>{sub.name} Actions</p>
                <EditModal
                  _id={sub._id}
                  initialData={sub}
                  currentTable="Sub Category"
                  formFields={tableConfig["subCategory"].filter(
                    (f: any) => f.key !== "category"
                  )}
                  apiEndpoint={apiRoutesByRole["subCategory"]}
                  refetchData={refetchData}
                />
                <UserDeleteModal
                  _id={sub._id}
                  name={sub.name}
                  deleteApiEndpoint={apiRoutesByRole["subCategory"]}
                  refetchData={refetchData}
                />
              </div>
            )}
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

/**
 * ProductSection:
 * - On SubCategory expand, we fetch the product array again to show actual details.
 * - If you prefer to avoid multiple fetches, you can store them from the earlier step.
 */
function ProductSection({
  subCategoryId,
  setSelectedProduct,
  myCatalogItems,
}: {
  subCategoryId: string;
  setSelectedProduct: React.Dispatch<React.SetStateAction<any | null>>;
  myCatalogItems: any[];
}) {
  return (
    <QueryComponent
      api={apiRoutesByRole["product"]}
      queryKey={["product", subCategoryId]}
      page={1}
      limit={100}
      additionalParams={{ subCategory: subCategoryId }}
    >
      {(productData: any) => {
        // QueryComponent already unwraps to data array when 'page' is provided
        const products: IProduct[] = Array.isArray(productData) ? productData : (productData?.data || []);
        if (products.length === 0) {
          return <p>No products found.</p>;
        }
        return (
          <div className="flex flex-col gap-2 p-0 px-2">
            {products.map((p) => {
              const safeItems = Array.isArray(myCatalogItems) ? myCatalogItems : [];
              const myCount = safeItems.filter(item =>
                item.productVariantId?.product?._id === p._id
              ).length;

              return (
                <div
                  key={p._id}
                  className={`group flex items-center justify-between pl-4 py-4 pr-0 rounded-xl transition-all duration-300 cursor-pointer ${myCount > 0
                    ? "bg-orange-500/5 border border-orange-500/20 shadow-[inset_0_0_12px_rgba(251,146,60,0.05)] hover:bg-orange-500/10 hover:border-orange-500/30"
                    : "bg-foreground/[0.02] border border-foreground/5 hover:bg-foreground/[0.05] hover:border-foreground/20 hover:shadow-lg"
                    }`}
                  onClick={() => setSelectedProduct(p)}
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold tracking-wide text-foreground/90 group-hover:text-foreground transition-colors">{p.name}</span>
                    {myCount > 0 && (
                      <span className="text-[9px] text-orange-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-orange-500" />
                        In My Catalog ({myCount})
                      </span>
                    )}
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${myCount > 0
                    ? "bg-orange-500/10 text-orange-500 group-hover:bg-orange-500 group-hover:text-black group-hover:shadow-[0_0_12px_rgba(251,146,60,0.5)]"
                    : "bg-foreground/5 text-default-500 group-hover:bg-foreground/10 group-hover:text-foreground"
                    }`}>
                    <svg className="w-4 h-4 -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        );
      }}
    </QueryComponent >
  );
}
