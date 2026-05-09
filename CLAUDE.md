# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (defaults to :3000, falls back to :3001)
npm run build        # Production build
npm run lint         # ESLint (next/core-web-vitals + next/typescript)
npx tsc --noEmit     # Type-check without emitting (no test suite exists)

# Database (only needed when NEXT_PUBLIC_DEMO_MODE=false)
npm run db:push      # Push Prisma schema to Supabase
npm run db:seed      # Seed the database (tsx prisma/seed.ts)
npm run db:studio    # Open Prisma Studio
```

**Demo login:** any email + any password, or click "Try Demo Mode". Auth is a `demo_session` cookie set on the login page.

## Architecture

### Data flow — two completely separate modes

**Demo mode** (`NEXT_PUBLIC_DEMO_MODE=true`, default):
- All data lives in `data/seed-data.ts` as static arrays
- Mutations go through `DataContext` (`context/data-context.tsx`), which layers localStorage on top of seed data using three buckets: user-added items, overrides for edited seed items, and a deleted-IDs set
- localStorage keys are prefixed `shapers_*`
- No API routes hit

**Production mode** (`NEXT_PUBLIC_DEMO_MODE=false`):
- Supabase + Prisma ORM; schema in `prisma/schema.prisma`
- Auth via `@supabase/ssr`

### Page layout

Every dashboard page is wrapped by `app/(dashboard)/layout.tsx`, which mounts `<DataProvider>` + `<Sidebar>` + `<TopNav>`. All dashboard pages are `"use client"` components — there are no Server Components in the dashboard today.

Protected routes are declared in `middleware.ts`; when adding a new route, add it to the `PROTECTED` array there.

### Adding a new dashboard module

1. Add the type(s) to `types/index.ts`
2. Add seed data to `data/seed-data.ts`
3. If the data needs CRUD, wire it into `DataContext` following the existing pattern (local array + override map + deleted set + localStorage persistence)
4. Create `app/(dashboard)/<route>/page.tsx`
5. Add to `NAV_ITEMS` in `components/layout/sidebar.tsx` (groups: `"main"` = Operations, `"tools"` = Tools)
6. Add a `CommandItem` in `components/layout/command-palette.tsx`
7. Add the path to `PROTECTED` in `middleware.ts`

### Styling conventions

- `cn()` from `lib/utils.ts` (clsx + tailwind-merge) for conditional classes
- `formatCurrency(value)` — uses `de-DE` locale with EUR; `compact: true` for dashboard tiles
- `trafficLight(value, greenMin, yellowMin, inverted?)` returns `TrafficLight` used by KPI cards
- Department/severity color palettes are always defined as a `Record<K, {...}>` constant near the top of the file that uses them — see `DEPT_COLORS` in `components/org-chart/org-node.tsx` or `SEV_CONFIG` in `app/(dashboard)/risks/page.tsx`
- Page container: `<div className="p-6 space-y-6 max-w-[1600px] mx-auto">`
- Full-height canvas pages (org chart, kanban): `flex flex-col h-[calc(100vh-4rem)] overflow-hidden`

### Known pre-existing TypeScript errors

`npx tsc --noEmit` reports errors in these files that existed before any recent changes — do not treat them as regressions:
- `components/crm/deal-card.tsx` — references removed `customer` / `assignedTo` fields on `PipelineDeal`
- `components/dashboard/kpi-card.tsx` — references old `KpiCardData` field names
- `components/dashboard/material-price-chart.tsx` — references removed `priceTrend` field on `Material`
- `components/dashboard/open-claims.tsx`, `critical-issues.tsx` — references removed `title`/`createdAt` fields
- `components/dashboard/rfq-win-loss-chart.tsx` — `rfqsWon`/`rfqsLost` vs `rfqWon`/`rfqLost`
- `lib/utils.ts` — `trafficLight()` returns lowercase strings but `TrafficLight` type is uppercase

### Org Chart module

Added on top of the empty `ORG Chart/` directory placeholder:
- `types/index.ts` — `OrgDepartment`, `OrgEmployee`
- `data/seed-data.ts` — `EMPLOYEES` (18 people, 5 hierarchy levels)
- `components/org-chart/org-node.tsx` — employee card; exports `DEPT_COLORS` for reuse
- `components/org-chart/org-tree.tsx` — recursive CSS tree; flat-grid fallback when searching/filtering
- `app/(dashboard)/org-chart/page.tsx` — page with zoom, search, department filter, hierarchy stats
