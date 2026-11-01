export const mapTheme = {
  flame: "#FFB162",
  truffle: "#A35139",
  blue: "#2C3B4D",
  oatmeal: "#C9C1B1",
  abyssal: "#1B2632",
  palladian: "#EEE9DF",
  warm: "#D77B4C",
} as const;

export const warehouseMarkerColors = {
  GENERAL: mapTheme.flame,
  COLD_STORAGE: mapTheme.blue,
  BONDED: mapTheme.truffle,
  AGRO: mapTheme.warm,
} as const;
