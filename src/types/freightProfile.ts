export type FreightLocation = { label?: string; address?: string; city?: string; state?: string; country?: string; latitude?: number | string; longitude?: number | string };
export type FreightLane = { origin: string; destination: string; mode: string; originCountry?: string; destinationCountry?: string; notes?: string };
export type FreightCredential = { type: string; name?: string; number?: string; issuer?: string; validUntil?: string; verified?: boolean };
export type FreightProfileSnapshot = {
  displayName: string; summary: string; contactEmail: string; contactPhone: string; whatsappPhone: string; website: string;
  modes: string[]; movementTypes: string[]; services: string[]; responsibilities: string[]; equipmentTypes: string[]; specialCargo: string[];
  originCountries: string[]; destinationCountries: string[]; cargoCapabilities: string[]; locations: FreightLocation[]; lanes: FreightLane[];
  customsArrangement: "OWN_LICENSE" | "EXTERNAL_AGENT" | "NOT_OFFERED"; customsDetails: { licenseNumber?: string; issuingAuthority?: string; agentName?: string; countries?: string[]; validUntil?: string };
  credentials: FreightCredential[]; agents: string[]; carriers: string[];
};
export const EMPTY_FREIGHT_PROFILE: FreightProfileSnapshot = { displayName: "", summary: "", contactEmail: "", contactPhone: "", whatsappPhone: "", website: "https://", modes: ["OCEAN"], movementTypes: ["FCL", "LCL"], services: ["DOOR_TO_DOOR"], responsibilities: ["SHIPMENT_PLANNING"], equipmentTypes: [], specialCargo: [], originCountries: [], destinationCountries: [], cargoCapabilities: [], locations: [{ label: "Head office", country: "India" }], lanes: [{ origin: "", destination: "", mode: "OCEAN" }], customsArrangement: "NOT_OFFERED", customsDetails: {}, credentials: [], agents: [], carriers: [] };
export const freightLabel = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (x) => x.toUpperCase());
