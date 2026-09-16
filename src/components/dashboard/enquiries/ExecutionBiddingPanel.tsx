"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Textarea,
} from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiArchive, FiCheckCircle, FiClock, FiMapPin, FiSearch, FiShield, FiZap } from "react-icons/fi";
import { getData, patchData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { toast } from "react-toastify";

type BiddingPhase = "UPCOMING" | "OPEN" | "CLOSED" | "AWARDED" | "CANCELLED";
type Company = { _id: string; name?: string; companyName?: string };
type Bid = { company: Company | string; amount: number; note?: string; status: string; updatedAt?: string };

export type ExecutionBidOpportunity = {
  id: string;
  taskId: string;
  enquiryId: string;
  enquiryCode: string;
  product: string;
  serviceType: string;
  title: string;
  route: { from: string; to: string; notes: string };
  requirements: { packagingSpecifications?: string | null; segmentLabel?: string | null };
  phase: BiddingPhase;
  status: string;
  currentStage: string;
  biddingStartsAtStage?: string | null;
  biddingClosesAtStage?: string | null;
  matchLevel?: "district" | "state" | "country" | "capability_fallback";
  ownBid?: Bid | null;
  bids?: Bid[];
  candidates?: Company[];
  committedProvider?: Company | null;
};

const companyId = (company: Company | string | null | undefined) =>
  String(typeof company === "object" && company ? company._id : company || "");
const companyName = (company: Company | string | null | undefined) =>
  typeof company === "object" && company ? company.name || company.companyName || "Provider" : "Provider";
const humanize = (value: string | null | undefined) => String(value || "").split("_").join(" ");

const phasePresentation: Record<BiddingPhase, { label: string; color: "warning" | "success" | "default" | "danger" }> = {
  UPCOMING: { label: "Opens soon", color: "default" },
  OPEN: { label: "Open for bids", color: "warning" },
  CLOSED: { label: "Bidding closed", color: "default" },
  AWARDED: { label: "Provider selected", color: "success" },
  CANCELLED: { label: "Cancelled", color: "danger" },
};

function ProviderBidForm({ item }: { item: ExecutionBidOpportunity }) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    setAmount(item.ownBid?.amount ? String(item.ownBid.amount) : "");
    setNote(item.ownBid?.note || "");
  }, [item.id, item.ownBid?.amount, item.ownBid?.note]);

  const mutation = useMutation({
    mutationFn: () => patchData(`${apiRoutes.enquiry.getAll}/${item.enquiryId}/execution-inquiries/${item.serviceType}`, {
      taskId: item.taskId,
      bidAmount: Number(amount),
      commitNote: note.trim(),
    }),
    onSuccess: () => {
      setError("");
      toast.success(item.ownBid ? "Your bid was updated." : "Your bid was submitted.");
      queryClient.invalidateQueries({ queryKey: ["execution-bids"] });
    },
    onError: (err: any) => setError(err?.response?.data?.message || "We could not save your bid. Please try again."),
  });

  if (item.phase !== "OPEN") {
    return item.ownBid ? (
      <div className="rounded-xl bg-default-100 p-4 text-sm">
        <span className="font-semibold">Your bid:</span> {item.ownBid.amount} · {item.ownBid.status}
      </div>
    ) : null;
  }

  return (
    <div className="rounded-2xl border border-warning-200 bg-warning-50/40 p-4 dark:bg-warning-900/10">
      <h4 className="mb-3 text-sm font-bold">{item.ownBid ? "Update your bid" : "Submit your bid"}</h4>
      <div className="grid gap-3 md:grid-cols-[minmax(160px,0.5fr)_1fr_auto] md:items-end">
        <Input label="Bid amount" type="number" min="0.01" step="0.01" value={amount} onValueChange={setAmount} isInvalid={!!error && !(Number(amount) > 0)} />
        <Textarea label="Note (optional)" maxLength={500} minRows={1} value={note} onValueChange={setNote} description={`${note.length}/500`} />
        <Button color="warning" className="font-bold" isLoading={mutation.isPending} onPress={() => {
          if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) return setError("Enter a valid amount greater than zero.");
          setError("");
          mutation.mutate();
        }}>{item.ownBid ? "Update bid" : "Submit bid"}</Button>
      </div>
      {error && <p role="alert" className="mt-2 text-sm font-medium text-danger">{error}</p>}
      {item.ownBid && <p className="mt-2 text-xs text-default-500">You can revise this bid until the bidding window closes.</p>}
    </div>
  );
}

