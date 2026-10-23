import { fetchDependentOptions } from "../../../../utils/fetchDependentOptions";
import type { TableSchema } from "../../types";

export const certificationSchema = [
    {
      label: "Name",
      type: "text",
      key: "name",
      inForm: true,
      inEdit: true,
      inTable: true,
      required: true,
    },
    {
      label: "Description",
      type: "textarea",
      key: "description",
      inForm: true,
      inEdit: true,
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
