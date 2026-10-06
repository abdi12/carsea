import "server-only";

import type { Locale } from "./config";

// The Indonesian dictionary is the source of truth for the key set;
// the annotation below makes a missing English key a type error.
export type Dictionary = typeof import("./dictionaries/id.json");

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  id: () => import("./dictionaries/id.json").then((module) => module.default),
  en: () => import("./dictionaries/en.json").then((module) => module.default),
};

export const getDictionary = (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale]();
