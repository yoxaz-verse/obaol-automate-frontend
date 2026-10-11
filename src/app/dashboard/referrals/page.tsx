"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, CardBody, Chip, Pagination, Skeleton } from "@nextui-org/react";
import { FiCheck, FiCopy, FiLink, FiUsers } from "react-icons/fi";
import { apiRoutes } from "@/core/api/apiRoutes";
import { getData } from "@/core/api/apiHandler";
import { useCurrency } from "@/context/CurrencyContext";
import { showToastMessage } from "@/utils/utils";

const formatDate = (value: unknown) => value
  ? new Date(String(value)).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
  : "—";

export default function AssociateReferralsPage() {
  const { formatRate } = useCurrency();
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["associate-referrals", page],
    queryFn: () => getData(apiRoutes.associateReferrals.dashboard, { page, limit: 20 }),
    refetchOnWindowFocus: false,
  });
  const data = query.data?.data?.data || {};
  const summary = data.summary || {};
  const referrals = useMemo(() => Array.isArray(data.referrals) ? data.referrals : [], [data.referrals]);
  const earnings = useMemo(() => Array.isArray(data.earnings) ? data.earnings : [], [data.earnings]);
  const code = String(data.company?.referralCode || "");
  const referralUrl = typeof window === "undefined" || !code ? "" : `${window.location.origin}/auth/register?role=associate&ref=${code}`;
  const copy = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    showToastMessage({ type: "success", message: `${label} copied.` });
  };

  if (query.isLoading) return <div className="p-6 space-y-4"><Skeleton className="h-28 rounded-2xl" /><Skeleton className="h-80 rounded-2xl" /></div>;
  if (query.isError) return <div className="p-6 text-danger">Unable to load referral information.</div>;

  return (
    <div className="w-full p-4 md:p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Referrals & Earnings</h1>
        <p className="text-sm text-default-500">Invite associate companies and earn from their future completed trades after activation.</p>
      </div>

      <Card className="border border-primary-200/60"><CardBody className="gap-3">
        <p className="text-xs uppercase tracking-wider text-default-500">Your company referral code</p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-2xl font-black tracking-[0.18em]">{code || "—"}</span>
          <Button size="sm" variant="flat" startContent={<FiCopy />} isDisabled={!code} onPress={() => copy(code, "Code")}>Copy code</Button>
          <Button size="sm" color="primary" variant="flat" startContent={<FiLink />} isDisabled={!referralUrl} onPress={() => copy(referralUrl, "Referral link")}>Copy invite link</Button>
        </div>
        <p className="text-xs text-default-500">The referred company activates after approval and its first live listing or real inquiry. Rewards apply only to later completed trades.</p>
      </CardBody></Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ["Total referrals", summary.totalReferrals || 0],
          ["Active", summary.activeReferrals || 0],
          ["Pending activation", summary.pendingActivation || 0],
          ["Total earnings", formatRate(Number(summary.totalEarnings || 0))],
        ].map(([label, value]) => <Card key={String(label)}><CardBody><p className="text-xs text-default-500">{label}</p><p className="text-xl font-semibold">{value}</p></CardBody></Card>)}
      </div>

      <Card><CardBody className="gap-4">
        <div className="flex items-center gap-2"><FiUsers /><h2 className="font-semibold">Referred companies</h2></div>
        {referrals.length === 0 ? <p className="text-sm text-default-500">No companies have used your referral code yet.</p> : referrals.map((row: any) => (
          <div key={row.id} className="flex flex-col gap-2 border-b border-default-200 py-3 last:border-0 md:flex-row md:items-center md:justify-between">
            <div><p className="font-medium">{row.name}</p><p className="text-xs text-default-500">Referred {formatDate(row.referralCapturedAt || row.createdAt)}</p></div>
            <div className="flex gap-2">
              <Chip size="sm" variant="flat">{row.registrationStatus || "PENDING_REVIEW"}</Chip>
              <Chip size="sm" color={row.referralActivatedAt ? "success" : "warning"} variant="flat" startContent={row.referralActivatedAt ? <FiCheck /> : undefined}>
                {row.referralActivatedAt ? `Active · ${String(row.activationType || "activity").replaceAll("_", " ")}` : "Awaiting first activity"}
              </Chip>
            </div>
          </div>
        ))}
      </CardBody></Card>

      <Card><CardBody className="gap-4">
        <h2 className="font-semibold">Referral earnings</h2>
        {earnings.length === 0 ? <p className="text-sm text-default-500">No completed-trade referral earnings yet.</p> : earnings.map((row: any) => (
          <div key={`${row.orderId}-${row.createdAt}`} className="grid grid-cols-2 gap-2 border-b border-default-200 py-3 last:border-0 md:grid-cols-4">
            <div><p className="text-xs text-default-500">Date</p><p className="text-sm">{formatDate(row.createdAt)}</p></div>
            <div><p className="text-xs text-default-500">Companies</p><p className="text-sm">{row.referredCompanyCount}</p></div>
            <div><p className="text-xs text-default-500">Status</p><Chip size="sm" color="success" variant="flat">{row.status}</Chip></div>
            <div className="md:text-right"><p className="text-xs text-default-500">Earned</p><p className="font-semibold text-success">{formatRate(Number(row.amount || 0))}</p></div>
          </div>
        ))}
        {(data.pagination?.totalPages || 1) > 1 && <Pagination page={page} total={data.pagination.totalPages} onChange={setPage} />}
      </CardBody></Card>
    </div>
  );
}
