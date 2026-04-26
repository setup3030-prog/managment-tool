import Link from "next/link";
import { AlertOctagon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getEnrichedClaims } from "@/data/seed-data";
import { formatCurrency } from "@/lib/utils";
import type { Priority } from "@/types";
const ENRICHED_CLAIMS = getEnrichedClaims();

const critical = ENRICHED_CLAIMS
  .filter((c) => ["OPEN", "IN_PROGRESS"].includes(c.status) && ["CRITICAL", "HIGH"].includes(c.priority))
  .sort((a, b) => {
    const order: Record<Priority, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return order[a.priority] - order[b.priority];
  })
  .slice(0, 5);

const priorityVariant: Record<Priority, "danger" | "warning" | "info" | "secondary"> = {
  CRITICAL: "danger",
  HIGH: "warning",
  MEDIUM: "info",
  LOW: "secondary",
};

export function CriticalIssues() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <AlertOctagon size={14} />
          Critical Issues
          {critical.length > 0 && (
            <Badge variant="danger" className="ml-auto">{critical.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {critical.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">No critical issues — all clear</p>
        )}
        {critical.map((claim) => (
          <Link key={claim.id} href={`/crm/${claim.customerId}`}>
            <div className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-accent transition-colors">
              <Badge variant={priorityVariant[claim.priority]} className="shrink-0 mt-0.5">{claim.priority}</Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight line-clamp-2">{claim.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{claim.customer?.name}</p>
              </div>
              {claim.value ? (
                <p className="text-xs font-semibold text-red-400 shrink-0">
                  {formatCurrency(claim.value, "EUR", true)}
                </p>
              ) : null}
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
