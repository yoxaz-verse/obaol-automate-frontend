"use client";

import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function PublicProviders({ children }: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem={true}
      >
        {children}
      </NextThemesProvider>
    </NextUIProvider>
  );
}
