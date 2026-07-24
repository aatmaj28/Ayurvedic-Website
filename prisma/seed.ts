import { prisma } from "../src/lib/prisma";
import { auth } from "../src/lib/auth";

const DAY_MS = 24 * 60 * 60 * 1000;

function daysFromNow(days: number): Date {
  const d = new Date(Date.now() + days * DAY_MS);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

async function ensureUser(opts: {
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: opts.email } });
  if (existing) return existing;
  await auth.api.signUpEmail({
    body: { name: opts.name, email: opts.email, password: opts.password },
  });
  return prisma.user.update({
    where: { email: opts.email },
    data: { role: opts.role, phone: opts.phone, emailVerified: true },
  });
}

async function main() {
  // --- Branches ---
  const branches = [
    {
      slug: "islampur",
      name: "Islampur (HQ)",
      city: "Islampur",
      address: "Near Lakshmikant Hotel, Bus Stand Road, Islampur, Maharashtra 415409",
      phone: "+91 97662 27792",
      consultationFee: 250,
      isHq: true,
      popular: false,
      features: [
        "Main headquarters — practising since 1930",
        "Senior vaidya consultations",
        "Medicine available on arrival",
        "Open all week (call ahead for timings)",
      ],
    },
    {
      slug: "mumbai",
      name: "Mumbai",
      city: "Mumbai",
      address: "Shop 12, Ayurved Bhavan, Dadar East, Mumbai, Maharashtra 400014",
      phone: "+91 98200 11223",
      consultationFee: 400,
      isHq: false,
      popular: true,
      features: [
        "Open 7 days a week",
        "Experienced practitioners",
        "Medicine available on arrival",
        "Most convenient for city patients",
      ],
    },
    {
      slug: "navi-mumbai",
      name: "Navi Mumbai",
      city: "Navi Mumbai",
      address: "Plot 45, Sector 17, Vashi, Navi Mumbai, Maharashtra 400703",
      phone: "+91 98200 44556",
      consultationFee: 500,
      isHq: false,
      popular: false,
      features: [
        "Call before arrival",
        "Full treatment guidance",
        "Home-delivery pickup point",
      ],
    },
  ];

  for (const b of branches) {
    await prisma.branch.upsert({
      where: { slug: b.slug },
      update: { ...b, features: JSON.stringify(b.features) },
      create: { ...b, features: JSON.stringify(b.features) },
    });
  }

  // --- Products ---
  const products = [
    {
      slug: "classic-kit",
      name: "Kavil-Cure Classic Kit",
      tagline: "The traditional 7-day course",
      description:
        "Our original herbal formulation for jaundice care, prepared the same way since 1930. Includes seven daily doses, a dietary guidance chart, and instructions in Marathi, Hindi and English.",
      priceInr: 899,
      courseDays: 7,
    },
    {
      slug: "extended-kit",
      name: "Kavil-Cure Extended Kit",
      tagline: "The complete 21-day recovery course",
      description:
        "A full-recovery course for prolonged or recurring symptoms. Includes twenty-one daily doses, a liver-friendly diet plan, a follow-up teleconsultation, and instructions in Marathi, Hindi and English.",
      priceInr: 1999,
      courseDays: 21,
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }

  // --- Users ---
  await ensureUser({
    name: "Clinic Admin",
    email: "admin@kavilcure.com",
    password: "admin1234",
    role: "admin",
    phone: "+91 97662 27792",
  });

  const patient = await ensureUser({
    name: "Demo Patient",
    email: "patient@kavilcure.com",
    password: "patient123",
    role: "patient",
    phone: "+91 90000 00001",
  });

  // --- Demo data for the patient (idempotent: skip if any orders exist) ---
  const existingOrders = await prisma.order.count({ where: { userId: patient.id } });
  if (existingOrders > 0) {
    console.log("Demo data already present, skipping.");
    return;
  }

  const islampur = await prisma.branch.findUniqueOrThrow({ where: { slug: "islampur" } });
  const classic = await prisma.product.findUniqueOrThrow({ where: { slug: "classic-kit" } });
  const extended = await prisma.product.findUniqueOrThrow({ where: { slug: "extended-kit" } });

  await prisma.appointment.create({
    data: {
      userId: patient.id,
      branchId: islampur.id,
      date: daysFromNow(7),
      slot: "10:00",
      status: "SCHEDULED",
      notes: "First consultation — mild symptoms for about a week.",
    },
  });

  const shippingAddress = {
    shippingName: "Demo Patient",
    shippingPhone: "+91 90000 00001",
    shippingLine1: "B-204, Shanti Heights",
    shippingLine2: "Sector 21, Kharghar",
    shippingCity: "Navi Mumbai",
    shippingState: "Maharashtra",
    shippingPincode: "410210",
  };

  // A delivered order from last month
  await prisma.order.create({
    data: {
      number: "KC-260620-4821",
      userId: patient.id,
      status: "DELIVERED",
      totalInr: classic.priceInr,
      paymentRef: "PAY-DEMO-4821",
      createdAt: new Date(Date.now() - 34 * DAY_MS),
      ...shippingAddress,
      items: {
        create: [{ productId: classic.id, quantity: 1, unitPriceInr: classic.priceInr }],
      },
      events: {
        create: [
          { status: "PLACED", createdAt: new Date(Date.now() - 34 * DAY_MS) },
          { status: "CONFIRMED", createdAt: new Date(Date.now() - 33.5 * DAY_MS) },
          { status: "SHIPPED", note: "Dispatched from Islampur HQ", createdAt: new Date(Date.now() - 33 * DAY_MS) },
          { status: "OUT_FOR_DELIVERY", createdAt: new Date(Date.now() - 31 * DAY_MS) },
          { status: "DELIVERED", note: "Received by patient", createdAt: new Date(Date.now() - 31 * DAY_MS + 6 * 60 * 60 * 1000) },
        ],
      },
    },
  });

  // An in-transit order from this week
  await prisma.order.create({
    data: {
      number: "KC-260722-1937",
      userId: patient.id,
      status: "SHIPPED",
      totalInr: extended.priceInr,
      paymentRef: "PAY-DEMO-1937",
      createdAt: new Date(Date.now() - 2 * DAY_MS),
      ...shippingAddress,
      items: {
        create: [{ productId: extended.id, quantity: 1, unitPriceInr: extended.priceInr }],
      },
      events: {
        create: [
          { status: "PLACED", createdAt: new Date(Date.now() - 2 * DAY_MS) },
          { status: "CONFIRMED", createdAt: new Date(Date.now() - 1.5 * DAY_MS) },
          { status: "SHIPPED", note: "Dispatched from Islampur HQ", createdAt: new Date(Date.now() - 1 * DAY_MS) },
        ],
      },
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
