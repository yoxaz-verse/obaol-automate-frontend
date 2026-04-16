import { buildMetadata, buildWebPageJsonLd } from "@/utils/seo";
import FadeIn from "./FadeIn";
import ProcurementSpecialistSection from "@/components/home/procurementprocess";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import { Spacer } from "@nextui-org/react";
import { 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiXCircle,
  FiTarget,
  FiShield,
  FiActivity,
  FiMapPin,
  FiCheck,
  FiBriefcase,
  FiUsers,
  FiTrendingUp,
  FiGlobe
} from "react-icons/fi";

export const metadata = buildMetadata({
  title: "Procurement & Verification Support | OBAOL",
  description: "Starting in India, explore OBAOL procurement and verification support for consistent commodity sourcing quality and execution reliability as we expand globally.",
  keywords: ["procurement support", "verification process", "commodity sourcing"],
  path: "/procurement",
  type: "article",
});

const webPageJsonLd = buildWebPageJsonLd({
  title: "Procurement & Verification Support | OBAOL",
  description: "Structured procurement, on-ground checks, and verification processes for commodity trade operations.",
  path: "/procurement",
});

export default function ProcurementPage() {
  return (
    <section className="bg-background min-h-screen text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        {/* Hero Section */}
        <FadeIn>
          <div className="max-w-4xl mx-auto text-center mb-24">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Procurement Support
            </h1>
            <p className="text-xl md:text-2xl text-foreground/70 mb-8 font-light leading-relaxed">
              Procurement is where most commodity trades are truly tested.<br className="hidden md:block" />
              Price agreement alone <strong className="text-foreground font-semibold">does not guarantee supply</strong>.
            </p>
            <div className="p-6 md:p-8 rounded-3xl bg-primary/5 border border-primary/20 max-w-3xl mx-auto backdrop-blur-sm shadow-xl">
              <p className="text-lg md:text-xl font-medium leading-relaxed">
                Execution, coordination, and on-ground discipline determine whether procurement actually happens.
              </p>
              <div className="mt-6 inline-flex items-center gap-3 bg-background px-6 py-3 rounded-full border border-primary/30">
                <FiTarget className="text-primary w-5 h-5" />
                <span className="font-semibold text-primary">Structure, Verification, Continuity</span>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* The Reality of Commodity Procurement */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 mb-24 max-w-6xl mx-auto">
          <FadeIn>
            <div className="space-y-6 flex flex-col h-full bg-content1/50 p-8 rounded-3xl border border-divider">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-warning/10 text-warning shadow-sm">
                  <FiAlertTriangle className="w-7 h-7" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">The Reality</h2>
              </div>
              <p className="text-foreground/70 text-lg">In practice, procurement challenges often include:</p>
              <ul className="space-y-4 flex-grow">
                {[
                  "Stock availability changing after confirmation",
                  "Quality or specification mismatch",
                  "Delays in readiness or dispatch",
                  "Poor coordination between parties",
                  "Breakdowns once advance discussions begin"
                ].map((risk, i) => (
                  <li key={i} className="flex items-start gap-4 p-4 rounded-2xl border border-divider/50 bg-content2/50 transition-colors hover:bg-content2">
                    <FiXCircle className="w-5 h-5 text-warning mt-0.5 shrink-0" />
                    <span className="text-foreground/80 font-medium">{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>

          <FadeIn>
            <div className="space-y-6 flex flex-col justify-center h-full bg-primary/5 p-8 rounded-3xl border border-primary/20 text-center relative overflow-hidden">
               <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 blur-3xl rounded-full" />
               <div className="relative z-10 space-y-8">
                <p className="text-2xl font-light text-foreground/80 leading-relaxed">
                  These issues rarely appear during negotiation.<br/>
                  <strong className="text-foreground text-3xl font-bold block mt-4">They surface during execution.</strong>
                </p>
                <div className="w-16 h-1 mx-auto bg-primary/50 rounded-full" />
                <p className="text-xl font-bold text-primary flex items-center justify-center gap-3">
                  <FiShield className="w-6 h-6" />
                  OBAOL exists to reduce these risks.
                </p>
               </div>
            </div>
          </FadeIn>
        </div>

        {/* Process Section embedded cleanly */}
        <FadeIn>
          <div className="mb-32">
            <ProcurementSpecialistSection key="procurement-specialist-section" />
          </div>
        </FadeIn>

        {/* How OBAOL Supports Procurement - 5 Pillars */}
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">How OBAOL Supports You</h2>
            <p className="text-foreground/60 text-xl max-w-3xl mx-auto leading-relaxed">OBAOL does not replace your procurement team. We work <strong className="text-foreground">alongside it</strong> to strengthen execution.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-32 max-w-7xl mx-auto">
            {[
              {
                icon: <FiTarget className="w-6 h-6" />,
                title: "Requirement Clarity",
                desc: "Every engagement begins with clear criteria: spec, lot, origin, timeline, and trade flow.",
                footer: "Reduces downstream disputes."
              },
              {
                icon: <FiBriefcase className="w-6 h-6" />,
                title: "Source Validation",
                desc: "Pre-procurement validation of supplier credibility and actual stock readiness.",
                footer: "Contextual and trade-specific."
              },
              {
                icon: <FiActivity className="w-6 h-6" />,
                title: "Execution Coordination",
                desc: "Ongoing follow-ups, timeline tracking, and alignment between buyer and supplier.",
                footer: "Prevents last-minute surprises."
              },
              {
                icon: <FiMapPin className="w-6 h-6" />,
                title: "On-Ground Discipline",
                desc: "Ensuring commitments are honoured and deviations are flagged early.",
                footer: "Protects both sides."
              },
              {
                icon: <FiCheckCircle className="w-6 h-6" />,
                title: "Procurement Completion",
                desc: "Remaining involved until alignment of quality, quantity, and timelines is achieved.",
                footer: "No mid-process disengagements."
              }
            ].map((pillar, i) => (
              <div key={i} className="flex flex-col p-6 rounded-3xl border border-divider bg-content1 hover:shadow-xl hover:-translate-y-2 transition-all relative overflow-hidden group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 shrink-0 relative z-10 transition-transform group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                  {pillar.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 relative z-10">{i + 1}. {pillar.title}</h3>
                <p className="text-foreground/70 mb-6 flex-grow text-sm relative z-10">{pillar.desc}</p>
                <div className="pt-4 border-t border-divider/60 mt-auto relative z-10">
                  <p className="text-xs font-semibold text-primary/80 uppercase tracking-widest">{pillar.footer}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>


        {/* For Whom vs Not For Whom */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 mb-32 max-w-6xl mx-auto">
          <FadeIn>
            <div className="bg-success/5 border border-success/20 p-8 md:p-10 rounded-[2.5rem] h-full transition-shadow hover:shadow-lg">
              <h3 className="text-3xl font-bold mb-6 flex items-center gap-4 tracking-tight">
                <div className="p-3 bg-success/20 text-success-600 rounded-xl">
                  <FiCheck className="w-7 h-7" />
                </div>
                Who This Is For
              </h3>
              <p className="text-foreground/70 text-lg mb-8 leading-relaxed">OBAOL procurement support is highly relevant for serious operations:</p>
              <ul className="space-y-4">
                {[
                  "Traders sourcing bulk agricultural commodities",
                  "Exporters managing multi-origin procurement",
                  "Buyers requiring maximum execution reliability",
                  "Firms where procurement failure carries real financial cost"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-foreground/80 font-medium p-4 rounded-xl bg-background border border-success/10 shadow-sm">
                    <FiCheckCircle className="text-success-500 w-5 h-5 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 p-4 bg-background border-l-4 border-success rounded-r-xl">
                <p className="text-sm font-semibold">If procurement is critical, structured support matters.</p>
              </div>
            </div>
          </FadeIn>

          <FadeIn>
             <div className="bg-danger/5 border border-danger/20 p-8 md:p-10 rounded-[2.5rem] h-full transition-shadow hover:shadow-lg">
              <h3 className="text-3xl font-bold mb-6 flex items-center gap-4 tracking-tight">
                <div className="p-3 bg-danger/20 text-danger-600 rounded-xl">
                  <FiXCircle className="w-7 h-7" />
                </div>
                What We Do Not Do
              </h3>
              <p className="text-foreground/70 text-lg mb-8 leading-relaxed">To maintain absolute role clarity, OBAOL deliberately avoids:</p>
              <ul className="space-y-4">
                {[
                  "Owning or holding inventory",
                  "Acting directly as the supplier",
                  "Influencing commercial pricing",
                  "Providing financial guarantees of outcome"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-foreground/80 font-medium p-4 rounded-xl bg-background border border-danger/10 shadow-sm">
                    <FiXCircle className="text-danger-500 w-5 h-5 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 p-4 bg-background border-l-4 border-danger rounded-r-xl">
                <p className="text-sm font-semibold">Trade decisions remain yours. OBAOL supports execution discipline.</p>
              </div>
            </div>
          </FadeIn>
        </div>


        {/* New Entrants & Engagement Discipline */}
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 mb-20 max-w-6xl mx-auto">
          <FadeIn>
            <div className="bg-content1 border border-divider p-8 md:p-10 rounded-[2.5rem] h-full">
              <h3 className="text-3xl font-bold mb-6 flex items-center gap-4 tracking-tight">
                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                  <FiUsers className="w-7 h-7" />
                </div>
                For New Entrants
              </h3>
              <p className="text-foreground/70 text-lg mb-8 leading-relaxed">
                For serious new entrants, procurement is often the most fragile stage. We offer a bridge:
              </p>
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1"><span className="font-bold">1</span></div>
                  <div>
                    <h4 className="font-bold text-lg">Understand Dynamics</h4>
                    <p className="text-foreground/60 text-sm">Grasp real procurement behavior and market nuances.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1"><span className="font-bold">2</span></div>
                  <div>
                    <h4 className="font-bold text-lg">Avoid Pitfalls</h4>
                    <p className="text-foreground/60 text-sm">Sidestep common sourcing mistakes made by early participants.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1"><span className="font-bold">3</span></div>
                  <div>
                    <h4 className="font-bold text-lg">Execute Responsibly</h4>
                    <p className="text-foreground/60 text-sm">Build sustainable market reputation from the very first trade.</p>
                  </div>
                </div>
              </div>
              <p className="mt-8 pt-6 border-t border-divider font-semibold text-primary">Allowing the industry to open up without lowering standards.</p>
            </div>
          </FadeIn>

          <FadeIn>
            <div className="max-w-xl mx-auto text-center p-10 rounded-[2.5rem] bg-background border-2 border-primary/20 shadow-xl relative overflow-hidden h-full flex flex-col justify-center">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient" />
              <h2 className="text-3xl font-bold mb-6">Engagement Discipline</h2>
              <p className="text-lg text-foreground/70 mb-8 leading-relaxed">
                OBAOL engages selectively in procurement. We participate only where requirements are clear, trade intent is genuine, and execution support adds massive value.
              </p>
              
              <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 mt-auto">
                <p className="text-xl font-bold text-primary mb-2">Our involvement is success-linked.</p>
                <p className="text-foreground/70">We stay accountable until procurement execution concludes.</p>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Global Expansion Banner & Summary */}
        <FadeIn>
          <div className="rounded-[3rem] border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-8 md:p-12 mb-20 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 shadow-2xl">
            <FiGlobe className="absolute -right-16 -bottom-16 w-64 h-64 text-primary/5 rotate-[-15deg] pointer-events-none" />
            <div className="flex-grow relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                India-first procurement with global execution expansion
              </h2>
              <p className="text-xl text-foreground/70 max-w-2xl leading-relaxed">
                We begin with India-based procurement, verification, and on-ground checks, then expand
                across GCC markets, Europe, and the United States for cross-border commodity flows.
              </p>
            </div>
            <div className="shrink-0 relative z-10">
              <div className="w-20 h-20 bg-background rounded-full border border-primary/30 flex items-center justify-center shadow-lg">
                <FiTrendingUp className="w-10 h-10 text-primary" />
              </div>
            </div>
          </div>
        </FadeIn>

        <Spacer y={16} />

        <FadeIn>
          <div className="text-center max-w-3xl mx-auto bg-foreground text-background p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
             <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
            
            <h3 className="text-3xl font-bold mb-8 relative z-10">In Summary</h3>
            <p className="text-2xl text-background/80 leading-relaxed font-light relative z-10">
              Procurement fails not because of lack of opportunity, but because of <span className="font-bold underline decoration-primary decoration-4 underline-offset-4">lack of structure</span>. <br/><br/>
              <strong className="text-background block text-3xl font-bold mt-4">OBAOL brings structure to procurement so that sourcing executes as agreed — reliably and professionally.</strong>
            </p>
          </div>
        </FadeIn>
        
      </main>
      <Footer />
    </section>
  );
}
