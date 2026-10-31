"use client";

import { useEffect, useState } from "react";
import { FaApple, FaWindows } from "react-icons/fa";
import { FiArrowDown, FiShield } from "react-icons/fi";

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
    title: "Download for Windows",
    detail: "Windows 10/11 · 64-bit",
    href: WINDOWS_DOWNLOAD_URL,
    icon: FaWindows,
  },
  {
    platform: "macos" as const,
    title: "Download for macOS",
    detail: "Intel and Apple silicon",
    href: MACOS_DOWNLOAD_URL,
    icon: FaApple,
  },
];

export default function DesktopDownloadSection() {
  const [preferredPlatform, setPreferredPlatform] = useState<DesktopPlatform>("other");

  useEffect(() => setPreferredPlatform(detectPlatform()), []);

  return (
    <section aria-labelledby="desktop-download-title" className="relative overflow-hidden border-t border-default-100 bg-content1 py-16 md:py-24 public-standard-section">
      <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-obaol-500/10 blur-[100px] public-decoration" />
      <div className="container relative z-10 mx-auto max-w-7xl px-4 md:px-6 public-layout-container">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-obaol-500/25 bg-obaol-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-obaol-700 dark:text-obaol-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-obaol-500" /> Desktop beta
          </span>
          <h2 id="desktop-download-title" className="mt-6 text-4xl font-black tracking-[-0.04em] text-foreground md:text-6xl">
            Your OBAOL workspace, on your desktop.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-relaxed text-default-500 md:text-xl">
            Stay connected to the live platform and receive workspace notifications from a dedicated Windows or macOS application.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
          {downloads.map((download) => {
            const Icon = download.icon;
            const preferred = preferredPlatform === download.platform;
            return (
              <article
                key={download.platform}
                className={`relative rounded-[2rem] border p-7 transition-all duration-300 md:p-9 ${preferred ? "border-obaol-500/50 bg-obaol-500/[0.08] shadow-[0_20px_70px_rgba(207,152,60,0.12)]" : "border-default-200 bg-background"}`}
              >
                {preferred && <span className="absolute right-5 top-5 rounded-full bg-obaol-500 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-obaol-950">Recommended</span>}
                <Icon aria-hidden="true" className="text-4xl text-foreground" />
                <h3 className="mt-7 text-2xl font-bold tracking-tight text-foreground">{download.title}</h3>
                <p className="mt-2 text-sm font-medium text-default-500">{download.detail}</p>
                <a
                  href={download.href}
                  onClick={() => trackDownload(download.platform)}
                  className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl bg-foreground px-5 py-3 font-black text-background transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-obaol-500"
                  aria-label={`${download.title}, beta installer`}
                >
                  <FiArrowDown aria-hidden="true" /> Download beta
                </a>
              </article>
            );
          })}
        </div>

        <div className="mx-auto mt-7 flex max-w-3xl items-start gap-3 rounded-2xl border border-warning-500/20 bg-warning-500/[0.06] px-5 py-4 text-sm leading-relaxed text-default-600">
          <FiShield aria-hidden="true" className="mt-0.5 shrink-0 text-lg text-warning-600" />
          <p><strong className="text-foreground">Beta notice:</strong> These installers are currently unsigned. Windows SmartScreen or macOS Gatekeeper may ask you to confirm that you trust OBAOL before opening the application.</p>
        </div>
      </div>
    </section>
  );
}
