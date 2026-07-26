import "server-only";
import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

// Stripe is optional: when the key isn't configured (local dev / CI / preview),
// checkout falls back to the built-in mock so the app never breaks.
export const stripe = secretKey ? new Stripe(secretKey) : null;

export const stripeEnabled = Boolean(stripe);
