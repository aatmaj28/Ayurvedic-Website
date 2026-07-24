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

export const metadata: Metadata = {
  title: "Medicine Kits",
  description:
    "Order Kavil-Cure's traditional herbal medicine kits for jaundice — home delivery across Maharashtra with order tracking.",
};

export default async function MedicinePage() {
  const products = await prisma.product.findMany({
    orderBy: { priceInr: "asc" },
  });

  return (
    <>
      <section className="border-b bg-gradient-to-b from-secondary/60 to-background">
        <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            Medicine kits, delivered home
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            The same preparation dispensed at our centres, portioned into
            guided courses and delivered anywhere in Maharashtra.
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
                    {product.courseDays}-day course
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
                    · free delivery
                  </span>
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild size="lg" className="w-full">
                  <Link href={`/order/${product.slug}`}>Order this kit</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-10 space-y-4">
          <Alert>
            <Truck aria-hidden />
            <AlertTitle>Delivery across Maharashtra</AlertTitle>
            <AlertDescription>
              Orders are dispatched from our Islampur HQ within 24 hours and
              typically arrive in 2–4 days. You can track every step from your
              dashboard.
            </AlertDescription>
          </Alert>
          <Alert>
            <Info aria-hidden />
            <AlertTitle>First time taking the course?</AlertTitle>
            <AlertDescription>
              We recommend a{" "}
              <Link href="/book" className="underline underline-offset-2">
                consultation
              </Link>{" "}
              first so the course matches your condition.
            </AlertDescription>
          </Alert>
        </div>
      </section>
    </>
  );
}
