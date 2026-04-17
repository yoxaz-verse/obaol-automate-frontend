export type AssociateRoleIconKey =
  | "trader"
  | "importer"
  | "exporter"
  | "warehouse"
  | "inlandTransport"
  | "freightForwarder"
  | "logistics"
  | "supplier"
  | "packaging"
  | "qualityLab"
  | "agritech"
  | "customs"
  | "finance"
  | "procurement";

export interface AssociateRoleFaqItem {
  question: string;
  answer: string;
}

export interface AssociateRoleDefinition {
  slug: string;
  displayName: string;
  shortDescription: string;
  longDescription: string;
  roleScope: string[];
  supportPoints: string[];
  iconKey: AssociateRoleIconKey;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  faqs: AssociateRoleFaqItem[];
  relatedRoles: string[];
}

const roles: AssociateRoleDefinition[] = [
  {
    slug: "traders",
    displayName: "Traders",
    shortDescription: "Execute commodity buy-sell contracts with verified counterparties.",
    longDescription:
      "Commodity traders use OBAOL Supreme to discover opportunities, coordinate execution, and close transactions with stronger verification and documentation control.",
    roleScope: ["Spot and term commodity trading", "Counterparty coordination", "Rate and demand response"],
    supportPoints: ["Verified network access", "Structured enquiry workflow", "Execution visibility from offer to closure"],
    iconKey: "trader",
    seo: {
      title: "Commodity Traders on OBAOL | Associate Role",
      description:
        "Join OBAOL Supreme as a commodity trader to execute verified buy-sell contracts with stronger documentation, compliance, and trade coordination.",
      keywords: ["commodity traders", "agri trade platform", "verified commodity trade", "trade execution system"],
    },
    faqs: [
      {
        question: "Who qualifies as a Trader Associate on OBAOL?",
        answer: "Any registered business entity that actively buys and sells commodities can join as a Trader Associate.",
      },
      {
        question: "Can traders coordinate cross-border deals on OBAOL?",
        answer: "Yes. OBAOL supports domestic and international execution with structured workflow support.",
      },
    ],
    relatedRoles: ["importers", "exporters", "logistics-providers"],
  },
  {
    slug: "importers",
    displayName: "Importers",
    shortDescription: "Source commodities globally and execute imports through a controlled workflow.",
    longDescription:
      "Importers on OBAOL Supreme can coordinate suppliers, documents, and logistics through a single execution layer built for commodity movement into destination markets.",
    roleScope: ["International sourcing", "Import documentation coordination", "Destination-side execution planning"],
    supportPoints: ["Execution checkpoints", "Document and compliance alignment", "Integrated logistics collaboration"],
    iconKey: "importer",
    seo: {
      title: "Importers on OBAOL | Associate Role",
      description:
        "Importers can use OBAOL Supreme to manage sourcing, documentation, and destination logistics through one structured trade execution platform.",
      keywords: ["commodity importers", "import execution platform", "cross-border sourcing", "import workflow"],
    },
    faqs: [
      {
        question: "Is OBAOL suitable for first-time importers?",
        answer: "Yes. The platform is designed to provide structure and visibility across the import execution lifecycle.",
      },
      {
        question: "Do importers work with logistics partners on OBAOL?",
        answer: "Yes. Importers can coordinate with freight, inland transport, and warehousing associates in one ecosystem.",
      },
    ],
    relatedRoles: ["exporters", "freight-forwarders", "customs-clearance-agencies"],
  },
  {
    slug: "exporters",
    displayName: "Exporters",
    shortDescription: "Move domestic commodity supply to global buyers with standardized execution.",
    longDescription:
      "Exporters can use OBAOL Supreme to manage buyer alignment, shipment coordination, and export compliance steps with better operational transparency.",
    roleScope: ["Export-side supply readiness", "Buyer and shipment coordination", "Execution milestone tracking"],
    supportPoints: ["Global buyer-side visibility", "Export workflow orchestration", "Role-based partner collaboration"],
    iconKey: "exporter",
    seo: {
      title: "Exporters on OBAOL | Associate Role",
      description:
        "Exporters can onboard to OBAOL Supreme to coordinate global commodity shipments, documentation flow, and trade completion.",
      keywords: ["commodity exporters", "export trade execution", "agri export platform", "export coordination"],
    },
    faqs: [
      {
        question: "Can exporters use OBAOL for recurring shipments?",
        answer: "Yes. OBAOL supports repeat execution workflows and ongoing partner coordination.",
      },
      {
        question: "Does OBAOL help exporters collaborate with labs and logistics?",
        answer: "Yes. Exporters can work with testing labs, freight providers, and warehouse partners inside the ecosystem.",
      },
    ],
    relatedRoles: ["traders", "quality-testing-labs", "freight-forwarders"],
  },
  {
    slug: "warehouse-owners",
    displayName: "Warehouse Owners",
    shortDescription: "Provide storage infrastructure integrated with execution workflows.",
    longDescription:
      "Warehouse operators can integrate capacity into OBAOL Supreme and support trade readiness through storage, handling, and dispatch coordination.",
    roleScope: ["Storage and stock handling", "Dispatch readiness support", "Commodity movement coordination"],
    supportPoints: ["Inventory-linked coordination", "Visibility across trade stages", "Structured handoff with transport partners"],
    iconKey: "warehouse",
    seo: {
      title: "Warehouse Owners on OBAOL | Associate Role",
      description:
        "Warehouse and storage companies can join OBAOL Supreme to support commodity execution with integrated storage and dispatch coordination.",
      keywords: ["commodity warehouse", "storage partners", "warehouse associate", "trade warehousing"],
    },
    faqs: [
      {
        question: "Can warehouse operators onboard as associates?",
        answer: "Yes. Registered warehouse and storage entities can onboard as dedicated associates on OBAOL.",
      },
      {
        question: "How do warehouses collaborate with inland transport?",
        answer: "Warehouses can coordinate handoff points and movement milestones with transport associates through shared workflows.",
      },
    ],
    relatedRoles: ["inland-transportation", "logistics-providers", "suppliers"],
  },
  {
    slug: "inland-transportation",
    displayName: "Inland Transportation",
    shortDescription: "Handle first-mile and last-mile commodity movement within domestic corridors.",
    longDescription:
      "Inland transportation partners can support commodity flow between farms, processing points, warehouses, ports, and buyers through coordinated execution tracks.",
    roleScope: ["First-mile pickup", "Port-to-warehouse movement", "Domestic route execution"],
    supportPoints: ["Execution-level route handoff", "Timeline visibility", "Structured coordination with warehousing and freight"],
    iconKey: "inlandTransport",
    seo: {
      title: "Inland Transportation on OBAOL | Associate Role",
      description:
        "Inland transportation companies can join OBAOL Supreme to coordinate domestic commodity movement from origin points to warehouses and ports.",
      keywords: ["inland transportation", "commodity trucking", "port to warehouse transport", "domestic logistics"],
    },
    faqs: [
      {
        question: "Who can join as an inland transport associate?",
        answer: "Registered domestic transport providers handling commodity movement can onboard as associates.",
      },
      {
        question: "Can inland transport partners work on export-bound cargo?",
        answer: "Yes. Inland transport is a key execution layer for both import and export trade operations.",
      },
    ],
    relatedRoles: ["warehouse-owners", "freight-forwarders", "logistics-providers"],
  },
  {
    slug: "freight-forwarders",
    displayName: "Freight Forwarders",
    shortDescription: "Coordinate cross-border freight movement and shipment planning.",
    longDescription:
      "Freight forwarding partners on OBAOL Supreme can orchestrate carrier coordination, booking flows, and shipment movement for international commodity trades.",
    roleScope: ["Shipment planning", "Carrier and route coordination", "Cross-border freight execution"],
    supportPoints: ["Integrated partner coordination", "Milestone-led shipment visibility", "Execution continuity across trade participants"],
    iconKey: "freightForwarder",
    seo: {
      title: "Freight Forwarders on OBAOL | Associate Role",
      description:
        "Freight forwarding firms can join OBAOL Supreme to coordinate international commodity shipments with integrated trade execution workflows.",
      keywords: ["freight forwarders", "commodity freight", "cross-border logistics", "shipment coordination"],
    },
    faqs: [
      {
        question: "Can freight forwarders onboard independently?",
        answer: "Yes. Freight forwarding entities can onboard as dedicated associate partners.",
      },
      {
        question: "Do freight forwarders collaborate with customs associates?",
        answer: "Yes. OBAOL enables cross-functional execution with customs and importer-exporter roles.",
      },
    ],
    relatedRoles: ["customs-clearance-agencies", "importers", "exporters"],
  },
  {
    slug: "logistics-providers",
    displayName: "Logistics Providers",
    shortDescription: "Deliver multimodal logistics support for end-to-end commodity execution.",
    longDescription:
      "Logistics providers can manage cargo movement, routing, and execution coordination in partnership with other associates across the OBAOL ecosystem.",
    roleScope: ["Multimodal commodity movement", "Operational coordination", "Execution support across trade legs"],
    supportPoints: ["Cross-role alignment", "Process visibility", "Reduced coordination friction"],
    iconKey: "logistics",
    seo: {
      title: "Logistics Providers on OBAOL | Associate Role",
      description:
        "Logistics service providers can join OBAOL Supreme to support commodity movement and execution through integrated operational workflows.",
      keywords: ["logistics providers", "commodity logistics", "trade movement partners", "logistics associate"],
    },
    faqs: [
      {
        question: "What kind of logistics firms can join?",
        answer: "Companies handling transport execution, cargo operations, and movement coordination can onboard.",
      },
      {
        question: "Can logistics providers support both domestic and global trades?",
        answer: "Yes. OBAOL supports logistics collaboration across local and international execution stages.",
      },
    ],
    relatedRoles: ["inland-transportation", "freight-forwarders", "warehouse-owners"],
  },
  {
    slug: "suppliers",
    displayName: "Suppliers",
    shortDescription: "Provide commodity supply streams to domestic and global demand channels.",
    longDescription:
      "Suppliers can use OBAOL Supreme to connect products to active demand while coordinating quality, packaging, and execution readiness through the platform.",
    roleScope: ["Supply fulfillment", "Buyer-aligned coordination", "Execution-ready lot preparation"],
    supportPoints: ["Demand-side access", "Execution coordination support", "Ecosystem partner collaboration"],
    iconKey: "supplier",
    seo: {
      title: "Suppliers on OBAOL | Associate Role",
      description:
        "Commodity suppliers can onboard to OBAOL Supreme to participate in verified trade execution and connect with buyers through a structured platform.",
      keywords: ["commodity suppliers", "agri supply network", "supplier onboarding", "trade supply partner"],
    },
    faqs: [
      {
        question: "Can supplier companies onboard directly?",
        answer: "Yes. Registered supplier entities can onboard as associates and participate in platform-driven execution.",
      },
      {
        question: "Do suppliers need supporting ecosystem partners?",
        answer: "Typically yes, and OBAOL enables direct coordination with labs, packaging, logistics, and warehousing partners.",
      },
    ],
    relatedRoles: ["packaging-companies", "quality-testing-labs", "traders"],
  },
  {
    slug: "packaging-companies",
    displayName: "Packaging Companies",
    shortDescription: "Support commodity preparation and packaging standards for market readiness.",
    longDescription:
      "Packaging partners can join OBAOL Supreme to deliver packaging operations aligned with trade requirements, buyer standards, and execution timelines.",
    roleScope: ["Commodity packaging operations", "Dispatch readiness support", "Standard-driven packaging alignment"],
    supportPoints: ["Integrated execution timing", "Collaboration with suppliers and labs", "Streamlined pre-dispatch coordination"],
    iconKey: "packaging",
    seo: {
      title: "Packaging Companies on OBAOL | Associate Role",
      description:
        "Packaging companies can onboard to OBAOL Supreme to support commodity readiness with coordinated packaging execution for trade movement.",
      keywords: ["commodity packaging", "packaging partners", "trade packaging services", "agri packaging company"],
    },
    faqs: [
      {
        question: "Can packaging firms onboard even if they do not trade directly?",
        answer: "Yes. OBAOL supports service partners that are critical to execution quality and readiness.",
      },
      {
        question: "How do packaging companies fit into the ecosystem?",
        answer: "They work with suppliers, traders, and logistics teams to prepare goods for compliant dispatch.",
      },
    ],
    relatedRoles: ["suppliers", "quality-testing-labs", "exporters"],
  },
  {
    slug: "quality-testing-labs",
    displayName: "Quality Testing Labs",
    shortDescription: "Validate commodity quality parameters and strengthen execution trust.",
    longDescription:
      "Quality testing labs can join OBAOL Supreme as execution-critical associates to provide inspection and quality validation support across trade workflows.",
    roleScope: ["Commodity quality testing", "Inspection and reporting support", "Quality assurance for execution stages"],
    supportPoints: ["Quality confidence for counterparties", "Structured role in execution lifecycle", "Collaboration with suppliers, exporters, and buyers"],
    iconKey: "qualityLab",
    seo: {
      title: "Quality Testing Labs on OBAOL | Associate Role",
      description:
        "Quality testing labs can onboard to OBAOL Supreme to provide commodity inspection and validation support for reliable trade execution.",
      keywords: ["quality testing labs", "commodity inspection", "agri lab services", "quality verification in trade"],
    },
    faqs: [
      {
        question: "Can independent commodity labs join as associates?",
        answer: "Yes. Registered testing labs can onboard and collaborate directly within the trade execution ecosystem.",
      },
      {
        question: "Why are quality labs important for OBAOL trades?",
        answer: "They improve trust, reduce disputes, and support standardized quality validation before movement and settlement.",
      },
    ],
    relatedRoles: ["suppliers", "exporters", "agritech-companies"],
  },
  {
    slug: "agritech-companies",
    displayName: "Agritech Companies",
    shortDescription: "Integrate technology capabilities that improve sourcing, quality, and execution.",
    longDescription:
      "Agritech companies can participate in the OBAOL ecosystem by enabling better traceability, operational intelligence, and execution support for commodity workflows.",
    roleScope: ["Trade-tech enablement", "Execution intelligence support", "Integration-led ecosystem collaboration"],
    supportPoints: ["One-stop ecosystem integration", "Operational visibility support", "Value-added capabilities for trade participants"],
    iconKey: "agritech",
    seo: {
      title: "Agritech Companies on OBAOL | Associate Role",
      description:
        "Agritech companies can join OBAOL Supreme as associate partners to integrate technology capabilities across commodity sourcing and execution workflows.",
      keywords: ["agritech companies", "agri technology platform", "commodity traceability", "trade tech integration"],
    },
    faqs: [
      {
        question: "Can agritech firms join even if they are service-led?",
        answer: "Yes. Agritech companies are part of the expanded associate ecosystem and can collaborate across execution flows.",
      },
      {
        question: "How does agritech improve trade execution on OBAOL?",
        answer: "Agritech capabilities can enhance traceability, visibility, and data-driven decision support across the workflow.",
      },
    ],
    relatedRoles: ["quality-testing-labs", "suppliers", "procurement-partners"],
  },
  {
    slug: "customs-clearance-agencies",
    displayName: "Customs Clearance Agencies",
    shortDescription: "Support customs documentation and border compliance workflows.",
    longDescription:
      "Customs clearance agencies can onboard to OBAOL Supreme to support compliant border transitions and reduce delay risk in international commodity flows.",
    roleScope: ["Customs process support", "Border documentation coordination", "Clearance milestone handling"],
    supportPoints: ["Compliance-aligned execution", "Cross-role coordination", "Reduced border process friction"],
    iconKey: "customs",
    seo: {
      title: "Customs Clearance Agencies on OBAOL | Associate Role",
      description:
        "Customs clearance agencies can join OBAOL Supreme to support documentation, compliance, and smooth border execution in global commodity trade.",
      keywords: ["customs clearance", "trade compliance", "border documentation", "import export customs partner"],
    },
    faqs: [
      {
        question: "Can customs agencies work with both importers and exporters on OBAOL?",
        answer: "Yes. Customs associates can collaborate across both inbound and outbound trade workflows.",
      },
      {
        question: "Is customs support limited to one geography?",
        answer: "No. The ecosystem is built for India-first operations with global expansion across key corridors.",
      },
    ],
    relatedRoles: ["importers", "exporters", "freight-forwarders"],
  },
  {
    slug: "finance-insurance-partners",
    displayName: "Finance & Insurance Partners",
    shortDescription: "Provide financial and risk support services for smoother trade execution.",
    longDescription:
      "Finance and insurance partners can participate in OBAOL Supreme by supporting trade continuity through risk management and financial service alignment.",
    roleScope: ["Trade risk support", "Finance coordination touchpoints", "Execution continuity services"],
    supportPoints: ["Risk-aware ecosystem collaboration", "Structured participation in execution lifecycle", "Alignment with trade completion outcomes"],
    iconKey: "finance",
    seo: {
      title: "Finance & Insurance Partners on OBAOL | Associate Role",
      description:
        "Finance and insurance service providers can join OBAOL Supreme as associates to support risk-aware commodity trade execution.",
      keywords: ["trade finance", "commodity insurance", "risk management partners", "trade support services"],
    },
    faqs: [
      {
        question: "Can non-trading finance service providers join as associates?",
        answer: "Yes. OBAOL supports partner roles that improve execution reliability and risk handling.",
      },
      {
        question: "How do finance and insurance partners add value on OBAOL?",
        answer: "They support resilient execution by enabling risk and continuity support across trade workflows.",
      },
    ],
    relatedRoles: ["traders", "importers", "exporters"],
  },
  {
    slug: "procurement-partners",
    displayName: "Procurement Partners",
    shortDescription: "Drive sourcing alignment between market demand and supply capabilities.",
    longDescription:
      "Procurement partners can use OBAOL Supreme to align demand-side sourcing goals with supplier ecosystems and execution support across the trade lifecycle.",
    roleScope: ["Demand-aligned sourcing", "Supplier network coordination", "Execution readiness management"],
    supportPoints: ["Sourcing intelligence support", "Partner coordination across roles", "Integrated one-stop execution framework"],
    iconKey: "procurement",
    seo: {
      title: "Procurement Partners on OBAOL | Associate Role",
      description:
        "Procurement partners can join OBAOL Supreme to coordinate sourcing and supplier alignment in a structured commodity trade execution environment.",
      keywords: ["procurement partner", "commodity sourcing", "supplier coordination", "trade procurement platform"],
    },
    faqs: [
      {
        question: "Who should join as a procurement partner?",
        answer: "Organizations focused on strategic sourcing and supplier coordination across commodity categories can onboard.",
      },
      {
        question: "Can procurement partners collaborate with agritech and labs on OBAOL?",
        answer: "Yes. The ecosystem is built for cross-role coordination, including technology and quality assurance support.",
      },
    ],
    relatedRoles: ["suppliers", "agritech-companies", "traders"],
  },
];

export const associateRoleDefinitions: AssociateRoleDefinition[] = roles;

export const associateRoleSlugs = associateRoleDefinitions.map((role) => role.slug);

export const getAssociateRolePath = (slug: string) => `/roles/associate/${slug}`;

export const getAssociateRoleBySlug = (slug: string) =>
  associateRoleDefinitions.find((role) => role.slug === slug);
