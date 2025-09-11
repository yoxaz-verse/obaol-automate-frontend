"use client";

import { useQuery } from "@tanstack/react-query";
import { Autocomplete, AutocompleteItem, Avatar } from "@heroui/react";
import { getData } from "@/core/api/apiHandler";
import { associateCompanyRoutes } from "@/core/api/apiRoutes";
import { ReactNode } from "react";

// 🔎 same icon you had
const SearchIcon = ({
  size = 24,
  strokeWidth = 1.5,
  ...props
}: {
  size?: number;
  strokeWidth?: number;
  [key: string]: any;
}) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height={size}
    role="presentation"
    viewBox="0 0 24 24"
    width={size}
    {...props}
  >
    <path
      d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
    />
    <path
      d="M22 22L20 20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
    />
  </svg>
);

interface Company {
  _id: string;
  name: string;
}

export default function CompanySearch({
  onSelect,
  defaultSelected,
  itemsFilter,
}: {
  onSelect?: (id: string | null) => void;
  defaultSelected?: string | null;
  itemsFilter?: (companies: Company[]) => Company[]; // allow filtering (e.g. onlyWithProducts)
}) {
  const { data: companyData, isLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: () => getData(associateCompanyRoutes.getAll, { limit: 10000 }),
  });

  let companies: Company[] = companyData?.data?.data?.data || [];
  if (itemsFilter) {
    companies = itemsFilter(companies);
  }

  if (isLoading) {
    return <div className="p-2 text-gray-500">Loading companies...</div>;
  }

  return (
    <Autocomplete
      aria-label="Select a company"
      defaultItems={companies}
      maxListboxHeight={400}
      itemHeight={60}
      placeholder="Search by company name"
      variant="bordered"
      radius="full"
      selectedKey={defaultSelected || undefined}
      className="text-warning-400 w-full max-w-md mb-6"
      classNames={{
        base: "max-w-full",
        listboxWrapper: "max-h-[320px]",
        selectorButton: "text-warning-500",
      }}
      startContent={
        <SearchIcon className="text-default-400" size={20} strokeWidth={2.5} />
      }
      inputProps={{
        classNames: {
          input: "ml-1",
          inputWrapper: "h-[48px]",
        },
      }}
      popoverProps={{
        offset: 10,
        classNames: {
          base: "rounded-large",
          content:
            "p-1 flex flex-col gap-2 border-small border-default-100 bg-background",
        },
      }}
      onSelectionChange={(key) => {
        if (onSelect) onSelect((key as string) ?? null);
      }}
    >
      {(item) => (
        <AutocompleteItem
          key={item._id}
          textValue={item.name}
          className="flex items-center gap-2 py-2"
        >
          <div className="flex items-center gap-2 py-2">
            <Avatar
              className="flex-shrink-0"
              size="sm"
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                item.name
              )}&background=random`}
            />
            <div className="text-small">{item.name}</div>
          </div>
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
}
