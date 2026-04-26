"use client";
import { useState } from "react";
import { ShoppingCart, Plus, Search, Download } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";
import { RFQS, PIPELINE_DEALS, INJECTION_RFQS, getCustomerById, CUSTOMERS } from "@/data/seed-data";
import type { DealStage, RfqStatus } from "@/types";

const STAGES: DealStage[] = ["LEAD", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"];
const STAGE_LABELS: Record<DealStage, string> = {
  LEAD: "Lead", QUALIFIED: "Qualified", PROPOSAL: "Proposal",
  NEGOTIATION: "Negotiation", WON: "Won", LOST: "Lost",
};
const STAGE_COLOR: Record<DealStage, string> = {
  LEAD: "bg-slate-500/15 text-slate-400 border-slate-500/20",
  QUALIFIED: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  PROPOSAL: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
  NEGOTIATION: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  WON: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  LOST: "bg-rose-500/15 text-rose-400 border-rose-500/20",
};
const RFQ_STATUS_COLOR: Record<RfqStatus, string> = {
  NEW: "bg-slate-500/10 text-slate-400",
  COSTING: "bg-blue-500/10 text-blue-400",
  WAITING_FOR_SUPPLIER: "bg-amber-500/10 text-amber-400",
  SENT: "bg-indigo-500/10 text-indigo-400",
  NEGOTIATION: "bg-amber-500/10 text-amber-400",
  WON: "bg-emerald-500/10 text-emerald-400",
  LOST: "bg-rose-500/10 text-rose-400",
};

const SERVICE_LABELS: Record<string, string> = {
  NEW_TOOL: "New Tool",
  WARRANTY_REPAIR: "Warranty",
  PAID_REPAIR: "Paid Repair",
  MODIFICATION_ECO: "ECO/Mod",
  CHINA_TRANSFER: "China Transfer",
  SPARE_PARTS: "Spare Parts",
};

export default function SalesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RfqStatus | "ALL">("ALL");

  const enrichedDeals = PIPELINE_DEALS.map(d => ({
    ...d,
    customerName: getCustomerById(d.customerId)?.name ?? d.customerId,
  }));

  const filteredRfqs = RFQS.filter(r => {
    const customer = getCustomerById(r.customerId);
    const matchSearch = !search ||
      r.partName.toLowerCase().includes(search.toLowerCase()) ||
      customer?.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchSearch && matchStatus;
  }).map(r => ({ ...r, customer: getCustomerById(r.customerId) }));

  const pipelineValue = enrichedDeals
    .filter(d => !["WON", "LOST"].includes(d.stage))
    .reduce((s, d) => s + d.value, 0);
  const wonValue = enrichedDeals.filter(d => d.stage === "WON").reduce((s, d) => s + d.value, 0);
  const weightedPipeline = enrichedDeals
    .filter(d => !["WON", "LOST"].includes(d.stage))
    .reduce((s, d) => s + d.value * (d.probability / 100), 0);

  const rfqWon = RFQS.filter(r => r.status === "WON").length;
  const rfqLost = RFQS.filter(r => r.status === "LOST").length;
  const winRate = (rfqWon + rfqLost) > 0 ? (rfqWon / (rfqWon + rfqLost)) * 100 : 0;

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-indigo-400" /> Sales / RFQ
          </h1>
          <p className="text-sm text-muted-foreground">Tooling pipeline · Injection RFQs · CRM</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => window.location.href = "/rfq/new"}>
          <Plus className="w-3.5 h-3.5" /> New RFQ
        </Button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pipeline Value", value: formatCurrency(pipelineValue), sub: "Open opportunities", color: "indigo" },
          { label: "Weighted Pipeline", value: formatCurrency(weightedPipeline), sub: "Probability-adjusted", color: "default" },
          { label: "Won YTD", value: formatCurrency(wonValue), sub: `${rfqWon} orders`, color: "green" },
          { label: "RFQ Win Rate", value: `${winRate.toFixed(1)}%`, sub: `${rfqWon}W / ${rfqLost}L`, color: winRate >= 60 ? "green" : "amber" },
        ].map(k => (
          <div key={k.label} className={cn("rounded-xl border p-4",
            k.color === "indigo" ? "border-indigo-500/15 bg-indigo-500/5" :
            k.color === "green" ? "border-emerald-500/15 bg-emerald-500/5" :
            k.color === "amber" ? "border-amber-500/15 bg-amber-500/5" :
            "border-border bg-card")}>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{k.label}</p>
            <p className="text-xl font-bold">{k.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="kanban" className="w-full">
        <TabsList className="bg-card border border-border mb-6 p-1 h-auto gap-1">
          <TabsTrigger value="kanban" className="text-xs px-3 py-1.5">CRM Kanban</TabsTrigger>
          <TabsTrigger value="rfq" className="text-xs px-3 py-1.5">Tooling RFQs</TabsTrigger>
          <TabsTrigger value="injection" className="text-xs px-3 py-1.5">Injection RFQs</TabsTrigger>
        </TabsList>

        {/* ── KANBAN ── */}
        <TabsContent value="kanban">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 overflow-x-auto">
            {STAGES.map(stage => {
              const deals = enrichedDeals.filter(d => d.stage === stage);
              const stageValue = deals.reduce((s, d) => s + d.value, 0);
              return (
                <div key={stage} className="min-w-[180px]">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", STAGE_COLOR[stage])}>
                      {STAGE_LABELS[stage]}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{deals.length}</span>
                  </div>
                  {stageValue > 0 && (
                    <p className="text-[10px] text-muted-foreground px-1 mb-2">{formatCurrency(stageValue)}</p>
                  )}
                  <div className="space-y-2">
                    {deals.map(deal => (
                      <div key={deal.id} className="rounded-lg border border-border bg-card p-3 hover:bg-accent/30 transition-colors cursor-pointer">
                        <p className="text-xs font-semibold leading-tight mb-1">{deal.title}</p>
                        <p className="text-[10px] text-muted-foreground mb-2">{deal.customerName}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-400">{formatCurrency(deal.value)}</span>
                          <span className="text-[10px] text-muted-foreground">{deal.probability}%</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">Close: {deal.expectedClose}</p>
                      </div>
                    ))}
                    {deals.length === 0 && (
                      <div className="rounded-lg border border-dashed border-border p-4 text-center">
                        <p className="text-[10px] text-muted-foreground/50">No deals</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* ── TOOLING RFQs ── */}
        <TabsContent value="rfq" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search RFQs..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {(["ALL", "NEW", "COSTING", "SENT", "NEGOTIATION", "WON", "LOST"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn("text-[10px] px-2.5 py-1 rounded-full border transition-colors",
                    statusFilter === s ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/30" : "border-border text-muted-foreground hover:bg-accent")}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  {["Customer", "Part / Project", "Service", "Value", "Status", "Submitted"].map(h => (
                    <th key={h} className="text-left py-2.5 px-4 text-muted-foreground font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRfqs.map(r => (
                  <tr key={r.id} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
                    <td className="py-2.5 px-4 font-medium">{r.customer?.name ?? r.customerId}</td>
                    <td className="py-2.5 px-4 text-muted-foreground">{r.partName}</td>
                    <td className="py-2.5 px-4">
                      <span className="bg-indigo-500/10 text-indigo-400 text-[10px] px-1.5 py-0.5 rounded">
                        {SERVICE_LABELS[r.service ?? "NEW_TOOL"] ?? r.service}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-semibold tabular-nums">{r.value ? formatCurrency(r.value) : "—"}</td>
                    <td className="py-2.5 px-4">
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full", RFQ_STATUS_COLOR[r.status])}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-muted-foreground">{r.submittedDate ?? "—"}</td>
                  </tr>
                ))}
                {filteredRfqs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                      No RFQs match your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* ── INJECTION RFQs ── */}
        <TabsContent value="injection" className="space-y-4">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <p className="text-sm font-semibold">Injection Molding RFQ Pipeline</p>
              <p className="text-xs text-muted-foreground">
                {INJECTION_RFQS.filter(r => r.status === "WON").length} won ·{" "}
                {INJECTION_RFQS.filter(r => !["WON", "LOST"].includes(r.status)).length} open
              </p>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  {["Customer", "Part Name", "Segment", "Volume/yr", "Quoted Price", "Annual Rev", "Margin%", "Status", "Decision"].map(h => (
                    <th key={h} className="text-left py-2.5 px-4 text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {INJECTION_RFQS.map(r => (
                  <tr key={r.id} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
                    <td className="py-2.5 px-4 font-medium">{r.customer}</td>
                    <td className="py-2.5 px-4 text-muted-foreground max-w-[160px] truncate">{r.partName}</td>
                    <td className="py-2.5 px-4">
                      <Badge variant="outline" className="text-[10px]">{r.segment}</Badge>
                    </td>
                    <td className="py-2.5 px-4 tabular-nums">{(r.annualVolume / 1000).toFixed(0)}k</td>
                    <td className="py-2.5 px-4 tabular-nums font-semibold">€{r.quotedUnitPrice.toFixed(3)}</td>
                    <td className="py-2.5 px-4 tabular-nums text-indigo-400">{formatCurrency(r.annualRevenuePotential)}</td>
                    <td className="py-2.5 px-4 tabular-nums text-emerald-400 font-semibold">{r.targetMarginPct}%</td>
                    <td className="py-2.5 px-4">
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full", RFQ_STATUS_COLOR[r.status])}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-muted-foreground">{r.decisionDate ?? "—"}</td>
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
