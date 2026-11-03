"use client";

import { useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, CardBody, Chip, Skeleton } from "@nextui-org/react";
import { FiArrowRight, FiBox, FiCheckCircle, FiShield } from "react-icons/fi";
import Link from "next/link";
import { getData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { useCurrency } from "@/context/CurrencyContext";

const labels: Record<string, string> = { PRODUCT: "Product availability", QUALITY_LAB: "Quality testing laboratory", PACKAGING: "Packaging services", FREIGHT: "Freight forwarding", INLAND_TRANSPORT: "Inland transportation", WAREHOUSE: "Warehouse services" };

export default function SharedOfferingPage() {
  const token = String(useParams()?.token || ""), channel = String(useSearchParams()?.get("channel") || "DIRECT");
  const { formatRate } = useCurrency();
  const query = useQuery({ queryKey: ["public-referral-share", token], queryFn: () => getData(apiRoutes.associateReferrals.publicShare(token), { channel }), enabled: /^[a-f0-9]{64}$/.test(token), retry: false });
  const payload = query.data?.data?.data, offering = payload?.offering, details = offering?.details || {};
  useEffect(() => { if (payload) document.cookie = `obaol_referral_share=${token}; Max-Age=${30 * 24 * 60 * 60}; Path=/; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`; }, [payload, token]);

  if (query.isLoading) return <main className="mx-auto min-h-screen max-w-5xl p-5 md:p-10"><Skeleton className="h-96 rounded-3xl" /></main>;
  if (!offering) return <main className="grid min-h-screen place-items-center p-5"><Card className="max-w-lg"><CardBody className="gap-4 p-8 text-center"><h1 className="text-2xl font-black">Offering unavailable</h1><p className="text-default-500">This offering is no longer published or the shared link is invalid.</p><Button as={Link} href="/" color="success">Visit OBAOL</Button></CardBody></Card></main>;

  const arrays = Object.entries(details).filter(([, value]) => Array.isArray(value) && value.length) as [string, string[]][];
  const scalars = Object.entries(details).filter(([, value]) => !Array.isArray(value) && value !== "" && value != null);
  return <main className="min-h-screen bg-gradient-to-b from-success-50/60 to-background px-4 py-8 text-foreground dark:from-success-950/20 md:py-14">
    <div className="mx-auto max-w-5xl">
      <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-success-700 dark:text-success-400"><FiShield /> Shared securely through OBAOL</div>
      <Card className="overflow-hidden border border-success-500/20 shadow-xl"><CardBody className="gap-0 p-0"><div className="grid lg:grid-cols-[0.85fr_1.15fr]"><div className="grid min-h-64 place-items-center bg-success-500/10 p-10"><div className="grid h-32 w-32 place-items-center rounded-full bg-success-500/15 text-6xl text-success-700"><FiBox /></div></div><div className="p-6 md:p-10"><Chip color="success" variant="flat">{labels[offering.type] || "OBAOL offering"}</Chip><h1 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">{offering.title}</h1><p className="mt-2 text-sm font-semibold text-default-500">Published by {payload.company?.name}</p>{offering.description && <p className="mt-5 leading-7 text-default-600 dark:text-default-400">{offering.description}</p>}{Number.isFinite(offering.price) && <div className="mt-6"><p className="text-xs font-bold uppercase tracking-wider text-default-500">Current rate on OBAOL</p><p className="text-3xl font-black text-success-700 dark:text-success-400">{formatRate(offering.price)} <span className="text-base font-medium text-default-500">/ {offering.unit || "unit"}</span></p></div>}<div className="mt-7 flex flex-wrap gap-3"><Button as={Link} href={payload.registrationPath} color="success" size="lg" className="font-bold" endContent={<FiArrowRight />}>Join OBAOL to connect</Button><Button as={Link} href="/auth/login" variant="bordered" size="lg">Already a member? Sign in</Button></div><p className="mt-3 text-xs text-default-500">New companies joining through this link are connected to the sharing company under OBAOL&apos;s one-level referral structure.</p></div></div></CardBody></Card>
      {(arrays.length > 0 || scalars.length > 0) && <Card className="mt-6 border border-default-200"><CardBody className="p-6 md:p-8"><h2 className="text-xl font-black">Published details</h2><div className="mt-5 grid gap-5 md:grid-cols-2">{scalars.map(([key, value]) => <div key={key} className="rounded-2xl bg-default-100 p-4"><p className="text-xs font-bold uppercase tracking-wider text-default-500">{key.replaceAll("_", " ")}</p><p className="mt-1 font-semibold">{String(value)}</p></div>)}{arrays.map(([key, values]) => <div key={key} className="rounded-2xl bg-default-100 p-4"><p className="text-xs font-bold uppercase tracking-wider text-default-500">{key.replaceAll("_", " ")}</p><div className="mt-2 flex flex-wrap gap-2">{values.map((value) => <Chip key={value} size="sm" variant="flat" startContent={<FiCheckCircle />}>{value}</Chip>)}</div></div>)}</div></CardBody></Card>}
    </div>
  </main>;
}
