import Link from "next/link";

const personas = [
  { title: "Buy products", description: "Discover verified listings, create enquiries, request samples, and track orders.", href: "/auth/register?intent=BUY", cta: "Start as a buyer" },
  { title: "Sell products", description: "Set up your company, publish products, respond to enquiries, and execute orders.", href: "/auth/register?intent=SELL", cta: "Start as a seller" },
  { title: "Coordinate operations", description: "Manage assigned companies, milestones, documents, and execution tasks.", href: "/auth/operator/register", cta: "Join operations" },
] as const;

export default function PersonaChooser() {
  return (
    <section aria-labelledby="choose-work-heading" className="border-y border-default-200/60 bg-content1/30 py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-6 sm:px-12">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-warning-600">Your starting point</p>
        <h2 id="choose-work-heading" className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">Choose what you need to do</h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-foreground/65">OBAOL adjusts the workspace to your work. You can expand a buyer or seller account later without creating a second identity.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {personas.map((persona) => (
            <article key={persona.href} className="rounded-3xl border border-default-200 bg-background p-6 md:p-7">
              <h3 className="text-xl font-bold">{persona.title}</h3>
              <p className="mt-3 min-h-[4.5rem] text-sm leading-6 text-foreground/60">{persona.description}</p>
              <Link href={persona.href} className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-warning-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-warning-400">{persona.cta}</Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
