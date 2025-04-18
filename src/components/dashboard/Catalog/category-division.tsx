"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Spacer, Accordion, AccordionItem, Button } from "@heroui/react";
// ^ Adjust if you're using a different UI library for your accordions
import { getData } from "@/core/api/apiHandler";
import { inventoryManagerRoutes } from "@/core/api/apiRoutes";
import { apiRoutesByRole, initialTableConfig } from "@/utils/tableValues";

import Title from "@/components/titles";
import AddModal from "@/components/CurdTable/add-model";
import QueryComponent from "@/components/queryComponent";
import { Divider } from "@nextui-org/react";

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
}: ICategoryDivisionProps) {
  // Make a local copy of your table config
  const tableConfig = { ...initialTableConfig };

  // If you want a refetch callback for <AddModal> or React Query invalidations:
  const refetchData = React.useCallback(() => {
    // e.g. queryClient.invalidateQueries(["category","subCategory","product"]);
  }, []);

  // Example: fetch "inventoryManager" data to populate a dropdown in the Category form
  const { data: inventoryManagerResponse } = useQuery({
    queryKey: ["InventoryManager"],
    queryFn: () => getData(inventoryManagerRoutes.getAll),
  });
  const inventoryManagerValue = inventoryManagerResponse?.data?.data?.data;
  if (inventoryManagerValue) {
    const inventoryManagerOptions = inventoryManagerValue.map((inv: any) => ({
      key: String(inv._id),
      value: inv.name,
    }));

    tableConfig["category"] = tableConfig["category"].map((field: any) =>
      field.key === "inventoryManager"
        ? { ...field, values: inventoryManagerOptions }
        : field
    );
  }

  return (
    <section>
      <Title title="Categories" />

      {/* Add a new Category, if needed */}
      {tableConfig["category"] && (
        <AddModal
          currentTable="Category"
          formFields={tableConfig["category"]}
          apiEndpoint={apiRoutesByRole["category"]}
          refetchData={refetchData}
        />
      )}

      <Spacer y={2} />

      {/* 1) Fetch the main Category array. No "count" API – just normal listing. */}
      <QueryComponent
        api={apiRoutesByRole["category"]}
        queryKey={["category"]}
        page={1}
        limit={100}
      >
        {(categoryData: any) => {
          const categoryArray: ICategory[] = categoryData?.data || [];

          return (
            <CategoryList
              categories={categoryArray}
              tableConfig={tableConfig}
              refetchData={refetchData}
              setSelectedProduct={setSelectedProduct}
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
}: {
  categories: ICategory[];
  tableConfig: any;
  refetchData: () => void;
  setSelectedProduct: React.Dispatch<React.SetStateAction<any | null>>;
}) {
  // Store subCategory count in a map: { [categoryId]: number }
  const [subCatCountMap, setSubCatCountMap] = React.useState<{
    [catId: string]: number;
  }>({});

  React.useEffect(() => {
    if (categories.length === 0) return;

    const fetchSubCatCounts = async () => {
      const newMap: { [id: string]: number } = {};
      for (const cat of categories) {
        try {
          // Normal listing: e.g. GET /subCategory?category=cat._id
          const response = await getData(
            `${apiRoutesByRole["subCategory"]}?category=${cat._id}`
          );
          // Suppose that returns { data: subCategoryArray }
          const subCats: ISubCategory[] = response?.data?.data || [];
          newMap[cat._id] = subCats.length;
        } catch (err) {
          console.error("Failed to fetch subCategories for cat", cat._id, err);
          newMap[cat._id] = 0;
        }
      }
      setSubCatCountMap(newMap);
    };

    fetchSubCatCounts();
  }, [categories]);

  if (!categories || categories.length === 0) {
    return <p>No categories found.</p>;
  }

  return (
    <Accordion variant="splitted">
      {categories.map((cat) => {
        // If we haven't fetched yet, show "..."
        const subCount = subCatCountMap[cat._id] ?? "...";

        return (
          <AccordionItem
            key={cat._id}
            aria-label={cat.name}
            // e.g. "Fruits (3)"
            title={`${cat.name} (${subCount})`}
            className="opacity-60 hover:opacity-100 "
          >
            {cat.description && <p>{cat.description}</p>}
            <Spacer y={1} />

            {/* If you want an AddModal for subCategory creation */}
            {tableConfig["subCategory"] && (
              <AddModal
                currentTable="Sub Category"
                formFields={tableConfig["subCategory"].filter(
                  (f: any) => f.key !== "category"
                )}
                apiEndpoint={apiRoutesByRole["subCategory"]}
                additionalVariable={{ category: cat._id }}
                refetchData={refetchData}
              />
            )}

            <Spacer y={1} />
            {/* 2) On expand, fetch subCategories again for actual usage */}
            <SubCategorySection
              categoryId={cat._id}
              tableConfig={tableConfig}
              refetchData={refetchData}
              setSelectedProduct={setSelectedProduct}
            />
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
}: {
  categoryId: string;
  tableConfig: any;
  refetchData: () => void;
  setSelectedProduct: React.Dispatch<React.SetStateAction<any | null>>;
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
        // Suppose we get an array of subCategories
        const subCategories: ISubCategory[] = subCategoryData || [];
        if (subCategories.length === 0) {
          return <p>No subcategories found.</p>;
        }
        return (
          <SubCategoryList
            subCategories={subCategories}
            tableConfig={tableConfig}
            refetchData={refetchData}
            setSelectedProduct={setSelectedProduct}
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
}: {
  subCategories: ISubCategory[];
  tableConfig: any;
  refetchData: () => void;
  setSelectedProduct: React.Dispatch<React.SetStateAction<any | null>>;
}) {
  const [productCountMap, setProductCountMap] = React.useState<{
    [subId: string]: number;
  }>({});

  React.useEffect(() => {
    if (subCategories.length === 0) return;

    const fetchProductCounts = async () => {
      const newMap: { [id: string]: number } = {};
      for (const sub of subCategories) {
        try {
          // Normal listing: GET /product?subCategory=sub._id
          const response = await getData(
            `${apiRoutesByRole["product"]}?subCategory=${sub._id}`
          );
          // Suppose we get { data: productArray }
          const products: IProduct[] = response?.data?.data || [];
          newMap[sub._id] = products.length;
        } catch (err) {
          console.error(
            "Failed to fetch products for subCategory",
            sub._id,
            err
          );
          newMap[sub._id] = 0;
        }
      }
      setProductCountMap(newMap);
    };

    fetchProductCounts();
  }, [subCategories]);

  return (
    <Accordion variant="shadow">
      {subCategories.map((sub) => {
        const productCount = productCountMap[sub._id] ?? "...";

        return (
          <AccordionItem
            key={sub._id}
            aria-label={sub.name}
            // e.g. "Citrus (5)"
            title={`${sub.name} (${productCount})`}
            className="opacity-90 hover:opacity-100 "
          >
            <p>{sub.description}</p>
            <Spacer y={1} />

            {/* If you want an AddModal for products */}
            {tableConfig["product"] && (
              <AddModal
                currentTable="Product"
                formFields={tableConfig["product"].filter(
                  (f: any) => f.key !== "subCategory"
                )}
                apiEndpoint={apiRoutesByRole["product"]}
                additionalVariable={{ subCategory: sub._id }}
                refetchData={refetchData}
              />
            )}

            <Spacer y={1} />
            {/* 3) On expand, fetch actual products for display */}
            <ProductSection
              subCategoryId={sub._id}
              setSelectedProduct={setSelectedProduct}
            />
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
}: {
  subCategoryId: string;
  setSelectedProduct: React.Dispatch<React.SetStateAction<any | null>>;
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
        const products: IProduct[] = productData?.data || [];
        if (products.length === 0) {
          return <p>No products found.</p>;
        }
        return (
          <div>
            {products.map((p) => (
              <div key={p._id}>
                <div className="flex justify-between my-2">
                  <b>{p.name}</b>
                  <Button
                    onPress={() => {
                      setSelectedProduct(p);
                    }}
                    size="sm"
                    color="primary"
                  >
                    View
                  </Button>
                </div>
                <Divider />
              </div>
            ))}
          </div>
        );
      }}
    </QueryComponent>
  );
}