function OperatorActions({ item }: { item: ExecutionBidOpportunity }) {
  const queryClient = useQueryClient();
  const bids = item.bids || [];
  const candidates = item.candidates || [];
  const [bidProvider, setBidProvider] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [awardBid, setAwardBid] = useState<Bid | null>(null);
  const [error, setError] = useState("");
  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => patchData(`${apiRoutes.enquiry.getAll}/${item.enquiryId}/execution-inquiries/${item.serviceType}`, { taskId: item.taskId, ...payload }),
    onSuccess: () => {
      toast.success(awardBid ? "Provider selected and bidding closed." : "Provider bid saved.");
      setAwardBid(null);
      setError("");
      queryClient.invalidateQueries({ queryKey: ["execution-bids"] });
    },
    onError: (err: any) => setError(err?.response?.data?.message || "The action could not be completed."),
  });

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-divider">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-default-100 text-xs uppercase text-default-500"><tr><th className="p-3">Provider</th><th className="p-3">Amount</th><th className="p-3">Note</th><th className="p-3">Status</th><th className="p-3">Action</th></tr></thead>
          <tbody>{bids.length ? bids.map((bid) => <tr key={companyId(bid.company)} className="border-t border-divider">
            <td className="p-3 font-semibold">{companyName(bid.company)}</td><td className="p-3 font-bold text-warning-600">{bid.amount}</td><td className="max-w-[240px] p-3 text-default-500">{bid.note || "—"}</td><td className="p-3">{humanize(bid.status)}</td>
            <td className="p-3"><Button size="sm" color="success" variant="flat" isDisabled={item.phase !== "OPEN" || bid.status !== "SUBMITTED"} onPress={() => setAwardBid(bid)}>Select winner</Button></td>
          </tr>) : <tr><td colSpan={5} className="p-6 text-center text-default-500">No bids have been submitted.</td></tr>}</tbody>
        </table>
      </div>

      {item.phase === "OPEN" && <div className="grid gap-3 rounded-xl bg-default-100 p-4 md:grid-cols-[1fr_0.6fr_1fr_auto] md:items-end">
        <Autocomplete label="Bid on behalf of" selectedKey={bidProvider} onSelectionChange={(key) => setBidProvider(String(key || ""))} items={candidates}>
          {(candidate) => <AutocompleteItem key={candidate._id}>{companyName(candidate)}</AutocompleteItem>}
        </Autocomplete>
        <Input label="Amount" type="number" min="0.01" value={amount} onValueChange={setAmount} />
        <Input label="Note (optional)" maxLength={500} value={note} onValueChange={setNote} />
        <Button color="warning" isLoading={mutation.isPending && !awardBid} onPress={() => {
          if (!bidProvider) return setError("Select an invited provider.");
          if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) return setError("Enter a valid amount greater than zero.");
          mutation.mutate({ bidCompanyId: bidProvider, bidAmount: Number(amount), commitNote: note.trim() });
        }}>Save bid</Button>
      </div>}
      {error && <p role="alert" className="text-sm font-medium text-danger">{error}</p>}

      <Modal isOpen={!!awardBid} onOpenChange={(open) => !open && setAwardBid(null)}>
        <ModalContent>{(onClose) => <>
          <ModalHeader>Select this provider?</ModalHeader>
          <ModalBody>
            <p>This will award <strong>{companyName(awardBid?.company)}</strong> the work at <strong>{awardBid?.amount}</strong>, close bidding, and mark all other bids as not selected.</p>
            {awardBid?.note && <p className="rounded-lg bg-default-100 p-3 text-sm">{awardBid.note}</p>}
          </ModalBody>
          <ModalFooter><Button variant="light" onPress={onClose}>Go back</Button><Button color="success" isLoading={mutation.isPending} onPress={() => mutation.mutate({ committedProvider: companyId(awardBid?.company) })}>Confirm winner</Button></ModalFooter>
        </>}</ModalContent>
      </Modal>
    </div>
  );
}

