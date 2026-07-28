import Link from "next/link";
import { Logo } from "@/components/logo";
import { getDictionary } from "@/i18n";

export async function SiteFooter() {
  const dict = await getDictionary();

  const footerLinks = [
    { href: "/treatment", label: dict.nav.treatment },
    { href: "/medicine", label: dict.nav.medicine },
    { href: "/book", label: dict.nav.bookAppointment },
    { href: "/about", label: dict.nav.about },
    { href: "/contact", label: dict.nav.contact },
  ];

  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-3">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            {dict.footer.tagline}
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">
            {dict.footer.quickLinks}
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">
            {dict.footer.headOffice}
          </h3>
          <address className="space-y-2 text-sm text-muted-foreground not-italic">
            <p>
              Near Lakshmikant Hotel, Bus Stand Road,
              <br />
              Islampur, Maharashtra 415409
            </p>
            <p>
              <a href="tel:+919766227792" className="hover:text-foreground">
                +91 97662 27792
              </a>
            </p>
            <p>
              <a
                href="mailto:care@kavilcure.me"
                className="hover:text-foreground"
              >
                care@kavilcure.me
              </a>
            </p>
          </address>
        </div>
      </div>
      <div className="border-t">
        <div className="container mx-auto space-y-3 px-4 py-6">
          <p className="text-xs leading-relaxed text-muted-foreground">
            <strong>{dict.footer.disclaimerTitle}</strong> {dict.footer.disclaimer}
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Kavil-Cure · {dict.footer.builtBy}{" "}
            <a
              href="https://www.linkedin.com/in/aatmaj-salunke-7106041b0/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Aatmaj Salunke
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
