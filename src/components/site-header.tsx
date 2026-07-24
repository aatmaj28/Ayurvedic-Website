import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { UserMenu } from "@/components/user-menu";
import { MobileNav } from "@/components/mobile-nav";
import { getSession } from "@/lib/session";

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/treatment", label: "Treatment" },
  { href: "/medicine", label: "Medicine" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4">
        <Logo />
        <nav className="ml-6 hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
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
            <Link href="/book">Book appointment</Link>
          </Button>
          {session ? (
            <UserMenu
              name={session.user.name}
              email={session.user.email}
              isAdmin={session.user.role === "admin"}
            />
          ) : (
            <Button asChild>
              <Link href="/login">Log in</Link>
            </Button>
          )}
          <MobileNav links={NAV_LINKS} />
        </div>
      </div>
    </header>
  );
}
