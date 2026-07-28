import type { Metadata } from "next";
import Link from "next/link";
import { Handshake, Landmark, Leaf, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BranchCard } from "@/components/branch-card";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/i18n";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "The story of Kavil-Cure: four generations of traditional Ayurvedic jaundice care from Islampur, Maharashtra, since 1965.",
};

export default async function AboutPage() {
  const [branches, dict] = await Promise.all([
    prisma.branch.findMany({ orderBy: { isHq: "desc" } }),
    getDictionary(),
  ]);
  const t = dict.about;

  const timeline = [
    { year: "1965", title: t.time1Title, description: t.time1Desc },
    { year: t.time2Year, title: t.time2Title, description: t.time2Desc },
    { year: t.time3Year, title: t.time3Title, description: t.time3Desc },
    { year: t.time4Year, title: t.time4Title, description: t.time4Desc },
  ];

  const values = [
    { icon: Leaf, title: t.value1Title, description: t.value1Desc },
    { icon: Handshake, title: t.value2Title, description: t.value2Desc },
    { icon: Users, title: t.value3Title, description: t.value3Desc },
    { icon: Landmark, title: t.value4Title, description: t.value4Desc },
  ];

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

      <section className="container mx-auto max-w-3xl px-4 py-16">
        <h2 className="mb-10 text-center font-heading text-3xl font-semibold">
          {t.storyTitle}
        </h2>
        <ol className="relative space-y-10 border-l border-border pl-8">
          {timeline.map((item) => (
            <li key={item.title} className="relative">
              <span className="absolute -left-[41px] flex size-5 items-center justify-center rounded-full border-2 border-primary bg-background" />
              <p className="text-sm font-semibold text-primary">{item.year}</p>
              <h3 className="mt-1 font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y bg-muted/40">
        <div className="container mx-auto max-w-5xl px-4 py-16">
          <h2 className="mb-10 text-center font-heading text-3xl font-semibold">
            {t.valuesTitle}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-xl border bg-card p-6 shadow-xs"
              >
                <span className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <value.icon className="size-5" aria-hidden />
                </span>
                <h3 className="mb-1.5 font-semibold">{value.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-10 text-center font-heading text-3xl font-semibold">
          {t.findUsTitle}
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {branches.map((branch) => (
            <BranchCard key={branch.id} branch={branch} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button asChild size="lg">
            <Link href="/contact">{dict.common.getInTouch}</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
