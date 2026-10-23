import { fetchDependentOptions } from "../../../../utils/fetchDependentOptions";
import type { TableSchema } from "../../types";

export const inventoriesSchema = [
    {
      label: "Category",
      type: "select",
      key: "category",
      values: [],
      dynamicValuesFn: () => fetchDependentOptions("category"),
      inForm: true,
      inTable: false,
      required: true,
    },
    {
      label: "Sub Category",
      type: "select",
      key: "subCategory",
      dependsOn: "category",
      values: [],
      dynamicValuesFn: (categoryId: string) => fetchDependentOptions("subCategory", "category", categoryId),
      inForm: true,
      inTable: false,
      required: true,
    },
    {
      label: "Product",
      type: "select",
      key: "product",
      dependsOn: "subCategory",
      values: [],
      dynamicValuesFn: (subCategoryId: string) => fetchDependentOptions("product", "subCategory", subCategoryId),
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "Product Variant",
      type: "select",
      key: "productVariant",
      dependsOn: "product",
      values: [],
      dynamicValuesFn: (productId: string) => fetchDependentOptions("productVariant", "product", productId),
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "Quantity",
      type: "number",
      key: "quantity",
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "Storage Location",
      type: "select",
      key: "storageLocation",
      values: [
        { key: "NONE", value: "No Warehouse" },
        { key: "PRIVATE", value: "Private Location" },
        { key: "MY", value: "My Warehouse" },
      ],
      inForm: true,
      inTable: false,
    },
    {
      label: "Warehouse",
      type: "select",
      key: "warehouseId",
      dependsOn: "storageLocation",
      dynamicValuesFn: (storageLocation: string) => {
        const scope =
          String(storageLocation || "").toUpperCase() === "MY"
            ? "my"
            : "";
        return fetchDependentOptions("warehouse", undefined, undefined, scope ? { scope } : undefined);
      },
      inForm: true,
      inTable: false,
      showWhen: { key: "storageLocation", equals: ["MY"] },
    },
    {
      label: "Warehouse Name",
      type: "text",
      key: "warehouseName",
      inForm: false,
      inTable: true,
    },
    {
      label: "State",
      type: "select",
      key: "state",
      dynamicValuesFn: () => fetchDependentOptions("state"),
      inForm: true,
      inTable: false,
    },
    {
      label: "District",
      type: "select",
      key: "district",
      dependsOn: "state",
      dynamicValuesFn: (stateId: string) => fetchDependentOptions("district", "state", stateId),
      inForm: true,
      inTable: false,
    },
    {
      label: "Associate",
      type: "select",
      key: "associate",
      dynamicValuesFn: () => fetchDependentOptions("associate"),
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "Actions",
      type: "action",
      key: "actions2",
      inForm: false,
      inTable: true,
    },
  ] satisfies TableSchema;
