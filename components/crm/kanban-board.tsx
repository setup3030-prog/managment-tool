"use client";
import { useState, useCallback } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { KanbanColumn } from "./kanban-column";
import { getEnrichedDeals } from "@/data/seed-data";
const ENRICHED_DEALS = getEnrichedDeals();
import type { PipelineDeal, DealStage } from "@/types";
import { toast } from "sonner";

const STAGES: { stage: DealStage; label: string; color: string }[] = [
  { stage: "LEAD", label: "Lead", color: "bg-slate-400" },
  { stage: "QUALIFIED", label: "Qualified", color: "bg-blue-400" },
  { stage: "PROPOSAL", label: "Proposal", color: "bg-indigo-400" },
  { stage: "NEGOTIATION", label: "Negotiation", color: "bg-amber-400" },
  { stage: "WON", label: "Won", color: "bg-emerald-500" },
  { stage: "LOST", label: "Lost", color: "bg-red-500" },
];

export function KanbanBoard() {
  const [deals, setDeals] = useState<PipelineDeal[]>(ENRICHED_DEALS);

  const onDragEnd = useCallback((result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newStage = destination.droppableId as DealStage;
    setDeals((prev) =>
      prev.map((d) => d.id === draggableId ? { ...d, stage: newStage } : d)
    );
    toast.success("Deal moved", { description: `Moved to ${STAGES.find(s => s.stage === newStage)?.label}` });
  }, []);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-200px)]">
        {STAGES.map(({ stage, label, color }) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            label={label}
            color={color}
            deals={deals.filter((d) => d.stage === stage).sort((a, b) => a.position - b.position)}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
