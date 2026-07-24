import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarCheck, CheckCircle2, Package } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { cancelAppointment } from "@/lib/actions/appointments";
import { APPOINTMENT_STATUS, formatDate, formatInr } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "My Dashboard",
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ booked?: string }>;
}) {
  const session = await requireSession();
  const { booked } = await searchParams;

  const [appointments, orders] = await Promise.all([
    prisma.appointment.findMany({
      where: { userId: session.user.id },
      include: { branch: true },
      orderBy: { date: "desc" },
    }),
    prisma.order.findMany({
      where: { userId: session.user.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const firstName = session.user.name.split(" ")[0];

  return (
    <div className="container mx-auto max-w-4xl space-y-10 px-4 py-12">
      <div>
        <h1 className="font-heading text-3xl font-semibold">
          Namaste, {firstName}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Your appointments and medicine orders, all in one place.
        </p>
      </div>

      {booked === "1" && (
        <Alert>
          <CheckCircle2 aria-hidden />
          <AlertTitle>Appointment booked!</AlertTitle>
          <AlertDescription>
            We look forward to seeing you. The consultation fee is payable at
            the centre.
          </AlertDescription>
        </Alert>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-heading text-xl font-semibold">
            <CalendarCheck className="size-5 text-primary" aria-hidden />
            My appointments
          </h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/book">Book new</Link>
          </Button>
        </div>
        {appointments.length === 0 ? (
          <Card>
            <CardHeader>
              <CardDescription>
                No appointments yet.{" "}
                <Link href="/book" className="text-primary underline-offset-4 hover:underline">
                  Book your first consultation
                </Link>
                .
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      {appointment.branch.name} · {formatDate(appointment.date)}{" "}
                      at {appointment.slot}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.branch.address}
                    </p>
                    {appointment.notes && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Note: {appointment.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={appointment.status} />
                    {appointment.status === APPOINTMENT_STATUS.SCHEDULED && (
                      <form
                        action={async () => {
                          "use server";
                          await cancelAppointment(appointment.id);
                        }}
                      >
                        <Button variant="destructive" size="sm" type="submit">
                          Cancel
                        </Button>
                      </form>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-heading text-xl font-semibold">
            <Package className="size-5 text-primary" aria-hidden />
            My orders
          </h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/medicine">Order medicine</Link>
          </Button>
        </div>
        {orders.length === 0 ? (
          <Card>
            <CardHeader>
              <CardDescription>
                No orders yet.{" "}
                <Link href="/medicine" className="text-primary underline-offset-4 hover:underline">
                  Browse medicine kits
                </Link>
                .
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link key={order.id} href={`/account/orders/${order.id}`} className="block">
                <Card className="transition-colors hover:border-primary/50">
                  <CardContent className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{order.number}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.items
                          .map((item) => `${item.product.name} × ${item.quantity}`)
                          .join(", ")}{" "}
                        · {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{formatInr(order.totalInr)}</span>
                      <StatusBadge status={order.status} />
                      <ArrowRight className="size-4 text-muted-foreground" aria-hidden />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
