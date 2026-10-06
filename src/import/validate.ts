import {
  type BodyStyle,
  type EnergyType,
  type FactKey,
  type FeatureAvailability,
  type FeatureKey,
  type Powertrain,
  type PublicationStatus,
  type Region,
  type SourceKind,
  type Transmission,
  type WarrantyCoverage,
  bodyStyles,
  energyTypes,
  energyUnit,
  factDefinitions,
  featureAvailabilities,
  isFactKey,
  isFeatureKey,
  isOneOf,
  powertrains,
  publicationStatuses,
  regions,
  sourceKinds,
  transmissions,
  warrantyCoverages,
} from "@/domain/catalog";
import { daysBetween, isStale, parseIsoDate } from "@/domain/provenance";

import { type FileName, type RawCatalog, type RawRow, fileColumns, fileNames } from "./files";

// Validation for a catalog import (SPEC §11). Pure: it takes parsed rows
// and today's date, and returns what may be published and what may not.
// A row is either fully accepted or rejected with every reason found; it is
// never repaired, truncated, or dropped without a record.

interface Provenance {
  sourceId: string;
  verifiedOn: string;
}

export interface ValidCatalog {
  sources: {
    id: string;
    kind: SourceKind;
    title: string;
    publisher: string;
    url: string | null;
    retrievedOn: string;
    licenseNote: string | null;
  }[];
  makes: { id: string; name: string }[];
  models: { id: string; makeId: string; name: string; bodyStyle: BodyStyle }[];
  variants: ({
    id: string;
    modelId: string;
    modelYear: number;
    trim: string;
    powertrain: Powertrain;
    transmission: Transmission;
    publicationStatus: PublicationStatus;
  } & Provenance)[];
  prices: ({
    variantId: string;
    region: Region;
    currency: "IDR";
    amount: number;
    validFrom: string;
    validUntil: string | null;
    inclusionsNote: string | null;
  } & Provenance)[];
  facts: ({
    variantId: string;
    key: FactKey;
    valueNumber: number | null;
    valueText: string | null;
    unit: string;
  } & Provenance)[];
  features: ({
    variantId: string;
    featureKey: FeatureKey;
    availability: FeatureAvailability;
  } & Provenance)[];
  warranties: ({
    variantId: string;
    coverage: WarrantyCoverage;
    years: number | null;
    distanceKm: number | null;
    conditions: string | null;
  } & Provenance)[];
  serviceCenters: ({
    id: string;
    makeId: string;
    name: string;
    address: string;
    city: string;
    region: Region;
    phone: string | null;
    openingHours: string | null;
    latitude: number | null;
    longitude: number | null;
  } & Provenance)[];
  energyPrices: ({
    region: Region;
    energyType: EnergyType;
    currency: "IDR";
    pricePerUnit: number;
    unit: string;
    validFrom: string;
  } & Provenance)[];
}

export interface Rejection {
  file: FileName;
  line: number;
  reasons: string[];
  row: Record<string, string>;
}

export interface ImportReport {
  today: string;
  /** Problems with a whole file, such as a missing file or wrong header. */
  fileErrors: { file: FileName; message: string }[];
  rejections: Rejection[];
  /** Accepted rows that deserve a look, such as facts already stale. */
  warnings: { file: FileName; line: number; message: string }[];
  counts: Record<FileName, { read: number; accepted: number; rejected: number }>;
  /** True when any accepted row cites development sample data. */
  containsSampleData: boolean;
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
// Plain decimal digits only. "300.000.000" and "1,5" are rejected rather
// than guessed at, because the two readings differ by orders of magnitude.
const NUMBER = /^\d+(?:\.\d+)?$/;
/** Below this an IDR car price is almost certainly in the wrong unit. */
const MIN_PLAUSIBLE_PRICE_IDR = 10_000_000;

/** Reads and checks the fields of one row, collecting every problem. */
class RowCheck {
  readonly reasons: string[] = [];

  constructor(
    private readonly row: RawRow,
    private readonly today: string,
  ) {}

  get ok() {
    return this.reasons.length === 0;
  }

