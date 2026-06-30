"use client";

import { HeroUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function PublicProviders({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem={true}
      >
        {children}
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
