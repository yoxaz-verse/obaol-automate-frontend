"use client";

import React, { useMemo } from "react";
import { Autocomplete, AutocompleteItem, Input } from "@heroui/react";
import { COMMON_DIAL_CODES, parsePhoneValue, normalizeDialCode } from "@/utils/phone";

type PhoneFieldProps = {
  label: string;
  name: string;
  value?: any;
  countryCodeValue?: any;
  nationalValue?: any;
  disabled?: boolean;
  className?: string;
  isInvalid?: boolean;
  errorMessage?: string;
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
  isInvalid,
  errorMessage,
  onChange,
}: PhoneFieldProps) {
  const AutocompleteAny = Autocomplete as any;
  const AutocompleteItemAny = AutocompleteItem as any;

  const allowedDialCodes = useMemo(() => new Set(COMMON_DIAL_CODES.map((item) => item.key)), []);
  const normalizedCountryCode = normalizeDialCode(countryCodeValue);
  const hasValidCountryCode = allowedDialCodes.has(normalizedCountryCode);

  const parsed = useMemo(
    () =>
      parsePhoneValue({
        raw: value,
        countryCode: hasValidCountryCode ? normalizedCountryCode : undefined,
        national: nationalValue,
        fallbackCountryCode: "+91",
      }),
    [value, hasValidCountryCode, normalizedCountryCode, nationalValue]
  );

  return (
    <div className={`w-full ${className || ""}`}>
      {label && <div className="mb-1.5 px-2 text-[10px] font-black uppercase tracking-widest text-default-400">{label}</div>}
      <div className="flex w-full flex-row gap-0 items-center overflow-hidden">
        <AutocompleteAny
          aria-label={`${label} country code`}
          size="sm"
          className="w-[100px] shrink-0"
          variant="light"
          classNames={{
            base: "w-[100px] shrink-0",
            listboxWrapper: "max-h-[300px]",
          }}
          inputProps={{
            autoComplete: "off",
            classNames: {
              inputWrapper: "shadow-none bg-transparent border-none min-h-[44px] h-[44px] px-3 ring-0 outline-none data-[focus=true]:bg-warning-500/5 group-data-[focus=true]:border-none shadow-none",
              input: "text-xs font-black tracking-widest selection:bg-warning-500/20 selection:text-warning-600 outline-none ring-0",
            }
          }}
          disabledKeys={[]}
          defaultSelectedKey={hasValidCountryCode ? normalizedCountryCode : "+91"}
          onSelectionChange={(key: any) => {
            const selected = String(key || "+91");
            onChange({
              countryCode: selected,
              national: parsed.national,
              e164: parsed.national ? `${selected}${parsed.national}` : "",
            });
          }}
          isClearable={false}
          allowsCustomValue={false}
        >
          {COMMON_DIAL_CODES.map((item) => (
            <AutocompleteItemAny key={item.key} textValue={item.key}>
              <div className="flex items-center justify-between gap-2 w-full">
                <span className="text-xs font-bold font-mono">{item.key}</span>
                <span className="text-[10px] text-default-400 truncate">{item.value.split(" ").slice(1).join(" ")}</span>
              </div>
            </AutocompleteItemAny>
          ))}
        </AutocompleteAny>

        <div className="w-px h-6 bg-default-200 shrink-0" />

        <div className="flex-1">
          <Input
            aria-label={label}
            name={name}
            size="md"
            type="tel"
            variant="light"
            isDisabled={disabled}
            isInvalid={isInvalid}
            placeholder="Phone number"
            autoComplete="tel-national"
            value={parsed.national}
            className="w-full"
            classNames={{
              inputWrapper: "bg-transparent border-none min-h-[44px] h-[44px] px-4 shadow-none ring-0 outline-none data-[focus=true]:bg-warning-500/5 group-data-[focus=true]:border-none shadow-none",
              input: "text-sm font-black tracking-widest placeholder:text-default-300 selection:bg-warning-500/30 selection:text-warning-600 outline-none ring-0",
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
      {isInvalid && errorMessage ? (
        <div className="mt-1 px-2 text-[11px] text-danger-500">{errorMessage}</div>
      ) : null}
    </div>
  );
}
