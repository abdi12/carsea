import { and, asc, eq, inArray } from "drizzle-orm";

import {
  type BodyStyle,
  type EnergyType,
  type FactKey,
  type FeatureAvailability,
  type FeatureCategory,
  type Powertrain,
  type Region,
  type SourceKind,
  type Transmission,
  type WarrantyCoverage,
  featureCategories,
  featureDefinitions,
  isFactKey,
  isFeatureKey,
} from "@/domain/catalog";
import type {
  FactView,
  FeatureView,
  PriceView,
  ServiceCenterView,
  SourceView,
  VariantDetail,
  VariantSummary,
  WarrantyView,
} from "@/domain/catalog-view";
import { type CostInputs, type Sourced, estimateOwnershipCost } from "@/domain/ownership-cost";
import { isStale, priceStatus } from "@/domain/provenance";

import type { Database } from "./connection";
import * as t from "./schema";

export interface CatalogScope {
  region: Region;
  /** `YYYY-MM-DD`; freshness is judged against this date. */
  today: string;
}

/** Picks the row in force today: the latest `validFrom` not in the future. */
function latest<T extends { validFrom: string }>(rows: T[], today: string): T | undefined {
  return rows
    .filter((row) => row.validFrom <= today)
    .sort((a, b) => b.validFrom.localeCompare(a.validFrom))[0];
}

function group<T extends { variantId: string }>(rows: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const row of rows) map.set(row.variantId, [...(map.get(row.variantId) ?? []), row]);
  return map;
}

const toSourceView = (s: typeof t.sources.$inferSelect): SourceView => ({
  id: s.id,
  kind: s.kind as SourceKind,
  title: s.title,
  publisher: s.publisher,
  url: s.url,
  retrievedOn: s.retrievedOn,
});

/**
 * Loads published variants with everything known about them, applying the
 * freshness rules. Pass `ids` to load specific variants only.
 */
