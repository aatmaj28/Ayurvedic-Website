"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { generateOrderNumber } from "@/lib/constants";

const checkoutSchema = z.object({
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

export async function placeOrder(
  _prevState: CheckoutFormState,
  formData: FormData
): Promise<CheckoutFormState> {
  const session = await requireSession();

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
      status: "error",
      message: "Please check the delivery details and try again.",
      fieldErrors,
    };
  }

  const product = await prisma.product.findUnique({
    where: { slug: parsed.data.productSlug },
  });
  if (!product) {
    return { status: "error", message: "This product is no longer available." };
  }

  const totalInr = product.priceInr * parsed.data.quantity;
  // Mock payment: a real gateway (e.g. Stripe/Razorpay) would be called here.
  const paymentRef = `PAY-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

  const order = await prisma.order.create({
    data: {
      number: generateOrderNumber(),
      userId: session.user.id,
      totalInr,
      paymentRef,
      shippingName: parsed.data.name,
      shippingPhone: parsed.data.phone,
      shippingLine1: parsed.data.line1,
      shippingLine2: parsed.data.line2 || null,
      shippingCity: parsed.data.city,
      shippingState: parsed.data.state,
      shippingPincode: parsed.data.pincode,
      items: {
        create: [
          {
            productId: product.id,
            quantity: parsed.data.quantity,
            unitPriceInr: product.priceInr,
          },
        ],
      },
      events: {
        create: [{ status: "PLACED", note: "Payment received (demo)" }],
      },
    },
  });

  revalidatePath("/account");
  redirect(`/account/orders/${order.id}?placed=1`);
}
