# Platform UX Audit Inventory

This inventory is the release checklist for public, authentication, and protected persona journeys. “Automated” means covered by repository tests; “manual” requires disposable authenticated accounts configured through `.env.audit.local`.

| Area | Personas | Entry → exit | Primary action | Required states | Current repair status |
|---|---|---|---|---|---|
| Public landing | Visitor | `/` → `/auth` | Get started | Loading, reduced motion, mobile | Unified header, intent chooser, plain copy, one active H1 |
| Public marketplace | Visitor | `/product` → listing | Review product | Empty, unavailable API | Shared public shell; manual content audit pending |
| Authentication entry | Buyer, Seller, Operator | `/auth` → role login/register | Choose workspace | Loading, returning user | Implemented and automated |
| Associate onboarding | BUY, SELL, BOTH | `/auth/register` → pending | Review and submit | Draft, validation, API failure | Four steps and intent prefill implemented; authenticated test pending |
| Operator onboarding | Operator | operator registration → pending | Review and submit | Draft, validation, API failure | Existing four-step flow retained; authenticated test pending |
| Approval holding | Associate, Operator, Team | pending/rejected → sign out | Check status/contact support | Pending, rejected | Rewritten in plain language; normal navigation locked |
| Dashboard overview | All approved roles | `/dashboard` → next-best action | Continue priority work | Empty, partial API, error | Persona dashboards and BOTH focus switch implemented |
| Product discovery | BUY/BOTH | marketplace → enquiry | Create enquiry | Empty, filters, API failure | Permission and navigation repaired; transaction E2E pending |
| Product management | SELL/BOTH | company → products → publish | Add/list product | Empty, draft, rejected listing | Permission and mode routing implemented; E2E pending |
| Enquiries | Buyer, Seller, Operator | list → detail → next milestone | Complete next action | Pending, blocked, cancelled, converted | Role/responsible-party summary added; E2E pending |
| Samples | Buyer, Seller, Operator | list → detail → confirmation | Advance sample | Empty, rejected, failed request | Explicit access policy and breadcrumbs; detail standardization pending |
| Orders | Buyer, Seller, Operator | list → detail → documents | Complete current milestone | Active, blocked, complete | Role/responsible-party summary and plain status copy added |
| Services | Interested Associate, assigned Operator | dashboard → service panel | Start service task | Irrelevant interest, empty, API failure | Interest-aware visibility implemented |
| Organization | Associate/Operator/Admin | profile/company/team | Update relevant record | Empty, validation, permission | Separated profile/company navigation; manual audit pending |
| Admin configuration | Admin | overview → configuration | Review/manage | Empty, permission, API failure | Hidden from non-admin navigation/search and default-deny routes |
| Mobile shell | All roles | dashboard → top five routes | Navigate | 360–430 px, safe area, nested scroll | Five manifest priorities and nested-scroll behavior implemented |
| Brand routing | Visitor | host → platform/brand | Open site | localhost, IPv4/IPv6, custom domain | Pure resolver and automated tests implemented |

## Release gates

- Automated: type-check, lint, route policies, host routing, UX contracts, and production build.
- Manual: BUY, SELL, BOTH, Operator, Team, pending, and rejected accounts at 360, 390, 430, 768, 1024, and desktop widths.
- Production smoke tests must not submit payments, approvals, orders, or documents.
