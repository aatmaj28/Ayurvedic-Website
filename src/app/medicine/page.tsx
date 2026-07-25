import type { Metadata } from "next";
import Link from "next/link";
import { CalendarRange, Info, Truck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatInr } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/i18n";

export const metadata: Metadata = {
  title: "Medicine Kits",
  description:
    "Order Kavil-Cure's traditional herbal medicine kits for jaundice — home delivery across Maharashtra with order tracking.",
};

export default async function MedicinePage() {
  const [products, dict] = await Promise.all([
    prisma.product.findMany({ orderBy: { priceInr: "asc" } }),
    getDictionary(),
  ]);
  const t = dict.medicine;

  return (
    <>
      <section className="border-b bg-gradient-to-b from-secondary/60 to-background">
        <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            {t.heroTitle}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            {t.heroSubtitle}
          </p>
        </div>
      </section>

      <section className="container mx-auto max-w-4xl px-4 py-16">
        <div className="grid gap-8 md:grid-cols-2">
          {products.map((product) => (
            <Card key={product.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="font-heading text-xl">
                    {product.name}
                  </CardTitle>
                  <Badge variant="secondary">
                    <CalendarRange aria-hidden />
                    {product.courseDays}-{t.dayCourse}
                  </Badge>
                </div>
                <CardDescription>{product.tagline}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
                <p>
                  <span className="font-heading text-3xl font-semibold">
                    {formatInr(product.priceInr)}
                  </span>{" "}
                  <span className="text-sm text-muted-foreground">
                    · {t.freeDelivery}
                  </span>
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild size="lg" className="w-full">
                  <Link href={`/order/${product.slug}`}>{t.orderThisKit}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-10 space-y-4">
          <Alert>
            <Truck aria-hidden />
            <AlertTitle>{t.deliveryTitle}</AlertTitle>
            <AlertDescription>{t.deliveryBody}</AlertDescription>
          </Alert>
          <Alert>
            <Info aria-hidden />
            <AlertTitle>{t.firstTimeTitle}</AlertTitle>
            <AlertDescription>
              {t.firstTimeBody1}{" "}
              <Link href="/book" className="underline underline-offset-2">
                {t.firstTimeConsultation}
              </Link>{" "}
              {t.firstTimeBody2}
            </AlertDescription>
          </Alert>
        </div>
      </section>
    </>
  );
}
