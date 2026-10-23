import { activitySchema } from "../entities/activity";
import { activityStatusSchema } from "../entities/activityStatus";
import { activityTypeSchema } from "../entities/activityType";
import { timeSheetSchema } from "../entities/timeSheet";
import { statusHistorySchema } from "../entities/statusHistory";
import type { TableSchemaRegistry } from "../../types";

export const activityTableSchemas: TableSchemaRegistry = {
  activity: activitySchema,
  activityStatus: activityStatusSchema,
  activityType: activityTypeSchema,
  timeSheet: timeSheetSchema,
  statusHistory: statusHistorySchema,
};
