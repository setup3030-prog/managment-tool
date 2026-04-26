"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle, CheckCircle, Clock, TrendingDown,
  Euro, Wrench, ShieldAlert, Package, Truck, ArrowRight,
  Plus, Pencil, Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn, formatCurrency } from "@/lib/utils";
import { useData } from "@/context/data-context";
import { RiskForm } from "@/components/forms/risk-form";
import type { RiskAction } from "@/types";

const SEV_CONFIG = {
  CRITICAL: { color: "bg-rose-500/10 border-rose-500/30 text-rose-300", badge: "bg-rose-500 text-white", dot: "bg-rose-400", ring: "ring-rose-500/30" },
  HIGH:     { color: "bg-amber-500/10 border-amber-500/30 text-amber-300", badge: "bg-amber-500 text-white", dot: "bg-amber-400", ring: "ring-amber-500/30" },
  MEDIUM:   { color: "bg-yellow-500/10 border-yellow-500/30 text-yellow-300", badge: "bg-yellow-500 text-white", dot: "bg-yellow-400", ring: "ring-yellow-500/30" },
  LOW:      { color: "bg-slate-500/10 border-slate-500/30 text-slate-300", badge: "bg-slate-500 text-white", dot: "bg-slate-400", ring: "" },
};

const CAT_ICON: Record<string, React.ElementType> = {
  FINANCIAL: Euro,
  OPERATIONAL: Wrench,
  COMMERCIAL: ShieldAlert,
  QUALITY: Package,
  DELIVERY: Truck,
};

const STATUS_COL: Record<string, string> = {
  OPEN: "bg-rose-500/10 text-rose-400",
  IN_PROGRESS: "bg-amber-500/10 text-amber-400",
  MONITORING: "bg-blue-500/10 text-blue-400",
  RESOLVED: "bg-emerald-500/10 text-emerald-400",
};

type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "ALL";
type Status = "OPEN" | "IN_PROGRESS" | "MONITORING" | "RESOLVED" | "ALL";

