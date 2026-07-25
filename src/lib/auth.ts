import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "./prisma";

export const auth = betterAuth({
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
