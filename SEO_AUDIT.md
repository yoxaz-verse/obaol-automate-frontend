# OBAOL Supreme SEO Audit

Audit date: 2026-11-01  
Canonical origin: `https://obaol.com`  
Positioning: B2B bulk trade execution platform for India-first domestic and international agricultural commodity workflows.

## A. Current SEO architecture

- Framework: Next.js 14 App Router with React 18. Public pages are predominantly static/SSG; dynamic brand and catalog-compatible routes use server rendering.
- Rendering: critical homepage headings, copy, metadata, and JSON-LD are present in the initial HTML. Public SEO does not depend on client-side metadata injection.
- Shared SEO: `src/utils/seo.ts` is the canonical metadata and WebPage schema utility. No second SEO framework was introduced.
- Head handling: the Metadata API supplies titles, descriptions, canonicals, Open Graph, X/Twitter metadata, and robots directives. Legacy `head.tsx` files remain only on retired public sections that middleware redirects away from the platform host.
- Crawl controls: `src/app/robots.ts`, `src/app/sitemap.ts`, route metadata, authentication, and middleware redirects have distinct responsibilities.
- Structured data: stable Organization and WebSite entities are emitted globally; indexable pages may add WebPage, FAQPage, BreadcrumbList, or supported service-oriented markup.
- Analytics: Google Analytics measurement ID `G-F4YK8H3Q4L` is loaded through `AnalyticsTracker`. No analytics account, consent configuration, or Search Console property was changed.
- Hosting: deployed on Vercel with HTTPS, HSTS, CSP, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy headers.
- Localization: English is the only first-party locale. Client-driven machine translation is not a localized URL architecture, so hreflang is not appropriate.

## B. Route-by-route inventory

| Route group | Rendering/indexing | Primary intent | Audit result |
| --- | --- | --- | --- |
| `/` | Static, indexable | B2B bulk trade execution platform | Updated title, description, H1, supporting copy, canonical, and WebPage schema |
| `/about`, `/why-obaol` | Static, indexable | Identity and platform differentiation | Existing metadata/schema preserved; duplicate title suffix fixed centrally |
| `/how-it-works` | Static, indexable | Bulk trade execution workflow | Existing crawlable MDX/content preserved |
| `/quick-commerce-procurement`, `/procurement` | Static, indexable | Agricultural procurement use cases | Existing focused content and schema preserved |
| `/verification` | Static, indexable | Participant and execution verification | Existing focused content preserved; title suffix corrected |
| `/roles`, `/roles/associate`, `/roles/operator` | Static, indexable | Participant model | Existing metadata and content preserved |
| `/roles/associate/[roleSlug]` | SSG, indexable for known roles | Role-specific participation | Existing WebPage, FAQPage, and BreadcrumbList markup preserved |
| `/trade-finance` | Static, indexable | Described trade-finance participation | Existing claims retained without expanding the offer |
| `/export-resources` | Static client UI, indexable server metadata | Official export resources | Added Metadata API title, description, canonical, social metadata |
| `/commission-structure` | Static client UI, indexable server metadata | Commission framework | Added unique metadata and sitemap entry |
| `/methods` | Static client UI, indexable server metadata | Relationship/execution methods | Added unique metadata and sitemap entry |
| `/faq`, `/trust` | Static, indexable | Product questions and identity validation | Existing metadata and schema preserved |
| Legal routes | Static, indexable | Policies and limitations | Existing content/canonicals preserved; duplicate title suffix corrected |
| `/brand/[slug]` | Dynamic, conditional indexability | Verified company brand page | Sitemap slug validation added; page metadata still noindexes unavailable brands |
| `/auth/**`, `/developer/**` | Private/tooling, noindex | Account and developer workspace | Existing server noindex preserved |
| `/dashboard/**` | Authenticated client workspace, noindex | Private operations | Converted to a server metadata wrapper so noindex is present in initial HTML |
| `/verification-pending`, `/documents/share/[token]` | Private/sensitive, noindex | Account/document workflow | Added reliable server Metadata API directives |
| Retired directory routes | 308 to `/` on platform host | None | Remain excluded from sitemap and public navigation |
| Unknown routes | Server 404, noindex | Error recovery | Replaced JavaScript redirect with useful crawlable 404 content |

## C. Findings by severity

### Critical

- Deployed `/dashboard` returned `index, follow`; its legacy `head.tsx` directive was not present in initial HTML. Fixed with a server layout wrapper.

### High

- Sitemap used request time as `lastmod` for every URL, falsely reporting that the entire site changed on each generation. Fixed by omitting unverified dates.
- `/export-resources`, `/commission-structure`, and `/methods` inherited the generic root metadata and lacked canonicals. Fixed through route layouts using the existing builder.
- Root title templating double-suffixed many page titles. Fixed by returning absolute titles from `buildMetadata`.
- The 404 response used client-side authentication detection to redirect all missing URLs, creating a poor soft-404 experience. Replaced while preserving the HTTP 404 status.

