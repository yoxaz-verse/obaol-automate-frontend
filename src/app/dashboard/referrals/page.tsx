"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, CardBody, Chip, Input, Pagination, Skeleton } from "@nextui-org/react";
import { FiActivity, FiCalendar, FiCheck, FiCopy, FiLink, FiMail, FiSend, FiShield, FiUsers } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { apiRoutes } from "@/core/api/apiRoutes";
import { getData, postData } from "@/core/api/apiHandler";
import { useCurrency } from "@/context/CurrencyContext";
import { showToastMessage } from "@/utils/utils";

type Channel = "EMAIL" | "WHATSAPP" | "LINK";
const formatDate = (value: unknown) => value ? new Date(String(value)).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const newKey = () => typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const statusColor = (status: string) => status === "EARNED" ? "success" : status === "ACTIVE" ? "primary" : status === "JOINED" ? "secondary" : "default";
const activityLabel = (type: unknown) => ({
  LIVE_SUPPLY: "Live listing",
  INQUIRY_CREATED: "Inquiry created",
  INQUIRY_TAKEN: "Inquiry taken",
  RESERVATION_CONFIRMED: "Confirmed reservation",
  WAREHOUSE_BOOKING: "Warehouse booking",
  ORDER_COMPLETED: "Completed order",
}[String(type || "")] || "Trade activity");

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

  const lightCard = "border border-[#e8dfcf] bg-white text-[#27231d] shadow-[0_12px_36px_rgba(62,48,24,0.06)]";
  const inputClasses = { label: "font-semibold text-[#423b31]", inputWrapper: "border border-[#ded5c6] bg-[#fbfaf7] shadow-none", input: "text-[#27231d] placeholder:text-[#918879]", description: "text-[#786f62]" };
  if (query.isLoading) return <div className="min-h-full space-y-4 bg-[#fbf8f1] p-6"><Skeleton className="h-40 rounded-2xl bg-[#eee6d8]" /><Skeleton className="h-80 rounded-2xl bg-[#eee6d8]" /></div>;
  if (query.isError) return <div className="min-h-full bg-[#fbf8f1] p-6 text-[#a33b2d]">Unable to load referral information.</div>;

  return <div className="min-h-full w-full space-y-6 bg-[#fbf8f1] p-4 text-[#27231d] md:p-7">
    <header className="flex flex-col justify-between gap-3 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a26f18]">Grow the OBAOL network</p><h1 className="mt-1 text-3xl font-black tracking-tight">Referrals &amp; Earnings</h1><p className="mt-1 text-sm text-[#6f675b]">Invite trusted companies, follow meaningful activity, and earn from eligible completed trades.</p></div><div className="inline-flex items-center gap-2 self-start rounded-full border border-[#e6d8bd] bg-white px-4 py-2 text-xs font-semibold text-[#6c5428]"><FiCalendar /> Monthly activity · India time</div></header>

    <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className={`${lightCard} overflow-hidden`}><CardBody className="relative p-6 md:p-8"><div className="absolute right-0 top-0 h-40 w-40 rounded-bl-full bg-[#c8922e]/10" /><div className="relative"><span className="inline-flex rounded-full bg-[#f4ead5] px-3 py-1 text-xs font-bold text-[#805b18]">Direct referral reward</span><h2 className="mt-4 max-w-lg text-3xl font-black leading-tight">Share in {rewardPercent}% of OBAOL&apos;s realized profit</h2><p className="mt-3 max-w-xl text-sm leading-6 text-[#655e53]">Approved companies must complete a qualifying trade action every month. Rewards apply to eligible completed trades, and when several referrers qualify in one trade, the {rewardPercent}% pool is divided between them.</p><div className="mt-6 flex flex-wrap items-center gap-2"><span className="rounded-xl border border-[#e4d8c3] bg-[#fbf8f1] px-4 py-2 font-black tracking-[0.16em]">{code || "—"}</span><Button size="sm" className="bg-[#f0e5d1] font-semibold text-[#634a20]" startContent={<FiCopy />} isDisabled={!code} onPress={() => copy(code, "Code")}>Copy code</Button><Button size="sm" className="bg-[#f0e5d1] font-semibold text-[#634a20]" startContent={<FiLink />} isDisabled={!referralUrl} onPress={() => copy(referralUrl, "Generic referral link")}>Generic link</Button></div></div></CardBody></Card>

      <Card className={lightCard}><CardBody className="p-5 md:p-6"><div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#f4ead5] text-[#8b6118]"><FiSend /></span><div><h2 className="font-bold">Invite someone</h2><p className="text-xs text-[#746c60]">Create a personal invitation and track their monthly activity.</p></div></div><div className="mt-5 flex flex-wrap gap-2" aria-label="Invitation channel">{([['EMAIL', <FiMail key="email" />, 'Email'], ['WHATSAPP', <FaWhatsapp key="whatsapp" />, 'WhatsApp'], ['LINK', <FiLink key="link" />, 'Personal link']] as const).map(([key, icon, label]) => <Button key={key} size="sm" className={channel === key ? "bg-[#bf8525] font-semibold text-white" : "bg-[#f2eee7] font-semibold text-[#5f584d]"} startContent={icon} onPress={() => setChannel(key)}>{label}</Button>)}</div><div className="mt-5 grid gap-4 md:grid-cols-2"><Input classNames={inputClasses} label="Person or company name" labelPlacement="outside" placeholder="Who are you inviting?" value={recipientName} onValueChange={setRecipientName} isRequired />{channel !== "LINK" && <Input classNames={inputClasses} label={channel === "EMAIL" ? "Email address" : "WhatsApp number"} labelPlacement="outside" type={channel === "EMAIL" ? "email" : "tel"} placeholder={channel === "EMAIL" ? "name@company.com" : "+91 98765 43210"} description={channel === "WHATSAPP" ? "Include the international country code" : undefined} value={destination} onValueChange={setDestination} isRequired />}</div><Button className="mt-5 w-full bg-[#b77c1e] font-bold text-white shadow-[0_8px_20px_rgba(183,124,30,0.2)]" startContent={channel === "WHATSAPP" ? <FaWhatsapp /> : channel === "EMAIL" ? <FiMail /> : <FiCopy />} isDisabled={!canInvite} isLoading={invite.isPending} onPress={() => invite.mutate()}>{channel === "EMAIL" ? "Open email invitation" : channel === "WHATSAPP" ? "Open WhatsApp invitation" : "Copy personal invitation"}</Button><p className="mt-2 text-center text-[11px] text-[#8a8174]">OBAOL records the share attempt; delivery is handled by your email or WhatsApp app.</p></CardBody></Card>
    </section>

    <Card className="border border-[#dfcfb1] bg-[#fffaf0] text-[#2d2922] shadow-none"><CardBody className="grid gap-5 p-6 lg:grid-cols-[0.7fr_1.3fr]"><div><div className="flex items-center gap-2 text-[#91661c]"><FiShield /><span className="text-xs font-black uppercase tracking-[0.18em]">Referral rules</span></div><h2 className="mt-2 text-2xl font-black">How to stay active</h2><p className="mt-2 text-sm leading-6 text-[#6d6456]">A login alone is not activity. Every referred company must contribute to a real trade workflow at least once each calendar month.</p></div><div className="grid gap-3 sm:grid-cols-2">{[["1", "Complete one trade action", "Publish a live listing, create or take a real inquiry, confirm a reservation or booking, or participate in a completed order."], ["2", "Do it every month", "Activity is measured from the first through the last day of each month in India time."], ["3", "Passive use does not count", "Logging in, browsing, and updating account or profile details do not qualify."], ["4", "Be active when the trade completes", "Referral rewards apply only to eligible trades completed while the referred company is active that month."]].map(([number, title, body]) => <div key={number} className="rounded-2xl border border-[#eadfc9] bg-white p-4"><div className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#c8922e] text-xs font-black text-white">{number}</span><div><p className="font-bold">{title}</p><p className="mt-1 text-xs leading-5 text-[#746b5e]">{body}</p></div></div></div>)}</div></CardBody></Card>

    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[["Total referrals", summary.totalReferrals || 0], ["Active this month", summary.activeReferrals || 0], ["Activity required", summary.pendingActivation || 0], ["Total earnings", formatRate(Number(summary.totalEarnings || 0))]].map(([label, value]) => <Card key={String(label)} className={lightCard}><CardBody className="p-5"><p className="text-xs font-semibold text-[#7a7164]">{label}</p><p className="mt-1 text-2xl font-black">{value}</p></CardBody></Card>)}</div>

    <Card className={lightCard}><CardBody className="gap-4 p-5 md:p-6"><div className="flex items-center justify-between gap-3"><div><div className="flex items-center gap-2"><FiUsers className="text-[#a36f19]" /><h2 className="font-bold">People you invited</h2></div><p className="mt-1 text-xs text-[#786f62]">Invited → Joined → Active this month → Earned</p></div><span className="text-xs text-[#786f62]">{invitations.length} tracked</span></div>{!invitations.length ? <p className="rounded-xl bg-[#faf7f1] p-5 text-sm text-[#746c60]">No personal invitations yet. Invite someone above to start tracking their progress.</p> : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{invitations.map((row: any) => <div key={row.id} className="rounded-2xl border border-[#e8dfd1] bg-[#fdfcf9] p-4"><div className="flex items-start justify-between gap-2"><div><p className="font-bold">{row.recipientName}</p><p className="text-xs text-[#7c7468]">{row.destination || "Personal link"}</p></div><Chip size="sm" color={statusColor(row.status) as any} variant="flat">{row.status === "ACTIVE" ? "Active this month" : row.status}</Chip></div><div className="mt-3 flex items-center justify-between text-xs text-[#7c7468]"><span>{String(row.channel).replace("WHATSAPP", "WhatsApp")}</span><span>{formatDate(row.createdAt)}</span></div>{row.company?.name && <div className="mt-3 border-t border-[#eee6da] pt-3 text-xs"><p>Joined as <strong>{row.company.name}</strong></p>{row.company.lastActivityAt && <p className="mt-1 text-[#7a7164]">{activityLabel(row.company.lastActivityType)} · {formatDate(row.company.lastActivityAt)}</p>}</div>}</div>)}</div>}</CardBody></Card>

    <Card className={lightCard}><CardBody className="gap-4 p-5 md:p-6"><div className="flex items-center gap-2"><FiActivity className="text-[#a36f19]" /><h2 className="font-bold">Referred companies</h2></div>{!referrals.length ? <p className="text-sm text-[#746c60]">No companies have used your referral code yet.</p> : referrals.map((row: any) => <div key={row.id} className="flex flex-col gap-3 border-b border-[#eee6da] py-4 last:border-0 md:flex-row md:items-center md:justify-between"><div><p className="font-semibold">{row.name}</p><p className="text-xs text-[#7c7468]">Referred {formatDate(row.referralCapturedAt || row.createdAt)}</p></div><div className="flex flex-wrap items-center gap-2"><Chip size="sm" className="bg-[#f2eee7] text-[#615a50]" variant="flat">{row.registrationStatus || "PENDING_REVIEW"}</Chip><Chip size="sm" color={row.activeThisMonth ? "success" : "warning"} variant="flat" startContent={row.activeThisMonth ? <FiCheck /> : undefined}>{row.activeThisMonth ? "Active this month" : "Activity required"}</Chip>{row.lastActivityAt && <span className="text-xs text-[#756d61]">{activityLabel(row.lastActivityType)} · {formatDate(row.lastActivityAt)}</span>}</div></div>)}</CardBody></Card>

    <Card className={lightCard}><CardBody className="gap-4 p-5 md:p-6"><h2 className="font-bold">Referral earnings</h2>{!earnings.length ? <p className="text-sm text-[#746c60]">No completed-trade referral earnings yet.</p> : earnings.map((row: any) => <div key={`${row.orderId}-${row.createdAt}`} className="grid grid-cols-2 gap-3 border-b border-[#eee6da] py-3 last:border-0 md:grid-cols-4"><div><p className="text-xs text-[#7c7468]">Date</p><p className="text-sm">{formatDate(row.createdAt)}</p></div><div><p className="text-xs text-[#7c7468]">Companies</p><p className="text-sm">{row.referredCompanyCount}</p></div><div><p className="text-xs text-[#7c7468]">Status</p><Chip size="sm" color="success" variant="flat">{row.status}</Chip></div><div className="md:text-right"><p className="text-xs text-[#7c7468]">Earned</p><p className="font-bold text-[#267347]">{formatRate(Number(row.amount || 0))}</p></div></div>)}{(data.pagination?.totalPages || 1) > 1 && <Pagination page={page} total={data.pagination.totalPages} onChange={setPage} />}</CardBody></Card>
  </div>;
}
