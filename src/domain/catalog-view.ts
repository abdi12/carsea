import type {
  BodyStyle,
  FactKey,
  FeatureAvailability,
  FeatureCategory,
  FeatureKey,
  Powertrain,
  SourceKind,
  Transmission,
  WarrantyCoverage,
} from "./catalog";
import type { MatchCandidate } from "./matching";
import type { CostInputs } from "./ownership-cost";

// Serializable views of the catalog, shared by server pages and the
// client-side finder, comparison, and cost estimator. Freshness has already
// been applied: every item says whether it is stale.

export type PriceStatus = "current" | "stale" | "expired" | "not_yet_valid";

export interface Provenanced {
  sourceId: string;
  verifiedOn: string;
  stale: boolean;
}

export interface PriceView extends Provenanced {
  amount: number;
  status: PriceStatus;
  validFrom: string;
  validUntil: string | null;
  inclusionsNote: string | null;
}

export interface VariantSummary {
  id: string;
  makeId: string;
  makeName: string;
  modelName: string;
  modelYear: number;
  trim: string;
  bodyStyle: BodyStyle;
  powertrain: Powertrain;
  transmission: Transmission;
  /** The price in force today, whatever its status; null when none exists. */
  price: PriceView | null;
  /** Current values only; a stale or absent fact is null. */
  seats: number | null;
  lengthMm: number | null;
  cargoVolumeL: number | null;
  groundClearanceMm: number | null;
  /** Rupiah of fuel or electricity per km; null when not supportable. */
  energyCostPerKm: number | null;
  standardFeatures: Record<FeatureCategory, number> | null;
  warrantyYears: number | null;
  /** True when any of this variant's data comes from a sample source. */
  sample: boolean;
}

export interface FactView extends Provenanced {
  key: FactKey;
  valueNumber: number | null;
  valueText: string | null;
  unit: string;
}

export interface FeatureView extends Provenanced {
  key: FeatureKey;
  category: FeatureCategory;
  availability: FeatureAvailability;
}

export interface WarrantyView extends Provenanced {
  coverage: WarrantyCoverage;
  years: number | null;
  distanceKm: number | null;
  conditions: string | null;
}

export interface SourceView {
  id: string;
  kind: SourceKind;
  title: string;
  publisher: string;
  url: string | null;
  retrievedOn: string;
}

export interface VariantDetail extends VariantSummary {
  identity: Provenanced;
  facts: FactView[];
  features: FeatureView[];
  warranties: WarrantyView[];
  costInputs: Omit<CostInputs, "monthlyKm">;
  /** Every source cited by this variant, by id. */
  sources: Record<string, SourceView>;
  serviceCenterCount: number;
}

export interface ServiceCenterView extends Provenanced {
  id: string;
  makeId: string;
  makeName: string;
  name: string;
  address: string;
  city: string;
  phone: string | null;
  openingHours: string | null;
  source: SourceView;
}

export const variantName = (v: Pick<VariantSummary, "makeName" | "modelName" | "trim">) =>
  `${v.makeName} ${v.modelName} ${v.trim}`;

/** Only a current price lets a car be recommended (SPEC §8). */
export const currentPrice = (v: Pick<VariantSummary, "price">): number | null =>
  v.price?.status === "current" ? v.price.amount : null;

export function toMatchCandidate(v: VariantSummary, monthlyKm: number): MatchCandidate {
  return {
    variantId: v.id,
    makeId: v.makeId,
    bodyStyle: v.bodyStyle,
    powertrain: v.powertrain,
    priceAmount: currentPrice(v),
    seats: v.seats,
    lengthMm: v.lengthMm,
    cargoVolumeL: v.cargoVolumeL,
    groundClearanceMm: v.groundClearanceMm,
    monthlyEnergyCost:
      v.energyCostPerKm === null ? null : Math.round(v.energyCostPerKm * monthlyKm),
    standardFeatures: v.standardFeatures,
    warrantyYears: v.warrantyYears,
  };
}
