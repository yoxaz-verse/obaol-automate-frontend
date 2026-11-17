"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiCheckCircle, FiDatabase, FiRefreshCw, FiShield } from "react-icons/fi";
import { getData, postData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import PageHeader from "@/components/ui/PageHeader";
import { DashboardPage, DashboardPanel, DashboardSectionHeader, DashboardStatusBadge } from "@/components/dashboard/DashboardUI";

const formatTime = (value?: string) => value ? new Date(value).toLocaleString() : "Never";

export default function StorageSettingsPage() {
  const [busy, setBusy] = useState(false), [message, setMessage] = useState("");
  const query = useQuery({ queryKey: ["storage-configuration"], queryFn: async () => (await getData(apiRoutes.systemConfig.storage, {}, { cacheMode: "bypass" })).data.data });
  const config = query.data;
  const verify = async () => {
    setBusy(true); setMessage("");
    try { const response = await postData(apiRoutes.systemConfig.storageVerify, {}); setMessage(response.data.message); await query.refetch(); }
    catch (error: any) { setMessage(error?.response?.data?.message || "S3 verification failed."); await query.refetch(); }
    finally { setBusy(false); }
  };
  const last = config?.lastVerification;
  return <DashboardPage className="py-3 sm:py-5">
    <PageHeader title="AWS S3 Storage" description="Private object storage for OBAOL images, documents, signatures, and transport attachments." />
    <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
      <DashboardPanel className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4"><DashboardSectionHeader title="Connection status" description="Credentials are read only from the backend deployment environment and are never returned here." /><DashboardStatusBadge tone={config?.configured ? (last?.success ? "success" : "warning") : "danger"}>{config?.configured ? (last?.success ? "Verified" : "Configured") : "Missing configuration"}</DashboardStatusBadge></div>
        {query.isLoading ? <p className="mt-6 db-muted">Checking storage configuration…</p> : query.isError ? <p className="mt-6 text-danger">Storage configuration could not be loaded.</p> : <div className="mt-6 space-y-4">
          <dl className="grid gap-3 rounded-2xl border border-[var(--db-border)] p-4 sm:grid-cols-2"><div><dt className="text-xs font-bold uppercase db-muted">Bucket</dt><dd className="mt-1 font-mono text-sm">{config?.bucket || "Not set"}</dd></div><div><dt className="text-xs font-bold uppercase db-muted">Region</dt><dd className="mt-1 font-mono text-sm">{config?.region || "Not set"}</dd></div><div><dt className="text-xs font-bold uppercase db-muted">Object prefix</dt><dd className="mt-1 font-mono text-sm">{config?.prefix || "None"}</dd></div><div><dt className="text-xs font-bold uppercase db-muted">Last check</dt><dd className="mt-1 text-sm">{formatTime(last?.checkedAt)}</dd></div></dl>
          {message && <p className={`rounded-xl p-3 text-sm ${last?.success ? "bg-success-50 text-success-700" : "bg-warning-50 text-warning-800"}`}>{message}</p>}
          <button onClick={verify} disabled={busy || !config?.configured} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-obaol-600 px-5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{busy ? <FiRefreshCw className="animate-spin" /> : <FiCheckCircle />} {busy ? "Verifying…" : "Verify upload, read & delete"}</button>
          <p className="text-xs db-muted">The check writes a temporary text object, reads it back, verifies its content, and deletes it.</p>
        </div>}
      </DashboardPanel>
      <DashboardPanel className="p-5 sm:p-6"><DashboardSectionHeader title="Deployment checklist" description="Configure these values in the backend service, then restart it before verification." /><ol className="mt-6 space-y-4 text-sm"><li className="flex gap-3"><FiDatabase className="mt-1 shrink-0 text-obaol-600" /><span><b>Create a private S3 bucket</b><br/><span className="db-muted">Enable Block Public Access and default server-side encryption.</span></span></li><li className="flex gap-3"><FiShield className="mt-1 shrink-0 text-obaol-600" /><span><b>Grant least-privilege IAM access</b><br/><span className="db-muted">Allow ListBucket plus GetObject, PutObject, DeleteObject, and HeadObject for the configured prefix.</span></span></li><li className="flex gap-3"><FiRefreshCw className="mt-1 shrink-0 text-obaol-600" /><span><b>Set environment variables</b><br/><code className="mt-2 block rounded-lg bg-default-100 p-3 text-xs">AWS_REGION<br/>AWS_S3_BUCKET<br/>AWS_S3_PREFIX (optional)<br/>AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY, or an IAM role</code></span></li></ol></DashboardPanel>
    </div>
  </DashboardPage>;
}
