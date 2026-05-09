"use client";
import { Draggable } from "@hello-pangea/dnd";
import { Calendar, TrendingUp, Package, Pencil } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { CUSTOMERS } from "@/data/seed-data";
import { calcRfqCosts } from "@/lib/rfq-calc";
import type { RFQ } from "@/types";

interface RfqCardProps {
  rfq: RFQ;
  index: number;
  onEdit: (rfq: RFQ) => void;
}

const marginColor = (m: number) =>
  m >= 22 ? "text-emerald-400" : m >= 18 ? "text-amber-400" : "text-rose-400";

function fmtPrice(n: number) {
  return `€${n.toFixed(3)}`;
}
function fmtK(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(0)}k` : `${Math.round(n)}`;
}
function fmtEurK(n: number) {
  return n >= 1000 ? `€${(n / 1000).toFixed(0)}k` : `€${Math.round(n)}`;
}

export function RfqCard({ rfq, index, onEdit }: RfqCardProps) {
  const customer = CUSTOMERS.find(c => c.id === rfq.customerId);
  const calc = rfq.costCalc ? calcRfqCosts(rfq.costCalc, rfq.estimatedToolingCost) : null;

  return (
    <Draggable draggableId={rfq.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "group rounded-lg border border-border bg-card p-3 cursor-grab active:cursor-grabbing transition-shadow select-none relative",
            snapshot.isDragging && "shadow-lg border-indigo-500/40 rotate-1"
          )}
        >
          {/* Edit button */}
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onEdit(rfq); }}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground p-0.5 rounded"
          >
            <Pencil className="w-3 h-3" />
          </button>

          <div className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <p className="text-xs font-mono font-bold text-indigo-400">{rfq.rfqNo}</p>
              <p className="text-[10px] text-muted-foreground shrink-0">{rfq.partsCount} <Package size={9} className="inline" /></p>
            </div>

            <p className="text-xs font-semibold leading-tight line-clamp-2 text-foreground pr-4">{rfq.description}</p>

            {customer && (
              <p className="text-[10px] text-muted-foreground">{customer.shortName}</p>
            )}

            <p className="text-sm font-bold text-indigo-300">
              {formatCurrency(rfq.toolingValue, "EUR", true)}
            </p>

            <div className="flex items-center gap-3 text-[10px]">
              <span className={cn("flex items-center gap-0.5 font-semibold", marginColor(rfq.marginPct))}>
                <TrendingUp size={9} />
                {rfq.marginPct.toFixed(1)}%
              </span>
              <span className="flex items-center gap-0.5 text-muted-foreground">
                <Calendar size={9} />
                {rfq.dueDate}
              </span>
            </div>

            {/* IM Calculator mini-strip */}
            {calc && calc.salesPricePerPart > 0 && (
              <div className="mt-1 pt-2 border-t border-border/50 grid grid-cols-3 gap-0 text-[9px] text-muted-foreground">
                <div>
                  <p className="text-foreground font-semibold">{fmtPrice(calc.salesPricePerPart)}</p>
                  <p>cena/szt</p>
                </div>
                <div>
                  <p className={cn("font-semibold", calc.bepUnits > (rfq.costCalc?.annualVolume ?? 0) ? "text-rose-400" : "text-foreground")}>
                    {calc.bepUnits > 0 ? fmtK(calc.bepUnits) : "—"}
                  </p>
                  <p>BEP szt</p>
                </div>
                <div>
                  <p className="text-foreground font-semibold">{fmtEurK(calc.annualRevenue)}</p>
                  <p>rev/rok</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
