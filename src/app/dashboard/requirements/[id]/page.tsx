"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, CardBody, Chip, Spinner } from "@nextui-org/react";
import { LuArrowLeft, LuCalendar, LuCheck, LuMapPin, LuPackageCheck, LuSend, LuX } from "react-icons/lu";
import Title from "@/components/titles";
import { getData, postData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { showToastMessage } from "@/utils/utils";

const label = (value: string) => String(value || "").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
const err = (error: any) => error?.response?.data?.message || error?.message || "The action could not be completed.";

export default function RequirementDetailPage() {
  const id = String(useParams()?.id || ""); const router = useRouter(); const client = useQueryClient();
  const query = useQuery({ queryKey: ["requirement", id], queryFn: async () => (await getData(apiRoutes.requirements.getOne(id))).data?.data, enabled: Boolean(id) });
  const refresh = () => client.invalidateQueries({ queryKey: ["requirement", id] });
  const publish = useMutation({ mutationFn: () => postData(apiRoutes.requirements.publish(id), {}), onSuccess: () => { showToastMessage({ type: "success", message: "Requirement published to the selected provider channels." }); refresh(); }, onError: (e) => showToastMessage({ type: "error", message: err(e) }) });
  const cancel = useMutation({ mutationFn: () => postData(apiRoutes.requirements.cancel(id), {}), onSuccess: () => { showToastMessage({ type: "success", message: "Requirement cancelled." }); refresh(); }, onError: (e) => showToastMessage({ type: "error", message: err(e) }) });
  const award = useMutation({ mutationFn: ({ itemId, companyId }: { itemId: string; companyId: string }) => postData(apiRoutes.requirements.award(id, itemId), { companyId }), onSuccess: () => { showToastMessage({ type: "success", message: "Provider awarded. The item is ready for execution." }); refresh(); }, onError: (e) => showToastMessage({ type: "error", message: err(e) }) });
  if (query.isLoading) return <div className="grid min-h-96 place-items-center"><Spinner label="Loading requirement"/></div>;
  if (query.isError || !query.data) return <Card className="mx-auto max-w-xl"><CardBody className="gap-4"><b className="text-danger">Requirement could not be loaded.</b><div className="flex gap-2"><Button onPress={() => query.refetch()}>Retry</Button><Button as={Link} href="/dashboard/requirements" variant="light">Back</Button></div></CardBody></Card>;
  const row = query.data;
  return <section className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-20"><Title title={row.title || "Requirement"} visuallyHidden />
    <div className="flex flex-wrap items-center justify-between gap-3"><Button as={Link} href="/dashboard/requirements" variant="light" startContent={<LuArrowLeft/>}>Requirements</Button><div className="flex gap-2">{row.status === "DRAFT" && <Button color="warning" className="text-black" startContent={<LuSend/>} isLoading={publish.isPending} onPress={() => publish.mutate()}>Publish requirement</Button>}{!["CANCELLED", "COMPLETED"].includes(row.status) && <Button color="danger" variant="flat" startContent={<LuX/>} isLoading={cancel.isPending} onPress={() => cancel.mutate()}>Cancel</Button>}</div></div>
    <Card><CardBody className="gap-5 p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-widest text-obaol-500">{row.reference}</p><h1 className="mt-2 text-3xl font-black">{row.title}</h1><p className="mt-2 max-w-3xl text-sm text-default-500">{row.description || "No additional description."}</p></div><Chip color={row.status === "CANCELLED" ? "danger" : row.status.includes("AWARDED") ? "primary" : row.status === "DRAFT" ? "default" : "warning"} variant="flat">{label(row.status)}</Chip></div>
      <div className="flex flex-wrap gap-5 text-sm text-default-600">{row.product?.name && <span className="flex items-center gap-2"><LuPackageCheck/> {row.product.name}{row.product.quantity ? ` · ${row.product.quantity} ${row.product.unit || ""}` : ""}</span>}{(row.route?.from || row.route?.to) && <span className="flex items-center gap-2"><LuMapPin/> {row.route?.from || "Origin pending"} → {row.route?.to || "Destination pending"}</span>}{row.targetDate && <span className="flex items-center gap-2"><LuCalendar/> {new Date(row.targetDate).toLocaleDateString()}</span>}</div>
    </CardBody></Card>
    <div><h2 className="text-xl font-black">Requested work</h2><p className="mt-1 text-sm text-default-500">Every service is awarded and tracked independently while remaining part of this requirement.</p></div>
    <div className="grid gap-4">{(row.items || []).map((item: any) => <Card key={item._id} className="border border-default-200"><CardBody className="gap-4 p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-widest text-obaol-500">{label(item.type)}</p><h3 className="mt-1 text-lg font-black">{item.title}</h3><p className="mt-2 text-sm text-default-500">{item.specifications?.notes || "No specifications supplied."}</p></div><div className="flex gap-2"><Chip size="sm" variant="bordered">{label(item.fulfilmentMethod)}</Chip><Chip size="sm" color={item.status === "AWARDED" ? "success" : item.status === "OPEN" ? "warning" : "default"} variant="flat">{label(item.status)}</Chip></div></div>
      {item.awardedCompanyId ? <div className="flex items-center gap-2 rounded-xl bg-success-50 p-3 text-sm font-bold text-success-700"><LuCheck/> Provider awarded</div> : item.bids?.length ? <div className="space-y-2"><p className="text-xs font-black uppercase tracking-widest text-default-400">Offers</p>{item.bids.map((bid: any) => <div key={bid._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-default-200 p-3"><div><b>{bid.currency || "INR"} {Number(bid.amount || 0).toLocaleString()}</b><p className="text-xs text-default-500">{bid.note || "No provider note"}</p></div><Button size="sm" color="success" variant="flat" isLoading={award.isPending} onPress={() => award.mutate({ itemId: item._id, companyId: String(bid.companyId?._id || bid.companyId) })}>Award provider</Button></div>)}</div> : <p className="rounded-xl bg-default-100 p-3 text-sm text-default-500">{row.status === "DRAFT" ? "Publish the requirement to begin sourcing." : item.fulfilmentMethod === "DIRECT_ASSIGN" ? "Choose a provider to activate this work item." : "Waiting for eligible providers to respond."}</p>}
    </CardBody></Card>)}</div>
    <div className="flex justify-end"><Button variant="light" onPress={() => router.refresh()}>Refresh status</Button></div>
  </section>;
}
