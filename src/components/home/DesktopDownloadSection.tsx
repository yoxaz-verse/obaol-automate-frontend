"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaApple, FaWindows } from "react-icons/fa";
import { FiArrowDown, FiArrowRight, FiGlobe, FiShield } from "react-icons/fi";

const WINDOWS_DOWNLOAD_URL = process.env.NEXT_PUBLIC_WINDOWS_DESKTOP_URL
  || "https://github.com/yoxaz-verse/obaol-automate-frontend/releases/latest/download/OBAOL-Supreme-Windows-x64.exe";
const MACOS_DOWNLOAD_URL = process.env.NEXT_PUBLIC_MACOS_DESKTOP_URL
  || "https://github.com/yoxaz-verse/obaol-automate-frontend/releases/latest/download/OBAOL-Supreme-macOS-Universal.dmg";

type DesktopPlatform = "windows" | "macos" | "other";

function detectPlatform(): DesktopPlatform {
  if (typeof navigator === "undefined") return "other";
  const platform = `${navigator.userAgent} ${navigator.platform}`.toLowerCase();
  if (platform.includes("win")) return "windows";
  if (platform.includes("mac")) return "macos";
  return "other";
}

function trackDownload(platform: Exclude<DesktopPlatform, "other">) {
  const event = { event: "desktop_download", desktop_platform: platform, release_channel: "beta" };
  const windowWithDataLayer = window as Window & { dataLayer?: Array<Record<string, unknown>> };
  windowWithDataLayer.dataLayer?.push(event);
}

const downloads = [
  {
    platform: "windows" as const,
    title: "Windows application",
    detail: "Windows 10/11 installer · 64-bit",
    action: "Download for Windows",
    href: WINDOWS_DOWNLOAD_URL,
    icon: FaWindows,
  },
  {
    platform: "macos" as const,
    title: "macOS application",
    detail: "Installer for Intel and Apple silicon",
    action: "Download for macOS",
    href: MACOS_DOWNLOAD_URL,
    icon: FaApple,
  },
];

export default function DesktopDownloadSection() {
  const [preferredPlatform, setPreferredPlatform] = useState<DesktopPlatform>("other");

  useEffect(() => setPreferredPlatform(detectPlatform()), []);

  return (
    <section aria-labelledby="desktop-download-title" className="relative overflow-hidden border-y border-default-200/70 bg-content1/80 py-10 md:py-14 public-standard-section">
      <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-[36rem] -translate-x-1/2 rounded-full bg-obaol-500/[0.08] blur-[90px] public-decoration" />
      <div className="container relative z-10 mx-auto max-w-6xl px-6 sm:px-12 public-layout-container">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-obaol-700 dark:text-obaol-300">Available on desktop and web</p>
            <h2 id="desktop-download-title" className="mt-2 text-2xl font-black tracking-[-0.03em] text-foreground md:text-3xl">
              Choose how you use OBAOL
            </h2>
          </div>
          <p className="max-w-xl text-sm font-medium leading-relaxed text-default-500 md:text-right md:text-base">
            Install the desktop beta for workspace notifications, or continue securely in your browser.
          </p>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {downloads.map((download) => {
            const Icon = download.icon;
            const preferred = preferredPlatform === download.platform;
            return (
              <article
                key={download.platform}
                className={`relative flex min-h-56 flex-col rounded-[1.5rem] border p-5 transition-all duration-300 md:p-6 ${preferred ? "border-obaol-500/55 bg-obaol-500/[0.08] shadow-[0_18px_55px_rgba(207,152,60,0.12)]" : "border-default-200 bg-background/80"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-default-200 bg-content1 text-xl text-foreground">
                    <Icon aria-hidden="true" />
                  </span>
                  <div className="flex flex-wrap justify-end gap-2">
                    <span className="rounded-full border border-warning-500/25 bg-warning-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-warning-700 dark:text-warning-400">Beta</span>
                    {preferred && <span className="rounded-full bg-obaol-500 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-obaol-950">Recommended</span>}
                  </div>
                </div>
                <h3 className="mt-5 text-lg font-bold tracking-tight text-foreground md:text-xl">{download.title}</h3>
                <p className="mt-2 text-sm font-medium text-default-500">{download.detail}</p>
                <a
                  href={download.href}
                  onClick={() => trackDownload(download.platform)}
                  className="mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-black text-background transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-obaol-500"
                  aria-label={`${download.action}, beta installer`}
                >
                  <FiArrowDown aria-hidden="true" /> {download.action}
                </a>
              </article>
            );
          })}

          <article className="flex min-h-56 flex-col rounded-[1.5rem] border border-default-200 bg-background/80 p-5 md:p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-obaol-500/25 bg-obaol-500/10 text-xl text-obaol-700 dark:text-obaol-300">
              <FiGlobe aria-hidden="true" />
            </span>
            <h3 className="mt-5 text-lg font-bold tracking-tight text-foreground md:text-xl">Use OBAOL online</h3>
            <p className="mt-2 text-sm font-medium text-default-500">No installation required · Sign up or sign in</p>
            <Link
              href="/auth"
              className="mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-obaol-500/35 bg-obaol-500/10 px-4 py-2.5 text-sm font-black text-obaol-800 transition-all hover:-translate-y-0.5 hover:bg-obaol-500 hover:text-obaol-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-obaol-500 dark:text-obaol-200"
            >
              Continue online <FiArrowRight aria-hidden="true" />
            </Link>
          </article>
        </div>

        <div className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-default-500">
          <FiShield aria-hidden="true" className="mt-0.5 shrink-0 text-warning-600" />
          <p>Desktop installers are currently unsigned beta software. Windows SmartScreen or macOS Gatekeeper may ask you to confirm that you trust OBAOL.</p>
        </div>
      </div>
    </section>
  );
}
