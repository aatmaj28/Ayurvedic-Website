import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach Kavil-Cure — send us a message or visit one of our centres in Islampur, Mumbai, or Navi Mumbai.",
};

export default async function ContactPage() {
  const branches = await prisma.branch.findMany({
    orderBy: { isHq: "desc" },
  });

  return (
    <>
      <section className="border-b bg-gradient-to-b from-secondary/60 to-background">
        <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            Talk to us
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Questions about symptoms, the course, or an existing order? Send a
            message and we&apos;ll reply within a day — or call the centre
            nearest to you.
          </p>
        </div>
      </section>

      <section className="container mx-auto grid max-w-5xl gap-12 px-4 py-16 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h2 className="mb-6 font-heading text-2xl font-semibold">
            Send a message
          </h2>
          <ContactForm />
        </div>
        <div className="space-y-6 lg:col-span-2">
          <h2 className="font-heading text-2xl font-semibold">Our centres</h2>
          {branches.map((branch) => (
            <div key={branch.id} className="rounded-xl border bg-card p-5">
              <h3 className="font-semibold">{branch.name}</h3>
              <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                {branch.address}
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="size-4 shrink-0" aria-hidden />
                <a
                  href={`tel:${branch.phone.replace(/\s/g, "")}`}
                  className="hover:text-foreground"
                >
                  {branch.phone}
                </a>
              </p>
            </div>
          ))}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold">Email</h3>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="size-4 shrink-0" aria-hidden />
              <a href="mailto:care@kavilcure.com" className="hover:text-foreground">
                care@kavilcure.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