  fail(reason: string) {
    if (!this.reasons.includes(reason)) this.reasons.push(reason);
  }

  private raw(column: string) {
    return this.row.values[column] ?? "";
  }

  text(column: string): string {
    const value = this.raw(column);
    if (!value) this.fail(`${column} is required`);
    return value;
  }

  optionalText(column: string): string | null {
    return this.raw(column) || null;
  }

  slug(column: string): string {
    const value = this.text(column);
    if (value && !SLUG.test(value)) {
      this.fail(`${column} "${value}" must be lowercase letters, digits, and single hyphens`);
    }
    return value;
  }

  oneOf<T extends string>(column: string, allowed: readonly T[]): T {
    const value = this.text(column);
    if (value && !isOneOf(allowed, value)) {
      this.fail(`${column} "${value}" is not one of: ${allowed.join(", ")}`);
    }
    return value as T;
  }

  number(column: string, options: { integer?: boolean; min?: number; max?: number } = {}): number {
    const value = this.text(column);
    if (!value) return NaN;
    return this.parseNumber(column, value, options);
  }

  optionalNumber(
    column: string,
    options: { integer?: boolean; min?: number; max?: number } = {},
  ): number | null {
    const value = this.raw(column);
    return value ? this.parseNumber(column, value, options) : null;
  }

  parseNumber(
    column: string,
    value: string,
    { integer = false, min, max }: { integer?: boolean; min?: number; max?: number },
  ): number {
    // Latitude and longitude are the only signed values.
    const unsigned = min !== undefined && min < 0 ? value.replace(/^-/, "") : value;
    if (!NUMBER.test(unsigned)) {
      this.fail(`${column} "${value}" is not a plain number (no separators, signs, or units)`);
      return NaN;
    }
    const parsed = Number(value);
    if (integer && !Number.isInteger(parsed)) this.fail(`${column} "${value}" must be a whole number`);
    if (min !== undefined && parsed < min) this.fail(`${column} ${value} is below ${min}`);
    if (max !== undefined && parsed > max) this.fail(`${column} ${value} is above ${max}`);
    return parsed;
  }

  date(column: string, { notFuture = false } = {}): string {
    const value = this.text(column);
    if (value) this.checkDate(column, value, notFuture);
    return value;
  }

  optionalDate(column: string): string | null {
    const value = this.raw(column);
    if (value) this.checkDate(column, value, false);
    return value || null;
  }

  private checkDate(column: string, value: string, notFuture: boolean) {
    if (!parseIsoDate(value)) {
      this.fail(`${column} "${value}" is not a valid YYYY-MM-DD date`);
    } else if (notFuture && daysBetween(value, this.today) < 0) {
      this.fail(`${column} ${value} is in the future`);
    }
  }

  /** `source_id` + `verified_on`, checked against the accepted sources. */
  provenance(sources: Map<string, unknown>): Provenance {
    const sourceId = this.text("source_id");
    if (sourceId && !sources.has(sourceId)) {
      this.fail(`source_id "${sourceId}" is not an accepted source`);
    }
    return { sourceId, verifiedOn: this.date("verified_on", { notFuture: true }) };
  }

