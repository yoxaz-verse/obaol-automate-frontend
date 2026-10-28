"use client";

import type { ChangeEvent, DragEvent, ReactNode } from "react";
import Link from "next/link";
import {
  FiActivity, FiAlertCircle, FiCheckCircle, FiClock, FiFileText, FiGrid,
  FiList, FiSearch, FiShare2, FiUploadCloud, FiX,
} from "react-icons/fi";
import { DashboardPanel, DashboardStatusBadge } from "@/components/dashboard/DashboardUI";
import { DOCUMENT_CATEGORIES, DOCUMENT_LABELS } from "./documentCatalog";

export type DocumentationView = "overview" | "library" | "create" | "requirements" | "recipients" | "configuration";
export type LibraryDisplay = "table" | "cards";

export const DOCUMENTATION_VIEWS: Array<{ key: DocumentationView; label: string; description: string }> = [
  { key: "overview", label: "Overview", description: "Operational summary" },
  { key: "library", label: "Library", description: "All documents" },
  { key: "create", label: "Create or upload", description: "Start a draft" },
  { key: "requirements", label: "Requirements", description: "Stage controls" },
  { key: "recipients", label: "Recipients", description: "Sharing directory" },
  { key: "configuration", label: "Configuration", description: "Admin tools" },
];

export const join = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(" ");
export const humanize = (value?: unknown) => String(value || "").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase());
export const documentLabel = (value?: string) => DOCUMENT_LABELS[String(value || "")] || humanize(value) || "Document";
export const categoryForType = (value?: string) => DOCUMENT_CATEGORIES.find(item => item.types.includes(String(value || "")))?.label || "Other";
export const formatDate = (value?: string | Date) => value ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value)) : "—";
export const formatDateTime = (value?: string | Date) => value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";

export function StatusBadge({ value, verification = false }: { value?: string; verification?: boolean }) {
  const normalized = String(value || (verification ? "PENDING" : "UNKNOWN")).toUpperCase();
  const tone = normalized === "VERIFIED" || normalized === "ACCEPTED" || normalized === "COMPLETED" ? "success"
    : normalized === "REJECTED" || normalized === "FAILED" || normalized === "CANCELLED" ? "danger"
      : normalized === "SENT" || normalized === "PROCESSING" ? "brand"
        : normalized === "PENDING" || normalized === "REVIEW_REQUIRED" || normalized === "QUEUED" ? "warning" : "neutral";
  return <DashboardStatusBadge tone={tone}>{humanize(normalized)}</DashboardStatusBadge>;
}

export function WorkspaceNav({ active, isAdmin, onChange }: { active: DocumentationView; isAdmin: boolean; onChange: (view: DocumentationView) => void }) {
  return <nav aria-label="Documentation workspace" className="dashboard-panel overflow-x-auto p-1.5">
    <div className="flex min-w-max gap-1" role="tablist">
      {DOCUMENTATION_VIEWS.filter(item => isAdmin || item.key !== "configuration").map(item => <button
        key={item.key} role="tab" aria-selected={active === item.key} onClick={() => onChange(item.key)}
        className={join("min-h-11 rounded-xl px-4 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-obaol-500", active === item.key ? "bg-obaol-500 text-obaol-950 shadow-sm" : "db-muted-strong hover:bg-[var(--db-surface-muted)]")}
      ><span className="block text-sm font-bold">{item.label}</span><span className={join("hidden text-[11px] lg:block", active === item.key ? "text-obaol-950/70" : "db-muted")}>{item.description}</span></button>)}
    </div>
  </nav>;
}

const metricIcons = { documents: FiFileText, drafts: FiClock, verification: FiCheckCircle, extraction: FiActivity, shared: FiShare2 };
export function MetricCard({ label, value, icon, tone = "neutral", onClick }: { label: string; value: number; icon: keyof typeof metricIcons; tone?: "neutral" | "brand" | "warning" | "success"; onClick?: () => void }) {
  const Icon = metricIcons[icon];
  const card = <DashboardPanel className={join("h-full p-5 transition", onClick && "group hover:-translate-y-0.5 hover:border-obaol-500/40 hover:shadow-md")}>
    <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium db-muted">{label}</p><p className="mt-2 text-3xl font-bold tracking-tight">{value}</p></div><span className={join("grid h-10 w-10 place-items-center rounded-xl", tone === "brand" && "bg-obaol-500/15 text-obaol-700 dark:text-obaol-300", tone === "warning" && "bg-warning-500/10 text-warning-600", tone === "success" && "bg-success-500/10 text-success-600", tone === "neutral" && "db-inset db-muted-strong")}><Icon aria-hidden="true" /></span></div>
    {onClick && <p className="mt-4 text-xs font-semibold text-obaol-700 opacity-0 transition group-hover:opacity-100 dark:text-obaol-300">Open filtered library →</p>}
  </DashboardPanel>;
  return onClick ? <button className="w-full text-left" onClick={onClick}>{card}</button> : card;
}

