"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { APPOINTMENT_STATUS, ORDER_STATUS_FLOW } from "@/lib/constants";

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
  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status },
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
