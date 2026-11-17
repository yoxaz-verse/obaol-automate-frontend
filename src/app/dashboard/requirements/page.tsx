"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, CardBody, Chip, Spinner } from "@nextui-org/react";
import { LuArrowRight, LuClipboardList, LuPlus, LuPackage, LuWrench } from "react-icons/lu";
import Title from "@/components/titles";
import { getData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";

const tone = (status: string): "default" | "primary" | "warning" | "success" | "danger" => status === "COMPLETED" ? "success" : status === "CANCELLED" ? "danger" : status.includes("AWARDED") || status === "IN_EXECUTION" ? "primary" : status === "DRAFT" ? "default" : "warning";
const label = (value: string) => String(value || "").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export default function RequirementsPage() {
  const query = useQuery({ queryKey: ["requirements"], queryFn: async () => (await getData(apiRoutes.requirements.list, { page: 1, limit: 60, includeLegacy: true })).data });
  const rows = [...(query.data?.data || []), ...(query.data?.legacy || [])];
  return <section className="mx-auto w-full max-w-[1500px] space-y-6 px-4 pb-20">
    <Title title="Requirements" visuallyHidden />
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-black uppercase tracking-[0.24em] text-obaol-500">Source · Hire · Track</p><h1 className="mt-2 text-3xl font-black tracking-tight">Requirements</h1><p className="mt-2 max-w-3xl text-sm text-default-500">Buy products, hire any business service, or bring externally arranged work into an ERP-style execution timeline.</p></div>
      <div className="flex gap-2"><Button as={Link} href="/dashboard/requirements/opportunities" variant="flat">Provider opportunities</Button><Button as={Link} href="/dashboard/requirements/new" color="warning" startContent={<LuPlus />} className="font-bold text-black">Create requirement</Button></div>
    </div>
    <div className="grid gap-3 sm:grid-cols-3">
      <Card><CardBody className="flex-row items-center gap-3"><LuClipboardList className="text-2xl text-obaol-500"/><div><b>Buy a product</b><p className="text-xs text-default-500">Source, compare, award, and fulfil.</p></div></CardBody></Card>
      <Card><CardBody className="flex-row items-center gap-3"><LuWrench className="text-2xl text-obaol-500"/><div><b>Hire any service</b><p className="text-xs text-default-500">Bid, match, invite, or directly assign.</p></div></CardBody></Card>
      <Card><CardBody className="flex-row items-center gap-3"><LuPackage className="text-2xl text-obaol-500"/><div><b>Track existing work</b><p className="text-xs text-default-500">Custom milestones and shared evidence.</p></div></CardBody></Card>
    </div>
    {query.isLoading ? <div className="grid min-h-60 place-items-center"><Spinner label="Loading requirements"/></div> : query.isError ? <Card><CardBody><p className="font-bold text-danger">Requirements could not be loaded.</p><Button className="mt-3" onPress={() => query.refetch()}>Retry</Button></CardBody></Card> : rows.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{rows.map((row: any) => {
      const legacy = row?.legacy?.type === "EXTERNAL_ORDER"; const id = String(row?._id || row?.id || "");
      const href = legacy ? `/dashboard/orders/${id}` : `/dashboard/requirements/${id}`;
      return <Card key={`${legacy ? "legacy" : "requirement"}-${id}`} className="border border-default-200"><CardBody className="gap-4 p-5">
        <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-widest text-obaol-500">{row.reference} {!legacy && row.journeyType ? `· ${label(row.journeyType)}` : ""}</p><h2 className="mt-1 text-xl font-black">{row.title}</h2></div><Chip size="sm" color={legacy ? "default" : tone(row.status)} variant="flat">{legacy ? "Legacy external order" : label(row.status)}</Chip></div>
        <p className="line-clamp-2 text-sm text-default-500">{row.description || (legacy ? "Existing external order preserved in read-only history." : row.mode === "TRADE" ? "Product procurement and connected services" : "Service requirement")}</p>
        {!legacy && <div className="flex flex-wrap gap-2">{(row.items || []).map((item: any) => <Chip key={item._id || item.type} size="sm" variant="bordered">{label(item.type)}</Chip>)}</div>}
        <Button as={Link} href={href} variant="flat" endContent={<LuArrowRight/>}>{legacy ? "Open legacy order" : "Open requirement"}</Button>
      </CardBody></Card>;
    })}</div> : <Card><CardBody className="items-center gap-4 py-16 text-center"><LuClipboardList className="text-5xl text-default-300"/><div><h2 className="text-xl font-black">No requirements yet</h2><p className="mt-1 text-sm text-default-500">Start with exactly what you need; unrelated service fields will stay out of the way.</p></div><Button as={Link} href="/dashboard/requirements/new" color="warning" className="text-black">Create your first requirement</Button></CardBody></Card>}
  </section>;
}
