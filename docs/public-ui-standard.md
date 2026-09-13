# OBAOL public UI

Public pages use warm neutral surfaces, restrained gold accents, and the existing Plus Jakarta Sans font. `PublicPageScope` applies `.obaol-public` to public routes only. Dashboard, authentication, developer, verification-pending and error routes are excluded. This wrapper controls presentation, never authorization.

## Components

Import `PublicContainer`, `PublicSectionHeading`, `PublicCard`, and `PublicLinkButton` from `@/components/public/PublicUI`. Use `public-section` on section roots. Link buttons support `primary` and `secondary`; use primary for the principal call to action. Use native buttons for actions, with the same `public-button` classes. Keep headings semantic and associate sections with their heading IDs.

Containers cap at 1296px including desktop gutters, giving 1200px of content. Gutters are 20/32/48px at mobile/640px/1024px. Sections use 56px vertical spacing, increasing to 88px at 1024px. Headings use 32–48px; only page heroes should exceed this. Body text is 16–18px; prose should stay within 65 characters per line. Article/legal wrappers use `public-reading-page`.

## Surfaces and interaction

Tokens live in `src/app/public-ui.css`, with light and dark values scoped to `.obaol-public`. Cards use 16px corners, subtle borders, and minimal shadows. Use `public-muted` for secondary text and `public-eyebrow` for short labels. Avoid repeating decorative grids, glows, or deeply nested panels. Controls need 44px targets and visible keyboard focus. Respect reduced motion; never rely on motion or color alone to communicate state.

Existing page layouts opt into the same spacing through `public-layout-container`, `public-standard-section`, and `public-surface-card`. These explicit classes avoid changing dashboard utilities or functional catalog layouts. Preserve native filters, links, metadata, and structured data when adapting pages.

## Execution preview

`ExecutionPreview` is a static, labeled illustration, not live operational data. Its milestones stack on phones and share a two-column frame on desktops. Do not turn the preview into an image or add negative margins/cropping. Links lead to the existing workflow page.

## Verification

Run `npm run typecheck`, `npm test`, `npm run build`, and `npm run check:bundle`. Review home, informational, role, service, catalog, and legal pages at 375/768/1440px in both themes. Verify navigation, theme switching, focus, reduced motion, and that private routes do not receive the public scope.
