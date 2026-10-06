// The CSV files that make up one catalog import, in dependency order,
// with the columns each must have. Extra columns are rejected so a typo in
// a header cannot silently drop data.

export const fileColumns = {
  sources: ["id", "kind", "title", "publisher", "url", "retrieved_on", "license_note"],
  makes: ["id", "name"],
  models: ["id", "make_id", "name", "body_style"],
  variants: [
    "id",
    "model_id",
    "model_year",
    "trim",
    "powertrain",
    "transmission",
    "publication_status",
    "source_id",
    "verified_on",
  ],
  prices: [
    "variant_id",
    "region",
    "currency",
    "amount",
    "valid_from",
    "valid_until",
    "inclusions_note",
    "source_id",
    "verified_on",
  ],
  facts: ["variant_id", "key", "value", "unit", "source_id", "verified_on"],
  features: ["variant_id", "feature_key", "availability", "source_id", "verified_on"],
  warranties: [
    "variant_id",
    "coverage",
    "years",
    "distance_km",
    "conditions",
    "source_id",
    "verified_on",
  ],
  service_centers: [
    "id",
    "make_id",
    "name",
    "address",
    "city",
    "region",
    "phone",
    "opening_hours",
    "latitude",
    "longitude",
    "source_id",
    "verified_on",
  ],
  energy_prices: [
    "region",
    "energy_type",
    "currency",
    "price_per_unit",
    "unit",
    "valid_from",
    "source_id",
    "verified_on",
  ],
} as const;

export type FileName = keyof typeof fileColumns;
export const fileNames = Object.keys(fileColumns) as FileName[];

/** One data row as read from disk. `line` is its line number in the file. */
export interface RawRow {
  line: number;
  values: Record<string, string>;
}

export interface RawFile {
  /** Header names as found, or null when the file is absent. */
  columns: string[] | null;
  rows: RawRow[];
}

export type RawCatalog = Record<FileName, RawFile>;
