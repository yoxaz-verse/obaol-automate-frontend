"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardBody, CardHeader, Chip, Divider, Skeleton } from "@nextui-org/react";
import { LuArrowRight, LuCheck, LuClock3, LuPackage, LuShoppingBag, LuTrendingUp } from "react-icons/lu";
import { useCompanyFunctionDashboard } from "@/core/data/useCompanyFunctionDashboard";
import { dashboardCopy } from "@/utils/dashboardCopy";
import type { TradeMode } from "@/utils/dashboardAccess";
import { buildAssociateDashboardModel, type AssociateFocus, type AssociateMetric } from "./associateDashboardModel";

const CompanyFunctionComponent = dynamic(() => import("./CompanyFunctionComponent"), {
  loading: () => <Skeleton className="h-48 w-full rounded-2xl" />,
});

type PendingAction = { id?: unknown; _id?: unknown; missingStep?: string };
type Activity = { id?: unknown; type?: string; status?: string; at?: string };

type AssociateDashboardProps = {
  tradeMode: TradeMode;
  focus: AssociateFocus;
  associateCompanyId: string;
  companyInterestsConfigured: boolean;
  metrics: Record<string, any>;
  pendingActions: PendingAction[];
  activity: Activity[];
  activeOrders: number;
  actionRequired: number;
  buyingCount: number;
  sellingCount: number;
  isLoading: boolean;
};

const objectIdPattern = /^[a-f0-9]{24}$/i;

const metricIcon = (metric: AssociateMetric) => {
  if (metric.key === "actions") return <LuClock3 size={19} />;
  if (metric.key === "buying") return <LuShoppingBag size={19} />;
  if (metric.key === "selling" || metric.key === "listings") return <LuPackage size={19} />;
  return <LuTrendingUp size={19} />;
};

