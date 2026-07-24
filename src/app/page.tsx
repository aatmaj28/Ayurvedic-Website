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

const STATS = [
  { value: "1930", label: "Practising since" },
  { value: "25 lakh+", label: "Patients treated" },
  { value: "3", label: "Centres in Maharashtra" },
  { value: "₹250", label: "Consultations from" },
];

const FEATURES = [
  {
    icon: Leaf,
    title: "Fully herbal preparation",
    description:
      "One family recipe, prepared the traditional way for over nine decades — no synthetic additives.",
  },
  {
    icon: HandCoins,
    title: "Affordable by design",
    description:
      "Treatment shouldn't mean a hospital-sized bill. Consultations start at ₹250 and kits at ₹899.",
  },
  {
    icon: Truck,
    title: "Home delivery",
    description:
      "Can't travel? Medicine kits are delivered across Maharashtra with order tracking.",
  },
  {
    icon: MapPin,
    title: "Three centres",
    description:
      "Visit us in Islampur (HQ), Mumbai, or Navi Mumbai — whichever is closest to you.",
  },
  {
    icon: HeartPulse,
    title: "Guided recovery",
    description:
      "Every course comes with dietary guidance and follow-up support until you're back on your feet.",
  },
  {
    icon: Sprout,
    title: "A trusted legacy",
    description:
      "Four generations of the same family have carried this practice forward since 1930.",
  },
];

const STEPS = [
  {
    icon: CalendarCheck,
    title: "Book a consultation",
    description:
      "Pick a centre, date, and time slot online — or walk in at our Islampur HQ.",
  },
  {
    icon: Package,
    title: "Get your medicine",
    description:
      "Collect your kit at the centre, or order online and have it delivered home.",
  },
  {
    icon: HeartPulse,
    title: "Recover with guidance",
    description:
      "Follow the course and diet chart. We stay in touch until you've recovered.",
  },
];

export default async function HomePage() {
  const branches = await prisma.branch.findMany({
    orderBy: { consultationFee: "asc" },
  });

  return (
    <>
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-secondary/60 to-background">
        <div className="container mx-auto grid items-center gap-12 px-4 py-20 lg:grid-cols-2 lg:py-28">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Leaf className="size-3.5" aria-hidden />
              Serving Maharashtra since 1930
            </p>
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Gentle, time-tested Ayurvedic care for jaundice
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              Kavil-Cure has treated jaundice (kavil / kamini) with the same
              herbal preparation for four generations — without the stress, or
              the bill, of a hospital stay. Book a consultation or get a
              medicine kit delivered to your door.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/book">Book a consultation</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/medicine">Order medicine kits</Link>
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
          {STATS.map((stat) => (
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
            Why families choose Kavil-Cure
          </h2>
          <p className="mt-3 text-muted-foreground">
            Traditional medicine, delivered with the convenience you expect
            today.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
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
              Our centres &amp; pricing
            </h2>
            <p className="mt-3 text-muted-foreground">
              Transparent consultation fees at every branch. Walk-ins welcome
              at the HQ; booking recommended elsewhere.
            </p>
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
            How it works
          </h2>
        </div>
        <div className="grid gap-10 md:grid-cols-3">
          {STEPS.map((step, index) => (
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
            Ready to start your recovery?
          </h2>
          <p className="max-w-xl text-primary-foreground/85">
            Book a consultation at the centre nearest to you, or order a
            medicine kit and we&apos;ll deliver it home.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link href="/book">Book a consultation</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link href="/medicine">Browse medicine kits</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
