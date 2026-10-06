import { describe, expect, it } from "vitest";

import { type FileName, type RawCatalog, fileColumns, fileNames } from "./files";
import { hasProblems, validateCatalog } from "./validate";

const TODAY = "2026-10-06";
type Rows = Partial<Record<FileName, Record<string, string>[]>>;

const P = { source_id: "src", verified_on: "2026-10-01" };

/** A small valid catalog; tests override or append to single files. */
const base: Required<Rows> = {
  sources: [
    { id: "src", kind: "official", title: "Price list", publisher: "Maker", url: "https://example.test/prices", retrieved_on: "2026-10-01", license_note: "" },
  ],
  makes: [{ id: "make", name: "Make" }],
  models: [{ id: "make-car", make_id: "make", name: "Car", body_style: "suv" }],
  variants: [
    { id: "car-petrol", model_id: "make-car", model_year: "2026", trim: "1.5", powertrain: "petrol", transmission: "cvt", publication_status: "published", ...P },
    { id: "car-ev", model_id: "make-car", model_year: "2026", trim: "EV", powertrain: "electric", transmission: "single_speed", publication_status: "published", ...P },
  ],
  prices: [
    { variant_id: "car-petrol", region: "jabodetabek", currency: "IDR", amount: "300000000", valid_from: "2026-09-01", valid_until: "", inclusions_note: "", ...P },
    { variant_id: "car-ev", region: "jabodetabek", currency: "IDR", amount: "450000000", valid_from: "2026-09-01", valid_until: "", inclusions_note: "", ...P },
  ],
  facts: [{ variant_id: "car-petrol", key: "seats", value: "5", unit: "count", ...P }],
  features: [{ variant_id: "car-petrol", feature_key: "abs", availability: "standard", ...P }],
  warranties: [{ variant_id: "car-petrol", coverage: "vehicle", years: "3", distance_km: "100000", conditions: "", ...P }],
  service_centers: [
    { id: "make-jakarta", make_id: "make", name: "Make Jakarta", address: "Jl. A", city: "Jakarta", region: "jabodetabek", phone: "", opening_hours: "", latitude: "", longitude: "", ...P },
  ],
  energy_prices: [
    { region: "jabodetabek", energy_type: "petrol_ron92", currency: "IDR", price_per_unit: "12500", unit: "l", valid_from: "2026-09-01", ...P },
  ],
};

function catalog(overrides: Rows = {}, drop: FileName[] = []): RawCatalog {
  return Object.fromEntries(
    fileNames.map((name) => {
      if (drop.includes(name)) return [name, { columns: null, rows: [] }];
      const rows = overrides[name] ?? base[name];
      return [
        name,
        {
          columns: [...fileColumns[name]],
          // Line 1 is the header.
          rows: rows.map((values, i) => ({ line: i + 2, values })),
        },
      ];
    }),
  ) as RawCatalog;
}

const run = (overrides: Rows = {}, drop: FileName[] = []) =>
  validateCatalog(catalog(overrides, drop), TODAY);

/** Reasons for the single rejected row of `file`. */
function reasons(file: FileName, row: Record<string, string>): string[] {
  const { report } = run({ [file]: [...base[file], row] });
  const rejected = report.rejections.filter((r) => r.file === file);
  expect(rejected).toHaveLength(1);
  expect(rejected[0].line).toBe(base[file].length + 2);
  return rejected[0].reasons;
}

describe("validateCatalog: a clean set", () => {
  it("accepts every row and reports no problems", () => {
    const { catalog: valid, report } = run();
    expect(hasProblems(report)).toBe(false);
    expect(report.warnings).toEqual([]);
    expect(valid.variants).toHaveLength(2);
    expect(valid.prices[0]).toMatchObject({ amount: 300_000_000, validUntil: null, sourceId: "src" });
    expect(valid.facts[0]).toMatchObject({ key: "seats", valueNumber: 5, valueText: null });
    expect(report.counts.variants).toEqual({ read: 2, accepted: 2, rejected: 0 });
    expect(report.containsSampleData).toBe(false);
  });

  it("flags sample data", () => {
    const { report } = run({
      sources: [{ id: "src", kind: "sample", title: "Sample", publisher: "Carsea", url: "", retrieved_on: "2026-10-01", license_note: "" }],
    });
    expect(hasProblems(report)).toBe(false);
    expect(report.containsSampleData).toBe(true);
  });
});

