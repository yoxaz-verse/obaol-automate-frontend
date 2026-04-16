import { buildMetadata, buildWebPageJsonLd } from "@/utils/seo";
import IndiaFirstNote from "@/components/seo/IndiaFirstNote";
import FadeIn from "./FadeIn";
import { Spacer } from "@nextui-org/react";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import { 
  LuShieldCheck,
  LuSearch, 
  LuBriefcase, 
  LuEye,
  LuMapPin,
  LuActivity,
  LuFileCheck,
  LuUsers,
  LuClock,
  LuTrendingUp
} from "react-icons/lu";
import { 
  FiAlertTriangle as LuAlertTriangle, 
  FiCheckCircle as LuCheckCircle, 
  FiXCircle as LuXCircle 
} from "react-icons/fi";

export const metadata = buildMetadata({
  title: "Verification Framework | OBAOL Supreme",
  description: "OBAOL provides contextual, structured procurement verification to ensure commodity sourcing executes reliably.",
  keywords: ["verification", "procurement", "commodity sourcing", "risk management", "OBAOL"],
  path: "/verification",
});

const webPageJsonLd = buildWebPageJsonLd({
  title: "Verification Framework | OBAOL Supreme",
  description: "OBAOL provides contextual, structured procurement verification to ensure commodity sourcing executes reliably.",
  path: "/verification",
});

