import { associateCompanySchema } from "../entities/associateCompany";
import { researchedCompanySchema } from "../entities/researchedCompany";
import { companyTypeSchema } from "../entities/companyType";
import { certificationSchema } from "../entities/certification";
import { companyBusinessModelSchema } from "../entities/companyBusinessModel";
import { companyFunctionSchema } from "../entities/companyFunction";
import { companySubFunctionSchema } from "../entities/companySubFunction";
import { generalIntentSchema } from "../entities/generalIntent";
import { subIntentSchema } from "../entities/subIntent";
import { companyStageSchema } from "../entities/companyStage";
import type { TableSchemaRegistry } from "../../types";

export const companyTableSchemas: TableSchemaRegistry = {
  associateCompany: associateCompanySchema,
  researchedCompany: researchedCompanySchema,
  companyType: companyTypeSchema,
  certification: certificationSchema,
  companyBusinessModel: companyBusinessModelSchema,
  companyFunction: companyFunctionSchema,
  companySubFunction: companySubFunctionSchema,
  generalIntent: generalIntentSchema,
  subIntent: subIntentSchema,
  companyStage: companyStageSchema,
};
