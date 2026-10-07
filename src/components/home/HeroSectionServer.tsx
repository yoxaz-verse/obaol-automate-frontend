import HeroCTA from "@/components/home/HeroCTA";
import HeroStageExplorer, { type HeroStage } from "@/components/home/HeroStageExplorer";

const HERO_STAGES = [
  { id: "discovery", label: "Discovery", message: "Discover verified products and reliable origin suppliers.", src: "/images/execution-flow/01-discovery.webp", deliverable: "Product Coverage & Origin Sourcing", phase: "Plan" },
  { id: "sampling", label: "Sampling", message: "Review physical samples before committing to a trade.", src: "/images/execution-flow/02-sampling.webp", deliverable: "Physical Lab & Quality Sample Test", phase: "Plan" },
  { id: "coordination", label: "Coordination", message: "Keep every trade partner aligned in real-time.", src: "/images/execution-flow/03-coordination.webp", deliverable: "Counterparty Deal Terms Alignment", phase: "Plan" },
  { id: "documentation", label: "Documentation", message: "Prepare digital trade documents that move trade forward.", src: "/images/execution-flow/04-documentation.webp", deliverable: "Commercial Contracts & Customs Docs", phase: "Verify" },
  { id: "inspection", label: "Inspection Visit", message: "Verify goods and operations on the ground.", src: "/images/execution-flow/05-inspection-visit.webp", deliverable: "On-Site Warehouse & Stock Audit", phase: "Verify" },
  { id: "quality", label: "Quality Testing", message: "Test quality against your exact specs & requirements.", src: "/images/execution-flow/06-quality-testing.webp", deliverable: "Independent Lab COA Certificate", phase: "Verify" },
  { id: "packaging", label: "Packaging", message: "Prepare goods for safe, compliant shipment.", src: "/images/execution-flow/07-packaging.webp", deliverable: "Standard Export Packaging & Fumigation", phase: "Move" },
  { id: "procurement", label: "Procurement", message: "Get on-ground procurement assistance & execution.", src: "/images/execution-flow/08-procurement.webp", deliverable: "Batch Sourcing & Purchase Lock", phase: "Move" },
  { id: "transport", label: "Inland Transport", message: "Coordinate the journey from origin source to port.", src: "/images/execution-flow/09-inland-transportation.webp", deliverable: "GPS Monitored Inland Transport", phase: "Move" },
  { id: "freight", label: "Freight Forwarding", message: "Move international shipments with freight partners.", src: "/images/hero-operations/freight.webp", deliverable: "Port Customs & Bill of Lading", phase: "Close" },
] as const satisfies readonly HeroStage[];

export default function HeroSectionServer() {
  return (
    <section data-natural-scroll-hero="true" className="relative overflow-hidden bg-background pb-14 pt-20 lg:pb-20 lg:pt-24">
      {/* Ambient background glow & grid mesh */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-[500px] w-[500px] rounded-full bg-obaol-500/15 blur-[120px] dark:bg-obaol-500/20" />
        <div className="absolute top-1/3 right-10 h-[400px] w-[400px] rounded-full bg-amber-500/10 blur-[100px] dark:bg-amber-500/15" />
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]" />
      </div>

      <div className="public-layout-container relative z-10 container mx-auto px-6 sm:px-12">
        <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.76fr)_minmax(0,1.24fr)] lg:items-center xl:gap-8">
          <div className="space-y-6 lg:py-4">
            {/* Status / Kicker Pill */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-obaol-500/30 bg-obaol-500/10 px-4 py-1.5 backdrop-blur-md shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-obaol-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-obaol-500"></span>
              </span>
              <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-obaol-700 dark:text-obaol-300 sm:text-xs">
                The Agro Execution System
              </span>
            </div>

            {/* Main Title */}
            <div className="space-y-2">
              <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-slate-950 dark:text-white sm:text-5xl md:text-6xl lg:text-[3.75rem]">
                The Execution{" "}
                <span className="bg-gradient-to-r from-obaol-600 via-amber-500 to-obaol-400 bg-clip-text text-transparent drop-shadow-sm">
                  Ecosystem
                </span>
              </h1>
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs font-black uppercase tracking-widest text-obaol-700 dark:text-obaol-300">for</span>
                <span className="h-px w-16 bg-gradient-to-r from-obaol-500/40 to-transparent" />
                <span className="text-2xl font-black tracking-tight text-foreground sm:text-4xl md:text-5xl">
                  B2B Agro Trade.
                </span>
              </div>
            </div>

            {/* Subheading */}
            <p className="max-w-2xl text-base font-medium leading-relaxed text-foreground/80 sm:text-lg md:text-xl">
              Plan procurement, manage logistics, run verification, and move orders in one connected agro execution system.
              <span className="font-bold text-foreground block sm:inline mt-1 sm:mt-0"> Built for real B2B agro trade operations.</span>
            </p>

            <HeroCTA />
          </div>

          <HeroStageExplorer stages={HERO_STAGES} />
        </div>
      </div>
    </section>
  );
}
