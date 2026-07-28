export const APPOINTMENT_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
] as const;

export const APPOINTMENT_STATUS = {
  SCHEDULED: "SCHEDULED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export const ORDER_STATUS_FLOW = [
  "PLACED",
  "CONFIRMED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const;

export type OrderStatus = (typeof ORDER_STATUS_FLOW)[number] | "CANCELLED";

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PLACED: "Order placed",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const DELIVERY_FEE_INR = 30;

export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export const BOOKING_MAX_ADVANCE_DAYS = 30;

export function bookingDateRange(): { minDate: string; maxDate: string } {
  const DAY_MS = 24 * 60 * 60 * 1000;
  const now = Date.now();
  return {
    minDate: new Date(now + DAY_MS).toISOString().slice(0, 10),
    maxDate: new Date(now + BOOKING_MAX_ADVANCE_DAYS * DAY_MS)
      .toISOString()
      .slice(0, 10),
  };
}

export function generateOrderNumber(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `KC-${yy}${mm}${dd}-${rand}`;
}
