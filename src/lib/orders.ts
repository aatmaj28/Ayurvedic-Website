import "server-only";
import type Stripe from "stripe";
import { z } from "zod";
import { prisma } from "./prisma";
import { sendPushToUser } from "./push";
import { generateOrderNumber } from "./constants";

export const checkoutSchema = z.object({
  productSlug: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(5),
  name: z.string().trim().min(2, "Please enter the recipient's name."),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s-]{8,16}$/, "Please enter a valid phone number."),
  line1: z.string().trim().min(3, "Please enter the street address."),
  line2: z.string().trim().max(120).optional().or(z.literal("")),
  city: z.string().trim().min(2, "Please enter the city."),
  state: z.string().trim().min(2, "Please enter the state."),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "PIN code must be 6 digits."),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export type CheckoutField =
  | "quantity"
  | "name"
  | "phone"
  | "line1"
  | "line2"
  | "city"
  | "state"
  | "pincode";

export type CheckoutFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<CheckoutField, string>>;
};

export function parseCheckout(
  formData: FormData
):
  | { ok: true; data: CheckoutInput }
  | { ok: false; state: CheckoutFormState } {
  const parsed = checkoutSchema.safeParse({
    productSlug: formData.get("productSlug"),
    quantity: formData.get("quantity"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    line1: formData.get("line1"),
    line2: formData.get("line2"),
    city: formData.get("city"),
    state: formData.get("state"),
    pincode: formData.get("pincode"),
  });

  if (!parsed.success) {
    const fieldErrors: CheckoutFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as CheckoutField;
      fieldErrors[field] ??= issue.message;
    }
    return {
      ok: false,
      state: {
        status: "error",
        message: "Please check the delivery details and try again.",
        fieldErrors,
      },
    };
  }

  return { ok: true, data: parsed.data };
}

export type ShippingAddress = Pick<
  CheckoutInput,
  "name" | "phone" | "line1" | "line2" | "city" | "state" | "pincode"
>;

export async function createOrderForUser(opts: {
  userId: string;
  product: { id: string; priceInr: number };
  quantity: number;
  address: ShippingAddress;
  paymentRef: string;
  paidNote: string;
}) {
  const { userId, product, quantity, address, paymentRef, paidNote } = opts;
  const order = await prisma.order.create({
    data: {
      number: generateOrderNumber(),
      userId,
      totalInr: product.priceInr * quantity,
      paymentRef,
      shippingName: address.name,
      shippingPhone: address.phone,
      shippingLine1: address.line1,
      shippingLine2: address.line2 || null,
      shippingCity: address.city,
      shippingState: address.state,
      shippingPincode: address.pincode,
      items: {
        create: [
          {
            productId: product.id,
            quantity,
            unitPriceInr: product.priceInr,
          },
        ],
      },
      events: { create: [{ status: "PLACED", note: paidNote }] },
    },
  });

  await sendPushToUser(userId, {
    title: `Order ${order.number} placed ✅`,
    body: "We'll dispatch it from Islampur HQ within 24 hours.",
    url: `/account/orders/${order.id}`,
  });

  return order;
}

// Turns a *paid* Stripe Checkout Session into an order. Idempotent (keyed on
// the payment intent) so the success redirect and the webhook — whichever
// fires first — can both call it safely without double-ordering.
export async function fulfillCheckoutSession(
  session: Stripe.Checkout.Session
): Promise<{ orderId: string; created: boolean } | null> {
  if (session.payment_status !== "paid") return null;

  const meta = session.metadata;
  if (!meta?.userId || !meta.productSlug) return null;

  const paymentRef =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.id;

  const existing = await prisma.order.findFirst({ where: { paymentRef } });
  if (existing) return { orderId: existing.id, created: false };

  const product = await prisma.product.findUnique({
    where: { slug: meta.productSlug },
  });
  if (!product) return null;

  const order = await createOrderForUser({
    userId: meta.userId,
    product,
    quantity: Number(meta.quantity) || 1,
    address: {
      name: meta.name ?? "",
      phone: meta.phone ?? "",
      line1: meta.line1 ?? "",
      line2: meta.line2 ?? "",
      city: meta.city ?? "",
      state: meta.state ?? "",
      pincode: meta.pincode ?? "",
    },
    paymentRef,
    paidNote: "Payment received via Stripe",
  });
  return { orderId: order.id, created: true };
}
