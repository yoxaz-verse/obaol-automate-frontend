"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardBody, Skeleton } from "@nextui-org/react";
import { LuArrowRight } from "react-icons/lu";
import { useCompanyFunctionDashboard } from "@/core/data/useCompanyFunctionDashboard";
import { getCompanyFunctionRoleContext, getPreviewDefinition, normalizePreviewFunctionSlug } from "@/utils/companyFunctionPreview";
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

  const hasProvided = providedCapabilities.length > 0;
  const hasSought = soughtCapabilities.length > 0;
  const activeCapabilities = perspective === "provided" ? providedCapabilities : soughtCapabilities;

  const companyFunctionDashboard = useCompanyFunctionDashboard({
    companyId: associateCompanyId,
    isAdmin: false,
    perspective,
    enabled: model.showFunctions && Boolean(associateCompanyId),
  });
  const isSeeking = perspective === "sought";
  const perspectiveAccent = isSeeking
    ? "border-blue-500/30 bg-blue-500/5 dark:border-blue-400/25"
    : "border-emerald-500/30 bg-emerald-500/5 dark:border-emerald-400/25";
  const perspectiveText = isSeeking ? "text-blue-600 dark:text-blue-300" : "text-emerald-600 dark:text-emerald-300";
  const perspectiveButton = isSeeking
    ? "bg-blue-600 text-white hover:bg-blue-700"
    : "bg-emerald-600 text-white hover:bg-emerald-700";

  return (
    <div className="space-y-6">
      <section aria-label="Dashboard perspective controls" className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <div role="tablist" aria-label="Dashboard perspective" className="inline-flex rounded-xl border border-default-200 bg-default-100 p-1">
            <Button
              role="tab"
              aria-selected={perspective === "sought"}
              isDisabled={!hasSought}
              size="sm"
              variant="light"
              className={`min-w-28 font-semibold ${perspective === "sought" ? "bg-blue-600 text-white hover:bg-blue-700" : ""}`}
              onPress={() => onPerspectiveChange("sought")}
            >
              Seeking
            </Button>
            <Button
              role="tab"
              aria-selected={perspective === "provided"}
              isDisabled={!hasProvided}
              size="sm"
              variant="light"
              className={`min-w-28 font-semibold ${perspective === "provided" ? "bg-emerald-600 text-white hover:bg-emerald-700" : ""}`}
              onPress={() => onPerspectiveChange("provided")}
            >
              Providing
            </Button>
          </div>
          {(!hasProvided || !hasSought) && <Button size="sm" variant="light" className="font-semibold text-primary sm:justify-end" onPress={() => router.push("/dashboard/company")}>Configure missing profile</Button>}
        </div>
      </section>

      {model.showFunctions && (
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
                const definition = getPreviewDefinition(fn.slug, perspective);
                if (!definition) return null;
                const context = getCompanyFunctionRoleContext(fn.slug, perspective);
                const workspaceKind = getAssociateWorkspaceKind(normalizePreviewFunctionSlug(fn.slug), perspective);
                const capabilityStat = workspaceKind ? model.capabilityStats[workspaceKind] : null;
                const visibleActions = definition.actions.slice(0, 3);
                const primaryAction = visibleActions.find((action) => action.primary) || visibleActions[0];
                const secondaryActions = visibleActions.filter((action) => action !== primaryAction).slice(0, 2);
                return (
                  <Card key={`summary-${fn._id}`} className={`border shadow-sm ${perspectiveAccent}`}>
                    <CardBody className="flex h-full flex-col gap-4 p-5 sm:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-black text-foreground">{definition.name}</h3>
                            {fn.priorityRank ? <span className="rounded-full bg-content2 px-2.5 py-1 text-xs font-semibold text-default-600">Priority {fn.priorityRank}</span> : null}
                            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${isSeeking ? "bg-blue-500/15 text-blue-700 dark:text-blue-300" : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"}`}>{context.perspectiveLabel}</span>
                          </div>
                          <p className={`mt-2 text-sm font-semibold ${perspectiveText}`}>{context.roleLabel}</p>
                          <p className="mt-1 text-sm leading-6 text-default-600">{context.explanation}</p>
                        </div>
                      </div>
                      {capabilityStat ? (
                        <button
                          type="button"
                          onClick={() => router.push(capabilityStat.href)}
                          className="flex w-full items-center justify-between gap-3 rounded-xl border border-default-200 bg-content1/70 px-4 py-3 text-left transition-colors hover:bg-content1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          <span><span className="text-xl font-black text-foreground">{capabilityStat.value.toLocaleString()}</span><span className="ml-2 text-sm font-semibold text-default-600">{capabilityStat.label}</span></span>
                          <LuArrowRight className="shrink-0 text-default-400" aria-hidden="true" />
                        </button>
                      ) : null}
                      <div className="mt-auto flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                        {primaryAction ? <Button className={`min-h-10 font-bold ${perspectiveButton}`} endContent={<LuArrowRight />} onPress={() => router.push(primaryAction.href)}>{primaryAction.label}</Button> : null}
                        {secondaryActions.map((action) => <Button key={`${fn._id}-${action.href}-${action.label}`} variant="light" className={`min-h-10 justify-start font-semibold ${perspectiveText}`} endContent={<LuArrowRight />} onPress={() => router.push(action.href)}>{action.label}</Button>)}
                      </div>
                    </CardBody>
                  </Card>
                );
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
            <p className="text-xs font-bold uppercase tracking-widest text-default-500">{model.attentionAction.eyebrow}</p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-foreground sm:text-2xl">{model.attentionAction.title}</h2>
            <p className="mt-2 text-sm leading-6 text-default-600">{model.attentionAction.description}</p>
          </div>
          <Button color={model.attentionAction.tone} className="min-h-11 shrink-0 font-bold" endContent={<LuArrowRight />} onPress={() => router.push(model.attentionAction.href)}>{model.attentionAction.label}</Button>
        </CardBody>
      </Card>}
    </div>
  );
}
