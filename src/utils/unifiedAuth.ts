export type PublicAuthRole = "Associate" | "Operator";
export type AuthMode = "signin" | "signup";

export type AuthStatus = {
  tone: "info" | "success" | "error";
  message: string;
  code?: string;
};

export const normalizeAuthError = (error: any): AuthStatus => {
  const code = String(error?.response?.data?.code || error?.code || "AUTH_ERROR");
  const retryAfter = Number(error?.response?.data?.retryAfterSeconds || 0);
  const messages: Record<string, string> = {
    INVALID_CREDENTIALS: "The email or password is incorrect.",
    ACCOUNT_EXISTS: "An account already exists for this email. Please sign in instead.",
    OTP_EXPIRED: "That verification code is invalid or has expired. Request a new code and try again.",
    ACCOUNT_BLOCKED: "This account cannot access OBAOL. Contact support if you believe this is a mistake.",
    ACCOUNT_PENDING: "Your registration is still awaiting approval.",
    SESSION_COOKIE_BLOCKED: "Your browser blocked the secure session cookie. Allow cookies for OBAOL and try again.",
    AUTH_UNAVAILABLE: "Sign-in is temporarily unavailable. Please try again.",
  };
  if (code === "RATE_LIMITED" || code === "LOGIN_COOLDOWN") {
    return { tone: "error", code: "RATE_LIMITED", message: retryAfter > 0 ? `Too many attempts. Try again in ${retryAfter} seconds.` : "Too many attempts. Please wait and try again." };
  }
  const isNetwork = error?.message === "Network Error" || error?.code === "ERR_NETWORK";
  return {
    tone: "error",
    code,
    message: isNetwork ? "We could not reach OBAOL. Check your connection and try again." : messages[code] || error?.response?.data?.message || error?.message || "Something went wrong. Please try again.",
  };
};

export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const authDestination = (user: any) => {
  const role = String(user?.role || "").toLowerCase();
  const status = String(user?.registrationStatus || "APPROVED").toUpperCase();
  if (["associate", "operator", "team"].includes(role) && user?.onboardingComplete === false) return "/dashboard/onboarding";
  if (["associate", "operator", "team"].includes(role) && status !== "APPROVED") return "/dashboard/pending-approval";
  return "/dashboard";
};

export const formatAuthCountdown = (milliseconds: number) => {
  const total = Math.max(0, Math.ceil(milliseconds / 1000));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};
