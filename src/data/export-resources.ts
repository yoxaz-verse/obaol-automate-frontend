export type ExportResourceCategory =
  | "Government & Compliance"
  | "Certification & Inspection"
  | "Logistics & Ports"
  | "Trade Finance"
  | "Market Intelligence";

export type ExportResource = {
  id: string;
  name: string;
  category: ExportResourceCategory;
  description: string;
  url: string;
  official: true;
};

export const EXPORT_RESOURCE_CATEGORIES: ExportResourceCategory[] = [
  "Government & Compliance",
  "Certification & Inspection",
  "Logistics & Ports",
  "Trade Finance",
  "Market Intelligence",
];

export const EXPORT_RESOURCES: ExportResource[] = [
  {
    id: "dgft",
    name: "DGFT",
    category: "Government & Compliance",
    description: "Directorate General of Foreign Trade services and exporter licensing.",
    url: "https://www.dgft.gov.in/",
    official: true,
  },
  {
    id: "icegate",
    name: "ICEGATE",
    category: "Government & Compliance",
    description: "Indian Customs portal for e-filing and trade-related services.",
    url: "https://www.icegate.gov.in/",
    official: true,
  },
  {
    id: "apeda",
    name: "APEDA",
    category: "Government & Compliance",
    description: "Export promotion and compliance support for agri and processed foods.",
    url: "https://apeda.gov.in/",
    official: true,
  },
  {
    id: "fssai",
    name: "FSSAI",
    category: "Government & Compliance",
    description: "Food safety standards, licensing, and compliance for exporters.",
    url: "https://www.fssai.gov.in/",
    official: true,
  },
  {
    id: "mpeda",
    name: "MPEDA",
    category: "Government & Compliance",
    description: "Marine products export development and related regulations.",
    url: "https://mpeda.gov.in/",
    official: true,
  },
  {
    id: "spices-board-india",
    name: "Spices Board India",
    category: "Government & Compliance",
    description: "Spice export registration, quality, and market support.",
    url: "https://www.indianspices.com/",
    official: true,
  },
  {
    id: "agri-processed-food-export-development-authority",
    name: "Agricultural & Processed Food Export Development Authority",
    category: "Government & Compliance",
    description: "APEDA official authority portal for agricultural exports.",
    url: "https://apeda.gov.in/",
    official: true,
  },
  {
    id: "directorate-general-of-foreign-trade",
    name: "Directorate General of Foreign Trade",
    category: "Government & Compliance",
    description: "Official DGFT trade policy and IEC-related portal.",
    url: "https://www.dgft.gov.in/",
    official: true,
  },
  {
    id: "gst-portal",
    name: "GST Portal",
    category: "Government & Compliance",
    description: "Goods and Services Tax registration, filing, and compliance.",
    url: "https://www.gst.gov.in/",
    official: true,
  },
  {
    id: "income-tax-portal",
    name: "Income Tax Portal",
    category: "Government & Compliance",
    description: "Direct tax filing and compliance for businesses.",
    url: "https://www.incometax.gov.in/",
    official: true,
  },
  {
    id: "mca-portal",
    name: "MCA Portal",
    category: "Government & Compliance",
    description: "Ministry of Corporate Affairs filings and company compliance.",
    url: "https://www.mca.gov.in/",
    official: true,
  },
  {
    id: "eic-india",
    name: "EIC India",
    category: "Certification & Inspection",
    description: "Export inspection and certification system for outbound goods.",
    url: "https://eicindia.gov.in/WebApp1/",
    official: true,
  },
  {
    id: "plant-quarantine",
    name: "Plant Quarantine",
    category: "Certification & Inspection",
    description: "Plant quarantine services and import/export permit handling.",
    url: "https://ppqs.gov.in/hi",
    official: true,
  },
  {
    id: "phytosanitary-certificate-portal",
    name: "Phytosanitary Certificate Portal",
    category: "Certification & Inspection",
    description: "Online system for phytosanitary certificate processing.",
    url: "https://traceability.apeda.gov.in/hortinet/",
    official: true,
  },
  {
    id: "jnpt",
    name: "JNPT",
    category: "Logistics & Ports",
    description: "Jawaharlal Nehru Port Authority schedules and port services.",
    url: "https://www.jnport.gov.in/",
    official: true,
  },
  {
    id: "mundra-port",
    name: "Mundra Port",
    category: "Logistics & Ports",
    description: "Mundra port operations and cargo movement information.",
    url: "https://www.adaniports.com/ports-and-terminals/mundra-port",
    official: true,
  },
  {
    id: "cochin-port",
    name: "Cochin Port",
    category: "Logistics & Ports",
    description: "Cochin Port Authority schedules, notices, and cargo services.",
    url: "https://www.cochinport.gov.in/",
    official: true,
  },
  {
    id: "chennai-port",
    name: "Chennai Port",
    category: "Logistics & Ports",
    description: "Chennai Port Authority operations and vessel/cargo info.",
    url: "https://www.chennaiport.gov.in/",
    official: true,
  },
  {
    id: "indian-railways-freight",
    name: "Indian Railways Freight",
    category: "Logistics & Ports",
    description: "Freight business portal for rail cargo bookings and rates.",
    url: "https://www.fois.indianrail.gov.in/RailSAHAY/",
    official: true,
  },
  {
    id: "concor",
    name: "CONCOR",
    category: "Logistics & Ports",
    description: "Container Corporation of India services and terminals.",
    url: "https://concorindia.co.in/",
    official: true,
  },
  {
    id: "ecgc",
    name: "ECGC",
    category: "Trade Finance",
    description: "Export credit insurance and risk protection services.",
    url: "https://www.ecgc.in/",
    official: true,
  },
  {
    id: "rbi",
    name: "RBI",
    category: "Trade Finance",
    description: "Reserve Bank of India circulars and forex regulations.",
    url: "https://www.rbi.org.in/",
    official: true,
  },
  {
    id: "exim-bank",
    name: "EXIM Bank",
    category: "Trade Finance",
    description: "Export-Import Bank of India finance programs for exporters.",
    url: "https://www.eximbankindia.in/",
    official: true,
  },
  {
    id: "apeda-trade-data",
    name: "APEDA Trade Data",
    category: "Market Intelligence",
    description: "Official export statistics and commodity trade data.",
    url: "https://agriexchange.apeda.gov.in/",
    official: true,
  },
  {
    id: "itc-trade-map",
    name: "ITC Trade Map",
    category: "Market Intelligence",
    description: "Global trade indicators by product and country.",
    url: "https://www.trademap.org/",
    official: true,
  },
  {
    id: "un-comtrade",
    name: "UN Comtrade",
    category: "Market Intelligence",
    description: "UN international trade statistics database.",
    url: "https://comtradeplus.un.org/",
    official: true,
  },
];
