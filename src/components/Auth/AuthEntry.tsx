import Link from "next/link";
import Image from "next/image";
import type { IconType } from "react-icons";
import { FiArrowRight, FiBriefcase, FiGlobe } from "react-icons/fi";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

const roleOptions = [
  {
    role: "Associate",
    audience: "For companies and trade businesses",
    href: "/auth/register",
    signInHref: "/auth/associate",
    detailHref: "/roles/associate",
    icon: FiGlobe,
  },
  {
    role: "Operator",
    audience: "For OBAOL-approved execution specialists",
    href: "/auth/operator/register",
    signInHref: "/auth/operator",
    detailHref: "/roles/operator",
    icon: FiBriefcase,
  },
] as const;

const tradeFlow = [
  "Commodity discovery",
  "Verified partners",
  "Execution workflows",
  "Documents and orders",
] as const;

function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#f6f3ed] dark:bg-[#060504]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e12080a_1px,transparent_1px),linear-gradient(to_bottom,#1e120807_1px,transparent_1px)] bg-[size:56px_56px] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)]" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/90 to-transparent dark:from-obaol-500/10" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-obaol-50/80 to-transparent dark:from-black/25" />
      <div
        aria-hidden="true"
        className="absolute left-0 top-20 hidden h-px w-full animate-pulse bg-gradient-to-r from-transparent via-obaol-500/30 to-transparent dark:via-obaol-400/40 motion-reduce:animate-none sm:block"
      />
    </div>
  );
}

function IconBadge({ icon: Icon }: { icon: IconType }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-obaol-500/20 bg-obaol-500/10 text-obaol-700 shadow-sm shadow-obaol-950/5 dark:border-white/10 dark:bg-white/[0.05] dark:text-obaol-300 dark:shadow-black/20 sm:h-11 sm:w-11">
      <Icon className="text-lg" />
    </div>
  );
}

export default function AuthEntry({ signInView = false, prefill }: { signInView?: boolean; prefill?: string }) {
  return (
    <main className="relative min-h-[100dvh] bg-[#f6f3ed] px-4 py-4 text-obaol-950 dark:bg-[#060504] dark:text-white sm:px-6 sm:py-6">
      <AmbientBackground />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" aria-label="OBAOL home" className="group flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-obaol-500/20 bg-white shadow-sm transition-transform duration-500 group-hover:scale-105 dark:border-obaol-400/25 dark:bg-obaol-500/10">
              <Image src="/logo.png" alt="OBAOL" width={34} height={34} priority />
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-black uppercase text-obaol-950 dark:text-white">OBAOL</span>
              <span className="hidden text-[9px] font-bold uppercase text-obaol-950/50 dark:text-white/40 sm:inline">Agro trade execution</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <div>
              <ThemeSwitcher />
            </div>
            <Link
              href="/how-it-works"
              className="inline-flex min-h-10 items-center rounded-lg border border-obaol-950/10 bg-white px-3 py-2 text-xs font-bold text-obaol-950/60 shadow-sm transition hover:border-obaol-500/35 hover:text-obaol-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-obaol-400 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/60 dark:hover:border-obaol-400/40 dark:hover:text-white sm:px-4"
            >
              How it works
            </Link>
          </div>
        </header>

        <section className="pt-5 sm:pt-7" aria-labelledby="auth-entry-title">
          <div className="mb-4">
            <h1 id="auth-entry-title" className="text-2xl font-black leading-tight text-obaol-950 dark:text-white sm:text-3xl">
              {signInView ? "Access your account" : "Choose your account"}
            </h1>
            <p className="mt-2 text-sm leading-5 text-obaol-950/70 dark:text-white/70">
              Register or sign in with the role that fits you.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            {roleOptions.map((option) => (
              <article
                key={option.role}
                className={`flex min-w-0 flex-col rounded-xl border p-4 sm:p-5 ${
                  option.role === "Associate"
                    ? "border-obaol-500/40 bg-white shadow-sm dark:border-obaol-300/40 dark:bg-obaol-500/[0.08]"
                    : "border-obaol-950/15 bg-white/90 dark:border-white/15 dark:bg-white/[0.035]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <IconBadge icon={option.icon} />
                  <div className="min-w-0">
                    <h2 className="text-lg font-black leading-tight text-obaol-950 dark:text-white sm:text-xl">{option.role}</h2>
                    <p className="text-xs leading-5 text-obaol-950/70 dark:text-white/70">{option.audience}</p>
                  </div>
                </div>
                <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
                  <Link
                    href={option.href}
                    className={`inline-flex min-h-11 min-w-0 items-center justify-center gap-1 rounded-lg px-2 py-2 text-center text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-obaol-500 sm:text-sm ${
                      option.role === "Associate"
                        ? "bg-obaol-500 text-obaol-950 hover:bg-obaol-400"
                        : "border border-obaol-500/40 text-obaol-800 hover:bg-obaol-50 dark:text-obaol-200 dark:hover:bg-obaol-400/10"
                    }`}
                  >
                    Register as {option.role}
                  </Link>
                  <Link
                    href={prefill ? `${option.signInHref}?prefill=${encodeURIComponent(prefill)}` : option.signInHref}
                    className="inline-flex min-h-11 min-w-0 items-center justify-center rounded-lg border border-obaol-950/20 px-2 py-2 text-center text-xs font-bold text-obaol-950 transition hover:border-obaol-500/50 hover:bg-obaol-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-obaol-500 dark:border-white/25 dark:text-white dark:hover:bg-white/10 sm:text-sm"
                  >
                    Sign in as {option.role}
                  </Link>
                </div>
                <Link href={option.detailHref} className="mt-2 inline-flex min-h-8 items-center self-start text-xs font-semibold text-obaol-700 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-obaol-500 dark:text-obaol-200">
                  What is {option.role}? <FiArrowRight aria-hidden="true" className="ml-1" />
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-obaol-950/10 bg-white/75 p-3 dark:border-white/10 dark:bg-white/[0.035]">
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-obaol-950/60 dark:text-white/60">How trade moves</p>
            <ol className="flex items-stretch gap-1" aria-label="How OBAOL trade flows">
              {tradeFlow.map((step, index) => (
                <li key={step} className="flex min-w-0 flex-1 items-center gap-1">
                  <span className="flex min-h-11 min-w-0 flex-1 items-center rounded-md bg-obaol-500/10 px-1.5 py-1 text-[10px] font-semibold leading-3 text-obaol-950 dark:text-obaol-100 sm:px-2 sm:text-xs sm:leading-4">{step}</span>
                  {index < tradeFlow.length - 1 && <FiArrowRight aria-hidden="true" className="w-3 shrink-0 text-obaol-700 dark:text-obaol-300" />}
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </main>
  );
}
