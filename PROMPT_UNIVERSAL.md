# Universal B2B Executive Dashboard – Design System Prompt

## Jak używać tego prompta

1. Wypełnij sekcję **KROK 0** — zastąp wszystkie `[PLACEHOLDER]` wartościami dla swojej domeny
2. Skopiuj cały plik (po wypełnieniu) jako wiadomość do AI
3. AI zbuduje aplikację w dokładnie tym samym stylu wizualnym i architekturze

> Prompt opisuje **jak wygląda i jak działa** aplikacja — nie **co** robi biznesowo.
> Część biznesowa pochodzi wyłącznie z Twojego KROKU 0.

---

## KROK 0 — WYPEŁNIJ PRZED UŻYCIEM

Zastąp każdy placeholder poniżej i wklej uzupełnioną sekcję na początku prompta do AI.

```
DOMENA:           [DOMAIN]              # np. "RFQ / Wyceny", "Serwis maszyn", "Projekty IT"
NAZWA APLIKACJI:  [APP_NAME]            # np. "Quote Center", "Service Hub", "Project Board"
FIRMA:            [COMPANY_NAME]        # np. "Acme Sp. z o.o."
UŻYTKOWNIK:       [USER_NAME]           # np. "Jan Kowalski", "Managing Director"

GŁÓWNA ENCJA:     [ENTITY]             # np. "Rfq", "ServiceOrder", "Project"
LICZBA MNOGA:     [ENTITIES]           # np. "RFQs", "Zlecenia", "Projekty"
NR ENCJI:         [ENTITY_NO_FORMAT]   # np. "RFQ-2026-001", "SO-001", "PRJ-001"

STATUSY ENCJI:    [STATUS_LIST]        # np. "NEW | COSTING | SENT | WON | LOST"
POZIOMY RYZYKA:   [RISK_LEVELS]        # np. "LOW | MEDIUM | HIGH | CRITICAL" (lub puste)

NAWIGACJA (max 6 pozycji):
  [NAV_1_HREF] | [NAV_1_LABEL] | [NAV_1_ICON]   # np. "/dashboard" | "Summary" | LayoutDashboard
  [NAV_2_HREF] | [NAV_2_LABEL] | [NAV_2_ICON]   # np. "/rfq"       | "Wyceny"  | FileText
  [NAV_3_HREF] | [NAV_3_LABEL] | [NAV_3_ICON]   # ...
  [NAV_4_HREF] | [NAV_4_LABEL] | [NAV_4_ICON]
  [NAV_5_HREF] | [NAV_5_LABEL] | [NAV_5_ICON]   # Reports | FileBarChart (zawsze)
  [NAV_6_HREF] | [NAV_6_LABEL] | [NAV_6_ICON]   # Settings | Settings  (zawsze)

ZAKŁADKI MODUŁU (max 6):
  [TAB_1]: [TAB_1_DESC]    # np. "Pipeline": "KPI + wykres + tabela otwartych"
  [TAB_2]: [TAB_2_DESC]    # np. "Wyceny":   "Tabela z rozwinięciem kosztów"
  [TAB_3]: [TAB_3_DESC]
  [TAB_4]: [TAB_4_DESC]
  [TAB_5]: [TAB_5_DESC]
  [TAB_6]: [TAB_6_DESC]

KPI NA DASHBOARDZIE (6 sztuk):
  [KPI_1]: [KPI_1_UNIT]   # np. "Revenue MTD": "€"
  [KPI_2]: [KPI_1_UNIT]   # np. "Pipeline Value": "€"
  [KPI_3]: [KPI_3_UNIT]   # np. "Win Rate": "%"
  [KPI_4]: [KPI_4_UNIT]   # np. "Gross Margin": "%"
  [KPI_5]: [KPI_5_UNIT]   # np. "Cash Balance": "€"
  [KPI_6]: [KPI_6_UNIT]   # np. "Overdue AR": "€"

POLA GŁÓWNEJ ENCJI (lista):
  [FIELD_1]: [TYPE_1]     # np. "customer": "string"
  [FIELD_2]: [TYPE_2]     # np. "value": "number"
  [FIELD_3]: [TYPE_3]
  # ... dodaj tyle ile potrzeba
```

---

## PROMPT WŁAŚCIWY (kopiuj poniżej po wypełnieniu KROKU 0)

---

Zbuduj aplikację webową — executive management dashboard — w stylu opisanym poniżej.
Domena i logika biznesowa zostały zdefiniowane w KROKU 0 powyżej.
Wszystkie decyzje wizualne, architektoniczne i wzorce kodu bierz z tej specyfikacji.

---

