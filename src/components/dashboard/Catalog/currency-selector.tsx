"use client";

import { useCurrency } from "@/context/CurrencyContext";
import React, { useEffect, useState } from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@nextui-org/react";
import { LuCircleDollarSign, LuChevronDown } from "react-icons/lu";
import { useSoundEffect } from "@/context/SoundContext";
import AppCombobox from "@/components/ui/AppCombobox";

interface CurrencyMap {
  [code: string]: string;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "د.إ",
  CAD: "$",
  AUD: "$",
  // Add more if needed
};
const DEFAULT_CURRENCIES: CurrencyMap = {
  INR: "Indian Rupee",
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  AED: "UAE Dirham",
  CAD: "Canadian Dollar",
  AUD: "Australian Dollar",
  CHF: "Swiss Franc",
  SEK: "Swedish Krona",
};

interface CurrencySelectorProps {
  isMobile?: boolean;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({ isMobile }) => {
  const { selectedCurrency, setSelectedCurrency } = useCurrency();
  const { play } = useSoundEffect();
  const [currencies, setCurrencies] = useState<CurrencyMap>({});

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const res = await fetch("https://api.frankfurter.app/currencies");
        const data = await res.json();
        if (data && Object.keys(data).length > 0) {
          setCurrencies(data);
        } else {
          setCurrencies(DEFAULT_CURRENCIES);
        }
      } catch (error) {
        console.error("Failed to fetch currencies:", error);
        setCurrencies(DEFAULT_CURRENCIES);
      }
    };

    fetchCurrencies();
  }, []);
  useEffect(() => {
    if (Object.keys(currencies).length === 0) return;
    const normalized = selectedCurrency.toUpperCase();
    if (!currencies[normalized]) {
      setSelectedCurrency("inr");
    }
  }, [currencies, selectedCurrency, setSelectedCurrency]);

  const currentCurrencyCode = selectedCurrency.toUpperCase();
  const currentSymbol = CURRENCY_SYMBOLS[currentCurrencyCode] || "";
  const currentCurrencyName = currencies[currentCurrencyCode] || currentCurrencyCode;

  if (isMobile) {
    return (
      <div className="w-full max-w-[180px]"><AppCombobox label="Currency" value={currentCurrencyCode} options={Object.entries(currencies).map(([code, name]) => ({ key: code, label: `${code}${CURRENCY_SYMBOLS[code] ? ` (${CURRENCY_SYMBOLS[code]})` : ""}`, description: name }))} onChange={value => { if (!value) return; play("cash"); setSelectedCurrency(value.toLowerCase()); }} /></div>
    );
  }

  return (
    <Dropdown placement="bottom-end" classNames={{ base: "z-[9999999]", content: "bg-content1 border border-default-200 z-[9999999]" }}>
      <DropdownTrigger>
        <Button
          variant="light"
          radius="full"
          className="flex items-center gap-2 px-2 md:px-3 min-w-10 md:min-w-[100px] bg-default-100/50 hover:bg-default-200/50 border border-transparent hover:border-default-200 transition-all font-medium text-xs h-10"
        >
          <LuCircleDollarSign className="text-emerald-500 w-4 h-4" />
          <span>
            {currentCurrencyCode} {currentSymbol && `(${currentSymbol})`}
          </span>
          <LuChevronDown className="text-default-400 w-3 h-3" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Select Currency"
        className="max-h-[300px] overflow-y-auto"
        onAction={(key) => {
          play("cash");
          setSelectedCurrency(String(key).toLowerCase());
        }}
        selectedKeys={[currentCurrencyCode]}
        selectionMode="single"
      >
        {Object.entries(currencies).map(([code, name]) => {
          const symbol = CURRENCY_SYMBOLS[code]
            ? `(${CURRENCY_SYMBOLS[code]})`
            : "";
          return (
            <DropdownItem
              key={code}
              className={currentCurrencyCode === code ? "text-emerald-500 font-bold" : "text-foreground"}
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold">{code} {symbol}</span>
                <span className="text-[10px] opacity-60">{name}</span>
              </div>
            </DropdownItem>
          );
        })}
      </DropdownMenu>
    </Dropdown>
  );
};

export default CurrencySelector;
