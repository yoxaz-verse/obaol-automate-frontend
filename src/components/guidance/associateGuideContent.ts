export type AssociateGuideAudience = "all" | "buyer" | "seller" | "service";
export type AssociateGuideCategory = "start" | "journey" | "reference";
export type AssociateApprovalState = "ANY" | "ONBOARDING" | "PENDING" | "APPROVED";

export type AssociateGuideScreenshot = {
  src: string;
  alt: string;
  caption: string;
};

export type AssociateGuideTopic = {
  id: string;
  category: AssociateGuideCategory;
  title: string;
  summary: string;
  audience: AssociateGuideAudience[];
  keywords: string[];
  route?: string;
  pageName?: string;
  approval: AssociateApprovalState;
  prerequisites: string[];
  steps: string[];
  outcome: string;
  troubleshooting: string[];
  related: string[];
  screenshot?: AssociateGuideScreenshot;
};

export type AssociateGuideProfile = "buyer" | "seller" | "both" | "service" | "incomplete";

export const associateGuideCategories: Array<{ id: AssociateGuideCategory; label: string; description: string }> = [
  { id: "start", label: "Start Here", description: "Set up your account and learn the workspace." },
  { id: "journey", label: "Guided Journeys", description: "Complete common tasks from beginning to end." },
  { id: "reference", label: "Page Reference", description: "Look up every associate workspace page." },
];

const image = (name: string, alt: string, caption: string): AssociateGuideScreenshot => ({
  src: `/images/guidance/associate/${name}.webp`,
  alt,
  caption,
});

