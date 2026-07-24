import Link from "next/link";
import { requireAdmin } from "@/lib/session";

const ADMIN_LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/appointments", label: "Appointments" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/messages", label: "Messages" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold">Clinic admin</h1>
        <nav className="mt-4 flex flex-wrap gap-1 border-b pb-px">
          {ADMIN_LINKS.map((link) => (
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
