import { usersTableSchemas } from "./users";
import { companyTableSchemas } from "./company";
import { catalogTableSchemas } from "./catalog";
import { tradeTableSchemas } from "./trade";
import { projectTableSchemas } from "./project";
import { activityTableSchemas } from "./activity";
import { inventoryTableSchemas } from "./inventory";
import type { TableSchemaRegistry } from "../types";

export const initialTableConfig: TableSchemaRegistry = {
  ...usersTableSchemas,
  ...companyTableSchemas,
  ...catalogTableSchemas,
  ...tradeTableSchemas,
  ...projectTableSchemas,
  ...activityTableSchemas,
  ...inventoryTableSchemas,
};
