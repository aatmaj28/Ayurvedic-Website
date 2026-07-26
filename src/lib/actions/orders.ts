"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { stripe } from "@/lib/stripe";
import {
  createOrderForUser,
  parseCheckout,
  type CheckoutFormState,
} from "@/lib/orders";

async function resolveOrigin(): Promise<string> {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
  const host = (await headers()).get("host") ?? "localhost:3000";
  const proto = host.startsWith("localhost") ? "http" : "https";
  return `${proto}://${host}`;
}

// Mock checkout: used when Stripe isn't configured (local dev / CI / preview).
export async function placeOrder(
  _prevState: CheckoutFormState,
  formData: FormData
): Promise<CheckoutFormState> {
  const session = await requireSession();
  const parsed = parseCheckout(formData);
  if (!parsed.ok) return parsed.state;

  const product = await prisma.product.findUnique({
    where: { slug: parsed.data.productSlug },
  });
  if (!product) {
    return { status: "error", message: "This product is no longer available." };
  }

  const paymentRef = `PAY-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  const order = await createOrderForUser({
    userId: session.user.id,
    product,
    quantity: parsed.data.quantity,
    address: parsed.data,
    paymentRef,
    paidNote: "Payment received (demo)",
  });

  revalidatePath("/account");
  redirect(`/account/orders/${order.id}?placed=1`);
}

// Stripe Checkout: creates a hosted payment session and redirects to Stripe.
// The order is created only after payment succeeds (see /order/success).
export async function createCheckoutSession(
  _prevState: CheckoutFormState,
  formData: FormData
): Promise<CheckoutFormState> {
  const session = await requireSession();
  if (!stripe) {
    return { status: "error", message: "Payments are not configured." };
  }

  const parsed = parseCheckout(formData);
  if (!parsed.ok) return parsed.state;

  const product = await prisma.product.findUnique({
    where: { slug: parsed.data.productSlug },
  });
  if (!product) {
    return { status: "error", message: "This product is no longer available." };
  }

  const { quantity, ...address } = parsed.data;
  const origin = await resolveOrigin();

  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity,
        price_data: {
          currency: "inr",
          unit_amount: product.priceInr * 100, // paise
          product_data: {
            name: product.name,
            description: product.tagline,
          },
        },
      },
    ],
    metadata: {
      userId: session.user.id,
      productSlug: address.productSlug,
      quantity: String(quantity),
      name: address.name,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 ?? "",
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    },
    success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/order/${address.productSlug}`,
  });

  if (!checkout.url) {
    return { status: "error", message: "Could not start checkout. Try again." };
  }
  redirect(checkout.url);
}
