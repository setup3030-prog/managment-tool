import Link from "next/link";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEnrichedRfqs } from "@/data/seed-data";
import { formatCurrency, formatPct, formatDate } from "@/lib/utils";
import { RfqStatusBadge } from "@/components/rfq/rfq-status-badge";
const ENRICHED_RFQS = getEnrichedRfqs();

const recent = ENRICHED_RFQS
  .filter((r) => r.sentAt || r.createdAt)
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  .slice(0, 6);

export function RecentQuotations() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <FileText size={14} />
          Recent Quotations
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1">
          {recent.map((rfq) => (
            <Link key={rfq.id} href={`/rfq/${rfq.id}`}>
              <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-accent transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-mono text-muted-foreground">{rfq.rfqNumber}</p>
                    <RfqStatusBadge status={rfq.status} small />
                  </div>
                  <p className="text-sm font-medium truncate mt-0.5">{rfq.projectName}</p>
                  <p className="text-xs text-muted-foreground">{rfq.customer?.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold">{rfq.annualRevenue ? formatCurrency(rfq.annualRevenue, "EUR", true) : "—"}</p>
                  <p className="text-xs text-muted-foreground">{rfq.grossMarginPct ? formatPct(rfq.grossMarginPct) : "—"}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