## 1. STACK TECHNOLOGICZNY

- **Framework**: Next.js 15 (App Router)
- **Język**: TypeScript (strict)
- **UI**: shadcn/ui (Radix UI) + Tailwind CSS 3
- **Wykresy**: Recharts 2
- **Animacje**: Framer Motion
- **Toast**: Sonner
- **Formularze**: react-hook-form + Zod
- **Font**: Inter (Google Fonts, variable)
- **Motyw**: next-themes (dark/light toggle)

```bash
# Instalacja
npx create-next-app@latest [APP_NAME] --typescript --tailwind --app
cd [APP_NAME]
npx shadcn@latest init
npx shadcn@latest add button input label dialog tabs badge progress \
  avatar dropdown-menu tooltip card textarea command select
npm install recharts framer-motion sonner react-hook-form zod \
  @hookform/resolvers next-themes
```

---

## 2. ARCHITEKTURA KATALOGÓW

```
app/
  (auth)/login/page.tsx
  (dashboard)/layout.tsx          ← Sidebar + TopNav + DataProvider
  (dashboard)/dashboard/page.tsx  ← Executive Summary
  (dashboard)/[modul]/page.tsx    ← strony z NAWIGACJI
  globals.css
components/
  layout/sidebar.tsx
  layout/topnav.tsx
  layout/command-palette.tsx
  forms/                          ← formularze modalne
  ui/                             ← shadcn/ui primitives
context/data-context.tsx          ← globalny stan + localStorage
data/seed-data.ts                 ← dane demo
types/index.ts                    ← TypeScript interfaces
lib/utils.ts                      ← cn(), formatCurrency(), formatPct()
middleware.ts                     ← ochrona tras (cookie auth)
```

---

## 3. DESIGN SYSTEM

### Tryb: CIEMNY domyślny
`ThemeProvider defaultTheme="dark" enableSystem={false}`

### CSS Custom Properties — `globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background:        222.2 84% 4.9%;
    --foreground:        210 40% 98%;
    --card:              222.2 84% 6.5%;
    --card-foreground:   210 40% 98%;
    --popover:           222.2 84% 6.5%;
    --popover-foreground:210 40% 98%;
    --primary:           238 84% 67%;
    --primary-foreground:222.2 47.4% 11.2%;
    --secondary:         217.2 32.6% 17.5%;
    --secondary-foreground:210 40% 98%;
    --muted:             217.2 32.6% 14%;
    --muted-foreground:  215 20.2% 55.1%;
    --accent:            217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive:       0 62.8% 50.6%;
    --destructive-foreground:210 40% 98%;
    --border:            217.2 32.6% 20%;
    --input:             217.2 32.6% 20%;
    --ring:              238 84% 67%;
    --radius:            0.75rem;
    --sidebar-background:222.2 84% 4.2%;
    --sidebar-foreground:210 40% 98%;
    --sidebar-accent:    217.2 32.6% 14%;
    --sidebar-border:    217.2 32.6% 18%;
  }

  .light {
    --background:        0 0% 100%;
    --foreground:        222.2 84% 4.9%;
    --card:              0 0% 100%;
    --card-foreground:   222.2 84% 4.9%;
    --popover:           0 0% 100%;
    --popover-foreground:222.2 84% 4.9%;
    --primary:           238 84% 60%;
    --primary-foreground:210 40% 98%;
    --secondary:         210 40% 96.1%;
    --secondary-foreground:222.2 47.4% 11.2%;
    --muted:             210 40% 96.1%;
    --muted-foreground:  215.4 16.3% 46.9%;
    --accent:            210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive:       0 84.2% 60.2%;
    --destructive-foreground:210 40% 98%;
    --border:            214.3 31.8% 91.4%;
    --input:             214.3 31.8% 91.4%;
    --ring:              238 84% 60%;
    --sidebar-background:240 5.9% 97%;
    --sidebar-foreground:240 5.3% 26.1%;
    --sidebar-accent:    240 4.8% 95.9%;
    --sidebar-border:    220 13% 91%;
  }
}

@layer base {
  * { @apply border-border; }
  body { @apply bg-background text-foreground font-sans antialiased; }
}

