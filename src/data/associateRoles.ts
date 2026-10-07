export type AssociateRoleIconKey = "trader" | "importer" | "exporter" | "warehouse" | "inlandTransport" | "freightForwarder" | "logistics" | "supplier" | "packaging" | "qualityLab" | "agritech" | "customs" | "finance" | "procurement";
export type AssociateRoleGroup = "trade" | "supply-procurement" | "logistics-quality-compliance" | "finance-technology";
export type AssociateParticipationMode = "BUY" | "SELL" | "BOTH" | "SERVICE";

export interface AssociateRoleFaqItem { question: string; answer: string }
export interface AssociateRoleDefinition {
  slug: string;
  displayName: string;
  group: AssociateRoleGroup;
  participationModes: AssociateParticipationMode[];
  iconKey: AssociateRoleIconKey;
  shortDescription: string;
  bestFor: string;
  longDescription: string;
  eligibility: string[];
  responsibilities: string[];
  workflow: string[];
  platformBenefits: string[];
  availableNow: string[];
  comingNext: string[];
  collaborationOpportunities: string[];
  prerequisites: string[];
  ctaLabel: string;
  registrationIntent: AssociateParticipationMode;
  seo: { title: string; description: string; keywords: string[] };
  faqs: AssociateRoleFaqItem[];
  relatedRoles: string[];
}

export const associateRoleGroups: Array<{ key: AssociateRoleGroup; label: string; description: string }> = [
  { key: "trade", label: "Trade", description: "Companies that buy, sell, import, or export commodities through structured trade workflows." },
  { key: "supply-procurement", label: "Supply & Procurement", description: "Businesses that bring credible supply and organized demand into the marketplace." },
  { key: "logistics-quality-compliance", label: "Logistics, Quality & Compliance", description: "Service companies that prepare, verify, store, clear, and move goods through execution." },
  { key: "finance-technology", label: "Finance & Technology", description: "Specialist businesses that support funding, risk protection, and trade-enabling technology." },
];

const companyPrerequisites = ["Legal company name and business contact details", "Registered office and applicable tax or legal ID", "Accurate operating locations and capabilities", "An authorized representative who can act for the company"];
const servicePrerequisites = ["Registered company and operating address", "Accurate service capabilities and operating locations", "Applicable licenses, registrations, or credentials", "Authorized commercial and operational contacts"];

type AssociateRoleBase = Omit<AssociateRoleDefinition, "availableNow" | "comingNext" | "collaborationOpportunities">;

