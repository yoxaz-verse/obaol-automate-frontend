import { fetchDependentOptions } from "../../../../utils/fetchDependentOptions";
import type { TableSchema } from "../../types";

export const inventoryManagerSchema = [
    {
      label: "Name",
      type: "text",
      key: "name",
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "Email",
      type: "email",
      key: "email",
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "Password",
      type: "password",
      key: "password",
      inForm: true,
      inTable: false,
      inEdit: false,
      required: true,
    },

    {
      label: "Admin",
      type: "select",
      key: "admin",
      values: [], // We'll populate this dynamically
      dynamicValuesFn: () => fetchDependentOptions("admin"),
      inEdit: true,
      inForm: true,
      inTable: false,
      required: true,
    },
    {
      label: "Last Seen",
      type: "dateTime",
      key: "lastSeenAt",
      inForm: false,
      inEdit: false,
      inTable: true,
      emptyValue: "Never",
    },
    {
      label: "Last Login",
      type: "dateTime",
      key: "lastLoginAt",
      inForm: false,
      inEdit: false,
      inTable: true,
      emptyValue: "Never",
    },
    {
      label: "Created At",
      type: "dateTime",
      key: "createdAt",
      inForm: false,
      inTable: true,
    },
    {
      label: "Actions",
      type: "action",
      key: "actions2",
      inForm: false,
      inTable: true,
    },
  ] satisfies TableSchema;
