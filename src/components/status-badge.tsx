import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  SCHEDULED: "bg-primary/10 text-primary border-transparent",
  COMPLETED: "bg-primary text-primary-foreground border-transparent",
  PLACED: "bg-accent text-accent-foreground border-transparent",
  CONFIRMED: "bg-primary/10 text-primary border-transparent",
  SHIPPED: "bg-primary/10 text-primary border-transparent",
  OUT_FOR_DELIVERY: "bg-primary/10 text-primary border-transparent",
  DELIVERED: "bg-primary text-primary-foreground border-transparent",
  CANCELLED: "bg-destructive/10 text-destructive border-transparent",
};

const LABELS: Record<string, string> = {
  ...ORDER_STATUS_LABELS,
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn(STYLES[status])}>
      {LABELS[status] ?? status}
    </Badge>
  );
}