const roles: AssociateRoleBase[] = [
  {
    slug: "traders", displayName: "Traders", group: "trade", participationModes: ["BUY", "SELL", "BOTH"], iconKey: "trader",
    shortDescription: "Buy and sell commodities through one accountable execution workflow.",
    bestFor: "Registered commodity trading houses, merchant traders, and wholesale trading companies.",
    longDescription: "Trader Associates are registered businesses that source, buy, and sell commodities. OBAOL gives the company one place to move an enquiry from commercial interest through documents, fulfilment, and closure.",
    eligibility: ["A registered business entity", "An active commodity buying or selling operation", "A team able to support trade documents and decisions"],
    responsibilities: ["Create or respond to genuine commodity demand", "Keep company and commodity information current", "Coordinate counterparty decisions and documents", "Remain accountable through trade completion"],
    workflow: ["Choose Buy, Sell, or Buy & Sell", "Complete company and capability verification", "Create enquiries or respond to relevant opportunities", "Track documents and milestones through closure"],
    platformBenefits: ["Role-aware buying and selling workflows", "Company and counterparty verification context", "Shared enquiry, order, and document progress", "Coordination with execution service companies"],
    prerequisites: companyPrerequisites, ctaLabel: "Register your trading company", registrationIntent: "BOTH",
    seo: { title: "Commodity Trading Companies on OBAOL | Associate Role", description: "Learn how registered commodity trading companies buy, sell, and coordinate trade execution as verified OBAOL Associates.", keywords: ["commodity trading company", "buy and sell commodities", "verified commodity trade"] },
    faqs: [{ question: "Who should register as a Trader Associate?", answer: "A registered company that actively buys, sells, or does both in commodity markets. Individual professionals should explore the Operator role instead." }, { question: "Does registration guarantee a transaction?", answer: "No. Transactions depend on genuine demand, supply, verification, and commercial agreement." }],
    relatedRoles: ["suppliers", "importers", "exporters"],
  },
  {
    slug: "importers", displayName: "Importers", group: "trade", participationModes: ["BUY", "BOTH"], iconKey: "importer",
    shortDescription: "Source commodities across borders and coordinate destination-side execution.",
    bestFor: "Registered import houses, processors, distributors, and buyers sourcing overseas.",
    longDescription: "Importer Associates bring commodities into a destination market. Their OBAOL journey connects sourcing decisions with supplier coordination, documents, freight, customs, and receipt milestones.",
    eligibility: ["A registered company permitted to conduct imports", "A genuine commodity sourcing requirement", "A team able to manage import documentation"],
    responsibilities: ["Define product, quantity, destination, and delivery requirements", "Confirm supplier and commercial decisions", "Provide buyer-side documents on time", "Coordinate clearance, receipt, and settlement"],
    workflow: ["Choose Buy or Buy & Sell", "Record company, market, and commodity capabilities", "Raise or manage a sourcing enquiry", "Coordinate supplier, freight, customs, and delivery milestones"],
    platformBenefits: ["Structured sourcing and enquiry records", "Visibility across documents and order stages", "Coordination with freight, customs, warehouse, and transport companies", "A consistent trail from requirement to receipt"],
    prerequisites: companyPrerequisites, ctaLabel: "Register your importing company", registrationIntent: "BUY",
    seo: { title: "Commodity Importers on OBAOL | Associate Role", description: "See how registered commodity importers source supply and coordinate documents, freight, customs, and delivery on OBAOL.", keywords: ["commodity importer", "international sourcing", "import workflow"] },
    faqs: [{ question: "Can a company that also sells register as an importer?", answer: "Yes. Choose Buy & Sell and record the company’s complete capabilities." }, { question: "Does OBAOL replace customs or freight providers?", answer: "No. OBAOL structures the workflow; qualified service companies perform their respective activities." }],
    relatedRoles: ["exporters", "freight-forwarders", "customs-clearance-agencies"],
  },
  {
    slug: "exporters", displayName: "Exporters", group: "trade", participationModes: ["SELL", "BOTH"], iconKey: "exporter",
    shortDescription: "Prepare domestic supply for overseas buyers and shipment execution.",
    bestFor: "Registered exporters, producer-exporters, and trading companies serving global buyers.",
    longDescription: "Exporter Associates sell commodities into international markets. OBAOL connects their supply response with quality, packaging, documents, logistics, and shipment milestones.",
    eligibility: ["A registered company permitted to conduct exports", "Commodity supply or sourcing capability", "A team for buyer and shipment coordination"],
    responsibilities: ["Present accurate product and supply information", "Respond to genuine buyer requirements", "Coordinate quality, packaging, and export documents", "Maintain shipment updates through completion"],
    workflow: ["Choose Sell or Buy & Sell", "Complete company and supply capabilities", "Respond to buyer requirements and confirm terms", "Coordinate readiness, documents, shipment, and delivery"],
    platformBenefits: ["Structured demand-response workflow", "Visibility across pre-shipment stages", "Coordination with labs, packaging, freight, and customs companies", "Centralized progress and document context"],
    prerequisites: companyPrerequisites, ctaLabel: "Register your exporting company", registrationIntent: "SELL",
    seo: { title: "Commodity Exporters on OBAOL | Associate Role", description: "Learn how registered commodity exporters coordinate supply, quality, documentation, and shipment execution through OBAOL.", keywords: ["commodity exporter", "agri export platform", "export execution"] },
    faqs: [{ question: "Can producer-owned companies join as exporters?", answer: "Yes, when the registered business can meet the applicable export, product, quality, and documentation requirements." }, { question: "Can exporters also source commodities?", answer: "Yes. Companies that source and sell should choose Buy & Sell during registration." }],
    relatedRoles: ["suppliers", "quality-testing-labs", "freight-forwarders"],
  },
  {
    slug: "suppliers", displayName: "Suppliers", group: "supply-procurement", participationModes: ["SELL", "BOTH"], iconKey: "supplier",
    shortDescription: "Bring credible commodity supply into active buyer-led workflows.",
    bestFor: "Registered producers, processors, aggregators, distributors, and supply companies.",
    longDescription: "Supplier Associates can fulfil commodity requirements. OBAOL helps them present supply accurately, respond to enquiries, and coordinate the steps that make a confirmed lot ready for delivery.",
    eligibility: ["A registered business with legitimate supply capability", "Traceable product, origin, and quantity information", "Ability to support quality, documentation, and fulfilment"],
    responsibilities: ["Maintain accurate product information", "Respond only against supply the business can substantiate", "Support samples, quality checks, and documents", "Coordinate packing, dispatch, and settlement milestones"],
    workflow: ["Choose Sell or Buy & Sell", "Add commodity and supply capabilities", "Respond to relevant buyer enquiries", "Move confirmed supply through quality, documents, and delivery"],
    platformBenefits: ["Demand-linked enquiry participation", "A structured response and fulfilment record", "Coordination with packaging, testing, warehouse, and logistics services", "Visibility into the current stage and next action"],
    prerequisites: companyPrerequisites, ctaLabel: "Register your supply company", registrationIntent: "SELL",
    seo: { title: "Commodity Suppliers on OBAOL | Associate Role", description: "See how registered commodity suppliers respond to demand and coordinate quality, documents, and fulfilment on OBAOL.", keywords: ["commodity supplier", "agri supplier", "sell commodities"] },
    faqs: [{ question: "Does a supplier need to be an exporter?", answer: "No. Domestic suppliers can participate in suitable domestic workflows." }, { question: "Can a supplier join without company details?", answer: "No. Associate accounts represent registered businesses and require company information for review." }],
    relatedRoles: ["traders", "packaging-companies", "quality-testing-labs"],
  },
  {
    slug: "procurement-partners", displayName: "Procurement Partners", group: "supply-procurement", participationModes: ["BUY", "BOTH", "SERVICE"], iconKey: "procurement",
    shortDescription: "Translate organizational demand into controlled sourcing activity.",
    bestFor: "Registered procurement firms, institutional sourcing teams, and managed-sourcing businesses.",
    longDescription: "Procurement Partner Associates organize demand, supplier discovery, and sourcing follow-through. OBAOL provides a structured path from requirement definition to supplier response and execution readiness.",
    eligibility: ["A registered organization with a procurement function", "Authority to represent genuine sourcing demand", "Clear commodity and delivery requirements"],
    responsibilities: ["Create complete sourcing requirements", "Coordinate supplier evaluation", "Maintain decision and documentation status", "Work with execution providers after confirmation"],
    workflow: ["Register the buying or service company", "Record procurement and commodity capabilities", "Create enquiries for approved requirements", "Coordinate responses, selection, and execution"],
    platformBenefits: ["Consistent requirement capture", "Organized supplier-response workflow", "Shared procurement visibility", "Connection to quality, logistics, and compliance steps"],
    prerequisites: companyPrerequisites, ctaLabel: "Register your procurement company", registrationIntent: "BUY",
    seo: { title: "Commodity Procurement Partners on OBAOL | Associate Role", description: "Learn how registered procurement organizations structure demand and coordinate commodity sourcing through OBAOL.", keywords: ["commodity procurement", "strategic sourcing", "procurement company"] },
    faqs: [{ question: "Is this role for an internal employee?", answer: "The account belongs to the registered organization. An authorized employee may operate it for the company." }, { question: "Can procurement firms provide managed sourcing?", answer: "Yes, where that is a genuine registered company capability." }],
    relatedRoles: ["suppliers", "quality-testing-labs", "logistics-providers"],
  },
  {
    slug: "warehouse-owners", displayName: "Warehouse Owners", group: "logistics-quality-compliance", participationModes: ["SERVICE"], iconKey: "warehouse",
    shortDescription: "Provide accountable storage, handling, and dispatch support.",
    bestFor: "Registered warehouse operators, storage companies, and commodity handling facilities.",
    longDescription: "Warehouse Associates provide physical storage and handling at defined locations. OBAOL records their capabilities for relevant storage, stock-handling, and dispatch workflows.",
    eligibility: ["A registered company operating storage facilities", "Verifiable facility locations and capabilities", "An operational contact for dispatch coordination"],
    responsibilities: ["Keep facility information accurate", "Confirm capacity before commitment", "Coordinate receipt, storage, handling, and release", "Provide required service records"],
    workflow: ["Choose Provide Trade Services", "Add facility locations and capabilities", "Review relevant storage requirements", "Coordinate receipt, storage, and dispatch milestones"],
    platformBenefits: ["Capability-aware service visibility", "Coordination with traders and suppliers", "Handoffs to transport providers", "A shared execution-status record"],
    prerequisites: servicePrerequisites, ctaLabel: "Register your warehouse business", registrationIntent: "SERVICE",
    seo: { title: "Commodity Warehouse Companies on OBAOL | Associate Role", description: "Learn how registered warehouse businesses provide storage, handling, and dispatch services in OBAOL workflows.", keywords: ["commodity warehouse", "warehouse operator", "storage company"] },
    faqs: [{ question: "Can a company register multiple warehouse locations?", answer: "Yes. Provide accurate operating locations and capabilities for the registered company." }, { question: "Does registration guarantee assignments?", answer: "No. Participation depends on capability fit, location, active requirements, verification, and acceptance." }],
    relatedRoles: ["inland-transportation", "logistics-providers", "suppliers"],
  },
  {
    slug: "inland-transportation", displayName: "Inland Transportation", group: "logistics-quality-compliance", participationModes: ["SERVICE"], iconKey: "inlandTransport",
    shortDescription: "Move commodities between origin, facility, port, and destination points.",
    bestFor: "Registered road transporters, fleet operators, and first- or last-mile companies.",
    longDescription: "Inland Transportation Associates carry commodities across domestic trade legs. OBAOL uses their location and capabilities to support movement requirements and milestone coordination.",
    eligibility: ["A registered transportation business", "Operational coverage and vehicle or carrier capability", "A team able to coordinate pickups and deliveries"],
    responsibilities: ["Confirm route, cargo, capacity, and timing", "Coordinate pickup and delivery handoffs", "Maintain movement and exception updates", "Support applicable transport documents"],
    workflow: ["Choose Provide Trade Services", "Record coverage and transport capabilities", "Review relevant movement requirements", "Coordinate pickup, transit, and delivery milestones"],
    platformBenefits: ["Location- and capability-aware participation", "Clear cargo and route context", "Coordination with warehouses and forwarders", "Milestone visibility"],
    prerequisites: servicePrerequisites, ctaLabel: "Register your transport company", registrationIntent: "SERVICE",
    seo: { title: "Inland Transportation Companies on OBAOL | Associate Role", description: "See how registered inland transport companies support commodity pickup, movement, handoffs, and delivery through OBAOL.", keywords: ["inland transportation", "commodity transport", "first mile logistics"] },
    faqs: [{ question: "Can a transporter support export cargo?", answer: "Yes. Inland legs can support international shipments when route, cargo, and capability fit." }, { question: "How are requirements matched?", answer: "Company capability and location provide context; the provider must review each requirement and accept its terms." }],
    relatedRoles: ["warehouse-owners", "freight-forwarders", "logistics-providers"],
  },
  {
    slug: "freight-forwarders", displayName: "Freight Forwarders", group: "logistics-quality-compliance", participationModes: ["SERVICE"], iconKey: "freightForwarder",
    shortDescription: "Coordinate international freight bookings, routes, and shipment handoffs.",
    bestFor: "Registered freight forwarders and international cargo coordination companies.",
    longDescription: "Freight Forwarder Associates coordinate international movement between exporters, importers, carriers, ports, and destination partners inside the wider execution record.",
    eligibility: ["A registered forwarding business", "Relevant route, mode, and cargo capabilities", "An operations team for shipment coordination"],
    responsibilities: ["Confirm route, mode, schedule, and cargo fit", "Coordinate booking and carrier activity", "Maintain shipment and document status", "Manage partner handoffs"],
    workflow: ["Choose Provide Trade Services", "Record lanes, modes, and capabilities", "Review international freight requirements", "Coordinate booking, shipment, and handoffs"],
    platformBenefits: ["Trade context alongside the freight request", "Structured shipper and consignee collaboration", "Shipment milestone visibility", "Coordination with customs and inland companies"],
    prerequisites: servicePrerequisites, ctaLabel: "Register your forwarding company", registrationIntent: "SERVICE",
    seo: { title: "Freight Forwarding Companies on OBAOL | Associate Role", description: "Learn how registered freight forwarders coordinate international commodity shipments and partner handoffs through OBAOL.", keywords: ["freight forwarder", "commodity freight", "international shipping"] },
    faqs: [{ question: "Can a forwarder register selected lanes only?", answer: "Yes. Record the routes, modes, and capabilities the company actually supports." }, { question: "Does OBAOL act as the carrier?", answer: "No. Registered service companies and carriers perform transport; OBAOL supports the workflow." }],
    relatedRoles: ["customs-clearance-agencies", "inland-transportation", "importers"],
  },
  {
    slug: "logistics-providers", displayName: "Logistics Providers", group: "logistics-quality-compliance", participationModes: ["SERVICE"], iconKey: "logistics",
    shortDescription: "Manage multi-leg cargo operations across the trade lifecycle.",
    bestFor: "Registered 3PLs, integrated logistics firms, and multimodal service companies.",
    longDescription: "Logistics Provider Associates support one or more operational legs of a commodity trade. Their capabilities define which transport, handling, and coordination requirements they can undertake.",
    eligibility: ["A registered logistics company", "Documented service coverage and capabilities", "Operational ownership for services offered"],
    responsibilities: ["Define actual services and geographies", "Review requirements before accepting work", "Coordinate service legs and handoffs", "Maintain milestone and exception information"],
    workflow: ["Choose Provide Trade Services", "Add functions, sub-functions, and locations", "Review capability-relevant requirements", "Coordinate accepted work through completion"],
    platformBenefits: ["Capability-based participation", "Context across multiple trade legs", "Shared handoff visibility", "Collaboration with specialist companies"],
    prerequisites: servicePrerequisites, ctaLabel: "Register your logistics company", registrationIntent: "SERVICE",
    seo: { title: "Logistics Service Companies on OBAOL | Associate Role", description: "See how registered logistics providers coordinate commodity movement and operational handoffs through OBAOL.", keywords: ["logistics provider", "commodity logistics", "3PL company"] },
    faqs: [{ question: "How is this different from freight forwarding?", answer: "A logistics provider may cover several domestic or multimodal services; freight forwarding is presented separately for international shipment coordination." }, { question: "Can one company have several capabilities?", answer: "Yes. Record all genuine functions and sub-functions under the company profile." }],
    relatedRoles: ["inland-transportation", "freight-forwarders", "warehouse-owners"],
  },
  {
    slug: "packaging-companies", displayName: "Packaging Companies", group: "logistics-quality-compliance", participationModes: ["SERVICE"], iconKey: "packaging",
    shortDescription: "Prepare commodity lots for handling, compliance, and dispatch.",
    bestFor: "Registered industrial packaging, bagging, repacking, and export-packaging businesses.",
    longDescription: "Packaging Company Associates prepare commodity lots for storage and movement against confirmed requirements. OBAOL connects their work to readiness and documentation stages.",
    eligibility: ["A registered packaging-services business", "Suitable facilities and materials", "Ability to work against defined product requirements"],
    responsibilities: ["Confirm format, quantity, and timing", "Perform agreed packing services", "Coordinate with supply and quality teams", "Update readiness records"],
    workflow: ["Choose Provide Trade Services", "Record packaging functions and locations", "Review product-specific requirements", "Coordinate completion and dispatch handoff"],
    platformBenefits: ["Linkage to the underlying requirement", "Coordination with suppliers and labs", "Readiness milestone visibility", "Connected warehouse or transport handoff"],
    prerequisites: servicePrerequisites, ctaLabel: "Register your packaging company", registrationIntent: "SERVICE",
    seo: { title: "Commodity Packaging Companies on OBAOL | Associate Role", description: "Learn how registered packaging companies support commodity readiness and dispatch handoffs through OBAOL.", keywords: ["commodity packaging", "export packaging", "packing services"] },
    faqs: [{ question: "Can a packaging company join without trading?", answer: "Yes. Choose Provide Trade Services and record packaging capabilities." }, { question: "Are packaging standards set by OBAOL?", answer: "Requirements come from the product, transaction, buyer, and regulatory context." }],
    relatedRoles: ["suppliers", "quality-testing-labs", "warehouse-owners"],
  },
  {
    slug: "quality-testing-labs", displayName: "Quality Testing Labs", group: "logistics-quality-compliance", participationModes: ["SERVICE"], iconKey: "qualityLab",
    shortDescription: "Test commodity parameters and return traceable quality evidence.",
    bestFor: "Registered or accredited laboratories and commodity inspection businesses.",
    longDescription: "Quality Testing Lab Associates provide inspection, sampling, or analytical services. Their results support informed acceptance and quality milestones attached to an order.",
    eligibility: ["A registered laboratory or inspection business", "Relevant tests, certifications, and accepted items", "Contacts for sample and report coordination"],
    responsibilities: ["Publish accurate tests and credentials", "Confirm sample and test suitability", "Perform agreed analysis", "Return reports and milestone updates"],
    workflow: ["Choose Provide Trade Services", "Record tests, certifications, and locations", "Review relevant quality requirements", "Coordinate sampling, testing, and reports"],
    platformBenefits: ["Detailed lab capability profiles", "Quality tasks linked to the trade", "Supplier and buyer coordination", "Report and milestone context"],
    prerequisites: servicePrerequisites, ctaLabel: "Register your testing laboratory", registrationIntent: "SERVICE",
    seo: { title: "Commodity Quality Testing Labs on OBAOL | Associate Role", description: "See how registered commodity laboratories coordinate samples, analysis, and quality reports on OBAOL.", keywords: ["commodity testing lab", "quality inspection", "agri laboratory"] },
    faqs: [{ question: "Should a lab record its specific tests?", answer: "Yes. Tests, certifications, locations, and accepted items describe its genuine capabilities." }, { question: "Does OBAOL certify lab results?", answer: "No. The laboratory remains responsible for its credentials, methods, and reports." }],
    relatedRoles: ["suppliers", "exporters", "packaging-companies"],
  },
  {
    slug: "customs-clearance-agencies", displayName: "Customs Clearance Agencies", group: "logistics-quality-compliance", participationModes: ["SERVICE"], iconKey: "customs",
    shortDescription: "Coordinate border filings, clearance steps, and customs handoffs.",
    bestFor: "Registered customs brokers, clearance agencies, and border-documentation companies.",
    longDescription: "Customs Clearance Agency Associates support compliant border movement. OBAOL connects their clearance activity with the importer, exporter, freight, and shipment record.",
    eligibility: ["A registered business authorized for its services", "Relevant port or market coverage", "Qualified customs coordination staff"],
    responsibilities: ["Confirm shipment and jurisdiction requirements", "Coordinate filings and supporting documents", "Maintain clearance status", "Manage release handoffs"],
    workflow: ["Choose Provide Trade Services", "Record clearance capabilities and locations", "Review international-trade requirements", "Coordinate documents, clearance, and release"],
    platformBenefits: ["Context from the underlying trade", "Connected document milestones", "Importer, exporter, and forwarder coordination", "Authorized visibility of clearance progress"],
    prerequisites: servicePrerequisites, ctaLabel: "Register your clearance agency", registrationIntent: "SERVICE",
    seo: { title: "Customs Clearance Agencies on OBAOL | Associate Role", description: "Learn how registered customs agencies coordinate commodity documents, clearance, and handoffs through OBAOL.", keywords: ["customs clearance agency", "customs broker", "border documentation"] },
    faqs: [{ question: "Can an agency support imports and exports?", answer: "Yes, when authorized and capable in the relevant jurisdictions." }, { question: "Does OBAOL provide customs approval?", answer: "No. Authorized companies and authorities remain responsible for regulated decisions." }],
    relatedRoles: ["importers", "exporters", "freight-forwarders"],
  },
  {
    slug: "finance-partners", displayName: "Finance Partners", group: "finance-technology", participationModes: ["SERVICE"], iconKey: "finance",
    shortDescription: "Evaluate and support eligible trade-finance requirements.",
    bestFor: "Regulated lenders, trade-finance providers, and registered financial institutions.",
    longDescription: "Finance Partner Associates may evaluate finance needs connected to genuine trade activity. Each provider retains its own eligibility, diligence, pricing, and approval process.",
    eligibility: ["An appropriately authorized finance business", "A defined trade-finance capability", "Qualified representatives for diligence"],
    responsibilities: ["State product requirements accurately", "Conduct independent diligence", "Coordinate authorized documents", "Maintain relevant finance status"],
    workflow: ["Choose Provide Trade Services", "Record finance capabilities and markets", "Review eligible execution-linked requirements", "Complete provider-led diligence and decisions"],
    platformBenefits: ["Underlying trade context", "Structured access to authorized documents", "Milestone coordination", "Clear provider ownership of approval"],
    prerequisites: servicePrerequisites, ctaLabel: "Register your finance company", registrationIntent: "SERVICE",
    seo: { title: "Trade Finance Partners on OBAOL | Associate Role", description: "See how authorized finance businesses evaluate eligible execution-linked trade requirements through OBAOL.", keywords: ["trade finance provider", "commodity finance", "finance company"] },
    faqs: [{ question: "Does OBAOL guarantee finance approval?", answer: "No. Every provider applies its own eligibility, diligence, risk, pricing, and approval process." }, { question: "Is OBAOL the lender?", answer: "No. The finance company provides the financial service; OBAOL supports the connected workflow." }],
    relatedRoles: ["traders", "importers", "insurance-partners"],
  },
  {
    slug: "insurance-partners", displayName: "Insurance Partners", group: "finance-technology", participationModes: ["SERVICE"], iconKey: "customs",
    shortDescription: "Evaluate suitable cargo and trade-risk coverage requirements.",
    bestFor: "Authorized insurers, brokers, and registered trade-risk service companies.",
    longDescription: "Insurance Partner Associates support suitable risk-cover requirements. Coverage, pricing, issuance, and claims remain subject to the provider’s terms and authority.",
    eligibility: ["An appropriately authorized insurance business", "Relevant cargo or trade-risk capability", "Qualified underwriting representatives"],
    responsibilities: ["Define coverage accurately", "Conduct provider-led assessment", "Coordinate policy documents", "Support claims-readiness records"],
    workflow: ["Choose Provide Trade Services", "Record insurance capabilities and markets", "Review suitable coverage requirements", "Complete provider-led assessment and documentation"],
    platformBenefits: ["Coverage context linked to execution", "Structured document coordination", "Movement milestone visibility", "Provider ownership of underwriting"],
    prerequisites: servicePrerequisites, ctaLabel: "Register your insurance company", registrationIntent: "SERVICE",
    seo: { title: "Commodity Insurance Partners on OBAOL | Associate Role", description: "Learn how authorized insurance businesses coordinate suitable cargo and trade-risk coverage requirements through OBAOL.", keywords: ["cargo insurance", "commodity insurance", "trade risk"] },
    faqs: [{ question: "Does OBAOL guarantee coverage?", answer: "No. Coverage is subject to provider assessment, terms, exclusions, pricing, and approval." }, { question: "Who handles claims?", answer: "The insurer or authorized provider handles claims under the applicable policy terms." }],
    relatedRoles: ["finance-partners", "freight-forwarders", "exporters"],
  },
  {
    slug: "agritech-companies", displayName: "Agritech Companies", group: "finance-technology", participationModes: ["SERVICE"], iconKey: "agritech",
    shortDescription: "Contribute verified technology capabilities to commodity execution.",
    bestFor: "Registered agritech, traceability, inspection-tech, and trade-enablement companies.",
    longDescription: "Agritech Company Associates provide technology or data-enabled services for sourcing, traceability, quality, or execution. The company registers a specific capability, not a generic listing.",
    eligibility: ["A registered technology business", "A capability relevant to commodity trade", "An accountable delivery team"],
    responsibilities: ["Describe capability limits accurately", "Confirm fit before accepting work", "Coordinate service delivery", "Maintain progress and handoffs"],
    workflow: ["Choose Provide Trade Services", "Record technology functions and markets", "Review aligned requirements", "Coordinate agreed delivery within the trade workflow"],
    platformBenefits: ["A role based on genuine capability", "Underlying commodity context", "Supply and quality collaboration", "Structured service progress"],
    prerequisites: servicePrerequisites, ctaLabel: "Register your agritech company", registrationIntent: "SERVICE",
    seo: { title: "Agritech Companies on OBAOL | Associate Role", description: "See how registered agritech companies contribute traceability, quality, sourcing, or execution capabilities through OBAOL.", keywords: ["agritech company", "commodity traceability", "trade technology"] },
    faqs: [{ question: "Can any software company register?", answer: "The company should offer a defined capability relevant to commodity sourcing, quality, traceability, or execution." }, { question: "Does registration create an integration?", answer: "No. Integration depends on capability fit, review, scope, and an agreed implementation path." }],
    relatedRoles: ["quality-testing-labs", "procurement-partners", "suppliers"],
  },
];