### Medium

- Organization/WebSite markup was duplicated on the homepage and global markup lacked stable entity IDs. Consolidated with `#organization` and `#website` IDs.
- A global SoftwareApplication offer declared a zero USD price without a matching visible offer on every route. Removed as inaccurate markup.
- Two `redirects()` keys existed in `next.config.mjs`; JavaScript object semantics discarded the first set. Consolidated so all intended redirects are active.
- robots.txt blocked dashboard/auth paths, preventing crawlers from observing their noindex metadata. Those blocks were removed; API endpoints remain disallowed. Authentication remains the privacy boundary.

### Low / observational

- Global keyword arrays are broader than Google requires. They are retained for compatibility, with the primary positioning clarified; future work may simplify them after performance monitoring.
- Some public experiences are client components, but their indexable headings and content are emitted in static initial HTML.
- Existing build output contains React hook and image lint warnings, mainly in authenticated/dashboard code. They are not treated as SEO fixes without measured public impact.

## D. Changes implemented

- `src/utils/seo.ts`: updated positioning defaults, absolute title handling, and stable WebPage/WebSite IDs.
- `src/app/layout.tsx` and `src/app/page.tsx`: updated global/home metadata, consolidated entities, removed unsupported offer markup, and removed duplicate WebSite output.
- `src/components/home/HeroSectionServer.tsx`: aligned the crawlable homepage H1 and summary with bulk trade execution positioning.
- Public route layouts: added unique metadata for export resources, commission structure, and methods.
- Private route layouts: added dependable noindex directives for dashboard, verification-pending, and secure shared documents.
- `src/app/sitemap.ts`, `src/app/robots.ts`, `next.config.mjs`, and `src/app/not-found.tsx`: corrected crawl/index behavior, redirects, sitemap freshness, and 404 handling.
- `tests/seoFoundation.test.mjs` and `tests/e2e/seo.spec.mjs`: added static and HTTP-level SEO regression coverage.

## E. Existing SEO features preserved

- Existing metadata utility, public route metadata, JSON-LD, Open Graph/X cards, analytics, sitemap/robots route handlers, middleware host routing, canonical origin, role pages, redirects, navigation, and page content.
- Existing authentication, authorization, dashboards, enquiry flows, document flows, API contracts, payment behavior, visual branding, and layouts.
- Retired-directory behavior and exclusion tests.

## F. Metadata and keyword map

| Page intent | Primary topic | Supporting topics |
| --- | --- | --- |
| Homepage | B2B bulk trade execution platform | India bulk trade, domestic/international execution, agricultural commodities |
| About / Why OBAOL | Trade execution platform identity | Discovery-to-execution differentiation |
| How It Works | Bulk trade execution workflow | Enquiries, verification, documents, logistics, closure |
| Procurement pages | Agricultural commodity procurement | Sourcing, replenishment, execution coordination |
| Verification | Trade verification framework | Participant, stock, quality, and workflow checks |
| Role pages | Trade participant roles | Buyers, sellers, importers, exporters, labs, warehouses, logistics, packaging |
| Trade Finance | Current participation models | Active trade funding descriptions only |
| Resources / trust / legal | Informational navigation | Export references, business identity, policies, limitations |

No search volumes, ranking positions, or keyword difficulty estimates are asserted. No keyword-variation doorway pages were created.

## G. Structured data

- Preserved accurate Organization, WebSite, WebPage, FAQPage, and BreadcrumbList markup.
- Added stable `@id` references and connected WebSite publisher to Organization.
- Removed duplicate homepage WebSite markup and unsupported global SoftwareApplication price/Offer data.
- No Review, AggregateRating, fabricated certification, testimonial, location, Product price, or unsupported social profile markup was added.

## H. Sitemap and robots

- Sitemap URLs are absolute, canonical public landing pages.
- Authentication, dashboard, developer, API, retired directory, search/filter, and thin/error URLs remain excluded.
- `/commission-structure` and `/methods` were added after receiving unique canonical metadata.
- `lastmod` is omitted until a trustworthy content modification source exists.
- Dynamic brand slugs must match the safe canonical slug pattern; unavailable brands remain noindex through route metadata.
- robots.txt references the sitemap and blocks API crawling only. Sensitive content is protected by authorization, not robots.txt.

## I. Rendering and indexing recommendations

- Keep the current App Router static/server rendering model; a framework migration is not justified.
- After deployment, inspect rendered HTML for homepage, key public routes, dashboard, secure document routes, and 404 responses.
- If brand pages become a strategic acquisition surface, expose only reviewed/public brands from a dedicated API field before expanding sitemap coverage.
- Do not create locale URLs or hreflang until human-maintained localized content and routing exist.

## J. Performance findings

