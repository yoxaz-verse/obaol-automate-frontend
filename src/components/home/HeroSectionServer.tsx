import HeroCTA from "@/components/home/HeroCTA";
import HeroStageExplorer, { type HeroStage } from "@/components/home/HeroStageExplorer";

export const HERO_STAGES = [
  { id: "discovery", label: "Discovery", message: "Discover verified products and reliable origin suppliers.", src: "/images/execution-flow/01-discovery.webp", deliverable: "Product Coverage & Origin Sourcing", phase: "Plan" },
  { id: "sampling", label: "Sampling", message: "Review physical samples before committing to a trade.", src: "/images/execution-flow/02-sampling.webp", deliverable: "Physical Lab & Quality Sample Test", phase: "Plan" },
  { id: "coordination", label: "Coordination", message: "Keep every trade partner aligned in real-time.", src: "/images/execution-flow/03-coordination.webp", deliverable: "Counterparty Deal Terms Alignment", phase: "Plan" },
  { id: "documentation", label: "Documentation", message: "Prepare digital trade documents that move trade forward.", src: "/images/execution-flow/04-documentation.webp", deliverable: "Commercial Contracts & Customs Docs", phase: "Verify" },
  { id: "inspection", label: "Inspection Visit", message: "Verify goods and operations on the ground.", src: "/images/execution-flow/05-inspection-visit.webp", deliverable: "On-Site Warehouse & Stock Audit", phase: "Verify" },
  { id: "quality", label: "Quality Testing", message: "Test quality against your exact specs & requirements.", src: "/images/execution-flow/06-quality-testing.webp", deliverable: "Independent Lab COA Certificate", phase: "Verify" },
  { id: "packaging", label: "Packaging", message: "Prepare goods for safe, compliant shipment.", src: "/images/execution-flow/07-packaging.webp", deliverable: "Standard Export Packaging & Fumigation", phase: "Move" },
  { id: "procurement", label: "Procurement", message: "Get on-ground procurement assistance & execution.", src: "/images/execution-flow/08-procurement.webp", deliverable: "Batch Sourcing & Purchase Lock", phase: "Move" },
  { id: "transport-freight", label: "Transport & Freight", message: "Coordinate inland movement, customs, and international freight milestones.", src: "/images/execution-flow/09-inland-transportation.webp", deliverable: "Tracking, Customs & Bill of Lading", phase: "Move" },
  { id: "buyer-approval", label: "Buyer Receipt & Approval", message: "The overseas buyer receives the delivered commodity, confirms specifications, and approves the import handoff.", src: "/images/hero-bulk-execution-v7.webp", deliverable: "Destination Acceptance & Delivery Record", phase: "Receive & Approve" },
] as const satisfies readonly HeroStage[];

export default function HeroSectionServer() {
  return (
    <section data-natural-scroll-hero="true" className="relative overflow-hidden bg-background pb-10 pt-8 sm:pt-10 xl:py-10">
      {/* Ambient background glow & grid mesh */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-[500px] w-[500px] rounded-full bg-obaol-500/10 blur-[120px] dark:bg-obaol-500/14" />
        <div className="absolute top-1/4 -right-12 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-obaol-400/16 via-amber-500/10 to-transparent blur-[120px] dark:from-obaol-500/16 dark:via-amber-500/10" />
        <div className="absolute top-1/3 right-10 h-[400px] w-[400px] rounded-full bg-amber-500/[0.06] blur-[100px] dark:bg-amber-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-30 dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]" />
      </div>
      <div className="public-layout-container relative z-30 mx-auto w-full max-w-[96rem] px-6 sm:px-12">
        <div
          data-hero-centered-layout="true"
          className="mx-auto grid w-full max-w-[90rem] gap-10 xl:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] xl:items-center xl:gap-14"
        >
          <div className="max-w-3xl space-y-5 xl:max-w-none xl:py-2">
            {/* Status / Kicker Pill */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-obaol-500/25 bg-obaol-500/10 px-3.5 py-1.5 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex h-2 w-2 rounded-full bg-obaol-500"></span>
              </span>
              <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-obaol-700 dark:text-obaol-300 sm:text-xs">
                One platform. Every trade role.
              </span>
            </div>

            {/* Main Title */}
            <div className="space-y-3.5">
              <h1 className="max-w-[18ch] text-4xl font-black leading-[1.06] tracking-tight text-brand-abyssal dark:text-brand-palladian sm:text-5xl md:text-[3.35rem] xl:text-[3.5rem]">
                The B2B Bulk Trade{" "}
                <span className="bg-gradient-to-r from-obaol-600 via-amber-500 to-obaol-400 bg-clip-text text-transparent drop-shadow-sm">
                  Execution Platform
                </span>
              </h1>
              <p className="text-lg font-bold tracking-tight text-foreground/90 sm:text-xl lg:text-[1.35rem] leading-snug">
                For agricultural commodities across{" "}
                <span className="text-obaol-600 dark:text-obaol-400 font-extrabold">
                  India & global export markets
                </span>
                .
              </p>
            </div>

            {/* Subheading */}
            <p className="max-w-xl text-base font-medium leading-relaxed text-foreground/80 sm:text-lg lg:text-[1.05rem]">Buyers, bulk suppliers, and independent execution partners coordinate domestic and international commodity trade through shared technology, clear handoffs, and visible progress.</p>

            <HeroCTA />
          </div>

          <HeroStageExplorer />
        </div>

      </div>
    </section>
  );
}