export default function VerificationPage() {
  return (
    <section className="bg-background min-h-screen text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        <FadeIn>
          <div className="mb-8 flex justify-center">
            <IndiaFirstNote />
          </div>
        </FadeIn>

        {/* Hero Section */}
        <FadeIn>
          <div className="max-w-4xl mx-auto text-center mb-24">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Verification Framework
            </h1>
            <p className="text-xl md:text-2xl text-foreground/70 mb-8 font-light leading-relaxed">
              In commodity trade, most losses do not happen because of price.<br className="hidden md:block" />
              They happen because of <strong className="text-foreground font-semibold">who you are dealing with</strong>.
            </p>
            <div className="p-6 md:p-8 rounded-3xl bg-primary/5 border border-primary/20 max-w-3xl mx-auto backdrop-blur-sm">
              <p className="text-lg md:text-xl">
                Verification is not a checkbox. It is a continuous discipline applied at the right stages of execution. 
                <span className="block mt-4 font-semibold text-primary">OBAOL treats verification as a core responsibility, not an optional step.</span>
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Why Verification Matters & Approach Grid */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 mb-32 max-w-6xl mx-auto">
          <FadeIn>
            <div className="space-y-6 flex flex-col h-full bg-content1/50 p-8 rounded-3xl border border-divider">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-danger/10 text-danger shadow-sm">
                  <LuAlertTriangle className="w-7 h-7" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Why Verification Matters</h2>
              </div>
              <p className="text-foreground/70 text-lg">In real trade conditions, traders often face risks that increase radically as volumes scale:</p>
              <ul className="space-y-4 flex-grow">
                {[
                  "Counterparties who misrepresent stock or capacity",
                  "Entities that disappear after price confirmation",
                  "Documentation that does not match ground reality",
                  "Reputational damage from failed execution"
                ].map((risk, i) => (
                  <li key={i} className="flex items-start gap-4 p-4 rounded-2xl border border-divider/50 bg-content2/50 transition-colors hover:bg-content2">
                    <LuXCircle className="w-5 h-5 text-danger mt-0.5 shrink-0" />
                    <span className="text-foreground/80 font-medium">{risk}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-6 border-t border-divider mt-auto">
                <p className="text-lg font-medium text-foreground flex items-center gap-2">
                  <LuShieldCheck className="text-primary w-5 h-5" />
                  OBAOL exists to reduce this uncertainty.
                </p>
              </div>
            </div>
          </FadeIn>

          <FadeIn>
            <div className="space-y-6 flex flex-col h-full bg-content1/50 p-8 rounded-3xl border border-divider">
               <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-success/10 text-success shadow-sm">
                  <LuShieldCheck className="w-7 h-7" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Our Approach</h2>
              </div>
              <p className="text-foreground/70 text-lg">OBAOL does not rely on generic profiles or one-time checks. Verification is purely execution-focused.</p>
              
              <div className="grid grid-cols-1 gap-4 flex-grow">
                <div className="p-5 rounded-2xl border border-divider bg-background shadow-sm flex gap-5 items-center transition-transform hover:-translate-y-1">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <LuMapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Context-Driven</h3>
                    <p className="text-sm text-foreground/70 leading-relaxed">Verified by commodity type, volume, value, and trade flow.</p>
                  </div>
                </div>
                <div className="p-5 rounded-2xl border border-divider bg-background shadow-sm flex gap-5 items-center transition-transform hover:-translate-y-1">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <LuBriefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Trade-Specific</h3>
                    <p className="text-sm text-foreground/70 leading-relaxed">Execution complexity defines the parameters of validation.</p>
                  </div>
                </div>
                <div className="p-5 rounded-2xl border border-divider bg-background shadow-sm flex gap-5 items-center transition-transform hover:-translate-y-1">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <LuActivity className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Stage-Aware</h3>
                    <p className="text-sm text-foreground/70 leading-relaxed">Checks applied continuously at key operational milestones.</p>
                  </div>
                </div>
              </div>

               <div className="p-6 rounded-2xl bg-foreground text-background mt-4 shadow-lg">
                <p className="text-lg font-medium text-center">"Verification adapts to the trade — not the other way around."</p>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* The 4 Pillars of Verification */}
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">What OBAOL Verifies</h2>
            <p className="text-foreground/60 text-xl max-w-3xl mx-auto leading-relaxed">Depending on the specific engagement, our verification spans across four core areas to separate genuine intent from mere capability.</p>
          </div>
          
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-32 max-w-7xl mx-auto">
            {[
              {
                icon: <LuSearch className="w-8 h-8" />,
                title: "Identity & Legitimacy",
                desc: "Business identity confirmation, operating history assessment, and relevance to the trade context.",
                footer: "Establishes who you are actually dealing with.",
                number: "01"
              },
              {
                icon: <LuFileCheck className="w-8 h-8" />,
                title: "Trade Readiness",
                desc: "Stock availability, sourcing capacity, ability to execute within timelines, and spec alignment.",
                footer: "Filters intent from capability.",
                number: "02"
              },
              {
                icon: <LuTrendingUp className="w-8 h-8" />,
                title: "Execution Credibility",
                desc: "Past execution behaviour, consistency in communication, and willingness to follow discipline.",
                footer: "Serious traders behave differently under verification.",
                number: "03"
              },
              {
                icon: <LuEye className="w-8 h-8" />,
                title: "Contextual Ground Checks",
                desc: "Where required: on-ground confirmation, third-party validation, and trade-specific cross-checks.",
                footer: "Applied selectively, not universally.",
                number: "04"
              }
            ].map((pillar, i) => (
              <div key={i} className="flex flex-col p-8 rounded-3xl border border-divider bg-content1 hover:shadow-xl hover:border-primary/50 transition-all relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-bl-[100px] -z-10 transition-transform duration-500 group-hover:scale-125" />
                <div className="absolute top-6 right-6 text-foreground/5 font-black text-6xl select-none z-0">
                  {pillar.number}
                </div>
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-8 shrink-0 relative z-10">
                  {pillar.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 relative z-10">{pillar.title}</h3>
                <p className="text-foreground/70 mb-8 flex-grow text-lg relative z-10">{pillar.desc}</p>
                <div className="pt-6 border-t border-divider/60 mt-auto relative z-10">
                  <p className="text-base font-semibold text-primary/80">{pillar.footer}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Continuous vs One Time & What it's not */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 mb-32 max-w-6xl mx-auto">
          <FadeIn>
            <div className="p-8 md:p-10 rounded-[2.5rem] bg-warning/5 border border-warning/20 h-full flex flex-col transition-shadow hover:shadow-lg">
              <div className="w-16 h-16 rounded-2xl bg-warning/20 text-warning-600 flex items-center justify-center mb-8">
                <LuClock className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-bold mb-4 tracking-tight">Not a One-Time Event</h3>
              <p className="text-foreground/70 text-lg mb-8 leading-relaxed">Many failures occur <strong className="text-foreground">after initial checks</strong>. OBAOL continues verification iteratively:</p>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-center gap-4 text-foreground/80 font-medium text-lg p-3 rounded-xl bg-background border border-warning/10"><LuCheckCircle className="text-warning-500 w-6 h-6" /> When terms change</li>
                <li className="flex items-center gap-4 text-foreground/80 font-medium text-lg p-3 rounded-xl bg-background border border-warning/10"><LuCheckCircle className="text-warning-500 w-6 h-6" /> When timelines shift</li>
                <li className="flex items-center gap-4 text-foreground/80 font-medium text-lg p-3 rounded-xl bg-background border border-warning/10"><LuCheckCircle className="text-warning-500 w-6 h-6" /> When execution pressure increases</li>
              </ul>
              <div className="p-4 rounded-xl bg-warning-50 text-warning-900 border border-warning-200 mt-auto">
                <p className="font-semibold text-center">Verification is maintained until execution completes.</p>
              </div>
            </div>
          </FadeIn>

          <FadeIn>
             <div className="p-8 md:p-10 rounded-[2.5rem] bg-danger/5 border border-danger/20 h-full flex flex-col transition-shadow hover:shadow-lg">
              <div className="w-16 h-16 rounded-2xl bg-danger/20 text-danger-600 flex items-center justify-center mb-8">
                <LuXCircle className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-bold mb-4 tracking-tight">What Verification Is Not</h3>
              <p className="text-foreground/70 text-lg mb-8 leading-relaxed">To keep expectations clear, our verification process is emphatically not:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 flex-grow">
                <div className="p-4 rounded-xl bg-background border border-danger/10 text-center font-medium text-foreground/80 flex items-center justify-center">A guarantee of outcome</div>
                <div className="p-4 rounded-xl bg-background border border-danger/10 text-center font-medium text-foreground/80 flex items-center justify-center">A replacement for commercial judgment</div>
                <div className="p-4 rounded-xl bg-background border border-danger/10 text-center font-medium text-foreground/80 flex items-center justify-center">A public rating system</div>
                <div className="p-4 rounded-xl bg-background border border-danger/10 text-center font-medium text-foreground/80 flex items-center justify-center">A substitute for contracts</div>
              </div>
              <div className="p-4 rounded-xl bg-danger/10 text-danger-700 border border-danger-200 mt-auto">
                <p className="font-bold text-center">Verification reduces risk. It does not eliminate it.</p>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Protection & New Entrants */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 mb-32 max-w-6xl mx-auto">
          <FadeIn>
            <div className="bg-content1 border border-divider p-8 md:p-10 rounded-[2.5rem] h-full">
              <h3 className="text-3xl font-bold mb-6 flex items-center gap-4 tracking-tight">
                <div className="p-3 bg-success/10 text-success rounded-xl">
                  <LuShieldCheck className="w-7 h-7" />
                </div>
                Protects Both Sides
              </h3>
              <p className="text-foreground/70 text-lg mb-8 leading-relaxed">Strong verification aligns expectations early and prevents avoidable conflict later. It directly benefits:</p>
              <ul className="space-y-4">
                <li className="flex gap-5 p-5 rounded-2xl border border-divider/50 bg-background hover:border-success/30 transition-colors">
                  <div className="w-3 h-3 mt-2 rounded-full bg-success shrink-0 shadow-[0_0_10px_rgba(23,201,100,0.5)]" />
                  <div>
                    <span className="font-bold text-lg block mb-1">Buyers</span>
                    <span className="text-foreground/70">Seeking clean, reliable supply paths</span>
                  </div>
                </li>
                <li className="flex gap-5 p-5 rounded-2xl border border-divider/50 bg-background hover:border-success/30 transition-colors">
                  <div className="w-3 h-3 mt-2 rounded-full bg-success shrink-0 shadow-[0_0_10px_rgba(23,201,100,0.5)]" />
                  <div>
                    <span className="font-bold text-lg block mb-1">Sellers</span>
                    <span className="text-foreground/70">Protecting serious stock from non-performers</span>
                  </div>
                </li>
                <li className="flex gap-5 p-5 rounded-2xl border border-divider/50 bg-background hover:border-success/30 transition-colors">
                  <div className="w-3 h-3 mt-2 rounded-full bg-success shrink-0 shadow-[0_0_10px_rgba(23,201,100,0.5)]" />
                  <div>
                    <span className="font-bold text-lg block mb-1">Traders</span>
                    <span className="text-foreground/70">Safeguarding market reputation and margins</span>
                  </div>
                </li>
              </ul>
            </div>
          </FadeIn>

          <FadeIn>
            <div className="bg-content1 border border-divider p-8 md:p-10 rounded-[2.5rem] h-full">
              <h3 className="text-3xl font-bold mb-6 flex items-center gap-4 tracking-tight">
                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                  <LuUsers className="w-7 h-7" />
                </div>
                For New Entrants
              </h3>
              <p className="text-foreground/70 text-lg mb-8 leading-relaxed">For serious new entrants, verification acts as a definitive bridge to market credibility.</p>
              <div className="bg-primary/5 rounded-3xl p-8 border border-primary/20 h-[calc(100%-140px)] flex flex-col justify-center">
                <ul className="space-y-6 mb-8">
                  <li className="flex items-center gap-4 text-lg font-medium">
                    <div className="bg-primary/10 p-2 rounded-full text-primary">
                      <LuCheckCircle className="w-6 h-6" />
                    </div>
                    Instills early discipline
                  </li>
                  <li className="flex items-center gap-4 text-lg font-medium">
                    <div className="bg-primary/10 p-2 rounded-full text-primary">
                      <LuCheckCircle className="w-6 h-6" />
                    </div>
                    Sets clear execution expectations
                  </li>
                  <li className="flex items-center gap-4 text-lg font-medium">
                    <div className="bg-primary/10 p-2 rounded-full text-primary">
                      <LuCheckCircle className="w-6 h-6" />
                    </div>
                    Reduces exposure to bad actors
                  </li>
                </ul>
                <div className="border-t border-primary/20 pt-6 mt-auto">
                  <p className="font-semibold text-lg text-center">This allows new participants to enter the industry <strong className="text-primary block text-xl mt-1">without weakening trust</strong>.</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Engagement Discipline & Summary */}
        <FadeIn>
          <div className="max-w-5xl mx-auto text-center p-10 md:p-16 rounded-[3rem] bg-content1 border border-divider shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient" />
            <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">Engagement Discipline</h2>
            <p className="text-xl md:text-2xl text-foreground/70 mb-10 max-w-3xl mx-auto leading-relaxed">
              OBAOL applies verification selectively. We engage only where trade intent is genuine, verification adds execution value, and all parties accept structured oversight.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <span className="px-6 py-3 rounded-full bg-background border border-divider text-base font-semibold shadow-sm flex items-center gap-2">
                <LuCheckCircle className="text-success" /> Genuine Intent
              </span>
              <span className="px-6 py-3 rounded-full bg-background border border-divider text-base font-semibold shadow-sm flex items-center gap-2">
                <LuTrendingUp className="text-primary" /> Added Value
              </span>
              <span className="px-6 py-3 rounded-full bg-background border border-divider text-base font-semibold shadow-sm flex items-center gap-2">
                <LuEye className="text-secondary" /> Structured Oversight
              </span>
            </div>
            
            <div className="max-w-xl mx-auto bg-background p-6 rounded-2xl border border-divider">
              <p className="text-xl font-bold text-primary mb-2">Our involvement is success-linked.</p>
              <p className="text-lg text-foreground/70">We remain accountable until execution concludes.</p>
            </div>
          </div>
        </FadeIn>

        <Spacer y={32} />

        <FadeIn>
          <div className="text-center max-w-3xl mx-auto bg-foreground text-background p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
             <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-3xl rounded-full" />
             <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/20 blur-3xl rounded-full" />
            
            <h3 className="text-3xl font-bold mb-8 relative z-10">In Summary</h3>
            <p className="text-2xl text-background/80 leading-relaxed font-light relative z-10">
              Commodity trade runs on trust, but trust must be verified under execution pressure. <br/><br/>
              <strong className="text-background block text-3xl font-bold mt-4">OBAOL brings structured verification so that trades are executed with clarity, confidence, and control.</strong>
            </p>
          </div>
        </FadeIn>
        
      </main>
      <Footer />
    </section>
  );
}
