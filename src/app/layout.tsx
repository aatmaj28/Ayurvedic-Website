import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getLocale } from "@/i18n";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

const siteUrl = process.env.BETTER_AUTH_URL ?? "https://kavilcure.me";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Kavil-Cure — Ayurvedic Jaundice Care",
    template: "%s | Kavil-Cure",
  },
  description:
    "Traditional Ayurvedic care for jaundice (kavil/kamini) since 1965. Book consultations at our Maharashtra centres or get herbal medicine kits delivered to your home.",
  openGraph: {
    type: "website",
    siteName: "Kavil-Cure",
    locale: "en_IN",
    title: "Kavil-Cure — Ayurvedic Jaundice Care",
    description:
      "Traditional Ayurvedic care for jaundice (kavil/kamini) since 1965. Book consultations or get herbal medicine kits delivered all over India.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kavil-Cure — Ayurvedic Jaundice Care",
    description:
      "Traditional Ayurvedic care for jaundice (kavil/kamini) since 1965.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${inter.variable} ${fraunces.variable}`}>
      <body className="flex min-h-svh flex-col antialiased">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