- Production build baseline: homepage first-load JavaScript approximately 136 kB; shared first-load JavaScript approximately 86.9 kB in the pre-change audit.
- Public hero content is server-rendered and the primary font is self-hosted with `next/font/local`.
- Existing responsive WebP assets and Next image handling are broadly positive. Dashboard/document-preview `<img>` warnings are outside the public SEO scope.
- Lighthouse mobile lab results on the local production build:
  - `/`: Performance 77, Accessibility 96, Best Practices 96, SEO 100; LCP 6,155 ms, CLS 0, TBT 18 ms.
  - `/about`: Performance 80, Accessibility 96, Best Practices 96, SEO 100; LCP 5,215 ms, CLS 0, TBT 7 ms.
  - `/how-it-works`: Performance 87, Accessibility 93, Best Practices 96, SEO 100; LCP 4,060 ms, CLS 0, TBT 7 ms.
- All three public routes miss the repository's performance/LCP thresholds. Low TBT and zero measured CLS are positive; LCP needs focused profiling in a deployment-like environment before changing assets or animation behavior.
- The asset audit passed and reports 8.97 MB referenced versus 25.29 MB unreferenced public assets. No assets were deleted because ownership and deployment use outside static source references were not proven.

## K. Test results

- Type check: PASS.
- Lint: PASS with existing warnings also surfaced by the production build.
- SEO static regression tests: PASS, 9/9.
- SEO HTTP/Playwright tests: PASS, 3/3 for initial metadata, canonicals, private noindex, 404, sitemap, and robots.
- Production build: PASS with existing React hook, `<img>`, and one accessibility warning.
- Unit suite baseline: FAIL, four pre-existing non-SEO failures in associate guide search, dashboard uppercase policy, bidding terminology, and dashboard discovery terminology.
- Unit suite final: FAIL with the same four failures; no new SEO regression failure.
- Public navigation Playwright: 5/10 passed. All signed-in cases passed; five signed-out cases retain the pre-existing stale CTA expectation (`Get Started` while the UI uses `Join Platform`).
- Bundle budget: FAIL because `/dashboard/enquiries/[id]` is 381.2 KB gzip against a 380 KB budget. Public routes remained within their configured budgets.
- Public asset audit: PASS; report updated at `reports/performance/public-assets.json`.
- Lighthouse mobile: completed, SEO 100 on all three measured routes; performance/LCP thresholds failed as recorded above.
- Live deployed HTML baseline: PASS for server-rendered homepage/public metadata and true 404 status; FAIL for dashboard noindex before this change. Deployment verification remains required.

## L. Manual attention and risks

- Deploy before expecting live crawl behavior to change; no deployment was performed here.
- Verify the legal business name, founding date, address, support email, LinkedIn URL, and served markets before expanding Organization markup.
- Review Search Console coverage for previously discovered dashboard/auth URLs after Google recrawls them.
- Confirm whether `/developer` should remain linked in the public menu while noindexed; this audit preserves the current navigation and tooling policy.
- Review whether commission and finance language requires legal/compliance qualification before future content expansion.
- External competitor research and backlink analysis were not required for these repository fixes and no unsupported competitor claims were added.

## M. 30/60/90-day roadmap

### 30 days

- Deploy, submit the sitemap, request recrawls for the homepage and corrected private-route samples, and monitor indexing/duplicate-title reports.
- Record Core Web Vitals and Lighthouse field/lab data for homepage, about, how-it-works, procurement, and one role page.
- Verify Organization facts and all public capability-status labels with product owners.

### 60 days

- Use Search Console query/page data to refine titles and descriptions without creating overlapping keyword pages.
- Improve existing pages with evidence-backed FAQs, examples, and internal links where users show unmet intent.
- Evaluate one content brief each for domestic bulk trade, international execution, and agricultural commodity operations; publish only if the business can support original factual content.

### 90 days

- Compare indexed pages, non-brand impressions, click-through rate, Core Web Vitals, and qualified conversions against the deployment baseline.
- Decide whether reviewed brand/service profiles merit controlled indexation and sitemap inclusion.
- Establish content ownership, update dates, and editorial review so sitemap `lastmod` can eventually use real modification data.

## N. Search Console verification checklist

- [ ] Verify the canonical HTTPS non-www domain property and ownership.
- [ ] Submit `https://obaol.com/sitemap.xml` after deployment.
- [ ] Inspect `/`, `/about`, `/how-it-works`, `/procurement`, and representative role pages.
- [ ] Confirm Google-selected canonical equals the declared canonical.
- [ ] Inspect `/dashboard`, `/auth`, `/verification-pending`, and a secure share URL to confirm `noindex` is visible when crawlable.
- [ ] Validate the live 404 response and retired-route redirects.
- [ ] Review Page Indexing exclusions for soft 404, duplicate, crawled-not-indexed, and blocked-by-robots changes.
- [ ] Review Enhancements only for schema types actually present; rich results are not guaranteed.
- [ ] Monitor Core Web Vitals by mobile/desktop and URL group.
- [ ] Record branded versus non-branded queries and qualified signup/enquiry conversions.
- [ ] Do not use URL submission as a substitute for crawlable links, accurate canonicals, or useful content.
