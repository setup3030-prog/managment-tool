# Prompt: Executive Management Dashboard – Design System & Logic Template

## Zastosowanie
Poniższy prompt opisuje warstwę wizualną i architekturę logiki aplikacji webowej klasy "Command Center" — panelu zarządzania dla firm B2B. Możesz go użyć jako podstawy do stworzenia analogicznej aplikacji dla innej branży (np. serwis maszyn, logistyka, HR, produkcja seryjna, usługi IT).

---

## PROMPT DO SKOPIOWANIA

```
Zbuduj aplikację webową – executive management dashboard – zgodnie z poniższą specyfikacją techniczną, wizualną i logiczną.

---

## STACK TECHNOLOGICZNY

- Framework: Next.js 15 (App Router, „use client" gdzie potrzeba)
- Język: TypeScript (strict mode)
- UI: shadcn/ui (Radix UI) + Tailwind CSS 3
- Wykresy: Recharts 2 (BarChart, LineChart, AreaChart, ComposedChart)
- Animacje: Framer Motion (layout transitions, fade-in przy mount)
- Drag & Drop: @hello-pangea/dnd (opcjonalnie dla Kanban)
- Toast: Sonner (bottom-right, richColors)
- Formularze: react-hook-form + Zod
- Tabele: @tanstack/react-table (opcjonalnie)
- Font: Inter (Google Fonts, variable)

---

## ARCHITEKTURA PROJEKTU

```
app/
  (auth)/login/page.tsx         – strona logowania
  (dashboard)/layout.tsx        – layout z Sidebar + TopNav + DataProvider
  (dashboard)/dashboard/page.tsx – Executive Summary
  (dashboard)/[modul]/page.tsx  – strony modułów (np. tooling, financial, risks)
  globals.css                   – CSS Variables + Tailwind base
components/
  layout/sidebar.tsx            – lewa nawigacja
  layout/topnav.tsx             – górny pasek (breadcrumb, search, user)
  layout/command-palette.tsx    – Ctrl+K search overlay
  forms/                        – formularze modalne (Dialog)
  crm/                          – CRM Kanban + karty dealów
  ui/                           – shadcn/ui primitives
