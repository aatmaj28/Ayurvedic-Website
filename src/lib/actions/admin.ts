"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { sendPushToUser } from "@/lib/push";
import { sendEmailToUser } from "@/lib/email";
import {
  APPOINTMENT_STATUS,
  ORDER_STATUS_FLOW,
  ORDER_STATUS_LABELS,
  formatDate,
} from "@/lib/constants";

export async function updateAppointmentStatus(
  appointmentId: string,
  status: string
) {
  await requireAdmin();
  if (
    status !== APPOINTMENT_STATUS.COMPLETED &&
    status !== APPOINTMENT_STATUS.CANCELLED
  ) {
    return;
  }
  const appointment = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status },
    include: { branch: true },
  });

  const apptTitle =
    status === APPOINTMENT_STATUS.COMPLETED
      ? "Appointment completed"
      : "Appointment cancelled";
  const apptDetails = `${appointment.branch.name} · ${formatDate(appointment.date)} · ${appointment.slot}`;
  await sendPushToUser(appointment.userId, {
    title: apptTitle,
    body: apptDetails,
    url: "/account",
  });
  await sendEmailToUser(appointment.userId, {
    subject: `${apptTitle} — ${appointment.branch.name}`,
    heading: apptTitle,
    body: apptDetails,
    ctaLabel: "View my appointments",
    ctaPath: "/account",
  });

  revalidatePath("/admin/appointments");
  revalidatePath("/account");
}

export async function advanceOrder(orderId: string) {
  await requireAdmin();
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;

  const index = ORDER_STATUS_FLOW.indexOf(
    order.status as (typeof ORDER_STATUS_FLOW)[number]
  );
  if (index === -1 || index === ORDER_STATUS_FLOW.length - 1) return;

  const nextStatus = ORDER_STATUS_FLOW[index + 1];
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: nextStatus,
      events: { create: [{ status: nextStatus }] },
    },
  });

  await sendPushToUser(order.userId, {
    title: `Order ${order.number}`,
    body: ORDER_STATUS_LABELS[nextStatus],
    url: `/account/orders/${orderId}`,
  });
  await sendEmailToUser(order.userId, {
    subject: `Order ${order.number}: ${ORDER_STATUS_LABELS[nextStatus]}`,
    heading: ORDER_STATUS_LABELS[nextStatus],
    body: `Your order <strong>${order.number}</strong> is now: <strong>${ORDER_STATUS_LABELS[nextStatus]}</strong>.`,
    ctaLabel: "Track my order",
    ctaPath: `/account/orders/${orderId}`,
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath("/account");
}

export async function cancelOrder(orderId: string) {
  await requireAdmin();
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.status === "DELIVERED" || order.status === "CANCELLED") {
    return;
  }
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "CANCELLED",
      events: { create: [{ status: "CANCELLED", note: "Cancelled by clinic" }] },
    },
  });

  await sendPushToUser(order.userId, {
    title: `Order ${order.number}`,
    body: ORDER_STATUS_LABELS.CANCELLED,
    url: `/account/orders/${orderId}`,
  });
  await sendEmailToUser(order.userId, {
    subject: `Order ${order.number}: ${ORDER_STATUS_LABELS.CANCELLED}`,
    heading: "Order cancelled",
    body: `Your order <strong>${order.number}</strong> has been cancelled by the clinic. If you have questions, just reply to this email or call your nearest centre.`,
    ctaLabel: "View order",
    ctaPath: `/account/orders/${orderId}`,
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath("/account");
}

export async function toggleMessageRead(messageId: string) {
  await requireAdmin();
  const message = await prisma.contactMessage.findUnique({
    where: { id: messageId },
  });
  if (!message) return;
  await prisma.contactMessage.update({
    where: { id: messageId },
    data: { read: !message.read },
  });
  revalidatePath("/admin/messages");
}
