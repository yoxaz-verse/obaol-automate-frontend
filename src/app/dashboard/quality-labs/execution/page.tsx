"use client";

import { useState } from "react";
import { Button, Card, CardBody, Chip, Spinner, Tab, Tabs, Textarea } from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiCheckCircle, FiClock, FiPackage } from "react-icons/fi";
import { getData, patchData } from "@/core/api/apiHandler";
import { labWorkItemRoutes } from "@/core/api/apiRoutes";
import { showToastMessage } from "@/utils/utils";

type CustodyStatus = "EXPECTED" | "RECEIVED" | "TESTING" | "COMPLETED" | "RELEASED";
type WorkItem = { _id: string; status: CustodyStatus; notes?: string; updatedAt: string; labCompanyId?: { name?: string }; inquiryId?: { enquiryCode?: string; workflowStage?: string; status?: string } };
const nextStatus: Partial<Record<CustodyStatus, CustodyStatus>> = { EXPECTED: "RECEIVED", RECEIVED: "TESTING", TESTING: "COMPLETED", COMPLETED: "RELEASED" };
const label = (value: string) => value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function LabExecutionPage() {
  const client = useQueryClient();
  const [state, setState] = useState<"active" | "history">("active");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const query = useQuery({ queryKey: ["lab-work-items", state], queryFn: async () => (await getData(labWorkItemRoutes.list, { state })).data.data as WorkItem[] });
  const transition = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CustodyStatus }) => patchData(labWorkItemRoutes.transition(id), { status, note: notes[id] || "" }),
    onSuccess: () => { client.invalidateQueries({ queryKey: ["lab-work-items"] }); showToastMessage({ type: "success", message: "Sample custody status updated." }); },
    onError: (error: any) => showToastMessage({ type: "error", message: error?.response?.data?.message || "Unable to update sample custody." }),
  });
  const rows = query.data || [];
  return <section className="space-y-6 pb-16">
    <header><p className="text-[10px] font-black uppercase tracking-[.3em] text-success-500">Providing · Quality testing</p><h1 className="mt-2 text-3xl font-black">Lab Execution</h1><p className="mt-2 text-sm text-default-500">Receive assigned samples, record testing progress, and maintain a clear custody trail.</p></header>
    <Tabs selectedKey={state} onSelectionChange={(key) => setState(key as "active" | "history")}><Tab key="active" title="Active samples" /><Tab key="history" title="History" /></Tabs>
    {query.isLoading ? <div className="flex justify-center py-20"><Spinner /></div> : query.isError ? <Card><CardBody className="text-danger">Unable to load lab execution work.</CardBody></Card> : rows.length === 0 ? <Card><CardBody className="items-center gap-3 py-16 text-center"><FiPackage className="text-3xl text-default-400" /><h2 className="font-bold">No {state} samples</h2><p className="text-sm text-default-500">Awarded quality-testing work will appear here automatically.</p></CardBody></Card> : <div className="grid gap-4 lg:grid-cols-2">{rows.map((row) => { const next = nextStatus[row.status]; return <Card key={row._id} className="border border-default-200"><CardBody className="gap-4 p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-default-400">{row.inquiryId?.enquiryCode || "Quality assignment"}</p><h2 className="mt-1 text-lg font-black">Sample custody</h2></div><Chip color={row.status === "RELEASED" ? "success" : row.status === "TESTING" ? "warning" : "primary"} variant="flat">{label(row.status)}</Chip></div><div className="flex items-center gap-2 text-xs text-default-500"><FiClock />Updated {new Date(row.updatedAt).toLocaleString()}</div>{next ? <><Textarea label="Progress note" value={notes[row._id] || ""} onValueChange={(value) => setNotes((current) => ({ ...current, [row._id]: value }))} /><Button color="success" startContent={<FiCheckCircle />} isLoading={transition.isPending} onPress={() => transition.mutate({ id: row._id, status: next })}>Mark {label(next)}</Button></> : null}</CardBody></Card>; })}</div>}
  </section>;
}
