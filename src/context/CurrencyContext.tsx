"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type ExchangeRates = Record<string, number>;

interface CurrencyContextProps {
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  exchangeRates: ExchangeRates;
  convertRate: (rateInINR: number) => string;
}

const CurrencyContext = createContext<CurrencyContextProps | undefined>(
  undefined
);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("obaol_currency") || "inr";
    }
    return "inr";
  });
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("obaol_currency", selectedCurrency);
    }
  }, [selectedCurrency]);

  useEffect(() => {
    const fetchExchangeRates = async () => {
      if (selectedCurrency === "inr") {
        setExchangeRates({});
        return;
      }

      try {
        const [res, curRes] = await Promise.all([
          fetch(`https://api.frankfurter.app/latest?from=INR&to=${selectedCurrency.toUpperCase()}`),
          fetch(`https://api.frankfurter.app/currencies`)
        ]);

        if (!res.ok) {
          console.warn(`Exchange rate API returned ${res.status}. Falling back to INR.`);
          setExchangeRates({});
          return;
        }

        const data = await res.json();

        if (!data.rates || !data.rates[selectedCurrency.toUpperCase()]) {
          throw new Error("Invalid response or missing rate from API");
        }

        setExchangeRates(data.rates);
      } catch (error) {
        console.error("Error fetching exchange rates:", error);
        setExchangeRates({}); // Fallback to base currency (INR)
      }
    };

    fetchExchangeRates();
  }, [selectedCurrency]);

  const convertRate = (rateInINR: number): string => {
    if (!rateInINR) return "—";

    if (selectedCurrency === "inr") return `₹${rateInINR.toFixed(2)}`;

    const exchangeRate = exchangeRates[selectedCurrency.toUpperCase()];
    if (!exchangeRate) return `₹${rateInINR.toFixed(2)} `;

    const converted = rateInINR * exchangeRate;
    return `${selectedCurrency.toUpperCase()} ${converted.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        selectedCurrency,
        setSelectedCurrency,
        exchangeRates,
        convertRate,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextProps => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