export default function RisksActionsPage() {
  const [sevFilter, setSevFilter] = useState<Severity>("ALL");
  const [statusFilter, setStatusFilter] = useState<Status>("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editRisk, setEditRisk] = useState<RiskAction | undefined>(undefined);
  const { riskActions: RISK_ACTIONS, deleteRiskAction } = useData();

  function handleEdit(r: RiskAction) { setEditRisk(r); setFormOpen(true); }
  function handleDelete(id: string) {
    if (confirm("Usunąć to ryzyko?")) deleteRiskAction(id);
  }
  function handleAddNew() { setEditRisk(undefined); setFormOpen(true); }

  const filtered = RISK_ACTIONS.filter(r => {
    const matchSev = sevFilter === "ALL" || r.severity === sevFilter;
    const matchStat = statusFilter === "ALL" || r.status === statusFilter;
    return matchSev && matchStat;
  }).sort((a, b) => {
    const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return order[a.severity] - order[b.severity];
  });

  const totalImpact = RISK_ACTIONS.filter(r => r.status !== "RESOLVED")
    .reduce((s, r) => s + r.impactEur, 0);

  const critCount = RISK_ACTIONS.filter(r => r.severity === "CRITICAL" && r.status !== "RESOLVED").length;
  const highCount = RISK_ACTIONS.filter(r => r.severity === "HIGH" && r.status !== "RESOLVED").length;
  const openCount = RISK_ACTIONS.filter(r => r.status === "OPEN").length;
  const inProgCount = RISK_ACTIONS.filter(r => r.status === "IN_PROGRESS").length;

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <RiskForm open={formOpen} onClose={() => setFormOpen(false)} risk={editRisk} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-400" /> Risks & Actions
          </h1>
          <p className="text-sm text-muted-foreground">Management action register · April 2026</p>
        </div>
        <div className="flex items-center gap-3">
        {critCount > 0 && (
          <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-2.5">
            <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            <span className="text-sm font-semibold text-rose-300">{critCount} critical action{critCount > 1 ? "s" : ""} open</span>
          </div>
        )}
          <Button size="sm" className="gap-1.5" onClick={handleAddNew}>
            <Plus className="w-3.5 h-3.5" /> Dodaj ryzyko
          </Button>
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Critical Open", value: critCount, color: "rose", sub: "Immediate action" },
          { label: "High Priority", value: highCount, color: "amber", sub: "This week" },
          { label: "Total Open", value: openCount, color: "default", sub: "Not started" },
          { label: "Financial Exposure", value: formatCurrency(Math.abs(totalImpact)), color: "rose", sub: "Active risks" },
        ].map(k => (
          <div key={k.label} className={cn("rounded-xl border p-4",
            k.color === "rose" ? "border-rose-500/20 bg-rose-500/5" :
            k.color === "amber" ? "border-amber-500/20 bg-amber-500/5" :
            "border-border bg-card")}>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{k.label}</p>
            <p className={cn("text-2xl font-bold mt-1",
              k.color === "rose" ? "text-rose-400" : k.color === "amber" ? "text-amber-400" : "")}>
              {k.value}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Top critical issues */}
      <div>
        <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground mb-3">
          Top Priority Issues
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {RISK_ACTIONS.filter(r => r.severity === "CRITICAL" && r.status !== "RESOLVED").map(r => {
            const Icon = CAT_ICON[r.category] ?? AlertTriangle;
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-rose-500/30 bg-rose-500/8 p-5 ring-1 ring-rose-500/20"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-bold text-rose-300">{r.title}</span>
                      <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.5 rounded font-bold">CRITICAL</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{r.description}</p>
                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <span className="text-xs text-rose-400 font-semibold">
                        Impact: {formatCurrency(Math.abs(r.impactEur))}
                      </span>
                      <span className="text-xs text-muted-foreground">Owner: {r.owner}</span>
                      <span className="text-xs text-muted-foreground">Due: {r.dueDate}</span>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full", STATUS_COL[r.status])}>{r.status}</span>
                    </div>
                  </div>
                </div>
                {r.actions.length > 0 && (
                  <div className="mt-4 pl-12 space-y-1">
                    {r.actions.map((a, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <ArrowRight className="w-3 h-3 shrink-0 mt-0.5 text-rose-500/60" />
                        {a}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex gap-1.5 flex-wrap">
          <span className="text-xs text-muted-foreground self-center">Severity:</span>
          {(["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map(s => (
            <button
              key={s}
              onClick={() => setSevFilter(s)}
              className={cn("text-[10px] px-2.5 py-1 rounded-full border transition-colors",
                sevFilter === s ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/30" : "border-border text-muted-foreground hover:bg-accent")}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <span className="text-xs text-muted-foreground self-center">Status:</span>
          {(["ALL", "OPEN", "IN_PROGRESS", "MONITORING", "RESOLVED"] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn("text-[10px] px-2.5 py-1 rounded-full border transition-colors",
                statusFilter === s ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/30" : "border-border text-muted-foreground hover:bg-accent")}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Full risk register */}
      <div className="space-y-2">
        {filtered.map(r => {
          const cfg = SEV_CONFIG[r.severity];
          const Icon = CAT_ICON[r.category] ?? AlertTriangle;
          const isExpanded = expanded === r.id;
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn("rounded-xl border transition-all cursor-pointer", cfg.color, isExpanded && "ring-1 " + cfg.ring)}
              onClick={() => setExpanded(isExpanded ? null : r.id)}
            >
              <div className="flex items-start gap-4 p-4">
                {/* Severity dot */}
                <div className={cn("w-2.5 h-2.5 rounded-full mt-1.5 shrink-0",
                  cfg.dot,
                  (r.severity === "CRITICAL" || r.severity === "HIGH") && "animate-pulse")} />

                {/* Category icon */}
                <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold">{r.title}</span>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-bold text-white", cfg.badge)}>
                      {r.severity}
                    </span>
                    <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded">{r.category}</span>
                  </div>
                  {!isExpanded && (
                    <p className="text-xs text-current/70 mt-0.5 line-clamp-1">{r.description}</p>
                  )}
                </div>

                {/* Meta */}
                <div className="shrink-0 text-right space-y-1 hidden md:block">
                  <p className="text-sm font-bold">{formatCurrency(Math.abs(r.impactEur))}</p>
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full inline-block", STATUS_COL[r.status])}>
                    {r.status.replace("_", " ")}
                  </span>
                </div>
                <div className="shrink-0 flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-50 hover:opacity-100" onClick={() => handleEdit(r)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-50 hover:opacity-100 text-rose-400 hover:text-rose-300" onClick={() => handleDelete(r.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-0 ml-[52px] border-t border-white/10 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3">
                    <div>
                      <p className="text-[10px] text-current/60 uppercase">Owner</p>
                      <p className="text-xs font-semibold mt-0.5">{r.owner}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-current/60 uppercase">Due Date</p>
                      <p className="text-xs font-semibold mt-0.5">{r.dueDate}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-current/60 uppercase">Financial Impact</p>
                      <p className="text-xs font-bold mt-0.5 text-rose-400">{formatCurrency(Math.abs(r.impactEur))}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-current/60 uppercase">Status</p>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full inline-block mt-0.5", STATUS_COL[r.status])}>
                        {r.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-current/80 leading-relaxed">{r.description}</p>
                  {r.linkedProject && (
                    <p className="text-[10px] text-current/60">
                      Linked project: <span className="font-semibold">{r.linkedProject}</span>
                    </p>
                  )}
                  {r.linkedCustomer && (
                    <p className="text-[10px] text-current/60">
                      Linked customer: <span className="font-semibold">{r.linkedCustomer}</span>
                    </p>
                  )}
                  {r.actions.length > 0 && (
                    <div>
                      <p className="text-[10px] text-current/60 uppercase font-semibold mb-2">Action Steps</p>
                      <div className="space-y-1.5">
                        {r.actions.map((a, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs">
                            <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            {a}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
            <p className="text-sm font-semibold">No issues match your filters</p>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting the filters above</p>
          </div>
        )}
      </div>
    </div>
  );
}
