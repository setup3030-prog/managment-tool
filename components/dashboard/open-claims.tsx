import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getEnrichedClaims } from "@/data/seed-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Priority, ClaimStatus } from "@/types";
const ENRICHED_CLAIMS = getEnrichedClaims();

const openClaims = ENRICHED_CLAIMS
  .filter((c) => ["OPEN", "IN_PROGRESS"].includes(c.status))
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

const priorityVariant: Record<Priority, "danger" | "warning" | "info" | "secondary"> = {
  CRITICAL: "danger", HIGH: "warning", MEDIUM: "info", LOW: "secondary",
};

const statusColor: Record<ClaimStatus, string> = {
  OPEN: "text-red-400",
  IN_PROGRESS: "text-amber-400",
  RESOLVED: "text-emerald-400",
  CLOSED: "text-muted-foreground",
};

export function OpenClaims() {
  const totalValue = openClaims.reduce((sum, c) => sum + (c.value ?? 0), 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <ShieldAlert size={14} />
          Open Claims
          <span className="ml-auto text-xs font-semibold text-red-400">{formatCurrency(totalValue, "EUR", true)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {openClaims.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No open claims</p>
        ) : (
          <div className="space-y-1">
            {openClaims.slice(0, 6).map((claim) => (
              <Link key={claim.id} href={`/crm/${claim.customerId}`}>
                <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-accent transition-colors">
                  <Badge variant={priorityVariant[claim.priority]} className="shrink-0">{claim.priority.slice(0, 4)}</Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{claim.title}</p>
                    <p className="text-xs text-muted-foreground">{claim.customer?.name} · {formatDate(claim.createdAt)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {claim.value ? (
                      <p className="text-xs font-semibold text-red-400">{formatCurrency(claim.value, "EUR", true)}</p>
                    ) : null}
                    <p className={`text-xs font-medium ${statusColor[claim.status]}`}>{claim.status.replace("_", " ")}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
