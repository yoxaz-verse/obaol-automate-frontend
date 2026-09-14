"use client";
import React from "react";

export default function DocumentSheet({ doc }: { doc: any }) {
  if (!doc) return null;
  const money = (n: any) => `${doc.currency || "INR"} ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return <article className="commercial-sheet mx-auto max-w-[820px] bg-white text-slate-900 border border-slate-200 shadow-sm p-8 md:p-12 print:border-0 print:shadow-none print:p-0">
    <header className="flex justify-between gap-6 border-b border-slate-200 pb-8">
      <div>{doc.issuer?.logo && <img src={doc.issuer.logo} alt="Company logo" className="h-14 w-auto mb-3" />}<h1 className="text-2xl font-bold">{doc.issuer?.name}</h1><p className="whitespace-pre-line text-sm text-slate-600">{doc.issuer?.billingAddress}</p><p className="text-sm">{doc.issuer?.email} · {doc.issuer?.phone}</p>{doc.issuer?.gstin && <p className="text-sm">GSTIN: {doc.issuer.gstin}</p>}</div>
      <div className="text-right shrink-0"><h2 className="text-2xl font-bold">{doc.type === "INVOICE" ? "Invoice" : "Quotation"}</h2><p className="text-sm">{doc.number}</p><p className="text-sm">Issued: {new Date(doc.issueDate).toLocaleDateString()}</p>{doc.validUntil && <p className="text-sm">Valid until: {new Date(doc.validUntil).toLocaleDateString()}</p>}<p className="text-sm font-semibold mt-2">{doc.status}</p></div>
    </header>
    <section className="py-7"><p className="text-xs uppercase font-bold tracking-wider text-slate-500">Bill to</p><h3 className="font-bold text-lg">{doc.recipient?.name}</h3><p className="text-sm">Attn: {doc.recipient?.contactName}</p><p className="text-sm whitespace-pre-line">{doc.recipient?.billingAddress}</p><p className="text-sm">{doc.recipient?.email} · {doc.recipient?.phone}</p>{doc.recipient?.gstin && <p className="text-sm">GSTIN: {doc.recipient.gstin}</p>}</section>
    <table className="w-full text-sm border-collapse"><thead><tr className="border-b-2 border-slate-700 text-left"><th className="py-3">Product / service</th><th className="py-3 text-right">Qty</th><th className="py-3 text-right">Price</th><th className="py-3 text-right">Tax</th><th className="py-3 text-right">Total</th></tr></thead><tbody>{(doc.items || []).map((item: any, index: number) => <tr key={index} className="border-b border-slate-200 break-inside-avoid"><td className="py-3 pr-3">{item.description}</td><td className="py-3 text-right">{item.quantity} {item.unit}</td><td className="py-3 text-right">{money(item.unitPrice)}</td><td className="py-3 text-right">{item.taxRate}%</td><td className="py-3 text-right font-semibold">{money(item.total)}</td></tr>)}</tbody></table>
    <div className="ml-auto mt-6 w-64 text-sm"><div className="flex justify-between py-1"><span>Subtotal</span><span>{money(doc.subtotal)}</span></div><div className="flex justify-between py-1"><span>Tax</span><span>{money(doc.taxAmount)}</span></div><div className="flex justify-between border-t border-slate-400 py-3 text-lg font-bold"><span>Total</span><span>{money(doc.total)}</span></div></div>
    {doc.terms && <section className="mt-8 break-inside-avoid"><h3 className="font-bold">Terms</h3><p className="whitespace-pre-line text-sm">{doc.terms}</p></section>}{doc.notes && <section className="mt-5 break-inside-avoid"><h3 className="font-bold">Notes</h3><p className="whitespace-pre-line text-sm">{doc.notes}</p></section>}
    {doc.type === "INVOICE" && <p className="mt-8 text-sm font-semibold">Payment: {doc.paymentStatus || "UNPAID"}</p>}
  </article>;
}