context/data-context.tsx        – globalny stan + localStorage persistence
data/seed-data.ts               – statyczne dane demo
types/index.ts                  – wszystkie TypeScript interfaces
lib/utils.ts                    – cn(), formatCurrency(), formatPct()
prisma/schema.prisma            – opcjonalny backend (Supabase + Prisma)
```

---

## DESIGN SYSTEM – MOTYW I KOLORY

### Tryb domyślny: CIEMNY (dark)
Aplikacja uruchamia się w dark mode (ThemeProvider defaultTheme="dark", enableSystem=false). Obsługuje też light mode przez przełącznik w topnav.

### CSS Custom Properties (globals.css)

Dark mode (`:root`):
```css
--background:        222.2 84% 4.9%;   /* prawie czarny navy */
--foreground:        210 40% 98%;      /* biały */
--card:              222.2 84% 6.5%;   /* ciemny navy (karty) */
--popover:           222.2 84% 6.5%;
--primary:           238 84% 67%;      /* indigo */
--muted:             217.2 32.6% 14%;
--muted-foreground:  215 20.2% 55.1%; /* szary tekst pomocniczy */
--border:            217.2 32.6% 20%;
--accent:            217.2 32.6% 17.5%;
--radius:            0.75rem;
/* Sidebar – nieco ciemniejszy niż tło */
--sidebar-background: 222.2 84% 4.2%;
--sidebar-border:     217.2 32.6% 18%;
```

### Paleta semantyczna (Tailwind utilities):
| Zastosowanie       | Kolor Tailwind              | Hex         |
|--------------------|-----------------------------|-------------|
| Akcent główny      | indigo-400 / indigo-500     | #6366f1     |
| Sukces / pozytyw   | emerald-400 / emerald-500   | #10b981     |
| Ostrzeżenie        | amber-400 / amber-500       | #f59e0b     |
| Błąd / ryzyko      | rose-400 / rose-500         | #f43f5e     |
| Neutralny          | slate-400 / muted-foreground| #94a3b8     |
| Cash / cyan        | cyan-400                    | #06b6d4     |

### Gradient tła kart KPI:
```tsx
// indigo KPI card
"from-indigo-500/10 to-indigo-500/5 border-indigo-500/20"
// emerald
"from-emerald-500/10 to-emerald-500/5 border-emerald-500/20"
// amber
"from-amber-500/10 to-amber-500/5 border-amber-500/20"
// rose
"from-rose-500/10 to-rose-500/5 border-rose-500/20"
// cyan
"from-cyan-500/10 to-cyan-500/5 border-cyan-500/20"
```

---

## LAYOUT – SHELL APLIKACJI

### Struktura (dashboard layout):
```
┌─────────────────────────────────────────────────────┐
│  SIDEBAR (240px / 64px collapsed)   │  TOPNAV (h-16) │
│  ─────────────────────────          │  ─────────────  │
│  Logo                               │  Breadcrumb     │
│  ─────────────────────────          │  Search (⌘K)   │
│  Navigation groups:                 │  Bell | Theme   │
│    Operations → moduły główne       │  Avatar / Menu  │
│    Tools → Reports, Settings        ├─────────────────┤
│  ─────────────────────────          │                 │
│  User + Logout                      │   MAIN CONTENT  │
│                                     │   p-6, max-w    │
│  Collapse toggle (‹ / ›)           │   overflow-y    │
└─────────────────────────────────────┴─────────────────┘
```

### Sidebar:
- Szerokość: `240px` rozwinięta, `64px` zwinięta (animacja Framer Motion)
- Tło: `bg-[hsl(var(--sidebar-background))]`, border-r
- Logo: ikona Factory w rounded-lg `bg-indigo-500/20 border border-indigo-500/30`
- Nav items: `rounded-lg px-3 py-2`, active: `bg-indigo-500/15 text-indigo-300 font-medium`
- Active indicator: `w-0.5 h-5 bg-indigo-400` po lewej stronie
- Badge liczbowy: `rounded-full w-4 h-4` w kolorze `bg-rose-500` lub `bg-amber-500`
- User section: avatar `bg-indigo-500/20`, inicjały, rola, przycisk logout

### TopNav:
- `h-16`, `sticky top-0 z-40`, `bg-background/95 backdrop-blur`
- Breadcrumb: `Shapers › Moduł › Podstrona` (ChevronRight jako separator)
- Search bar: `min-w-[200px]`, otwiera CommandPalette (`⌘K`)
- Bell: badge z liczbą notyfikacji
- Theme toggle: Sun/Moon (next-themes)
- Avatar: inicjały w `bg-indigo-500/20`, dropdown z Settings + Sign out

---

## WZORZEC STRONY MODUŁU

Każda strona modułu ma strukturę:
```tsx
<div className="p-6 space-y-6 max-w-[1600px] mx-auto">
  {/* 1. Alert banner (jeśli krytyczne problemy) */}
  {/* 2. Header: tytuł + ikona + subtitle + akcja (przycisk) */}
  {/* 3. KPI strip: grid-cols-2 md:grid-cols-4 (lub 6) */}
  {/* 4. Tabs: A · Widok1 | B · Widok2 | ... */}
  {/*    Każdy TabsContent to osobny widok danych */}
  {/* 5. Tabele, wykresy, listy */}
</div>
```

### Tabs:
```tsx
<TabsList className="bg-card border border-border w-full justify-start mb-6 p-1 h-auto flex-wrap gap-1">
  <TabsTrigger value="x" className="text-xs px-3 py-1.5">A · Nazwa</TabsTrigger>
</TabsList>
```

---

## KOMPONENTY – WZORCE

### 1. KPI Card (kafelek metryki)
```tsx
// Wariant gradient z trendem MoM
<motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  className="rounded-xl border bg-gradient-to-br p-5 flex flex-col gap-2
             from-indigo-500/10 to-indigo-500/5 border-indigo-500/20"
>
  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
    LABEL
  </p>
  <span className="text-2xl font-bold tabular-nums">€428,000</span>
  <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-400">
    <TrendingUp className="w-3 h-3" /> +3.1% MoM
  </span>
