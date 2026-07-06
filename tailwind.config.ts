import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";
import typography from "@tailwindcss/typography";

const obaol = {
  50: "#FFFAF0",
  100: "#F8EDD8",
  200: "#E4C799",
  300: "#DDB368",
  400: "#D6A24A",
  500: "#CF983C",
  600: "#B47C2D",
  700: "#8A5E22",
  800: "#604018",
  900: "#38230F",
  950: "#1E1208",
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
              foreground: "#1E1208",
            },
            warning: {
              ...semanticWarning,
              foreground: "#1F1300",
            },
            background: "#FCFAF6",
            foreground: "#11181C",
            content1: "#FFFFFF",
            content2: "#F8F4EC",
            content3: "#EEE5D5",
            content4: "#A1A1AA",
            default: {
              50: "#FAFAFA",
              100: "#F4F4F5",
              200: "#E4E4E7",
              300: "#D4D4D8",
              400: "#A1A1AA",
              500: "#71717A",
              600: "#52525B",
              700: "#3F3F46",
              800: "#27272A",
              900: "#18181B",
              foreground: "#18181B",
            },
          },
        },
        dark: {
          colors: {
            primary: {
              ...obaol,
              foreground: "#1E1208",
            },
            warning: {
              ...semanticWarning,
              foreground: "#1F1300",
            },
            background: "#090806",
            foreground: "#ECEDEE",
            content1: "#0E0D0A",
            content2: "#191611",
            content3: "#2B241A",
            content4: "#52525B",
            default: {
              50: "#18181B",
              100: "#27272A",
              200: "#3F3F46",
              300: "#52525B",
              400: "#71717A",
              500: "#A1A1AA",
              600: "#D4D4D8",
              700: "#E4E4E7",
              800: "#F4F4F5",
              900: "#FAFAFA",
              foreground: "#FAFAFA",
            },
          },
        },
      },
    }),
    typography,
  ],
};

export default config;
