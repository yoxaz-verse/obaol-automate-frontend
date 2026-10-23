import { fetchDependentOptions } from "../../../../utils/fetchDependentOptions";
import type { TableSchema } from "../../types";

export const categorySchema = [
    {
      label: "Category Name",
      type: "text",
      key: "name",
      inForm: true,
      inTable: true,
    },
    {
      label: "Description",
      type: "textarea",
      key: "description",
      inForm: true,
      inTable: false,
    },

    // {
    //   label: "Admin",
    //   type: "select",
    //   key: "admin",
    //   values: [],
    //   inForm: false,
    //   inTable: false,
    // },
    {
      label: "Inventory Manager",
      type: "select",
      key: "inventoryManager",
      values: [],
      dynamicValuesFn: () => fetchDependentOptions("inventoryManager"),
      inForm: true,
      inTable: false,
      required: true,
    },

    {
      label: "Created At",
      type: "text",
      key: "createdAt",
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