</motion.div>
```

### 2. Tabela danych
```tsx
<div className="rounded-xl border border-border bg-card overflow-hidden">
  <div className="px-5 py-4 border-b border-border flex items-center justify-between">
    <p className="text-sm font-semibold">Tytuł tabeli</p>
    <Button variant="outline" size="sm">Akcja</Button>
  </div>
  <div className="overflow-x-auto">
    <table className="w-full text-xs">
      <thead>
        <tr className="border-b border-border bg-muted/20">
          {headers.map(h => (
            <th className="text-left py-2.5 px-3 text-muted-foreground font-medium whitespace-nowrap">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr className="border-b border-border/50 hover:bg-accent/20 transition-colors">
            ...
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
```

### 3. Wykres (Recharts) – tooltip
```tsx
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg shadow-xl p-3 text-xs min-w-[160px]">
      <p className="font-semibold mb-2 text-foreground">{label}</p>
      {payload.map(p => (
        <div className="flex items-center justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-medium">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

// Użycie:
<ResponsiveContainer width="100%" height={220}>
  <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
      tickLine={false} axisLine={false} />
    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
      tickLine={false} axisLine={false} tickFormatter={v => `€${(v/1000).toFixed(0)}k`} />
    <RTooltip content={<CustomTooltip />} />
    <Legend wrapperStyle={{ fontSize: 11 }} />
    <Bar dataKey="Revenue" fill="#6366f1" radius={[3, 3, 0, 0]} opacity={0.9} />
    <Line dataKey="GM%" stroke="#f59e0b" strokeWidth={2} dot={false} />
  </ComposedChart>
</ResponsiveContainer>
```

### 4. Status badge (inline)
```tsx
// Pattern: bg-{kolor}-500/10 text-{kolor}-400, rounded-full lub rounded
<span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
  ACTIVE
</span>
// Kolory semantyczne:
// ACTIVE / CONFIRMED / WON     → emerald
// PENDING / WARNING / MEDIUM   → amber
// OVERDUE / CRITICAL / LOST    → rose
// INFO / ISSUED                → blue/indigo
// NEUTRAL / INACTIVE           → slate/muted
```

### 5. Alert banner (krytyczne powiadomienie na górze strony)
```tsx
<motion.div
  initial={{ opacity: 0, y: -8 }}
  animate={{ opacity: 1, y: 0 }}
  className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3"
>
  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
  <p className="text-sm text-rose-300 flex-1">
    <span className="font-semibold">Opis problemu</span> — szczegóły
  </p>
  <a href="/risks" className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1">
    Szczegóły <ArrowRight className="w-3 h-3" />
  </a>
  <button onClick={() => setDismissed(true)}>
    <X className="w-4 h-4" />
  </button>
</motion.div>
```

### 6. Formularz modalny (Dialog)
```tsx
<Dialog open={open} onOpenChange={onClose}>
  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Tytuł formularza</DialogTitle>
    </DialogHeader>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Pole</Label>
          <Input {...register("field")} placeholder="..." className="h-9" />
          {errors.field && <p className="text-xs text-rose-400">{errors.field.message}</p>}
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Anuluj</Button>
        <Button type="submit">Zapisz</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
```

### 7. Progress bar (completion / utilization)
```tsx
<div className="flex items-center gap-2">
  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
    <div
      className="h-full rounded-full bg-indigo-500 transition-all"
      style={{ width: `${value}%` }}
    />
  </div>
  <span className="text-xs tabular-nums text-muted-foreground w-10 text-right">{value}%</span>
</div>
```

### 8. Risk indicator card (z listą flag)
```tsx
<div className="rounded-xl border p-4 flex items-start gap-4 border-rose-500/20 bg-card">
  <div className="w-3 h-3 rounded-full bg-rose-400 animate-pulse mt-0.5 shrink-0" />
  <div className="flex-1">
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-semibold">ID projektu</span>
      <span className="text-sm">Opis</span>
      <span className="text-xs text-muted-foreground">· Klient</span>
    </div>
    <div className="flex gap-2 mt-2 flex-wrap">
      {flags.map(f => (
        <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded px-2 py-0.5">
          ⚠ {f}
        </span>
      ))}
    </div>
  </div>
  <div className="text-right shrink-0 text-xs text-muted-foreground">
    <p className="font-semibold">{completionPct}% done</p>
    <p>ETA {eta}</p>
  </div>
</div>
```

---

## LOGIKA DANYCH

### Wzorzec: localStorage + seed data

Aplikacja działa w trybie demo bez backendu. Cały stan pochodzi z:
1. `data/seed-data.ts` – statyczne dane startowe (eksportowane stałe)
2. `context/data-context.tsx` – React Context z useState + localStorage
3. Wzorzec override: zmiany do seed items są przechowywane jako `Record<id, override>`, usunięcia jako `Set<deletedId>`, nowe rekordy jako osobna tablica

```typescript
// Pattern kontekstu:
const [localItems, setLocalItems] = useState<T[]>([]);
const [overrides, setOverrides] = useState<Record<string, T>>({});
const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

// Merged view (seed + overrides - deleted + local):
const items: T[] = [
  ...SEED_ITEMS
    .filter(p => !deletedIds.has(p.id))
    .map(p => overrides[p.id] ?? p),
  ...localItems,
];
```

### Wzorzec: typy danych

Dla każdego modułu zdefiniuj w `types/index.ts`:
```typescript
export type StatusEnum = "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface MainEntity {
  id: string;
  // identyfikatory biznesowe
  entityNo: string;         // np. "T-2025-001"
  customer: string;
  description: string;
  // finansowe
  quotedRevenue: number;
  estimatedFinalCost: number;
  // operacyjne
  completionPct: number;    // 0-100
  startDate: string;        // "YYYY-MM-DD"
  eta: string;
  // klasyfikacja
  riskLevel: RiskLevel;
  status: StatusEnum;
}

export interface FinancialPeriod {
  month: string;            // "2026-04"
  label: string;            // "Apr '26"
  revenue: number;
  grossProfit: number;
  gmPct: number;
  ebitda: number;
  ebitdaPct: number;
  netProfit: number;
  netProfitPct: number;
  cashBalance: number;
  arOverdue: number;
  apOverdue: number;
  wip: number;
  rfqWon: number;
  rfqLost: number;
  rfqSent: number;
}
```

### Wzorzec: dane finansowe (24 miesiące)

```typescript
// Helper do generowania okresów finansowych:
function fp(
  month: string, label: string,
  rev: number, gmPct: number, ebitdaPct: number,
  cash: number, arOvd: number, apOvd: number, wip: number,
  rfqW: number, rfqL: number, rfqS: number,
): FinancialPeriod {
  const gp = Math.round(rev * gmPct / 100);
  const ebitda = Math.round(rev * ebitdaPct / 100);
  const netProfit = Math.round(ebitda * 0.75);
  return {
    month, label,
    revenue: rev, grossProfit: gp, gmPct,
    ebitda, ebitdaPct,
    netProfit, netProfitPct: Math.round(netProfit / rev * 1000) / 10,
    cashBalance: cash, arOverdue: arOvd, apOverdue: apOvd, wip,
    rfqWon: rfqW, rfqLost: rfqL, rfqSent: rfqS,
  };
}

export const FINANCIAL_PERIODS: FinancialPeriod[] = [
  fp("2024-05","May '24", 358000, 38.2, 16.4, 1200000, 82000, 45000, 1850000, 3,2,7),
  // ... 24 miesiące
];
```

---

## STRONY MODUŁÓW – WYMAGANE WIDOKI (Tabs)

Każdy główny moduł biznesowy powinien mieć min. 4-6 zakładek:

| Tab | Zawartość |
|-----|-----------|
| A · Sales / Pipeline | KPI strip, wykres revenue+margin, tabela otwartych ofert |
| B · [Główna encja] | Tabela z rozwijalnymi wierszami (cost breakdown, milestones) |
| C · Gwarancja / Roszczenia | Rejestr claims z kosztami i statusem |
| D · Capacity / Zasoby | Maszyny/zasoby z utilization% + wykres |
| E · Cash Flow | WIP, faktury, prognoza 30/60/90 dni |
| F · Risk Matrix | Karty ryzyka posortowane severity |

---

## STRONA EXECUTIVE SUMMARY (dashboard)

Obowiązkowa struktura:
1. **Alert banner** (krytyczne ryzyka, jeśli istnieją)
2. **Header** z datą i statusem "Live"
3. **6 KPI cards** (Revenue MTD, Revenue YTD, Gross Margin, EBITDA%, Cash, AR Overdue)
4. **Business KPIs** (grid 4 kolumny: Revenue, Margin, EBITDA, Active Projects)
5. **ComposedChart** Revenue + EBITDA% (24m) + AreaChart Cash (12m)
6. **BarChart** Win/Loss + **LineChart** Margin Trend (12m)
7. **3 widgety**: Critical Projects, CEO Alerts, Overdue AR

---

## STRONA FINANCIAL OVERVIEW

Obowiązkowa struktura:
1. **PLCards** YTD: [Biznes] + [Full Year Outlook]
2. **ComposedChart** Revenue + GM% + EBITDA% (12m)
3. **BarChart** EBITDA Bridge (waterfall: Revenue → koszty → EBITDA)
4. **Cash Forecast** grid 30/60/90 dni (Inflows/Outflows/Net)
5. **AreaChart** Cash Balance + AR Overdue (12m)
6. **Tabela Cash Flow Register** (z opcją dodawania i usuwania)
7. **Tabela Monthly P&L** YTD z podsumowaniem

---

## STRONA REPORTS

Tabs z eksportem CSV:
- **Profitability** – LineChart GM%/EBITDA%/Net% + tabela miesięczna
- **Revenue** – BarChart przychodów
- **Quote Performance** – ComposedChart Won/Lost + win rate% + tabela
- **Project Status** – 4 metryki + pełna tabela projektów
- **Customer P&L** – rentowność per klient (revenue, EFC, margin%)

Selektor okresu: YTD / Last 12M / Last 24M (przyciski, nie dropdown)

---

## STRONA RISKS / ACTIONS

Każdy risk item zawiera:
```typescript
interface RiskAction {
  id: string;
  title: string;
  description: string;        // długi opis
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category: "FINANCIAL" | "OPERATIONAL" | "COMMERCIAL" | "QUALITY" | "DELIVERY";
  impactEur: number;          // wartość finansowa ryzyka (ujemna = strata)
  owner: string;              // odpowiedzialny
  dueDate: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "MONITORING";
  linkedProject?: string;
  linkedCustomer?: string;
  actions: string[];          // lista konkretnych działań
}
```

Widok: filtry severity + status, karty z rozwinięciem listy działań, możliwość dodania/edycji/usunięcia.

---

## MIDDLEWARE I AUTH (demo mode)

```typescript
// middleware.ts
export function middleware(req: NextRequest) {
  const session = req.cookies.get("demo_session");
  const isPublic = ["/login", "/register"].some(p => req.nextUrl.pathname.startsWith(p));
  if (!isPublic && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}
```

Login ustawia cookie: `demo_session=1; path=/; max-age=86400`

---

## HELPERS FORMATOWANIA (lib/utils.ts)

```typescript
export function formatCurrency(value: number, currency = "EUR"): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency", currency,
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(value);
}

export function formatPct(value: number): string {
  return `${value.toFixed(1)}%`;
}
```

---

## WZORZEC KOLOROWANIA WARTOŚCI LICZBOWYCH

```tsx
// Margin% – zielony dobry, czerwony zły
<td className={cn("font-bold tabular-nums",
  margin >= 20 ? "text-emerald-400" :
  margin >= 10 ? "text-amber-400" : "text-rose-400")}>
  {margin.toFixed(1)}%
</td>

// Kwota przekroczona (EFC > quoted)
<td className={cn("font-semibold",
  efc > quoted ? "text-rose-400" : "text-emerald-400")}>
  {formatCurrency(efc)}
</td>
```

---

## CUSTOMOWY SCROLLBAR

```css
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 9999px; }
::-webkit-scrollbar-thumb:hover { background: hsl(var(--muted-foreground) / 0.3); }
```

---

## KOMENDY STARTOWE

```bash
npx create-next-app@latest my-app --typescript --tailwind --app
cd my-app
npx shadcn@latest init
npx shadcn@latest add button input label dialog tabs badge progress
  avatar dropdown-menu tooltip card textarea command
npm install recharts framer-motion sonner react-hook-form zod
  @hookform/resolvers next-themes @hello-pangea/dnd
```

---

## INSTRUKCJA ADAPTACJI DO NOWEJ DOMENY

1. **Zdefiniuj główną encję** (np. Zlecenie serwisowe, Projekt IT, Kontrakt) – zastąp `ToolingProject`
2. **Zdefiniuj `FinancialPeriod`** z odpowiednimi KPI dla domeny
3. **Stwórz seed data** – 10-20 rekordów encji + 24 miesiące danych finansowych
4. **Dostosuj tabs** w module głównym do cyklu życia encji
5. **Zachowaj palety kolorów** semantycznych (emerald=dobry, rose=zły, amber=uwaga)
6. **Nie zmieniaj** struktury layoutu, wzorca kontekstu, ani komponentów UI

---

*Template oparty na aplikacji "Shapers Command Center" – produkcja narzędzi formierskich.*
*Stack: Next.js 15, TypeScript, shadcn/ui, Tailwind CSS, Recharts, Framer Motion, Sonner.*
```
