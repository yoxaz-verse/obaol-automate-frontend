export type TableFieldType =
  | "text" | "select" | "multiselect" | "multiselectValue" | "file" | "textarea"
  | "boolean" | "image" | "action" | "email" | "date" | "number" | "currency"
  | "time" | "multiTime" | "multiTimeRange" | "link" | "dateTime" | "password"
  | "week" | "switch" | "paymentMilestones";

export type TableFilterType = "text" | "select" | "multiselect" | "boolean" | "date" | "range";

export type TableOption = { key: string; value: string };
export type DynamicValuesLoader = (dependencyId?: string) => Promise<TableOption[]>;

export type TableField = {
  label: string;
  type: TableFieldType;
  filterType?: TableFilterType;
  key: string;
  inForm: boolean;
  inTable: boolean;
  dynamicValuesFn?: DynamicValuesLoader;
  inEdit?: boolean;
  dependsOn?: string;
  values?: TableOption[];
  placeholder?: string;
  accept?: string;
  required?: boolean;
  emptyValue?: string;
  showWhen?: { key: string; equals: string | number | boolean | Array<string | number | boolean> };
};

export type TableSchema = TableField[];
export type TableSchemaRegistry = Record<string, TableSchema>;

export type GeneratedColumn = {
  name: string;
  uid: string;
  type?: TableFieldType;
  emptyValue?: string;
  values?: TableOption[];
  maxWidth?: string;
};
