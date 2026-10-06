import { sql } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";

import type { Database } from "@/db/connection";
import * as t from "@/db/schema";

import type { ImportReport, ValidCatalog } from "./validate";

/** `excluded.<column>` for every column, so an upsert overwrites the row. */
function overwrite(columns: Record<string, { name: string }>) {
  return Object.fromEntries(
    Object.entries(columns).map(([key, column]) => [key, sql.raw(`excluded."${column.name}"`)]),
  );
}

/**
 * Writes an accepted catalog in one transaction, in dependency order.
 * Rows are upserted by their natural key. Rows absent from the files are
 * left as they are: removing a car is a deliberate act (set its
 * publication_status to `withdrawn`), not a side effect of a short file.
 */
export async function writeCatalog(db: Database, catalog: ValidCatalog): Promise<void> {
  await db.transaction(async (tx) => {
    const upsert = async <T extends PgTable>(
      table: T,
      rows: T["$inferInsert"][],
      target: unknown[],
      columns: Record<string, { name: string }>,
    ) => {
      // Chunked to stay well under the bind-parameter limit.
      for (let i = 0; i < rows.length; i += 500) {
        await tx
          .insert(table)
          .values(rows.slice(i, i + 500) as never)
          .onConflictDoUpdate({ target: target as never, set: overwrite(columns) as never });
      }
    };

    await upsert(t.sources, catalog.sources, [t.sources.id], {
      kind: t.sources.kind,
      title: t.sources.title,
      publisher: t.sources.publisher,
      url: t.sources.url,
      retrievedOn: t.sources.retrievedOn,
      licenseNote: t.sources.licenseNote,
    });
    await upsert(t.makes, catalog.makes, [t.makes.id], { name: t.makes.name });
    await upsert(t.models, catalog.models, [t.models.id], {
      makeId: t.models.makeId,
      name: t.models.name,
      bodyStyle: t.models.bodyStyle,
    });
    await upsert(
      t.variants,
      catalog.variants.map((v) => ({ ...v, updatedAt: new Date() })),
      [t.variants.id],
      {
        modelId: t.variants.modelId,
        modelYear: t.variants.modelYear,
        trim: t.variants.trim,
        powertrain: t.variants.powertrain,
        transmission: t.variants.transmission,
        publicationStatus: t.variants.publicationStatus,
        sourceId: t.variants.sourceId,
        verifiedOn: t.variants.verifiedOn,
        updatedAt: t.variants.updatedAt,
      },
    );
    await upsert(
      t.prices,
      catalog.prices.map((p) => ({ ...p, priceType: "otr" })),
      [t.prices.variantId, t.prices.region, t.prices.priceType, t.prices.validFrom],
      {
        currency: t.prices.currency,
        amount: t.prices.amount,
        validUntil: t.prices.validUntil,
        inclusionsNote: t.prices.inclusionsNote,
        sourceId: t.prices.sourceId,
        verifiedOn: t.prices.verifiedOn,
      },
    );
    await upsert(t.variantFacts, catalog.facts, [t.variantFacts.variantId, t.variantFacts.key], {
      valueNumber: t.variantFacts.valueNumber,
      valueText: t.variantFacts.valueText,
      unit: t.variantFacts.unit,
      sourceId: t.variantFacts.sourceId,
      verifiedOn: t.variantFacts.verifiedOn,
    });
    await upsert(
      t.variantFeatures,
      catalog.features,
      [t.variantFeatures.variantId, t.variantFeatures.featureKey],
      {
        availability: t.variantFeatures.availability,
        sourceId: t.variantFeatures.sourceId,
        verifiedOn: t.variantFeatures.verifiedOn,
      },
    );
    await upsert(t.warranties, catalog.warranties, [t.warranties.variantId, t.warranties.coverage], {
      years: t.warranties.years,
      distanceKm: t.warranties.distanceKm,
      conditions: t.warranties.conditions,
      sourceId: t.warranties.sourceId,
      verifiedOn: t.warranties.verifiedOn,
    });
    await upsert(t.serviceCenters, catalog.serviceCenters, [t.serviceCenters.id], {
      makeId: t.serviceCenters.makeId,
      name: t.serviceCenters.name,
      address: t.serviceCenters.address,
      city: t.serviceCenters.city,
      region: t.serviceCenters.region,
      phone: t.serviceCenters.phone,
      openingHours: t.serviceCenters.openingHours,
      latitude: t.serviceCenters.latitude,
      longitude: t.serviceCenters.longitude,
      sourceId: t.serviceCenters.sourceId,
      verifiedOn: t.serviceCenters.verifiedOn,
    });
    await upsert(
      t.energyPrices,
      catalog.energyPrices,
      [t.energyPrices.region, t.energyPrices.energyType, t.energyPrices.validFrom],
      {
        currency: t.energyPrices.currency,
        pricePerUnit: t.energyPrices.pricePerUnit,
        unit: t.energyPrices.unit,
        sourceId: t.energyPrices.sourceId,
        verifiedOn: t.energyPrices.verifiedOn,
      },
    );
  });
}

export async function recordImportRun(
  db: Database,
  run: { directory: string; dryRun: boolean; report: ImportReport },
): Promise<void> {
  const totals = Object.values(run.report.counts).reduce(
    (sum, c) => ({
      read: sum.read + c.read,
      accepted: sum.accepted + c.accepted,
      rejected: sum.rejected + c.rejected,
    }),
    { read: 0, accepted: 0, rejected: 0 },
  );
  await db.insert(t.importRuns).values({
    directory: run.directory,
    dryRun: run.dryRun,
    rowsRead: totals.read,
    rowsAccepted: totals.accepted,
    rowsRejected: totals.rejected,
    report: run.report,
  });
}
