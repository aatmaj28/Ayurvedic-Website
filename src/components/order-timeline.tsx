import { Check, Circle, X } from "lucide-react";
import { ORDER_STATUS_FLOW, formatDateTime } from "@/lib/constants";
import { getDictionary } from "@/i18n";
import { cn } from "@/lib/utils";

type TimelineEvent = {
  status: string;
  note: string | null;
  createdAt: Date;
};

export async function OrderTimeline({
  events,
  currentStatus,
}: {
  events: TimelineEvent[];
  currentStatus: string;
}) {
  const dict = await getDictionary();
  const eventsByStatus = new Map(events.map((event) => [event.status, event]));
  const cancelled = currentStatus === "CANCELLED";
  const cancelEvent = eventsByStatus.get("CANCELLED");

  return (
    <ol className="space-y-0">
      {ORDER_STATUS_FLOW.map((status, index) => {
        const event = eventsByStatus.get(status);
        const reached = Boolean(event);
        const isLast = index === ORDER_STATUS_FLOW.length - 1;
        if (cancelled && !reached) return null;

        return (
          <li key={status} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && !cancelled && (
              <span
                className={cn(
                  "absolute top-7 left-[13px] h-[calc(100%-1.75rem)] w-0.5",
                  reached && eventsByStatus.get(ORDER_STATUS_FLOW[index + 1])
                    ? "bg-primary"
                    : "bg-border"
                )}
                aria-hidden
              />
            )}
            <span
              className={cn(
                "z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2",
                reached
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground"
              )}
            >
              {reached ? (
                <Check className="size-4" aria-hidden />
              ) : (
                <Circle className="size-2 fill-current" aria-hidden />
              )}
            </span>
            <div className="pt-0.5">
              <p className={cn("text-sm font-medium", !reached && "text-muted-foreground")}>
                {dict.status[status]}
              </p>
              {event && (
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(event.createdAt)}
                  {event.note ? ` · ${event.note}` : ""}
                </p>
              )}
            </div>
          </li>
        );
      })}
      {cancelled && (
        <li className="relative flex gap-4">
          <span className="z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-destructive bg-destructive text-white">
            <X className="size-4" aria-hidden />
          </span>
          <div className="pt-0.5">
            <p className="text-sm font-medium text-destructive">
              {dict.status.CANCELLED}
            </p>
            {cancelEvent && (
              <p className="text-xs text-muted-foreground">
                {formatDateTime(cancelEvent.createdAt)}
                {cancelEvent.note ? ` · ${cancelEvent.note}` : ""}
              </p>
            )}
          </div>
        </li>
      )}
    </ol>
  );
}
