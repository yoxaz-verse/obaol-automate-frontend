import {
  getAccessibleDashboardRoutes,
  normalizeDashboardRole,
  type DashboardRole,
} from "@/utils/dashboardAccess";

export type ApprovalState = "ONBOARDING" | "PENDING" | "APPROVED" | "REJECTED";

export type ExperienceContext = {
  role: DashboardRole | null;
  approvalState: ApprovalState;
  providedCapabilities: string[];
  soughtCapabilities: string[];
  assignments: string[];
  featurePermissions: string[];
};

export const deriveExperienceContext = (user: {
  role?: unknown;
  registrationStatus?: unknown;
  onboardingComplete?: boolean;
  providedCapabilities?: string[];
  soughtCapabilities?: string[];
  assignments?: string[];
} | null | undefined): ExperienceContext => {
  const role = normalizeDashboardRole(user?.role);
  const providedCapabilities = Array.isArray(user?.providedCapabilities) ? user.providedCapabilities : [];
  const soughtCapabilities = Array.isArray(user?.soughtCapabilities) ? user.soughtCapabilities : [];
  const capabilities = Array.from(new Set([...providedCapabilities, ...soughtCapabilities]));
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
    approvalState,
    providedCapabilities,
    soughtCapabilities,
    assignments: Array.isArray(user?.assignments) ? user.assignments : [],
    featurePermissions: role
      ? getAccessibleDashboardRoutes({ role, capabilities }).map((route) => route.path)
      : [],
  };
};
