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
import { FiArchive, FiCheckCircle, FiChevronDown, FiClock, FiEdit3, FiMapPin, FiSearch, FiUser, FiZap } from "react-icons/fi";
import { getData, patchData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { toast } from "react-toastify";
import { detectOffPlatformDisclosure } from "@/utils/offPlatformDisclosure";
import { useCurrency } from "@/context/CurrencyContext";
import { useSearchParams } from "next/navigation";

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
  awardedAmount?: number | null;
  awardedNote?: string | null;
  bidCount: number;
  createdAt?: string | null;
  updatedAt?: string | null;
  committedAt?: string | null;
};

const companyId = (company: Company | string | null | undefined) =>
  String(typeof company === "object" && company ? company._id : company || "");
const companyName = (company: Company | string | null | undefined) =>
  typeof company === "object" && company ? company.name || company.companyName || "Provider" : "Provider";
const humanize = (value: string | null | undefined) => String(value || "").split("_").join(" ");
const formatTimestamp = (value?: string | null) => value ? new Date(value).toLocaleString() : "—";

const phasePresentation: Record<BiddingPhase, { label: string; color: "warning" | "success" | "default" | "danger" }> = {
  UPCOMING: { label: "Opens soon", color: "default" },
  OPEN: { label: "Open for bids", color: "warning" },
  CLOSED: { label: "Bidding closed", color: "default" },
  AWARDED: { label: "Provider selected", color: "success" },
  CANCELLED: { label: "Cancelled", color: "danger" },
};

function ProviderBidForm({ item }: { item: ExecutionBidOpportunity }) {
  const queryClient = useQueryClient();
  const { formatRate } = useCurrency();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const noteViolation = detectOffPlatformDisclosure(note, {
    companyNames: [item.ownBid?.company ? companyName(item.ownBid.company) : ""],
  });
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
        <span className="font-semibold">Your bid:</span> {formatRate(item.ownBid.amount)} · {humanize(item.ownBid.status)}
      </div>
    ) : null;
  }

  return (
    <div className="rounded-2xl border border-warning-200 bg-warning-50/40 p-4 dark:bg-warning-900/10">
      <h4 className="mb-3 text-sm font-bold">{item.ownBid ? "Update your bid" : "Submit your bid"}</h4>
      <div className="grid gap-3 md:grid-cols-[minmax(180px,0.5fr)_minmax(280px,1fr)_auto] md:items-start">
        <Input
          label="Bid amount"
          labelPlacement="outside"
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onValueChange={setAmount}
          isInvalid={!!error && !(Number(amount) > 0)}
          classNames={{ inputWrapper: "h-12 min-h-12" }}
        />
        <Textarea
          label="Note (optional)"
          labelPlacement="outside"
          maxLength={500}
          minRows={1}
          maxRows={1}
          value={note}
          onValueChange={setNote}
          description={`${note.length}/500`}
          isInvalid={Boolean(noteViolation)}
          errorMessage={noteViolation?.message}
          classNames={{ inputWrapper: "h-12 min-h-12", input: "min-h-6 resize-none" }}
        />
        <Button color="warning" className="h-12 w-full font-bold md:mt-6 md:w-auto" isLoading={mutation.isPending} onPress={() => {
          if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) return setError("Enter a valid amount greater than zero.");
          if (noteViolation) return setError(noteViolation.message);
          setError("");
          mutation.mutate();
        }} isDisabled={Boolean(noteViolation)}>{item.ownBid ? "Update bid" : "Submit bid"}</Button>
      </div>
      {error && <p role="alert" className="mt-2 text-sm font-medium text-danger">{error}</p>}
      {item.ownBid && <p className="mt-2 text-xs text-default-500">You can revise this bid until the bidding window closes.</p>}
    </div>
  );
}

