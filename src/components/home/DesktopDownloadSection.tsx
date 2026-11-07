"use client";

import Link from "next/link";
import { FaApple, FaWindows } from "react-icons/fa";
import { FiArrowDown, FiArrowRight, FiGlobe, FiShield } from "react-icons/fi";

const WINDOWS_DOWNLOAD_URL = process.env.NEXT_PUBLIC_WINDOWS_DESKTOP_URL
  || "https://github.com/yoxaz-verse/obaol-automate-desktop/releases/latest/download/OBAOL-Supreme-Windows-x64.exe";
const MACOS_DOWNLOAD_URL = process.env.NEXT_PUBLIC_MACOS_DESKTOP_URL
  || "https://github.com/yoxaz-verse/obaol-automate-desktop/releases/latest/download/OBAOL-Supreme-macOS-Universal.dmg";

type DownloadPlatform = "windows" | "macos";

function trackDownload(platform: DownloadPlatform) {
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
    desktopOrder: "md:order-1",
  },
  {
    platform: "macos" as const,
    title: "macOS application",
    detail: "Installer for Intel and Apple silicon",
    action: "Download for macOS",
    href: MACOS_DOWNLOAD_URL,
    icon: FaApple,
    desktopOrder: "md:order-2",
  },
];

const cardClassName = "relative grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 rounded-2xl border border-default-200 bg-background/80 p-3.5 md:flex md:min-h-56 md:flex-col md:items-stretch md:rounded-[1.5rem] md:p-6";
const iconClassName = "flex h-9 w-9 items-center justify-center rounded-xl border border-default-200 bg-content1 text-base text-foreground md:h-11 md:w-11 md:rounded-2xl md:text-xl";
const buttonClassName = "col-span-2 mt-1 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-foreground px-3 py-2 text-xs font-black text-background transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-obaol-500 md:mt-auto md:min-h-11 md:px-4 md:py-2.5 md:text-sm";

export default function DesktopDownloadSection() {
  return (
    <section aria-labelledby="desktop-download-title" className="relative overflow-hidden border-y border-default-200/70 bg-content1/80 py-7 md:py-14 public-standard-section">
      <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-[36rem] -translate-x-1/2 rounded-full bg-obaol-500/[0.08] blur-[90px] public-decoration" />
      <div className="container relative z-10 mx-auto max-w-6xl px-4 sm:px-12 public-layout-container">
        <div className="flex flex-col justify-between gap-2 md:flex-row md:items-end md:gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-obaol-700 dark:text-obaol-300 md:text-xs md:tracking-[0.2em]">Available on desktop and web</p>
            <h2 id="desktop-download-title" className="mt-1 text-xl font-black tracking-[-0.03em] text-foreground md:mt-2 md:text-3xl">
              Choose how you use OBAOL
            </h2>
          </div>
          <p className="max-w-xl text-xs font-medium leading-relaxed text-default-500 md:text-right md:text-base">
            Install the desktop beta for workspace notifications, or continue securely in your browser.
          </p>
        </div>

        <div className="mt-4 grid gap-2.5 md:mt-7 md:grid-cols-3 md:gap-4">
          <article className={`${cardClassName} order-1 md:order-3`}>
            <span className={iconClassName}>
              <FiGlobe aria-hidden="true" />
            </span>
            <div className="min-w-0 md:mt-5">
              <h3 className="text-sm font-bold tracking-tight text-foreground md:text-xl">Use OBAOL online</h3>
              <p className="mt-0.5 text-xs font-medium text-default-500 md:mt-2 md:text-sm">No installation required · Sign up or sign in</p>
            </div>
            <Link href="/auth" className={buttonClassName}>
              Continue online <FiArrowRight aria-hidden="true" />
            </Link>
          </article>

          {downloads.map((download, index) => {
            const Icon = download.icon;
            return (
              <article key={download.platform} className={`${cardClassName} ${index === 0 ? "order-2" : "order-3"} ${download.desktopOrder}`}>
                <span className={iconClassName}>
                  <Icon aria-hidden="true" />
                </span>
                <div className="flex min-w-0 items-start justify-between gap-2 md:mt-5 md:block">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold tracking-tight text-foreground md:text-xl">{download.title}</h3>
                    <p className="mt-0.5 text-xs font-medium text-default-500 md:mt-2 md:text-sm">{download.detail}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-warning-500/25 bg-warning-500/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-warning-700 dark:text-warning-400 md:absolute md:right-6 md:top-6 md:px-2.5 md:py-1 md:text-[9px]">Beta</span>
                </div>
                <a
                  href={download.href}
                  onClick={() => trackDownload(download.platform)}
                  className={buttonClassName}
                  aria-label={`${download.action}, beta installer`}
                >
                  <FiArrowDown aria-hidden="true" /> {download.action}
                </a>
              </article>
            );
          })}
        </div>

        <div className="mt-3 flex items-start gap-2 text-[10px] leading-relaxed text-default-500 md:mt-4 md:text-xs">
          <FiShield aria-hidden="true" className="mt-0.5 shrink-0 text-warning-600" />
          <p>Desktop installers are currently unsigned beta software. Windows SmartScreen or macOS Gatekeeper may ask you to confirm that you trust OBAOL.</p>
        </div>
      </div>
    </section>
  );
}
