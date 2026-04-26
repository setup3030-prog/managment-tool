"use client";
import { useMemo } from "react";
import { calculateRfq } from "@/hooks/use-rfq-calculator";
import { formatCurrency, formatPct, formatNumber } from "@/lib/utils";
import type { RfqCalculatorInputs } from "@/types";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface CostCalculatorProps {
  inputs: RfqCalculatorInputs;
}

export function CostCalculator({ inputs }: CostCalculatorProps) {
  const result = useMemo(() => {
    try {
      return calculateRfq(inputs);
    } catch {
      return null;
    }
  }, [inputs]);

  if (!result) return null;

  const fmt = (v: number) => formatCurrency(v, inputs.currency || "EUR");
  const isGoodMargin = result.grossMarginPct >= (inputs.targetMarginPct ?? 15);
  const breakevenPct = inputs.annualVolume > 0 ? Math.min((result.breakevenQty / inputs.annualVolume) * 100, 100) : 0;

  const rows = [
    { label: "Material cost/part", value: fmt(result.materialCostPerPart), sub: `incl. ${formatPct(inputs.scrapPct)} scrap` },
    { label: "Machine cost/part", value: fmt(result.machineCostPerPart) },
    { label: "Labour cost/part", value: fmt(result.laborCostPerPart) },
    { label: "Packaging", value: fmt(inputs.packagingCost) },
    { label: "Logistics", value: fmt(inputs.logisticsCost) },
    { label: "Direct cost/part", value: fmt(result.directCostPerPart), bold: true },
    { label: "Tooling amort./part", value: fmt(result.toolingPerPart) },
    { label: "SG&A", value: fmt(result.sgaPerPart), sub: `${formatPct(inputs.sgaPct)} on variable cost` },
    { label: "Total Part Cost", value: fmt(result.partCost), bold: true, accent: true },
    { label: "Sales Price", value: fmt(result.salesPrice), bold: true, highlight: true },
  ];

  return (
    <div className="space-y-4">
      {/* Cost breakdown table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="px-4 py-2 bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Cost Breakdown (per part)
        </div>
        <div className="divide-y divide-border">
          {rows.map((row) => (
            <div
              key={row.label}
              className={cn(
                "flex items-center justify-between px-4 py-2.5 text-sm",
                row.highlight && "bg-indigo-500/10",
                row.accent && "bg-muted/30"
              )}
            >
              <div>
                <span className={cn("font-medium", row.bold && "font-semibold")}>{row.label}</span>
                {row.sub && <span className="ml-2 text-xs text-muted-foreground">{row.sub}</span>}
              </div>
              <span className={cn(
                "font-mono text-sm",
                row.bold && "font-bold",
                row.highlight && "text-indigo-400 text-base font-bold"
              )}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Margin & results */}
      <div className="grid grid-cols-2 gap-3">
        <div className={cn("rounded-lg border p-4", isGoodMargin ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5")}>
          <p className="text-xs text-muted-foreground mb-1">Gross Margin</p>
          <p className={cn("text-2xl font-bold", isGoodMargin ? "text-emerald-400" : "text-red-400")}>
            {formatPct(result.grossMarginPct)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Target: {formatPct(inputs.targetMarginPct)}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Annual Revenue</p>
          <p className="text-2xl font-bold">{formatCurrency(result.annualRevenue, inputs.currency || "EUR", true)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Profit: {formatCurrency(result.annualProfit, inputs.currency || "EUR", true)}</p>
        </div>
      </div>

      {/* Break-even */}
      {isFinite(result.breakevenQty) && (
        <div className="rounded-lg border border-border p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Break-even Quantity</span>
            <span className="font-bold">{formatNumber(Math.round(result.breakevenQty))}</span>
          </div>
          <Progress
            value={breakevenPct}
            className={cn("h-2", breakevenPct > 80 ? "[&>div]:bg-red-500" : breakevenPct > 50 ? "[&>div]:bg-amber-500" : "[&>div]:bg-emerald-500")}
          />
          <p className="text-xs text-muted-foreground">
            {formatPct(breakevenPct)} of annual volume ({formatNumber(inputs.annualVolume)} pcs/yr) — {breakevenPct > 100 ? "NOT viable" : breakevenPct > 80 ? "high risk" : "viable"}
          </p>
        </div>
      )}
    </div>
  );
}
