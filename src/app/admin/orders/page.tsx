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
import {
  ORDER_STATUS_FLOW,
  ORDER_STATUS_LABELS,
  formatDate,
  formatInr,
} from "@/lib/constants";
import { prisma } from "@/lib/prisma";

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
  className,
}: {
  orderId: string;
  status: string;
  next: string | null;
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
            → {ORDER_STATUS_LABELS[next]}
          </Button>
        </form>
      )}
      {status !== "DELIVERED" && status !== "CANCELLED" && (
        <form action={cancelOrder.bind(null, orderId)}>
          <Button size="sm" variant="destructive" type="submit">
            Cancel
          </Button>
        </form>
      )}
    </div>
  );
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { user: true, items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center text-muted-foreground">
        No orders yet.
      </div>
    );
  }

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
                {formatDate(order.createdAt)} ·{" "}
                {order.items
                  .map((item) => `${item.product.name} × ${item.quantity}`)
                  .join(", ")}
              </p>
              <OrderActions
                orderId={order.id}
                status={order.status}
                next={next}
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
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                      {formatDate(order.createdAt)} ·{" "}
                      {order.items
                        .map((item) => `${item.product.name} × ${item.quantity}`)
                        .join(", ")}
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
