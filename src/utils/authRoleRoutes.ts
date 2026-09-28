export type PasswordResetRole = "Admin" | "Operator" | "Associate";

export const getPasswordResetRole = (role: string): PasswordResetRole => {
  const normalizedRole = String(role || "").trim().toLowerCase();

  if (normalizedRole === "admin") return "Admin";
  if (normalizedRole === "operator" || normalizedRole === "team") return "Operator";
  return "Associate";
};

export const getSignInPathForRole = (role: string): string => {
  const passwordResetRole = getPasswordResetRole(role);

  if (passwordResetRole === "Admin") return "/auth/admin";
  if (passwordResetRole === "Operator") return "/auth/operator";
  return "/auth/associate";
};
