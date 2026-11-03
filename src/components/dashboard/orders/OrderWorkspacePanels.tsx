"use client";

import Link from "next/link";
import { Button, Chip, Progress } from "@nextui-org/react";
import dayjs from "dayjs";
import { FiArrowRight, FiCheck, FiClock, FiPackage } from "react-icons/fi";

const value = (input: unknown, fallback = "Not specified") => input === null || input === undefined || input === "" ? fallback : String(input);
const money = (amount: unknown, currency = "INR") => typeof amount === "number"
  ? new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount)
  : "Not specified";

export function OrderOverviewPanel({ order, snapshot }: { order: any; snapshot: any }) {
  const sourceId = snapshot?.source?.enquiryId || order?.enquiry?._id || order?.enquiry;
  const product = snapshot?.product || order?.externalProduct || {};
  const commercial = snapshot?.commercial || {};
  const parties = snapshot?.parties || {
    buyer: order?.externalBuyer,
    supplier: order?.externalSeller,
  };
  const route = snapshot?.delivery?.executionContext || order?.executionContext || {};
  const routeLabel = [route.originDistrict || route.originState || route.originCountry, route.destinationDistrict || route.destinationState || route.destinationCountry]
    .filter(Boolean).join(" → ");

  return (
    <section id="overview" aria-labelledby="order-overview-title" className="space-y-5 scroll-mt-40">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black tracking-[0.2em] text-obaol-500">Finalized commercial record</p>
          <h2 id="order-overview-title" className="mt-1 text-2xl font-black tracking-tight text-foreground">Deal overview</h2>
          <p className="mt-1 text-sm text-default-500">Captured at conversion and protected from later enquiry changes.</p>
        </div>
        {sourceId && (
          <Link href={`/dashboard/enquiries/${sourceId}`} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-divider bg-content1 px-4 text-sm font-bold text-foreground hover:border-obaol-500/50 hover:text-obaol-600">
            Open source enquiry <FiArrowRight />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="rounded-3xl border border-divider bg-content1 p-6 xl:col-span-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black tracking-[0.18em] text-default-400">Product</p>
              <h3 className="mt-2 text-xl font-black text-foreground">{value(product.name, "Product not specified")}</h3>
              {product.variant && <p className="mt-1 text-sm font-semibold text-default-500">{product.variant}</p>}
            </div>
            <div className="rounded-2xl bg-obaol-500/10 p-3 text-obaol-600"><FiPackage size={22} /></div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-divider pt-5">
            <div><p className="text-xs font-bold text-default-400">Quantity</p><p className="mt-1 font-black text-foreground">{value(product.quantity)} {value(product.unit, "")}</p></div>
            <div><p className="text-xs font-bold text-default-400">Unit rate</p><p className="mt-1 font-black text-foreground">{money(commercial.unitRate, commercial.currency)}</p></div>
            <div className="col-span-2"><p className="text-xs font-bold text-default-400">Agreed order value</p><p className="mt-1 text-2xl font-black text-obaol-600">{money(commercial.totalValue, commercial.currency)}</p></div>
          </div>
        </div>

        <div className="rounded-3xl border border-divider bg-content1 p-6 xl:col-span-4">
          <p className="text-[10px] font-black tracking-[0.18em] text-default-400">Trade parties</p>
          <div className="mt-5 space-y-4">
            {[['Buyer', parties?.buyer], ['Supplier', parties?.supplier], ['Mediator', parties?.mediator]].filter(([, party]) => party).map(([label, party]: any) => (
              <div key={label} className="flex items-center justify-between gap-3 border-b border-divider pb-3 last:border-0 last:pb-0">
                <span className="text-xs font-bold text-default-400">{label}</span>
                <span className="text-right text-sm font-black text-foreground">{value(party?.name)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-divider bg-content1 p-6 xl:col-span-3">
          <p className="text-[10px] font-black tracking-[0.18em] text-default-400">Commitments</p>
          <div className="mt-5 space-y-4">
            <div><p className="text-xs font-bold text-default-400">Incoterm</p><p className="mt-1 font-black text-foreground">{value(commercial.incoterm)}</p></div>
            <div><p className="text-xs font-bold text-default-400">Payment term</p><p className="mt-1 font-black text-foreground">{value(commercial.paymentTerm)}</p></div>
            <div><p className="text-xs font-bold text-default-400">Delivery target</p><p className="mt-1 font-black text-foreground">{snapshot?.delivery?.commitmentDate ? dayjs(snapshot.delivery.commitmentDate).format("DD MMM YYYY") : "Not specified"}</p></div>
            <div><p className="text-xs font-bold text-default-400">Route</p><p className="mt-1 font-black text-foreground">{value(routeLabel)}</p></div>
          </div>
        </div>
      </div>

      {(product.specifications || product.packagingSpecifications) && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-divider bg-default-100/40 p-5"><p className="text-xs font-black text-default-400">PRODUCT SPECIFICATION</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">{value(product.specifications)}</p></div>
          <div className="rounded-2xl border border-divider bg-default-100/40 p-5"><p className="text-xs font-black text-default-400">PACKAGING AGREEMENT</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">{value(product.packagingSpecifications)}</p></div>
        </div>
      )}
    </section>
  );
}

export function OrderPaymentsPanel({ milestones, incoterm, paymentTerm, canManage, busy, onStatus }: { milestones: any[]; incoterm: string; paymentTerm: string; canManage: boolean; busy: boolean; onStatus: (index: number, status: "DUE" | "PAID") => void }) {
  const paid = milestones.filter((item) => item.status === "PAID").reduce((sum, item) => sum + Number(item.percent || 0), 0);
  return (
    <section id="payments" aria-labelledby="order-payments-title" className="scroll-mt-40 rounded-3xl border border-divider bg-content1 p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-[10px] font-black tracking-[0.2em] text-obaol-500">Commercial settlement</p><h2 id="order-payments-title" className="mt-1 text-2xl font-black text-foreground">Payment milestones</h2><p className="mt-1 text-sm text-default-500">{incoterm} · {paymentTerm}</p></div>
        <div className="min-w-44"><div className="mb-2 flex justify-between text-xs font-bold"><span className="text-default-500">Paid</span><span>{paid}%</span></div><Progress aria-label="Payment progress" value={paid} color="success" /></div>
      </div>
      <div className="mt-6 space-y-3">
        {milestones.length === 0 ? <div className="rounded-2xl border border-dashed border-divider p-8 text-center text-sm text-default-500">No payment milestones are configured.</div> : milestones.map((item, index) => (
          <div key={`${item.label}-${index}`} className="flex flex-col gap-4 rounded-2xl border border-divider bg-default-100/30 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 rounded-full p-2 ${item.status === 'PAID' ? 'bg-success-500/15 text-success-600' : 'bg-warning-500/15 text-warning-600'}`}>{item.status === 'PAID' ? <FiCheck /> : <FiClock />}</div>
              <div><p className="font-black text-foreground">{item.label}</p><p className="mt-1 text-xs text-default-500">{item.dueAtStageKey ? `Due at ${String(item.dueAtStageKey).replaceAll('_', ' ')}` : item.dueAtDocType ? `Due after verified ${String(item.dueAtDocType).replaceAll('_', ' ')}` : 'Configured payment milestone'}</p></div>
            </div>
            <div className="flex items-center justify-between gap-3 sm:justify-end"><span className="text-lg font-black">{Number(item.percent || 0)}%</span><Chip size="sm" color={item.status === 'PAID' ? 'success' : item.status === 'DUE' ? 'warning' : 'default'} variant="flat">{item.status || 'PENDING'}</Chip>{canManage && item.status === 'DUE' && <Button size="sm" color="success" variant="flat" isLoading={busy} onPress={() => onStatus(index, 'PAID')}>Mark paid</Button>}{canManage && item.status === 'PAID' && <Button size="sm" variant="light" isLoading={busy} onPress={() => onStatus(index, 'DUE')}>Reopen</Button>}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
