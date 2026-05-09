"use client";
import { useState, useCallback } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RfqColumn } from "./rfq-column";
import { RfqForm } from "@/components/forms/rfq-form";
import { useData } from "@/context/data-context";
import { toast } from "sonner";
import type { RFQ, RfqStatus } from "@/types";

const COLUMNS: { status: RfqStatus; label: string; color: string }[] = [
  { status: "DRAFT",     label: "Draft",     color: "bg-slate-400" },
  { status: "COSTING",   label: "Costing",   color: "bg-blue-400" },
  { status: "SENT",      label: "Sent",      color: "bg-indigo-400" },
  { status: "WON",       label: "Won",       color: "bg-emerald-500" },
  { status: "LOST",      label: "Lost",      color: "bg-red-500" },
  { status: "CANCELLED", label: "Cancelled", color: "bg-slate-500" },
];

export function RfqKanbanBoard() {
  const { rfqs, updateRfq } = useData();
  const [localStatuses, setLocalStatuses] = useState<Record<string, RfqStatus>>({});
  const [formOpen, setFormOpen] = useState(false);
  const [editingRfq, setEditingRfq] = useState<RFQ | undefined>();
  const [defaultStatus, setDefaultStatus] = useState<RfqStatus>("DRAFT");

  const getStatus = useCallback((id: string, original: RfqStatus): RfqStatus =>
    localStatuses[id] ?? original, [localStatuses]);

  const onDragEnd = useCallback((result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newStatus = destination.droppableId as RfqStatus;
    setLocalStatuses(prev => ({ ...prev, [draggableId]: newStatus }));
    updateRfq(draggableId, { status: newStatus });
    const label = COLUMNS.find(c => c.status === newStatus)?.label ?? newStatus;
    toast.success("RFQ przeniesione", { description: `Status: ${label}` });
  }, [updateRfq]);

  const handleEdit = useCallback((rfq: RFQ) => {
    setEditingRfq(rfq);
    setFormOpen(true);
  }, []);

  const handleAdd = useCallback((status: RfqStatus = "DRAFT") => {
    setEditingRfq(undefined);
    setDefaultStatus(status);
    setFormOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setFormOpen(false);
    setEditingRfq(undefined);
  }, []);

  const resolvedRfqs = rfqs.map(r => ({ ...r, status: getStatus(r.id, r.status) }));

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground">{rfqs.length} RFQs · przeciągnij kartę, aby zmienić status</p>
        <Button size="sm" onClick={() => handleAdd()} className="h-8 gap-1.5 text-xs">
          <Plus className="w-3.5 h-3.5" /> Nowe RFQ
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div
          className="flex gap-3 overflow-x-auto pb-4"
          style={{ minHeight: "calc(100vh - 16rem)" }}
        >
          {COLUMNS.map(({ status, label, color }) => (
            <RfqColumn
              key={status}
              status={status}
              label={label}
              color={color}
              rfqs={resolvedRfqs.filter(r => r.status === status)}
              onEdit={handleEdit}
              onAdd={handleAdd}
            />
          ))}
        </div>
      </DragDropContext>

      <RfqForm
        open={formOpen}
        onClose={handleClose}
        rfq={editingRfq}
        defaultStatus={defaultStatus}
      />
    </>
  );
}
