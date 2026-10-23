import { fetchDependentOptions } from "../../../../utils/fetchDependentOptions";
import type { TableSchema } from "../../types";

export const timeSheetSchema = [
    {
      label: "Activity",
      type: "select",
      key: "activity",
      values: [],
      inForm: false,
      inTable: true,
    },
    {
      label: "Note",
      type: "textarea",
      key: "note",
      inForm: true,
      inTable: true,
    },
    // {
    //   label: "Created By",
    //   type: "text",
    //   key: "createdBy",
    //   inForm: false,
    //   inTable: true,
    // },
    {
      label: "Role",
      type: "text",
      key: "createdByRole",
      inForm: false,
      inTable: true,
    },
    {
      label: "Date",
      type: "date",
      key: "date",
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "Start Time",
      type: "time",
      key: "startTime",
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "End Time",
      type: "time",
      key: "endTime",
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
    {
      label: "Updated At",
      type: "dateTime",
      key: "updatedAt",
      inForm: false,
      inTable: false,
    },

    {
      label: "Actions",
      type: "action",
      key: "actions2",
      inForm: false,
      inTable: true,
    },
  ] satisfies TableSchema;
