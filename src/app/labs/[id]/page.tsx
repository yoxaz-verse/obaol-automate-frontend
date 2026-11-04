import Link from "next/link";
import { notFound } from "next/navigation";

async function getLab(id: string) {
  const base = String(process.env.NEXT_PUBLIC_OBAOL_API_BASE_URL || "https://api.obaol.com").replace(/\/$/, "");
  try { const response = await fetch(`${base}/public/labs/${encodeURIComponent(id)}`, { cache: "no-store" }); if (!response.ok) return null; return (await response.json()).data; } catch { return null; }
}

export default async function PublicLabPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const lab = await getLab(id); if (!lab) notFound();
  const groups = [["Tests", lab.tests], ["Certifications", lab.certifications], ["Accepted commodities", lab.acceptedCommodities], ["Capabilities", lab.capabilities]] as const;
  return <main className="min-h-screen bg-default-50 px-4 py-16 dark:bg-brand-abyssal"><article className="mx-auto max-w-4xl rounded-3xl border border-default-200 bg-white p-7 dark:border-white/15 dark:bg-brand-blue md:p-12"><Link href="/developer/catalog" className="text-sm font-bold text-primary-500">← Developer catalog</Link><div className="mt-7 flex flex-wrap items-center gap-3"><span className="rounded-full bg-success-100 px-3 py-1 text-xs font-black text-success-700">PUBLISHED LAB</span>{lab.source?.label ? <span className="text-xs font-bold text-default-500">Source: {lab.source.label}</span> : null}</div><h1 className="mt-4 text-4xl font-black dark:text-white">{lab.displayName}</h1><p className="mt-3 text-default-600 dark:text-white/70">{[lab.location?.address, lab.location?.city, lab.location?.state, lab.location?.country].filter(Boolean).join(", ") || "Published OBAOL quality-lab profile"}</p>{lab.description ? <p className="mt-6 text-lg leading-8">{lab.description}</p> : null}
    <div className="mt-8 grid gap-5 md:grid-cols-2">{groups.map(([title, values]) => <section key={title} className="rounded-2xl bg-default-100 p-5 dark:bg-white/5"><h2 className="font-black">{title}</h2>{values?.length ? <ul className="mt-3 flex flex-wrap gap-2">{values.map((value: string) => <li key={value} className="rounded-full bg-white px-3 py-1 text-sm dark:bg-white/10">{value}</li>)}</ul> : <p className="mt-3 text-sm text-default-500">No published details.</p>}</section>)}</div>
    {lab.source?.url ? <a href={lab.source.url} target="_blank" rel="noopener noreferrer" className="mt-8 inline-block font-bold text-primary-500">View official source ↗</a> : null}<p className="mt-8 border-t pt-5 text-sm text-default-500">This public profile intentionally excludes private contacts and internal workflow information.</p></article></main>;
}
