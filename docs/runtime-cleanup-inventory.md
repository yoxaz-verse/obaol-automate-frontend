# Runtime Cleanup Inventory (Safe Pass)

## Active (kept)
- `src/core/api/apiRoutes.tsx` as the frontend API contract map.
- Dashboard critical path: `src/components/dashboard/*`, `src/core/data/useDashboardData.ts`, `src/app/dashboard/*`.
- Website routing and layout surfaces in `src/app/*` currently referenced by navigation/entrypoints.

## Inactive-But-Referenced (kept for later refactor)
- Large dashboard utility/table stack (`CurdTable`, `tableValues`, dependent hooks) still referenced by active pages.
- Translation and language modules remain active because they are mounted globally (`src/app/layout.tsx`, dashboard topbar).

## Unreferenced (removed in this pass)
- `src/core/api/routes.tsx` (legacy route constants, no imports).
- `src/icons/eyeIcon.tsx`
- `src/icons/editIcon.tsx`
- `src/icons/deleteIcon.tsx`

## Runtime No-op / Debug Cleanup Applied
- Removed non-essential debug/console logs from active flows:
  - `src/components/dashboard/LanguageSwitcher.tsx`
  - `src/components/dashboard/TranslationEngine.tsx`
  - `src/app/dashboard/reports/page.tsx`
  - `src/app/dashboard/companies/page.tsx`
  - `src/components/dashboard/Essentials/essential-tab-content.tsx`
  - `src/app/dashboard/geosphere/page.tsx`
  - `src/app/dashboard/rsForm/page.tsx`
