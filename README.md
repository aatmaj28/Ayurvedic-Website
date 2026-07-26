# 🌿 Kavil-Cure — Ayurvedic Jaundice Care Platform

![CI](https://github.com/aatmaj28/Ayurvedic-Website/actions/workflows/ci.yml/badge.svg)

A full-stack healthcare platform for a family-run Ayurvedic jaundice (kavil / kamini) practice in Maharashtra: online consultation booking, medicine-kit ordering with order tracking, and a clinic admin panel.

**🔗 Live demo:** [ayurvedic-website-ten.vercel.app](https://ayurvedic-website-ten.vercel.app) — demo logins below.

![Kavil-Cure homepage](docs/screenshot-home.png)

## The story

The original version of this site was built for the **Developer Social (formerly Script Foundation) Hackathon — Social Summer of Code Season 3** as one of my first full-stack projects: static HTML pages styled with Tailwind via CDN ([project submission on Devfolio](https://devfolio.co/projects/kavil-cure-ayurvedic-jaundice-startup-website-09c8)). That version is preserved in [`legacy/`](legacy/).

This is the ground-up rebuild: a real database, real authentication, working booking and ordering flows, and a redesigned UI.

## Features

**Public site**
- Home, treatment, about, and contact pages with a custom design system (deep botanical green + warm cream palette, Fraunces/Inter type pairing)
- Trilingual — English, Hindi (हिन्दी), and Marathi (मराठी) — via a cookie-based locale with a header language switcher; the entire app (public pages, patient dashboard, checkout, and admin panel) translates, and `<html lang>` updates
- Working contact form persisted to the database
- Branch listing with transparent consultation pricing (₹)
- Medical disclaimer and honest, softened health claims

**Patients**
- Email/password auth (better-auth) with session-gated routes
- Book consultations: pick a centre, date, and time slot — already-booked slots are disabled live
- Order medicine kits: quantity → delivery address → Stripe Checkout (test mode) → order confirmation
- Dashboard with appointments (cancellable) and orders with a live tracking timeline (placed → confirmed → shipped → out for delivery → delivered)

**Clinic admin** (role-based)
- Manage appointments (complete / cancel)
- Advance orders through the fulfilment pipeline; every change is recorded as a tracked status event
- Read and triage contact messages

## Tech stack

| Layer     | Choice                                                        |
| --------- | ------------------------------------------------------------- |
| Framework | Next.js 16 (App Router, Server Components, Server Actions)    |
| Language  | TypeScript                                                     |
| UI        | Tailwind CSS v4 + shadcn/ui (Radix), lucide-react icons        |
| Database  | PostgreSQL (Neon) via Prisma ORM                               |
| Auth      | better-auth (email/password, sessions, role-based access)      |
| Payments  | Stripe Checkout (hosted, test mode)                            |
| Validation| Zod                                                            |

Checkout uses **Stripe Checkout** in test mode: the payment step creates a
hosted Checkout Session and redirects to Stripe; the order is created only
after payment succeeds (verified on the return trip at `/order/success`, with
idempotent creation so a refresh can't double-order). When `STRIPE_SECRET_KEY`
isn't configured (local dev / CI / preview), it transparently falls back to a
built-in mock so the app always works. Pay with test card
`4242 4242 4242 4242`, any future expiry, any CVC.

## Getting started

```bash
npm install
cp .env.example .env          # set DATABASE_URL (any Postgres — Neon free tier
                              # works) and a real BETTER_AUTH_SECRET
npx prisma migrate deploy     # creates the tables
npx prisma db seed            # branches, products, demo users, sample data
npm run dev                   # http://localhost:3000
```

**Demo accounts** (created by the seed):

| Role    | Email                  | Password   |
| ------- | ---------------------- | ---------- |
| Patient | patient@kavilcure.com  | patient123 |
| Admin   | admin@kavilcure.com    | admin1234  |

## Project structure

```
prisma/               schema + migrations + seed
src/
  app/                routes (public pages, /book, /order, /account, /admin, /api)
  components/         site chrome, forms, timeline, shadcn/ui primitives
  lib/                prisma client, auth config, session helpers, constants
  lib/actions/        server actions (contact, appointments, orders, admin)
  proxy.ts            optimistic auth gate for protected routes
legacy/               the original 2022 static-HTML version, kept for posterity
```

## Testing

Playwright end-to-end tests cover the critical flows: public pages, auth
(login/signup/role gating), appointment booking with slot availability, the
checkout → tracking flow, and the admin order pipeline. A separate mobile
project (Pixel 7 viewport) asserts no horizontal overflow across every page,
that the hamburger nav works, and that the admin tables collapse into tappable
cards. CI runs lint, build, and the full suite against a throwaway Postgres on
every push.

```bash
# Point DATABASE_URL at a disposable Postgres db (never production), then:
npx prisma migrate deploy && npx prisma db seed
AUTH_RATE_LIMIT=off npm run test:e2e
```

## Deploying

Hosted on Vercel with a Neon Postgres database. Set `DATABASE_URL`,
`BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL` (a full absolute URL, e.g.
`https://your-app.vercel.app`) in the Vercel project's environment variables.

```bash
npm run deploy   # vercel --prod --yes && npm run smoke
```

The `smoke` script (`scripts/smoke.mjs`) hits the live URL and fails if public
pages don't return 200, the auth layer is unhealthy, or protected routes stop
redirecting — the class of production-only failure that CI can't catch because
it runs against `next start` with test env vars. A scheduled GitHub Action
(`.github/workflows/smoke.yml`) also runs it every 6 hours as an uptime check.

```bash
npm run smoke                                   # checks production
node scripts/smoke.mjs http://localhost:3000    # or any base URL
```

**If a `git push` doesn't trigger a deploy**, the GitHub ↔ Vercel integration
needs reconnecting: Vercel dashboard → Project → Settings → Git → connect the
repository. Until then, deploy with `npm run deploy`.

## Roadmap

- Stripe webhook (`checkout.session.completed`) to confirm payments independently of the return redirect
- Email notifications for bookings and order status changes

## Disclaimer

Kavil-Cure offers traditional Ayurvedic support and is not a substitute for professional medical advice, diagnosis, or treatment. Jaundice can indicate a serious underlying condition — always consult a qualified physician.

---

Made with ❤️ by [Aatmaj Salunke](https://www.linkedin.com/in/aatmaj-salunke-7106041b0/)
