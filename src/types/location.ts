export type StructuredLocation = {
  latitude: number;
  longitude: number;
  label: string;
  address: string;
  city: string;
  district: string;
  state: string;
  country: string;
  countryCode: string;
  postalCode: string;
};

export type LocationSlot = {
  id: string;
  label: string;
  required?: boolean;
  value: StructuredLocation | null;
};

export const isValidCoordinate = (latitude: unknown, longitude: unknown) => {
  const lat = Number(latitude);
  const lng = Number(longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

export const toStructuredLocation = (value?: Partial<StructuredLocation> | null): StructuredLocation | null => {
  if (!value || !isValidCoordinate(value.latitude, value.longitude)) return null;
  return {
    latitude: Number(value.latitude),
    longitude: Number(value.longitude),
    label: String(value.label || value.address || "Selected location"),
    address: String(value.address || value.label || ""),
    city: String(value.city || ""),
    district: String(value.district || ""),
    state: String(value.state || ""),
    country: String(value.country || ""),
    countryCode: String(value.countryCode || "").toUpperCase(),
    postalCode: String(value.postalCode || ""),
  };
};
