"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { devUsageOverview } from "@/utils/developerApi";
import { clearDeveloperToken, getDeveloperToken } from "@/utils/developerSession";

type UsageData = {
  requests24h: number;
  requests7d: number;
  requests30d: number;
  successRequests30d: number;
  errorRequests30d: number;
  topRoutes: Array<{ route: string; method: string; count: number }>;
  perKey: Array<{ apiKeyId: string; label: string; key_prefix: string | null; requests30d: number }>;
};

export default function DeveloperUsagePage() {
  const router = useRouter();
  const [data, setData] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getDeveloperToken()) {
      router.replace("/developer/login");
      return;
    }

    const load = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await devUsageOverview();
        setData(response?.data || null);
      } catch (e: any) {
        const message = e?.message || "Failed to load usage data.";
        if (message.toLowerCase().includes("invalid") || message.toLowerCase().includes("expired")) {
          clearDeveloperToken();
          router.replace("/developer/login");
          return;
        }
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [router]);

  return (
    <main className="min-h-screen bg-default-50 dark:bg-[#07090f] px-4 py-10">
      <section className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-default-900 dark:text-white">Developer Usage</h1>
            <p className="text-sm text-default-600 dark:text-white/80">Track API usage by endpoint and API key.</p>
          </div>
          <Link href="/developer/keys" className="rounded-lg border border-default-300 px-3 py-2 text-sm text-default-800 dark:text-white dark:border-white/30 dark:bg-[#11151f]">Back to Keys</Link>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-default-200 dark:border-white/15 bg-white dark:bg-[#11151f] p-6 text-sm text-default-600 dark:text-white/80">Loading usage data...</div>
        ) : data ? (
          <>
            <div className="grid gap-3 md:grid-cols-5">
              <StatCard label="24h" value={data.requests24h} />
              <StatCard label="7d" value={data.requests7d} />
              <StatCard label="30d" value={data.requests30d} />
              <StatCard label="Success (30d)" value={data.successRequests30d} />
              <StatCard label="Errors (30d)" value={data.errorRequests30d} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-default-200 dark:border-white/15 bg-white dark:bg-[#11151f] p-4 md:p-6">
                <h2 className="text-lg font-medium text-default-900 dark:text-white">Top Routes</h2>
                <ul className="mt-3 space-y-2 text-sm">
                  {data.topRoutes.length === 0 ? (
                    <li className="text-default-500 dark:text-white/60">No data yet.</li>
                  ) : (
                    data.topRoutes.map((row, idx) => (
                      <li key={`${row.method}-${row.route}-${idx}`} className="flex items-center justify-between gap-2 border-b border-default-200/60 pb-2 text-default-800 dark:text-white/90 dark:border-white/10">
                        <span className="truncate"><strong>{row.method}</strong> {row.route}</span>
                        <span className="font-medium">{row.count}</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              <div className="rounded-2xl border border-default-200 dark:border-white/15 bg-white dark:bg-[#11151f] p-4 md:p-6">
                <h2 className="text-lg font-medium text-default-900 dark:text-white">Per Key (30d)</h2>
                <ul className="mt-3 space-y-2 text-sm">
                  {data.perKey.length === 0 ? (
                    <li className="text-default-500 dark:text-white/60">No data yet.</li>
                  ) : (
                    data.perKey.map((row) => (
                      <li key={row.apiKeyId} className="flex items-center justify-between gap-2 border-b border-default-200/60 pb-2 text-default-800 dark:text-white/90 dark:border-white/10">
                        <span className="truncate">{row.label} {row.key_prefix ? `(${row.key_prefix}...)` : ""}</span>
                        <span className="font-medium">{row.requests30d}</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-default-200 dark:border-white/15 bg-white dark:bg-[#11151f] p-6 text-sm text-default-600 dark:text-white/80">No usage data found.</div>
        )}

        {error && (
          <p className="rounded-lg border border-danger-300 bg-danger-50 px-3 py-2 text-sm text-danger-700 dark:border-danger-500/40 dark:bg-danger-500/10 dark:text-danger-200">
            {error}
          </p>
        )}
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-default-200 dark:border-white/15 bg-white dark:bg-[#11151f] p-4">
      <p className="text-xs text-default-500 dark:text-white/70">{label}</p>
      <p className="mt-1 text-xl font-semibold text-default-900 dark:text-white">{value}</p>
    </div>
  );
}