export async function loadVariantDetails(
  db: Database,
  scope: CatalogScope,
  ids?: string[],
): Promise<VariantDetail[]> {
  const { region, today } = scope;
  if (ids && ids.length === 0) return [];

  const variants = await db
    .select({
      variant: t.variants,
      modelName: t.models.name,
      bodyStyle: t.models.bodyStyle,
      makeId: t.makes.id,
      makeName: t.makes.name,
    })
    .from(t.variants)
    .innerJoin(t.models, eq(t.models.id, t.variants.modelId))
    .innerJoin(t.makes, eq(t.makes.id, t.models.makeId))
    .where(
      and(
        eq(t.variants.publicationStatus, "published"),
        ids ? inArray(t.variants.id, ids) : undefined,
      ),
    )
    .orderBy(asc(t.makes.name), asc(t.models.name), asc(t.variants.trim));
  if (variants.length === 0) return [];

  const variantIds = variants.map((v) => v.variant.id);
  const makeIds = [...new Set(variants.map((v) => v.makeId))];
  const [prices, facts, features, warranties, energyPrices, centers, sources] = await Promise.all([
    db
      .select()
      .from(t.prices)
      .where(and(inArray(t.prices.variantId, variantIds), eq(t.prices.region, region))),
    db.select().from(t.variantFacts).where(inArray(t.variantFacts.variantId, variantIds)),
    db.select().from(t.variantFeatures).where(inArray(t.variantFeatures.variantId, variantIds)),
    db.select().from(t.warranties).where(inArray(t.warranties.variantId, variantIds)),
    db.select().from(t.energyPrices).where(eq(t.energyPrices.region, region)),
    db
      .select({ makeId: t.serviceCenters.makeId })
      .from(t.serviceCenters)
      .where(and(inArray(t.serviceCenters.makeId, makeIds), eq(t.serviceCenters.region, region))),
    db.select().from(t.sources),
  ]);

  const sourceById = new Map(sources.map((s) => [s.id, toSourceView(s)]));
  const pricesBy = group(prices);
  const factsBy = group(facts);
  const featuresBy = group(features);
  const warrantiesBy = group(warranties);

  return variants.map(({ variant, modelName, bodyStyle, makeId, makeName }) => {
    const cited = new Set<string>([variant.sourceId]);
    const cite = <T extends { sourceId: string }>(row: T) => (cited.add(row.sourceId), row);

    const factViews: FactView[] = (factsBy.get(variant.id) ?? [])
      .filter((f) => isFactKey(f.key))
      .map((f) => ({
        key: f.key as FactKey,
        valueNumber: f.valueNumber,
        valueText: f.valueText,
        unit: f.unit,
        sourceId: cite(f).sourceId,
        verifiedOn: f.verifiedOn,
        // Cost inputs age on their own, shorter window.
        stale: isStale(f.key.endsWith("_idr") ? "cost_input" : "specification", f.verifiedOn, today),
      }));
    const fact = (key: FactKey) => factViews.find((f) => f.key === key);
    const current = (key: FactKey) => {
      const view = fact(key);
      return view && !view.stale ? view.valueNumber : null;
    };
    const sourced = <T,>(key: FactKey, read: (f: FactView) => T | null) => {
      const view = fact(key);
      const value = view ? read(view) : null;
      return view && value !== null
        ? ({ value, sourceId: view.sourceId, verifiedOn: view.verifiedOn } satisfies Sourced<T>)
        : undefined;
    };

    const priceRow = latest(pricesBy.get(variant.id) ?? [], today);
    const price: PriceView | null = priceRow
      ? {
          amount: priceRow.amount,
          status: priceStatus(priceRow, today),
          validFrom: priceRow.validFrom,
          validUntil: priceRow.validUntil,
          inclusionsNote: priceRow.inclusionsNote,
          sourceId: cite(priceRow).sourceId,
          verifiedOn: priceRow.verifiedOn,
          stale: priceStatus(priceRow, today) !== "current",
        }
      : null;

    const energyType = sourced("energy_type", (f) => f.valueText as EnergyType | null);
    const energyPriceRow = energyType
      ? latest(
          energyPrices.filter((p) => p.energyType === energyType.value),
          today,
        )
      : undefined;
    const costInputs: Omit<CostInputs, "monthlyKm"> = {
      powertrain: variant.powertrain as Powertrain,
      fuelConsumptionKmPerL: sourced("fuel_consumption_km_per_l", (f) => f.valueNumber),
      energyConsumptionKwhPer100Km: sourced("energy_consumption_kwh_per_100km", (f) => f.valueNumber),
      energyType,
      energyPrice:
        energyPriceRow && energyType
          ? {
              value: energyPriceRow.pricePerUnit,
              sourceId: cite(energyPriceRow).sourceId,
              verifiedOn: energyPriceRow.verifiedOn,
              energyType: energyType.value,
            }
          : undefined,
      serviceCostAnnual: sourced("service_cost_annual_idr", (f) => f.valueNumber),
      annualTax: sourced("annual_tax_idr", (f) => f.valueNumber),
      insuranceAnnual: sourced("insurance_annual_idr", (f) => f.valueNumber),
    };
    const energy = estimateOwnershipCost({ ...costInputs, monthlyKm: 1000 }, today).components[0];

    const featureViews: FeatureView[] = (featuresBy.get(variant.id) ?? [])
      .filter((f) => isFeatureKey(f.featureKey))
      .map((f) => {
        const key = f.featureKey as keyof typeof featureDefinitions;
        return {
          key,
          category: featureDefinitions[key],
          availability: f.availability as FeatureAvailability,
          sourceId: cite(f).sourceId,
          verifiedOn: f.verifiedOn,
          stale: isStale("feature", f.verifiedOn, today),
        };
      });
    const currentFeatures = featureViews.filter((f) => !f.stale);
    const standardFeatures =
      currentFeatures.length === 0
        ? null
        : (Object.fromEntries(
            featureCategories.map((category) => [
              category,
              currentFeatures.filter(
                (f) => f.availability === "standard" && f.category === category,
              ).length,
            ]),
          ) as Record<FeatureCategory, number>);

    const warrantyViews: WarrantyView[] = (warrantiesBy.get(variant.id) ?? []).map((w) => ({
      coverage: w.coverage as WarrantyCoverage,
      years: w.years,
      distanceKm: w.distanceKm,
      conditions: w.conditions,
      sourceId: cite(w).sourceId,
      verifiedOn: w.verifiedOn,
      stale: isStale("warranty", w.verifiedOn, today),
    }));
    const vehicleWarranty = warrantyViews.find((w) => w.coverage === "vehicle" && !w.stale);

    const citedSources = Object.fromEntries(
      [...cited].flatMap((id) => {
        const source = sourceById.get(id);
        return source ? [[id, source]] : [];
      }),
    );

    return {
      id: variant.id,
      makeId,
      makeName,
      modelName,
      modelYear: variant.modelYear,
      trim: variant.trim,
      bodyStyle: bodyStyle as BodyStyle,
      powertrain: variant.powertrain as Powertrain,
      transmission: variant.transmission as Transmission,
      price,
      seats: current("seats"),
      lengthMm: current("length_mm"),
      cargoVolumeL: current("cargo_volume_l"),
      groundClearanceMm: current("ground_clearance_mm"),
      // A stale energy estimate is not used to rank cars.
      energyCostPerKm: energy.monthly === null || energy.stale ? null : energy.monthly / 1000,
      standardFeatures,
      warrantyYears: vehicleWarranty?.years ?? null,
      sample: Object.values(citedSources).some((s) => s.kind === "sample"),
      identity: {
        sourceId: variant.sourceId,
        verifiedOn: variant.verifiedOn,
        stale: isStale("identity", variant.verifiedOn, today),
      },
      facts: factViews,
      features: featureViews,
      warranties: warrantyViews,
      costInputs,
      sources: citedSources,
      serviceCenterCount: centers.filter((c) => c.makeId === makeId).length,
    };
  });
}

