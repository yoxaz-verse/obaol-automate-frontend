import { fetchDependentOptions } from "../../../../utils/fetchDependentOptions";
import type { TableSchema } from "../../types";

export const activityStatusSchema = [
    {
      label: "Name",
      type: "text",
      key: "name",
      inForm: true,
      inTable: true,
      required: true,
    },

    {
      label: "Created At",
      type: "dateTime",
      key: "createdAt",
      inForm: false,
      inTable: true,
    },
    // {
    //   label: "Active",
    //   type: "checkbox",
    //   key: "isActive",
    //   inForm: false,
    //   inTable: true,
    // },
    {
      label: "Actions",
      type: "action",
      key: "actions2",
      inForm: false,
      inTable: true,
    },
  ] satisfies TableSchema;