@layer utilities {
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { @apply bg-transparent; }
  ::-webkit-scrollbar-thumb { @apply bg-border rounded-full; }
  ::-webkit-scrollbar-thumb:hover { @apply bg-muted-foreground/30; }
}
```

### Paleta semantyczna (stosuj konsekwentnie)

| Znaczenie               | Kolor Tailwind                    |
|-------------------------|-----------------------------------|
| Akcent / aktywny        | `indigo-400` / `indigo-500`       |
| Sukces / pozytywny      | `emerald-400` / `emerald-500`     |
| Ostrzeżenie / uwaga     | `amber-400` / `amber-500`         |
| Błąd / ryzyko / strata  | `rose-400` / `rose-500`           |
| Neutralny / pomocniczy  | `slate-400` / `muted-foreground`  |
| Finanse / przepływ      | `cyan-400`                        |
| Fioletowy / secondarny  | `violet-400`                      |

### Gradient tła kart KPI

```
indigo:  "from-indigo-500/10 to-indigo-500/5 border-indigo-500/20"
emerald: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20"
amber:   "from-amber-500/10 to-amber-500/5 border-amber-500/20"
rose:    "from-rose-500/10 to-rose-500/5 border-rose-500/20"
cyan:    "from-cyan-500/10 to-cyan-500/5 border-cyan-500/20"
```

---

## 4. LAYOUT SHELL

### Dashboard layout (`app/(dashboard)/layout.tsx`)

```tsx
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/topnav";
import { DataProvider } from "@/context/data-context";

export default function DashboardLayout({ children }) {
  return (
    <DataProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopNav />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </DataProvider>
  );
}
```

### Sidebar (`components/layout/sidebar.tsx`)

Specyfikacja wizualna — zastosuj dla nawigacji z KROKU 0:

```tsx
// Wymiary
animate={{ width: collapsed ? 64 : 240 }}  // Framer Motion
transition={{ duration: 0.22, ease: "easeInOut" }}

// Tło
className="bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))]"

// Logo — ikona w rounded-lg
<div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30
                flex items-center justify-center">
  <[DOMAIN_ICON] className="w-4 h-4 text-indigo-400" />
</div>
// Nazwa aplikacji pod ikoną (tylko gdy rozwinięty)
<p className="font-bold text-sm tracking-tight">[APP_NAME]</p>

// Nav item — nieaktywny
"flex items-center gap-3 rounded-lg px-3 py-2 text-sm
 text-[hsl(var(--sidebar-foreground))]/70
 hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]"

// Nav item — aktywny
"bg-indigo-500/15 text-indigo-300 font-medium"
// + wskaźnik po lewej:
<div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r bg-indigo-400" />

// Badge liczbowy na nav item
<span className="ml-auto text-white text-[10px] font-bold rounded-full w-4 h-4
                 flex items-center justify-center bg-rose-500">
  {count}
</span>

// Grupy nawigacji:
// "Operations" → główne moduły z KROKU 0 (NAV_1..4)
// "Tools"      → Reports + Settings (NAV_5..6), oddzielone border-t

// Sekcja użytkownika (dół sidebara)
// Avatar: inicjały w bg-indigo-500/20, imię + rola, przycisk logout
```

### TopNav (`components/layout/topnav.tsx`)

```tsx
// Pasek
"sticky top-0 z-40 flex h-16 items-center gap-4
 border-b border-border bg-background/95 backdrop-blur px-4 lg:px-6"

// Breadcrumb (lewa strona): [APP_NAME] › Moduł › Podstrona
// separator: <ChevronRight size={13} className="text-muted-foreground/50" />
// ostatni segment: font-medium text-foreground

// Search bar (środek)
"hidden md:flex items-center gap-2 h-9 px-3 rounded-md border border-border
 bg-muted/30 text-sm text-muted-foreground hover:bg-accent min-w-[200px]"
// otwiera CommandPalette (⌘K / Ctrl+K)

