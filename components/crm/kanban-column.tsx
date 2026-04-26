"use client";
import { Droppable } from "@hello-pangea/dnd";
import { DealCard } from "./deal-card";
import type { PipelineDeal, DealStage } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  stage: DealStage;
  label: string;
  deals: PipelineDeal[];
  color: string;
}

export function KanbanColumn({ stage, label, deals, color }: KanbanColumnProps) {
  const totalValue = deals.reduce((sum, d) => sum + (d.value ?? 0), 0);

  return (
    <div className="flex flex-col w-64 shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2 mb-2">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", color)} />
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
          <span className="text-xs bg-muted rounded-full px-1.5 py-0.5 font-medium">{deals.length}</span>
        </div>
      </div>
      {totalValue > 0 && (
        <p className="text-xs text-muted-foreground px-3 mb-2 font-medium">
          {formatCurrency(totalValue, "EUR", true)}
        </p>
      )}

      {/* Droppable area */}
      <Droppable droppableId={stage}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 min-h-[120px] rounded-xl p-2 space-y-2 transition-colors",
              snapshot.isDraggingOver ? "bg-primary/5 border-2 border-dashed border-primary/30" : "bg-muted/20"
            )}
          >
            {deals.map((deal, i) => (
              <DealCard key={deal.id} deal={deal} index={i} />
            ))}
            {provided.placeholder}
            {deals.length === 0 && !snapshot.isDraggingOver && (
              <p className="text-xs text-muted-foreground/50 text-center py-4">Drop here</p>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
