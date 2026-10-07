import { FaCheck } from "react-icons/fa6";
import { FiClock } from "react-icons/fi";

const recognitions = [
  {
    shortName: "KSUM",
    name: "Kerala Startup Mission",
    status: "Recognised startup",
    accent: "from-rose-500 to-orange-400",
    pending: false,
  },
  {
    shortName: "STARTUP INDIA",
    name: "Startup India",
    status: "Recognised startup",
    accent: "from-orange-500 via-sky-500 to-emerald-500",
    pending: false,
  },
  {
    shortName: "MSME",
    name: "Ministry of MSME",
    status: "Registered enterprise",
    accent: "from-blue-700 to-sky-400",
    pending: false,
  },
  {
    shortName: "GeM",
    name: "Government e-Marketplace",
    status: "Application submitted",
    accent: "from-amber-500 to-orange-500",
    pending: true,
  },
  {
    shortName: "IEC",
    name: "Import Export Code",
    status: "Registration planned",
    accent: "from-emerald-600 to-teal-400",
    pending: true,
  },
] as const;

export default function RecognitionStrip() {
  return (
    <section
      aria-labelledby="recognitions-title"
      className="relative border-y border-default-200/70 bg-default-50/60 py-10 md:py-14 public-standard-section"
    >
      <div className="container mx-auto max-w-6xl xl:max-w-7xl px-6 sm:px-12 public-layout-container">
        <div className="mb-8 flex flex-col gap-3 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-obaol-700 dark:text-obaol-300">
              Recognitions &amp; registrations
            </p>
            <h2 id="recognitions-title" className="mt-2 text-2xl font-black tracking-tight text-foreground md:text-3xl">
              Building with trusted institutions
            </h2>
          </div>
          <p className="max-w-xl text-sm font-medium leading-relaxed text-default-500 md:text-right">
            OBAOL is building within India&apos;s recognised startup and enterprise ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
          {recognitions.map((item) => (
            <article
              key={item.shortName}
              className="group relative min-h-44 overflow-hidden rounded-2xl border border-default-200 bg-content1 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-obaol-400/40 hover:shadow-lg public-surface-card"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.accent}`} />
              <div className="flex h-full flex-col justify-between gap-6">
                <div>
                  <div className={`bg-gradient-to-r ${item.accent} bg-clip-text text-lg font-black tracking-tight text-transparent md:text-xl`}>
                    {item.shortName}
                  </div>
                  <p className="mt-2 text-xs font-bold leading-snug text-foreground/75">
                    {item.name}
                  </p>
                </div>

                <div className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] ${item.pending ? "bg-amber-500/10 text-amber-700 dark:text-amber-300" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"}`}>
                  {item.pending ? <FiClock aria-hidden="true" size={11} /> : <FaCheck aria-hidden="true" size={10} />}
                  {item.status}
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-5 text-[11px] leading-relaxed text-default-400">
          Recognition and registration marks are shown for identification. Official certificate links and supplied brand assets can be added when available.
        </p>
      </div>
    </section>
  );
}
