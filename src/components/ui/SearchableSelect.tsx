"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Button, Checkbox, Chip, Input, Popover, PopoverContent, PopoverTrigger, Spinner } from "@nextui-org/react";
import { FiAlertCircle, FiChevronDown, FiRefreshCw, FiSearch } from "react-icons/fi";

export type SearchableOption = { key: string; label: string; description?: string; group?: string };

export type SearchableSelectProps = {
  label: string;
  options: SearchableOption[];
  value: string[];
  onChange: (value: string[]) => void;
  multiple?: boolean;
  required?: boolean;
  helperText?: string;
  placeholder?: string;
  allowSelectAll?: boolean;
  disabled?: boolean;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  onSearch?: (query: string) => void;
  searchDebounceMs?: number;
  searchValue?: string;
  onSearchValueChange?: (query: string) => void;
  maxVisibleOptions?: number;
};

export default function SearchableSelect({
  label,
  options,
  value,
  onChange,
  multiple = true,
  required,
  helperText,
  placeholder = "Search options",
  allowSelectAll = true,
  disabled,
  emptyActionLabel,
  onEmptyAction,
  loading = false,
  error,
  onRetry,
  onSearch,
  searchDebounceMs = 300,
  searchValue,
  onSearchValueChange,
  maxVisibleOptions = 200,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [internalSearch, setInternalSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [menuWidth, setMenuWidth] = useState<number>();
  const search = searchValue ?? internalSearch;
  const setSearch = (next: string) => { if (searchValue === undefined) setInternalSearch(next); onSearchValueChange?.(next); };

  const filtered = useMemo(
    () => options.filter((option) => `${option.label} ${option.description || ""}`.toLowerCase().includes(search.trim().toLowerCase())),
    [options, search]
  );
  const visibleOptions = filtered.slice(0, maxVisibleOptions);
  const selected = options.filter((option) => value.includes(option.key));

  const toggle = (key: string) => {
    if (!multiple) {
      if (value.length === 1 && value[0] === key) {
        setOpen(false);
        return;
      }
      onChange([key]);
      setOpen(false);
      return;
    }
    onChange(value.includes(key) ? value.filter((item) => item !== key) : [...value, key]);
  };

  const syncWidth = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const button = container.querySelector<HTMLButtonElement>("button");
    const width = button?.getBoundingClientRect().width || container.getBoundingClientRect().width;
    if (width && width > 0) {
      setMenuWidth(Math.round(width));
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    syncWidth();
    const button = container.querySelector<HTMLButtonElement>("button");
    const observer = new ResizeObserver(syncWidth);
    observer.observe(container);
    if (button) observer.observe(button);
    window.addEventListener("resize", syncWidth);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncWidth);
    };
  }, [syncWidth]);

  useEffect(() => {
    if (!open) setSearch("");
    else setActiveIndex(0);
    // setSearch is intentionally a controlled/uncontrolled bridge.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  useEffect(() => {
    if (!open || !onSearch) return;
    const timer = setTimeout(() => onSearch(search.trim()), searchDebounceMs);
    return () => clearTimeout(timer);
  }, [open, onSearch, search, searchDebounceMs]);

  return (
    <div ref={containerRef} className="w-full min-w-0 space-y-1.5">
      <label className="block text-xs font-semibold text-default-700">
        {label}
        {required ? <span className="ml-1 text-danger">*</span> : null}
      </label>
      {multiple && selected.length ? (
        <div className="flex flex-wrap gap-1">
          {selected.slice(0, 3).map((option) => (
            <Chip key={option.key} size="sm" variant="flat" onClose={disabled ? undefined : () => toggle(option.key)}>
              {option.label}
            </Chip>
          ))}
          {selected.length > 3 ? <Chip size="sm" variant="flat">+{selected.length - 3}</Chip> : null}
        </div>
      ) : null}
      <Popover
        isOpen={open}
        onOpenChange={(nextOpen) => {
          if (nextOpen) syncWidth();
          setOpen(nextOpen);
        }}
        placement="bottom-start"
        offset={6}
        shouldFlip
        style={menuWidth ? { width: `${menuWidth}px`, maxWidth: "calc(100vw - 24px)" } : undefined}
        classNames={{
          base: "!w-full max-w-[calc(100vw-24px)]",
          content: "!w-full p-0",
        }}
        motionProps={{ className: "w-full" }}
      >
        <PopoverTrigger>
          <Button
            aria-label={label}
            isDisabled={disabled}
            onMouseDown={syncWidth}
            onFocus={syncWidth}
            variant="bordered"
            className={`h-12 w-full justify-between rounded-xl border border-default-300 bg-content1 px-3 text-left font-normal transition-all aria-expanded:!scale-100 hover:border-default-400 dark:hover:border-default-500 ${
              open ? "border-success-500 ring-2 ring-success-500/20" : ""
            }`}
            endContent={
              <FiChevronDown
                className={`shrink-0 text-default-400 transition-transform duration-200 ${open ? "rotate-180 text-success-500" : ""}`}
              />
            }
          >
            <span className={selected.length ? "truncate text-foreground font-medium" : "truncate text-default-400"}>
              {selected.length
                ? multiple && selected.length > 1
                  ? `${selected.length} selected`
                  : selected[0].label
                : `Select ${label.toLowerCase()}`}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="z-[120] w-full overflow-hidden rounded-xl border border-default-200 bg-background p-0 shadow-2xl"
          style={{ width: menuWidth ? `${menuWidth}px` : undefined, maxWidth: "calc(100vw - 24px)" }}
        >
          <div
            className="w-full min-w-[280px] overflow-hidden p-2"
            style={menuWidth ? { width: `${menuWidth}px`, minWidth: `${menuWidth}px` } : undefined}
          >
            <Input
              aria-label={`Search ${label}`}
              autoFocus
              value={search}
              onValueChange={setSearch}
              placeholder={placeholder}
              startContent={<FiSearch className="text-default-400" />}
              size="sm"
              variant="bordered"
              classNames={{
                inputWrapper: "bg-content1 border-default-200 focus-within:!border-success-500 focus-within:!ring-1 focus-within:!ring-success-500/30",
                input: "text-xs",
              }}
            />
            {multiple && allowSelectAll && options.length ? (
              <div className="mt-2 flex items-center justify-between border-b border-default-200 pb-2">
                <Button size="sm" variant="light" onPress={() => onChange(options.map((option) => option.key))}>
                  Select all
                </Button>
                <Button size="sm" variant="light" onPress={() => onChange([])}>
                  Clear
                </Button>
              </div>
            ) : null}
            <div className="max-h-64 overflow-y-auto overscroll-contain py-1" role="listbox" aria-label={label} aria-multiselectable={multiple} aria-activedescendant={visibleOptions[activeIndex] ? `${label.replace(/\W+/g, "-").toLowerCase()}-${visibleOptions[activeIndex].key}` : undefined} tabIndex={0} onKeyDown={event => {
              if (!visibleOptions.length) return;
              if (event.key === "ArrowDown") { event.preventDefault(); setActiveIndex(index => Math.min(visibleOptions.length - 1, index + 1)); }
              else if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex(index => Math.max(0, index - 1)); }
              else if (event.key === "Home") { event.preventDefault(); setActiveIndex(0); }
              else if (event.key === "End") { event.preventDefault(); setActiveIndex(visibleOptions.length - 1); }
              else if (event.key === "Enter") { event.preventDefault(); toggle(visibleOptions[activeIndex].key); }
              else if (event.key === "Escape") { event.preventDefault(); setOpen(false); }
            }}>
              {loading ? <div className="flex items-center justify-center gap-2 px-3 py-8 text-sm text-default-500"><Spinner size="sm" />Loading options…</div> : error ? <div role="alert" className="px-3 py-6 text-center text-sm text-danger"><FiAlertCircle className="mx-auto mb-2" /><p>{error}</p>{onRetry ? <Button className="mt-3" size="sm" variant="flat" startContent={<FiRefreshCw />} onPress={onRetry}>Retry</Button> : null}</div> : visibleOptions.length ? (
                visibleOptions.map((option, index) => (
                  <div key={option.key}>
                  {option.group && (index === 0 || visibleOptions[index - 1]?.group !== option.group) ? <p className="px-2.5 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wide text-default-400">{option.group}</p> : null}
                  <button
                    id={`${label.replace(/\W+/g, "-").toLowerCase()}-${option.key}`}
                    type="button"
                    role="option"
                    aria-selected={value.includes(option.key)}
                    onClick={(event) => { event.stopPropagation(); toggle(option.key); }}
                    className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-default-100 focus:bg-default-100 focus:outline-none transition-colors ${activeIndex === index ? "bg-default-100" : ""}`}
                  >
                    {multiple ? (
                      <Checkbox isSelected={value.includes(option.key)} isReadOnly className="pointer-events-none" aria-label={option.label} />
                    ) : (
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                          value.includes(option.key) ? "border-success-500 bg-success-500 text-white" : "border-default-400"
                        }`}
                      >
                        {value.includes(option.key) && <span className="h-1.5 w-1.5 rounded-full bg-content1" />}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-sm ${value.includes(option.key) ? "font-semibold text-success-600 dark:text-success-400" : "font-medium text-foreground"}`}>
                        {option.label}
                      </span>
                      {option.description ? <span className="block truncate text-xs text-default-500">{option.description}</span> : null}
                    </span>
                  </button>
                  </div>
                ))
              ) : (
                <div className="px-3 py-6 text-center text-sm text-default-500">
                  <p>No matching options</p>
                  {onEmptyAction ? (
                    <Button
                      className="mt-3"
                      size="sm"
                      color="success"
                      variant="flat"
                      onPress={() => {
                        setOpen(false);
                        onEmptyAction();
                      }}
                    >
                      {emptyActionLabel || "Add option"}
                    </Button>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {helperText ? <p className="text-xs text-default-500">{helperText}</p> : null}
    </div>
  );
}
