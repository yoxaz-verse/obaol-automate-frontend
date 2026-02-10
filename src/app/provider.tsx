"use client";

import { NextUIProvider } from "@nextui-org/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export const queryClient = new QueryClient();
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <NextUIProvider>
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
        >
          <CurrencyProvider>{children}</CurrencyProvider>
        </NextThemesProvider>
      </NextUIProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
