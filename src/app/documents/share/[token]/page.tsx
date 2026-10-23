"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getData, postData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import UnifiedDocumentView from "@/components/dashboard/CommercialDocuments/UnifiedDocumentView";

export default function SharedDocumentPage() {
  const params = useParams(), token = String(params.token || ""), api = apiRoutes.commercialDocuments, client = useQueryClient();
  const [message, setMessage] = useState(""), [busy, setBusy] = useState(false);
  const query = useQuery({ queryKey: ["shared-commercial-document", token], queryFn: async () => (await getData(api.share(token))).data.data, enabled: Boolean(token), retry: false });
  async function decide(decision: "ACCEPTED" | "REJECTED") { setBusy(true); setMessage(""); try { await postData(`${api.share(token)}/decision`, { decision }); setMessage("Your decision was recorded."); await client.invalidateQueries({ queryKey: ["shared-commercial-document", token] }); } catch (e: any) { setMessage(e?.response?.data?.message || "Sign in with the invited buyer company to respond."); } finally { setBusy(false); } }
  const doc = query.data;
  return <main className="min-h-screen bg-slate-50 p-4 md:p-10">
    <div className="no-print max-w-[820px] mx-auto mb-5 flex flex-wrap gap-3 items-center"><h1 className="text-xl font-bold mr-auto">OBAOL Documents</h1><button onClick={() => window.print()} className="rounded-xl border px-4 py-2">Print / save PDF</button></div>
    {query.isLoading ? <p>Loading…</p> : query.isError ? <p className="text-center">This invitation is expired or unavailable.</p> : <>
      <UnifiedDocumentView doc={doc} />
      {doc?.type === "QUOTATION" && doc?.status === "SENT" && <section className="no-print max-w-[820px] mx-auto mt-5 bg-white border rounded-2xl p-6"><h2 className="text-xl font-semibold">Respond to quotation</h2><p className="text-sm text-slate-600 mb-4">Sign in as the invited OBAOL buyer company, then accept or reject this quotation.</p><div className="flex flex-wrap gap-2"><button disabled={busy} onClick={() => decide("ACCEPTED")} className="rounded-xl bg-green-700 text-white px-4 py-2">Accept quotation</button><button disabled={busy} onClick={() => decide("REJECTED")} className="rounded-xl border px-4 py-2">Reject quotation</button></div>{message && <p role="status" className="mt-3">{message}</p>}</section>}
      {doc?.status === "ACCEPTED" && <p className="text-center mt-5">Quotation accepted.</p>}{doc?.status === "REJECTED" && <p className="text-center mt-5">Quotation rejected.</p>}
    </>}
    <style jsx global>{`@media print { .no-print { display: none !important; } body { background: white !important; } .commercial-sheet { max-width: none !important; } @page { size: A4; margin: 16mm; } }`}</style>
  </main>;
}