  /** A reference to an accepted row in an earlier file. */
  reference<T>(column: string, accepted: Map<string, T>, what: string): T | undefined {
    const value = this.text(column);
    const target = accepted.get(value);
    if (value && !target) this.fail(`${column} "${value}" is not an accepted ${what}`);
    return target;
  }
}

export function validateCatalog(raw: RawCatalog, today: string): {
  catalog: ValidCatalog;
  report: ImportReport;
} {
  if (!parseIsoDate(today)) throw new Error(`today must be YYYY-MM-DD, got "${today}"`);

  const report: ImportReport = {
    today,
    fileErrors: [],
    rejections: [],
    warnings: [],
    counts: Object.fromEntries(
      fileNames.map((name) => [name, { read: 0, accepted: 0, rejected: 0 }]),
    ) as ImportReport["counts"],
    containsSampleData: false,
  };

  // A file with the wrong header is not read at all: guessing which column
  // was meant is how wrong data gets published.
  const usable = new Set<FileName>();
  for (const name of fileNames) {
    const { columns } = raw[name];
    const expected: readonly string[] = fileColumns[name];
    if (columns === null) {
      report.fileErrors.push({ file: name, message: `${name}.csv is missing` });
      continue;
    }
    const missing = expected.filter((c) => !columns.includes(c));
    const extra = columns.filter((c) => !expected.includes(c));
    if (missing.length || extra.length) {
      const parts = [
        missing.length ? `missing columns: ${missing.join(", ")}` : "",
        extra.length ? `unexpected columns: ${extra.join(", ")}` : "",
      ].filter(Boolean);
      report.fileErrors.push({ file: name, message: `${name}.csv has ${parts.join("; ")}` });
      continue;
    }
    usable.add(name);
  }

  /**
   * Runs `check` over a file's rows. A row is accepted when it has no
   * reasons and its key has not been seen; `check` returns the key and the
   * typed record.
   */
  function process<T>(
    file: FileName,
    check: (c: RowCheck, row: RawRow) => { key: string; record: T },
  ): Map<string, T> {
    const accepted = new Map<string, T>();
    const firstLine = new Map<string, number>();
    if (!usable.has(file)) return accepted;

    for (const row of raw[file].rows) {
      report.counts[file].read++;
      const c = new RowCheck(row, today);
      const { key, record } = check(c, row);
      const duplicateOf = firstLine.get(key);
      if (c.ok && duplicateOf !== undefined) c.fail(`duplicate of line ${duplicateOf}`);
      if (c.ok) {
        accepted.set(key, record);
        firstLine.set(key, row.line);
        report.counts[file].accepted++;
      } else {
        report.rejections.push({ file, line: row.line, reasons: c.reasons, row: row.values });
        report.counts[file].rejected++;
      }
    }
    return accepted;
  }

  const warn = (file: FileName, line: number, message: string) =>
    report.warnings.push({ file, line, message });

  const sources = process("sources", (c) => {
    const record = {
      id: c.slug("id"),
      kind: c.oneOf("kind", sourceKinds),
      title: c.text("title"),
      publisher: c.text("publisher"),
      url: c.optionalText("url"),
      retrievedOn: c.date("retrieved_on", { notFuture: true }),
      licenseNote: c.optionalText("license_note"),
    };
    // A fact someone else published has to be traceable to where.
    if ((record.kind === "official" || record.kind === "authoritative") && !record.url) {
      c.fail(`url is required for a source of kind "${record.kind}"`);
    }
    if (record.url && !/^https?:\/\/\S+$/.test(record.url)) {
      c.fail(`url "${record.url}" must start with http:// or https://`);
    }
    return { key: record.id, record };
  });

  const makes = process("makes", (c) => {
    const record = { id: c.slug("id"), name: c.text("name") };
    return { key: record.id, record };
  });

  const models = process("models", (c) => {
    const record = {
      id: c.slug("id"),
      makeId: c.text("make_id"),
      name: c.text("name"),
      bodyStyle: c.oneOf("body_style", bodyStyles),
    };
    c.reference("make_id", makes, "make");
    return { key: record.id, record };
  });

  const thisYear = Number(today.slice(0, 4));
  const identities = new Map<string, number>();
  const variants = process("variants", (c, row) => {
    const record = {
      id: c.slug("id"),
      modelId: c.text("model_id"),
      modelYear: c.number("model_year", { integer: true, min: 2000, max: thisYear + 1 }),
      trim: c.text("trim"),
      powertrain: c.oneOf("powertrain", powertrains),
      transmission: c.oneOf("transmission", transmissions),
      publicationStatus: c.oneOf("publication_status", publicationStatuses),
      ...c.provenance(sources),
    };
    c.reference("model_id", models, "model");
    // Two ids for the same car would split its facts between them.
    const identity = [
      record.modelId,
      record.modelYear,
      record.trim.toLowerCase(),
      record.powertrain,
      record.transmission,
    ].join("|");
    const sameCar = identities.get(identity);
    if (c.ok && sameCar !== undefined) {
      c.fail(`same model, year, trim, powertrain, and transmission as line ${sameCar}`);
    }
    if (c.ok) {
      identities.set(identity, row.line);
      if (isStale("identity", record.verifiedOn, today)) {
        warn("variants", row.line, `verified_on ${record.verifiedOn} is already stale`);
      }
    }
    return { key: record.id, record };
  });

  const prices = process("prices", (c, row) => {
    const record = {
      variantId: c.text("variant_id"),
      region: c.oneOf("region", regions),
      currency: c.oneOf("currency", ["IDR"] as const),
      amount: c.number("amount", { integer: true, min: 1 }),
      validFrom: c.date("valid_from"),
      validUntil: c.optionalDate("valid_until"),
      inclusionsNote: c.optionalText("inclusions_note"),
      ...c.provenance(sources),
    };
    c.reference("variant_id", variants, "variant");
    if (record.amount > 0 && record.amount < MIN_PLAUSIBLE_PRICE_IDR) {
      c.fail(
        `amount ${record.amount} is implausibly low for rupiah; state the full amount, not millions`,
      );
    }
    if (c.ok && record.validUntil) {
      if (daysBetween(record.validFrom, record.validUntil) < 0) {
        c.fail(`valid_until ${record.validUntil} is before valid_from ${record.validFrom}`);
      } else if (daysBetween(record.validUntil, today) > 0) {
        c.fail(`price expired on ${record.validUntil}`);
      }
    }
    if (c.ok && isStale("price", record.verifiedOn, today)) {
      warn("prices", row.line, `verified_on ${record.verifiedOn} is already stale; it will not be recommended`);
    }
    return { key: `${record.variantId}|${record.region}|${record.validFrom}`, record };
  });

  const facts = process("facts", (c, row) => {
    const key = c.text("key");
    const rawValue = c.text("value");
    const unit = c.optionalText("unit") ?? "";
    const variant = c.reference("variant_id", variants, "variant");
    const record = {
      variantId: row.values.variant_id ?? "",
      key: key as FactKey,
      valueNumber: null as number | null,
      valueText: null as string | null,
      unit,
      ...c.provenance(sources),
    };

    if (key && !isFactKey(key)) {
      c.fail(`key "${key}" is not a known fact`);
    } else if (isFactKey(key)) {
      const definition = factDefinitions[key];
      if (unit !== definition.unit) {
        c.fail(`unit "${unit}" must be "${definition.unit}" for ${key}`);
      }
      if (definition.type === "number" && rawValue) {
        const parsed = c.parseNumber("value", rawValue, { integer: definition.integer });
        if (parsed <= 0) c.fail(`value ${rawValue} must be greater than zero`);
        record.valueNumber = parsed;
      } else if (definition.type === "enum" && rawValue) {
        if (!isOneOf(definition.values, rawValue)) {
          c.fail(`value "${rawValue}" is not one of: ${definition.values.join(", ")}`);
        }
        record.valueText = rawValue;
      }

      // A figure that cannot apply to the powertrain is a data-entry error.
      if (variant) {
        const electric = variant.powertrain === "electric";
        if (key === "fuel_consumption_km_per_l" && electric) {
          c.fail("fuel_consumption_km_per_l does not apply to an electric variant");
        }
        if (key === "energy_consumption_kwh_per_100km" && !electric) {
          c.fail(`energy_consumption_kwh_per_100km does not apply to a ${variant.powertrain} variant`);
        }
        if (key === "energy_type" && isOneOf(energyTypes, rawValue)) {
          if ((energyUnit(rawValue) === "kwh") !== electric) {
            c.fail(`energy_type "${rawValue}" does not suit a ${variant.powertrain} variant`);
          }
        }
        if (key === "engine_displacement_cc" && electric) {
          c.fail("engine_displacement_cc does not apply to an electric variant");
        }
      }
    }
    return { key: `${record.variantId}|${key}`, record };
  });

  const features = process("features", (c) => {
    const featureKey = c.text("feature_key");
    if (featureKey && !isFeatureKey(featureKey)) {
      c.fail(`feature_key "${featureKey}" is not a known feature`);
    }
    const record = {
      variantId: c.text("variant_id"),
      featureKey: featureKey as FeatureKey,
      availability: c.oneOf("availability", featureAvailabilities),
      ...c.provenance(sources),
    };
    c.reference("variant_id", variants, "variant");
    return { key: `${record.variantId}|${featureKey}`, record };
  });

  const warranties = process("warranties", (c) => {
    const record = {
      variantId: c.text("variant_id"),
      coverage: c.oneOf("coverage", warrantyCoverages),
      years: c.optionalNumber("years", { integer: true, min: 1, max: 20 }),
      distanceKm: c.optionalNumber("distance_km", { integer: true, min: 1 }),
      conditions: c.optionalText("conditions"),
      ...c.provenance(sources),
    };
    const variant = c.reference("variant_id", variants, "variant");
    if (record.years === null && record.distanceKm === null) {
      c.fail("at least one of years or distance_km is required");
    }
    if (variant && record.coverage === "battery" && !["hybrid", "electric"].includes(variant.powertrain)) {
      c.fail(`battery coverage does not apply to a ${variant.powertrain} variant`);
    }
    return { key: `${record.variantId}|${record.coverage}`, record };
  });

  const serviceCenters = process("service_centers", (c, row) => {
    const record = {
      id: c.slug("id"),
      makeId: c.text("make_id"),
      name: c.text("name"),
      address: c.text("address"),
      city: c.text("city"),
      region: c.oneOf("region", regions),
      phone: c.optionalText("phone"),
      openingHours: c.optionalText("opening_hours"),
      latitude: c.optionalNumber("latitude", { min: -90, max: 90 }),
      longitude: c.optionalNumber("longitude", { min: -180, max: 180 }),
      ...c.provenance(sources),
    };
    c.reference("make_id", makes, "make");
    if ((record.latitude === null) !== (record.longitude === null)) {
      c.fail("latitude and longitude must be given together or both left empty");
    }
    if (c.ok && isStale("service_center", record.verifiedOn, today)) {
      warn("service_centers", row.line, `verified_on ${record.verifiedOn} is already stale`);
    }
    return { key: record.id, record };
  });

  const energyPrices = process("energy_prices", (c, row) => {
    const energyType = c.oneOf("energy_type", energyTypes);
    const record = {
      region: c.oneOf("region", regions),
      energyType,
      currency: c.oneOf("currency", ["IDR"] as const),
      pricePerUnit: c.number("price_per_unit"),
      unit: c.text("unit"),
      validFrom: c.date("valid_from", { notFuture: true }),
      ...c.provenance(sources),
    };
    if (record.pricePerUnit <= 0) c.fail("price_per_unit must be greater than zero");
    if (isOneOf(energyTypes, energyType) && record.unit && record.unit !== energyUnit(energyType)) {
      c.fail(`unit "${record.unit}" must be "${energyUnit(energyType)}" for ${energyType}`);
    }
    if (c.ok && isStale("energy_price", record.verifiedOn, today)) {
      warn("energy_prices", row.line, `verified_on ${record.verifiedOn} is already stale`);
    }
    return { key: `${record.region}|${energyType}|${record.validFrom}`, record };
  });

  const catalog: ValidCatalog = {
    sources: [...sources.values()],
    makes: [...makes.values()],
    models: [...models.values()],
    variants: [...variants.values()],
    prices: [...prices.values()],
    facts: [...facts.values()],
    features: [...features.values()],
    warranties: [...warranties.values()],
    serviceCenters: [...serviceCenters.values()],
    energyPrices: [...energyPrices.values()],
  };

  report.containsSampleData = catalog.sources.some((s) => s.kind === "sample");

  // A published variant with nothing to show for it is worth a second look.
  const priced = new Set(catalog.prices.map((p) => p.variantId));
  for (const row of usable.has("variants") ? raw.variants.rows : []) {
    const variant = variants.get(row.values.id);
    if (variant?.publicationStatus === "published" && !priced.has(variant.id)) {
      warn("variants", row.line, `published variant "${variant.id}" has no accepted price`);
    }
  }

  return { catalog, report };
}

export const hasProblems = (report: ImportReport): boolean =>
  report.fileErrors.length > 0 || report.rejections.length > 0;
