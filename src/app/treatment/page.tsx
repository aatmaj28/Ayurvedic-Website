import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ClipboardList,
  Droplets,
  Eye,
  Leaf,
  Moon,
  Salad,
  Stethoscope,
  UtensilsCrossed,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDictionary } from "@/i18n";

export const metadata: Metadata = {
  title: "Jaundice Treatment",
  description:
    "How Kavil-Cure's traditional Ayurvedic jaundice treatment works: consultation, herbal course, dietary guidance, and follow-up.",
};

export default async function TreatmentPage() {
  const dict = await getDictionary();
  const t = dict.treatment;

  const symptoms = [
    { icon: Eye, text: t.sign1 },
    { icon: Droplets, text: t.sign2 },
    { icon: UtensilsCrossed, text: t.sign3 },
    { icon: Moon, text: t.sign4 },
  ];

  const courseIncludes = [
    { icon: Stethoscope, title: t.course1Title, description: t.course1Desc },
    { icon: Leaf, title: t.course2Title, description: t.course2Desc },
    { icon: Salad, title: t.course3Title, description: t.course3Desc },
    { icon: ClipboardList, title: t.course4Title, description: t.course4Desc },
  ];

  const faqs = [
    { question: t.faq1Q, answer: t.faq1A },
    { question: t.faq2Q, answer: t.faq2A },
    { question: t.faq3Q, answer: t.faq3A },
    { question: t.faq4Q, answer: t.faq4A },
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

      <section className="container mx-auto max-w-5xl px-4 py-16">
        <h2 className="mb-8 text-center font-heading text-3xl font-semibold">
          {t.signsTitle}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {symptoms.map((symptom) => (
            <div
              key={symptom.text}
              className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <symptom.icon className="size-5" aria-hidden />
              </span>
              <p className="text-sm font-medium">{symptom.text}</p>
            </div>
          ))}
        </div>

        <Alert variant="destructive" className="mt-8">
          <AlertTriangle aria-hidden />
          <AlertTitle>{t.warningTitle}</AlertTitle>
          <AlertDescription>{t.warningBody}</AlertDescription>
        </Alert>
      </section>

      <section className="border-y bg-muted/40">
        <div className="container mx-auto max-w-5xl px-4 py-16">
          <h2 className="mb-3 text-center font-heading text-3xl font-semibold">
            {t.courseTitle}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-center text-muted-foreground">
            {t.courseSubtitle}
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            {courseIncludes.map((item) => (
              <Card key={item.title}>
                <CardHeader>
                  <span className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="size-5" aria-hidden />
                  </span>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/book">{dict.common.bookConsultation}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/medicine">{dict.common.seeMedicineKits}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-3xl px-4 py-16">
        <h2 className="mb-8 text-center font-heading text-3xl font-semibold">
          {t.faqTitle}
        </h2>
        <div className="space-y-6">
          {faqs.map((faq) => (
            <Card key={faq.question}>
              <CardHeader>
                <CardTitle className="text-base">{faq.question}</CardTitle>
                <CardDescription className="leading-relaxed">
                  {faq.answer}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
