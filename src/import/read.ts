import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { parse } from "csv-parse/sync";

import { type FileName, type RawCatalog, type RawFile, fileNames } from "./files";

function readFile(path: string): RawFile {
  if (!existsSync(path)) return { columns: null, rows: [] };

  const records = parse(readFileSync(path, "utf8"), {
    bom: true,
    columns: true,
    info: true,
    skip_empty_lines: true,
    trim: true,
  }) as { record: Record<string, string>; info: { lines: number; columns: { name: string }[] } }[];

  // With no data rows the header still has to be checked, so read it alone.
  const columns =
    records[0]?.info.columns.map((c) => c.name) ??
    ((parse(readFileSync(path, "utf8"), { bom: true, to_line: 1, trim: true }) as string[][])[0] ?? []);

  return {
    columns,
    rows: records.map(({ record, info }) => ({ line: info.lines, values: record })),
  };
}

/** Reads `<name>.csv` for every catalog file in `directory`. */
export function readCatalogDirectory(directory: string): RawCatalog {
  return Object.fromEntries(
    fileNames.map((name) => [name, readFile(join(directory, `${name}.csv`))]),
  ) as Record<FileName, RawFile>;
}
