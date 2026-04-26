import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RfqForm } from "@/components/rfq/rfq-form";
import { RfqStatusBadge } from "@/components/rfq/rfq-status-badge";
import { getEnrichedRfqs } from "@/data/seed-data";
const ENRICHED_RFQS = getEnrichedRfqs();
import { formatCurrency, formatPct, formatDate } from "@/lib/utils";

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const rfq = ENRICHED_RFQS.find(r => r.id === id);
  return { title: rfq ? `${rfq.rfqNumber} – ${rfq.projectName}` : "RFQ" };
}

export default async function RfqDetailPage({ params }: Props) {
  const { id } = await params;
  const rfq = ENRICHED_RFQS.find(r => r.id === id);
  if (!rfq) notFound();

  return (
    <div className="p-6 space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/rfq">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground mt-1">
            <ArrowLeft size={14} />
            Back
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">{rfq.projectName}</h1>
            <RfqStatusBadge status={rfq.status} />
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
            <span className="font-mono">{rfq.rfqNumber}</span>
            <span>{rfq.customer?.flag} {rfq.customer?.name}</span>
            {rfq.dueDate && <span>Due: {formatDate(rfq.dueDate)}</span>}
            <span>Created: {formatDate(rfq.createdAt)}</span>
          </div>
        </div>
        <a href={`/api/rfq/${rfq.id}/pdf`} target="_blank" rel="noreferrer">
          <Button variant="outline" size="sm" className="gap-2 shrink-0">
            <FileDown size={14} />
            PDF
          </Button>
        </a>
      </div>

      {/* KPI summary bar */}
      {rfq.salesPrice && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Sales Price", value: formatCurrency(rfq.salesPrice, rfq.currency) },
            { label: "Annual Revenue", value: rfq.annualRevenue ? formatCurrency(rfq.annualRevenue, rfq.currency, true) : "—" },
            { label: "Gross Margin", value: rfq.grossMarginPct ? formatPct(rfq.grossMarginPct) : "—" },
            { label: "Annual Profit", value: rfq.annualProfit ? formatCurrency(rfq.annualProfit, rfq.currency, true) : "—" },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg border border-border bg-card p-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-lg font-bold mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      )}

      <RfqForm rfq={rfq} mode="edit" />
    </div>
  );
}
