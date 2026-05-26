# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Documentation agents

- `docs/agents/README.md` — Rôles, méthode de travail, règles par agent
- `docs/agents/cartographie.md` — Cartographie complète : routes, composants sensibles, simulateurs, risques SEO/conformité

## Commands

```bash
# Dev & build
npm run dev          # Vite dev server at localhost:5173
npm run build        # Production build (SCPI data generation + static pages + sitemap)
npm run preview      # Preview production build
npm run lint         # ESLint on TypeScript/React files
npm run test         # Vitest (golden snapshot tests for tax scenarios)
npm run deploy:netlify  # Build + deploy to Netlify

# Data ingestion (separate project)
cd scpi-ingestion && npm run dev         # Run PDF extraction pipeline (Playwright)
cd scpi-ingestion && npm run typecheck   # Type-check ingestion pipeline
cd scpi-ingestion && npm run playwright:install  # Install Playwright browser deps
```

## Environment

Copy `.env.example` to `.env.local` with Supabase credentials (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Without these, Supabase features degrade gracefully (nullable singleton in `src/lib/supabase.ts`). Netlify functions use a separate `SUPABASE_*` service role key.

## Architecture

**MaximusSCPI** is a React/TypeScript SPA with three layers:
1. **Client** (`src/`) — Vite + React, ~200 components, Tailwind
2. **Serverless functions** (`.netlify/functions-serve/`) — Auth, invitations, PDF generation
3. **Data pipeline** (`scpi-ingestion/`) — Scheduled PDF extraction for SCPI quarterly bulletins

### Navigation (custom view router)

No React Router. `App.tsx` uses a `currentView: string` state variable. Each view requires:
- A handler function (e.g., `handleAnalysisClick`) that calls `window.history.pushState` + `window.scrollTo(0, 0)`
- A render case in the main conditional
- A back-navigation path via `handleBackToHome()`

### Domain logic (`src/domain/`)

Pure functional architecture for financial simulations:
- **Money:** All calculations use `Decimal.js` (40-decimal precision, `ROUND_HALF_UP`). Helpers: `toDecimal()`, `roundMoney()`, `add()`, `mul()`, `div()`
- **Strategies:** `runDirectIR`, `runSciIR`, `runSciIS`, `runHoldingIS` — each takes typed inputs, returns `StrategyResult`
- **Tax config by year:** `taxConfigByYear` in `src/domain/tax/`
- **Tests:** Golden snapshot JSON files in `src/tests/golden/` validated by Vitest

### State management

Global contexts: `AuthContext`, `SubscriptionContext`, `PortfolioContext`, `AllocationContext`. Local state via `useState`. No Redux or Zustand.

### SCPI data

Master list in `src/data/scpiData.ts` (150+ properties per SCPI: yields, fees, geography, quarterly bulletin data). Source provenance tracked in `scpiSourceRegistry.ts`. Static per-SCPI pages are generated at build time.

### Component loading

Root components in `src/components/` are eager-loaded; subdirectory feature components (`fintech/`, `guidedJourney/`, `simulation/`, etc.) are lazy-loaded via `lazy(() => import(...))` with `<Suspense>` + `<LoadingSpinner />`.

### Supabase

- Client singleton in `src/lib/supabase.ts` (nullable if env vars missing)
- B2B queries via `src/lib/btob/supabaseBtob.ts`
- Netlify functions use service role key for admin ops (JWT verification in headers)

## Key conventions (from `.cursorrules`)

- **Language:** UI text and code comments in French; variable/function names in English (camelCase)
- **Dark mode:** Always include `dark:` Tailwind variants (e.g., `dark:bg-gray-800`)
- **Responsive:** Mobile-first with `sm:`, `md:`, `lg:` breakpoints; custom `xs` breakpoint defined
- **SEO:** Use `<SEOHead>` for metadata; structured data via schema tags
- **Modals:** Accept `isOpen` + `onClose` props; handle backdrop clicks
- **Performance:** Lazy-load heavy modules; `<Suspense>` with `<LoadingSpinner>` fallback

## Key dependencies

| Package | Purpose |
|---------|---------|
| `decimal.js` | All financial math (no floats) |
| `@supabase/supabase-js` | Auth + database |
| `recharts` | Charts (yield, portfolio) |
| `jspdf` + `@react-pdf/renderer` | Client-side PDF export |
| `zod` | Form & API validation |
| `vitest` | Golden snapshot tests |
| `playwright` | PDF downloads in ingestion pipeline |
