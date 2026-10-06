# Maintaining catalog data

Carsea's catalog is maintained as a set of CSV files and loaded with one
command. There is no editor in the product. This page is for whoever keeps
the data current.

## The short version

```bash
npm run db:migrate                                   # once per schema change
npm run db:import -- path/to/csv-directory --dry-run # check, write nothing
npm run db:import -- path/to/csv-directory           # check, then write
```

Both commands need `DATABASE_URL` in the environment (the dry run does
not). Run them from a checkout of this repository; the production container
does not include the import tooling.

Always do the dry run first and read the report.

## What the import does

1. Reads ten CSV files from the directory.
2. Checks every row. A row is either accepted whole or rejected with every
   reason found. Nothing is corrected, truncated, or skipped silently.
3. Prints a report: counts per file, file problems, rejected rows with
   reasons, and warnings.
4. Writes the accepted rows in a single transaction and records the run,
   with its full report, in the `import_runs` table.

By default the import writes **nothing** if any row is rejected.

| Flag | Effect |
|---|---|
| `--dry-run` | Check and report only. |
| `--report <file>` | Also save the full report as JSON. |
| `--allow-partial` | Write the accepted rows even though some were rejected. Use only after reading the report. A missing file or wrong header still stops the import. |
| `--allow-sample` | Permit sources of kind `sample`. Development databases only. |

The exit code is `0` when everything was accepted and `1` when anything was
rejected, so a scheduled import can alert on failure.

### What is not deleted

Rows are added or updated by their key. A row that is missing from the
files is left in the database. To take a car off the site, set its
`publication_status` to `withdrawn`; do not just remove its line.

## The files

All ten must be present, with exactly these headers. Dates are
`YYYY-MM-DD`. Numbers are plain digits with an optional decimal point: no
thousands separators, currency symbols, or units (`300000000`, not
`300.000.000` or `Rp300jt`). Leave optional cells empty.

| File | Columns |
|---|---|
| `sources.csv` | `id, kind, title, publisher, url, retrieved_on, license_note` |
| `makes.csv` | `id, name` |
| `models.csv` | `id, make_id, name, body_style` |
| `variants.csv` | `id, model_id, model_year, trim, powertrain, transmission, publication_status, source_id, verified_on` |
| `prices.csv` | `variant_id, region, currency, amount, valid_from, valid_until, inclusions_note, source_id, verified_on` |
| `facts.csv` | `variant_id, key, value, unit, source_id, verified_on` |
| `features.csv` | `variant_id, feature_key, availability, source_id, verified_on` |
| `warranties.csv` | `variant_id, coverage, years, distance_km, conditions, source_id, verified_on` |
| `service_centers.csv` | `id, make_id, name, address, city, region, phone, opening_hours, latitude, longitude, source_id, verified_on` |
| `energy_prices.csv` | `region, energy_type, currency, price_per_unit, unit, valid_from, source_id, verified_on` |

Ids are lowercase letters, digits, and single hyphens. A variant id becomes
part of its public URL, so do not change one after publishing.

The allowed values for `kind`, `body_style`, `powertrain`, `transmission`,
`publication_status`, `region`, `energy_type`, `coverage`, `availability`,
and every fact and feature key are defined in
[`src/domain/catalog.ts`](../src/domain/catalog.ts). The report lists the
allowed values whenever it rejects one.

### Provenance

Every row that states a fact carries `source_id` and `verified_on`: where
the fact came from and the date someone last checked it. They are recorded
per row on purpose, so a freshly checked price does not make an unchecked
specification look checked.

- `source_id` must match a row in `sources.csv`.
- `verified_on` cannot be in the future.
- A source of kind `official` or `authoritative` must have a `url`.
- Record usage rights or terms in `license_note`.

### Facts

One fact per row. Each key has exactly one permitted unit:

| Key | Unit |
|---|---|
| `seats` | `count` |
| `length_mm`, `width_mm`, `height_mm`, `wheelbase_mm`, `ground_clearance_mm` | `mm` |
| `cargo_volume_l` | `l` |
| `engine_displacement_cc` | `cc` |
| `power_kw` | `kw` |
| `torque_nm` | `nm` |
| `battery_capacity_kwh` | `kwh` |
| `range_km` | `km` |
| `fuel_consumption_km_per_l` | `km/l` |
| `energy_consumption_kwh_per_100km` | `kwh/100km` |
| `energy_type` | (empty) |
| `service_cost_annual_idr`, `annual_tax_idr`, `insurance_annual_idr` | `idr/year` |

If a figure cannot be supported by a source, leave the row out. The site
then shows it as unavailable. Do not enter an estimate as if it were a fact.

### Features

A feature with no row is shown as **unknown**, which is different from
`unavailable`. Only `standard` counts as included in the car's price.

## What gets rejected

- A missing file, or a header that is not exactly as listed (the whole file).
- A missing required value, an unknown key or value, a malformed id.
- A duplicate key, or two variant ids describing the same car.
- A reference to a source, make, model, or variant that is absent or was
  itself rejected.
- A badly formed date, or a verification date in the future.
- A price that is not IDR, is zero, has expired, ends before it starts, or
  is below Rp10,000,000 (almost always an amount entered in millions).
- A fact with the wrong unit, a non-positive value, or one that cannot apply
  to the powertrain (fuel consumption on an electric car, battery warranty
  on a petrol car).

## Warnings

Warnings do not block the import:

- A row whose `verified_on` is already older than its freshness window.
- A `published` variant with no accepted price.

## Freshness

A fact stops counting as current some days after `verified_on`:

| Data | Days |
|---|---|
| Price | 90 |
| Energy price | 60 |
| Service centre | 180 |
| Warranty, cost inputs | 365 |
| Specifications, features, variant identity | 730 |

A car without a current price is not recommended. A stale specification is
treated as unknown when matching. Re-verifying a fact means checking the
source again and updating `verified_on` in the file.

These windows are working assumptions set in
[`src/domain/provenance.ts`](../src/domain/provenance.ts). They have not
been checked against how often each real source changes.

## Sample data

[`data/sample/`](../data/sample/) holds fictional cars for development:

```bash
npm run db:import -- data/sample --allow-sample
```

Never load it into production.
