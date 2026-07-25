import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "./config";
import type { Dictionary } from "./types";
import en from "./dictionaries/en";
import hi from "./dictionaries/hi";
import mr from "./dictionaries/mr";

export type { Dictionary } from "./types";

// Statically imported so every locale is bundled into the serverless
// function. (Dynamic import() can be dropped by output tracing and 500 at
// runtime on Vercel while working fine under `next start`.) The dictionaries
// are a few KB each, so eager loading costs nothing meaningful.
const dictionaries: Record<Locale, Dictionary> = { en, hi, mr };

export const getLocale = cache(async (): Promise<Locale> => {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : defaultLocale;
});

export const getDictionary = cache(async (): Promise<Dictionary> => {
  const locale = await getLocale();
  return dictionaries[locale];
});
