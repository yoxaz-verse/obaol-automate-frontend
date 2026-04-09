"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type ExchangeRates = Record<string, number>;

interface CurrencyContextProps {
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  exchangeRates: ExchangeRates;
  rateError: string | null;
  convertRate: (rateInINR: number) => string;
  formatRate: (rateInINR: number) => string;
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
  const [rateError, setRateError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("obaol_currency", selectedCurrency);
    }
  }, [selectedCurrency]);

  useEffect(() => {
    const fetchExchangeRates = async () => {
      if (selectedCurrency === "inr") {
        setRateError(null);
        return;
      }

      try {
        setRateError(null);
        const res = await fetch(
          `https://api.frankfurter.app/latest?from=INR&to=${selectedCurrency.toUpperCase()}`
        );

        if (!res.ok) {
          console.warn(`Exchange rate API returned ${res.status}. Keeping last known rate.`);
          setRateError("Exchange rate unavailable. Showing INR values.");
          return;
        }

        const data = await res.json();

        if (!data.rates || !data.rates[selectedCurrency.toUpperCase()]) {
          throw new Error("Invalid response or missing rate from API");
        }

        const nextRate = data.rates[selectedCurrency.toUpperCase()];
        setExchangeRates((prev) => ({ ...prev, [selectedCurrency.toUpperCase()]: nextRate }));
        setRateError(null);
      } catch (error) {
        console.error("Error fetching exchange rates:", error);
        setRateError("Exchange rate unavailable. Showing INR values.");
      }
    };

    fetchExchangeRates();
  }, [selectedCurrency]);

  const convertRate = (rateInINR: number): string => {
    if (rateInINR === null || rateInINR === undefined) return "—";
    const numericRate = Number(rateInINR);
    if (Number.isNaN(numericRate)) return "—";

    if (selectedCurrency === "inr" || rateError) return `₹${numericRate.toFixed(2)}`;

    const exchangeRate = exchangeRates[selectedCurrency.toUpperCase()];
    if (!exchangeRate) return "…";

    const converted = numericRate * exchangeRate;
    return `${selectedCurrency.toUpperCase()} ${converted.toFixed(2)}`;
  };
  const formatRate = (rateInINR: number): string => {
    return convertRate(rateInINR);
  };

  return (
    <CurrencyContext.Provider
      value={{
        selectedCurrency,
        setSelectedCurrency,
        exchangeRates,
        rateError,
        convertRate,
        formatRate,
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
