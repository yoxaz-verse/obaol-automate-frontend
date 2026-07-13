"use client";

import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SoundProvider } from "@/context/SoundContext";
import SoundInitializer from "@/components/ui/SoundInitializer";

export function PublicProviders({ children }: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem={true}
      >
        <SoundProvider>
          <SoundInitializer />
          {children}
        </SoundProvider>
      </NextThemesProvider>
    </NextUIProvider>
  );
}
