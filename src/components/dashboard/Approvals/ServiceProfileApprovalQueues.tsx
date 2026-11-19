"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, CardBody, Chip, Tab, Tabs, Textarea } from "@nextui-org/react";
import { FiChevronDown, FiExternalLink } from "react-icons/fi";
import { getData, patchData } from "@/core/api/apiHandler";
import { apiRoutes, financialPartnerRoutes, freightForwardingRoutes, insurancePartnerRoutes, packagingRoutes } from "@/core/api/apiRoutes";
import { showToastMessage } from "@/utils/utils";

type Kind = "packaging" | "finance" | "insurance" | "freight" | "agritech";
type JsonValue = string | number | boolean | null | undefined | JsonValue[] | { [key: string]: JsonValue };

const INTERNAL_FIELDS = new Set(["_id", "__v", "createdBy", "updatedBy"]);
const PROFILE_LABELS: Record<Kind, string> = { packaging: "Packaging unit", finance: "Financial profile", insurance: "Insurance profile", freight: "Freight profile", agritech: "Agritech profile" };
const humanize = (value: string) => value.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const isUrl = (value: string) => /^https?:\/\//i.test(value);
const hasValue = (value: JsonValue): boolean => {
  if (value === null || value === undefined || value === "") return false;
  if (Array.isArray(value)) return value.some(hasValue);
  if (typeof value === "object") return Object.entries(value).some(([key, child]) => !INTERNAL_FIELDS.has(key) && hasValue(child));
  return true;
};

function Scalar({ value }: { value: string | number | boolean }) {
  if (typeof value === "string" && isUrl(value)) return <a className="inline-flex items-center gap-1 break-all font-semibold text-primary hover:underline" href={value} target="_blank" rel="noopener noreferrer">Open submitted document <FiExternalLink className="shrink-0" /></a>;
  const display = typeof value === "boolean" ? (value ? "Yes" : "No") : typeof value === "number" ? value.toLocaleString() : /^[A-Z0-9_]+$/.test(String(value)) ? humanize(String(value)) : String(value);
  return <span className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground">{display}</span>;
}

function SubmittedValue({ value, depth = 0 }: { value: JsonValue; depth?: number }) {
  if (!hasValue(value)) return <span className="text-sm italic text-default-400">Not provided</span>;
  if (typeof value !== "object" || value === null) return <Scalar value={value as string | number | boolean} />;
  if (Array.isArray(value)) {
    const populated = value.filter(hasValue);
    if (populated.every((item) => typeof item !== "object" || item === null)) return <div className="flex flex-wrap gap-2">{populated.map((item, index) => <Chip key={`${String(item)}-${index}`} size="sm" variant="flat"><Scalar value={item as string | number | boolean} /></Chip>)}</div>;
    return <div className="grid gap-3">{populated.map((item, index) => <div key={index} className="rounded-xl border border-default-200 bg-content1 p-4"><p className="mb-3 text-xs font-bold uppercase tracking-wider text-default-500">Item {index + 1}</p><SubmittedValue value={item} depth={depth + 1} /></div>)}</div>;
  }
  const entries = Object.entries(value).filter(([key, child]) => !INTERNAL_FIELDS.has(key) && hasValue(child));
  return <dl className={`grid gap-3 ${depth < 2 ? "md:grid-cols-2" : ""}`}>{entries.map(([key, child]) => {
    const complex = typeof child === "object" && child !== null;
    return <div key={key} className={complex ? "md:col-span-2" : "rounded-xl bg-default-100/70 p-3"}><dt className="mb-1 text-xs font-bold uppercase tracking-wide text-default-500">{humanize(key)}</dt><dd><SubmittedValue value={child} depth={depth + 1} /></dd></div>;
  })}</dl>;
}

const summary = (row: any, kind: Kind) => {
  const draft = row.draft || {};
  if (kind === "insurance") return `${draft.products?.length || 0} insurance products`;
  if (kind === "finance") return `${draft.offerings?.length || 0} financial offerings`;
  if (kind === "freight") return `${draft.lanes?.length || 0} service lanes`;
  if (kind === "agritech") return `${draft.workflowStages?.length || 0} workflow capabilities`;
  return `${draft.capabilities?.length || 0} packaging capabilities`;
};

