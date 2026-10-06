import type { PriceView } from "@/domain/catalog-view";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { formatIdr } from "@/lib/format";

/**
 * A price with its market context. A price that is not current is still
 * shown, but labelled, and never as if it were today's price.
 */
export function PriceLine({
  price,
  lang,
  dict,
  size = "text-xl",
}: {
  price: PriceView | null;
  lang: Locale;
  dict: Dictionary["price"];
  size?: string;
}) {
  if (!price) return <span className="text-ink-muted">{dict.none}</span>;
  return (
    <span className="block">
      <span className={`type-figure block ${size}`}>{formatIdr(price.amount, lang)}</span>
      <span className="block text-sm text-ink-muted">
        {dict.otr}
        {price.status !== "current" ? ` · ${dict.status[price.status]}` : ""}
      </span>
    </span>
  );
}