export const associateGuideTopics: AssociateGuideTopic[] = [
  {
    id: "account-and-onboarding", category: "start", title: "Complete your associate onboarding",
    summary: "Create your personal profile, connect your company, and submit the information OBAOL needs to review your account.",
    audience: ["all"], keywords: ["signup", "registration", "gst", "company", "verification"], route: "/dashboard/onboarding", pageName: "Onboarding", approval: "ONBOARDING",
    prerequisites: ["A verified email address", "Your company and contact details", "Business and compliance information relevant to your role"],
    steps: ["Open Onboarding after signing in.", "Complete every required personal and company field; use the helper text beneath a field when the expected format is unclear.", "Choose the capabilities your company provides and the capabilities it is looking for.", "Review the information for spelling, legal-name, contact, and document errors.", "Select the final submit action and wait for the confirmation screen before leaving the page."],
    outcome: "Your onboarding is submitted and the account moves to review instead of returning to an incomplete form.",
    troubleshooting: ["If submission is blocked, return to the first step showing an error and complete the highlighted field.", "If the company already exists, use the existing company match instead of creating a duplicate.", "If verification information is rejected, confirm it matches the legal record before contacting support."],
    related: ["approval-and-access", "company-readiness", "getting-around"], screenshot: image("onboarding", "Annotated associate onboarding form showing required fields, capability selection, and submit action", "Complete required fields, select accurate capabilities, then submit for review."),
  },
  {
    id: "approval-and-access", category: "start", title: "Understand approval and access",
    summary: "Know what you can do while onboarding, pending review, approved, or returned for correction.",
    audience: ["all"], keywords: ["pending", "approved", "rejected", "access", "review"], route: "/dashboard/pending-approval", pageName: "Pending approval", approval: "ANY",
    prerequisites: ["A signed-in associate account"],
    steps: ["Check the status shown after sign-in.", "If onboarding is incomplete, finish the form before expecting workspace access.", "If review is pending, use Guidance and account settings while OBAOL reviews the submission.", "If changes are requested, open the access-status page, correct the stated issue, and resubmit.", "After approval, refresh the session and use the dashboard navigation to begin trading tasks."],
    outcome: "You understand the current account state and take the correct next action without repeatedly submitting the same information.",
    troubleshooting: ["If an approved account still shows pending, sign out and sign in again before opening support.", "A restricted guide link explains its approval requirement; it does not bypass access controls."],
    related: ["account-and-onboarding", "first-day-checklist", "support"],
  },
  {
    id: "company-readiness", category: "start", title: "Prepare your company workspace",
    summary: "Confirm that company identity, capabilities, contacts, and operational details are ready before starting a trade.",
    audience: ["all"], keywords: ["company", "capabilities", "contacts", "profile"], route: "/dashboard/company", pageName: "My Company", approval: "APPROVED",
    prerequisites: ["An approved associate account linked to a company"],
    steps: ["Open Settings and choose My Company.", "Confirm the legal name, trade name, contact information, and operating locations.", "Review provided and sought capabilities because they personalize the dashboard and this guide.", "Add or correct relevant business details and save the changes.", "Return to the dashboard and confirm the recommended actions match your work."],
    outcome: "Your company profile accurately represents what you provide and what you need on OBAOL.",
    troubleshooting: ["If the company is wrong or duplicated, do not create another record; contact support with the correct company name.", "If guidance looks unrelated, update company capabilities and reload the page."],
    related: ["getting-around", "first-day-checklist", "profile-and-security"], screenshot: image("company", "Annotated My Company page showing company details, capabilities, and save controls", "Keep company identity and capabilities current so OBAOL can show relevant workflows."),
  },
  {
    id: "getting-around", category: "start", title: "Find your way around the dashboard",
    summary: "Use navigation, search, notifications, and status cues to move between discovery, negotiation, and execution.",
    audience: ["all"], keywords: ["dashboard", "navigation", "search", "status", "notifications"], route: "/dashboard", pageName: "Dashboard", approval: "ANY",
    prerequisites: ["A signed-in account"],
    steps: ["Use the main navigation to move between Products, Trade, Services, Warehouse, Organization, and Support.", "Start from the dashboard action cards when you are unsure what needs attention.", "Use page tabs and filters to separate open, completed, and role-specific records.", "Open Notifications for updates that link back to the affected record.", "Use Guidance search when you know the task but not the page."],
    outcome: "You can locate a task and return to its related record without relying on browser history.",
    troubleshooting: ["If a menu item is not visible, check approval state and company capabilities.", "On mobile, open the compact navigation before looking for the same desktop section labels."],
    related: ["first-day-checklist", "notifications", "support"], screenshot: image("dashboard", "Annotated associate dashboard showing navigation, action cards, and status areas", "Use the dashboard for priorities and the navigation for the full workspace."),
  },
  {
    id: "first-day-checklist", category: "start", title: "Follow the first-day checklist",
    summary: "Verify the essentials before publishing, enquiring, or handling an order.",
    audience: ["all"], keywords: ["checklist", "first day", "setup", "ready"], route: "/dashboard", pageName: "Dashboard", approval: "APPROVED",
    prerequisites: ["Approved access"],
    steps: ["Confirm your personal profile and password-recovery details.", "Review My Company and correct capabilities or contacts.", "Open Notifications and clear any setup requests.", "Browse the Commodity Directory and Trade Listings to learn how records are presented.", "Choose one relevant guided journey below and complete it using accurate business information."],
    outcome: "Your account is ready for normal daily use and your first workflow starts from reliable data.",
    troubleshooting: ["Do not publish test pricing or placeholder compliance details in a live listing.", "Use Customer Support when a company-level field is locked or owned by another user."],
    related: ["company-readiness", "discover-opportunity", "publish-listing"],
  },
  {
    id: "discover-opportunity", category: "journey", title: "Discover a trade opportunity",
    summary: "Search the commodity directory and active trade listings, then open the right record before starting an enquiry.",
    audience: ["buyer", "seller"], keywords: ["discover", "commodity", "marketplace", "search", "listing"], route: "/dashboard/marketplace", pageName: "Trade Listings", approval: "APPROVED",
    prerequisites: ["Approved access", "A clear product, specification, quantity, and market requirement"],
    steps: ["Open Commodity Directory when you want to understand available products and variants.", "Use Trade Listings when you are ready to review active commercial opportunities.", "Search by product and use available filters to narrow the results.", "Open a listing and verify specification, location, quantity, pricing context, and the responsible company.", "Choose the enquiry action only after the listing matches your requirement or supply."],
    outcome: "You reach the enquiry workflow from a relevant product or listing with the correct context attached.",
    troubleshooting: ["Broaden filters if a known product is missing.", "Do not treat a directory entry as confirmed availability; check the active listing and enquire.", "Use support if the listing information is internally inconsistent."],
    related: ["catalog-reference", "marketplace-reference", "raise-enquiry"], screenshot: image("marketplace", "Annotated Trade Listings page showing search, filters, listing details, and enquiry action", "Filter the listings, verify the commercial context, then begin an enquiry."),
  },
  {
    id: "publish-listing", category: "journey", title: "Publish and maintain a trade listing",
    summary: "Add an accurate product offer, verify it promptly, and manage its marketplace visibility.",
    audience: ["seller"], keywords: ["publish", "product", "rate", "price", "variant", "sell"], route: "/dashboard/product", pageName: "My Trade Listings", approval: "APPROVED",
    prerequisites: ["Approved seller capability", "Product specification, commercial terms, and availability"],
    steps: ["Open My Trade Listings and choose Create trade listing.", "Select the correct product and variant rather than creating a near-duplicate.", "Enter the requested pricing, quantity, location, and commercial details.", "Review every detail before saving because published listing information and pricing cannot be edited.", "Open the saved listing immediately to confirm it. A mistaken listing can be deleted and recreated only during its first hour; afterward only its Live or Offline status can change."],
    outcome: "A complete listing is saved under the correct company and can be discovered in the intended marketplace state.",
    troubleshooting: ["If a product or variant is missing, confirm the classification before requesting a new catalog entry.", "If you find an error during the first hour, delete the listing and create a corrected one.", "After one hour the listing is locked; take it Offline when its price, terms, or availability are no longer current."],
    related: ["product-reference", "inventory-reference", "respond-enquiry"], screenshot: image("product-listing", "Annotated My Trade Listings page showing create action, listing state, and locked-listing controls", "Create a complete listing, verify it during the first hour, and manage its Live or Offline state afterward."),
  },
  {
    id: "raise-enquiry", category: "journey", title: "Raise a buying enquiry",
    summary: "Turn a relevant listing into a clear request that the other party can evaluate and answer.",
    audience: ["buyer"], keywords: ["buy", "enquiry", "requirement", "quantity", "terms"], route: "/dashboard/enquiries", pageName: "Enquiries", approval: "APPROVED",
    prerequisites: ["Approved buyer capability", "A selected product or listing", "Required quantity, delivery context, and commercial expectations"],
    steps: ["Begin from the selected listing or open Enquiries and choose the available create action.", "Confirm the buyer, seller or supplier context, product, and variant.", "Enter quantity, target timing, location, and the requested commercial terms.", "Add only relevant notes and supporting information.", "Submit once, then open the enquiry record to track replies and next actions."],
    outcome: "The enquiry appears in your enquiry list with enough information for the counterparty to respond.",
    troubleshooting: ["If submission fails, check that product, parties, quantity, and required terms are present.", "Avoid creating a second enquiry while the first submission is still processing.", "Use the enquiry history to clarify changes instead of silently replacing agreed details."],
    related: ["discover-opportunity", "respond-enquiry", "enquiries-reference"], screenshot: image("enquiry", "Annotated enquiry workspace showing role tabs, status, filters, and record actions", "Use role and status views to find the enquiry that needs action."),
  },
  {
    id: "respond-enquiry", category: "journey", title: "Respond to and progress an enquiry",
    summary: "Review the requirement, clarify terms, record responsibility, and move an agreed enquiry toward execution.",
    audience: ["seller", "buyer"], keywords: ["respond", "negotiate", "status", "responsibility", "convert"], route: "/dashboard/enquiries", pageName: "Enquiries", approval: "APPROVED",
    prerequisites: ["An enquiry assigned to or involving your company"],
    steps: ["Open Enquiries and select the correct buying or selling view.", "Open the record and read product, quantity, parties, terms, and history before responding.", "Add the requested response or clarification and update only the status supported by the current agreement.", "Confirm responsibility assignments and required documents before conversion.", "Use the order-creation or progression action when the commercial terms are ready."],
    outcome: "The enquiry history clearly shows the current terms, responsible parties, and next execution step.",
    troubleshooting: ["Do not mark an enquiry agreed while required terms are still unresolved.", "If you cannot edit a responsibility, check whether it belongs to the counterparty or OBAOL.", "Escalate disputed or inconsistent details through support rather than deleting history."],
    related: ["raise-enquiry", "handle-sample", "progress-order"],
  },
  {
    id: "handle-sample", category: "journey", title: "Handle a sample request",
    summary: "Request, dispatch, review, and record a sample before commercial execution.",
    audience: ["buyer", "seller"], keywords: ["sample", "dispatch", "approval", "quality"], route: "/dashboard/sample-requests", pageName: "Sample Requests", approval: "APPROVED",
    prerequisites: ["An eligible enquiry or product context", "Sample quantity, delivery details, and evaluation criteria"],
    steps: ["Open Sample Requests from the Trade section or the related enquiry.", "Create or open the sample record and confirm product, parties, quantity, and delivery details.", "The supplying party records dispatch information and relevant notes.", "The receiving party records the evaluation result and any compliance observations.", "Update the final sample status so the enquiry can proceed with an auditable result."],
    outcome: "The sample decision and supporting notes are attached to the correct trade context.",
    troubleshooting: ["Do not record a sample against a similar but unrelated enquiry.", "If dispatch or decision controls are unavailable, confirm which party owns the next action."],
    related: ["respond-enquiry", "quality-labs-reference", "progress-order"],
  },
  {
    id: "progress-order", category: "journey", title: "Progress an order to delivery",
    summary: "Track an agreed trade through milestones, documents, logistics, and completion.",
    audience: ["buyer", "seller"], keywords: ["order", "milestone", "delivery", "shipment", "execute"], route: "/dashboard/orders", pageName: "Orders", approval: "APPROVED",
    prerequisites: ["An enquiry ready for conversion or an assigned order", "Confirmed parties and commercial terms"],
    steps: ["Open Orders and select the status view containing the record.", "Review the linked enquiry and confirm parties, quantities, terms, and responsibilities.", "Complete milestones in sequence and record meaningful updates when a state changes.", "Attach or link required commercial, compliance, and shipment documents.", "Confirm delivery and completion only when the real-world milestone is satisfied."],
    outcome: "The order timeline reflects the real execution state and gives both parties a reliable record.",
    troubleshooting: ["Do not skip milestones merely to make the order appear current.", "If an order differs from the enquiry, resolve the discrepancy before continuing.", "Use the Execution Panel or support when ownership of the next step is unclear."],
    related: ["orders-reference", "manage-documents", "execution-reference"], screenshot: image("orders", "Annotated Orders page showing status tabs, order cards, milestones, and linked actions", "Track the order in the correct status view and update milestones as work is completed."),
  },
  {
    id: "manage-documents", category: "journey", title: "Create and manage trade documents",
    summary: "Keep quotations, invoices, compliance files, and shipment paperwork connected to the right transaction.",
    audience: ["buyer", "seller"], keywords: ["document", "quotation", "invoice", "upload", "compliance"], route: "/dashboard/documents", pageName: "Documents", approval: "APPROVED",
    prerequisites: ["The related enquiry or order", "A complete and authorized document file or document details"],
    steps: ["Use Documents for files linked to transaction execution; use Document Studio for standalone business documents.", "Choose the correct recipient and document type.", "Enter or verify parties, references, amounts, dates, and type-specific details before saving.", "Issue the document, then download its PDF or create a secure invitation link.", "Open the saved record to verify readability, status, and recipient activity."],
    outcome: "The correct transaction contains a readable, traceable document with accurate parties and references.",
    troubleshooting: ["Never upload sensitive files to an unrelated order.", "If totals or party details are wrong, correct the source fields before issuing the document.", "Use a supported file type and a clear filename when an upload fails."],
    related: ["documents-reference", "commercial-documents-reference", "progress-order"], screenshot: image("documents", "Annotated Documents page showing upload, document type, transaction link, and status", "Link each file to the correct transaction and verify it after upload."),
  },
  {
    id: "use-supporting-services", category: "journey", title: "Use logistics and supporting services",
    summary: "Find import, warehouse, quality-testing, inventory, and external-order tools at the right execution stage.",
    audience: ["buyer", "seller", "service"], keywords: ["imports", "warehouse", "quality", "inventory", "external order", "services"], route: "/dashboard/execution-enquiries", pageName: "Execution Panel", approval: "APPROVED",
    prerequisites: ["A defined operational need and the related product, enquiry, or order details"],
    steps: ["Open the relevant service page instead of recording the request as a generic enquiry.", "Provide the product, location, dates, quantity, and compliance context the service requires.", "Link the request to an existing trade record when the interface provides that option.", "Track the service status and keep contact or booking details current.", "Return to the order or execution record and record the completed milestone."],
    outcome: "The supporting service has enough context to act and remains connected to the trade workflow.",
    troubleshooting: ["A directory result is not a confirmed booking; complete the request or contact step.", "For off-platform transactions, use External Orders so execution remains traceable."],
    related: ["imports-reference", "warehouse-booking-reference", "quality-labs-reference", "external-orders-reference"],
  },
  ...[
    ["product-reference", "My Trade Listings", "/dashboard/product", "Create, review, update, or deactivate the product offers published by your company.", ["seller"]],
    ["catalog-reference", "Commodity Directory", "/dashboard/catalog", "Browse standardized products and variants before selecting the right commercial context.", ["all"]],
    ["marketplace-reference", "Trade Listings", "/dashboard/marketplace", "Find current commodity listings and begin a relevant enquiry.", ["buyer", "seller"]],
    ["enquiries-reference", "Enquiries", "/dashboard/enquiries", "Manage buying and selling requirements, responses, responsibilities, and conversion.", ["buyer", "seller"]],
    ["sample-requests-reference", "Sample Requests", "/dashboard/sample-requests", "Track sample creation, dispatch, evaluation, and approval.", ["buyer", "seller"]],
    ["orders-reference", "Orders", "/dashboard/orders", "Track confirmed trades through execution milestones and delivery.", ["buyer", "seller"]],
    ["documents-reference", "Documents", "/dashboard/documents", "Upload and review compliance and shipment documents linked to trade records.", ["buyer", "seller"]],
    ["commercial-documents-reference", "Document Studio", "/dashboard/commercial-documents", "Create, share, and track standalone business documents.", ["buyer", "seller"]],
    ["execution-reference", "Execution Panel", "/dashboard/execution-enquiries", "Monitor active execution work and company-specific operational responsibilities.", ["buyer", "seller", "service"]],
    ["imports-reference", "Imports to India", "/dashboard/imports", "Coordinate import requests, shipment context, and compliance progress.", ["buyer", "seller", "service"]],
    ["external-orders-reference", "External Orders", "/dashboard/external-orders", "Record and track an order that originated outside OBAOL.", ["buyer", "seller", "service"]],
    ["warehouse-booking-reference", "Warehouse Booking", "/dashboard/warehouse-rent", "Find storage capacity and submit a warehouse requirement.", ["buyer", "seller", "service"]],
    ["warehouses-reference", "Warehouses", "/dashboard/warehouses", "Maintain warehouse locations and capacity relevant to your operations.", ["seller", "service"]],
    ["quality-labs-reference", "Quality Labs", "/dashboard/quality-labs", "Find testing laboratories and review their available services and contact details.", ["buyer", "seller", "service"]],
    ["inventory-reference", "Inventory", "/dashboard/inventory", "Review product availability and keep operational stock information current.", ["seller", "service"]],
    ["referrals-reference", "Referrals and Earnings", "/dashboard/referrals", "Review associate referrals and the status of related earnings records.", ["all"]],
    ["company-reference", "My Company", "/dashboard/company", "Maintain company identity, contacts, capabilities, and workspace readiness.", ["all"]],
    ["notifications", "Notifications", "/dashboard/notifications", "Review account and workflow alerts, then open the affected record.", ["all"]],
    ["profile-and-security", "Profile and Security", "/dashboard/settings", "Maintain personal details, password, passkeys, devices, and account preferences.", ["all"]],
    ["support", "Customer Support", "/dashboard/customer-support", "Start or continue a support conversation when guidance cannot resolve the issue.", ["all"]],
  ].map(([id, title, route, summary, audience]) => ({
    id: id as string,
    category: "reference" as const,
    title: title as string,
    summary: summary as string,
    audience: audience as AssociateGuideAudience[],
    keywords: `${title} ${summary}`.toLowerCase().split(/\s+/),
    route: route as string,
    pageName: title as string,
    approval: "APPROVED" as const,
    prerequisites: ["Approved associate access", "The business information needed for this task"],
    steps: [`Open ${title} from the dashboard navigation.`, "Choose the appropriate tab, filter, or record before taking action.", "Review the existing information and confirm that it belongs to the correct company and transaction.", "Complete the available task using accurate, current information.", "Save or submit, then reopen the record and verify its status."],
    outcome: `The ${title} record reflects the current business state and is available from the associate workspace.`,
    troubleshooting: ["If an action is unavailable, check approval state, capability, record ownership, and required fields.", "Use Customer Support for locked company data, ownership conflicts, or an error that persists after reloading."],
    related: id === "support" ? ["getting-around", "approval-and-access"] : ["getting-around", "support"],
  })),
];

