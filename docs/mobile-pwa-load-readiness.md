# Mobile PWA and Load Readiness

This project now has repeatable gates for the dashboard-focused mobile PWA path.

## Local Verification

Run the frontend gates from `obaol-automate-frontend`:

```sh
npm run typecheck
npm test
npm run build
npm run check:bundle
npm run test:e2e:mobile
npm run test:perf:mobile
```

`npm run test:website` runs the same sequence after a production build is available.

## Mobile PWA Scope

The Playwright suite checks the authenticated dashboard shell on iPhone-class viewports. It covers dashboard home, product, marketplace, enquiries, orders, profile, and inventory screens. It verifies:

- `/manifest.webmanifest` has installable standalone dashboard defaults.
- The mobile bottom navigation is visible and has 44 px tap targets.
- Dashboard pages avoid horizontal overflow.
- Core shell containers render without blank screens.
- Console errors and failed network requests are surfaced.

The current app declares PWA metadata and iOS web-app flags, but it does not register a service worker. Offline behavior should therefore be treated as not implemented until a caching strategy is added.

## Performance

`npm run test:perf:mobile` runs Lighthouse in mobile mode for `/auth` by default. The authenticated dashboard shell is covered by Playwright because the local audit needs mocked dashboard APIs. Override routes with:

```sh
LH_ROUTES="/auth,/dashboard,/dashboard/inventory" npm run test:perf:mobile
```

Reports are written to `reports/lighthouse`.

SEO is reported for app routes, but `/auth` and `/dashboard` do not enforce the SEO threshold by default because private/authenticated pages are normally not intended for indexing. Set `LH_REQUIRE_APP_ROUTE_SEO=1` to enforce SEO on those routes.

## Load Testing

Use the backend load script from `obaol-automate-backend`:

```sh
LOAD_BASE_URL=http://localhost:5001 LOAD_EMAIL=loadtest@example.com LOAD_PASSWORD='Passw0rd!' LOAD_ROLE=Associate npm run load:dashboard
```

The script logs in once, reuses the auth cookie, warms up at 50 connections, then verifies a 100-connection steady phase across read-heavy dashboard endpoints. It fails when the error rate is above 1% or p95 latency is above 500 ms.

Do not run write-heavy or destructive load tests against production without a safe test window and disposable data.
