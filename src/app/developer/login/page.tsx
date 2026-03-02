"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

  const googleClientId = useMemo(
    () => process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
    []
  );

  useEffect(() => {
    if (getDeveloperToken()) {
      router.replace("/developer/keys");
      return;
    }

    if (!googleClientId) {
      setError("Google client id is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID.");
      return;
    }

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
  }, [googleClientId, router]);

  return (
    <main className="min-h-screen bg-default-50 dark:bg-black px-4 py-16">
      <section className="mx-auto max-w-lg rounded-2xl border border-default-200 dark:border-default-100/20 bg-white dark:bg-default-50/5 p-8">
        <h1 className="text-2xl font-semibold text-default-900 dark:text-default-100">
          Developer Mode Login
        </h1>
        <p className="mt-2 text-sm text-default-600 dark:text-default-300">
          Sign in with Google to create and manage API keys for n8n, MCP, and ChatGPT app integrations.
        </p>

        <div className="mt-8 flex justify-center">
          <div id="google-signin" />
        </div>

        {isLoading && (
          <p className="mt-4 text-center text-sm text-default-600 dark:text-default-300">
            Verifying Google login...
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-lg border border-danger-300 bg-danger-50 px-3 py-2 text-sm text-danger-700 dark:border-danger-500/40 dark:bg-danger-500/10 dark:text-danger-200">
            {error}
          </p>
        )}
      </section>
    </main>
  );
}
