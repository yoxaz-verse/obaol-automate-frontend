"use client";
import { useMemo, useState } from "react";
import { Accordion, AccordionItem, Button, Card, CardBody, Chip, Input, Pagination, Select, SelectItem, Tab, Tabs, Textarea } from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiCheckCircle, FiClock, FiMapPin, FiPackage, FiRefreshCw, FiSearch } from "react-icons/fi";
import { getData, patchData } from "@/core/api/apiHandler";
import { labWorkItemRoutes } from "@/core/api/apiRoutes";
import { showToastMessage } from "@/utils/utils";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import LoadingState from "@/components/ui/LoadingState";

type CustodyStatus = "EXPECTED" | "RECEIVED" | "TESTING" | "COMPLETED" | "RELEASED";
type WorkItem = { _id: string; status: CustodyStatus; updatedAt: string; labProfileId?: { published?: { displayName?: string; address?: string; city?: string; state?: string } }; inquiryId?: { enquiryCode?: string }; statusHistory?: Array<{ status: CustodyStatus; at: string; note?: string }> };
const statuses: CustodyStatus[] = ["EXPECTED", "RECEIVED", "TESTING", "COMPLETED", "RELEASED"];
const nextStatus: Partial<Record<CustodyStatus, CustodyStatus>> = { EXPECTED: "RECEIVED", RECEIVED: "TESTING", TESTING: "COMPLETED", COMPLETED: "RELEASED" };
const label = (value: string) => value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function LabExecutionPage() {
  const client = useQueryClient();
  const [state, setState] = useState<"active" | "history">("active");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const query = useQuery({ queryKey: ["lab-work-items", state, status, page], queryFn: async () => (await getData(labWorkItemRoutes.list, { state, status: status || undefined, page, limit: 20 })).data });
  const transition = useMutation({ mutationFn: ({ id, status }: { id: string; status: CustodyStatus }) => patchData(labWorkItemRoutes.transition(id), { status, note: notes[id] || "" }), onSuccess: (_response, variables) => { setNotes((current) => ({ ...current, [variables.id]: "" })); client.invalidateQueries({ queryKey: ["lab-work-items"] }); showToastMessage({ type: "success", message: "Sample custody status updated." }); }, onError: (error: any) => { showToastMessage({ type: "error", message: error?.response?.data?.message || "Unable to update sample custody." }); if (error?.response?.status === 409) query.refetch(); } });
  const payload: any = query.data || {};
  const rows: WorkItem[] = useMemo(() => payload.data || [], [payload.data]);
  const visible = useMemo(() => { const term = search.trim().toLowerCase(); return term ? rows.filter((row) => `${row.inquiryId?.enquiryCode || ""} ${row.labProfileId?.published?.displayName || ""}`.toLowerCase().includes(term)) : rows; }, [rows, search]);
  const counts = payload.meta?.counts || {};
  return <section className="space-y-6 pb-16">
    <PageHeader variant="plain" eyebrowTone="success" eyebrow="Providing · Quality testing" title="Lab Execution" description="Receive samples, record progress, and maintain a facility-specific custody trail." actions={<Button variant="flat" startContent={<FiRefreshCw />} onPress={() => query.refetch()}>Refresh</Button>} />
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">{statuses.map((item) => <Card key={item}><CardBody className="p-3"><span className="text-xs text-default-500">{label(item)}</span><b className="text-xl">{counts[item] || 0}</b></CardBody></Card>)}</div>
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"><Tabs selectedKey={state} onSelectionChange={(key) => { setState(key as any); setStatus(""); setPage(1); }}><Tab key="active" title="Active samples" /><Tab key="history" title="History" /></Tabs><div className="grid gap-3 sm:grid-cols-2 lg:w-[560px]"><Input aria-label="Search lab work" placeholder="Search enquiry or facility" value={search} onValueChange={setSearch} startContent={<FiSearch />} /><Select aria-label="Filter custody status" placeholder="All custody statuses" selectedKeys={status ? [status] : []} onSelectionChange={(keys) => { setStatus(keys === "all" ? "" : String(Array.from(keys)[0] || "")); setPage(1); }}>{statuses.filter((item) => state === "history" ? ["COMPLETED", "RELEASED"].includes(item) : !["COMPLETED", "RELEASED"].includes(item)).map((item) => <SelectItem key={item}>{label(item)}</SelectItem>)}</Select></div></div>
    {query.isLoading ? <LoadingState title="Loading lab execution work" /> : query.isError ? <ErrorState title="Unable to load lab execution work" onRetry={() => query.refetch()} /> : visible.length === 0 ? <EmptyState icon={<FiPackage className="text-3xl text-default-400" />} title={`No ${state} samples`} message="Awarded quality-testing work will appear here automatically." /> : <div className="grid gap-4 lg:grid-cols-2">{visible.map((row) => { const next = nextStatus[row.status]; const facility = row.labProfileId?.published; const pending = transition.isPending && transition.variables?.id === row._id; return <Card key={row._id} className="border border-default-200"><CardBody className="gap-4 p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold  tracking-wider text-default-400">{row.inquiryId?.enquiryCode || "Quality assignment"}</p><h2 className="mt-1 text-lg font-black">{facility?.displayName || "Laboratory facility"}</h2><p className="mt-1 flex items-center gap-1 text-xs text-default-500"><FiMapPin />{[facility?.city, facility?.state].filter(Boolean).join(", ") || facility?.address || "Facility details unavailable"}</p></div><Chip color={row.status === "RELEASED" ? "success" : row.status === "TESTING" ? "warning" : "primary"} variant="flat">{label(row.status)}</Chip></div><div className="flex items-center gap-2 text-xs text-default-500"><FiClock />Updated {new Date(row.updatedAt).toLocaleString()}</div><Accordion isCompact><AccordionItem key="history" title="Custody timeline" subtitle={`${row.statusHistory?.length || 0} transition(s)`}><ol className="space-y-3 pb-3">{(row.statusHistory || []).map((event, index) => <li key={`${event.status}-${event.at}-${index}`} className="border-l-2 border-success-400 pl-3"><b className="text-sm">{label(event.status)}</b><p className="text-xs text-default-500">{new Date(event.at).toLocaleString()}</p>{event.note ? <p className="mt-1 text-sm">{event.note}</p> : null}</li>)}</ol></AccordionItem></Accordion>{next ? <><Textarea label="Progress note" maxLength={1000} value={notes[row._id] || ""} onValueChange={(value) => setNotes((current) => ({ ...current, [row._id]: value }))} /><Button color="success" startContent={<FiCheckCircle />} isLoading={pending} isDisabled={transition.isPending && !pending} onPress={() => transition.mutate({ id: row._id, status: next })}>Mark {label(next)}</Button></> : null}</CardBody></Card>; })}</div>}
    {(payload.meta?.pages || 0) > 1 ? <div className="flex justify-center"><Pagination page={page} total={payload.meta.pages} onChange={setPage} color="success" /></div> : null}
  </section>;
}
