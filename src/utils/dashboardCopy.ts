const EXACT_LABEL_MAP: Record<string, string> = {
  PROTOCOL_SYNCHRONIZED: "Configuration synced",
  MAPPING_REQUIRED: "Configuration required",
  TYPE_PENDING: "Type not set",
  NOT_ASSIGNED: "Not assigned",
  NO_UPLINK: "Not available",
  NO_COMM_LINE: "Not available",
  COORDINATES_MISSING: "Address not available",
  UNNAMED_OPERATOR: "Operator",
  AGENTS_IDENTIFIED: "Members",
  ACTIVITY_SIGNAL: "Activity update",
  TRANSITIONING_SEQUENCE: "Status update in progress",
  NO_SECURE_LINK: "No email added",
  NO_DIRECT_LINE: "No phone added",
  IDENTITY_REDACTED: "Name not available",
  EMAIL_VRD: "Email verified",
  PHONE_VRD: "Phone verified",
  SEC_VRD: "Identity verified",
  TERMINAL_CATALOG: "Catalog",
  EXECUTION_LEDGER: "Orders",
  LIVE_TELEMETRY: "Enquiries",
  SYSTEM_PULSE: "Activity",
  OBAOL_SYSTEM_CORE: "OBAOL Core",
  SECURE_CONFIG_CHAIN_V4_2: "System settings",
  PROTOCOL_BYPASS_ENABLED: "Operator assignment pending",
};

const toTitleCase = (text: string): string =>
  text
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const dashboardCopy = (value: unknown, fallback = ""): string => {
  if (value === null || value === undefined) return fallback;

  const raw = String(value).trim();
  if (!raw) return fallback;

  const normalizedKey = raw.toUpperCase().replace(/[^\w]/g, "_").replace(/_+/g, "_");
  if (EXACT_LABEL_MAP[normalizedKey]) return EXACT_LABEL_MAP[normalizedKey];

  const cleaned = raw
    .replace(/[\\/|]+/g, " ")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return fallback;

  const isMostlyCode = /^[A-Z0-9 ]+$/.test(cleaned);
  return isMostlyCode ? toTitleCase(cleaned) : cleaned;
};

