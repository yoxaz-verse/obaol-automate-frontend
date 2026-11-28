"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardBody, Chip, Progress, Skeleton } from "@nextui-org/react";
import { getData } from "@/core/api/apiHandler";

const labels: Record<string, string> = {
  "selling.publish": "Publish selling rates", "selling.live_listing_limit": "Live listing limit",
  "selling.rate_deviation_percent": "Rate flexibility", "trading.concurrent_deal_limit": "Concurrent deals",
  "payments.custom_terms": "Custom payment terms",
};

export default function TradeScoreCard({ companyId, publicView = false }: { companyId?: string; publicView?: boolean }) {
  const url = publicView && companyId ? `/trade-score/public/${companyId}` : "/trade-score/me";
  const query = useQuery({ queryKey: ["trade-score", url], queryFn: async () => (await getData(url)).data.data, enabled: publicView ? Boolean(companyId) : true, staleTime: 60000 });
  if (query.isLoading) return <Card><CardBody><Skeleton className="h-36 rounded-xl" /></CardBody></Card>;
  if (!query.data || query.isError) return null;
  const score = Number(query.data.score || 0), breakdown = query.data.breakdown || [], entitlements = query.data.entitlements || {};
  return <Card className="border border-primary-200 shadow-sm"><CardBody className="gap-5 p-5 md:p-6">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold tracking-widest text-primary">OBAOL Trade Score</p><div className="mt-1 flex items-baseline gap-2"><span className="text-4xl font-black">{score}</span><span className="text-default-400">/ 1000</span></div></div><Chip color={score >= 750 ? "success" : score >= 500 ? "primary" : score >= 250 ? "warning" : "danger"} variant="flat">{query.data.tierLabel || query.data.tierKey}</Chip></div>
    <Progress aria-label="Trade score" value={score} maxValue={1000} color={score >= 500 ? "success" : "warning"} />
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">{breakdown.map((item: any) => <div key={item.key} className="rounded-xl bg-default-100 p-3"><div className="flex justify-between gap-2 text-xs font-bold"><span>{item.label}</span><span>{Math.round(Number(item.points || 0) / 10)}</span></div><Progress className="mt-2" size="sm" value={Number(item.rawScore || 0)} /><p className="mt-2 text-[11px] text-default-500">{item.guidance}</p><div className="mt-2 space-y-0.5 text-[10px] text-default-400">{Object.entries(item.metrics || {}).map(([key, value]) => <p key={key}>{key.replace(/([A-Z])/g, " $1")}: {String(value)}</p>)}</div></div>)}</div>
    <div><p className="mb-2 text-xs font-black tracking-wider text-default-500">Current trading access</p><div className="flex flex-wrap gap-2">{Object.entries(entitlements).map(([key, value]) => <Chip key={key} size="sm" variant="bordered">{labels[key] || key}: {typeof value === "boolean" ? (value ? "Unlocked" : "Locked") : Number(value) < 0 ? "Unlimited" : key.includes("percent") ? `${value}%` : String(value)}</Chip>)}</div></div>
    <p className="text-[11px] text-default-400">Algorithm v{query.data.algorithmVersion} · calculated {new Date(query.data.calculatedAt).toLocaleString()}</p>
  </CardBody></Card>;
}
