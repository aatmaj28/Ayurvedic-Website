import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "./config";
import type { Dictionary } from "./types";

export type { Dictionary } from "./types";

const dictionaries: Record<Locale, () => Promise<{ default: Dictionary }>> = {
  en: () => import("./dictionaries/en"),
  hi: () => import("./dictionaries/hi"),
  mr: () => import("./dictionaries/mr"),
};

export const getLocale = cache(async (): Promise<Locale> => {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : defaultLocale;
});

export const getDictionary = cache(async (): Promise<Dictionary> => {
  const locale = await getLocale();
  const mod = await dictionaries[locale]();
  return mod.default;
});
