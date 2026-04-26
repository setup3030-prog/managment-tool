# Shapers Command Center

A premium executive management platform for plastic injection molding & tooling operations.

## Quick Start (Demo Mode — No database needed)

### Prerequisites
Install [Node.js 18+](https://nodejs.org) (LTS version recommended).

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to the login page.

**Demo credentials:** Click the "Try Demo Mode" button (or use any email + any password).

---

## Features

### Executive Dashboard
- 6 KPI cards with traffic-light indicators (Revenue, Margin, OEE, Scrap, OTD, Cash)
- Revenue trend area chart (12 months)
- RFQ Win/Loss bar chart
- Claims trend line chart
- Material price multi-series chart (PP, PA6, ABS, PC, POM)
- Upcoming deadlines section
- Critical issues feed
- Recent quotations list
- Open claims summary

### RFQ / Quoting Tool
- Full RFQ table with sorting, filtering, pagination
- Live cost calculator with engineering formulas
- 4-tab form: Customer Info → Part Data → Cost Inputs → Summary
- Calculated outputs: Part Cost, Sales Price, Margin, Annual Revenue, Break-even
- PDF quotation generator (print-optimized HTML)
- CSV export

### CRM / Sales Pipeline
- Drag-and-drop Kanban board (7 stages)
- Customer profiles with contacts, RFQ history, claims history, notes
- Pipeline value summary per stage

### Reports
- Sales report by customer (bar chart + table)
- Margin trend (12-month line chart)
- RFQ performance (win/loss rate)
- Customer P&L table
- CSV export on every report

### Settings
- Company name & currency configuration
- Traffic-light thresholds for all KPIs
- User management
- Notification preferences

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Charts | Recharts |
| Animations | Framer Motion |
| Forms | react-hook-form + Zod |
| Tables | @tanstack/react-table |
| Kanban | @hello-pangea/dnd |
| Toasts | Sonner |
| Search | cmdk |
| Theme | next-themes |
| Icons | Lucide React |
| DB (optional) | Supabase + Prisma ORM |

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+K` / `⌘K` | Open command palette |

---

## Project Structure

```
app/
├── (auth)/login/         # Login page
├── (auth)/register/      # Register page
├── (dashboard)/
│   ├── dashboard/        # Executive Dashboard
│   ├── rfq/              # RFQ list + new + [id]
│   ├── crm/              # Kanban + [id] customer profile
│   ├── reports/          # Reports & analytics
│   └── settings/         # App settings
└── api/rfq/[id]/pdf/     # PDF quotation endpoint
components/
├── ui/                   # shadcn/ui components
├── layout/               # Sidebar, TopNav, CommandPalette
├── dashboard/            # KPI cards, charts, sections
├── rfq/                  # RFQ table, form, cost calculator
├── crm/                  # Kanban board, customer profile
└── reports/              # Report charts & tables
data/
└── seed-data.ts          # All demo data (8 customers, 25 RFQs, ...)
hooks/
└── use-rfq-calculator.ts # Cost calculation engine
types/index.ts            # All TypeScript types
prisma/schema.prisma      # Database schema (for Supabase)
```

---

## Enabling Real Database (Supabase)

1. Create a project at [supabase.com](https://supabase.com)

2. Copy `.env.local.example` to `.env.local` and fill in your credentials:
```
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
DATABASE_URL=postgresql://...?pgbouncer=true
DIRECT_URL=postgresql://...
```

3. Push the schema:
```bash
npm run db:push
```

4. Seed the database:
```bash
npm run db:seed
```

---

## RFQ Cost Calculation Formula

```
partsPerHour    = (3600 / cycleTime) × cavities
materialCost    = (partWeight × materialCostPerKg) / (1 - scrapPct/100)
machineCost     = machineRate / partsPerHour
laborCost       = laborRate / partsPerHour
directCost      = materialCost + machineCost + laborCost + packaging + logistics
toolingPerPart  = toolingCost / annualVolume
variableCost    = directCost + toolingPerPart
sgaPerPart      = variableCost × sgaPct/100
partCost        = variableCost + sgaPerPart
salesPrice      = partCost / (1 - targetMarginPct/100)
annualRevenue   = salesPrice × annualVolume
annualProfit    = (salesPrice - partCost) × annualVolume
breakevenQty    = toolingCost / (salesPrice - directCost - sgaPerPart)
```

---

## KPI Traffic-Light Thresholds

| KPI | Green | Yellow | Red |
|---|---|---|---|
| Gross Margin | > 17% | 12–17% | < 12% |
| OEE | > 85% | 75–85% | < 75% |
| Scrap Rate | < 2.5% | 2.5–4% | > 4% |
| On-Time Delivery | > 95% | 85–95% | < 85% |

---

Built with Shapers Command Center v1.0
