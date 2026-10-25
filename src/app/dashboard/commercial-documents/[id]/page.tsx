"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getData, postData } from "@/core/api/apiHandler";
import instance from "@/core/api/axiosInstance";
import { apiRoutes } from "@/core/api/apiRoutes";
import UnifiedDocumentView from "@/components/dashboard/CommercialDocuments/UnifiedDocumentView";
import { formatActivity } from "@/components/dashboard/CommercialDocuments/documentStudio";

export default function CommercialDocumentDetail() {
  const { id } = useParams(); const router = useRouter(); const client = useQueryClient();
  const key = String(id || ""), api = apiRoutes.commercialDocuments;
  const [error, setError] = useState(""), [busy, setBusy] = useState(false), [inviteUrl, setInviteUrl] = useState("");
  const query = useQuery({ queryKey: ["commercial-document", key], queryFn: async () => (await getData(api.getOne(key))).data.data, enabled: Boolean(key) });
  const revisions = useQuery({ queryKey: ["commercial-revisions", key], queryFn: async () => (await getData(`${api.getOne(key)}/revisions`)).data.data || [], enabled: Boolean(key) });
  const doc = query.data;
  async function action(name: string, body: any = {}) { setBusy(true); setError(""); try { const result = await postData(api.action(key, name), body); if (result.data.inviteUrl) setInviteUrl(result.data.inviteUrl); await Promise.all([client.invalidateQueries({ queryKey: ["commercial-document", key] }), client.invalidateQueries({ queryKey: ["commercial-documents"] }), client.invalidateQueries({ queryKey: ["commercial-revisions", key] })]); if (["revise", "to-invoice"].includes(name)) router.push(`/dashboard/commercial-documents/${result.data.data._id}`); } catch (e: any) { setError(e?.response?.data?.message || "Action failed."); } finally { setBusy(false); } }
  async function downloadPdf() { setBusy(true); setError(""); try { const response = await instance.get(api.pdf(key), { responseType: "blob" }); const url = URL.createObjectURL(response.data); const link = document.createElement("a"); link.href = url; link.download = `${doc?.number || "document"}.pdf`; link.click(); URL.revokeObjectURL(url); } catch (e: any) { setError(e?.response?.data?.message || "Could not download PDF."); } finally { setBusy(false); } }
  function recordDecision(decision: "ACCEPTED" | "REJECTED") { const reference = window.prompt("Buyer response reference (optional)", "") || ""; const notes = window.prompt("Notes (optional)", "") || ""; action("decision", { decision, reference, notes }); }
  function recordPayment() { const amount = Number(window.prompt(`Payment amount (balance ${doc?.currency} ${doc?.balanceDue})`, String(doc?.balanceDue || ""))); if (amount > 0) { const reference = window.prompt("Payment reference", "") || ""; action("payments", { amount, reference }); } }
  const button = (label: string, handler: () => void, primary = false) => <button type="button" disabled={busy} onClick={handler} className={`rounded-xl px-4 py-2 text-sm font-semibold ${primary ? "bg-primary text-white" : "border border-default-300"}`}>{label}</button>;
  return <main className="p-4 md:p-8"><div className="no-print max-w-[820px] mx-auto mb-5"><Link href="/dashboard/commercial-documents" className="text-primary underline">← Document Studio</Link>{doc && <><div className="flex flex-wrap gap-2 mt-4">
    {button("Download PDF", downloadPdf, true)}
    {doc.status === "DRAFT" && <Link href={`/dashboard/commercial-documents/new?edit=${key}`} className="rounded-xl border border-default-300 px-4 py-2 text-sm font-semibold">Edit draft</Link>}
    {doc.status === "DRAFT" && button("Issue document", () => action("issue"))}
    {doc.status !== "DRAFT" && button("Copy invitation link", () => action("invite"))}
    {doc.status !== "DRAFT" && button("Create revision", () => action("revise"))}
    {doc.status === "SENT" && button("Revoke invitation", () => action("revoke-invite"))}
    {doc.type === "QUOTATION" && doc.status === "SENT" && <>{button("Record accepted", () => recordDecision("ACCEPTED"))}{button("Record rejected", () => recordDecision("REJECTED"))}</>}
    {doc.type === "QUOTATION" && doc.status === "ACCEPTED" && button("Create invoice", () => action("to-invoice"), true)}
    {doc.type === "INVOICE" && doc.status !== "DRAFT" && Number(doc.balanceDue) > 0 && button("Record payment", recordPayment)}
  </div>{inviteUrl && <div className="mt-3 rounded-xl bg-default-100 p-3 text-sm break-all">Secure invitation link: <button className="text-primary underline" onClick={() => navigator.clipboard.writeText(inviteUrl)}>{inviteUrl}</button></div>}{error && <p role="alert" className="text-red-600 mt-3">{error}</p>}{(revisions.data || []).length > 1 && <div className="mt-3 text-sm">Versions: {(revisions.data || []).map((row: any) => <Link key={row._id} className="mr-3 text-primary underline" href={`/dashboard/commercial-documents/${row._id}`}>{row.number} (v{row.revision})</Link>)}</div>}{doc?.decidedAt && <p className="mt-3 text-sm">{doc.decision} on {new Date(doc.decidedAt).toLocaleString()} · {doc.decisionSource?.replaceAll("_", " ")}</p>}{(doc.activityTimeline || []).length > 0 && <section className="mt-5 rounded-2xl border border-default-200 p-4"><h2 className="font-semibold">Activity</h2><div className="mt-3 space-y-2 text-sm">{[...(doc.activityTimeline || [])].reverse().map((event: any, index: number) => <div key={`${event.createdAt}-${index}`} className="flex justify-between gap-4"><span>{formatActivity(event.action)}</span><time className="text-default-500">{event.createdAt ? new Date(event.createdAt).toLocaleString() : "—"}</time></div>)}</div>{(doc.viewCount || doc.downloadCount) ? <p className="mt-3 text-xs text-default-500">Recipient views: {doc.viewCount || 0} · PDF downloads: {doc.downloadCount || 0}</p> : null}</section>}</>}</div>
    {query.isLoading ? <p>Loading…</p> : query.isError ? <p>Could not load document.</p> : <UnifiedDocumentView doc={doc} />}
    <style jsx global>{`@media print { nav, aside, .no-print { display: none !important; } body { background: white !important; } .commercial-sheet { max-width: none !important; } @page { size: A4; margin: 16mm; } }`}</style>
  </main>;
}
