import { inventoriesSchema } from "../entities/inventories";
import { warehouseSchema } from "../entities/warehouse";
import type { TableSchemaRegistry } from "../../types";

export const inventoryTableSchemas: TableSchemaRegistry = {
  inventories: inventoriesSchema,
  warehouse: warehouseSchema,
};