export default function AssociateDashboard({
  tradeMode,
  focus,
  associateCompanyId,
  companyInterestsConfigured,
  metrics,
  pendingActions,
  activity,
  activeOrders,
  actionRequired,
  buyingCount,
  sellingCount,
  isLoading,
}: AssociateDashboardProps) {
  const router = useRouter();
  const model = useMemo(() => buildAssociateDashboardModel({
    tradeMode,
    focus,
    actionRequired,
    buyingCount,
    sellingCount,
    activeOrders,
    liveProducts: Number(metrics.liveProducts || 0),
  }), [tradeMode, focus, actionRequired, buyingCount, sellingCount, activeOrders, metrics.liveProducts]);

  const companyFunctionDashboard = useCompanyFunctionDashboard({
    companyId: associateCompanyId,
    isAdmin: false,
    enabled: model.showFunctions && Boolean(associateCompanyId),
  });

  return (
    <div className="space-y-6">
      {!companyInterestsConfigured && (
        <Card className="border border-obaol-500/30 bg-obaol-500/10 shadow-none">
          <CardBody className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Finish configuring your company</h2>
              <p className="mt-1 text-sm text-default-500">Add company functions to personalize services, routing, and execution panels.</p>
            </div>
            <Button color="warning" variant="flat" className="min-h-11 font-semibold" onPress={() => router.push("/dashboard/company")}>Configure company</Button>
          </CardBody>
        </Card>
      )}

      <section aria-label="Associate overview" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading ? Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="min-h-36 border border-slate-200/90 bg-content1 shadow-sm dark:border-white/10">
            <CardBody className="space-y-4 p-5"><Skeleton className="h-4 w-2/3 rounded-lg" /><Skeleton className="h-9 w-1/3 rounded-lg" /><Skeleton className="h-4 w-full rounded-lg" /></CardBody>
          </Card>
        )) : model.metrics.map((metric) => (
          <button key={metric.key} type="button" onClick={() => router.push(metric.href)} className="min-h-36 rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            <Card className="h-full border border-slate-200/90 bg-content1 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md dark:border-white/10">
              <CardBody className="flex h-full flex-col justify-between gap-4 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-default-500">{metric.label}</p>
                    <p className="mt-1 text-3xl font-black tracking-tight text-foreground">{metric.value.toLocaleString()}</p>
                  </div>
                  <span className="rounded-xl border border-obaol-500/20 bg-obaol-500/10 p-2.5 text-obaol-600 dark:text-obaol-300">{metricIcon(metric)}</span>
                </div>
                <span className="flex items-center justify-between gap-3 border-t border-default-100 pt-3 text-sm text-default-500 dark:border-white/5">
                  <span>{metric.description}</span><LuArrowRight className="shrink-0" aria-hidden="true" />
                </span>
              </CardBody>
            </Card>
          </button>
        ))}
      </section>

      {!isLoading && <Card className={`border shadow-none ${model.primaryAction.tone === "warning" ? "border-warning-500/30 bg-warning-500/10" : model.primaryAction.tone === "success" ? "border-success-500/30 bg-success-500/10" : "border-primary-500/25 bg-primary-500/5"}`}>
        <CardBody className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-default-500">{model.primaryAction.eyebrow}</p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-foreground sm:text-2xl">{model.primaryAction.title}</h2>
            <p className="mt-2 text-sm leading-6 text-default-600">{model.primaryAction.description}</p>
          </div>
          <Button color={model.primaryAction.tone} className="min-h-11 shrink-0 font-bold" endContent={<LuArrowRight />} onPress={() => router.push(model.primaryAction.href)}>{model.primaryAction.label}</Button>
        </CardBody>
      </Card>}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Card className="border border-slate-200/90 bg-content1 shadow-sm dark:border-white/10 xl:col-span-3">
          <CardHeader className="flex items-center justify-between gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
            <div><h2 className="text-base font-bold text-foreground">Pending enquiries</h2><p className="mt-1 text-sm text-default-500">Items waiting for an associate-side step.</p></div>
            <Button size="sm" variant="light" className="min-h-10 font-semibold" onPress={() => router.push("/dashboard/enquiries")}>View all</Button>
          </CardHeader>
          <Divider className="mt-4" />
          <CardBody className="p-3 sm:p-4">
            {pendingActions.length === 0 ? (
              <div className="flex min-h-32 flex-col items-center justify-center gap-2 text-center"><LuCheck className="text-success" size={24} /><p className="font-semibold text-foreground">You’re all caught up</p><p className="text-sm text-default-500">New actions will appear here.</p></div>
            ) : pendingActions.slice(0, 6).map((item) => {
              const id = String(item._id || item.id || "").trim();
              const canOpen = objectIdPattern.test(id);
              return (
                <button key={id || String(item.missingStep)} type="button" disabled={!canOpen} onClick={() => canOpen && router.push(`/dashboard/enquiries/${id}`)} className="flex min-h-14 w-full items-center justify-between gap-4 rounded-xl px-3 py-3 text-left transition-colors enabled:hover:bg-default-100/70 disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <span className="min-w-0"><span className="block font-semibold text-foreground">Enquiry {id ? `#${id.slice(-6).toUpperCase()}` : "action"}</span><span className="mt-0.5 block text-sm text-default-500">{item.missingStep || "Review the next required step"}</span></span>
                  {canOpen && <LuArrowRight className="shrink-0 text-default-400" aria-hidden="true" />}
                </button>
              );
            })}
          </CardBody>
        </Card>

        <Card className="border border-slate-200/90 bg-content1 shadow-sm dark:border-white/10 xl:col-span-2">
          <CardHeader className="px-5 pt-5 sm:px-6 sm:pt-6"><div><h2 className="text-base font-bold text-foreground">Recent activity</h2><p className="mt-1 text-sm text-default-500">Your latest enquiries and orders.</p></div></CardHeader>
          <Divider className="mt-4" />
          <CardBody className="space-y-1 p-4">
            {isLoading ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-14 w-full rounded-xl" />) : activity.length === 0 ? (
              <div className="flex min-h-32 items-center justify-center text-center text-sm text-default-500">No activity yet. Your latest trade events will appear here.</div>
            ) : activity.slice(0, 6).map((item) => {
              const id = String(item.id || "");
              const isEnquiry = String(item.type || "").toLowerCase() === "enquiry";
              const href = `${isEnquiry ? "/dashboard/enquiries" : "/dashboard/orders"}/${id}`;
              const canOpen = objectIdPattern.test(id);
              return (
                <button key={`${item.type}-${id}`} type="button" disabled={!canOpen} onClick={() => canOpen && router.push(href)} className="flex min-h-14 w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left enabled:hover:bg-default-100/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <span className="min-w-0"><span className="block truncate font-semibold text-foreground">{item.type || "Activity"} #{id.slice(-6).toUpperCase()}</span><span className="block text-sm text-default-500">{dashboardCopy(item.status || "")}</span></span>
                  <span className="shrink-0 text-xs text-default-400">{item.at ? new Date(item.at).toLocaleDateString() : ""}</span>
                </button>
              );
            })}
          </CardBody>
        </Card>
      </div>

      {model.showFunctions && (
        <section aria-labelledby="company-functions-title" className="space-y-4">
          <div><h2 id="company-functions-title" className="text-lg font-black tracking-tight text-foreground">Company functions</h2><p className="mt-1 text-sm text-default-500">Execution panels based on your company priorities and capabilities.</p></div>
          {!associateCompanyId ? (
            <Card className="border border-warning-500/25 bg-warning-500/10 shadow-none"><CardBody className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm font-medium text-foreground">Link a company to load service and selling functions.</p><Button color="warning" variant="flat" onPress={() => router.push("/dashboard/company")}>Open company</Button></CardBody></Card>
          ) : companyFunctionDashboard.isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{Array.from({ length: 2 }).map((_, index) => <Skeleton key={index} className="h-48 rounded-2xl" />)}</div>
          ) : companyFunctionDashboard.isError ? (
            <Card className="border border-danger-500/25 bg-danger-500/10 shadow-none"><CardBody className="text-sm text-danger">Company functions could not be loaded. Try refreshing this page.</CardBody></Card>
          ) : companyFunctionDashboard.orderedFunctions.length === 0 ? (
            <Card className="border db-border-subtle shadow-none"><CardBody className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-default-500">No company functions are configured yet.</p><Button variant="flat" onPress={() => router.push("/dashboard/company")}>Configure company</Button></CardBody></Card>
          ) : companyFunctionDashboard.orderedFunctions.map((fn: any) => <CompanyFunctionComponent key={fn._id} name={fn.name} slug={fn.slug} priorityRank={fn.priorityRank} metrics={fn.metrics} recentExecutionInquiries={fn.recentExecutionInquiries} recentOrders={fn.recentOrders} />)}
        </section>
      )}
    </div>
  );
}
