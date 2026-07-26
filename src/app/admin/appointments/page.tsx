import type { Metadata } from "next";
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
import { updateAppointmentStatus } from "@/lib/actions/admin";
import { APPOINTMENT_STATUS, formatDate } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/i18n";

export const metadata: Metadata = {
  title: "Admin · Appointments",
};

function AppointmentActions({
  appointmentId,
  status,
  completeLabel,
  cancelLabel,
  className,
}: {
  appointmentId: string;
  status: string;
  completeLabel: string;
  cancelLabel: string;
  className?: string;
}) {
  if (status !== APPOINTMENT_STATUS.SCHEDULED) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }
  return (
    <div className={className}>
      <form
        action={updateAppointmentStatus.bind(
          null,
          appointmentId,
          APPOINTMENT_STATUS.COMPLETED
        )}
      >
        <Button size="sm" variant="outline" type="submit">
          {completeLabel}
        </Button>
      </form>
      <form
        action={updateAppointmentStatus.bind(
          null,
          appointmentId,
          APPOINTMENT_STATUS.CANCELLED
        )}
      >
        <Button size="sm" variant="destructive" type="submit">
          {cancelLabel}
        </Button>
      </form>
    </div>
  );
}

export default async function AdminAppointmentsPage() {
  const [appointments, dict] = await Promise.all([
    prisma.appointment.findMany({
      include: { user: true, branch: true },
      orderBy: [{ date: "asc" }, { slot: "asc" }],
    }),
    getDictionary(),
  ]);
  const t = dict.admin;

  if (appointments.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center text-muted-foreground">
        {t.noApptsYet}
      </div>
    );
  }

  return (
    <>
      {/* Mobile: stacked cards */}
      <div className="space-y-4 md:hidden">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="rounded-xl border bg-card p-4 text-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{appointment.user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {appointment.user.email}
                </p>
              </div>
              <StatusBadge status={appointment.status} />
            </div>
            <p className="mt-2 text-muted-foreground">
              {appointment.branch.city} · {formatDate(appointment.date)} ·{" "}
              {appointment.slot}
            </p>
            <AppointmentActions
              appointmentId={appointment.id}
              status={appointment.status}
              completeLabel={t.markCompleted}
              cancelLabel={t.cancel}
              className="mt-3 flex flex-wrap gap-2"
            />
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.colPatient}</TableHead>
              <TableHead>{t.colCentre}</TableHead>
              <TableHead>{t.colDateSlot}</TableHead>
              <TableHead>{t.colStatus}</TableHead>
              <TableHead className="text-right">{t.colActions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>
                  <p className="font-medium">{appointment.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {appointment.user.email}
                  </p>
                </TableCell>
                <TableCell>{appointment.branch.city}</TableCell>
                <TableCell>
                  {formatDate(appointment.date)} · {appointment.slot}
                </TableCell>
                <TableCell>
                  <StatusBadge status={appointment.status} />
                </TableCell>
                <TableCell>
                  <AppointmentActions
                    appointmentId={appointment.id}
                    status={appointment.status}
                    completeLabel={t.markCompleted}
                    cancelLabel={t.cancel}
                    className="flex justify-end gap-2"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
