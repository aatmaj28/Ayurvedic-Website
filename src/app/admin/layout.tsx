import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { getDictionary } from "@/i18n";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  const dict = await getDictionary();
  const t = dict.admin;

  const adminLinks = [
    { href: "/admin", label: t.navOverview },
    { href: "/admin/appointments", label: t.navAppointments },
    { href: "/admin/orders", label: t.navOrders },
    { href: "/admin/messages", label: t.navMessages },
  ];

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold">{t.title}</h1>
        <nav className="mt-4 flex flex-wrap gap-1 border-b pb-px">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-t-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
