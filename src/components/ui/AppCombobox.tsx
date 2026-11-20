"use client";

import SearchableSelect, { type SearchableSelectProps } from "./SearchableSelect";

type Props = Omit<SearchableSelectProps, "multiple" | "allowSelectAll"> & { value: string | null; onChange: (value: string | null) => void };

export default function AppCombobox({ value, onChange, ...props }: Props) {
  return <SearchableSelect {...props} multiple={false} allowSelectAll={false} value={value ? [value] : []} onChange={values => onChange(values[0] || null)} />;
}
