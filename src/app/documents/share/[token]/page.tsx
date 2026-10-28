"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FiCheckCircle, FiDownload, FiMail, FiShield } from "react-icons/fi";
import { getData, postData } from "@/core/api/apiHandler";
import instance from "@/core/api/axiosInstance";
import { apiRoutes } from "@/core/api/apiRoutes";

type VerifyStep = "idle" | "code" | "verified";

export default function SharedDocumentPage() {
  const params = useParams(), token = String(params.token || ""), api = apiRoutes.commercialDocuments, client = useQueryClient();
  const [message, setMessage] = useState(""), [busy, setBusy] = useState<string | null>(null), [step, setStep] = useState<VerifyStep>("idle"), [code, setCode] = useState(""), [decisionToken, setDecisionToken] = useState(""), [maskedEmail, setMaskedEmail] = useState("");
  const query = useQuery({ queryKey: ["shared-commercial-document", token], queryFn: async () => (await getData(api.share(token))).data.data, enabled: Boolean(token), retry: false });
  const rendered = useQuery({ queryKey: ["shared-commercial-document-render", token], queryFn: async () => (await instance.get(`${api.share(token)}/render`, { responseType: "text" })).data, enabled: Boolean(token && query.data), retry: false });

  async function requestCode() { setBusy("request"); setMessage(""); try { const response = await postData(`${api.share(token)}/otp/request`, {}); setMaskedEmail(response.data.data.maskedEmail); setStep("code"); setMessage(`Verification code sent to ${response.data.data.maskedEmail}.`); } catch (e: any) { setMessage(e?.response?.data?.message || "The verification code could not be sent."); } finally { setBusy(null); } }
  async function verifyCode() { setBusy("verify"); setMessage(""); try { const response = await postData(`${api.share(token)}/otp/verify`, { code }); setDecisionToken(response.data.data.decisionToken); setStep("verified"); setMessage("Email verified. You can now respond to this quotation."); } catch (e: any) { setMessage(e?.response?.data?.message || "The verification code is invalid or expired."); } finally { setBusy(null); } }
  async function decide(decision: "ACCEPTED" | "REJECTED") { setBusy(decision); setMessage(""); try { await postData(`${api.share(token)}/decision`, { decision, decisionToken }); setMessage(`Quotation ${decision === "ACCEPTED" ? "accepted" : "rejected"}.`); setDecisionToken(""); await client.invalidateQueries({ queryKey: ["shared-commercial-document", token] }); } catch (e: any) { setMessage(e?.response?.data?.message || "Your decision could not be recorded."); } finally { setBusy(null); } }
  async function download() { setBusy("download"); setMessage(""); try { const response = await instance.get(`${api.share(token)}/pdf`, { responseType: "blob" }); const url = URL.createObjectURL(response.data); const link = document.createElement("a"); link.href = url; link.download = `${query.data?.number || "document"}.pdf`; link.click(); URL.revokeObjectURL(url); } catch (e: any) { setMessage(e?.response?.data?.message || "Could not download PDF."); } finally { setBusy(null); } }
  const doc = query.data;

  return <main className="min-h-screen overflow-x-hidden bg-slate-50 p-3 text-slate-950 sm:p-5 md:p-8">
    <header className="no-print mx-auto mb-5 flex max-w-[960px] min-w-0 flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-widest text-amber-700">OBAOL secure document</p><h1 className="notranslate mt-1 break-words text-lg font-bold" translate="no">{doc?.number || "Document invitation"}</h1></div>
      <button disabled={Boolean(busy) || !doc} onClick={download} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 font-semibold disabled:opacity-50"><FiDownload />{busy === "download" ? "Downloading…" : "Download PDF"}</button>
    </header>
    {query.isLoading ? <p className="text-center">Loading secure document…</p> : query.isError ? <p className="mx-auto max-w-xl rounded-2xl border bg-white p-8 text-center">This invitation is expired, revoked, or unavailable.</p> : <>
      {rendered.isLoading ? <p className="text-center">Rendering document…</p> : rendered.isError ? <p className="text-center">The formatted preview is temporarily unavailable.</p> : <iframe title={`${doc?.number || "Document"} preview`} srcDoc={String(rendered.data || "")} className="mx-auto h-[1120px] w-full max-w-[960px] rounded-2xl border bg-white shadow-sm" sandbox="allow-same-origin" />}
      {doc?.type === "QUOTATION" && doc?.status === "SENT" && <section className="no-print mx-auto mt-5 max-w-[960px] rounded-2xl border bg-white p-5 shadow-sm md:p-6">
        <div className="flex min-w-0 items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-800"><FiShield /></span><div className="min-w-0"><h2 className="text-xl font-bold">Respond to quotation</h2><p className="mt-1 text-sm text-slate-600">Verify the invited email before accepting or rejecting this quotation.</p></div></div>
        {step === "idle" && <button disabled={Boolean(busy)} onClick={requestCode} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-amber-500 px-5 font-bold disabled:opacity-60"><FiMail />{busy === "request" ? "Sending code…" : "Verify recipient email"}</button>}
        {step === "code" && <div className="mt-5 max-w-md"><label className="block text-sm font-bold" htmlFor="decision-code">Verification code</label><p className="mt-1 text-xs text-slate-500">Sent to <span className="notranslate" translate="no">{maskedEmail}</span></p><div className="mt-2 flex flex-col gap-2 sm:flex-row"><input id="decision-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={event => setCode(event.target.value.replace(/\D/g, ""))} className="min-h-11 min-w-0 flex-1 rounded-xl border px-3 text-lg tracking-[0.3em]" /><button disabled={Boolean(busy) || code.length !== 6} onClick={verifyCode} className="min-h-11 rounded-xl bg-amber-500 px-5 font-bold disabled:opacity-60">{busy === "verify" ? "Verifying…" : "Verify code"}</button></div><button disabled={Boolean(busy)} onClick={requestCode} className="mt-3 text-sm font-semibold text-amber-800">Send a new code</button></div>}
        {step === "verified" && <div className="mt-5"><p className="flex items-center gap-2 text-sm font-semibold text-green-700"><FiCheckCircle /> Invited email verified</p><div className="mt-4 flex flex-col gap-2 sm:flex-row"><button disabled={Boolean(busy)} onClick={() => decide("ACCEPTED")} className="min-h-11 rounded-xl bg-green-700 px-5 font-bold text-white disabled:opacity-60">{busy === "ACCEPTED" ? "Accepting…" : "Accept quotation"}</button><button disabled={Boolean(busy)} onClick={() => decide("REJECTED")} className="min-h-11 rounded-xl border border-red-500 px-5 font-bold text-red-700 disabled:opacity-60">{busy === "REJECTED" ? "Rejecting…" : "Reject quotation"}</button></div></div>}
        {message && <p role="status" aria-live="polite" className="mt-4 break-words rounded-xl bg-slate-100 p-3 text-sm">{message}</p>}
      </section>}
      {doc?.status === "ACCEPTED" && <p className="no-print mx-auto mt-5 max-w-[960px] rounded-2xl border border-green-200 bg-green-50 p-5 text-center font-semibold text-green-800">Quotation accepted. The sender can now continue with the configured trade action.</p>}
      {doc?.status === "REJECTED" && <p className="no-print mx-auto mt-5 max-w-[960px] rounded-2xl border border-red-200 bg-red-50 p-5 text-center font-semibold text-red-800">Quotation rejected.</p>}
    </>}
    <style jsx global>{`@media print { .no-print { display: none !important; } body { background: white !important; } .commercial-sheet { max-width: none !important; } @page { size: A4; margin: 16mm; } }`}</style>
  </main>;
}
