# Travel Buddy v2 Spec

## Purpose

Interactive map to track visited/driven/lived regions. Rebuilt from scratch, cleaner than v1.

## Reference

v1 repo: https://github.com/owenw2k/travel-buddy

## Stack

- Next.js, Tailwind, shadcn/ui
- Zustand (replaces Redux — simpler state management)
- `react-simple-maps` for SVG maps
- `idb-keyval` for IndexedDB persistence (more robust than localStorage for large map JSON)

## Browser Compatibility

- **Chromium-based browsers only** (Chrome, Edge, Arc, Brave, etc.)
- Non-Chromium browsers (Safari, Firefox, IE) receive a full-page humorous fallback message
- Detection via `userAgent` on the client, shown before any map loads

## Features (carried from v1)

- World map + US map toggle
- Click region → assign a legend category
- Custom legend: add categories with custom colors
- Persist state across sessions

## Improvements over v1

- Zustand instead of Redux (no boilerplate)
- IndexedDB instead of localStorage (handles larger payloads cleanly)
- Fix `import { EventEmitter } from "stream"` bug in types.ts
- Proper component folder structure
- Mobile-friendly pan/zoom

## New Features

- **Export:** download map as PNG
- **Share:** generate a read-only share URL (state encoded in URL params)
- **Notes:** add a short note to any region (e.g. "Visited 2023, loved it")
- **Dark mode** — system preference default, manual toggle persisted in localStorage via next-themes (separate from map state in IndexedDB)

## Pages

```
/             ← the map (everything on one page)
/share/[id]   ← read-only view (state decoded from URL)
```

## Zustand Store Shape

```ts
{
  world: boolean,
  legends: { id: string, color: string, name: string }[],
  regions: { [id: string]: { legendId: string, note: string } },
}
```

## Performance

- World and US GeoJSON files loaded via dynamic import / lazy loading — not bundled
- Map component code-split and loaded client-side only (no SSR) to avoid hydration issues with SVG

## Design System

### Palette

| Token        | Light     | Dark      |
| ------------ | --------- | --------- |
| Background   | `#f2ede4` | `#181510` |
| Surface      | `#e8dfd0` | `#221e17` |
| Border       | `#c9b99a` | `#3d3626` |
| Text primary | `#1c1710` | `#ede0cc` |
| Text muted   | `#6b5c3e` | `#9e8a68` |
| Accent       | `#16a34a` | `#22c55e` |
| Accent hover | `#15803d` | `#16a34a` |

### Typography

- **Body/UI:** Inter
- **Headings:** Fraunces
- **Code:** JetBrains Mono

### Notes

- All colors defined as Tailwind config tokens — never hardcode hex values in components
- Dark mode via Tailwind `dark:` classes + next-themes
- Independent palette from hub/blog — earthy/adventure feel

## Error Pages & Fallbacks

All error pages follow the shared playful theme (see Global CLAUDE.md → Error Pages):

- `404` — unknown routes
- Map load failure — friendly error if GeoJSON fails to load
- **Non-Chromium fallback** — the tone reference for all error pages across all projects; lives in `src/components/NonChromiumFallback.tsx`
- All include a way back (home link)

## CI/CD

- **GitHub Actions** runs on every push and PR: lint → typecheck → unit tests → build
- **Vercel** handles all deployments automatically:
  - `main` branch → production deployment
  - Any feature branch → unique preview URL
- PRs must pass GitHub Actions before merge

## UI Standards

- **shadcn/ui** for all UI components
- **Dark mode** — system preference default, manual toggle
- **Accessibility** — all interactive elements keyboard-navigable, ARIA labels on map regions, color contrast AA compliant minimum
- **Error handling** — Next.js `error.tsx` boundary + friendly error page for map load failures
- **Loading states** — custom animated skeleton loader while GeoJSON and map component load

## Linting & Pre-commit

- ESLint + Prettier enforced in CI
- Husky + lint-staged runs ESLint + Prettier + typecheck on staged files before every commit
- Commit blocked if any check fails

## Testing Standards

- **Unit tests** (Jest + React Testing Library) for everything:
  - All Zustand store actions (assign region, add legend, clear, etc.)
  - All persistence helpers (`src/lib/persist.ts`) — mock idb-keyval
  - All share URL encode/decode utilities
  - All React components (render, interaction, edge cases)
  - Browser detection utility
- **Playwright e2e tests** for all user-facing flows (Chromium only):
  - Written with Gherkin-syntax comments (`# Given`, `# When`, `# Then`) above each step
  - Cover: map loads, clicking a region assigns a legend, adding a custom legend, switching world/US map, adding a note, exporting PNG, generating a share URL, visiting a share URL (read-only, no write actions available), share URL with state too large warns user, dark mode toggle
  - Non-Chromium fallback: tested via unit test on `browser.ts` detection utility (can't test in Playwright since Playwright runs Chromium)
- Tests live in `__tests__/` (unit) and `e2e/` (Playwright) at repo root

## Case Study

A blog post (or short series) documenting the journey from v1 to v2:

- What v1 looked like and what was wrong with it (Redux boilerplate, `stream` import bug, flat structure, localStorage limitations)
- How AI was used to plan and execute the migration
- Before/after code comparisons
- Lessons learned

The Travel Buddy card on the hub gets a **"Case Study"** link alongside the live demo and GitHub links, pointing to the blog post.

## Documentation Standards

- **JSDoc on everything**: all functions, Zustand store actions, types, and persistence helpers must have JSDoc blocks
  - `@param` and `@returns` for every function
  - `@example` for store actions and any non-obvious IndexedDB operations
- **Inline comments** explain the _why_ — map projection quirks, IndexedDB async patterns, URL encoding for share links, GeoJSON lazy loading, and any react-simple-maps workarounds
- Every field in the store shape and all types gets a JSDoc description

## Share URL Encoding

- State serialized as: `JSON.stringify(state)` → base64 → URL-safe base64 (replace `+/=` with `-_~`)
- Encoded state stored as a single `s` query param: `/share?s=...`
- Read-only enforced by route: `/share/` pages render the Zustand store in read-only mode, no write actions mounted
- Size limit: ~2000 chars for the URL — warn user if state is too large to share (many regions with long notes)
- No server involvement — encoding/decoding is entirely client-side

## Folder Structure

```
travel-buddy/
  src/
    app/                      ← Next.js App Router pages
    components/               ← React components (map, legend, controls)
    store/
      mapStore.ts             ← Zustand store
    lib/
      persist.ts              ← IndexedDB read/write via idb-keyval
      share.ts                ← URL encode/decode utilities
      browser.ts              ← Chromium detection
    types/                    ← TypeScript types
  __tests__/                  ← Unit tests
  e2e/                        ← Playwright tests (Chromium only)
  public/
    world.json                ← World GeoJSON (loaded lazily)
    us.json                   ← US GeoJSON (loaded lazily)
```

## Case Study Ship Requirement

- Travel Buddy v2 and the case study blog post must ship **at the same time**
- Do not deploy v2 without the blog post live
- Do not publish the blog post before v2 is deployed

## Notes

- No backend, no AWS
- Deploy to Vercel on push to `main`
- v1 localStorage data not migrated (fresh start)
- Dark mode via next-themes + localStorage — separate from map state in IndexedDB
