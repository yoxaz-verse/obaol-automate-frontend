"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, CardBody, Skeleton } from "@nextui-org/react";
import { FiCopy, FiShare2, FiUsers } from "react-icons/fi";
import { apiRoutes } from "@/core/api/apiRoutes";
import { getData } from "@/core/api/apiHandler";
import { showToastMessage } from "@/utils/utils";

type CompanyReferralLink = {
  referralCode: string;
  registrationPath: string;
  referrerType: "associate_company" | "operator";
  targetRole: "associate";
};

export default function CompanyReferralShareCard({ compact = false }: { compact?: boolean }) {
  const query = useQuery({
    queryKey: ["company-referral-link"],
    queryFn: async () => (await getData(apiRoutes.associateReferrals.companyLink)).data.data as CompanyReferralLink,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const link = useMemo(() => {
    const path = String(query.data?.registrationPath || "");
    if (!path || typeof window === "undefined") return "";
    return path.startsWith("/") ? `${window.location.origin}${path}` : path;
  }, [query.data?.registrationPath]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      showToastMessage({ type: "success", message: "Company invitation link copied." });
    } catch {
      showToastMessage({ type: "error", message: "Unable to copy the invitation link." });
    }
  };
  const shareLink = async () => {
    if (!navigator.share) return copyLink();
    try {
      await navigator.share({ title: "Join OBAOL as a company", text: "Register your company on OBAOL using my invitation link.", url: link });
    } catch (error: any) {
      if (error?.name !== "AbortError") showToastMessage({ type: "error", message: "Unable to share the invitation link." });
    }
  };

  const content = <>
    <div className="flex items-start gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-obaol-500/15 text-obaol-700 dark:text-obaol-300"><FiUsers /></span>
      <div className="min-w-0"><h2 className={compact ? "font-bold" : "text-xl font-black"}>Invite a company</h2><p className="mt-1 text-sm db-muted">Share this link with a business associate. It opens company registration with your referral already applied.</p></div>
    </div>
    {query.isLoading ? <Skeleton className="mt-4 h-10 w-full rounded-xl" /> : query.isError ? <p className="mt-4 rounded-xl bg-danger-500/10 p-3 text-sm text-danger">{(query.error as any)?.response?.data?.message || "The company invitation link is unavailable."}</p> : <>
      <div className="mt-4 break-all rounded-xl border border-[var(--db-border-subtle)] db-inset px-4 py-3 text-sm font-semibold">{link}</div>
      <div className="mt-3 flex flex-wrap gap-2"><Button size="sm" className="bg-obaol-500 font-bold text-obaol-950" startContent={<FiCopy />} onPress={copyLink}>Copy company link</Button><Button size="sm" variant="flat" startContent={<FiShare2 />} onPress={shareLink}>{typeof navigator !== "undefined" && navigator.share ? "Share…" : "Copy to share"}</Button></div>
    </>}
  </>;

  return compact ? <div className="rounded-2xl border border-[var(--db-border-subtle)] db-panel p-4">{content}</div> : <Card className="dashboard-panel border-obaol-500/25 bg-obaol-500/[0.05] shadow-none"><CardBody className="p-5 md:p-6">{content}</CardBody></Card>;
}
