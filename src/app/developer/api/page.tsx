import Link from "next/link";
const endpoints = [
  ["GET", "/v1/catalog/summary", "products:read + labs:read", "Live catalog and MCP counts"],
  ["GET", "/v1/products/live", "products:read", "Search live product listings"],
  ["GET", "/v1/products/all", "products:read", "Read the complete product catalog"],
  ["GET", "/v1/labs/live", "labs:read", "Search public-safe quality labs"],
  ["GET", "/v1/prices", "prices:read", "Read commodity prices"],
  ["GET", "/v1/traders", "traders:read", "Read trader records"],
  ["POST", "/v1/inquiries", "inquiries:create", "Create an external enquiry"],
  ["POST", "/v1/calculate/cif", "calculator:use", "Calculate CFR/CIF values"],
] as const;
export default function DeveloperApiPage() { return <main className="min-h-screen bg-default-50 px-4 py-12 dark:bg-brand-abyssal"><section className="mx-auto max-w-6xl"><p className="text-xs font-black uppercase tracking-[.2em] text-obaol-700">REST API</p><h1 className="mt-2 text-4xl font-black">API reference</h1><p className="mt-3 text-default-600 dark:text-white/70">Base URL <code>https://api.obaol.com</code>. Protected requests use <code>Authorization: Bearer &lt;API_KEY&gt;</code>.</p>
  <div className="mt-8 overflow-x-auto rounded-2xl border border-default-200 bg-white p-5 dark:border-white/15 dark:bg-brand-blue"><table className="min-w-[820px] w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3">Method</th><th>Endpoint</th><th>Permission</th><th>Purpose</th></tr></thead><tbody>{endpoints.map((row) => <tr key={row[1]} className="border-b border-default-100 last:border-0 dark:border-white/10"><td className="py-4"><b>{row[0]}</b></td><td><code>{row[1]}</code></td><td><code>{row[2]}</code></td><td>{row[3]}</td></tr>)}</tbody></table></div>
  <div className="mt-6 grid gap-5 lg:grid-cols-2"><DocCard title="Live products" code={'curl "https://api.obaol.com/v1/products/live?search=turmeric&page=1&limit=20" \\\n  -H "Authorization: Bearer <API_KEY>"'} /><DocCard title="Published labs" code={'curl "https://api.obaol.com/v1/labs/live?commodity=turmeric&state=Karnataka" \\\n  -H "Authorization: Bearer <API_KEY>"'} /></div>
  <div className="mt-6 grid gap-5 md:grid-cols-3"><Info title="Response envelope" text="Successful list routes return success, data, and pagination meta with page, limit, total, and pages." /><Info title="Errors" text="400 invalid input · 401 missing/invalid key · 403 missing permission · 429 rate limited · 500 service error." /><Info title="Safe lab fields" text="Lab APIs exclude email, phone, WhatsApp, private notes, and internal workflow fields." /></div>
  <div className="mt-8 flex flex-wrap gap-3"><a href="https://api.obaol.com/openapi.yaml" className="rounded-xl bg-obaol-500 px-5 py-3 font-black text-black">OpenAPI schema</a><Link href="/developer/keys" className="rounded-xl border px-5 py-3 font-bold">Manage API keys</Link></div>
  </section></main>; }
function DocCard({ title, code }: { title: string; code: string }) { return <article className="rounded-2xl bg-brand-abyssal p-5 text-white"><h2 className="font-black">{title}</h2><pre className="mt-4 overflow-x-auto text-xs leading-6 text-default-100"><code>{code}</code></pre></article>; }
function Info({ title, text }: { title: string; text: string }) { return <article className="rounded-2xl border border-default-200 bg-white p-5 dark:border-white/15 dark:bg-brand-blue"><h2 className="font-black">{title}</h2><p className="mt-2 text-sm leading-6 text-default-600 dark:text-white/70">{text}</p></article>; }
