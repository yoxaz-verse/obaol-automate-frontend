"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardBody, Skeleton } from "@nextui-org/react";
import { LuArrowRight } from "react-icons/lu";
import { useCompanyFunctionDashboard } from "@/core/data/useCompanyFunctionDashboard";
import CompanyFunctionComponent from "./CompanyFunctionComponent";
import { normalizePreviewFunctionSlug } from "@/utils/companyFunctionPreview";
import { buildAssociateDashboardModel, getAssociateWorkspaceKind } from "./associateDashboardModel";

type AssociateDashboardProps = {
  providedCapabilities: string[];
  soughtCapabilities: string[];
  associateCompanyId: string;
  companyCapabilitiesConfigured: boolean;
  metrics: Record<string, any>;
  actionRequired: number;
  sellingCount: number;
  isLoading: boolean;
  perspective: "provided" | "sought";
  onPerspectiveChange: (perspective: "provided" | "sought") => void;
};

export default function AssociateDashboard({
  providedCapabilities,
  soughtCapabilities,
  associateCompanyId,
  companyCapabilitiesConfigured,
  metrics,
  actionRequired,
  sellingCount,
  isLoading,
  perspective,
  onPerspectiveChange,
}: AssociateDashboardProps) {
  const router = useRouter();
  const model = useMemo(() => buildAssociateDashboardModel({
    providedCapabilities,
    soughtCapabilities,
    actionRequired,
    sellingCount,
    liveProducts: Number(metrics.liveProducts || 0),
    perspective,
  }), [providedCapabilities, soughtCapabilities, actionRequired, sellingCount, metrics.liveProducts, perspective]);

  const companyFunctionDashboard = useCompanyFunctionDashboard({
    companyId: associateCompanyId,
    isAdmin: false,
    perspective,
    enabled: Boolean(associateCompanyId),
  });
  const liveProvidedCapabilities = Array.isArray(companyFunctionDashboard.company?.providedCapabilities) ? companyFunctionDashboard.company.providedCapabilities : providedCapabilities;
  const liveSoughtCapabilities = Array.isArray(companyFunctionDashboard.company?.soughtCapabilities) ? companyFunctionDashboard.company.soughtCapabilities : soughtCapabilities;
  const hasProvided = liveProvidedCapabilities.length > 0;
  const hasSought = liveSoughtCapabilities.length > 0;
  const activeCapabilities = perspective === "provided" ? liveProvidedCapabilities : liveSoughtCapabilities;
  const isSeeking = perspective === "sought";
  const activePerspectiveTab = "bg-obaol-500 text-obaol-950 shadow-sm hover:bg-obaol-400 focus-visible:ring-2 focus-visible:ring-obaol-500/40";

  return (
    <div className="space-y-6">
      <section aria-label="Dashboard perspective controls" className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-col items-stretch gap-2 sm:items-start">
            <div role="tablist" aria-label="Dashboard perspective" aria-describedby="dashboard-perspective-help" className="inline-flex rounded-xl border border-default-200 bg-default-100 p-1">
              <Button
                role="tab"
                aria-selected={perspective === "provided"}
                isDisabled={!hasProvided}
                size="sm"
                variant="light"
                className={`min-w-28 font-semibold ${perspective === "provided" ? activePerspectiveTab : ""}`}
                onPress={() => onPerspectiveChange("provided")}
              >
                Providing
              </Button>
              <Button
                role="tab"
                aria-selected={perspective === "sought"}
                isDisabled={!hasSought}
                size="sm"
                variant="light"
                className={`min-w-28 font-semibold ${perspective === "sought" ? activePerspectiveTab : ""}`}
                onPress={() => onPerspectiveChange("sought")}
              >
                Seeking
              </Button>
            </div>
            <p id="dashboard-perspective-help" className="max-w-full text-xs leading-5 text-default-500">
              <span className="font-semibold text-foreground">Providing:</span> what your company offers <span aria-hidden="true">·</span>{" "}
              <span className="font-semibold text-foreground">Seeking:</span> what your company needs
            </p>
          </div>
          {(!hasProvided || !hasSought) && <Button size="sm" variant="light" className="font-semibold text-primary sm:justify-end" onPress={() => router.push("/dashboard/company")}>Configure missing profile</Button>}
        </div>
      </section>

      {Boolean(associateCompanyId) && (
        <section aria-labelledby="capability-summary-title" className="space-y-3">
          <div>
            <h2 id="capability-summary-title" className="text-lg font-black tracking-tight text-foreground">{isSeeking ? "What you are seeking" : "What you provide"}</h2>
            <p className="mt-1 text-sm text-default-500">{isSeeking ? "The capabilities and partners your company is looking for." : "The capabilities and services your company offers."}</p>
          </div>
          {!associateCompanyId ? (
            <Card className="border border-warning-500/25 bg-warning-500/10 shadow-none"><CardBody className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm font-medium text-foreground">Link a company to load your prioritized capabilities.</p><Button color="warning" variant="flat" onPress={() => router.push("/dashboard/company")}>Open company</Button></CardBody></Card>
          ) : companyFunctionDashboard.isLoading ? (
            <div className={`grid grid-cols-1 gap-3 ${activeCapabilities.length > 1 ? "lg:grid-cols-2" : ""}`}>{Array.from({ length: Math.min(Math.max(activeCapabilities.length, 1), 2) }).map((_, index) => <Skeleton key={index} className="h-44 rounded-2xl" />)}</div>
          ) : companyFunctionDashboard.isError ? (
            <Card className="border border-danger-500/25 bg-danger-500/10 shadow-none"><CardBody className="text-sm text-danger">Your capabilities could not be loaded. Try refreshing this page.</CardBody></Card>
          ) : companyFunctionDashboard.orderedFunctions.length === 0 ? (
            <Card className="border border-default-200 shadow-none"><CardBody className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-default-500">No capabilities are configured for this view.</p><Button variant="flat" onPress={() => router.push("/dashboard/company")}>Configure company</Button></CardBody></Card>
          ) : (
            <div className={`grid grid-cols-1 gap-3 ${companyFunctionDashboard.orderedFunctions.length > 1 ? "lg:grid-cols-2" : ""}`}>
              {companyFunctionDashboard.orderedFunctions.map((fn: any) => {
                const workspaceKind = getAssociateWorkspaceKind(normalizePreviewFunctionSlug(fn.slug), perspective);
                const capabilityStat = workspaceKind ? model.capabilityStats[workspaceKind] : null;
                return <CompanyFunctionComponent key={`summary-${fn._id}`} name={fn.name} slug={normalizePreviewFunctionSlug(fn.slug)} priorityRank={fn.priorityRank} metrics={fn.metrics} recentExecutionInquiries={fn.recentExecutionInquiries} recentOrders={fn.recentOrders} perspective={perspective} stat={capabilityStat} />;
              })}
            </div>
          )}
        </section>
      )}

      {!companyCapabilitiesConfigured && (
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

      {!isLoading && model.attentionAction && <Card className="border border-warning-500/30 bg-warning-500/10 shadow-none">
        <CardBody className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold  tracking-widest text-default-500">{model.attentionAction.eyebrow}</p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-foreground sm:text-2xl">{model.attentionAction.title}</h2>
            <p className="mt-2 text-sm leading-6 text-default-600">{model.attentionAction.description}</p>
          </div>
          <Button color={model.attentionAction.tone} className="min-h-11 shrink-0 font-bold" endContent={<LuArrowRight />} onPress={() => router.push(model.attentionAction.href)}>{model.attentionAction.label}</Button>
        </CardBody>
      </Card>}
    </div>
  );
}
