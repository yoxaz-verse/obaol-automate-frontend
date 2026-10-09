export type PasswordResetRole = "Admin" | "Operator" | "Associate" | "CustomerSupport";

export const getPasswordResetRole = (role: string): PasswordResetRole => {
  const normalizedRole = String(role || "").trim().toLowerCase();

  if (normalizedRole === "admin") return "Admin";
  if (normalizedRole === "operator" || normalizedRole === "team") return "Operator";
  if (["customersupport", "customer-support", "customer_support"].includes(normalizedRole)) return "CustomerSupport";
  return "Associate";
};

export const getSignInPathForRole = (role: string): string => {
  const passwordResetRole = getPasswordResetRole(role);

  if (passwordResetRole === "Admin") return "/auth/admin";
  if (passwordResetRole === "Operator") return "/auth/operator";
  if (passwordResetRole === "CustomerSupport") return "/auth/customer-support";
  return "/auth/associate";
};
