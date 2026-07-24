import type { Metadata } from "next";
import Link from "next/link";
import { Handshake, Landmark, Leaf, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BranchCard } from "@/components/branch-card";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "The story of Kavil-Cure: four generations of traditional Ayurvedic jaundice care from Islampur, Maharashtra, since 1930.",
};

const TIMELINE = [
  {
    year: "1930",
    title: "A family practice begins",
    description:
      "Our great-grandfather begins treating jaundice patients in Islampur with a herbal preparation passed down through the family.",
  },
  {
    year: "1960s–80s",
    title: "Word spreads across Western Maharashtra",
    description:
      "Patients travel from Kolhapur, Sangli, Satara, and beyond. The recipe and the method stay exactly the same.",
  },
  {
    year: "2000s",
    title: "Two new centres",
    description:
      "To spare patients the journey, we open branches in Mumbai and Navi Mumbai while keeping the HQ in Islampur.",
  },
  {
    year: "Today",
    title: "Online booking & home delivery",
    description:
      "The fourth generation brings the practice online — consultations can be booked from your phone and kits delivered to your home.",
  },
];

const VALUES = [
  {
    icon: Leaf,
    title: "Tradition, unchanged",
    description:
      "The preparation follows the original family recipe. We modernise everything around the medicine — never the medicine itself.",
  },
  {
    icon: Handshake,
    title: "Honesty about limits",
    description:
      "Ayurveda supports recovery, but some cases need a hospital. When that's true for you, we'll say so plainly.",
  },
  {
    icon: Users,
    title: "Care for every budget",
    description:
      "We keep consultations and courses affordable because treatment delayed by cost helps nobody.",
  },
  {
    icon: Landmark,
    title: "Rooted in Islampur",
    description:
      "Our HQ has stood near the Islampur bus stand for decades — many patients are the grandchildren of earlier patients.",
  },
];

export default async function AboutPage() {
  const branches = await prisma.branch.findMany({
    orderBy: { isHq: "desc" },
  });

  return (
    <>
      <section className="border-b bg-gradient-to-b from-secondary/60 to-background">
        <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            Four generations of care
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Kavil-Cure started in 1930 as one practitioner in Islampur with a
            family recipe and a simple belief: recovery from jaundice
            shouldn&apos;t require a hospital-sized bill. Over 25 lakh patients
            later, that belief hasn&apos;t changed.
          </p>
        </div>
      </section>

      <section className="container mx-auto max-w-3xl px-4 py-16">
        <h2 className="mb-10 text-center font-heading text-3xl font-semibold">
          Our story
        </h2>
        <ol className="relative space-y-10 border-l border-border pl-8">
          {TIMELINE.map((item) => (
            <li key={item.year} className="relative">
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
            What we stand for
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {VALUES.map((value) => (
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
          Where to find us
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {branches.map((branch) => (
            <BranchCard key={branch.id} branch={branch} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button asChild size="lg">
            <Link href="/contact">Get in touch</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
