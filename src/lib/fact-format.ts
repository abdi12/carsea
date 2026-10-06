import type { FactView, WarrantyView } from "@/domain/catalog-view";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

import { fill, formatIdr, formatNumber } from "./format";

type Labels = Dictionary["labels"];

/** A fact's value in words: number with its unit, or the enum's label. */
export function formatFact(fact: FactView, lang: Locale, labels: Labels): string {
  if (fact.valueText !== null) {
    return (labels.energyTypes as Record<string, string>)[fact.valueText] ?? fact.valueText;
  }
  if (fact.valueNumber === null) return "";
  if (fact.unit === "idr/year") {
    return `${formatIdr(fact.valueNumber, lang)} ${labels.units["idr/year"]}`;
  }
  const unit = (labels.units as Record<string, string>)[fact.unit] ?? fact.unit;
  return `${formatNumber(fact.valueNumber, lang)} ${unit}`.trim();
}

/** "3 years / 100,000 km", with whichever limits exist. */
export function formatWarranty(w: WarrantyView, lang: Locale, labels: Labels): string {
  return [
    w.years === null ? null : fill(labels.warrantyYears, { count: w.years }),
    w.distanceKm === null ? null : `${formatNumber(w.distanceKm, lang, 0)} km`,
  ]
    .filter(Boolean)
    .join(" / ");
}
