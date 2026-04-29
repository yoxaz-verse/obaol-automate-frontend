"use client";

type GoogleCredentialResponse = { credential?: string };

type GoogleButtonOptions = {
  containerId: string;
  clientId: string;
  callback: (response: GoogleCredentialResponse) => void;
  width?: number;
  maxRetries?: number;
  retryDelayMs?: number;
};

const GOOGLE_GSI_SCRIPT_ID = "google-gsi-script";
const GOOGLE_GSI_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

let gsiLoadPromise: Promise<void> | null = null;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getGoogleIdApi = () => (window as any)?.google?.accounts?.id;

export function clearGoogleButton(containerId: string) {
  if (typeof document === "undefined") return;
  const container = document.getElementById(containerId);
  if (container) container.innerHTML = "";
}

export function loadGoogleGsi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (getGoogleIdApi()) return Promise.resolve();
  if (gsiLoadPromise) return gsiLoadPromise;

  gsiLoadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(GOOGLE_GSI_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if (getGoogleIdApi()) {
        resolve();
        return;
      }
      let attempts = 0;
      const interval = window.setInterval(() => {
        if (getGoogleIdApi()) {
          window.clearInterval(interval);
          resolve();
        } else if (attempts >= 40) {
          window.clearInterval(interval);
          reject(new Error("Google GSI script present but API did not initialize."));
        }
        attempts += 1;
      }, 50);
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load Google GSI script.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_GSI_SCRIPT_ID;
    script.src = GOOGLE_GSI_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google GSI script."));
    document.body.appendChild(script);
  }).catch((err) => {
    gsiLoadPromise = null;
    throw err;
  });

  return gsiLoadPromise;
}

export async function renderGoogleButton(options: GoogleButtonOptions): Promise<void> {
  const {
    containerId,
    clientId,
    callback,
    width = 320,
    maxRetries = 6,
    retryDelayMs = 150,
  } = options;

  if (typeof window === "undefined") throw new Error("Google button can only render in browser.");
  if (!clientId) throw new Error("Google client id missing.");

  await loadGoogleGsi();

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const api = getGoogleIdApi();
    const container = document.getElementById(containerId);
    const containerWidth = container?.clientWidth || 0;

    if (!api || !container || containerWidth <= 0) {
      lastError = new Error("Google button prerequisites not ready.");
      if (attempt < maxRetries) {
        await sleep(retryDelayMs * (attempt + 1));
        continue;
      }
      break;
    }

    clearGoogleButton(containerId);
    api.initialize({
      client_id: clientId,
      callback,
    });
    api.renderButton(container, {
      theme: "outline",
      size: "large",
      width: Math.min(width, Math.max(240, containerWidth)),
      text: "continue_with",
      shape: "pill",
    });
    return;
  }

  throw lastError || new Error("Unable to render Google button.");
}