const buyerSignals = ["buyer", "buying", "sourcing", "procurement", "importing-to-india"];
const sellerSignals = ["seller", "selling", "supplier", "exporting-from-india", "manufacturer", "processor"];
const serviceSignals = ["warehouse-storage", "testing", "logistics", "insurance", "finance", "service-provider"];

export function inferAssociateGuideProfile(provided: string[] = [], sought: string[] = []): AssociateGuideProfile {
  const values = [...provided, ...sought].map((value) => String(value).toLowerCase());
  if (!values.length) return "incomplete";
  const hasBuyer = values.some((value) => buyerSignals.some((signal) => value.includes(signal)));
  const hasSeller = values.some((value) => sellerSignals.some((signal) => value.includes(signal)));
  if (hasBuyer && hasSeller) return "both";
  if (hasBuyer) return "buyer";
  if (hasSeller) return "seller";
  if (values.some((value) => serviceSignals.some((signal) => value.includes(signal)))) return "service";
  return "service";
}

export function getAssociateGuideTopics(profile: AssociateGuideProfile): AssociateGuideTopic[] {
  const audiences = profile === "both" ? ["all", "buyer", "seller"] : profile === "incomplete" ? ["all"] : ["all", profile];
  return associateGuideTopics.filter((topic) => topic.audience.some((audience) => audiences.includes(audience)));
}

export function searchAssociateGuideTopics(topics: AssociateGuideTopic[], query: string): AssociateGuideTopic[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return topics;
  return topics.filter((topic) => [
    topic.title, topic.summary, topic.pageName || "", topic.route || "", ...topic.keywords,
    ...topic.prerequisites, ...topic.steps, topic.outcome, ...topic.troubleshooting,
  ].join(" ").toLowerCase().includes(normalized));
}
