"use client";

import { useQuery } from "@tanstack/react-query";
import { Autocomplete, AutocompleteItem, Avatar, Spinner } from "@heroui/react";
import { getData } from "@/core/api/apiHandler";
import { associateCompanyRoutes } from "@/core/api/apiRoutes";
import { useEffect, useMemo, useRef, useState } from "react";

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
  email?: string;
  phone?: string;
  website?: string;
  slug?: string;
  subdomain?: string;
  customDomain?: string;
}

export default function CompanySearch({
  onSelect,
  onSelectCompany,
  defaultSelected,
  itemsFilter,
  onSearchChange,
  isDisabled,
  queryParams,
}: {
  onSelect?: (id: string | null) => void;
  onSelectCompany?: (company: Company | null) => void;
  defaultSelected?: string | null;
  itemsFilter?: (companies: Company[]) => Company[]; // allow filtering (e.g. onlyWithProducts)
  onSearchChange?: (value: string) => void;
  isDisabled?: boolean;
  queryParams?: Record<string, any>;
}) {
  const [inputValue, setInputValue] = useState("");
  const [debouncedInputValue, setDebouncedInputValue] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | null>(
    defaultSelected ?? null
  );
  const userSelectedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInputValue(inputValue.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const querySearch = debouncedInputValue;

  const requestParams = {
    page: 1,
    limit: 50,
    view: "picker",
    ...(queryParams || {}),
    ...(querySearch ? { search: querySearch } : {}),
  };

  const { data: companyData, isLoading, isFetching } = useQuery({
    queryKey: ["companies", requestParams],
    queryFn: () => getData(associateCompanyRoutes.getAll, requestParams),
  });

  const companies = useMemo(() => {
    const rawCompanies = Array.isArray(companyData?.data?.data?.data)
      ? companyData?.data?.data?.data
      : Array.isArray(companyData?.data?.data?.data?.data)
        ? companyData?.data?.data?.data?.data
        : Array.isArray(companyData?.data?.data)
          ? companyData?.data?.data
          : Array.isArray(companyData?.data)
            ? companyData?.data
            : [];
    const nextCompanies: Company[] = rawCompanies || [];
    return itemsFilter ? itemsFilter(nextCompanies) : nextCompanies;
  }, [companyData, itemsFilter]);

  useEffect(() => {
    if (defaultSelected === undefined) return;
    const nextKey = defaultSelected ?? null;
    setSelectedKey(nextKey);
    userSelectedKeyRef.current = nextKey;
    if (!nextKey) {
      setInputValue("");
      if (onSelectCompany) onSelectCompany(null);
      return;
    }
    const match = companies.find((c) => String(c._id) === String(nextKey));
    if (match) {
      setInputValue(match.name || "");
      if (onSelectCompany) onSelectCompany(match);
    }
  }, [companies, defaultSelected, onSelectCompany]);

  const AutocompleteAny = Autocomplete as any;
  const isBusy = isLoading || isFetching;

  return (
    <div className="w-full max-w-md mb-6">
      <AutocompleteAny
        aria-label="Select a company"
        items={companies}
        maxListboxHeight={400}
        itemHeight={60}
        placeholder={isBusy ? "Loading company options..." : "Search by company name"}
        variant="bordered"
        radius="full"
        selectedKey={selectedKey || undefined}
        isClearable
        isDisabled={isDisabled || (isLoading && companies.length === 0)}
        className="text-warning-400 w-full"
        classNames={{
          base: "max-w-full",
          listboxWrapper: "max-h-[320px]",
          selectorButton: "text-warning-500",
        }}
        startContent={
          <SearchIcon className="text-default-400" size={20} strokeWidth={2.5} />
        }
        endContent={isBusy ? <Spinner {...({ size: "sm", color: "warning" } as any)} /> : null}
        inputProps={{
          classNames: {
            input: "ml-1",
            inputWrapper: "h-[48px]",
          },
        }}
        inputValue={inputValue}
        onInputChange={(value: string) => {
          const nextValue = String(value || "");
          const trimmed = nextValue.trim();
          setInputValue(value);
          if (onSearchChange) onSearchChange(value);

          if (!trimmed) {
            setSelectedKey(null);
            userSelectedKeyRef.current = null;
            if (onSelect) onSelect(null);
            if (onSelectCompany) onSelectCompany(null);
            return;
          }

          if (selectedKey) {
            const selected = companies.find((c) => String(c._id) === String(selectedKey));
            if (selected && trimmed.toLowerCase() !== (selected.name || "").toLowerCase()) {
              setSelectedKey(null);
              userSelectedKeyRef.current = null;
              if (onSelect) onSelect(null);
              if (onSelectCompany) onSelectCompany(null);
            }
          }
        }}
        onClear={() => {
          setInputValue("");
          setSelectedKey(null);
          userSelectedKeyRef.current = null;
          if (onSearchChange) onSearchChange("");
          if (onSelect) onSelect(null);
          if (onSelectCompany) onSelectCompany(null);
        }}
        onSelectionChange={(key: any) => {
          if (!key) {
             setSelectedKey(null);
             userSelectedKeyRef.current = null;
             if (onSelect) onSelect(null);
             if (onSelectCompany) onSelectCompany(null);
             return;
          }

          const nextKey = String(key);
          setSelectedKey(nextKey);
          userSelectedKeyRef.current = nextKey;

          const match = companies.find((c) => String(c._id) === nextKey);
          if (match) {
            setInputValue(match.name || "");
            if (onSearchChange) onSearchChange(match.name || "");
            if (onSelectCompany) onSelectCompany(match);
          }
          if (onSelect) onSelect(nextKey);
        }}
        popoverProps={{
          offset: 10,
          classNames: {
            base: "rounded-large",
            content:
              "p-1 flex flex-col gap-2 border-small border-default-100 bg-background",
          },
        }}
        allowsCustomValue={true}
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
      <div className="mt-2 px-2 text-[11px] text-default-400">
        {isBusy ? "Updating company options..." : `${companies.length} company option${companies.length === 1 ? "" : "s"} available`}
      </div>
    </div>
  );
}
