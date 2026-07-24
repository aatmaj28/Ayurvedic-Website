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

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { user: true, items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="rounded-xl border bg-card">
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
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No orders yet.
              </TableCell>
            </TableRow>
          )}
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
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {next && (
                      <form action={advanceOrder.bind(null, order.id)}>
                        <Button size="sm" variant="outline" type="submit">
                          → {ORDER_STATUS_LABELS[next]}
                        </Button>
                      </form>
                    )}
                    {order.status !== "DELIVERED" &&
                      order.status !== "CANCELLED" && (
                        <form action={cancelOrder.bind(null, order.id)}>
                          <Button size="sm" variant="destructive" type="submit">
                            Cancel
                          </Button>
                        </form>
                      )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
