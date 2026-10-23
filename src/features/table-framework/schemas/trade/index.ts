import { incotermSchema } from "../entities/incoterm";
import { paymentTermSchema } from "../entities/paymentTerm";
import { commissionRuleSchema } from "../entities/commissionRule";
import { enquirySchema } from "../entities/enquiry";
import { enquiryProcessStatusSchema } from "../entities/enquiryProcessStatus";
import type { TableSchemaRegistry } from "../../types";

export const tradeTableSchemas: TableSchemaRegistry = {
  incoterm: incotermSchema,
  paymentTerm: paymentTermSchema,
  commissionRule: commissionRuleSchema,
  enquiry: enquirySchema,
  enquiryProcessStatus: enquiryProcessStatusSchema,
};
