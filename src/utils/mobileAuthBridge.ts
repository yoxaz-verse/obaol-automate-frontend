export type MobileAuthRequest = { provider: "google" | "apple"; role: "Associate" | "Operator"; intent: "login" | "register"; rememberMe: boolean };
export type MobileAuthResult = { ok: true; next?: string } | { ok: false; error: string };
type FlutterBridge = { callHandler: (name: string, payload: MobileAuthRequest) => Promise<MobileAuthResult> };

declare global {
  interface Window {
    flutter_inappwebview?: FlutterBridge;
    AppleID?: { auth: { init: (config: Record<string, unknown>) => void; signIn: () => Promise<{ authorization?: { id_token?: string }; user?: { name?: { firstName?: string; lastName?: string } } }> } };
  }
}

export const isObaolMobileShell = () => typeof window !== "undefined" && /OBAOL-Mobile\//.test(window.navigator.userAgent) && Boolean(window.flutter_inappwebview?.callHandler);

export const requestMobileAuth = async (request: MobileAuthRequest): Promise<MobileAuthResult> => {
  if (!isObaolMobileShell()) return { ok: false, error: "The native authentication bridge is unavailable." };
  return window.flutter_inappwebview!.callHandler("obaolAuth", request);
};

let appleScriptPromise: Promise<void> | null = null;
const loadAppleScript = () => {
  if (typeof window === "undefined") return Promise.reject(new Error("Apple sign-in is unavailable."));
  if (window.AppleID) return Promise.resolve();
  if (appleScriptPromise) return appleScriptPromise;
  appleScriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Apple sign-in failed to load."));
    document.head.appendChild(script);
  });
  return appleScriptPromise;
};

export const requestWebAppleCredential = async () => {
  await loadAppleScript();
  const clientId = process.env.NEXT_PUBLIC_APPLE_SERVICE_ID || "";
  const redirectURI = process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI || "";
  if (!clientId || !redirectURI) throw new Error("Apple sign-in is not configured.");
  window.AppleID!.auth.init({ clientId, scope: "name email", redirectURI, usePopup: true });
  const result = await window.AppleID!.auth.signIn();
  const identityToken = result.authorization?.id_token;
  if (!identityToken) throw new Error("Apple did not return an identity token.");
  const name = [result.user?.name?.firstName, result.user?.name?.lastName].filter(Boolean).join(" ");
  return { identityToken, name };
};
