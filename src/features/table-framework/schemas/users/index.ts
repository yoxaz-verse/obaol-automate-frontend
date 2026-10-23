import { adminSchema } from "../entities/admin";
import { operatorSchema } from "../entities/operator";
import { inventoryManagerSchema } from "../entities/inventoryManager";
import { associateSchema } from "../entities/associate";
import { workerSchema } from "../entities/worker";
import { designationSchema } from "../entities/designation";
import { jobRoleSchema } from "../entities/jobRole";
import { jobTypeSchema } from "../entities/jobType";
import { languageSchema } from "../entities/language";
import type { TableSchemaRegistry } from "../../types";

export const usersTableSchemas: TableSchemaRegistry = {
  admin: adminSchema,
  operator: operatorSchema,
  inventoryManager: inventoryManagerSchema,
  associate: associateSchema,
  worker: workerSchema,
  designation: designationSchema,
  jobRole: jobRoleSchema,
  jobType: jobTypeSchema,
  language: languageSchema,
};