// Prawa strona: Bell (z badge) | Sun/Moon toggle | Avatar + DropdownMenu
// Avatar fallback: bg-indigo-500/20 text-indigo-300, inicjały użytkownika
```

---

## 5. WZORZEC STRONY MODUŁU

Każda strona modułu ma tę strukturę:

```tsx
export default function [Module]Page() {
  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">

      {/* 1. Alert banner — tylko gdy są krytyczne problemy */}
      {hasCritical && (
        <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
          className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/30
                     rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <p className="text-sm text-rose-300 flex-1">
            <span className="font-semibold">Opis problemu</span> — szczegóły
          </p>
          <a href="/risks" className="text-xs text-rose-400 flex items-center gap-1">
            Szczegóły <ArrowRight className="w-3 h-3" />
          </a>
          <button onClick={() => setDismissed(true)}><X className="w-4 h-4 text-rose-400/60" /></button>
        </motion.div>
      )}

      {/* 2. Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <[Icon] className="w-6 h-6 text-indigo-400" /> [Tytuł modułu]
          </h1>
          <p className="text-sm text-muted-foreground">[Podtytuł · data]</p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> [Akcja główna]
        </Button>
      </div>

      {/* 3. Tabs */}
      <Tabs defaultValue="[TAB_1]" className="w-full">
        <TabsList className="bg-card border border-border w-full justify-start
                             mb-6 p-1 h-auto flex-wrap gap-1">
          {/* Zakładki z KROKU 0 — format "A · Nazwa" */}
          <TabsTrigger value="[TAB_1]" className="text-xs px-3 py-1.5">A · [TAB_1]</TabsTrigger>
          <TabsTrigger value="[TAB_2]" className="text-xs px-3 py-1.5">B · [TAB_2]</TabsTrigger>
        </TabsList>

        <TabsContent value="[TAB_1]" className="space-y-6">
          {/* KPI strip + wykresy + tabela */}
        </TabsContent>
      </Tabs>

    </div>
  );
}
```

---

## 6. WZORCE KOMPONENTÓW

### 6.1 KPI Card — kafelek metryki z trendem
*Używaj w stripie po nagłówku strony (grid 4–6 kolumn)*

```tsx
<motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  className={cn(
    "rounded-xl border bg-gradient-to-br p-5 flex flex-col gap-2",
    // kolor: indigo | emerald | amber | rose | cyan
    "from-indigo-500/10 to-indigo-500/5 border-indigo-500/20"
  )}
>
  <div className="flex items-center justify-between">
    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
      LABEL
    </p>
    {Icon && <Icon className="w-4 h-4 text-muted-foreground/60" />}
  </div>
  <div className="flex items-end gap-2">
    <span className="text-2xl font-bold tabular-nums">€ 000</span>
    {unit && <span className="text-sm text-muted-foreground mb-0.5">{unit}</span>}
  </div>
  <div className="flex items-center gap-2">
    {trend !== undefined && (
      <span className={cn("flex items-center gap-0.5 text-xs font-medium",
        trend >= 0 ? "text-emerald-400" : "text-rose-400")}>
        {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {trend >= 0 ? "+" : ""}{trend.toFixed(1)}% MoM
      </span>
    )}
    {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
  </div>
</motion.div>
```

### 6.2 Tabela danych z nagłówkiem
*Używaj dla list encji, rejestrów, historii*

```tsx
<div className="rounded-xl border border-border bg-card overflow-hidden">
  {/* Nagłówek */}
  <div className="px-5 py-4 border-b border-border flex items-center justify-between">
    <p className="text-sm font-semibold">Tytuł tabeli</p>
    <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
      <Download className="w-3 h-3" /> Eksport
    </Button>
  </div>
  {/* Tabela */}
  <div className="overflow-x-auto">
    <table className="w-full text-xs">
      <thead>
        <tr className="border-b border-border bg-muted/20">
          {["Kolumna 1", "Kolumna 2", "Wartość", "Status"].map(h => (
            <th key={h} className="text-left py-2.5 px-3 text-muted-foreground
                                   font-medium whitespace-nowrap">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <tr key={item.id}
              className="border-b border-border/50 hover:bg-accent/20 transition-colors">
            <td className="py-2.5 px-3 font-medium">{item.label}</td>
            <td className="py-2.5 px-3 text-muted-foreground">{item.sub}</td>
            <td className="py-2.5 px-3 tabular-nums font-semibold text-indigo-400">
              {formatCurrency(item.value)}
            </td>
            <td className="py-2.5 px-3">
              <StatusBadge status={item.status} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
```

### 6.3 Wykres Recharts — wzorzec z tooltipem
*Używaj dla trendów finansowych i operacyjnych*

```tsx
// Tooltip — zawsze customowy
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg shadow-xl p-3
                    text-xs min-w-[160px]">
      <p className="font-semibold mb-2 text-foreground">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span style={{ color: p.color }} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-medium text-foreground">
            {p.value > 1000 ? formatCurrency(p.value) : `${p.value}%`}
          </span>
        </div>
      ))}
    </div>
  );
};

// Wykres złożony — Revenue (Bar) + Metric% (Line)
<ResponsiveContainer width="100%" height={220}>
  <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
    <XAxis dataKey="name"
      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
      tickLine={false} axisLine={false} interval={2} />
    <YAxis yAxisId="l"
      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
      tickLine={false} axisLine={false}
      tickFormatter={v => `€${(v/1000).toFixed(0)}k`} />
    <YAxis yAxisId="r" orientation="right"
      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
      tickLine={false} axisLine={false}
      tickFormatter={v => `${v}%`} domain={[0, 50]} />
    <RTooltip content={<ChartTooltip />} />
    <Legend wrapperStyle={{ fontSize: 11 }} />
    <Bar yAxisId="l" dataKey="Revenue" fill="#6366f1" radius={[3,3,0,0]} opacity={0.9} />
    <Line yAxisId="r" type="monotone" dataKey="Metric%"
      stroke="#f59e0b" strokeWidth={2} dot={false} />
  </ComposedChart>
