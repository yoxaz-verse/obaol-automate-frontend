import Link from "next/link";

export default function HeroLite() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.22),transparent_45%),radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.14),transparent_45%),linear-gradient(180deg,#0b0d14_0%,#0a0a0a_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-30 [background:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:42px_42px]" />

      <div className="container mx-auto max-w-7xl px-4 md:px-6 text-white">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-orange-300">
          India-First Trade Execution
        </p>

        <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight md:text-6xl">
          From Enquiry To Delivery, One
          <span className="bg-gradient-to-r from-orange-300 to-orange-500 bg-clip-text text-transparent"> Agro Execution System</span>
        </h1>

        <p className="mt-6 max-w-2xl text-base text-white/75 md:text-lg">
          OBAOL helps teams run procurement, verification, logistics, and order execution in one disciplined operating system built for real commodity trade.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/auth" className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white hover:bg-orange-600">
            Sign In
          </Link>
          <Link href="/how-it-works" className="rounded-xl border border-white/25 bg-white/5 px-6 py-3 text-sm font-bold text-white hover:bg-white/10">
            See How It Works
          </Link>
        </div>
      </div>
    </section>
  );
}
