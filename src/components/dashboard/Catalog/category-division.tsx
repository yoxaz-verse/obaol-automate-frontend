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
      <Title title="Categories" />

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
  // No longer need individual fetch effects for counts
  if (!categories || categories.length === 0) {
    return <p>No categories found.</p>;
  }

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

  return (
    <Accordion {...({ variant: "splitted" } as any)} className="px-0">
      {categories.map((cat) => {
        const myCount = myItemsByCat[cat._id] || 0;

        return (
          <AccordionItem
            key={cat._id}
            aria-label={cat.name}
            title={
              <div className="flex items-center justify-between w-full pr-4">
                <span className="font-medium text-foreground/90">{cat.name}</span>
                <div className="flex gap-2">
                  {myCount > 0 && (
                    <span className="flex items-center px-2 py-0.5 rounded-full bg-success-100 text-success-700 text-[10px] font-bold border border-success-200 shadow-sm">
                      {myCount} My Products
                    </span>
                  )}
                </div>
              </div>
            }
            className="group border-b border-divider/50 last:border-0"
          >
            {cat.description && <p>{cat.description}</p>}
            <div className="h-1" />
            {/* If you want an AddModal for subCategory creation */}
            {tableConfig["subCategory"] && user?.role !== "Associate" && (
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
            )}
            <div className="h-1" />
            {/* 2) On expand, fetch subCategories again for actual usage */}
            <SubCategorySection
              categoryId={cat._id}
              tableConfig={tableConfig}
              refetchData={refetchData}
              setSelectedProduct={setSelectedProduct}
              myCatalogItems={myCatalogItems}
            />
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
 * SubCategorySection:
 * - When user expands a Category, we do a normal subCategory listing for that category.
 * - We pass the resulting array to <SubCategoryList>,
 *   which in turn fetches Products for counting.
 */
function SubCategorySection({
  categoryId,
  tableConfig,
  refetchData,
  setSelectedProduct,
  myCatalogItems,
}: {
  categoryId: string;
  tableConfig: any;
  refetchData: () => void;
  setSelectedProduct: React.Dispatch<React.SetStateAction<any | null>>;
  myCatalogItems: any[];
}) {
  return (
    <QueryComponent
      api={apiRoutesByRole["subCategory"]}
      queryKey={["subCategory", categoryId]}
      page={1}
      limit={100}
      additionalParams={{ category: categoryId }}
    >
      {(subCategoryData: any) => {
        // QueryComponent already unwraps to data array when 'page' is provided
        const subCategories: ISubCategory[] = Array.isArray(subCategoryData) ? subCategoryData : (subCategoryData?.data || []);
        if (subCategories.length === 0) {
          return <p>No subcategories found.</p>;
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
              <div className="flex items-center justify-between w-full pr-2">
                <span className="text-sm font-medium text-foreground/80">{sub.name}</span>
                {myCount > 0 && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success-50 text-success-600 text-[10px] font-bold border border-success-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
                    {myCount} Added
                  </span>
                )}
              </div>
            }
            className="px-2"
          >
            <p>{sub.description}</p>
            <div className="h-1" />

            {/* Allow Add Product for everyone (including Associates) */}
            {tableConfig["product"] && (
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
            )}

            <div className="h-1" />
            {/* 3) On expand, fetch actual products for display */}
            <ProductSection
              subCategoryId={sub._id}
              setSelectedProduct={setSelectedProduct}
              myCatalogItems={myCatalogItems}
            />
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
          <div className="flex flex-col gap-2 p-1">
            {products.map((p) => {
              const safeItems = Array.isArray(myCatalogItems) ? myCatalogItems : [];
              const myCount = safeItems.filter(item =>
                item.productVariantId?.product?._id === p._id
              ).length;

              return (
                <div
                  key={p._id}
                  className={`group flex items-center justify-between p-3 rounded-2xl transition-all hover:bg-content2/50 ${myCount > 0 ? "border border-success-500/20 bg-success-500/5" : "border border-transparent"
                    }`}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground/90">{p.name}</span>
                    {myCount > 0 && (
                      <span className="text-[10px] text-success-600 font-bold uppercase tracking-tighter">In My Catalog ({myCount})</span>
                    )}
                  </div>
                  <Button
                    onPress={() => setSelectedProduct(p)}
                    size="sm"
                    variant="shadow"
                    color={myCount > 0 ? "success" : "primary"}
                    className="min-w-[60px] h-8 rounded-xl font-medium"
                  >
                    View
                  </Button>
                </div>
              );
            })}
          </div>
        );
      }}
    </QueryComponent>
  );
}
