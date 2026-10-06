export const locales = ["id", "en"] as const;

export type Locale = (typeof locales)[number];

// Bahasa Indonesia is the default locale (SPEC §11).
export const defaultLocale: Locale = "id";

export const LOCALE_COOKIE = "carsea-locale";

export const isLocale = (value: string | undefined): value is Locale =>
  locales.includes(value as Locale);

/** Returns the locale prefix of a pathname, if it has a supported one. */
export function localeFromPathname(pathname: string): Locale | undefined {
  const segment = pathname.split("/")[1];
  return isLocale(segment) ? segment : undefined;
}

/** Swaps (or adds) the locale prefix while keeping the rest of the path. */
export function localizePathname(pathname: string, locale: Locale): string {
  const rest = localeFromPathname(pathname)
    ? pathname.replace(/^\/[^/]+/, "")
    : pathname;
  return `/${locale}${rest === "/" ? "" : rest}`;
}
