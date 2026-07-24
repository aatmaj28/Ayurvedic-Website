import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckoutForm } from "@/components/checkout-form";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await requireSession();
  const { slug } = await params;

  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) notFound();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-8 font-heading text-3xl font-semibold">Checkout</h1>
      <CheckoutForm
        product={{
          slug: product.slug,
          name: product.name,
          tagline: product.tagline,
          priceInr: product.priceInr,
          courseDays: product.courseDays,
        }}
        defaults={{
          name: session.user.name,
          phone: session.user.phone ?? "",
        }}
      />
    </div>
  );
}
