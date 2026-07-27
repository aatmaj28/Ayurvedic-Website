import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { stripe } from "@/lib/stripe";
import { fulfillCheckoutSession } from "@/lib/orders";

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

  // Only the buyer may finalise via the return trip.
  if (checkout.metadata?.userId !== session.user.id) notFound();

  const result = await fulfillCheckoutSession(checkout);
  if (!result) notFound();

  redirect(`/account/orders/${result.orderId}?placed=1`);
}
