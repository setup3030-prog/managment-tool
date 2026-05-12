"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  TrendingUp, TrendingDown, AlertTriangle, DollarSign, Wrench,
  X, ArrowRight, Clock,
} from "lucide-react";
import { cn, formatCurrency, formatPct } from "@/lib/utils";
import {
  FINANCIAL_PERIODS, TOOLING_PROJECTS,
  CEO_ALERTS, CASH_FLOW_ITEMS, RISK_ACTIONS,
} from "@/data/seed-data";

const MONTHS_12 = FINANCIAL_PERIODS.slice(-12);
const MONTHS_24 = FINANCIAL_PERIODS;
const CURRENT = FINANCIAL_PERIODS[FINANCIAL_PERIODS.length - 1];
const PREV = FINANCIAL_PERIODS[FINANCIAL_PERIODS.length - 2];

function delta(cur: number, prv: number) {
  return prv === 0 ? 0 : ((cur - prv) / Math.abs(prv)) * 100;
}

const CHART_COLORS = {
  tooling: "#6366f1",
  ebitda: "#f59e0b",
  cash: "#06b6d4",
  won: "#10b981",
  lost: "#f43f5e",
};

function KpiCard({
  label, value, unit = "", trend, subtitle, color = "indigo", icon: Icon,
}: {
  label: string; value: string; unit?: string; trend?: number;
  subtitle?: string; color?: string; icon?: React.ElementType;
}) {
  const isPos = (trend ?? 0) >= 0;
  const colorMap: Record<string, string> = {
    indigo: "from-indigo-500/10 to-indigo-500/5 border-indigo-500/20",
    emerald: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20",
    amber: "from-amber-500/10 to-amber-500/5 border-amber-500/20",
    rose: "from-rose-500/10 to-rose-500/5 border-rose-500/20",
    cyan: "from-cyan-500/10 to-cyan-500/5 border-cyan-500/20",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-xl border bg-gradient-to-br p-5 flex flex-col gap-2", colorMap[color] ?? colorMap.indigo)}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        {Icon && <Icon className="w-4 h-4 text-muted-foreground/60" />}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold tabular-nums">{value}</span>
        {unit && <span className="text-sm text-muted-foreground mb-0.5">{unit}</span>}
      </div>
      <div className="flex items-center gap-2">
        {trend !== undefined && (
          <span className={cn("flex items-center gap-0.5 text-xs font-medium", isPos ? "text-emerald-400" : "text-rose-400")}>
            {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPos ? "+" : ""}{trend.toFixed(1)}% MoM
          </span>
        )}
        {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
      </div>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg shadow-xl p-3 text-xs min-w-[160px]">
      <p className="font-semibold mb-2 text-foreground">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span style={{ color: p.color }} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-medium text-foreground">
            {typeof p.value === "number" && p.value > 1000 ? formatCurrency(p.value) : `${p.value}%`}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function ExecutiveSummaryPage() {
  const [alertDismissed, setAlertDismissed] = useState(false);

  const criticalRisks = RISK_ACTIONS.filter(r => r.severity === "CRITICAL" || r.severity === "HIGH").slice(0, 3);
  const overdueItems = CASH_FLOW_ITEMS.filter(c => c.status === "OVERDUE");
  const overdueTotal = overdueItems.reduce((s, c) => s + c.amount, 0);

  const activeProjects = TOOLING_PROJECTS.filter(p => p.status === "ACTIVE");
  const highRiskProjects = activeProjects.filter(p => p.riskLevel === "HIGH" || p.riskLevel === "CRITICAL");
  const toolRevMTD = CURRENT.toolingRevenue;

  // Derived KPIs
  const ytd2026 = FINANCIAL_PERIODS.filter(p => p.month.startsWith("2026"));
  const ytdRevenue = ytd2026.reduce((s, p) => s + p.revenue, 0);
  const ytdEBITDA = ytd2026.reduce((s, p) => s + p.ebitda, 0);
  const ytdGP = ytd2026.reduce((s, p) => s + p.grossProfit, 0);
  const ytdGMPct = ytdRevenue > 0 ? (ytdGP / ytdRevenue) * 100 : 0;

  const revenueChartData = MONTHS_24.map(p => ({
    name: p.label,
    Tooling: p.toolingRevenue,
    "EBITDA%": p.ebitdaPct,
  }));

  const cashData = MONTHS_12.map(p => ({
    name: p.label,
    Cash: p.cashBalance,
  }));

  const rfqData = MONTHS_12.map(p => ({
    name: p.label,
    Won: p.rfqWon,
    Lost: p.rfqLost,
  }));

  const marginData = MONTHS_12.map(p => ({
    name: p.label,
    "Tooling GM%": p.toolingGMPct,
    "EBITDA%": p.ebitdaPct,
  }));

  const criticalCount = RISK_ACTIONS.filter(r => r.severity === "CRITICAL").length;

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">

      {/* ── Alert Banner ── */}
      {!alertDismissed && criticalCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3"
        >
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <p className="text-sm text-rose-300 flex-1">
            <span className="font-semibold">{criticalCount} critical issue{criticalCount > 1 ? "s" : ""} require your attention</span>
            {" "}— overdue invoice €23,500 Faurecia, project T-2024-001 margin negative
          </p>
          <a href="/risks" className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 shrink-0">
            View all <ArrowRight className="w-3 h-3" />
          </a>
          <button onClick={() => setAlertDismissed(true)} className="text-rose-400/60 hover:text-rose-400 ml-2">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Executive Summary</h1>
          <p className="text-sm text-muted-foreground">April 2026 · YTD Jan–Apr · Rocco Tools Polska Sp. z o.o.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Live · Updated 08:00
        </div>
      </div>

      {/* ── Consolidated KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard label="Revenue MTD" value={formatCurrency(CURRENT.revenue)} trend={delta(CURRENT.revenue, PREV.revenue)} subtitle="Apr 2026" color="indigo" icon={DollarSign} />
        <KpiCard label="Revenue YTD" value={formatCurrency(ytdRevenue)} subtitle="Jan–Apr vs target" color="indigo" />
        <KpiCard label="Gross Margin" value={formatPct(CURRENT.gmPct)} trend={delta(CURRENT.gmPct, PREV.gmPct)} subtitle="Tooling" color="emerald" />
        <KpiCard label="EBITDA%" value={formatPct(CURRENT.ebitdaPct)} trend={delta(CURRENT.ebitdaPct, PREV.ebitdaPct)} subtitle="YTD avg" color="amber" />
        <KpiCard label="Cash Balance" value={formatCurrency(CURRENT.cashBalance)} trend={delta(CURRENT.cashBalance, PREV.cashBalance)} color="cyan" />
        <KpiCard label="AR Overdue" value={formatCurrency(Math.abs(overdueTotal))} subtitle={`${overdueItems.length} invoices`} color="rose" icon={AlertTriangle} />
      </div>

      {/* ── Tooling Business KPIs ── */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center">
            <Wrench className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-semibold">Tooling Business</p>
            <p className="text-xs text-muted-foreground">Project-based revenue</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Revenue MTD", value: formatCurrency(toolRevMTD), trend: delta(CURRENT.toolingRevenue, PREV.toolingRevenue) },
            { label: "Gross Margin", value: formatPct(CURRENT.toolingGMPct), trend: delta(CURRENT.toolingGMPct, PREV.toolingGMPct) },
            { label: "EBITDA%", value: formatPct(CURRENT.toolingEBITDAPct), trend: delta(CURRENT.toolingEBITDAPct, PREV.toolingEBITDAPct) },
            { label: "Active Projects", value: `${activeProjects.length}`, sub: `${highRiskProjects.length} high risk` },
          ].map(k => (
            <div key={k.label} className="bg-indigo-500/5 border border-indigo-500/10 rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{k.label}</p>
              <p className="text-lg font-bold mt-1">{k.value}</p>
              {k.trend !== undefined ? (
                <span className={cn("text-xs flex items-center gap-0.5 mt-0.5", k.trend >= 0 ? "text-emerald-400" : "text-rose-400")}>
                  {k.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {k.trend >= 0 ? "+" : ""}{k.trend.toFixed(1)}% MoM
                </span>
              ) : (
                <p className="text-xs text-muted-foreground mt-0.5">{k.sub}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Charts Row 1 ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue + EBITDA Trend */}
        <div className="xl:col-span-2 rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold mb-1">Revenue & EBITDA Trend</p>
          <p className="text-xs text-muted-foreground mb-4">24-month · Tooling Revenue · EBITDA % overlay</p>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={revenueChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false}
                interval={3} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false}
                tickFormatter={v => `€${(v / 1000).toFixed(0)}k`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} domain={[0, 30]} />
              <RTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="left" dataKey="Tooling" fill={CHART_COLORS.tooling} radius={[3, 3, 0, 0]} opacity={0.9} />
              <Line yAxisId="right" type="monotone" dataKey="EBITDA%" stroke={CHART_COLORS.ebitda} strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Cash Balance */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold mb-1">Cash Balance</p>
          <p className="text-xs text-muted-foreground mb-4">12-month trend</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={cashData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.cash} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.cash} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={2} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false}
                tickFormatter={v => `€${(v / 1000000).toFixed(1)}M`} />
              <RTooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Cash" stroke={CHART_COLORS.cash} strokeWidth={2} fill="url(#cashGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Charts Row 2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quote Win/Loss */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold mb-1">Quote Win/Loss Trend</p>
          <p className="text-xs text-muted-foreground mb-4">12-month · tooling project quotes</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={rfqData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={1} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <RTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Won" fill={CHART_COLORS.won} radius={[3, 3, 0, 0]} />
              <Bar dataKey="Lost" fill={CHART_COLORS.lost} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Margin Trend */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold mb-1">Margin Trend</p>
          <p className="text-xs text-muted-foreground mb-4">12-month · GM% + EBITDA%</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={marginData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={1} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} domain={[0, 50]} />
              <RTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="Tooling GM%" stroke={CHART_COLORS.tooling} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="EBITDA%" stroke={CHART_COLORS.ebitda} strokeWidth={2} dot={false} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Bottom Widgets ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Critical Projects */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold">Critical Projects</p>
            <a href="/tooling" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              All <ArrowRight className="w-3 h-3" />
            </a>
          </div>
          <div className="space-y-3">
            {highRiskProjects.slice(0, 3).map(p => {
              const margin = ((p.quotedRevenue - p.estimatedFinalCost) / (p.quotedRevenue || 1)) * 100;
              return (
                <div key={p.id} className="flex items-start gap-3 p-3 bg-rose-500/5 border border-rose-500/10 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-rose-400 mt-1 shrink-0 animate-pulse" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{p.toolNo} – {p.description}</p>
                    <p className="text-[10px] text-muted-foreground">{p.customer} · {p.completionPct}% complete</p>
                    <p className={cn("text-[10px] font-medium mt-0.5", margin < 0 ? "text-rose-400" : "text-amber-400")}>
                      Margin: {margin.toFixed(1)}% · EFC {formatCurrency(p.estimatedFinalCost)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CEO Alerts */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold">CEO Alerts</p>
            <a href="/risks" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              All risks <ArrowRight className="w-3 h-3" />
            </a>
          </div>
          <div className="space-y-2">
            {CEO_ALERTS.slice(0, 5).map(alert => {
              const col = alert.type === "CRITICAL" ? "rose" : alert.type === "WARNING" ? "amber" : alert.type === "POSITIVE" ? "emerald" : "blue";
              const colMap: Record<string, string> = {
                rose: "text-rose-400 bg-rose-500/10 border-rose-500/20",
                amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
                emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
              };
              return (
                <div key={alert.id} className={cn("flex gap-2.5 p-2.5 rounded-lg border", colMap[col])}>
                  <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                    col === "rose" ? "bg-rose-400" : col === "amber" ? "bg-amber-400" : col === "emerald" ? "bg-emerald-400" : "bg-blue-400"
                  )} />
                  <div>
                    <p className="text-[11px] font-semibold">{alert.title}</p>
                    <p className="text-[10px] opacity-75 mt-0.5">{alert.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Overdue Invoices */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold">Overdue AR</p>
            <span className="text-xs text-rose-400 font-medium">{formatCurrency(Math.abs(overdueTotal))}</span>
          </div>
          <div className="space-y-2">
            {overdueItems.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-2.5 bg-rose-500/5 border border-rose-500/10 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium truncate">{item.customer}</p>
                  <p className="text-[10px] text-muted-foreground">{item.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-rose-400">{formatCurrency(item.amount)}</p>
                  <p className="text-[10px] text-muted-foreground">{item.daysOverdue}d late</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
