import { fetchDependentOptions } from "../../../../utils/fetchDependentOptions";
import type { TableSchema } from "../../types";

export const displayedRateSchema = [
    {
      label: "Product ",
      type: "text",
      key: "product",
      inForm: false,
      inTable: true,
    },
    {
      label: "Product Variant",
      type: "text",
      key: "productVariant",
      inForm: false,
      inTable: true,
      inEdit: true,
    },
    {
      label: "Rate (per KG)",
      type: "currency",
      key: "rate",
      inForm: true,
      inTable: true,
    },
    {
      label: "Quantity (MT)",
      type: "text",
      key: "quantity",
      inForm: false,
      inTable: true,
    },
    {
      label: "Live",
      type: "boolean",
      key: "isLive",
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
