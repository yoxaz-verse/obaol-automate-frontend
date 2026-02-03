"use client";

import { useCurrency } from "@/context/CurrencyContext";
import React, { useEffect, useState } from "react";
import { Select, SelectItem } from "@nextui-org/react";

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

        // Optionally inject AED if you still want
        // data["AED"] = "United Arab Emirates Dirham";

        setCurrencies(data);
      } catch (error) {
        console.error("Failed to fetch currencies:", error);
      }
    };

    fetchCurrencies();
  }, []);

  return (
    <Select
      size="sm"
      label="Select currency"
      labelPlacement="inside"
      selectedKeys={[selectedCurrency.toUpperCase()]}
      onChange={(e) => setSelectedCurrency(e.target.value.toLowerCase())}
      className="max-w-[250px] text-foreground"
      defaultSelectedKeys={["INR"]}
    >
      {Object.entries(currencies).map(([code, name]) => {
        const symbol = CURRENCY_SYMBOLS[code]
          ? `(${CURRENCY_SYMBOLS[code]})`
          : "";
        const textValue = `${code} ${symbol} — ${name}`.trim();
        return (
          <SelectItem
            key={code}
            value={code.toLowerCase()}
            textValue={textValue}
            className="text-foreground"
          >
            {textValue}
          </SelectItem>
        );
      })}
    </Select>
  );
};

export default CurrencySelector;
