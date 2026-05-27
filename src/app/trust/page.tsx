import Link from "next/link";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import { buildMetadata, buildWebPageJsonLd } from "@/utils/seo";
import { BUSINESS_IDENTITY, TRUST_POLICY_LINKS } from "@/utils/businessIdentity";

export const metadata = buildMetadata({
  title: "Trust & Verification | OBAOL Supreme",
  description:
    "Official OBAOL business identity, contact details, verification posture, and legal policy links for transparent trust validation.",
  keywords: ["obaol trust", "business verification", "obaol legal profile", "obaol contact"],
  path: "/trust",
  type: "article",
});

const webPageJsonLd = buildWebPageJsonLd({
  title: "Trust & Verification | OBAOL Supreme",
  description:
    "Business identity and verification details for OBAOL Supreme, including official contact channels and policy disclosures.",
  path: "/trust",
});

export default function TrustPage() {
  return (
    <section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <div className="rounded-3xl border border-default-200 bg-content1 p-8 md:p-12 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-default-500">Trust & Verification</p>
          <h1 className="mt-4 text-3xl md:text-5xl font-black tracking-tight text-foreground">Official Business Identity</h1>
          <p className="mt-5 text-default-600 leading-relaxed">
            OBAOL Supreme operates as an execution-focused commodity trade system with structured verification.
            This page exists to provide clear identity and contact disclosures for partners, regulators, and trust-review tools.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <article className="rounded-2xl border border-default-200 bg-content2/40 p-6">
              <h2 className="text-lg font-bold">Legal Entity</h2>
              <p className="mt-3 text-default-700">{BUSINESS_IDENTITY.legalName}</p>
              <p className="mt-4 text-sm text-default-600">
                Registered / operational address: {BUSINESS_IDENTITY.address.streetAddress}, {BUSINESS_IDENTITY.address.addressLocality},{" "}
                {BUSINESS_IDENTITY.address.addressRegion} {BUSINESS_IDENTITY.address.postalCode}, {BUSINESS_IDENTITY.address.addressCountry}
              </p>
            </article>

            <article className="rounded-2xl border border-default-200 bg-content2/40 p-6">
              <h2 className="text-lg font-bold">Official Contact</h2>
              <p className="mt-3 text-default-700">
                Email: <a className="underline" href={`mailto:${BUSINESS_IDENTITY.email}`}>{BUSINESS_IDENTITY.email}</a>
              </p>
              <p className="mt-2 text-default-700">
                Phone: <a className="underline" href={`tel:${BUSINESS_IDENTITY.phoneE164}`}>{BUSINESS_IDENTITY.phoneDisplay}</a>
              </p>
              <p className="mt-2 text-default-700">
                LinkedIn: <a className="underline" href={BUSINESS_IDENTITY.linkedin} target="_blank" rel="noopener noreferrer">OBAOL Company Page</a>
              </p>
            </article>
          </div>

          <article className="mt-6 rounded-2xl border border-default-200 bg-content2/40 p-6">
            <h2 className="text-lg font-bold">Business Verification Statement</h2>
            <p className="mt-3 text-default-700 leading-relaxed">
              OBAOL enforces structured verification for participant onboarding and trade execution workflows. We publish clear legal and policy disclosures,
              maintain reachable support channels, and operate with transparent process controls designed to reduce counterparty risk.
            </p>
          </article>

          <article className="mt-6 rounded-2xl border border-default-200 bg-content2/40 p-6">
            <h2 className="text-lg font-bold">Legal Policies</h2>
            <ul className="mt-3 flex flex-wrap gap-3">
              {TRUST_POLICY_LINKS.map((policy) => (
                <li key={policy.href}>
                  <Link href={policy.href} className="inline-flex rounded-xl border border-default-300 px-4 py-2 text-sm hover:bg-content3">
                    {policy.name}
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </main>
      <Footer />
    </section>
  );
}
