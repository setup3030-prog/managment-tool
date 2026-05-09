"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, ComposedChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Target, Plus, Trash2, CheckCircle, XCircle, Clock, Send } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import { FINANCIAL_PERIODS, PIPELINE_DEALS, getCustomerById, CUSTOMERS } from "@/data/seed-data";
import { useData } from "@/context/data-context";
import { useSort, SortHead } from "@/hooks/use-sort";
import { RfqKanbanBoard } from "@/components/rfq/rfq-kanban-board";
import type { RfqStatus } from "@/types";

const RFQ_STATUS_COLOR: Record<RfqStatus, string> = {
  DRAFT:     "bg-slate-500/10 text-slate-400",
  COSTING:   "bg-indigo-500/10 text-indigo-400",
  SENT:      "bg-amber-500/10 text-amber-400",
  WON:       "bg-emerald-500/10 text-emerald-400",
  LOST:      "bg-rose-500/10 text-rose-400",
  CANCELLED: "bg-slate-500/10 text-slate-400",
};

const RFQ_STATUS_ICON: Record<RfqStatus, React.ReactNode> = {
  DRAFT:     <Clock className="w-3 h-3" />,
  COSTING:   <Target className="w-3 h-3" />,
  SENT:      <Send className="w-3 h-3" />,
  WON:       <CheckCircle className="w-3 h-3" />,
  LOST:      <XCircle className="w-3 h-3" />,
  CANCELLED: <XCircle className="w-3 h-3" />,
};

const DEAL_STAGE_COLOR: Record<string, string> = {
  LEAD:        "bg-slate-500/10 text-slate-400",
  QUALIFIED:   "bg-indigo-500/10 text-indigo-400",
  PROPOSAL:    "bg-amber-500/10 text-amber-400",
  NEGOTIATION: "bg-violet-500/10 text-violet-400",
  WON:         "bg-emerald-500/10 text-emerald-400",
  LOST:        "bg-rose-500/10 text-rose-400",
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
            {p.name.includes("%") ? `${p.value}%` : p.value > 1000 ? formatCurrency(p.value) : p.value}
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
    violet:  "bg-violet-500/5 border-violet-500/15",
  };
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-xl border p-4", bg[color] ?? bg.default)}>
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
    </motion.div>
  );
}

