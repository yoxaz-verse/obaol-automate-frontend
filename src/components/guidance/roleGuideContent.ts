import { DASHBOARD_ROUTE_MANIFEST } from "../../utils/dashboardAccess.ts";
import type { DashboardRouteDefinition } from "../../utils/dashboardAccess.ts";
import { associateGuideTopics, getAssociateGuideTopics } from "./associateGuideContent.ts";
import type { AssociateGuideProfile, AssociateGuideTopic } from "./associateGuideContent.ts";

export type GuideRole = "associate" | "operator";
export type GuideCategory = "start" | "responsibilities" | "routine" | "journey" | "reference" | "support";
export type GuideApprovalState = "ANY" | "ONBOARDING" | "PENDING" | "REJECTED" | "APPROVED";

export type GuideScreenshot = {
  src: string;
  alt: string;
  caption: string;
};

export type RoleGuideTopic = Omit<AssociateGuideTopic, "category" | "approval" | "screenshot"> & {
  category: GuideCategory;
  approval: GuideApprovalState;
  role: GuideRole;
  responsibility: string;
  boundaries: string[];
  importantFields: string[];
  statusMeanings: string[];
  escalation: string;
  screenshot: GuideScreenshot;
  section?: DashboardRouteDefinition["section"];
};

export const roleGuideCategories: Array<{ id: GuideCategory; label: string; description: string }> = [
  { id: "start", label: "Start Here", description: "Access, setup, navigation, and first-day readiness." },
  { id: "responsibilities", label: "Role Responsibilities", description: "What you own, share, verify, and escalate." },
  { id: "routine", label: "Daily Routine", description: "A repeatable operating checklist for every working day." },
  { id: "journey", label: "Guided Journeys", description: "Complete common work from beginning to end." },
  { id: "reference", label: "Every Page", description: "Field-level help for every page in your navigation." },
  { id: "support", label: "Troubleshooting", description: "Resolve access, ownership, data, and workflow problems." },
];

const screenshotByPath: Record<string, string> = {
  "/dashboard": "dashboard.webp",
  "/dashboard/product": "product-listing.webp",
  "/dashboard/catalog": "marketplace.webp",
  "/dashboard/marketplace": "marketplace.webp",
  "/dashboard/enquiries": "enquiry.webp",
  "/dashboard/sample-requests": "enquiry.webp",
  "/dashboard/orders": "orders.webp",
  "/dashboard/documents": "documents.webp",
  "/dashboard/documentation": "documents.webp",
  "/dashboard/company": "company.webp",
  "/dashboard/settings": "company.webp",
};

const screenshotFor = (route: DashboardRouteDefinition): GuideScreenshot => ({
  src: `/images/guidance/associate/${screenshotByPath[route.path] || (route.section === "Trade" ? "orders.webp" : route.section === "Products" ? "marketplace.webp" : route.section === "Organization" || route.section === "Operations/Admin" ? "company.webp" : "dashboard.webp")}`,
  alt: `${route.label} workspace showing its navigation, filters, records, status information, and available actions`,
  caption: `Use the highlighted navigation, status, and record controls on ${route.label} to complete the task described below.`,
});

const roleResponsibility = (role: GuideRole, route: DashboardRouteDefinition) => role === "associate"
  ? `Represent the registered business on ${route.label}; keep commercial, company, and transaction information accurate and authorized.`
  : `Coordinate assigned operational work on ${route.label}; verify evidence, keep records current, and escalate commercial or policy decisions to the responsible business or administrator.`;

const routeFields = (route: DashboardRouteDefinition) => {
  const byStage: Record<string, string[]> = {
    overview: ["priority cards", "status summaries", "next actions", "recent activity"],
    discover: ["search terms", "product or service filters", "location", "availability and listing status"],
    negotiate: ["parties", "product and variant", "quantity", "price or commercial terms", "responsibility and status"],
    sample: ["sample quantity", "dispatch details", "evaluation notes", "approval status"],
    execute: ["linked enquiry", "parties", "milestones", "documents", "delivery and completion status"],
    service: ["service requirement", "location", "dates", "capacity or quantity", "provider and execution status"],
    organize: ["record owner", "contact details", "capabilities", "status", "updated time"],
    administer: ["assignment", "coverage", "verification status", "activity", "escalation owner"],
  };
  return byStage[route.journeyStage] || ["record owner", "status", "required details", "last update"];
};

