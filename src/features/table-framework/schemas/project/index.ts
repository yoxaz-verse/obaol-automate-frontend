import { projectsSchema } from "../entities/projects";
import { projectTypeSchema } from "../entities/projectType";
import { projectStatusSchema } from "../entities/projectStatus";
import type { TableSchemaRegistry } from "../../types";

export const projectTableSchemas: TableSchemaRegistry = {
  projects: projectsSchema,
  projectType: projectTypeSchema,
  projectStatus: projectStatusSchema,
};
