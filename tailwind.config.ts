import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";
import typography from "@tailwindcss/typography";

const obaol = {
  50: "#FFF8EF",
  100: "#FFEBD4",
  200: "#FFD7AC",
  300: "#FFC27F",
  400: "#FFB162",
  500: "#E98C50",
  600: "#C66A43",
  700: "#A35139",
  800: "#7E3D30",
  900: "#572B25",
  950: "#321A18",
  DEFAULT: "#FFB162",
};

const brandPalette = {
  palladian: "#EEE9DF",
  oatmeal: "#C9C1B1",
  blue: "#2C3B4D",
  flame: "#FFB162",
  truffle: "#A35139",
  abyssal: "#1B2632",
};

const semanticWarning = {
  50: "#FFFBEB",
  100: "#FEF3C7",
  200: "#FDE68A",
  300: "#FCD34D",
  400: "#FBBF24",
  500: "#F59E0B",
  600: "#D97706",
  700: "#B45309",
  800: "#92400E",
  900: "#78350F",
  DEFAULT: "#F59E0B",
};

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obaol,
        brand: brandPalette,
        // Application ink and paper always use the OBAOL palette. Exact
        // neutrals are opt-in for documents, media, codes, and provider marks.
        black: brandPalette.abyssal,
        white: brandPalette.palladian,
        "pure-black": "#000000",
        "pure-white": "#FFFFFF",
        // Legacy decorative orange utilities now resolve to the OBAOL brand ramp.
        orange: obaol,
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            primary: {
              ...obaol,
              DEFAULT: brandPalette.flame,
              foreground: brandPalette.abyssal,
            },
            warning: {
              ...semanticWarning,
              DEFAULT: "#F59E0B",
              foreground: "#1F1300",
            },
            focus: brandPalette.truffle,
            background: brandPalette.palladian,
            foreground: brandPalette.abyssal,
            divider: "rgba(142, 132, 116, 0.48)",
            content1: "#FBF8F2",
            content2: "#F4EFE6",
            content3: brandPalette.palladian,
            content4: brandPalette.oatmeal,
            default: {
              50: "#FBF8F2", 100: "#F4EFE6", 200: "#E7E0D4",
              300: brandPalette.oatmeal, 400: "#A99F8D", 500: "#7A746A",
              600: "#5C5B59", 700: brandPalette.blue, 800: "#22303D",
              900: brandPalette.abyssal, foreground: brandPalette.abyssal,
            },
          },
        },
        dark: {
          colors: {
            primary: {
              ...obaol,
              DEFAULT: brandPalette.flame,
              foreground: brandPalette.abyssal,
            },
            warning: {
              ...semanticWarning,
              DEFAULT: "#F59E0B",
              foreground: "#1F1300",
            },
            focus: brandPalette.flame,
            background: brandPalette.abyssal,
            foreground: brandPalette.palladian,
            divider: "rgba(201, 193, 177, 0.22)",
            content1: "#22303D",
            content2: brandPalette.blue,
            content3: "#35475A",
            content4: "#516275",
            default: {
              50: brandPalette.abyssal, 100: "#22303D", 200: brandPalette.blue,
              300: "#405166", 400: "#647387", 500: "#8E978F",
              600: brandPalette.oatmeal, 700: "#D8D1C5", 800: brandPalette.palladian,
              900: "#FBF8F2", foreground: brandPalette.palladian,
            },
          },
        },
      },
    }),
    typography,
  ],
};

export default config;
