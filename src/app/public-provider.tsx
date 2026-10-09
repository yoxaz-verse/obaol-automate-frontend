"use client";

import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SoundProvider } from "@/context/SoundContext";
import SoundInitializer from "@/components/ui/SoundInitializer";
import { PwaInstallProvider } from "@/context/PwaInstallContext";
import PwaRuntime from "@/components/pwa/PwaRuntime";

export function PublicProviders({ children }: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
      >
        <PwaInstallProvider>
          <SoundProvider>
            <SoundInitializer />
            <PwaRuntime />
            {children}
          </SoundProvider>
        </PwaInstallProvider>
      </NextThemesProvider>
    </NextUIProvider>
  );
}