const capabilityStatusBySlug: Record<string, Pick<AssociateRoleDefinition, "availableNow" | "comingNext" | "collaborationOpportunities">> = {
  traders: {
    availableNow: ["Browse the product catalogue and use suitable listed products in your own buyer or supplier conversations", "Raise buying enquiries or respond to selling opportunities while keeping the trade linked to your company", "Request samples and coordinate the selected trade through its execution milestones"],
    comingNext: ["Broader automation for matching trader demand with suitable verified supply"],
    collaborationOpportunities: ["Work with OBAOL operators on buyer discovery, supplier coordination, and repeat trading programmes"],
  },
  importers: {
    availableNow: ["Use the importer workspace to record incoming products, shipment details, and expected arrival context", "Create sourcing enquiries, review catalogue supply, and request samples before confirming a purchase", "Coordinate freight, customs, warehouse, and destination-side milestones in the connected workflow"],
    comingNext: ["Automated advance booking and reservation against incoming inventory"],
    collaborationOpportunities: ["Discuss recurring import programmes, destination distribution, and new importer-service workflows with OBAOL"],
  },
  exporters: {
    availableNow: ["Browse export-suitable commodity listings, including organic and other differentiated products", "Respond to genuine buyer enquiries and request or coordinate samples before commercial confirmation", "Track quality, packaging, documents, freight, and shipment activity around the trade"],
    comingNext: ["Expanded international buyer matching and export-market discovery automation"],
    collaborationOpportunities: ["Work with OBAOL on buyer discovery and export programmes for products that meet the required quality and documentation standards"],
  },
  suppliers: {
    availableNow: ["List products and maintain the product, origin, quantity, and company information buyers need", "Respond to relevant enquiries and manage sample requests linked to interested buyers", "Coordinate quality, packaging, dispatch, and other fulfilment milestones after confirmation"],
    comingNext: ["More automated promotion of qualified supply to matching buyer requirements"],
    collaborationOpportunities: ["Ask OBAOL to review differentiated supply for buyer-discovery and managed selling initiatives"],
  },
  "procurement-partners": {
    availableNow: ["Record the company’s sourcing capabilities and create structured procurement enquiries", "Review supplier responses, samples, and supporting product information", "Coordinate selected supply with quality, packaging, logistics, and other execution providers"],
    comingNext: ["Location-aware assignment of suitable on-ground procurement work"],
    collaborationOpportunities: ["Build managed procurement programmes with OBAOL for specific commodities, origins, or recurring requirements"],
  },
  "warehouse-owners": {
    availableNow: ["List warehouse locations, facility details, storage capabilities, and contact information", "Become discoverable to companies looking for storage near an origin, port, or destination", "Coordinate rental requirements directly with interested businesses"],
    comingNext: ["Automated warehouse availability, pricing, and in-platform booking"],
    collaborationOpportunities: ["Work with OBAOL to onboard facility data and design connected storage and handling workflows"],
  },
  "inland-transportation": {
    availableNow: ["Register route coverage, vehicle capabilities, and operating locations", "Review matched execution opportunities and submit service bids", "Coordinate awarded pickup, transit, delivery, and exception milestones"],
    comingNext: ["Richer live movement tracking and automated route-capacity matching"],
    collaborationOpportunities: ["Discuss recurring first-mile, port, warehouse, and last-mile transport programmes with OBAOL"],
  },
  "freight-forwarders": {
    availableNow: ["Publish supported lanes, transport modes, cargo capabilities, and service locations", "Review matched international freight requirements and submit bids through the execution panel", "Coordinate bookings, shipment milestones, documents, and partner handoffs for awarded work"],
    comingNext: ["Deeper carrier schedule, rate, and shipment-tracking integrations"],
    collaborationOpportunities: ["Partner with OBAOL on priority lanes, recurring shipments, and connected freight operations"],
  },
  "logistics-providers": {
    availableNow: ["Register the company’s genuine logistics functions, service areas, and operating locations", "Review capability-matched execution requirements and submit bids", "Manage accepted multi-leg work, handoffs, milestones, and exceptions"],
    comingNext: ["Expanded orchestration and tracking across multi-provider logistics plans"],
    collaborationOpportunities: ["Design integrated logistics programmes with OBAOL for repeat commodity movements"],
  },
  "packaging-companies": {
    availableNow: ["Register packaging formats, materials, facilities, and operating locations", "Review packaging requirements linked to active execution and submit a service bid", "Coordinate accepted packing, readiness, and warehouse or transport handoffs"],
    comingNext: ["More detailed packaging specification templates and capacity matching"],
    collaborationOpportunities: ["Work with OBAOL on commodity-specific, export-ready, or sustainable packaging programmes"],
  },
  "quality-testing-labs": {
    availableNow: ["List laboratory locations, supported tests, accreditations, and accepted commodities", "Review matched sampling or quality requirements through the execution workflow", "Coordinate sample receipt, testing progress, reports, and quality milestones"],
    comingNext: ["Expanded structured result exchange and laboratory-system integrations"],
    collaborationOpportunities: ["Collaborate with OBAOL on testing panels, new quality protocols, and digitally connected reports"],
  },
  "customs-clearance-agencies": {
    availableNow: ["Register supported ports, jurisdictions, clearance services, and company credentials", "Review matched clearance requirements and participate through execution bidding", "Coordinate filings, document status, customs progress, and release handoffs for awarded work"],
    comingNext: ["Deeper customs-status automation and structured filing integrations"],
    collaborationOpportunities: ["Work with OBAOL on repeat import or export clearance programmes and port-specific operating flows"],
  },
  "finance-partners": {
    availableNow: ["Register the finance company, supported markets, and trade-finance capabilities", "Review eligible execution-linked requirements with the available trade context", "Coordinate authorized documents and provider-led diligence around a potential transaction"],
    comingNext: ["Broader finance-opportunity routing and structured decision-status workflows"],
    collaborationOpportunities: ["Develop trade-specific finance programmes with OBAOL, subject to independent diligence, pricing, and approval"],
  },
  "insurance-partners": {
    availableNow: ["Register supported insurance products, markets, and cargo or trade-risk capabilities", "Review suitable coverage requirements in the context of an active trade or shipment", "Coordinate assessment and policy documentation under the provider’s own process"],
    comingNext: ["Broader automated routing of eligible trades to suitable coverage providers"],
    collaborationOpportunities: ["Develop cargo or trade-risk coverage programmes with OBAOL, subject to underwriting and policy terms"],
  },
  "agritech-companies": {
    availableNow: ["Register a specific agritech capability and the commodities, markets, and locations it supports", "Present relevant preparation, testing, traceability, quality, or execution services", "Review aligned service requirements and coordinate agreed delivery within a trade workflow"],
    comingNext: ["Deeper data exchange and platform integrations for approved agritech capabilities"],
    collaborationOpportunities: ["Pilot pre-trade, in-trade, or post-trade technology with OBAOL to improve preparation, quality, traceability, or execution"],
  },
};

export const associateRoleDefinitions: AssociateRoleDefinition[] = roles.map((role) => ({
  ...role,
  ...capabilityStatusBySlug[role.slug],
}));
export const associateRoleSlugs = associateRoleDefinitions.map((role) => role.slug);
export const getAssociateRolePath = (slug: string) => `/roles/associate/${slug}`;
export const getAssociateRoleBySlug = (slug: string) => associateRoleDefinitions.find((role) => role.slug === slug);
export const getAssociateRolesByGroup = (group: AssociateRoleGroup) => associateRoleDefinitions.filter((role) => role.group === group);