export function SearchField({ value, onChange, placeholder = "Search documents" }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="relative block min-w-0 flex-1"><span className="sr-only">{placeholder}</span><FiSearch aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 db-muted" /><input value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} className="min-h-11 w-full rounded-xl border border-[var(--db-border)] bg-transparent py-2 pl-10 pr-10 text-sm outline-none transition focus:border-obaol-500 focus:ring-2 focus:ring-obaol-500/20" />{value && <button aria-label="Clear search" onClick={() => onChange("")} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg hover:bg-default-100"><FiX /></button>}</label>;
}

export function ViewToggle({ value, onChange }: { value: LibraryDisplay; onChange: (value: LibraryDisplay) => void }) {
  return <div className="flex rounded-xl border border-[var(--db-border)] p-1" aria-label="Library display">
    <button aria-label="Table view" aria-pressed={value === "table"} onClick={() => onChange("table")} className={join("grid h-9 w-9 place-items-center rounded-lg", value === "table" && "bg-obaol-500 text-obaol-950")}><FiList /></button>
    <button aria-label="Card view" aria-pressed={value === "cards"} onClick={() => onChange("cards")} className={join("grid h-9 w-9 place-items-center rounded-lg", value === "cards" && "bg-obaol-500 text-obaol-950")}><FiGrid /></button>
  </div>;
}

export function SelectField({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode }) {
  return <label className="min-w-0"><span className="mb-1 block text-[11px] font-bold tracking-wide db-muted">{label}</span><select aria-label={label} value={value} onChange={event => onChange(event.target.value)} className="min-h-11 w-full rounded-xl border border-[var(--db-border)] bg-transparent px-3 text-sm outline-none focus:border-obaol-500 focus:ring-2 focus:ring-obaol-500/20">{children}</select></label>;
}

export function FileDropzone({ file, onFile }: { file: File | null; onFile: (file: File | null) => void }) {
  const receive = (event: DragEvent<HTMLLabelElement>) => { event.preventDefault(); onFile(event.dataTransfer.files?.[0] || null); };
  const choose = (event: ChangeEvent<HTMLInputElement>) => onFile(event.target.files?.[0] || null);
  return <label onDragOver={event => event.preventDefault()} onDrop={receive} className="group block cursor-pointer rounded-2xl border-2 border-dashed border-[var(--db-border)] p-6 text-center outline-none transition hover:border-obaol-500 hover:bg-obaol-500/5 focus-within:border-obaol-500 focus-within:ring-2 focus-within:ring-obaol-500/20">
    <input aria-label="Document file" className="sr-only" type="file" accept="application/pdf,image/png,image/jpeg" onChange={choose} />
    <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-obaol-500/15 text-xl text-obaol-700 dark:text-obaol-300"><FiUploadCloud /></span>
    {file ? <div className="mt-3"><p className="break-all text-sm font-bold">{file.name}</p><p className="mt-1 text-xs db-muted">{file.type || "Unknown type"} · {(file.size / 1024 / 1024).toFixed(2)} MB</p><button type="button" onClick={event => { event.preventDefault(); onFile(null); }} className="mt-2 text-xs font-bold text-danger">Remove file</button></div> : <div className="mt-3"><p className="text-sm font-bold">Drop a PDF, PNG, or JPEG here</p><p className="mt-1 text-xs db-muted">or click to browse · maximum 15 MB</p></div>}
  </label>;
}

