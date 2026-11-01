"use client";

import { useContext, useMemo } from "react";
import { Button, Chip } from "@nextui-org/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiArrowLeft, FiBriefcase, FiHome, FiInfo, FiLock } from "react-icons/fi";
import AuthContext from "@/context/AuthContext";
import { useSidebarGovernance } from "@/hooks/useSidebarGovernance";
import { getDashboardRoute, isDashboardAccessReason, normalizeDashboardRole, resolveDashboardAccessTarget } from "@/utils/dashboardAccess";

const humanize = (value: string) => value
  .replace(/[-_]+/g, " ")
  .replace(/\b\w/g, (character) => character.toUpperCase());

export default function DashboardAccessInfoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useContext(AuthContext);
  const governance = useSidebarGovernance();
  const target = resolveDashboardAccessTarget(searchParams.get("target"));
  const rawReason = searchParams.get("reason");
  const reason = isDashboardAccessReason(rawReason) ? rawReason : "company-function";
  const route = target ? getDashboardRoute(target) : null;
  const audience = target ? governance.getRouteAudience(route?.activeParent || route?.breadcrumbParent || route?.path || target) : [];
  const provided = user?.providedCapabilities || [];
  const sought = user?.soughtCapabilities || [];
  const isAssociate = normalizeDashboardRole(user?.role) === "associate";

  const audienceGroups = useMemo(() => ({
    seeking: Array.from(new Set(audience.filter((item) => item.placement === "SEEKING").map((item) => item.functionSlug))),
    providing: Array.from(new Set(audience.filter((item) => item.placement === "PROVIDING").map((item) => item.functionSlug))),
  }), [audience]);

  const title = reason === "coming-soon"
    ? `${route?.label || "This workspace"} is coming soon`
    : `${route?.label || "This workspace"} is not part of your current access`;
  const description = reason === "role"
    ? `This workspace is reserved for ${route?.roles.map(humanize).join(", ") || "specific staff roles"}. Your account has a different role.`
    : reason === "coming-soon"
      ? "This workspace has been planned for your company functions, but it is not available yet. Nothing is wrong with your account."
      : "This destination belongs to company functions that are not currently configured for your account. Nothing is broken—you are seeing the workspace from a different company perspective.";

  return (
    <div className="mx-auto flex min-h-[65vh] w-full max-w-4xl items-center py-6 sm:py-10">
      <section className="w-full overflow-hidden rounded-3xl border db-border-subtle bg-background shadow-sm">
        <div className="border-b db-border-subtle bg-obaol-500/[0.06] px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-obaol-500/25 bg-obaol-500/10 text-obaol-700 dark:text-obaol-300">
            {reason === "role" ? <FiLock size={23} /> : <FiInfo size={24} />}
          </div>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-obaol-700 dark:text-obaol-300">Workspace guidance</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 db-muted sm:text-base">{description}</p>
        </div>

        <div className="grid gap-5 p-5 sm:p-8 lg:grid-cols-2">
          {reason === "company-function" && (
            <div className="rounded-2xl border db-border-subtle db-inset p-5">
              <h2 className="text-sm font-black text-foreground">Who this workspace is for</h2>
              {audienceGroups.providing.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-default-500">Providers</p>
                  <div className="mt-2 flex flex-wrap gap-2">{audienceGroups.providing.map((slug) => <Chip key={`provider-${slug}`} size="sm" color="warning" variant="flat">{humanize(slug)}</Chip>)}</div>
                </div>
              )}
              {audienceGroups.seeking.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-default-500">Seekers</p>
                  <div className="mt-2 flex flex-wrap gap-2">{audienceGroups.seeking.map((slug) => <Chip key={`seeker-${slug}`} size="sm" color="primary" variant="flat">{humanize(slug)}</Chip>)}</div>
                </div>
              )}
              {!audience.length && <p className="mt-3 text-sm db-muted">This workspace is not assigned to any of your current company functions.</p>}
            </div>
          )}

          {reason === "company-function" && isAssociate && (
            <div className="rounded-2xl border db-border-subtle db-inset p-5">
              <h2 className="text-sm font-black text-foreground">Your current company perspective</h2>
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-default-500">Providing</p>
              <div className="mt-2 flex flex-wrap gap-2">{provided.length ? provided.map((slug) => <Chip key={`current-provider-${slug}`} size="sm" variant="bordered">{humanize(slug)}</Chip>) : <span className="text-sm db-muted">None configured</span>}</div>
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-default-500">Seeking</p>
              <div className="mt-2 flex flex-wrap gap-2">{sought.length ? sought.map((slug) => <Chip key={`current-seeker-${slug}`} size="sm" variant="bordered">{humanize(slug)}</Chip>) : <span className="text-sm db-muted">None configured</span>}</div>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t db-border-subtle px-5 py-5 sm:flex-row sm:items-center sm:px-8">
          <Button variant="light" startContent={<FiArrowLeft />} onPress={() => router.back()}>Back</Button>
          <Button variant="bordered" startContent={<FiHome />} onPress={() => router.push("/dashboard")}>Return to dashboard</Button>
          {reason === "company-function" && isAssociate && (
            <Button color="warning" startContent={<FiBriefcase />} className="sm:ml-auto" onPress={() => router.push("/dashboard/company")}>Update company functions</Button>
          )}
        </div>
      </section>
    </div>
  );
}
