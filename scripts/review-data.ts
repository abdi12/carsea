import { count, desc, eq, gte, sql } from "drizzle-orm";

import { loadServiceCenters, loadVariantDetails } from "@/db/catalog-queries";
import { connect } from "@/db/connection";
import * as t from "@/db/schema";
import { currentPrice, variantName } from "@/domain/catalog-view";
import { daysBetween, freshnessDays, toIsoDate } from "@/domain/provenance";

// Usage: npm run db:review [-- --fail-on-stale]
//
// The routine data review (SPEC §13): what is published, what has gone
// stale or will soon, whether sample data is present, when data was last
// imported, and the last 30 days of usage counts.

const failOnStale = process.argv.includes("--fail-on-stale");
/** Flag a price this many days before it ages out, so it can be re-checked. */
const WARN_DAYS = 14;

async function main(): Promise<number> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set.");
    return 2;
  }
  const { client, db } = connect(url, { max: 1 });
  try {
    const today = toIsoDate(new Date(Date.now() + 7 * 3_600_000));
    const scope = { region: "jabodetabek", today } as const;
    const cars = await loadVariantDetails(db, scope);
    const centres = await loadServiceCenters(db, scope);
    const lines: string[] = [`Carsea data review, as of ${today}`, ""];

    const sample = cars.filter((c) => c.sample);
    const noPrice = cars.filter((c) => currentPrice(c) === null);
    const expiring = cars.filter(
      (c) =>
        c.price?.status === "current" &&
        freshnessDays.price - daysBetween(c.price.verifiedOn, today) <= WARN_DAYS,
    );
    const staleFacts = cars.flatMap((c) =>
      c.facts.filter((f) => f.stale).map((f) => `${c.id}: ${f.key} (checked ${f.verifiedOn})`),
    );
    const staleCentres = centres.filter((c) => c.stale);

    lines.push(`Published variants: ${cars.length}`);
    lines.push(`  recommendable today (current price): ${cars.length - noPrice.length}`);
    lines.push(`  without a current price: ${noPrice.length}`);
    for (const c of noPrice) {
      lines.push(`    - ${variantName(c)} [${c.id}]: ${c.price ? c.price.status : "no price"}`);
    }
    lines.push(`  price ages out within ${WARN_DAYS} days: ${expiring.length}`);
    for (const c of expiring) lines.push(`    - ${variantName(c)} [${c.id}]: checked ${c.price!.verifiedOn}`);
    lines.push(`Stale facts: ${staleFacts.length}`);
    for (const f of staleFacts.slice(0, 50)) lines.push(`    - ${f}`);
    lines.push(`Service centres: ${centres.length} (${staleCentres.length} stale)`);
    lines.push(
      sample.length
        ? `SAMPLE DATA PRESENT: ${sample.length} published variants cite a sample source. This must not happen in production.`
        : "Sample data: none",
    );

    const [lastImport] = await db
      .select()
      .from(t.importRuns)
      .where(eq(t.importRuns.dryRun, false))
      .orderBy(desc(t.importRuns.startedAt))
      .limit(1);
    lines.push(
      "",
      lastImport
        ? `Last import: ${lastImport.startedAt.toISOString()} from ${lastImport.directory} (${lastImport.rowsAccepted} accepted, ${lastImport.rowsRejected} rejected)`
        : "Last import: none recorded",
    );

    const since = toIsoDate(new Date(Date.now() - 30 * 86_400_000));
    const usage = await db
      .select({ event: t.usageCounts.event, total: sql<number>`sum(${t.usageCounts.count})::int` })
      .from(t.usageCounts)
      .where(gte(t.usageCounts.day, since))
      .groupBy(t.usageCounts.event)
      .orderBy(t.usageCounts.event);
    lines.push("", `Usage counts since ${since}:`);
    if (usage.length === 0) lines.push("  none");
    for (const u of usage) lines.push(`  ${u.event.padEnd(28)}${u.total}`);

    const [{ sources }] = await db.select({ sources: count() }).from(t.sources);
    lines.push("", `Sources on record: ${sources}`);

    console.log(lines.join("\n"));
    const problems = sample.length > 0 || (failOnStale && (noPrice.length > 0 || staleFacts.length > 0));
    return problems ? 1 : 0;
  } finally {
    await client.end();
  }
}

main().then(
  (code) => process.exit(code),
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
