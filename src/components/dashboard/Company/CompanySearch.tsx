"use client";

import { useQuery } from "@tanstack/react-query";
import { Autocomplete, AutocompleteItem, Avatar } from "@heroui/react";
import { getData } from "@/core/api/apiHandler";
import { associateCompanyRoutes } from "@/core/api/apiRoutes";
import InlineLoader from "@/components/ui/InlineLoader";
import { useEffect, useMemo, useState } from "react";

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
  const [inputValue, setInputValue] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | null>(
    defaultSelected ?? null
  );

  const { data: companyData, isLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: () => getData(associateCompanyRoutes.getAll, { page: 1, limit: 500 }),
  });

  const rawCompanies = Array.isArray(companyData?.data?.data?.data)
    ? companyData?.data?.data?.data
    : Array.isArray(companyData?.data?.data?.data?.data)
      ? companyData?.data?.data?.data?.data
      : Array.isArray(companyData?.data?.data)
        ? companyData?.data?.data
        : Array.isArray(companyData?.data)
          ? companyData?.data
          : [];
  let companies: Company[] = rawCompanies || [];
  if (itemsFilter) {
    companies = itemsFilter(companies);
  }

  const filteredCompanies = useMemo(() => {
    const needle = inputValue.trim().toLowerCase();
    if (!needle) return companies;
    return companies.filter((company) =>
      String(company.name || "").toLowerCase().includes(needle)
    );
  }, [companies, inputValue]);

  useEffect(() => {
    if (defaultSelected === undefined) return;
    setSelectedKey(defaultSelected ?? null);
  }, [defaultSelected]);

  useEffect(() => {
    if (!selectedKey) return;
    const match = companies.find((c) => String(c._id) === String(selectedKey));
    if (match) {
      setInputValue(match.name || "");
    }
  }, [selectedKey, companies]);

  if (isLoading) {
    return (
      <div className="px-1 py-2">
        <InlineLoader message="Loading companies" />
      </div>
    );
  }

  const AutocompleteAny = Autocomplete as any;

  return (
    <AutocompleteAny
      aria-label="Select a company"
      items={filteredCompanies}
      maxListboxHeight={400}
      itemHeight={60}
      placeholder="Search by company name"
      variant="bordered"
      radius="full"
      selectedKey={selectedKey || undefined}
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
      inputValue={inputValue}
      onInputChange={(value: string) => {
        setInputValue(value);
        if (selectedKey) {
          const match = companies.find((c) => String(c._id) === String(selectedKey));
          if (match && value.trim() !== match.name) {
            setSelectedKey(null);
          }
        }
      }}
      popoverProps={{
        offset: 10,
        classNames: {
          base: "rounded-large",
          content:
            "p-1 flex flex-col gap-2 border-small border-default-100 bg-background",
        },
      }}
      onSelectionChange={(key: any) => {
        const nextKey = (key as string) ?? null;
        setSelectedKey(nextKey);
        const match = companies.find((c) => String(c._id) === String(nextKey));
        if (match) setInputValue(match.name || "");
        if (onSelect) onSelect(nextKey);
      }}
    >
      {(item: any) => (
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
    </AutocompleteAny>
  );
}
