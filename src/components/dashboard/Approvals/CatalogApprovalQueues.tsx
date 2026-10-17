"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Chip, Input, Select, SelectItem, Textarea } from "@nextui-org/react";
import { getData, patchData, postData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { showToastMessage } from "@/utils/utils";

const TYPES = [["category", "Categories"], ["subCategory", "Subcategories"], ["product", "Products"], ["productVariant", "Variants"]] as const;
const title = (row: any) => row?.name || row?.proposedChanges?.name || `Submission ${String(row?._id || "").slice(-6)}`;

export default function CatalogApprovalQueues() {
  const queryClient = useQueryClient();
  const [entityType, setEntityType] = useState("category");
  const [status, setStatus] = useState("PENDING_REVIEW");
  const [search, setSearch] = useState("");
  const [associateFilter, setAssociateFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<any>(null);
  const [audit, setAudit] = useState<Record<string, any[]>>({});
  const query = useQuery({ queryKey: ["catalog-approvals", entityType, status, search], queryFn: async () => (await getData(apiRoutes.approvals.catalogList(entityType), { status, search, limit: 100 }))?.data?.data || [] });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["catalog-approvals"] });
  const action = useMutation({
    mutationFn: ({ id, kind }: any) => kind === "CHAIN" ? postData(apiRoutes.approvals.catalogApproveChain(entityType, id), { notes: notes[id] || "" }) : patchData(apiRoutes.approvals.catalogAction(entityType, id), { action: kind, notes: String(notes[id] || "").trim() }),
    onSuccess: () => { showToastMessage({ type: "success", message: "Catalog review updated." }); refresh(); },
    onError: (error: any) => showToastMessage({ type: "error", message: error?.response?.data?.message || "Could not update review." }),
  });
  const edit = useMutation({
    mutationFn: () => patchData(apiRoutes.approvals.catalogEdit(entityType, editing._id), { name: editing.name, description: editing.description, category: editing.category, subCategory: editing.subCategory, product: editing.product, notes: notes[editing._id] || "" }),
    onSuccess: () => { showToastMessage({ type: "success", message: "Submission edited and audited." }); setEditing(null); refresh(); },
    onError: (error: any) => showToastMessage({ type: "error", message: error?.response?.data?.message || "Could not edit submission." }),
  });
  const rows = useMemo(() => (Array.isArray(query.data) ? query.data : []).filter((row: any) => {
    const associate = `${row?.createdByAssociate?.name || ""} ${row?.createdByAssociate?.email || ""}`.toLowerCase();
    const company = String(row?.createdByCompany?.name || "").toLowerCase();
    return associate.includes(associateFilter.toLowerCase()) && company.includes(companyFilter.toLowerCase());
  }), [query.data, associateFilter, companyFilter]);
  const loadAudit = async (row: any) => {
    const rows = (await getData(apiRoutes.approvals.catalogAudit(entityType, row._id)))?.data?.data || [];
    setAudit((current) => ({ ...current, [row._id]: rows }));
  };

  return <section className="space-y-5">
    <div><h1 className="text-3xl font-black">Catalog Requests</h1><p className="mt-2 text-sm text-default-500">Review Associate-created directory entries. Live listings remain private until their complete hierarchy is approved.</p></div>
    <div className="grid gap-3 rounded-2xl border border-default-200 bg-content1 p-4 md:grid-cols-5">
      <Select label="Entity" selectedKeys={[entityType]} onSelectionChange={(keys) => setEntityType(String(Array.from(keys)[0] || "category"))}>{TYPES.map(([key, label]) => <SelectItem key={key}>{label}</SelectItem>)}</Select>
      <Select label="Status" selectedKeys={[status]} onSelectionChange={(keys) => setStatus(String(Array.from(keys)[0] || "PENDING_REVIEW"))}>{["PENDING_REVIEW", "APPROVED", "REJECTED", "DRAFT"].map((key) => <SelectItem key={key}>{key.replaceAll("_", " ")}</SelectItem>)}</Select>
      <Input label="Item search" value={search} onValueChange={setSearch} />
      <Input label="Associate" value={associateFilter} onValueChange={setAssociateFilter} />
      <Input label="Company" value={companyFilter} onValueChange={setCompanyFilter} />
    </div>
    {query.isLoading ? <p className="p-8 text-center text-default-500">Loading catalog requests…</p> : rows.length === 0 ? <p className="rounded-2xl border border-dashed border-default-300 p-10 text-center text-default-500">No matching catalog requests.</p> : rows.map((row: any) => {
      const path = [row.hierarchy?.category?.name, row.hierarchy?.subCategory?.name, row.hierarchy?.product?.name, row.hierarchy?.productVariant?.name].filter(Boolean).join(" › ");
      return <article key={row._id} className="rounded-2xl border border-default-200 bg-content1 p-5 space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-bold">{title(row)}</h2><Chip size="sm" color="warning" variant="flat">{row.sourceKind === "REVISION" ? "Revision" : "New"}</Chip><Chip size="sm" variant="bordered">{entityType}</Chip></div><p className="mt-1 text-xs text-default-500">{path || title(row)}</p><p className="mt-2 text-sm">Submitted by {row?.createdByAssociate?.name || "Associate"} · {row?.createdByCompany?.name || "Company"} · {row.listingCount || 0} affected listings</p>{row.description && <p className="mt-2 text-sm text-default-600">{row.description}</p>}{row.reviewNotes && <p className="mt-2 text-sm text-danger">Review note: {row.reviewNotes}</p>}</div>
        <div className="w-full space-y-2 lg:w-96"><Textarea size="sm" label="Review notes" value={notes[row._id] || ""} onValueChange={(value) => setNotes((old) => ({ ...old, [row._id]: value }))}/><div className="flex flex-wrap justify-end gap-2"><Button size="sm" variant="flat" onPress={() => setEditing({ ...row })}>Edit</Button><Button size="sm" variant="light" onPress={() => loadAudit(row)}>Audit</Button>{status === "PENDING_REVIEW" && <><Button size="sm" color="danger" variant="flat" isDisabled={!String(notes[row._id] || "").trim()} onPress={() => action.mutate({ id: row._id, kind: "REJECT" })}>Return</Button><Button size="sm" color="success" variant="flat" onPress={() => action.mutate({ id: row._id, kind: "CHAIN" })}>Approve chain</Button><Button size="sm" color="success" onPress={() => action.mutate({ id: row._id, kind: "APPROVE" })}>Approve item</Button></>}</div></div></div>
        {editing?._id === row._id && <div className="grid gap-3 rounded-xl bg-default-50 p-4 md:grid-cols-2"><Input label="Name" value={editing.name || ""} onValueChange={(value) => setEditing({ ...editing, name: value })}/><Textarea label="Description" value={editing.description || ""} onValueChange={(value) => setEditing({ ...editing, description: value })}/>{entityType !== "category" && <Input label={`Parent ${entityType === "subCategory" ? "category" : entityType === "product" ? "subcategory" : "product"} ID`} value={String(editing.category || editing.subCategory || editing.product || "")} onValueChange={(value) => setEditing({ ...editing, [entityType === "subCategory" ? "category" : entityType === "product" ? "subCategory" : "product"]: value })}/>}<div className="md:col-span-2 flex justify-end gap-2"><Button size="sm" variant="light" onPress={() => setEditing(null)}>Cancel</Button><Button size="sm" color="warning" isLoading={edit.isPending} onPress={() => edit.mutate()}>Save audited edit</Button></div></div>}
        {audit[row._id] && <div className="rounded-xl bg-default-50 p-4"><h3 className="text-sm font-bold">Audit history</h3>{audit[row._id].length === 0 ? <p className="mt-2 text-xs text-default-500">No audit events yet.</p> : audit[row._id].map((item: any) => <div key={item._id} className="mt-2 border-t border-default-200 pt-2 text-xs"><b>{item.action.replaceAll("_", " ")}</b> · {new Date(item.createdAt).toLocaleString()}{item.notes ? ` · ${item.notes}` : ""}<pre className="mt-1 overflow-auto">{JSON.stringify({ before: item.before, after: item.after }, null, 2)}</pre></div>)}</div>}
      </article>;
    })}
  </section>;
}
