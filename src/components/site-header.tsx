import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { UserMenu } from "@/components/user-menu";
import { MobileNav } from "@/components/mobile-nav";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getSession } from "@/lib/session";
import { getDictionary, getLocale } from "@/i18n";

export async function SiteHeader() {
  const [session, dict, locale] = await Promise.all([
    getSession(),
    getDictionary(),
    getLocale(),
  ]);

  const navLinks = [
    { href: "/", label: dict.nav.home },
    { href: "/treatment", label: dict.nav.treatment },
    { href: "/medicine", label: dict.nav.medicine },
    { href: "/about", label: dict.nav.about },
    { href: "/contact", label: dict.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4">
        <Logo />
        <nav className="ml-6 hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button asChild variant="secondary" className="hidden sm:inline-flex">
            <Link href="/book">{dict.nav.bookAppointment}</Link>
          </Button>
          <LanguageSwitcher current={locale} label={dict.nav.language} />
          {session ? (
            <UserMenu
              name={session.user.name}
              email={session.user.email}
              isAdmin={session.user.role === "admin"}
              labels={{
                menu: dict.nav.accountMenu,
                dashboard: dict.nav.myDashboard,
                admin: dict.nav.adminPanel,
                logout: dict.nav.logout,
              }}
            />
          ) : (
            <Button asChild>
              <Link href="/login">{dict.nav.login}</Link>
            </Button>
          )}
          <MobileNav
            links={navLinks}
            bookLabel={dict.nav.bookAppointment}
            openLabel={dict.nav.openMenu}
          />
        </div>
      </div>
    </header>
  );
}
