import Link from "next/link";
import {
  CalendarCheck,
  HandCoins,
  HeartPulse,
  Leaf,
  MapPin,
  Package,
  Sprout,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BranchCard } from "@/components/branch-card";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/i18n";

export default async function HomePage() {
  const [branches, dict] = await Promise.all([
    prisma.branch.findMany({ orderBy: { consultationFee: "asc" } }),
    getDictionary(),
  ]);
  const t = dict.home;

  const stats = [
    { value: "1930", label: t.statSince },
    { value: "25 lakh+", label: t.statPatients },
    { value: "3", label: t.statCentres },
    { value: "₹250", label: t.statFrom },
  ];

  const features = [
    { icon: Leaf, title: t.feature1Title, description: t.feature1Desc },
    { icon: HandCoins, title: t.feature2Title, description: t.feature2Desc },
    { icon: Truck, title: t.feature3Title, description: t.feature3Desc },
    { icon: MapPin, title: t.feature4Title, description: t.feature4Desc },
    { icon: HeartPulse, title: t.feature5Title, description: t.feature5Desc },
    { icon: Sprout, title: t.feature6Title, description: t.feature6Desc },
  ];

  const steps = [
    { icon: CalendarCheck, title: t.step1Title, description: t.step1Desc },
    { icon: Package, title: t.step2Title, description: t.step2Desc },
    { icon: HeartPulse, title: t.step3Title, description: t.step3Desc },
  ];

  return (
    <>
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-secondary/60 to-background">
        <div className="container mx-auto grid items-center gap-12 px-4 py-20 lg:grid-cols-2 lg:py-28">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Leaf className="size-3.5" aria-hidden />
              {t.heroBadge}
            </p>
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              {t.heroTitle}
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              {t.heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/book">{dict.common.bookConsultation}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/medicine">{dict.common.orderMedicineKits}</Link>
              </Button>
            </div>
          </div>
          <div className="hidden justify-center lg:flex">
            <div className="relative flex size-80 items-center justify-center rounded-full bg-primary/10">
              <div className="flex size-60 items-center justify-center rounded-full bg-primary/15">
                <div className="flex size-40 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Leaf className="size-16" aria-hidden />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b">
        <div className="container mx-auto grid grid-cols-2 gap-8 px-4 py-12 text-center md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="font-heading text-3xl font-semibold sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-semibold sm:text-4xl">
            {t.whyTitle}
          </h2>
          <p className="mt-3 text-muted-foreground">{t.whySubtitle}</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border bg-card p-6 shadow-xs"
            >
              <span className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="size-5" aria-hidden />
              </span>
              <h3 className="mb-1.5 font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Branches */}
      <section className="border-y bg-muted/40">
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-semibold sm:text-4xl">
              {t.centresTitle}
            </h2>
            <p className="mt-3 text-muted-foreground">{t.centresSubtitle}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {branches.map((branch) => (
              <BranchCard key={branch.id} branch={branch} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-semibold sm:text-4xl">
            {t.howTitle}
          </h2>
        </div>
        <div className="grid gap-10 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <step.icon className="size-6" aria-hidden />
              </div>
              <h3 className="mb-1.5 font-semibold">
                {index + 1}. {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto flex flex-col items-center gap-6 px-4 py-16 text-center">
          <h2 className="font-heading text-3xl font-semibold text-balance sm:text-4xl">
            {t.ctaTitle}
          </h2>
          <p className="max-w-xl text-primary-foreground/85">{t.ctaSubtitle}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link href="/book">{dict.common.bookConsultation}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link href="/medicine">{dict.common.browseMedicineKits}</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
