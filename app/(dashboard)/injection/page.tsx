"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, ComposedChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock,
  Factory, Plus, Wrench,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn, formatCurrency } from "@/lib/utils";
import {
  INJECTION_PARTS, INJECTION_PRESSES, PRODUCTION_ORDERS,
  FINANCIAL_PERIODS, CUSTOMERS, getCustomerById,
} from "@/data/seed-data";
import { useSort, SortHead } from "@/hooks/use-sort";

const MAT_COLOR: Record<string, string> = {
  PP: "bg-sky-500/10 text-sky-400",
  "PP+GF30": "bg-blue-500/10 text-blue-400",
  PA66: "bg-violet-500/10 text-violet-400",
  PA6: "bg-purple-500/10 text-purple-400",
  ABS: "bg-amber-500/10 text-amber-400",
  PC: "bg-orange-500/10 text-orange-400",
  POM: "bg-emerald-500/10 text-emerald-400",
  PBT: "bg-teal-500/10 text-teal-400",
  PE: "bg-cyan-500/10 text-cyan-400",
  TPE: "bg-rose-500/10 text-rose-400",
};

const STATUS_COLOR: Record<string, string> = {
  ACTIVE:     "bg-emerald-500/10 text-emerald-400",
  NPI:        "bg-indigo-500/10 text-indigo-400",
  PHASE_OUT:  "bg-amber-500/10 text-amber-400",
  OBSOLETE:   "bg-slate-500/10 text-slate-400",
};

const ORDER_COLOR: Record<string, string> = {
  RUNNING:   "bg-emerald-500/10 text-emerald-400",
  PLANNED:   "bg-indigo-500/10 text-indigo-400",
  COMPLETED: "bg-slate-500/10 text-slate-400",
  ON_HOLD:   "bg-amber-500/10 text-amber-400",
  CANCELLED: "bg-rose-500/10 text-rose-400",
};

const PRESS_STATUS_COLOR: Record<string, string> = {
  RUNNING:     "text-emerald-400",
  IDLE:        "text-amber-400",
  MAINTENANCE: "text-orange-400",
  BREAKDOWN:   "text-rose-400",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg shadow-xl p-3 text-xs min-w-[140px]">
      <p className="font-semibold mb-2 text-foreground">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-3">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-medium text-foreground">
            {p.name.includes("%") || p.name === "OEE" || p.name === "Scrap%" ? `${p.value}%` : p.value.toLocaleString("de-DE")}
          </span>
        </div>
      ))}
    </div>
  );
};

function KpiTile({ label, value, sub, trend, color = "default" }: {
  label: string; value: string; sub?: string; trend?: number; color?: string;
}) {
  const bg: Record<string, string> = {
    default: "bg-card border-border",
    green:   "bg-emerald-500/5 border-emerald-500/15",
    amber:   "bg-amber-500/5 border-amber-500/15",
    rose:    "bg-rose-500/5 border-rose-500/15",
    indigo:  "bg-indigo-500/5 border-indigo-500/15",
    cyan:    "bg-cyan-500/5 border-cyan-500/15",
  };
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-xl border p-4", bg[color] ?? bg.default)}>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
      {trend !== undefined ? (
        <span className={cn("text-xs flex items-center gap-0.5 mt-1", trend >= 0 ? "text-emerald-400" : "text-rose-400")}>
          {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend >= 0 ? "+" : ""}{trend.toFixed(1)} pp MoM
        </span>
      ) : sub ? (
        <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>
      ) : null}
    </motion.div>
  );
}

