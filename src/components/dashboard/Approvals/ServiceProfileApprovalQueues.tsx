"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, CardBody, Chip, Textarea } from "@nextui-org/react";
import { FiChevronDown, FiExternalLink } from "react-icons/fi";
import { getData, patchData } from "@/core/api/apiHandler";
import { normalizeApiError, type NormalizedApiError } from "@/core/api/apiErrors";
import { apiRoutes, financialPartnerRoutes, freightForwardingRoutes, insurancePartnerRoutes, packagingRoutes } from "@/core/api/apiRoutes";
import { showToastMessage } from "@/utils/utils";

type Kind = "packaging" | "finance" | "insurance" | "freight" | "agritech";
type JsonValue = string | number | boolean | null | undefined | JsonValue[] | { [key: string]: JsonValue };
type ReviewIssue = NormalizedApiError & { action: string };

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

function ProfileQueue({ rows, loading, kind, onReview, onRefresh, reviewing, reviewErrors }: { rows: any[]; loading: boolean; kind: Kind; onReview: (id: string, action: string, notes: string) => void; onRefresh: () => void; reviewing?: { id?: string; action?: string }; reviewErrors: Record<string, ReviewIssue> }) {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  if (loading) return <p className="p-8 text-center text-default-500">Loading {PROFILE_LABELS[kind].toLowerCase()} requests…</p>;
  if (!rows.length) return <p className="rounded-2xl border border-dashed border-default-300 p-10 text-center text-default-500">No {PROFILE_LABELS[kind].toLowerCase()} requests are awaiting review.</p>;
  return <div className="grid gap-5">{rows.map((row: any) => {
    const note = notes[row._id] ?? row.reviewNotes ?? "";
    const isReviewing = reviewing?.id === row._id;
    const isExpanded = expandedId === row._id;
    const submittedAt = row.submittedAt || row.updatedAt || row.createdAt;
    return <Card key={row._id} className={`overflow-hidden border transition-colors ${isExpanded ? "border-warning-400" : "border-default-200"}`}><CardBody className="p-0">
      <button type="button" className="flex w-full flex-col items-stretch gap-3 rounded-2xl p-4 text-left outline-none transition hover:bg-default-100 focus-visible:ring-2 focus-visible:ring-warning-500 focus-visible:ring-offset-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 md:p-5" aria-expanded={isExpanded} aria-controls={`service-request-${row._id}`} onClick={() => setExpandedId(isExpanded ? null : row._id)}>
        <span className="min-w-0"><span className="block text-xs font-bold uppercase tracking-wider text-warning-600">{PROFILE_LABELS[kind]} request</span><span className="mt-1 block truncate text-lg font-black">{row.draft?.displayName || row.companyId?.name || PROFILE_LABELS[kind]}</span><span className="mt-1 block break-words text-sm text-default-500">{row.companyId?.name && row.draft?.displayName ? `${row.companyId.name} · ` : ""}{summary(row, kind)}{submittedAt ? ` · Submitted ${new Date(submittedAt).toLocaleString()}` : ""}</span></span>
        <span className="flex w-full shrink-0 items-center justify-between gap-3 sm:w-auto sm:justify-start"><Chip color="warning" variant="flat">{humanize(row.status || "PENDING_REVIEW")}</Chip><span className="hidden text-sm font-semibold text-default-600 sm:inline">{isExpanded ? "Close" : "Review request"}</span><FiChevronDown className={`shrink-0 text-lg transition-transform ${isExpanded ? "rotate-180" : ""}`} /></span>
      </button>
      {isExpanded ? <div id={`service-request-${row._id}`} className="space-y-5 border-t border-default-200 p-4 md:p-6">
        {row.draft?.summary || row.draft?.shortDescription || row.draft?.companyDescription ? <div className="rounded-xl border border-warning-200 bg-warning-50/50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-warning-700">Submitted description</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{row.draft.summary || row.draft.shortDescription || row.draft.companyDescription}</p></div> : null}
        <section className="rounded-2xl border border-default-200 bg-default-50/50"><h3 className="border-b border-default-200 p-4 font-bold">Full submitted request</h3><div className="p-4"><SubmittedValue value={row.draft || {}} /></div></section>
        {reviewErrors[row._id] ? <div role="alert" className="rounded-xl border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700"><b>Unable to complete this review</b><p className="mt-1 whitespace-pre-wrap">{reviewErrors[row._id].message}</p>{reviewErrors[row._id].requestId ? <p className="mt-2 text-xs opacity-80">Support reference: {reviewErrors[row._id].requestId}</p> : null}<div className="mt-3 flex flex-wrap gap-2">{reviewErrors[row._id].isRetryable ? <Button size="sm" color="danger" variant="flat" onPress={() => onReview(row._id, reviewErrors[row._id].action, note)}>Retry approval</Button> : null}{reviewErrors[row._id].status === 409 ? <Button size="sm" variant="flat" onPress={onRefresh}>Refresh request</Button> : null}</div></div> : null}
        <Textarea label="Review notes" description="Required when requesting changes." value={note} onValueChange={(value) => setNotes((current) => ({ ...current, [row._id]: value }))} />
        <div className="flex flex-wrap justify-end gap-2"><Button color="danger" variant="flat" isDisabled={isReviewing || !String(note).trim()} isLoading={isReviewing && reviewing?.action === "REJECT"} onPress={() => onReview(row._id, "REJECT", note)}>Request changes</Button><Button color="success" isDisabled={isReviewing} isLoading={isReviewing && reviewing?.action === "APPROVE"} onPress={() => onReview(row._id, "APPROVE", note)}>Approve and publish</Button></div>
      </div> : null}
    </CardBody></Card>;
  })}</div>;
}

