export const ASSOCIATE_PASSWORD_REQUIREMENTS = [
  { key: "length", label: "At least 8 characters", test: (password: string) => password.length >= 8 },
  { key: "uppercase", label: "One uppercase letter", test: (password: string) => /[A-Z]/.test(password) },
  { key: "lowercase", label: "One lowercase letter", test: (password: string) => /[a-z]/.test(password) },
  { key: "number", label: "One number", test: (password: string) => /[0-9]/.test(password) },
  { key: "special", label: "One special character", test: (password: string) => /[^A-Za-z0-9\s]/.test(password) },
] as const;

export const getMissingAssociatePasswordRequirements = (password: string): string[] =>
  ASSOCIATE_PASSWORD_REQUIREMENTS.filter((requirement) => !requirement.test(password)).map(
    (requirement) => requirement.label
  );

export const isRepeatedDigitPhone = (nationalNumber: string): boolean => {
  const digits = String(nationalNumber || "").replace(/\D/g, "");
  return digits.length > 0 && /^(\d)\1+$/.test(digits);
};