</ResponsiveContainer>
```

### 6.4 Status Badge
*Używaj dla statusów encji, priorytetu, kategorii*

```tsx
// Wzorzec: bg-{kolor}-500/10 text-{kolor}-400
// Mapowanie semantyczne:
const STATUS_COLOR: Record<string, string> = {
  // pozytywne / zakończone
  ACTIVE:    "bg-indigo-500/10 text-indigo-400",
  WON:       "bg-emerald-500/10 text-emerald-400",
  COMPLETED: "bg-emerald-500/10 text-emerald-400",
  CONFIRMED: "bg-emerald-500/10 text-emerald-400",
  // neutralne / w toku
  PENDING:   "bg-amber-500/10 text-amber-400",
  IN_PROGRESS:"bg-amber-500/10 text-amber-400",
  SENT:      "bg-indigo-500/10 text-indigo-400",
  NEW:       "bg-slate-500/10 text-slate-400",
  // negatywne
  OVERDUE:   "bg-rose-500/10 text-rose-400",
  LOST:      "bg-rose-500/10 text-rose-400",
  CANCELLED: "bg-slate-500/10 text-slate-400",
};

<span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium",
  STATUS_COLOR[status] ?? "bg-slate-500/10 text-slate-400")}>
  {status}
</span>
```

### 6.5 Alert Banner — krytyczne powiadomienie
*Używaj na górze strony gdy istnieją nierozwiązane problemy wysokiej wagi*

```tsx
<motion.div
  initial={{ opacity: 0, y: -8 }}
  animate={{ opacity: 1, y: 0 }}
  className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/30
             rounded-xl px-4 py-3"
>
  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
  <p className="text-sm text-rose-300 flex-1">
    <span className="font-semibold">{count} krytyczne problemy</span>
    {" "}— {shortDescription}
  </p>
  <a href="/risks"
     className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 shrink-0">
    Szczegóły <ArrowRight className="w-3 h-3" />
  </a>
  <button onClick={() => setDismissed(true)}>
    <X className="w-4 h-4 text-rose-400/60 hover:text-rose-400" />
  </button>
</motion.div>
```

### 6.6 Formularz modalny (Dialog)
*Używaj do tworzenia i edycji encji*

```tsx
<Dialog open={open} onOpenChange={onClose}>
  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>{isEdit ? "Edytuj" : "Dodaj"} [ENTITY]</DialogTitle>
    </DialogHeader>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Pole</Label>
          <Input {...register("field")} placeholder="..." className="h-9" />
          {errors.field && (
            <p className="text-xs text-rose-400">{errors.field.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Select</Label>
          <Select onValueChange={v => setValue("selectField", v)}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {options.map(o => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter className="pt-2">
        <Button variant="outline" type="button" onClick={onClose}>Anuluj</Button>
        <Button type="submit">{isEdit ? "Zapisz" : "Dodaj"}</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
```

### 6.7 Progress bar z etykietą
*Używaj dla ukończenia, utilizacji zasobów, wypełnienia budżetu*

```tsx
<div className="flex items-center gap-2">
  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
    <div
      className={cn("h-full rounded-full transition-all",
        value >= 85 ? "bg-emerald-500" :
        value >= 60 ? "bg-indigo-500" :
        value >= 40 ? "bg-amber-500" : "bg-rose-500")}
      style={{ width: `${value}%` }}
    />
  </div>
  <span className="text-xs tabular-nums text-muted-foreground w-10 text-right">
    {value}%
  </span>
</div>
```

### 6.8 Kolorowanie wartości numerycznych
*Stosuj konsekwentnie we wszystkich tabelach i kartach*

```tsx
// Procent marginu / efektywności (im wyższy, tym lepszy)
<span className={cn("font-bold tabular-nums",
  value >= 20 ? "text-emerald-400" :
  value >= 10 ? "text-amber-400" : "text-rose-400")}>
  {value.toFixed(1)}%
</span>

// Kwota: przekroczenie budżetu / straty
<span className={cn("font-semibold tabular-nums",
  actual > budget ? "text-rose-400" : "text-emerald-400")}>
  {formatCurrency(actual)}
</span>

// Trend MoM
<span className={cn("text-xs flex items-center gap-0.5",
  delta >= 0 ? "text-emerald-400" : "text-rose-400")}>
  {delta >= 0 ? <TrendingUp className="w-3 h-3"/> : <TrendingDown className="w-3 h-3"/>}
  {delta >= 0 ? "+" : ""}{delta.toFixed(1)}% MoM
</span>
```

---

## 7. LOGIKA DANYCH

### localStorage + seed data pattern

```tsx
// context/data-context.tsx
"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { [Entity], RiskAction, CashFlowItem } from "@/types";
import { [ENTITIES] as SEED, RISK_ACTIONS as SEED_RISKS, CASH_FLOW_ITEMS as SEED_CASH }
  from "@/data/seed-data";

const KEYS = {
  items:    "app_items",
  risks:    "app_risks",
  cashflow: "app_cashflow",
  overrideItems: "app_override_items",
  overrideRisks: "app_override_risks",
  deleted:  "app_deleted",
};

function load<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(key) ?? "[]"); }
  catch { return []; }
}
function loadMap<T>(key: string): Record<string, T> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(key) ?? "{}"); }
  catch { return {}; }
}
function save(key: string, value: unknown) {
  if (typeof window !== "undefined")
    localStorage.setItem(key, JSON.stringify(value));
}