const makeRouteTopic = (role: GuideRole, route: DashboardRouteDefinition): RoleGuideTopic => {
  const fields = routeFields(route);
  const operator = role === "operator";
  return {
    id: route.helpId,
    category: "reference",
    title: route.label,
    summary: route.description,
    audience: ["all"],
    keywords: [route.path, route.section, route.taskGroup, route.journeyStage, ...fields],
    route: route.path,
    pageName: route.label,
    approval: "APPROVED",
    role,
    section: route.section,
    responsibility: roleResponsibility(role, route),
    boundaries: operator
      ? ["Do not approve commercial terms for a company unless authority is explicitly assigned.", "Do not overwrite counterparty evidence or hide unresolved discrepancies."]
      : ["Only submit information your business is authorized to provide.", "Do not confirm another party's work or mark a real-world milestone complete without evidence."],
    importantFields: fields,
    prerequisites: ["Approved workspace access", "The correct company, assignment, or transaction context", `Current information needed for ${route.label}`],
    steps: [
      `Open ${route.label} from the ${route.section} navigation section.`,
      `Confirm the page context and review ${fields.slice(0, 2).join(" and ")} before selecting a record.`,
      "Use search, tabs, and filters to isolate the item that actually requires action.",
      `Review and complete the relevant ${fields.slice(2).join(", ")} fields using current evidence.`,
      "Save or submit once, wait for confirmation, then reopen the record to verify its status and activity history.",
    ],
    outcome: `${route.label} shows the correct business state, responsible party, and next action without creating a duplicate or losing prior history.`,
    statusMeanings: ["Draft: not yet submitted or visible to the next participant.", "Active or Open: available and awaiting the next recorded action.", "Completed or Closed: the real-world outcome has been confirmed and no normal action remains."],
    troubleshooting: ["If a control is unavailable, confirm role access, approval state, record ownership, and required fields.", "If a save appears unsuccessful, check for field errors and refresh the record before submitting again.", "If displayed data conflicts with source documents, stop the workflow and escalate instead of silently correcting history."],
    escalation: "Use Customer Support for persistent technical errors, locked ownership, or conflicting company data. Include the page, record ID, expected result, and a non-sensitive screenshot.",
    related: route.path === "/dashboard/customer-support" ? ["dashboard"] : ["dashboard", "customer-support"],
    screenshot: screenshotFor(route),
  };
};

const sharedStart = (role: GuideRole): RoleGuideTopic[] => {
  const operator = role === "operator";
  const baseRoute = DASHBOARD_ROUTE_MANIFEST.find((route) => route.path === "/dashboard")!;
  const base = makeRouteTopic(role, baseRoute);
  return [
    {
      ...base, id: `${role}-responsibilities`, category: "responsibilities", title: `${operator ? "Operator and Team" : "Associate"} responsibilities and boundaries`,
      summary: operator ? "Understand how to coordinate execution without taking unauthorized commercial decisions." : "Understand how to represent your company and keep its commercial activity accurate.",
      responsibility: operator ? "Own assigned coordination, evidence checks, timely status updates, and escalation." : "Own authorized company identity, listings, enquiries, commercial decisions, and transaction confirmations.",
      importantFields: ["record owner", "responsible party", "status", "evidence", "next action"],
      steps: operator
        ? ["Work only within your assigned coverage and permissions.", "Verify the record and supporting evidence before changing status.", "Coordinate the named participants and record meaningful updates.", "Escalate pricing, contract, compliance, dispute, and exception decisions.", "End each task with a clear owner, status, and next action."]
        : ["Confirm you are acting for the correct registered company.", "Keep company capabilities, contacts, listings, and requirements current.", "Review commercial terms before accepting or issuing them.", "Complete real-world milestones only after they occur.", "Escalate locked data, ownership conflicts, or platform errors with evidence."],
      related: ["dashboard", "customer-support"],
    },
    {
      ...base, id: `${role}-daily-routine`, category: "routine", title: `${operator ? "Operator" : "Associate"} daily operating routine`,
      summary: "Use the same review, action, verification, and handoff discipline every day.",
      responsibility: "Keep assigned work current so another participant can understand the latest state without an offline explanation.",
      importantFields: ["notifications", "priority", "owner", "deadline", "status", "next action"],
      steps: ["Open Notifications and the Dashboard; identify overdue, blocked, and newly assigned work.", "Review enquiries, samples, orders, and service executions in priority order.", "Complete actions only after checking the record history and supporting information.", "Verify every saved change and give unresolved work a named owner and next action.", "Before finishing, clear handled alerts and escalate blockers with the record ID and evidence."],
      related: ["dashboard", "notifications", "customer-support"],
    },
    {
      ...base, id: `${role}-troubleshooting`, category: "support", title: "Resolve access, ownership, and data problems",
      summary: "Diagnose common problems safely before opening a support conversation.",
      responsibility: "Protect record history and provide support with enough context to investigate quickly.",
      importantFields: ["page URL", "record ID", "current status", "expected result", "error text", "time observed"],
      steps: ["Confirm you are signed into the intended account and company.", "Check approval, capability, assignment, and record ownership.", "Review required fields and visible validation messages; do not repeatedly submit.", "Refresh once and reopen the record from navigation to confirm whether the change persisted.", "If unresolved, contact support with the page, record ID, expected result, actual result, and a non-sensitive screenshot."],
      related: ["customer-support", "settings"],
    },
  ];
};

