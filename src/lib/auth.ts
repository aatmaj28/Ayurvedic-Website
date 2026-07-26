import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "./prisma";

// Resolve a valid absolute base URL. better-auth throws "Invalid base URL" if
// BETTER_AUTH_URL is malformed (e.g. missing the scheme), so we normalise it
// and fall back to the Vercel-provided domain for preview/production deploys.
function resolveBaseURL(): string | undefined {
  const raw =
    process.env.BETTER_AUTH_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : undefined);
  if (!raw) return undefined;
  const withScheme = /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(withScheme).origin;
  } catch {
    return undefined;
  }
}

export const auth = betterAuth({
  baseURL: resolveBaseURL(),
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
  },
  // e2e tests log in many times from one IP; AUTH_RATE_LIMIT=off lets the
  // suite run without tripping the sign-in throttle. Unset in production.
  ...(process.env.AUTH_RATE_LIMIT === "off"
    ? { rateLimit: { enabled: false } }
    : {}),
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "patient",
        input: false,
      },
      phone: {
        type: "string",
        required: false,
      },
    },
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
