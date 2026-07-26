import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, formatInr } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/i18n";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminOverviewPage() {
  const [appointments, orders, unreadMessages, dict] = await Promise.all([
    prisma.appointment.findMany({
      include: { user: true, branch: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.order.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.contactMessage.count({ where: { read: false } }),
    getDictionary(),
  ]);
  const t = dict.admin;

  return (
    <div className="space-y-8">
      {unreadMessages > 0 && (
        <Card>
          <CardContent className="flex items-center justify-between gap-4">
            <p className="text-sm">
              {t.youHave} <strong>{unreadMessages}</strong>{" "}
              {unreadMessages === 1 ? t.unreadOne : t.unreadMany}
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/messages">
                {t.read} <ArrowRight data-icon="inline-end" aria-hidden />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">
              {t.recentAppts}
            </CardTitle>
            <CardDescription>
              <Link href="/admin/appointments" className="hover:text-foreground">
                {t.viewAll}
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {appointments.length === 0 && (
              <p className="text-sm text-muted-foreground">{t.noApptsYet}</p>
            )}
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{appointment.user.name}</p>
                  <p className="truncate text-muted-foreground">
                    {appointment.branch.city} · {formatDate(appointment.date)}{" "}
                    {appointment.slot}
                  </p>
                </div>
                <StatusBadge status={appointment.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">
              {t.recentOrders}
            </CardTitle>
            <CardDescription>
              <Link href="/admin/orders" className="hover:text-foreground">
                {t.viewAll}
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {orders.length === 0 && (
              <p className="text-sm text-muted-foreground">{t.noOrdersYet}</p>
            )}
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{order.number}</p>
                  <p className="truncate text-muted-foreground">
                    {order.user.name} · {formatInr(order.totalInr)}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
