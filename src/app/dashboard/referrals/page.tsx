"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, CardBody, Chip, Input, Pagination, Skeleton } from "@nextui-org/react";
import { FiCheck, FiCopy, FiLink, FiMail, FiSend, FiUsers } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { apiRoutes } from "@/core/api/apiRoutes";
import { getData, postData } from "@/core/api/apiHandler";
import { useCurrency } from "@/context/CurrencyContext";
import { showToastMessage } from "@/utils/utils";

type Channel = "EMAIL" | "WHATSAPP" | "LINK";
const formatDate = (value: unknown) => value ? new Date(String(value)).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const newKey = () => typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const statusColor = (status: string) => status === "EARNED" ? "success" : status === "ACTIVE" ? "primary" : status === "JOINED" ? "secondary" : "default";

export default function AssociateReferralsPage() {
  const { formatRate } = useCurrency();
  const client = useQueryClient();
  const [page, setPage] = useState(1);
  const [channel, setChannel] = useState<Channel>("EMAIL");
  const [recipientName, setRecipientName] = useState("");
  const [destination, setDestination] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState(newKey);
  const query = useQuery({ queryKey: ["associate-referrals", page], queryFn: () => getData(apiRoutes.associateReferrals.dashboard, { page, limit: 20 }), refetchOnWindowFocus: false });
  const data = query.data?.data?.data || {}, summary = data.summary || {};
  const referrals = useMemo(() => Array.isArray(data.referrals) ? data.referrals : [], [data.referrals]);
  const invitations = useMemo(() => Array.isArray(data.invitations) ? data.invitations : [], [data.invitations]);
  const earnings = useMemo(() => Array.isArray(data.earnings) ? data.earnings : [], [data.earnings]);
  const code = String(data.company?.referralCode || ""), rewardPercent = Number(data.rewardPercent ?? 10);
  const referralUrl = typeof window === "undefined" || !code ? "" : `${window.location.origin}/auth/register?role=associate&ref=${code}`;
  const copy = async (value: string, label: string) => { await navigator.clipboard.writeText(value); showToastMessage({ type: "success", message: `${label} copied.` }); };

  const invite = useMutation({
    mutationFn: () => postData(apiRoutes.associateReferrals.invitations, { recipientName: recipientName.trim(), channel, destination: channel === "LINK" ? "" : destination.trim(), idempotencyKey }),
    onSuccess: async (response: any) => {
      const result = response?.data?.data || {}, rawUrl = String(result.invitationUrl || result.registrationPath || "");
      const url = rawUrl.startsWith("/") ? `${window.location.origin}${rawUrl}` : rawUrl;
      const message = `Hi ${recipientName.trim()}, join ${data.company?.name || "our company"} on OBAOL using this personal invitation: ${url}\n\nAfter approval and activation, direct referrals can share in ${rewardPercent}% of OBAOL's realized profit from eligible later completed trades.`;
      if (channel === "EMAIL") window.location.href = `mailto:${encodeURIComponent(destination.trim())}?subject=${encodeURIComponent("Your OBAOL invitation")}&body=${encodeURIComponent(message)}`;
      else if (channel === "WHATSAPP") window.location.href = `https://wa.me/${destination.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
      else await copy(url, "Personal invitation link");
      setRecipientName(""); setDestination(""); setIdempotencyKey(newKey());
      await client.invalidateQueries({ queryKey: ["associate-referrals"] });
    },
    onError: (error: any) => showToastMessage({ type: "error", message: error?.response?.data?.message || "Invitation could not be created." }),
  });
  const canInvite = Boolean(recipientName.trim() && (channel === "LINK" || destination.trim()));

  if (query.isLoading) return <div className="space-y-4 p-6"><Skeleton className="h-40 rounded-2xl" /><Skeleton className="h-80 rounded-2xl" /></div>;
  if (query.isError) return <div className="p-6 text-danger">Unable to load referral information.</div>;

  return <div className="w-full space-y-5 p-4 md:p-6">
    <div><h1 className="text-2xl font-bold">Referrals &amp; Earnings</h1><p className="text-sm text-default-500">Invite companies, follow their progress, and earn from eligible completed trades.</p></div>
    <Card className="overflow-hidden border border-primary-200/70 bg-gradient-to-br from-primary-50/80 to-background"><CardBody className="gap-6 p-5 md:p-7"><div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
      <div><Chip color="success" variant="flat" className="font-bold">Direct referral reward</Chip><h2 className="mt-3 text-3xl font-black">Share in {rewardPercent}% of OBAOL&apos;s realized profit</h2><p className="mt-3 text-sm leading-6 text-default-600">Your directly referred company must be approved and become active through its first live listing or real inquiry. Rewards apply to eligible later completed trades. When several eligible referrers participate in one trade, the {rewardPercent}% pool is divided between them.</p><div className="mt-5 flex flex-wrap items-center gap-2"><span className="rounded-xl bg-background px-3 py-2 font-black tracking-[0.16em] shadow-sm">{code || "—"}</span><Button size="sm" variant="flat" startContent={<FiCopy />} isDisabled={!code} onPress={() => copy(code, "Code")}>Copy code</Button><Button size="sm" variant="flat" startContent={<FiLink />} isDisabled={!referralUrl} onPress={() => copy(referralUrl, "Generic referral link")}>Generic link</Button></div></div>
      <div className="rounded-2xl border border-default-200 bg-background p-4 shadow-sm md:p-5"><div className="flex items-center gap-2"><FiSend /><h2 className="font-bold">Invite someone</h2></div><p className="mt-1 text-xs text-default-500">We create a personal link so you can track when they join and become active.</p><div className="mt-4 flex flex-wrap gap-2" aria-label="Invitation channel"><Button size="sm" color={channel === "EMAIL" ? "primary" : "default"} variant={channel === "EMAIL" ? "solid" : "flat"} startContent={<FiMail />} onPress={() => setChannel("EMAIL")}>Email</Button><Button size="sm" color={channel === "WHATSAPP" ? "success" : "default"} variant={channel === "WHATSAPP" ? "solid" : "flat"} startContent={<FaWhatsapp />} onPress={() => setChannel("WHATSAPP")}>WhatsApp</Button><Button size="sm" color={channel === "LINK" ? "primary" : "default"} variant={channel === "LINK" ? "solid" : "flat"} startContent={<FiLink />} onPress={() => setChannel("LINK")}>Personal link</Button></div><div className="mt-4 grid gap-3 md:grid-cols-2"><Input label="Person or company name" labelPlacement="outside" placeholder="Who are you inviting?" value={recipientName} onValueChange={setRecipientName} isRequired />{channel !== "LINK" && <Input label={channel === "EMAIL" ? "Email address" : "WhatsApp number"} labelPlacement="outside" type={channel === "EMAIL" ? "email" : "tel"} placeholder={channel === "EMAIL" ? "name@company.com" : "+91 98765 43210"} description={channel === "WHATSAPP" ? "Include the international country code" : undefined} value={destination} onValueChange={setDestination} isRequired />}</div><Button className="mt-4 w-full font-bold" color="primary" startContent={channel === "WHATSAPP" ? <FaWhatsapp /> : channel === "EMAIL" ? <FiMail /> : <FiCopy />} isDisabled={!canInvite} isLoading={invite.isPending} onPress={() => invite.mutate()}>{channel === "EMAIL" ? "Open email invitation" : channel === "WHATSAPP" ? "Open WhatsApp invitation" : "Copy personal invitation"}</Button><p className="mt-2 text-center text-[11px] text-default-400">OBAOL records the share attempt; delivery is handled by your email or WhatsApp app.</p></div>
    </div></CardBody></Card>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[["Total referrals", summary.totalReferrals || 0], ["Active", summary.activeReferrals || 0], ["Pending activation", summary.pendingActivation || 0], ["Total earnings", formatRate(Number(summary.totalEarnings || 0))]].map(([label, value]) => <Card key={String(label)}><CardBody><p className="text-xs text-default-500">{label}</p><p className="text-xl font-semibold">{value}</p></CardBody></Card>)}</div>
    <Card><CardBody className="gap-4 p-5 md:p-6"><div className="flex items-center justify-between gap-3"><div><div className="flex items-center gap-2"><FiUsers /><h2 className="font-semibold">People you invited</h2></div><p className="mt-1 text-xs text-default-500">Invited → Joined → Active → Earned</p></div><span className="text-xs text-default-500">{invitations.length} tracked</span></div>{!invitations.length ? <p className="rounded-xl bg-default-50 p-5 text-sm text-default-500">No personal invitations yet. Invite someone above to start tracking their progress.</p> : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{invitations.map((row: any) => <div key={row.id} className="rounded-2xl border border-default-200 p-4"><div className="flex items-start justify-between gap-2"><div><p className="font-bold">{row.recipientName}</p><p className="text-xs text-default-500">{row.destination || "Personal link"}</p></div><Chip size="sm" color={statusColor(row.status) as any} variant="flat">{row.status}</Chip></div><div className="mt-3 flex items-center justify-between text-xs text-default-500"><span>{String(row.channel).replace("WHATSAPP", "WhatsApp")}</span><span>{formatDate(row.createdAt)}</span></div>{row.company?.name && <p className="mt-3 border-t border-default-100 pt-3 text-xs">Joined as <strong>{row.company.name}</strong></p>}</div>)}</div>}</CardBody></Card>
    <Card><CardBody className="gap-4"><div className="flex items-center gap-2"><FiUsers /><h2 className="font-semibold">Referred companies</h2></div>{!referrals.length ? <p className="text-sm text-default-500">No companies have used your referral code yet.</p> : referrals.map((row: any) => <div key={row.id} className="flex flex-col gap-2 border-b border-default-200 py-3 last:border-0 md:flex-row md:items-center md:justify-between"><div><p className="font-medium">{row.name}</p><p className="text-xs text-default-500">Referred {formatDate(row.referralCapturedAt || row.createdAt)}</p></div><div className="flex gap-2"><Chip size="sm" variant="flat">{row.registrationStatus || "PENDING_REVIEW"}</Chip><Chip size="sm" color={row.referralActivatedAt ? "success" : "warning"} variant="flat" startContent={row.referralActivatedAt ? <FiCheck /> : undefined}>{row.referralActivatedAt ? `Active · ${String(row.activationType || "activity").replaceAll("_", " ")}` : "Awaiting first activity"}</Chip></div></div>)}</CardBody></Card>
    <Card><CardBody className="gap-4"><h2 className="font-semibold">Referral earnings</h2>{!earnings.length ? <p className="text-sm text-default-500">No completed-trade referral earnings yet.</p> : earnings.map((row: any) => <div key={`${row.orderId}-${row.createdAt}`} className="grid grid-cols-2 gap-2 border-b border-default-200 py-3 last:border-0 md:grid-cols-4"><div><p className="text-xs text-default-500">Date</p><p className="text-sm">{formatDate(row.createdAt)}</p></div><div><p className="text-xs text-default-500">Companies</p><p className="text-sm">{row.referredCompanyCount}</p></div><div><p className="text-xs text-default-500">Status</p><Chip size="sm" color="success" variant="flat">{row.status}</Chip></div><div className="md:text-right"><p className="text-xs text-default-500">Earned</p><p className="font-semibold text-success">{formatRate(Number(row.amount || 0))}</p></div></div>)}{(data.pagination?.totalPages || 1) > 1 && <Pagination page={page} total={data.pagination.totalPages} onChange={setPage} />}</CardBody></Card>
  </div>;
}
