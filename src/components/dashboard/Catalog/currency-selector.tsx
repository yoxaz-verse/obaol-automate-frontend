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

const CurrencySelector: React.FC = () => {
  const { selectedCurrency, setSelectedCurrency } = useCurrency();
  const [currencies, setCurrencies] = useState<CurrencyMap>({});

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const res = await fetch("https://api.frankfurter.app/currencies");
        const data = await res.json();
        setCurrencies(data);
      } catch (error) {
        console.error("Failed to fetch currencies:", error);
      }
    };

    fetchCurrencies();
  }, []);

  const currentCurrencyCode = selectedCurrency.toUpperCase();
  const currentSymbol = CURRENCY_SYMBOLS[currentCurrencyCode] || "";
  const currentCurrencyName = currencies[currentCurrencyCode] || currentCurrencyCode;

  return (
    <Dropdown placement="bottom-end" classNames={{ content: "bg-content1 border border-default-200" }}>
      <DropdownTrigger>
        <Button
          variant="light"
          radius="full"
          className="flex items-center gap-2 px-3 min-w-[100px] bg-default-100/50 hover:bg-default-200/50 border border-transparent hover:border-default-200 transition-all font-medium text-xs h-10"
        >
          <LuCircleDollarSign className="text-emerald-500 w-4 h-4" />
          <span className="hidden sm:inline">
            {currentCurrencyCode} {currentSymbol && `(${currentSymbol})`}
          </span>
          <LuChevronDown className="text-default-400 w-3 h-3" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Select Currency"
        className="max-h-[300px] overflow-y-auto"
        onAction={(key) => setSelectedCurrency(String(key).toLowerCase())}
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
