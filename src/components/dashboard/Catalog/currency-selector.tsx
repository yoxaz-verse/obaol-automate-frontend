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

  if (isMobile) {
    return (
      <div className="relative flex items-center w-full max-w-[140px]">
        <div className="flex items-center gap-2 w-full px-3 py-2 bg-default-100/50 rounded-xl border border-default-200 justify-between cursor-pointer">
          <div className="flex items-center gap-2">
            <LuCircleDollarSign className="text-emerald-500 w-4 h-4 pointer-events-none" />
            <span className="text-xs font-bold text-foreground pointer-events-none">
              {currentCurrencyCode} {currentSymbol && `(${currentSymbol})`}
            </span>
          </div>
          <LuChevronDown className="text-default-400 w-4 h-4 pointer-events-none" />
        </div>
        <select
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50 text-[16px]"
          value={currentCurrencyCode}
          onChange={(e) => {
            play("cash");
            setSelectedCurrency(e.target.value.toLowerCase());
          }}
        >
          {Object.entries(currencies).map(([code, name]) => (
            <option key={code} value={code}>
              {code} - {name}
            </option>
          ))}
        </select>
      </div>
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
