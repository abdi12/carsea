"use client";

import { useState } from "react";

import type { ServiceCenterView } from "@/domain/catalog-view";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill } from "@/lib/format";

import { EmptySheet } from "./page-parts";
import { SourceNote } from "./provenance";
import { Stamp } from "./stamp";

const field = "min-h-11 w-full border border-rule-strong bg-surface px-3 text-ink placeholder:text-ink-muted";

/** A searchable list. It needs no map tiles and no location permission. */
export function ServiceCentreList({
  centres,
  lang,
  dict,
}: {
  centres: ServiceCenterView[];
  lang: Locale;
  dict: Pick<Dictionary, "service" | "provenance">;
}) {
  const [query, setQuery] = useState("");
  const [make, setMake] = useState("");
  const makes = [...new Map(centres.map((c) => [c.makeId, c.makeName]))];

  const needle = query.trim().toLowerCase();
  const shown = centres.filter(
    (c) =>
      (!make || c.makeId === make) &&
      (!needle || `${c.name} ${c.city} ${c.address}`.toLowerCase().includes(needle)),
  );

  return (
    <div>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="grid gap-px border border-rule-strong bg-rule sm:grid-cols-[2fr_1fr]"
      >
        <div className="bg-surface p-4">
          <label htmlFor="centre-search" className="type-label block text-ink-muted">
            {dict.service.search}
          </label>
          <input
            id="centre-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={dict.service.searchPlaceholder}
            className={`${field} mt-2`}
          />
        </div>
        <div className="bg-surface p-4">
          <label htmlFor="centre-make" className="type-label block text-ink-muted">
            {dict.service.make}
          </label>
          <select id="centre-make" value={make} onChange={(e) => setMake(e.target.value)} className={`${field} mt-2`}>
            <option value="">{dict.service.allMakes}</option>
            {makes.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </form>

      <p role="status" className="type-label mt-6 text-ink-muted">
        {fill(dict.service.count, { shown: shown.length, total: centres.length })}
      </p>

      {shown.length === 0 ? (
        <div className="mt-4">
          <EmptySheet title={dict.service.noMatch.title} body={dict.service.noMatch.body}>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setMake("");
              }}
              className="type-label min-h-12 bg-cover px-5 text-on-cover hover:bg-cover-deep"
            >
              {dict.service.clear}
            </button>
          </EmptySheet>
        </div>
      ) : (
        <ul className="mt-4 border border-rule-strong bg-surface">
          {shown.map((c) => (
            <li key={c.id} className="grid gap-x-8 gap-y-3 border-b border-rule p-5 last:border-b-0 sm:p-6 md:grid-cols-[1fr_1fr]">
              <div>
                <h2 className="type-title text-xl">{c.name}</h2>
                <p className="type-label mt-1 text-ink-muted">{c.makeName}</p>
                <p className="mt-3">
                  {c.source.kind === "sample" ? (
                    <Stamp kind="estimate">{dict.provenance.sample}</Stamp>
                  ) : c.stale ? (
                    <Stamp kind="stale">{dict.provenance.stale}</Stamp>
                  ) : (
                    <Stamp kind="verified">{dict.provenance.verified}</Stamp>
                  )}
                </p>
              </div>
              <div>
                <address className="not-italic">
                  {c.address}, {c.city}
                </address>
                <dl className="mt-2 text-ink-muted">
                  <div>
                    <dt className="inline">{dict.service.phone}: </dt>
                    <dd className="inline">{c.phone ?? dict.service.notVerified}</dd>
                  </div>
                  <div>
                    <dt className="inline">{dict.service.hours}: </dt>
                    <dd className="inline">{c.openingHours ?? dict.service.notVerified}</dd>
                  </div>
                </dl>
                <SourceNote item={c} source={c.source} lang={lang} dict={dict.provenance} className="mt-3" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
