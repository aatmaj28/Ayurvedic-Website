import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OrderTimeline } from "@/components/order-timeline";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, formatInr } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { getDictionary } from "@/i18n";

export const metadata: Metadata = {
  title: "Order Details",
};

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  const session = await requireSession();
  const [{ id }, { placed }, dict] = await Promise.all([
    params,
    searchParams,
    getDictionary(),
  ]);
  const t = dict.account;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      events: { orderBy: { createdAt: "asc" } },
    },
  });

  if (
    !order ||
    (order.userId !== session.user.id && session.user.role !== "admin")
  ) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-3xl space-y-6 px-4 py-12">
      <Button asChild variant="ghost" size="sm">
        <Link href="/account">
          <ArrowLeft data-icon="inline-start" aria-hidden /> {t.backToDashboard}
        </Link>
      </Button>

      {placed === "1" && (
        <Alert>
          <CheckCircle2 aria-hidden />
          <AlertTitle>{t.placedTitle}</AlertTitle>
          <AlertDescription>{t.placedBody}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-semibold">{order.number}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t.placedOn} {formatDate(order.createdAt)} · {t.paymentRef}:{" "}
            {order.paymentRef}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">{t.tracking}</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderTimeline events={order.events} currentStatus={order.status} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">{t.items}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>
                    {item.product.name} × {item.quantity}
                  </span>
                  <span>{formatInr(item.unitPriceInr * item.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between text-muted-foreground">
                <span>{t.delivery}</span>
                <span>{dict.common.free}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>{t.total}</span>
                <span>{formatInr(order.totalInr)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">
                {t.deliveryAddress}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{order.shippingName}</p>
              <p>{order.shippingLine1}</p>
              {order.shippingLine2 && <p>{order.shippingLine2}</p>}
              <p>
                {order.shippingCity}, {order.shippingState} —{" "}
                {order.shippingPincode}
              </p>
              <p className="mt-2">{order.shippingPhone}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