function OperatorActions({ item }: { item: ExecutionBidOpportunity }) {
  const queryClient = useQueryClient();
  const { formatRate } = useCurrency();
  const bids = item.bids || [];
  const candidates = item.candidates || [];
  const [bidProvider, setBidProvider] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [awardBid, setAwardBid] = useState<Bid | null>(null);
  const [labProfileId, setLabProfileId] = useState("");
  const [error, setError] = useState("");
  const [showProxyForm, setShowProxyForm] = useState(false);
  const representedProvider = candidates.find((candidate) => companyId(candidate) === bidProvider);
  const noteViolation = detectOffPlatformDisclosure(note, {
    companyNames: [representedProvider ? companyName(representedProvider) : ""],
  });
  const awardCompanyId = companyId(awardBid?.company);
  const facilitiesQuery = useQuery({ queryKey: ["award-lab-facilities", awardCompanyId], queryFn: async () => (await getData(apiRoutes.labProfiles.providerFacilities(awardCompanyId))).data.data || [], enabled: Boolean(awardBid && item.serviceType === "QUALITY_TESTING" && awardCompanyId) });
  const facilities: any[] = useMemo(() => facilitiesQuery.data || [], [facilitiesQuery.data]);
  useEffect(() => { setLabProfileId(facilities.length === 1 ? facilities[0]._id : ""); }, [facilities]);
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
    <div className="space-y-3">
      {bids.length > 0 ? <div className="overflow-x-auto rounded-xl border border-divider">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-default-100 text-xs  text-default-500"><tr><th className="p-3">Provider</th><th className="p-3">Amount</th><th className="p-3">Note</th><th className="p-3">Status</th><th className="p-3">Action</th></tr></thead>
          <tbody>{bids.map((bid) => <tr key={companyId(bid.company)} className="border-t border-divider">
            <td className="p-3 font-semibold">{companyName(bid.company)}</td><td className="p-3 font-bold text-warning-600">{formatRate(bid.amount)}</td><td className="max-w-[240px] whitespace-normal break-words p-3 text-default-500">{bid.note || "—"}</td><td className="p-3">{humanize(bid.status)}</td>
            <td className="p-3"><Button size="sm" color="success" variant="flat" isDisabled={item.phase !== "OPEN" || bid.status !== "SUBMITTED"} onPress={() => setAwardBid(bid)}>Select winner</Button></td>
          </tr>)}</tbody>
        </table>
      </div> : <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-divider px-4 py-3 text-sm text-default-500"><span>No provider bids submitted yet.</span><span className="text-xs font-semibold">0 bids</span></div>}

      {item.phase === "OPEN" && <Button size="sm" variant="flat" className="font-semibold" startContent={<FiEdit3 />} endContent={<FiChevronDown className={showProxyForm ? "rotate-180 transition-transform" : "transition-transform"} />} onPress={() => setShowProxyForm((value) => !value)}>
        {showProxyForm ? "Hide provider bid form" : "Add bid on behalf of provider"}
      </Button>}

      {item.phase === "OPEN" && showProxyForm && <div className="grid gap-3 rounded-xl bg-default-100 p-4 sm:grid-cols-2 xl:grid-cols-[1fr_0.65fr_1fr_auto] xl:items-end">
        <Autocomplete label="Bid on behalf of" selectedKey={bidProvider} onSelectionChange={(key) => setBidProvider(String(key || ""))} items={candidates}>
          {(candidate) => <AutocompleteItem key={candidate._id}>{companyName(candidate)}</AutocompleteItem>}
        </Autocomplete>
        <Input label="Amount" type="number" min="0.01" value={amount} onValueChange={setAmount} />
        <Input label="Note (optional)" maxLength={500} value={note} onValueChange={setNote} isInvalid={Boolean(noteViolation)} errorMessage={noteViolation?.message} />
        <Button color="warning" isLoading={mutation.isPending && !awardBid} onPress={() => {
          if (!bidProvider) return setError("Select an invited provider.");
          if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) return setError("Enter a valid amount greater than zero.");
          if (noteViolation) return setError(noteViolation.message);
          mutation.mutate({ bidCompanyId: bidProvider, bidAmount: Number(amount), commitNote: note.trim() });
        }} isDisabled={Boolean(noteViolation)}>Save bid</Button>
      </div>}
      {error && <p role="alert" className="text-sm font-medium text-danger">{error}</p>}

      <Modal isOpen={!!awardBid} onOpenChange={(open) => !open && setAwardBid(null)}>
        <ModalContent>{(onClose) => <>
          <ModalHeader>Select this provider?</ModalHeader>
          <ModalBody>
            <p>This will award <strong>{companyName(awardBid?.company)}</strong> the work at <strong>{awardBid ? formatRate(awardBid.amount) : "—"}</strong>, close bidding, and mark all other bids as not selected.</p>
            {awardBid?.note && <p className="rounded-lg bg-default-100 p-3 text-sm">{awardBid.note}</p>}
            {item.serviceType === "QUALITY_TESTING" ? <Select label="Laboratory facility" isRequired isLoading={facilitiesQuery.isLoading} selectedKeys={labProfileId ? [labProfileId] : []} onSelectionChange={(keys) => setLabProfileId(keys === "all" ? "" : String(Array.from(keys)[0] || ""))}>{facilities.map((facility) => <SelectItem key={facility._id} textValue={facility.published?.displayName || "Laboratory"}>{facility.published?.displayName || "Laboratory"}{facility.published?.city ? ` · ${facility.published.city}` : ""}</SelectItem>)}</Select> : null}
          </ModalBody>
          <ModalFooter><Button variant="light" onPress={onClose}>Go back</Button><Button color="success" isLoading={mutation.isPending} isDisabled={item.serviceType === "QUALITY_TESTING" && (!labProfileId || facilitiesQuery.isLoading)} onPress={() => mutation.mutate({ committedProvider: companyId(awardBid?.company), ...(item.serviceType === "QUALITY_TESTING" ? { labProfileId } : {}) })}>Confirm winner</Button></ModalFooter>
        </>}</ModalContent>
      </Modal>
    </div>
  );
}