interface DataContextType {
  items: [Entity][];
  riskActions: RiskAction[];
  cashFlowItems: CashFlowItem[];
  addItem: (p: Omit<[Entity], "id">) => void;
  updateItem: (id: string, p: Partial<[Entity]>) => void;
  deleteItem: (id: string) => void;
  addRiskAction: (r: Omit<RiskAction, "id">) => void;
  updateRiskAction: (id: string, r: Partial<RiskAction>) => void;
  deleteRiskAction: (id: string) => void;
  addCashFlowItem: (c: Omit<CashFlowItem, "id">) => void;
  deleteCashFlowItem: (id: string) => void;
  resetToSeedData: () => void;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [localItems,    setLocalItems]    = useState<[Entity][]>([]);
  const [localRisks,    setLocalRisks]    = useState<RiskAction[]>([]);
  const [localCash,     setLocalCash]     = useState<CashFlowItem[]>([]);
  const [overrideItems, setOverrideItems] = useState<Record<string, [Entity]>>({});
  const [overrideRisks, setOverrideRisks] = useState<Record<string, RiskAction>>({});
  const [deletedIds,    setDeletedIds]    = useState<Set<string>>(new Set());

  useEffect(() => {
    setLocalItems(load<[Entity]>(KEYS.items));
    setLocalRisks(load<RiskAction>(KEYS.risks));
    setLocalCash(load<CashFlowItem>(KEYS.cashflow));
    setOverrideItems(loadMap<[Entity]>(KEYS.overrideItems));
    setOverrideRisks(loadMap<RiskAction>(KEYS.overrideRisks));
    setDeletedIds(new Set(load<string>(KEYS.deleted)));
  }, []);

  // Merged views
  const items = [
    ...SEED.filter(p => !deletedIds.has(p.id)).map(p => overrideItems[p.id] ?? p),
    ...localItems,
  ];
  const riskActions = [
    ...SEED_RISKS.filter(r => !deletedIds.has(r.id)).map(r => overrideRisks[r.id] ?? r),
    ...localRisks,
  ];
  const cashFlowItems = [
    ...SEED_CASH.filter(c => !deletedIds.has(c.id)),
    ...localCash,
  ];

  function markDeleted(id: string) {
    const next = new Set([...deletedIds, id]);
    setDeletedIds(next);
    save(KEYS.deleted, [...next]);
  }

  // CRUD — generyczny wzorzec (powiel dla każdej encji)
  const addItem = useCallback((data: Omit<[Entity], "id">) => {
    const item = { ...data, id: `item-${Date.now()}` } as [Entity];
    setLocalItems(prev => { const next = [...prev, item]; save(KEYS.items, next); return next; });
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<[Entity]>) => {
    const isSeed = SEED.some(p => p.id === id);
    if (isSeed) {
      setOverrideItems(prev => {
        const base = prev[id] ?? SEED.find(p => p.id === id)!;
        const next = { ...prev, [id]: { ...base, ...updates } };
        save(KEYS.overrideItems, next);
        return next;
      });
    } else {
      setLocalItems(prev => {
        const next = prev.map(p => p.id === id ? { ...p, ...updates } : p);
        save(KEYS.items, next);
        return next;
      });
    }
  }, []);

  const deleteItem = useCallback((id: string) => {
    markDeleted(id);
    setLocalItems(prev => { const next = prev.filter(p => p.id !== id); save(KEYS.items, next); return next; });
  }, [deletedIds]);

