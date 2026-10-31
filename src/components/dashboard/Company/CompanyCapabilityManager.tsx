"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Chip, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner, Textarea } from "@nextui-org/react";
import { LuChevronDown, LuChevronUp, LuTag } from "react-icons/lu";
import { getData, patchData, putData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { fetchRegisterOptions } from "@/utils/registerOptions";
import { reconcileCompanyFunctionPriorities } from "@/utils/companyFunctionPriorities";
import { showToastMessage } from "@/utils/utils";

const MAIN_CATEGORY_SLUGS = new Set([
  "buyer", "seller", "sourcing", "packaging", "testing", "warehouse-storage", "finance-risk",
  "importing-to-india", "exporting-from-india", "freight-forwarding", "inland-logistics",
]);

type Props = {
  companyId: string;
  company: any;
  interestData: any;
  canEdit: boolean;
  isAdmin: boolean;
  onChanged: () => void;
};

const dateLabel = (value: unknown) => {
  const date = value ? new Date(String(value)) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString() : "—";
};

export default function CompanyCapabilityManager({ companyId, company, interestData, canEdit, isAdmin, onChanged }: Props) {
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const [providedIds, setProvidedIds] = useState<string[]>([]);
  const [soughtIds, setSoughtIds] = useState<string[]>([]);
  const [providedPriorities, setProvidedPriorities] = useState<string[]>([]);
  const [soughtPriorities, setSoughtPriorities] = useState<string[]>([]);
  const [decisionNotes, setDecisionNotes] = useState("");

  const optionsQuery = useQuery({
    queryKey: ["company-capability-options"],
    queryFn: fetchRegisterOptions,
    staleTime: 5 * 60 * 1000,
  });
  const pendingQuery = useQuery({
    queryKey: ["company-capability-pending", companyId],
    queryFn: async () => {
      const response = await getData(apiRoutes.companyCapabilityChangeRequests.list, {
        companyId,
        status: "PENDING_REVIEW",
        page: 1,
        limit: 1,
      });
      return Array.isArray(response?.data?.data) ? response.data.data[0] || null : null;
    },
    enabled: isAdmin && Boolean(companyId),
  });

  const options = useMemo(() => (Array.isArray(optionsQuery.data?.companyFunctions) ? optionsQuery.data.companyFunctions : [])
    .filter((item: any) => MAIN_CATEGORY_SLUGS.has(String(item?.slug || "")))
    .sort((a: any, b: any) => Number(a?.orderIndex || 0) - Number(b?.orderIndex || 0)), [optionsQuery.data]);
  const byId = useMemo(() => new Map(options.map((item: any) => [String(item._id), item])), [options]);
  const bySlug = useMemo(() => new Map(options.map((item: any) => [String(item.slug).toLowerCase(), String(item._id)])), [options]);
  const idsFromSlugs = (values: unknown) => (Array.isArray(values) ? values : [])
    .map((slug) => bySlug.get(String(slug).toLowerCase()) || "")
    .filter(Boolean);

  const activeProvidedIds = Array.isArray(interestData?.providedFunctionIds)
    ? interestData.providedFunctionIds.map(String)
    : idsFromSlugs(interestData?.providedCapabilities || company?.providedCapabilities);
  const activeSoughtIds = Array.isArray(interestData?.soughtFunctionIds)
    ? interestData.soughtFunctionIds.map(String)
    : idsFromSlugs(interestData?.soughtCapabilities || company?.soughtCapabilities);
  const activeProvidedPriorities = Array.isArray(interestData?.providedFunctionPriorities)
    ? interestData.providedFunctionPriorities.map(String)
    : [];
  const activeSoughtPriorities = Array.isArray(interestData?.soughtFunctionPriorities)
    ? interestData.soughtFunctionPriorities.map(String)
    : [];
  const pending = pendingQuery.data;

  useEffect(() => {
    if (!open) return;
    setProvidedIds(activeProvidedIds);
    setSoughtIds(activeSoughtIds);
    setProvidedPriorities(reconcileCompanyFunctionPriorities(activeProvidedIds, activeProvidedPriorities));
    setSoughtPriorities(reconcileCompanyFunctionPriorities(activeSoughtIds, activeSoughtPriorities));
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: ["company-capability-pending", companyId] }),
      client.invalidateQueries({ queryKey: ["company-capability-requests"] }),
    ]);
    onChanged();
  };

  const save = useMutation({
    mutationFn: () => putData("/auth/company-interests", {
      associateCompanyId: companyId,
      providedFunctionIds: providedIds,
      soughtFunctionIds: soughtIds,
      providedFunctionPriorities: providedPriorities,
      soughtFunctionPriorities: soughtPriorities,
    }),
    onSuccess: async () => {
      showToastMessage({ type: "success", message: "Company capabilities updated.", position: "top-right" });
      setOpen(false);
      await refresh();
    },
    onError: (error: any) => showToastMessage({
      type: "error",
      message: error?.response?.data?.message || "Failed to update company capabilities.",
      position: "top-right",
    }),
  });
  const review = useMutation({
    mutationFn: (action: "APPROVE" | "REJECT") => patchData(
      apiRoutes.companyCapabilityChangeRequests.review(String(pending?._id || "")),
      { action, notes: decisionNotes.trim() }
    ),
    onSuccess: async () => {
      showToastMessage({ type: "success", message: "Capability request reviewed.", position: "top-right" });
      setDecisionNotes("");
      await refresh();
    },
    onError: (error: any) => showToastMessage({
      type: "error",
      message: error?.response?.data?.message || "Unable to review capability request.",
      position: "top-right",
    }),
  });

  const toggle = (kind: "provided" | "sought", id: string) => {
    const setIds = kind === "provided" ? setProvidedIds : setSoughtIds;
    const setPriorities = kind === "provided" ? setProvidedPriorities : setSoughtPriorities;
    setIds((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : current.length < 6 ? [...current, id] : current;
      setPriorities((priorities) => reconcileCompanyFunctionPriorities(next, priorities));
      return next;
    });
  };
  const move = (kind: "provided" | "sought", id: string, direction: -1 | 1) => {
    const setter = kind === "provided" ? setProvidedPriorities : setSoughtPriorities;
    setter((current) => {
      const index = current.indexOf(id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };
  const renderProfile = (title: string, ids: string[], priorities: string[]) => (
    <div className="rounded-xl border border-divider bg-default-50/40 p-3">
      <p className="mb-2 text-[10px] font-black tracking-wider text-default-500">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {ids.length ? ids.map((id) => {
          const priority = priorities.indexOf(id);
          return <Chip key={`${title}-${id}`} size="sm" color={priority >= 0 ? "warning" : "default"} variant="flat">
            {byId.get(id)?.name || "Company category"}{priority >= 0 ? ` · P${priority + 1}` : ""}
          </Chip>;
        }) : <span className="text-xs text-default-400">Not configured</span>}
      </div>
    </div>
  );
  const renderEditor = (kind: "provided" | "sought") => {
    const ids = kind === "provided" ? providedIds : soughtIds;
    const priorities = kind === "provided" ? providedPriorities : soughtPriorities;
    return <section className="rounded-xl border border-divider p-3">
      <div className="mb-2 flex items-center justify-between"><p className="text-xs font-bold">{kind === "provided" ? "Provides" : "Seeking"}</p><span className="text-[10px] text-default-400">{ids.length}/6</span></div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option: any) => {
          const id = String(option._id);
          const selected = ids.includes(id);
          const priority = priorities.indexOf(id);
          return <button key={`${kind}-${id}`} type="button" disabled={!selected && ids.length >= 6} onClick={() => toggle(kind, id)} className={`rounded-lg border p-2 text-left text-xs transition ${selected ? "border-obaol-500 bg-obaol-500/10" : "border-divider hover:border-obaol-500/50 disabled:opacity-40"}`}>
            <span className="font-semibold">{option.name}</span>{priority >= 0 ? <span className="ml-1 text-warning">P{priority + 1}</span> : null}
          </button>;
        })}
      </div>
      <div className="mt-3 space-y-1.5">{priorities.map((id, index) => <div key={`${kind}-priority-${id}`} className="flex items-center justify-between rounded-lg bg-default-100/60 px-2 py-1.5 text-xs"><span><b className="mr-1 text-warning">P{index + 1}</b>{byId.get(id)?.name}</span><span className="flex"><Button isIconOnly size="sm" variant="light" isDisabled={index === 0} onPress={() => move(kind, id, -1)}><LuChevronUp /></Button><Button isIconOnly size="sm" variant="light" isDisabled={index === priorities.length - 1} onPress={() => move(kind, id, 1)}><LuChevronDown /></Button></span></div>)}</div>
    </section>;
  };

  return <>
    <div className="rounded-2xl border border-divider bg-content2/30 p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2"><LuTag className="text-secondary-500" /><div><h4 className="text-sm font-bold">Company Capabilities</h4><p className="text-[11px] text-default-500">Active provided and sought profiles</p></div></div>
        {canEdit ? <Button size="sm" color="secondary" variant="flat" isDisabled={Boolean(pending) || pendingQuery.isLoading} onPress={() => setOpen(true)}>{pending ? "Resolve Pending First" : "Edit Capabilities"}</Button> : null}
      </div>
      {pendingQuery.isLoading ? <div className="grid min-h-16 place-items-center"><Spinner size="sm" /></div> : pending ? <div className="mb-3 rounded-xl border border-warning-300 bg-warning-50/70 p-3 dark:bg-warning-500/10">
        <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-xs font-bold text-warning-700">Pending capability request</p><p className="text-[11px] text-default-500">Requested by {pending.requesterAssociateId?.name || "Company member"} · {dateLabel(pending.createdAt)}</p></div><Chip size="sm" color="warning" variant="flat">Pending Review</Chip></div>
        {pending.note ? <p className="mt-2 text-xs text-default-600">{pending.note}</p> : null}
        <div className="mt-2 grid gap-2 md:grid-cols-2">{renderProfile("REQUESTED PROVIDES", (pending.requestedProvidedFunctionIds || []).map(String), (pending.requestedProvidedFunctionPriorities || []).map(String))}{renderProfile("REQUESTED SEEKING", (pending.requestedSoughtFunctionIds || []).map(String), (pending.requestedSoughtFunctionPriorities || []).map(String))}</div>
        {isAdmin ? <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-end"><Textarea size="sm" minRows={1} label="Decision notes" value={decisionNotes} onValueChange={setDecisionNotes} /><div className="flex gap-2"><Button size="sm" color="danger" variant="flat" isLoading={review.isPending} onPress={() => review.mutate("REJECT")}>Reject</Button><Button size="sm" color="success" isLoading={review.isPending} onPress={() => review.mutate("APPROVE")}>Approve</Button></div></div> : null}
      </div> : null}
      <div className="grid gap-2 md:grid-cols-2">{renderProfile("PROVIDES", activeProvidedIds, activeProvidedPriorities)}{renderProfile("SEEKING", activeSoughtIds, activeSoughtPriorities)}</div>
    </div>

    <Modal isOpen={open} onOpenChange={setOpen} size="4xl" isDismissable={false} scrollBehavior="inside">
      <ModalContent><ModalHeader className="flex flex-col gap-1"><span>Edit Company Capabilities</span><span className="text-xs font-normal text-default-500">Changes apply immediately. Select 1–6 categories and order the top three priorities.</span></ModalHeader><ModalBody>{optionsQuery.isLoading ? <div className="grid min-h-48 place-items-center"><Spinner /></div> : optionsQuery.isError ? <div className="rounded-xl bg-danger-50 p-4 text-sm text-danger-700">Capability options could not be loaded.</div> : <div className="grid gap-3 lg:grid-cols-2">{renderEditor("provided")}{renderEditor("sought")}</div>}</ModalBody><ModalFooter><Button variant="light" onPress={() => setOpen(false)} isDisabled={save.isPending}>Cancel</Button><Button color="warning" isLoading={save.isPending} isDisabled={!providedIds.length || !soughtIds.length || Boolean(pending)} onPress={() => save.mutate()}>Save Changes</Button></ModalFooter></ModalContent>
    </Modal>
  </>;
}