describe("validateCatalog: files", () => {
  it("reports a missing file and rejects rows that depended on it", () => {
    const { catalog: valid, report } = run({}, ["variants"]);
    expect(report.fileErrors).toEqual([{ file: "variants", message: "variants.csv is missing" }]);
    expect(valid.prices).toEqual([]);
    expect(report.rejections.filter((r) => r.file === "prices")).toHaveLength(2);
  });

  it("refuses a file with a wrong header instead of guessing", () => {
    const raw = catalog();
    raw.prices.columns = raw.prices.columns!.map((c) => (c === "amount" ? "price" : c));
    const { catalog: valid, report } = validateCatalog(raw, TODAY);
    expect(report.fileErrors[0].message).toBe(
      "prices.csv has missing columns: amount; unexpected columns: price",
    );
    expect(valid.prices).toEqual([]);
  });
});

describe("validateCatalog: rows", () => {
  it("collects every reason for a bad row", () => {
    expect(
      reasons("variants", { id: "Car X", model_id: "nope", model_year: "1990", trim: "", powertrain: "steam", transmission: "cvt", publication_status: "published", source_id: "ghost", verified_on: "06/10/2026" }),
    ).toEqual([
      'id "Car X" must be lowercase letters, digits, and single hyphens',
      "model_year 1990 is below 2000",
      "trim is required",
      'powertrain "steam" is not one of: petrol, diesel, hybrid, electric',
      'source_id "ghost" is not an accepted source',
      'verified_on "06/10/2026" is not a valid YYYY-MM-DD date',
      'model_id "nope" is not an accepted model',
    ]);
  });

  it("rejects duplicate ids and duplicate identities", () => {
    expect(reasons("variants", { ...base.variants[0], trim: "1.5 Other" })).toEqual(["duplicate of line 2"]);
    expect(reasons("variants", { ...base.variants[0], id: "car-petrol-again" })).toEqual([
      "same model, year, trim, powertrain, and transmission as line 2",
    ]);
  });

  it("rejects a verification date in the future", () => {
    expect(reasons("features", { ...base.features[0], feature_key: "isofix", verified_on: "2026-10-07" })).toEqual([
      "verified_on 2026-10-07 is in the future",
    ]);
  });

  it("requires a URL for sources someone else published", () => {
    expect(reasons("sources", { ...base.sources[0], id: "no-url", url: "" })).toEqual([
      'url is required for a source of kind "official"',
    ]);
    expect(reasons("sources", { ...base.sources[0], id: "bad-url", url: "example.test" })).toEqual([
      'url "example.test" must start with http:// or https://',
    ]);
  });

  it("cascades a rejected parent to its children", () => {
    const { report } = run({ variants: [{ ...base.variants[0], powertrain: "steam" }, base.variants[1]] });
    expect(report.rejections.find((r) => r.file === "prices")?.reasons).toEqual([
      'variant_id "car-petrol" is not an accepted variant',
    ]);
    expect(report.counts.prices).toEqual({ read: 2, accepted: 1, rejected: 1 });
  });
});

describe("validateCatalog: prices", () => {
  const price = { ...base.prices[0], valid_from: "2026-10-01" };

  it("rejects separators, non-rupiah currency, and implausible amounts", () => {
    expect(reasons("prices", { ...price, amount: "300.000.000" })).toEqual([
      'amount "300.000.000" is not a plain number (no separators, signs, or units)',
    ]);
    expect(reasons("prices", { ...price, currency: "USD" })).toEqual(['currency "USD" is not one of: IDR']);
    expect(reasons("prices", { ...price, amount: "300" })).toEqual([
      "amount 300 is implausibly low for rupiah; state the full amount, not millions",
    ]);
    expect(reasons("prices", { ...price, amount: "0" })).toEqual(["amount 0 is below 1"]);
  });

  it("rejects expired and inverted validity windows", () => {
    expect(reasons("prices", { ...price, valid_from: "2026-08-01", valid_until: "2026-08-31" })).toEqual([
      "price expired on 2026-08-31",
    ]);
    expect(reasons("prices", { ...price, valid_until: "2026-09-01" })).toEqual([
      "valid_until 2026-09-01 is before valid_from 2026-10-01",
    ]);
  });

  it("accepts a stale price but warns that it will not be recommended", () => {
    const { report } = run({ prices: [{ ...base.prices[0], verified_on: "2026-06-01" }, base.prices[1]] });
    expect(hasProblems(report)).toBe(false);
    expect(report.warnings).toEqual([
      { file: "prices", line: 2, message: "verified_on 2026-06-01 is already stale; it will not be recommended" },
    ]);
  });

  it("warns about a published variant without a price", () => {
    const { report } = run({ prices: [base.prices[0]] });
    expect(report.warnings).toEqual([
      { file: "variants", line: 3, message: 'published variant "car-ev" has no accepted price' },
    ]);
  });
});

