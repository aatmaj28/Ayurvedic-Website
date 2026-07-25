import Link from "next/link";
import { Check, MapPin, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatInr } from "@/lib/constants";
import { getDictionary } from "@/i18n";
import { cn } from "@/lib/utils";
import type { Branch } from "@prisma/client";

export async function BranchCard({
  branch,
  showBookCta = true,
}: {
  branch: Branch;
  showBookCta?: boolean;
}) {
  const dict = await getDictionary();
  const features = JSON.parse(branch.features) as string[];

  return (
    <Card
      className={cn("h-full", branch.popular && "ring-primary ring-2")}
    >
      <CardHeader>
        <CardTitle className="font-heading text-lg">{branch.name}</CardTitle>
        <CardDescription className="flex items-start gap-1.5">
          <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {branch.address}
        </CardDescription>
        {branch.popular && (
          <CardAction>
            <Badge>{dict.branch.mostPopular}</Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <p>
          <span className="font-heading text-3xl font-semibold">
            {formatInr(branch.consultationFee)}
          </span>{" "}
          <span className="text-sm text-muted-foreground">
            / {dict.common.perConsultation}
          </span>
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              {feature}
            </li>
          ))}
        </ul>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Phone className="size-3.5" aria-hidden />
          <a href={`tel:${branch.phone.replace(/\s/g, "")}`} className="hover:text-foreground">
            {branch.phone}
          </a>
        </p>
      </CardContent>
      {showBookCta && (
        <CardFooter className="mt-auto">
          <Button
            asChild
            variant={branch.popular ? "default" : "outline"}
            className="w-full"
          >
            <Link href={`/book?branch=${branch.slug}`}>
              {dict.branch.bookAt} {branch.city}
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