  const resetToSeedData = useCallback(() => {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    setLocalItems([]); setLocalRisks([]); setLocalCash([]);
    setOverrideItems({}); setOverrideRisks({});
    setDeletedIds(new Set());
  }, []);

  // ... analogicznie addRiskAction, updateRiskAction, deleteRiskAction, addCashFlowItem, deleteCashFlowItem

  return (
    <DataContext.Provider value={{ items, riskActions, cashFlowItems,
      addItem, updateItem, deleteItem,
      addRiskAction, updateRiskAction, deleteRiskAction,
      addCashFlowItem, deleteCashFlowItem, resetToSeedData }}>
      {children}
    </DataContext.Provider>
  );
}
```

---

## 8. WZORZEC TYPÓW

```typescript
// types/index.ts

// ─── Encja główna ─────────────────────────────────────────────────
export type EntityStatus = /* [STATUS_LIST] np.: */
  "NEW" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type Priority  = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface [Entity] {
  id: string;
  entityNo: string;              // unikalny numer biznesowy
  customer: string;
  description: string;
  status: EntityStatus;
  riskLevel?: RiskLevel;
  // finansowe
  quotedValue: number;
  estimatedFinalCost: number;
  // operacyjne
  startDate: string;             // "YYYY-MM-DD"
  dueDate: string;
  completionPct?: number;        // 0–100
  // [FIELD_1]: [TYPE_1]
  // [FIELD_2]: [TYPE_2]
  // ... pola z KROKU 0
}

// ─── Dane finansowe (24 miesiące) ────────────────────────────────
export interface FinancialPeriod {
  month: string;                 // "2026-04"
  label: string;                 // "Apr '26"
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
  quotesWon: number;
  quotesLost: number;
  quotesSent: number;
}

// ─── Przepływy pieniężne ──────────────────────────────────────────
export interface CashFlowItem {
  id: string;
  description: string;
  customer: string;
  amount: number;                // ujemny dla outflow
  dueDate: string;
  type: "INFLOW" | "OUTFLOW";
  status: "PLANNED" | "CONFIRMED" | "ISSUED" | "OVERDUE";
  daysOverdue?: number;
  category: string;
}

// ─── Ryzyka i działania ───────────────────────────────────────────
export interface RiskAction {
  id: string;
  title: string;
  description: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category: "FINANCIAL" | "OPERATIONAL" | "COMMERCIAL" | "QUALITY" | "DELIVERY";
  impactEur: number;
  owner: string;
  dueDate: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "MONITORING";
  linkedEntityId?: string;
  linkedCustomer?: string;
  actions: string[];
}

// ─── Klient ───────────────────────────────────────────────────────
export interface Customer {
  id: string;
  name: string;
  shortName: string;
  country: string;
  segment: string;
  contacts: Contact[];
  annualRevenue?: number;
  creditLimit?: number;
  paymentTerms?: number;
}

export interface Contact {
  name: string;
  role: string;
  email: string;
  phone?: string;
}

// ─── Pipeline CRM ─────────────────────────────────────────────────
export type DealStage = "LEAD" | "QUALIFIED" | "PROPOSAL" | "NEGOTIATION" | "WON" | "LOST";

export interface PipelineDeal {
  id: string;
  customerId: string;
  title: string;
  stage: DealStage;
  value: number;
  probability: number;
  expectedClose: string;
  ownerId: string;
  notes?: string;
}
```

---

## 9. SEED DATA — WZORZEC GENERATORA

```typescript
// data/seed-data.ts

// Helper finansowy — generuje jeden miesiąc
function fp(
  month: string, label: string,
  rev: number, gmPct: number, ebitdaPct: number,
  cash: number, arOvd: number, apOvd: number,
  qW: number, qL: number, qS: number,
): FinancialPeriod {
  const gp = Math.round(rev * gmPct / 100);
  const ebitda = Math.round(rev * ebitdaPct / 100);
  const netProfit = Math.round(ebitda * 0.75);
  return {
    month, label,
    revenue: rev, grossProfit: gp, gmPct,
    ebitda, ebitdaPct,
    netProfit, netProfitPct: Math.round(netProfit / rev * 1000) / 10,
    cashBalance: cash, arOverdue: arOvd, apOverdue: 0,
    quotesWon: qW, quotesLost: qL, quotesSent: qS,
  };
}

// 24 miesiące (maj 2024 – kwiecień 2026)
export const FINANCIAL_PERIODS: FinancialPeriod[] = [
  fp("2024-05","May '24", 280000, 36.0, 14.0, 1000000, 60000, 30000, 3,2,7),
  fp("2024-06","Jun '24", 320000, 38.0, 16.0, 1200000, 70000, 25000, 4,1,7),
  // ... 24 wiersze
];

