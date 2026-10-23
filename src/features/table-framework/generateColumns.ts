import type { GeneratedColumn, TableSchemaRegistry } from "./types";

export const generateColumns = (
  currentTable: string,
  tableConfig: TableSchemaRegistry,
  userRole?: string,
): GeneratedColumn[] => {
  const role = String(userRole || "").toLowerCase();
  const fields = tableConfig[currentTable] || [];
  let columns: GeneratedColumn[] = fields
    .filter((field) => field.inTable && field.type !== "select" && field.key !== "actions2")
    .filter((field) => role === "admin"
      || !["commission", "finalRate"].includes(field.key)
      || (currentTable === "catalogItem" && field.key === "commission"))
    .map((field) => ({
      name: field.label.toUpperCase(), uid: field.key, type: field.type,
      emptyValue: field.emptyValue, values: field.values,
    }));

  if (currentTable === "associate") {
    columns.push({ name: "COMPANY", uid: "associateCompany" }, { name: "DESIGNATION", uid: "designation" });
  }
  if (["admin", "inventoryManager", "associate", "operator"].includes(currentTable)) {
    const order = currentTable === "associate"
      ? ["associateCompany", "lastSeenAt", "lastLoginAt", "createdAt"]
      : ["lastSeenAt", "lastLoginAt", "createdAt"];
    const trailing = order.map((uid) => columns.find((column) => column.uid === uid)).filter((value): value is GeneratedColumn => Boolean(value));
    columns = [...columns.filter((column) => !order.includes(column.uid)), ...trailing];
  }
  if (currentTable === "associateCompany") columns.push({ name: "LOCATION", uid: "location" });
  else if (currentTable === "projects") columns.push(
    { name: "Project Manager", uid: "projectManagerName" }, { name: "ProjectStatus", uid: "projectStatus" },
    { name: "Project Type", uid: "projectType" }, { name: "Location", uid: "location" },
  );
  else if (currentTable === "activity") columns.push(
    { name: "Activity Manager", uid: "activityManagerName" }, { name: "Activity Status", uid: "activityStatus" },
    { name: "Activity Type", uid: "activityType" },
  );
  else if (currentTable === "variantRate") {
    if (role === "admin") columns.push({ name: "Associate", uid: "associate" });
    columns.push({ name: "Product", uid: "productVariant", maxWidth: "max-w-[260px]" }, { name: "Type", uid: "classification", maxWidth: "max-w-[240px]" });
  } else if (currentTable === "displayedRate" || currentTable === "catalogItem") {
    if (role !== "associate") columns.push({ name: "Associate", uid: "associate" });
    columns.push({ name: "Product", uid: "product" }, { name: "Type", uid: "classification", maxWidth: "max-w-[240px]" });
  } else if (["projectManager", "activityManager"].includes(currentTable)) columns.push({ name: "ADMIN", uid: "admin" });
  else if (currentTable === "inventories") {
    columns.push({ name: "Product", uid: "product", maxWidth: "max-w-[240px]" }, { name: "Product Variant", uid: "productVariant", maxWidth: "max-w-[240px]" });
    if (role === "admin") columns.push({ name: "Associate", uid: "associate" });
  }

  const action = fields.find((field) => field.type === "action" && field.inTable);
  if (action) columns.push({ name: action.label.toUpperCase(), uid: action.key, type: action.type });
  return columns;
};
