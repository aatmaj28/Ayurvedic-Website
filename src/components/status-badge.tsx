import { Badge } from "@/components/ui/badge";
import { getDictionary } from "@/i18n";
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

export async function StatusBadge({ status }: { status: string }) {
  const dict = await getDictionary();
  const label = dict.status[status as keyof typeof dict.status] ?? status;
  return (
    <Badge variant="outline" className={cn(STYLES[status])}>
      {label}
    </Badge>
  );
}
