import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { APPOINTMENT_STATUS } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const branchId = request.nextUrl.searchParams.get("branchId");
  const date = request.nextUrl.searchParams.get("date");

  if (!branchId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "branchId and date (YYYY-MM-DD) are required" },
      { status: 400 }
    );
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      branchId,
      date: new Date(`${date}T00:00:00.000Z`),
      status: APPOINTMENT_STATUS.SCHEDULED,
    },
    select: { slot: true },
  });

  return NextResponse.json({
    bookedSlots: appointments.map((appointment) => appointment.slot),
  });
}