const enrichAssociate = (topic: AssociateGuideTopic): RoleGuideTopic => {
  const route = topic.route ? DASHBOARD_ROUTE_MANIFEST.find((candidate) => candidate.path === topic.route) : undefined;
  const base = makeRouteTopic("associate", route || DASHBOARD_ROUTE_MANIFEST[0]);
  return {
    ...base,
    ...topic,
    role: "associate",
    category: topic.category,
    responsibility: roleResponsibility("associate", route || DASHBOARD_ROUTE_MANIFEST[0]),
    boundaries: base.boundaries,
    importantFields: route ? routeFields(route) : base.importantFields,
    statusMeanings: base.statusMeanings,
    escalation: base.escalation,
    screenshot: topic.screenshot || base.screenshot,
    section: route?.section,
  };
};

export const getNavigableGuideRoutes = (role: GuideRole) => DASHBOARD_ROUTE_MANIFEST.filter((route) =>
  route.nav && route.roles.includes(role) && !(role === "associate" && route.hiddenFromAssociateNav),
);

export function getRoleGuideTopics(role: GuideRole, profile: AssociateGuideProfile = "both"): RoleGuideTopic[] {
  const routes = getNavigableGuideRoutes(role);
  const references = routes.map((route) => makeRouteTopic(role, route));
  const starts = sharedStart(role);
  if (role === "operator") {
    const journeyRoutes = ["/dashboard/enquiries", "/dashboard/orders", "/dashboard/execution-enquiries", "/dashboard/warehouses/operations"];
    const journeys = references.filter((topic) => journeyRoutes.includes(topic.route || "")).map((topic) => ({ ...topic, id: `operator-${topic.id}-journey`, category: "journey" as const, title: `${topic.title}: operator workflow` }));
    return [...starts, ...journeys, ...references];
  }
  const curated = getAssociateGuideTopics(profile).map(enrichAssociate);
  const curatedRoutes = new Set(curated.filter((topic) => topic.category === "reference").map((topic) => topic.route));
  return [...starts, ...curated, ...references.filter((topic) => !curatedRoutes.has(topic.route))];
}

export function searchRoleGuideTopics(topics: RoleGuideTopic[], query: string): RoleGuideTopic[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return topics;
  return topics.filter((topic) => [
    topic.title, topic.summary, topic.pageName || "", topic.route || "", topic.responsibility, topic.escalation,
    ...topic.keywords, ...topic.boundaries, ...topic.importantFields, ...topic.prerequisites, ...topic.steps,
    topic.outcome, ...topic.statusMeanings, ...topic.troubleshooting,
  ].join(" ").toLowerCase().includes(normalized));
}

export const hasCompleteGuideCoverage = (role: GuideRole) => {
  const references = getRoleGuideTopics(role).filter((topic) => topic.category === "reference");
  return getNavigableGuideRoutes(role).every((route) => references.some((topic) => topic.route === route.path && topic.screenshot?.src));
};

export { associateGuideTopics };
