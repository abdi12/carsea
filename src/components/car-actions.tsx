"use client";

import Link from "next/link";
import { useState } from "react";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { compareStore, savedStore, toggleCompare, toggleSaved } from "@/lib/research-store";

import { CheckIcon } from "./icons";

const toggle =
  "type-label inline-flex min-h-11 items-center gap-2 border-2 px-3.5 transition-colors duration-150 ease-press";
const off = "border-rule-strong text-ink hover:bg-ink hover:text-page";
const on = "border-stamp bg-stamp-wash text-stamp";

/** Add to comparison (at most three) and save to the local shortlist. */
export function CarActions({
  id,
  name,
  lang,
  dict,
}: {
  id: string;
  name: string;
  lang: Locale;
  dict: Dictionary["actions"];
}) {
  const compared = compareStore.use().includes(id);
  const saved = savedStore.use().includes(id);
  const [full, setFull] = useState(false);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={compared}
          aria-label={`${compared ? dict.compareRemove : dict.compareAdd}: ${name}`}
          onClick={() => setFull(!toggleCompare(id))}
          className={`${toggle} ${compared ? on : off}`}
        >
          {compared ? <CheckIcon width={16} height={16} /> : null}
          {compared ? dict.compared : dict.compare}
        </button>
        <button
          type="button"
          aria-pressed={saved}
          aria-label={`${saved ? dict.saveRemove : dict.saveAdd}: ${name}`}
          onClick={() => toggleSaved(id)}
          className={`${toggle} ${saved ? on : off}`}
        >
          {saved ? <CheckIcon width={16} height={16} /> : null}
          {saved ? dict.saved : dict.save}
        </button>
      </div>
      {/* Announced when the three-car limit blocks an add. */}
      <p role="status" className="mt-2 text-sm text-ink-muted empty:hidden">
        {full ? (
          <>
            {dict.compareFull}{" "}
            <Link href={`/${lang}/compare`} className="underline">
              {dict.compareOpen}
            </Link>
          </>
        ) : null}
      </p>
    </div>
  );
}