describe("validateCatalog: facts", () => {
  const fact = (over: Record<string, string>) => ({ variant_id: "car-petrol", key: "length_mm", value: "4400", unit: "mm", ...P, ...over });

  it("checks key, unit, and value", () => {
    expect(reasons("facts", fact({ key: "horsepower" }))).toEqual(['key "horsepower" is not a known fact']);
    expect(reasons("facts", fact({ unit: "cm" }))).toEqual(['unit "cm" must be "mm" for length_mm']);
    expect(reasons("facts", fact({ value: "4400.5" }))).toEqual(['value "4400.5" must be a whole number']);
    expect(reasons("facts", fact({ value: "4,4" }))).toEqual([
      'value "4,4" is not a plain number (no separators, signs, or units)',
    ]);
    expect(reasons("facts", fact({ value: "0" }))).toEqual(["value 0 must be greater than zero"]);
  });

  it("accepts enum facts as text", () => {
    const { catalog: valid, report } = run({
      facts: [fact({ key: "energy_type", value: "petrol_ron92", unit: "" })],
    });
    expect(hasProblems(report)).toBe(false);
    expect(valid.facts[0]).toMatchObject({ valueNumber: null, valueText: "petrol_ron92" });
  });

  it("rejects figures that cannot apply to the powertrain", () => {
    expect(reasons("facts", fact({ variant_id: "car-ev", key: "fuel_consumption_km_per_l", value: "20", unit: "km/l" }))).toEqual([
      "fuel_consumption_km_per_l does not apply to an electric variant",
    ]);
    expect(reasons("facts", fact({ key: "energy_consumption_kwh_per_100km", value: "15", unit: "kwh/100km" }))).toEqual([
      "energy_consumption_kwh_per_100km does not apply to a petrol variant",
    ]);
    expect(reasons("facts", fact({ key: "energy_type", value: "electricity_home", unit: "" }))).toEqual([
      'energy_type "electricity_home" does not suit a petrol variant',
    ]);
  });
});

describe("validateCatalog: other files", () => {
  it("checks features", () => {
    expect(reasons("features", { ...base.features[0], feature_key: "heated_cupholder" })).toEqual([
      'feature_key "heated_cupholder" is not a known feature',
    ]);
    expect(reasons("features", { ...base.features[0], feature_key: "isofix", availability: "yes" })).toEqual([
      'availability "yes" is not one of: standard, optional, unavailable, not_applicable',
    ]);
  });

  it("checks warranties", () => {
    expect(reasons("warranties", { ...base.warranties[0], coverage: "powertrain", years: "", distance_km: "" })).toEqual([
      "at least one of years or distance_km is required",
    ]);
    expect(reasons("warranties", { ...base.warranties[0], coverage: "battery" })).toEqual([
      "battery coverage does not apply to a petrol variant",
    ]);
  });

  it("checks service centres", () => {
    const centre = { ...base.service_centers[0], id: "make-bekasi" };
    expect(reasons("service_centers", { ...centre, latitude: "-6.2" })).toEqual([
      "latitude and longitude must be given together or both left empty",
    ]);
    expect(reasons("service_centers", { ...centre, latitude: "-96", longitude: "106.8" })).toEqual([
      "latitude -96 is below -90",
    ]);
    const { report } = run({ service_centers: [{ ...centre, latitude: "-6.2", longitude: "106.8" }] });
    expect(hasProblems(report)).toBe(false);
  });

  it("checks energy prices", () => {
    const energy = { ...base.energy_prices[0], energy_type: "petrol_ron95" };
    expect(reasons("energy_prices", { ...energy, unit: "kwh" })).toEqual([
      'unit "kwh" must be "l" for petrol_ron95',
    ]);
    expect(reasons("energy_prices", { ...energy, price_per_unit: "0" })).toEqual([
      "price_per_unit must be greater than zero",
    ]);
  });
});
