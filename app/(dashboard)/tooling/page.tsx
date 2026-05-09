"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock,
  ArrowUpRight, Wrench, Euro, Plus, Pencil, Trash2,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn, formatCurrency, formatPct } from "@/lib/utils";
import {
  WARRANTY_CLAIMS, MACHINES, FINANCIAL_PERIODS, PIPELINE_DEALS, getCustomerById,
} from "@/data/seed-data";
import { useData } from "@/context/data-context";
import { useSort, SortHead } from "@/hooks/use-sort";
import { ProjectForm } from "@/components/forms/project-form";
import { CashFlowForm } from "@/components/forms/cashflow-form";
import type { ToolingProject, ToolingServiceType } from "@/types";

const SERVICE_LABELS: Record<ToolingServiceType, string> = {
  NEW_TOOL: "New Tool",
  WARRANTY_REPAIR: "Warranty Repair",
  PAID_REPAIR: "Paid Repair",
  MODIFICATION_ECO: "Modification / ECO",
  CHINA_TRANSFER: "China Transfer",
  SPARE_PARTS: "Spare Parts",
};

const RISK_COLOR: Record<string, string> = {
  LOW: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  MEDIUM: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  HIGH: "bg-rose-500/15 text-rose-400 border-rose-500/20",
  CRITICAL: "bg-rose-700/20 text-rose-300 border-rose-600/30",
};

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "bg-indigo-500/15 text-indigo-400",
  COMPLETED: "bg-emerald-500/15 text-emerald-400",
  ON_HOLD: "bg-amber-500/15 text-amber-400",
  CANCELLED: "bg-slate-500/15 text-slate-400",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg shadow-xl p-3 text-xs min-w-[140px]">
      <p className="font-semibold mb-2 text-foreground">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1" style={{ color: p.color }}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-medium text-foreground">
            {p.value > 100 ? formatCurrency(p.value) : `${p.value}%`}
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
    green: "bg-emerald-500/5 border-emerald-500/15",
    amber: "bg-amber-500/5 border-amber-500/15",
    rose: "bg-rose-500/5 border-rose-500/15",
    indigo: "bg-indigo-500/5 border-indigo-500/15",
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
      ) : sub ? (
        <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>
      ) : null}
    </div>
  );
}

