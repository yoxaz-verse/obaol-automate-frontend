"use client";

import { useMemo, useState } from "react";
import { Button, Checkbox, Chip, Input, Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react";
import { FiChevronDown, FiSearch } from "react-icons/fi";

export type SearchableOption = { key: string; label: string; description?: string };

type Props = {
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
};

export default function SearchableSelect({ label, options, value, onChange, multiple = true, required, helperText, placeholder = "Search options", allowSelectAll = true, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => options.filter((option) => `${option.label} ${option.description || ""}`.toLowerCase().includes(search.trim().toLowerCase())), [options, search]);
  const selected = options.filter((option) => value.includes(option.key));
  const toggle = (key: string) => {
    if (!multiple) { onChange([key]); setOpen(false); return; }
    onChange(value.includes(key) ? value.filter((item) => item !== key) : [...value, key]);
  };

  return <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-default-700">{label}{required ? <span className="ml-1 text-danger">*</span> : null}</label>
    <Popover isOpen={open} onOpenChange={setOpen} placement="bottom-start" classNames={{ content: "w-[var(--trigger-width)] p-0" }}>
      <PopoverTrigger>
        <Button aria-label={label} isDisabled={disabled} variant="bordered" className="h-12 w-full justify-between border-default-300 bg-content1 px-3 font-normal" endContent={<FiChevronDown className="text-default-400" />}>
          <span className={selected.length ? "truncate text-foreground" : "truncate text-default-400"}>{selected.length ? (multiple && selected.length > 1 ? `${selected.length} selected` : selected[0].label) : `Select ${label.toLowerCase()}`}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="w-full p-2">
          <Input aria-label={`Search ${label}`} autoFocus value={search} onValueChange={setSearch} placeholder={placeholder} startContent={<FiSearch />} size="sm" variant="bordered" />
          {multiple && allowSelectAll && options.length ? <div className="mt-2 flex items-center justify-between border-b border-default-200 pb-2"><Button size="sm" variant="light" onPress={() => onChange(options.map((option) => option.key))}>Select all</Button><Button size="sm" variant="light" onPress={() => onChange([])}>Clear</Button></div> : null}
          <div className="max-h-64 overflow-y-auto py-1" role="listbox" aria-label={label} aria-multiselectable={multiple}>
            {filtered.length ? filtered.map((option) => <button key={option.key} type="button" role="option" aria-selected={value.includes(option.key)} onClick={() => toggle(option.key)} className="flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left hover:bg-default-100 focus:bg-default-100 focus:outline-none">
              {multiple ? <Checkbox isSelected={value.includes(option.key)} isReadOnly className="pointer-events-none" aria-label={option.label} /> : <span className={`mt-1 h-3 w-3 rounded-full border ${value.includes(option.key) ? "border-success-500 bg-success-500" : "border-default-400"}`} />}
              <span><span className="block text-sm font-medium">{option.label}</span>{option.description ? <span className="block text-xs text-default-500">{option.description}</span> : null}</span>
            </button>) : <div className="px-3 py-8 text-center text-sm text-default-500">No matching options</div>}
          </div>
        </div>
      </PopoverContent>
    </Popover>
    {multiple && selected.length ? <div className="flex flex-wrap gap-1">{selected.slice(0, 3).map((option) => <Chip key={option.key} size="sm" variant="flat" onClose={() => toggle(option.key)}>{option.label}</Chip>)}{selected.length > 3 ? <Chip size="sm" variant="flat">+{selected.length - 3}</Chip> : null}</div> : null}
    {helperText ? <p className="text-xs text-default-500">{helperText}</p> : null}
  </div>;
}