export default function SalesPage() {
  const { rfqs, deleteRfq } = useData();
  const [statusFilter, setStatusFilter] = useState<RfqStatus | "ALL">("ALL");

  // ── RFQ KPIs ──
  const wonRfqs   = rfqs.filter(r => r.status === "WON");
  const lostRfqs  = rfqs.filter(r => r.status === "LOST");
  const sentRfqs  = rfqs.filter(r => r.status === "SENT");
  const activeRfqs = rfqs.filter(r => ["DRAFT", "COSTING", "SENT"].includes(r.status));
  const decided   = wonRfqs.length + lostRfqs.length;
  const winRate   = decided > 0 ? (wonRfqs.length / decided) * 100 : 0;
  const wonValue  = wonRfqs.reduce((s, r) => s + r.toolingValue, 0);
  const pipelineValue = sentRfqs.reduce((s, r) => s + r.toolingValue, 0);

  // ── Pipeline (CRM) data ──
  const openDeals = PIPELINE_DEALS.filter(d => !["WON", "LOST"].includes(d.stage));
  const dealsByStage = ["LEAD", "QUALIFIED", "PROPOSAL", "NEGOTIATION"].map(stage => ({
    stage,
    count: PIPELINE_DEALS.filter(d => d.stage === stage).length,
    value: PIPELINE_DEALS.filter(d => d.stage === stage).reduce((s, d) => s + d.value, 0),
  }));
  const totalPipeline = openDeals.reduce((s, d) => s + d.value, 0);

  // ── Monthly performance chart ──
  const perfData = FINANCIAL_PERIODS.slice(-12).map(fp => ({
    name: fp.label,
    Won: fp.rfqWon,
    Lost: fp.rfqLost,
    "Win Rate%": fp.rfqSent > 0 ? Math.round((fp.rfqWon / fp.rfqSent) * 100) : 0,
  }));

  // ── Customer revenue breakdown ──
  const customerRevMap = new Map<string, { tooling: number; serial: number; won: number; total: number }>();
  wonRfqs.forEach(r => {
    const ex = customerRevMap.get(r.customerId) ?? { tooling: 0, serial: 0, won: 0, total: 0 };
    customerRevMap.set(r.customerId, {
      tooling: ex.tooling + r.toolingValue,
      serial:  ex.serial + r.serialValuePA,
      won:     ex.won + 1,
      total:   ex.total + r.toolingValue + r.serialValuePA,
    });
  });
  const customerRevData = Array.from(customerRevMap.entries())
    .map(([customerId, d]) => ({ customerId, customer: getCustomerById(customerId)?.shortName ?? customerId, ...d }))
    .sort((a, b) => b.total - a.total);

  // ── Filtered RFQs ──
  const filteredRfqs = statusFilter === "ALL" ? rfqs : rfqs.filter(r => r.status === statusFilter);

  // ── Sort ──
  const rfqSort    = useSort();
  const dealSort   = useSort();
  const custSort   = useSort();
  const sortedRfqs = rfqSort.apply(filteredRfqs, {
    "RFQ No":    r => r.rfqNo,
    Customer:    r => getCustomerById(r.customerId)?.shortName ?? r.customerId,
    Description: r => r.description,
    "Tooling €": r => r.toolingValue,
    "Serial PA": r => r.serialValuePA,
    "Margin%":   r => r.marginPct,
    Parts:       r => r.partsCount,
    Due:         r => r.dueDate,
    Status:      r => r.status,
  });
  const sortedDeals = dealSort.apply(openDeals, {
    Customer:    d => getCustomerById(d.customerId)?.shortName ?? d.customerId,
    Deal:        d => d.title,
    Value:       d => d.value,
    Probability: d => d.probability,
    Stage:       d => d.stage,
    "Close Date": d => d.expectedClose,
  });
  const sortedCustomers = custSort.apply(customerRevData, {
    Customer:    c => c.customer,
    "Tooling €": c => c.tooling,
    "Serial PA": c => c.serial,
    "Won RFQs":  c => c.won,
    Total:       c => c.total,
  });

  const STATUS_FILTERS: (RfqStatus | "ALL")[] = ["ALL", "DRAFT", "COSTING", "SENT", "WON", "LOST", "CANCELLED"];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-400" /> Sales / RFQ
          </h1>
          <p className="text-sm text-muted-foreground">Pipeline & quotation management · April 2026</p>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <KpiTile label="Open RFQs"       value={`${activeRfqs.length}`}                   sub="Draft + Costing + Sent" color="indigo" />
        <KpiTile label="Sent / Pending"  value={`${sentRfqs.length}`}                     sub="Awaiting decision" color="amber" />
        <KpiTile label="Win Rate YTD"    value={`${winRate.toFixed(1)}%`}                  sub={`${wonRfqs.length}W / ${lostRfqs.length}L`} color={winRate >= 60 ? "green" : winRate >= 45 ? "amber" : "rose"} />
        <KpiTile label="Won Value YTD"   value={formatCurrency(wonValue)}                  sub="Tooling value" color="green" />
        <KpiTile label="Pipeline Value"  value={formatCurrency(pipelineValue)}             sub="Sent & pending" color="violet" />
        <KpiTile label="CRM Pipeline"    value={formatCurrency(totalPipeline)}             sub={`${openDeals.length} open deals`} color="default" />
      </div>

      <Tabs defaultValue="kanban" className="w-full">
        <TabsList className="bg-card border border-border w-full justify-start mb-4 p-1 h-auto flex-wrap gap-1">
          {[
            { value: "kanban",      label: "A · Kanban Board" },
            { value: "rfq",         label: "B · RFQ Tracker" },
            { value: "pipeline",    label: "C · CRM Pipeline" },
            { value: "performance", label: "D · Performance" },
            { value: "customers",   label: "E · Customers" },
          ].map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-xs px-3 py-1.5">{t.label}</TabsTrigger>
          ))}
        </TabsList>

        {/* ── A: KANBAN BOARD ── */}
        <TabsContent value="kanban">
          <RfqKanbanBoard />
        </TabsContent>

        {/* ── B: RFQ TRACKER ── */}
        <TabsContent value="rfq" className="space-y-4">
          {/* Status summary */}
          <div className="flex items-center gap-2 flex-wrap">
            {STATUS_FILTERS.map(s => {
              const count = s === "ALL" ? rfqs.length : rfqs.filter(r => r.status === s).length;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors",
                    statusFilter === s
                      ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-300"
                      : "border-border text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  {s !== "ALL" && RFQ_STATUS_ICON[s as RfqStatus]}
                  {s} <span className="font-bold">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <p className="text-sm font-semibold">
                {statusFilter === "ALL" ? "All RFQs" : `RFQs – ${statusFilter}`}
                <span className="ml-2 text-xs text-muted-foreground font-normal">({sortedRfqs.length})</span>
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    {(["RFQ No", "Customer", "Description", "Parts", "Tooling €", "Serial PA", "Margin%", "Due", "Status"] as const).map(h => (
                      <SortHead key={h} label={h} sort={rfqSort} className="text-left py-2.5 px-3 text-muted-foreground font-medium" />
                    ))}
                    <th className="py-2.5 px-3 w-8" />
                  </tr>
                </thead>
                <tbody>
                  {sortedRfqs.map(rfq => {
                    const customer = getCustomerById(rfq.customerId);
                    return (
                      <tr key={rfq.id} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-semibold text-indigo-400">{rfq.rfqNo}</td>
                        <td className="py-2.5 px-3 font-medium whitespace-nowrap">{customer?.shortName ?? rfq.customerId}</td>
                        <td className="py-2.5 px-3 text-muted-foreground max-w-[220px]">
                          <p className="truncate">{rfq.description}</p>
                          {rfq.lostReason && (
                            <p className="text-[10px] text-rose-400 mt-0.5">↳ {rfq.lostReason}</p>
                          )}
                        </td>
                        <td className="py-2.5 px-3 tabular-nums text-center">{rfq.partsCount}</td>
                        <td className="py-2.5 px-3 tabular-nums font-semibold">{formatCurrency(rfq.toolingValue)}</td>
                        <td className="py-2.5 px-3 tabular-nums text-muted-foreground">{formatCurrency(rfq.serialValuePA)}/yr</td>
                        <td className={cn("py-2.5 px-3 tabular-nums font-bold",
                          rfq.marginPct >= 22 ? "text-emerald-400" : rfq.marginPct >= 18 ? "text-amber-400" : "text-rose-400")}>
                          {rfq.marginPct.toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">{rfq.dueDate}</td>
                        <td className="py-2.5 px-3">
                          <span className={cn("inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full", RFQ_STATUS_COLOR[rfq.status])}>
                            {RFQ_STATUS_ICON[rfq.status]}
                            {rfq.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-rose-400/50 hover:text-rose-400"
                            onClick={() => { if (confirm("Delete RFQ?")) deleteRfq(rfq.id); }}>
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

        {/* ── B: CRM PIPELINE ── */}
        <TabsContent value="pipeline" className="space-y-6">
          {/* Stage summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dealsByStage.map(stage => (
              <div key={stage.stage} className="rounded-xl border border-border bg-card p-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{stage.stage}</p>
                <p className="text-xl font-bold mt-1">{stage.count}</p>
                <p className="text-xs text-indigo-400 font-semibold mt-1">{formatCurrency(stage.value)}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <p className="text-sm font-semibold">Open Deal Pipeline</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    {(["Customer", "Deal", "Value", "Probability", "Stage", "Close Date"] as const).map(h => (
                      <SortHead key={h} label={h} sort={dealSort} className="text-left py-2 px-3 text-muted-foreground font-medium" />
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedDeals.map(d => (
                    <tr key={d.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                      <td className="py-2 px-3 font-medium">{getCustomerById(d.customerId)?.shortName ?? d.customerId}</td>
                      <td className="py-2 px-3 text-muted-foreground max-w-[240px]">
                        <p className="truncate">{d.title}</p>
                      </td>
                      <td className="py-2 px-3 font-semibold">{formatCurrency(d.value)}</td>
                      <td className="py-2 px-3 tabular-nums">
                        <div className="flex items-center gap-2">
                          <div className="h-1 w-16 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500" style={{ width: `${d.probability}%` }} />
                          </div>
                          <span>{d.probability}%</span>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <Badge variant="outline" className={cn("text-[10px]", DEAL_STAGE_COLOR[d.stage])}>{d.stage}</Badge>
                      </td>
                      <td className="py-2 px-3 text-muted-foreground">{d.expectedClose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ── C: PERFORMANCE ── */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold mb-1">Monthly Win / Loss</p>
              <p className="text-xs text-muted-foreground mb-4">RFQ decisions last 12 months</p>
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={perfData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={2} />
                  <YAxis yAxisId="l" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} domain={[0, 100]} />
                  <RTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar yAxisId="l" dataKey="Won"  fill="#10b981" radius={[3, 3, 0, 0]} />
                  <Bar yAxisId="l" dataKey="Lost" fill="#f43f5e" radius={[3, 3, 0, 0]} />
                  <Line yAxisId="r" type="monotone" dataKey="Win Rate%" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold mb-1">RFQ Value by Status</p>
              <p className="text-xs text-muted-foreground mb-4">Tooling value breakdown · all time</p>
              <div className="space-y-3 mt-4">
                {(["WON", "LOST", "SENT", "COSTING", "DRAFT", "CANCELLED"] as RfqStatus[]).map(status => {
                  const items = rfqs.filter(r => r.status === status);
                  const val   = items.reduce((s, r) => s + r.toolingValue, 0);
                  const total = rfqs.reduce((s, r) => s + r.toolingValue, 0);
                  if (items.length === 0) return null;
                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn("inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full", RFQ_STATUS_COLOR[status])}>
                          {RFQ_STATUS_ICON[status]}{status}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">{items.length} RFQs</span>
                          <span className="text-xs font-semibold">{formatCurrency(val)}</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full"
                          style={{
                            width: `${total > 0 ? (val / total) * 100 : 0}%`,
                            background: status === "WON" ? "#10b981" : status === "LOST" ? "#f43f5e" : status === "SENT" ? "#f59e0b" : "#6366f1",
                          }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── D: CUSTOMERS ── */}
        <TabsContent value="customers" className="space-y-4">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <p className="text-sm font-semibold">Customer Revenue – Won RFQs</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    {(["Customer", "Tooling €", "Serial PA", "Won RFQs", "Total"] as const).map(h => (
                      <SortHead key={h} label={h} sort={custSort} className="text-left py-2.5 px-4 text-muted-foreground font-medium" />
                    ))}
                    <th className="text-left py-2.5 px-4 text-muted-foreground font-medium">Revenue Share</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCustomers.map(c => {
                    const totalAll = customerRevData.reduce((s, x) => s + x.total, 0);
                    const share = totalAll > 0 ? (c.total / totalAll) * 100 : 0;
                    return (
                      <tr key={c.customerId} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
                        <td className="py-3 px-4 font-semibold">{c.customer}</td>
                        <td className="py-3 px-4 tabular-nums font-semibold text-indigo-400">{formatCurrency(c.tooling)}</td>
                        <td className="py-3 px-4 tabular-nums text-muted-foreground">{formatCurrency(c.serial)}/yr</td>
                        <td className="py-3 px-4 tabular-nums text-center">{c.won}</td>
                        <td className="py-3 px-4 tabular-nums font-bold">{formatCurrency(c.total)}</td>
                        <td className="py-3 px-4 min-w-[140px]">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${share}%` }} />
                            </div>
                            <span className="text-[10px] text-muted-foreground w-8">{share.toFixed(0)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* All customers overview */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <p className="text-sm font-semibold">All Customers – Profile</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    {["Customer", "Country", "Segment", "Credit Limit", "Payment Terms", "Contact"].map(h => (
                      <th key={h} className="text-left py-2.5 px-3 text-muted-foreground font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CUSTOMERS.map(c => (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
                      <td className="py-2.5 px-3 font-semibold">{c.name}</td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] bg-slate-500/10 text-slate-400 px-1.5 py-0.5 rounded">{c.country}</span>
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">{c.segment}</td>
                      <td className="py-2.5 px-3 tabular-nums">{c.creditLimit ? formatCurrency(c.creditLimit) : "—"}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{c.paymentTerms ? `${c.paymentTerms} days` : "—"}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{c.contacts[0]?.name ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
