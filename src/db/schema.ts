import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  date,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

// The normalized, source-aware catalog (SPEC §8, §11).
//
// Natural keys (slugs) are the primary keys: they are what the CSV files
// carry and what public URLs use. Enumerated text columns are validated
// against `src/domain/catalog.ts` at import time.
//
// Every table holding a material fact carries `source_id` and
// `verified_on`, so provenance is tracked per field or field group and one
// verified price never implies that a specification was verified.

const provenance = {
  sourceId: text("source_id")
    .notNull()
    .references(() => sources.id),
  verifiedOn: date("verified_on").notNull(),
};

export const sources = pgTable("sources", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull(),
  title: text("title").notNull(),
  publisher: text("publisher").notNull(),
  url: text("url"),
  retrievedOn: date("retrieved_on").notNull(),
  // Usage rights or terms confirmed for this source (SPEC §8).
  licenseNote: text("license_note"),
});

export const makes = pgTable("makes", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});

export const models = pgTable("models", {
  id: text("id").primaryKey(),
  makeId: text("make_id")
    .notNull()
    .references(() => makes.id),
  name: text("name").notNull(),
  bodyStyle: text("body_style").notNull(),
});

/** A specific, identifiable variant: model year + trim + powertrain. */
export const variants = pgTable(
  "variants",
  {
    id: text("id").primaryKey(),
    modelId: text("model_id")
      .notNull()
      .references(() => models.id),
    modelYear: integer("model_year").notNull(),
    trim: text("trim").notNull(),
    powertrain: text("powertrain").notNull(),
    transmission: text("transmission").notNull(),
    publicationStatus: text("publication_status").notNull().default("draft"),
    // Provenance for the identity fields above, as one group.
    ...provenance,
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique("variants_identity").on(t.modelId, t.modelYear, t.trim, t.powertrain, t.transmission),
    index("variants_model").on(t.modelId),
  ],
);

export const prices = pgTable(
  "prices",
  {
    id: serial("id").primaryKey(),
    variantId: text("variant_id")
      .notNull()
      .references(() => variants.id, { onDelete: "cascade" }),
    region: text("region").notNull(),
    priceType: text("price_type").notNull().default("otr"),
    currency: text("currency").notNull().default("IDR"),
    amount: bigint("amount", { mode: "number" }).notNull(),
    validFrom: date("valid_from").notNull(),
    validUntil: date("valid_until"),
    // What the price includes and excludes, in the source's own terms.
    inclusionsNote: text("inclusions_note"),
    ...provenance,
  },
  (t) => [
    unique("prices_variant_region_from").on(t.variantId, t.region, t.priceType, t.validFrom),
    check("prices_amount_positive", sql`${t.amount} > 0`),
    check(
      "prices_validity_order",
      sql`${t.validUntil} is null or ${t.validUntil} >= ${t.validFrom}`,
    ),
  ],
);

/** One specification fact per row, each with its own provenance. */
export const variantFacts = pgTable(
  "variant_facts",
  {
    variantId: text("variant_id")
      .notNull()
      .references(() => variants.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    valueNumber: doublePrecision("value_number"),
    valueText: text("value_text"),
    unit: text("unit").notNull(),
    ...provenance,
  },
  (t) => [
    unique("variant_facts_key").on(t.variantId, t.key),
    check(
      "variant_facts_one_value",
      sql`(${t.valueNumber} is null) <> (${t.valueText} is null)`,
    ),
  ],
);

export const variantFeatures = pgTable(
  "variant_features",
  {
    variantId: text("variant_id")
      .notNull()
      .references(() => variants.id, { onDelete: "cascade" }),
    featureKey: text("feature_key").notNull(),
    availability: text("availability").notNull(),
    ...provenance,
  },
  (t) => [unique("variant_features_key").on(t.variantId, t.featureKey)],
);

export const warranties = pgTable(
  "warranties",
  {
    variantId: text("variant_id")
      .notNull()
      .references(() => variants.id, { onDelete: "cascade" }),
    coverage: text("coverage").notNull(),
    years: integer("years"),
    distanceKm: integer("distance_km"),
    conditions: text("conditions"),
    ...provenance,
  },
  (t) => [
    unique("warranties_coverage").on(t.variantId, t.coverage),
    check(
      "warranties_has_limit",
      sql`${t.years} is not null or ${t.distanceKm} is not null`,
    ),
  ],
);

export const variantImages = pgTable("variant_images", {
  id: serial("id").primaryKey(),
  variantId: text("variant_id")
    .notNull()
    .references(() => variants.id, { onDelete: "cascade" }),
  path: text("path").notNull(),
  altId: text("alt_id").notNull(),
  altEn: text("alt_en").notNull(),
  // Rights are confirmed before an image is stored (SPEC §8).
  license: text("license").notNull(),
  attribution: text("attribution"),
  ...provenance,
});

export const serviceCenters = pgTable(
  "service_centers",
  {
    id: text("id").primaryKey(),
    makeId: text("make_id")
      .notNull()
      .references(() => makes.id),
    name: text("name").notNull(),
    address: text("address").notNull(),
    city: text("city").notNull(),
    region: text("region").notNull(),
    phone: text("phone"),
    openingHours: text("opening_hours"),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    ...provenance,
  },
  (t) => [index("service_centers_make_region").on(t.makeId, t.region)],
);

/** Regional energy prices used by the fuel/electricity estimate. */
export const energyPrices = pgTable(
  "energy_prices",
  {
    id: serial("id").primaryKey(),
    region: text("region").notNull(),
    energyType: text("energy_type").notNull(),
    currency: text("currency").notNull().default("IDR"),
    pricePerUnit: doublePrecision("price_per_unit").notNull(),
    unit: text("unit").notNull(),
    validFrom: date("valid_from").notNull(),
    ...provenance,
  },
  (t) => [
    unique("energy_prices_region_type_from").on(t.region, t.energyType, t.validFrom),
    check("energy_prices_positive", sql`${t.pricePerUnit} > 0`),
  ],
);

/** A record of every import, including rejected rows and why (SPEC §11). */
export const importRuns = pgTable("import_runs", {
  id: serial("id").primaryKey(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  directory: text("directory").notNull(),
  dryRun: boolean("dry_run").notNull(),
  rowsRead: integer("rows_read").notNull(),
  rowsAccepted: integer("rows_accepted").notNull(),
  rowsRejected: integer("rows_rejected").notNull(),
  report: jsonb("report").notNull(),
});
