export const chartPalette = {
  flame: "#FFB162",
  truffle: "#A35139",
  blue: "#2C3B4D",
  oatmeal: "#C9C1B1",
  warm: "#D77B4C",
} as const;

export const chartSeries = [
  chartPalette.flame,
  chartPalette.truffle,
  chartPalette.blue,
  chartPalette.oatmeal,
  chartPalette.warm,
] as const;

export const chartTheme = {
  light: {
    text: chartPalette.blue,
    grid: "rgba(44, 59, 77, 0.14)",
    tooltipBackground: "#1B2632",
    tooltipText: "#EEE9DF",
  },
  dark: {
    text: "#EEE9DF",
    grid: "rgba(201, 193, 177, 0.18)",
    tooltipBackground: "#EEE9DF",
    tooltipText: "#1B2632",
  },
} as const;
