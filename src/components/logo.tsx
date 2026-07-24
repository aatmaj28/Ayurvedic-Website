import Link from "next/link";
import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2.5", className)}
      aria-label="Kavil-Cure home"
    >
      <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Leaf className="size-5" aria-hidden />
      </span>
      <span className="font-heading text-xl font-semibold tracking-tight">
        Kavil-Cure
      </span>
    </Link>
  );
}
