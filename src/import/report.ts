import { fileNames } from "./files";
import { type ImportReport, hasProblems } from "./validate";

/** A plain-text summary for whoever is running the import. */
export function formatReport(report: ImportReport): string {
  const lines: string[] = [`Catalog import check, as of ${report.today}`, ""];

  lines.push("File              read  accepted  rejected");
  for (const name of fileNames) {
    const c = report.counts[name];
    lines.push(
      `${name.padEnd(16)}${String(c.read).padStart(6)}${String(c.accepted).padStart(10)}${String(c.rejected).padStart(10)}`,
    );
  }

  if (report.fileErrors.length) {
    lines.push("", "File problems (the file was not read):");
    for (const e of report.fileErrors) lines.push(`  ${e.message}`);
  }

  if (report.rejections.length) {
    lines.push("", "Rejected rows:");
    for (const r of report.rejections) {
      lines.push(`  ${r.file}.csv line ${r.line}`);
      for (const reason of r.reasons) lines.push(`    - ${reason}`);
    }
  }

  if (report.warnings.length) {
    lines.push("", "Warnings (accepted, but check them):");
    for (const w of report.warnings) lines.push(`  ${w.file}.csv line ${w.line}: ${w.message}`);
  }

  if (report.containsSampleData) {
    lines.push("", "This set contains SAMPLE data. It must not be loaded into production.");
  }

  lines.push("", hasProblems(report) ? "Result: problems found." : "Result: all rows accepted.");
  return lines.join("\n");
}
