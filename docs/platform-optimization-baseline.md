# Platform Optimization Baseline

Run these checks before and after each optimization batch. Keep the three repositories independently releasable and do not compare measurements collected with different fixtures or hardware.

## Static health

Each repository exposes the same source-health command:

```sh
npm run metrics:static
```

Initial snapshot on 2026-09-11:

| Repository | Source files | Lines | `any` references | Console calls | Files over 500 lines |
| --- | ---: | ---: | ---: | ---: | ---: |
| Frontend | 383 | 87,026 | 1,678 | 61 | 41 |
| Main backend | 353 | 37,067 | 1,498 | 149 | 13 |
| Developer API | 42 | 2,964 | 3 | 20 | 0 |

The counts are prioritization signals, not pass/fail gates. A batch must not increase them without explaining the tradeoff.

## Correctness and build gates

```sh
# Frontend
npm run typecheck && npm test && npm run build && npm run check:bundle

# Main backend and developer API
npm run verify
```

Initial correctness baseline: frontend 20 tests passed, main backend 88 tests passed, and all repositories type-checked. Developer API contract coverage is introduced by the first optimization batch.

## Runtime gates

- Frontend: `npm run test:perf:mobile`; require LCP <= 2.5 s, CLS <= 0.1, and TBT <= 200 ms on the audited route set.
- Main backend: `npm run load:dashboard`; require p95 <= 500 ms and error rate <= 1% using disposable credentials and a non-production dataset.
- Developer API: `npm run load:api`; use `/health` for infrastructure smoke tests or `/v1/prices` with `LOAD_API_KEY` for an authenticated read path, with the same p95 and error-rate limits.
- The API load command defaults to 50 requests so it stays below the existing 60/min API-key limiter. Larger tests require a matching rate-limit fixture; `429` responses count as errors.
- Record route, fixture, concurrency, commit, and environment alongside every runtime result.

## First batch measurements (2026-09-11 to 2026-09-13)

- Frontend `/auth` first-load JavaScript: 156 KB to 106 KB (Next.js production build); route gzip: about 153.3 KB to 104 KB. Existing bundle budgets pass.
- Mobile Lighthouse `/auth`: performance 92, accessibility 100, best practices 100; LCP 3.34 s, CLS about 0.0004, TBT 65 ms. **The 2.5 s LCP target is not yet met.** The font-display experiment did not improve it and was reverted.
- Frontend: 25/25 unit tests and 32/32 mobile Playwright checks passed after aligning a stale auth assertion with the existing chooser UI. Chart tiles now defer their chart modules; no additional `/dashboard` route-size decrease was measured in this batch.
- Backend: 90/90 tests passed, including the new index regression tests. Developer API: 8/8 contract test groups passed, including MCP tool names, transport authentication, and calculator permissions.
- API infrastructure smoke: the initial 200-request run returned 40% errors because the existing global limiter allows 120/min, not because of server exceptions. With the corrected default, `/health` returned 0% errors over 50 requests at concurrency 20, p95 14.3 ms on a local loopback run. This is not a substitute for authenticated read-path load testing against a representative dataset.
