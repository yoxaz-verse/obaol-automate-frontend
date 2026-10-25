"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Chip, Input, Select, SelectItem, Spinner, Textarea } from "@nextui-org/react";
import { apiRoutes } from "@/core/api/apiRoutes";
import { getData, patchData } from "@/core/api/apiHandler";
import { fetchRegisterOptions } from "@/utils/registerOptions";
import { showToastMessage } from "@/utils/utils";

const statuses = ["PENDING_REVIEW", "APPROVED", "REJECTED"];
const label = (value: string) => value.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function CompanyCapabilityApprovalQueue() {
  const client = useQueryClient();
  const [status, setStatus] = useState("PENDING_REVIEW");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const options = useQuery({ queryKey: ["company-capability-options"], queryFn: fetchRegisterOptions, staleTime: 300000 });
  const names = useMemo(() => new Map((options.data?.companyFunctions || []).map((item: any) => [String(item._id), item.name])), [options.data]);
  const query = useQuery({
    queryKey: ["company-capability-approvals", status, search, page],
    queryFn: async () => {
      const response = await getData(apiRoutes.companyCapabilityChangeRequests.list, { status, search, page, limit: 20 });
      return { rows: response?.data?.data || [], meta: response?.data?.meta || { page: 1, pages: 1, total: 0 } };
    },
  });
  const review = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) => patchData(apiRoutes.companyCapabilityChangeRequests.review(id), { action, notes: notes[id] || "" }),
    onSuccess: () => { client.invalidateQueries({ queryKey: ["company-capability-approvals"] }); showToastMessage({ type: "success", message: "Capability request reviewed." }); },
    onError: (error: any) => showToastMessage({ type: "error", message: error?.response?.data?.message || "Unable to review request." }),
  });
  const renderProfile = (title: string, ids: any[], priorities: any[]) => <div className="rounded-xl bg-default-100/70 p-4"><p className="mb-2 text-xs font-bold  tracking-wider text-default-500">{title}</p><div className="flex flex-wrap gap-2">{(ids || []).map((id: any) => { const value = String(id); const priority = (priorities || []).map(String).indexOf(value); return <Chip key={value} size="sm" color={priority >= 0 ? "warning" : "default"} variant="flat">{names.get(value) || "Company category"}{priority >= 0 ? ` · P${priority + 1}` : ""}</Chip>; })}</div></div>;

  return <section className="space-y-5">
    <div className="flex flex-col gap-3 md:flex-row md:items-end">
      <Input label="Search company" value={search} onValueChange={(value) => { setSearch(value); setPage(1); }} />
      <Select label="Status" selectedKeys={[status]} onSelectionChange={(keys) => { setStatus(String(Array.from(keys)[0] || "PENDING_REVIEW")); setPage(1); }}>{statuses.map((item) => <SelectItem key={item}>{label(item)}</SelectItem>)}</Select>
    </div>
    {query.isLoading ? <div className="grid min-h-40 place-items-center"><Spinner /></div> : !query.data?.rows.length ? <div className="rounded-2xl border border-dashed border-default-300 p-12 text-center text-default-500">No capability requests match these filters.</div> : query.data.rows.map((row: any) => <article key={row._id} className="space-y-4 rounded-2xl border border-default-200 bg-content1 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-bold">{row.companyId?.name || "Company"}</h2><p className="text-sm text-default-500">Requested by {row.requesterAssociateId?.name || "Company member"} · {new Date(row.createdAt).toLocaleString()}</p></div><Chip color={row.status === "APPROVED" ? "success" : row.status === "REJECTED" ? "danger" : "warning"} variant="flat">{label(row.status)}</Chip></div>
      <div className="grid gap-3 lg:grid-cols-2">{renderProfile("Provides", row.requestedProvidedFunctionIds, row.requestedProvidedFunctionPriorities)}{renderProfile("Seeking", row.requestedSoughtFunctionIds, row.requestedSoughtFunctionPriorities)}</div>
      {row.note ? <p className="text-sm text-default-600"><b>Requester note:</b> {row.note}</p> : null}
      {row.status === "PENDING_REVIEW" ? <div className="flex flex-col gap-3 md:flex-row md:items-end"><Textarea label="Decision notes" value={notes[row._id] || ""} onValueChange={(value) => setNotes((old) => ({ ...old, [row._id]: value }))} /><div className="flex gap-2"><Button color="danger" variant="flat" onPress={() => review.mutate({ id: row._id, action: "REJECT" })}>Reject</Button><Button color="success" onPress={() => review.mutate({ id: row._id, action: "APPROVE" })}>Approve</Button></div></div> : row.reviewNotes ? <p className="text-sm"><b>Decision notes:</b> {row.reviewNotes}</p> : null}
    </article>)}
    <div className="flex items-center justify-between text-sm text-default-500"><span>{query.data?.meta.total || 0} requests</span><div className="flex gap-2"><Button size="sm" variant="flat" isDisabled={page <= 1} onPress={() => setPage((p) => p - 1)}>Previous</Button><Button size="sm" variant="flat" isDisabled={page >= (query.data?.meta.pages || 1)} onPress={() => setPage((p) => p + 1)}>Next</Button></div></div>
  </section>;
}
