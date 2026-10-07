"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardBody, Input, Pagination, Select, SelectItem, Spinner } from "@nextui-org/react";
import { FiActivity, FiEye, FiPackage, FiSearch, FiUsers } from "react-icons/fi";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getData } from "@/core/api/apiHandler";
import { variantRateRoutes } from "@/core/api/apiRoutes";

const formatDateTime = (value: string) => value ? new Date(value).toLocaleString() : "—";

export default function RateInterestPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const params = useMemo(() => ({ page, limit: 25, ...(search.trim() ? { search: search.trim() } : {}), ...(status !== "all" ? { status } : {}) }), [page, search, status]);
  const query = useQuery({
    queryKey: ["rate-interest", params],
    queryFn: async () => (await getData(variantRateRoutes.rateInterestAnalytics, params))?.data?.data || {},
  });
  const data: any = query.data || {};
  const summary = data.summary || {};
  const cards = [
    { label: "Reveal sessions", value: summary.revealSessions || 0, icon: FiEye },
    { label: "Unique viewers", value: summary.uniqueViewers || 0, icon: FiUsers },
    { label: "Listings with interest", value: summary.listings || 0, icon: FiPackage },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <header className="rounded-3xl border border-divider bg-content1 p-5 md:p-7">
          <div className="flex items-center gap-3"><div className="rounded-2xl bg-obaol-100 p-3 text-obaol-600"><FiActivity size={24} /></div><div><h1 className="text-2xl font-black">Rate Interest</h1><p className="text-sm text-default-500">See who is revealing marketplace rates and which products attract attention.</p></div></div>
        </header>
        <div className="grid gap-4 sm:grid-cols-3">{cards.map(({ label, value, icon: Icon }) => <Card key={label} className="border border-divider"><CardBody className="flex flex-row items-center justify-between p-5"><div><p className="text-[10px] font-bold uppercase tracking-widest text-default-400">{label}</p><p className="mt-1 text-3xl font-black">{value}</p></div><Icon className="text-obaol-500" size={24} /></CardBody></Card>)}</div>
        <div className="grid gap-4 lg:grid-cols-4">
          <Card className="border border-divider lg:col-span-2"><CardBody className="h-72 p-5"><h2 className="mb-4 font-bold">Reveal trend</h2><ResponsiveContainer width="100%" height="85%"><LineChart data={data.trend || []}><XAxis dataKey="date" fontSize={11} /><YAxis allowDecimals={false} fontSize={11} /><Tooltip /><Line type="monotone" dataKey="count" stroke="#d49b36" strokeWidth={3} /></LineChart></ResponsiveContainer></CardBody></Card>
          <Card className="border border-divider"><CardBody className="p-5"><h2 className="mb-4 font-bold">Top products</h2><div className="space-y-3">{(data.topProducts || []).map((row: any) => <div key={row.name} className="flex justify-between gap-3 text-sm"><span className="truncate">{row.name}</span><span className="font-black text-obaol-500">{row.count}</span></div>)}{!data.topProducts?.length && <p className="text-sm text-default-400">No reveal activity yet.</p>}</div></CardBody></Card>
          <Card className="border border-divider"><CardBody className="p-5"><h2 className="mb-4 font-bold">Top listings</h2><div className="space-y-3">{(data.topListings || []).map((row: any) => <div key={row._id} className="flex justify-between gap-3 text-sm"><span className="truncate" title={`${row.product || "Product"} · ${row.variant || "Variant"}`}>{row.product || "Product"} · {row.variant || "Variant"}</span><span className="font-black text-obaol-500">{row.count}</span></div>)}{!data.topListings?.length && <p className="text-sm text-default-400">No reveal activity yet.</p>}</div></CardBody></Card>
        </div>
        <Card className="border border-divider"><CardBody className="p-0"><div className="flex flex-col gap-3 border-b border-divider p-4 sm:flex-row"><Input value={search} onValueChange={(v) => { setSearch(v); setPage(1); }} startContent={<FiSearch />} placeholder="Search viewer, company, product, or variant" /><Select selectedKeys={[status]} onSelectionChange={(keys) => { setStatus(String(Array.from(keys)[0] || "all")); setPage(1); }} className="sm:max-w-48" aria-label="Listing status"><SelectItem key="all">All listings</SelectItem><SelectItem key="live">Today’s Live</SelectItem><SelectItem key="past">Past listings</SelectItem></Select></div>
          {query.isLoading ? <div className="flex h-48 items-center justify-center"><Spinner /></div> : query.isError ? <p className="p-6 text-danger">Unable to load rate-interest analytics.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[950px] text-left text-sm"><thead className="bg-default-100 text-[10px] uppercase tracking-widest text-default-500"><tr><th className="p-4">Viewer</th><th className="p-4">Company</th><th className="p-4">Product</th><th className="p-4">Variant</th><th className="p-4">Status</th><th className="p-4">Revealed</th></tr></thead><tbody>{(data.rows || []).map((row: any) => <tr key={row._id} className="border-t border-divider"><td className="p-4"><div className="font-bold">{row.viewerName || "Unknown"}</div><div className="text-xs text-default-500">{row.viewerEmail || row.viewerPhone || "—"} · {row.viewerRole}</div></td><td className="p-4">{row.companyName || "—"}</td><td className="p-4 font-semibold">{row.product || "—"}</td><td className="p-4">{row.variant || "—"}</td><td className="p-4">{row.listingWasLive ? "Live" : "Past"}</td><td className="p-4">{formatDateTime(row.revealedAt)}</td></tr>)}</tbody></table></div>}
          <div className="flex justify-end p-4"><Pagination page={Number(data.meta?.page || page)} total={Number(data.meta?.pages || 1)} onChange={setPage} /></div>
        </CardBody></Card>
      </div>
    </div>
  );
}
