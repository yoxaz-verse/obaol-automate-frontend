import {
  getAccessibleDashboardRoutes,
  normalizeDashboardRole,
  normalizeTradeMode,
  type DashboardRole,
  type TradeMode,
} from "@/utils/dashboardAccess";

export type ApprovalState = "ONBOARDING" | "PENDING" | "APPROVED" | "REJECTED";

export type ExperienceContext = {
  role: DashboardRole | null;
  tradeMode: TradeMode;
  approvalState: ApprovalState;
  interests: string[];
  assignments: string[];
  featurePermissions: string[];
};

export const deriveExperienceContext = (user: {
  role?: unknown;
  tradeMode?: unknown;
  registrationStatus?: unknown;
  onboardingComplete?: boolean;
  companyInterests?: string[];
  assignments?: string[];
} | null | undefined): ExperienceContext => {
  const role = normalizeDashboardRole(user?.role);
  const tradeMode = normalizeTradeMode(user?.tradeMode, user?.role);
  const interests = Array.isArray(user?.companyInterests) ? user.companyInterests : [];
  const status = String(user?.registrationStatus || "APPROVED").toUpperCase();
  const approvalState: ApprovalState = user?.onboardingComplete === false
    ? "ONBOARDING"
    : status === "REJECTED"
      ? "REJECTED"
      : status !== "APPROVED"
        ? "PENDING"
        : "APPROVED";

  return {
    role,
    tradeMode,
    approvalState,
    interests,
    assignments: Array.isArray(user?.assignments) ? user.assignments : [],
    featurePermissions: role
      ? getAccessibleDashboardRoutes({ role, tradeMode, companyInterests: interests }).map((route) => route.path)
      : [],
  };
};
