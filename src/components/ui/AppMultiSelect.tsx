"use client";

import SearchableSelect, { type SearchableSelectProps } from "./SearchableSelect";

type Props = Omit<SearchableSelectProps, "multiple">;

export default function AppMultiSelect(props: Props) {
  return <SearchableSelect {...props} multiple />;
}
