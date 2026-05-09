"use client";
import {
  ComposedChart, Bar, Line, BarChart, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Legend,
  AreaChart, Area,
} from "recharts";
import { DollarSign, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency, formatPct } from "@/lib/utils";
import { FINANCIAL_PERIODS } from "@/data/seed-data";
import { useData } from "@/context/data-context";
import { CashFlowForm } from "@/components/forms/cashflow-form";
import { useState } from "react";
import { useSort, SortHead } from "@/hooks/use-sort";

const CURRENT = FINANCIAL_PERIODS[FINANCIAL_PERIODS.length - 1];

const ytd = FINANCIAL_PERIODS.filter(p => p.month.startsWith("2026"));
const ytdRev = ytd.reduce((s, p) => s + p.revenue, 0);
const ytdGP = ytd.reduce((s, p) => s + p.grossProfit, 0);
const ytdEBITDA = ytd.reduce((s, p) => s + p.ebitda, 0);
const ytdNet = ytd.reduce((s, p) => s + p.netProfit, 0);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg shadow-xl p-3 text-xs min-w-[160px]">
      <p className="font-semibold mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-medium">{p.value > 100 ? formatCurrency(p.value) : `${p.value}%`}</span>
        </div>
      ))}
    </div>
  );
};

function PLCard({
  label, revenue, gp, gmPct, ebitda, ebitdaPct, netProfit, netPct, color,
}: {
  label: string; revenue: number; gp: number; gmPct: number;
  ebitda: number; ebitdaPct: number; netProfit?: number; netPct?: number;
  color: string;
}) {
  const rows = [
    { label: "Revenue", value: formatCurrency(revenue), highlight: false },
    { label: "Gross Profit", value: formatCurrency(gp), sub: formatPct(gmPct), highlight: false },
    { label: "EBITDA", value: formatCurrency(ebitda), sub: formatPct(ebitdaPct), highlight: true },
    ...(netProfit !== undefined ? [{ label: "Net Profit", value: formatCurrency(netProfit), sub: netPct ? formatPct(netPct) : undefined, highlight: false }] : []),
  ];
  const borderCol: Record<string, string> = {
    indigo: "border-indigo-500/20",
    violet: "border-violet-500/20",
  };
  return (
    <div className={cn("rounded-xl border bg-card p-5", borderCol[color] ?? "border-border")}>
      <div className={cn("text-xs font-bold uppercase tracking-widest mb-4 pb-2 border-b",
        color === "indigo" ? "text-indigo-400 border-indigo-500/20" : "text-violet-400 border-violet-500/20")}>
        {label}
      </div>
      <div className="space-y-3">
        {rows.map(r => (
          <div key={r.label} className={cn("flex items-center justify-between", r.highlight && "bg-accent/30 rounded-lg px-2 py-1.5 -mx-2")}>
            <span className="text-xs text-muted-foreground">{r.label}</span>
            <div className="text-right">
              <span className={cn("text-sm font-semibold", r.highlight && "text-base")}>{r.value}</span>
              {r.sub && <span className={cn("ml-1.5 text-[11px] font-medium",
                color === "indigo" ? "text-indigo-400" : "text-violet-400")}>
                {r.sub}
              </span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FinancialOverviewPage() {
  const [cashFormOpen, setCashFormOpen] = useState(false);
  const { cashFlowItems: CASH_FLOW_ITEMS, deleteCashFlowItem } = useData();

  const cashRegisterSort = useSort();
  const sortedCashItems = cashRegisterSort.apply(CASH_FLOW_ITEMS, {
    Description: i => i.description,
    Customer: i => i.customer,
    Amount: i => Math.abs(i.amount),
    "Due Date": i => i.dueDate,
    Category: i => i.category,
    Status: i => i.status,
  });
  const plSort = useSort();
  const sortedYtd = plSort.apply(ytd, {
    Month: p => p.label,
    Revenue: p => p.revenue,
    "Gross Profit": p => p.grossProfit,
    "GM%": p => p.gmPct,
    EBITDA: p => p.ebitda,
    "EBITDA%": p => p.ebitdaPct,
    "Net Profit": p => p.netProfit,
    Cash: p => p.cashBalance,
  });
  const trend12 = FINANCIAL_PERIODS.slice(-12);

  const plTrend = trend12.map(p => ({
    name: p.label,
    "Revenue": p.toolingRevenue,
    "EBITDA%": p.ebitdaPct,
    "GM%": p.gmPct,
  }));

  const bridgeData = [
    { name: "Revenue", value: ytdRev, fill: "#6366f1" },
    { name: "- Material", value: -(ytdRev * 0.18), fill: "#f43f5e" },
    { name: "- Labor", value: -(ytdRev * 0.22), fill: "#f43f5e" },
    { name: "- Machine", value: -(ytdRev * 0.15), fill: "#f43f5e" },
    { name: "= Gross Profit", value: ytdGP, fill: "#10b981" },
    { name: "- Overhead", value: -(ytdRev * 0.10), fill: "#f59e0b" },
    { name: "= EBITDA", value: ytdEBITDA, fill: "#10b981" },
    { name: "- D&A / Int.", value: -(ytdEBITDA * 0.15), fill: "#94a3b8" },
    { name: "= Net Profit", value: ytdNet, fill: "#6366f1" },
  ];

  const forecastData = [
    {
      period: "30 days",
      Inflows: CASH_FLOW_ITEMS.filter(c => c.type === "INFLOW" && c.status !== "OVERDUE").reduce((s, c) => s + c.amount, 0),
      Outflows: Math.abs(CASH_FLOW_ITEMS.filter(c => c.type === "OUTFLOW").slice(0, 5).reduce((s, c) => s + c.amount, 0)),
    },
    { period: "60 days", Inflows: 285000, Outflows: 220000 },
    { period: "90 days", Inflows: 340000, Outflows: 265000 },
  ];

  const cashTrend = FINANCIAL_PERIODS.slice(-12).map(p => ({
    name: p.label,
    Cash: p.cashBalance,
    "AR Overdue": p.arOverdue,
  }));

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <CashFlowForm open={cashFormOpen} onClose={() => setCashFormOpen(false)} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-amber-400" /> Financial Overview
          </h1>
          <p className="text-sm text-muted-foreground">Tooling Business P&L · YTD Jan–Apr 2026</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setCashFormOpen(true)}>
          <Plus className="w-3.5 h-3.5" /> Dodaj fakturę / płatność
        </Button>
      </div>

      {/* ── P&L Cards ── */}
      <div>
        <p className="text-xs uppercase font-semibold text-muted-foreground mb-3 tracking-widest">
          Year-to-Date P&L – January–April 2026
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PLCard
            label="Tooling Business"
            revenue={ytdRev}
            gp={ytdGP}
            gmPct={ytdRev > 0 ? (ytdGP / ytdRev) * 100 : 0}
            ebitda={ytdEBITDA}
            ebitdaPct={ytdRev > 0 ? (ytdEBITDA / ytdRev) * 100 : 0}
            color="indigo"
          />
          <PLCard
            label="Full Year Outlook"
            revenue={ytdRev * (12 / 4)}
            gp={ytdGP * (12 / 4)}
            gmPct={ytdRev > 0 ? (ytdGP / ytdRev) * 100 : 0}
            ebitda={ytdEBITDA * (12 / 4)}
            ebitdaPct={ytdRev > 0 ? (ytdEBITDA / ytdRev) * 100 : 0}
            netProfit={ytdNet * (12 / 4)}
            netPct={ytdRev > 0 ? (ytdNet / ytdRev) * 100 : 0}
            color="violet"
          />
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue + EBITDA trend */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold mb-1">Revenue & EBITDA% Trend</p>
          <p className="text-xs text-muted-foreground mb-4">12-month · Tooling Revenue</p>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={plTrend} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={2} />
              <YAxis yAxisId="l" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={v => `€${(v / 1000).toFixed(0)}k`} />
              <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} domain={[0, 50]} />
              <RTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="l" dataKey="Revenue" fill="#6366f1" radius={[3, 3, 0, 0]} opacity={0.9} />
              <Line yAxisId="r" type="monotone" dataKey="EBITDA%" stroke="#f59e0b" strokeWidth={2} dot={false} />
              <Line yAxisId="r" type="monotone" dataKey="GM%" stroke="#94a3b8" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* EBITDA Bridge */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold mb-1">EBITDA Bridge – YTD 2026</p>
          <p className="text-xs text-muted-foreground mb-4">Revenue → Cost deductions → EBITDA</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={bridgeData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={v => `€${(v / 1000).toFixed(0)}k`} />
              <RTooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                {bridgeData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Cash Flow Section ── */}
      <div>
        <p className="text-xs uppercase font-semibold text-muted-foreground mb-3 tracking-widest">Cash Flow</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {forecastData.map(f => {
            const net = f.Inflows - f.Outflows;
            return (
              <div key={f.period} className="rounded-xl border border-border bg-card p-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">{f.period} forecast</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-400">Expected Inflows</span>
                    <span className="text-sm font-semibold text-emerald-400">+{formatCurrency(f.Inflows)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-rose-400">Expected Outflows</span>
                    <span className="text-sm font-semibold text-rose-400">-{formatCurrency(f.Outflows)}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex items-center justify-between">
                    <span className="text-xs font-semibold">Net Cash Flow</span>
                    <span className={cn("text-sm font-bold", net >= 0 ? "text-emerald-400" : "text-rose-400")}>
                      {net >= 0 ? "+" : ""}{formatCurrency(net)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold mb-1">Cash Balance & AR Overdue Trend</p>
          <p className="text-xs text-muted-foreground mb-4">12-month rolling</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={cashTrend} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="cashG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="arG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={1} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={v => `€${(v / 1000).toFixed(0)}k`} />
              <RTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="Cash" stroke="#06b6d4" strokeWidth={2} fill="url(#cashG)" />
              <Area type="monotone" dataKey="AR Overdue" stroke="#f43f5e" strokeWidth={2} fill="url(#arG)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Cash Flow Register ── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <p className="text-sm font-semibold">Cash Flow Register</p>
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => setCashFormOpen(true)}>
            <Plus className="w-3 h-3" /> Add
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                {(["Description", "Customer", "Amount", "Due Date", "Category", "Status"] as const).map(h => (
                  <SortHead key={h} label={h} sort={cashRegisterSort} className="text-left py-2.5 px-3 text-muted-foreground font-medium" />
                ))}
                <th className="py-2.5 px-3 w-8" />
              </tr>
            </thead>
            <tbody>
              {sortedCashItems.map(item => (
                <tr key={item.id} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
                  <td className="py-2.5 px-3 font-medium">{item.description}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{item.customer}</td>
                  <td className={cn("py-2.5 px-3 tabular-nums font-semibold", item.type === "INFLOW" ? "text-emerald-400" : "text-rose-400")}>
                    {item.type === "INFLOW" ? "+" : "-"}{formatCurrency(Math.abs(item.amount))}
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground">{item.dueDate}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{item.category}</td>
                  <td className="py-2.5 px-3">
                    <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-semibold",
                      item.status === "OVERDUE" ? "bg-rose-500/20 text-rose-400" :
                      item.status === "CONFIRMED" ? "bg-emerald-500/20 text-emerald-400" :
                      item.status === "ISSUED" ? "bg-blue-500/20 text-blue-400" :
                      "bg-muted text-muted-foreground")}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <button onClick={() => deleteCashFlowItem(item.id)} className="text-muted-foreground/40 hover:text-rose-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Monthly P&L Table ── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <p className="text-sm font-semibold">Monthly P&L Detail – YTD 2026</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                {(["Month", "Revenue", "Gross Profit", "GM%", "EBITDA", "EBITDA%", "Net Profit", "Cash"] as const).map(h => (
                  <SortHead key={h} label={h} sort={plSort} className="text-right first:text-left py-2.5 px-3 text-muted-foreground font-medium" />
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedYtd.map(p => (
                <tr key={p.month} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
                  <td className="py-2.5 px-3 font-semibold">{p.label}</td>
                  <td className="py-2.5 px-3 tabular-nums text-right font-semibold text-indigo-400">{formatCurrency(p.revenue)}</td>
                  <td className="py-2.5 px-3 tabular-nums text-right">{formatCurrency(p.grossProfit)}</td>
                  <td className={cn("py-2.5 px-3 tabular-nums text-right font-bold",
                    p.gmPct >= 30 ? "text-emerald-400" : p.gmPct >= 25 ? "text-amber-400" : "text-rose-400")}>
                    {p.gmPct.toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 tabular-nums text-right">{formatCurrency(p.ebitda)}</td>
                  <td className={cn("py-2.5 px-3 tabular-nums text-right font-bold",
                    p.ebitdaPct >= 15 ? "text-emerald-400" : p.ebitdaPct >= 10 ? "text-amber-400" : "text-rose-400")}>
                    {p.ebitdaPct.toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 tabular-nums text-right text-muted-foreground">{formatCurrency(p.netProfit)}</td>
                  <td className="py-2.5 px-3 tabular-nums text-right text-cyan-400">{formatCurrency(p.cashBalance)}</td>
                </tr>
              ))}
              <tr className="bg-accent/20 font-semibold border-t border-border">
                <td className="py-2.5 px-3 font-bold">YTD Total</td>
                <td className="py-2.5 px-3 tabular-nums text-right font-bold text-indigo-400">{formatCurrency(ytdRev)}</td>
                <td className="py-2.5 px-3 tabular-nums text-right">{formatCurrency(ytdGP)}</td>
                <td className={cn("py-2.5 px-3 tabular-nums text-right font-bold",
                  (ytdGP / ytdRev * 100) >= 30 ? "text-emerald-400" : "text-amber-400")}>
                  {(ytdGP / ytdRev * 100).toFixed(1)}%
                </td>
                <td className="py-2.5 px-3 tabular-nums text-right">{formatCurrency(ytdEBITDA)}</td>
                <td className={cn("py-2.5 px-3 tabular-nums text-right font-bold",
                  (ytdEBITDA / ytdRev * 100) >= 15 ? "text-emerald-400" : "text-amber-400")}>
                  {(ytdEBITDA / ytdRev * 100).toFixed(1)}%
                </td>
                <td className="py-2.5 px-3 tabular-nums text-right text-muted-foreground">{formatCurrency(ytdNet)}</td>
                <td className="py-2.5 px-3 tabular-nums text-right text-cyan-400">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
