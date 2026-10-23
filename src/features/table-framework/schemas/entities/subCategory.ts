import { fetchDependentOptions } from "../../../../utils/fetchDependentOptions";
import type { TableSchema } from "../../types";

export const subCategorySchema = [
    {
      label: "Sub Category Name",
      type: "text",
      key: "name",
      inForm: true,
      inEdit: true,
      inTable: false,
      required: true,
    },
    {
      label: "Description",
      type: "textarea",
      key: "description",
      inForm: true,
      inTable: false,
      inEdit: true,
      required: true,
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
      label: "Category",
      type: "select",
      filterType: "multiselect",
      key: "category",
      values: [],
      dynamicValuesFn: () => fetchDependentOptions("category"),
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
