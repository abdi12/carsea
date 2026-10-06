import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { type Locale, isLocale, locales } from "@/i18n/config";
import { type Dictionary, getDictionary } from "@/i18n/dictionaries";

/** Resolves the locale and dictionary for a page, or 404s. */
export async function pageContext(
  params: Promise<{ lang: string }>,
): Promise<{ lang: Locale; dict: Dictionary }> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return { lang, dict: await getDictionary(lang) };
}

/**
 * Localized metadata with canonical and alternate links. Pages that depend
 * on one buyer's state pass `index: false` (SPEC §5).
 */
export function pageMetadata(
  lang: string,
  path: string,
  page: { title: string; description?: string },
  options: { index?: boolean } = {},
): Metadata {
  return {
    title: `${page.title} — Carsea`,
    description: page.description,
    alternates: {
      canonical: `/${lang}${path}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}${path}`])),
    },
    robots: options.index === false ? { index: false, follow: true } : undefined,
  };
}
