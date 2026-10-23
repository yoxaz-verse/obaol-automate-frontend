import { fetchDependentOptions } from "../../../../utils/fetchDependentOptions";
import type { TableSchema } from "../../types";

export const statusHistorySchema = [
    {
      label: "Changed Role",
      type: "text",
      key: "changedRole",
      inForm: false,
      inTable: true,
      inEdit: false,
    },
    {
      label: "New Status",
      type: "text",
      key: "newStatus",
      inForm: false,
      inTable: true,
      inEdit: false,
    },
    {
      label: "Changed By",
      type: "text",
      key: "changedBy",
      inForm: false,
      inTable: true,
      inEdit: false,
    },
    {
      label: "Change Type",
      type: "text",
      key: "changeType",
      inForm: false,
      inTable: true,
      inEdit: false,
    },
    {
      label: "Changed Fields",
      type: "text",
      key: "changedFields",
      inForm: false,
      inTable: true,
      inEdit: false,
    },
    {
      label: "Changed At",
      type: "dateTime",
      key: "changedAt",
      inForm: false,
      inTable: true,
    },
  ] satisfies TableSchema;