function ProfileQueue({ rows, loading, kind, onReview, reviewing }: { rows: any[]; loading: boolean; kind: Kind; onReview: (id: string, action: string, notes: string) => void; reviewing?: { id?: string; action?: string } }) {
  const [notes, setNotes] = useState<Record<string, string>>({});
  if (loading) return <p className="p-8 text-center text-default-500">Loading {PROFILE_LABELS[kind].toLowerCase()} requests…</p>;
  if (!rows.length) return <p className="rounded-2xl border border-dashed border-default-300 p-10 text-center text-default-500">No {PROFILE_LABELS[kind].toLowerCase()} requests are awaiting review.</p>;
  return <div className="grid gap-5">{rows.map((row: any) => {
    const note = notes[row._id] ?? row.reviewNotes ?? "";
    const isReviewing = reviewing?.id === row._id;
    const submittedAt = row.submittedAt || row.updatedAt || row.createdAt;
    return <Card key={row._id} className="border border-warning-500/20"><CardBody className="gap-5 p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-warning-600">{PROFILE_LABELS[kind]} request</p><h2 className="mt-1 text-xl font-black">{row.draft?.displayName || row.companyId?.name || PROFILE_LABELS[kind]}</h2><p className="mt-1 text-sm text-default-500">{row.companyId?.name && row.draft?.displayName ? `${row.companyId.name} · ` : ""}{summary(row, kind)}{submittedAt ? ` · Submitted ${new Date(submittedAt).toLocaleString()}` : ""}</p></div><Chip color="warning" variant="flat">{humanize(row.status || "PENDING_REVIEW")}</Chip></div>
      {row.draft?.summary || row.draft?.shortDescription || row.draft?.companyDescription ? <div className="rounded-xl border border-warning-200 bg-warning-50/50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-warning-700">Submitted description</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{row.draft.summary || row.draft.shortDescription || row.draft.companyDescription}</p></div> : null}
      <details open className="group rounded-2xl border border-default-200 bg-default-50/50"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 font-bold"><span>Full submitted request</span><FiChevronDown className="transition group-open:rotate-180" /></summary><div className="border-t border-default-200 p-4"><SubmittedValue value={row.draft || {}} /></div></details>
      <Textarea label="Review notes" description="Required when requesting changes." value={note} onValueChange={(value) => setNotes((current) => ({ ...current, [row._id]: value }))} />
      <div className="flex flex-wrap justify-end gap-2"><Button color="danger" variant="flat" isDisabled={isReviewing || !String(note).trim()} isLoading={isReviewing && reviewing?.action === "REJECT"} onPress={() => onReview(row._id, "REJECT", note)}>Request changes</Button><Button color="success" isDisabled={isReviewing} isLoading={isReviewing && reviewing?.action === "APPROVE"} onPress={() => onReview(row._id, "APPROVE", note)}>Approve and publish</Button></div>
    </CardBody></Card>;
  })}</div>;
}

