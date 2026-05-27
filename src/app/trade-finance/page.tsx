import { buildMetadata, buildWebPageJsonLd } from "@/utils/seo";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import {
  FiActivity,
  FiAlertTriangle,
  FiCheckCircle,
  FiDownload,
  FiFileText,
  FiLayers,
  FiRepeat,
  FiShield,
  FiUsers,
} from "react-icons/fi";

export const metadata = buildMetadata({
  title: "Trade Finance Opportunities | OBAOL",
  description:
    "Explore structured participation in active commodity trades through per-trade, contract-cycle, and rolling-pool trade finance models on OBAOL.",
  keywords: [
    "trade finance",
    "commodity trade investment",
    "working capital participation",
    "invest in active trades",
    "trade-level financing",
  ],
  path: "/trade-finance",
  type: "article",
});

const webPageJsonLd = buildWebPageJsonLd({
  title: "Trade Finance Opportunities | OBAOL",
  description:
    "Structured trade-level financing opportunities for qualified institutions and serious investors in active commodity contracts.",
  path: "/trade-finance",
});

const models = [
  {
    title: "Per-Trade Participation",
    description:
      "Allocate capital to a specific active trade where funding is required for a defined procurement or execution window.",
    icon: FiFileText,
  },
  {
    title: "Contract-Cycle Participation",
    description:
      "Support repeated funding requirements across a full contract cycle where procurement runs in multiple recurring trade windows.",
    icon: FiRepeat,
  },
  {
    title: "Rolling Pool Participation",
    description:
      "Participate across multiple active trades through a structured pool approach to diversify trade-level exposure.",
    icon: FiLayers,
  },
];

const flow = [
  "Trade listed",
  "Due diligence snapshot",
  "Investor participation",
  "Execution tracking",
  "Settlement closure",
];

export default function TradeFinancePage() {
  return (
    <section className="bg-background min-h-screen text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <Header />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary mb-6">
            Trade-Level Finance Opportunity
          </p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
            Invest in Active Commodity Trades
          </h1>
          <p className="text-lg md:text-2xl text-foreground/70 leading-relaxed">
            OBAOL enables structured participation in real trade execution opportunities where
            working-capital timing gaps exist between procurement and buyer settlement.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <div className="rounded-3xl border border-warning/20 bg-warning/5 p-8">
            <div className="flex items-center gap-3 mb-4">
              <FiAlertTriangle className="w-6 h-6 text-warning" />
              <h2 className="text-2xl font-bold">Why Funding Is Needed</h2>
            </div>
            <p className="text-foreground/75 leading-relaxed">
              In many trades, sellers need capital to procure and prepare goods before dispatch,
              while buyers may settle after delivery milestones. This timing mismatch can slow or
              block genuine trade execution.
            </p>
          </div>

          <div className="rounded-3xl border border-primary/20 bg-primary/5 p-8">
            <div className="flex items-center gap-3 mb-4">
              <FiActivity className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">What OBAOL Enables</h2>
            </div>
            <p className="text-foreground/75 leading-relaxed">
              Structured investor participation into specific active trades and contract cycles,
              with execution visibility and process discipline built around real commodity flows,
              not platform-level equity exposure.
            </p>
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">Participation Models</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {models.map((model) => {
              const Icon = model.icon;
              return (
                <div key={model.title} className="rounded-3xl border border-divider bg-content1 p-7">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{model.title}</h3>
                  <p className="text-foreground/70 leading-relaxed">{model.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-20 rounded-3xl border border-divider bg-content1/60 p-8 md:p-10">
          <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
          <div className="grid md:grid-cols-5 gap-4">
            {flow.map((step, index) => (
              <div key={step} className="rounded-2xl border border-divider bg-background p-5 text-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mx-auto mb-3">
                  {index + 1}
                </div>
                <p className="font-semibold text-sm">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <div className="rounded-3xl border border-divider p-8 bg-content1">
            <div className="flex items-center gap-3 mb-4">
              <FiShield className="w-6 h-6 text-primary" />
              <h3 className="text-2xl font-bold">Risk & Governance</h3>
            </div>
            <ul className="space-y-3 text-foreground/75">
              <li className="flex items-start gap-2"><FiCheckCircle className="w-5 h-5 mt-0.5 text-success" />Participation is evaluated at trade and contract context level.</li>
              <li className="flex items-start gap-2"><FiCheckCircle className="w-5 h-5 mt-0.5 text-success" />Execution updates are tied to actual trade progress milestones.</li>
              <li className="flex items-start gap-2"><FiCheckCircle className="w-5 h-5 mt-0.5 text-success" />No guaranteed returns are represented on this page.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-warning/20 p-8 bg-warning/5">
            <div className="flex items-center gap-3 mb-4">
              <FiUsers className="w-6 h-6 text-warning" />
              <h3 className="text-2xl font-bold">Who Can Participate</h3>
            </div>
            <p className="text-foreground/75 leading-relaxed mb-4">
              This opportunity is open to investors, including institutions and individuals.
              Before participating, each investor should understand commodity trade risk, review
              the contract terms, and complete due diligence.
            </p>
            <p className="text-sm text-foreground/60">
              Final participation is subject to due diligence, legal review, and trade-specific documentation.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-primary/20 bg-primary/5 p-10 text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Investor Deck</h2>
          <p className="text-foreground/70 max-w-2xl mx-auto mb-8">
            Download the trade finance investor brief for a structured overview of participation models,
            process flow, and engagement framework.
          </p>
          <a
            href="/deck/obaol-trade-finance-investor-deck.pdf"
            download
            className="inline-flex items-center gap-3 rounded-xl bg-primary px-6 py-3 text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            <FiDownload className="w-5 h-5" />
            Download Investor Deck (PDF)
          </a>
        </div>

        <p className="text-xs md:text-sm text-foreground/55 text-center max-w-4xl mx-auto leading-relaxed">
          Disclaimer: This content is for informational purposes only and does not constitute financial,
          legal, tax, or investment advice. Any participation is trade-specific and subject to independent
          due diligence, contractual terms, and applicable regulations. Investment opportunities described
          here relate to individual trades or contracts and do not represent ownership or equity in OBAOL.
        </p>
      </main>

      <Footer />
    </section>
  );
}
