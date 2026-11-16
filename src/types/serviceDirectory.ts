export type ServiceDirectoryProvider = {
  companyId: string;
  name: string;
  summary: string;
  categories: string[];
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  approved: boolean;
  verified: boolean;
  logo?: string;
  contact: { email?: string; phone?: string; whatsapp?: string; website?: string };
  location?: { label?: string; city?: string; state?: string; country?: string };
  capabilities: string[];
  specialized: { labProfileId?: string; packagingProfileId?: string; freightProfileId?: string; transportProfileId?: string };
  transport?: { fleetCount: number; vehicleTypes: string[]; cargoTypes: string[] } | null;
  updatedAt: string;
};

export const serviceCategories: Array<{ key: string; label: string }> = [
  { key: "", label: "All services" }, { key: "procurement-partners", label: "Procurement" },
  { key: "warehouse-owners", label: "Warehousing" }, { key: "inland-transportation", label: "Inland transportation" },
  { key: "freight-forwarding", label: "Freight forwarding" }, { key: "logistics-providers", label: "Logistics" },
  { key: "packaging", label: "Packaging" }, { key: "quality-testing", label: "Quality testing" },
  { key: "customs-clearance-agencies", label: "Customs clearance" }, { key: "finance-partners", label: "Finance" },
  { key: "insurance-partners", label: "Insurance" }, { key: "agritech-companies", label: "Agritech" },
];

export const categoryLabel = (key: string) => serviceCategories.find((item) => item.key === key)?.label || key.replaceAll("-", " ");
