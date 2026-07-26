import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { stripe } from "@/lib/stripe";
import { createOrderForUser, type ShippingAddress } from "@/lib/orders";

export const metadata = { title: "Payment" };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const session = await requireSession();
  const { session_id } = await searchParams;

  if (!stripe || !session_id) notFound();

  const checkout = await stripe.checkout.sessions.retrieve(session_id);

  // Only the buyer may finalise, and only once payment actually succeeded.
  if (
    checkout.payment_status !== "paid" ||
    checkout.metadata?.userId !== session.user.id
  ) {
    notFound();
  }

  const paymentRef =
    typeof checkout.payment_intent === "string"
      ? checkout.payment_intent
      : checkout.id;

  // Idempotent: a refresh / re-hit of this URL must not create a second order.
  const existing = await prisma.order.findFirst({ where: { paymentRef } });
  if (existing) {
    redirect(`/account/orders/${existing.id}?placed=1`);
  }

  const meta = checkout.metadata!;
  const product = await prisma.product.findUnique({
    where: { slug: meta.productSlug },
  });
  if (!product) notFound();

  const address: ShippingAddress = {
    name: meta.name,
    phone: meta.phone,
    line1: meta.line1,
    line2: meta.line2 || "",
    city: meta.city,
    state: meta.state,
    pincode: meta.pincode,
  };

  const order = await createOrderForUser({
    userId: session.user.id,
    product,
    quantity: Number(meta.quantity) || 1,
    address,
    paymentRef,
    paidNote: "Payment received via Stripe",
  });

  redirect(`/account/orders/${order.id}?placed=1`);
}
