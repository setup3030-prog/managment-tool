"use client";
import { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Download, FileBarChart } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useSort, SortHead } from "@/hooks/use-sort";
import { cn, formatCurrency, formatPct } from "@/lib/utils";
import { FINANCIAL_PERIODS, TOOLING_PROJECTS } from "@/data/seed-data";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg shadow-xl p-3 text-xs min-w-[140px]">
      <p className="font-semibold mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-3">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-medium">{p.value > 1000 ? formatCurrency(p.value) : `${typeof p.value === "number" ? p.value.toFixed(1) : p.value}${p.name.includes("%") ? "%" : ""}`}</span>
        </div>
      ))}
    </div>
  );
};

function downloadCsv(data: object[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map(r => Object.values(r).join(",")).join("\n");
  const blob = new Blob([headers + "\n" + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<"ytd" | "12m" | "24m">("12m");

  const months = period === "ytd"
    ? FINANCIAL_PERIODS.filter(p => p.month.startsWith("2026"))
    : period === "12m"
    ? FINANCIAL_PERIODS.slice(-12)
    : FINANCIAL_PERIODS;

  // ── Profitability Report ──
  const profitData = months.map(p => ({
    name: p.label,
    "Tooling GM%": p.toolingGMPct,
    "EBITDA%": p.ebitdaPct,
    "Net Profit%": p.netProfitPct,
  }));

  // ── Revenue Report ──
  const revenueData = months.map(p => ({
    name: p.label,
    Revenue: p.toolingRevenue,
  }));

  // ── Quote Performance ──
  const rfqData = months.map(p => ({
    name: p.label,
    Sent: p.rfqSent,
    Won: p.rfqWon,
    Lost: p.rfqLost,
    "Win Rate%": p.rfqSent > 0 ? Math.round((p.rfqWon / p.rfqSent) * 100) : 0,
  }));

  // ── Project Status ──
  const projectStatusData = [
    { status: "ACTIVE", count: TOOLING_PROJECTS.filter(p => p.status === "ACTIVE").length },
    { status: "COMPLETED", count: TOOLING_PROJECTS.filter(p => p.status === "COMPLETED").length },
    { status: "ON_HOLD", count: TOOLING_PROJECTS.filter(p => p.status === "ON_HOLD").length },
    { status: "CANCELLED", count: TOOLING_PROJECTS.filter(p => p.status === "CANCELLED").length },
  ];

  // ── Customer P&L (tooling) ──
  const customerMap = new Map<string, { revenue: number; efc: number; count: number }>();
  TOOLING_PROJECTS.forEach(p => {
    const ex = customerMap.get(p.customer) ?? { revenue: 0, efc: 0, count: 0 };
    customerMap.set(p.customer, {
      revenue: ex.revenue + p.quotedRevenue,
      efc: ex.efc + p.estimatedFinalCost,
      count: ex.count + 1,
    });
  });
  const customerPL = Array.from(customerMap.entries())
    .map(([customer, d]) => ({
      customer,
      revenue: d.revenue,
      efc: d.efc,
      margin: d.revenue > 0 ? ((d.revenue - d.efc) / d.revenue) * 100 : 0,
      projects: d.count,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const RISK_ORDER_R: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  const profitSort = useSort();
  const sortedMonths = profitSort.apply(months, {
    Month: m => m.label,
    Revenue: m => m.revenue,
    "GM%": m => m.gmPct,
    EBITDA: m => m.ebitda,
    "EBITDA%": m => m.ebitdaPct,
    "Net Profit": m => m.netProfit,
  });
  const quoteSort = useSort();
  const sortedRfqData = quoteSort.apply(rfqData, {
    Month: r => r.name,
    Sent: r => r.Sent,
    Won: r => r.Won,
    Lost: r => r.Lost,
    "Win Rate": r => r["Win Rate%"],
  });
  const projectReportSort = useSort();
  const sortedAllProjects = projectReportSort.apply(TOOLING_PROJECTS, {
    "Tool No": p => p.toolNo,
    Customer: p => p.customer,
    Description: p => p.description,
    Quoted: p => p.quotedRevenue,
    EFC: p => p.estimatedFinalCost,
    Margin: p => p.quotedRevenue > 0 ? (p.quotedRevenue - p.estimatedFinalCost) / p.quotedRevenue * 100 : -100,
    Done: p => p.completionPct,
    ETA: p => p.eta,
    Risk: p => RISK_ORDER_R[p.riskLevel] ?? 4,
    Status: p => p.status,
  });
  const customerReportSort = useSort();
  const sortedCustomerPL = customerReportSort.apply(customerPL, {
    Customer: c => c.customer,
    "Quoted Revenue": c => c.revenue,
    "Est. Final Cost": c => c.efc,
    "Margin%": c => c.margin,
    Projects: c => c.projects,
  });

  const projectCsvData = TOOLING_PROJECTS.map(p => ({
    toolNo: p.toolNo, customer: p.customer, service: p.serviceType,
    quotedRevenue: p.quotedRevenue, efc: p.estimatedFinalCost,
    margin: p.quotedRevenue > 0 ? ((p.quotedRevenue - p.estimatedFinalCost) / p.quotedRevenue * 100).toFixed(1) : "N/A",
    completion: p.completionPct, eta: p.eta, risk: p.riskLevel, status: p.status,
  }));

  const SectionHead = ({ title, sub, onExport }: { title: string; sub?: string; onExport?: () => void }) => (
    <div className="flex items-center justify-between mb-4">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
      {onExport && (
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={onExport}>
          <Download className="w-3 h-3" /> Export CSV
        </Button>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileBarChart className="w-6 h-6 text-indigo-400" /> Reports
          </h1>
          <p className="text-sm text-muted-foreground">Exportable performance reports · April 2026</p>
        </div>
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          {(["ytd", "12m", "24m"] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn("text-xs px-3 py-1.5 rounded-md transition-colors",
                period === p ? "bg-indigo-500/15 text-indigo-400" : "text-muted-foreground hover:text-foreground")}
            >
              {p === "ytd" ? "YTD 2026" : p === "12m" ? "Last 12M" : "Last 24M"}
            </button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="profitability" className="w-full">
        <TabsList className="bg-card border border-border mb-6 p-1 h-auto gap-1 flex-wrap">
          {[
            { value: "profitability", label: "Profitability" },
            { value: "revenue", label: "Revenue" },
            { value: "quotes", label: "Quote Performance" },
            { value: "projects", label: "Project Status" },
            { value: "customers", label: "Customer P&L" },
          ].map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-xs px-3 py-1.5">{t.label}</TabsTrigger>
          ))}
        </TabsList>

        {/* ── PROFITABILITY ── */}
        <TabsContent value="profitability" className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-5">
            <SectionHead
              title="Margin Trend"
              sub="Tooling GM%, EBITDA%, Net Profit%"
              onExport={() => downloadCsv(profitData, "profitability-report.csv")}
            />
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={profitData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={Math.max(0, Math.floor(months.length / 10) - 1)} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} domain={[0, 50]} />
                <RTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Tooling GM%" stroke="#6366f1" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="EBITDA%" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 2" />
                <Line type="monotone" dataKey="Net Profit%" stroke="#06b6d4" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <p className="text-sm font-semibold">Monthly Profitability Detail</p>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8"
                onClick={() => downloadCsv(months.map(p => ({ month: p.label, revenue: p.revenue, gmPct: p.gmPct, ebitda: p.ebitda, ebitdaPct: p.ebitdaPct, netProfit: p.netProfit, netPct: p.netProfitPct })), "monthly-pl.csv")}>
                <Download className="w-3 h-3" /> CSV
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    {(["Month", "Revenue", "GM%", "EBITDA", "EBITDA%", "Net Profit"] as const).map(h => (
                      <SortHead key={h} label={h} sort={profitSort} className="text-right first:text-left py-2.5 px-3 text-muted-foreground font-medium" />
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedMonths.map(p => (
                    <tr key={p.month} className="border-b border-border/50 hover:bg-accent/20">
                      <td className="py-2 px-3 font-medium">{p.label}</td>
                      <td className="py-2 px-3 tabular-nums text-right font-semibold text-indigo-400">{formatCurrency(p.revenue)}</td>
                      <td className={cn("py-2 px-3 tabular-nums text-right font-bold", p.gmPct >= 35 ? "text-emerald-400" : "text-amber-400")}>{p.gmPct.toFixed(1)}%</td>
                      <td className="py-2 px-3 tabular-nums text-right">{formatCurrency(p.ebitda)}</td>
                      <td className={cn("py-2 px-3 tabular-nums text-right font-bold", p.ebitdaPct >= 15 ? "text-emerald-400" : p.ebitdaPct >= 10 ? "text-amber-400" : "text-rose-400")}>{p.ebitdaPct.toFixed(1)}%</td>
                      <td className="py-2 px-3 tabular-nums text-right text-muted-foreground">{formatCurrency(p.netProfit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ── REVENUE ── */}
        <TabsContent value="revenue" className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-5">
            <SectionHead
              title="Revenue Trend"
              sub="Monthly tooling revenue"
              onExport={() => downloadCsv(revenueData, "revenue-report.csv")}
            />
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={revenueData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={Math.max(0, Math.floor(months.length / 10) - 1)} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={v => `€${(v / 1000).toFixed(0)}k`} />
                <RTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Revenue" fill="#6366f1" radius={[3, 3, 0, 0]} opacity={0.9} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        {/* ── QUOTE PERFORMANCE ── */}
        <TabsContent value="quotes" className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-5">
            <SectionHead
              title="Quote Win/Loss Performance"
              sub="Monthly sent, won, lost, win rate"
              onExport={() => downloadCsv(rfqData, "quote-performance.csv")}
            />
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={rfqData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={Math.max(0, Math.floor(months.length / 10) - 1)} />
                <YAxis yAxisId="l" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} domain={[0, 100]} />
                <RTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="l" dataKey="Won" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar yAxisId="l" dataKey="Lost" fill="#f43f5e" radius={[3, 3, 0, 0]} />
                <Line yAxisId="r" type="monotone" dataKey="Win Rate%" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <p className="text-sm font-semibold">Quote Detail Table</p>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={() => downloadCsv(rfqData, "quote-detail.csv")}>
                <Download className="w-3 h-3" /> CSV
              </Button>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  {(["Month", "Sent", "Won", "Lost", "Win Rate"] as const).map(h => (
                    <SortHead key={h} label={h} sort={quoteSort} className="text-right first:text-left py-2.5 px-4 text-muted-foreground font-medium" />
                  ))}
                  <th className="text-right py-2.5 px-4 text-muted-foreground font-medium">MoM</th>
                </tr>
              </thead>
              <tbody>
                {sortedRfqData.map((row, i) => {
                  const prev = i > 0 ? sortedRfqData[i - 1]["Win Rate%"] : row["Win Rate%"];
                  const delta = row["Win Rate%"] - prev;
                  return (
                    <tr key={row.name} className="border-b border-border/50 hover:bg-accent/20">
                      <td className="py-2.5 px-4 font-medium">{row.name}</td>
                      <td className="py-2.5 px-4 tabular-nums text-right">{row.Sent}</td>
                      <td className="py-2.5 px-4 tabular-nums text-right text-emerald-400 font-semibold">{row.Won}</td>
                      <td className="py-2.5 px-4 tabular-nums text-right text-rose-400 font-semibold">{row.Lost}</td>
                      <td className={cn("py-2.5 px-4 tabular-nums text-right font-bold",
                        row["Win Rate%"] >= 65 ? "text-emerald-400" : row["Win Rate%"] >= 50 ? "text-amber-400" : "text-rose-400")}>
                        {row["Win Rate%"]}%
                      </td>
                      <td className={cn("py-2.5 px-4 tabular-nums text-right text-xs",
                        delta > 0 ? "text-emerald-400" : delta < 0 ? "text-rose-400" : "text-muted-foreground")}>
                        {i === 0 ? "—" : `${delta > 0 ? "+" : ""}${delta.toFixed(0)}pp`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* ── PROJECT STATUS ── */}
        <TabsContent value="projects" className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Active Projects", value: TOOLING_PROJECTS.filter(p => p.status === "ACTIVE").length, col: "indigo" },
              { label: "Completed YTD", value: TOOLING_PROJECTS.filter(p => p.status === "COMPLETED").length, col: "green" },
              { label: "High / Critical Risk", value: TOOLING_PROJECTS.filter(p => ["HIGH", "CRITICAL"].includes(p.riskLevel)).length, col: "rose" },
              { label: "Total WIP Value", value: formatCurrency(TOOLING_PROJECTS.reduce((s, p) => s + p.wip, 0)), col: "amber" },
            ].map(k => (
              <div key={k.label} className={cn("rounded-xl border p-4",
                k.col === "indigo" ? "border-indigo-500/15 bg-indigo-500/5" :
                k.col === "green" ? "border-emerald-500/15 bg-emerald-500/5" :
                k.col === "rose" ? "border-rose-500/15 bg-rose-500/5" :
                "border-amber-500/15 bg-amber-500/5")}>
                <p className="text-[10px] text-muted-foreground uppercase">{k.label}</p>
                <p className="text-2xl font-bold mt-1">{k.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <p className="text-sm font-semibold">All Projects</p>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={() => downloadCsv(projectCsvData, "project-status.csv")}>
                <Download className="w-3 h-3" /> Export CSV
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    {(["Tool No", "Customer", "Description", "Quoted", "EFC", "Margin", "Done", "ETA", "Risk", "Status"] as const).map(h => (
                      <SortHead key={h} label={h} sort={projectReportSort} className="text-left py-2.5 px-3 text-muted-foreground font-medium" />
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedAllProjects.map(p => {
                    const margin = p.quotedRevenue > 0
                      ? ((p.quotedRevenue - p.estimatedFinalCost) / p.quotedRevenue) * 100 : null;
                    return (
                      <tr key={p.id} className="border-b border-border/50 hover:bg-accent/20">
                        <td className="py-2.5 px-3 font-mono text-[11px] font-semibold">{p.toolNo}</td>
                        <td className="py-2.5 px-3 font-medium whitespace-nowrap">{p.customer}</td>
                        <td className="py-2.5 px-3 text-muted-foreground max-w-[160px] truncate">{p.description}</td>
                        <td className="py-2.5 px-3 tabular-nums">{p.quotedRevenue > 0 ? formatCurrency(p.quotedRevenue) : "—"}</td>
                        <td className={cn("py-2.5 px-3 tabular-nums font-semibold",
                          p.estimatedFinalCost > p.quotedRevenue ? "text-rose-400" : "text-emerald-400")}>
                          {formatCurrency(p.estimatedFinalCost)}
                        </td>
                        <td className={cn("py-2.5 px-3 tabular-nums font-bold",
                          margin === null ? "text-muted-foreground" :
                          margin >= 20 ? "text-emerald-400" : margin >= 10 ? "text-amber-400" : "text-rose-400")}>
                          {margin !== null ? `${margin.toFixed(1)}%` : "—"}
                        </td>
                        <td className="py-2.5 px-3 tabular-nums">{p.completionPct}%</td>
                        <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">{p.eta}</td>
                        <td className="py-2.5 px-3">
                          <span className={cn("text-[10px] px-1.5 py-0.5 rounded",
                            p.riskLevel === "HIGH" || p.riskLevel === "CRITICAL" ? "bg-rose-500/10 text-rose-400" :
                            p.riskLevel === "MEDIUM" ? "bg-amber-500/10 text-amber-400" :
                            "bg-emerald-500/10 text-emerald-400")}>
                            {p.riskLevel}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={cn("text-[10px] px-1.5 py-0.5 rounded",
                            p.status === "ACTIVE" ? "bg-indigo-500/10 text-indigo-400" :
                            p.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-400" :
                            "bg-slate-500/10 text-slate-400")}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ── CUSTOMER P&L (tooling) ── */}
        <TabsContent value="customers" className="space-y-5">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <p className="text-sm font-semibold">Customer Profitability – Tooling</p>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8"
                onClick={() => downloadCsv(customerPL.map(c => ({ customer: c.customer, quotedRevenue: c.revenue, efc: c.efc, margin: c.margin.toFixed(1), projects: c.projects })), "customer-pl.csv")}>
                <Download className="w-3 h-3" /> Export CSV
              </Button>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  {(["Customer", "Quoted Revenue", "Est. Final Cost", "Margin%", "Projects"] as const).map(h => (
                    <SortHead key={h} label={h} sort={customerReportSort} className="text-left py-2.5 px-4 text-muted-foreground font-medium" />
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedCustomerPL.map(c => (
                  <tr key={c.customer} className="border-b border-border/50 hover:bg-accent/20">
                    <td className="py-2.5 px-4 font-semibold">{c.customer}</td>
                    <td className="py-2.5 px-4 tabular-nums font-semibold text-indigo-400">{c.revenue > 0 ? formatCurrency(c.revenue) : "—"}</td>
                    <td className={cn("py-2.5 px-4 tabular-nums font-semibold",
                      c.efc > c.revenue ? "text-rose-400" : "text-emerald-400")}>
                      {formatCurrency(c.efc)}
                    </td>
                    <td className={cn("py-2.5 px-4 tabular-nums font-bold",
                      c.margin >= 20 ? "text-emerald-400" : c.margin >= 10 ? "text-amber-400" : "text-rose-400")}>
                      {c.revenue > 0 ? `${c.margin.toFixed(1)}%` : "—"}
                    </td>
                    <td className="py-2.5 px-4 text-muted-foreground">{c.projects}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
