import { Badge } from "@/components/ui/badge";
import type { RfqStatus } from "@/types";

const STATUS_CONFIG: Record<RfqStatus, { label: string; variant: "secondary" | "info" | "warning" | "purple" | "success" | "danger" | "outline" }> = {
  NEW: { label: "New", variant: "secondary" },
  COSTING: { label: "Costing", variant: "info" },
  WAITING_FOR_SUPPLIER: { label: "Waiting", variant: "warning" },
  SENT: { label: "Sent", variant: "purple" },
  NEGOTIATION: { label: "Negotiation", variant: "warning" },
  WON: { label: "Won", variant: "success" },
  LOST: { label: "Lost", variant: "danger" },
};

interface RfqStatusBadgeProps {
  status: RfqStatus;
  small?: boolean;
}

export function RfqStatusBadge({ status, small }: RfqStatusBadgeProps) {
  const { label, variant } = STATUS_CONFIG[status];
  return (
    <Badge variant={variant} className={small ? "text-[10px] px-1.5 py-0" : ""}>
      {label}
    </Badge>
  );
}