function PackagingTaxonomyQueue() {
  const client = useQueryClient();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewErrors, setReviewErrors] = useState<Record<string, ReviewIssue>>({});
  const query = useQuery({ queryKey: ["packaging-taxonomy-approvals"], queryFn: async () => ((await getData(packagingRoutes.taxonomy)).data.data || []).filter((row: any) => row.status === "REQUESTED") });
  const review = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => patchData(packagingRoutes.taxonomyReview(id), { status, reviewNotes: notes[id] || "" }),
    onMutate: ({ id }) => setReviewErrors((current) => { const next = { ...current }; delete next[id]; return next; }),
    onSuccess: (_response, variables) => { client.invalidateQueries({ queryKey: ["packaging-taxonomy-approvals"] }); client.invalidateQueries({ queryKey: ["packaging-taxonomy"] }); client.invalidateQueries({ queryKey: ["approval-summary", "services"] }); setReviewErrors((current) => { const next = { ...current }; delete next[variables.id]; return next; }); showToastMessage({ type: "success", message: variables.status === "ACTIVE" ? "Packaging option approved." : "Packaging option changes requested." }); },
    onError: (error: unknown, variables) => { const issue = { ...normalizeApiError(error, "Unable to save this packaging review."), action: variables.status }; setReviewErrors((current) => ({ ...current, [variables.id]: issue })); showToastMessage({ type: "error", message: issue.message }); },
  });
  if (query.isLoading) return <p className="p-8 text-center text-default-500">Loading packaging option requests…</p>;
  if (!query.data?.length) return <p className="rounded-2xl border border-dashed border-default-300 p-10 text-center text-default-500">No packaging options are awaiting review.</p>;
  return <div className="grid gap-4">{query.data.map((row: any) => { const isReviewing = review.isPending && review.variables?.id === row._id; const isExpanded = expandedId === row._id; return <Card key={row._id} className={`overflow-hidden border transition-colors ${isExpanded ? "border-warning-400" : "border-default-200"}`}><CardBody className="p-0"><button type="button" className="flex w-full flex-col items-stretch gap-3 rounded-2xl p-4 text-left outline-none transition hover:bg-default-100 focus-visible:ring-2 focus-visible:ring-warning-500 sm:flex-row sm:items-center sm:justify-between sm:gap-4 md:p-5" aria-expanded={isExpanded} aria-controls={`packaging-option-${row._id}`} onClick={() => setExpandedId(isExpanded ? null : row._id)}><span className="min-w-0"><span className="block text-xs font-bold uppercase tracking-wider text-warning-600">Packaging option request</span><span className="mt-1 block truncate text-lg font-black">{row.name}</span><span className="mt-1 block break-words text-sm text-default-500">{humanize(row.kind || "Option")}</span></span><span className="flex w-full shrink-0 items-center justify-between gap-3 sm:w-auto sm:justify-start"><Chip color="warning" variant="flat">Requested</Chip><span className="hidden text-sm font-semibold text-default-600 sm:inline">{isExpanded ? "Close" : "Review request"}</span><FiChevronDown className={`shrink-0 text-lg transition-transform ${isExpanded ? "rotate-180" : ""}`} /></span></button>{isExpanded ? <div id={`packaging-option-${row._id}`} className="space-y-5 border-t border-default-200 p-4 md:p-6">{row.description ? <div className="rounded-xl border border-warning-200 bg-warning-50/50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-warning-700">Submitted description</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{row.description}</p></div> : null}<section className="rounded-xl border border-default-200 p-4"><h3 className="mb-4 font-bold">Full submitted option</h3><SubmittedValue value={row} /></section>{reviewErrors[row._id] ? <div role="alert" className="rounded-xl border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700"><b>Unable to complete this review</b><p className="mt-1 whitespace-pre-wrap">{reviewErrors[row._id].message}</p>{reviewErrors[row._id].requestId ? <p className="mt-2 text-xs opacity-80">Support reference: {reviewErrors[row._id].requestId}</p> : null}<div className="mt-3 flex gap-2">{reviewErrors[row._id].isRetryable ? <Button size="sm" color="danger" variant="flat" onPress={() => review.mutate({ id: row._id, status: reviewErrors[row._id].action })}>Retry approval</Button> : null}{reviewErrors[row._id].status === 409 ? <Button size="sm" variant="flat" onPress={() => query.refetch()}>Refresh request</Button> : null}</div></div> : null}<Textarea label="Review notes" description="Required when requesting changes." value={notes[row._id] || ""} onValueChange={(value) => setNotes((current) => ({ ...current, [row._id]: value }))} /><div className="flex flex-wrap justify-end gap-2"><Button color="danger" variant="flat" isDisabled={isReviewing || !String(notes[row._id] || "").trim()} isLoading={isReviewing && review.variables?.status === "REJECTED"} onPress={() => review.mutate({ id: row._id, status: "REJECTED" })}>Request changes</Button><Button color="success" isDisabled={isReviewing} isLoading={isReviewing && review.variables?.status === "ACTIVE"} onPress={() => review.mutate({ id: row._id, status: "ACTIVE" })}>Approve option</Button></div></div> : null}</CardBody></Card>; })}</div>;
}

