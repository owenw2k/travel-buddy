# Travel Buddy v2

## Next.js Version Note

This project uses Next.js 16, which has breaking changes from earlier versions. Before writing any Next.js-specific code, read the relevant guide in `node_modules/next/dist/docs/`. Key changes: Turbopack is default, Tailwind 4 uses CSS-based config (no `tailwind.config.js`), ESLint uses flat config (`eslint.config.mjs`).

Interactive map to track visited/driven/lived regions. Frontend only, no backend.

See SPEC.md for full details. v1 reference: https://github.com/owenw2k/travel-buddy

## Stack

- Next.js (App Router), Tailwind, shadcn/ui, Zustand, react-simple-maps

## Conventions

- TypeScript strict mode
- Tailwind for all styling — no CSS modules or inline styles
- No default exports except Next.js pages and layouts
- All map state managed through the Zustand store in `src/store/mapStore.ts`
- IndexedDB persistence handled in `src/lib/persist.ts` — not inline in components
- No backend, no AWS resources

## Testing

- Coverage target: >90% — enforced in CI
- Tests are behavioral — test observable outputs, not internal implementation details
- Shared test factories live in `__tests__/factories/` (e.g. `createMapState()`, `createLegend()`)
- Every store action, utility function, and component has a corresponding unit test (Jest + React Testing Library)
- Persistence helpers test against jsdom's localStorage stub — never touch real storage in unit tests
- No duplicate assertions between unit and e2e tests — each behavior tested in exactly one layer
- Playwright e2e tests cover all user-facing flows
- Playwright tests use Gherkin-syntax comments (`# Given`, `# When`, `# Then`) above each step block
- Tests live in `__tests__/` (unit) and `e2e/` (Playwright) at the repo root

## Documentation

- Every function, store action, type, and persistence helper gets a JSDoc block — no exceptions
- Include `@param`, `@returns` where applicable, and `@example` for store actions and non-obvious IndexedDB operations
- Every field on every type and the store shape gets a JSDoc description
- Inline comments explain the _why_: map projection quirks, URL encoding for share links

## UI

- shadcn/ui for all components — do not build primitives from scratch
- Dark mode via Tailwind `dark:` classes, toggled via next-themes
- All interactive elements keyboard-navigable; ARIA labels required on map regions and icon-only buttons
- Map component loaded client-side only (no SSR) — use `dynamic(() => import(...), { ssr: false })`
- GeoJSON files loaded via dynamic import — never statically bundled
- CI runs GitHub Actions (lint → typecheck → test → build) on every push and PR
- Vercel deploys: `main` → production, feature branches → preview URLs

## README

`README.md` must always be kept up to date with:

- What the project is
- How to run locally
- How to run tests

## State

- Zustand store is the single source of truth
- Map state (regions, legends, world toggle) persisted to localStorage via `src/lib/persist.ts` — do not read/write localStorage directly in components or the store
- Dark mode preference persisted to localStorage via next-themes — this is intentionally separate from map state
