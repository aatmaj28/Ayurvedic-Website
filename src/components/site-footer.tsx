import Link from "next/link";
import { Logo } from "@/components/logo";

const FOOTER_LINKS = [
  { href: "/treatment", label: "Treatment" },
  { href: "/medicine", label: "Medicine kits" },
  { href: "/book", label: "Book appointment" },
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-3">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            Traditional Ayurvedic care for jaundice (kavil / kamini), practised
            by our family since 1930 — now accessible from anywhere in
            Maharashtra.
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Quick links</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {FOOTER_LINKS.map((link) => (
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
          <h3 className="mb-3 text-sm font-semibold">Head office</h3>
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
                href="mailto:care@kavilcure.com"
                className="hover:text-foreground"
              >
                care@kavilcure.com
              </a>
            </p>
          </address>
        </div>
      </div>
      <div className="border-t">
        <div className="container mx-auto space-y-3 px-4 py-6">
          <p className="text-xs leading-relaxed text-muted-foreground">
            <strong>Medical disclaimer:</strong> Kavil-Cure offers traditional
            Ayurvedic support and is not a substitute for professional medical
            advice, diagnosis, or treatment. Jaundice can indicate a serious
            underlying condition — always consult a qualified physician,
            especially for newborns, children, and pregnant women.
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Kavil-Cure · Built by{" "}
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
