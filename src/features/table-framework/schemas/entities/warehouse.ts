import { fetchDependentOptions } from "../../../../utils/fetchDependentOptions";
import type { TableSchema } from "../../types";

export const warehouseSchema = [
    {
      label: "Warehouse Name",
      type: "text",
      key: "name",
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "Category",
      type: "select",
      key: "category",
      values: [
        { key: "GENERAL", value: "General warehouse" },
        { key: "COLD_STORAGE", value: "Cold storage" },
        { key: "BONDED", value: "Bonded warehouse" },
        { key: "AGRO", value: "Agro warehouse" },
      ],
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "Address",
      type: "textarea",
      key: "address",
      inForm: true,
      inTable: false,
    },
    {
      label: "Storage Rate Per Unit",
      type: "number",
      key: "storageRatePerUnit",
      inForm: true,
      inTable: true,
      required: true,
    },
    {
      label: "Unit",
      type: "select",
      key: "unit",
      values: [
        { key: "MT", value: "MT" },
        { key: "KG", value: "KG" },
      ],
      inForm: true,
      inTable: true,
    },
    {
      label: "Listing Type",
      type: "select",
      key: "listingType",
      values: [
        { key: "PRIVATE", value: "Private" },
        { key: "RENTAL", value: "Rental" },
      ],
      inForm: true,
      inTable: true,
    },
    {
      label: "Rental Active",
      type: "boolean",
      key: "isRentalActive",
      inForm: true,
      inTable: true,
    },
    {
      label: "Active",
      type: "boolean",
      key: "isActive",
      inForm: true,
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