export default function ExecutionBiddingPanel({ user }: { user: any }) {
  const [view, setView] = useState<"active" | "history">("active");
  const [search, setSearch] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [location, setLocation] = useState("");
  const role = String(user?.role || "").toLowerCase();
  const operatorView = role === "admin" || role === "operator" || role === "team";
  const params = useMemo(() => ({ state: view, search, serviceType, location }), [view, search, serviceType, location]);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["execution-bids", params],
    queryFn: () => getData(apiRoutes.enquiry.executionBids, params),
  });
  const items: ExecutionBidOpportunity[] = Array.isArray(data?.data?.data) ? data.data.data : Array.isArray(data?.data) ? data.data : [];

  return <div className="space-y-6">
    <div className="rounded-3xl border border-divider bg-content1 p-5 shadow-sm md:p-7">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div><h2 className="text-2xl font-black tracking-tight">{operatorView ? "Manage service bids" : "Your service opportunities"}</h2><p className="mt-1 text-sm text-default-500">{operatorView ? "Compare submitted offers and select the right provider." : "Only opportunities matched to your company’s services and route are shown."}</p></div>
        <div className="flex rounded-xl bg-default-100 p-1" aria-label="Bidding views">
          <Button size="sm" variant={view === "active" ? "solid" : "light"} color={view === "active" ? "warning" : "default"} onPress={() => setView("active")} startContent={<FiZap />}>Active</Button>
          <Button size="sm" variant={view === "history" ? "solid" : "light"} color={view === "history" ? "warning" : "default"} onPress={() => setView("history")} startContent={<FiArchive />}>History</Button>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <Input aria-label="Search opportunities" placeholder="Search product or reference" startContent={<FiSearch />} value={search} onValueChange={setSearch} />
        <Select aria-label="Filter by service" placeholder="All service types" selectedKeys={serviceType ? [serviceType] : []} onSelectionChange={(keys) => setServiceType(String(Array.from(keys)[0] || ""))}>
          {['PROCUREMENT','TRANSPORTATION','SHIPPING','PACKAGING','QUALITY_TESTING','CERTIFICATION','WAREHOUSE'].map((type) => <SelectItem key={type}>{humanize(type)}</SelectItem>)}
        </Select>
        <Input aria-label="Filter by location" placeholder="Origin, destination, or route" startContent={<FiMapPin />} value={location} onValueChange={setLocation} />
      </div>
    </div>

    {isLoading && <div className="py-20 text-center text-sm text-default-500">Loading matched opportunities…</div>}
    {isError && <div className="rounded-2xl border border-danger-200 p-8 text-center"><p className="mb-3 text-danger">Bidding opportunities could not be loaded.</p><Button onPress={() => refetch()}>Try again</Button></div>}
    {!isLoading && !isError && items.length === 0 && <div className="rounded-3xl border border-dashed border-divider py-20 text-center"><FiCheckCircle className="mx-auto mb-3 text-3xl text-default-300"/><h3 className="font-bold">{view === "active" ? "No active opportunities" : "No bidding history yet"}</h3><p className="mt-1 text-sm text-default-500">{view === "active" ? "New work matched to your services will appear here." : "Completed and closed opportunities will appear here."}</p></div>}

    <div className="space-y-5">{items.map((item) => {
      const phase = phasePresentation[item.phase];
      return <article key={item.id} className="rounded-3xl border border-divider bg-content1 p-5 shadow-sm md:p-7">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div><div className="mb-2 flex flex-wrap items-center gap-2"><Chip color={phase.color} variant="flat" size="sm">{phase.label}</Chip><span className="text-xs font-semibold text-default-400">#{item.enquiryCode}</span>{operatorView && <Chip size="sm" variant="bordered">Match: {humanize(item.matchLevel)}</Chip>}</div><h3 className="text-xl font-black">{item.title}</h3><p className="mt-1 font-medium text-default-600">{item.product}</p></div>
          <div className="max-w-sm text-sm text-default-500"><div className="flex items-center gap-2"><FiMapPin/><span>{item.route.from || "Origin not specified"} → {item.route.to || "Destination not specified"}</span></div>{item.biddingClosesAtStage && <div className="mt-2 flex items-center gap-2"><FiClock/><span>Closes when order reaches <strong>{humanize(item.biddingClosesAtStage)}</strong></span></div>}</div>
        </div>
        {(item.route.notes || item.requirements.packagingSpecifications || item.requirements.segmentLabel) && <div className="my-5 grid gap-2 rounded-xl bg-default-50 p-4 text-sm text-default-600">{item.requirements.segmentLabel && <p><strong>Segment:</strong> {item.requirements.segmentLabel}</p>}{item.requirements.packagingSpecifications && <p><strong>Packaging:</strong> {item.requirements.packagingSpecifications}</p>}{item.route.notes && <p><strong>Route notes:</strong> {item.route.notes}</p>}</div>}
        <div className="mt-5">{operatorView ? <OperatorActions item={item}/> : <ProviderBidForm item={item}/>}</div>
      </article>;
    })}</div>
  </div>;
}
