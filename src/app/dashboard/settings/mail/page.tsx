"use client";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FiCheckCircle, FiMail, FiRefreshCw, FiTrash2 } from "react-icons/fi";
import { getData, postData, deleteData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import PageHeader from "@/components/ui/PageHeader";
import { DashboardPage, DashboardPanel, DashboardSectionHeader, DashboardStatusBadge } from "@/components/dashboard/DashboardUI";
import { InlineNotice, formatDateTime } from "@/components/dashboard/Documentation/DocumentationUI";

export default function MailConnectionPage() {
  const params = useSearchParams(), client = useQueryClient();
  const query = useQuery({ queryKey: ["company-mail-connection"], queryFn: async () => (await getData(apiRoutes.mailConnections.status)).data.data });
  const connection = query.data;
  const connect = async (provider: "google" | "microsoft") => { const response = await postData(apiRoutes.mailConnections.authorize(provider), {}); window.location.assign(response.data.data.authorizationUrl); };
  const disconnect = async () => { if (!window.confirm("Disconnect this company mailbox? Document history will remain available.")) return; await deleteData(apiRoutes.mailConnections.disconnect); await client.invalidateQueries({ queryKey: ["company-mail-connection"] }); };
  return <DashboardPage className="py-3 sm:py-5"><PageHeader title="Mail Connection" description="Send issued documents from your company's own Gmail or Outlook mailbox." />
    {params.get("connected") && <div className="mb-4"><InlineNotice tone="success">Company mailbox connected successfully.</InlineNotice></div>}
    {params.get("error") && <div className="mb-4"><InlineNotice tone="danger">{params.get("error")}</InlineNotice></div>}
    <DashboardPanel className="p-5 sm:p-6"><DashboardSectionHeader title="Company sender" description="One mailbox is shared by authorized users of this verified company." />
      {query.isLoading ? <p className="mt-6 db-muted">Checking mailbox connection…</p> : connection ? <div className="mt-6 rounded-2xl border border-[var(--db-border)] p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><FiCheckCircle className="text-success-600" /><strong>{connection.email}</strong><DashboardStatusBadge tone={connection.reconnectRequired ? "warning" : "success"}>{connection.reconnectRequired ? "Reconnect required" : "Connected"}</DashboardStatusBadge></div><p className="mt-2 text-sm db-muted">{connection.provider === "GOOGLE" ? "Gmail" : "Microsoft Outlook"} · Connected {formatDateTime(connection.connectedAt)}</p><p className="mt-1 text-xs db-muted">Last successful send: {formatDateTime(connection.lastSuccessfulUseAt)}</p></div><div className="flex gap-2"><button onClick={() => connect(connection.provider === "GOOGLE" ? "google" : "microsoft")} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--db-border)] px-4 text-sm font-bold"><FiRefreshCw /> Reconnect</button><button onClick={disconnect} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-danger-500 px-4 text-sm font-bold text-danger-600"><FiTrash2 /> Disconnect</button></div></div></div>
      : <div className="mt-6 grid gap-4 md:grid-cols-2"><button onClick={() => connect("google")} className="flex min-h-32 items-center gap-4 rounded-2xl border border-[var(--db-border)] p-5 text-left hover:border-obaol-500"><span className="grid h-12 w-12 place-items-center rounded-xl bg-obaol-500/10"><FiMail size={22}/></span><span><strong className="block">Connect Gmail</strong><span className="mt-1 block text-sm db-muted">Secure Google OAuth with send-only mail access.</span></span></button><button onClick={() => connect("microsoft")} className="flex min-h-32 items-center gap-4 rounded-2xl border border-[var(--db-border)] p-5 text-left hover:border-obaol-500"><span className="grid h-12 w-12 place-items-center rounded-xl bg-obaol-500/10"><FiMail size={22}/></span><span><strong className="block">Connect Outlook</strong><span className="mt-1 block text-sm db-muted">Secure Microsoft OAuth with Mail.Send access.</span></span></button></div>}
      <p className="mt-6 text-xs db-muted">OBAOL stores encrypted authorization credentials. Mailbox passwords are never requested or stored.</p>
    </DashboardPanel></DashboardPage>;
}
