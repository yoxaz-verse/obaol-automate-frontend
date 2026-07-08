"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import type { IconType } from "react-icons";
import { FiArrowRight, FiBriefcase, FiGlobe, FiLayers, FiShield, FiUsers } from "react-icons/fi";

const associateExamples = [
  "Trader",
  "Importer / Exporter",
  "Supplier",
  "Manufacturer",
  "Logistics Provider",
  "Freight Forwarder",
  "Warehouse",
  "Quality Lab",
  "Packaging",
  "Customs",
  "Finance",
  "Procurement",
] as const;

const roleOptions = [
  {
    role: "Associate",
    kicker: "Business network",
    title: "Register your company into the trade layer",
    description:
      "For businesses that buy, sell, move, inspect, finance, package, or support commodities across the OBAOL network.",
    href: "/auth/register",
    detailHref: "/roles/associate",
    detailLabel: "Explore Associate roles",
    requirement: "Registered company required",
    icon: FiGlobe,
    aura: "from-obaol-500/25 via-obaol-500/10 to-transparent",
    stats: ["Company profile", "Trade capabilities", "Network visibility"],
    examples: associateExamples,
  },
  {
    role: "Operator",
    kicker: "Execution desk",
    title: "Become the person who moves trade forward",
    description:
      "For individuals who build company portfolios, develop buyer and supplier relationships, and coordinate trade execution through OBAOL.",
    href: "/auth/operator/register",
    detailHref: "/roles/operator",
    detailLabel: "Learn how Operators work",
    requirement: "Individual role, no company account required",
    icon: FiBriefcase,
    aura: "from-cyan-400/20 via-emerald-400/10 to-transparent",
    stats: ["Portfolio building", "Relationship execution", "Deal coordination"],
    note: "Independent trade-execution role. Not an internal operations or employee login.",
  },
] as const;

const signInOptions = [
  {
    label: "Associate account",
    title: "Enter your company network",
    description: "For registered businesses managing commodities, services, documents, and trade activity.",
    href: "/auth/associate",
    icon: FiUsers,
    metadata: "Company identity",
  },
  {
    label: "Operator account",
    title: "Open your operator console",
    description: "For individuals managing company relationships, portfolios, and execution follow-through.",
    href: "/auth/operator",
    icon: FiLayers,
    metadata: "Individual operator",
  },
] as const;

const entrySignals = [
  "Commodity discovery",
  "Verified partners",
  "Execution workflows",
  "Documents and orders",
] as const;

const MotionLink = motion.create(Link);

