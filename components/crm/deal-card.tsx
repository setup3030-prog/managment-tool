"use client";
import { Draggable } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, User, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { PipelineDeal } from "@/types";
import { cn } from "@/lib/utils";

interface DealCardProps {
  deal: PipelineDeal;
  index: number;
}

const probabilityColor = (p: number) =>
  p >= 75 ? "text-emerald-400" : p >= 40 ? "text-amber-400" : "text-muted-foreground";

export function DealCard({ deal, index }: DealCardProps) {
  return (
    <Draggable draggableId={deal.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "rounded-lg border border-border bg-card p-3 cursor-grab active:cursor-grabbing transition-shadow",
            snapshot.isDragging && "shadow-lg border-primary/40 rotate-1"
          )}
        >
          <Link href={`/crm/${deal.customerId}`} onClick={(e) => snapshot.isDragging && e.preventDefault()}>
            <div className="space-y-2">
              <p className="text-sm font-semibold leading-tight line-clamp-2">{deal.title}</p>
              <p className="text-xs text-muted-foreground">{deal.customer?.flag} {deal.customer?.name}</p>

              {deal.value && (
                <p className="text-sm font-bold text-indigo-400">
                  {formatCurrency(deal.value, "EUR", true)}
                </p>
              )}

              <div className="flex items-center gap-3 text-xs">
                {deal.probability !== undefined && (
                  <span className={cn("flex items-center gap-1 font-medium", probabilityColor(deal.probability))}>
                    <TrendingUp size={11} />
                    {deal.probability}%
                  </span>
                )}
                {deal.expectedClose && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Calendar size={11} />
                    {formatDate(deal.expectedClose)}
                  </span>
                )}
              </div>

              {deal.assignedTo && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <User size={11} />
                  {deal.assignedTo}
                </div>
              )}
            </div>
          </Link>
        </div>
      )}
    </Draggable>
  );
}
