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
  const [selectedCurrency, setSelectedCurrency] = useState("inr");
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});

  useEffect(() => {
    const fetchExchangeRates = async () => {
      if (selectedCurrency === "inr") {
        setExchangeRates({});
        return;
      }

      try {
        const res = await fetch(
          `https://api.frankfurter.app/latest?from=INR&to=${selectedCurrency.toUpperCase()}`
        );
        const cur = await fetch(`https://api.frankfurter.app/currencies`);
        const data = await res.json();
        const datacur = await cur.json();
        console.log(datacur);

        if (!data.rates) throw new Error("Invalid response from API");
        setExchangeRates(data.rates);
      } catch (error) {
        console.error("Error fetching exchange rates", error);
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