function PackagingTaxonomyQueue() {
  const client = useQueryClient();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const query = useQuery({ queryKey: ["packaging-taxonomy-approvals"], queryFn: async () => ((await getData(packagingRoutes.taxonomy)).data.data || []).filter((row: any) => row.status === "REQUESTED") });
  const review = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => patchData(packagingRoutes.taxonomyReview(id), { status, reviewNotes: notes[id] || "" }),
    onSuccess: (_response, variables) => { client.invalidateQueries({ queryKey: ["packaging-taxonomy-approvals"] }); client.invalidateQueries({ queryKey: ["packaging-taxonomy"] }); client.invalidateQueries({ queryKey: ["approval-summary", "services"] }); showToastMessage({ type: "success", message: variables.status === "ACTIVE" ? "Packaging option approved." : "Packaging option changes requested." }); },
    onError: (error: any) => showToastMessage({ type: "error", message: error?.response?.data?.message || "Unable to save this packaging review." }),
  });
  if (query.isLoading) return <p className="p-8 text-center text-default-500">Loading packaging option requests…</p>;
  if (!query.data?.length) return <p className="rounded-2xl border border-dashed border-default-300 p-10 text-center text-default-500">No packaging options are awaiting review.</p>;
  return <div className="grid gap-4">{query.data.map((row: any) => { const isReviewing = review.isPending && review.variables?.id === row._id; return <Card key={row._id}><CardBody className="gap-4 p-5"><div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-lg font-bold">{row.name}</h2><p className="mt-1 whitespace-pre-wrap text-sm text-default-500">{humanize(row.kind || "Option")}{row.description ? ` · ${row.description}` : ""}</p></div><Chip color="warning" variant="flat">Requested</Chip></div><details open className="rounded-xl border border-default-200 p-4"><summary className="cursor-pointer font-bold">Full submitted option</summary><div className="mt-4"><SubmittedValue value={row} /></div></details><Textarea label="Review notes" description="Required when requesting changes." value={notes[row._id] || ""} onValueChange={(value) => setNotes((current) => ({ ...current, [row._id]: value }))} /><div className="flex justify-end gap-2"><Button color="danger" variant="flat" isDisabled={isReviewing || !String(notes[row._id] || "").trim()} isLoading={isReviewing && review.variables?.status === "REJECTED"} onPress={() => review.mutate({ id: row._id, status: "REJECTED" })}>Request changes</Button><Button color="success" isDisabled={isReviewing} isLoading={isReviewing && review.variables?.status === "ACTIVE"} onPress={() => review.mutate({ id: row._id, status: "ACTIVE" })}>Approve option</Button></div></CardBody></Card>; })}</div>;
}

export default function ServiceProfileApprovalQueues() {
  const [section, setSection] = useState("options");
  const client = useQueryClient();
  const useQueue = (key: string, url: string, params?: Record<string, any>) => useQuery({ queryKey: [key], queryFn: async () => (await getData(url, params)).data.data || [] });
  const packaging = useQueue("packaging-approvals", packagingRoutes.approvals);
  const finance = useQueue("financial-partner-approvals", financialPartnerRoutes.approvals);
  const insurance = useQueue("insurance-partner-approvals", insurancePartnerRoutes.approvals);
  const freight = useQueue("freight-profile-approvals", freightForwardingRoutes.approvals);
  const agritech = useQueue("agritech-approvals", apiRoutes.agritechProfiles.approvals, { status: "PENDING_REVIEW" });
  const review = useMutation({
    mutationFn: ({ url, action, notes }: any) => patchData(url, { action, notes, reviewNotes: notes }),
    onSuccess: (_response: any, variables: any) => { client.invalidateQueries({ queryKey: [variables.key] }); client.invalidateQueries({ queryKey: ["approval-summary", "services"] }); showToastMessage({ type: "success", message: variables.action === "APPROVE" ? "Profile approved and published." : "Changes requested from the provider." }); },
    onError: (error: any) => showToastMessage({ type: "error", message: error?.response?.data?.message || "Unable to save this review." }),
  });
  const act = (url: (id: string) => string, key: string) => (id: string, action: string, notes: string) => review.mutate({ id, url: url(id), key, action, notes });
  const reviewing = review.isPending ? { id: review.variables?.id, action: review.variables?.action } : undefined;
  return <section className="space-y-5"><Tabs selectedKey={section} onSelectionChange={(key) => setSection(String(key))} color="warning" variant="underlined" classNames={{ tabList: "flex-wrap" }}><Tab key="options" title="Packaging options" /><Tab key="profiles" title={`Packaging units (${packaging.data?.length || 0})`} /><Tab key="finance" title={`Financial (${finance.data?.length || 0})`} /><Tab key="insurance" title={`Insurance (${insurance.data?.length || 0})`} /><Tab key="freight" title={`Freight (${freight.data?.length || 0})`} /><Tab key="agritech" title={`Agritech (${agritech.data?.length || 0})`} /></Tabs>{section === "options" ? <PackagingTaxonomyQueue /> : section === "profiles" ? <ProfileQueue rows={packaging.data || []} loading={packaging.isLoading} kind="packaging" reviewing={reviewing} onReview={act(packagingRoutes.reviewProfile, "packaging-approvals")} /> : section === "finance" ? <ProfileQueue rows={finance.data || []} loading={finance.isLoading} kind="finance" reviewing={reviewing} onReview={act(financialPartnerRoutes.review, "financial-partner-approvals")} /> : section === "insurance" ? <ProfileQueue rows={insurance.data || []} loading={insurance.isLoading} kind="insurance" reviewing={reviewing} onReview={act(insurancePartnerRoutes.review, "insurance-partner-approvals")} /> : section === "freight" ? <ProfileQueue rows={freight.data || []} loading={freight.isLoading} kind="freight" reviewing={reviewing} onReview={act(freightForwardingRoutes.reviewProfile, "freight-profile-approvals")} /> : <ProfileQueue rows={agritech.data || []} loading={agritech.isLoading} kind="agritech" reviewing={reviewing} onReview={act(apiRoutes.agritechProfiles.review, "agritech-approvals")} />}</section>;
}
