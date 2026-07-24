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

export const metadata: Metadata = {
  title: "Admin · Appointments",
};

export default async function AdminAppointmentsPage() {
  const appointments = await prisma.appointment.findMany({
    include: { user: true, branch: true },
    orderBy: [{ date: "asc" }, { slot: "asc" }],
  });

  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>Centre</TableHead>
            <TableHead>Date &amp; slot</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No appointments yet.
              </TableCell>
            </TableRow>
          )}
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
              <TableCell className="text-right">
                {appointment.status === APPOINTMENT_STATUS.SCHEDULED && (
                  <div className="flex justify-end gap-2">
                    <form
                      action={updateAppointmentStatus.bind(
                        null,
                        appointment.id,
                        APPOINTMENT_STATUS.COMPLETED
                      )}
                    >
                      <Button size="sm" variant="outline" type="submit">
                        Mark completed
                      </Button>
                    </form>
                    <form
                      action={updateAppointmentStatus.bind(
                        null,
                        appointment.id,
                        APPOINTMENT_STATUS.CANCELLED
                      )}
                    >
                      <Button size="sm" variant="destructive" type="submit">
                        Cancel
                      </Button>
                    </form>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
