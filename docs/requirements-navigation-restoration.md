# Requirements navigation restoration

The Requirements implementation remained available at `/dashboard/requirements`, including its create, detail, provider-opportunity, and API workflows. Two navigation regressions made it appear removed:

- the canonical Requirements layout inherited the legacy External Orders “coming soon” gate, which blocked Associates;
- the Admin Trade navigation group still referenced the redirect-only `/dashboard/external-orders` path instead of the canonical route.

Requirements is now a live, separate Trade navigation item immediately before Execution Panel. The External Orders list and create URLs remain redirect-only aliases for saved links. Existing requirement records, API contracts, provider redaction, ownership checks, bidding, awards, milestones, and execution state transitions are unchanged.