export default function ExecutionBiddingPanel({ user }: { user: any }) {
  const searchParams = useSearchParams();
  const initialView = searchParams.get("view") === "history" ? "history" : "active";
  const focusedEnquiryId = searchParams.get("enquiryId") || "";
  const [view, setView] = useState<"active" | "history">(initialView);
  const [search, setSearch] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [location, setLocation] = useState("");
  const role = String(user?.role || "").toLowerCase();
  const operatorView = role === "admin" || role === "operator" || role === "team";
  const { formatRate } = useCurrency();
  const params = useMemo(() => ({ state: view, search, serviceType, location, enquiryId: focusedEnquiryId }), [view, search, serviceType, location, focusedEnquiryId]);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["execution-bids", params],
    queryFn: () => getData(apiRoutes.enquiry.executionBids, params),
  });
  const items: ExecutionBidOpportunity[] = Array.isArray(data?.data?.data) ? data.data.data : Array.isArray(data?.data) ? data.data : [];

  return <div className="space-y-4">
    <div className="rounded-2xl border border-divider bg-content1 p-4 shadow-sm md:p-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div><h2 className="text-xl font-black tracking-tight">{operatorView ? "Manage service bids" : "Your service opportunities"}</h2><p className="mt-1 text-sm text-default-500">{operatorView ? "Review open offers or inspect completed bidding history." : "Only currently open opportunities matched to your company are shown."}</p></div>
        <div className="flex rounded-xl bg-default-100 p-1" aria-label="Bidding views">
          <Button size="sm" variant={view === "active" ? "solid" : "light"} color={view === "active" ? "warning" : "default"} onPress={() => setView("active")} startContent={<FiZap />}>Active</Button>
          <Button size="sm" variant={view === "history" ? "solid" : "light"} color={view === "history" ? "warning" : "default"} onPress={() => setView("history")} startContent={<FiArchive />}>History</Button>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Input aria-label="Search opportunities" placeholder="Search product or reference" startContent={<FiSearch />} value={search} onValueChange={setSearch} />
        <Select aria-label="Filter by service" placeholder="All service types" selectedKeys={serviceType ? [serviceType] : []} onSelectionChange={(keys) => setServiceType(String(Array.from(keys)[0] || ""))}>
          {['PROCUREMENT','TRANSPORTATION','SHIPPING','PACKAGING','QUALITY_TESTING','CERTIFICATION','WAREHOUSE'].map((type) => <SelectItem key={type}>{humanize(type)}</SelectItem>)}
        </Select>
        <Input aria-label="Filter by location" placeholder="Origin, destination, or route" startContent={<FiMapPin />} value={location} onValueChange={setLocation} />
      </div>
    </div>

    {isLoading && <div className="py-20 text-center text-sm text-default-500">Loading matched opportunities…</div>}
    {isError && <div className="rounded-2xl border border-danger-200 p-8 text-center"><p className="mb-3 text-danger">Bidding opportunities could not be loaded.</p><Button onPress={() => refetch()}>Try again</Button></div>}
    {!isLoading && !isError && items.length === 0 && <div className="rounded-2xl border border-dashed border-divider py-12 text-center"><FiCheckCircle className="mx-auto mb-3 text-3xl text-default-300"/><h3 className="font-bold">{search || serviceType || location ? "No matching opportunities" : view === "active" ? "No open bids right now" : "No bidding history yet"}</h3><p className="mt-1 text-sm text-default-500">{search || serviceType || location ? "Adjust or clear the filters to see other work." : view === "active" ? "Only opportunities accepting bids appear here." : "Upcoming, closed, awarded, and cancelled work will appear here."}</p></div>}

    <div className="space-y-3">{items.map((item) => {
      const phase = phasePresentation[item.phase];
      const awardedBid = item.bids?.find((bid) => bid.status === "AWARDED");
      const routeParts = [item.route.from, item.route.to].filter(Boolean);
      return <article key={item.id} className="rounded-2xl border border-divider bg-content1 p-4 shadow-sm md:p-5">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
          <div className="min-w-0"><div className="mb-2 flex flex-wrap items-center gap-2"><Chip color={phase.color} variant="flat" size="sm">{phase.label}</Chip><span className="text-xs font-semibold text-default-400">#{item.enquiryCode}</span><span className="text-xs font-semibold text-default-500">{item.bidCount} {item.bidCount === 1 ? "bid" : "bids"}</span>{operatorView && item.matchLevel && <Chip size="sm" variant="bordered">Match: {humanize(item.matchLevel)}</Chip>}</div><div className="flex flex-wrap items-baseline gap-x-3 gap-y-1"><h3 className="text-lg font-black">{item.title}</h3><p className="font-medium text-default-600">{item.product}</p></div></div>
          <div className="min-w-0 text-sm text-default-500 lg:max-w-[46%] lg:text-right">{routeParts.length > 0 && <div className="flex items-start gap-2 lg:justify-end"><FiMapPin className="mt-0.5 shrink-0"/><span className="break-words">{routeParts.join(" → ")}</span></div>}{item.phase === "OPEN" && item.biddingClosesAtStage && <div className="mt-1 flex items-center gap-2 lg:justify-end"><FiClock className="shrink-0"/><span>Closes at <strong>{humanize(item.biddingClosesAtStage)}</strong></span></div>}</div>
        </div>
        {(item.route.notes || item.requirements.packagingSpecifications || item.requirements.segmentLabel) && <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 rounded-xl bg-default-50 px-3 py-2 text-xs text-default-600">{item.requirements.segmentLabel && <p><strong>Segment:</strong> {item.requirements.segmentLabel}</p>}{item.requirements.packagingSpecifications && <p><strong>Packaging:</strong> {item.requirements.packagingSpecifications}</p>}{item.route.notes && <p><strong>Route:</strong> {item.route.notes}</p>}</div>}
        {view === "history" && <div className="mt-3 grid gap-3 rounded-xl border border-divider bg-default-50 p-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div><p className="text-xs text-default-400">Selected provider</p><p className="mt-0.5 flex items-center gap-1 font-semibold"><FiUser />{item.committedProvider ? companyName(item.committedProvider) : "Not selected"}</p></div>
          <div><p className="text-xs text-default-400">Awarded amount</p><p className="mt-0.5 font-semibold">{typeof item.awardedAmount === "number" ? formatRate(item.awardedAmount) : awardedBid ? formatRate(awardedBid.amount) : "—"}</p>{(item.awardedNote || awardedBid?.note) && <p className="mt-1 break-words text-xs text-default-500">{item.awardedNote || awardedBid?.note}</p>}</div>
          <div><p className="text-xs text-default-400">Created</p><p className="mt-0.5 font-semibold">{formatTimestamp(item.createdAt)}</p><p className="mt-1 text-xs text-default-500">Updated {formatTimestamp(item.updatedAt)}</p></div>
          <div><p className="text-xs text-default-400">Awarded / completed</p><p className="mt-0.5 font-semibold">{formatTimestamp(item.committedAt)}</p><p className="mt-1 text-xs text-default-500">Current stage: {humanize(item.currentStage) || "—"}</p></div>
        </div>}
        <div className="mt-3">{operatorView ? <OperatorActions item={item}/> : <ProviderBidForm item={item}/>}</div>
      </article>;
    })}</div>
  </div>;
}