export default function ToolingBusinessPage() {
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editProject, setEditProject] = useState<ToolingProject | undefined>(undefined);
  const [cashFormOpen, setCashFormOpen] = useState(false);
  const { toolingProjects: TOOLING_PROJECTS, deleteToolingProject, cashFlowItems: CASH_FLOW_ITEMS, deleteCashFlowItem } = useData();

  const activeProjects = TOOLING_PROJECTS.filter(p => p.status === "ACTIVE");
  const completedProjects = TOOLING_PROJECTS.filter(p => p.status === "COMPLETED");
  const highRisk = TOOLING_PROJECTS.filter(p => p.riskLevel === "HIGH" || p.riskLevel === "CRITICAL");

  function handleEdit(p: ToolingProject) { setEditProject(p); setFormOpen(true); }
  function handleDelete(id: string) {
    if (confirm("Usunąć projekt? Tej operacji nie można cofnąć.")) deleteToolingProject(id);
  }
  function handleAddNew() { setEditProject(undefined); setFormOpen(true); }

  // Sales KPIs (from CRM pipeline)
  const wonDeals = PIPELINE_DEALS.filter(d => d.stage === "WON");
  const lostDeals = PIPELINE_DEALS.filter(d => d.stage === "LOST");
  const openDeals = PIPELINE_DEALS.filter(d => !["WON", "LOST"].includes(d.stage));
  const wonValue = wonDeals.reduce((s, d) => s + d.value, 0);
  const totalPipelineValue = openDeals.reduce((s, d) => s + d.value, 0);
  const winRate = (wonDeals.length + lostDeals.length) > 0
    ? (wonDeals.length / (wonDeals.length + lostDeals.length)) * 100 : 0;

  // Service type breakdown
  const serviceBreakdown = Object.entries(SERVICE_LABELS).map(([type, label]) => {
    const projects = TOOLING_PROJECTS.filter(p => p.serviceType === type);
    const rev = projects.reduce((s, p) => s + p.quotedRevenue, 0);
    return { type, label, count: projects.length, revenue: rev };
  }).filter(s => s.count > 0);

  // Capacity charts
  const machineData = MACHINES.map(m => ({
    name: m.name.split("–")[0].trim(),
    Utilization: m.utilizationPct,
    Efficiency: m.efficiency,
  }));

  // Cash flow - tooling invoices
  const toolingCashItems = CASH_FLOW_ITEMS.filter(c => c.category === "Tooling Invoice");
  const overdueItems = toolingCashItems.filter(c => c.status === "OVERDUE");
  const confirmedItems = toolingCashItems.filter(c => c.status === "CONFIRMED");
  const issuedItems = toolingCashItems.filter(c => c.status === "ISSUED");

  // Warranty
  const openWarranty = WARRANTY_CLAIMS.filter(w => w.status === "OPEN" || w.status === "IN_REPAIR");
  const warrantyCostTotal = WARRANTY_CLAIMS.reduce((s, w) => s + w.cost, 0);
  const warrantyRecovered = WARRANTY_CLAIMS.reduce((s, w) => s + w.recovered, 0);
  const warrantyRecoveryPct = warrantyCostTotal > 0 ? (warrantyRecovered / warrantyCostTotal) * 100 : 0;

  // Financial trend for tooling
  const toolingTrend = FINANCIAL_PERIODS.slice(-12).map(p => ({
    name: p.label,
    "Revenue": p.toolingRevenue,
    "GM%": p.toolingGMPct,
    "EBITDA%": p.toolingEBITDAPct,
  }));

  // WIP total
  const totalWip = TOOLING_PROJECTS.reduce((s, p) => s + p.wip, 0);

  const dealSort = useSort();
  const projectSort = useSort();
  const warrantySort = useSort();
  const cashSort = useSort();

  const RISK_ORDER: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  const sortedDeals = dealSort.apply(openDeals, {
    Customer: d => getCustomerById(d.customerId)?.shortName ?? d.customerId,
    Deal: d => d.title,
    Value: d => d.value,
    Probability: d => d.probability,
    Stage: d => d.stage,
    "Close Date": d => d.expectedClose,
  });
  const sortedProjects = projectSort.apply(
    TOOLING_PROJECTS.filter(p => p.status !== "CANCELLED"), {
      "Tool No": p => p.toolNo,
      Customer: p => p.customer,
      "Service Type": p => p.serviceType,
      Quoted: p => p.quotedRevenue,
      EFC: p => p.estimatedFinalCost,
      "Margin%": p => p.quotedRevenue > 0 ? (p.quotedRevenue - p.estimatedFinalCost) / p.quotedRevenue * 100 : -100,
      Complete: p => p.completionPct,
      ETA: p => p.eta,
      Risk: p => RISK_ORDER[p.riskLevel] ?? 4,
    }
  );
  const sortedWarranty = warrantySort.apply(WARRANTY_CLAIMS, {
    "Tool No": w => w.toolNo,
    Customer: w => w.customer,
    Description: w => w.description,
    "Root Cause": w => w.rootCause ?? "",
    Cost: w => w.cost,
    Recovered: w => w.recovered,
    Recoverable: w => (w.recoverable ? 1 : 0),
    Status: w => w.status,
  });
  const sortedCash = cashSort.apply(CASH_FLOW_ITEMS, {
    Description: i => i.description,
    Customer: i => i.customer,
    "Due Date": i => i.dueDate,
    Amount: i => Math.abs(i.amount),
    Type: i => i.type,
    Status: i => i.status,
  });

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <ProjectForm open={formOpen} onClose={() => setFormOpen(false)} project={editProject} />
      <CashFlowForm open={cashFormOpen} onClose={() => setCashFormOpen(false)} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Wrench className="w-6 h-6 text-indigo-400" /> Tooling Business
          </h1>
          <p className="text-sm text-muted-foreground">Project-based revenue · April 2026</p>
        </div>
        <div className="flex items-center gap-3">
          {highRisk.length > 0 && (
            <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-xs text-rose-400 font-medium">{highRisk.length} high-risk projects</span>
            </div>
          )}
          <Button size="sm" className="gap-1.5" onClick={handleAddNew}>
            <Plus className="w-3.5 h-3.5" /> Dodaj projekt
          </Button>
        </div>
      </div>

      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="bg-card border border-border w-full justify-start mb-6 p-1 h-auto flex-wrap gap-1">
          {[
            { value: "sales", label: "A · Sales" },
            { value: "projects", label: "B · Projects" },
            { value: "warranty", label: "C · Warranty" },
            { value: "capacity", label: "D · Capacity" },
            { value: "cashflow", label: "E · Cash Flow" },
            { value: "risk", label: "F · Risk Matrix" },
          ].map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-xs px-3 py-1.5">{t.label}</TabsTrigger>
          ))}
        </TabsList>

        {/* ── A: SALES ── */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiTile label="Pipeline Value" value={formatCurrency(totalPipelineValue)} sub="Open opportunities" color="indigo" />
            <KpiTile label="Won Value YTD" value={formatCurrency(wonValue)} sub={`${wonDeals.length} deals`} color="green" />
            <KpiTile label="Win Rate" value={`${winRate.toFixed(1)}%`} sub={`${wonDeals.length}W / ${lostDeals.length}L`} color={winRate >= 60 ? "green" : "amber"} />
            <KpiTile label="Open Deals" value={`${openDeals.length}`} sub="In progress" color="default" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Service Breakdown */}
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold mb-4">Revenue by Service Type</p>
              <div className="space-y-3">
                {serviceBreakdown.sort((a, b) => b.revenue - a.revenue).map(s => {
                  const maxRev = Math.max(...serviceBreakdown.map(x => x.revenue));
                  return (
                    <div key={s.type}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">{s.label}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">{s.count} proj.</span>
                          <span className="text-xs font-semibold">{formatCurrency(s.revenue)}</span>
                        </div>
                      </div>
                      <Progress value={maxRev > 0 ? (s.revenue / maxRev) * 100 : 0} className="h-1.5" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Revenue + Margin trend */}
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold mb-1">Revenue & GM Trend</p>
              <p className="text-xs text-muted-foreground mb-4">12-month tooling performance</p>
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={toolingTrend} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={2} />
                  <YAxis yAxisId="l" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={v => `€${(v / 1000).toFixed(0)}k`} />
                  <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} domain={[0, 55]} />
                  <RTooltip content={<CustomTooltip />} />
                  <Bar yAxisId="l" dataKey="Revenue" fill="#6366f1" radius={[3, 3, 0, 0]} opacity={0.85} />
                  <Line yAxisId="r" type="monotone" dataKey="GM%" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line yAxisId="r" type="monotone" dataKey="EBITDA%" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CRM Pipeline Table */}
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold mb-4">Open Deal Pipeline</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    {(["Customer", "Deal", "Value", "Probability", "Stage", "Close Date"] as const).map(h => (
                      <SortHead key={h} label={h} sort={dealSort} className="text-left py-2 px-3 text-muted-foreground font-medium" />
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedDeals.map(d => (
                    <tr key={d.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                      <td className="py-2 px-3 font-medium">{getCustomerById(d.customerId)?.shortName ?? d.customerId}</td>
                      <td className="py-2 px-3 text-muted-foreground">{d.title}</td>
                      <td className="py-2 px-3 font-semibold">{formatCurrency(d.value)}</td>
                      <td className="py-2 px-3 tabular-nums">{d.probability}%</td>
                      <td className="py-2 px-3">
                        <Badge variant="outline" className="text-[10px]">{d.stage}</Badge>
                      </td>
                      <td className="py-2 px-3 text-muted-foreground">{d.expectedClose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ── B: PROJECTS ── */}
        <TabsContent value="projects" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiTile label="Active Projects" value={`${activeProjects.length}`} sub="Currently in progress" color="indigo" />
            <KpiTile label="WIP Value" value={formatCurrency(totalWip)} sub="Work in progress" color="default" />
            <KpiTile label="High Risk" value={`${highRisk.length}`} sub="Requires attention" color="rose" />
            <KpiTile label="Completed" value={`${completedProjects.length}`} sub="This year" color="green" />
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <p className="text-sm font-semibold">Project Financial Control</p>
              <p className="text-xs text-muted-foreground">Click a row to see cost breakdown</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    {(["Tool No", "Customer", "Service Type", "Quoted", "EFC", "Margin%", "Complete", "ETA", "Risk"] as const).map(h => (
                      <SortHead key={h} label={h} sort={projectSort} className="text-left py-2.5 px-3 text-muted-foreground font-medium" />
                    ))}
                    <th className="py-2.5 px-3 w-20" />
                  </tr>
                </thead>
                <tbody>
                  {sortedProjects.map(p => {
                    const margin = p.quotedRevenue > 0
                      ? ((p.quotedRevenue - p.estimatedFinalCost) / p.quotedRevenue) * 100 : -100;
                    const isOver = p.estimatedFinalCost > p.quotedRevenue;
                    const expanded = expandedProject === p.id;
                    const cb = p.costBreakdown;
                    return (
                      <React.Fragment key={p.id}>
                        <tr
                          onClick={() => setExpandedProject(expanded ? null : p.id)}
                          className={cn(
                            "border-b border-border/50 cursor-pointer transition-colors",
                            expanded ? "bg-accent/20" : "hover:bg-accent/20",
                            isOver && "bg-rose-500/3"
                          )}
                        >
                          <td className="py-2.5 px-3 font-mono font-semibold">{p.toolNo}</td>
                          <td className="py-2.5 px-3 font-medium whitespace-nowrap">{p.customer}</td>
                          <td className="py-2.5 px-3">
                            <span className="bg-indigo-500/10 text-indigo-400 text-[10px] px-1.5 py-0.5 rounded">
                              {SERVICE_LABELS[p.serviceType]}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 tabular-nums">{p.quotedRevenue > 0 ? formatCurrency(p.quotedRevenue) : "—"}</td>
                          <td className={cn("py-2.5 px-3 tabular-nums font-semibold", isOver ? "text-rose-400" : "text-emerald-400")}>
                            {formatCurrency(p.estimatedFinalCost)}
                          </td>
                          <td className={cn("py-2.5 px-3 font-bold tabular-nums",
                            margin >= 20 ? "text-emerald-400" : margin >= 10 ? "text-amber-400" : "text-rose-400"
                          )}>
                            {p.quotedRevenue > 0 ? `${margin.toFixed(1)}%` : "—"}
                          </td>
                          <td className="py-2.5 px-3 min-w-[100px]">
                            <div className="flex items-center gap-2">
                              <Progress value={p.completionPct} className="h-1.5 flex-1" />
                              <span className="tabular-nums text-muted-foreground">{p.completionPct}%</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">{p.eta}</td>
                          <td className="py-2.5 px-3">
                            <span className={cn("text-[10px] px-2 py-0.5 rounded-full border", RISK_COLOR[p.riskLevel])}>
                              {p.riskLevel}
                            </span>
                          </td>
                          <td className="py-2.5 px-3" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit(p)}>
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-rose-400 hover:text-rose-300" onClick={() => handleDelete(p.id)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {expanded && (
                          <tr className="bg-accent/10">
                            <td colSpan={10} className="px-5 py-4">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                  <p className="text-[10px] text-muted-foreground uppercase mb-1">Steel Cost</p>
                                  <p className="text-sm font-semibold">{formatCurrency(cb.steelCost)}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-muted-foreground uppercase mb-1">Hot Runner</p>
                                  <p className="text-sm font-semibold">{formatCurrency(cb.hotRunnerCost)}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-muted-foreground uppercase mb-1">Components</p>
                                  <p className="text-sm font-semibold">{formatCurrency(cb.purchasedComponents)}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-muted-foreground uppercase mb-1">Tryout Loops</p>
                                  <p className={cn("text-sm font-semibold", cb.tryoutLoops >= 3 ? "text-rose-400" : "")}>{cb.tryoutLoops}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {[
                                  { label: "Design", planned: cb.designHoursPlanned, actual: cb.designHoursActual },
                                  { label: "CAM", planned: cb.camHoursPlanned, actual: cb.camHoursActual },
                                  { label: "CNC", planned: cb.cncHoursPlanned, actual: cb.cncHoursActual },
                                  { label: "EDM", planned: cb.edmHoursPlanned, actual: cb.edmHoursActual },
                                  { label: "Fitting", planned: cb.fittingHoursPlanned, actual: cb.fittingHoursActual },
                                ].map(h => {
                                  const over = h.actual > h.planned;
                                  return (
                                    <div key={h.label} className={cn("rounded-lg p-3 border", over ? "border-rose-500/20 bg-rose-500/5" : "border-border bg-card")}>
                                      <p className="text-[10px] text-muted-foreground mb-1">{h.label} hours</p>
                                      <p className="text-sm font-bold">{h.actual}h</p>
                                      <p className={cn("text-[10px] mt-0.5", over ? "text-rose-400" : "text-muted-foreground")}>
                                        Plan: {h.planned}h {over ? `▲ +${h.actual - h.planned}h` : "✓"}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                              {/* Milestones */}
                              {p.milestones.length > 0 && (
                                <div className="mt-4">
                                  <p className="text-[10px] text-muted-foreground uppercase mb-2">Invoice Milestones</p>
                                  <div className="flex gap-2 flex-wrap">
                                    {p.milestones.map((m, i) => {
                                      const statusCol: Record<string, string> = {
                                        PAID: "border-emerald-500/20 text-emerald-400 bg-emerald-500/5",
                                        ISSUED: "border-indigo-500/20 text-indigo-400 bg-indigo-500/5",
                                        PLANNED: "border-border text-muted-foreground bg-card",
                                        OVERDUE: "border-rose-500/20 text-rose-400 bg-rose-500/5",
                                      };
                                      return (
                                        <div key={i} className={cn("rounded-lg border px-3 py-2 text-xs", statusCol[m.invoiceStatus])}>
                                          <p className="font-semibold">{m.name}</p>
                                          <p className="text-[10px] mt-0.5">{formatCurrency(m.invoiceAmount)} · {m.invoiceStatus}</p>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ── C: WARRANTY ── */}
        <TabsContent value="warranty" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiTile label="Open Claims" value={`${openWarranty.length}`} sub="Actively being worked" color="rose" />
            <KpiTile label="Total Claim Cost" value={formatCurrency(warrantyCostTotal)} sub="All time" color="amber" />
            <KpiTile label="Recovered" value={formatCurrency(warrantyRecovered)} sub="Charged back to customer" color="green" />
            <KpiTile label="Recovery Rate" value={`${warrantyRecoveryPct.toFixed(1)}%`} color={warrantyRecoveryPct >= 50 ? "green" : "rose"} />
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <p className="text-sm font-semibold">Warranty & Claim Register</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    {(["Tool No", "Customer", "Description", "Root Cause", "Cost", "Recovered", "Recoverable", "Status"] as const).map(h => (
                      <SortHead key={h} label={h} sort={warrantySort} className="text-left py-2.5 px-3 text-muted-foreground font-medium" />
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedWarranty.map(w => {
                    const statusCol: Record<string, string> = {
                      OPEN: "bg-rose-500/10 text-rose-400",
                      IN_REPAIR: "bg-amber-500/10 text-amber-400",
                      CLOSED: "bg-emerald-500/10 text-emerald-400",
                      DISPUTED: "bg-violet-500/10 text-violet-400",
                    };
                    return (
                      <tr key={w.id} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-semibold">{w.toolNo}</td>
                        <td className="py-2.5 px-3 font-medium">{w.customer}</td>
                        <td className="py-2.5 px-3 text-muted-foreground max-w-[200px]">{w.description}</td>
                        <td className="py-2.5 px-3 text-muted-foreground max-w-[180px]">{w.rootCause}</td>
                        <td className="py-2.5 px-3 font-semibold text-rose-400">{formatCurrency(w.cost)}</td>
                        <td className="py-2.5 px-3 font-semibold text-emerald-400">{w.recovered > 0 ? formatCurrency(w.recovered) : "—"}</td>
                        <td className="py-2.5 px-3">
                          {w.recoverable ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Clock className="w-3.5 h-3.5 text-muted-foreground" />}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={cn("text-[10px] px-2 py-0.5 rounded-full", statusCol[w.status])}>{w.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ── D: CAPACITY ── */}
        <TabsContent value="capacity" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiTile label="CNC Avg Util." value={`${(MACHINES.filter(m => m.type === "CNC").reduce((s, m) => s + m.utilizationPct, 0) / MACHINES.filter(m => m.type === "CNC").length).toFixed(1)}%`} color="indigo" />
            <KpiTile label="EDM Avg Util." value={`${(MACHINES.filter(m => m.type === "EDM").reduce((s, m) => s + m.utilizationPct, 0) / MACHINES.filter(m => m.type === "EDM").length).toFixed(1)}%`} color="default" />
            <KpiTile label="CMM Util." value={`${MACHINES.find(m => m.type === "CMM")?.utilizationPct ?? 0}%`} sub="Bottleneck risk in May" color="amber" />
            <KpiTile label="Avg Build Time" value="14.2 wks" sub="Last 6 projects" color="default" />
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold mb-4">Machine Utilization & Efficiency</p>
            <div className="space-y-4">
              {MACHINES.map(m => {
                const statusCol: Record<string, string> = {
                  RUNNING: "text-emerald-400",
                  IDLE: "text-amber-400",
                  MAINTENANCE: "text-orange-400",
                  BREAKDOWN: "text-rose-400",
                };
                const utilColor = m.utilizationPct >= 85 ? "bg-emerald-500" : m.utilizationPct >= 65 ? "bg-amber-500" : "bg-rose-500";
                return (
                  <div key={m.id} className="flex items-center gap-4">
                    <div className="w-48 shrink-0">
                      <p className="text-xs font-medium truncate">{m.name}</p>
                      <p className={cn("text-[10px]", statusCol[m.status])}>{m.status} · {m.type}</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-muted-foreground">Utilization</span>
                        <span className="text-xs font-semibold">{m.utilizationPct}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", utilColor)} style={{ width: `${m.utilizationPct}%` }} />
                      </div>
                    </div>
                    <div className="w-24 shrink-0 text-right">
                      <p className="text-xs text-muted-foreground">{m.actualHours}h / {m.plannedHours}h</p>
                      <p className="text-[10px] text-muted-foreground">Eff: {m.efficiency}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* ── E: CASH FLOW ── */}
        <TabsContent value="cashflow" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiTile label="WIP Value" value={formatCurrency(totalWip)} sub="Uninvoiced work" color="indigo" />
            <KpiTile label="Overdue Invoices" value={formatCurrency(overdueItems.reduce((s, c) => s + c.amount, 0))} sub={`${overdueItems.length} items`} color="rose" />
            <KpiTile label="Issued / Pending" value={formatCurrency(issuedItems.reduce((s, c) => s + c.amount, 0))} sub="Awaiting payment" color="amber" />
            <KpiTile label="Confirmed Inflow" value={formatCurrency(confirmedItems.reduce((s, c) => s + c.amount, 0))} sub="Next 30 days" color="green" />
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <p className="text-sm font-semibold">Invoice & Milestone Pipeline</p>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={() => setCashFormOpen(true)}>
                <Plus className="w-3 h-3" /> Dodaj
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    {(["Description", "Customer", "Due Date", "Amount", "Type", "Status"] as const).map(h => (
                      <SortHead key={h} label={h} sort={cashSort} className="text-left py-2.5 px-3 text-muted-foreground font-medium" />
                    ))}
                    <th className="py-2.5 px-3 w-8" />
                  </tr>
                </thead>
                <tbody>
                  {sortedCash.map(item => {
                    const statusCol: Record<string, string> = {
                      OVERDUE: "bg-rose-500/10 text-rose-400",
                      CONFIRMED: "bg-emerald-500/10 text-emerald-400",
                      ISSUED: "bg-indigo-500/10 text-indigo-400",
                      PLANNED: "bg-slate-500/10 text-slate-400",
                    };
                    return (
                      <tr key={item.id} className={cn("border-b border-border/50 hover:bg-accent/20 transition-colors",
                        item.status === "OVERDUE" && "bg-rose-500/3")}>
                        <td className="py-2.5 px-3 max-w-[200px]">
                          <p className="truncate">{item.description}</p>
                        </td>
                        <td className="py-2.5 px-3 font-medium whitespace-nowrap">{item.customer}</td>
                        <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">{item.dueDate}</td>
                        <td className={cn("py-2.5 px-3 font-semibold tabular-nums",
                          item.type === "INFLOW" ? "text-emerald-400" : "text-rose-400")}>
                          {item.type === "INFLOW" ? "+" : ""}{formatCurrency(Math.abs(item.amount))}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={cn("text-[10px] px-2 py-0.5 rounded-full",
                            item.type === "INFLOW" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400")}>
                            {item.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={cn("text-[10px] px-2 py-0.5 rounded-full", statusCol[item.status])}>
                            {item.status}{item.daysOverdue ? ` · ${item.daysOverdue}d` : ""}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-rose-400 hover:text-rose-300 opacity-60 hover:opacity-100"
                            onClick={() => { if (confirm("Usunąć tę pozycję?")) deleteCashFlowItem(item.id); }}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ── F: RISK MATRIX ── */}
        <TabsContent value="risk" className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map(sev => {
              const count = TOOLING_PROJECTS.filter(p => p.riskLevel === sev).length;
              const col: Record<string, string> = {
                CRITICAL: "rose", HIGH: "amber", MEDIUM: "yellow", LOW: "green",
              };
              return (
                <div key={sev} className={cn("rounded-xl border p-4",
                  sev === "CRITICAL" ? "border-rose-500/20 bg-rose-500/5" :
                  sev === "HIGH" ? "border-amber-500/20 bg-amber-500/5" :
                  sev === "MEDIUM" ? "border-yellow-500/20 bg-yellow-500/5" :
                  "border-emerald-500/20 bg-emerald-500/5")}>
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground">{sev}</p>
                  <p className="text-3xl font-bold mt-1">{count}</p>
                  <p className="text-xs text-muted-foreground mt-1">projects</p>
                </div>
              );
            })}
          </div>

          <div className="space-y-3">
            {TOOLING_PROJECTS.filter(p => p.status === "ACTIVE")
              .sort((a, b) => {
                const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
                return order[a.riskLevel] - order[b.riskLevel];
              })
              .map(p => {
                const margin = p.quotedRevenue > 0 ? ((p.quotedRevenue - p.estimatedFinalCost) / p.quotedRevenue) * 100 : null;
                const flags = [];
                if (margin !== null && margin < 10) flags.push("Margin <10%");
                if (p.tryoutCount >= 3) flags.push(`${p.tryoutCount} tryouts`);
                if (p.openECOs > 0) flags.push(`${p.openECOs} open ECOs`);
                if (p.estimatedFinalCost > p.quotedRevenue) flags.push("Over budget");
                const overdueMilestone = p.milestones.find(m => m.invoiceStatus === "OVERDUE");
                if (overdueMilestone) flags.push("Invoice overdue");

                return (
                  <div key={p.id} className={cn("rounded-xl border p-4 flex items-start gap-4", RISK_COLOR[p.riskLevel])}>
                    <div className="shrink-0 mt-0.5">
                      <div className={cn("w-3 h-3 rounded-full",
                        p.riskLevel === "HIGH" || p.riskLevel === "CRITICAL" ? "bg-rose-400 animate-pulse" : "bg-amber-400")} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold">{p.toolNo}</span>
                        <span className="text-sm">{p.description}</span>
                        <span className="text-xs text-muted-foreground">· {p.customer}</span>
                      </div>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {flags.map(f => (
                          <span key={f} className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded px-2 py-0.5">
                            ⚠ {f}
                          </span>
                        ))}
                        {flags.length === 0 && (
                          <span className="text-[10px] text-muted-foreground">No critical flags</span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-semibold">{p.completionPct}% done</p>
                      <p className="text-[10px] text-muted-foreground">ETA {p.eta}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
