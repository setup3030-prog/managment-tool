"use client";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Download } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RfqTable } from "@/components/rfq/rfq-table";
import { RfqFilters } from "@/components/rfq/rfq-filters";
import { getEnrichedRfqs } from "@/data/seed-data";
const ENRICHED_RFQS = getEnrichedRfqs();
import type { RfqStatus } from "@/types";
import { toast } from "sonner";

function exportCsv(rfqs: typeof ENRICHED_RFQS) {
  const headers = ["RFQ #", "Customer", "Project", "Status", "Annual Revenue", "Margin %", "Due Date", "Created"];
  const rows = rfqs.map((r) => [
    r.rfqNumber,
    r.customer?.name ?? "",
    r.projectName,
    r.status,
    r.annualRevenue?.toFixed(2) ?? "",
    r.grossMarginPct?.toFixed(1) ?? "",
    r.dueDate?.slice(0, 10) ?? "",
    r.createdAt.slice(0, 10),
  ]);
  const csv = [headers, ...rows].map((row) => row.map((v) => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `rfq-export-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function RfqPageInner() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const customerFilter = searchParams.get("customer") ?? "";
  const statusFilter = searchParams.get("status") as RfqStatus | null;

  const filtered = ENRICHED_RFQS.filter((r) => {
    if (customerFilter && r.customerId !== customerFilter) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    if (search && !r.projectName.toLowerCase().includes(search) && !r.rfqNumber.toLowerCase().includes(search) && !r.customer?.name.toLowerCase().includes(search)) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">RFQ / Quoting</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage and track all quotations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { exportCsv(filtered); toast.success("CSV exported"); }}>
            <Download size={14} />
            Export CSV
          </Button>
          <Link href="/rfq/new">
            <Button size="sm">
              <Plus size={14} />
              New RFQ
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-4"
      >
        {[
          { label: "Total", value: ENRICHED_RFQS.length, color: "" },
          { label: "Won", value: ENRICHED_RFQS.filter(r => r.status === "WON").length, color: "text-emerald-400" },
          { label: "Lost", value: ENRICHED_RFQS.filter(r => r.status === "LOST").length, color: "text-red-400" },
          { label: "In Progress", value: ENRICHED_RFQS.filter(r => !["WON","LOST"].includes(r.status)).length, color: "text-amber-400" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{s.label}:</span>
            <span className={`font-bold ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </motion.div>

      <Suspense><RfqFilters /></Suspense>
      <RfqTable rfqs={filtered} />
    </div>
  );
}

export default function RfqPage() {
  return (
    <Suspense>
      <RfqPageInner />
    </Suspense>
  );
}