export default function ServiceProfileApprovalQueues() {
  const [section, setSection] = useState("options");
  const [reviewErrors, setReviewErrors] = useState<Record<string, ReviewIssue>>({});
  const client = useQueryClient();
  const useQueue = (key: string, url: string, params?: Record<string, any>) => useQuery({ queryKey: [key], queryFn: async () => (await getData(url, params)).data.data || [] });
  const packagingOptions = useQuery({ queryKey: ["packaging-taxonomy-approvals"], queryFn: async () => ((await getData(packagingRoutes.taxonomy)).data.data || []).filter((row: any) => row.status === "REQUESTED") });
  const packaging = useQueue("packaging-approvals", packagingRoutes.approvals);
  const finance = useQueue("financial-partner-approvals", financialPartnerRoutes.approvals);
  const insurance = useQueue("insurance-partner-approvals", insurancePartnerRoutes.approvals);
  const freight = useQueue("freight-profile-approvals", freightForwardingRoutes.approvals);
  const agritech = useQueue("agritech-approvals", apiRoutes.agritechProfiles.approvals, { status: "PENDING_REVIEW" });
  const review = useMutation({
    mutationFn: ({ url, action, notes }: any) => patchData(url, { action, notes, reviewNotes: notes }),
    onMutate: (variables: any) => setReviewErrors((current) => { const next = { ...current }; delete next[variables.id]; return next; }),
    onSuccess: (_response: any, variables: any) => { client.invalidateQueries({ queryKey: [variables.key] }); client.invalidateQueries({ queryKey: ["approval-summary", "services"] }); setReviewErrors((current) => { const next = { ...current }; delete next[variables.id]; return next; }); showToastMessage({ type: "success", message: variables.action === "APPROVE" ? "Profile approved and published." : "Changes requested from the provider." }); },
    onError: (error: unknown, variables: any) => { const issue = { ...normalizeApiError(error, "Unable to save this review."), action: variables.action }; setReviewErrors((current) => ({ ...current, [variables.id]: issue })); showToastMessage({ type: "error", message: issue.message }); },
  });
  const act = (url: (id: string) => string, key: string) => (id: string, action: string, notes: string) => review.mutate({ id, url: url(id), key, action, notes });
  const reviewing = review.isPending ? { id: review.variables?.id, action: review.variables?.action } : undefined;
  const selectors = [
    { key: "options", label: "Packaging options", count: packagingOptions.data?.length || 0 },
    { key: "profiles", label: "Packaging units", count: packaging.data?.length || 0 },
    { key: "finance", label: "Financial", count: finance.data?.length || 0 },
    { key: "insurance", label: "Insurance", count: insurance.data?.length || 0 },
    { key: "freight", label: "Freight", count: freight.data?.length || 0 },
    { key: "agritech", label: "Agritech", count: agritech.data?.length || 0 },
  ];
  return <section className="space-y-5">
    <nav className="overflow-x-auto pb-1" aria-label="Service approval categories"><div className="grid min-w-max grid-flow-col auto-cols-[minmax(150px,1fr)] gap-2 rounded-2xl border border-default-200 bg-default-100/70 p-2 xl:min-w-0 xl:grid-flow-row xl:grid-cols-6">{selectors.map((item) => { const selected = section === item.key; return <button key={item.key} type="button" aria-pressed={selected} className={`flex min-h-12 items-center justify-between gap-3 rounded-xl border px-4 py-2 text-left text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-warning-500 ${selected ? "border-warning-400 bg-content1 text-warning-700 shadow-sm" : "border-transparent text-default-600 hover:border-default-300 hover:bg-content1/70"}`} onClick={() => setSection(item.key)}><span>{item.label}</span><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${selected ? "bg-warning-100 text-warning-700" : "bg-default-200 text-default-600"}`}>{item.count}</span></button>; })}</div></nav>
    <div>{section === "options" ? <PackagingTaxonomyQueue /> : section === "profiles" ? <ProfileQueue rows={packaging.data || []} loading={packaging.isLoading} kind="packaging" reviewing={reviewing} reviewErrors={reviewErrors} onRefresh={() => packaging.refetch()} onReview={act(packagingRoutes.reviewProfile, "packaging-approvals")} /> : section === "finance" ? <ProfileQueue rows={finance.data || []} loading={finance.isLoading} kind="finance" reviewing={reviewing} reviewErrors={reviewErrors} onRefresh={() => finance.refetch()} onReview={act(financialPartnerRoutes.review, "financial-partner-approvals")} /> : section === "insurance" ? <ProfileQueue rows={insurance.data || []} loading={insurance.isLoading} kind="insurance" reviewing={reviewing} reviewErrors={reviewErrors} onRefresh={() => insurance.refetch()} onReview={act(insurancePartnerRoutes.review, "insurance-partner-approvals")} /> : section === "freight" ? <ProfileQueue rows={freight.data || []} loading={freight.isLoading} kind="freight" reviewing={reviewing} reviewErrors={reviewErrors} onRefresh={() => freight.refetch()} onReview={act(freightForwardingRoutes.reviewProfile, "freight-profile-approvals")} /> : <ProfileQueue rows={agritech.data || []} loading={agritech.isLoading} kind="agritech" reviewing={reviewing} reviewErrors={reviewErrors} onRefresh={() => agritech.refetch()} onReview={act(apiRoutes.agritechProfiles.review, "agritech-approvals")} />}</div>
  </section>;
}
