"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { sendPushToUser } from "@/lib/push";
import { sendEmailToUser } from "@/lib/email";
import {
  APPOINTMENT_SLOTS,
  APPOINTMENT_STATUS,
  formatDate,
} from "@/lib/constants";

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_ADVANCE_DAYS = 30;

const bookingSchema = z.object({
  branchId: z.string().min(1, "Please choose a centre."),
  date: z.iso.date("Please choose a date."),
  slot: z.enum(APPOINTMENT_SLOTS, "Please choose a time slot."),
  notes: z.string().trim().max(500, "Notes are too long.").optional(),
});

export type BookingFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"branchId" | "date" | "slot" | "notes", string>>;
};

function startOfTodayUtc(): number {
  const now = new Date();
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

export async function createAppointment(
  _prevState: BookingFormState,
  formData: FormData
): Promise<BookingFormState> {
  const session = await requireSession();

  const parsed = bookingSchema.safeParse({
    branchId: formData.get("branchId"),
    date: formData.get("date"),
    slot: formData.get("slot"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: BookingFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof NonNullable<
        BookingFormState["fieldErrors"]
      >;
      fieldErrors[field] ??= issue.message;
    }
    return { status: "error", fieldErrors };
  }

  const date = new Date(`${parsed.data.date}T00:00:00.000Z`);
  const today = startOfTodayUtc();
  if (date.getTime() <= today) {
    return {
      status: "error",
      fieldErrors: { date: "Please choose a date from tomorrow onwards." },
    };
  }
  if (date.getTime() > today + MAX_ADVANCE_DAYS * DAY_MS) {
    return {
      status: "error",
      fieldErrors: {
        date: `Bookings open ${MAX_ADVANCE_DAYS} days in advance.`,
      },
    };
  }

  const branch = await prisma.branch.findUnique({
    where: { id: parsed.data.branchId },
  });
  if (!branch) {
    return { status: "error", fieldErrors: { branchId: "Unknown centre." } };
  }

  const slotTaken = await prisma.appointment.findFirst({
    where: {
      branchId: branch.id,
      date,
      slot: parsed.data.slot,
      status: APPOINTMENT_STATUS.SCHEDULED,
    },
  });
  if (slotTaken) {
    return {
      status: "error",
      fieldErrors: {
        slot: "That slot was just booked — please pick another.",
      },
    };
  }

  await prisma.appointment.create({
    data: {
      userId: session.user.id,
      branchId: branch.id,
      date,
      slot: parsed.data.slot,
      notes: parsed.data.notes || null,
    },
  });

  await sendPushToUser(session.user.id, {
    title: "Appointment booked ✅",
    body: `${branch.name} · ${formatDate(date)} · ${parsed.data.slot}`,
    url: "/account",
  });
  await sendEmailToUser(session.user.id, {
    subject: `Appointment confirmed — ${branch.name}, ${formatDate(date)}`,
    heading: "Your consultation is booked ✅",
    body: `We look forward to seeing you at <strong>${branch.name}</strong> on <strong>${formatDate(date)}</strong> at <strong>${parsed.data.slot}</strong>.<br/><br/>${branch.address}<br/><br/>The consultation fee of ₹${branch.consultationFee} is payable at the centre. If you can't make it, you can cancel from your dashboard.`,
    ctaLabel: "View my appointments",
    ctaPath: "/account",
  });

  revalidatePath("/account");
  redirect("/account?booked=1");
}

export async function cancelAppointment(appointmentId: string) {
  const session = await requireSession();

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });
  if (!appointment || appointment.userId !== session.user.id) {
    return { ok: false as const, message: "Appointment not found." };
  }
  if (appointment.status !== APPOINTMENT_STATUS.SCHEDULED) {
    return {
      ok: false as const,
      message: "Only scheduled appointments can be cancelled.",
    };
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: APPOINTMENT_STATUS.CANCELLED },
  });

  revalidatePath("/account");
  return { ok: true as const };
}
