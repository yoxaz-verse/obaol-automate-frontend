"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, CardBody, Chip, Pagination, Spinner } from "@nextui-org/react";
import { FiArrowLeft, FiBox, FiExternalLink, FiEye, FiMousePointer, FiMessageSquare, FiUsers } from "react-icons/fi";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";

const ranges = [{ label: "7 days", days: 7 }, { label: "30 days", days: 30 }, { label: "90 days", days: 90 }];
const unwrap = (response: any) => response?.data?.data || response?.data || {};
const formatDate = (value?: string | null) => value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value)) : "Not tracked";
const percent = (value: number | null | undefined) => value == null ? "N/A" : `${(value * 100).toFixed(1)}%`;

export default function ProductAnalyticsPage() {
  const listingId = String(useParams()?.listingId || "");
  const [days, setDays] = useState(30);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [inquiryPage, setInquiryPage] = useState(1);
  const [similarPage, setSimilarPage] = useState(1);
  const params = useMemo(() => {
    if (customFrom && customTo) return { from: new Date(`${customFrom}T00:00:00.000Z`).toISOString(), to: new Date(`${customTo}T23:59:59.999Z`).toISOString() };
    const to = new Date(); const from = new Date(to.getTime() - (days - 1) * 86400000);
    return { from: from.toISOString(), to: to.toISOString() };
  }, [days, customFrom, customTo]);
  const summary = useQuery({ queryKey: ["product-analytics", listingId, params], queryFn: async () => unwrap(await getData(apiRoutes.analytics.productDetails(listingId), params)), enabled: Boolean(listingId) });
  const inquiries = useQuery({ queryKey: ["product-analytics-inquiries", listingId, params, inquiryPage], queryFn: async () => unwrap(await getData(apiRoutes.analytics.productInquiries(listingId), { ...params, page: inquiryPage, limit: 10 })), enabled: Boolean(listingId) });
  const similar = useQuery({ queryKey: ["product-analytics-similar", listingId, similarPage], queryFn: async () => unwrap(await getData(apiRoutes.analytics.productSimilar(listingId), { page: similarPage, limit: 10 })), enabled: Boolean(listingId) });

  if (summary.isLoading) return <div className="grid min-h-[60vh] place-items-center"><Spinner label="Loading product intelligence…" /></div>;
  if (summary.isError) return <div className="mx-auto max-w-3xl rounded-2xl border border-danger-200 bg-danger-50 p-8 text-danger-700"><h1 className="text-xl font-black">Unable to load product analytics</h1><p className="mt-2 text-sm">The listing may not exist, or your account may not have administrator access.</p><Button as={Link} href="/dashboard/product" className="mt-5">Back to products</Button></div>;
  const data: any = summary.data || {}; const overview = data.overview || {}; const performance = data.performance || {}; const catalog = data.catalog || {}; const inquirySummary = data.inquirySummary || {};
  const metrics = [
    ["Listing clicks", performance.clicks, FiMousePointer], ["Detail views", performance.views, FiEye], ["Unique visitors", performance.uniqueVisitors, FiUsers], ["Rate reveals", performance.reveals, FiEye], ["Inquiries", performance.inquiries, FiMessageSquare], ["View → inquiry", percent(performance.viewToInquiryRate), FiMessageSquare], ["Inquiry → order", percent(performance.inquiryToOrderRate), FiBox],
  ];
  return <div className="mx-auto w-full max-w-[1500px] space-y-6 px-4 pb-14 md:px-8">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3"><Button as={Link} href="/dashboard/product" isIconOnly variant="flat" aria-label="Back to products"><FiArrowLeft /></Button><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-obaol-500">Product intelligence</p><h1 className="text-3xl font-black">{overview.name || "Product"}</h1><p className="text-sm text-default-500">{overview.variant} · {overview.seller}</p></div></div>
      <div className="flex flex-wrap items-center gap-2">{ranges.map((range) => <Button key={range.days} size="sm" color={!customFrom && days === range.days ? "warning" : "default"} variant={!customFrom && days === range.days ? "solid" : "flat"} onPress={() => { setCustomFrom(""); setCustomTo(""); setDays(range.days); setInquiryPage(1); }}>{range.label}</Button>)}<label className="text-xs text-default-500">From <input aria-label="Custom range start" type="date" value={customFrom} max={customTo || undefined} onChange={(event) => { setCustomFrom(event.target.value); setInquiryPage(1); }} className="ml-1 rounded-lg border border-divider bg-content1 px-2 py-1.5" /></label><label className="text-xs text-default-500">To <input aria-label="Custom range end" type="date" value={customTo} min={customFrom || undefined} onChange={(event) => { setCustomTo(event.target.value); setInquiryPage(1); }} className="ml-1 rounded-lg border border-divider bg-content1 px-2 py-1.5" /></label></div>
    </div>

    <Card className="border border-obaol-200/30 bg-gradient-to-br from-content1 to-obaol-50/30"><CardBody className="grid gap-6 p-6 lg:grid-cols-[1fr_2fr]">
      <div className="grid min-h-48 place-items-center overflow-hidden rounded-3xl bg-obaol-100/50 text-obaol-600">{overview.imageUrl ? <img src={overview.imageUrl} alt={overview.name || "Product"} className="h-full max-h-72 w-full object-cover" /> : <FiBox size={64} />}</div>
      <div><div className="flex flex-wrap gap-2"><Chip color={overview.isLive ? "success" : "default"} variant="flat">{overview.isLive ? "Live" : "Offline"}</Chip>{(overview.classifications || []).map((item: string) => <Chip key={item} variant="bordered">{item}</Chip>)}</div><p className="mt-4 text-default-600">{overview.description || "No description available."}</p><div className="mt-6 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">{[["Category", overview.category], ["Subcategory", overview.subCategory], ["Seller", overview.seller], ["Price", overview.rate != null ? `${overview.rate} ${overview.unit || ""}` : "Not available"], ["Listed", formatDate(overview.createdAt)], ["Updated", formatDate(overview.updatedAt)]].map(([label, value]) => <div key={label} className="rounded-xl bg-content2/70 p-3"><p className="text-xs text-default-400">{label}</p><p className="font-bold">{value || "—"}</p></div>)}</div><p className="mt-4 break-all text-xs text-default-400">Listing {overview.listingId} · Product {overview.productId} · Variant {overview.variantId}</p></div>
    </CardBody></Card>

    <section><h2 className="mb-3 text-xl font-black">Performance summary</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">{metrics.map(([label, value, Icon]: any) => <Card key={label} className="border border-divider"><CardBody className="gap-3 p-4"><Icon className="text-obaol-500" /><p className="text-2xl font-black">{value ?? "Not tracked"}</p><p className="text-xs font-semibold text-default-500">{label}</p></CardBody></Card>)}</div><p className="mt-2 text-xs text-default-400">Interaction coverage: {formatDate(data.dataCoverage?.interactionsFrom)} · Reveal coverage: {formatDate(data.dataCoverage?.revealsFrom)}</p></section>

    <Card><CardBody className="p-5"><h2 className="text-xl font-black">Engagement and inquiry trend</h2><div className="mt-5 h-80 w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={data.trend || []}><CartesianGrid strokeDasharray="3 3" opacity={0.2} /><XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Line type="monotone" dataKey="views" stroke="#8b5cf6" strokeWidth={2} /><Line type="monotone" dataKey="clicks" stroke="#d88a45" strokeWidth={2} /><Line type="monotone" dataKey="reveals" stroke="#0ea5e9" strokeWidth={2} /><Line type="monotone" dataKey="inquiries" stroke="#22c55e" strokeWidth={2} /></LineChart></ResponsiveContainer></div></CardBody></Card>

    <div className="grid gap-6 xl:grid-cols-2">
      <Card><CardBody className="p-5"><h2 className="text-xl font-black">Inquiry insights</h2><div className="my-4 grid grid-cols-3 gap-2 sm:grid-cols-6">{Object.entries(inquirySummary.statuses || {}).map(([status, count]) => <div key={status} className="rounded-xl bg-content2 p-2 text-center"><p className="text-lg font-black">{String(count)}</p><p className="text-[10px] uppercase text-default-400">{status}</p></div>)}</div><div className="space-y-2">{(inquiries.data?.rows || []).map((row: any) => <Link key={row._id} href={`/dashboard/enquiries/${row._id}`} className="flex items-center justify-between rounded-xl border border-divider p-3 hover:border-obaol-400"><div><p className="font-bold">Inquiry {String(row._id).slice(-8)}</p><p className="text-xs text-default-400">{formatDate(row.createdAt)} · Qty {row.quantity ?? "—"}</p></div><div className="flex items-center gap-2"><Chip size="sm" variant="flat">{row.status}</Chip><FiExternalLink /></div></Link>)}{!inquiries.isLoading && !(inquiries.data?.rows || []).length && <p className="py-8 text-center text-sm text-default-400">No inquiries in this period.</p>}</div>{(inquiries.data?.meta?.pages || 1) > 1 && <Pagination className="mt-4" page={inquiryPage} total={inquiries.data.meta.pages} onChange={setInquiryPage} />}</CardBody></Card>
      <Card><CardBody className="p-5"><h2 className="text-xl font-black">Catalog competition</h2><div className="my-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{[["Catalog products", catalog.totalProducts], ["Same category", catalog.sameCategoryProducts], ["Matching listings", catalog.matchingProductListings], ["Matching variants", catalog.matchingVariants], ["Similar sellers", catalog.similarSellers], ["Unique variant", catalog.uniqueVariant ? "Yes" : "No"]].map(([label, value]) => <div key={label} className="rounded-xl bg-content2 p-3"><p className="text-xl font-black">{value ?? "—"}</p><p className="text-xs text-default-400">{label}</p></div>)}</div><div className="space-y-2">{(similar.data?.rows || []).map((row: any) => <div key={row.id} className="flex items-center justify-between rounded-xl border border-divider p-3"><div><p className="font-bold">{row.product} · {row.variant}</p><p className="text-xs text-default-400">{row.seller || "Unknown seller"}</p></div><Chip size="sm" color={row.matchType === "EXACT_VARIANT" ? "success" : "warning"} variant="flat">{String(row.matchType).replaceAll("_", " ")}</Chip></div>)}{!similar.isLoading && !(similar.data?.rows || []).length && <p className="py-8 text-center text-sm text-default-400">No competing listings found. This product is currently unique in the catalog scope.</p>}</div>{(similar.data?.meta?.pages || 1) > 1 && <Pagination className="mt-4" page={similarPage} total={similar.data.meta.pages} onChange={setSimilarPage} />}</CardBody></Card>
    </div>
  </div>;
}
