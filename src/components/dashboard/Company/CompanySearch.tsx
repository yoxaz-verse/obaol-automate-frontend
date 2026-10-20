"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Autocomplete, AutocompleteItem, Avatar, Button, Spinner } from "@nextui-org/react";
import { getData } from "@/core/api/apiHandler";
import { associateCompanyRoutes } from "@/core/api/apiRoutes";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getNextCompanySearchPage,
  mergeCompanySearchPages,
  parseCompanySearchPage,
} from "./companySearchUtils";

const SEARCH_MIN_LENGTH = 2;
const SEARCH_PAGE_SIZE = 50;

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
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLElement | null>(null);
  const userSelectedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInputValue(inputValue.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const querySearch = debouncedInputValue.trim();
  const searchEnabled = querySearch.length >= SEARCH_MIN_LENGTH;

  const companyQuery = useInfiniteQuery({
    queryKey: ["companies", "search", queryParams || {}, querySearch],
    initialPageParam: 1,
    enabled: searchEnabled,
    queryFn: async ({ pageParam, signal }) => {
      const response = await getData(
        associateCompanyRoutes.getAll,
        {
          ...(queryParams || {}),
          page: pageParam,
          limit: SEARCH_PAGE_SIZE,
          view: "picker",
          search: querySearch,
        },
        { signal },
      );
      return parseCompanySearchPage<Company>(response);
    },
    getNextPageParam: getNextCompanySearchPage,
  });

  const selectedCompanyQuery = useQuery({
    queryKey: ["companies", "selected", queryParams || {}, defaultSelected],
    enabled: Boolean(defaultSelected),
    queryFn: async ({ signal }) => {
      const response = await getData(
        associateCompanyRoutes.getAll,
        {
          ...(queryParams || {}),
          page: 1,
          limit: 1,
          view: "picker",
          _id: defaultSelected,
        },
        { signal },
      );
      return parseCompanySearchPage<Company>(response).companies[0] || null;
    },
  });

  const companies = useMemo(() => {
    const pages = companyQuery.data?.pages || [];
    const nextCompanies = mergeCompanySearchPages<Company>(pages);
    const selectedCompany = selectedCompanyQuery.data;
    if (selectedCompany && !nextCompanies.some((company) => company._id === selectedCompany._id)) {
      nextCompanies.push(selectedCompany);
      nextCompanies.sort((left, right) => left.name.localeCompare(right.name, undefined, { sensitivity: "base" }));
    }
    return itemsFilter ? itemsFilter(nextCompanies) : nextCompanies;
  }, [companyQuery.data?.pages, itemsFilter, selectedCompanyQuery.data]);

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

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!isOpen || !scrollElement || !searchEnabled) return;

    const onScroll = () => {
      const distanceFromBottom =
        scrollElement.scrollHeight - scrollElement.scrollTop - scrollElement.clientHeight;
      if (
        distanceFromBottom <= 80 &&
        companyQuery.hasNextPage &&
        !companyQuery.isFetchingNextPage
      ) {
        void companyQuery.fetchNextPage();
      }
    };

    scrollElement.addEventListener("scroll", onScroll, { passive: true });
    return () => scrollElement.removeEventListener("scroll", onScroll);
  }, [
    companyQuery.fetchNextPage,
    companyQuery.hasNextPage,
    companyQuery.isFetchingNextPage,
    isOpen,
    searchEnabled,
  ]);

  const AutocompleteAny = Autocomplete as any;
  const isInitialLoading = companyQuery.isLoading || companyQuery.isFetching;
  const isLoadingMore = companyQuery.isFetchingNextPage;
  const isBusy = isInitialLoading || isLoadingMore;
  const emptyContent = !searchEnabled
    ? `Type at least ${SEARCH_MIN_LENGTH} characters to search.`
    : companyQuery.isError
      ? (
        <div className="flex flex-col items-center gap-2 py-2">
          <span>Unable to search companies.</span>
          <Button size="sm" variant="flat" onPress={() => companyQuery.refetch()}>
            Try again
          </Button>
        </div>
      )
      : isInitialLoading
        ? "Searching companies..."
        : "No matching companies found.";

  return (
    <div className="w-full max-w-md mb-6">
      <AutocompleteAny
        aria-label="Select a company"
        items={companies}
        scrollRef={scrollRef}
        maxListboxHeight={400}
        itemHeight={60}
        placeholder="Search by company name"
        variant="bordered"
        radius="full"
        selectedKey={selectedKey || undefined}
        onOpenChange={setIsOpen}
        isClearable
        isDisabled={isDisabled}
        className="text-obaol-400 w-full"
        classNames={{
          base: "max-w-full",
          listboxWrapper: "max-h-[320px]",
          selectorButton: "text-obaol-500",
        }}
        startContent={
          <SearchIcon className="text-default-400" size={20} strokeWidth={2.5} />
        }
        endContent={isBusy ? <Spinner {...({ size: "sm", color: "warning" } as any)} /> : null}
        listboxProps={{
          emptyContent,
          bottomContent: isLoadingMore ? (
            <div className="flex justify-center py-2">
              <Spinner size="sm" color="warning" />
            </div>
          ) : null,
        }}
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
        {!searchEnabled
          ? `Type at least ${SEARCH_MIN_LENGTH} characters to search companies`
          : companyQuery.isError
            ? "Company search failed. Try again."
            : isLoadingMore
              ? "Loading more company options..."
              : isInitialLoading
                ? "Searching companies..."
                : `${companies.length} company option${companies.length === 1 ? "" : "s"} loaded${companyQuery.hasNextPage ? " · scroll for more" : ""}`}
      </div>
    </div>
  );
}
