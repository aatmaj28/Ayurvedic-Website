import type { Metadata } from "next";
import { BookingForm } from "@/components/booking-form";
import { bookingDateRange } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { getDictionary } from "@/i18n";

export const metadata: Metadata = {
  title: "Book a Consultation",
};

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ branch?: string }>;
}) {
  await requireSession();
  const [{ branch }, dict] = await Promise.all([searchParams, getDictionary()]);

  const branches = await prisma.branch.findMany({
    orderBy: { consultationFee: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      city: true,
      consultationFee: true,
    },
  });

  const { minDate, maxDate } = bookingDateRange();

  return (
    <div className="container mx-auto max-w-xl px-4 py-16">
      <BookingForm
        branches={branches}
        initialBranchSlug={branch}
        minDate={minDate}
        maxDate={maxDate}
        labels={{ ...dict.booking, optional: dict.common.optional }}
      />
    </div>
  );
}
