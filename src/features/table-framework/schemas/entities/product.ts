import { fetchDependentOptions } from "../../../../utils/fetchDependentOptions";
import type { TableSchema } from "../../types";

export const productSchema = [
    {
      label: "Product Name",
      type: "text",
      key: "name",
      inForm: true,
      inTable: false,
      inEdit: true,
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
      label: "Sub Category",
      type: "select",
      filterType: "multiselect",
      key: "subCategory",
      dependsOn: "category",
      values: [],
      dynamicValuesFn: (categoryId: string) => fetchDependentOptions("subCategory", "category", categoryId),
      inForm: true,
      inTable: true,
      inEdit: true,
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
