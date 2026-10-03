import HeroCTA from "@/components/home/HeroCTA";
import HeroStageExplorer, { type HeroStage } from "@/components/home/HeroStageExplorer";

const HERO_STAGES = [
  { id: "discovery", label: "Discovery", message: "Discover the right product and origin.", src: "/images/execution-flow/01-discovery.webp" },
  { id: "sampling", label: "Sampling", message: "Review samples before committing to a trade.", src: "/images/execution-flow/02-sampling.webp" },
  { id: "coordination", label: "Coordination", message: "Keep every trade partner aligned.", src: "/images/execution-flow/03-coordination.webp" },
  { id: "documentation", label: "Documentation", message: "Prepare the documents that move trade forward.", src: "/images/execution-flow/04-documentation.webp" },
  { id: "inspection", label: "Inspection Visit", message: "Verify goods and operations on the ground.", src: "/images/execution-flow/05-inspection-visit.webp" },
  { id: "quality", label: "Quality Testing", message: "Test quality against your requirements.", src: "/images/execution-flow/06-quality-testing.webp" },
  { id: "packaging", label: "Packaging", message: "Prepare goods for safe, compliant shipment.", src: "/images/execution-flow/07-packaging.webp" },
  { id: "procurement", label: "Procurement", message: "Get on-ground procurement assistance.", src: "/images/execution-flow/08-procurement.webp" },
  { id: "transport", label: "Inland Transportation", message: "Coordinate the journey from source to port.", src: "/images/execution-flow/09-inland-transportation.webp" },
  { id: "freight", label: "Freight Forwarding", message: "Move shipments with freight partners.", src: "/images/hero-operations/freight.webp" },
] as const satisfies readonly HeroStage[];

export default function HeroSectionServer() {
  return (
    <section data-natural-scroll-hero="true" className="relative min-h-[85vh] overflow-hidden bg-background pt-20">
      <div className="obaol-hero-ambient pointer-events-none absolute inset-0 opacity-70 public-decoration" />
      <div className="public-layout-container relative z-10 container mx-auto px-6 py-12 sm:px-12 md:py-16 lg:py-10">
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-start">
          <div className="space-y-6 lg:sticky lg:top-28">
            <p className="text-[9px] font-bold uppercase tracking-[0.42em] text-obaol-700 dark:text-obaol-300 sm:text-xs">The Agro Execution System for Agro Trade</p>
            <h1 className="text-4xl font-bold leading-[1.06] tracking-[-0.035em] text-slate-950 dark:text-[#F5F1E8] sm:text-5xl md:text-6xl lg:text-[clamp(3rem,5vw,4.5rem)]">
              The Execution <span className="block bg-gradient-to-r from-obaol-700 via-obaol-600 to-obaol-500 bg-clip-text text-transparent dark:from-obaol-200 dark:via-obaol-400 dark:to-obaol-500">Ecosystem</span>
            </h1>
            <div className="flex items-center gap-3 opacity-30"><span className="text-sm italic">for</span><span className="h-px w-24 bg-foreground" /></div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">B2B Agro Trade.</h2>
            <p className="max-w-2xl text-base font-medium leading-relaxed text-foreground/70 sm:text-lg md:text-xl">
              Plan procurement, manage logistics, run verification, and move orders in one agro execution system.
              <span className="font-bold text-foreground"> Built for real B2B agro trade operations.</span>
            </p>
            <HeroCTA />
          </div>
          <HeroStageExplorer stages={HERO_STAGES} />
        </div>
      </div>
    </section>
  );
}
