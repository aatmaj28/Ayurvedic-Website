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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Jaundice Treatment",
  description:
    "How Kavil-Cure's traditional Ayurvedic jaundice treatment works: consultation, herbal course, dietary guidance, and follow-up.",
};

const SYMPTOMS = [
  { icon: Eye, text: "Yellowing of the eyes and skin" },
  { icon: Droplets, text: "Dark urine and pale stools" },
  { icon: UtensilsCrossed, text: "Loss of appetite and nausea" },
  { icon: Moon, text: "Fatigue and weakness" },
];

const COURSE_INCLUDES = [
  {
    icon: Stethoscope,
    title: "Initial consultation",
    description:
      "A practitioner assesses your symptoms, history, and severity before any medicine is given.",
  },
  {
    icon: Leaf,
    title: "Herbal medicine course",
    description:
      "Daily doses of our traditional preparation, portioned for a 7-day or 21-day course.",
  },
  {
    icon: Salad,
    title: "Dietary guidance",
    description:
      "A liver-friendly diet chart — what to eat, what to strictly avoid, and for how long.",
  },
  {
    icon: ClipboardList,
    title: "Follow-up support",
    description:
      "We check in on your recovery and advise if symptoms persist or change.",
  },
];

const FAQS = [
  {
    question: "How soon can I expect improvement?",
    answer:
      "Most patients report visible improvement within the first week of the course when the diet chart is followed. Recovery time varies with severity and individual health.",
  },
  {
    question: "Is the medicine safe to take alongside hospital treatment?",
    answer:
      "Tell your doctor about any Ayurvedic preparation you take, and tell us about any ongoing treatment during your consultation. We will advise honestly if our course is not suitable for your case.",
  },
  {
    question: "Do I need a consultation before ordering a kit?",
    answer:
      "We strongly recommend a consultation for first-time patients so the course matches your condition. Repeat patients familiar with the course can order kits directly.",
  },
  {
    question: "What if symptoms get worse during the course?",
    answer:
      "Stop the course and seek medical attention immediately. Jaundice can indicate serious conditions such as hepatitis or bile-duct obstruction that need clinical care.",
  },
];

export default function TreatmentPage() {
  return (
    <>
      <section className="border-b bg-gradient-to-b from-secondary/60 to-background">
        <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            Understanding jaundice, and how we treat it
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Jaundice (kavil / kamini) occurs when bilirubin builds up in the
            blood, most often because the liver is under strain. Our approach
            supports the liver&apos;s recovery with a traditional herbal course
            and a strict, simple diet.
          </p>
        </div>
      </section>

      <section className="container mx-auto max-w-5xl px-4 py-16">
        <h2 className="mb-8 text-center font-heading text-3xl font-semibold">
          Common signs of jaundice
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SYMPTOMS.map((symptom) => (
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
          <AlertTitle>When to go to a hospital instead</AlertTitle>
          <AlertDescription>
            Seek immediate medical care for jaundice in newborns, children, or
            during pregnancy, or if it is accompanied by high fever, severe
            abdominal pain, confusion, or vomiting blood. Our treatment
            supports recovery — it does not replace emergency care or a
            clinical diagnosis.
          </AlertDescription>
        </Alert>
      </section>

      <section className="border-y bg-muted/40">
        <div className="container mx-auto max-w-5xl px-4 py-16">
          <h2 className="mb-3 text-center font-heading text-3xl font-semibold">
            What a course includes
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-center text-muted-foreground">
            The same treatment our family has offered since 1930, organised
            into a clear, guided course.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            {COURSE_INCLUDES.map((item) => (
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
              <Link href="/book">Book a consultation</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/medicine">See medicine kits</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-3xl px-4 py-16">
        <h2 className="mb-8 text-center font-heading text-3xl font-semibold">
          Frequently asked questions
        </h2>
        <div className="space-y-6">
          {FAQS.map((faq) => (
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
