import { fetchDependentOptions } from "../../../../utils/fetchDependentOptions";
import type { TableSchema } from "../../types";

export const workerSchema = [
    {
      label: "Worker Name",
      type: "text",
      key: "name",
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "Password",
      type: "password",
      key: "password",
      inForm: true,
      inEdit: false,
      inTable: false,
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
      label: "Skill",
      type: "text",
      key: "skill",
      inForm: true,
      inTable: true,
    },
    {
      label: "Service Company",
      type: "select",
      key: "serviceCompany",
      values: [], // We'll populate this dynamically
      inForm: true,
      inTable: true,
      inEdit: true,
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
      label: "Actions",
      type: "action",
      key: "actions2",
      inForm: false,
      inTable: true,
    },
  ] satisfies TableSchema;
