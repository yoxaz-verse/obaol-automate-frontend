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

  const panel = "dashboard-panel text-foreground";
  const inputClasses = {
    label: "font-semibold text-foreground",
    inputWrapper: "border border-[var(--db-border-subtle)] db-inset shadow-none data-[hover=true]:border-[var(--db-border-strong)] group-data-[focus=true]:border-obaol-500",
    input: "text-foreground placeholder:text-[var(--db-muted)]",
    description: "db-muted",
  };
  if (query.isLoading) return <div className="dashboard-page min-h-full p-4 md:p-6"><Skeleton className="h-32 rounded-2xl db-inset" /><Skeleton className="h-72 rounded-2xl db-inset" /></div>;
  if (query.isError) return <div className="dashboard-page min-h-full p-4 text-danger-600 dark:text-danger-400 md:p-6">Unable to load referral information.</div>;

  return <div className="dashboard-page min-h-full p-4 text-foreground md:p-6">
    <header className="flex flex-col justify-between gap-3 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-obaol-700 dark:text-obaol-300">Grow the OBAOL network</p><h1 className="mt-1 text-3xl font-black tracking-tight">Referrals &amp; Earnings</h1><p className="mt-1 text-sm db-muted">Invite trusted companies, follow meaningful activity, and earn from eligible completed trades.</p></div><div className="inline-flex items-center gap-2 self-start rounded-full border border-obaol-500/25 bg-obaol-500/10 px-4 py-2 text-xs font-semibold text-obaol-800 dark:text-obaol-200"><FiCalendar /> Monthly activity · India time</div></header>

    <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className={`${panel} overflow-hidden`}><CardBody className="relative p-5 md:p-6"><div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-obaol-500/10" /><div className="relative"><span className="inline-flex rounded-full bg-obaol-500/15 px-3 py-1 text-xs font-bold text-obaol-800 dark:text-obaol-200">Direct referral reward</span><h2 className="mt-4 max-w-lg text-2xl font-black leading-tight md:text-3xl">Share in {rewardPercent}% of OBAOL&apos;s realized profit</h2><p className="mt-3 max-w-xl text-sm leading-6 db-muted">Approved companies must complete a qualifying trade action every month. Rewards apply to eligible completed trades, and when several referrers qualify in one trade, the {rewardPercent}% pool is divided between them.</p><div className="mt-5 flex flex-wrap items-center gap-2"><span className="max-w-full break-all rounded-xl border border-[var(--db-border-subtle)] db-inset px-4 py-2 font-black tracking-[0.16em]">{code || "—"}</span><Button size="sm" className="bg-obaol-500/15 font-semibold text-obaol-800 dark:text-obaol-200" startContent={<FiCopy />} isDisabled={!code} onPress={() => copy(code, "Code")}>Copy code</Button><Button size="sm" className="bg-obaol-500/15 font-semibold text-obaol-800 dark:text-obaol-200" startContent={<FiLink />} isDisabled={!referralUrl} onPress={() => copy(referralUrl, "Generic referral link")}>Generic link</Button></div></div></CardBody></Card>

      <Card className={panel}><CardBody className="p-5 md:p-6"><div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-full bg-obaol-500/15 text-obaol-700 dark:text-obaol-300"><FiSend /></span><div className="min-w-0"><h2 className="font-bold">Invite someone</h2><p className="text-xs db-muted">Create a personal invitation and track their monthly activity.</p></div></div><div className="mt-4 flex flex-wrap gap-2" aria-label="Invitation channel">{([['EMAIL', <FiMail key="email" />, 'Email'], ['WHATSAPP', <FaWhatsapp key="whatsapp" />, 'WhatsApp'], ['LINK', <FiLink key="link" />, 'Personal link']] as const).map(([key, icon, label]) => <Button key={key} size="sm" className={channel === key ? "bg-obaol-500 font-semibold text-obaol-950" : "db-inset font-semibold db-muted-strong"} startContent={icon} onPress={() => setChannel(key)}>{label}</Button>)}</div><div className="mt-4 grid gap-4 md:grid-cols-2"><Input classNames={inputClasses} label="Person or company name" labelPlacement="outside" placeholder="Who are you inviting?" value={recipientName} onValueChange={setRecipientName} isRequired />{channel !== "LINK" && <Input classNames={inputClasses} label={channel === "EMAIL" ? "Email address" : "WhatsApp number"} labelPlacement="outside" type={channel === "EMAIL" ? "email" : "tel"} placeholder={channel === "EMAIL" ? "name@company.com" : "+91 98765 43210"} description={channel === "WHATSAPP" ? "Include the international country code" : undefined} value={destination} onValueChange={setDestination} isRequired />}</div><Button className="mt-4 w-full bg-obaol-500 font-bold text-obaol-950" startContent={channel === "WHATSAPP" ? <FaWhatsapp /> : channel === "EMAIL" ? <FiMail /> : <FiCopy />} isDisabled={!canInvite} isLoading={invite.isPending} onPress={() => invite.mutate()}>{channel === "EMAIL" ? "Open email invitation" : channel === "WHATSAPP" ? "Open WhatsApp invitation" : "Copy personal invitation"}</Button><p className="mt-2 text-center text-[11px] db-muted">OBAOL records the share attempt; delivery is handled by your email or WhatsApp app.</p></CardBody></Card>
    </section>

    <Card className="dashboard-panel border-obaol-500/25 bg-obaol-500/[0.06] text-foreground shadow-none"><CardBody className="grid gap-5 p-5 md:p-6 lg:grid-cols-[0.7fr_1.3fr]"><div><div className="flex items-center gap-2 text-obaol-700 dark:text-obaol-300"><FiShield /><span className="text-xs font-black uppercase tracking-[0.18em]">Referral rules</span></div><h2 className="mt-2 text-2xl font-black">How to stay active</h2><p className="mt-2 text-sm leading-6 db-muted">A login alone is not activity. Every referred company must contribute to a real trade workflow at least once each calendar month.</p></div><div className="grid gap-3 sm:grid-cols-2">{[["1", "Complete one trade action", "Publish a live listing, create or take a real inquiry, confirm a reservation or booking, or participate in a completed order."], ["2", "Do it every month", "Activity is measured from the first through the last day of each month in India time."], ["3", "Passive use does not count", "Logging in, browsing, and updating account or profile details do not qualify."], ["4", "Be active when the trade completes", "Referral rewards apply only to eligible trades completed while the referred company is active that month."]].map(([number, title, body]) => <div key={number} className="rounded-2xl border border-[var(--db-border-subtle)] db-panel p-4"><div className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-obaol-500 text-xs font-black text-obaol-950">{number}</span><div><p className="font-bold">{title}</p><p className="mt-1 text-xs leading-5 db-muted">{body}</p></div></div></div>)}</div></CardBody></Card>

    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[["Total referrals", summary.totalReferrals || 0], ["Active this month", summary.activeReferrals || 0], ["Activity required", summary.pendingActivation || 0], ["Total earnings", formatRate(Number(summary.totalEarnings || 0))]].map(([label, value]) => <Card key={String(label)} className={panel}><CardBody className="p-4 md:p-5"><p className="text-xs font-semibold db-muted">{label}</p><p className="mt-1 break-words text-2xl font-black">{value}</p></CardBody></Card>)}</div>

    <Card className={panel}><CardBody className="gap-4 p-5 md:p-6"><div className="flex items-center justify-between gap-3"><div className="min-w-0"><div className="flex items-center gap-2"><FiUsers className="text-obaol-700 dark:text-obaol-300" /><h2 className="font-bold">People you invited</h2></div><p className="mt-1 text-xs db-muted">Invited → Joined → Active this month → Earned</p></div><span className="shrink-0 text-xs db-muted">{invitations.length} tracked</span></div>{!invitations.length ? <p className="rounded-xl db-inset p-4 text-sm db-muted">No personal invitations yet. Invite someone above to start tracking their progress.</p> : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{invitations.map((row: any) => <div key={row.id} className="min-w-0 rounded-2xl border border-[var(--db-border-subtle)] db-inset p-4"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="break-words font-bold">{row.recipientName}</p><p className="break-all text-xs db-muted">{row.destination || "Personal link"}</p></div><Chip size="sm" color={statusColor(row.status) as any} variant="flat" className="shrink-0">{row.status === "ACTIVE" ? "Active this month" : row.status}</Chip></div><div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs db-muted"><span>{String(row.channel).replace("WHATSAPP", "WhatsApp")}</span><span>{formatDate(row.createdAt)}</span></div>{row.company?.name && <div className="mt-3 border-t border-[var(--db-border-subtle)] pt-3 text-xs"><p>Joined as <strong>{row.company.name}</strong></p>{row.company.lastActivityAt && <p className="mt-1 db-muted">{activityLabel(row.company.lastActivityType)} · {formatDate(row.company.lastActivityAt)}</p>}</div>}</div>)}</div>}</CardBody></Card>

    <Card className={panel}><CardBody className="gap-4 p-5 md:p-6"><div className="flex items-center gap-2"><FiActivity className="text-obaol-700 dark:text-obaol-300" /><h2 className="font-bold">Referred companies</h2></div>{!referrals.length ? <p className="text-sm db-muted">No companies have used your referral code yet.</p> : referrals.map((row: any) => <div key={row.id} className="flex flex-col gap-3 border-b border-[var(--db-border-subtle)] py-4 last:border-0 md:flex-row md:items-center md:justify-between"><div className="min-w-0"><p className="break-words font-semibold">{row.name}</p><p className="text-xs db-muted">Referred {formatDate(row.referralCapturedAt || row.createdAt)}</p></div><div className="flex flex-wrap items-center gap-2"><Chip size="sm" className="db-inset db-muted-strong" variant="flat">{row.registrationStatus || "PENDING_REVIEW"}</Chip><Chip size="sm" color={row.activeThisMonth ? "success" : "warning"} variant="flat" startContent={row.activeThisMonth ? <FiCheck /> : undefined}>{row.activeThisMonth ? "Active this month" : "Activity required"}</Chip>{row.lastActivityAt && <span className="text-xs db-muted">{activityLabel(row.lastActivityType)} · {formatDate(row.lastActivityAt)}</span>}</div></div>)}</CardBody></Card>

    <Card className={panel}><CardBody className="gap-4 p-5 md:p-6"><h2 className="font-bold">Referral earnings</h2>{!earnings.length ? <p className="text-sm db-muted">No completed-trade referral earnings yet.</p> : earnings.map((row: any) => <div key={`${row.orderId}-${row.createdAt}`} className="grid gap-3 border-b border-[var(--db-border-subtle)] py-3 last:border-0 sm:grid-cols-2 md:grid-cols-4"><div><p className="text-xs db-muted">Date</p><p className="text-sm">{formatDate(row.createdAt)}</p></div><div><p className="text-xs db-muted">Companies</p><p className="text-sm">{row.referredCompanyCount}</p></div><div><p className="text-xs db-muted">Status</p><Chip size="sm" color="success" variant="flat">{row.status}</Chip></div><div className="md:text-right"><p className="text-xs db-muted">Earned</p><p className="break-words font-bold text-success-600 dark:text-success-400">{formatRate(Number(row.amount || 0))}</p></div></div>)}{(data.pagination?.totalPages || 1) > 1 && <Pagination page={page} total={data.pagination.totalPages} onChange={setPage} />}</CardBody></Card>
  </div>;
}
