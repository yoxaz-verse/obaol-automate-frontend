export const DEV_TOKEN_KEY = "obaol_dev_access_token";

export function getDeveloperToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(DEV_TOKEN_KEY);
}

export function setDeveloperToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEV_TOKEN_KEY, token);
}

export function clearDeveloperToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DEV_TOKEN_KEY);
}
