"use client";

import { useContext } from "react";
import Link from "next/link";
import { FiArrowRight, FiBell, FiBriefcase, FiCommand, FiDownload, FiSettings, FiUser } from "react-icons/fi";
import PageHeader from "@/components/ui/PageHeader";
import { DashboardPage, DashboardPanel, DashboardSectionHeader } from "@/components/dashboard/DashboardUI";
import AuthContext from "@/context/AuthContext";
import { InstallAppButton } from "@/components/pwa/PwaRuntime";
import { usePwaInstall } from "@/context/PwaInstallContext";

const settingsLinks = [
  {
    title: "My Company",
    description: "Review your company profile and update what your company provides, what it is seeking, priorities, verification, and service details.",
    href: "/dashboard/company",
    icon: FiBriefcase,
    associateOnly: true,
  },
  {
    title: "Notifications",
    description: "View workspace alerts, updates, and activity that may need your attention.",
    href: "/dashboard/notifications",
    icon: FiBell,
    associateOnly: false,
  },
  {
    title: "Profile",
    description: "Manage your personal account details and sign-in security.",
    href: "/dashboard/profile",
    icon: FiUser,
    associateOnly: false,
  },
  {
    title: "Keyboard Shortcuts",
    description: "Customize the quick commands used to navigate your dashboard.",
    href: "/dashboard/shortcuts",
    icon: FiCommand,
    associateOnly: false,
  },
];

export default function SettingsPage() {
  const { user } = useContext(AuthContext);
  const { isStandalone } = usePwaInstall();
  const isAssociate = String(user?.role || "").toLowerCase() === "associate";
  const visibleSettingsLinks = settingsLinks.filter((item) => !item.associateOnly || isAssociate);

  return (
    <DashboardPage className="py-3 sm:py-5">
      <PageHeader
        title="Settings"
        description="Manage your account preferences and personalize your OBAOL workspace."
        breadcrumbs={[{ label: "Overview", href: "/dashboard" }, { label: "Company & account" }, { label: "Settings" }]}
      />

      <DashboardPanel className="overflow-hidden">
        <div className="flex items-start gap-4 border-b db-border-subtle px-5 py-5 sm:px-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-obaol-500/20 bg-obaol-500/10 text-obaol-700 dark:text-obaol-300">
            <FiSettings size={21} />
          </div>
          <DashboardSectionHeader
            title="Account settings"
            description="Choose an area to review or update. More settings can be added here as the workspace grows."
          />
        </div>

        <div className="grid grid-cols-1 gap-4 p-4 sm:p-6 lg:grid-cols-2">
          <section className="flex min-h-40 flex-col rounded-2xl border db-border-subtle db-inset p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-300"><FiDownload size={22} /></div>
              {isStandalone && <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">Installed</span>}
            </div>
            <div className="mt-5"><h2 className="text-lg font-semibold">Install OBAOL</h2><p className="mt-2 text-sm leading-6 db-muted">Add OBAOL to your Home Screen for a full-screen, app-like workspace.</p></div>
            <div className="mt-4"><InstallAppButton /></div>
          </section>
          {visibleSettingsLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex min-h-40 flex-col rounded-2xl border db-border-subtle db-inset p-5 transition-all hover:-translate-y-0.5 hover:border-obaol-500/40 hover:bg-obaol-500/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-obaol-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-black sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-obaol-500/20 bg-obaol-500/10 text-obaol-700 transition-transform group-hover:scale-105 dark:text-obaol-300">
                    <Icon size={22} />
                  </div>
                  <FiArrowRight className="mt-1 text-default-400 transition-transform group-hover:translate-x-1 group-hover:text-obaol-600" size={20} />
                </div>
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-foreground">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 db-muted">{item.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </DashboardPanel>
    </DashboardPage>
  );
}
