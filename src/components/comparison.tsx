"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";

import { type FactKey, featureKeys } from "@/domain/catalog";
import { type Provenanced, type VariantDetail, variantName } from "@/domain/catalog-view";
import { monthlyKmOf } from "@/domain/finder";
import { costComponents, estimateOwnershipCost } from "@/domain/ownership-cost";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { formatFact, formatWarranty } from "@/lib/fact-format";
import { fill, formatDate, formatIdr, formatNumber } from "@/lib/format";
import {
  MAX_COMPARE,
  compareStore,
  finderStore,
  savedStore,
  toggleCompare,
  toggleSaved,
  useHydrated,
  useStorageAvailable,
} from "@/lib/research-store";

import { Button, ButtonLink } from "./button";
import { EmptySheet, Notice, SkeletonSheet } from "./page-parts";
import { PriceLine } from "./price-line";

type Dict = Pick<Dictionary, "compare" | "labels" | "price" | "cost" | "provenance" | "states" | "actions">;

interface Row {
  label: string;
  cells: ReactNode[];
}
interface Group {
  title: string;
  rows: Row[];
}

type Loaded =
  | { state: "loading" }
  | { state: "error" }
  | { state: "ready"; today: string; variants: VariantDetail[] };

const specKeys: FactKey[] = [
  "seats",
  "length_mm",
  "cargo_volume_l",
  "ground_clearance_mm",
  "fuel_consumption_km_per_l",
  "energy_consumption_kwh_per_100km",
  "range_km",
  "power_kw",
];

