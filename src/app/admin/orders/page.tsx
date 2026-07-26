import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { advanceOrder, cancelOrder } from "@/lib/actions/admin";
import { ORDER_STATUS_FLOW, formatDate, formatInr } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/i18n";

export const metadata: Metadata = {
  title: "Admin · Orders",
};

function nextStatus(status: string): string | null {
  const index = ORDER_STATUS_FLOW.indexOf(
    status as (typeof ORDER_STATUS_FLOW)[number]
  );
  if (index === -1 || index === ORDER_STATUS_FLOW.length - 1) return null;
  return ORDER_STATUS_FLOW[index + 1];
}

function OrderActions({
  orderId,
  status,
  next,
  nextLabel,
  cancelLabel,
  className,
}: {
  orderId: string;
  status: string;
  next: string | null;
  nextLabel: string | null;
  cancelLabel: string;
  className?: string;
}) {
  if (!next && (status === "DELIVERED" || status === "CANCELLED")) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }
  return (
    <div className={className}>
      {next && (
        <form action={advanceOrder.bind(null, orderId)}>
          <Button size="sm" variant="outline" type="submit">
            → {nextLabel}
          </Button>
        </form>
      )}
      {status !== "DELIVERED" && status !== "CANCELLED" && (
        <form action={cancelOrder.bind(null, orderId)}>
          <Button size="sm" variant="destructive" type="submit">
            {cancelLabel}
          </Button>
        </form>
      )}
    </div>
  );
}

export default async function AdminOrdersPage() {
  const [orders, dict] = await Promise.all([
    prisma.order.findMany({
      include: { user: true, items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    }),
    getDictionary(),
  ]);
  const t = dict.admin;

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center text-muted-foreground">
        {t.noOrdersYet}
      </div>
    );
  }

  const itemsSummary = (
    items: { product: { name: string }; quantity: number }[]
  ) => items.map((item) => `${item.product.name} × ${item.quantity}`).join(", ");

  return (
    <>
      {/* Mobile: stacked cards */}
      <div className="space-y-4 md:hidden">
        {orders.map((order) => {
          const next = nextStatus(order.status);
          return (
            <div
              key={order.id}
              className="rounded-xl border bg-card p-4 text-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={`/account/orders/${order.id}`}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  {order.number}
                </Link>
                <StatusBadge status={order.status} />
              </div>
              <p className="mt-1 text-muted-foreground">
                {order.user.name} · {order.shippingCity} ·{" "}
                {formatInr(order.totalInr)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDate(order.createdAt)} · {itemsSummary(order.items)}
              </p>
              <OrderActions
                orderId={order.id}
                status={order.status}
                next={next}
                nextLabel={
                  next ? dict.status[next as keyof typeof dict.status] : null
                }
                cancelLabel={t.cancel}
                className="mt-3 flex flex-wrap gap-2"
              />
            </div>
          );
        })}
      </div>

      {/* Desktop: table */}
      <div className="hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.colOrder}</TableHead>
              <TableHead>{t.colCustomer}</TableHead>
              <TableHead>{t.colTotal}</TableHead>
              <TableHead>{t.colStatus}</TableHead>
              <TableHead className="text-right">{t.colActions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const next = nextStatus(order.status);
              return (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {order.number}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(order.createdAt)} · {itemsSummary(order.items)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p>{order.user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.shippingCity}
                    </p>
                  </TableCell>
                  <TableCell>{formatInr(order.totalInr)}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    <OrderActions
                      orderId={order.id}
                      status={order.status}
                      next={next}
                      nextLabel={
                        next
                          ? dict.status[next as keyof typeof dict.status]
                          : null
                      }
                      cancelLabel={t.cancel}
                      className="flex justify-end gap-2"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
