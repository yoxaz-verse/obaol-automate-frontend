"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import { getData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

type OperatorOption = {
  id: string;
  name: string;
  email: string;
};

type AdminOperatorPickerProps = {
  selectedOperatorId: string;
  onSelectionChange: (operatorId: string) => void;
};

const extractList = (response: any): any[] => {
  const payload = response?.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const toOperatorOption = (row: any): OperatorOption | null => {
  const id = String(row?._id || row?.id || "").trim();
  if (!id) return null;
  return {
    id,
    name: String(row?.name || "").trim() || "Unnamed operator",
    email: String(row?.email || "").trim(),
  };
};

export default function AdminOperatorPicker({
  selectedOperatorId,
  onSelectionChange,
}: AdminOperatorPickerProps) {
  const [inputValue, setInputValue] = useState("");
  const [selectedOperator, setSelectedOperator] = useState<OperatorOption | null>(null);
  const hasAppliedInitialSelection = useRef(false);

  const searchValue = useMemo(() => {
    const trimmedInput = inputValue.trim();
    if (selectedOperator && trimmedInput === selectedOperator.name) return "";
    return trimmedInput;
  }, [inputValue, selectedOperator]);
  const debouncedSearch = useDebouncedValue(searchValue, 300);

  const operatorsQuery = useQuery({
    queryKey: ["admin-operator-picker", debouncedSearch],
    queryFn: async () =>
      getData(apiRoutes.operator.getAll, {
        page: 1,
        limit: 50,
        sort: "name:asc",
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      }),
    refetchOnWindowFocus: false,
  });

  const selectedOperatorQuery = useQuery({
    queryKey: ["admin-operator-picker", "selected", selectedOperatorId],
    queryFn: async () => getData(`${apiRoutes.operator.getAll}/${selectedOperatorId}`),
    enabled: Boolean(selectedOperatorId) && selectedOperator?.id !== selectedOperatorId,
    refetchOnWindowFocus: false,
  });

  const options = useMemo<OperatorOption[]>(() => {
    return extractList(operatorsQuery.data)
      .map(toOperatorOption)
      .filter((row): row is OperatorOption => Boolean(row));
  }, [operatorsQuery.data]);

  useEffect(() => {
    if (hasAppliedInitialSelection.current || operatorsQuery.isLoading || debouncedSearch) return;
    hasAppliedInitialSelection.current = true;

    if (!selectedOperatorId && options.length > 0) {
      const firstOperator = options[0];
      setSelectedOperator(firstOperator);
      setInputValue(firstOperator.name);
      onSelectionChange(firstOperator.id);
      return;
    }

  }, [debouncedSearch, onSelectionChange, operatorsQuery.isLoading, options, selectedOperatorId]);

  useEffect(() => {
    const selected = toOperatorOption(selectedOperatorQuery.data?.data?.data);
    if (!selected || selected.id !== selectedOperatorId) return;
    setSelectedOperator(selected);
    setInputValue(selected.name);
  }, [selectedOperatorId, selectedOperatorQuery.data]);

  const emptyContent = operatorsQuery.isError
    ? "Unable to load operators. Try again."
    : debouncedSearch
      ? "No operators match that name or email."
      : "No operators found.";

  return (
    <Autocomplete
      aria-label="Select operator"
      placeholder="Search by operator name or email"
      items={options}
      selectedKey={selectedOperatorId || null}
      inputValue={inputValue}
      onInputChange={setInputValue}
      onSelectionChange={(key) => {
        if (!key) return;
        const nextId = String(key);
        const option = options.find((item) => item.id === nextId);
        if (!option) return;

        setSelectedOperator(option);
        setInputValue(option.name);
        onSelectionChange(nextId);
      }}
      allowsCustomValue={false}
      isClearable={false}
      isLoading={operatorsQuery.isFetching}
      maxListboxHeight={360}
      menuTrigger="focus"
      listboxProps={{ emptyContent }}
      classNames={{ base: "w-full" }}
      inputProps={{
        classNames: {
          inputWrapper: "h-10 border border-default-300 bg-content1",
        },
      }}
      popoverProps={{
        classNames: {
          content: "border border-default-200 bg-content1",
        },
      }}
    >
      {(option) => (
        <AutocompleteItem key={option.id} textValue={`${option.name} ${option.email}`.trim()}>
          <div className="flex min-w-0 flex-col py-1">
            <span className="truncate text-sm font-medium text-foreground">{option.name}</span>
            <span className="truncate text-xs text-default-500">{option.email || "No email available"}</span>
          </div>
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
}
