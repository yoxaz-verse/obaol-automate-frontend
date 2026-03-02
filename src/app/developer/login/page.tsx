"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { devAuthGoogle } from "@/utils/developerApi";
import { getDeveloperToken, setDeveloperToken } from "@/utils/developerSession";

declare global {
  interface Window {
    google?: any;
  }
}

export default function DeveloperLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [configWarning, setConfigWarning] = useState<string>("");

  const devApiBase = useMemo(
    () => process.env.NEXT_PUBLIC_OBAOL_API_BASE_URL || "",
    []
  );
  const googleClientId = useMemo(
    () => process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
    []
  );

  useEffect(() => {
    if (getDeveloperToken()) {
      router.replace("/developer/keys");
      return;
    }

    if (!devApiBase) {
      setError(
        "Set NEXT_PUBLIC_OBAOL_API_BASE_URL to your obaol-api origin (e.g. http://localhost:5002)."
      );
      return;
    }

    try {
      const apiOrigin = new URL(devApiBase).origin;
      const appOrigin = window.location.origin;
      if (apiOrigin === appOrigin) {
        setConfigWarning(
          "Developer OAuth must target dedicated obaol-api host, not same frontend origin."
        );
      }
    } catch (_error) {
      setError(
        "NEXT_PUBLIC_OBAOL_API_BASE_URL is invalid. Use full origin, e.g. http://localhost:5002."
      );
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get("token");
    if (oauthToken) {
      setDeveloperToken(oauthToken);
      params.delete("token");
      const cleanUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
      window.history.replaceState({}, "", cleanUrl);
      router.replace("/developer/keys");
      return;
    }

    // If frontend Google client is not configured, user can still sign in through backend OAuth redirect flow.
    if (!googleClientId) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (!window.google) return;

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (resp: { credential?: string }) => {
          try {
            setIsLoading(true);
            setError("");
            if (!resp?.credential) {
              throw new Error("Google credential was not returned.");
            }

            const result = await devAuthGoogle(resp.credential);
            const token = result?.data?.devAccessToken;
            if (!token) {
              throw new Error("Developer token was not returned.");
            }

            setDeveloperToken(token);
            router.replace("/developer/keys");
          } catch (e: any) {
            setError(e?.message || "Developer login failed.");
          } finally {
            setIsLoading(false);
          }
        },
      });

      const container = document.getElementById("google-signin");
      if (container) {
        window.google.accounts.id.renderButton(container, {
          theme: "outline",
          size: "large",
          width: 320,
          text: "signin_with",
          shape: "pill",
        });
      }
    };

    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [devApiBase, googleClientId, router]);

  const handleBackendOAuthStart = () => {
    if (!devApiBase) {
      setError(
        "Set NEXT_PUBLIC_OBAOL_API_BASE_URL to your obaol-api origin (e.g. http://localhost:5002)."
      );
      return;
    }
    try {
      if (new URL(devApiBase).origin === window.location.origin) {
        setError(
          "Developer OAuth must target dedicated obaol-api host. Set NEXT_PUBLIC_OBAOL_API_BASE_URL to a different origin (e.g. http://localhost:5002)."
        );
        return;
      }
    } catch (_error) {
      setError(
        "NEXT_PUBLIC_OBAOL_API_BASE_URL is invalid. Use full origin, e.g. http://localhost:5002."
      );
      return;
    }
    const redirectUri = `${window.location.origin}/developer/login`;
    const startUrl = `${devApiBase}/api/developer/auth/google/start?redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = startUrl;
  };

  return (
    <main className="min-h-screen bg-default-50 dark:bg-[#07090f] px-4 py-16">
      <section className="mx-auto max-w-lg rounded-2xl border border-default-200 dark:border-white/15 bg-white dark:bg-[#11151f] p-8 shadow-sm dark:shadow-none">
        <h1 className="text-2xl font-semibold text-default-900 dark:text-white">
          Developer Mode Login
        </h1>
        <p className="mt-2 text-sm text-default-600 dark:text-white/80">
          Sign in with Google to create and manage API keys for n8n, MCP, and ChatGPT app integrations.
        </p>
        <p className="mt-2 text-sm text-default-600 dark:text-white/80">
          New here?{" "}
          <Link href="/developer" className="font-medium text-orange-600 hover:text-orange-700 dark:text-orange-300 dark:hover:text-orange-200">
            Learn what Developer Mode includes
          </Link>.
        </p>

        <div className="mt-8 flex justify-center">
          <div id="google-signin" />
        </div>
        {!googleClientId && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={handleBackendOAuthStart}
              className="rounded-full border border-default-300 dark:border-white/30 px-5 py-2 text-sm font-medium text-default-800 dark:text-white hover:bg-default-100 dark:hover:bg-white/10"
            >
              Continue with Google
            </button>
          </div>
        )}

        {isLoading && (
          <p className="mt-4 text-center text-sm text-default-600 dark:text-white/75">
            Verifying Google login...
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-lg border border-danger-300 bg-danger-50 px-3 py-2 text-sm text-danger-700 dark:border-danger-500/40 dark:bg-danger-500/10 dark:text-danger-200">
            {error}
          </p>
        )}
        {configWarning && (
          <p className="mt-4 rounded-lg border border-warning-300 bg-warning-50 px-3 py-2 text-sm text-warning-800 dark:border-warning-500/40 dark:bg-warning-500/10 dark:text-warning-100">
            {configWarning}
          </p>
        )}
      </section>
    </main>
  );
}