// Dane encji (10–20 rekordów)
export const [ENTITIES]: [Entity][] = [
  {
    id: "e1",
    entityNo: "[ENTITY_NO_FORMAT]".replace("001", "001"),
    customer: "Klient A",
    description: "Opis encji 1",
    status: "IN_PROGRESS",
    quotedValue: 50000,
    estimatedFinalCost: 42000,
    startDate: "2025-10-01",
    dueDate: "2026-06-30",
    completionPct: 60,
    riskLevel: "LOW",
    // ... pola z KROKU 0
  },
  // ...
];

// Helpers
export const getCustomerById = (id: string) => CUSTOMERS.find(c => c.id === id);
export const getClaimsByCustomer = (id: string) => CLAIMS.filter(c => c.customerId === id);
export const getEnrichedDeals = () =>
  PIPELINE_DEALS.map(d => ({ ...d, customer: getCustomerById(d.customerId) }));
```

---

## 10. WZORZEC STRON KLUCZOWYCH

### Executive Summary (`/dashboard`)
Obowiązkowa kolejność sekcji:
1. Alert banner (jeśli `RISK_ACTIONS.filter(r => r.severity === "CRITICAL").length > 0`)
2. Header z datą i wskaźnikiem "Live" (`animate-pulse`)
3. **6 KPI cards** z KROKU 0 w `grid-cols-2 md:grid-cols-3 xl:grid-cols-6`
4. **Business KPIs** — 4 karty domenowe w `grid-cols-2 md:grid-cols-4`
5. **ComposedChart** Revenue + główna metryka% (24m) obok **AreaChart** Cash (12m)
6. **BarChart** Win/Loss + **LineChart** Margin Trend (12m)
7. **3 widgety** (col-3): Critical Items | CEO Alerts | Overdue AR

### Financial Overview (`/financial`)
1. PLCards YTD: [Biznes] + [Prognoza roczna]
2. ComposedChart Revenue + GM% + EBITDA% (12m) | BarChart EBITDA Bridge
3. Cash Forecast 30/60/90 dni (Inflows | Outflows | Net)
4. AreaChart Cash Balance + AR Overdue (12m)
5. Tabela Cash Flow Register (add/delete)
6. Tabela Monthly P&L YTD

### Reports (`/reports`)
Selektor okresu: `YTD | Last 12M | Last 24M` (przyciski inline, nie dropdown)
Tabs z CSV export na każdej:
- Profitability — LineChart + tabela
- Revenue — BarChart
- Quote Performance — ComposedChart + tabela
- [ENTITY] Status — metryki + tabela
- Customer P&L — tabela per klient

### Risks / Actions (`/risks`)
Filtry: severity × status
Lista `RiskAction` jako rozwijane karty z flagami i listą działań
CRUD: dodaj / edytuj (Dialog) / usuń z potwierdzeniem

---

## 11. AUTH MIDDLEWARE

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const session = req.cookies.get("demo_session");
  const isPublic = ["/login"].some(p => req.nextUrl.pathname.startsWith(p));
  if (!isPublic && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next|favicon).*)"] };
```

Login ustawia: `document.cookie = "demo_session=1; path=/; max-age=86400"`
Logout usuwa: `document.cookie = "demo_session=; path=/; max-age=0"`

---

## 12. HELPERS (`lib/utils.ts`)

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = "EUR"): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency", currency,
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(value);
}

export function formatPct(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit", month: "short", year: "numeric",
  }).format(new Date(date));
}

export function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}
```

---

## 13. COMMAND PALETTE (`⌘K`)

```tsx
// Ctrl+K / ⌘K — globalny skrót w TopNav
// Wyświetla: grupy nawigacji + lista klientów + (opcjonalnie) ostatnie encje
<CommandDialog open={open} onOpenChange={onOpenChange}>
  <CommandInput placeholder="Szukaj..." />
  <CommandList>
    <CommandGroup heading="Nawigacja">
      {/* pozycje z NAWIGACJI w KROKU 0 */}
    </CommandGroup>
    <CommandSeparator />
    <CommandGroup heading="Klienci">
      {CUSTOMERS.map(c => (
        <CommandItem onSelect={() => navigate(`/crm/${c.id}`)}>
          <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
          {c.name}
        </CommandItem>
      ))}
    </CommandGroup>
  </CommandList>
</CommandDialog>
```

---

*Oparty na architekturze Next.js 15 + shadcn/ui + Recharts + Framer Motion.*
*Wersja uniwersalna — bez kodu domenowego. Wypełnij KROK 0 i przekaż całość do AI.*
