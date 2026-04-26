"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, FlaskConical, AlertTriangle, Plus, Pencil, Trash2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn, formatCurrency, formatPct } from "@/lib/utils";
import { INJECTION_RFQS, FINANCIAL_PERIODS, MATERIALS, CASH_FLOW_ITEMS } from "@/data/seed-data";
import { useData } from "@/context/data-context";
import { InjectionPartForm } from "@/components/forms/injection-part-form";
import type { InjectionPart, InjectionSegment } from "@/types";

const SEG_COLORS: Record<InjectionSegment, string> = {
  AUTOMOTIVE: "#6366f1",
  INDUSTRIAL: "#10b981",
  HVAC: "#06b6d4",
  MEDICAL: "#f59e0b",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg shadow-xl p-3 text-xs min-w-[140px]">
      <p className="font-semibold mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-3">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-medium">{typeof p.value === "number" && p.value > 100 ? formatCurrency(p.value) : `${typeof p.value === "number" ? p.value.toFixed(1) : p.value}${p.name.includes("%") || p.unit === "%" ? "%" : ""}`}</span>
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
    green: "bg-emerald-500/5 border-emerald-500/15",
    amber: "bg-amber-500/5 border-amber-500/15",
    rose: "bg-rose-500/5 border-rose-500/15",
    indigo: "bg-indigo-500/5 border-indigo-500/15",
    cyan: "bg-cyan-500/5 border-cyan-500/15",
  };
  return (
    <div className={cn("rounded-xl border p-4", bg[color] ?? bg.default)}>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
      {trend !== undefined ? (
        <span className={cn("text-xs flex items-center gap-0.5 mt-1", trend >= 0 ? "text-emerald-400" : "text-rose-400")}>
          {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend >= 0 ? "+" : ""}{trend.toFixed(1)}% MoM
        </span>
      ) : sub ? <p className="text-[10px] text-muted-foreground mt-1">{sub}</p> : null}
    </div>
  );
}

