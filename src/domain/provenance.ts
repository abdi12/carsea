// Freshness rules: when a verified fact stops counting as current (SPEC §8).

export const dataTypes = [
  "price",
  "energy_price",
  "cost_input",
  "specification",
  "feature",
  "warranty",
  "service_center",
  "identity",
] as const;
export type DataType = (typeof dataTypes)[number];

/**
 * Days after verification before a fact is treated as stale.
 *
 * PROVISIONAL: these windows are working assumptions, not validated against
 * how often each source actually changes. Confirm them with the real update
 * cadence before launch (SPEC §15).
 */
export const freshnessDays: Record<DataType, number> = {
  price: 90,
  energy_price: 60,
  cost_input: 365,
  specification: 730,
  feature: 730,
  warranty: 365,
  service_center: 180,
  identity: 730,
};

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parses a strict `YYYY-MM-DD` calendar date as UTC midnight, or null. */
export function parseIsoDate(value: string): Date | null {
  const match = ISO_DATE.exec(value);
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  // Reject dates the calendar does not have, such as 2026-02-30.
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
    ? date
    : null;
}

export const toIsoDate = (date: Date): string => date.toISOString().slice(0, 10);

/** Whole days from `from` to `to`; negative when `from` is later. */
export function daysBetween(from: string, to: string): number {
  const [a, b] = [parseIsoDate(from), parseIsoDate(to)];
  if (!a || !b) throw new Error(`Invalid ISO date: ${a ? to : from}`);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

export const isStale = (type: DataType, verifiedOn: string, today: string): boolean =>
  daysBetween(verifiedOn, today) > freshnessDays[type];

/**
 * A price is usable today when its validity window covers today and its
 * verification has not aged out.
 */
export function priceStatus(
  price: { validFrom: string; validUntil: string | null; verifiedOn: string },
  today: string,
): "current" | "not_yet_valid" | "expired" | "stale" {
  if (daysBetween(price.validFrom, today) < 0) return "not_yet_valid";
  if (price.validUntil && daysBetween(price.validUntil, today) > 0) return "expired";
  return isStale("price", price.verifiedOn, today) ? "stale" : "current";
}
