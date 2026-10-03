import { inventoryRoutes } from "@/core/api/apiRoutes";
import { fetchDependentOptions } from "@/utils/fetchDependentOptions";

export type InventoryTableField = {
  label: string;
  type: "text" | "select" | "number" | "action";
  key: string;
  inForm: boolean;
  inTable: boolean;
  required?: boolean;
  values?: Array<{ key: string; value: string }>;
  dependsOn?: string;
  showWhen?: { key: string; equals: string[] };
  dynamicValuesFn?: (...args: any[]) => Promise<any>;
};

export const inventoryApiEndpoint = inventoryRoutes.getAll;

export const inventoryTableFields: InventoryTableField[] = [
  { label: "Category", type: "select", key: "category", values: [], dynamicValuesFn: () => fetchDependentOptions("category"), inForm: true, inTable: false, required: true },
  { label: "Sub Category", type: "select", key: "subCategory", dependsOn: "category", values: [], dynamicValuesFn: (categoryId: string) => fetchDependentOptions("subCategory", "category", categoryId), inForm: true, inTable: false, required: true },
  { label: "Product", type: "select", key: "product", dependsOn: "subCategory", values: [], dynamicValuesFn: (subCategoryId: string) => fetchDependentOptions("product", "subCategory", subCategoryId), inForm: true, inTable: true, required: true },
  { label: "Product Variant", type: "select", key: "productVariant", dependsOn: "product", values: [], dynamicValuesFn: (productId: string) => fetchDependentOptions("productVariant", "product", productId), inForm: true, inTable: true, required: true },
  { label: "Quantity", type: "number", key: "quantity", inForm: true, inTable: true, required: true },
  { label: "Storage Location", type: "select", key: "storageLocation", values: [{ key: "NONE", value: "No Warehouse" }, { key: "PRIVATE", value: "Private Location" }, { key: "MY", value: "My Warehouse" }], inForm: true, inTable: false },
  { label: "Warehouse", type: "select", key: "warehouseId", dependsOn: "storageLocation", dynamicValuesFn: (value: string) => fetchDependentOptions("warehouse", undefined, undefined, String(value).toUpperCase() === "MY" ? { scope: "my" } : undefined), inForm: true, inTable: false, showWhen: { key: "storageLocation", equals: ["MY"] } },
  { label: "Warehouse Name", type: "text", key: "warehouseName", inForm: false, inTable: true },
  { label: "State", type: "select", key: "state", dynamicValuesFn: () => fetchDependentOptions("state"), inForm: true, inTable: false },
  { label: "District", type: "select", key: "district", dependsOn: "state", dynamicValuesFn: (stateId: string) => fetchDependentOptions("district", "state", stateId), inForm: true, inTable: false },
  { label: "Associate", type: "select", key: "associate", dynamicValuesFn: () => fetchDependentOptions("associate"), inForm: true, inTable: true, required: true },
  { label: "Actions", type: "action", key: "actions2", inForm: false, inTable: true },
];

export function getInventoryColumns(userRole?: string) {
  const role = String(userRole || "").toLowerCase();
  const columns: Array<{ name: string; uid: string; type?: string; maxWidth?: string }> = inventoryTableFields
    .filter((field) => field.inTable && field.type !== "select" && field.key !== "actions2")
    .map((field) => ({ name: field.label.toUpperCase(), uid: field.key, type: field.type }));

  columns.push({ name: "Product", uid: "product", maxWidth: "max-w-[240px]" });
  columns.push({ name: "Product Variant", uid: "productVariant", maxWidth: "max-w-[240px]" });
  if (role === "admin") columns.push({ name: "Associate", uid: "associate" });
  columns.push({ name: "ACTIONS", uid: "actions2", type: "action" });
  return columns;
}
