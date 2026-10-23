import { categorySchema } from "../entities/category";
import { subCategorySchema } from "../entities/subCategory";
import { productSchema } from "../entities/product";
import { productVariantSchema } from "../entities/productVariant";
import { variantRateSchema } from "../entities/variantRate";
import { displayedRateSchema } from "../entities/displayedRate";
import { catalogItemSchema } from "../entities/catalogItem";
import type { TableSchemaRegistry } from "../../types";

export const catalogTableSchemas: TableSchemaRegistry = {
  category: categorySchema,
  subCategory: subCategorySchema,
  product: productSchema,
  productVariant: productVariantSchema,
  variantRate: variantRateSchema,
  displayedRate: displayedRateSchema,
  catalogItem: catalogItemSchema,
};
