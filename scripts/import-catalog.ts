import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";

import { connect } from "@/db/connection";
import { toIsoDate } from "@/domain/provenance";
import { readCatalogDirectory } from "@/import/read";
import { formatReport } from "@/import/report";
import { hasProblems, validateCatalog } from "@/import/validate";
import { recordImportRun, writeCatalog } from "@/import/write";

// Usage: npm run db:import -- <directory> [--dry-run] [--allow-partial]
//                                         [--allow-sample] [--report <file>]
// See docs/data-import.md.

const { values: flags, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    "dry-run": { type: "boolean", default: false },
    "allow-partial": { type: "boolean", default: false },
    "allow-sample": { type: "boolean", default: false },
    report: { type: "string" },
  },
});

async function main(): Promise<number> {
  const [directoryArg] = positionals;
  if (!directoryArg) {
    console.error("Give the directory holding the CSV files, e.g. data/sample");
    return 2;
  }
  const directory = resolve(directoryArg);
  const dryRun = flags["dry-run"];

  const { catalog, report } = validateCatalog(
    readCatalogDirectory(directory),
    toIsoDate(new Date()),
  );
  console.log(formatReport(report));
  if (flags.report) {
    writeFileSync(flags.report, JSON.stringify(report, null, 2));
    console.log(`\nFull report written to ${flags.report}`);
  }

  const problems = hasProblems(report);
  if (dryRun) {
    console.log("\nDry run: nothing was written.");
    return problems ? 1 : 0;
  }

  // Missing or malformed files always stop the import. Rejected rows stop
  // it too unless the operator has read the report and chosen to proceed.
  if (report.fileErrors.length || (problems && !flags["allow-partial"])) {
    console.error(
      "\nNothing was written. Fix the problems above, or pass --allow-partial to import only the accepted rows.",
    );
    return 1;
  }
  if (report.containsSampleData && !flags["allow-sample"]) {
    console.error(
      "\nNothing was written. This set contains sample data; pass --allow-sample to load it into a development database.",
    );
    return 1;
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("\nDATABASE_URL is not set.");
    return 2;
  }

  const { client, db } = connect(url, { max: 1 });
  try {
    await writeCatalog(db, catalog);
    await recordImportRun(db, { directory: directoryArg, dryRun, report });
  } finally {
    await client.end();
  }
  console.log("\nImport written.");
  return problems ? 1 : 0;
}

main().then(
  (code) => process.exit(code),
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
