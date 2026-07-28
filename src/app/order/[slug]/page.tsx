import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckoutForm } from "@/components/checkout-form";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { stripeEnabled } from "@/lib/stripe";
import { getDictionary } from "@/i18n";

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await requireSession();
  const [{ slug }, dict] = await Promise.all([params, getDictionary()]);

  const [product, branches] = await Promise.all([
    prisma.product.findUnique({ where: { slug } }),
    prisma.branch.findMany({
      orderBy: { kitPriceInr: "asc" },
      select: { id: true, name: true, city: true, kitPriceInr: true },
    }),
  ]);
  if (!product || !product.active) notFound();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-8 font-heading text-3xl font-semibold">
        {dict.checkout.title}
      </h1>
      <CheckoutForm
        product={{
          slug: product.slug,
          name: product.name,
          tagline: product.tagline,
          courseDays: product.courseDays,
        }}
        branches={branches}
        defaults={{
          name: session.user.name,
          phone: session.user.phone ?? "",
        }}
        labels={{
          ...dict.checkout,
          dayCourse: dict.medicine.dayCourse,
          optional: dict.common.optional,
          free: dict.common.free,
        }}
        stripeEnabled={stripeEnabled}
      />
    </div>
  );
}
