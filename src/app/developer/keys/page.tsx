"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  devCreateKey,
  devCreateMcpConnector,
  devGetKeyPresets,
  devListKeys,
  devListMcpConnectors,
  devRevokeKey,
  devRevokeMcpConnector,
} from "@/utils/developerApi";
import { clearDeveloperToken, getDeveloperToken } from "@/utils/developerSession";
import SectionSkeleton from "@/components/ui/SectionSkeleton";

type DevKey = {
  id: string;
  label: string;
  key_prefix: string;
  permissions: string[];
  rate_limit: number;
  is_active: boolean;
  createdAt: string;
  last_used_at?: string | null;
  revoked_at?: string | null;
};

type DevMcpConnector = {
  id: string;
  label: string;
  token_prefix: string;
  apiKeyId: string;
  is_active: boolean;
  revoked_at?: string | null;
  expires_at?: string | null;
  last_used_at?: string | null;
  createdAt: string;
};

export default function DeveloperKeysPage() {
  const router = useRouter();
  const [keys, setKeys] = useState<DevKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [label, setLabel] = useState("Automation Key");
  const [rateLimit, setRateLimit] = useState<number>(120);
  const [preset, setPreset] = useState("automation_basic");
  const [presets, setPresets] = useState<Record<string, string[]>>({});
  const [newRawKey, setNewRawKey] = useState<string>("");
  const [connectors, setConnectors] = useState<DevMcpConnector[]>([]);
  const [isConnectorCreating, setIsConnectorCreating] = useState(false);
  const [connectorLabel, setConnectorLabel] = useState("ChatGPT Connector");
  const [connectorApiKeyId, setConnectorApiKeyId] = useState("");
  const [connectorExpiresInDays, setConnectorExpiresInDays] = useState<number>(30);
  const [newConnectorToken, setNewConnectorToken] = useState("");
  const [newConnectorUrl, setNewConnectorUrl] = useState("");

  const hasToken = useMemo(() => Boolean(getDeveloperToken()), []);

  const load = useCallback(async () => {
    try {
      setError("");
      setIsLoading(true);
      const [keysRes, presetsRes, connectorsRes] = await Promise.all([
        devListKeys(),
        devGetKeyPresets(),
        devListMcpConnectors(),
      ]);
      setKeys(keysRes?.data || []);
      setPresets(presetsRes?.data || {});
      const fetchedConnectors = connectorsRes?.data || [];
      setConnectors(fetchedConnectors);
      if (Array.isArray(keysRes?.data) && keysRes.data.length > 0) {
        setConnectorApiKeyId((prev) => prev || String(keysRes.data[0].id || ""));
      }
    } catch (e: any) {
      const message = e?.message || "Failed to load developer keys.";
      if (message.toLowerCase().includes("invalid") || message.toLowerCase().includes("expired")) {
        clearDeveloperToken();
        router.replace("/developer/login");
        return;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!hasToken) {
      router.replace("/developer/login");
      return;
    }
    load();
  }, [hasToken, load, router]);

  const handleCreate = async () => {
    try {
      setIsCreating(true);
      setError("");
      const response = await devCreateKey({
        label,
        permissionPreset: preset,
        rate_limit: rateLimit,
      });

      setNewRawKey(response?.data?.rawApiKey || "");
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to create key.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateConnector = async () => {
    if (!connectorApiKeyId) {
      setError("Select an active API key before creating a connector token.");
      return;
    }
    try {
      setError("");
      setIsConnectorCreating(true);
      const response = await devCreateMcpConnector({
        apiKeyId: connectorApiKeyId,
        label: connectorLabel,
        expiresInDays: connectorExpiresInDays,
      });
      setNewConnectorToken(response?.data?.connectorToken || "");
      setNewConnectorUrl(response?.data?.mcpUrl || "");
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to create MCP connector token.");
    } finally {
      setIsConnectorCreating(false);
    }
  };

  const handleRevokeConnector = async (id: string) => {
    try {
      setError("");
      await devRevokeMcpConnector(id);
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to revoke connector token.");
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      setError("");
      await devRevokeKey(id);
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to revoke key.");
    }
  };

  const handleSignOut = () => {
    clearDeveloperToken();
    router.replace("/developer/login");
  };

  return (
    <main className="min-h-screen bg-default-50 dark:bg-[#07090f] px-4 py-10">
      <section className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-default-900 dark:text-white">Developer API Keys</h1>
            <p className="text-sm text-default-600 dark:text-white/80">
              Create API keys and use them as Bearer tokens when calling OBAOL APIs at{" "}
              <a href="https://api.obaol.com" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline font-mono">
                https://api.obaol.com
              </a>.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/developer/usage" className="rounded-lg border border-default-300 px-3 py-2 text-sm text-default-800 dark:text-white dark:border-white/30 dark:bg-[#11151f]">Usage</Link>
            <button onClick={handleSignOut} className="rounded-lg border border-default-300 px-3 py-2 text-sm text-default-800 dark:text-white dark:border-white/30 dark:bg-[#11151f]">Sign out</button>
          </div>
        </div>

        <div className="rounded-2xl border border-default-200 dark:border-white/15 bg-white dark:bg-[#11151f] p-4 md:p-6">
          <h2 className="text-lg font-medium text-default-900 dark:text-white">Create API Key</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <input value={label} onChange={(e) => setLabel(e.target.value)} className="rounded-lg border border-default-300 bg-transparent px-3 py-2 text-sm text-default-900 dark:text-white dark:border-white/25 dark:bg-white/5" placeholder="Key label" />
            <select value={preset} onChange={(e) => setPreset(e.target.value)} className="rounded-lg border border-default-300 bg-transparent px-3 py-2 text-sm text-default-900 dark:text-white dark:border-white/25 dark:bg-white/5">
              {Object.keys(presets).length === 0 ? <option value="automation_basic">automation_basic</option> : Object.keys(presets).map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <input type="number" min={10} max={5000} value={rateLimit} onChange={(e) => setRateLimit(Number(e.target.value || 120))} className="rounded-lg border border-default-300 bg-transparent px-3 py-2 text-sm text-default-900 dark:text-white dark:border-white/25 dark:bg-white/5" placeholder="Rate limit/min" />
          </div>
          <div className="mt-4">
            <button disabled={isCreating} onClick={handleCreate} className="rounded-lg bg-warning-500 px-4 py-2 text-sm font-medium text-black disabled:opacity-60">
              {isCreating ? "Generating..." : "Generate API Key"}
            </button>
          </div>

          {newRawKey && (
            <div className="mt-4 rounded-lg border border-warning-300 bg-warning-50 p-3 text-sm text-warning-800 dark:border-warning-500/40 dark:bg-warning-500/10 dark:text-warning-100">
              <p className="font-medium">Copy this API key now. It will not be shown again.</p>
              <code className="mt-2 block break-all rounded bg-black/5 px-2 py-1 dark:bg-white/10">{newRawKey}</code>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-default-200 dark:border-white/15 bg-white dark:bg-[#11151f] p-4 md:p-6 overflow-x-auto">
          <h2 className="text-lg font-medium text-default-900 dark:text-white">Your Keys</h2>
          {isLoading ? (
            <SectionSkeleton rows={5} className="mt-4" />
          ) : (
            <table className="mt-4 min-w-[980px] w-full text-sm text-default-800 dark:text-white/90">
              <thead>
                <tr className="text-left text-default-600 dark:text-white/70">
                  <th className="py-2">Label</th>
                  <th className="py-2">Prefix</th>
                  <th className="py-2">Permissions</th>
                  <th className="py-2">Rate</th>
                  <th className="py-2">Last Used</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id} className="border-t border-default-200/70 dark:border-white/10">
                    <td className="py-3">{k.label}</td>
                    <td className="py-3 font-mono">{k.key_prefix}...</td>
                    <td className="py-3">{k.permissions.join(", ")}</td>
                    <td className="py-3">{k.rate_limit}/min</td>
                    <td className="py-3">{k.last_used_at ? new Date(k.last_used_at).toLocaleString() : "Never"}</td>
                    <td className="py-3">{k.is_active ? "Active" : "Revoked"}</td>
                    <td className="py-3 text-center">
                      {k.is_active ? (
                        <button onClick={() => handleRevoke(k.id)} className="rounded-md border border-danger-300 px-3 py-1 text-danger-700 dark:border-danger-500/50 dark:text-danger-300">
                          Revoke
                        </button>
                      ) : (
                        <span className="text-default-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="rounded-2xl border border-default-200 dark:border-white/15 bg-white dark:bg-[#11151f] p-4 md:p-6">
          <h2 className="text-lg font-medium text-default-900 dark:text-white">Usage Snippet</h2>
          <p className="mt-2 text-sm text-default-600 dark:text-white/80">Authorization header format:</p>
          <code className="mt-2 block rounded bg-black/5 px-3 py-2 text-sm dark:bg-white/10 dark:text-white/95">Authorization: Bearer &lt;API_KEY&gt;</code>
          <code className="mt-3 block rounded bg-black/5 px-3 py-2 text-xs dark:bg-white/10 dark:text-white/90">GET /v1/products/live</code>
          <code className="mt-2 block rounded bg-black/5 px-3 py-2 text-xs dark:bg-white/10 dark:text-white/90">GET /v1/products/all</code>
        </div>

        <div className="rounded-2xl border border-default-200 dark:border-white/15 bg-white dark:bg-[#11151f] p-4 md:p-6">
          <h2 className="text-lg font-medium text-default-900 dark:text-white">ChatGPT App / MCP Connector</h2>
          <p className="mt-1 text-sm text-default-600 dark:text-white/80">
            Recommended setup uses a revocable connector token instead of exposing raw API keys in MCP URL.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <select
              value={connectorApiKeyId}
              onChange={(e) => setConnectorApiKeyId(e.target.value)}
              className="rounded-lg border border-default-300 bg-transparent px-3 py-2 text-sm text-default-900 dark:text-white dark:border-white/25 dark:bg-white/5"
            >
              <option value="">Select API Key</option>
              {keys.filter((k) => k.is_active).map((k) => (
                <option key={k.id} value={k.id}>
                  {k.label} ({k.key_prefix}...)
                </option>
              ))}
            </select>
            <input
              value={connectorLabel}
              onChange={(e) => setConnectorLabel(e.target.value)}
              className="rounded-lg border border-default-300 bg-transparent px-3 py-2 text-sm text-default-900 dark:text-white dark:border-white/25 dark:bg-white/5"
              placeholder="Connector label"
            />
            <input
              type="number"
              min={1}
              max={365}
              value={connectorExpiresInDays}
              onChange={(e) => setConnectorExpiresInDays(Number(e.target.value || 30))}
              className="rounded-lg border border-default-300 bg-transparent px-3 py-2 text-sm text-default-900 dark:text-white dark:border-white/25 dark:bg-white/5"
              placeholder="Expiry days"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              disabled={isConnectorCreating}
              onClick={handleCreateConnector}
              className="rounded-lg bg-warning-500 px-4 py-2 text-sm font-medium text-black disabled:opacity-60"
            >
              {isConnectorCreating ? "Generating..." : "Generate Connector Token"}
            </button>
            <button
              disabled={!newConnectorUrl}
              onClick={async () => {
                if (!newConnectorUrl) return;
                await navigator.clipboard.writeText(newConnectorUrl);
              }}
              className="rounded-lg border border-default-300 px-4 py-2 text-sm text-default-800 dark:text-white dark:border-white/30 dark:bg-[#11151f] disabled:opacity-50"
            >
              Copy MCP URL
            </button>
          </div>

          {newConnectorToken ? (
            <div className="mt-4 rounded-lg border border-warning-300 bg-warning-50 p-3 text-sm text-warning-800 dark:border-warning-500/40 dark:bg-warning-500/10 dark:text-warning-100">
              <p className="font-medium">Copy this connector token now. It will not be shown again.</p>
              <code className="mt-2 block break-all rounded bg-black/5 px-2 py-1 dark:bg-white/10">{newConnectorToken}</code>
              {newConnectorUrl ? (
                <code className="mt-2 block break-all rounded bg-black/5 px-2 py-1 dark:bg-white/10">{newConnectorUrl}</code>
              ) : null}
            </div>
          ) : null}

          <div className="mt-4 rounded-lg border border-default-200/80 dark:border-white/15 bg-default-50/50 dark:bg-white/5 p-3 text-sm text-default-700 dark:text-white/80">
            <p className="font-medium mb-1">ChatGPT App Setup</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>MCP Server URL: <code className="font-mono">https://api.obaol.com/mcp?connectorToken=&lt;TOKEN&gt;</code></li>
              <li>Authentication mode: <strong>No Auth</strong></li>
              <li>Use <code>/mcp/info</code> and <code>/mcp/health</code> to verify endpoint readiness.</li>
            </ol>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-[860px] w-full text-sm text-default-800 dark:text-white/90">
              <thead>
                <tr className="text-left text-default-600 dark:text-white/70">
                  <th className="py-2">Label</th>
                  <th className="py-2">Token Prefix</th>
                  <th className="py-2">API Key</th>
                  <th className="py-2">Expires</th>
                  <th className="py-2">Last Used</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {connectors.map((c) => (
                  <tr key={c.id} className="border-t border-default-200/70 dark:border-white/10">
                    <td className="py-3">{c.label || "-"}</td>
                    <td className="py-3 font-mono">{c.token_prefix}...</td>
                    <td className="py-3">{keys.find((k) => k.id === c.apiKeyId)?.label || c.apiKeyId}</td>
                    <td className="py-3">{c.expires_at ? new Date(c.expires_at).toLocaleString() : "Never"}</td>
                    <td className="py-3">{c.last_used_at ? new Date(c.last_used_at).toLocaleString() : "Never"}</td>
                    <td className="py-3">{c.is_active ? "Active" : "Revoked"}</td>
                    <td className="py-3 text-center">
                      {c.is_active ? (
                        <button onClick={() => handleRevokeConnector(c.id)} className="rounded-md border border-danger-300 px-3 py-1 text-danger-700 dark:border-danger-500/50 dark:text-danger-300">
                          Revoke
                        </button>
                      ) : (
                        <span className="text-default-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
                {connectors.length === 0 ? (
                  <tr>
                    <td className="py-3 text-default-500" colSpan={7}>No connector tokens yet.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-danger-300 bg-danger-50 px-3 py-2 text-sm text-danger-700 dark:border-danger-500/40 dark:bg-danger-500/10 dark:text-danger-200">
            {error}
          </p>
        )}
      </section>
    </main>
  );
}