export function ProgressTimeline({ status }: { status?: string }) {
  const normalized = String(status || "QUEUED").toUpperCase();
  const steps = ["UPLOADING", "QUEUED", "PROCESSING", "REVIEW_REQUIRED", "COMPLETED"];
  const current = normalized === "FAILED" ? 3 : Math.max(steps.indexOf(normalized), 1);
  return <ol className="grid gap-2 sm:grid-cols-5" aria-label="Extraction progress">{steps.map((step, index) => {
    const done = index < current || normalized === "COMPLETED", active = index === current && normalized !== "COMPLETED";
    return <li key={step} className={join("rounded-xl border p-3 text-xs", done && "border-success-500/30 bg-success-500/5", active && "border-obaol-500 bg-obaol-500/10", !done && !active && "border-[var(--db-border-subtle)] db-inset")}><span className="flex items-center gap-2 font-semibold">{done ? <FiCheckCircle className="text-success-500" /> : active ? <FiClock className="text-obaol-600" /> : <span className="h-2 w-2 rounded-full bg-default-300" />}{humanize(step)}</span></li>;
  })}</ol>;
}

export function LifecycleTracker({ status, invitationActive = false, invitationExpired = false }: { status?: string; invitationActive?: boolean; invitationExpired?: boolean }) {
  const normalized = String(status || "DRAFT").toUpperCase();
  const terminal = ["ACCEPTED", "REJECTED", "CANCELLED"].includes(normalized) ? normalized : "DECISION";
  const responseState = normalized === "SENT" && invitationExpired ? "EXPIRED" : invitationActive && normalized === "SENT" ? "AWAITING_RESPONSE" : terminal;
  const steps = ["DRAFT", "ISSUED", responseState];
  const current = normalized === "DRAFT" ? 0 : normalized === "SENT" ? invitationActive || invitationExpired ? 2 : 1 : 2;
  return <ol className="grid min-w-0 gap-2 sm:flex sm:items-center" aria-label="Document lifecycle">{steps.map((step, index) => <li key={`${step}-${index}`} className="flex min-w-0 items-center sm:flex-1 sm:last:flex-none"><span className={join("inline-flex min-h-9 max-w-full items-center rounded-full border px-3 text-left text-xs font-bold leading-4", index < current && "border-success-500/30 bg-success-500/10 text-success-600", index === current && "border-obaol-500 bg-obaol-500/15 text-obaol-700 dark:text-obaol-300", index > current && "border-[var(--db-border-subtle)] db-inset db-muted")}>{index < current ? <FiCheckCircle className="mr-1.5 shrink-0" /> : null}<span className="break-words">{humanize(step)}</span></span>{index < steps.length - 1 && <span aria-hidden="true" className={join("mx-2 hidden h-px min-w-4 flex-1 sm:block", index < current ? "bg-success-500/50" : "bg-default-200")} />}</li>)}</ol>;
}

export function InlineNotice({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "warning" | "danger" | "success" }) {
  return <div role={tone === "danger" ? "alert" : "status"} className={join("flex gap-3 rounded-xl border p-3 text-sm", tone === "neutral" && "border-[var(--db-border-subtle)] db-inset", tone === "warning" && "border-warning-500/30 bg-warning-500/10", tone === "danger" && "border-danger-500/30 bg-danger-500/10 text-danger-600", tone === "success" && "border-success-500/30 bg-success-500/10")}><FiAlertCircle className="mt-0.5 shrink-0" />{children}</div>;
}

export function DocumentCard({ doc }: { doc: any }) {
  return <DashboardPanel className="flex h-full flex-col p-5"><div className="flex items-start justify-between gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-obaol-500/15 text-obaol-700 dark:text-obaol-300"><FiFileText /></span><StatusBadge value={doc.status} /></div><Link href={`/dashboard/documentation/${doc._id}`} className="mt-4 truncate text-base font-bold text-foreground hover:text-obaol-700">{doc.documentNumber || "Untitled document"}</Link><p className="mt-1 text-xs db-muted">{documentLabel(doc.type)} · {categoryForType(doc.type)}</p><p className="mt-4 line-clamp-2 text-sm">{doc.seller?.name || "Unknown seller"} <span className="db-muted">→</span> {doc.buyer?.name || "Unknown buyer"}</p><div className="mt-auto flex items-center justify-between gap-3 pt-5"><StatusBadge value={doc.verifiedStatus} verification /><span className="text-xs db-muted">{formatDate(doc.updatedAt || doc.createdAt)}</span></div></DashboardPanel>;
}