export default function InjectionBusinessPage() {
  const [partFormOpen, setPartFormOpen] = useState(false);
  const [editPart, setEditPart] = useState<InjectionPart | undefined>(undefined);
  const { injectionParts: INJECTION_PARTS, deleteInjectionPart } = useData();

  function handleEditPart(p: InjectionPart) { setEditPart(p); setPartFormOpen(true); }
  function handleDeletePart(id: string) {
    if (confirm("Usunąć tę część?")) deleteInjectionPart(id);
  }
  function handleAddPart() { setEditPart(undefined); setPartFormOpen(true); }

  const activeParts = INJECTION_PARTS.filter(p => p.status === "ACTIVE" || p.status === "RAMPING");

  // Segment aggregation
  const segments: InjectionSegment[] = ["AUTOMOTIVE", "INDUSTRIAL", "HVAC", "MEDICAL"];
  const segData = segments.map(seg => {
    const parts = INJECTION_PARTS.filter(p => p.segment === seg);
    const rev = parts.reduce((s, p) => s + p.annualRevenue, 0);
    const gp = parts.reduce((s, p) => s + p.annualGrossProfit, 0);
    const avgOEE = parts.length > 0 ? parts.reduce((s, p) => s + p.oee, 0) / parts.length : 0;
    return { seg, parts: parts.length, revenue: rev, gp, gmpct: rev > 0 ? (gp / rev) * 100 : 0, oee: avgOEE };
  });

  const totalRevenue = activeParts.reduce((s, p) => s + p.annualRevenue, 0);
  const totalGP = activeParts.reduce((s, p) => s + p.annualGrossProfit, 0);
  const avgGMPct = totalRevenue > 0 ? (totalGP / totalRevenue) * 100 : 0;
  const avgOEE = activeParts.reduce((s, p) => s + p.oee, 0) / activeParts.length;
  const avgScrap = activeParts.reduce((s, p) => s + p.scrapPct, 0) / activeParts.length;

  // RFQ KPIs
  const wonRFQs = INJECTION_RFQS.filter(r => r.status === "WON");
  const lostRFQs = INJECTION_RFQS.filter(r => r.status === "LOST");
  const winRate = (wonRFQs.length + lostRFQs.length) > 0
    ? (wonRFQs.length / (wonRFQs.length + lostRFQs.length)) * 100 : 0;
  const pipelineValue = INJECTION_RFQS.reduce((s, r) => s + r.annualRevenuePotential, 0);

  // OEE trend (simulate from financial periods)
  const oeeData = FINANCIAL_PERIODS.slice(-12).map((p, i) => ({
    name: p.label,
    OEE: 83 + Math.sin(i * 0.7) * 4 + (i * 0.2),
    Scrap: 2.4 - (i * 0.05) + Math.cos(i * 0.5) * 0.3,
  }));

  // Pie data for segment revenue
  const pieData = segData.filter(s => s.revenue > 0).map(s => ({
    name: s.seg,
    value: s.revenue,
  }));

  // Material price data
  const matData = MATERIALS.map(m => ({
    name: m.code,
    Price: m.pricePerKg,
    "Trend%": m.trend,
  }));

  // Customer profitability
  const customerMap = new Map<string, { revenue: number; gp: number }>();
  INJECTION_PARTS.forEach(p => {
    const existing = customerMap.get(p.customer) ?? { revenue: 0, gp: 0 };
    customerMap.set(p.customer, {
      revenue: existing.revenue + p.annualRevenue,
      gp: existing.gp + p.annualGrossProfit,
    });
  });
  const customerProfit = Array.from(customerMap.entries())
    .map(([customer, data]) => ({
      customer,
      revenue: data.revenue,
      gp: data.gp,
      gmPct: (data.gp / data.revenue) * 100,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // AR for injection
  const injectionAR = CASH_FLOW_ITEMS.filter(c => c.category === "Injection Invoice");
  const overdueAR = injectionAR.filter(c => c.status === "OVERDUE");

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <InjectionPartForm open={partFormOpen} onClose={() => setPartFormOpen(false)} part={editPart} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-emerald-400" /> Injection Molding
          </h1>
          <p className="text-sm text-muted-foreground">Serial production · {activeParts.length} active parts · April 2026</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={handleAddPart}>
          <Plus className="w-3.5 h-3.5" /> Dodaj część
        </Button>
      </div>

      <Tabs defaultValue="commercial" className="w-full">
        <TabsList className="bg-card border border-border w-full justify-start mb-6 p-1 h-auto flex-wrap gap-1">
          {[
            { value: "commercial", label: "A · Commercial" },
            { value: "pricing", label: "B · Pricing" },
            { value: "operations", label: "C · Operations" },
            { value: "quality", label: "D · Quality" },
            { value: "cashflow", label: "E · Cash Flow" },
            { value: "customers", label: "F · Customer P&L" },
          ].map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-xs px-3 py-1.5">{t.label}</TabsTrigger>
          ))}
        </TabsList>

        {/* ── A: COMMERCIAL ── */}
        <TabsContent value="commercial" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiTile label="Annual Revenue" value={formatCurrency(totalRevenue)} sub="All active parts" color="indigo" />
            <KpiTile label="Gross Margin" value={formatPct(avgGMPct)} sub="All parts weighted avg" color="green" />
            <KpiTile label="RFQ Win Rate" value={`${winRate.toFixed(1)}%`} sub={`${wonRFQs.length}W / ${lostRFQs.length}L`} color={winRate >= 60 ? "green" : "amber"} />
            <KpiTile label="Pipeline Value" value={formatCurrency(pipelineValue)} sub="Annual revenue potential" color="cyan" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Segment revenue pie */}
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold mb-4">Revenue by Segment</p>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={SEG_COLORS[entry.name as InjectionSegment]} />
                      ))}
                    </Pie>
                    <RTooltip formatter={(val: number) => formatCurrency(val)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {segData.filter(s => s.revenue > 0).map(s => (
                    <div key={s.seg}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="flex items-center gap-2 text-xs">
                          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: SEG_COLORS[s.seg] }} />
                          {s.seg}
                        </span>
                        <span className="text-xs font-semibold">{formatCurrency(s.revenue)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={(s.revenue / totalRevenue) * 100} className="h-1 flex-1" />
                        <span className="text-[10px] text-muted-foreground w-10 text-right">{((s.revenue / totalRevenue) * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RFQ Pipeline */}
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold mb-4">Injection RFQ Pipeline</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      {["Customer", "Part", "Segment", "Vol/yr", "Price", "Status"].map(h => (
                        <th key={h} className="text-left py-2 px-2 text-muted-foreground font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {INJECTION_RFQS.map(r => {
                      const statusCol: Record<string, string> = {
                        WON: "bg-emerald-500/10 text-emerald-400",
                        LOST: "bg-rose-500/10 text-rose-400",
                        SENT: "bg-indigo-500/10 text-indigo-400",
                        NEGOTIATION: "bg-amber-500/10 text-amber-400",
                        COSTING: "bg-slate-500/10 text-slate-400",
                        NEW: "bg-slate-500/10 text-slate-400",
                        WAITING_FOR_SUPPLIER: "bg-slate-500/10 text-slate-400",
                      };
                      return (
                        <tr key={r.id} className="border-b border-border/50 hover:bg-accent/20">
                          <td className="py-2 px-2 font-medium">{r.customer}</td>
                          <td className="py-2 px-2 text-muted-foreground max-w-[120px] truncate">{r.partName}</td>
                          <td className="py-2 px-2">
                            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: SEG_COLORS[r.segment] + "20", color: SEG_COLORS[r.segment] }}>
                              {r.segment}
                            </span>
                          </td>
                          <td className="py-2 px-2 tabular-nums">{(r.annualVolume / 1000).toFixed(0)}k</td>
                          <td className="py-2 px-2 tabular-nums font-semibold">€{r.quotedUnitPrice.toFixed(2)}</td>
                          <td className="py-2 px-2">
                            <span className={cn("text-[10px] px-2 py-0.5 rounded-full", statusCol[r.status])}>{r.status}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── B: PRICING ── */}
        <TabsContent value="pricing" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiTile label="Active Parts" value={`${activeParts.length}`} sub="Serial production" color="indigo" />
            <KpiTile label="Avg Margin" value={formatPct(avgGMPct)} sub="Weighted by revenue" color="green" />
            <KpiTile label="ABS Price +8%" value="ALERT" sub="BASF – June 2026" color="rose" />
            <KpiTile label="Price Reviews Due" value="6 parts" sub="Next 90 days" color="amber" />
          </div>

          {/* Material prices */}
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold mb-4">Resin Price Index</p>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {MATERIALS.map(m => {
                const isUp = m.trend > 0;
                const isAlert = m.trend > 5;
                return (
                  <div key={m.code} className={cn("rounded-lg border p-3",
                    isAlert ? "border-rose-500/20 bg-rose-500/5" : "border-border bg-card")}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">{m.code}</span>
                      <span className={cn("text-[10px] font-semibold flex items-center gap-0.5",
                        isUp ? "text-rose-400" : "text-emerald-400")}>
                        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isUp ? "+" : ""}{m.trend}%
                      </span>
                    </div>
                    <p className="text-lg font-bold">€{m.pricePerKg.toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground">{m.name.split("(")[0]}</p>
                    <p className="text-[10px] text-muted-foreground">{m.supplier}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Parts profitability table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <p className="text-sm font-semibold">Part-Level Profitability</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    {["Part No", "Description", "Customer", "Seg", "Vol/yr", "Unit Price", "Mat%", "Mach%", "GM%", "Annual GP", "Status", ""].map(h => (
                      <th key={h} className="text-left py-2.5 px-3 text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {INJECTION_PARTS.sort((a, b) => b.annualRevenue - a.annualRevenue).map(p => {
                    const matPct = (p.materialCostPerPart / p.unitPrice) * 100;
                    const machPct = (p.machineCostPerPart / p.unitPrice) * 100;
                    return (
                      <tr key={p.id} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-[11px]">{p.partNo}</td>
                        <td className="py-2.5 px-3 max-w-[160px] truncate">{p.description}</td>
                        <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">{p.customer}</td>
                        <td className="py-2.5 px-3">
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                            style={{ background: SEG_COLORS[p.segment] + "20", color: SEG_COLORS[p.segment] }}>
                            {p.segment.slice(0, 3)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 tabular-nums">{(p.annualVolume / 1000).toFixed(0)}k</td>
                        <td className="py-2.5 px-3 tabular-nums font-semibold">€{p.unitPrice.toFixed(3)}</td>
                        <td className={cn("py-2.5 px-3 tabular-nums", matPct > 30 ? "text-amber-400" : "text-muted-foreground")}>
                          {matPct.toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-3 tabular-nums text-muted-foreground">{machPct.toFixed(1)}%</td>
                        <td className={cn("py-2.5 px-3 tabular-nums font-bold",
                          p.marginPct >= 20 ? "text-emerald-400" : p.marginPct >= 15 ? "text-amber-400" : "text-rose-400")}>
                          {p.marginPct.toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-3 tabular-nums font-semibold">{formatCurrency(p.annualGrossProfit)}</td>
                        <td className="py-2.5 px-3">
                          <Badge variant="outline" className="text-[10px]">{p.status}</Badge>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-60 hover:opacity-100" onClick={() => handleEditPart(p)}>
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-60 hover:opacity-100 text-rose-400 hover:text-rose-300" onClick={() => handleDeletePart(p.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
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

        {/* ── C: OPERATIONS ── */}
        <TabsContent value="operations" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiTile label="Avg OEE" value={`${avgOEE.toFixed(1)}%`} sub="All injection lines" color={avgOEE >= 85 ? "green" : avgOEE >= 75 ? "amber" : "rose"} />
            <KpiTile label="Avg Scrap Rate" value={`${avgScrap.toFixed(2)}%`} sub="Weighted by volume" color={avgScrap <= 2 ? "green" : avgScrap <= 3.5 ? "amber" : "rose"} />
            <KpiTile label="OTIF" value="96.2%" sub="On-time in-full delivery" color="green" />
            <KpiTile label="Line 3 OEE" value="79.0%" sub="Below target – alert" color="rose" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold mb-1">OEE & Scrap Trend</p>
              <p className="text-xs text-muted-foreground mb-4">12-month rolling average</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={oeeData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={2} />
                  <YAxis yAxisId="l" domain={[75, 95]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                  <YAxis yAxisId="r" orientation="right" domain={[0, 5]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                  <RTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line yAxisId="l" type="monotone" dataKey="OEE" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line yAxisId="r" type="monotone" dataKey="Scrap" stroke="#f43f5e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Per-part OEE */}
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold mb-4">OEE by Part (Top 10)</p>
              <div className="space-y-2">
                {INJECTION_PARTS.sort((a, b) => a.oee - b.oee).slice(0, 10).map(p => {
                  const oeeColor = p.oee >= 88 ? "bg-emerald-500" : p.oee >= 80 ? "bg-amber-500" : "bg-rose-500";
                  return (
                    <div key={p.id} className="flex items-center gap-3">
                      <p className="text-[10px] text-muted-foreground w-20 shrink-0 truncate">{p.partNo}</p>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] truncate">{p.description}</span>
                          <span className={cn("text-[10px] font-semibold ml-2 shrink-0",
                            p.oee >= 88 ? "text-emerald-400" : p.oee >= 80 ? "text-amber-400" : "text-rose-400")}>
                            {p.oee}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full", oeeColor)} style={{ width: `${p.oee}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── D: QUALITY ── */}
        <TabsContent value="quality" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiTile label="Avg PPM" value="312" sub="Parts per million defects" color="amber" />
            <KpiTile label="Open Claims" value="3" sub="From injection production" color="rose" />
            <KpiTile label="COPQ" value={formatCurrency(28400)} sub="Cost of poor quality YTD" color="amber" />
            <KpiTile label="Internal Rejects" value="1.82%" sub="Avg scrap rate" color={avgScrap <= 2 ? "green" : "amber"} />
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold mb-4">Scrap Rate by Part</p>
            <div className="space-y-2.5">
              {INJECTION_PARTS.sort((a, b) => b.scrapPct - a.scrapPct).slice(0, 12).map(p => {
                const scrapColor = p.scrapPct <= 1.5 ? "bg-emerald-500" : p.scrapPct <= 2.5 ? "bg-amber-500" : "bg-rose-500";
                return (
                  <div key={p.id} className="flex items-center gap-3">
                    <p className="text-[10px] text-muted-foreground w-28 shrink-0 truncate">{p.partNo}</p>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", scrapColor)} style={{ width: `${Math.min(p.scrapPct / 5 * 100, 100)}%` }} />
                      </div>
                      <span className={cn("text-xs font-semibold w-12 text-right",
                        p.scrapPct <= 1.5 ? "text-emerald-400" : p.scrapPct <= 2.5 ? "text-amber-400" : "text-rose-400")}>
                        {p.scrapPct.toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground w-32 shrink-0 truncate">{p.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* ── E: CASH FLOW ── */}
        <TabsContent value="cashflow" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiTile label="AR Overdue" value={formatCurrency(overdueAR.reduce((s, c) => s + c.amount, 0))} sub={`${overdueAR.length} invoices`} color="rose" />
            <KpiTile label="Avg DSO" value="52 days" sub="Days Sales Outstanding" color="amber" />
            <KpiTile label="Inventory Value" value={formatCurrency(185000)} sub="Raw materials + WIP" color="default" />
            <KpiTile label="Stock Turns" value="8.2×" sub="Annual inventory turns" color="green" />
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <p className="text-sm font-semibold">AR Status – Injection Production</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    {["Description", "Customer", "Amount", "Due Date", "Days Overdue", "Status"].map(h => (
                      <th key={h} className="text-left py-2.5 px-3 text-muted-foreground font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CASH_FLOW_ITEMS.filter(c => c.type === "INFLOW").map(item => {
                    const statusCol: Record<string, string> = {
                      OVERDUE: "bg-rose-500/10 text-rose-400",
                      CONFIRMED: "bg-emerald-500/10 text-emerald-400",
                      ISSUED: "bg-indigo-500/10 text-indigo-400",
                      PLANNED: "bg-slate-500/10 text-slate-400",
                    };
                    return (
                      <tr key={item.id} className={cn("border-b border-border/50 hover:bg-accent/20",
                        item.status === "OVERDUE" && "bg-rose-500/3")}>
                        <td className="py-2.5 px-3 max-w-[200px] truncate">{item.description}</td>
                        <td className="py-2.5 px-3 font-medium">{item.customer}</td>
                        <td className="py-2.5 px-3 tabular-nums font-semibold text-emerald-400">{formatCurrency(item.amount)}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{item.dueDate}</td>
                        <td className={cn("py-2.5 px-3 font-semibold", item.daysOverdue ? "text-rose-400" : "text-muted-foreground")}>
                          {item.daysOverdue ? `${item.daysOverdue}d` : "—"}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={cn("text-[10px] px-2 py-0.5 rounded-full", statusCol[item.status])}>{item.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ── F: CUSTOMER P&L ── */}
        <TabsContent value="customers" className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold mb-1">Customer Profitability – Injection Molding</p>
            <p className="text-xs text-muted-foreground mb-4">Annual revenue & gross margin by customer</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    {["Customer", "Active Parts", "Annual Revenue", "Gross Profit", "GM%", "Margin Bar"].map(h => (
                      <th key={h} className="text-left py-2.5 px-3 text-muted-foreground font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customerProfit.map((c, i) => {
                    const parts = INJECTION_PARTS.filter(p => p.customer === c.customer).length;
                    const gmColor = c.gmPct >= 22 ? "text-emerald-400" : c.gmPct >= 18 ? "text-amber-400" : "text-rose-400";
                    const barColor = c.gmPct >= 22 ? "bg-emerald-500" : c.gmPct >= 18 ? "bg-amber-500" : "bg-rose-500";
                    return (
                      <tr key={c.customer} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
                        <td className="py-2.5 px-3 font-semibold">{c.customer}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{parts}</td>
                        <td className="py-2.5 px-3 tabular-nums font-semibold">{formatCurrency(c.revenue)}</td>
                        <td className="py-2.5 px-3 tabular-nums font-semibold text-emerald-400">{formatCurrency(c.gp)}</td>
                        <td className={cn("py-2.5 px-3 tabular-nums font-bold", gmColor)}>{c.gmPct.toFixed(1)}%</td>
                        <td className="py-2.5 px-3 w-32">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div className={cn("h-full rounded-full", barColor)} style={{ width: `${c.gmPct / 30 * 100}%` }} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold mb-4">Revenue by Customer</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={customerProfit.slice(0, 8)} layout="vertical" margin={{ top: 0, right: 40, left: 100, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={v => `€${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="customer" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={90} />
                <RTooltip formatter={(val: number) => formatCurrency(val)} />
                <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[0, 3, 3, 0]} />
                <Bar dataKey="gp" name="Gross Profit" fill="#10b981" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
