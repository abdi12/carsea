import type { Locale } from "@/i18n/config";

const numberLocale = (locale: Locale) => (locale === "id" ? "id-ID" : "en-US");

export const formatNumber = (value: number, locale: Locale, maximumFractionDigits = 1) =>
  new Intl.NumberFormat(numberLocale(locale), { maximumFractionDigits }).format(value);

/** Rupiah with the locale's grouping: Rp300.000.000 / Rp300,000,000. */
export const formatIdr = (amount: number, locale: Locale) =>
  `Rp${new Intl.NumberFormat(numberLocale(locale), { maximumFractionDigits: 0 }).format(amount)}`;

/** A `YYYY-MM-DD` date as a short calendar date. */
export const formatDate = (iso: string, locale: Locale) =>
  new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));

/** Replaces `{name}` placeholders in a dictionary string. */
export const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, name: string) => String(values[name] ?? ""));
