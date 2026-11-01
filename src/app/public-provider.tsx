"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SoundProvider } from "@/context/SoundContext";
import SoundInitializer from "@/components/ui/SoundInitializer";
import { PwaRuntimeProvider } from "@/context/PwaRuntimeContext";
import PwaRuntime from "@/components/pwa/PwaRuntime";

export function PublicProviders({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
    >
      <PwaRuntimeProvider>
        <SoundProvider>
          <SoundInitializer />
          <PwaRuntime />
          {children}
        </SoundProvider>
      </PwaRuntimeProvider>
    </NextThemesProvider>
  );
}
