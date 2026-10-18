"use client";

import { useContext, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Chip, Spinner, Tab, Tabs } from "@nextui-org/react";
import { FiClock, FiLock, FiPlus, FiRefreshCw } from "react-icons/fi";
import AuthContext from "@/context/AuthContext";
import { deleteData, getData, postData, putData } from "@/core/api/apiHandler";
import { productBiddingRoutes, productRoutes, variantRateRoutes } from "@/core/api/apiRoutes";

type Mode = "buyer" | "seller";
type EventRow = { _id: string; title: string; product?: any; productVariant?: any; quantity: number; unit: string; specifications?: string; deliveryLocation?: string; deliveryDate?: string; opensAt?: string; closesAt?: string; status: string; offerCount: number; ownOffer?: any; offers?: any[]; draftEnquiry?: string | null };
const statuses = ["DRAFT", "SCHEDULED", "OPEN", "CLOSED", "AWARDED", "CANCELLED"];
const field = "w-full rounded-xl border border-divider bg-background px-3 py-2 text-sm outline-none focus:border-warning-500";
const message = (error: any) => error?.response?.data?.message || "The request could not be completed.";
const dateText = (value?: string) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Not scheduled";

export default function BiddingPage() {
  const { user } = useContext(AuthContext);
  const client = useQueryClient();
  const role = String(user?.role || "").toLowerCase();
  const provided = user?.providedCapabilities || [];
  const sought = user?.soughtCapabilities || [];
  const canBuy = role !== "associate" || sought.includes("buyer") || provided.includes("buyer");
  const canSell = role !== "associate" || provided.includes("seller");
  const [mode, setMode] = useState<Mode>(canBuy ? "buyer" : "seller");
  const [status, setStatus] = useState("ALL");
  const [showCreate, setShowCreate] = useState(false);
  const [activeOffer, setActiveOffer] = useState<EventRow | null>(null);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<any>({ title: "", product: "", quantity: "", unit: "MT", specifications: "", deliveryLocation: "", deliveryDate: "", opensAt: "", closesAt: "" });
  const [offer, setOffer] = useState<any>({ listing: "", unitPrice: "", offeredQuantity: "", unit: "MT", validUntil: "", note: "" });

  const eventsQuery = useQuery({
    queryKey: ["product-bidding", mode, status],
    queryFn: async () => (await getData(productBiddingRoutes.list, { mode, ...(status !== "ALL" ? { status } : {}) }, { cacheMode: "bypass" })).data.data as EventRow[],
  });
  const productsQuery = useQuery({ queryKey: ["bidding-products"], queryFn: async () => (await getData(productRoutes.getAll, { limit: 200 })).data?.data?.data || [] });
  const listingsQuery = useQuery({
    queryKey: ["bidding-own-listings", user?.id],
    queryFn: async () => (await getData(variantRateRoutes.getAll, { associate: user?.id, view: "product-table", limit: 200 })).data?.data?.data || [],
    enabled: mode === "seller",
  });
  const matchingListings = useMemo(() => (listingsQuery.data || []).filter((row: any) => {
    const productId = row?.productVariant?.product?._id || row?.productVariant?.product;
    return !activeOffer || String(productId || "") === String(activeOffer.product?._id || activeOffer.product || "");
  }), [listingsQuery.data, activeOffer]);
  const refresh = () => client.invalidateQueries({ queryKey: ["product-bidding"] });

  const action = useMutation({
    mutationFn: async ({ url, body = {}, method = "post" }: any) => method === "delete" ? deleteData(url) : postData(url, body),
    onSuccess: () => { setError(""); setActiveOffer(null); refresh(); },
    onError: (e) => setError(message(e)),
  });
  const create = useMutation({
    mutationFn: async () => {
      const created = await postData(productBiddingRoutes.create, { ...draft, quantity: Number(draft.quantity), deliveryDate: draft.deliveryDate || null });
      await postData(productBiddingRoutes.publish(created.data.data._id), { opensAt: new Date(draft.opensAt).toISOString(), closesAt: new Date(draft.closesAt).toISOString() });
    },
    onSuccess: () => { setShowCreate(false); setError(""); setDraft({ title: "", product: "", quantity: "", unit: "MT", specifications: "", deliveryLocation: "", deliveryDate: "", opensAt: "", closesAt: "" }); refresh(); },
    onError: (e) => setError(message(e)),
  });
  const submitOffer = useMutation({
    mutationFn: () => putData(productBiddingRoutes.offer(activeOffer!._id), { ...offer, unitPrice: Number(offer.unitPrice), offeredQuantity: Number(offer.offeredQuantity), validUntil: offer.validUntil || null }),
    onSuccess: () => { setActiveOffer(null); setError(""); refresh(); },
    onError: (e) => setError(message(e)),
  });

  const rows = eventsQuery.data || [];
  return <main className="mx-auto w-full max-w-[1400px] p-4 md:p-8">
    <header className="mb-6 rounded-3xl border border-warning-300/30 bg-gradient-to-br from-warning-50 to-background p-5 dark:from-warning-900/10">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="mb-2 flex items-center gap-2 text-warning-600"><FiLock/><span className="text-xs font-black uppercase tracking-[.2em]">Sealed product offers</span></div><h1 className="text-3xl font-black">Bidding</h1><p className="mt-1 max-w-2xl text-sm text-default-500">Create scheduled buying requirements or participate with a confidential offer linked to your company’s trade listing.</p></div>{mode === "buyer" && canBuy && <Button color="warning" startContent={<FiPlus/>} onPress={() => setShowCreate(true)}>Create bidding event</Button>}</div>
    </header>
    {error && <div role="alert" className="mb-4 rounded-xl border border-danger-300 bg-danger-50 p-3 text-sm text-danger-700">{error}</div>}
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <Tabs selectedKey={mode} onSelectionChange={(key) => { setMode(String(key) as Mode); setStatus("ALL"); }} color="warning" variant="underlined">
        {canBuy && <Tab key="buyer" title="Buying events"/>}{canSell && <Tab key="seller" title="Seller opportunities"/>}
      </Tabs>
      <Button isIconOnly variant="light" aria-label="Refresh" onPress={() => refresh()}><FiRefreshCw/></Button>
    </div>
    <div className="mb-5 flex gap-2 overflow-x-auto pb-1">{["ALL", ...statuses].map((item) => <Button key={item} size="sm" color={status === item ? "warning" : "default"} variant={status === item ? "solid" : "flat"} onPress={() => setStatus(item)}>{item.replaceAll("_", " ")}</Button>)}</div>
    {eventsQuery.isLoading ? <div className="flex h-48 items-center justify-center"><Spinner color="warning"/></div> : rows.length === 0 ? <div className="rounded-3xl border border-dashed border-divider py-20 text-center"><FiLock className="mx-auto mb-3 text-3xl text-default-300"/><h2 className="font-bold">No bidding events here</h2><p className="text-sm text-default-500">Events matching this view will appear here.</p></div> : <section className="grid gap-4 lg:grid-cols-2">{rows.map((item) => <article key={item._id} className="rounded-3xl border border-divider bg-content1 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-warning-600">{item.product?.name || "Product requirement"}</p><h2 className="mt-1 text-xl font-black">{item.title}</h2></div><Chip size="sm" color={item.status === "OPEN" ? "success" : item.status === "CANCELLED" ? "danger" : item.status === "AWARDED" ? "warning" : "default"} variant="flat">{item.status}</Chip></div>
      <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-default-50 p-4 text-sm"><div><span className="text-default-400">Quantity</span><p className="font-bold">{item.quantity} {item.unit}</p></div><div><span className="text-default-400">Offers</span><p className="font-bold">{item.offerCount}</p></div><div><span className="text-default-400">Opens</span><p className="font-medium">{dateText(item.opensAt)}</p></div><div><span className="text-default-400">Closes</span><p className="font-medium">{dateText(item.closesAt)}</p></div></div>
      {item.specifications && <p className="mt-3 text-sm text-default-600">{item.specifications}</p>}
      {mode === "seller" && item.ownOffer && <div className="mt-3 rounded-xl border border-success-300/40 bg-success-50 p-3 text-sm"><strong>Your sealed offer:</strong> {item.ownOffer.unitPrice} / {item.ownOffer.unit} · {item.ownOffer.status}</div>}
      {mode === "buyer" && item.status === "OPEN" && <p className="mt-3 flex items-center gap-2 text-xs text-default-500"><FiLock/>Offer identities and prices unlock only after closing.</p>}
      {mode === "buyer" && item.offers?.length ? <div className="mt-4 space-y-2">{item.offers.filter((o) => o.status === "SUBMITTED" || o.status === "AWARDED").map((o) => <div key={o._id} className="flex items-center justify-between gap-3 rounded-xl border border-divider p-3"><div><p className="font-bold">{o.sellerCompany?.name || "Seller"}</p><p className="text-xs text-default-500">{o.offeredQuantity} {o.unit} · {o.unitPrice} per {o.unit}</p></div>{item.status === "CLOSED" && <Button size="sm" color="warning" onPress={() => action.mutate({ url: productBiddingRoutes.award(item._id), body: { offerId: o._id } })}>Select winner</Button>}</div>)}</div> : null}
      <div className="mt-4 flex flex-wrap gap-2">{mode === "seller" && item.status === "OPEN" && <Button color="warning" variant="flat" onPress={() => { setActiveOffer(item); setOffer(item.ownOffer ? { listing: item.ownOffer.listing?._id || item.ownOffer.listing, unitPrice: item.ownOffer.unitPrice, offeredQuantity: item.ownOffer.offeredQuantity, unit: item.ownOffer.unit, validUntil: item.ownOffer.validUntil?.slice(0,10) || "", note: item.ownOffer.note || "" } : { listing: "", unitPrice: "", offeredQuantity: item.quantity, unit: item.unit, validUntil: "", note: "" }); }}>{item.ownOffer ? "Revise offer" : "Submit offer"}</Button>}{mode === "seller" && item.status === "OPEN" && item.ownOffer?.status === "SUBMITTED" && <Button color="danger" variant="light" onPress={() => action.mutate({ url: productBiddingRoutes.offer(item._id), method: "delete" })}>Withdraw</Button>}{mode === "buyer" && item.status === "OPEN" && <Button variant="flat" onPress={() => action.mutate({ url: productBiddingRoutes.close(item._id) })}>Close now</Button>}{mode === "buyer" && !["AWARDED", "CANCELLED"].includes(item.status) && <Button color="danger" variant="light" onPress={() => action.mutate({ url: productBiddingRoutes.cancel(item._id), body: {} })}>Cancel</Button>}{item.draftEnquiry && <><Button as="a" href={`/dashboard/enquiries/${item.draftEnquiry}`} variant="flat">Review draft</Button><Button color="success" onPress={() => action.mutate({ url: productBiddingRoutes.confirmEnquiry(item._id) })}>Confirm enquiry</Button></>}</div>
    </article>)}</section>}

    {showCreate && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><form className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-content1 p-6 shadow-2xl" onSubmit={(e) => { e.preventDefault(); create.mutate(); }}><h2 className="text-2xl font-black">Create sealed bidding event</h2><p className="mb-5 text-sm text-default-500">Prices remain sealed until the scheduled close.</p><div className="grid gap-4 md:grid-cols-2"><label className="md:col-span-2 text-sm">Title<input required className={field} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })}/></label><label className="md:col-span-2 text-sm">Product<select required className={field} value={draft.product} onChange={(e) => setDraft({ ...draft, product: e.target.value })}><option value="">Select product</option>{(productsQuery.data || []).map((p: any) => <option key={p._id} value={p._id}>{p.name}</option>)}</select></label><label className="text-sm">Quantity<input required min="0.000001" step="any" type="number" className={field} value={draft.quantity} onChange={(e) => setDraft({ ...draft, quantity: e.target.value })}/></label><label className="text-sm">Unit<select className={field} value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })}><option>KG</option><option>MT</option><option>Quintal</option></select></label><label className="text-sm">Opens at<input required type="datetime-local" className={field} value={draft.opensAt} onChange={(e) => setDraft({ ...draft, opensAt: e.target.value })}/></label><label className="text-sm">Closes at<input required type="datetime-local" className={field} value={draft.closesAt} onChange={(e) => setDraft({ ...draft, closesAt: e.target.value })}/></label><label className="text-sm">Delivery date<input type="date" className={field} value={draft.deliveryDate} onChange={(e) => setDraft({ ...draft, deliveryDate: e.target.value })}/></label><label className="text-sm">Delivery location<input className={field} value={draft.deliveryLocation} onChange={(e) => setDraft({ ...draft, deliveryLocation: e.target.value })}/></label><label className="md:col-span-2 text-sm">Specifications<textarea rows={4} className={field} value={draft.specifications} onChange={(e) => setDraft({ ...draft, specifications: e.target.value })}/></label></div><div className="mt-6 flex justify-end gap-2"><Button variant="light" onPress={() => setShowCreate(false)}>Cancel</Button><Button type="submit" color="warning" isLoading={create.isPending}>Schedule bidding</Button></div></form></div>}
    {activeOffer && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><form className="w-full max-w-xl rounded-3xl bg-content1 p-6 shadow-2xl" onSubmit={(e) => { e.preventDefault(); submitOffer.mutate(); }}><h2 className="text-2xl font-black">Confidential offer</h2><p className="mb-5 text-sm text-default-500">Only your company can see this price until the event closes.</p><div className="space-y-4"><label className="block text-sm">Matching trade listing<select required className={field} value={offer.listing} onChange={(e) => setOffer({ ...offer, listing: e.target.value })}><option value="">Select your product</option>{matchingListings.map((row: any) => <option key={row._id} value={row._id}>{row.productVariant?.product?.name || "Product"} — {row.productVariant?.name || "Variant"} ({row.isLive ? "Live" : "Offline"})</option>)}</select></label><div className="grid grid-cols-2 gap-3"><label className="text-sm">Unit price<input required type="number" min="0.000001" step="any" className={field} value={offer.unitPrice} onChange={(e) => setOffer({ ...offer, unitPrice: e.target.value })}/></label><label className="text-sm">Quantity<input required type="number" min="0.000001" step="any" className={field} value={offer.offeredQuantity} onChange={(e) => setOffer({ ...offer, offeredQuantity: e.target.value })}/></label><label className="text-sm">Unit<select className={field} value={offer.unit} onChange={(e) => setOffer({ ...offer, unit: e.target.value })}><option>KG</option><option>MT</option><option>Quintal</option></select></label><label className="text-sm">Valid until<input type="date" className={field} value={offer.validUntil} onChange={(e) => setOffer({ ...offer, validUntil: e.target.value })}/></label></div><label className="block text-sm">Note<textarea rows={3} className={field} value={offer.note} onChange={(e) => setOffer({ ...offer, note: e.target.value })}/></label></div><div className="mt-6 flex justify-end gap-2"><Button variant="light" onPress={() => setActiveOffer(null)}>Cancel</Button><Button type="submit" color="warning" isLoading={submitOffer.isPending}>Seal and submit</Button></div></form></div>}
  </main>;
}
