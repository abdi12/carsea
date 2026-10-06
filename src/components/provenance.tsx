import type { Provenanced, SourceView } from "@/domain/catalog-view";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill, formatDate } from "@/lib/format";

import { Stamp } from "./stamp";

type ProvenanceDict = Dictionary["provenance"];

/**
 * The stamp for a recorded fact. Sample data is never stamped as verified,
 * and a stale fact says so in words as well as shape.
 */
export function ProvenanceStamp({
  item,
  source,
  dict,
}: {
  item: Provenanced;
  source: SourceView | undefined;
  dict: ProvenanceDict;
}) {
  if (source?.kind === "sample") return <Stamp kind="estimate">{dict.sample}</Stamp>;
  if (item.stale) return <Stamp kind="stale">{dict.stale}</Stamp>;
  if (source?.kind === "computed") return <Stamp kind="estimate">{dict.computed}</Stamp>;
  return <Stamp kind="verified">{dict.verified}</Stamp>;
}

/** "Source: … Checked 12 Sep 2026." with a link when the source has one. */
export function SourceNote({
  item,
  source,
  lang,
  dict,
  className = "",
}: {
  item: Provenanced;
  source: SourceView | undefined;
  lang: Locale;
  dict: ProvenanceDict;
  className?: string;
}) {
  const name = source ? `${source.title}, ${source.publisher}` : item.sourceId;
  return (
    <span className={`block text-sm text-ink-muted ${className}`}>
      {dict.source}{" "}
      {source?.url ? (
        <a href={source.url} rel="noopener noreferrer" className="underline decoration-rule hover:decoration-ink">
          {name}
        </a>
      ) : (
        name
      )}
      . {fill(item.stale ? dict.lastChecked : dict.checked, { date: formatDate(item.verifiedOn, lang) })}
    </span>
  );
}