/** The fields the browse list and matching need, without the full detail. */
export function toSummary(d: VariantDetail): VariantSummary {
  return {
    id: d.id,
    makeId: d.makeId,
    makeName: d.makeName,
    modelName: d.modelName,
    modelYear: d.modelYear,
    trim: d.trim,
    bodyStyle: d.bodyStyle,
    powertrain: d.powertrain,
    transmission: d.transmission,
    price: d.price,
    seats: d.seats,
    lengthMm: d.lengthMm,
    cargoVolumeL: d.cargoVolumeL,
    groundClearanceMm: d.groundClearanceMm,
    energyCostPerKm: d.energyCostPerKm,
    standardFeatures: d.standardFeatures,
    warrantyYears: d.warrantyYears,
    sample: d.sample,
  };
}

export async function loadVariantSummaries(
  db: Database,
  scope: CatalogScope,
): Promise<VariantSummary[]> {
  return (await loadVariantDetails(db, scope)).map(toSummary);
}

export async function loadServiceCenters(
  db: Database,
  scope: CatalogScope,
): Promise<ServiceCenterView[]> {
  const rows = await db
    .select({ center: t.serviceCenters, makeName: t.makes.name, source: t.sources })
    .from(t.serviceCenters)
    .innerJoin(t.makes, eq(t.makes.id, t.serviceCenters.makeId))
    .innerJoin(t.sources, eq(t.sources.id, t.serviceCenters.sourceId))
    .where(eq(t.serviceCenters.region, scope.region))
    .orderBy(asc(t.makes.name), asc(t.serviceCenters.city), asc(t.serviceCenters.name));

  return rows.map(({ center, makeName, source }) => ({
    id: center.id,
    makeId: center.makeId,
    makeName,
    name: center.name,
    address: center.address,
    city: center.city,
    phone: center.phone,
    openingHours: center.openingHours,
    sourceId: center.sourceId,
    verifiedOn: center.verifiedOn,
    stale: isStale("service_center", center.verifiedOn, scope.today),
    source: toSourceView(source),
  }));
}