export default function InjectionPage() {
  const [activeTab, setActiveTab] = useState("production");

  // ── Aggregated KPIs ──
  const runningOrders = PRODUCTION_ORDERS.filter(o => o.status === "RUNNING");
  const avgOEE = runningOrders.length > 0
    ? runningOrders.reduce((s, o) => s + o.oee, 0) / runningOrders.length : 0;
  const totalActual = PRODUCTION_ORDERS
    .filter(o => o.status === "RUNNING" || o.status === "COMPLETED")
    .reduce((s, o) => s + o.actualQty, 0);
  const totalScrap = PRODUCTION_ORDERS
    .filter(o => o.status === "RUNNING" || o.status === "COMPLETED")
    .reduce((s, o) => s + o.scrapQty, 0);
  const scrapRate = totalActual > 0 ? (totalScrap / totalActual) * 100 : 0;
  const pressesRunning = INJECTION_PRESSES.filter(p => p.status === "RUNNING").length;
  const avgUtilization = INJECTION_PRESSES.reduce((s, p) => s + p.utilizationPct, 0) / INJECTION_PRESSES.length;

  // ── Serial revenue KPI ──
  const totalSerialRevPA = INJECTION_PARTS
    .filter(p => p.status === "ACTIVE")
    .reduce((s, p) => s + p.pricePerPiece * p.annualVolume, 0);

  // ── OEE chart data ──
  const oeeChartData = INJECTION_PRESSES.map(p => ({
    name: p.name.split("–")[0].trim(),
    OEE: p.oee,
    Utilization: p.utilizationPct,
  }));

  // ── Scrap by part (active running orders) ──
  const scrapByPart = runningOrders.map(o => {
    const part = INJECTION_PARTS.find(p => p.id === o.partId);
    const scrapPct = o.actualQty > 0 ? (o.scrapQty / o.actualQty) * 100 : 0;
    return { name: part?.partNo ?? o.partId, scrapPct: +scrapPct.toFixed(2), part };
  }).sort((a, b) => b.scrapPct - a.scrapPct);

  // ── Injection revenue trend ──
  const revTrend = FINANCIAL_PERIODS.slice(-12).map(fp => ({
    name: fp.label,
    Revenue: Math.round(fp.revenue * 0.38), // ~38% injection share
    "OEE": 82 + Math.round(Math.random() * 8),
  }));

  // ── Material breakdown ──
  const matMap = new Map<string, { parts: number; annualVol: number; revenue: number }>();
  INJECTION_PARTS.forEach(p => {
    const ex = matMap.get(p.material) ?? { parts: 0, annualVol: 0, revenue: 0 };
    matMap.set(p.material, {
      parts: ex.parts + 1,
      annualVol: ex.annualVol + p.annualVolume,
      revenue: ex.revenue + p.pricePerPiece * p.annualVolume,
    });
  });
  const matBreakdown = Array.from(matMap.entries())
    .map(([mat, d]) => ({ mat, ...d }))
    .sort((a, b) => b.revenue - a.revenue);

  // ── Sort hooks ──
  const partsSort = useSort();
  const ordersSort = useSort();
  const sortedParts = partsSort.apply(INJECTION_PARTS, {
    "Part No": p => p.partNo,
    Description: p => p.description,
    Customer: p => getCustomerById(p.customerId)?.shortName ?? "",
    Material: p => p.material,
    "Weight (g)": p => p.weightGrams,
    "Cycle (s)": p => p.cycleTimeSec,
    Cavities: p => p.cavities,
    "Annual Vol.": p => p.annualVolume,
    "Price/pc": p => p.pricePerPiece,
    Status: p => p.status,
  });
  const sortedOrders = ordersSort.apply(PRODUCTION_ORDERS, {
    "Order No": o => o.orderNo,
    Part: o => INJECTION_PARTS.find(p => p.id === o.partId)?.partNo ?? "",
    Press: o => o.pressId,
    "Planned Qty": o => o.plannedQty,
    "Actual Qty": o => o.actualQty,
    "Scrap Qty": o => o.scrapQty,
    OEE: o => o.oee,
    Status: o => o.status,
  });

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Factory className="w-6 h-6 text-indigo-400" /> Injection Business
          </h1>
          <p className="text-sm text-muted-foreground">Serial production · {pressesRunning} presses active · April 2026</p>
        </div>
        {scrapRate > 2.5 && (
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-amber-400 font-medium">Scrap rate elevated: {scrapRate.toFixed(1)}%</span>
          </div>
        )}
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KpiTile label="Active Parts"        value={`${INJECTION_PARTS.filter(p => p.status === "ACTIVE").length}`} sub="In serial production" color="indigo" />
        <KpiTile label="Serial Rev. PA"      value={formatCurrency(totalSerialRevPA)} sub="Annual run rate" color="green" />
        <KpiTile label="Avg OEE"             value={`${avgOEE.toFixed(1)}%`} sub="Running presses" color={avgOEE >= 85 ? "green" : avgOEE >= 75 ? "amber" : "rose"} />
        <KpiTile label="Scrap Rate"          value={`${scrapRate.toFixed(2)}%`} sub="MTD all orders" color={scrapRate <= 2.0 ? "green" : scrapRate <= 3.5 ? "amber" : "rose"} />
        <KpiTile label="Press Utilization"   value={`${avgUtilization.toFixed(1)}%`} sub={`${pressesRunning}/${INJECTION_PRESSES.length} running`} color="cyan" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-card border border-border w-full justify-start mb-6 p-1 h-auto flex-wrap gap-1">
          {[
            { value: "production", label: "A · Production" },
            { value: "parts",      label: "B · Parts Library" },
            { value: "quality",    label: "C · Quality" },
            { value: "capacity",   label: "D · Capacity" },
            { value: "materials",  label: "E · Materials" },
          ].map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-xs px-3 py-1.5">{t.label}</TabsTrigger>
          ))}
        </TabsList>

        {/* ── A: PRODUCTION ── */}
        <TabsContent value="production" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold mb-1">Revenue & OEE Trend</p>
              <p className="text-xs text-muted-foreground mb-4">12-month injection production</p>
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={revTrend} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={2} />
                  <YAxis yAxisId="l" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={v => `€${(v / 1000).toFixed(0)}k`} />
                  <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} domain={[70, 100]} />
                  <RTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar yAxisId="l" dataKey="Revenue" fill="#6366f1" radius={[3, 3, 0, 0]} opacity={0.85} />
                  <Line yAxisId="r" type="monotone" dataKey="OEE" stroke="#10b981" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold mb-4">Press Status Overview</p>
              <div className="space-y-3">
                {INJECTION_PRESSES.map(press => {
                  const currentPart = INJECTION_PARTS.find(p => p.id === press.currentPartId);
                  const customer = currentPart ? getCustomerById(currentPart.customerId) : null;
                  return (
                    <div key={press.id} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shrink-0"
                        style={{ background: press.status === "RUNNING" ? "#10b981" : press.status === "IDLE" ? "#f59e0b" : press.status === "MAINTENANCE" ? "#f97316" : "#f43f5e" }} />
                      <div className="w-48 shrink-0">
                        <p className="text-xs font-medium truncate">{press.name}</p>
                        <p className={cn("text-[10px]", PRESS_STATUS_COLOR[press.status])}>
                          {press.status}{currentPart ? ` · ${currentPart.partNo}` : ""}
                          {customer ? ` · ${customer.shortName}` : ""}
                        </p>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                          <span>Utilization</span>
                          <span>{press.utilizationPct}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${press.utilizationPct}%` }} />
                        </div>
                      </div>
                      <div className="w-20 text-right shrink-0">
                        <p className="text-xs font-semibold">{press.oee > 0 ? `OEE ${press.oee}%` : "—"}</p>
                        <p className="text-[10px] text-muted-foreground">{press.tonnage}T</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <p className="text-sm font-semibold">Active Production Orders</p>
              <p className="text-xs text-muted-foreground">{runningOrders.length} running · {PRODUCTION_ORDERS.filter(o => o.status === "PLANNED").length} planned</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    {(["Order No", "Part", "Press", "Planned Qty", "Actual Qty", "Scrap Qty", "OEE", "Status"] as const).map(h => (
                      <SortHead key={h} label={h} sort={ordersSort} className="text-left py-2.5 px-3 text-muted-foreground font-medium" />
                    ))}
                    <th className="py-2.5 px-3 text-left text-muted-foreground font-medium">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedOrders.map(order => {
                    const part = INJECTION_PARTS.find(p => p.id === order.partId);
                    const press = INJECTION_PRESSES.find(p => p.id === order.pressId);
                    const progress = order.plannedQty > 0 ? (order.actualQty / order.plannedQty) * 100 : 0;
                    const scrapPct = order.actualQty > 0 ? (order.scrapQty / order.actualQty) * 100 : 0;
                    return (
                      <tr key={order.id} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-semibold">{order.orderNo}</td>
                        <td className="py-2.5 px-3">
                          <p className="font-medium">{part?.partNo ?? order.partId}</p>
                          <p className="text-[10px] text-muted-foreground">{part?.description}</p>
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">{press?.name.split("–")[0].trim() ?? order.pressId}</td>
                        <td className="py-2.5 px-3 tabular-nums">{order.plannedQty.toLocaleString("de-DE")}</td>
                        <td className="py-2.5 px-3 tabular-nums font-semibold">{order.actualQty.toLocaleString("de-DE")}</td>
                        <td className={cn("py-2.5 px-3 tabular-nums", scrapPct > 3 ? "text-rose-400 font-semibold" : scrapPct > 2 ? "text-amber-400" : "text-muted-foreground")}>
                          {order.scrapQty > 0 ? `${order.scrapQty.toLocaleString("de-DE")} (${scrapPct.toFixed(1)}%)` : "—"}
                        </td>
                        <td className={cn("py-2.5 px-3 tabular-nums font-bold",
                          order.oee >= 85 ? "text-emerald-400" : order.oee >= 75 ? "text-amber-400" : order.oee > 0 ? "text-rose-400" : "text-muted-foreground")}>
                          {order.oee > 0 ? `${order.oee}%` : "—"}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={cn("text-[10px] px-2 py-0.5 rounded-full", ORDER_COLOR[order.status])}>{order.status}</span>
                        </td>
                        <td className="py-2.5 px-3 min-w-[120px]">
                          <div className="flex items-center gap-2">
                            <Progress value={Math.min(progress, 100)} className="h-1.5 flex-1" />
                            <span className="text-[10px] tabular-nums text-muted-foreground w-8">{Math.round(progress)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ── B: PARTS LIBRARY ── */}
        <TabsContent value="parts" className="space-y-4">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <p className="text-sm font-semibold">Parts Library</p>
              <div className="flex items-center gap-3">
                <p className="text-xs text-muted-foreground">{INJECTION_PARTS.length} parts · {INJECTION_PARTS.filter(p => p.status === "ACTIVE").length} active</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    {(["Part No", "Description", "Customer", "Material", "Weight (g)", "Cycle (s)", "Cavities", "Annual Vol.", "Price/pc", "Status"] as const).map(h => (
                      <SortHead key={h} label={h} sort={partsSort} className="text-left py-2.5 px-3 text-muted-foreground font-medium" />
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedParts.map(part => {
                    const customer = getCustomerById(part.customerId);
                    const hoursPerYear = (part.annualVolume / part.cavities) * (part.cycleTimeSec / 3600);
                    return (
                      <tr key={part.id} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-semibold text-indigo-400">{part.partNo}</td>
                        <td className="py-2.5 px-3 max-w-[180px]">
                          <p className="font-medium truncate">{part.description}</p>
                          {part.toolNo && <p className="text-[10px] text-muted-foreground">{part.toolNo}</p>}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-medium">{customer?.shortName ?? part.customerId}</td>
                        <td className="py-2.5 px-3">
                          <span className={cn("text-[10px] px-1.5 py-0.5 rounded", MAT_COLOR[part.material] ?? "bg-slate-500/10 text-slate-400")}>{part.material}</span>
                        </td>
                        <td className="py-2.5 px-3 tabular-nums text-right">{part.weightGrams}g</td>
                        <td className="py-2.5 px-3 tabular-nums text-right">{part.cycleTimeSec}s</td>
                        <td className="py-2.5 px-3 tabular-nums text-center">{part.cavities}</td>
                        <td className="py-2.5 px-3 tabular-nums text-right">{(part.annualVolume / 1000).toFixed(0)}k</td>
                        <td className="py-2.5 px-3 tabular-nums text-right font-semibold">€{part.pricePerPiece.toFixed(3)}</td>
                        <td className="py-2.5 px-3">
                          <span className={cn("text-[10px] px-2 py-0.5 rounded-full", STATUS_COLOR[part.status])}>{part.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ── C: QUALITY ── */}
        <TabsContent value="quality" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiTile label="Avg OEE (Running)"  value={`${avgOEE.toFixed(1)}%`}       color={avgOEE >= 85 ? "green" : "amber"} />
            <KpiTile label="MTD Scrap Rate"      value={`${scrapRate.toFixed(2)}%`}     color={scrapRate <= 2.0 ? "green" : scrapRate <= 3.5 ? "amber" : "rose"} />
            <KpiTile label="Total Scrap MTD"     value={totalScrap.toLocaleString("de-DE")} sub="pcs rejected" color="default" />
            <KpiTile label="Open Quality Claims" value="3" sub="From CLAIMS register" color="rose" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold mb-4">OEE by Press</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={oeeChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                  <RTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="OEE" fill="#6366f1" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Utilization" fill="#10b981" opacity={0.7} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold mb-4">Scrap Rate by Part (Running Orders)</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={scrapByPart} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} domain={[0, 5]} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={80} />
                  <RTooltip formatter={(v: number) => `${v.toFixed(2)}%`} />
                  <Bar dataKey="scrapPct" fill="#f59e0b" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        {/* ── D: CAPACITY ── */}
        <TabsContent value="capacity" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiTile label="Presses Running"  value={`${pressesRunning}`}                      sub={`of ${INJECTION_PRESSES.length} total`} color="indigo" />
            <KpiTile label="Avg Utilization"  value={`${avgUtilization.toFixed(1)}%`}           color={avgUtilization >= 80 ? "green" : "amber"} />
            <KpiTile label="In Maintenance"   value={`${INJECTION_PRESSES.filter(p => p.status === "MAINTENANCE").length}`} sub="presses" color="amber" />
            <KpiTile label="Available Capacity" value={`${(100 - avgUtilization).toFixed(1)}%`} sub="headroom" color="default" />
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold mb-6">Press Capacity Detail</p>
            <div className="space-y-5">
              {INJECTION_PRESSES.map(press => {
                const currentPart = INJECTION_PARTS.find(p => p.id === press.currentPartId);
                const customer = currentPart ? getCustomerById(currentPart.customerId) : null;
                const utilColor = press.utilizationPct >= 85 ? "bg-emerald-500" : press.utilizationPct >= 65 ? "bg-indigo-500" : press.utilizationPct > 0 ? "bg-amber-500" : "bg-rose-500";
                return (
                  <div key={press.id} className="grid grid-cols-[200px_1fr_auto] gap-4 items-center">
                    <div>
                      <p className="text-sm font-medium">{press.name}</p>
                      <p className={cn("text-[10px]", PRESS_STATUS_COLOR[press.status])}>
                        {press.status}
                        {currentPart && ` · ${currentPart.partNo}`}
                        {customer && ` (${customer.shortName})`}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                        <span>Utilization: {press.utilizationPct}%</span>
                        <span>{press.actualHours}h / {press.plannedHours}h</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", utilColor)}
                          style={{ width: `${press.utilizationPct}%` }} />
                      </div>
                    </div>
                    <div className="text-right w-24">
                      <p className="text-sm font-bold">{press.oee > 0 ? `${press.oee}%` : "—"}</p>
                      <p className="text-[10px] text-muted-foreground">OEE</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* ── E: MATERIALS ── */}
        <TabsContent value="materials" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold mb-4">Revenue by Material Type</p>
              <div className="space-y-3">
                {matBreakdown.map(m => {
                  const total = matBreakdown.reduce((s, x) => s + x.revenue, 0);
                  return (
                    <div key={m.mat}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-[10px] px-1.5 py-0.5 rounded", MAT_COLOR[m.mat] ?? "bg-slate-500/10 text-slate-400")}>{m.mat}</span>
                          <span className="text-xs text-muted-foreground">{m.parts} part{m.parts > 1 ? "s" : ""}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-muted-foreground">{(m.annualVol / 1000).toFixed(0)}k pcs/yr</span>
                          <span className="text-xs font-semibold">{formatCurrency(m.revenue)}</span>
                        </div>
                      </div>
                      <Progress value={total > 0 ? (m.revenue / total) * 100 : 0} className="h-1.5" />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold mb-4">Material Cost vs Revenue (per part)</p>
              <div className="space-y-2">
                {INJECTION_PARTS.filter(p => p.status === "ACTIVE").slice(0, 8).map(part => {
                  const marginPct = part.pricePerPiece > 0
                    ? ((part.pricePerPiece - part.materialCostPerPiece) / part.pricePerPiece) * 100 : 0;
                  const customer = getCustomerById(part.customerId);
                  return (
                    <div key={part.id} className="flex items-center gap-3">
                      <div className="w-32 shrink-0">
                        <p className="text-[10px] font-medium truncate">{part.partNo}</p>
                        <p className="text-[10px] text-muted-foreground">{customer?.shortName}</p>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-[10px] mb-0.5">
                          <span className="text-muted-foreground">Mat. cost: €{part.materialCostPerPiece.toFixed(3)}</span>
                          <span className={cn("font-semibold", marginPct >= 70 ? "text-emerald-400" : marginPct >= 50 ? "text-amber-400" : "text-rose-400")}>
                            {marginPct.toFixed(0)}% margin
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-rose-400/60 rounded-full"
                            style={{ width: `${Math.min((part.materialCostPerPiece / part.pricePerPiece) * 100, 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
