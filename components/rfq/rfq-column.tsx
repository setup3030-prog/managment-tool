"use client";
import { Droppable } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { RfqCard } from "./rfq-card";
import { cn, formatCurrency } from "@/lib/utils";
import type { RFQ, RfqStatus } from "@/types";

interface RfqColumnProps {
  status: RfqStatus;
  label: string;
  color: string;
  rfqs: RFQ[];
  onEdit: (rfq: RFQ) => void;
  onAdd: (status: RfqStatus) => void;
}

export function RfqColumn({ status, label, color, rfqs, onEdit, onAdd }: RfqColumnProps) {
  const totalValue = rfqs.reduce((s, r) => s + r.toolingValue, 0);

  return (
    <div className="flex flex-col w-60 shrink-0">
      <div className="flex items-center justify-between px-2 py-2 mb-1">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", color)} />
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
          <span className="text-[10px] bg-muted rounded-full px-1.5 py-0.5 font-medium">{rfqs.length}</span>
        </div>
        <button
          onClick={() => onAdd(status)}
          className="opacity-40 hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      {totalValue > 0 && (
        <p className="text-[10px] text-muted-foreground px-2 mb-2 font-medium">
          {formatCurrency(totalValue, "EUR", true)}
        </p>
      )}

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 min-h-[120px] rounded-xl p-2 space-y-2 transition-colors",
              snapshot.isDraggingOver
                ? "bg-indigo-500/5 border-2 border-dashed border-indigo-500/30"
                : "bg-muted/20"
            )}
          >
            {rfqs.map((rfq, i) => (
              <RfqCard key={rfq.id} rfq={rfq} index={i} onEdit={onEdit} />
            ))}
            {provided.placeholder}
            {rfqs.length === 0 && !snapshot.isDraggingOver && (
              <p className="text-[10px] text-muted-foreground/40 text-center py-6">Drop here</p>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
