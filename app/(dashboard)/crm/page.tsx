"use client";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KanbanBoard } from "@/components/crm/kanban-board";
import { getEnrichedDeals } from "@/data/seed-data";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

const ENRICHED_DEALS = getEnrichedDeals();

export default function CrmPage() {
  const totalPipeline = ENRICHED_DEALS
    .filter((d) => !["WON", "LOST"].includes(d.stage))
    .reduce((s, d) => s + (d.value ?? 0), 0);

  const totalWon = ENRICHED_DEALS
    .filter((d) => d.stage === "WON")
    .reduce((s, d) => s + (d.value ?? 0), 0);

  return (
    <div className="p-6 space-y-5 h-full flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4 shrink-0"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CRM Pipeline</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Drag &amp; drop deals between stages</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-xs text-muted-foreground">Active Pipeline</p>
            <p className="font-bold text-indigo-400">{formatCurrency(totalPipeline, "EUR", true)}</p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-xs text-muted-foreground">Won (LTA)</p>
            <p className="font-bold text-emerald-400">{formatCurrency(totalWon, "EUR", true)}</p>
          </div>
          <Button size="sm" onClick={() => toast.info("Create deal — coming soon in live version")}>
            <Plus size={14} />
            New Deal
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex-1 overflow-hidden"
      >
        <KanbanBoard />
      </motion.div>
    </div>
  );
}
