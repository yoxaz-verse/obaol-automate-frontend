"use client";

import React, { useMemo } from "react";
import { Autocomplete, AutocompleteItem, Input } from "@nextui-org/react";
import { COMMON_DIAL_CODES, parsePhoneValue } from "@/utils/phone";

type PhoneFieldProps = {
  label: string;
  name: string;
  value?: any;
  countryCodeValue?: any;
  nationalValue?: any;
  disabled?: boolean;
  className?: string;
  onChange: (next: { e164: string; countryCode: string; national: string }) => void;
};

export default function PhoneField({
  label,
  name,
  value,
  countryCodeValue,
  nationalValue,
  disabled,
  className,
  onChange,
}: PhoneFieldProps) {
  const parsed = useMemo(
    () =>
      parsePhoneValue({
        raw: value,
        countryCode: countryCodeValue,
        national: nationalValue,
      }),
    [value, countryCodeValue, nationalValue]
  );

  return (
    <div className={`w-full ${className || ""}`}>
      <div className="mb-1.5 text-sm font-medium text-foreground/90">{label}</div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-[180px_minmax(0,1fr)]">
        <Autocomplete
          aria-label={`${label} country code`}
          size="sm"
          className="w-full"
          classNames={{
            base: "w-full",
            selectorButton: "text-default-500",
            listboxWrapper: "text-foreground",
            popoverContent: "bg-content1 text-foreground",
          }}
          defaultItems={COMMON_DIAL_CODES}
          selectedKey={parsed.countryCode || null}
          isDisabled={disabled}
          allowsCustomValue={false}
          placeholder="Country code"
          onSelectionChange={(keys) => {
            const selected = String(keys || "+91");
            onChange({
              countryCode: selected,
              national: parsed.national,
              e164: parsed.national ? `${selected}${parsed.national}` : "",
            });
          }}
        >
          {(item) => (
            <AutocompleteItem key={item.key} textValue={item.value}>
              {item.value}
            </AutocompleteItem>
          )}
        </Autocomplete>
        <div className="w-full">
          <Input
            aria-label={label}
            name={name}
            size="sm"
            type="tel"
            isDisabled={disabled}
            placeholder="Phone number"
            value={parsed.national}
            className="w-full"
            classNames={{
              inputWrapper: "bg-default-100/70",
              input: "text-foreground",
            }}
            onValueChange={(next) => {
              const national = String(next || "").replace(/\D/g, "");
              onChange({
                countryCode: parsed.countryCode || "+91",
                national,
                e164: national ? `${parsed.countryCode || "+91"}${national}` : "",
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