function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#060504]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:12px_12px]" />
      <div className="absolute left-[8%] top-[12%] h-72 w-72 rounded-full bg-obaol-500/15 blur-[120px]" />
      <div className="absolute bottom-[-12%] right-[12%] h-96 w-96 rounded-full bg-cyan-400/10 blur-[150px]" />
      <div className="absolute right-[-10%] top-[8%] h-80 w-80 rounded-full bg-emerald-400/10 blur-[140px]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-obaol-500/10 to-transparent" />
      <motion.div
        aria-hidden="true"
        className="absolute left-0 top-24 h-px w-full bg-gradient-to-r from-transparent via-obaol-400/40 to-transparent"
        animate={{ opacity: [0.18, 0.55, 0.18], x: ["-8%", "8%", "-8%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function IconBadge({ icon: Icon }: { icon: IconType }) {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-obaol-300 shadow-lg shadow-black/20">
      <Icon className="text-lg" />
    </div>
  );
}

export default function AuthEntry() {
  const searchParams = useSearchParams();
  const signInView = searchParams.get("view") === "signin";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060504] px-4 py-6 text-white md:px-8 md:py-8">
      <AmbientBackground />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl flex-col">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" aria-label="OBAOL home" className="group flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-obaol-400/25 bg-obaol-500/10 transition-transform duration-500 group-hover:scale-105">
              <Image src="/logo.png" alt="OBAOL" width={34} height={34} priority />
            </span>
            <span className="hidden flex-col sm:flex">
              <span className="text-sm font-black uppercase tracking-[0.24em] text-white">OBAOL</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/40">Agro trade execution</span>
            </span>
          </Link>
          <Link
            href="/how-it-works"
            className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-bold text-white/60 transition hover:border-obaol-400/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-obaol-400"
          >
            How OBAOL works
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:py-12" aria-labelledby="auth-entry-title">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
            className="max-w-2xl"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-obaol-400/20 bg-obaol-500/10 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-obaol-400 shadow-[0_0_18px_rgba(207,152,60,0.8)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.28em] text-obaol-200">
                {signInView ? "Secure account access" : "Choose your OBAOL lane"}
              </span>
            </div>

            <h1 id="auth-entry-title" className="text-4xl font-black leading-[0.95] tracking-tight text-white md:text-6xl xl:text-7xl">
              {signInView ? "Step back into your trade command." : "Enter the network where trade becomes executable."}
            </h1>
            <p className="mt-6 max-w-xl text-base font-medium leading-8 text-white/60 md:text-lg">
              {signInView
                ? "Choose the account lane you already use. Company teams and individual Operators enter different workspaces."
                : "Start with who you are in the ecosystem. OBAOL shapes the next steps around your company, your relationships, and the work you are here to move."}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {entrySignals.map((signal, index) => (
                <motion.div
                  key={signal}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.08 * index }}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 backdrop-blur"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">Layer {index + 1}</p>
                  <p className="mt-1 text-sm font-bold text-white/80">{signal}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 22 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative"
          >
            <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-obaol-500/20 via-white/[0.03] to-cyan-400/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d0b08]/88 p-4 shadow-2xl shadow-black/50 backdrop-blur-2xl md:p-6">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4 px-1">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-obaol-300">
                    {signInView ? "Choose your account" : "Select your path"}
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-white md:text-3xl">
                    {signInView ? "Where should we take you?" : "Two doors. One trade layer."}
                  </h2>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                  <FiShield className="text-obaol-300" />
                  Secure
                </div>
              </div>

              {signInView ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {signInOptions.map((option, index) => (
                    <MotionLink
                      key={option.label}
                      href={option.href}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: 0.1 + index * 0.08 }}
                      className="group relative min-h-[230px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5 transition duration-500 hover:-translate-y-1 hover:border-obaol-400/40 hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-obaol-400"
                    >
                      <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-obaol-500/15 blur-3xl transition duration-500 group-hover:bg-obaol-400/25" />
                      <div className="relative flex h-full flex-col">
                        <IconBadge icon={option.icon} />
                        <p className="mt-5 text-[10px] font-black uppercase tracking-[0.24em] text-obaol-300">{option.label}</p>
                        <h3 className="mt-2 text-xl font-black leading-tight text-white">{option.title}</h3>
                        <p className="mt-3 text-sm font-medium leading-6 text-white/60">{option.description}</p>
                        <div className="mt-auto flex items-center justify-between pt-6">
                          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">{option.metadata}</span>
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-obaol-500 text-obaol-950 transition duration-500 group-hover:scale-105 group-hover:bg-obaol-300">
                            <FiArrowRight />
                          </span>
                        </div>
                      </div>
                    </MotionLink>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 xl:grid-cols-2">
                  {roleOptions.map((option, index) => (
                    <motion.article
                      key={option.role}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: 0.1 + index * 0.08 }}
                      className="group relative flex min-h-[480px] flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5 transition duration-500 hover:-translate-y-1 hover:border-obaol-400/40 hover:bg-white/[0.055]"
                    >
                      <div className={`absolute -right-20 -top-20 h-48 w-48 rounded-full bg-gradient-to-br ${option.aura} blur-3xl transition duration-700 group-hover:scale-125`} />
                      <div className="relative flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-4">
                          <IconBadge icon={option.icon} />
                          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[9px] font-black uppercase tracking-[0.22em] text-white/50">
                            {option.kicker}
                          </span>
                        </div>

                        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.25em] text-obaol-300">{option.role}</p>
                        <h3 className="mt-2 text-2xl font-black leading-tight text-white">{option.title}</h3>
                        <p className="mt-4 text-sm font-medium leading-6 text-white/60">{option.description}</p>

                        <div className="mt-5 grid gap-2">
                          {option.stats.map((stat) => (
                            <div key={stat} className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-obaol-400" />
                              <span className="text-xs font-bold text-white/60">{stat}</span>
                            </div>
                          ))}
                        </div>

                        {"examples" in option ? (
                          <div className="mt-5 flex flex-wrap gap-2" aria-label="Examples of Associate businesses">
                            {option.examples.slice(0, 8).map((example) => (
                              <span key={example} className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold text-white/60">
                                {example}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-5 rounded-2xl border border-obaol-400/20 bg-obaol-500/10 p-3 text-xs font-semibold leading-5 text-white/60">
                            {option.note}
                          </p>
                        )}

                        <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-white/40">{option.requirement}</p>

                        <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row sm:items-center">
                          <Link
                            href={option.href}
                            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-obaol-500 px-4 py-2 text-sm font-black text-obaol-950 transition hover:bg-obaol-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-obaol-400"
                          >
                            Continue as {option.role}
                            <FiArrowRight className="ml-2" />
                          </Link>
                          <Link
                            href={option.detailHref}
                            className="inline-flex min-h-10 items-center justify-center rounded-xl px-2 text-sm font-bold text-obaol-200 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-obaol-400"
                          >
                            {option.detailLabel}
                          </Link>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm">
                {signInView ? (
                  <>
                    <span className="font-medium text-white/50">New to OBAOL?</span>
                    <Link href="/auth" className="font-black text-obaol-300 transition hover:text-white">
                      Choose your role
                    </Link>
                  </>
                ) : (
                  <>
                    <span className="font-medium text-white/50">Already registered?</span>
                    <Link href="/auth?view=signin" className="font-black text-obaol-300 transition hover:text-white">
                      Sign in
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
