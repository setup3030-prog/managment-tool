import Link from "next/link";
import { Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getEnrichedRfqs } from "@/data/seed-data";
import { formatDate, daysUntil } from "@/lib/utils";
import { cn } from "@/lib/utils";
const ENRICHED_RFQS = getEnrichedRfqs();

const upcoming = ENRICHED_RFQS
  .filter((r) => r.dueDate && ["SENT", "NEGOTIATION", "COSTING", "NEW", "WAITING_FOR_SUPPLIER"].includes(r.status))
  .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
  .slice(0, 6);

export function UpcomingLaunches() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <Clock size={14} />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {upcoming.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">No upcoming deadlines</p>
        )}
        {upcoming.map((rfq) => {
          const days = rfq.dueDate ? daysUntil(rfq.dueDate) : null;
          const urgency = days === null ? "normal" : days < 0 ? "overdue" : days <= 7 ? "critical" : days <= 14 ? "warning" : "normal";
          return (
            <Link key={rfq.id} href={`/rfq/${rfq.id}`}>
              <div className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent",
                urgency === "overdue" && "bg-red-500/5 border border-red-500/20",
                urgency === "critical" && "bg-amber-500/5"
              )}>
                {urgency !== "normal" && <AlertTriangle size={13} className={urgency === "overdue" ? "text-red-400 shrink-0" : "text-amber-400 shrink-0"} />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{rfq.projectName}</p>
                  <p className="text-xs text-muted-foreground truncate">{rfq.customer?.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={cn("text-xs font-semibold",
                    urgency === "overdue" ? "text-red-400" :
                    urgency === "critical" ? "text-amber-400" : "text-muted-foreground"
                  )}>
                    {days === null ? "—" : days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Today" : `${days}d`}
                  </p>
                  <p className="text-xs text-muted-foreground">{rfq.dueDate ? formatDate(rfq.dueDate) : "—"}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
