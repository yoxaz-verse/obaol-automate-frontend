"use client";

import React, { useMemo } from "react";
import { Select, SelectItem, Input } from "@heroui/react";
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
      <div className="flex w-full flex-col gap-2 md:flex-row md:items-start">
        <Select
          aria-label={`${label} country code`}
          size="sm"
          className="w-full md:w-[68px]"
          classNames={{
            base: "w-full md:w-[68px]",
            trigger: "px-1.5 min-h-[32px] h-[32px] shadow-none bg-default-100/70", 
            value: "text-[11px] font-bold text-center",
            innerWrapper: "gap-0",
          }}
          selectedKeys={parsed.countryCode ? [parsed.countryCode] : []}
          isDisabled={disabled}
          placeholder="+91"
          onSelectionChange={(keys) => {
            const selected = String(Array.from(keys)[0] || "+91");
            onChange({
              countryCode: selected,
              national: parsed.national,
              e164: parsed.national ? `${selected}${parsed.national}` : "",
            });
          }}
          disallowEmptySelection
          selectionMode="single"
        >
          {COMMON_DIAL_CODES.map((item) => (
            <SelectItem key={item.key} textValue={item.key}>
              <span className="text-xs">{item.value}</span>
            </SelectItem>
          ))}
        </Select>
        <div className="w-full flex-1">
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