export function Comparison({ lang, dict }: { lang: Locale; dict: Dict }) {
  const hydrated = useHydrated();
  const storageAvailable = useStorageAvailable();
  const compareIds = compareStore.use();
  const savedIds = savedStore.use();
  const monthlyKm = monthlyKmOf(finderStore.use());
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{
    key: string;
    data?: { today: string; variants: VariantDetail[] };
  } | null>(null);

  const wanted = [...new Set([...compareIds, ...savedIds])].sort().join(",");
  // A result only counts for the request that produced it.
  const requestKey = `${wanted}#${attempt}`;

  useEffect(() => {
    if (!hydrated || !wanted) return;
    const controller = new AbortController();
    fetch(`/api/variants?ids=${wanted}`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
      .then((data: { today: string; variants: VariantDetail[] }) => setResult({ key: requestKey, data }))
      .catch(() => controller.signal.aborted || setResult({ key: requestKey }));
    return () => controller.abort();
  }, [hydrated, wanted, requestKey]);

  const loaded: Loaded = !wanted
    ? { state: "ready", today: "", variants: [] }
    : result?.key !== requestKey
      ? { state: "loading" }
      : result.data
        ? { state: "ready", ...result.data }
        : { state: "error" };

  if (!hydrated || loaded.state === "loading") {
    return <SkeletonSheet rows={5} label={dict.states.loading} />;
  }
  if (loaded.state === "error") {
    return (
      <EmptySheet title={dict.states.error.title} body={dict.compare.loadError}>
        <Button type="button" onClick={() => setAttempt((n) => n + 1)}>
          {dict.states.error.retry}
        </Button>
        <ButtonLink href={`/${lang}/cars`} variant="outline">
          {dict.compare.browse}
        </ButtonLink>
      </EmptySheet>
    );
  }

  const byId = new Map(loaded.variants.map((v) => [v.id, v]));
  const cars = compareIds.flatMap((id) => byId.get(id) ?? []);
  const saved = savedIds.flatMap((id) => byId.get(id) ?? []);
  // Ids we hold that the catalog no longer publishes.
  const gone = [...compareIds, ...savedIds].filter((id) => !byId.has(id));

  const unknown = <span className="text-ink-muted">{dict.compare.unknown}</span>;
  const notApplicable = <span className="text-ink-muted">{dict.compare.notApplicable}</span>;
  /** Marks a value whose verification has aged out, in words. */
  const withStale = (text: string, item: Provenanced) =>
    item.stale ? (
      <>
        {text} <span className="text-ink-muted">({dict.provenance.stale.toLowerCase()})</span>
      </>
    ) : (
      text
    );

  const estimates = cars.map((car) => estimateOwnershipCost({ ...car.costInputs, monthlyKm }, loaded.today));

  const groups: Group[] = [
    {
      title: dict.compare.groups.identity,
      rows: [
        { label: dict.compare.rows.modelYear, cells: cars.map((c) => c.modelYear) },
        { label: dict.compare.rows.bodyStyle, cells: cars.map((c) => dict.labels.bodyStyles[c.bodyStyle]) },
        { label: dict.compare.rows.powertrain, cells: cars.map((c) => dict.labels.powertrains[c.powertrain]) },
        { label: dict.compare.rows.transmission, cells: cars.map((c) => dict.labels.transmissions[c.transmission]) },
      ],
    },
    {
      title: dict.compare.groups.price,
      rows: [
        {
          label: dict.compare.rows.price,
          cells: cars.map((c) => <PriceLine key={c.id} price={c.price} lang={lang} dict={dict.price} size="text-lg" />),
        },
        {
          label: dict.compare.rows.priceChecked,
          cells: cars.map((c) => (c.price ? formatDate(c.price.verifiedOn, lang) : unknown)),
        },
      ],
    },
    {
      title: fill(dict.compare.groups.cost, { km: formatNumber(monthlyKm, lang, 0) }),
      rows: [
        ...costComponents.map((key, index) => ({
          label: dict.cost.components[key],
          cells: estimates.map((e) => {
            const component = e.components[index];
            if (component.monthly === null) {
              return (
                <span key={key} className="text-ink-muted">
                  {dict.cost.unavailable}
                </span>
              );
            }
            const amount = formatIdr(component.monthly, lang);
            return component.stale ? `${amount} (${dict.provenance.stale.toLowerCase()})` : amount;
          }),
        })),
        {
          label: dict.compare.rows.costTotal,
          cells: estimates.map((e) =>
            e.complete
              ? formatIdr(e.subtotalMonthly, lang)
              : fill(dict.compare.partialTotal, {
                  amount: formatIdr(e.subtotalMonthly, lang),
                  count: e.components.length - e.unavailable.length,
                }),
          ),
        },
      ],
    },
    {
      title: dict.compare.groups.specs,
      rows: specKeys
        .map((key) => ({
          label: dict.labels.facts[key],
          facts: cars.map((c) => c.facts.find((f) => f.key === key)),
          electricOnly: key === "energy_consumption_kwh_per_100km" || key === "range_km",
          fuelOnly: key === "fuel_consumption_km_per_l",
        }))
        .filter((row) => row.facts.some(Boolean))
        .map((row) => ({
          label: row.label,
          cells: row.facts.map((fact, i) => {
            if (fact) return withStale(formatFact(fact, lang, dict.labels), fact);
            const electric = cars[i].powertrain === "electric";
            return (row.fuelOnly && electric) || (row.electricOnly && !electric)
              ? notApplicable
              : unknown;
          }),
        })),
    },
    {
      title: dict.compare.groups.features,
      rows: featureKeys
        .map((key) => ({ key, features: cars.map((c) => c.features.find((f) => f.key === key)) }))
        .filter((row) => row.features.some(Boolean))
        .map((row) => ({
          label: dict.labels.features[row.key],
          cells: row.features.map((feature) =>
            feature ? withStale(dict.labels.availability[feature.availability], feature) : unknown,
          ),
        })),
    },
    {
      title: dict.compare.groups.support,
      rows: [
        ...(["vehicle", "battery"] as const)
          .map((coverage) => ({ coverage, items: cars.map((c) => c.warranties.find((w) => w.coverage === coverage)) }))
          .filter((row) => row.items.some(Boolean))
          .map((row) => ({
            label: dict.labels.coverage[row.coverage],
            cells: row.items.map((w, i) =>
              w
                ? withStale(formatWarranty(w, lang, dict.labels), w)
                : row.coverage === "battery" && !["hybrid", "electric"].includes(cars[i].powertrain)
                  ? notApplicable
                  : unknown,
            ),
          })),
        {
          label: dict.compare.rows.serviceCentres,
          cells: cars.map((c) =>
            c.serviceCenterCount ? fill(dict.compare.centreCount, { count: c.serviceCenterCount }) : unknown,
          ),
        },
      ],
    },
  ].filter((group) => group.rows.length > 0);

  const years = new Set(cars.map((c) => c.modelYear));

  return (
    <div>
      {storageAvailable ? null : <Notice className="mb-6">{dict.states.storageUnavailable}</Notice>}
      {gone.length ? <Notice className="mb-6">{fill(dict.compare.gone, { count: gone.length })}</Notice> : null}
      {cars.some((c) => c.sample) ? <Notice className="mb-6">{dict.provenance.sampleNotice}</Notice> : null}

      {cars.length === 0 ? (
        <EmptySheet title={dict.compare.empty.title} body={dict.compare.empty.body}>
          <ButtonLink href={`/${lang}/cars`}>{dict.compare.browse}</ButtonLink>
          <ButtonLink href={`/${lang}/recommendations`} variant="outline">
            {dict.compare.toRecs}
          </ButtonLink>
        </EmptySheet>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p role="status" className="type-title text-xl">
              {fill(dict.compare.count, { count: cars.length, max: MAX_COMPARE })}
            </p>
            <div className="flex flex-wrap gap-3">
              {cars.length < MAX_COMPARE ? (
                <ButtonLink href={`/${lang}/cars`} variant="outline">
                  {dict.compare.addAnother}
                </ButtonLink>
              ) : null}
              <Button variant="outline" type="button" onClick={() => compareStore.clear()}>
                {dict.compare.clear}
              </Button>
            </div>
          </div>
          {cars.length === 1 ? <Notice className="mt-4">{dict.compare.needTwo}</Notice> : null}
          {years.size > 1 ? <Notice className="mt-4">{dict.compare.mixedYears}</Notice> : null}

          {/* Wide screens: one table, cars as columns. */}
          <table className="mt-6 hidden w-full table-fixed border-collapse border border-rule-strong bg-surface md:table">
            <caption className="sr-only">{dict.compare.caption}</caption>
            <thead>
              <tr>
                <td className="w-1/4 border-b border-rule-strong" />
                {cars.map((car) => (
                  <th key={car.id} scope="col" className="border-b border-l border-rule border-b-rule-strong p-4 text-left align-top">
                    <Link href={`/${lang}/cars/${car.id}`} className="type-title text-lg hover:underline">
                      {variantName(car)}
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleCompare(car.id)}
                      aria-label={`${dict.actions.compareRemove}: ${variantName(car)}`}
                      className="type-label mt-2 block min-h-11 underline"
                    >
                      {dict.compare.remove}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            {groups.map((group) => (
              <tbody key={group.title}>
                <tr>
                  <th scope="colgroup" colSpan={cars.length + 1} className="type-label border-y border-rule-strong bg-page px-4 py-2.5 text-left text-ink-muted">
                    {group.title}
                  </th>
                </tr>
                {group.rows.map((row) => (
                  <tr key={row.label}>
                    <th scope="row" className="border-b border-rule p-4 text-left align-top font-medium">
                      {row.label}
                    </th>
                    {row.cells.map((cell, i) => (
                      <td key={cars[i].id} className="border-b border-l border-rule p-4 align-top">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>

          {/* Narrow screens: each attribute lists every car, so nothing hides off-screen. */}
          <div className="mt-6 md:hidden">
            {groups.map((group) => (
              <section key={group.title} className="mb-6 border border-rule-strong bg-surface">
                <h2 className="type-label border-b border-rule-strong bg-page px-4 py-2.5 text-ink-muted">{group.title}</h2>
                {group.rows.map((row) => (
                  <div key={row.label} className="border-b border-rule p-4 last:border-b-0">
                    <h3 className="font-semibold">{row.label}</h3>
                    <dl className="mt-2 space-y-2">
                      {row.cells.map((cell, i) => (
                        <div key={cars[i].id} className="grid grid-cols-[2fr_3fr] gap-3">
                          <dt className="text-sm text-ink-muted">{variantName(cars[i])}</dt>
                          <dd>{cell}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </section>
            ))}
            <div className="flex flex-wrap gap-x-5">
              {cars.map((car) => (
                <button key={car.id} type="button" onClick={() => toggleCompare(car.id)} className="type-label min-h-11 text-left underline">
                  {dict.compare.remove}: {variantName(car)}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <section className="mt-16">
        <h2 className="type-display text-[clamp(1.5rem,3.6vw,2.25rem)]">{dict.compare.saved.title}</h2>
        <p className="mt-2 max-w-[65ch] text-ink-muted">{dict.compare.saved.body}</p>
        {saved.length === 0 ? (
          <p className="cell-empty mt-4 border border-rule-strong bg-surface p-5 text-ink-muted">{dict.compare.saved.empty}</p>
        ) : (
          <>
            <ul className="mt-4 border border-rule-strong bg-surface">
              {saved.map((car) => {
                const compared = compareIds.includes(car.id);
                return (
                  <li key={car.id} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-rule p-4 last:border-b-0 sm:px-6">
                    <Link href={`/${lang}/cars/${car.id}`} className="type-title text-lg hover:underline">
                      {variantName(car)}
                    </Link>
                    <span className="flex flex-wrap gap-x-5">
                      <button
                        type="button"
                        disabled={!compared && compareIds.length >= MAX_COMPARE}
                        onClick={() => toggleCompare(car.id)}
                        className="type-label min-h-11 underline disabled:text-ink-muted disabled:no-underline"
                      >
                        {compared ? dict.actions.compareRemove : dict.actions.compareAdd}
                      </button>
                      <button type="button" onClick={() => toggleSaved(car.id)} className="type-label min-h-11 underline">
                        {dict.actions.saveRemove}
                      </button>
                    </span>
                  </li>
                );
              })}
            </ul>
            <Button variant="outline" type="button" onClick={() => savedStore.clear()} className="mt-4">
              {dict.compare.saved.clear}
            </Button>
          </>
        )}
      </section>
    </div>
  );
}
